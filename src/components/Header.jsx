import React, { useState } from 'react';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const languages = [
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'my', label: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'km', label: 'ខ្មែរ', flag: '🇰🇭' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const navigation = [
    { name: t.nav.home, href: '#hero' },
    { name: t.nav.services, href: '#services' },
    { name: t.nav.products, href: '#products' },
    { name: t.nav.about, href: '#about' },
    { name: t.nav.contact, href: '#contact' },
    { name: t.nav.tracking, href: 'https://strong-dory-enabled.ngrok-free.app/sp/tracking', external: true },
    { name: t.nav.announce, href: '#announce', highlight: true },
  ];

  const currentLang = languages.find((l) => l.code === lang);

  return (
    <>
    <header className="fixed w-full top-0 z-50 bg-white shadow-md">
      <nav className="w-full px-4 lg:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <img src="/sp/logo.jpg" alt="SP FOODS CO.,LTD" className="h-8 w-8 rounded-full object-cover" />
            <div className="flex flex-col items-start">
              <span className="text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
                SP FOODS CO.,LTD
              </span>
              <span className="text-[10px] text-gray-500 font-medium leading-tight">{t.brandTagline}</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-3 flex-1 justify-center mx-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className={item.highlight
                  ? 'bg-primary text-white px-2.5 py-1 rounded-full text-xs font-bold hover:bg-orange-600 transition-colors whitespace-nowrap'
                  : 'text-gray-700 hover:text-primary transition-colors text-xs font-medium whitespace-nowrap px-1'}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Right side: Language + Buttons */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1.5 border border-gray-200 rounded-lg hover:border-primary hover:text-primary transition-colors text-xs font-medium text-gray-700"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{currentLang.flag} {currentLang.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors ${lang === l.code ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-700'}`}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a href="https://strong-dory-enabled.ngrok-free.app/sp/register-sp" target="_blank" rel="noopener noreferrer" className="btn-outline text-xs px-3 py-1.5">{t.login}</a>
            <a href="https://strong-dory-enabled.ngrok-free.app/sp/admin-sp" target="_blank" rel="noopener noreferrer" className="btn-primary text-xs px-3 py-1.5">{t.admin}</a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2"
          >
            {isOpen ? <X className="h-6 w-6 text-dark" /> : <Menu className="h-6 w-6 text-dark" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className={`block px-3 py-2 rounded-lg transition-colors ${item.highlight ? 'bg-primary text-white font-bold' : 'text-gray-700 hover:bg-light'}`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}

            {/* Mobile Language Switcher */}
            <div className="pt-2 border-t border-gray-100">
              <p className="px-3 py-1 text-xs text-gray-400 font-medium uppercase tracking-wide flex items-center gap-1">
                <Globe className="w-3 h-3" /> Language
              </p>
              <div className="grid grid-cols-3 gap-2 px-3 py-2">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setIsOpen(false); }}
                    className={`flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-colors ${lang === l.code ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-primary/10 hover:text-primary'}`}
                  >
                    <span className="text-lg">{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <a href="https://strong-dory-enabled.ngrok-free.app/sp/register-sp" target="_blank" rel="noopener noreferrer" className="btn-outline w-full mt-2 block text-center">{t.login}</a>
            <a href="https://strong-dory-enabled.ngrok-free.app/sp/admin-sp" target="_blank" rel="noopener noreferrer" className="btn-primary w-full mt-2 block text-center">{t.admin}</a>
          </div>
        )}
      </nav>

      {/* Close dropdown on outside click */}
      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
      )}
    </header>

</>
  );
}
