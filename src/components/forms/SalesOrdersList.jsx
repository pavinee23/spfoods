import { apiFetch } from '../../lib/api.js'
import { useEffect, useState } from 'react'
import { Eye, Printer, X } from 'lucide-react'

const i18n = {
  th: {
    title:'รายการใบสั่งขาย', soNo:'เลขที่', customer:'ลูกค้า', date:'วันที่', due:'กำหนดส่ง', total:'ยอดรวม', status:'สถานะ', empty:'ไม่มีข้อมูล', count:'รายการทั้งหมด',
    action:'การทำงาน', view:'วิว', print:'ปริ้น', close:'ปิด', note:'หมายเหตุ',
    search:'ค้นหา SO / ลูกค้า...',
    printTitle:'ใบสั่งขาย', printSubTitle:'ใบสั่งขาย / Sales Order',
    address:'ที่อยู่', taxId:'เลขภาษี', product:'สินค้า', unit:'หน่วย', qty:'จำนวน', price:'ราคา', amount:'รวม', subtotal:'ยอดรวม', grandTotal:'ยอดรวมสุทธิ',
  },
  en: {
    title:'Sales Orders List', soNo:'SO No.', customer:'Customer', date:'Date', due:'Due Date', total:'Total', status:'Status', empty:'No data', count:'Total',
    action:'Action', view:'View', print:'Print', close:'Close', note:'Note',
    search:'Search SO / customer...',
    printTitle:'Sales Order', printSubTitle:'Sales Order',
    address:'Address', taxId:'Tax ID', product:'Product', unit:'Unit', qty:'Qty', price:'Price', amount:'Amount', subtotal:'Subtotal', grandTotal:'Grand Total',
  },
  ko: {
    title:'판매 주문 목록', soNo:'주문번호', customer:'고객', date:'날짜', due:'납기일', total:'합계', status:'상태', empty:'데이터 없음', count:'전체',
    action:'작업', view:'보기', print:'인쇄', close:'닫기', note:'메모',
    search:'SO / 고객 검색...',
    printTitle:'판매 주문서', printSubTitle:'판매 주문서 / Sales Order',
    address:'주소', taxId:'사업자번호', product:'제품', unit:'단위', qty:'수량', price:'단가', amount:'금액', subtotal:'소계', grandTotal:'합계',
  },
}

const STATUS_COLOR = {
  draft:     'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}
const STATUS_LABELS = {
  th: { draft:'ร่าง', confirmed:'ยืนยันแล้ว', delivered:'ส่งแล้ว', cancelled:'ยกเลิก' },
  en: { draft:'Draft', confirmed:'Confirmed', delivered:'Delivered', cancelled:'Cancelled' },
  ko: { draft:'임시', confirmed:'확정', delivered:'배송완료', cancelled:'취소' },
}
const fmt = n => parseFloat(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

const DATE_LOCALE = { th: 'th-TH', en: 'en-US', ko: 'ko-KR' }

function PrintView({ row, items, onClose, t, lang }) {
  const dateLocale = DATE_LOCALE[lang] || 'th-TH'
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" id="print-area">
        <div className="sticky top-0 z-10 -mx-3 px-3 py-2 bg-white/95 backdrop-blur border-b border-gray-100 mb-4 print:hidden">
          <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900">{t.printTitle}</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                <Printer className="w-3.5 h-3.5" /> {t.print}
              </button>
              <button onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50">
                <X className="w-3.5 h-3.5" /> {t.close}
              </button>
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo.jpg" alt="SP FOODS logo" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
            <p className="font-bold text-xl text-gray-900">SP FOODS CO., LTD.</p>
          </div>
          <p className="text-gray-600 text-sm">{t.printSubTitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p><span className="text-gray-500">{t.soNo}:</span> <span className="font-bold text-gray-900">{row.so_no}</span></p>
            <p><span className="text-gray-500">{t.date}:</span> <span className="text-gray-900">{row.so_date ? new Date(row.so_date).toLocaleDateString(dateLocale) : '—'}</span></p>
            <p><span className="text-gray-500">{t.due}:</span> <span className="text-gray-900">{row.due_date ? new Date(row.due_date).toLocaleDateString(dateLocale) : '—'}</span></p>
          </div>
          <div>
            <p><span className="text-gray-500">{t.customer}:</span> <span className="font-medium text-gray-900">{row.customer_name}</span></p>
            <p><span className="text-gray-500">{t.address}:</span> <span className="text-gray-900">{row.customer_address || '—'}</span></p>
            <p><span className="text-gray-500">{t.taxId}:</span> <span className="text-gray-900">{row.customer_tax_id || '—'}</span></p>
          </div>
        </div>
        {/* Items */}
        <table className="w-full text-sm mb-6 border border-gray-200 rounded-xl overflow-hidden">
          <thead className="bg-gray-100 text-gray-800 font-bold">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">{t.product}</th>
              <th className="px-3 py-2 text-center">{t.unit}</th>
              <th className="px-3 py-2 text-right">{t.qty}</th>
              <th className="px-3 py-2 text-right">{t.price}</th>
              <th className="px-3 py-2 text-right">{t.amount}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((it, i) => (
              <tr key={i}>
                <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                <td className="px-3 py-2 text-gray-900">{it.product_name}</td>
                <td className="px-3 py-2 text-center text-gray-700">{it.unit}</td>
                <td className="px-3 py-2 text-right text-gray-900">{it.qty}</td>
                <td className="px-3 py-2 text-right text-gray-900">{fmt(it.price_unit)}</td>
                <td className="px-3 py-2 text-right font-semibold text-gray-900">{fmt(it.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-gray-700"><span>{t.subtotal}</span><span>{fmt(row.subtotal)}</span></div>
            <div className="flex justify-between text-gray-700"><span>VAT 7%</span><span>{fmt(row.vat_amount)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-300 pt-2 text-base"><span>{t.grandTotal}</span><span className="text-blue-700">{fmt(row.total_amount)} ฿</span></div>
          </div>
        </div>
        {row.note && <p className="mt-4 text-sm text-gray-600"><span className="font-medium">{t.note}:</span> {row.note}</p>}
      </div>
    </div>
  )
}

export default function SalesOrdersList({ token, lang }) {
  const t = i18n[lang] || i18n.th
  const [rows, setRows]   = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView]   = useState(null)
  const [viewItems, setViewItems] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiFetch('/api/sales-orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const openView = async row => {
    const res = await apiFetch(`/api/sales-orders/${row.id}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setViewItems(data.items || [])
    setView(row)
  }

  const openPrint = async row => {
    await openView(row)
    setTimeout(window.print, 400)
  }

  const filtered = rows.filter(r =>
    (r.so_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.customer_name || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="text-center py-10 text-gray-500">Loading...</p>

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {view && <PrintView row={view} items={viewItems} onClose={() => setView(null)} t={t} lang={lang} />}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{t.title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{t.count}: {filtered.length}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 w-44" />
        </div>
      </div>
      {filtered.length === 0 ? <p className="text-center py-12 text-gray-400">{t.empty}</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-800 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">{t.soNo}</th>
                <th className="px-4 py-3 text-left">{t.customer}</th>
                <th className="px-4 py-3 text-left">{t.date}</th>
                <th className="px-4 py-3 text-left">{t.due}</th>
                <th className="px-4 py-3 text-right">{t.total}</th>
                <th className="px-4 py-3 text-center">{t.status}</th>
                <th className="px-4 py-3 text-center">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{r.so_no}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.customer_name}</td>
                  <td className="px-4 py-3 text-gray-700">{r.so_date ? new Date(r.so_date).toLocaleDateString(DATE_LOCALE[lang] || 'th-TH') : '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{r.due_date ? new Date(r.due_date).toLocaleDateString(DATE_LOCALE[lang] || 'th-TH') : '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(r.total_amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLOR[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {(STATUS_LABELS[lang] || STATUS_LABELS.th)[r.status] || r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openView(r)} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium">
                        <Eye className="w-3.5 h-3.5" /> {t.view}
                      </button>
                      <button onClick={() => openPrint(r)} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                        <Printer className="w-3.5 h-3.5" /> {t.print}
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
