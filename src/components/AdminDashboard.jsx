import { apiFetch } from '../lib/api.js'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, User, Bell, Settings,
  ChevronRight, LayoutDashboard,
} from 'lucide-react';
import { deptMeta, deptI18n } from '../config/adminDepts';

const i18n = {
  th: {
    title: 'แดชบอร์ด Admin',
    subtitle: 'เลือกแผนกที่ต้องการจัดการ',
    system: 'ระบบจัดการภายใน',
    logout: 'ออกจากระบบ',
    employees: 'พนักงานทั้งหมด',
    registrations: 'ผู้ลงทะเบียน',
    systemStatus: 'สถานะระบบ',
    normal: 'ปกติ',
    empUnit: 'พนักงาน',
    footer: 'SP FOODS CO.,LTD · ระบบจัดการภายใน · เฉพาะผู้มีสิทธิ์เท่านั้น',
  },
  en: {
    title: 'Admin Dashboard',
    subtitle: 'Select a department to manage',
    system: 'Internal Management System',
    logout: 'Logout',
    employees: 'Total Employees',
    registrations: 'Registrations',
    systemStatus: 'System Status',
    normal: 'Normal',
    empUnit: 'employees',
    footer: 'SP FOODS CO.,LTD · Internal System · Authorized Personnel Only',
  },
  ko: {
    title: '관리자 대시보드',
    subtitle: '관리할 부서를 선택하세요',
    system: '내부 관리 시스템',
    logout: '로그아웃',
    employees: '전체 직원',
    registrations: '등록자',
    systemStatus: '시스템 상태',
    normal: '정상',
    empUnit: '명',
    footer: 'SP FOODS CO.,LTD · 내부 시스템 · 권한자 전용',
  },
  my: {
    title: 'Admin Dashboard',
    subtitle: 'စီမံခန့်ခွဲမည့် ဌာနကို ရွေးချယ်ပါ',
    system: 'အတွင်းပိုင်း စီမံခန့်ခွဲမှု စနစ်',
    logout: 'ထွက်သည်',
    employees: 'ဝန်ထမ်းစုစုပေါင်း',
    registrations: 'မှတ်ပုံတင်သူများ',
    systemStatus: 'စနစ်အခြေအနေ',
    normal: 'ပုံမှန်',
    empUnit: 'ဦး',
    footer: 'SP FOODS CO.,LTD · အတွင်းပိုင်း စနစ် · ခွင့်ပြုထားသူများသာ',
  },
};

const LANGS = [
  { code: 'th', label: 'ไทย' },
  { code: 'en', label: 'EN' },
  { code: 'ko', label: '한국어' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('adminToken');
  const [deptCounts, setDeptCounts] = useState({});
  const [regCount, setRegCount] = useState('...');
  const [lang, setLang] = useState('th');

  const t = i18n[lang];
  const deptLabels = deptI18n[lang]?.depts || deptI18n.th.depts;

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/departments', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(rows => {
        if (Array.isArray(rows)) {
          const map = {};
          rows.forEach(r => { map[r.dept_id] = r.employee_count; });
          setDeptCounts(map);
        }
      })
      .catch(() => {});

    apiFetch('/api/registrations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(rows => { if (Array.isArray(rows)) setRegCount(rows.length); })
      .catch(() => {});
  }, [token]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    deptMeta.forEach(d => sessionStorage.removeItem(`deptToken_${d.id}`));
    navigate('/sp/admin-sp');
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Top Bar */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/sp/logo.jpg" alt="logo" className="w-8 h-8 rounded-full object-cover border border-white/30" />
          <div>
            <p className="font-bold text-sm leading-tight">SP FOODS CO.,LTD</p>
            <p className="text-gray-400 text-xs">{t.system}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex items-center gap-1 bg-white/10 rounded-full px-1 py-1">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  lang === l.code ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          {/* Path indicator */}
          <span className="hidden md:inline text-gray-500 text-xs font-mono bg-white/5 px-2 py-1 rounded-lg">
            /sp/admin-sp/dashboard
          </span>
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs">
            <User className="w-3.5 h-3.5" />
            <span>Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500 px-3 py-1.5 rounded-full text-xs font-medium transition-colors text-red-300 hover:text-white"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t.logout}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
            </div>
            <p className="text-gray-500 text-sm">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-white rounded-xl shadow hover:shadow-md transition-shadow">
              <Bell className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2 bg-white rounded-xl shadow hover:shadow-md transition-shadow">
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: t.employees,     value: Object.keys(deptCounts).length ? String(Object.values(deptCounts).reduce((a, b) => a + b, 0)) : '50', icon: '👥' },
            { label: t.registrations, value: String(regCount), icon: '📋' },
            { label: t.systemStatus,  value: t.normal, icon: '✅' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Department Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {deptMeta.map((dept, idx) => {
            const Icon = dept.icon;
            const labels = deptLabels[idx];
            const empCount = deptCounts[dept.id] !== undefined ? deptCounts[dept.id] : dept.count;
            return (
              <button
                key={dept.id}
                onClick={() => navigate(`/sp/admin-sp/dept/${dept.id}`)}
                className="text-left rounded-2xl border-2 border-gray-200 bg-white p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dept.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    {!dept.owner && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dept.bg} ${dept.text} border ${dept.border}`}>
                        {empCount} {t.empUnit}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>

                {dept.owner && (
                  <div className="mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900">👑 OWNER ACCESS</span>
                  </div>
                )}
                <h3 className="font-bold text-gray-800 text-base leading-tight">{labels.title}</h3>
                <p className={`text-sm font-semibold mb-2 ${dept.text}`}>{labels.subtitle}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{labels.desc}</p>
                <p className="text-xs text-gray-300 font-mono mt-2">/sp/admin-sp/dept/{dept.id}</p>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">{t.footer}</p>
      </div>
    </div>
  );
}
