
import React, { useState, useEffect } from 'react';
import { Settings, RotateCcw, Database, Save, LogOut, AlertTriangle, Shield, Volume2 } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { getStoredConfig, saveConfig, clearConfig, FirebaseConfig, isFirebaseInitialized } from '../../services/firebase';
import { useLanguage } from '../../contexts/LanguageContext';

const CustomInstructionPanel: React.FC = () => {
  const { customInstructions, setCustomInstructions, voiceStyle, setVoiceStyle } = useSettings();
  const [instructions, setInstructions] = useState(customInstructions);
  const [localVoiceStyle, setLocalVoiceStyle] = useState(voiceStyle);
  const [isSaved, setIsSaved] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setInstructions(customInstructions);
    setLocalVoiceStyle(voiceStyle);
  }, [customInstructions, voiceStyle]);

  const handleSave = () => {
    setCustomInstructions(instructions);
    setVoiceStyle(localVoiceStyle);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    setInstructions("// Default MeeBot behavior");
    setLocalVoiceStyle('Default');
  }

  return (
    <div className="p-6 mb-8 bg-meebot-surface border border-meebot-border rounded-lg shadow-lg animate-fade-in">
        <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-meebot-primary mr-3"/>
            <h2 className="text-2xl font-bold text-white">{t('settings.custom_instructions')}</h2>
        </div>
      
      <p className="mb-4 text-meebot-text-secondary">
        {t('settings.custom_desc')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
            <label className="block text-sm font-medium text-meebot-text-secondary mb-2 flex items-center">
                <Volume2 className="w-4 h-4 mr-2 text-meebot-accent" />
                Voice Style
            </label>
            <select 
                value={localVoiceStyle} 
                onChange={(e) => setLocalVoiceStyle(e.target.value)}
                className="w-full p-3 bg-meebot-bg border border-meebot-border rounded-lg text-white focus:border-meebot-primary outline-none focus:ring-1 focus:ring-meebot-primary transition-all"
            >
                <option value="Default">Default System Voice</option>
                <option value="CalmFemale">Calm Female (TTS)</option>
            </select>
            <p className="mt-1 text-xs text-meebot-text-secondary/70">
                Overrides the default browser voice for text-to-speech interactions.
            </p>
        </div>
      </div>
      
      <label className="block text-sm font-medium text-meebot-text-secondary mb-2">Behavior Rules</label>
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={6}
        className="w-full p-3 font-mono text-sm bg-meebot-bg border border-meebot-border rounded-lg text-meebot-text-primary focus:ring-2 focus:ring-meebot-primary focus:border-meebot-primary mb-4"
        placeholder="// Example: Use emojis instead of SVG icons"
      />
      
      <div className="flex flex-col items-center justify-end space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
        <button 
          onClick={handleReset} 
          className="flex items-center text-sm transition-colors text-meebot-text-secondary hover:text-white"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('settings.reset')}
        </button>
        <div className="flex items-center space-x-4">
           {isSaved && (
            <p className="text-sm font-semibold text-green-400 animate-fade-in">✅ {t('settings.saved')}</p>
          )}
          <button 
            onClick={handleSave} 
            className="px-6 py-2 font-semibold text-white transition-colors bg-meebot-primary rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-bg focus:ring-meebot-primary"
          >
            {t('settings.save_changes')}
          </button>
        </div>
      </div>
    </div>
  );
};

const FirebaseConnectionPanel: React.FC = () => {
    const [config, setConfig] = useState<FirebaseConfig>({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: ''
    });
    const [isConnected, setIsConnected] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        setIsConnected(isFirebaseInitialized());
        const stored = getStoredConfig();
        if (stored) {
            setConfig(stored);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        if (!config.apiKey || !config.projectId) {
            alert("API Key and Project ID are required at minimum.");
            return;
        }
        saveConfig(config);
        window.location.reload(); // Reload to initialize Firebase
    };

    const handleDisconnect = () => {
        if(window.confirm("Are you sure you want to disconnect and return to simulation mode?")) {
            clearConfig();
            window.location.reload();
        }
    };

    return (
        <div className="p-6 bg-meebot-surface border border-meebot-border rounded-lg shadow-lg animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Database className={`w-6 h-6 mr-3 ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}/>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t('settings.system_connection')}</h2>
                        <div className="flex items-center mt-1">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></span>
                            <p className={`text-sm font-mono ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
                                {isConnected ? t('settings.live_network') : t('settings.simulation_mode')}
                            </p>
                        </div>
                    </div>
                </div>
                {isConnected && (
                    <button 
                        onClick={handleDisconnect}
                        className="flex items-center px-3 py-1.5 text-xs font-bold text-red-300 border border-red-500/30 rounded-md hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-3 h-3 mr-1"/> {t('settings.disconnect')}
                    </button>
                )}
            </div>

            {!isConnected ? (
                <div className="bg-meebot-bg p-6 rounded-lg border border-meebot-border">
                    <div className="flex items-start gap-3 mb-6">
                        <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0"/>
                        <div>
                            <h3 className="text-white font-bold mb-1">{t('settings.configure_backend')}</h3>
                            <p className="text-sm text-meebot-text-secondary">
                                {t('settings.configure_desc')} 
                                <br/><span className="opacity-70 italic">{t('settings.local_storage_note')}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-meebot-text-secondary uppercase mb-1">{t('settings.api_key')} *</label>
                            <input name="apiKey" type="password" value={config.apiKey} onChange={handleChange} placeholder="AIzaSy..." className="w-full p-2 bg-meebot-surface border border-meebot-border rounded text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-meebot-text-secondary uppercase mb-1">{t('settings.project_id')} *</label>
                            <input name="projectId" type="text" value={config.projectId} onChange={handleChange} placeholder="meechain-..." className="w-full p-2 bg-meebot-surface border border-meebot-border rounded text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-meebot-text-secondary uppercase mb-1">{t('settings.auth_domain')}</label>
                            <input name="authDomain" type="text" value={config.authDomain} onChange={handleChange} placeholder=".firebaseapp.com" className="w-full p-2 bg-meebot-surface border border-meebot-border rounded text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-meebot-text-secondary uppercase mb-1">{t('settings.storage_bucket')}</label>
                            <input name="storageBucket" type="text" value={config.storageBucket} onChange={handleChange} placeholder=".appspot.com" className="w-full p-2 bg-meebot-surface border border-meebot-border rounded text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-meebot-text-secondary uppercase mb-1">{t('settings.messaging_sender_id')}</label>
                            <input name="messagingSenderId" type="text" value={config.messagingSenderId} onChange={handleChange} className="w-full p-2 bg-meebot-surface border border-meebot-border rounded text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-meebot-text-secondary uppercase mb-1">{t('settings.app_id')}</label>
                            <input name="appId" type="text" value={config.appId} onChange={handleChange} className="w-full p-2 bg-meebot-surface border border-meebot-border rounded text-sm"/>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button 
                            onClick={handleSave}
                            className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all shadow-lg"
                        >
                            <Save className="w-5 h-5 mr-2"/> {t('settings.save_connect')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6 text-center">
                    <Shield className="w-12 h-12 text-green-400 mx-auto mb-3"/>
                    <h3 className="text-xl font-bold text-white mb-2">{t('settings.connection_active')}</h3>
                    <p className="text-meebot-text-secondary text-sm mb-4">
                        {t('settings.connected_to')} <span className="font-mono text-white bg-black/30 px-2 py-1 rounded">{config.projectId}</span>
                    </p>
                    <p className="text-xs text-meebot-text-secondary/60">
                        {t('settings.realtime_sync')}
                    </p>
                </div>
            )}
        </div>
    );
}


export const SettingsPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">{t('settings.title')}</h1>
        <FirebaseConnectionPanel />
        <CustomInstructionPanel />
    </div>
  )
}
