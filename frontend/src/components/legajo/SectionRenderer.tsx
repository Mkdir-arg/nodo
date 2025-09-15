import * as Icons from "lucide-react";
function isUiNode(n:any){ return n?.kind==="ui" || String(n?.type||"").startsWith("ui:"); }

function getPath(obj:any, path?:string){ if(!obj || !path) return ""; return path.split(".").reduce((o:any,k:string)=>o?.[k], obj) ?? ""; }
function tpl(tplStr:string, ctx:any){ return (tplStr||"").replace(/{{\s*([^}]+)\s*}}/g,(_,p)=> String(getPath(ctx,p.trim())) ); }

function FieldReadOnly({ node, ctx }:{ node:any; ctx:any }) {
  return <div>{node.label || node.key}</div>;
}
const AttachmentsCard = (props:any)=> <div className="text-sm text-slate-500">Archivos</div>;
const Timeline = (props:any)=> <div className="text-sm text-slate-500">Timeline</div>;
const SummaryPinned = ({cfg, ctx}:{cfg:any; ctx:any})=> <div className="text-sm text-slate-500">Resumen</div>;

export function SectionRenderer({ section, ctx }:{ section:any; ctx:any }) {
  return (
    <div className="space-y-4">
      {section.nodes.map((n:any)=>{
        if (isUiNode(n)) return <UiBlock key={n.id} node={n} ctx={ctx} />;
        return <FieldReadOnly key={n.id} node={n} ctx={ctx} />;
      })}
    </div>
  );
}

function UiBlock({ node, ctx }:{ node:any; ctx:any }) {
  const cfg = node.config || {};
  if (node.type === "ui:header") {
    return (
      <header className="rounded-2xl p-6 text-white bg-gradient-to-r from-indigo-600 to-sky-500">
        <h1 className="text-2xl font-semibold">{tpl(cfg.title, ctx)}</h1>
        {cfg.subtitle && <p className="opacity-80">{cfg.subtitle}</p>}
      </header>
    );
  }
  if (node.type === "ui:kpi-grid") {
    const items = cfg.items ?? [];
    return (
      <div className="grid gap-3" style={{gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))"}}>
        {items.map((it:any)=>(
          <div key={it.id} className="rounded-lg border p-4">
            <div className="text-sm text-slate-500">{it.label}</div>
            <div className="text-2xl font-semibold">{tpl(it.value, ctx)}</div>
            {it.trend && <div className="text-xs text-slate-500">{it.trend}</div>}
          </div>
        ))}
      </div>
    );
  }
  if (node.type === "ui:divider") return <hr className="my-6 border-slate-200" />;
  if (node.type === "ui:banner") return <div className="rounded-md border p-4 bg-sky-50 text-sky-900">{cfg.text}</div>;
  if (node.type === "ui:attachments") return <AttachmentsCard />;
  if (node.type === "ui:timeline") return <Timeline />;
  if (node.type === "ui:summary-pinned") return <SummaryPinned cfg={cfg} ctx={ctx} />;
  return null;
}
