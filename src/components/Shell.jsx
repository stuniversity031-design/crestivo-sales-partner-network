import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Users, Target, Kanban, Wallet, Package, Edit3, Settings, Search, Bell, Menu,
  PanelLeftClose, PanelLeftOpen, Link2, BookOpen, TrendingUp, UserCircle, Globe, CheckCheck, RotateCcw, LogOut
} from "lucide-react";
import { useStore } from "../state/store.jsx";
import { useAuth } from "../state/auth.jsx";
import { Modal, Toasts } from "./ui.jsx";

export const NAV = {
  admin: [
    { group: "Overview", items: [["dashboard", "Dashboard", LayoutDashboard]] },
    { group: "Network", items: [["partners", "Partners", Users], ["leads", "Leads", Target], ["pipeline", "Pipeline", Kanban]] },
    { group: "Finance", items: [["commissions", "Commission Center", Wallet]] },
    { group: "Content", items: [["services", "Service Catalog", Package], ["editor", "No-Code Editor", Edit3], ["settings", "Settings", Settings]] },
    { group: "Experiences", items: [["client", "Client Inquiry", Globe]] }
  ],
  partner: [
    { group: "Overview", items: [["dashboard", "Dashboard", LayoutDashboard]] },
    { group: "Sell", items: [["referral", "Referral Center", Link2], ["enablement", "Sales Enablement", BookOpen], ["pipeline", "My Pipeline", Kanban]] },
    { group: "Earn", items: [["earnings", "Earnings & Payouts", TrendingUp]] },
    { group: "Account", items: [["profile", "Profile", UserCircle]] },
    { group: "Experiences", items: [["client", "Client Inquiry", Globe]] }
  ]
};

export default function Shell({ page, setPage, children }) {
  const store = useStore();
  const { profile, signOut } = useAuth();
  const { session, notifications, markAllRead, prefs, setPref, resetAll, settings } = store;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [bell, setBell] = useState(false);
  const nav = NAV[session.role];
  const unread = notifications.filter((n) => !n.read).length;
  const collapsed = !prefs.sidebarOpen;

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const go = (id) => { setPage(id); setMobileOpen(false); };
  const label = nav.flatMap((g) => g.items).find((i) => i[0] === page)?.[1] || "";

  return (
    <div className={"shell" + (collapsed ? " collapsed" : "")}>
      <aside className={"sidebar" + (mobileOpen ? " open" : "")}>
        <div className="brandRow">
          <div className="brandmark">{settings.brand?.[0] || "C"}</div>
          <div><b>{settings.brand}</b><small>{session.role === "admin" ? "ADMINISTRATION" : "PARTNER PORTAL"}</small></div>
        </div>
        {nav.map((g) => (
          <div key={g.group}>
            <div className="navGroup">{g.group}</div>
            {g.items.map(([id, name, Icon]) => (
              <button key={id} className={"navItem" + (page === id ? " active" : "")} onClick={() => go(id)} title={name}>
                <Icon size={18} /><span>{name}</span>
              </button>
            ))}
          </div>
        ))}
        <div className="sideFoot">
          {session.role === "admin" && (
            <button className="btn sm ghost" onClick={resetAll}><RotateCcw size={14} /> Reset demo data</button>
          )}
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <button className="iconBtn mobileOnly" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={18} /></button>
          <button className="iconBtn desktopOnly" onClick={() => setPref("sidebarOpen", !prefs.sidebarOpen)}>
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <span className="crumbs">{session.role.toUpperCase()} / {label.toUpperCase()}</span>
          <div className="spacer" />
          <button className="searchBtn" onClick={() => setPalette(true)}>
            <Search size={15} /><span>Search or jump to…</span><span className="kbd">⌘K</span>
          </button>
          <span className="muted">{profile?.email}</span>
          <button className="btn sm" onClick={signOut}><LogOut size={14} /> Sign out</button>
          <button className="iconBtn" onClick={() => setBell(true)}>
            <Bell size={18} />{unread > 0 && <i className="dot" />}
          </button>
        </header>
        <div className="page">{children}</div>
      </div>

      {palette && <Palette nav={nav} go={(id) => { go(id); setPalette(false); }} onClose={() => setPalette(false)} />}
      {bell && (
        <Modal title="Notifications" onClose={() => setBell(false)}>
          {notifications.length === 0 && <p className="muted">No notifications.</p>}
          {notifications.slice(0, 12).map((n) => (
            <div key={n.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)", opacity: n.read ? 0.55 : 1 }}>{n.text}<small className="muted" style={{ display: "block" }}>{n.date}</small></div>
          ))}
          <div className="row end" style={{ marginTop: 16 }}><button className="btn sm" onClick={markAllRead}><CheckCheck size={14} /> Mark all read</button></div>
        </Modal>
      )}
      <Toasts />
    </div>
  );
}

function Palette({ nav, go, onClose }) {
  const [q, setQ] = useState("");
  const items = useMemo(() => nav.flatMap((g) => g.items).filter((i) => i[1].toLowerCase().includes(q.toLowerCase())), [nav, q]);
  return (
    <div className="modalBack" onMouseDown={onClose}>
      <div className="palette surface raised" onMouseDown={(e) => e.stopPropagation()}>
        <input autoFocus placeholder="Jump to…" value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") onClose(); if (e.key === "Enter" && items[0]) go(items[0][0]); }} />
        {items.map(([id, name, Icon]) => (
          <button key={id} className="palItem" onClick={() => go(id)}><Icon size={16} />{name}</button>
        ))}
        {items.length === 0 && <div className="empty">No matches</div>}
      </div>
    </div>
  );
}
