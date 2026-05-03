import { apiFetch } from '../../lib/api.js'
import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, RefreshCw, Search, CheckCircle } from 'lucide-react';

const STATUS_COLOR = {
  active: 'text-green-600 bg-green-50 border-green-200',
  inactive: 'text-gray-500 bg-gray-50 border-gray-200',
};

export default function DebtorPanel({ token, lang = 'th', deptColor }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await apiFetch('/api/invoices/debtors', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (Array.isArray(d)) setRows(d);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r =>
    !search || r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.customer_code?.toLowerCase().includes(search.toLowerCase())
  );

  const save = async () => {
    await apiFetch(`/api/invoices/debtors/${editing.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: editing.balance, credit_limit: editing.credit_limit, credit_days: editing.credit_days, note: editing.note }),
    });
    setEditing(null);
    load();
  };

  const totalDebt = rows.reduce((s, r) => s + Number(r.balance || 0), 0);
  const overLimit = rows.filter(r => Number(r.balance) > Number(r.credit_limit)).length;

  if (loading) return <div className="flex items-center gap-2 py-12 justify-center text-gray-400"><RefreshCw className="w-4 h-4 animate-spin" /> กำลังโหลด...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${deptColor} flex items-center justify-center`}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <div><p className="text-xl font-bold">{rows.length}</p><p className="text-xs text-gray-500">ลูกหนี้ทั้งหมด</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div><p className="text-xl font-bold text-orange-600">{overLimit}</p><p className="text-xs text-gray-500">เกินวงเงิน</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div><p className="text-lg font-bold text-blue-600">฿{totalDebt.toLocaleString()}</p><p className="text-xs text-gray-500">ยอดค้างทั้งหมด</p></div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาลูกหนี้..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-blue-400" />
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <RefreshCw className="w-3.5 h-3.5" /> รีเฟรช
        </button>
      </div>

      {editing && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
          <p className="font-semibold text-blue-800">{editing.customer_name}</p>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-gray-500">ยอดค้าง (฿)</label>
              <input type="number" value={editing.balance} onChange={e => setEditing(p => ({...p, balance: e.target.value}))}
                className="w-full border rounded-lg px-3 py-1.5 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">วงเงิน (฿)</label>
              <input type="number" value={editing.credit_limit} onChange={e => setEditing(p => ({...p, credit_limit: e.target.value}))}
                className="w-full border rounded-lg px-3 py-1.5 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">เครดิต (วัน)</label>
              <input type="number" value={editing.credit_days} onChange={e => setEditing(p => ({...p, credit_days: e.target.value}))}
                className="w-full border rounded-lg px-3 py-1.5 text-sm mt-1" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm">บันทึก</button>
            <button onClick={() => setEditing(null)} className="px-4 py-1.5 border rounded-lg text-sm">ยกเลิก</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">รหัส</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ชื่อลูกค้า</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ยอดค้าง</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">วงเงิน</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">เครดิต</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">สถานะ</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">จัดการ</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">ไม่พบข้อมูล</td></tr>
              ) : filtered.map(r => {
                const over = Number(r.balance) > Number(r.credit_limit);
                return (
                  <tr key={r.id} className={`hover:bg-gray-50 ${over ? 'bg-red-50/40' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.customer_code}</td>
                    <td className="px-4 py-3 font-medium">{r.customer_name}</td>
                    <td className={`px-4 py-3 text-center font-bold ${Number(r.balance) > 0 ? (over ? 'text-red-600' : 'text-orange-600') : 'text-gray-400'}`}>
                      ฿{Number(r.balance).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">฿{Number(r.credit_limit).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{r.credit_days} วัน</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLOR[r.is_active ? 'active' : 'inactive'] || STATUS_COLOR.inactive}`}>
                        {r.is_active ? 'ใช้งาน' : 'ปิดใช้'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setEditing({...r})}
                        className="text-xs px-3 py-1 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50">
                        อัพเดต
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && <div className="px-4 py-2 border-t text-xs text-gray-400">{filtered.length} รายการ</div>}
      </div>
    </div>
  );
}
