import { apiFetch } from '../../lib/api.js'
import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, RefreshCw, Search, X } from 'lucide-react';

const STATUS_COLORS = { draft:'text-gray-600 bg-gray-50 border-gray-200', approved:'text-green-600 bg-green-50 border-green-200', paid:'text-blue-600 bg-blue-50 border-blue-200', cancelled:'text-red-500 bg-red-50 border-red-200' };
const STATUS_LABELS = { draft:'ร่าง', approved:'อนุมัติ', paid:'จ่ายแล้ว', cancelled:'ยกเลิก' };
const PAYMENT = { cash:'เงินสด', transfer:'โอน', cheque:'เช็ค', credit_card:'บัตรเครดิต' };

function today() { return new Date().toISOString().slice(0, 10); }

export default function ExpensePanel({ token, lang = 'th', deptColor, deptId }) {
  const [rows, setRows]         = useState([]);
  const [cats, setCats]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState('');
  const [form, setForm] = useState({
    category_id: '', expense_date: today(), description: '', amount: '',
    vat_amount: 0, net_amount: '', payment_method: 'cash', ref_document: '', note: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [rRows, rCats] = await Promise.all([
        apiFetch(`/api/expenses${deptId ? `?dept=${deptId}` : ''}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        apiFetch('/api/expenses/categories', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      if (Array.isArray(rRows)) setRows(rRows);
      if (Array.isArray(rCats)) setCats(rCats);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const setF = (k, v) => setForm(p => {
    const next = { ...p, [k]: v };
    if (k === 'amount') { const vat = Math.round(Number(v) * 7) / 100; next.vat_amount = vat; next.net_amount = Number(v) + vat; }
    return next;
  });

  const submit = async (e) => {
    e.preventDefault();
    const r = await apiFetch('/api/expenses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, dept_id: deptId }),
    });
    const d = await r.json();
    if (d.success) { setShowForm(false); setForm({ category_id:'', expense_date: today(), description:'', amount:'', vat_amount:0, net_amount:'', payment_method:'cash', ref_document:'', note:'' }); load(); }
  };

  const filtered = rows.filter(r =>
    !search || r.description?.toLowerCase().includes(search.toLowerCase()) ||
    r.expense_no?.toLowerCase().includes(search.toLowerCase())
  );

  const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0);

  if (loading) return <div className="flex items-center gap-2 py-12 justify-center text-gray-400"><RefreshCw className="w-4 h-4 animate-spin" /> กำลังโหลด...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${deptColor} flex items-center justify-center`}>
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div><p className="text-xl font-bold">{rows.length}</p><p className="text-xs text-gray-500">รายการค่าใช้จ่าย</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-green-500" />
          </div>
          <div><p className="text-xl font-bold text-green-600">{rows.filter(r => r.status === 'approved').length}</p><p className="text-xs text-gray-500">อนุมัติแล้ว</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-500" />
          </div>
          <div><p className="text-lg font-bold text-blue-600">฿{total.toLocaleString()}</p><p className="text-xs text-gray-500">ยอดรวม</p></div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหารายการ..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-blue-400" />
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium ${showForm ? 'bg-gray-200 text-gray-700' : 'bg-gradient-to-r ' + deptColor + ' text-white shadow-sm'}`}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'ปิด' : 'บันทึกค่าใช้จ่าย'}
        </button>
        <button onClick={load} className="flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-gray-50 border rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-gray-800">บันทึกค่าใช้จ่ายใหม่</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500 mb-1 block">หมวดหมู่</label>
              <select value={form.category_id} onChange={e => setF('category_id', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">-- เลือกหมวดหมู่ --</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">วันที่ *</label>
              <input type="date" required value={form.expense_date} onChange={e => setF('expense_date', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">รายละเอียด *</label>
              <input required value={form.description} onChange={e => setF('description', e.target.value)} placeholder="ระบุรายละเอียด"
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">จำนวนเงิน (฿) *</label>
              <input type="number" required min="0" step="0.01" value={form.amount} onChange={e => setF('amount', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">VAT 7% (฿)</label>
              <input readOnly value={form.vat_amount} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">ช่องทางชำระ</label>
              <select value={form.payment_method} onChange={e => setF('payment_method', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                {Object.entries(PAYMENT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">เอกสารอ้างอิง</label>
              <input value={form.ref_document} onChange={e => setF('ref_document', e.target.value)}
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">รายละเอียด</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">หมวด</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">วันที่</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">จำนวน</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">สถานะ</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0
                ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">ไม่พบข้อมูล</td></tr>
                : filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.expense_no}</td>
                    <td className="px-4 py-3 font-medium">{r.description}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.category_name || '—'}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">{r.expense_date?.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-center font-bold">฿{Number(r.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[r.status] || STATUS_COLORS.draft}`}>
                        {STATUS_LABELS[r.status] || r.status}
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
