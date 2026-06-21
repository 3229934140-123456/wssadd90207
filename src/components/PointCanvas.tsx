import { useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PRODUCT_LIST, LAYER_LIST, QUICK_NOTES } from '@/types';
import FaceTemplate from './FaceTemplate';

export default function PointCanvas() {
  const svgRef = useRef<HTMLDivElement>(null);
  const {
    points, addPoint, updatePoint, deletePoint,
    selectedPointId, setSelectedPointId,
    templateView, setTemplateView, faceSide, setFaceSide,
    selectedTreatmentId,
  } = useAppStore();

  const viewPoints = points.filter(p => p.templateView === templateView);
  const selectedPoint = points.find(p => p.id === selectedPointId);
  const totalDosage = points.reduce((s, p) => s + (p.dosage || 0), 0);
  const totalNeedles = points.reduce((s, p) => s + (p.needleCount || 0), 0);

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!svgRef.current || !selectedTreatmentId) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return;
    const maxNum = points.length > 0 ? Math.max(...points.map(p => p.pointNumber)) : 0;
    const newPoint = await addPoint({
      treatmentId: selectedTreatmentId,
      pointNumber: maxNum + 1,
      x, y,
      templateView,
      productName: '',
      layer: '',
      dosage: 0,
      needleCount: 0,
      notes: '',
    });
    setSelectedPointId(newPoint.id!);
  };

  const handlePointClick = (e: React.MouseEvent, pointId: number) => {
    e.stopPropagation();
    setSelectedPointId(pointId);
  };

  return (
    <div className="flex h-full">
      <div className="flex flex-col w-3/5 border-r border-[#E8D5B7]/20">
        <div className="flex gap-2 p-3">
          {(['front', '45deg', 'side'] as const).map(v => (
            <button key={v} onClick={() => setTemplateView(v)}
              className={`px-3 py-1.5 rounded text-sm ${templateView === v ? 'bg-[#0F3460] text-[#E8D5B7]' : 'bg-[#16213E] text-[#E8D5B7]/60'}`}>
              {v === 'front' ? '正面' : v === '45deg' ? '45°' : '侧面'}
            </button>
          ))}
          <div className="mx-2 border-r border-[#E8D5B7]/20" />
          {(['left', 'full', 'right'] as const).map(s => (
            <button key={s} onClick={() => setFaceSide(s)}
              className={`px-3 py-1.5 rounded text-sm ${faceSide === s ? 'bg-[#0F3460] text-[#E8D5B7]' : 'bg-[#16213E] text-[#E8D5B7]/60'}`}>
              {s === 'left' ? '左脸' : s === 'full' ? '全面' : '右脸'}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <div ref={svgRef} className="relative inline-block cursor-crosshair" onClick={handleCanvasClick}>
            <FaceTemplate view={templateView} width={380} height={500} />
            {viewPoints.map(p => (
              <div key={p.id} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%,-50%)' }}
                onClick={e => handlePointClick(e, p.id!)}>
                <div className={`w-6 h-6 rounded-full bg-[#E94560] flex items-center justify-center text-white text-xs font-bold ${p.id === selectedPointId ? 'shadow-[0_0_12px_#E94560]' : ''}`}>
                  {p.pointNumber}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col w-2/5 bg-[#16213E]">
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedPoint ? (
            <div className="space-y-3">
              <div className="text-[#E8D5B7] font-bold text-lg">点位 #{selectedPoint.pointNumber}</div>
              <div>
                <label className="text-[#E8D5B7]/70 text-xs">产品</label>
                <select value={selectedPoint.productName} onChange={e => updatePoint(selectedPoint.id!, { productName: e.target.value })}
                  className="w-full bg-[#1A1A2E] text-[#E8D5B7] border border-[#E8D5B7]/20 rounded px-2 py-1.5 text-sm mt-1">
                  <option value="">选择产品</option>
                  {PRODUCT_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#E8D5B7]/70 text-xs">层次</label>
                <select value={selectedPoint.layer} onChange={e => updatePoint(selectedPoint.id!, { layer: e.target.value })}
                  className="w-full bg-[#1A1A2E] text-[#E8D5B7] border border-[#E8D5B7]/20 rounded px-2 py-1.5 text-sm mt-1">
                  <option value="">选择层次</option>
                  {LAYER_LIST.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[#E8D5B7]/70 text-xs">剂量 (ml/U)</label>
                  <input type="number" min="0" step="0.1" value={selectedPoint.dosage || ''}
                    onChange={e => updatePoint(selectedPoint.id!, { dosage: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#1A1A2E] text-[#E8D5B7] border border-[#E8D5B7]/20 rounded px-2 py-1.5 text-sm mt-1" />
                </div>
                <div className="flex-1">
                  <label className="text-[#E8D5B7]/70 text-xs">针数</label>
                  <input type="number" min="0" value={selectedPoint.needleCount || ''}
                    onChange={e => updatePoint(selectedPoint.id!, { needleCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#1A1A2E] text-[#E8D5B7] border border-[#E8D5B7]/20 rounded px-2 py-1.5 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-[#E8D5B7]/70 text-xs">备注</label>
                <textarea value={selectedPoint.notes} onChange={e => updatePoint(selectedPoint.id!, { notes: e.target.value })}
                  className="w-full bg-[#1A1A2E] text-[#E8D5B7] border border-[#E8D5B7]/20 rounded px-2 py-1.5 text-sm mt-1 h-16 resize-none" />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {QUICK_NOTES.map(n => (
                    <button key={n} onClick={() => {
                      const curr = selectedPoint.notes ? selectedPoint.notes + '；' : '';
                      updatePoint(selectedPoint.id!, { notes: curr + n });
                    }} className="px-2 py-0.5 text-xs bg-[#0F3460] text-[#E8D5B7]/80 rounded hover:bg-[#0F3460]/80">{n}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => { deletePoint(selectedPoint.id!); setSelectedPointId(null); }}
                className="w-full py-2 bg-[#E94560]/20 text-[#E94560] rounded text-sm hover:bg-[#E94560]/30 mt-2">删除点位</button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[#E8D5B7]/40 text-sm">点击面部模板添加点位</div>
          )}
        </div>
        <div className="border-t border-[#E8D5B7]/20 px-4 py-3 flex justify-between text-sm">
          <span className="text-[#E8D5B7]/70">总剂量: <span className="text-[#E8D5B7] font-bold">{totalDosage}</span> ml/U</span>
          <span className="text-[#E8D5B7]/70">总针数: <span className="text-[#E8D5B7] font-bold">{totalNeedles}</span></span>
        </div>
      </div>
    </div>
  );
}
