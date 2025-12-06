
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Titles
    'nav.dashboard': 'Dashboard',
    'nav.home': 'Mining Farm',
    'nav.portfolio': 'Portfolio',
    'nav.genesis': 'MeeBot Genesis',
    'nav.mining': 'Mining Farm',
    'nav.chat': 'MeeBot Chat',
    'nav.governance': 'Governance',
    'nav.gifting': 'Gifting Center',
    'nav.migration': 'NFT Migration',
    'nav.defi': 'DeFi Station',
    'nav.missions': 'Missions',
    'nav.analysis': 'Proposal Analysis',
    'nav.transparency': 'Transparency',
    'nav.origins': 'Hall of Origins',
    'nav.personas': 'Personas',
    'nav.settings': 'Settings',
    'nav.perks': 'Perks Center',
    
    'title.dashboard': 'Dashboard',
    'title.portfolio': 'User Portfolio',
    'title.genesis': 'MeeBot Genesis Ritual',
    'title.chat': 'MeeBot Chat',
    'title.governance': 'Governance Hub',
    'title.gifting': 'Gifting Center',
    'title.migration': 'Cross-Chain NFT Migration',
    'title.defi': 'DeFi Station',
    'title.missions': 'Missions',
    'title.analysis': 'Proposal Analysis',
    'title.origins': 'Hall of Origins',
    'title.settings': 'Settings',
    'title.personas': 'Persona Management',
    'title.mining': 'Mining Farm',
    'title.transparency': 'Transparency Report',
    'title.redemption': 'Perks Center',
    'title.default': 'MeeChain',

    // Dashboard Content
    'dashboard.welcome': 'Welcome to MeeBot Genesis',
    'dashboard.subtitle': 'Your journey begins here. Create, visualize, and bring your unique MeeBot companions to life.',
    'dashboard.create_btn': 'Create your First MeeBot',
    'dashboard.badges': 'Badge Collection',
    'dashboard.badges_empty': 'No badges unlocked yet. Keep exploring!',
    'dashboard.proposals': 'Recent Proposals',
    'dashboard.timeline': 'Timeline',
    'dashboard.timeline_empty': 'No recent events found for this chain.',
    'dashboard.active_program': 'Active Mining Program',
    'dashboard.emotion_boost': 'Emotion Boost',
    'dashboard.view_on_chain': 'View on chain',
    'dashboard.current_emotion': 'Current Emotion',
    'dashboard.powered_by': 'Powered by MEECHAIN',
    'dashboard.proposals_empty': 'No proposals analyzed yet. Visit the Analysis page!',
    'dashboard.status_pending': 'Pending',
    'dashboard.status_confirmed': 'Confirmed',
    'dashboard.boost_energy_name': 'Energy Boost',
    'dashboard.boost_energy_desc': 'Increased chance for rare item discoveries.',
    'dashboard.boost_focus_name': 'Focus Boost',
    'dashboard.boost_focus_desc': 'Slightly improved proposal analysis summaries.',
    'dashboard.boost_stability_name': 'Stability Boost',
    'dashboard.boost_stability_desc': 'Reduced downtime during network turbulence.',

    // Genesis Content
    'genesis.define': 'Define Your MeeBot',
    'genesis.step1': 'Choose a Persona',
    'genesis.step2': 'Select an Art Style',
    'genesis.random_style': 'Randomize Style',
    'genesis.step3': 'Describe Your Vision',
    'genesis.placeholder': 'e.g., a small bot made of moss and stone, with glowing mushroom eyes',
    'genesis.step4': 'Set the Mood',
    'genesis.mood_placeholder': 'e.g., joyful, contemplative, energetic',
    'genesis.visualize': 'Visualize',
    'genesis.visualizing': 'Visualizing...',
    'genesis.mint': 'Mint as NFT',
    'genesis.minted': 'Minted!',
    'genesis.voice_test': 'Test MeeBot Voice',
    'genesis.type_voice': 'Type something for MeeBot to say...',
    'genesis.try_typing': 'Try typing in Thai (e.g., "สวัสดี") or Japanese (e.g., "こんにちは") to hear different voices.',
    'genesis.loading_1': 'Summoning your MeeBot from the digital ether...',
    'genesis.loading_2': 'Weaving pixels into a unique persona...',
    'genesis.loading_3': 'Consulting the art spirits of the blockchain...',
    'genesis.loading_4': 'Applying the final touches of digital paint...',
    'genesis.initial_state': 'Your MeeBot\'s visualization will appear here.',

    // Mining Content
    'mining.title': 'Mining Rig',
    'mining.subtitle': 'Secure the network, earn points, and evolve your miner status.',
    'mining.node_status': 'Node Status',
    'mining.start': 'START MINING',
    'mining.validating': 'Validating Block...',
    'mining.operator': 'Operator',
    'mining.current_level': 'Current Level',
    'mining.next_level': 'Next: Lvl',
    'mining.evolution_rack': 'Badge Evolution Rack',
    'mining.top_miners': 'Top Miners',
    'mining.connect_wallet': 'Connect Wallet',
    'mining.connecting': 'Connecting to Sepolia...',
    'mining.init_node': 'Initialize your node and synchronize with the neural network to begin your contribution.',
    'mining.hashrate': 'Hashrate (Sim)',
    'mining.uptime': 'Uptime',
    'mining.powered_by_nft': 'Powered by MeeBadgeNFT',
    'mining.erc1155': 'ERC-1155 Compatible',
    'mining.no_active': 'No Active Miner',
    'mining.mint_hint': 'Mint a MeeBot to enable avatar.',
    'mining.hashing': 'HASHING...',
    'mining.active': 'ACTIVE',
    'mining.idle': 'IDLE',
    
    // DeFi Content
    'defi.swap_tab': 'Swap',
    'defi.bridge_tab': 'Bridge',
    'defi.pay': 'You Pay',
    'defi.receive': 'You Receive',
    'defi.balance': 'Balance',
    'defi.max': 'MAX',
    'defi.select_token': 'Select Token',
    'defi.rate': 'Exchange Rate',
    'defi.slippage': 'Slippage Tolerance',
    'defi.network_fee': 'Network Fee',
    'defi.btn_swap': 'Swap Tokens',
    'defi.btn_bridge': 'Bridge Assets',
    'defi.source_chain': 'Source Chain',
    'defi.dest_chain': 'Destination Chain',
    'defi.processing': 'Processing Transaction...',
    'defi.success_swap': 'Swap Successful!',
    'defi.success_bridge': 'Bridge Initiated!',
    'defi.error_insufficient': 'Insufficient Balance',
    'defi.powered_by': 'Powered by MeeDex Protocol',
    'defi.simulation_banner': '⚠️ Transactions are simulated until you connect your wallet.',
    'defi.simulation_lock': '🔒 Simulation Mode - Connect Wallet for Real Transactions',

    // Settings Content
    'settings.title': 'Global Settings',
    'settings.system_connection': 'System Connection',
    'settings.simulation_mode': 'SIMULATION MODE',
    'settings.live_network': 'LIVE NETWORK',
    'settings.configure_backend': 'Configure Remote Backend',
    'settings.configure_desc': 'To enable live mining updates, leaderboard syncing, and governance features, please provide your Firebase configuration keys.',
    'settings.local_storage_note': '(This data is stored locally in your browser)',
    'settings.api_key': 'API KEY',
    'settings.project_id': 'PROJECT ID',
    'settings.auth_domain': 'AUTH DOMAIN',
    'settings.storage_bucket': 'STORAGE BUCKET',
    'settings.messaging_sender_id': 'MESSAGING SENDER ID',
    'settings.app_id': 'APP ID',
    'settings.save_connect': 'Save & Connect',
    'settings.disconnect': 'Disconnect',
    'settings.connection_active': 'Connection Active',
    'settings.connected_to': 'Your client is successfully configured to communicate with Project ID:',
    'settings.realtime_sync': 'Real-time mining data, leaderboards, and proposals are now being synced.',
    'settings.custom_instructions': 'MeeBot Custom Instructions',
    'settings.custom_desc': 'Customize MeeBot\'s behavior, style, and persona adaptation logic.',
    'settings.reset': 'Reset to default',
    'settings.save_changes': 'Save Changes',
    'settings.saved': 'Saved!',
  },
  th: {
    // Nav & Titles
    'nav.dashboard': 'แดชบอร์ด',
    'nav.home': 'เหมืองขุด',
    'nav.portfolio': 'พอร์ตโฟลิโอ',
    'nav.genesis': 'กำเนิด MeeBot',
    'nav.mining': 'เหมืองขุด',
    'nav.chat': 'แชทกับ MeeBot',
    'nav.governance': 'การปกครอง',
    'nav.gifting': 'ศูนย์ของขวัญ',
    'nav.migration': 'ย้าย NFT ข้ามเชน',
    'nav.defi': 'สถานี DeFi',
    'nav.missions': 'ภารกิจ',
    'nav.analysis': 'วิเคราะห์ข้อเสนอ',
    'nav.transparency': 'ความโปร่งใส',
    'nav.origins': 'หอแห่งต้นกำเนิด',
    'nav.personas': 'บุคลิกภาพ',
    'nav.settings': 'ตั้งค่า',
    'nav.perks': 'ศูนย์สิทธิพิเศษ',

    'title.dashboard': 'แดชบอร์ด',
    'title.portfolio': 'พอร์ตโฟลิโอผู้ใช้',
    'title.genesis': 'พิธีกรรมกำเนิด MeeBot',
    'title.chat': 'แชทกับ MeeBot',
    'title.governance': 'ศูนย์กลางการปกครอง',
    'title.gifting': 'ศูนย์ของขวัญ',
    'title.migration': 'การย้าย NFT ข้ามเชน',
    'title.defi': 'สถานี DeFi & Bridge',
    'title.missions': 'ภารกิจ',
    'title.analysis': 'การวิเคราะห์ข้อเสนอ',
    'title.origins': 'หอแห่งต้นกำเนิด',
    'title.settings': 'ตั้งค่า',
    'title.personas': 'จัดการบุคลิกภาพ',
    'title.mining': 'ฟาร์มขุด',
    'title.transparency': 'รายงานความโปร่งใส',
    'title.redemption': 'ศูนย์แลกสิทธิพิเศษ',
    'title.default': 'MeeChain',

    // Dashboard Content
    'dashboard.welcome': 'ยินดีต้อนรับสู่ MeeBot Genesis',
    'dashboard.subtitle': 'การเดินทางของคุณเริ่มต้นที่นี่ สร้างและนำ MeeBot ที่เป็นเอกลักษณ์ของคุณมาสู่โลกความจริง',
    'dashboard.create_btn': 'สร้าง MeeBot ตัวแรกของคุณ',
    'dashboard.badges': 'คอลเลกชันตราประทับ',
    'dashboard.badges_empty': 'ยังไม่มีตราประทับที่ปลดล็อค สำรวจต่อไป!',
    'dashboard.proposals': 'ข้อเสนอล่าสุด',
    'dashboard.timeline': 'ไทม์ไลน์',
    'dashboard.timeline_empty': 'ไม่พบเหตุการณ์ล่าสุดสำหรับเชนนี้',
    'dashboard.active_program': 'โปรแกรมขุดที่ใช้งานอยู่',
    'dashboard.emotion_boost': 'บูสต์อารมณ์',
    'dashboard.view_on_chain': 'ดูบนบล็อกเชน',
    'dashboard.current_emotion': 'อารมณ์ปัจจุบัน',
    'dashboard.powered_by': 'ขับเคลื่อนโดย MEECHAIN',
    'dashboard.proposals_empty': 'ยังไม่มีการวิเคราะห์ข้อเสนอ ไปที่หน้าวิเคราะห์เลย!',
    'dashboard.status_pending': 'กำลังดำเนินการ',
    'dashboard.status_confirmed': 'ยืนยันแล้ว',
    'dashboard.boost_energy_name': 'บูสต์พลังงาน (Energy)',
    'dashboard.boost_energy_desc': 'เพิ่มโอกาสในการค้นพบไอเทมหายาก',
    'dashboard.boost_focus_name': 'บูสต์สมาธิ (Focus)',
    'dashboard.boost_focus_desc': 'ปรับปรุงบทสรุปการวิเคราะห์ข้อเสนอให้ดียิ่งขึ้น',
    'dashboard.boost_stability_name': 'บูสต์ความมั่นคง (Stability)',
    'dashboard.boost_stability_desc': 'ลดเวลาหยุดทำงานระหว่างความผันผวนของเครือข่าย',

    // Genesis Content
    'genesis.define': 'กำหนด MeeBot ของคุณ',
    'genesis.step1': 'เลือกบุคลิก (Persona)',
    'genesis.step2': 'เลือกสไตล์ศิลปะ',
    'genesis.random_style': 'สุ่มสไตล์',
    'genesis.step3': 'บรรยายวิสัยทัศน์ของคุณ',
    'genesis.placeholder': 'เช่น บอทขนาดเล็กที่ทำจากมอสและหิน มีดวงตาเป็นเห็ดเรืองแสง',
    'genesis.step4': 'กำหนดอารมณ์',
    'genesis.mood_placeholder': 'เช่น ร่าเริง, ครุ่นคิด, กระตือรือร้น',
    'genesis.visualize': 'สร้างภาพจำลอง',
    'genesis.visualizing': 'กำลังสร้างภาพ...',
    'genesis.mint': 'มิ้นท์เป็น NFT',
    'genesis.minted': 'มิ้นท์สำเร็จ!',
    'genesis.voice_test': 'ทดสอบเสียง MeeBot',
    'genesis.type_voice': 'พิมพ์ข้อความเพื่อให้ MeeBot พูด...',
    'genesis.try_typing': 'ลองพิมพ์ภาษาไทย (เช่น "สวัสดี") หรือญี่ปุ่น (เช่น "こんにちは") เพื่อฟังเสียงที่แตกต่างกัน',
    'genesis.loading_1': 'กำลังอัญเชิญ MeeBot ของคุณจากความว่างเปล่าทางดิจิทัล...',
    'genesis.loading_2': 'กำลังถักทอพิกเซลให้เป็นบุคลิกที่เป็นเอกลักษณ์...',
    'genesis.loading_3': 'กำลังปรึกษาจิตวิญญาณแห่งศิลปะของบล็อกเชน...',
    'genesis.loading_4': 'กำลังลงสีดิจิทัลขั้นสุดท้าย...',
    'genesis.initial_state': 'ภาพจำลอง MeeBot ของคุณจะปรากฏที่นี่',

    // Mining Content
    'mining.title': 'เครื่องขุด (Mining Rig)',
    'mining.subtitle': 'รักษาความปลอดภัยเครือข่าย รับคะแนน และพัฒนาระดับนักขุดของคุณ',
    'mining.node_status': 'สถานะโหนด',
    'mining.start': 'เริ่มขุด',
    'mining.validating': 'กำลังตรวจสอบบล็อก...',
    'mining.operator': 'ผู้ควบคุม',
    'mining.current_level': 'เลเวลปัจจุบัน',
    'mining.next_level': 'ต่อไป: Lvl',
    'mining.evolution_rack': 'ชั้นวิวัฒนาการตราประทับ',
    'mining.top_miners': 'นักขุดยอดเยี่ยม',
    'mining.connect_wallet': 'เชื่อมต่อกระเป๋าเงิน',
    'mining.connecting': 'กำลังเชื่อมต่อ Sepolia...',
    'mining.init_node': 'เริ่มต้นโหนดของคุณและซิงโครไนซ์กับเครือข่ายประสาทเทียมเพื่อเริ่มการมีส่วนร่วม',
    'mining.hashrate': 'แรงขุด (จำลอง)',
    'mining.uptime': 'อัปไทม์',
    'mining.powered_by_nft': 'ขับเคลื่อนโดย MeeBadgeNFT',
    'mining.erc1155': 'รองรับ ERC-1155',
    'mining.no_active': 'ไม่มีนักขุดที่ใช้งานอยู่',
    'mining.mint_hint': 'สร้าง MeeBot เพื่อเปิดใช้งานอวตาร',
    'mining.hashing': 'กำลังแฮช...',
    'mining.active': 'ทำงาน',
    'mining.idle': 'ว่าง',
    
    // DeFi Content
    'defi.swap_tab': 'แลกเปลี่ยน',
    'defi.bridge_tab': 'ข้ามเชน (Bridge)',
    'defi.pay': 'คุณจ่าย',
    'defi.receive': 'คุณได้รับ',
    'defi.balance': 'ยอดเงิน',
    'defi.max': 'สูงสุด',
    'defi.select_token': 'เลือกโทเค็น',
    'defi.rate': 'อัตราแลกเปลี่ยน',
    'defi.slippage': 'ค่าความคลาดเคลื่อน (Slippage)',
    'defi.network_fee': 'ค่าธรรมเนียมเครือข่าย',
    'defi.btn_swap': 'ยืนยันการแลกเปลี่ยน',
    'defi.btn_bridge': 'ยืนยันการข้ามเชน',
    'defi.source_chain': 'ต้นทาง',
    'defi.dest_chain': 'ปลายทาง',
    'defi.processing': 'กำลังดำเนินการ...',
    'defi.success_swap': 'แลกเปลี่ยนสำเร็จ!',
    'defi.success_bridge': 'เริ่มการข้ามเชนแล้ว!',
    'defi.error_insufficient': 'ยอดเงินไม่เพียงพอ',
    'defi.powered_by': 'ขับเคลื่อนโดย MeeDex Protocol',
    'defi.simulation_banner': '⚠️ ธุรกรรมนี้เป็นการจำลองจนกว่าจะเชื่อมต่อกระเป๋าเงิน',
    'defi.simulation_lock': '🔒 ธุรกรรมนี้เป็นการจำลองจนกว่าจะเชื่อมต่อกระเป๋าเงิน',

    // Settings Content
    'settings.title': 'การตั้งค่าทั่วไป',
    'settings.system_connection': 'การเชื่อมต่อระบบ',
    'settings.simulation_mode': 'โหมดจำลอง (Simulation)',
    'settings.live_network': 'เครือข่ายจริง (Live)',
    'settings.configure_backend': 'ตั้งค่าการเชื่อมต่อ Backend',
    'settings.configure_desc': 'ระบุคีย์การตั้งค่า Firebase เพื่อเปิดใช้งานการอัปเดตการขุดแบบเรียลไทม์ กระดานผู้นำ และระบบการปกครอง',
    'settings.local_storage_note': '(ข้อมูลนี้จะถูกเก็บไว้ในเบราว์เซอร์ของคุณเท่านั้น)',
    'settings.api_key': 'API KEY',
    'settings.project_id': 'PROJECT ID',
    'settings.auth_domain': 'AUTH DOMAIN',
    'settings.storage_bucket': 'STORAGE BUCKET',
    'settings.messaging_sender_id': 'MESSAGING SENDER ID',
    'settings.app_id': 'APP ID',
    'settings.save_connect': 'บันทึกและเชื่อมต่อ',
    'settings.disconnect': 'ตัดการเชื่อมต่อ',
    'settings.connection_active': 'การเชื่อมต่อทำงานอยู่',
    'settings.connected_to': 'ไคลเอนต์ของคุณได้รับการตั้งค่าให้สื่อสารกับ Project ID:',
    'settings.realtime_sync': 'กำลังซิงค์ข้อมูลการขุด กระดานผู้นำ และข้อเสนอแบบเรียลไทม์',
    'settings.custom_instructions': 'คำสั่งพิเศษสำหรับ MeeBot',
    'settings.custom_desc': 'ปรับแต่งพฤติกรรม สไตล์ และการปรับตัวของบุคลิกภาพ MeeBot',
    'settings.reset': 'รีเซ็ตเป็นค่าเริ่มต้น',
    'settings.save_changes': 'บันทึกการเปลี่ยนแปลง',
    'settings.saved': 'บันทึกแล้ว!',
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
