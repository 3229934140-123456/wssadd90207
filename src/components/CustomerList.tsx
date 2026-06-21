import { useAppStore } from '@/store/useAppStore'
import { useState } from 'react'
import { Search, Plus, User, Calendar, ChevronRight } from 'lucide-react'
import { PRODUCT_LIST } from '@/types'

export default function CustomerList() {
  const {
    customers, addCustomer,
    selectedCustomerId, setSelectedCustomerId,
    treatments, addTreatment,
    selectedTreatmentId, setSelectedTreatmentId,
    setActiveTab,
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [showNewTreatment, setShowNewTreatment] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newFaceSide, setNewFaceSide] = useState<'left' | 'right' | 'full'>('full')

  const filteredCustomers = customers.filter(c => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return c.name.toLowerCase().includes(q) || c.phone.includes(q)
  })

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  const handleAddCustomer = async () => {
    if (!newName.trim() || !newPhone.trim()) return
    await addCustomer({ name: newName.trim(), phone: newPhone.trim(), notes: newNotes.trim() })
    setNewName('')
    setNewPhone('')
    setNewNotes('')
    setShowNewCustomer(false)
  }

  const handleAddTreatment = async () => {
    if (!selectedCustomerId || !newProjectName) return
    const today = new Date().toISOString().split('T')[0]
    const t = await addTreatment({
      customerId: selectedCustomerId,
      projectName: newProjectName,
      faceSide: newFaceSide,
      date: today,
      status: 'ongoing',
    })
    setShowNewTreatment(false)
    setNewProjectName('')
    setNewFaceSide('full')
    setSelectedTreatmentId(t.id!)
    setActiveTab('canvas')
  }

  const handleSelectTreatment = (id: number) => {
    setSelectedTreatmentId(id)
    setActiveTab('canvas')
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--'
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    } catch {
      return '--'
    }
  }

  const faceSideLabel: Record<string, string> = { left: '左侧', right: '右侧', full: '全脸' }

  return (
    <div className="h-full flex font-[Noto_Sans_SC] bg-[#1A1A2E]">
      <div className="w-[340px] min-w-[340px] flex flex-col border-r border-[#16213E]">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E8D5B7]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索姓名或手机号..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#16213E] rounded-xl text-sm text-[#E8D5B7] placeholder:text-[#E8D5B7]/40 outline-none focus:ring-2 focus:ring-[#0F3460] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1.5">
          {filteredCustomers.map(customer => (
            <button
              key={customer.id}
              onClick={() => setSelectedCustomerId(customer.id!)}
              className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 group ${
                selectedCustomerId === customer.id
                  ? 'bg-[#0F3460] ring-1 ring-[#E8D5B7]/20'
                  : 'hover:bg-[#16213E]/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selectedCustomerId === customer.id ? 'bg-[#E8D5B7]/20' : 'bg-[#0F3460]/60'
                }`}>
                  <User className="w-4 h-4 text-[#E8D5B7]/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#E8D5B7] truncate">{customer.name}</span>
                    <span className="text-[11px] text-[#E8D5B7]/40 flex items-center gap-1 flex-shrink-0 ml-2">
                      <Calendar className="w-3 h-3" />
                      {formatDate(customer.updatedAt)}
                    </span>
                  </div>
                  <span className="text-xs text-[#E8D5B7]/50">{customer.phone}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-[#E8D5B7]/30 transition-transform ${
                  selectedCustomerId === customer.id ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'
                }`} />
              </div>
            </button>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="py-12 text-center text-sm text-[#E8D5B7]/30">
              {searchQuery ? '未找到匹配的客户' : '暂无客户记录'}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[#16213E]">
          {showNewCustomer ? (
            <div className="space-y-2.5 bg-[#16213E] rounded-xl p-3.5">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="姓名 *"
                className="w-full px-3 py-2 bg-[#1A1A2E] rounded-lg text-sm text-[#E8D5B7] placeholder:text-[#E8D5B7]/30 outline-none focus:ring-1 focus:ring-[#0F3460]"
              />
              <input
                type="tel"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                placeholder="手机号 *"
                className="w-full px-3 py-2 bg-[#1A1A2E] rounded-lg text-sm text-[#E8D5B7] placeholder:text-[#E8D5B7]/30 outline-none focus:ring-1 focus:ring-[#0F3460]"
              />
              <textarea
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="备注"
                rows={2}
                className="w-full px-3 py-2 bg-[#1A1A2E] rounded-lg text-sm text-[#E8D5B7] placeholder:text-[#E8D5B7]/30 outline-none focus:ring-1 focus:ring-[#0F3460] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowNewCustomer(false); setNewName(''); setNewPhone(''); setNewNotes('') }}
                  className="flex-1 py-2 rounded-lg text-xs text-[#E8D5B7]/60 hover:bg-[#1A1A2E]/60 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddCustomer}
                  disabled={!newName.trim() || !newPhone.trim()}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#0F3460] text-[#E8D5B7] hover:bg-[#0F3460]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  确认添加
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewCustomer(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-[#E8D5B7] bg-[#0F3460] hover:bg-[#0F3460]/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建客户
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {selectedCustomer ? (
          <>
            <div className="p-5 border-b border-[#16213E]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#E8D5B7]">{selectedCustomer.name}</h2>
                  <p className="text-sm text-[#E8D5B7]/50 mt-0.5">{selectedCustomer.phone}</p>
                  {selectedCustomer.notes && (
                    <p className="text-xs text-[#E8D5B7]/35 mt-1.5 max-w-xs">{selectedCustomer.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#E8D5B7]/30">建档日期</span>
                  <p className="text-xs text-[#E8D5B7]/50">{formatDate(selectedCustomer.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="text-sm font-medium text-[#E8D5B7]/70">治疗记录</h3>
              <button
                onClick={() => setShowNewTreatment(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#E8D5B7] bg-[#0F3460] hover:bg-[#0F3460]/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                新建治疗
              </button>
            </div>

            {showNewTreatment && (
              <div className="mx-5 mb-3 bg-[#16213E] rounded-xl p-4 space-y-3">
                <div>
                  <label className="block text-xs text-[#E8D5B7]/50 mb-1.5">项目名称</label>
                  <select
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1A1A2E] rounded-lg text-sm text-[#E8D5B7] outline-none focus:ring-1 focus:ring-[#0F3460] appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#1A1A2E]">请选择项目</option>
                    {PRODUCT_LIST.map(p => (
                      <option key={p} value={p} className="bg-[#1A1A2E]">{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#E8D5B7]/50 mb-1.5">注射部位</label>
                  <div className="flex gap-2">
                    {(['full', 'left', 'right'] as const).map(side => (
                      <button
                        key={side}
                        onClick={() => setNewFaceSide(side)}
                        className={`flex-1 py-2 rounded-lg text-xs transition-colors ${
                          newFaceSide === side
                            ? 'bg-[#0F3460] text-[#E8D5B7] ring-1 ring-[#E8D5B7]/20'
                            : 'bg-[#1A1A2E] text-[#E8D5B7]/50 hover:text-[#E8D5B7]/70'
                        }`}
                      >
                        {faceSideLabel[side]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { setShowNewTreatment(false); setNewProjectName(''); setNewFaceSide('full') }}
                    className="flex-1 py-2 rounded-lg text-xs text-[#E8D5B7]/60 hover:bg-[#1A1A2E]/40 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAddTreatment}
                    disabled={!newProjectName}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#0F3460] text-[#E8D5B7] hover:bg-[#0F3460]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    开始治疗
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2">
              {treatments.map(treatment => (
                <button
                  key={treatment.id}
                  onClick={() => handleSelectTreatment(treatment.id!)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                    selectedTreatmentId === treatment.id
                      ? 'bg-[#0F3460] ring-1 ring-[#E8D5B7]/20'
                      : 'bg-[#16213E]/60 hover:bg-[#16213E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-medium text-[#E8D5B7] truncate">{treatment.projectName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          treatment.faceSide === 'full'
                            ? 'bg-[#0F3460] text-[#E8D5B7]/70'
                            : treatment.faceSide === 'left'
                              ? 'bg-[#0F3460]/60 text-[#E8D5B7]/60'
                              : 'bg-[#0F3460]/60 text-[#E8D5B7]/60'
                        }`}>
                          {faceSideLabel[treatment.faceSide]}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          treatment.status === 'ongoing'
                            ? 'bg-[#E94560]/20 text-[#E94560]'
                            : 'bg-[#E8D5B7]/10 text-[#E8D5B7]/60'
                        }`}>
                          {treatment.status === 'ongoing' ? '进行中' : '已完成'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Calendar className="w-3 h-3 text-[#E8D5B7]/30" />
                        <span className="text-xs text-[#E8D5B7]/40">{formatDate(treatment.date)}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#E8D5B7]/20 group-hover:text-[#E8D5B7]/40 transition-colors flex-shrink-0 ml-2" />
                  </div>
                </button>
              ))}

              {treatments.length === 0 && (
                <div className="py-16 text-center">
                  <Calendar className="w-10 h-10 text-[#E8D5B7]/15 mx-auto mb-3" />
                  <p className="text-sm text-[#E8D5B7]/30">暂无治疗记录</p>
                  <p className="text-xs text-[#E8D5B7]/20 mt-1">点击上方按钮新建治疗</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <User className="w-12 h-12 text-[#E8D5B7]/15 mx-auto mb-3" />
              <p className="text-sm text-[#E8D5B7]/30">选择一位客户查看详情</p>
              <p className="text-xs text-[#E8D5B7]/20 mt-1">或新建客户开始记录</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
