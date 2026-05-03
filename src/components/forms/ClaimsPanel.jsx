import { apiFetch } from '../../lib/api.js'
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, RefreshCw, Search, X } from 'lucide-react';

const STATUS_COLORS = { pending:'text-gray-600 bg-gray-50 border-gray-200', investigating:'text-blue-600 bg-blue-50 border-blue-200', approved:'text-green-600 bg-green-50 border-green-200', rejected:'text-red-500 bg-red-50 border-red-200', completed:'text-purple-600 bg-purple-50 border-purple-200' };
const STATUS_LABELS = { pending:'รอดำเนินการ', investigating:'กำลังสอบสวน', approved:'อนุมัติ', rejected:'ปฏิเสธ', completed:'เสร็จสิ้น' };
const TYPE_LABELS = { claim:'เคลม', return:'คืนสินค้า' };

function today() { return new Date().toISOString().slice(0, 10); }

export default function ClaimsPanel({ token, lang = 'th', deptColor }) {
  const [rows, setRows]         = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState('');
  const [form, setForm] = useState({ customer_id:'', invoice_id:'', delivery_id:'', claim_date: today(), claim_type:'claim', reason:'', total_amount:'' });

  const load = async () => {
    setLoading(true);
    try {
      const [rC, rCust, rInv, rDN] = await Promise.all([
        apiFetch('/api/delivery/claims', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        apiFetch('/api/customers', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        apiFetch('/api/invoices', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        apiFetch('/api/delivery', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      if (Array.isArray(rC))    setRows(rC);
      if (Array.isArray(rCust)) setCustomers(rCust);
      if (Array.isArray(rInv))  setInvoices(rInv);
      if (Array.isArray(rDN))   setDeliveries(rDN);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const r = await apiFetch('/api/delivery/claims', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (d.success) { setShowForm(false); setForm({ customer_id:'', invoice_id:'', delivery_id:'', claim_date: today(), claim_type:'claim', reason:'', total_amount:'' }); load(); }
  };

  const updateStatus = async (id, status) => {
    await apiFetch(`/api/delivery/claims/${id}`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const filtered = rows.filter(r =>
    !search || r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.claim_no?.toLowerCase().includes(search.toLowerCase()) ||
    r.reason?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center gap-2 py-12 justify-center text-gray-400"><RefreshCw className="w-4 h-4 animate-spin" /> กำลังโหลด...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${deptColor} flex items-center justify-center`}>
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div><p className="text-xl font-bold">{rows.length}</p><p className="text-xs text-gray-500">เรื่องร้องเรียนทั้งหมด</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div><p className="text-xl font-bold text-orange-600">{rows.filter(r => r.status === 'pending' || r.status === 'investigating').length}</p><p className="text-xs text-gray-500">รอดำเนินการ</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-green-500" />
          </div>
          <div><p className="text-xl font-bold text-green-600">{rows.filter(r => r.status === 'completed' || r.status === 'approved').length}</p><p className="text-xs text-gray-500">แก้ไขแล้ว</p></div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเรื่องร้องเรียน..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-pink-400" />
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium ${showForm ? 'bg-gray-200 text-gray-700' : 'bg-gradient-to-r ' + deptColor + ' text-white shadow-sm'}`}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'ปิด' : 'เพิ่มเรื่องร้องเรียน'}
        </button>
        <button onClick={load} className="flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm text-gray-600 hover:bg-gray-50"><RefreshCw className="w-3.5 h-3.5" /></button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-gray-50 border rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-gray-800">บันทึกเรื่องร้องเรียน / คืนสินค้า</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500 mb-1 block">ลูกค้า *</label>
              <select required value={form.customer_id} onChange={e => setForm(p => ({...p, customer_id: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">-- เลือกลูกค้า --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">ประเภท</label>
              <select value={form.claim_type} onChange={e => setForm(p => ({...p, claim_type: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">ใบแจ้งหนี้อ้างอิง</label>
              <select value={form.invoice_id} onChange={e => setForm(p => ({...p, invoice_id: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">-- (ไม่มี) --</option>
                {invoices.map(i => <option key={i.id} value={i.id}>{i.invoice_no}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">วันที่</label>
              <input type="date" value={form.claim_date} onChange={e => setForm(p => ({...p, claim_date: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">สาเหตุ / รายละเอียด *</label>
              <input required value={form.reason} onChange={e => setForm(p => ({...p, reason: e.target.value}))} placeholder="อธิบายปัญหา"
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">มูลค่า (฿)</label>
              <input type="number" min="0" step="0.01" value={form.total_amount} onChange={e => setForm(p => ({...p, total_amount: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" className={`px-6 py-2 rounded-xl text-white text-sm font-medium bg-gradient-to-r ${deptColor} shadow-sm`}>บันทึก</button>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">เลขที่</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ลูกค้า</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ประเภท</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">สาเหตุ</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">สถานะ</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0
                ? <tr><td colSpan={5} className="text-center py-10 text-gray-400">ไม่พบข้อมูล</td></tr>
                : filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.claim_no}</td>
                    <td className="px-4 py-3 font-medium">{r.customer_name || r.cust_name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{TYPE_LABELS[r.claim_type] || r.claim_type}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">{r.reason}</td>
                    <td className="px-4 py-3 text-center">
                      <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)}
                        className={`text-xs border rounded-lg px-2 py-1 font-semibold focus:outline-none ${STATUS_COLORS[r.status]}`}>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
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
