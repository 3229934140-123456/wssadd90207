import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { TabName } from '@/types';
import { exportAllData, importAllData } from '@/db';
import CustomerList from '@/components/CustomerList';
import PointCanvas from '@/components/PointCanvas';
import PhotoFolder from '@/components/PhotoFolder';
import PrintPreview from '@/components/PrintPreview';
import ReminderCalendar from '@/components/ReminderCalendar';
import { Users, Crosshair, Image, Printer, Calendar, Download, Upload, Syringe } from 'lucide-react';

const TABS: { key: TabName; label: string; icon: typeof Users }[] = [
  { key: 'customers', label: '客户列表', icon: Users },
  { key: 'canvas', label: '点位画布', icon: Crosshair },
  { key: 'photos', label: '照片夹', icon: Image },
  { key: 'print', label: '打印预览', icon: Printer },
  { key: 'calendar', label: '提醒日历', icon: Calendar },
];

export default function App() {
  const { activeTab, setActiveTab, loadCustomers, loadReminders, selectedCustomerId, selectedTreatmentId } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCustomers();
    loadReminders();
  }, [loadCustomers, loadReminders]);

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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      await importAllData(text);
      await loadCustomers();
      await loadReminders();
      alert('数据导入成功！');
    } catch {
      alert('导入失败，请检查文件格式。');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
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
          {selectedCustomerId && (
            <span className="text-xs text-[#E8D5B7]/40 mr-2">
              {useAppStore.getState().customers.find(c => c.id === selectedCustomerId)?.name}
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
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
