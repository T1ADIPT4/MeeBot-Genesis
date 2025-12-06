
import React from 'react';
import { Bot, ArrowRight, Gift, BookOpen, Zap, FileText, Award, Hash, ExternalLink, CheckCircle } from 'lucide-react';
import { useMeeBots } from '../../contexts/MeeBotContext';
import { TimelineIcon } from './HallOfOriginsPage'; 
import { useLanguage } from '../../contexts/LanguageContext';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

const WelcomeBanner: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
    const { t } = useLanguage();
    return (
        <div className="p-8 text-center bg-meebot-surface border border-meebot-border rounded-lg shadow-lg animate-fade-in">
          <div className="relative inline-block mb-6">
            <Bot className="w-24 h-24 text-meebot-primary animate-pulse-slow" />
            <div className="absolute top-0 left-0 w-24 h-24 rounded-full opacity-20 bg-meebot-primary blur-2xl"></div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t('dashboard.welcome')}</h1>
          <p className="max-w-2xl mx-auto mt-3 text-md text-meebot-text-secondary">
            {t('dashboard.subtitle')}
          </p>
          <button
            onClick={() => navigate('/genesis')}
            className="inline-flex items-center justify-center px-6 py-3 mt-8 text-md font-semibold text-white transition-all duration-200 bg-meebot-primary rounded-lg shadow-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-surface focus:ring-meebot-primary"
          >
            {t('dashboard.create_btn')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
    );
};

const getChainTagStyle = (chainName?: string) => {
    switch (chainName) {
        case 'Sepolia': return 'bg-blue-500/20 text-blue-300';
        case 'Fuse': return 'bg-green-500/20 text-green-300';
        case 'BNB': return 'bg-yellow-500/20 text-yellow-300';
        default: return 'bg-gray-500/20 text-gray-300';
    }
};


const MeeBotProfileCard: React.FC = () => {
    const { meebots } = useMeeBots();
    const { t } = useLanguage();
    const latestBot = meebots[0];

    return (
        <div className="bg-meebot-surface border border-meebot-border rounded-lg shadow-lg animate-fade-in flex flex-col">
            <div className="p-6 flex-grow">
                <div className="flex flex-col sm:flex-row gap-6">
                    <img src={latestBot.image} alt={latestBot.soul_prompt} className="w-32 h-32 rounded-lg object-cover border-2 border-meebot-border shrink-0" />
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-meebot-primary">{latestBot.persona}</h3>
                                <p className="text-2xl font-bold text-white flex items-center gap-2">
                                   {latestBot.name}
                                   <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${getChainTagStyle(latestBot.chainName)}`}>
                                    {latestBot.chainName}
                                   </span>
                                </p>
                            </div>
                            <a href={latestBot.external_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-meebot-text-secondary hover:text-meebot-primary transition-colors">
                                {t('dashboard.view_on_chain')} <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        </div>
                        <p className="text-sm text-meebot-text-secondary mt-2 italic">"{latestBot.soul_prompt}"</p>
                        <p className="text-xs text-yellow-400 mt-2">{t('dashboard.current_emotion')}: <strong className="capitalize">{latestBot.emotion}</strong></p>
                    </div>
                </div>
            </div>
            <div className="px-6 py-2 bg-black/20 flex items-center justify-center text-xs text-meebot-text-secondary/70 border-t border-meebot-border/50">
                <Bot className="w-3 h-3 mr-1.5 text-meebot-primary/70" />
                <span>{t('dashboard.powered_by')}</span>
            </div>
        </div>
    );
}

const BadgeCollectionCard: React.FC = () => {
    const { unlockedBadges } = useMeeBots();
    const { t } = useLanguage();

    return (
        <div className="p-6 bg-meebot-surface border border-meebot-border rounded-lg shadow-lg animate-fade-in">
            <div className="flex items-center mb-4">
                <Award className="w-6 h-6 text-yellow-400 mr-3" />
                <h3 className="text-xl font-bold text-white">{t('dashboard.badges')}</h3>
            </div>
            {unlockedBadges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {unlockedBadges.map(badge => (
                        <div key={badge.id} className="p-3 bg-meebot-bg rounded-lg flex items-start space-x-3">
                            <badge.icon className="w-5 h-5 text-meebot-primary mt-1 shrink-0" />
                            <div>
                                <h4 className="font-bold text-meebot-text-primary">{badge.name}</h4>
                                <p className="text-xs text-meebot-text-secondary">{badge.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-center text-meebot-text-secondary py-4">{t('dashboard.badges_empty')}</p>
            )}
        </div>
    );
};

const ProposalStatusCard: React.FC = () => {
    const { proposals } = useMeeBots();
    const { t } = useLanguage();
    const recentProposals = proposals.slice(0, 3);

    return (
        <div className="p-6 bg-meebot-surface border border-meebot-border rounded-lg shadow-lg animate-fade-in">
            <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-blue-400 mr-3" />
                <h3 className="text-xl font-bold text-white">{t('dashboard.proposals')}</h3>
            </div>
            {recentProposals.length > 0 ? (
                <ul className="space-y-3">
                    {recentProposals.map(prop => (
                        <li key={prop.id} className="p-3 bg-meebot-bg rounded-lg">
                            <p className="text-sm font-semibold truncate text-meebot-text-primary">{prop.title}</p>
                            <div className="text-xs flex justify-between items-center mt-1">
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full">{prop.status}</span>
                                <span className="text-meebot-text-secondary">{new Date(prop.analyzedAt).toLocaleDateString()}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-center text-meebot-text-secondary py-4">{t('dashboard.proposals_empty')}</p>
            )}
        </div>
    );
};

const TimelineCard: React.FC = () => {
    const { timeline } = useMeeBots();
    const { t } = useLanguage();
    const [filter, setFilter] = React.useState<'Unified' | 'Sepolia' | 'Fuse' | 'BNB'>('Unified');

    const filteredEvents = React.useMemo(() => {
        if (filter === 'Unified') {
            return timeline;
        }
        return timeline.filter(event => event.chainName === filter);
    }, [timeline, filter]);

    const recentEvents = filteredEvents.slice(0, 5);
    const filterOptions: ('Unified' | 'Sepolia' | 'Fuse' | 'BNB')[] = ['Unified', 'Sepolia', 'Fuse', 'BNB'];


    return (
        <div className="p-6 bg-meebot-surface border border-meebot-border rounded-lg shadow-lg animate-fade-in">
            <div className="flex items-center mb-4">
                <BookOpen className="w-6 h-6 text-meebot-primary mr-3" />
                <h3 className="text-xl font-bold text-white">{t('dashboard.timeline')}</h3>
            </div>
            <div className="flex items-center gap-2 mb-4">
                {filterOptions.map(option => {
                    const isActive = filter === option;
                    return (
                        <button
                            key={option}
                            onClick={() => setFilter(option)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                isActive 
                                ? 'bg-meebot-primary text-meebot-bg' 
                                : 'bg-meebot-bg text-meebot-text-secondary hover:bg-meebot-border hover:text-meebot-text-primary'
                            }`}
                        >
                            {option}
                        </button>
                    )
                })}
            </div>
             <ul className="divide-y divide-meebot-border">
                {recentEvents.length > 0 ? (
                    recentEvents.map(event => (
                        <li key={`${event.timestamp}-${event.message}`} className="py-3 flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-meebot-bg rounded-full flex items-center justify-center mt-1">
                               <TimelineIcon type={event.type} />
                            </div>
                            <div className="flex-grow">
                                 <div className="flex justify-between items-start">
                                    <p className="text-sm text-meebot-text-primary pr-4">{event.message}</p>
                                    {event.chainName && (
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${getChainTagStyle(event.chainName)}`}>
                                            {event.chainName}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-meebot-text-secondary">{new Date(event.timestamp).toLocaleString()}</span>
                                    <div className="transition-opacity duration-500">
                                        {event.status === 'staged' ? (
                                            <div className="flex items-center text-xs text-yellow-400 animate-pulse">
                                                <span className="w-2 h-2 mr-1.5 bg-yellow-400 rounded-full"></span>
                                                {t('dashboard.status_pending')}
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-xs text-green-400 animate-fade-in">
                                                <CheckCircle className="w-3 h-3 mr-1"/>
                                                {t('dashboard.status_confirmed')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="py-4 text-center text-sm text-meebot-text-secondary">
                        {t('dashboard.timeline_empty')}
                    </li>
                )}
            </ul>
        </div>
    );
};

const ActivityGrid: React.FC = () => {
    const { meebots } = useMeeBots();
    const { t } = useLanguage();
    const latestBot = meebots[0];

    const getBoostForEmotion = (emotion: string): { name: string, description: string } | null => {
        const lowerEmotion = emotion.toLowerCase();
        if (lowerEmotion.includes('joy') || lowerEmotion.includes('excit')) return { name: t('dashboard.boost_energy_name'), description: t('dashboard.boost_energy_desc') };
        if (lowerEmotion.includes('serene') || lowerEmotion.includes('contemplative')) return { name: t('dashboard.boost_focus_name'), description: t('dashboard.boost_focus_desc') };
        if (lowerEmotion.includes('stoic') || lowerEmotion.includes('guardian')) return { name: t('dashboard.boost_stability_name'), description: t('dashboard.boost_stability_desc') };
        return null;
    };
    
    const boost = latestBot ? getBoostForEmotion(latestBot.emotion) : null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {latestBot?.miningGift && (
                 <div className="p-6 bg-meebot-surface border border-meebot-border rounded-lg shadow-lg animate-fade-in">
                      <div className="flex items-center mb-3">
                        <Gift className="w-6 h-6 text-green-400 mr-3" />
                        <h3 className="text-xl font-bold text-white">{t('dashboard.active_program')}</h3>
                      </div>
                      <p className="text-lg font-bold text-green-300">{latestBot.miningGift.program}</p>
                      <p className="text-xs text-meebot-text-secondary/80">
                        Boost: {latestBot.miningGift.boost} &bull; Duration: {latestBot.miningGift.duration}
                      </p>
                </div>
            )}
            {boost && (
                 <div className="p-6 bg-meebot-surface border border-meebot-border rounded-lg shadow-lg animate-fade-in">
                    <div className="flex items-center mb-3">
                        <Zap className="w-6 h-6 text-yellow-400 mr-3" />
                        <h3 className="text-xl font-bold text-white">{t('dashboard.emotion_boost')}</h3>
                    </div>
                    <p className="text-lg font-bold text-yellow-300">{boost.name}</p>
                    <p className="text-xs text-meebot-text-secondary/80">
                        {boost.description}
                    </p>
                </div>
            )}
      </div>
    );
};


export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { meebots } = useMeeBots();
  const hasMeeBots = meebots.length > 0;

  return (
    <div className="p-4 md:p-8 space-y-8">
      {!hasMeeBots ? (
        <WelcomeBanner navigate={navigate} />
      ) : (
        <>
            <MeeBotProfileCard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <BadgeCollectionCard />
                    <ProposalStatusCard />
                </div>
                <div className="space-y-8">
                    <TimelineCard />
                    <ActivityGrid />
                </div>
            </div>
        </>
      )}
    </div>
  );
};
