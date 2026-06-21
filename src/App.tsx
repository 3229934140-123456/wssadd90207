import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { TabName } from '@/types';
import { exportAllData, importAllData, getBackupStats, type BackupStats } from '@/db';
import CustomerList from '@/components/CustomerList';
import PointCanvas from '@/components/PointCanvas';
import PhotoFolder from '@/components/PhotoFolder';
import PrintPreview from '@/components/PrintPreview';
import ReminderCalendar from '@/components/ReminderCalendar';
import { Users, Crosshair, Image, Printer, Calendar, Download, Upload, Syringe, X, AlertTriangle, Database } from 'lucide-react';

const TABS: { key: TabName; label: string; icon: typeof Users }[] = [
  { key: 'customers', label: '客户列表', icon: Users },
  { key: 'canvas', label: '点位画布', icon: Crosshair },
  { key: 'photos', label: '照片夹', icon: Image },
  { key: 'print', label: '打印预览', icon: Printer },
  { key: 'calendar', label: '提醒日历', icon: Calendar },
];

export default function App() {
  const {
    activeTab, setActiveTab, loadCustomers, loadReminders, loadAllTreatments,
    selectedCustomerId, selectedTreatmentId, refreshAll, loadTreatments,
    resetAllSelections,
  } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<{ text: string; stats: BackupStats } | null>(null);

  useEffect(() => {
    loadCustomers();
    loadAllTreatments();
    loadReminders();
  }, [loadCustomers, loadAllTreatments, loadReminders]);

  useEffect(() => {
    if (activeTab === 'customers' && selectedCustomerId) {
      loadTreatments(selectedCustomerId);
    }
  }, [activeTab, selectedCustomerId, loadTreatments]);

  const handleExport = async () => {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `injection-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const stats = getBackupStats(text);
      setPendingBackup({ text, stats });
      setShowRestoreConfirm(true);
    } catch {
      alert('备份文件格式不正确，请检查文件。');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmRestore = async () => {
    if (!pendingBackup) return;
    try {
      await importAllData(pendingBackup.text);
      resetAllSelections();
      await refreshAll();
      alert('数据恢复成功！所有页面已刷新。');
    } catch {
      alert('恢复失败，请检查备份文件。');
    }
    setShowRestoreConfirm(false);
    setPendingBackup(null);
  };

  const cancelRestore = () => {
    setShowRestoreConfirm(false);
    setPendingBackup(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'customers': return <CustomerList />;
      case 'canvas':
        return selectedTreatmentId ? <PointCanvas /> : (
          <div className="h-full flex items-center justify-center bg-[#1A1A2E]">
            <div className="text-center">
              <Crosshair className="w-12 h-12 text-[#E8D5B7]/15 mx-auto mb-3" />
              <p className="text-sm text-[#E8D5B7]/30">请先选择客户和疗程</p>
            </div>
          </div>
        );
      case 'photos': return <PhotoFolder />;
      case 'print':
        return selectedTreatmentId ? <PrintPreview /> : (
          <div className="h-full flex items-center justify-center bg-[#1A1A2E]">
            <div className="text-center">
              <Printer className="w-12 h-12 text-[#E8D5B7]/15 mx-auto mb-3" />
              <p className="text-sm text-[#E8D5B7]/30">请先选择疗程以生成确认单</p>
            </div>
          </div>
        );
      case 'calendar': return <ReminderCalendar />;
    }
  };

  const currentCustomer = useAppStore.getState().customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="h-full flex flex-col bg-[#0d0d1a]">
      <header className="no-print flex items-center justify-between px-4 py-2 bg-[#1A1A2E] border-b border-[#16213E] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F3460] flex items-center justify-center">
              <Syringe className="w-4 h-4 text-[#E8D5B7]" />
            </div>
            <span className="text-[#E8D5B7] font-semibold text-sm tracking-wide">微整注射记录</span>
          </div>
          <div className="w-px h-5 bg-[#16213E] mx-1" />
          <nav className="flex gap-0.5">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-[#0F3460] text-[#E8D5B7] shadow-sm'
                    : 'text-[#E8D5B7]/50 hover:text-[#E8D5B7]/80 hover:bg-[#16213E]/60'
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {selectedCustomerId && currentCustomer && (
            <span className="text-xs text-[#E8D5B7]/40 mr-2">
              当前：{currentCustomer.name}
            </span>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#E8D5B7]/60 hover:text-[#E8D5B7] hover:bg-[#16213E]/60 transition-colors"
            title="导出备份"
          >
            <Download size={14} />
            <span>备份</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#E8D5B7]/60 hover:text-[#E8D5B7] hover:bg-[#16213E]/60 transition-colors"
            title="导入恢复"
          >
            <Upload size={14} />
            <span>恢复</span>
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>

      {showRestoreConfirm && pendingBackup && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
          <div className="bg-[#1A1A2E] rounded-xl border border-[#16213E] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-[#16213E] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#E8D5B7]" />
                <span className="text-[#E8D5B7] font-semibold text-sm">确认恢复备份</span>
              </div>
              <button onClick={cancelRestore} className="text-[#E8D5B7]/40 hover:text-[#E8D5B7]">
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#E94560]/10 border border-[#E94560]/30 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#E94560] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#E8D5B7]/80">
                  <div className="font-medium text-[#E94560] mb-1">此操作将覆盖当前所有数据</div>
                  <div>恢复完成后，现有客户、疗程、照片和提醒将被备份文件中的数据完全替换，不可撤销。</div>
                </div>
              </div>

              <div className="text-xs text-[#E8D5B7]/60 mb-3">备份文件包含以下数据：</div>
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="rounded-lg bg-[#16213E] p-3 text-center">
                  <div className="text-lg font-semibold text-[#E8D5B7]">{pendingBackup.stats.customers}</div>
                  <div className="text-[11px] text-[#E8D5B7]/50">客户档案</div>
                </div>
                <div className="rounded-lg bg-[#16213E] p-3 text-center">
                  <div className="text-lg font-semibold text-[#E8D5B7]">{pendingBackup.stats.treatments}</div>
                  <div className="text-[11px] text-[#E8D5B7]/50">治疗记录</div>
                </div>
                <div className="rounded-lg bg-[#16213E] p-3 text-center">
                  <div className="text-lg font-semibold text-[#E8D5B7]">{pendingBackup.stats.photos}</div>
                  <div className="text-[11px] text-[#E8D5B7]/50">照片归档</div>
                </div>
                <div className="rounded-lg bg-[#16213E] p-3 text-center">
                  <div className="text-lg font-semibold text-[#E8D5B7]">{pendingBackup.stats.reminders}</div>
                  <div className="text-[11px] text-[#E8D5B7]/50">复诊提醒</div>
                </div>
                {pendingBackup.stats.injectionPoints > 0 && (
                  <div className="col-span-2 rounded-lg bg-[#16213E] p-3 text-center">
                    <div className="text-lg font-semibold text-[#E8D5B7]">{pendingBackup.stats.injectionPoints}</div>
                    <div className="text-[11px] text-[#E8D5B7]/50">注射点位记录</div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={cancelRestore} className="flex-1 py-2 rounded-lg text-sm bg-[#16213E] text-[#E8D5B7]/60 hover:bg-[#16213E]/80">
                  取消
                </button>
                <button onClick={confirmRestore} className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#E94560] text-white hover:bg-[#E94560]/90">
                  确认恢复
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
