import React from 'react';
import { ArrowRight, Factory } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section id="hero" className="scroll-mt-14 pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-light via-white to-light min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full">
              <Factory className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold">{t.heroBadge}</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-dark leading-tight">
              <div className="flex items-center gap-4">
                <img src="/logo.jpg" alt="SP FOODS CO.,LTD" className="w-16 h-16 rounded-full object-cover shadow-md" />
                SP FOODS CO.,LTD
              </div>
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-3xl md:text-4xl mt-2">
                {t.heroSubtitle}
              </span>
            </h1>

            <p className="text-lg text-gray-700 font-medium leading-relaxed">
              {t.heroDesc}
            </p>

            <p className="text-sm text-gray-600 leading-relaxed">
              {t.heroLongDesc}
            </p>

            <div className="flex flex-wrap gap-4 pt-8">
              <button className="btn-primary flex items-center space-x-2">
                <span>{t.orderBtn}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn-outline">{t.viewProductsBtn}</button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-12 border-t border-gray-200">
              <div>
                <p className="text-3xl font-bold text-primary">20+</p>
                <p className="text-gray-600">{t.statsYears}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">50+</p>
                <p className="text-gray-600">{t.statsProducts}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">3</p>
                <p className="text-gray-600">{t.statsContinents}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/main-Photo.jpg"
                alt="SP FOODS CO.,LTD"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
