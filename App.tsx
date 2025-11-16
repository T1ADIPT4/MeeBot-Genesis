
import React, { useState, useCallback } from 'react';
import { useLocation } from './hooks/useLocation';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './components/pages/DashboardPage';
import { GenesisPage } from './components/pages/GenesisPage';
import { PlaceholderPage } from './components/pages/PlaceholderPage';
import { HallOfOriginsPage } from './components/pages/HallOfOriginsPage';

const getHeaderTitle = (path: string): string => {
  switch (path) {
    case '/':
      return 'Dashboard';
    case '/genesis':
      return 'MeeBot Genesis Ritual';
    case '/origins':
      return 'Hall of Origins';
    case '/settings':
      return 'Settings';
    default:
      return 'MeeChain';
  }
};

const App: React.FC = () => {
  const [currentPath, navigate] = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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
      case '/origins':
        return <HallOfOriginsPage />;
      case '/settings':
        return <PlaceholderPage title="Settings" />;
      default:
        return <PlaceholderPage title="404 - Not Found" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
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
  );
};

export default App;
