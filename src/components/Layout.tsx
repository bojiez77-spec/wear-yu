import { useEffect, useRef, useState } from "react";
import { useOperations } from "../hooks/useOperations";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAppearance, type Theme, type LayoutMode } from "../hooks/useAppearance";
import {
  ArrowUpRight,
  ClipboardCheck,
  ShieldCheck,
  LayoutDashboard,
  Menu,
  MessageCircle,
  ShoppingBag,
  X,
} from "lucide-react";

const links = [
  { to: "/", name: "總覽", en: "Dashboard", icon: LayoutDashboard },
  { to: "/sourcing", name: "選品", en: "Sourcing", icon: ShoppingBag },
  { to: "/social", name: "視覺", en: "Visual", icon: MessageCircle },
  { to: "/approvals", name: "審批", en: "Approvals", icon: ClipboardCheck },
  { to: "/audit", name: "稽核", en: "Audit", icon: ShieldCheck },
];
export default function Layout() {
  const { demo, toggleDemo } = useOperations();
  const { theme, setTheme, layout, setLayout } = useAppearance();
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === "Tab") {
        const items = Array.from(document.querySelectorAll<HTMLElement>(
          "#sidebar button, #sidebar a, #sidebar select, #sidebar summary",
        )).filter(item => item.getClientRects().length > 0);
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
      document.body.style.overflow = previousOverflow;
      if (document.activeElement?.closest("#sidebar")) {
        menuButton.current?.focus();
      }
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
          <div>
            <strong>wear.yu</strong>
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
              onClick={() => {
                setOpen(false);
                if (to === location.pathname) menuButton.current?.focus();
              }}
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
          <details className="appearance-settings"><summary>顯示與工具</summary><div className="appearance-controls">
            <label>外觀色調
              <select value={theme} onChange={(event) => setTheme(event.target.value as Theme)}>
                <option value="sky">霧天藍</option>
                <option value="steel">深鋼藍</option>
              </select>
            </label>
            <label>頁面佈局
              <select value={layout} onChange={(event) => setLayout(event.target.value as LayoutMode)}>
                <option value="studio">品牌工作室</option>
                <option value="focus">專注工作台</option>
              </select>
            </label>
          </div>
          <NavLink className="tool-link" to="/programs" onClick={() => setOpen(false)}>程式工具</NavLink></details>
          <div className="studio-note">
            <p>讓好品味，成為好生意。</p>
            <small>Thoughtfully curated. Beautifully run.</small>
          </div>
          <div className="profile">
            <span className="avatar">GM</span>
            <div>
              <strong>品牌主理人</strong>
              <small>General Manager</small>
            </div>
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
              {demo ? "示範案件" : "本次工作"}
            </span>
            <button className="quiet-button demo-toggle" onClick={toggleDemo}>{demo ? "退出示範" : "查看示範"}</button>
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
            本機暫存 · 重新整理清除 <ArrowUpRight size={12} />
          </span>
        </footer>
      </div>
    </div>
  );
}
