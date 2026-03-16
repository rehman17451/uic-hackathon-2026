import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, History, ShieldAlert, Key, Sun, Moon } from 'lucide-react';
import { useSecurityStore } from '../../store/useSecurityStore';
import { useUserStore } from '../../store/useUserStore';

export default function MobileLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const trustScore = useSecurityStore(state => state.trustScore);
  const { theme, toggleTheme } = useUserStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`flex justify-center min-h-[100dvh] ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'} transition-colors duration-300`}>
      {/* Mobile App Container */}
      <div className={`w-full max-w-md min-h-[100dvh] relative flex flex-col shadow-2xl transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        
        {/* Dynamic Top Bar (changes based on trust score) */}
        <div className={`h-1.5 w-full shrink-0 ${trustScore < 50 ? 'bg-red-500' : trustScore < 80 ? 'bg-yellow-500' : 'bg-brand-primary'}`} />
        
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-50 flex justify-between items-center px-6 py-3 backdrop-blur-xl border-b transition-colors"
          style={{ backgroundColor: theme === 'dark' ? 'rgba(17,24,39,0.85)' : 'rgba(255,255,255,0.85)' }}
        >
          <div className="flex items-center">
            <div className="bg-gray-950 px-4 py-1.5 rounded-full shadow-lg border border-white/5 flex items-center">
              <span className="font-black text-2xl tracking-tighter text-white">
                True<span className="text-blue-400">Say</span>
              </span>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:scale-110 active:scale-95 transition-all"
          >
            {theme === 'dark' ? <Sun size={20} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" /> : <Moon size={20} className="text-indigo-600" />}
          </button>
        </div>

        {/* Content Area — scrollable between top bar and bottom nav */}
        <main className="flex-1 overflow-y-auto relative z-0 hide-scrollbar" style={{ paddingBottom: '5.5rem' }}>
          <Outlet />
        </main>

        {/* Fixed Bottom Navigation */}
        <nav 
          className={`fixed bottom-0 w-full max-w-md flex justify-between px-6 py-3 pb-6 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.08)] rounded-t-[2rem] border-t transition-colors duration-300 z-50 ${
            theme === 'dark' 
              ? 'bg-gray-900/90 border-gray-800/80 backdrop-blur-2xl' 
              : 'bg-white/90 border-gray-100 backdrop-blur-2xl'
          }`}
        >
          {[
            { icon: Home, label: 'Home', path: '/', colorClass: theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-brand-primary', activeClass: theme === 'dark' ? 'text-blue-400' : 'text-brand-primary' },
            { icon: History, label: 'History', path: '/history', colorClass: theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-brand-primary', activeClass: theme === 'dark' ? 'text-blue-400' : 'text-brand-primary' },
            { icon: ShieldAlert, label: 'Emergency', path: '/emergency', colorClass: theme === 'dark' ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500', activeClass: 'text-red-500' },
            { icon: Key, label: 'Advisor', path: '/ai-advisor', colorClass: theme === 'dark' ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-500 hover:text-indigo-600', activeClass: theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600' },
          ].map((item) => (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)} 
              className={`flex flex-col items-center gap-1 transition-all ${isActive(item.path) ? item.activeClass : item.colorClass}`}
            >
              <div className={`p-2 rounded-2xl transition-colors ${isActive(item.path) ? (theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50') : ''}`}>
                <item.icon size={22} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${isActive(item.path) ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
