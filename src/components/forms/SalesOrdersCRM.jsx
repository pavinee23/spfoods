import { apiFetch } from '../../lib/api.js'
import { useEffect, useRef, useState } from 'react'
import { Search, Plus, Trash2, Calendar, Phone, Mail, MapPin, X } from 'lucide-react'

const i18n = {
  th: {
    searchPlaceholder: 'ค้นหารหัส / ชื่อลูกค้า / เบอร์โทร...',
    newTracking: 'เพิ่มบันทึกการติดตาม',
    interactionType: 'ประเภทการติดตาม',
    serviceStage: 'สถานะ',
    description: 'รายละเอียด',
    notes: 'หมายเหตุ',
    addRecord: 'บันทึก',
    cancel: 'ยกเลิก',
    trackingHistory: 'ประวัติการติดตาม',
    relatedOrders: 'ใบสั่งขายที่เกี่ยวข้อง',
    noTracking: 'ยังไม่มีบันทึกการติดตาม',
    noOrders: 'ไม่มีใบสั่งขาย',
    selectCustomer: 'ค้นหาและเลือกลูกค้าเพื่อเริ่มต้น',
    soNo: 'เลขที่ SO',
    amount: 'ยอดรวม',
    loading: 'กำลังโหลด...',
    success: '✓ บันทึกสำเร็จ',
    error: 'เกิดข้อผิดพลาด',
    searching: 'กำลังค้นหา...',
    noResults: 'ไม่พบลูกค้า',
    changeCustomer: 'เปลี่ยนลูกค้า',
  },
  en: {
    searchPlaceholder: 'Search code / name / phone...',
    newTracking: 'Add Tracking Record',
    interactionType: 'Interaction Type',
    serviceStage: 'Status',
    description: 'Description',
    notes: 'Notes',
    addRecord: 'Save',
    cancel: 'Cancel',
    trackingHistory: 'Tracking History',
    relatedOrders: 'Related Sales Orders',
    noTracking: 'No tracking records yet',
    noOrders: 'No sales orders',
    selectCustomer: 'Search and select a customer to begin',
    soNo: 'SO No.',
    amount: 'Total',
    loading: 'Loading...',
    success: '✓ Record saved',
    error: 'An error occurred',
    searching: 'Searching...',
    noResults: 'No customers found',
    changeCustomer: 'Change',
  },
  ko: {
    searchPlaceholder: '코드 / 고객명 / 전화번호 검색...',
    newTracking: '추적 기록 추가',
    interactionType: '상호작용 유형',
    serviceStage: '상태',
    description: '설명',
    notes: '비고',
    addRecord: '저장',
    cancel: '취소',
    trackingHistory: '추적 이력',
    relatedOrders: '관련 판매 주문',
    noTracking: '추적 기록 없음',
    noOrders: '판매 주문 없음',
    selectCustomer: '고객을 검색하여 시작하세요',
    soNo: 'SO번호',
    amount: '합계',
    loading: '로딩 중...',
    success: '✓ 저장되었습니다',
    error: '오류가 발생했습니다',
    searching: '검색 중...',
    noResults: '고객을 찾을 수 없음',
    changeCustomer: '변경',
  },
}

const INTERACTION_TYPES = [
  { value: 'call',      icon: '📞', th: 'โทรศัพท์',    en: 'Phone Call',  ko: '전화' },
  { value: 'email',     icon: '✉️',  th: 'อีเมล',       en: 'Email',       ko: '이메일' },
  { value: 'visit',     icon: '🏢', th: 'เยี่ยมลูกค้า', en: 'Visit',       ko: '방문' },
  { value: 'inquiry',   icon: '❓', th: 'สอบถาม',       en: 'Inquiry',     ko: '문의' },
  { value: 'complaint', icon: '⚠️', th: 'ร้องเรียน',    en: 'Complaint',   ko: '불만' },
  { value: 'feedback',  icon: '💬', th: 'ฟีดแบ็ค',      en: 'Feedback',    ko: '피드백' },
  { value: 'meeting',   icon: '🤝', th: 'ประชุม',       en: 'Meeting',     ko: '회의' },
  { value: 'quotation', icon: '📋', th: 'เสนอราคา',     en: 'Quotation',   ko: '견적' },
  { value: 'follow_up', icon: '🔄', th: 'ติดตามผล',     en: 'Follow Up',   ko: '팔로우업' },
  { value: 'demo',      icon: '📊', th: 'สาธิตสินค้า',  en: 'Demo',        ko: '데모' },
]

const STAGES = [
  { value: 'pre-sale',  th: 'ก่อนขาย',    en: 'Pre-Sale',    ko: '판매 전', badge: 'bg-blue-100 text-blue-700',   border: 'border-l-blue-400',   bg: 'bg-blue-50' },
  { value: 'during',    th: 'ระหว่างขาย', en: 'During Sale', ko: '판매 중', badge: 'bg-purple-100 text-purple-700', border: 'border-l-purple-400', bg: 'bg-purple-50' },
  { value: 'post-sale', th: 'หลังขาย',    en: 'Post-Sale',   ko: '판매 후', badge: 'bg-green-100 text-green-700',  border: 'border-l-green-400',  bg: 'bg-green-50' },
]

const headers = token => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })
const fmt = n => parseFloat(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

export default function SalesOrdersCRM({ token, lang }) {
  const t = i18n[lang] || i18n.th

  const [query, setQuery]               = useState('')
  const [searching, setSearching]       = useState(false)
  const [results, setResults]           = useState([])
  const [showDrop, setShowDrop]         = useState(false)
  const [customer, setCustomer]         = useState(null)
  const [trackings, setTrackings]       = useState([])
  const [salesOrders, setSalesOrders]   = useState([])
  const [loadingData, setLoadingData]   = useState(false)
  const [showForm, setShowForm]         = useState(false)
  const [formType, setFormType]         = useState('')
  const [formStage, setFormStage]       = useState('pre-sale')
  const [formDesc, setFormDesc]         = useState('')
  const [formNotes, setFormNotes]       = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [message, setMessage]           = useState('')
  const [summary, setSummary]           = useState([])
  const [editRow, setEditRow]           = useState(null)   // { id, field, value }
  const [savingRow, setSavingRow]       = useState(null)
  const dropRef = useRef(null)

  async function loadSummary() {
    try {
      const r = await apiFetch('/api/crm-tracking/summary', { headers: headers(token) })
      const d = await r.json()
      setSummary(Array.isArray(d) ? d : [])
    } catch {}
  }

  async function saveInline(trackingId, field, value) {
    setSavingRow(trackingId)
    try {
      const row = summary.find(s => s.tracking_id === trackingId)
      if (!row) return
      await apiFetch(`/api/crm-tracking/${trackingId}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify({
          interaction_type: field === 'interaction_type' ? value : row.interaction_type,
          service_stage:    field === 'service_stage'    ? value : row.service_stage,
          description:      field === 'description'      ? value : row.description,
          notes:            field === 'notes'             ? value : row.notes,
        }),
      })
      setSummary(prev => prev.map(s => s.tracking_id === trackingId ? { ...s, [field]: value } : s))
    } catch {}
    setSavingRow(null)
    setEditRow(null)
  }

  useEffect(() => {
    const h = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => { loadSummary() }, [token])

  useEffect(() => {
    if (!query.trim()) { setResults([]); setShowDrop(false); return }
    const t2 = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(t2)
  }, [query])

  async function doSearch(q) {
    setSearching(true)
    try {
      const r = await apiFetch(`/api/crm-tracking/customers/search?q=${encodeURIComponent(q)}`, {
        headers: headers(token),
      })
      const d = await r.json()
      setResults(Array.isArray(d) ? d : [])
      setShowDrop(true)
    } catch { setResults([]) }
    finally { setSearching(false) }
  }

  async function selectCustomer(c) {
    setQuery(''); setResults([]); setShowDrop(false); setShowForm(false)
    setCustomer(c); setTrackings([]); setSalesOrders([])
    setLoadingData(true)
    try {
      const r = await apiFetch(`/api/crm-tracking/customer/${c.id}`, { headers: headers(token) })
      const d = await r.json()
      setCustomer(d.customer); setTrackings(d.trackings || []); setSalesOrders(d.salesOrders || [])
    } catch {}
    finally { setLoadingData(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formType) { setMessage('กรุณาเลือกประเภทการติดตาม'); return }
    setSubmitting(true); setMessage('')
    try {
      const r = await apiFetch('/api/crm-tracking', {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify({
          customer_id: customer.id,
          interaction_type: formType,
          service_stage: formStage,
          description: formDesc,
          notes: formNotes,
        }),
      })
      const d = await r.json()
      if (d.success) {
        setMessage(t.success)
        setFormType(''); setFormStage('pre-sale'); setFormDesc(''); setFormNotes(''); setShowForm(false)
        const r2 = await apiFetch(`/api/crm-tracking/customer/${customer.id}`, { headers: headers(token) })
        const d2 = await r2.json()
        setTrackings(d2.trackings || []); setSalesOrders(d2.salesOrders || [])
        loadSummary()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(d.error || t.error)
      }
    } catch { setMessage(t.error) }
    finally { setSubmitting(false) }
  }

  async function handleDelete(id) {
    if (!confirm('ลบบันทึกนี้?')) return
    try {
      await apiFetch(`/api/crm-tracking/${id}`, { method: 'DELETE', headers: headers(token) })
      setTrackings(prev => prev.filter(r => r.id !== id))
      loadSummary()
    } catch {}
  }

  const stageMeta  = v => STAGES.find(s => s.value === v) || STAGES[0]
  const typeLabel  = v => { const f = INTERACTION_TYPES.find(x => x.value === v); return f ? (f[lang] || f.en) : v }
  const stageLabel = v => { const f = stageMeta(v); return f[lang] || f.en }

  return (
    <div className="space-y-5">

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="relative" ref={dropRef}>
          <div className="flex items-center gap-2 border-2 border-gray-200 focus-within:border-blue-400 rounded-xl px-4 py-3 bg-white transition-colors">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
            />
            {searching && <span className="text-xs text-gray-400">{t.searching}</span>}
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setShowDrop(false) }}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {showDrop && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-sm text-center text-gray-400 py-6">{t.noResults}</p>
              ) : results.map(c => (
                <button key={c.id} onClick={() => selectCustomer(c)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{(c.customer_name || '?').charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{c.customer_name}</p>
                    <p className="text-xs text-gray-400">{c.customer_code}{c.phone ? ` • ${c.phone}` : ''}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Table — ลูกค้าที่กำลังติดตามทั้งหมด */}
      {summary.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">รายละเอียดลูกค้าที่กำลังติดตาม</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{summary.length} ราย</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold uppercase">
                <tr>
                  <th className="px-4 py-2.5 text-left">ลูกค้า</th>
                  <th className="px-4 py-2.5 text-left">ประเภทการติดตาม</th>
                  <th className="px-4 py-2.5 text-left">สถานะ</th>
                  <th className="px-4 py-2.5 text-left min-w-[180px]">รายละเอียด</th>
                  <th className="px-4 py-2.5 text-left min-w-[140px]">หมายเหตุ</th>
                  <th className="px-4 py-2.5 text-left">อัปเดต</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summary.map(row => {
                  const stage = STAGES.find(s => s.value === row.service_stage) || STAGES[0]
                  const itype = INTERACTION_TYPES.find(i => i.value === row.interaction_type)
                  const isEditing = f => editRow?.id === row.tracking_id && editRow?.field === f
                  return (
                    <tr key={row.tracking_id} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-2.5">
                        <p className="font-semibold text-gray-900">{row.customer_name}</p>
                        <p className="text-gray-400">{row.customer_code}</p>
                      </td>

                      {/* ประเภทการติดตาม — inline select */}
                      <td className="px-4 py-2.5">
                        <select
                          value={isEditing('interaction_type') ? editRow.value : (row.interaction_type || '')}
                          onChange={e => setEditRow({ id: row.tracking_id, field: 'interaction_type', value: e.target.value })}
                          onBlur={e => saveInline(row.tracking_id, 'interaction_type', e.target.value)}
                          disabled={savingRow === row.tracking_id}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:opacity-50"
                        >
                          {INTERACTION_TYPES.map(i => (
                            <option key={i.value} value={i.value}>{i.icon} {i[lang] || i.en}</option>
                          ))}
                        </select>
                      </td>

                      {/* ระยะบริการ — inline select */}
                      <td className="px-4 py-2.5">
                        <select
                          value={isEditing('service_stage') ? editRow.value : (row.service_stage || 'pre-sale')}
                          onChange={e => setEditRow({ id: row.tracking_id, field: 'service_stage', value: e.target.value })}
                          onBlur={e => saveInline(row.tracking_id, 'service_stage', e.target.value)}
                          disabled={savingRow === row.tracking_id}
                          className={`w-full border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:opacity-50 ${stage.badge}`}
                        >
                          {STAGES.map(s => (
                            <option key={s.value} value={s.value}>{s[lang] || s.en}</option>
                          ))}
                        </select>
                      </td>

                      {/* รายละเอียด — inline textarea */}
                      <td className="px-4 py-2.5">
                        <textarea
                          rows={2}
                          defaultValue={row.description || ''}
                          onFocus={e => setEditRow({ id: row.tracking_id, field: 'description', value: e.target.value })}
                          onChange={e => setEditRow({ id: row.tracking_id, field: 'description', value: e.target.value })}
                          onBlur={e => saveInline(row.tracking_id, 'description', e.target.value)}
                          disabled={savingRow === row.tracking_id}
                          placeholder="รายละเอียด..."
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-900 resize-none focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:opacity-50"
                        />
                      </td>

                      {/* หมายเหตุ — inline textarea */}
                      <td className="px-4 py-2.5">
                        <textarea
                          rows={2}
                          defaultValue={row.notes || ''}
                          onFocus={e => setEditRow({ id: row.tracking_id, field: 'notes', value: e.target.value })}
                          onChange={e => setEditRow({ id: row.tracking_id, field: 'notes', value: e.target.value })}
                          onBlur={e => saveInline(row.tracking_id, 'notes', e.target.value)}
                          disabled={savingRow === row.tracking_id}
                          placeholder="หมายเหตุ..."
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-900 resize-none focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:opacity-50"
                        />
                      </td>

                      <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">
                        {savingRow === row.tracking_id
                          ? <span className="text-blue-500">💾</span>
                          : new Date(row.updated_at).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No customer */}
      {!customer && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium text-sm">{t.selectCustomer}</p>
        </div>
      )}

      {/* Customer view */}
      {customer && (
        <div className="grid lg:grid-cols-3 gap-5">

          {/* LEFT */}
          <div className="space-y-4">

            {/* Customer card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold">{(customer.customer_name || '?').charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{customer.customer_name}</p>
                    <p className="text-xs text-gray-400 font-mono">{customer.customer_code}</p>
                  </div>
                </div>
                <button onClick={() => { setCustomer(null); setTrackings([]); setSalesOrders([]) }}
                  className="text-xs text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors">
                  {t.changeCustomer}
                </button>
              </div>
              <div className="space-y-2 text-sm">
                {customer.phone && <div className="flex items-center gap-2 text-gray-600"><Phone className="w-3.5 h-3.5 text-gray-400" />{customer.phone}</div>}
                {customer.email && <div className="flex items-center gap-2 text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-400" /><span className="text-xs break-all">{customer.email}</span></div>}
                {customer.address && <div className="flex items-start gap-2 text-gray-600"><MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" /><span className="text-xs">{customer.address}</span></div>}
              </div>
            </div>

            {/* Add button / Form */}
            {!showForm ? (
              <button onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3 font-semibold text-sm shadow-md transition-all">
                <Plus className="w-4 h-4" />
                {t.newTracking}
              </button>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border-2 border-blue-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-gray-900 text-sm">{t.newTracking}</p>
                  <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type picker */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                      {t.interactionType} <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {INTERACTION_TYPES.map(type => (
                        <button key={type.value} type="button" onClick={() => setFormType(type.value)}
                          className={`flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                            formType === type.value
                              ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}>
                          <span>{type.icon}</span>
                          <span className="truncate">{type[lang] || type.en}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stage */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                      {t.serviceStage} <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-1.5">
                      {STAGES.map(s => (
                        <button key={s.value} type="button" onClick={() => setFormStage(s.value)}
                          className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold border transition-all ${
                            formStage === s.value ? `${s.badge} border-current` : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                          }`}>
                          {s[lang] || s.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{t.description}</label>
                    <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3}
                      placeholder="รายละเอียดการติดต่อ..."
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 resize-none" />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{t.notes}</label>
                    <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2}
                      placeholder="หมายเหตุ..."
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 resize-none" />
                  </div>

                  {message && (
                    <p className={`text-xs px-3 py-2 rounded-lg ${message.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {message}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                      {t.cancel}
                    </button>
                    <button type="submit" disabled={submitting || !formType}
                      className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                      {submitting ? '...' : t.addRecord}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-5">

            {message && message.startsWith('✓') && !showForm && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">{message}</div>
            )}

            {/* Tracking timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {t.trackingHistory}
                </h3>
                <span className="text-xs bg-blue-100 text-blue-600 font-semibold px-2.5 py-0.5 rounded-full">{trackings.length}</span>
              </div>

              {loadingData ? (
                <p className="text-sm text-center text-gray-400 py-10">{t.loading}</p>
              ) : trackings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-400">{t.noTracking}</p>
                  <p className="text-xs text-gray-300 mt-1">กดปุ่ม "เพิ่มบันทึก" ทางซ้ายเพื่อเริ่มต้น</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trackings.map(rec => {
                    const sm  = stageMeta(rec.service_stage)
                    const typeObj = INTERACTION_TYPES.find(x => x.value === rec.interaction_type)
                    return (
                      <div key={rec.id} className={`border-l-4 ${sm.border} ${sm.bg} rounded-r-xl p-4 flex gap-3`}>
                        <span className="text-xl mt-0.5">{typeObj?.icon || '📝'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm">{typeLabel(rec.interaction_type)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sm.badge}`}>{stageLabel(rec.service_stage)}</span>
                            <span className="text-xs text-gray-400 ml-auto">
                              {new Date(rec.created_at).toLocaleDateString(
                                lang === 'ko' ? 'ko-KR' : lang === 'en' ? 'en-US' : 'th-TH',
                                { year: 'numeric', month: 'short', day: 'numeric' }
                              )}
                            </span>
                          </div>
                          {rec.description && <p className="text-sm text-gray-700">{rec.description}</p>}
                          {rec.notes && <p className="text-xs text-gray-400 italic mt-0.5">{rec.notes}</p>}
                        </div>
                        <button onClick={() => handleDelete(rec.id)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Sales Orders */}
            {salesOrders.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-4">{t.relatedOrders}</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">{t.soNo}</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">วันที่</th>
                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase">{t.amount}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesOrders.map(o => (
                      <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 px-2 font-mono text-blue-700 text-xs font-semibold">{o.so_no}</td>
                        <td className="py-2.5 px-2 text-gray-500 text-xs">
                          {new Date(o.created_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : lang === 'en' ? 'en-US' : 'th-TH')}
                        </td>
                        <td className="py-2.5 px-2 text-right font-semibold text-gray-900">{fmt(o.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
