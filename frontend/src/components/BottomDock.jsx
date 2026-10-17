import React from 'react';

export default function BottomDock({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'calendar', label: 'Book Visit', icon: 'calendar_month' },
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'assistant', label: 'BulbaCare', icon: 'smart_toy', badge: true },
  ];

  return (
    <nav
      id="bottom-navigation-dock"
      aria-label="Main Navigation"
      className="fixed bottom-4 sm:bottom-6 inset-x-0 mx-auto w-fit z-40 max-w-[95vw]"
    >
      <div className="px-2 sm:px-3 py-1.5 bg-white/95 backdrop-blur-xl rounded-full shadow-dock border border-[#DDF5E3] flex items-center gap-1 sm:gap-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              type="button"
              className={`relative px-3 sm:px-3.5 py-2 rounded-full font-semibold text-xs transition-all duration-200 flex items-center gap-1.5 select-none ${
                isActive
                  ? 'bg-primary text-white shadow-sm scale-100'
                  : 'text-[#68796C] hover:text-[#1D3025] hover:bg-[#F1F5ED] active:scale-95'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[19px] sm:text-[20px] ${
                  isActive ? 'fill-1' : ''
                }`}
              >
                {tab.icon}
              </span>
              <span className={`hidden xs:inline ${isActive ? 'inline' : ''}`}>
                {tab.label}
              </span>

              {tab.badge && !isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-leaf-green ring-2 ring-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
