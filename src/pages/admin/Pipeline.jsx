import React, { useState } from "react";
import { useStore } from "../../state/store.jsx";
import { PageHead } from "../../components/ui.jsx";
import { money } from "../../lib/calc.js";
import { STAGES } from "../../data/seed.js";

export default function Pipeline() {
  const { leads, partners, services, session, moveLead, toast } = useStore();
  const isAdmin = session.role === "admin";
  const [over, setOver] = useState(null);
  const visible = leads.filter((l) => isAdmin || l.partnerId === session.partnerId);
  const pName = (id) => partners.find((p) => p.id === id)?.name || "";
  const sName = (id) => services.find((s) => s.id === id)?.name || "";

  const drop = (stage, e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("id");
    setOver(null);
    if (!id || !isAdmin) return;
    moveLead(id, stage);
    toast(`Moved to ${stage}`);
  };

  return (
    <>
      <PageHead eyebrow={isAdmin ? "NETWORK" : "SELL"} title={isAdmin ? "Pipeline" : "My Pipeline"}
        sub={isAdmin ? "Drag cards between stages. Moving to Won creates a pending commission." : "Track your submitted leads through each stage."} />
      <div className="board">
        {STAGES.map((st) => {
          const items = visible.filter((l) => l.stage === st);
          return (
            <div key={st} className={"col" + (over === st ? " over" : "")}
              onDragOver={(e) => { e.preventDefault(); setOver(st); }} onDragLeave={() => setOver(null)} onDrop={(e) => drop(st, e)}>
              <div className="colHead"><span>{st}</span><span>{items.length}</span></div>
              {items.map((l) => (
                <div key={l.id} className="card" draggable={isAdmin} onDragStart={(e) => e.dataTransfer.setData("id", l.id)}>
                  <b>{l.name}</b>
                  <small className="muted">{sName(l.serviceId)}</small>
                  <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                    <span className="dim">{money(l.value)}</span>
                    {isAdmin && <span className="muted" style={{ fontSize: 11 }}>{pName(l.partnerId).split(" ")[0]}</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
