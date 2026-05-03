import { apiFetch } from '../../lib/api.js'
import { useEffect, useState } from 'react'
import { Plus, X, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react'

const ISSUE_TYPES = [
  { value: 'quality',   th: 'คุณภาพสินค้า',     en: 'Product Quality', ko: '제품 품질',   icon: '📦' },
  { value: 'delivery',  th: 'การจัดส่ง',          en: 'Delivery',        ko: '배송',        icon: '🚚' },
  { value: 'payment',   th: 'การชำระเงิน',        en: 'Payment',         ko: '결제',        icon: '💳' },
  { value: 'quantity',  th: 'จำนวนสินค้าไม่ครบ', en: 'Wrong Quantity',  ko: '수량 오류',   icon: '⚖️' },
  { value: 'wrong_item',th: 'สินค้าผิดรายการ',   en: 'Wrong Item',      ko: '잘못된 품목', icon: '❌' },
  { value: 'service',   th: 'การบริการ',           en: 'Service',         ko: '서비스',      icon: '🤝' },
  { value: 'other',     th: 'อื่นๆ',               en: 'Other',           ko: '기타',        icon: '📋' },
]
const PRIORITIES = [
  { value: 'high',   th: 'ด่วนมาก',  en: 'High',   ko: '긴급', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'medium', th: 'ปานกลาง', en: 'Medium', ko: '보통', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'low',    th: 'ต่ำ',       en: 'Low',    ko: '낮음', color: 'bg-green-100 text-green-700 border-green-200' },
]
const STATUSES = [
  { value: 'open',        th: 'เปิด',               en: 'Open',        ko: '접수',     icon: AlertCircle, color: 'bg-blue-100 text-blue-700' },
  { value: 'in_progress', th: 'กำลังดำเนินการ',     en: 'In Progress', ko: '처리 중',  icon: Clock,       color: 'bg-yellow-100 text-yellow-700' },
  { value: 'resolved',    th: 'แก้ไขแล้ว',           en: 'Resolved',    ko: '해결됨',   icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  { value: 'closed',      th: 'ปิด',                en: 'Closed',      ko: '종료',     icon: XCircle,     color: 'bg-gray-100 text-gray-600' },
]
const i18n = {
  th: { title:'รายงานปัญหา / ฟีดแบ็คลูกค้า', newFeedback:'+ บันทึกปัญหาใหม่', soSearch:'เลขที่ใบสั่งขาย', issueType:'ประเภทปัญหา', priority:'ความเร่งด่วน', desc:'รายละเอียดปัญหา', submit:'บันทึกปัญหา', cancel:'ยกเลิก', total:'รายการทั้งหมด', search:'ค้นหา SO / ลูกค้า...', so:'เลขที่ SO', customer:'ลูกค้า', issue:'ปัญหา', status:'สถานะ', resolution:'การแก้ไข', date:'วันที่', empty:'ไม่มีข้อมูล', resPlaceholder:'อธิบายการแก้ไข...', descPlaceholder:'อธิบายปัญหาโดยละเอียด...', success:'บันทึกสำเร็จ' },
  en: { title:'Issue Report / Customer Feedback', newFeedback:'+ New Issue', soSearch:'Sales Order No.', issueType:'Issue Type', priority:'Priority', desc:'Issue Description', submit:'Submit', cancel:'Cancel', total:'Total', search:'Search SO / customer...', so:'SO No.', customer:'Customer', issue:'Issue', status:'Status', resolution:'Resolution', date:'Date', empty:'No data', resPlaceholder:'Describe resolution...', descPlaceholder:'Describe the issue in detail...', success:'Saved' },
  ko: { title:'문제 보고 / 고객 피드백', newFeedback:'+ 새 문제 등록', soSearch:'판매 주문 번호', issueType:'문제 유형', priority:'우선순위', desc:'문제 설명', submit:'제출', cancel:'취소', total:'전체', search:'SO / 고객 검색...', so:'SO번호', customer:'고객', issue:'문제', status:'상태', resolution:'해결방법', date:'날짜', empty:'데이터 없음', resPlaceholder:'해결 방법 설명...', descPlaceholder:'문제를 자세히 설명하세요...', success:'저장됨' },
}
const fmt = n => parseFloat(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

export default function FeedbackPanel({ token, lang, deptColor }) {
  const t = i18n[lang] || i18n.th
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const [rows, setRows]         = useState([])
  const [salesOrders, setSalesOrders] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch]     = useState('')
  const [saving, setSaving]     = useState({})

  // form
  const [soId, setSoId]         = useState('')
  const [issueType, setIssueType] = useState('')
  const [priority, setPriority] = useState('medium')
  const [desc, setDesc]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg]           = useState('')

  useEffect(() => {
    Promise.all([
      apiFetch('/api/feedback',              { headers: h }).then(r => r.json()),
      apiFetch('/api/feedback/sales-orders', { headers: h }).then(r => r.json()),
    ]).then(([fb, so]) => {
      setRows(Array.isArray(fb) ? fb : [])
      setSalesOrders(Array.isArray(so) ? so : [])
    }).finally(() => setLoading(false))
  }, [token])

  const reload = () =>
    apiFetch('/api/feedback', { headers: h }).then(r => r.json()).then(d => setRows(Array.isArray(d) ? d : []))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!issueType || !desc) return
    setSubmitting(true)
    const so = salesOrders.find(s => s.id === parseInt(soId))
    const res = await apiFetch('/api/feedback', {
      method: 'POST', headers: h,
      body: JSON.stringify({ so_id: soId || null, so_no: so?.so_no, customer_name: so?.customer_name, issue_type: issueType, priority, description: desc }),
    })
    const data = await res.json()
    if (data.success) { setMsg(t.success); reload(); setShowForm(false); setSoId(''); setIssueType(''); setDesc(''); setPriority('medium'); setTimeout(() => setMsg(''), 3000) }
    setSubmitting(false)
  }

  const patchRow = async (id, body) => {
    setSaving(p => ({ ...p, [id]: true }))
    await apiFetch(`/api/feedback/${id}`, { method: 'PATCH', headers: h, body: JSON.stringify(body) })
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...body } : r))
    setSaving(p => ({ ...p, [id]: false }))
  }

  const filtered = rows.filter(r =>
    (r.so_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.customer_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const getStatus = v => STATUSES.find(s => s.value === v) || STATUSES[0]
  const getPriority = v => PRIORITIES.find(p => p.value === v) || PRIORITIES[1]
  const getIssue = v => ISSUE_TYPES.find(i => i.value === v)

  if (loading) return <p className="text-center py-10 text-gray-400">Loading...</p>

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">{t.title}</h3>
          {msg && <p className="text-green-600 text-xs mt-1 font-medium">{msg}</p>}
        </div>
        <div className="flex items-center gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 w-48" />
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{t.total}: {filtered.length}</span>
          <button onClick={() => setShowForm(p => !p)}
            className={`px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${deptColor} hover:opacity-90`}>
            {showForm ? t.cancel : t.newFeedback}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* เลือก SO */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">{t.soSearch}</label>
                <select value={soId} onChange={e => setSoId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value="">— เลือกใบสั่งขาย —</option>
                  {salesOrders.map(s => (
                    <option key={s.id} value={s.id}>{s.so_no} — {s.customer_name}</option>
                  ))}
                </select>
              </div>
              {/* ประเภทปัญหา */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">{t.issueType} *</label>
                <select value={issueType} onChange={e => setIssueType(e.target.value)} required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value="">— เลือกประเภท —</option>
                  {ISSUE_TYPES.map(i => <option key={i.value} value={i.value}>{i.icon} {i[lang] || i.th}</option>)}
                </select>
              </div>
              {/* ความเร่งด่วน */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">{t.priority}</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                      className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all ${priority === p.value ? p.color + ' border-current' : 'border-gray-200 text-gray-500'}`}>
                      {p[lang] || p.th}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">{t.desc} *</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} required rows={3}
                placeholder={t.descPlaceholder}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">{t.cancel}</button>
              <button type="submit" disabled={submitting || !issueType || !desc}
                className={`px-6 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${deptColor} hover:opacity-90 disabled:opacity-50`}>
                {submitting ? '...' : t.submit}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? <p className="text-center py-12 text-gray-400">{t.empty}</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-800 font-bold uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">{t.so}</th>
                  <th className="px-4 py-3 text-left">{t.customer}</th>
                  <th className="px-4 py-3 text-left">{t.issue}</th>
                  <th className="px-4 py-3 text-left">{t.priority}</th>
                  <th className="px-4 py-3 text-left min-w-[200px]">รายละเอียด</th>
                  <th className="px-4 py-3 text-left">{t.status}</th>
                  <th className="px-4 py-3 text-left min-w-[180px]">{t.resolution}</th>
                  <th className="px-4 py-3 text-left">{t.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(r => {
                  const st  = getStatus(r.status)
                  const pri = getPriority(r.priority)
                  const iss = getIssue(r.issue_type)
                  const StIcon = st.icon
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">{r.so_no || '—'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.customer_name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-gray-900">{iss?.icon} {iss?.[lang] || iss?.th || r.issue_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${pri.color}`}>{pri[lang] || pri.th}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">{r.description}</td>

                      {/* สถานะ — inline */}
                      <td className="px-4 py-3">
                        <select value={r.status} disabled={saving[r.id]}
                          onChange={e => patchRow(r.id, { status: e.target.value, resolution: r.resolution, resolved_by: 'admin' })}
                          className={`w-full text-xs font-semibold border rounded-lg px-2 py-1 focus:outline-none cursor-pointer disabled:opacity-50 ${st.color}`}>
                          {STATUSES.map(s => <option key={s.value} value={s.value}>{s[lang] || s.th}</option>)}
                        </select>
                      </td>

                      {/* การแก้ไข — inline */}
                      <td className="px-4 py-3">
                        <textarea rows={2} defaultValue={r.resolution || ''}
                          placeholder={t.resPlaceholder}
                          disabled={saving[r.id]}
                          onBlur={e => patchRow(r.id, { status: r.status, resolution: e.target.value, resolved_by: 'admin' })}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-900 resize-none focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:opacity-50 placeholder-gray-400"
                        />
                      </td>

                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
