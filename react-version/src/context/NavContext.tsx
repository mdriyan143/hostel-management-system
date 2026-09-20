import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

// Ported from js/nav-toggle.js.
// Desktop sidebar-collapse preference is remembered across pages via
// localStorage. The mobile drawer is not - it always starts closed on each
// page load/navigation, so it never traps a visitor behind a full-screen
// overlay on first visit or after following a link.

const NAV_COLLAPSED_KEY = 'hm_nav_collapsed';
const MOBILE_QUERY = '(max-width: 860px)';

function isMobileViewport(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches;
}

interface NavContextValue {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleNav: () => void;
  closeMobileNav: () => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(NAV_COLLAPSED_KEY) === '1'
  );
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const toggleNav = useCallback(() => {
    if (isMobileViewport()) {
      setMobileOpen((open) => !open);
    } else {
      setCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem(NAV_COLLAPSED_KEY, next ? '1' : '0');
        return next;
      });
    }
  }, []);

  const closeMobileNav = useCallback(() => setMobileOpen(false), []);

  // Tapping outside the open drawer (the dark overlay) closes it on mobile.
  useEffect(() => {
    function handleDocumentClick(e: MouseEvent) {
      if (!isMobileViewport()) return;
      if (!mobileOpen) return;
      const sidebar = document.querySelector('[data-sidebar]');
      const toggleBtn = document.getElementById('navToggle');
      const target = e.target as Node;
      if (sidebar && !sidebar.contains(target) && target !== toggleBtn) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [mobileOpen]);

  return (
    <NavContext.Provider value={{ collapsed, mobileOpen, toggleNav, closeMobileNav }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within a NavProvider');
  return ctx;
}
