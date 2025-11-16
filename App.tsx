import React, { useState, useCallback } from 'react';
import { useLocation } from './hooks/useLocation';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './components/pages/DashboardPage';
import { GenesisPage } from './components/pages/GenesisPage';
import { PlaceholderPage } from './components/pages/PlaceholderPage';
import { HallOfOriginsPage } from './components/pages/HallOfOriginsPage';
import { ProposalAnalysisPage } from './components/pages/ProposalAnalysisPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { SettingsProvider } from './contexts/SettingsContext';
import { PersonaProvider } from './contexts/PersonaContext';
import { PersonaManagementPage } from './components/pages/PersonaManagementPage';
import { MeeBotProvider, useMeeBots } from './contexts/MeeBotContext';
import { BadgeNotification } from './components/BadgeNotification';
import { MigrationPage } from './components/pages/MigrationPage';


const getHeaderTitle = (path: string): string => {
  switch (path) {
    case '/':
      return 'Dashboard';
    case '/genesis':
      return 'MeeBot Genesis Ritual';
    case '/migration':
      return 'Cross-Chain Migration';
    case '/analysis':
      return 'Proposal Analysis';
    case '/origins':
      return 'Hall of Origins';
    case '/settings':
      return 'Settings';
    case '/personas':
      return 'Persona Management';
    default:
      return 'MeeChain';
  }
};

// Extracted the main layout and view logic into a separate component
// This allows it to be a child of MeeBotProvider and use the `useMeeBots` hook.
const AppLayout: React.FC = () => {
  const [currentPath, navigate] = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { currentBadgeNotification, dismissBadgeNotification } = useMeeBots();

  const setRoute = useCallback((path: string) => {
    navigate(path);
    setSidebarOpen(false); // Close sidebar on navigation for mobile
  }, [navigate]);

  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/':
      case '/dashboard': // Allow both
        return <DashboardPage navigate={setRoute} />;
      case '/genesis':
        return <GenesisPage />;
      case '/migration':
        return <MigrationPage />;
      case '/analysis':
        return <ProposalAnalysisPage />;
      case '/origins':
        return <HallOfOriginsPage />;
      case '/settings':
        return <SettingsPage />;
      case '/personas':
        return <PersonaManagementPage />;
      default:
        return <PlaceholderPage title="404 - Not Found" />;
    }
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-meebot-bg">
        <Sidebar currentPath={currentPath} navigate={setRoute} isOpen={isSidebarOpen} />
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header 
            title={getHeaderTitle(currentPath)} 
            onMenuClick={() => setSidebarOpen(prev => !prev)} 
          />
          <main className="flex-1 overflow-y-auto">
            {renderCurrentPage()}
          </main>
        </div>
      </div>
      {/* Render the badge notification globally */}
      {currentBadgeNotification && (
        <BadgeNotification badge={currentBadgeNotification} onClose={dismissBadgeNotification} />
      )}
    </>
  );
}

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <PersonaProvider>
        <MeeBotProvider>
          <AppLayout />
        </MeeBotProvider>
      </PersonaProvider>
    </SettingsProvider>
  );
};

export default App;