import { apiFetch } from '../../lib/api.js'
import React, { useState, useEffect } from 'react';
import { Truck, Plus, RefreshCw, Search, X } from 'lucide-react';

const STATUS_COLORS = { pending:'text-gray-600 bg-gray-50 border-gray-200', in_transit:'text-blue-600 bg-blue-50 border-blue-200', delivered:'text-green-600 bg-green-50 border-green-200', failed:'text-red-500 bg-red-50 border-red-200' };
const STATUS_LABELS = { pending:'รอจัดส่ง', in_transit:'กำลังส่ง', delivered:'ส่งแล้ว', failed:'ส่งไม่สำเร็จ' };

function today() { return new Date().toISOString().slice(0, 10); }

export default function DeliveryPanel({ token, lang = 'th', deptColor }) {
  const [rows, setRows]         = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState('');
  const [form, setForm] = useState({ customer_id:'', invoice_id:'', delivery_address:'', delivery_date: today(), driver_name:'', vehicle_no:'', note:'', items:[{ product_name:'', unit:'กล่อง', qty:1 }] });

  const load = async () => {
    setLoading(true);
    try {
      const [rDN, rCust, rInv, rProd] = await Promise.all([
        apiFetch('/api/delivery', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        apiFetch('/api/customers', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        apiFetch('/api/invoices', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        apiFetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      if (Array.isArray(rDN))   setRows(rDN);
      if (Array.isArray(rCust)) setCustomers(rCust);
      if (Array.isArray(rInv))  setInvoices(rInv);
      if (Array.isArray(rProd)) setProducts(rProd);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { product_name:'', unit:'กล่อง', qty:1 }] }));
  const removeItem = (i) => setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const setItem = (i, k, v) => setForm(p => {
    const items = [...p.items]; items[i] = { ...items[i], [k]: v }; return { ...p, items };
  });

  const submit = async (e) => {
    e.preventDefault();
    const r = await apiFetch('/api/delivery', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (d.success) { setShowForm(false); setForm({ customer_id:'', invoice_id:'', delivery_address:'', delivery_date: today(), driver_name:'', vehicle_no:'', note:'', items:[{ product_name:'', unit:'กล่อง', qty:1 }] }); load(); }
  };

  const updateStatus = async (id, status) => {
    await apiFetch(`/api/delivery/${id}`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const filtered = rows.filter(r =>
    !search || r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.delivery_no?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center gap-2 py-12 justify-center text-gray-400"><RefreshCw className="w-4 h-4 animate-spin" /> กำลังโหลด...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <div key={k} className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${STATUS_COLORS[k]?.split(' ')[1] || 'bg-gray-100'}`}>
              <Truck className="w-4 h-4" />
            </div>
            <div><p className="text-lg font-bold">{rows.filter(r => r.status === k).length}</p><p className="text-xs text-gray-500">{v}</p></div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาใบส่งสินค้า..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-purple-400" />
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium ${showForm ? 'bg-gray-200 text-gray-700' : 'bg-gradient-to-r ' + deptColor + ' text-white shadow-sm'}`}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'ปิด' : 'สร้างใบส่งสินค้า'}
        </button>
        <button onClick={load} className="flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm text-gray-600 hover:bg-gray-50"><RefreshCw className="w-3.5 h-3.5" /></button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-gray-50 border rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-gray-800">สร้างใบส่งสินค้าใหม่</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500 mb-1 block">ลูกค้า *</label>
              <select required value={form.customer_id} onChange={e => setForm(p => ({...p, customer_id: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">-- เลือกลูกค้า --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">ใบแจ้งหนี้อ้างอิง</label>
              <select value={form.invoice_id} onChange={e => setForm(p => ({...p, invoice_id: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">-- (ไม่มี) --</option>
                {invoices.map(i => <option key={i.id} value={i.id}>{i.invoice_no}</option>)}
              </select>
            </div>
            <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">ที่อยู่จัดส่ง</label>
              <input value={form.delivery_address} onChange={e => setForm(p => ({...p, delivery_address: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ที่อยู่จัดส่ง" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">วันที่จัดส่ง</label>
              <input type="date" value={form.delivery_date} onChange={e => setForm(p => ({...p, delivery_date: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">คนขับ</label>
              <input value={form.driver_name} onChange={e => setForm(p => ({...p, driver_name: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">ทะเบียนรถ</label>
              <input value={form.vehicle_no} onChange={e => setForm(p => ({...p, vehicle_no: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 font-semibold uppercase">รายการสินค้า</label>
              <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:underline">+ เพิ่มรายการ</button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={item.product_name} onChange={e => setItem(i, 'product_name', e.target.value)} placeholder="ชื่อสินค้า"
                  className="flex-1 border rounded-lg px-3 py-1.5 text-sm" />
                <input value={item.unit} onChange={e => setItem(i, 'unit', e.target.value)} placeholder="หน่วย"
                  className="w-20 border rounded-lg px-3 py-1.5 text-sm" />
                <input type="number" min="1" value={item.qty} onChange={e => setItem(i, 'qty', e.target.value)} placeholder="จำนวน"
                  className="w-20 border rounded-lg px-3 py-1.5 text-sm" />
                {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>}
              </div>
            ))}
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
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">วันที่จัดส่ง</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">คนขับ</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">สถานะ</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0
                ? <tr><td colSpan={5} className="text-center py-10 text-gray-400">ไม่พบข้อมูล</td></tr>
                : filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.delivery_no}</td>
                    <td className="px-4 py-3 font-medium">{r.customer_name || r.cust_name}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">{r.delivery_date?.slice(0, 10) || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.driver_name || '—'}</td>
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
