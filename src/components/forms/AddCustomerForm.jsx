import { apiFetch } from '../../lib/api.js'
import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader } from 'lucide-react';

const i18n = {
  th: {
    code: 'รหัสลูกค้า *', name: 'ชื่อลูกค้า / บริษัท *', contact: 'ชื่อผู้ติดต่อ',
    phone: 'เบอร์โทรศัพท์ *', email: 'อีเมล', address: 'บ้านเลขที่ / ถนน',
    subdistrict: 'ตำบล', district: 'อำเภอ', province: 'จังหวัด', country: 'ประเทศ',
    taxId: 'เลขประจำตัวผู้เสียภาษี',
    payType: 'ประเภทการชำระเงิน', cash: 'ลูกค้าเงินสด', credit: 'ลูกค้าเครดิต',
    currency: 'หน่วยเงิน', creditLimit: 'วงเงินเครดิต', creditDays: 'จำนวนวันเครดิต',
    note: 'หมายเหตุ', save: 'บันทึกข้อมูลลูกค้า', saving: 'กำลังบันทึก...',
    success: 'บันทึกข้อมูลสำเร็จ!', addMore: 'เพิ่มลูกค้าใหม่',
    errRequired: 'กรุณากรอกรหัสลูกค้า ชื่อ และเบอร์โทร',
    errServer: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
  },
  en: {
    code: 'Customer Code *', name: 'Customer / Company Name *', contact: 'Contact Person',
    phone: 'Phone *', email: 'Email', address: 'House No. / Street',
    subdistrict: 'Sub-district', district: 'District', province: 'Province', country: 'Country',
    taxId: 'Tax ID',
    payType: 'Payment Type', cash: 'Cash Customer', credit: 'Credit Customer',
    currency: 'Currency', creditLimit: 'Credit Limit', creditDays: 'Credit Days',
    note: 'Note', save: 'Save Customer', saving: 'Saving...',
    success: 'Saved successfully!', addMore: 'Add Another Customer',
    errRequired: 'Please fill in code, name and phone',
    errServer: 'Cannot connect to server',
  },
  ko: {
    code: '고객 코드 *', name: '고객 / 회사명 *', contact: '담당자',
    phone: '전화번호 *', email: '이메일', address: '번지 / 도로명',
    subdistrict: '읍/면/동', district: '군/구', province: '시/도', country: '국가',
    taxId: '사업자번호',
    payType: '결제 유형', cash: '현금 고객', credit: '외상 고객',
    currency: '통화', creditLimit: '신용 한도', creditDays: '결제 기간 (일)',
    note: '메모', save: '고객 저장', saving: '저장 중...',
    success: '저장되었습니다!', addMore: '고객 추가',
    errRequired: '코드, 이름, 전화번호를 입력하세요',
    errServer: '서버에 연결할 수 없습니다',
  },
};

const DEFAULT_COUNTRY = { th: 'ไทย', en: 'Thailand', ko: '태국' };

const CURRENCIES = [
  { value: 'THB', label: '฿ บาท (THB)',   flag: '🇹🇭' },
  { value: 'KRW', label: '₩ วอน (KRW)',   flag: '🇰🇷' },
  { value: 'USD', label: '$ ดอลลาร์ (USD)', flag: '🇺🇸' },
];

const makeEmpty = (lang) => ({ customer_code: '', customer_name: '', contact_name: '', phone: '', email: '', address: '', subdistrict: '', district: '', province: '', country: DEFAULT_COUNTRY[lang] || 'ไทย', tax_id: '', payment_type: 'cash', currency: 'THB', credit_limit: '', credit_days: '30', note: '' });

export default function AddCustomerForm({ token, lang = 'th', deptColor }) {
  const [form, setForm]         = useState(() => makeEmpty(lang));
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [loadingCode, setLoadingCode] = useState(true);
  const t = i18n[lang] || i18n.th;

  const fetchNextCode = async () => {
    setLoadingCode(true);
    try {
      const res = await apiFetch('/api/customers/next-code', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.code) setForm(p => ({ ...p, customer_code: data.code }));
    } catch {}
    finally { setLoadingCode(false); }
  };

  useEffect(() => { fetchNextCode(); }, []);

  useEffect(() => {
    setForm(p => ({ ...p, country: p.country === DEFAULT_COUNTRY.th || p.country === DEFAULT_COUNTRY.en || p.country === DEFAULT_COUNTRY.ko ? DEFAULT_COUNTRY[lang] || 'ไทย' : p.country }));
  }, [lang]);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.customer_code || !form.customer_name || !form.phone) { setError(t.errRequired); return; }
    setSaving(true); setError('');
    try {
      const res = await apiFetch('/api/customers', {
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
    setForm(makeEmpty(lang));
    setSuccess(false);
    await fetchNextCode();
  };

  if (success) return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{t.success}</h3>
      <p className="text-gray-500 text-sm mb-6">{form.customer_name}</p>
      <button onClick={resetForm}
        className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${deptColor} hover:opacity-90 transition-opacity`}>
        {t.addMore}
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* รหัสลูกค้า — auto-generated */}
        <div>
          <label className="block text-xs font-medium text-gray-800 mb-1 font-semibold">{t.code}</label>
          <div className="relative">
            <input
              type="text"
              value={form.customer_code}
              readOnly
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 font-mono cursor-not-allowed"
            />
            {loadingCode && (
              <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>
        </div>
        {[
          { name: 'customer_name',  label: t.name,     type: 'text', required: true },
          { name: 'contact_name',   label: t.contact,  type: 'text' },
          { name: 'phone',          label: t.phone,    type: 'tel',  required: true },
          { name: 'email',          label: t.email,    type: 'email' },
          { name: 'tax_id',         label: t.taxId,    type: 'text' },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-xs font-medium text-gray-800 mb-1 font-semibold">{f.label}</label>
            <input
              type={f.type}
              name={f.name}
              value={form[f.name]}
              onChange={handle}
              required={f.required}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>
        ))}

        {/* ประเภทการชำระเงิน */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-800 mb-2">{t.payType}</label>
          <div className="flex gap-3">
            {[
              { value: 'cash',   label: t.cash,   icon: '💵' },
              { value: 'credit', label: t.credit, icon: '💳' },
            ].map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, payment_type: p.value, credit_days: p.value === 'cash' ? '0' : '30' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.payment_type === p.value
                    ? p.value === 'cash'
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-pink-400 bg-pink-50 text-pink-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                <span className="text-lg">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* จำนวนวันเครดิต — แสดงเฉพาะเครดิต */}
        <div>
          <label className={`block text-xs font-semibold mb-1 ${form.payment_type === 'credit' ? 'text-gray-800' : 'text-gray-400'}`}>
            {t.creditDays}
          </label>
          <input
            type="number"
            name="credit_days"
            value={form.credit_days}
            onChange={handle}
            disabled={form.payment_type === 'cash'}
            className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-all ${
              form.payment_type === 'credit'
                ? 'border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100'
                : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          />
        </div>

        {/* หน่วยเงิน + วงเงินเครดิต */}
        <div>
          <label className="block text-xs font-medium text-gray-800 mb-1 font-semibold">{t.currency}</label>
          <div className="flex gap-2">
            {CURRENCIES.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm(p => ({ ...p, currency: c.value }))}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                  form.currency === c.value
                    ? 'border-pink-400 bg-pink-50 text-pink-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                <span className="text-base">{c.flag}</span>
                {c.value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-800 mb-1 font-semibold">
            {t.creditLimit} ({form.currency})
          </label>
          <input
            type="number"
            name="credit_limit"
            value={form.credit_limit}
            onChange={handle}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>
      </div>

      {/* ที่อยู่แยกส่วน */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-800 mb-1 font-semibold">{t.address}</label>
          <textarea name="address" value={form.address} onChange={handle} rows={2}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'subdistrict', label: t.subdistrict },
            { name: 'district',    label: t.district },
            { name: 'province',    label: t.province },
            { name: 'country',     label: t.country },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-gray-800 mb-1 font-semibold">{f.label}</label>
              <input type="text" name={f.name} value={form[f.name]} onChange={handle}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-800 mb-1 font-semibold">{t.note}</label>
        <textarea name="note" value={form.note} onChange={handle} rows={2}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none" />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl">{error}</div>}

      <button type="submit" disabled={saving}
        className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${deptColor} flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60`}>
        {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t.save}
      </button>
    </form>
  );
}
