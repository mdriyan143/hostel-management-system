import { NavLink, Outlet } from 'react-router-dom';
import { useNav } from '../context/NavContext';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/students', label: 'Students' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/attendance', label: 'Mess attendance' },
  { to: '/overview', label: 'Meal overview' },
  { to: '/contribution', label: 'Contribution overview' },
  { to: '/billing', label: 'Household bills' },
  { to: '/calculation', label: 'Mess calculation' },
  { to: '/meal-rate', label: 'Meal rate breakdown' },
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
        className="fixed top-4 left-4 z-[100] flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-line bg-panel !text-ink text-[1.1rem] leading-none shadow-[var(--shadow-sm)] transition hover:!bg-sage-tint hover:shadow-[var(--shadow-md)] hover:-translate-y-px"
      >
        &#9776;
      </button>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[80] hidden bg-[rgba(43,35,32,0.28)] max-[860px]:block" />
      )}

      <div className="flex min-h-screen">
        <aside
          data-sidebar
          className={[
            'flex flex-col overflow-hidden border-r border-line bg-gradient-to-b from-white to-panel-soft pt-16 pb-6 transition-[width,padding,transform] duration-200 ease-in-out',
            'max-[860px]:fixed max-[860px]:top-0 max-[860px]:left-0 max-[860px]:z-[90] max-[860px]:h-screen max-[860px]:w-[min(78vw,260px)] max-[860px]:!pt-[72px] max-[860px]:shadow-[var(--shadow-lg)]',
            mobileOpen ? 'max-[860px]:translate-x-0' : 'max-[860px]:-translate-x-full',
            collapsed ? 'w-0 pl-0 pr-0 border-r-transparent' : 'w-[232px] flex-shrink-0',
          ].join(' ')}
        >
          <div className="mb-3.5 whitespace-nowrap border-b border-line px-6 pb-5 font-display text-[1.32rem] font-semibold tracking-tight">
            Hostel<span className="text-sage-dark">&amp;Mess</span>
          </div>
          <nav className="flex flex-col gap-0.5 px-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'block whitespace-nowrap rounded-lg border-l-[3px] px-4 py-[11px] text-[0.93rem] font-medium no-underline transition',
                    isActive
                      ? 'border-sage-dark bg-sage-tint font-semibold !text-sage-dark'
                      : 'border-transparent !text-ink-soft hover:translate-x-0.5 hover:border-amber hover:bg-amber-tint hover:!text-ink',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="max-w-[1120px] flex-1 px-12 pt-11 pb-15 max-[860px]:max-w-full max-[860px]:px-6 max-[860px]:pt-[84px] max-[860px]:pb-12 max-[480px]:px-4 max-[480px]:pt-20 max-[480px]:pb-10">
          <Outlet />
        </main>
      </div>
    </>
  );
}
