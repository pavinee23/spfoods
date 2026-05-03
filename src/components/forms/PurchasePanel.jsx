import { apiFetch } from '../../lib/api.js'
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, RefreshCw, Search, X } from 'lucide-react';

const STATUS_COLORS = { draft:'text-gray-600 bg-gray-50 border-gray-200', approved:'text-blue-600 bg-blue-50 border-blue-200', received:'text-green-600 bg-green-50 border-green-200', cancelled:'text-red-500 bg-red-50 border-red-200' };
const STATUS_LABELS = { draft:'ร่าง', approved:'อนุมัติ', received:'รับแล้ว', cancelled:'ยกเลิก' };

function today() { return new Date().toISOString().slice(0, 10); }

export default function PurchasePanel({ token, lang = 'th', deptColor }) {
  const [rows, setRows]         = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState('');
  const [form, setForm] = useState({
    supplier_name:'', supplier_contact:'', order_date: today(), due_date:'', note:'',
    items:[{ product_id:'', product_name:'', unit:'กล่อง', qty:1, price_unit:0, amount:0 }]
  });

  const load = async () => {
    setLoading(true);
    try {
      const [rPO, rProd] = await Promise.all([
        apiFetch('/api/purchase', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        apiFetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      if (Array.isArray(rPO))   setRows(rPO);
      if (Array.isArray(rProd)) setProducts(rProd);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { product_id:'', product_name:'', unit:'กล่อง', qty:1, price_unit:0, amount:0 }] }));
  const removeItem = (i) => setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const setItem = (i, k, v) => setForm(p => {
    const items = [...p.items];
    items[i] = { ...items[i], [k]: v };
    if (k === 'qty' || k === 'price_unit') items[i].amount = (Number(items[i].qty) || 0) * (Number(items[i].price_unit) || 0);
    if (k === 'product_id') {
      const prod = products.find(pr => String(pr.id) === String(v));
      if (prod) { items[i].product_name = prod.product_name; items[i].unit = prod.unit || 'กล่อง'; items[i].price_unit = prod.price_cost || 0; items[i].amount = (Number(items[i].qty) || 0) * (prod.price_cost || 0); }
    }
    return { ...p, items };
  });

  const total = form.items.reduce((s, i) => s + Number(i.amount || 0), 0);

  const submit = async (e) => {
    e.preventDefault();
    const r = await apiFetch('/api/purchase', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, items: form.items.filter(i => i.product_name || i.product_id) }),
    });
    const d = await r.json();
    if (d.success) { setShowForm(false); setForm({ supplier_name:'', supplier_contact:'', order_date: today(), due_date:'', note:'', items:[{ product_id:'', product_name:'', unit:'กล่อง', qty:1, price_unit:0, amount:0 }] }); load(); }
  };

  const updateStatus = async (id, status) => {
    await apiFetch(`/api/purchase/${id}`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const filtered = rows.filter(r =>
    !search || r.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.po_no?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center gap-2 py-12 justify-center text-gray-400"><RefreshCw className="w-4 h-4 animate-spin" /> กำลังโหลด...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <div key={k} className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${STATUS_COLORS[k]?.split(' ')[1] || 'bg-gray-100'}`}>
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div><p className="text-lg font-bold">{rows.filter(r => r.status === k).length}</p><p className="text-xs text-gray-500">{v}</p></div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาใบสั่งซื้อ..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium ${showForm ? 'bg-gray-200 text-gray-700' : 'bg-gradient-to-r ' + deptColor + ' text-white shadow-sm'}`}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'ปิด' : 'สร้างใบสั่งซื้อ'}
        </button>
        <button onClick={load} className="flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm text-gray-600 hover:bg-gray-50"><RefreshCw className="w-3.5 h-3.5" /></button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-gray-50 border rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-gray-800">สร้างใบสั่งซื้อใหม่</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500 mb-1 block">ผู้ขาย / Supplier *</label>
              <input required value={form.supplier_name} onChange={e => setForm(p => ({...p, supplier_name: e.target.value}))} placeholder="ชื่อผู้ขาย"
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">ติดต่อ</label>
              <input value={form.supplier_contact} onChange={e => setForm(p => ({...p, supplier_contact: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">วันที่สั่งซื้อ</label>
              <input type="date" value={form.order_date} onChange={e => setForm(p => ({...p, order_date: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">กำหนดรับสินค้า</label>
              <input type="date" value={form.due_date} onChange={e => setForm(p => ({...p, due_date: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 font-semibold uppercase">รายการสินค้า</label>
              <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:underline">+ เพิ่มรายการ</button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <select value={item.product_id} onChange={e => setItem(i, 'product_id', e.target.value)}
                  className="flex-1 border rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                  <option value="">-- สินค้า --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
                </select>
                <input value={item.unit} onChange={e => setItem(i, 'unit', e.target.value)} placeholder="หน่วย"
                  className="w-18 border rounded-lg px-2 py-1.5 text-sm" />
                <input type="number" min="1" value={item.qty} onChange={e => setItem(i, 'qty', e.target.value)} placeholder="จำนวน"
                  className="w-18 border rounded-lg px-2 py-1.5 text-sm" />
                <input type="number" min="0" step="0.01" value={item.price_unit} onChange={e => setItem(i, 'price_unit', e.target.value)} placeholder="ราคา/หน่วย"
                  className="w-24 border rounded-lg px-2 py-1.5 text-sm" />
                <span className="text-xs text-gray-500 w-20 text-right">฿{Number(item.amount).toLocaleString()}</span>
                {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>}
              </div>
            ))}
            <div className="text-right text-sm font-bold text-gray-700 mt-2">รวม: ฿{total.toLocaleString()}</div>
          </div>
          <button type="submit" className={`px-6 py-2 rounded-xl text-white text-sm font-medium bg-gradient-to-r ${deptColor} shadow-sm`}>บันทึก</button>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">เลขที่ PO</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ผู้ขาย</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">วันที่</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">มูลค่า</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">สถานะ</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0
                ? <tr><td colSpan={5} className="text-center py-10 text-gray-400">ไม่พบข้อมูล</td></tr>
                : filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.po_no}</td>
                    <td className="px-4 py-3 font-medium">{r.supplier_name}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">{r.order_date?.slice(0, 10) || '—'}</td>
                    <td className="px-4 py-3 text-center font-bold">฿{Number(r.net_amount).toLocaleString()}</td>
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
