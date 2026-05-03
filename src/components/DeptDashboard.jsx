import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, ChevronRight, Plus, FileText, Printer, BarChart2, Users, RefreshCw, Receipt, CreditCard, BookOpen, ScrollText, ArrowLeft, Package } from 'lucide-react';
import { deptMeta, deptI18n } from '../config/adminDepts';
import DeptLoginModal from './DeptLoginModal';
import AddCustomerForm from './forms/AddCustomerForm';
import AddProductForm from './forms/AddProductForm';
import StockReport from './forms/StockReport';
import RegistrationsReport from './forms/RegistrationsReport';
import SalesOrder from './forms/SalesOrder';
import ProductsList from './forms/ProductsList';
import CustomersList from './forms/CustomersList';
import SalesOrdersList from './forms/SalesOrdersList';
import ContractPanel from './forms/ContractPanel';
import ContractsList from './forms/ContractsList';
import FeedbackPanel from './forms/FeedbackPanel';
import SalesOrdersCRM from './forms/SalesOrdersCRM';

const deptMenus = {
  accounting: {
    th: [
      { id: 'debtors',     icon: Users,      label: 'เพิ่มลูกหนี้ค้างจ่าย' },
      { id: 'debt_status', icon: RefreshCw,  label: 'อัพเดตสถานะลูกหนี้' },
      { id: 'invoice',     icon: FileText,   label: 'สร้างใบแจ้งหนี้' },
      { id: 'tax_invoice', icon: Receipt,    label: 'สร้างใบกำกับภาษี' },
      { id: 'credit_note', icon: CreditCard, label: 'สร้างใบลดหนี้' },
      { id: 'expense',     icon: BookOpen,   label: 'บันทึกค่าใช้จ่าย' },
      { id: 'report',      icon: BarChart2,  label: 'รายงานบัญชี / งบดุล' },
      { id: 'print',       icon: Printer,    label: 'พิมพ์รายงานส่งบัญชี' },
    ],
    en: [
      { id: 'debtors',     icon: Users,      label: 'Add Outstanding Debtors' },
      { id: 'debt_status', icon: RefreshCw,  label: 'Update Debtor Status' },
      { id: 'invoice',     icon: FileText,   label: 'Create Invoice' },
      { id: 'tax_invoice', icon: Receipt,    label: 'Create Tax Invoice' },
      { id: 'credit_note', icon: CreditCard, label: 'Create Credit Note' },
      { id: 'expense',     icon: BookOpen,   label: 'Record Expense' },
      { id: 'report',      icon: BarChart2,  label: 'Accounting Report / Balance Sheet' },
      { id: 'print',       icon: Printer,    label: 'Print Accounting Report' },
    ],
    ko: [
      { id: 'debtors',     icon: Users,      label: '미지급 채무자 추가' },
      { id: 'debt_status', icon: RefreshCw,  label: '채무자 상태 업데이트' },
      { id: 'invoice',     icon: FileText,   label: '청구서 작성' },
      { id: 'tax_invoice', icon: Receipt,    label: '세금계산서 작성' },
      { id: 'credit_note', icon: CreditCard, label: '대변 전표 작성' },
      { id: 'expense',     icon: BookOpen,   label: '지출 기록' },
      { id: 'report',      icon: BarChart2,  label: '회계 보고서 / 재무제표' },
      { id: 'print',       icon: Printer,    label: '회계 보고서 인쇄' },
    ],
  },
  sales: {
    th: [
      { id: 'add_customer',        icon: Users,      label: 'เพิ่มข้อมูลลูกค้า' },
      { id: 'add_product',         icon: Plus,       label: 'เพิ่มข้อมูลสินค้า' },
      { id: 'stock_report',        icon: Package,    label: 'ดูรายงานสต๊อกสินค้าคงเหลือ' },
      { id: 'sales_order',         icon: FileText,   label: 'สร้างใบสั่งขาย' },
      { id: 'crm',                 icon: RefreshCw,  label: 'บันทึกอัพเดตลูกค้าสัมพันธ์' },
      { id: 'feedback',            icon: BarChart2,  label: 'รายงานปัญหา / ฟีดแบ็คลูกค้า' },
      { id: 'contract',            icon: ScrollText, label: 'สร้างสัญญาซื้อ-ขาย' },
      { id: 'registrations_report',icon: Users,      label: 'ตารางรายงานผู้ติดต่อลงทะเบียน' },
      { id: 'products_list',       icon: Package,    label: 'รายการสินค้า' },
      { id: 'customers_list',      icon: Users,      label: 'รายชื่อลูกค้า' },
      { id: 'sales_orders_list',   icon: FileText,   label: 'รายการใบสั่งขาย' },
      { id: 'contracts_list',      icon: ScrollText, label: 'รายการสัญญา' },
    ],
    en: [
      { id: 'add_customer',        icon: Users,      label: 'Add Customer' },
      { id: 'add_product',         icon: Plus,       label: 'Add Product' },
      { id: 'stock_report',        icon: Package,    label: 'Stock Report' },
      { id: 'sales_order',         icon: FileText,   label: 'Create Sales Order' },
      { id: 'crm',                 icon: RefreshCw,  label: 'Update Customer Relations' },
      { id: 'feedback',            icon: BarChart2,  label: 'Issue Report / Customer Feedback' },
      { id: 'contract',            icon: ScrollText, label: 'Create Sale Contract' },
      { id: 'registrations_report',icon: Users,      label: 'Registration Contact Report' },
      { id: 'products_list',       icon: Package,    label: 'Products List' },
      { id: 'customers_list',      icon: Users,      label: 'Customers List' },
      { id: 'sales_orders_list',   icon: FileText,   label: 'Sales Orders List' },
      { id: 'contracts_list',      icon: ScrollText, label: 'Contracts List' },
    ],
    ko: [
      { id: 'add_customer',        icon: Users,      label: '고객 정보 추가' },
      { id: 'add_product',         icon: Plus,       label: '제품 정보 추가' },
      { id: 'stock_report',        icon: Package,    label: '재고 현황 보고서' },
      { id: 'sales_order',         icon: FileText,   label: '판매 주문 작성' },
      { id: 'crm',                 icon: RefreshCw,  label: '고객 관계 업데이트' },
      { id: 'feedback',            icon: BarChart2,  label: '문제 보고 / 고객 피드백' },
      { id: 'contract',            icon: ScrollText, label: '매매 계약서 작성' },
      { id: 'registrations_report',icon: Users,      label: '등록 연락처 보고서' },
      { id: 'products_list',       icon: Package,    label: '제품 목록' },
      { id: 'customers_list',      icon: Users,      label: '고객 목록' },
      { id: 'sales_orders_list',   icon: FileText,   label: '판매 주문 목록' },
      { id: 'contracts_list',      icon: ScrollText, label: '계약 목록' },
    ],
  },
  default: {
    th: [
      { id: 'view',   icon: FileText, label: 'ดูข้อมูลทั้งหมด' },
      { id: 'add',    icon: Plus,     label: 'เพิ่มข้อมูลใหม่' },
      { id: 'report', icon: BarChart2,label: 'รายงานและสรุป' },
    ],
    en: [
      { id: 'view',   icon: FileText, label: 'View All Data' },
      { id: 'add',    icon: Plus,     label: 'Add New Data' },
      { id: 'report', icon: BarChart2,label: 'Reports' },
    ],
    ko: [
      { id: 'view',   icon: FileText, label: '전체 데이터 보기' },
      { id: 'add',    icon: Plus,     label: '새 데이터 추가' },
      { id: 'report', icon: BarChart2,label: '보고서' },
    ],
  },
};

const pageContent = {
  debtors:     { th: 'เพิ่มลูกหนี้ค้างจ่าย',          en: 'Add Outstanding Debtors',        ko: '미지급 채무자 추가' },
  debt_status: { th: 'อัพเดตสถานะลูกหนี้',            en: 'Update Debtor Status',           ko: '채무자 상태 업데이트' },
  invoice:     { th: 'สร้างใบแจ้งหนี้',                en: 'Create Invoice',                 ko: '청구서 작성' },
  tax_invoice: { th: 'สร้างใบกำกับภาษี',              en: 'Create Tax Invoice',             ko: '세금계산서 작성' },
  credit_note: { th: 'สร้างใบลดหนี้',                 en: 'Create Credit Note',             ko: '대변 전표 작성' },
  expense:     { th: 'บันทึกค่าใช้จ่าย',              en: 'Record Expense',                 ko: '지출 기록' },
  report:      { th: 'รายงานบัญชี / งบดุล',           en: 'Accounting Report / Balance Sheet', ko: '회계 보고서 / 재무제표' },
  print:       { th: 'พิมพ์รายงานส่งบัญชี',           en: 'Print Accounting Report',        ko: '회계 보고서 인쇄' },
  view:        { th: 'ดูข้อมูลทั้งหมด',               en: 'View All Data',                  ko: '전체 데이터 보기' },
  add:         { th: 'เพิ่มข้อมูลใหม่',               en: 'Add New Data',                   ko: '새 데이터 추가' },
  add_customer:{ th: 'เพิ่มข้อมูลลูกค้า',             en: 'Add Customer',                   ko: '고객 정보 추가' },
  add_product: { th: 'เพิ่มข้อมูลสินค้า',             en: 'Add Product',                    ko: '제품 정보 추가' },
  sales_order: { th: 'สร้างใบสั่งขาย',               en: 'Create Sales Order',             ko: '판매 주문 작성' },
  crm:         { th: 'บันทึกอัพเดตลูกค้าสัมพันธ์',   en: 'Update Customer Relations',      ko: '고객 관계 업데이트' },
  feedback:    { th: 'รายงานปัญหา / ฟีดแบ็คลูกค้า',  en: 'Issue Report / Customer Feedback', ko: '문제 보고 / 고객 피드백' },
  contract:             { th: 'สร้างสัญญาซื้อ-ขาย',                en: 'Create Sale Contract',           ko: '매매 계약서 작성' },
  stock_report:         { th: 'รายงานสต๊อกสินค้าคงเหลือ',         en: 'Stock Report',                   ko: '재고 현황 보고서' },
  registrations_report: { th: 'ตารางรายงานผู้ติดต่อลงทะเบียน',   en: 'Registration Contact Report',    ko: '등록 연락처 보고서' },
  contracts_list:       { th: 'รายการสัญญา',                       en: 'Contracts List',                 ko: '계약 목록' },
};

const ui18n = {
  th: { exit: 'กลับ', soon: 'อยู่ระหว่างพัฒนา', soonSub: 'หน้านี้กำลังถูกสร้าง', clickView: 'คลิกเพื่อดูข้อมูล' },
  en: { exit: 'Back',  soon: 'Under Development', soonSub: 'This page is being built', clickView: 'Click to view data' },
  ko: { exit: '뒤로',  soon: '개발 중', soonSub: '이 페이지는 구축 중입니다', clickView: '클릭하여 데이터 보기' },
};

const LANGS = [
  { code: 'th', label: 'ไทย' },
  { code: 'en', label: 'EN' },
  { code: 'ko', label: '한국어' },
];

export default function DeptDashboard() {
  const { deptId } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState('th');
  const [deptToken, setDeptToken] = useState(() => sessionStorage.getItem(`deptToken_${deptId}`));

  const dept = deptMeta.find(d => d.id === deptId);
  const deptIdx = deptMeta.indexOf(dept);
  const labels = (deptI18n[lang] || deptI18n.th).depts[deptIdx];
  const ownerMenus = (deptI18n[lang] || deptI18n.th).ownerMenus;
  const t = ui18n[lang] || ui18n.th;

  if (!dept) {
    navigate('/sp/admin-sp/dashboard', { replace: true });
    return null;
  }

  const isOwner = dept.id === 'service';
  const menuList = (deptMenus[dept.id] || deptMenus.default)[lang] || (deptMenus[dept.id] || deptMenus.default).th;

  if (!deptToken) {
    return (
      <DeptLoginModal
        dept={dept}
        labels={labels}
        lang={lang}
        onClose={() => navigate('/sp/admin-sp/dashboard')}
        onSuccess={(token) => {
          sessionStorage.setItem(`deptToken_${deptId}`, token);
          setDeptToken(token);
        }}
      />
    );
  }

  return (
    <DeptDashboardUI
      dept={dept}
      labels={labels}
      ownerMenus={ownerMenus}
      token={deptToken}
      lang={lang}
      setLang={setLang}
      menuList={menuList}
      isOwner={isOwner}
      t={t}
      deptId={deptId}
      navigate={navigate}
    />
  );
}

function DeptDashboardUI({ dept, labels, ownerMenus, token, lang, setLang, menuList, isOwner, t, deptId, navigate }) {
  const [active, setActive] = useState(menuList[0].id);
  const activeMenu = menuList.find(m => m.id === active);
  const ActiveIcon = activeMenu?.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top Bar */}
      <div className={`bg-gradient-to-r ${dept.color} text-white px-6 py-3 flex items-center justify-between shadow-lg shrink-0`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sp/admin-sp/dashboard')}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <dept.icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">{labels?.title}</p>
            <p className="text-white/70 text-xs font-mono">/sp/admin-sp/dept/{deptId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/10 rounded-full px-1 py-1">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  lang === l.code ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate('/sp/admin-sp/dashboard')}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-xs transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            {t.exit}
          </button>
        </div>
      </div>

      {isOwner ? (
        /* Owner full access */
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1">{labels?.title}</h2>
            <p className="text-gray-500 text-sm mb-6">{labels?.desc}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {ownerMenus.map((menu) => (
                <button
                  key={menu.label}
                  className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
                >
                  <span className="text-3xl">{menu.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{menu.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.clickView}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Tab Bar */}
          <div className="bg-white border-b border-gray-200 shrink-0 overflow-x-auto">
            <div className="flex min-w-max px-2">
              {menuList.map((menu) => {
                const Icon = menu.icon;
                const isTab = active === menu.id;
                return (
                  <button
                    key={menu.id}
                    onClick={() => setActive(menu.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                      isTab
                        ? `border-current ${dept.text} bg-gray-50`
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {menu.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto">
            <div className={(active === 'registrations_report' || active === 'contracts_list' || active === 'sales_orders_list') ? 'w-full px-4 py-6' : 'max-w-4xl mx-auto px-4 py-8'}>
              <div className="flex items-center gap-3 mb-6">
                {ActiveIcon && (
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dept.color} flex items-center justify-center shadow`}>
                    <ActiveIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{pageContent[active]?.[lang] || activeMenu?.label}</h2>
                  <p className="text-xs text-gray-400 font-mono">/sp/admin-sp/dept/{deptId}/{active}</p>
                </div>
              </div>

              {active === 'add_customer' ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <AddCustomerForm token={token} lang={lang} deptColor={dept.color} />
                </div>
              ) : active === 'add_product' ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <AddProductForm token={token} lang={lang} deptColor={dept.color} />
                </div>
              ) : active === 'stock_report' ? (
                <StockReport token={token} lang={lang} deptColor={dept.color} />
              ) : active === 'products_list' ? (
                <ProductsList token={token} lang={lang} />
              ) : active === 'customers_list' ? (
                <CustomersList token={token} lang={lang} />
              ) : active === 'sales_orders_list' ? (
                <SalesOrdersList token={token} lang={lang} />
              ) : active === 'contracts_list' ? (
                <ContractsList token={token} lang={lang} />
              ) : active === 'sales_order' ? (
                <SalesOrder token={token} lang={lang} deptColor={dept.color} />
              ) : active === 'contract' ? (
                <ContractPanel token={token} lang={lang} deptColor={dept.color} />
              ) : active === 'crm' ? (
                <SalesOrdersCRM token={token} lang={lang} deptColor={dept.color} />
              ) : active === 'feedback' ? (
                <FeedbackPanel token={token} lang={lang} deptColor={dept.color} />
              ) : active === 'registrations_report' ? (
                <RegistrationsReport token={token} lang={lang} />
              ) : (
                <div className={`rounded-2xl border-2 border-dashed ${dept.border} ${dept.bg} p-12 text-center`}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${dept.color} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                    {ActiveIcon && <ActiveIcon className="w-8 h-8 text-white" />}
                  </div>
                  <p className={`text-lg font-bold ${dept.text} mb-1`}>{t.soon}</p>
                  <p className="text-sm text-gray-400">{t.soonSub}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
