import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Image, Trash2, X, Columns } from 'lucide-react';

export default function PhotoFolder() {
  const { photos, addPhoto, deletePhoto, selectedTreatmentId } = useAppStore();
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  const treatmentPhotos = photos.filter(p => p.treatmentId === selectedTreatmentId);
  const preOps = [...treatmentPhotos.filter(p => p.type === 'pre-op')].sort((a, b) => +new Date(b.takenAt) - +new Date(a.takenAt));
  const postOps = [...treatmentPhotos.filter(p => p.type === 'post-op')].sort((a, b) => +new Date(b.takenAt) - +new Date(a.takenAt));

  const handleDrop = useCallback((type: 'pre-op' | 'post-op') => (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/') || !selectedTreatmentId) return;
    const reader = new FileReader();
    reader.onload = () => {
      addPhoto({
        treatmentId: selectedTreatmentId,
        type,
        imageBlob: reader.result as string,
        takenAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  }, [selectedTreatmentId, addPhoto]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return iso;
    }
  };

  const groupByDate = (list: typeof photos) => {
    const map = new Map<string, typeof photos>();
    list.forEach(p => {
      const d = formatDate(p.takenAt);
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(p);
    });
    return Array.from(map.entries());
  };

  const DropZone = ({ type, label }: { type: 'pre-op' | 'post-op'; label: string }) => (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop(type)}
      className="border-2 border-dashed border-[#E8D5B7]/30 rounded-lg p-6 flex flex-col items-center justify-center min-h-[160px] cursor-pointer hover:border-[#E8D5B7]/60 transition-colors bg-[#16213E]/40"
    >
      <Image className="w-8 h-8 text-[#E8D5B7]/50 mb-2" />
      <span className="text-[#E8D5B7]/70 text-sm">{label}</span>
      <span className="text-[#E8D5B7]/40 text-xs mt-1">拖放图片到此处</span>
    </div>
  );

  const ThumbGrid = ({ grouped }: { grouped: [string, typeof photos][] }) => (
    <div className="mt-3 space-y-3">
      {grouped.map(([date, items]) => (
        <div key={date}>
          <div className="text-[#E8D5B7]/60 text-xs mb-1.5">{date}</div>
          <div className="grid grid-cols-3 gap-2">
            {items.map(p => (
              <div key={p.id} className="relative group rounded overflow-hidden aspect-square">
                <img src={p.imageBlob} className="w-full h-full object-cover cursor-pointer" onClick={() => setModalSrc(p.imageBlob)} alt="" />
                <button
                  onClick={() => p.id && deletePhoto(p.id)}
                  className="absolute top-0.5 right-0.5 bg-[#E94560] rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (!selectedTreatmentId) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1A1A2E]">
        <div className="text-center">
          <Image className="w-12 h-12 text-[#E8D5B7]/15 mx-auto mb-3" />
          <p className="text-sm text-[#E8D5B7]/30">请先选择一个疗程</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#1A1A2E] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#E8D5B7] font-medium text-base">照片记录</h3>
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            compareMode ? 'bg-[#0F3460] text-[#E8D5B7]' : 'bg-[#16213E] text-[#E8D5B7]/50'
          }`}
        >
          <Columns className="w-4 h-4" />
          左右脸对照
        </button>
      </div>

      {!compareMode ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[#E8D5B7]/80 text-sm mb-2">术前照片</div>
            <DropZone type="pre-op" label="术前照片" />
            <ThumbGrid grouped={groupByDate(preOps)} />
          </div>
          <div>
            <div className="text-[#E8D5B7]/80 text-sm mb-2">术后照片</div>
            <DropZone type="post-op" label="术后照片" />
            <ThumbGrid grouped={groupByDate(postOps)} />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <DropZone type="pre-op" label="术前照片" />
            <DropZone type="post-op" label="术后照片" />
          </div>
          {(() => {
            const max = Math.max(preOps.length, postOps.length);
            return Array.from({ length: max }, (_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                {preOps[i] ? (
                  <div className="relative group rounded overflow-hidden aspect-video">
                    <img src={preOps[i].imageBlob} className="w-full h-full object-cover cursor-pointer" onClick={() => setModalSrc(preOps[i].imageBlob)} alt="" />
                    <button onClick={() => preOps[i].id && deletePhoto(preOps[i].id)} className="absolute top-1 right-1 bg-[#E94560] rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video rounded bg-[#16213E]/30" />
                )}
                {postOps[i] ? (
                  <div className="relative group rounded overflow-hidden aspect-video">
                    <img src={postOps[i].imageBlob} className="w-full h-full object-cover cursor-pointer" onClick={() => setModalSrc(postOps[i].imageBlob)} alt="" />
                    <button onClick={() => postOps[i].id && deletePhoto(postOps[i].id)} className="absolute top-1 right-1 bg-[#E94560] rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video rounded bg-[#16213E]/30" />
                )}
              </div>
            ));
          })()}
        </div>
      )}

      {modalSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setModalSrc(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setModalSrc(null)}>
            <X className="w-6 h-6" />
          </button>
          <img src={modalSrc} className="max-w-full max-h-full object-contain rounded-lg" alt="" />
        </div>
      )}
    </div>
  );
}
