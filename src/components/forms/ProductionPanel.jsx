import { apiFetch } from '../../lib/api.js'
import React, { useState, useEffect } from 'react';
import { Factory, Plus, RefreshCw, Search, X } from 'lucide-react';

const STATUS_COLORS = { pending:'text-gray-600 bg-gray-50 border-gray-200', in_progress:'text-blue-600 bg-blue-50 border-blue-200', completed:'text-green-600 bg-green-50 border-green-200', cancelled:'text-red-500 bg-red-50 border-red-200' };
const STATUS_LABELS = { pending:'รอดำเนินการ', in_progress:'กำลังผลิต', completed:'เสร็จแล้ว', cancelled:'ยกเลิก' };

function today() { return new Date().toISOString().slice(0, 10); }

export default function ProductionPanel({ token, lang = 'th', deptColor, deptId }) {
  const [rows, setRows]           = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [search, setSearch]       = useState('');
  const [form, setForm] = useState({ product_id:'', qty_ordered:'', production_date: today(), due_date:'', note:'' });

  const load = async () => {
    setLoading(true);
    try {
      const [rRows, rProd] = await Promise.all([
        apiFetch(`/api/production${deptId ? `?dept=${deptId}` : ''}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        apiFetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      if (Array.isArray(rRows)) setRows(rRows);
      if (Array.isArray(rProd)) setProducts(rProd);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const r = await apiFetch('/api/production', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, dept_id: deptId }),
    });
    const d = await r.json();
    if (d.success) { setShowForm(false); setForm({ product_id:'', qty_ordered:'', production_date: today(), due_date:'', note:'' }); load(); }
  };

  const updateStatus = async (id, status) => {
    await apiFetch(`/api/production/${id}`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const filtered = rows.filter(r =>
    !search || r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.order_no?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center gap-2 py-12 justify-center text-gray-400"><RefreshCw className="w-4 h-4 animate-spin" /> กำลังโหลด...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <div key={k} className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${STATUS_COLORS[k]?.split(' ')[1] || 'bg-gray-100'}`}>
              <Factory className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold">{rows.filter(r => r.status === k).length}</p>
              <p className="text-xs text-gray-500">{v}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาใบสั่งผลิต..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium ${showForm ? 'bg-gray-200 text-gray-700' : 'bg-gradient-to-r ' + deptColor + ' text-white shadow-sm'}`}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'ปิด' : 'สร้างใบสั่งผลิต'}
        </button>
        <button onClick={load} className="flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-gray-50 border rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-gray-800">สร้างใบสั่งผลิตใหม่</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500 mb-1 block">สินค้า *</label>
              <select required value={form.product_id} onChange={e => setForm(p => ({...p, product_id: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">-- เลือกสินค้า --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">จำนวน *</label>
              <input type="number" required min="1" value={form.qty_ordered} onChange={e => setForm(p => ({...p, qty_ordered: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">วันที่ผลิต</label>
              <input type="date" value={form.production_date} onChange={e => setForm(p => ({...p, production_date: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">กำหนดเสร็จ</label>
              <input type="date" value={form.due_date} onChange={e => setForm(p => ({...p, due_date: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">หมายเหตุ</label>
              <input value={form.note} onChange={e => setForm(p => ({...p, note: e.target.value}))}
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">สินค้า</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">จำนวนสั่ง</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ผลิตแล้ว</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">กำหนดเสร็จ</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">สถานะ</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0
                ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">ไม่พบข้อมูล</td></tr>
                : filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.order_no}</td>
                    <td className="px-4 py-3 font-medium">{r.product_name}<br /><span className="text-xs text-gray-400">{r.product_code}</span></td>
                    <td className="px-4 py-3 text-center font-bold">{r.qty_ordered}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-semibold">{r.qty_produced}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">{r.due_date?.slice(0, 10) || '—'}</td>
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
