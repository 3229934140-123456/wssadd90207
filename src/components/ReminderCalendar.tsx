import { useState, useEffect, useMemo } from 'react';
import { Bell, Trash2, Plus, Check, Phone, Calendar as CalendarIcon, User, Syringe, ArrowRight, AlertTriangle, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Reminder } from '@/types';

type FilterKey = 'today' | 'overdue' | 'week' | 'completed';

const FILTERS: { key: FilterKey; label: string; icon: typeof Clock }[] = [
  { key: 'today', label: '今天', icon: Clock },
  { key: 'overdue', label: '逾期', icon: AlertTriangle },
  { key: 'week', label: '本周', icon: CalendarIcon },
  { key: 'completed', label: '已完成', icon: Check },
];

export default function ReminderCalendar() {
  const {
    reminders, customers, treatments, points,
    loadReminders, loadAllTreatments, addReminder,
    updateReminder, deleteReminder, setSelectedCustomerId,
    setSelectedTreatmentId, setActiveTab,
  } = useAppStore();

  const [filter, setFilter] = useState<FilterKey>('today');
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ remindDate: '', content: '', customerId: 0, treatmentId: 0 });
  const [contactResult, setContactResult] = useState('');

  useEffect(() => {
    loadReminders();
    loadAllTreatments();
  }, [loadReminders, loadAllTreatments]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const overdue = reminders.filter(r => r.remindDate < today && !r.completed);
    if (overdue.length > 0 && filter !== 'overdue') {
      alert(`您有 ${overdue.length} 条逾期未完成的提醒！`);
    }
  }, [reminders, filter]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const filteredReminders = useMemo(() => {
    return [...reminders].sort((a, b) => a.remindDate.localeCompare(b.remindDate)).filter(r => {
      switch (filter) {
        case 'today': return r.remindDate === todayStr && !r.completed;
        case 'overdue': return r.remindDate < todayStr && !r.completed;
        case 'week': return r.remindDate >= weekStart.toISOString().slice(0, 10)
          && r.remindDate <= weekEnd.toISOString().slice(0, 10) && !r.completed;
        case 'completed': return r.completed;
        default: return true;
      }
    });
  }, [reminders, filter, todayStr, weekStart, weekEnd]);

  const getCustomer = (id: number) => customers.find(c => c.id === id);
  const getTreatment = (id: number) => treatments.find(t => t.id === id);
  const getPointsForTreatment = (tid: number) => points.filter(p => p.treatmentId === tid);

  const customerTreatments = useMemo(() => {
    if (!form.customerId) return [];
    return treatments
      .filter(t => t.customerId === form.customerId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [form.customerId, treatments]);

  const handleCustomerChange = (cid: number) => {
    const tList = treatments.filter(t => t.customerId === cid).sort((a, b) => b.date.localeCompare(a.date));
    if (tList.length === 0) {
      setForm(f => ({ ...f, customerId: cid, treatmentId: 0, content: '' }));
      return;
    }
    const defaultTid = tList[0].id || 0;
    setForm(f => ({ ...f, customerId: cid, treatmentId: defaultTid, content: `复诊提醒 - ${tList[0].projectName}` }));
  };

  const handleTreatmentChange = (tid: number) => {
    const t = treatments.find(t => t.id === tid);
    setForm(f => ({ ...f, treatmentId: tid, content: t ? `复诊提醒 - ${t.projectName}` : f.content }));
  };

  const handleAdd = () => {
    if (!form.remindDate || !form.content || !form.customerId || !form.treatmentId) {
      if (!form.treatmentId && form.customerId) {
        alert('该客户尚未创建疗程，请先到「客户列表」新建治疗。');
      } else {
        alert('请填写完整信息，包括选择具体疗程。');
      }
      return;
    }
    addReminder({
      treatmentId: form.treatmentId,
      customerId: form.customerId,
      remindDate: form.remindDate,
      content: form.content,
      completed: false,
      contacted: false,
      contactResult: '',
    });
    setForm({ remindDate: '', content: '', customerId: 0, treatmentId: 0 });
    setShowForm(false);
  };

  const handleMarkContacted = () => {
    if (!selectedReminder?.id) return;
    updateReminder(selectedReminder.id, {
      contacted: true,
      contactResult: contactResult,
      contactedAt: new Date().toISOString(),
    });
    setContactResult('');
    setSelectedReminder(null);
  };

  const handleGoToTreatment = (r: Reminder) => {
    setSelectedCustomerId(r.customerId);
    setTimeout(() => {
      setSelectedTreatmentId(r.treatmentId);
      setActiveTab('customers');
    }, 50);
  };

  const getStatusBadge = (r: Reminder) => {
    if (r.completed) return { label: '已完成', color: 'bg-green-500/20 text-green-300' };
    if (r.contacted) return { label: '已联系', color: 'bg-blue-500/20 text-blue-300' };
    if (r.remindDate < todayStr) return { label: '已逾期', color: 'bg-[#E94560]/20 text-[#E94560]' };
    if (r.remindDate === todayStr) return { label: '今天', color: 'bg-[#E8D5B7]/20 text-[#E8D5B7]' };
    return { label: '待处理', color: 'bg-[#0F3460] text-[#E8D5B7]/80' };
  };

  return (
    <div className="flex h-full bg-[#1A1A2E] text-[#E8D5B7]">
      <div className="flex flex-col" style={{ width: '40%' }}>
        <div className="px-4 py-3 border-b border-[#16213E]">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} className="text-[#E94560]" />
            <span className="text-base font-semibold">随访工作台</span>
          </div>
          <div className="flex gap-1.5">
            {FILTERS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setFilter(key); setSelectedReminder(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                  filter === key ? 'bg-[#0F3460] text-[#E8D5B7]' : 'bg-[#16213E] text-[#E8D5B7]/50 hover:text-[#E8D5B7]/80'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredReminders.length === 0 && (
            <div className="text-center text-[#E8D5B7]/40 py-12 text-sm">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
              暂无{filter === 'today' ? '今日' : filter === 'overdue' ? '逾期' : filter === 'week' ? '本周' : '已完成'}提醒
            </div>
          )}
          {filteredReminders.map(r => {
            const customer = getCustomer(r.customerId);
            const treatment = getTreatment(r.treatmentId);
            const badge = getStatusBadge(r);
            return (
              <div
                key={r.id}
                onClick={() => { setSelectedReminder(r); setContactResult(r.contactResult || ''); }}
                className={`rounded-lg p-3 cursor-pointer transition-colors border ${
                  selectedReminder?.id === r.id
                    ? 'bg-[#0F3460] border-[#E8D5B7]/30'
                    : 'bg-[#16213E] border-transparent hover:bg-[#0F3460]/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{customer?.name || '未建档'}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${badge.color}`}>{badge.label}</span>
                    </div>
                    <div className="text-xs text-[#E8D5B7]/70">{treatment?.projectName || '通用提醒'}</div>
                    <div className="text-xs text-[#E8D5B7]/40 mt-1">{r.remindDate}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleGoToTreatment(r); }}
                    className="p-1 rounded text-[#E8D5B7]/30 hover:text-[#E8D5B7] hover:bg-[#1A1A2E]"
                    title="查看该疗程"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
                {r.content && <div className="text-xs text-[#E8D5B7]/50 mt-2 line-clamp-1">{r.content}</div>}
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-[#16213E]">
          {showForm ? (
            <div className="space-y-2.5">
              <input type="date" value={form.remindDate} onChange={e => setForm(f => ({ ...f, remindDate: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg text-sm bg-[#16213E] text-[#E8D5B7] border border-[#0F3460] outline-none" />
              <select value={form.customerId} onChange={e => handleCustomerChange(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg text-sm bg-[#16213E] text-[#E8D5B7] border border-[#0F3460] outline-none">
                <option value={0}>选择客户</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
              </select>
              {form.customerId > 0 && (
                customerTreatments.length === 0 ? (
                  <div className="p-3 rounded-lg bg-[#E94560]/10 border border-[#E94560]/30 text-xs">
                    <div className="flex items-center gap-1.5 text-[#E94560] mb-1">
                      <AlertTriangle size={12} />
                      该客户暂无疗程记录
                    </div>
                    <div className="text-[#E8D5B7]/60">请先到「客户列表」为 {getCustomer(form.customerId)?.name} 新建治疗后再添加提醒。</div>
                  </div>
                ) : (
                  <select value={form.treatmentId} onChange={e => handleTreatmentChange(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg text-sm bg-[#16213E] text-[#E8D5B7] border border-[#0F3460] outline-none">
                    <option value={0}>请选择疗程</option>
                    {customerTreatments.map(t => (
                      <option key={t.id} value={t.id}>{t.projectName} · {t.date}</option>
                    ))}
                  </select>
                )
              )}
              <input type="text" placeholder="提醒内容" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg text-sm bg-[#16213E] text-[#E8D5B7] border border-[#0F3460] outline-none placeholder:text-[#E8D5B7]/30" />
              <div className="flex gap-2">
                <button onClick={handleAdd} className="flex-1 py-1.5 rounded-lg text-sm font-medium bg-[#0F3460] text-[#E8D5B7]">确认</button>
                <button onClick={() => { setShowForm(false); setForm({ remindDate: '', content: '', customerId: 0, treatmentId: 0 }); }}
                  className="flex-1 py-1.5 rounded-lg text-sm bg-[#16213E] text-[#E8D5B7]/60">取消</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium bg-[#E94560] text-white hover:bg-[#E94560]/90 transition-colors">
              <Plus size={14} /> 添加提醒
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-[#16213E] rounded-lg ml-3 overflow-hidden flex flex-col">
        {!selectedReminder ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-[#E8D5B7]/30">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">点击左侧提醒查看详情</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-[#0F3460] flex items-center justify-between">
              <div className="text-base font-semibold">提醒详情</div>
              <div className="flex items-center gap-1.5">
                {!selectedReminder.completed && (
                  <button onClick={() => updateReminder(selectedReminder.id!, { completed: true })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-green-500/20 text-green-300 hover:bg-green-500/30">
                    <Check size={12} /> 标记完成
                  </button>
                )}
                <button onClick={() => { deleteReminder(selectedReminder.id!); setSelectedReminder(null); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-[#E94560]/20 text-[#E94560] hover:bg-[#E94560]/30">
                  <Trash2 size={12} /> 删除
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {(() => {
                const customer = getCustomer(selectedReminder.customerId);
                const treatment = getTreatment(selectedReminder.treatmentId);
                const treatmentPoints = getPointsForTreatment(selectedReminder.treatmentId);
                const badge = getStatusBadge(selectedReminder);
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${badge.color}`}>{badge.label}</span>
                      {selectedReminder.contacted && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">已联系</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-[#1A1A2E] p-3">
                        <div className="flex items-center gap-1.5 text-xs text-[#E8D5B7]/50 mb-1">
                          <User size={12} /> 客户姓名
                        </div>
                        <div className="text-sm font-medium">{customer?.name || '未建档'}</div>
                      </div>
                      <div className="rounded-lg bg-[#1A1A2E] p-3">
                        <div className="flex items-center gap-1.5 text-xs text-[#E8D5B7]/50 mb-1">
                          <Phone size={12} /> 联系电话
                        </div>
                        <div className="text-sm font-medium">{customer?.phone || '-'}</div>
                      </div>
                      <div className="rounded-lg bg-[#1A1A2E] p-3">
                        <div className="flex items-center gap-1.5 text-xs text-[#E8D5B7]/50 mb-1">
                          <Syringe size={12} /> 项目名称
                        </div>
                        <div className="text-sm font-medium">{treatment?.projectName || '通用提醒'}</div>
                      </div>
                      <div className="rounded-lg bg-[#1A1A2E] p-3">
                        <div className="flex items-center gap-1.5 text-xs text-[#E8D5B7]/50 mb-1">
                          <CalendarIcon size={12} /> 治疗日期
                        </div>
                        <div className="text-sm font-medium">{treatment?.date || '-'}</div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#1A1A2E] p-4">
                      <div className="text-xs text-[#E8D5B7]/50 mb-2">提醒内容</div>
                      <div className="text-sm">{selectedReminder.content || '-'}</div>
                    </div>

                    {treatmentPoints.length > 0 && (
                      <div className="rounded-lg bg-[#1A1A2E] p-4">
                        <div className="text-xs text-[#E8D5B7]/50 mb-2">关联点位摘要</div>
                        <div className="space-y-2">
                          {treatmentPoints.slice(0, 6).map(p => (
                            <div key={p.id} className="flex items-center gap-3 text-xs">
                              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#E94560] text-white text-[10px] font-bold">#{p.pointNumber}</span>
                              <span className="flex-1 min-w-0 truncate">{p.productName} · {p.layer}</span>
                              <span className="text-[#E8D5B7]/60">{p.dosage}ml × {p.needleCount}针</span>
                            </div>
                          ))}
                          {treatmentPoints.length > 6 && (
                            <div className="text-xs text-[#E8D5B7]/40">共 {treatmentPoints.length} 个点位</div>
                          )}
                          {treatmentPoints.length > 0 && (
                            <div className="pt-2 border-t border-[#0F3460] flex gap-4 text-xs mt-2">
                              <div>合计剂量：<span className="text-[#E8D5B7] font-medium">{treatmentPoints.reduce((s, p) => s + (p.dosage || 0), 0)}ml</span></div>
                              <div>合计针数：<span className="text-[#E8D5B7] font-medium">{treatmentPoints.reduce((s, p) => s + (p.needleCount || 0), 0)}针</span></div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedReminder.contacted && selectedReminder.contactResult && (
                      <div className="rounded-lg bg-[#1A1A2E] p-4">
                        <div className="text-xs text-[#E8D5B7]/50 mb-2">上次联系结果</div>
                        <div className="text-sm">{selectedReminder.contactResult}</div>
                        {selectedReminder.contactedAt && (
                          <div className="text-xs text-[#E8D5B7]/40 mt-2">{new Date(selectedReminder.contactedAt).toLocaleString('zh-CN')}</div>
                        )}
                      </div>
                    )}

                    {!selectedReminder.contacted && !selectedReminder.completed && (
                      <div className="rounded-lg bg-[#1A1A2E] p-4">
                        <div className="text-xs text-[#E8D5B7]/70 mb-2">标记已联系</div>
                        <textarea
                          value={contactResult}
                          onChange={e => setContactResult(e.target.value)}
                          placeholder="记录联系结果，如：已告知注意事项、客户改约到下周一等..."
                          className="w-full px-3 py-2 rounded-lg text-sm bg-[#16213E] text-[#E8D5B7] border border-[#0F3460] outline-none placeholder:text-[#E8D5B7]/30 resize-none h-20"
                        />
                        <button
                          onClick={handleMarkContacted}
                          disabled={!contactResult.trim()}
                          className="mt-3 w-full py-2 rounded-lg text-sm font-medium bg-[#0F3460] text-[#E8D5B7] hover:bg-[#0F3460]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          确认已联系
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
