import { useState, useMemo } from 'react';
import { Printer, Bell } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const FACE_PATH = 'M50 10 C75 10 90 30 90 55 C90 80 75 95 50 95 C25 95 10 80 10 55 C10 30 25 10 50 10Z M35 42 C35 42 40 38 50 38 C60 38 65 42 65 42 M40 60 L60 60 M42 70 C42 70 46 74 50 74 C54 74 58 70 58 70';

export default function PrintPreview() {
  const { customers, selectedCustomerId, treatments, selectedTreatmentId, points, addReminder, setActiveTab } = useAppStore();
  const customer = customers.find(c => c.id === selectedCustomerId);
  const treatment = treatments.find(t => t.id === selectedTreatmentId);

  const defaultFollowUp = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  }, []);

  const [followUpDate, setFollowUpDate] = useState(defaultFollowUp);
  const [notes, setNotes] = useState(
    '1.注射后24小时内避免按压揉搓\n2.注射后一周内避免高温环境\n3.如出现红肿、硬结请及时复诊\n4.两周后复诊评估效果'
  );

  const grouped = useMemo(() => {
    const map = new Map<string, { layer: string; dosage: number; needleCount: number }[]>();
    points.forEach(p => {
      if (!map.has(p.productName)) map.set(p.productName, []);
      map.get(p.productName)!.push({ layer: p.layer, dosage: p.dosage, needleCount: p.needleCount });
    });
    return Array.from(map.entries()).map(([name, items]) => ({
      name,
      layers: items.map(i => i.layer).join('、'),
      dosage: items.reduce((s, i) => s + i.dosage, 0),
      needleCount: items.reduce((s, i) => s + i.needleCount, 0),
    }));
  }, [points]);

  const totalDosage = grouped.reduce((s, g) => s + g.dosage, 0);
  const totalNeedles = grouped.reduce((s, g) => s + g.needleCount, 0);

  const handleReminder = async () => {
    if (!selectedTreatmentId || !selectedCustomerId) return;
    await addReminder({
      treatmentId: selectedTreatmentId,
      customerId: selectedCustomerId,
      remindDate: followUpDate,
      content: `复诊提醒 - ${treatment?.projectName ?? ''}`,
      completed: false,
    });
    setActiveTab('calendar');
  };

  const viewPoints = (view: string) => points.filter(p => p.templateView === view);

  const miniFace = (view: string, w = 100, h = 120) => {
    const pts = viewPoints(view);
    if (!pts.length) return null;
    return (
      <svg width={w} height={h} viewBox="0 0 100 110" className="border border-gray-200 rounded">
        <path d={FACE_PATH} fill="none" stroke="#999" strokeWidth="0.8" />
        {pts.map(p => (
          <circle key={p.pointNumber} cx={p.x} cy={p.y} r="2.5" fill="#E8D5B7" stroke="#1A1A2E" strokeWidth="0.6" />
        ))}
      </svg>
    );
  };

  return (
    <>
      <style>{`@media print { .print-actions { display: none !important; } .print-page { box-shadow: none !important; margin: 0 !important; } }`}</style>
      <div className="print-actions flex gap-3 mb-4">
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A2E] text-[#E8D5B7] hover:opacity-90 transition">
          <Printer size={16} /> 打印
        </button>
        <button onClick={handleReminder} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E8D5B7] text-[#1A1A2E] hover:opacity-90 transition">
          <Bell size={16} /> 设置复诊提醒
        </button>
      </div>

      <div className="print-page bg-white text-[#1A1A2E] max-w-[210mm] mx-auto p-10 shadow-lg text-sm leading-relaxed" style={{ minHeight: '297mm' }}>
        <h1 className="text-center text-xl font-bold mb-1">微整注射知情确认单</h1>
        <div className="border-b-2 border-[#1A1A2E] mb-4" />

        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4">
          <div>客户姓名：<span className="font-medium">{customer?.name ?? '-'}</span></div>
          <div>联系电话：<span className="font-medium">{customer?.phone ?? '-'}</span></div>
          <div>治疗日期：<span className="font-medium">{treatment?.date ?? '-'}</span></div>
          <div>项目名称：<span className="font-medium">{treatment?.projectName ?? '-'}</span></div>
        </div>

        <div className="mb-4">
          <div className="font-semibold mb-2">注射点位图：</div>
          <div className="flex gap-4">
            {miniFace('front')}
            {miniFace('45deg')}
            {miniFace('side')}
          </div>
        </div>

        <div className="mb-4">
          <div className="font-semibold mb-2">产品使用明细：</div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-1.5 text-left">产品名称</th>
                <th className="border border-gray-300 px-3 py-1.5 text-left">层次</th>
                <th className="border border-gray-300 px-3 py-1.5 text-right">剂量</th>
                <th className="border border-gray-300 px-3 py-1.5 text-right">针数</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(g => (
                <tr key={g.name}>
                  <td className="border border-gray-300 px-3 py-1.5">{g.name}</td>
                  <td className="border border-gray-300 px-3 py-1.5">{g.layers}</td>
                  <td className="border border-gray-300 px-3 py-1.5 text-right">{g.dosage}</td>
                  <td className="border border-gray-300 px-3 py-1.5 text-right">{g.needleCount}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-50">
                <td className="border border-gray-300 px-3 py-1.5" colSpan={2}>合计</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right">{totalDosage}</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right">{totalNeedles}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span className="font-semibold">复诊日期：</span>
          <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm" />
        </div>

        <div className="mb-6">
          <div className="font-semibold mb-1">注意事项：</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm min-h-[80px] resize-y" />
        </div>

        <div className="border-t border-gray-300 pt-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">客户签名：</span>
            <span className="border-b border-gray-400 flex-1 mx-2" />
            <span className="font-semibold">日期：</span>
            <span className="border-b border-gray-400 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">医生签名：</span>
            <span className="border-b border-gray-400 flex-1 mx-2" />
            <span className="font-semibold">日期：</span>
            <span className="border-b border-gray-400 w-32" />
          </div>
        </div>
      </div>
    </>
  );
}
