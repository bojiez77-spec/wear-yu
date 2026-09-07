import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Code2,
  LayoutDashboard,
  Menu,
  MessageCircle,
  PanelLeftClose,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

const links = [
  { to: "/", name: "總覽", en: "Dashboard", icon: LayoutDashboard },
  { to: "/programs", name: "程式", en: "Programs", icon: Code2 },
  { to: "/social", name: "社群", en: "Social", icon: MessageCircle },
  { to: "/sourcing", name: "選品", en: "Sourcing", icon: ShoppingBag },
];
export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const closeButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      document.getElementById("main-content")?.focus();
      previousPath.current = location.pathname;
    }
  }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === "Tab") {
        const items = document.querySelectorAll<HTMLElement>(
          "#sidebar button, #sidebar nav a",
        );
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    function onResize() {
      if (window.innerWidth > 720) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  const current = links.find((link) => link.to === location.pathname);
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        跳至主要內容
      </a>
      {open && (
        <button
          className="nav-backdrop"
          aria-label="關閉導覽選單"
          onClick={() => {
            setOpen(false);
            menuButton.current?.focus();
          }}
        />
      )}
      <aside className={`sidebar ${open ? "is-open" : ""}`} id="sidebar">
        <div className="brand">
          <div className="brand-mark">
            W<span>Y</span>
          </div>
          <div>
            <strong>WEAR-YU</strong>
            <small>GM COMMAND CENTER</small>
          </div>
          <button
            ref={closeButton}
            className="icon-button mobile-close"
            aria-label="關閉選單"
            onClick={() => {
              setOpen(false);
              menuButton.current?.focus();
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace">
          <span className="workspace-avatar">W</span>
          <div>
            <strong>Wear-Yu 品牌工作室</strong>
            <small>品牌營運工作空間</small>
          </div>
          <span className="live-dot" />
        </div>
        <p className="nav-label">
          WORKSPACE <span>工作台</span>
        </p>
        <nav aria-label="主要導覽">
          {links.map(({ to, name, en, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              <span>
                {name}
                <small>{en}</small>
              </span>
              <span className="nav-active-dot" />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="studio-note">
            <Sparkles size={19} />
            <p>讓好品味，成為好生意。</p>
            <small>Thoughtfully curated. Beautifully run.</small>
          </div>
          <div className="profile">
            <span className="avatar">GM</span>
            <div>
              <strong>品牌主理人</strong>
              <small>General Manager</small>
            </div>
            <PanelLeftClose size={17} />
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={open}>
        <div className="topbar">
          <div className="breadcrumb">
            <button
              ref={menuButton}
              className="icon-button menu-toggle"
              aria-label="開啟選單"
              aria-expanded={open}
              aria-controls="sidebar"
              onClick={() => setOpen(!open)}
            >
              <Menu size={20} />
            </button>
            <span>工作台</span>
            <span className="slash">/</span>
            <strong>{current?.en ?? "Page"}</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-indicator">
              <span className="live-dot" /> MOCK DATA
            </span>
            <span className="topbar-divider" />
            <span className="mini-avatar">GM</span>
          </div>
        </div>
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>
            WEAR-YU <span className="footer-dot">·</span> Every detail,
            intentional.
          </span>
          <span>
            MVP 0.1 <ArrowUpRight size={12} />
          </span>
        </footer>
      </div>
    </div>
  );
}
