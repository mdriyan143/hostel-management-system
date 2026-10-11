import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useNav } from '../context/NavContext';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="flex-none"
    >
      {children}
    </svg>
  );
}

const NAV_LINKS: { to: string; label: string; end?: boolean; icon: ReactNode }[] = [
  {
    to: '/',
    label: 'Dashboard',
    end: true,
    icon: (
      <Icon>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </Icon>
    ),
  },
  {
    to: '/students',
    label: 'Students',
    icon: (
      <Icon>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
        <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.4c2.2.7 3.5 2.6 3.5 5.6" />
      </Icon>
    ),
  },
  {
    to: '/rooms',
    label: 'Rooms',
    icon: (
      <Icon>
        <path d="M3 20V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13" />
        <path d="M3 20h18M3 13h18M8 13V9h8v4" />
      </Icon>
    ),
  },
  {
    to: '/attendance',
    label: 'Mess attendance',
    icon: (
      <Icon>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="m8.5 9 1.5 1.5L13 7.5M8.5 15.5 10 17l3-3M15.5 9.5H17M15.5 16H17" />
      </Icon>
    ),
  },
  {
    to: '/overview',
    label: 'Meal overview',
    icon: (
      <Icon>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </Icon>
    ),
  },
  {
    to: '/contribution',
    label: 'Contribution overview',
    icon: (
      <Icon>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </Icon>
    ),
  },
  {
    to: '/billing',
    label: 'Household bills',
    icon: (
      <Icon>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
        <path d="M9.5 8h5M9.5 12h5" />
      </Icon>
    ),
  },
  {
    to: '/calculation',
    label: 'Mess calculation',
    icon: (
      <Icon>
        <rect x="5" y="2.5" width="14" height="19" rx="2" />
        <path d="M8.5 7h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
      </Icon>
    ),
  },
  {
    to: '/meal-rate',
    label: 'Meal rate breakdown',
    icon: (
      <Icon>
        <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10" />
        <path d="M17 21V3c-2.5 1.5-3.5 4.5-3.5 8H17" />
      </Icon>
    ),
  },
];

export default function Layout() {
  const { collapsed, mobileOpen, toggleNav } = useNav();

  return (
    <>
      <button
        id="navToggle"
        aria-label="Toggle menu"
        onClick={(e) => {
          e.stopPropagation();
          toggleNav();
        }}
        className="fixed top-4 left-4 z-[100] flex !h-[40px] !w-[40px] items-center justify-center !rounded-xl !border !border-line !bg-panel !p-0 !text-ink shadow-[var(--shadow-md)] transition hover:!bg-sage-tint hover:!text-sage-dark"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      </button>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[80] hidden bg-[rgba(14,24,18,0.5)] backdrop-blur-[2px] max-[860px]:block" />
      )}

      <div className="flex min-h-screen">
        <aside
          data-sidebar
          className={[
            'sticky top-0 flex h-screen flex-col overflow-hidden bg-gradient-to-b from-forest-2 to-forest text-white transition-[width,padding,transform] duration-200 ease-in-out',
            'max-[860px]:fixed max-[860px]:top-0 max-[860px]:left-0 max-[860px]:z-[90] max-[860px]:w-[min(82vw,276px)] max-[860px]:shadow-[var(--shadow-lg)]',
            mobileOpen ? 'max-[860px]:translate-x-0' : 'max-[860px]:-translate-x-full',
            collapsed ? 'w-0 flex-shrink-0' : 'w-[260px] flex-shrink-0',
          ].join(' ')}
        >
          {/* brand — left padding leaves room for the floating menu button */}
          <div className="flex h-[72px] flex-none items-center gap-3 whitespace-nowrap border-b border-white/10 pr-5 pl-[68px]">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-gradient-to-br from-sage to-sage-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 11.5 12 4l9 7.5" />
                <path d="M5.5 10v10h13V10M10 20v-5.5h4V20" />
              </svg>
            </span>
            <span className="font-display text-[1.15rem] font-semibold tracking-tight">
              Hostel<span className="text-[#9FD3A8]">&amp;Mess</span>
            </span>
          </div>

          <div className="px-6 pt-6 pb-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] whitespace-nowrap text-white/40">
            Menu
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'group relative flex items-center gap-3 whitespace-nowrap rounded-[10px] px-3.5 py-[10px] text-[0.88rem] font-medium no-underline transition',
                    isActive
                      ? 'bg-white/[0.12] font-semibold !text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
                      : '!text-white/65 hover:bg-white/[0.06] hover:!text-white',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute top-2 bottom-2 -left-3 w-[3px] rounded-r bg-amber" aria-hidden="true" />
                    )}
                    <span className={isActive ? 'text-[#9FD3A8]' : 'text-white/50 group-hover:text-white/80'}>
                      {link.icon}
                    </span>
                    {link.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="m-3 flex-none rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-[0.74rem] leading-snug whitespace-normal text-white/55">
            <span className="mb-0.5 block text-[0.78rem] font-semibold text-white/85">Stored locally</span>
            Everything you enter is saved in this browser.
          </div>
        </aside>

        <main
          className={[
            'min-w-0 flex-1 px-12 pb-16 max-[860px]:px-6 max-[860px]:pt-[84px] max-[860px]:pb-12 max-[480px]:px-4 max-[480px]:pt-20 max-[480px]:pb-10',
            collapsed ? 'pt-[84px]' : 'pt-11',
          ].join(' ')}
        >
          <div className="mx-auto w-full max-w-[1120px]">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}