import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/patients', label: 'Patients', icon: '👥' },
  { path: '/campaigns', label: 'Campaigns', icon: '🚀' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/delivery', label: 'Delivery Log', icon: '📋' },
  { path: '/architecture', label: 'Architecture', icon: '🏗️' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src="https://www.nvisioncenters.com/wp-content/uploads/Nvision-Circle-Logo.png"
            alt="NVISION"
            className="w-10 h-10 rounded-full bg-white p-0.5"
          />
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">NVISION</h1>
            <p className="text-[10px] text-slate-400 -mt-0.5 tracking-wide">Campaign AI Platform</p>
          </div>
        </div>
        <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20 rounded uppercase tracking-wider">
          Demo
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p>© 2026 NVISION Eye Centers</p>
        <p className="text-[10px] mt-0.5 text-slate-600">The Eye Doctors' #1 Choice®</p>
      </div>
    </div>
  );
}
