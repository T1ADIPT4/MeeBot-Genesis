
import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, RotateCcw, Database, Save, LogOut, AlertTriangle, Shield } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { getStoredConfig, saveConfig, clearConfig, FirebaseConfig, isFirebaseInitialized } from '../../services/firebase';

const CustomInstructionPanel: React.FC = () => {
  const { customInstructions, setCustomInstructions } = useSettings();
  const [instructions, setInstructions] = useState(customInstructions);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setInstructions(customInstructions);
  }, [customInstructions]);

  const handleSave = () => {
    setCustomInstructions(instructions);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    setInstructions("// Default MeeBot behavior");
  }

  return (
    <div className="p-6 mb-8 bg-meebot-surface border border-meebot-border rounded-lg shadow-lg animate-fade-in">
        <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-meebot-primary mr-3"/>
            <h2 className="text-2xl font-bold text-white">MeeBot Custom Instructions</h2>
        </div>
      
      <p className="mb-4 text-meebot-text-secondary">
        Customize MeeBot's behavior, style, and persona adaptation logic.
      </p>
      
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
          Reset to default
        </button>
        <div className="flex items-center space-x-4">
           {isSaved && (
            <p className="text-sm font-semibold text-green-400 animate-fade-in">✅ Saved!</p>
          )}
          <button 
            onClick={handleSave} 
            className="px-6 py-2 font-semibold text-white transition-colors bg-meebot-primary rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-meebot-bg focus:ring-meebot-primary"
          >
            Save Changes
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
    const [showForm, setShowForm] = useState(false);

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
                        <h2 className="text-2xl font-bold text-white">System Connection</h2>
                        <div className="flex items-center mt-1">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></span>
                            <p className={`text-sm font-mono ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
                                {isConnected ? 'LIVE NETWORK' : 'SIMULATION MODE'}
                            </p>
                        </div>
                    </div>
                </div>
                {isConnected && (
                    <button 
                        onClick={handleDisconnect}
                        className="flex items-center px-3 py-1.5 text-xs font-bold text-red-300 border border-red-500/30 rounded-md hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-3 h-3 mr-1"/> Disconnect
                    </button>
                )}
            </div>

            {!isConnected ? (
                <div className="bg-meebot-bg p-6 rounded-lg border border-meebot-border">
                    <div className="flex items-start gap-3 mb-6">
                        <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0"/>
                        <div>
                            <h3 className="text-white font-bold mb-1">Configure Remote Backend</h3>
                            <p className="text-sm text-meebot-text-secondary">
                                To enable live mining updates, leaderboard syncing, and governance features, please provide your Firebase configuration keys. 
                                <br/><span className="opacity-70 italic">(This data is stored locally in your browser)</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-meebot-text-secondary uppercase mb-1">API Key *</label>
                            <input name="apiKey" type="password" value={config.apiKey} onChange={handleChange} placeholder="AIzaSy..." className="w-full p-2 bg-meebot-surface border border-meebot-border rounded text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-meebot-text-secondary uppercase mb-1">Project ID *</label>
                            <input name="projectId" type="text" value={config.projectId} onChange={handleChange} placeholder="meechain-..." className="w-full p-2 bg-meebot-surface border border-meebot-border rounded text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-meebot-text-secondary uppercase mb-1">Auth Domain</label>
                            <input name="authDomain" type="text" value={config.authDomain} onChange={handleChange} placeholder=".firebaseapp.com" className="w-full p-2 bg-meebot-surface border border-meebot-border rounded text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-meebot-text-secondary uppercase mb-1">Storage Bucket</label>
                            <input name="storageBucket" type="text" value={config.storageBucket} onChange={handleChange} placeholder=".appspot.com" className="w-full p-2 bg-meebot-surface border border-meebot-border rounded text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-meebot-text-secondary uppercase mb-1">Messaging Sender ID</label>
                            <input name="messagingSenderId" type="text" value={config.messagingSenderId} onChange={handleChange} className="w-full p-2 bg-meebot-surface border border-meebot-border rounded text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-meebot-text-secondary uppercase mb-1">App ID</label>
                            <input name="appId" type="text" value={config.appId} onChange={handleChange} className="w-full p-2 bg-meebot-surface border border-meebot-border rounded text-sm"/>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button 
                            onClick={handleSave}
                            className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all shadow-lg"
                        >
                            <Save className="w-5 h-5 mr-2"/> Save & Connect
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6 text-center">
                    <Shield className="w-12 h-12 text-green-400 mx-auto mb-3"/>
                    <h3 className="text-xl font-bold text-white mb-2">Connection Active</h3>
                    <p className="text-meebot-text-secondary text-sm mb-4">
                        Your client is successfully configured to communicate with Project ID: <span className="font-mono text-white bg-black/30 px-2 py-1 rounded">{config.projectId}</span>
                    </p>
                    <p className="text-xs text-meebot-text-secondary/60">
                        Real-time mining data, leaderboards, and proposals are now being synced.
                    </p>
                </div>
            )}
        </div>
    );
}


export const SettingsPage: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Global Settings</h1>
        <FirebaseConnectionPanel />
        <CustomInstructionPanel />
    </div>
  )
}
