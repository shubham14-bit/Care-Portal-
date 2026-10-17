import React from 'react';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmJ2znd3tlN3MvOqdbk67atERtcRQ5nSBtV6SIBEKBew3Lisz7-I4rEDtGIRanMZGTKTnxWNKkiNNGKHV9D3wA0pl3n4BdVnpQZrNqBjVkBq8GIP5haIghsVAFRH3TTQfxIQbPvUAQqmJe2xIY-MiOuvBRJEK2jsAk9-ygNZn4PAOQgrmaKxKA5AhwAIxsdizwhm8ja5y3sHxjA-9y1gnbGQ4qDljLTk27OXqkvXFx6B9FsRFSg5vtt17gMFEnGkckLg';

export default function Header({ onTriggerSos, mrn = 'MRN-9482-EV77' }) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#DDF5E3] shadow-subtle pt-safe transition-all">
      <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-2 max-w-[430px] mx-auto sm:max-w-none">
        {/* Left: Brand Logo & Pill Tag */}
        <div className="flex items-center space-x-2 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#DDF5E3] border border-[#C2ECCC] flex items-center justify-center overflow-hidden shadow-sm">
              <img
                src={LOGO_URL}
                alt="CarePortal Grass Energy Logo"
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<span class="material-symbols-outlined text-primary text-lg">spa</span>';
                }}
              />
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#78C850] rounded-full border-2 border-white ring-1 ring-[#C2ECCC] animate-pulse-subtle"
              title="CarePortal Live Connected"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-[#214D38] uppercase bg-[#DDF5E3]/80 px-2 py-0.5 rounded-full border border-[#C2ECCC] truncate">
              CarePortal Direct
            </span>
          </div>
        </div>

        {/* Right: MRN Identifier & SOS Trigger */}
        <div className="flex items-center space-x-2 shrink-0">
          <span
            className="text-[11px] font-mono font-medium text-[#404940] bg-[#EBF2E8] px-2 py-1 rounded-md border border-[#DDF5E3] hidden xs:inline-block"
            title="Medical Record Number"
          >
            {mrn}
          </span>
          
          <button
            id="sos-emergency-button"
            onClick={onTriggerSos}
            type="button"
            className="h-9 px-3 rounded-xl bg-error-container text-on-error-container hover:bg-error hover:text-white transition-all flex items-center gap-1.5 shadow-sm font-bold text-xs sm:text-sm active:scale-95 group focus:outline-none focus:ring-2 focus:ring-error"
            title="Immediate Emergency Assistance Dispatch"
          >
            <span className="material-symbols-outlined fill-1 text-[18px] group-hover:animate-bounce">
              emergency
            </span>
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
}
