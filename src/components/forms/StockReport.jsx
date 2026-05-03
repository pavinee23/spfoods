import { apiFetch } from '../../lib/api.js'
import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, RefreshCw, Search } from 'lucide-react';

const i18n = {
  th: {
    total: 'สินค้าทั้งหมด', lowStock: 'สต๊อกต่ำ', outOfStock: 'หมดสต๊อก',
    search: 'ค้นหาสินค้า...', code: 'รหัส', name: 'ชื่อสินค้า', category: 'ประเภท',
    unit: 'หน่วย', stock: 'สต๊อกคงเหลือ', minStock: 'ขั้นต่ำ', status: 'สถานะ',
    statusOk: 'ปกติ', statusLow: 'ใกล้หมด', statusOut: 'หมดสต๊อก',
    loading: 'กำลังโหลด...', noData: 'ไม่พบข้อมูลสินค้า', errServer: 'ไม่สามารถโหลดข้อมูลได้',
    refresh: 'รีเฟรช', items: 'รายการ', allTypes: 'ทุกประเภท',
  },
  en: {
    total: 'Total Products', lowStock: 'Low Stock', outOfStock: 'Out of Stock',
    search: 'Search products...', code: 'Code', name: 'Product Name', category: 'Category',
    unit: 'Unit', stock: 'Stock Qty', minStock: 'Min Stock', status: 'Status',
    statusOk: 'Normal', statusLow: 'Low', statusOut: 'Out of Stock',
    loading: 'Loading...', noData: 'No products found', errServer: 'Failed to load data',
    refresh: 'Refresh', items: 'items', allTypes: 'All Types',
  },
  ko: {
    total: '전체 제품', lowStock: '재고 부족', outOfStock: '재고 없음',
    search: '제품 검색...', code: '코드', name: '제품명', category: '카테고리',
    unit: '단위', stock: '재고 수량', minStock: '최소 재고', status: '상태',
    statusOk: '정상', statusLow: '부족', statusOut: '재고 없음',
    loading: '로딩 중...', noData: '제품 없음', errServer: '데이터 로드 실패',
    refresh: '새로고침', items: '개', allTypes: '전체 유형',
  },
};

function statusInfo(stock_qty, min_stock, t) {
  const qty = Number(stock_qty);
  const min = Number(min_stock);
  if (qty <= 0)       return { label: t.statusOut, color: 'text-red-600 bg-red-50 border-red-200',    dot: 'bg-red-500' };
  if (qty <= min)     return { label: t.statusLow, color: 'text-orange-600 bg-orange-50 border-orange-200', dot: 'bg-orange-400' };
  return               { label: t.statusOk,  color: 'text-green-600 bg-green-50 border-green-200',  dot: 'bg-green-500' };
}

export default function StockReport({ token, lang = 'th', deptColor }) {
  const t = i18n[lang] || i18n.th;
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filterCat, setFilterCat] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res  = await apiFetch('/api/products', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
      else setError(t.errServer);
    } catch { setError(t.errServer); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const categories = [...new Set(products.map(p => p.category_name).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchSearch = !search || p.product_name.toLowerCase().includes(search.toLowerCase()) || p.product_code.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category_name === filterCat;
    return matchSearch && matchCat;
  });

  const totalCount   = products.length;
  const lowCount     = products.filter(p => Number(p.stock_qty) > 0 && Number(p.stock_qty) <= Number(p.min_stock)).length;
  const outCount     = products.filter(p => Number(p.stock_qty) <= 0).length;

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
      <RefreshCw className="w-5 h-5 animate-spin" />
      <span className="text-sm">{t.loading}</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      {error}
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${deptColor} flex items-center justify-center`}>
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{totalCount}</p>
            <p className="text-xs text-gray-500">{t.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-orange-600">{lowCount}</p>
            <p className="text-xs text-gray-500">{t.lowStock}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-red-600">{outCount}</p>
            <p className="text-xs text-gray-500">{t.outOfStock}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 bg-white min-w-36"
        >
          <option value="">{t.allTypes}</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {t.refresh}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.code}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.name}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">{t.category}</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.unit}</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.stock}</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">{t.minStock}</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">{t.noData}</td>
                </tr>
              ) : filtered.map((p) => {
                const s = statusInfo(p.stock_qty, p.min_stock, t);
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${Number(p.stock_qty) <= 0 ? 'bg-red-50/30' : Number(p.stock_qty) <= Number(p.min_stock) ? 'bg-orange-50/30' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.product_code}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.product_name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{p.category_name || '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{p.unit || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold text-base ${Number(p.stock_qty) <= 0 ? 'text-red-600' : Number(p.stock_qty) <= Number(p.min_stock) ? 'text-orange-600' : 'text-gray-800'}`}>
                        {Number(p.stock_qty).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400 text-xs hidden sm:table-cell">{Number(p.min_stock).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${s.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-50 text-xs text-gray-400">
            {filtered.length} {t.items}
          </div>
        )}
      </div>
    </div>
  );
}
