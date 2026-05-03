import { apiFetch } from '../../lib/api.js'
import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader } from 'lucide-react';

const i18n = {
  th: {
    code: 'รหัสสินค้า *', name: 'ชื่อสินค้า *', category: 'ประเภทสินค้า',
    unit: 'หน่วยนับ', priceCost: 'ราคาทุน', priceSell: 'ราคาขาย',
    stock: 'จำนวนสต๊อกเริ่มต้น', minStock: 'สต๊อกขั้นต่ำ (แจ้งเตือน)',
    desc: 'รายละเอียดสินค้า',
    save: 'บันทึกข้อมูลสินค้า', saving: 'กำลังบันทึก...',
    success: 'บันทึกสินค้าสำเร็จ!', addMore: 'เพิ่มสินค้าใหม่',
    selectCat: '-- เลือกประเภท --',
    errRequired: 'กรุณากรอกชื่อสินค้า',
    errServer: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
    units: ['กล่อง', 'ถุง', 'กก.', 'ขวด', 'ชิ้น', 'แพ็ค', 'โหล', 'ลัง'],
  },
  en: {
    code: 'Product Code *', name: 'Product Name *', category: 'Category',
    unit: 'Unit', priceCost: 'Cost Price', priceSell: 'Selling Price',
    stock: 'Initial Stock', minStock: 'Min Stock (Alert)',
    desc: 'Product Description',
    save: 'Save Product', saving: 'Saving...',
    success: 'Product saved!', addMore: 'Add Another Product',
    selectCat: '-- Select Category --',
    errRequired: 'Please enter product name',
    errServer: 'Cannot connect to server',
    units: ['Box', 'Bag', 'kg', 'Bottle', 'Piece', 'Pack', 'Dozen', 'Crate'],
  },
  ko: {
    code: '제품 코드 *', name: '제품명 *', category: '카테고리',
    unit: '단위', priceCost: '원가', priceSell: '판매가',
    stock: '초기 재고', minStock: '최소 재고 (알림)',
    desc: '제품 설명',
    save: '제품 저장', saving: '저장 중...',
    success: '제품이 저장되었습니다!', addMore: '제품 추가',
    selectCat: '-- 카테고리 선택 --',
    errRequired: '제품명을 입력하세요',
    errServer: '서버에 연결할 수 없습니다',
    units: ['박스', '봉지', 'kg', '병', '개', '팩', '다스', '케이스'],
  },
};

const makeEmpty = () => ({ product_code: '', product_name: '', category_id: '', unit: '', price_cost: '', price_sell: '', stock_qty: '0', min_stock: '0', description: '' });

export default function AddProductForm({ token, lang = 'th', deptColor }) {
  const [form, setForm]             = useState(makeEmpty());
  const [categories, setCategories] = useState([]);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);
  const [loadingCode, setLoadingCode] = useState(true);
  const t = i18n[lang] || i18n.th;

  const fetchNextCode = async () => {
    setLoadingCode(true);
    try {
      const res  = await apiFetch('/api/products/next-code', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.code) setForm(p => ({ ...p, product_code: data.code }));
    } catch {}
    finally { setLoadingCode(false); }
  };

  const fetchCategories = async () => {
    try {
      const res  = await apiFetch('/api/products/categories', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {}
  };

  useEffect(() => { fetchNextCode(); fetchCategories(); }, []);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.product_name) { setError(t.errRequired); return; }
    setSaving(true); setError('');
    try {
      const res  = await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || t.errServer);
      else setSuccess(true);
    } catch { setError(t.errServer); }
    finally { setSaving(false); }
  };

  const resetForm = async () => {
    setForm(makeEmpty());
    setSuccess(false);
    await fetchNextCode();
  };

  if (success) return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{t.success}</h3>
      <p className="text-gray-500 text-sm mb-6">{form.product_name}</p>
      <button onClick={resetForm}
        className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${deptColor} hover:opacity-90 transition-opacity`}>
        {t.addMore}
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">

        {/* รหัสสินค้า auto */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t.code}</label>
          <div className="relative">
            <input type="text" value={form.product_code} readOnly
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 font-mono cursor-not-allowed" />
            {loadingCode && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
          </div>
        </div>

        {/* ชื่อสินค้า */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t.name}</label>
          <input type="text" name="product_name" value={form.product_name} onChange={handle} required
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100" />
        </div>

        {/* ประเภทสินค้า */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t.category}</label>
          <select name="category_id" value={form.category_id} onChange={handle}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 bg-white">
            <option value="">{t.selectCat}</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.category_name || c.name}</option>)}
          </select>
        </div>

        {/* หน่วยนับ */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t.unit}</label>
          <div className="flex gap-2">
            <select name="unit" value={form.unit} onChange={handle}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 bg-white">
              <option value="">--</option>
              {t.units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="text" name="unit" value={form.unit} onChange={handle} placeholder="หรือพิมพ์เอง"
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100" />
          </div>
        </div>

        {/* ราคาทุน / ราคาขาย */}
        {[
          { name: 'price_cost', label: t.priceCost },
          { name: 'price_sell', label: t.priceSell },
          { name: 'stock_qty',  label: t.stock },
          { name: 'min_stock',  label: t.minStock },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
            <input type="number" name={f.name} value={form[f.name]} onChange={handle} min="0"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100" />
          </div>
        ))}
      </div>

      {/* รายละเอียด */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">{t.desc}</label>
        <textarea name="description" value={form.description} onChange={handle} rows={3}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none" />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl">{error}</div>}

      <button type="submit" disabled={saving}
        className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${deptColor} flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60`}>
        {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t.save}
      </button>
    </form>
  );
}
