import React from 'react';
import { Facebook, Instagram } from 'lucide-react';

function LineIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
    </svg>
  );
}

function TikTokIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
    </svg>
  );
}
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: t.nav.home, href: '#hero' },
    { label: t.nav.services, href: '#services' },
    { label: t.nav.products, href: '#products' },
    { label: t.nav.about, href: '#about' },
    { label: t.nav.contact, href: '#contact' },
  ];

  const productLinks = [t.prod1Name, t.prod2Name, t.prod3Name, t.prod4Name];

  return (
    <footer className="bg-dark text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/logo.jpg" alt="SP FOODS CO.,LTD" className="w-10 h-10 rounded-full object-cover border-2 border-white/20" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SP FOODS CO.,LTD
              </h3>
            </div>
            <p className="text-base font-semibold text-gray-300 mb-2">{t.brandTagline}</p>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{t.footerDesc}</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t.quickLinks}</h4>
            <ul className="space-y-2 text-gray-400">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-primary transition-colors">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t.nav.products}</h4>
            <ul className="space-y-2 text-gray-400">
              {productLinks.map((name, i) => (
                <li key={i}>
                  <a href="#products" className="hover:text-primary transition-colors">{name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t.followUs}</h4>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/spfoods.kr" target="_blank" rel="noopener noreferrer"
                className="p-3 bg-primary/20 hover:bg-primary rounded-full transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-3 bg-primary/20 hover:bg-primary rounded-full transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://lin.ee/58KUd6p" target="_blank" rel="noopener noreferrer"
                className="p-3 bg-primary/20 hover:bg-primary rounded-full transition-colors">
                <LineIcon className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@spfoods.kr?_r=1&_t=ZS-95zhS4BJdtC" target="_blank" rel="noopener noreferrer"
                className="p-3 bg-primary/20 hover:bg-primary rounded-full transition-colors">
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>&copy; {currentYear} SP FOODS CO.,LTD (ส.ภาวิณีร์ อีสานฟู้ดส์). {t.copyright}</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition-colors">{t.privacyPolicy}</a>
              <a href="#" className="hover:text-primary transition-colors">{t.termsOfUse}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
