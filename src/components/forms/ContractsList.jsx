import { apiFetch } from '../../lib/api.js'
import { useEffect, useState } from 'react'
import { Eye, Printer, X } from 'lucide-react'

const i18n = {
  th: {
    title: 'รายการสัญญา', cntNo: 'เลขที่สัญญา', customer: 'ลูกค้า', subject: 'หัวข้อ', startDate: 'วันเริ่ม', endDate: 'วันสิ้นสุด', status: 'สถานะ', empty: 'ไม่มีข้อมูล', count: 'รายการทั้งหมด', search: 'ค้นหา CNT / ลูกค้า...',
    action: 'การทำงาน', view: 'วิว', print: 'ปริ้น', close: 'ปิด', note: 'หมายเหตุ',
    contractTitle: 'สัญญาซื้อ-ขาย', contractSubTitle: 'สัญญาซื้อ-ขายสินค้า / Sale-Purchase Contract',
    contractDate: 'วันที่ทำสัญญา', address: 'ที่อยู่', taxId: 'เลขภาษี', content: 'เนื้อหาสัญญา',
    sellerSign: 'ผู้ขาย', buyerSign: 'ผู้ซื้อ',
    footerTitle: 'ลงลายมือชื่อคู่สัญญา',
    signLine: 'ลายมือชื่อ',
    signDate: 'วันที่',
    noteLegal: 'สัญญาฉบับนี้จัดทำขึ้นเพื่อเป็นหลักฐานการตกลงซื้อ-ขายและมีผลบังคับทางกฎหมายครบถ้วน หากฝ่ายใดฝ่ายหนึ่งผิดสัญญา สามารถดำเนินการตามกฎหมายได้',
  },
  en: {
    title: 'Contracts List', cntNo: 'Contract No.', customer: 'Customer', subject: 'Subject', startDate: 'Start', endDate: 'End', status: 'Status', empty: 'No data', count: 'Total', search: 'Search CNT / customer...',
    action: 'Action', view: 'View', print: 'Print', close: 'Close', note: 'Note',
    contractTitle: 'Sale Contract', contractSubTitle: 'Sale-Purchase Contract',
    contractDate: 'Contract Date', address: 'Address', taxId: 'Tax ID', content: 'Contract Content',
    sellerSign: 'Seller', buyerSign: 'Buyer',
    footerTitle: 'Contract Signatures',
    signLine: 'Signature',
    signDate: 'Date',
    noteLegal: 'This contract is executed as evidence of the purchase and sale agreement and has full legal force. If either party breaches this contract, legal remedies may be pursued accordingly.',
  },
  ko: {
    title: '계약 목록', cntNo: '계약 번호', customer: '고객', subject: '제목', startDate: '시작', endDate: '종료', status: '상태', empty: '데이터 없음', count: '전체', search: 'CNT / 고객 검색...',
    action: '작업', view: '보기', print: '인쇄', close: '닫기', note: '메모',
    contractTitle: '매매 계약서', contractSubTitle: '매매 계약서 / Sale-Purchase Contract',
    contractDate: '계약일', address: '주소', taxId: '사업자번호', content: '계약 내용',
    sellerSign: '판매자', buyerSign: '구매자',
    footerTitle: '당사자 서명',
    signLine: '서명',
    signDate: '날짜',
    noteLegal: '본 계약서는 매매 계약의 증거로서 작성되며 완전한 법적 효력을 가집니다. 계약 당사자 중 한쪽이 계약을 위반할 경우, 관련 법에 따라 법적 조치를 취할 수 있습니다.',
  },
}

const STATUS_COLOR = {
  active:    'bg-green-100 text-green-700',
  draft:     'bg-gray-100 text-gray-700',
  expired:   'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
}
const STATUS_LABELS = {
  th: { active: 'ใช้งาน', draft: 'ร่าง', expired: 'หมดอายุ', cancelled: 'ยกเลิก' },
  en: { active: 'Active', draft: 'Draft', expired: 'Expired', cancelled: 'Cancelled' },
  ko: { active: '사용중', draft: '임시', expired: '만료', cancelled: '취소' },
}

const DATE_LOCALE = { th: 'th-TH', en: 'en-US', ko: 'ko-KR' }

const DEFAULT_TITLES = {
  th: 'สัญญาซื้อ-ขายสินค้า',
  en: 'Sale-Purchase Contract',
  ko: '매매계약서',
}

const localizeContractTitle = (title, lang) => {
  const raw = String(title || '').trim()
  if (!raw) return '—'
  const known = Object.values(DEFAULT_TITLES)
  return known.includes(raw) ? DEFAULT_TITLES[lang] || DEFAULT_TITLES.th : raw
}

const CONTRACT_TEMPLATE_BY_LANG = {
  th: `สัญญาฉบับนี้ทำขึ้นระหว่าง
{{seller_name}} (ต่อไปในสัญญาเรียกว่า “ผู้ขาย”)
และ คู่สัญญา {{customer_name}} (ต่อไปในสัญญาเรียกว่า “ผู้ซื้อ”)

ข้อมูลผู้ขาย
ชื่อผู้ขาย / บริษัท: {{seller_name}}
ที่อยู่: {{seller_address}}
เลขประจำตัวผู้เสียภาษี: {{seller_tax_id}}
ชื่อผู้ติดต่อ: {{seller_contact_name}}
เบอร์โทรบริษัท: {{seller_company_phone}}
เบอร์โทรผู้ติดต่อ: {{seller_contact_phone}}

ข้อมูลผู้ซื้อ
ชื่อลูกค้า / บริษัท: {{customer_name}}
ที่อยู่: {{customer_address}}
เลขประจำตัวผู้เสียภาษี: {{customer_tax_id}}
ชื่อผู้ติดต่อ: {{contact_name}}
เบอร์โทรบริษัท: {{company_phone}}
เบอร์โทรผู้ติดต่อ: {{contact_phone}}

โดยคู่สัญญาทั้งสองฝ่ายตกลงเงื่อนไขดังต่อไปนี้

ข้อ 1 การมีผลบังคับของสัญญา
สัญญาฉบับนี้ให้ถือว่ามีผลสมบูรณ์และมีผลผูกพันทางกฎหมายทันที เมื่อผู้ซื้อได้ทำการสั่งซื้อสินค้าและรับมอบสินค้าเรียบร้อยแล้ว โดยให้เริ่มนับตั้งแต่บิลแรกเป็นต้นไป

ข้อ 2 การต่ออายุสัญญา
สัญญานี้ให้มีการต่ออายุโดยอัตโนมัติ หากผู้ซื้อยังคงมีการสั่งซื้อสินค้าและชำระเงินตามเงื่อนไขที่กำหนดไว้อย่างต่อเนื่อง โดยไม่จำเป็นต้องจัดทำสัญญาฉบับใหม่

ข้อ 3 การยอมรับสัญญา
คู่สัญญาทั้งสองฝ่ายตกลงให้ถือว่า ลายเซ็นในใบสั่งซื้อสินค้า ใบส่งมอบสินค้า และเอกสารที่เกี่ยวข้องในบิลแรก เป็นหลักฐานแสดงถึงการยอมรับเงื่อนไข และถือว่าได้ทำสัญญาซื้อขายร่วมกันโดยสมบูรณ์แล้ว

ข้อ 4 เงื่อนไขการชำระเงิน
ผู้ซื้อตกลงชำระค่าสินค้าตามจำนวนและภายในระยะเวลาที่กำหนดไว้ในใบแจ้งหนี้ (Invoice) หรือเอกสารที่เกี่ยวข้อง โดยให้ถือว่าเงื่อนไขการชำระเงินดังกล่าวเป็นส่วนหนึ่งของสัญญานี้
การชำระเงินจะต้องดำเนินการให้ครบถ้วนตามจำนวน โดยไม่มีการหักกลบลบหนี้ เว้นแต่จะได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ขาย
ในกรณีที่ผู้ซื้อมีหนี้ค้างชำระ ผู้ขายมีสิทธิระงับการส่งมอบสินค้าเพิ่มเติมได้ทันที โดยไม่ถือเป็นการผิดสัญญา

ข้อ 5 ค่าปรับและดอกเบี้ยกรณีผิดนัดชำระ
ในกรณีที่ผู้ซื้อไม่ชำระเงินภายในกำหนดระยะเวลาที่ตกลงกัน ผู้ซื้อตกลงชำระดอกเบี้ยผิดนัดในอัตราร้อยละ 15 ต่อปี ของยอดเงินค้างชำระ นับตั้งแต่วันครบกำหนดชำระจนกว่าจะชำระเสร็จสิ้น
นอกจากนี้ ผู้ซื้อยินยอมชำระค่าปรับเพิ่มเติมในอัตราร้อยละ 2 ต่อเดือน ของยอดเงินค้างชำระ (หรืออัตราสูงสุดตามที่กฎหมายกำหนด) จนกว่าจะชำระครบถ้วน
ทั้งนี้ ผู้ซื้อยินยอมรับผิดชอบค่าใช้จ่ายในการติดตามทวงถามหนี้ ค่าทนายความ และค่าใช้จ่ายทางกฎหมายอื่น ๆ ทั้งหมดที่เกิดขึ้นจากการผิดนัดชำระ

ข้อ 6 การผิดสัญญาและการบังคับใช้กฎหมาย
ในกรณีที่ผู้ซื้อผิดนัดชำระเงิน หรือไม่ปฏิบัติตามเงื่อนไขที่ตกลงกันไว้ ผู้ซื้อยินยอมให้ผู้ขายดำเนินการตามกฎหมายได้ทันที และตกลงรับผิดชอบค่าเสียหาย ค่าใช้จ่าย ค่าธรรมเนียม รวมถึงค่าดำเนินการทางกฎหมายทั้งหมดที่เกิดขึ้นจากการผิดสัญญาดังกล่าว

ข้อ 7 การไกล่เกลี่ย ชดใช้หนี้ และการผ่อนชำระหลังไกล่เกลี่ย
ในกรณีที่เกิดข้อพิพาท หรือมีหนี้ค้างชำระ คู่สัญญาทั้งสองฝ่ายตกลงให้มีการเจรจาไกล่เกลี่ยกันก่อนดำเนินการทางกฎหมาย
หากผลการไกล่เกลี่ยนำไปสู่การตกลงชำระหนี้ ไม่ว่าทั้งจำนวนหรือบางส่วน ให้ถือว่า ใบแจ้งหนี้ (Invoice) และ/หรือเอกสารที่เกี่ยวข้อง ซึ่งระบุรายละเอียดจำนวนหนี้ เงื่อนไขการชำระ และกำหนดระยะเวลา เป็นส่วนหนึ่งของข้อตกลงดังกล่าว

และให้ถือว่าเนื้อหาที่ระบุในใบแจ้งหนี้ดังกล่าว เป็นสัญญาการผ่อนชำระหนี้ที่มีผลผูกพันทางกฎหมายทันทีภายหลังการไกล่เกลี่ย โดยผู้ซื้อยินยอมปฏิบัติตามเงื่อนไขดังกล่าวทุกประการ

ในกรณีที่ผู้ซื้อผิดนัดตามข้อตกลงการผ่อนชำระหนี้ ผู้ขายมีสิทธิเรียกให้ชำระหนี้ทั้งหมดที่คงค้างในทันที พร้อมดอกเบี้ย ค่าปรับ และค่าเสียหายที่เกี่ยวข้อง และสามารถดำเนินการตามกฎหมายได้โดยไม่ต้องแจ้งให้ทราบล่วงหน้า`,
  en: `This contract is made between
{{seller_name}} (hereinafter referred to as the “Seller”)
and {{customer_name}} (hereinafter referred to as the “Buyer”)

Seller Information
Seller / Company: {{seller_name}}
Address: {{seller_address}}
Tax ID: {{seller_tax_id}}
Contact Name: {{seller_contact_name}}
Company Phone: {{seller_company_phone}}
Contact Phone: {{seller_contact_phone}}

Buyer Information
Customer / Company: {{customer_name}}
Address: {{customer_address}}
Tax ID: {{customer_tax_id}}
Contact Name: {{contact_name}}
Company Phone: {{company_phone}}
Contact Phone: {{contact_phone}}

Both parties agree to the following terms:

Clause 1 Effective Date
This agreement becomes complete and legally binding immediately once the Buyer places an order and receives goods, starting from the first invoice.

Clause 2 Automatic Renewal
This agreement shall renew automatically while the Buyer continues ordering goods and making payments under agreed terms without requiring a new contract.

Clause 3 Acceptance
Signatures on purchase orders, delivery documents, and documents related to the first invoice shall be deemed evidence of acceptance and formation of this agreement.

Clause 4 Payment Terms
The Buyer agrees to pay according to invoice terms. Such payment terms are part of this contract. Payment must be made in full without set-off unless the Seller gives written consent. The Seller may suspend further delivery if the Buyer has overdue debt.

Clause 5 Default Interest and Penalty
If payment is overdue, the Buyer agrees to pay default interest at 15% per annum on the overdue amount from due date until full payment. Additionally, the Buyer agrees to pay penalty at 2% per month on overdue amount (or maximum rate allowed by law). The Buyer is responsible for debt collection costs, attorney fees, and legal expenses.

Clause 6 Breach and Legal Enforcement
If the Buyer breaches payment or other agreed terms, the Seller may immediately pursue legal action, and the Buyer shall bear damages, costs, fees, and legal expenses arising from such breach.

Clause 7 Mediation and Installment after Mediation
In case of dispute or overdue debt, both parties agree to attempt mediation before legal action. If mediation results in repayment agreement, invoices and related documents specifying debt amount, terms, and period are deemed part of such agreement and legally binding. If the Buyer defaults under installment terms, the Seller may demand immediate full payment plus interest, penalty, and damages and proceed by law without prior notice.`,
  ko: `본 계약은 다음 당사자 간에 체결됩니다.
{{seller_name}} (이하 “판매자”)
및 {{customer_name}} (이하 “구매자”)

판매자 정보
판매자 / 회사명: {{seller_name}}
주소: {{seller_address}}
사업자번호: {{seller_tax_id}}
담당자명: {{seller_contact_name}}
회사 전화번호: {{seller_company_phone}}
담당자 전화번호: {{seller_contact_phone}}

구매자 정보
고객 / 회사명: {{customer_name}}
주소: {{customer_address}}
사업자번호: {{customer_tax_id}}
담당자명: {{contact_name}}
회사 전화번호: {{company_phone}}
담당자 전화번호: {{contact_phone}}

양 당사자는 다음 조건에 합의합니다.

제1조 계약의 효력
본 계약은 구매자가 상품을 주문하고 인도받는 즉시, 첫 번째 청구서를 기준으로 완전하고 법적으로 유효하게 효력이 발생합니다.

제2조 계약의 자동 연장
구매자가 계속해서 주문 및 약정된 조건에 따라 결제를 이행하는 경우, 본 계약은 별도 계약서 작성 없이 자동 연장됩니다.

제3조 계약의 수락
첫 번째 청구서 관련 주문서, 납품서 및 관련 문서의 서명은 본 계약 조건 수락 및 계약 성립의 증거로 간주됩니다.

제4조 결제 조건
구매자는 인보이스 또는 관련 문서의 조건에 따라 대금을 지급하며, 해당 결제 조건은 본 계약의 일부로 간주됩니다. 서면 동의 없이는 상계할 수 없으며, 연체 시 판매자는 추가 납품을 즉시 중단할 수 있습니다.

제5조 연체이자 및 위약금
기한 내 미지급 시, 구매자는 연체 금액에 대해 연 15%의 연체이자를 지급합니다. 또한 연체 금액에 대해 월 2%의 위약금(또는 법정 최고율)을 지급하며, 채권 추심비·변호사비·기타 법적 비용을 부담합니다.

제6조 계약 위반 및 법적 집행
구매자가 결제 또는 기타 조건을 위반하는 경우 판매자는 즉시 법적 조치를 취할 수 있으며, 구매자는 손해·비용·수수료·법적 집행 비용을 부담합니다.

제7조 조정 및 조정 후 분할상환
분쟁 또는 연체 발생 시 법적 절차 전에 조정을 우선합니다. 조정 결과 상환 합의가 이루어지면, 채무 금액·조건·기한이 명시된 인보이스 및 관련 문서는 합의의 일부로서 법적 구속력을 가집니다. 구매자가 분할상환 합의를 위반하면, 판매자는 잔액 전액과 이자·위약금·손해배상을 즉시 청구하고 사전 통지 없이 법적 조치를 진행할 수 있습니다.`,
}

const textOrDash = value => {
  const v = String(value ?? '').trim()
  return v || '-'
}

const buildContractContent = (values, lang) => {
  const template = CONTRACT_TEMPLATE_BY_LANG[lang] || CONTRACT_TEMPLATE_BY_LANG.th
  const replacements = {
    '{{seller_name}}': textOrDash(values.seller_name),
    '{{seller_address}}': textOrDash(values.seller_address),
    '{{seller_tax_id}}': textOrDash(values.seller_tax_id),
    '{{seller_contact_name}}': textOrDash(values.seller_contact_name),
    '{{seller_company_phone}}': textOrDash(values.seller_company_phone),
    '{{seller_contact_phone}}': textOrDash(values.seller_contact_phone),
    '{{customer_name}}': textOrDash(values.customer_name),
    '{{customer_address}}': textOrDash(values.customer_address),
    '{{customer_tax_id}}': textOrDash(values.customer_tax_id),
    '{{contact_name}}': textOrDash(values.contact_name),
    '{{company_phone}}': textOrDash(values.company_phone),
    '{{contact_phone}}': textOrDash(values.contact_phone),
  }

  let content = template
  for (const [token, value] of Object.entries(replacements)) {
    content = content.replaceAll(token, value)
  }
  return content
}

function PrintView({ row, onClose, t, lang, onChangeLang }) {
  const dateLocale = DATE_LOCALE[lang] || 'th-TH'
  const statusLabel = (STATUS_LABELS[lang] || STATUS_LABELS.th)[row.status] || row.status || (STATUS_LABELS[lang] || STATUS_LABELS.th).draft
  const printContent = buildContractContent(row, lang)
  const localizedTitle = localizeContractTitle(row.title, lang)
  return (
    <div className="print-modal-root fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm;
        }
        @media print {
          html,
          body {
            width: 210mm;
            min-height: 297mm;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          .print-modal-root,
          .print-modal-root * {
            visibility: visible;
          }
          .print-modal-root {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: auto !important;
            bottom: auto !important;
            background: transparent !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #print-area,
          #print-area * {
            visibility: visible;
          }
          #print-area {
            position: relative;
            width: 194mm !important;
            max-width: 194mm !important;
            min-height: auto;
            height: auto !important;
            max-height: none !important;
            margin: 0 auto !important;
            padding: 3mm 4mm !important;
            box-sizing: border-box !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          .print-compact {
            font-size: 11px;
            line-height: 1.2;
          }
          .print-content-limit {
            max-height: none;
            overflow: visible;
            page-break-inside: auto;
          }
          .print-keep {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
      <div className="print-compact bg-white rounded-2xl p-8 max-w-[820px] w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" id="print-area">
        <div className="sticky top-0 z-10 -mx-3 px-3 py-2 bg-white/95 backdrop-blur border-b border-gray-100 mb-4 print:hidden">
          <div className="flex justify-between items-center gap-3">
            <h3 className="font-bold text-lg text-gray-900">{t.contractTitle}</h3>
            <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 border border-gray-200">
              <button
                type="button"
                onClick={() => onChangeLang('th')}
                className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${lang === 'th' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                ไทย
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('ko')}
                className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${lang === 'ko' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                한국어
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${lang === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                EN
              </button>
            </div>
              <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                <Printer className="w-3.5 h-3.5" /> {t.print}
              </button>
              <button onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50">
                <X className="w-3.5 h-3.5" /> {t.close}
              </button>
            </div>
          </div>
        </div>
        <div className="border-b-2 border-gray-900/80 pb-3 mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo.jpg" alt="SP FOODS logo" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
            <p className="font-bold text-xl text-gray-900">SP FOODS CO., LTD.</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-700 text-sm">
            <p>{t.contractSubTitle}</p>
            <span>•</span>
            <span className="font-semibold">{statusLabel}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="space-y-1 bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p><span className="text-gray-500">{t.cntNo}:</span> <span className="font-bold text-gray-900">{row.contract_no}</span></p>
            <p><span className="text-gray-500">{t.subject}:</span> <span className="text-gray-900">{localizedTitle}</span></p>
            <p><span className="text-gray-500">{t.contractDate}:</span> <span className="text-gray-900">{row.contract_date ? new Date(row.contract_date).toLocaleDateString(dateLocale) : '—'}</span></p>
            <p><span className="text-gray-500">{t.startDate}:</span> <span className="text-gray-900">{row.start_date ? new Date(row.start_date).toLocaleDateString(dateLocale) : '—'}</span></p>
            <p><span className="text-gray-500">{t.endDate}:</span> <span className="text-gray-900">{row.end_date ? new Date(row.end_date).toLocaleDateString(dateLocale) : '—'}</span></p>
          </div>
          <div className="space-y-1 bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p><span className="text-gray-500">{t.customer}:</span> <span className="font-medium text-gray-900">{row.customer_name}</span></p>
            <p><span className="text-gray-500">{t.address}:</span> <span className="text-gray-900">{row.customer_address || '—'}</span></p>
            <p><span className="text-gray-500">{t.taxId}:</span> <span className="text-gray-900">{row.customer_tax_id || '—'}</span></p>
          </div>
        </div>
        {printContent && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-700 mb-2">{t.content}</p>
            <pre className="print-content-limit text-[11px] text-gray-800 whitespace-pre-wrap bg-white rounded-xl p-4 border-2 border-gray-200 leading-5">{printContent}</pre>
          </div>
        )}
        {t.noteLegal && (
          <div className="print-keep mb-5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm text-gray-700">
            <span className="font-semibold">{t.note}:</span> {t.noteLegal}
          </div>
        )}

        <div className="print-keep mt-6 border-t border-gray-300 pt-4">
          <p className="text-center text-[11px] font-semibold tracking-wide text-gray-700 mb-4">{t.footerTitle}</p>
          <div className="grid grid-cols-2 gap-8 mb-2 text-xs text-gray-700">
            <div className="text-center border border-gray-200 rounded-lg p-3 bg-gray-50">
              <p className="mb-7">.......................................................</p>
              <p className="font-semibold">{t.sellerSign}</p>
              <p className="text-[11px] text-gray-500 mt-2">{t.signLine} .......................................</p>
              <p className="text-[11px] text-gray-500">{t.signDate} .......................................</p>
            </div>
            <div className="text-center border border-gray-200 rounded-lg p-3 bg-gray-50">
              <p className="mb-7">.......................................................</p>
              <p className="font-semibold">{t.buyerSign}</p>
              <p className="text-[11px] text-gray-500 mt-2">{t.signLine} .......................................</p>
              <p className="text-[11px] text-gray-500">{t.signDate} .......................................</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function ContractsList({ token, lang }) {
  const t = i18n[lang] || i18n.th
  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView]     = useState(null)
  const [printLang, setPrintLang] = useState(lang)
  const [printPending, setPrintPending] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiFetch('/api/contracts', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const filtered = rows.filter(r =>
    (r.contract_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.title || '').toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (!printPending || !view) return
    const raf = requestAnimationFrame(() => {
      window.print()
      setPrintPending(false)
    })
    return () => cancelAnimationFrame(raf)
  }, [printPending, view, printLang])

  const openView = row => {
    setPrintLang(lang)
    setView(row)
  }

  const openPrint = row => {
    setPrintLang(lang)
    setView(row)
    setPrintPending(true)
  }

  if (loading) return <p className="text-center py-10 text-gray-500">Loading...</p>

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {view && <PrintView row={view} onClose={() => setView(null)} t={i18n[printLang] || i18n.th} lang={printLang} onChangeLang={setPrintLang} />}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{t.title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{t.count}: {filtered.length}</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 w-52"
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-center py-12 text-gray-400">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-800 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">{t.cntNo}</th>
                <th className="px-4 py-3 text-left">{t.customer}</th>
                <th className="px-4 py-3 text-left">{t.subject}</th>
                <th className="px-4 py-3 text-left">{t.startDate}</th>
                <th className="px-4 py-3 text-left">{t.endDate}</th>
                <th className="px-4 py-3 text-center">{t.status}</th>
                <th className="px-4 py-3 text-center">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{r.contract_no}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.customer_name}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate">{r.title || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{r.start_date ? new Date(r.start_date).toLocaleDateString(DATE_LOCALE[lang] || 'th-TH') : '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{r.end_date ? new Date(r.end_date).toLocaleDateString(DATE_LOCALE[lang] || 'th-TH') : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLOR[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {(STATUS_LABELS[lang] || STATUS_LABELS.th)[r.status] || r.status || (STATUS_LABELS[lang] || STATUS_LABELS.th).draft}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openView(r)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" /> {t.view}
                      </button>
                      <button
                        onClick={() => openPrint(r)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                      >
                        <Printer className="w-3.5 h-3.5" /> {t.print}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
