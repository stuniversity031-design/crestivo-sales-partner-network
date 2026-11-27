import React, { useState } from "react";
import { LogIn } from "lucide-react";
import { useAuth } from "../state/auth.jsx";
import { Field } from "../components/ui.jsx";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    setBusy(true);
    setError("");
    const err = await signIn(email.trim(), password);
    if (err) setError(err);
    setBusy(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <form className="surface raised rise" onSubmit={submit} style={{ width: "100%", maxWidth: 400, padding: 28 }}>
        <span className="eyebrow">CRESTIVO SALES PARTNER NETWORK</span>
        <h2 style={{ margin: "8px 0 20px" }}>Sign in</h2>
        <Field label="Email">
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn primary" type="submit" disabled={busy} style={{ width: "100%", marginTop: 12 }}>
          <LogIn size={15} /> {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="muted" style={{ marginTop: 14 }}>Access is by invitation only.</p>
      </form>
    </div>
  );
}
