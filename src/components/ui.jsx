import React, { useEffect } from "react";
import { X, Inbox } from "lucide-react";
import { useStore } from "../state/store.jsx";

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="modalBack" onMouseDown={onClose}>
      <div className={"modal surface raised rise" + (wide ? " wide" : "")} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <h3>{title}</h3>
          <button className="iconBtn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ title, body, confirmLabel = "Confirm", danger, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="dim" style={{ marginBottom: 20 }}>{body}</p>
      <div className="row end">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className={"btn primary" + (danger ? " danger" : "")} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <span className="err">{error}</span>}
    </label>
  );
}

export function Empty({ title = "Nothing here yet", body = "" }) {
  return (
    <div className="empty">
      <Inbox size={28} />
      <b>{title}</b>
      {body && <span className="muted">{body}</span>}
    </div>
  );
}

export function PageHead({ eyebrow, title, sub, actions }) {
  return (
    <div className="pageHead rise">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {sub && <p className="dim">{sub}</p>}
      </div>
      <div className="row">{actions}</div>
    </div>
  );
}

export function Stat({ label, value, sub, icon: Icon }) {
  return (
    <div className="stat surface rise">
      <div className="statTop">
        <span className="eyebrow">{label}</span>
        {Icon && <Icon size={16} />}
      </div>
      <strong>{value}</strong>
      {sub && <small className="muted">{sub}</small>}
    </div>
  );
}

export function Panel({ title, sub, actions, children, pad = true }) {
  return (
    <section className="surface panel rise">
      {(title || actions) && (
        <div className="panelHead">
          <div><b>{title}</b>{sub && <span className="muted">{sub}</span>}</div>
          <div className="row">{actions}</div>
        </div>
      )}
      <div className={pad ? "panelBody" : ""}>{children}</div>
    </section>
  );
}

export function StatusPill({ status }) {
  const map = {
    active: "good", paid: "good", published: "good", Won: "good", approved: "info",
    pending: "warn", draft: "warn", New: "info", "Under Review": "warn",
    suspended: "bad", reversed: "bad", Lost: "bad", rejected: "bad"
  };
  return <span className={"pill " + (map[status] || "gold")}>{status}</span>;
}

export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="toasts">
      {toasts.map((t) => <div key={t.id} className={"toast surface raised rise " + t.kind}>{t.text}</div>)}
    </div>
  );
}
