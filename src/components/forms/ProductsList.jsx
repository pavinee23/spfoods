import { apiFetch } from '../../lib/api.js'
import { useEffect, useState } from 'react'
import { Eye, Printer, X } from 'lucide-react'

const i18n = {
  th: { title:'รายการสินค้า', code:'รหัส', name:'ชื่อสินค้า', unit:'หน่วย', cost:'ต้นทุน', sell:'ราคาขาย', stock:'สต๊อก', cat:'หมวด', empty:'ไม่มีข้อมูล', total:'รายการทั้งหมด' },
  en: { title:'Products List', code:'Code', name:'Product Name', unit:'Unit', cost:'Cost', sell:'Sell Price', stock:'Stock', cat:'Category', empty:'No data', total:'Total' },
  ko: { title:'제품 목록', code:'코드', name:'제품명', unit:'단위', cost:'원가', sell:'판매가', stock:'재고', cat:'분류', empty:'데이터 없음', total:'전체' },
}
const fmt = n => parseFloat(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

function PrintView({ row, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center print:bg-white print:inset-auto">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl print:shadow-none print:rounded-none print:p-4" id="print-area">
        <div className="flex justify-between items-start mb-6 print:hidden">
          <h3 className="font-bold text-lg text-gray-900">รายละเอียดสินค้า</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="space-y-3 text-sm">
          {[
            ['รหัสสินค้า', row.product_code],
            ['ชื่อสินค้า', row.product_name],
            ['หมวดหมู่', row.category_id || '—'],
            ['หน่วย', row.unit],
            ['ราคาต้นทุน', fmt(row.price_cost) + ' ฿'],
            ['ราคาขาย', fmt(row.price_sell) + ' ฿'],
            ['สต๊อกคงเหลือ', row.stock_qty],
            ['สต๊อกขั้นต่ำ', row.min_stock],
            ['รายละเอียด', row.description || '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-4 border-b border-gray-100 pb-2">
              <span className="text-gray-500 w-32 shrink-0">{k}</span>
              <span className="font-medium text-gray-900">{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3 print:hidden">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
            <Printer className="w-4 h-4" /> พิมพ์
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">ปิด</button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsList({ token, lang }) {
  const t = i18n[lang] || i18n.th
  const [rows, setRows]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView]   = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiFetch('/api/products', { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || 'โหลดรายการสินค้าไม่สำเร็จ')
        setRows(Array.isArray(d) ? d : [])
        setError('')
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'โหลดรายการสินค้าไม่สำเร็จ')
        setLoading(false)
      })
  }, [token])

  const filtered = rows.filter(r =>
    (r.product_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.product_code || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="text-center py-10 text-gray-500">Loading...</p>

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {view && <PrintView row={view} onClose={() => setView(null)} />}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{t.title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{t.total}: {filtered.length}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา..." className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 w-40" />
        </div>
      </div>
      {error ? <p className="text-center py-12 text-red-500">{error}</p> : filtered.length === 0 ? <p className="text-center py-12 text-gray-400">{t.empty}</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-800 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">{t.code}</th>
                <th className="px-4 py-3 text-left">{t.name}</th>
                <th className="px-4 py-3 text-left">{t.unit}</th>
                <th className="px-4 py-3 text-right">{t.cost}</th>
                <th className="px-4 py-3 text-right">{t.sell}</th>
                <th className="px-4 py-3 text-right">{t.stock}</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.product_code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.product_name}</td>
                  <td className="px-4 py-3 text-gray-700">{r.unit}</td>
                  <td className="px-4 py-3 text-right text-gray-800">{fmt(r.price_cost)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-blue-700">{fmt(r.price_sell)}</td>
                  <td className="px-4 py-3 text-right text-gray-800">{r.stock_qty}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setView(r)} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium">
                        <Eye className="w-3.5 h-3.5" /> วิว
                      </button>
                      <button onClick={() => { setView(r); setTimeout(window.print, 300) }} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                        <Printer className="w-3.5 h-3.5" /> ปริ้น
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
