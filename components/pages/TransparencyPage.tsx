
import React from 'react';
import { Shield, Code, Database, CheckCircle, ExternalLink, Server, Lock, FileText, Cpu, Award, Bot, ChevronRight, Globe } from 'lucide-react';

const ContractCard: React.FC<{ network: string; address: string; explorerUrl: string; status: 'Active' | 'Maintenance' }> = ({ network, address, explorerUrl, status }) => (
    <div className="p-4 mb-4 border rounded-lg bg-meebot-bg border-meebot-border">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-meebot-primary" />
                <span className="font-bold text-white">{network}</span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {status}
            </span>
        </div>
        <div className="flex items-center justify-between p-2 mb-2 font-mono text-xs rounded bg-meebot-surface text-meebot-text-secondary">
            <span className="truncate">{address}</span>
            <button 
                onClick={() => navigator.clipboard.writeText(address)}
                className="ml-2 hover:text-white"
                title="Copy Address"
            >
                <code className="text-[10px] border border-meebot-border px-1 rounded">COPY</code>
            </button>
        </div>
        <a 
            href={explorerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-xs transition-colors text-meebot-text-secondary hover:text-meebot-primary"
        >
            <ExternalLink className="w-3 h-3 mr-1" />
            Verify on Explorer
        </a>
    </div>
);

const MechanicSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="p-6 border shadow-lg bg-meebot-surface border-meebot-border rounded-xl hover:border-meebot-primary/50 transition-colors">
        <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 mr-4 rounded-full bg-meebot-primary/10">
                <Icon className="w-6 h-6 text-meebot-primary" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <div className="text-sm leading-relaxed text-meebot-text-secondary space-y-3">
            {children}
        </div>
    </div>
);

export const TransparencyPage: React.FC = () => {
  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
            <Shield className="w-12 h-12 mr-4 text-meebot-primary" />
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">คู่มือความโปร่งใส (Transparency Report)</h1>
                <p className="mt-2 text-meebot-text-secondary max-w-2xl">
                    MeeChain Mining System: Verifiable, Fair, and Open. <br/>
                    ระบบการขุดที่โปร่งใส ตรวจสอบได้ และเป็นธรรมสำหรับทุกคน
                </p>
            </div>
        </div>

        {/* Intro Card */}
        <div className="mb-8 p-6 bg-gradient-to-r from-meebot-surface to-meebot-bg border border-meebot-primary/30 rounded-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 bg-meebot-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
             <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-meebot-bg p-3 rounded-full border-2 border-meebot-primary shrink-0">
                    <Bot className="w-10 h-10 text-meebot-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white mb-2">สวัสดีครับ! ผม MeeBot หุ่นยนต์ประจำ MeeChain 🤖</h2>
                    <p className="text-meebot-text-secondary">
                        ยินดีต้อนรับสู่ระบบ Mining ที่โปร่งใสและเป็นธรรมของเรา ที่นี่ คุณสามารถตรวจสอบทุกการกระทำบนบล็อกเชนได้ด้วยตัวเอง!
                        เรายึดถือหลักการ <strong>"Code is Law"</strong> และความโปร่งใสเป็นหัวใจสำคัญ
                    </p>
                </div>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Contracts */}
            <div className="space-y-6 lg:col-span-1">
                <div className="p-6 border shadow-lg bg-meebot-surface border-meebot-border rounded-xl">
                    <h2 className="flex items-center mb-6 text-xl font-bold text-white">
                        <Code className="w-5 h-5 mr-2 text-meebot-accent" />
                        Smart Contracts
                    </h2>
                    <p className="text-xs text-meebot-text-secondary mb-4">
                        สัญญาอัจฉริยะที่ควบคุมระบบการขุด ตรวจสอบได้บน Explorer
                    </p>
                    <ContractCard 
                        network="Sepolia Testnet" 
                        address="0x71C...9A21" 
                        explorerUrl="https://sepolia.etherscan.io/" 
                        status="Active" 
                    />
                    <ContractCard 
                        network="Fuse Network" 
                        address="0xA4B...221C" 
                        explorerUrl="https://explorer.fuse.io/" 
                        status="Active" 
                    />
                    <ContractCard 
                        network="BNB Chain" 
                        address="0x99D...F120" 
                        explorerUrl="https://bscscan.com/" 
                        status="Active" 
                    />
                </div>

                <div className="p-6 border shadow-lg bg-meebot-surface border-meebot-border rounded-xl">
                    <h2 className="flex items-center mb-4 text-xl font-bold text-white">
                        <Lock className="w-5 h-5 mr-2 text-green-400" />
                        Security Measures
                    </h2>
                    <ul className="space-y-3">
                        <li className="flex items-start">
                            <CheckCircle className="w-4 h-4 mt-1 mr-2 text-green-400 shrink-0" />
                            <span className="text-sm text-meebot-text-secondary"><strong>Immutable Logic:</strong> Logic การคำนวณแต้มไม่สามารถแก้ไขได้หลัง Deploy</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="w-4 h-4 mt-1 mr-2 text-green-400 shrink-0" />
                            <span className="text-sm text-meebot-text-secondary"><strong>Signature Verification:</strong> ป้องกันการ Spam Mining ด้วยลายเซ็นดิจิทัล</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="w-4 h-4 mt-1 mr-2 text-green-400 shrink-0" />
                            <span className="text-sm text-meebot-text-secondary"><strong>Multi-sig Treasury:</strong> กองทุนรางวัลควบคุมโดย 3/5 Consensus</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Column: Mechanics Details (Thai Content) */}
            <div className="space-y-6 lg:col-span-2">
                
                <MechanicSection title="1. สูตร Level และ Points (Source of Truth)" icon={Cpu}>
                    <p>
                        คะแนนและเลเวลของคุณถูกกำหนดโดย <strong>Smart Contract</strong> บนบล็อกเชนโดยตรง ไม่ใช่แค่ในฐานข้อมูลของเรา 
                        ซึ่งหมายความว่าไม่มีใครสามารถโกงคะแนนได้
                    </p>
                    <div className="bg-meebot-bg p-4 rounded-lg border border-meebot-border my-3">
                        <h4 className="font-bold text-white mb-2 text-sm">เกณฑ์การคำนวณ (The Criteria)</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between border-b border-meebot-border/50 pb-2">
                                <span>⛏️ 1 การขุด (Mine Transaction)</span>
                                <span className="font-mono text-meebot-primary">= 1 Point</span>
                            </li>
                            <li className="flex justify-between pt-1">
                                <span>📈 Level Up</span>
                                <span className="font-mono text-meebot-primary">Every 10 Points</span>
                            </li>
                        </ul>
                    </div>
                    <p className="text-xs text-meebot-text-secondary/80">
                        🔍 <strong>วิธีตรวจสอบ:</strong> คุณสามารถตรวจสอบคะแนนปัจจุบันของ Wallet Address คุณได้โดยตรงผ่าน Explorer 
                        โดยเรียกใช้ฟังก์ชัน <code>miningPoints(address)</code> และ <code>miningLevel(address)</code> ของ Contract
                    </p>
                </MechanicSection>

                <MechanicSection title="2. การปลดล็อก NFT Badge (Badge Evolution)" icon={Award}>
                    <p>
                        NFT Badge คือเครื่องยืนยันความสำเร็จของคุณ มันถูก Mint และเก็บไว้บนบล็อกเชนจริง 
                        และจะถูกบันทึกในฐานข้อมูลของเราหลังจากที่ Event ถูกยืนยันแล้ว (Event-Driven Architecture)
                    </p>
                     <div className="overflow-x-auto mt-3">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-meebot-bg text-meebot-text-secondary">
                                <tr>
                                    <th className="px-4 py-2 rounded-tl-lg">Level Milestone</th>
                                    <th className="px-4 py-2">NFT Badge</th>
                                    <th className="px-4 py-2 rounded-tr-lg">Token ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-meebot-border">
                                <tr className="hover:bg-meebot-bg/50">
                                    <td className="px-4 py-2">Level 1</td>
                                    <td className="px-4 py-2 font-bold text-orange-400">🏅 Bronze Miner</td>
                                    <td className="px-4 py-2 font-mono">#1</td>
                                </tr>
                                <tr className="hover:bg-meebot-bg/50">
                                    <td className="px-4 py-2">Level 5</td>
                                    <td className="px-4 py-2 font-bold text-gray-300">🥈 Silver Miner</td>
                                    <td className="px-4 py-2 font-mono">#5</td>
                                </tr>
                                <tr className="hover:bg-meebot-bg/50">
                                    <td className="px-4 py-2">Level 10</td>
                                    <td className="px-4 py-2 font-bold text-yellow-400">🥇 Gold Miner</td>
                                    <td className="px-4 py-2 font-mono">#10</td>
                                </tr>
                                <tr className="hover:bg-meebot-bg/50">
                                    <td className="px-4 py-2">Level 20</td>
                                    <td className="px-4 py-2 font-bold text-purple-400">🌟 Legend Miner</td>
                                    <td className="px-4 py-2 font-mono">#25</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-meebot-text-secondary/80 mt-3">
                        📜 <strong>ตรวจสอบการ Mint:</strong> ทุกการ Mint NFT Badge จะถูกออกเป็น Event ชื่อ <code>Transfer</code> บนบล็อกเชน 
                        (From: 0x00...00, To: Your Wallet).
                    </p>
                </MechanicSection>

                <MechanicSection title="3. ความโปร่งใสของข้อมูลบน Leaderboard (Firestore)" icon={Database}>
                    <p>
                        เราใช้ <strong>Google Cloud Firestore</strong> เพื่อแสดงผลข้อมูลแบบ Real-time (Leaderboard) เพื่อประสบการณ์ใช้งานที่ลื่นไหล 
                        แต่ข้อมูลนี้เป็นเพียง "เงา" (Shadow Data) ของข้อมูลจริงบน Blockchain
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="p-3 bg-meebot-bg border border-meebot-border rounded-lg">
                            <h5 className="font-bold text-green-400 mb-1 text-xs flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Public Read</h5>
                            <p className="text-xs">ทุกคนสามารถ "อ่าน" ข้อมูลคะแนนใน Collection <code>miners</code> ได้ เพื่อความโปร่งใสของ Leaderboard</p>
                        </div>
                        <div className="p-3 bg-meebot-bg border border-meebot-border rounded-lg">
                            <h5 className="font-bold text-red-400 mb-1 text-xs flex items-center"><Lock className="w-3 h-3 mr-1"/> Write Restricted</h5>
                            <p className="text-xs">ห้ามมิให้ Client เขียนคะแนนโดยตรง การอัปเดตต้องมาจาก <strong>Cloud Functions</strong> ที่เชื่อถือได้เท่านั้น</p>
                        </div>
                    </div>
                </MechanicSection>

                <MechanicSection title="4. สถิติแยกตามเครือข่าย (Multi-Chain Ready)" icon={Globe}>
                    <p>
                        ข้อมูลสถิติของ Miner จะถูกบันทึกพร้อม Tag เครือข่าย (เช่น <code>network: "sepolia"</code> หรือ <code>network: "fuse"</code>) 
                        เพื่อให้มั่นใจว่าสถิติจาก Testnet และ Mainnet จะไม่ปะปนกัน
                    </p>
                </MechanicSection>

                <div className="mt-8 text-center text-meebot-text-secondary">
                    <p>ถ้าคุณมีคำถามเพิ่มเติมเกี่ยวกับการทำงานของ MeeChain หรือต้องการตรวจสอบโค้ด สามารถสอบถาม MeeBot ได้ตลอดเวลาครับ!</p>
                </div>

            </div>
        </div>
    </div>
  );
};
