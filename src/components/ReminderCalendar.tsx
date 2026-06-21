import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Bell, Trash2, Plus, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function ReminderCalendar() {
  const { reminders, customers, treatments, loadReminders, loadAllTreatments, addReminder, updateReminder, deleteReminder } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ remindDate: '', content: '', customerId: 0, treatmentId: 0 });

  useEffect(() => {
    loadReminders();
    loadAllTreatments();
  }, [loadReminders, loadAllTreatments]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const overdue = reminders.filter(r => r.remindDate < today && !r.completed);
    if (overdue.length > 0) alert(`您有 ${overdue.length} 条逾期未完成的提醒！`);
  }, [reminders]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);
  const monthStr = `${year}年${month + 1}月`;

  const reminderDates = new Set(reminders.map(r => r.remindDate));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const getCustomerName = (id: number) => {
    const c = customers.find(c => c.id === id);
    return c ? c.name : '未建档客户';
  };

  const getProjectName = (id: number) => {
    const t = treatments.find(t => t.id === id);
    return t ? t.projectName : '通用提醒';
  };

  const filteredReminders = useMemo(() => {
    const sorted = [...reminders].sort((a, b) => a.remindDate.localeCompare(b.remindDate));
    if (selectedDate) return sorted.filter(r => r.remindDate === selectedDate);
    return sorted.filter(r => r.remindDate >= todayStr && !r.completed);
  }, [reminders, selectedDate, todayStr]);

  const customerTreatments = useMemo(() => {
    if (!form.customerId) return [];
    return treatments
      .filter(t => t.customerId === form.customerId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [form.customerId, treatments]);

  const handleCustomerChange = (cid: number) => {
    const tList = treatments.filter(t => t.customerId === cid).sort((a, b) => b.date.localeCompare(a.date));
    const defaultTid = tList.length > 0 ? tList[0].id || 0 : 0;
    const defaultContent = tList.length > 0 ? `复诊提醒 - ${tList[0].projectName}` : '复诊提醒';
    setForm(f => ({ ...f, customerId: cid, treatmentId: defaultTid, content: defaultContent }));
  };

  const handleTreatmentChange = (tid: number) => {
    const t = treatments.find(t => t.id === tid);
    setForm(f => ({ ...f, treatmentId: tid, content: t ? `复诊提醒 - ${t.projectName}` : f.content }));
  };

  const handleAdd = () => {
    if (!form.remindDate || !form.content || !form.customerId) return;
    addReminder({
      treatmentId: form.treatmentId,
      customerId: form.customerId,
      remindDate: form.remindDate,
      content: form.content,
      completed: false,
    });
    setForm({ remindDate: '', content: '', customerId: 0, treatmentId: 0 });
    setShowForm(false);
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="flex h-full bg-[#1A1A2E] text-[#E8D5B7]">
      <div className="flex flex-col" style={{ width: '65%' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[#0F3460] transition-colors"><ChevronLeft size={20} /></button>
          <span className="text-lg font-semibold">{monthStr}</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[#0F3460] transition-colors"><ChevronRight size={20} /></button>
        </div>
        <div className="grid grid-cols-7 text-center text-sm font-medium py-2 text-[#E8D5B7]/60">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 flex-1 gap-px bg-[#16213E]">
          {days.map((day, i) => {
            if (!day) return <div key={i} className="bg-[#1A1A2E]" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const hasReminder = reminderDates.has(dateStr);
            return (
              <div key={i} onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                className={`flex flex-col items-center justify-center cursor-pointer relative transition-colors ${
                  isSelected ? 'bg-[#0F3460]' : isToday ? 'bg-[#E8D5B7]' : 'bg-[#1A1A2E]'
                } ${isToday && !isSelected ? 'text-[#1A1A2E]' : ''}`}
              >
                <span className="text-sm">{day}</span>
                {hasReminder && <span className="w-1.5 h-1.5 rounded-full absolute bottom-1.5 bg-[#E94560]" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col bg-[#16213E] rounded-lg" style={{ width: '35%' }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#0F3460]">
          <Bell size={16} className="text-[#E94560]" />
          <span className="font-semibold">提醒列表</span>
          {selectedDate && <span className="text-sm text-[#E8D5B7]/60 ml-auto">{selectedDate}</span>}
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredReminders.length === 0 && (
            <div className="text-center text-[#E8D5B7]/40 py-8 text-sm">暂无提醒</div>
          )}
          {filteredReminders.map(r => (
            <div key={r.id} className="rounded-lg p-3 bg-[#1A1A2E]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${r.completed ? 'line-through text-[#E8D5B7]/40' : ''}`}>
                    {getCustomerName(r.customerId)}
                  </div>
                  <div className={`text-xs mt-0.5 ${r.completed ? 'line-through text-[#E8D5B7]/40' : 'text-[#E8D5B7]/70'}`}>
                    {getProjectName(r.treatmentId)}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button onClick={() => updateReminder(r.id!, { completed: !r.completed })}
                    className={`p-1 rounded ${r.completed ? 'text-green-400' : 'text-[#E8D5B7]/40 hover:text-green-400'}`}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => deleteReminder(r.id!)} className="p-1 rounded text-[#E8D5B7]/40 hover:text-[#E94560]">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className={`text-xs mt-1.5 ${r.completed ? 'line-through text-[#E8D5B7]/40' : 'text-[#E8D5B7]/60'}`}>{r.content}</div>
              <div className="text-xs text-[#E8D5B7]/30 mt-1">{r.remindDate}</div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-[#0F3460]">
          {showForm ? (
            <div className="space-y-2.5">
              <input type="date" value={form.remindDate} onChange={e => setForm(f => ({ ...f, remindDate: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg text-sm bg-[#1A1A2E] text-[#E8D5B7] border border-[#0F3460] outline-none" />
              <select value={form.customerId} onChange={e => handleCustomerChange(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg text-sm bg-[#1A1A2E] text-[#E8D5B7] border border-[#0F3460] outline-none">
                <option value={0}>选择客户</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
              </select>
              {form.customerId > 0 && (
                <select value={form.treatmentId} onChange={e => handleTreatmentChange(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg text-sm bg-[#1A1A2E] text-[#E8D5B7] border border-[#0F3460] outline-none">
                  {customerTreatments.length === 0 ? (
                    <option value={0}>该客户暂无疗程</option>
                  ) : (
                    customerTreatments.map(t => (
                      <option key={t.id} value={t.id}>{t.projectName} · {t.date}</option>
                    ))
                  )}
                </select>
              )}
              <input type="text" placeholder="提醒内容" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg text-sm bg-[#1A1A2E] text-[#E8D5B7] border border-[#0F3460] outline-none placeholder:text-[#E8D5B7]/30" />
              <div className="flex gap-2">
                <button onClick={handleAdd} className="flex-1 py-1.5 rounded-lg text-sm font-medium bg-[#0F3460] text-[#E8D5B7]">确认</button>
                <button onClick={() => { setShowForm(false); setForm({ remindDate: '', content: '', customerId: 0, treatmentId: 0 }); }}
                  className="flex-1 py-1.5 rounded-lg text-sm bg-[#1A1A2E] text-[#E8D5B7]/60">取消</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium bg-[#E94560] text-white hover:bg-[#E94560]/90 transition-colors">
              <Plus size={14} /> 添加提醒
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
