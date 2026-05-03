import { apiFetch } from '../lib/api.js'
import React, { useState } from 'react';
import { X, User, Mail, Phone, Building2, MapPin, ChevronRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const purposes = [
  { value: 'income',      label: 'สนใจหารายได้เสริม',        icon: '💰' },
  { value: 'partner',     label: 'สนใจร่วมเป็นคู่ค้า',       icon: '🤝' },
  { value: 'buy',         label: 'สนใจซื้อสินค้า',            icon: '🛒' },
  { value: 'distributor', label: 'สนใจเป็นตัวแทนจำหน่าย',   icon: '🏪' },
  { value: 'other',       label: 'ติดต่อเรื่องอื่นๆ ทั่วไป', icon: '📋' },
];

export default function RegisterModal({ onClose }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '', purpose: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await apiFetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
      } else {
        setStep(3);
      }
    } catch {
      setSubmitError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent px-8 py-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <img src="/sp/logo.jpg" alt="logo" className="w-9 h-9 rounded-full object-cover border-2 border-white/50" />
            <span className="font-bold text-lg">SP FOODS CO.,LTD</span>
          </div>
          <p className="text-white/80 text-sm">แบรนด์ ส.ภาวิณีร์ อีสานฟู้ดส์</p>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-center px-8 pt-5 gap-2">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {s}
                </div>
                {s < 2 && <div className={`flex-1 h-1 rounded-full transition-colors ${step > s ? 'bg-primary' : 'bg-gray-100'}`} />}
              </React.Fragment>
            ))}
            <span className="ml-2 text-sm text-gray-500">{step === 1 ? 'จุดประสงค์' : 'ข้อมูลส่วนตัว'}</span>
          </div>
        )}

        <div className="px-8 pb-8 pt-4">

          {/* Step 1: Purpose */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-dark mb-1">ลงทะเบียน</h2>
              <p className="text-gray-500 text-sm mb-5">เลือกจุดประสงค์ของการลงทะเบียน</p>
              <div className="space-y-3">
                {purposes.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => { setForm(prev => ({ ...prev, purpose: p.value })); setStep(2); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group text-left"
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <span className="flex-1 font-medium text-gray-700 group-hover:text-primary">{p.label}</span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <button type="button" onClick={() => setStep(1)} className="text-sm text-primary mb-3 hover:underline flex items-center gap-1">
                ← เปลี่ยนจุดประสงค์
              </button>

              {/* Selected purpose badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-5">
                <span>{purposes.find(p => p.value === form.purpose)?.icon}</span>
                <span>{purposes.find(p => p.value === form.purpose)?.label}</span>
              </div>

              <h2 className="text-xl font-bold text-dark mb-4">ข้อมูลส่วนตัว</h2>

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" name="name" placeholder="ชื่อ-นามสกุล *" value={form.name} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" name="email" placeholder="อีเมล *" value={form.email} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" name="phone" placeholder="เบอร์โทรศัพท์ *" value={form.phone} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" name="company" placeholder="ชื่อบริษัท (ถ้ามี)" value={form.company} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea name="address" placeholder="ที่อยู่ *" value={form.address} onChange={handleChange} required rows="2"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none" />
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {submitError}
                </div>
              )}
              <button type="submit" disabled={submitting} className="btn-primary w-full mt-6 py-3 text-base disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'ส่งข้อมูลลงทะเบียน'}
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-dark mb-2">ลงทะเบียนสำเร็จ!</h2>
              <p className="text-gray-500 mb-1">ขอบคุณ <span className="font-semibold text-dark">{form.name}</span></p>
              <p className="text-gray-500 text-sm mb-6">ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง</p>
              <div className="bg-gray-50 rounded-2xl p-4 text-sm text-left space-y-2 mb-6">
                <div className="flex justify-between"><span className="text-gray-400">จุดประสงค์</span><span className="font-medium">{purposes.find(p => p.value === form.purpose)?.label}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">ชื่อ</span><span className="font-medium">{form.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">อีเมล</span><span className="font-medium">{form.email}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">โทร</span><span className="font-medium">{form.phone}</span></div>
                {form.company && <div className="flex justify-between"><span className="text-gray-400">บริษัท</span><span className="font-medium">{form.company}</span></div>}
                <div className="flex justify-between gap-4"><span className="text-gray-400 shrink-0">ที่อยู่</span><span className="font-medium text-right">{form.address}</span></div>
              </div>
              <button onClick={onClose} className="btn-primary w-full">ปิด</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
