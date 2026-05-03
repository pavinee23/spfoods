import { apiFetch } from '../../lib/api.js'
import { useEffect, useRef, useState } from 'react'

const PURPOSE_I18N = {
  income:      { th: 'สนใจหารายได้เสริม',        en: 'Extra Income Interest',     ko: '부업 관심',         icon: '💰' },
  partner:     { th: 'สนใจร่วมเป็นคู่ค้า',       en: 'Business Partner Interest', ko: '파트너 관심',       icon: '🤝' },
  buy:         { th: 'สนใจซื้อสินค้า',            en: 'Purchase Interest',         ko: '구매 관심',         icon: '🛒' },
  distributor: { th: 'สนใจเป็นตัวแทนจำหน่าย',   en: 'Distributor Interest',      ko: '유통업자 관심',     icon: '🏪' },
  other:       { th: 'ติดต่อเรื่องอื่นๆ ทั่วไป', en: 'General Inquiry',           ko: '일반 문의',         icon: '📋' },
}

const STATUS_I18N = [
  { value: 'new',         th: 'ใหม่',                   en: 'New',          ko: '신규',       color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted',   th: 'ติดต่อกลับแล้ว',         en: 'Contacted',    ko: '연락 완료',  color: 'bg-green-100 text-green-800' },
  { value: 'in_progress', th: 'อยู่ระหว่างดำเนินการ',  en: 'In Progress',  ko: '진행 중',    color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ordered',     th: 'สั่งซื้อแล้ว',           en: 'Ordered',      ko: '주문 완료',  color: 'bg-purple-100 text-purple-800' },
  { value: 'closed',      th: 'ปิดการติดต่อ',            en: 'Closed',       ko: '종료',       color: 'bg-gray-200 text-gray-700' },
]

const labels = {
  th: { title: 'รายงานผู้ติดต่อลงทะเบียน', name: 'ชื่อ', email: 'อีเมล', phone: 'โทรศัพท์', company: 'บริษัท', address: 'ที่อยู่', purpose: 'จุดประสงค์', date: 'วันที่', status: 'สถานะ', updated: 'อัปเดต', note: 'หมายเหตุ', loading: 'กำลังโหลด...', empty: 'ไม่มีข้อมูล', error: 'โหลดข้อมูลไม่สำเร็จ', total: 'รายการทั้งหมด', notePlaceholder: 'บันทึกการติดต่อ...' },
  en: { title: 'Registration Contact Report', name: 'Name', email: 'Email', phone: 'Phone', company: 'Company', address: 'Address', purpose: 'Purpose', date: 'Date', status: 'Status', updated: 'Updated', note: 'Note', loading: 'Loading...', empty: 'No data', error: 'Failed to load', total: 'Total records', notePlaceholder: 'Write contact note...' },
  ko: { title: '등록 연락처 보고서', name: '이름', email: '이메일', phone: '전화번호', company: '회사', address: '주소', purpose: '목적', date: '날짜', status: '상태', updated: '업데이트', note: '메모', loading: '로딩 중...', empty: '데이터 없음', error: '로드 실패', total: '전체 기록', notePlaceholder: '연락 메모 작성...' },
  // address already in labels above
}


export default function RegistrationsReport({ token, lang }) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [editNote, setEditNote] = useState({})   // { [id]: string }
  const [saving, setSaving]   = useState({})     // { [id]: bool }
  const debounceRef = useRef({})                 // { [id]: timeoutId }
  const t = labels[lang] || labels.th
  const statusOptions = STATUS_I18N.map(s => ({ ...s, label: s[lang] || s.th }))

  useEffect(() => {
    apiFetch('/api/registrations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setRows(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setError(t.error); setLoading(false) })
  }, [token])

  const patch = async (id, body) => {
    setSaving(p => ({ ...p, [id]: true }))
    const res = await apiFetch(`/api/registrations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setRows(prev => prev.map(r => r.id === id ? { ...r, ...body, status_updated_at: new Date().toISOString() } : r))
    }
    setSaving(p => ({ ...p, [id]: false }))
  }

  const handleStatusChange = (id, value) => patch(id, { status: value })

  const handleNoteChange = (id, value) => {
    setEditNote(p => ({ ...p, [id]: value }))
    clearTimeout(debounceRef.current[id])
    debounceRef.current[id] = setTimeout(() => patch(id, { note: value }), 1000)
  }

  if (loading) return <p className="text-center text-gray-500 py-10">{t.loading}</p>
  if (error)   return <p className="text-center text-red-500 py-10">{error}</p>

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{t.title}</h3>
        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">{t.total}: {rows.length}</span>
      </div>

      {rows.length === 0 ? (
        <p className="text-center text-gray-500 py-12">{t.empty}</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs table-auto">
            <thead className="bg-gray-100 text-black text-xs uppercase font-bold">
              <tr>
                <th className="px-3 py-3 text-left w-10">#</th>
                <th className="px-3 py-3 text-left min-w-[100px]">{t.name}</th>
                <th className="px-3 py-3 text-left min-w-[160px]">{t.email}</th>
                <th className="px-3 py-3 text-left min-w-[110px]">{t.phone}</th>
                <th className="px-3 py-3 text-left min-w-[100px]">{t.company}</th>
                <th className="px-3 py-3 text-left min-w-[130px]">{t.address}</th>
                <th className="px-3 py-3 text-left min-w-[160px]">{t.purpose}</th>
                <th className="px-3 py-3 text-left min-w-[140px]">{t.status}</th>
                <th className="px-3 py-3 text-left min-w-[120px]">{t.updated}</th>
                <th className="px-3 py-3 text-left min-w-[180px]">{t.note}</th>
                <th className="px-3 py-3 text-left min-w-[90px]">{t.date}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((r, i) => {
                const pData = PURPOSE_I18N[r.purpose]
                const p = pData ? { icon: pData.icon, label: pData[lang] || pData.th } : null
                const noteVal = editNote[r.id] !== undefined ? editNote[r.id] : (r.note || '')
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors align-top">
                    <td className="px-3 py-3 text-black font-medium">{i + 1}</td>
                    <td className="px-3 py-3 font-semibold text-black whitespace-nowrap">{r.name}</td>
                    <td className="px-3 py-3 text-black whitespace-nowrap">{r.email}</td>
                    <td className="px-3 py-3 text-black whitespace-nowrap">{r.phone}</td>
                    <td className="px-3 py-3 text-black whitespace-nowrap">{r.company || '—'}</td>
                    <td className="px-3 py-3 text-black">{r.address || '—'}</td>
                    <td className="px-2 py-3">
                      {p
                        ? <span className="inline-flex items-center gap-1 bg-green-100 text-green-900 text-xs font-medium px-1.5 py-0.5 rounded-full truncate">{p.icon} {p.label}</span>
                        : <span className="text-black text-xs">{r.purpose}</span>
                      }
                    </td>

                    {/* สถานะ — inline select */}
                    <td className="px-3 py-3">
                      <select
                        value={r.status || 'new'}
                        onChange={e => handleStatusChange(r.id, e.target.value)}
                        disabled={saving[r.id]}
                        className="w-full text-xs font-semibold border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-black cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                      >
                        {statusOptions.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* วันที่อัปเดตสถานะ */}
                    <td className="px-3 py-3 text-black text-xs whitespace-nowrap">
                      {r.status_updated_at
                        ? new Date(r.status_updated_at).toLocaleDateString('th-TH') + ' ' +
                          new Date(r.status_updated_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>

                    {/* หมายเหตุ — inline textarea */}
                    <td className="px-3 py-3">
                      <textarea
                        rows={2}
                        value={noteVal}
                        placeholder={t.notePlaceholder}
                        onChange={e => handleNoteChange(r.id, e.target.value)}
                        disabled={saving[r.id]}
                        className="w-full text-xs text-black border border-gray-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 placeholder-gray-400"
                      />
                    </td>

                    <td className="px-3 py-3 text-black text-xs font-medium whitespace-nowrap">
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
  )
}
