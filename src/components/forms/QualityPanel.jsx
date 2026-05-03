import { apiFetch } from '../../lib/api.js'
import React, { useState, useEffect } from 'react';
import { FlaskConical, Plus, RefreshCw, Search, X, CheckCircle, AlertTriangle } from 'lucide-react';

const RESULT_COLORS = { passed:'text-green-600 bg-green-50 border-green-200', failed:'text-red-600 bg-red-50 border-red-200', conditional:'text-orange-600 bg-orange-50 border-orange-200' };
const RESULT_LABELS = { passed:'ผ่าน', failed:'ไม่ผ่าน', conditional:'ผ่านมีเงื่อนไข' };

function today() { return new Date().toISOString().slice(0, 10); }

export default function QualityPanel({ token, lang = 'th', deptColor }) {
  const [rows, setRows]           = useState([]);
  const [products, setProducts]   = useState([]);
  const [prodOrders, setProdOrders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [search, setSearch]       = useState('');
  const [form, setForm] = useState({ production_order_id:'', product_id:'', check_date: today(), qty_checked:'', qty_passed:'', qty_failed:'', result:'passed', note:'' });

  const load = async () => {
    setLoading(true);
    try {
      const [rQC, rProd, rOrders] = await Promise.all([
        apiFetch('/api/quality', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        apiFetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        apiFetch('/api/production', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      if (Array.isArray(rQC)) setRows(rQC);
      if (Array.isArray(rProd)) setProducts(rProd);
      if (Array.isArray(rOrders)) setProdOrders(rOrders);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const setF = (k, v) => setForm(p => {
    const next = { ...p, [k]: v };
    if (k === 'qty_checked' || k === 'qty_passed') {
      const checked = Number(k === 'qty_checked' ? v : next.qty_checked) || 0;
      const passed  = Number(k === 'qty_passed'  ? v : next.qty_passed)  || 0;
      next.qty_failed = Math.max(0, checked - passed);
      next.result = next.qty_failed === 0 ? 'passed' : (next.qty_failed < checked ? 'conditional' : 'failed');
    }
    return next;
  });

  const submit = async (e) => {
    e.preventDefault();
    const r = await apiFetch('/api/quality', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (d.success) { setShowForm(false); setForm({ production_order_id:'', product_id:'', check_date: today(), qty_checked:'', qty_passed:'', qty_failed:'', result:'passed', note:'' }); load(); }
  };

  const filtered = rows.filter(r =>
    !search || r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.check_no?.toLowerCase().includes(search.toLowerCase())
  );

  const passed = rows.filter(r => r.result === 'passed').length;
  const failed = rows.filter(r => r.result === 'failed').length;

  if (loading) return <div className="flex items-center gap-2 py-12 justify-center text-gray-400"><RefreshCw className="w-4 h-4 animate-spin" /> กำลังโหลด...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${deptColor} flex items-center justify-center`}>
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div><p className="text-xl font-bold">{rows.length}</p><p className="text-xs text-gray-500">ตรวจสอบทั้งหมด</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div><p className="text-xl font-bold text-green-600">{passed}</p><p className="text-xs text-gray-500">ผ่านการตรวจ</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div><p className="text-xl font-bold text-red-600">{failed}</p><p className="text-xs text-gray-500">ไม่ผ่านการตรวจ</p></div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-cyan-400" />
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium ${showForm ? 'bg-gray-200 text-gray-700' : 'bg-gradient-to-r ' + deptColor + ' text-white shadow-sm'}`}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'ปิด' : 'บันทึกการตรวจ'}
        </button>
        <button onClick={load} className="flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm text-gray-600 hover:bg-gray-50"><RefreshCw className="w-3.5 h-3.5" /></button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-gray-50 border rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-gray-800">บันทึกผลตรวจสอบคุณภาพ</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500 mb-1 block">ใบสั่งผลิต</label>
              <select value={form.production_order_id} onChange={e => setF('production_order_id', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">-- (ไม่มี) --</option>
                {prodOrders.map(o => <option key={o.id} value={o.id}>{o.order_no} — {o.product_name}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">สินค้า *</label>
              <select required value={form.product_id} onChange={e => setF('product_id', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">-- เลือกสินค้า --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">วันที่ตรวจ</label>
              <input type="date" value={form.check_date} onChange={e => setF('check_date', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">จำนวนที่ตรวจ *</label>
              <input type="number" required min="1" value={form.qty_checked} onChange={e => setF('qty_checked', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">ผ่าน</label>
              <input type="number" min="0" value={form.qty_passed} onChange={e => setF('qty_passed', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">ไม่ผ่าน (คำนวณอัตโนมัติ)</label>
              <input readOnly value={form.qty_failed} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-red-600 font-semibold" />
            </div>
            <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">หมายเหตุ</label>
              <input value={form.note} onChange={e => setF('note', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${RESULT_COLORS[form.result]}`}>{RESULT_LABELS[form.result]}</span>
            <button type="submit" className={`px-6 py-2 rounded-xl text-white text-sm font-medium bg-gradient-to-r ${deptColor} shadow-sm`}>บันทึก</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">เลขที่</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">สินค้า</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ตรวจ</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ผ่าน</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ไม่ผ่าน</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ผล</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0
                ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">ไม่พบข้อมูล</td></tr>
                : filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.check_no}</td>
                    <td className="px-4 py-3 font-medium">{r.product_name}</td>
                    <td className="px-4 py-3 text-center font-bold">{r.qty_checked}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-semibold">{r.qty_passed}</td>
                    <td className="px-4 py-3 text-center text-red-600 font-semibold">{r.qty_failed}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${RESULT_COLORS[r.result]}`}>
                        {RESULT_LABELS[r.result]}
                      </span>
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
