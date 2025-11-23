
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.genesis': 'MeeBot Genesis',
    'nav.mining': 'Mining Farm',
    'nav.chat': 'MeeBot Chat',
    'nav.governance': 'Governance',
    'nav.gifting': 'Gifting Center',
    'nav.migration': 'Migration',
    'nav.missions': 'Missions',
    'nav.analysis': 'Proposal Analysis',
    'nav.transparency': 'Transparency',
    'nav.origins': 'Hall of Origins',
    'nav.personas': 'Personas',
    'nav.settings': 'Settings',
    
    'title.dashboard': 'Dashboard',
    'title.genesis': 'MeeBot Genesis Ritual',
    'title.chat': 'MeeBot Chat',
    'title.governance': 'Governance Hub',
    'title.gifting': 'Gifting Center',
    'title.migration': 'Cross-Chain Migration',
    'title.missions': 'Missions',
    'title.analysis': 'Proposal Analysis',
    'title.origins': 'Hall of Origins',
    'title.settings': 'Settings',
    'title.personas': 'Persona Management',
    'title.mining': 'Mining Farm',
    'title.transparency': 'Transparency Report',
    'title.default': 'MeeChain',
  },
  th: {
    'nav.dashboard': 'แดชบอร์ด',
    'nav.genesis': 'กำเนิด MeeBot',
    'nav.mining': 'เหมืองขุด',
    'nav.chat': 'แชทกับ MeeBot',
    'nav.governance': 'การปกครอง',
    'nav.gifting': 'ศูนย์ของขวัญ',
    'nav.migration': 'ย้ายเชน',
    'nav.missions': 'ภารกิจ',
    'nav.analysis': 'วิเคราะห์ข้อเสนอ',
    'nav.transparency': 'ความโปร่งใส',
    'nav.origins': 'หอแห่งต้นกำเนิด',
    'nav.personas': 'บุคลิกภาพ',
    'nav.settings': 'ตั้งค่า',

    'title.dashboard': 'แดชบอร์ด',
    'title.genesis': 'พิธีกรรมกำเนิด MeeBot',
    'title.chat': 'แชทกับ MeeBot',
    'title.governance': 'ศูนย์กลางการปกครอง',
    'title.gifting': 'ศูนย์ของขวัญ',
    'title.migration': 'การย้ายข้ามเชน',
    'title.missions': 'ภารกิจ',
    'title.analysis': 'การวิเคราะห์ข้อเสนอ',
    'title.origins': 'หอแห่งต้นกำเนิด',
    'title.settings': 'ตั้งค่า',
    'title.personas': 'จัดการบุคลิกภาพ',
    'title.mining': 'ฟาร์มขุด',
    'title.transparency': 'รายงานความโปร่งใส',
    'title.default': 'MeeChain',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('meebot-language') as Language;
        if (stored === 'en' || stored === 'th') {
            setLanguage(stored);
        }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
        localStorage.setItem('meebot-language', lang);
    }
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
