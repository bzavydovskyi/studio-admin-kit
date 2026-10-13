"use client";

import { useEffect, useRef, useState } from "react";
import useFocusTrap from "../hooks/useFocusTrap.js";
import useLockBodyScroll from "../hooks/useLockBodyScroll.js";

function DefaultLink({ href, className, children, ...rest }) {
  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}

// Mounted only while the mobile dropdown is open/closing — a standalone
// component so useLockBodyScroll's mount-locks/unmount-restores lifecycle
// (it takes no active flag) tracks that window instead of AdminChrome's.
function MobileNavScrollLock() {
  useLockBodyScroll();
  return null;
}

// Open and close run at different speeds (see the CSS): a calmer settle-in,
// a quicker dismissal. This constant only needs the close side — it's how
// long the hooks below (scroll lock, focus trap) stay engaged after the
// close transition starts, so they don't let go before it's visually done.
const MOBILE_NAV_CLOSE_MS = 240;

// The admin app shell: brand + collapsible sidebar on desktop, a slim
// sticky top bar with a burger-triggered dropdown on mobile — Poseidon's
// nav behavior, generalized to take its nav config, icons, brand, and
// routing primitives as props instead of hardcoding one business's menu.
//
// Props:
//   brand: { name, logoSrc?, logoSymbolId? }  — logoSymbolId lets a caller
//     reuse an inline <symbol> defined once in their own root layout
//     (same trick Poseidon uses for its trident mark); logoSrc is a plain
//     <img> alternative.
//   navItems: [{ href, label, icon, title?, subtitle? }]  — flat top-level
//     items. title/subtitle (if present) are used for the page header
//     when pathname matches that href; see `pageHeaderFor` below.
//   navGroups: [{ key, label, icon?, items: [{ href, label, title?, subtitle? }] }]
//     — collapsible secondary groups (e.g. "Налаштування" split into
//     several routes), rendered below the flat items.
//   icons: { [name]: <svg path/shape JSX> }  — looked up by `icon` key on
//     each nav item; rendered inside a shared 24x24 <svg> wrapper.
//   pathname: string — current route, used to mark the active link and
//     resolve the page header.
//   LinkComponent: component accepting {href, className, children, ...}
//     — defaults to a plain <a>; pass next/link's Link in a Next app.
//   adminEmail: string
//   onLogout: () => void
//   pageHeaderExtra: { title, subtitle } | null — override for routes not
//     in navItems/navGroups (e.g. a dynamic /admin/bookings/[id] page).
//   children: page content.
export default function AdminChrome({
  brand,
  navItems = [],
  navGroups = [],
  icons = {},
  pathname = "",
  LinkComponent = DefaultLink,
  adminEmail,
  onLogout,
  pageHeaderExtra = null,
  children,
}) {
  const Link = LinkComponent;
  const [openGroups, setOpenGroups] = useState(() => {
    const init = {};
    for (const g of navGroups) init[g.key] = g.items.some((n) => pathname === n.href);
    return init;
  });

  // 'closed' | 'open' | 'closing'. The nav/footer markup below is always
  // mounted (desktop needs it permanently rendered via display:contents
  // anyway), so — unlike Modal/SidePanel, which animate a true mount/
  // unmount — toggling this class directly is enough to trigger the CSS
  // transition in either direction; no entering-frame step needed. The
  // separate 'closing' phase exists only so closing can run its own
  // (quicker) transition-duration via its own class, and so the hooks
  // below stay engaged until that transition actually finishes.
  const [navPhase, setNavPhase] = useState("closed");
  const panelRef = useRef(null);
  const closeTimerRef = useRef(null);

  function openMobileNav() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setNavPhase("open");
  }
  function closeMobileNav() {
    setNavPhase((p) => (p === "closed" ? p : "closing"));
    closeTimerRef.current = window.setTimeout(() => {
      setNavPhase("closed");
      closeTimerRef.current = null;
    }, MOBILE_NAV_CLOSE_MS);
  }
  function toggleMobileNav() {
    if (navPhase === "open") closeMobileNav();
    else openMobileNav();
  }

  useEffect(() => {
    // Route change: the page already navigated, so drop the menu instantly
    // rather than making the visit wait on a close animation it didn't ask
    // for ("вибір пункту — навігація реагує одразу").
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setNavPhase("closed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const navEngaged = navPhase !== "closed";
  useFocusTrap(panelRef, closeMobileNav, { active: navEngaged });

  const header = pageHeaderFor(pathname, navItems, navGroups) || pageHeaderExtra;

  return (
    <div className="admin-app">
      <aside className="admin-side">
        <div className="admin-side-top">
          <span className="brand admin-side-brand">
            {brand?.logoSymbolId ? (
              <svg className="brand-icon" aria-hidden="true">
                <use href={`#${brand.logoSymbolId}`} />
              </svg>
            ) : brand?.logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="brand-icon" src={brand.logoSrc} alt="" width={24} height={24} />
            ) : null}
            <span className="brand-word">{brand?.name}</span>
          </span>
          <button
            type="button"
            className="admin-burger"
            aria-label="Меню"
            aria-expanded={navEngaged}
            onClick={toggleMobileNav}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {navEngaged ? <MobileNavScrollLock /> : null}
        <div
          className={`admin-side-backdrop is-${navPhase}`}
          onClick={closeMobileNav}
          aria-hidden="true"
        />
        <div
          className={`admin-side-panel is-${navPhase}`}
          ref={panelRef}
          role={navEngaged ? "dialog" : undefined}
          aria-modal={navEngaged ? "true" : undefined}
          aria-label={navEngaged ? "Меню" : undefined}
        >
         <div className="admin-side-panel-inner">
          <div className="admin-nav-scroll">
            {/* prefetch={false}: every nav item is a DB-backed dynamic
                route, so next/link's default prefetch-on-mount would fire
                ~7 concurrent Prisma queries the instant this chrome
                renders — a real problem against a serverless Postgres
                compute that autosuspends and can drop connections while
                waking up from a burst like that. */}
            <nav className="admin-nav">
              {navItems.map((n) => (
                <Link key={n.href} href={n.href} prefetch={false} className={`admin-nav-btn${pathname === n.href ? " is-active" : ""}`}>
                  <Icon shape={icons[n.icon]} />
                  {n.label}
                </Link>
              ))}
            </nav>

            {navGroups.map((g) => {
              const isOnGroup = g.items.some((n) => pathname === n.href);
              const open = openGroups[g.key] ?? isOnGroup;
              return (
                <div key={g.key} className="admin-nav-group">
                  <button
                    type="button"
                    className={`admin-nav-btn admin-nav-group-toggle${isOnGroup ? " is-active" : ""}`}
                    onClick={() => setOpenGroups((s) => ({ ...s, [g.key]: !open }))}
                    aria-expanded={open}
                  >
                    {g.icon ? <Icon shape={icons[g.icon]} /> : null}
                    <span style={{ flex: 1 }}>{g.label}</span>
                    <Icon shape={icons.chevron} className="chev" />
                  </button>
                  {open ? (
                    <div className="admin-nav-group-list">
                      {g.items.map((n) => (
                        <Link
                          key={n.href}
                          href={n.href}
                          prefetch={false}
                          className={`admin-nav-btn admin-nav-btn--sub${pathname === n.href ? " is-active" : ""}`}
                        >
                          {n.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="admin-side-footer">
            <p>{adminEmail}</p>
            <button type="button" className="admin-btn outline small" style={{ width: "100%", justifyContent: "center" }} onClick={onLogout}>
              Вийти
            </button>
            <Link href="/" className="admin-view-site">
              ← На сайт
            </Link>
          </div>
         </div>
        </div>
      </aside>

      <main className="admin-main">
        {header ? (
          <div className="admin-panel-head">
            <div>
              <h2>{header.title}</h2>
              {header.subtitle ? <p className="admin-panel-head-sub">{header.subtitle}</p> : null}
            </div>
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}

function Icon({ shape, className }) {
  if (!shape) return null;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shape}
    </svg>
  );
}

function pageHeaderFor(pathname, navItems, navGroups) {
  const flat = navItems.find((n) => n.href === pathname);
  if (flat?.title) return { title: flat.title, subtitle: flat.subtitle };
  for (const g of navGroups) {
    const sub = g.items.find((n) => n.href === pathname);
    if (sub?.title) return { title: sub.title, subtitle: sub.subtitle };
  }
  return null;
}
