import { apiFetch } from '../../lib/api.js'
import React, { useState, useEffect } from 'react';
import { FileText, Plus, RefreshCw, Search, X } from 'lucide-react';

const STATUS_COLORS = {
  draft:     'text-gray-600 bg-gray-50 border-gray-200',
  sent:      'text-blue-600 bg-blue-50 border-blue-200',
  partial:   'text-orange-600 bg-orange-50 border-orange-200',
  paid:      'text-green-600 bg-green-50 border-green-200',
  overdue:   'text-red-600 bg-red-50 border-red-200',
  cancelled: 'text-gray-400 bg-gray-50 border-gray-100',
};
const STATUS_LABELS = { draft:'ร่าง', sent:'ส่งแล้ว', partial:'ชำระบางส่วน', paid:'ชำระแล้ว', overdue:'เกินกำหนด', cancelled:'ยกเลิก' };

function today() { return new Date().toISOString().slice(0, 10); }

export default function InvoicePanel({ token, lang = 'th', deptColor, variant = 'invoice' }) {
  const isTax = variant === 'tax';
  const isCN  = variant === 'credit';
  const endpoint = isTax ? '/api/invoices/tax' : isCN ? '/api/invoices/credit-notes' : '/api/invoices';

  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState('');
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices]   = useState([]);
  const [form, setForm] = useState({
    customer_id: '', invoice_id: '', invoice_date: today(), due_date: today(),
    issue_date: today(), total_amount: '', vat_amount: '', net_amount: '',
    vat_rate: 7, reason: '', note: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [rRows, rCust, rInv] = await Promise.all([
        fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        apiFetch('/api/customers', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        isTax || isCN
          ? apiFetch('/api/invoices', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
          : Promise.resolve([]),
      ]);
      if (Array.isArray(rRows)) setRows(rRows);
      if (Array.isArray(rCust)) setCustomers(rCust);
      if (Array.isArray(rInv))  setInvoices(rInv);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [variant]);

  const setF = (k, v) => setForm(p => {
    const next = { ...p, [k]: v };
    if (k === 'total_amount' || k === 'vat_rate') {
      const base = Number(next.total_amount) || 0;
      const vat  = Math.round(base * (Number(next.vat_rate) || 7)) / 100;
      next.vat_amount = vat;
      next.net_amount = base + vat;
    }
    return next;
  });

  const submit = async (e) => {
    e.preventDefault();
    const body = isTax
      ? { customer_id: form.customer_id, invoice_id: form.invoice_id || null, issue_date: form.issue_date,
          total_amount: form.total_amount, vat_rate: form.vat_rate, vat_amount: form.vat_amount, net_amount: form.net_amount, note: form.note }
      : isCN
      ? { customer_id: form.customer_id, invoice_id: form.invoice_id || null, issue_date: form.issue_date,
          reason: form.reason, total_amount: form.total_amount, vat_amount: form.vat_amount, net_amount: form.net_amount }
      : { customer_id: form.customer_id, invoice_date: form.invoice_date, due_date: form.due_date,
          total_amount: form.total_amount, vat_amount: form.vat_amount, net_amount: form.net_amount, note: form.note };
    const r = await fetch(endpoint, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (d.success) { setShowForm(false); load(); }
  };

  const updateStatus = async (id, status) => {
    await apiFetch(`/api/invoices/${id}`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const filtered = rows.filter(r =>
    !search || r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    (r.invoice_no || r.tax_invoice_no || r.credit_note_no || '').toLowerCase().includes(search.toLowerCase())
  );

  const docLabel = isTax ? 'ใบกำกับภาษี' : isCN ? 'ใบลดหนี้' : 'ใบแจ้งหนี้';
  const docNoField = isTax ? 'tax_invoice_no' : isCN ? 'credit_note_no' : 'invoice_no';
  const totalNet = rows.reduce((s, r) => s + Number(r.net_amount || 0), 0);

  if (loading) return <div className="flex items-center gap-2 py-12 justify-center text-gray-400"><RefreshCw className="w-4 h-4 animate-spin" /> กำลังโหลด...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${deptColor} flex items-center justify-center`}>
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div><p className="text-xl font-bold">{rows.length}</p><p className="text-xs text-gray-500">{docLabel}ทั้งหมด</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-green-600">{rows.filter(r => r.status === 'paid').length}</p>
            <p className="text-xs text-gray-500">ชำระแล้ว</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div><p className="text-lg font-bold text-blue-600">฿{totalNet.toLocaleString()}</p><p className="text-xs text-gray-500">มูลค่ารวม</p></div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`ค้นหา${docLabel}...`}
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-blue-400" />
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${showForm ? 'bg-gray-200 text-gray-700' : 'bg-gradient-to-r ' + deptColor + ' text-white shadow-sm'}`}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'ปิด' : `สร้าง${docLabel}`}
        </button>
        <button onClick={load} className="flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-gray-50 border rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-gray-800">สร้าง{docLabel}ใหม่</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">ลูกค้า *</label>
              <select required value={form.customer_id} onChange={e => setF('customer_id', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                <option value="">-- เลือกลูกค้า --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
              </select>
            </div>
            {(isTax || isCN) && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">อ้างอิงใบแจ้งหนี้</label>
                <select value={form.invoice_id} onChange={e => setF('invoice_id', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                  <option value="">-- (ไม่มี) --</option>
                  {invoices.map(i => <option key={i.id} value={i.id}>{i.invoice_no}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{isTax || isCN ? 'วันที่ออก' : 'วันที่ใบแจ้งหนี้'} *</label>
              <input type="date" required value={isTax || isCN ? form.issue_date : form.invoice_date}
                onChange={e => setF(isTax || isCN ? 'issue_date' : 'invoice_date', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            {!isTax && !isCN && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">วันครบกำหนด *</label>
                <input type="date" required value={form.due_date} onChange={e => setF('due_date', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            )}
            {isCN && (
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">เหตุผล *</label>
                <input required value={form.reason} onChange={e => setF('reason', e.target.value)} placeholder="ระบุเหตุผล"
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">ยอดก่อน VAT (฿) *</label>
              <input type="number" required min="0" step="0.01" value={form.total_amount}
                onChange={e => setF('total_amount', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">VAT ({isTax ? form.vat_rate : 7}%)</label>
              <input type="number" readOnly value={form.vat_amount}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">ยอดสุทธิ (฿)</label>
              <input type="number" readOnly value={form.net_amount}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">หมายเหตุ</label>
              <input value={form.note} onChange={e => setF('note', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" className={`px-6 py-2 rounded-xl text-white text-sm font-medium bg-gradient-to-r ${deptColor} shadow-sm`}>
            บันทึก{docLabel}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">เลขที่</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ลูกค้า</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">วันที่</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ยอดสุทธิ</th>
              {!isTax && !isCN && <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">สถานะ</th>}
              {!isTax && !isCN && <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">อัพเดต</th>}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0
                ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">ไม่พบข้อมูล</td></tr>
                : filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{r[docNoField]}</td>
                    <td className="px-4 py-3 font-medium">{r.customer_name || r.cust_name}</td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                      {(r.invoice_date || r.issue_date || r.created_at || '').slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-center font-bold">฿{Number(r.net_amount).toLocaleString()}</td>
                    {!isTax && !isCN && (
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[r.status] || STATUS_COLORS.draft}`}>
                          {STATUS_LABELS[r.status] || r.status}
                        </span>
                      </td>
                    )}
                    {!isTax && !isCN && (
                      <td className="px-4 py-3 text-center">
                        <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)}
                          className="text-xs border rounded-lg px-2 py-1 focus:outline-none">
                          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                    )}
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && <div className="px-4 py-2 border-t text-xs text-gray-400">{filtered.length} รายการ</div>}
      </div>
    </div>
  );
}
