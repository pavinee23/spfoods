import { apiFetch } from '../lib/api.js'
import React, { useState } from 'react';
import { X, Search, Package, Phone, User, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

const statusConfig = {
  delivered: { label: 'จัดส่งสำเร็จ', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle, dot: 'bg-green-500' },
  shipping:  { label: 'กำลังจัดส่ง',  color: 'text-blue-600 bg-blue-50 border-blue-200',   icon: Truck,        dot: 'bg-blue-500' },
  packing:   { label: 'เตรียมพัสดุ',  color: 'text-orange-600 bg-orange-50 border-orange-200', icon: Package,  dot: 'bg-orange-500' },
};

export default function TrackingModal({ onClose }) {
  const [tab, setTab] = useState('name');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await apiFetch(`/api/tracking?type=${tab}&q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  const handleTabChange = (t) => {
    setTab(t);
    setQuery('');
    setResults(null);
    setSearched(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent px-8 py-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">ติดตามการจัดส่ง</h2>
              <p className="text-white/75 text-sm">SP FOODS CO.,LTD</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">

          {/* Tab */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => handleTabChange('name')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'name' ? 'bg-white text-primary shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <User className="w-4 h-4" /> ค้นหาด้วยชื่อ
            </button>
            <button
              onClick={() => handleTabChange('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'phone' ? 'bg-white text-primary shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Phone className="w-4 h-4" /> ค้นหาด้วยเบอร์โทร
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={tab === 'phone' ? 'tel' : 'text'}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
                placeholder={tab === 'name' ? 'กรอกชื่อ-นามสกุล...' : 'กรอกเบอร์โทรศัพท์...'}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
            <button type="submit" disabled={searching} className="btn-primary px-5 rounded-xl flex items-center gap-1.5 disabled:opacity-60">
              {searching
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Search className="w-4 h-4" /> ค้นหา</>}
            </button>
          </form>

          {/* Results */}
          {searched && (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {results && results.length > 0 ? results.map((order) => {
                const cfg = statusConfig[order.status];
                const Icon = cfg.icon;
                const dateStr = order.updated_at
                  ? new Date(order.updated_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '';
                return (
                  <div key={order.id} className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-dark text-sm">{order.customer_name}</p>
                        <p className="text-xs text-gray-400">{order.order_id}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{order.item}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{order.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="font-medium text-gray-500">ไม่พบข้อมูลการจัดส่ง</p>
                  <p className="text-sm text-gray-400 mt-1">กรุณาตรวจสอบ{tab === 'name' ? 'ชื่อ' : 'เบอร์โทรศัพท์'}อีกครั้ง</p>
                </div>
              )}
            </div>
          )}

          {!searched && (
            <div className="text-center py-6 text-gray-400 text-sm">
              <Truck className="w-10 h-10 mx-auto mb-2 opacity-20" />
              กรอก{tab === 'name' ? 'ชื่อ' : 'เบอร์โทรศัพท์'}แล้วกดค้นหา
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
