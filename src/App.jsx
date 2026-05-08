import { useState, useEffect, useRef } from "react";

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0c10;--bg2:#0f1117;--bg3:#141720;
  --surface:#181c26;--surface2:#1e2232;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.10);
  --text:#e8eaf0;--muted:#6b7280;--muted2:#9ca3af;
  --accent:#3b82f6;--accent2:#6366f1;
  --green:#10b981;--amber:#f59e0b;--red:#ef4444;
  --orange:#f97316;--cyan:#06b6d4;--purple:#8b5cf6;--wa:#25D366;
  --font-head:'Syne',sans-serif;--font-body:'DM Sans',sans-serif;
  --radius:14px;--radius-sm:8px;
  --shadow:0 4px 24px rgba(0,0,0,0.4);--shadow-lg:0 8px 40px rgba(0,0,0,0.5);
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);font-size:14px;line-height:1.6}
@media(max-width:640px){
  .mobile-pad{padding:12px!important}
  .kanban-board{gap:10px}
  .kanban-col{flex:0 0 260px;min-width:260px}
  table{font-size:11px}
}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:var(--surface2);border-radius:4px}
input,select,textarea{
  background:var(--surface);border:1px solid var(--border2);color:var(--text);
  border-radius:var(--radius-sm);padding:8px 12px;font-family:var(--font-body);
  font-size:13px;outline:none;transition:border .2s,box-shadow .2s;width:100%
}
input:focus,select:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(59,130,246,0.12)}
select option{background:var(--surface2)}
button{cursor:pointer;font-family:var(--font-body);transition:all .15s}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--radius-sm);font-size:13px;font-weight:500;border:none;white-space:nowrap}
.btn-primary{background:var(--accent);color:#fff}
.btn-primary:hover{background:#2563eb;transform:translateY(-1px);box-shadow:0 4px 12px rgba(59,130,246,0.3)}
.btn-ghost{background:var(--surface);color:var(--muted2);border:1px solid var(--border2)}
.btn-ghost:hover{background:var(--surface2);color:var(--text)}
.btn-danger{background:rgba(239,68,68,0.12);color:var(--red);border:1px solid rgba(239,68,68,0.2)}
.btn-danger:hover{background:rgba(239,68,68,0.2)}
.btn-sm{padding:5px 10px;font-size:11px}
.btn-green{background:rgba(16,185,129,0.12);color:var(--green);border:1px solid rgba(16,185,129,0.2)}
.btn-green:hover{background:rgba(16,185,129,0.2)}
.btn-wa{background:rgba(37,211,102,0.12);color:var(--wa);border:1px solid rgba(37,211,102,0.25)}
.btn-wa:hover{background:rgba(37,211,102,0.22)}
.btn-import{background:rgba(99,102,241,0.12);color:var(--accent2);border:1px solid rgba(99,102,241,0.25)}
.btn-import:hover{background:rgba(99,102,241,0.22)}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite}
.kanban-board{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px;align-items:flex-start}
.kanban-col{flex:0 0 290px;min-width:290px;background:var(--surface);border-radius:var(--radius);overflow:hidden}
.kanban-cards{padding:10px;display:flex;flex-direction:column;gap:10px;min-height:60px}
.kanban-card{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px}
.kanban-actions{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px}
`;


// ─── VALIDATION ENGINE ───────────────────────────────────────────────────────
const V = {
  required:  v => (!v || !String(v).trim()) ? "This field is required" : "",
  name:      v => {
    if (!v || !v.trim()) return "Name is required";
    if (v.trim().length < 3) return "Minimum 3 characters";
    if (!/^[A-Za-z ]+$/.test(v.trim())) return "Only letters and spaces allowed";
    return "";
  },
  email:     v => {
    if (!v || !v.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Enter a valid email address";
    return "";
  },
  password:  v => {
    if (!v) return "Password is required";
    if (v.length < 8) return "Minimum 8 characters";
    if (!/[A-Z]/.test(v)) return "Must include at least 1 uppercase letter";
    if (!/[a-z]/.test(v)) return "Must include at least 1 lowercase letter";
    if (!/[0-9]/.test(v)) return "Must include at least 1 number";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v)) return "Must include at least 1 special character";
    return "";
  },
  confirmPwd:(v,pwd) => (!v ? "Please confirm your password" : v !== pwd ? "Passwords do not match" : ""),
  phone:     v => {
    if (!v || !v.trim()) return "";  // optional unless marked required
    const digits = v.replace(/\D/g,"");
    if (digits.length < 10) return "Minimum 10 digits";
    if (digits.length > 15) return "Maximum 15 digits";
    return "";
  },
  phoneRequired: v => {
    const digits = (v||"").replace(/\D/g,"");
    if (!digits) return "Phone number is required";
    if (digits.length < 10) return "Minimum 10 digits";
    if (digits.length > 15) return "Maximum 15 digits";
    return "";
  },
  companyName: v => {
    if (!v || !v.trim()) return "Company name is required";
    if (v.trim().length < 3) return "Minimum 3 characters";
    if (!/^[A-Za-z0-9 &.\-]+$/.test(v.trim())) return "Only letters, numbers, spaces, & . - allowed";
    return "";
  },
  gst:       v => {
    if (!v || !v.trim()) return ""; // optional
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v.trim().toUpperCase()))
      return "Invalid GST format (e.g. 27ABCDE1234F1Z5)";
    return "";
  },
  workers:   v => {
    if (!v || !v.trim()) return ""; // optional
    if (!/^\d{1,5}$/.test(v.trim())) return "Enter a valid number (max 5 digits)";
    if (parseInt(v) < 0) return "Cannot be negative";
    return "";
  },
  positiveNum: v => {
    if (v === "" || v === null || v === undefined) return "This field is required";
    if (isNaN(Number(v)) || Number(v) < 0) return "Must be a positive number";
    return "";
  },
  futureDate: v => {
    if (!v) return "Delivery date is required";
    const today = new Date(); today.setHours(0,0,0,0);
    // Parse YYYY-MM-DD in LOCAL time (not UTC) to avoid timezone off-by-one
    const [yr,mo,dy] = v.split("-").map(Number);
    const selected = new Date(yr, mo-1, dy);
    if (selected < today) return "Delivery date cannot be in the past";
    return "";
  },
};

// Inline field error display — used below each input
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ color:"var(--red)", fontSize:11, marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
      <span style={{ fontSize:10 }}>✕</span>{msg}
    </div>
  );
}

// Validated input style helper
function inputStyle(err, touched) {
  if (!touched) return {};
  if (err) return { borderColor:"var(--red)", boxShadow:"0 0 0 3px rgba(239,68,68,0.1)" };
  return { borderColor:"var(--green)", boxShadow:"0 0 0 3px rgba(16,185,129,0.08)" };
}

// Phone-only key handler — prevents non-digit input
function onlyDigits(e) {
  if (!/[0-9+]/.test(e.key) && !["Backspace","Delete","ArrowLeft","ArrowRight","Tab"].includes(e.key)) {
    e.preventDefault();
  }
}
// Number-only key handler
function onlyNumbers(e) {
  if (!/[0-9]/.test(e.key) && !["Backspace","Delete","ArrowLeft","ArrowRight","Tab"].includes(e.key)) {
    e.preventDefault();
  }
}

// ─── TODAY DATE ───────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0, 10);

// ─── CSV ENGINE ───────────────────────────────────────────────────────────────
function escCell(v) {
  const s = String(v == null ? "" : v);
  return (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r"))
    ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCSV(headers, rows) {
  const lines = [headers, ...rows].map(r => r.map(escCell).join(","));
  return "\uFEFF" + lines.join("\r\n");
}

// ─── EXPORT CSV ──────────────────────────────────────────────────────────────
// Works on: PC Chrome/Firefox/Edge, Android Chrome, iOS Safari (via window.open fallback)
// NOTE: Will NOT work inside sandboxed iframes (e.g. Claude preview) — test on deployed URL.
function exportCSV(filename, headers, rows) {
  try {
    // Build CSV string with UTF-8 BOM (makes Excel open it correctly)
    const csvRows = [headers];
    rows.forEach(row => {
      csvRows.push(row.map(value => {
        const escaped = String(value ?? "").replace(/"/g, '""');
        return `"${escaped}"`;
      }));
    });
    const csvString = "\uFEFF" + csvRows.map(r => r.join(",")).join("\n");

    const blob    = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const blobUrl = window.URL.createObjectURL(blob);

    // Detect iOS Safari — it ignores <a download> on blob URLs, needs window.open
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      // iOS Safari: open blob URL in new tab — user taps Share → Save to Files
      window.open(blobUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
      return;
    }

    // All other browsers: standard anchor click download
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", filename);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);

  } catch (err) {
    console.error("CSV Export Error:", err);
    alert("Export failed: " + err.message);
  }
}

// ─── CSV PARSER ───────────────────────────────────────────────────────────────
// Robust RFC-4180-compatible parser that handles quoted fields, commas in values, CRLF/LF
function parseCSV(text) {
  const rows = [];
  // Normalize line endings
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  let cur = 0;
  const len = normalized.length;

  while (cur < len) {
    const row = [];
    // Parse one row
    while (cur < len) {
      if (normalized[cur] === '"') {
        // Quoted field
        cur++; // skip opening quote
        let field = "";
        while (cur < len) {
          if (normalized[cur] === '"') {
            if (cur + 1 < len && normalized[cur + 1] === '"') {
              field += '"'; cur += 2; // escaped quote
            } else {
              cur++; break; // closing quote
            }
          } else {
            field += normalized[cur++];
          }
        }
        row.push(field);
        if (cur < len && normalized[cur] === ",") cur++;
        else if (cur < len && normalized[cur] === "\n") { cur++; break; }
        else if (cur >= len) break;
      } else {
        // Unquoted field
        let field = "";
        while (cur < len && normalized[cur] !== "," && normalized[cur] !== "\n") {
          field += normalized[cur++];
        }
        row.push(field.trim());
        if (cur < len && normalized[cur] === ",") cur++;
        else if (cur < len && normalized[cur] === "\n") { cur++; break; }
        else if (cur >= len) break;
      }
    }
    if (row.length > 0 && !(row.length === 1 && row[0] === "")) {
      rows.push(row);
    }
  }
  return rows;
}

// Map raw CSV headers to internal keys using aliases
function mapHeaders(rawHeaders, aliasMap) {
  return rawHeaders.map(h => {
    const norm = h.toLowerCase().replace(/[\s_\-]/g, "");
    for (const [key, aliases] of Object.entries(aliasMap)) {
      if (aliases.some(a => a.replace(/[\s_\-]/g, "").toLowerCase() === norm)) return key;
    }
    return null; // unmapped
  });
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
function sendWhatsApp(job, companyName) {
  const phone = (job.customerPhone || "").replace(/\D/g, "").replace(/^0+/, "");
  if (!phone) { alert("No phone number for this customer. Please update the customer record with a phone number including country code (e.g. 919876543210)."); return; }
  const pend = (job.quantityReceived || 0) - (job.quantityCompleted || 0);
  const msg = [
    `Hello ${job.customerName},`,
    ``,
    `Your industrial job order is currently pending.`,
    ``,
    `Job Details:`,
    `- Job ID: ${job.id}`,
    `- Product: ${job.productName}${job.productDimension ? " (" + job.productDimension + ")" : ""}`,
    `- Work Type: ${job.workType}`,
    `- Pending Quantity: ${pend}`,
    `- Delivery Date: ${job.deliveryDate || "TBD"}`,
    ``,
    `Please contact us for further updates.`,
    ``,
    `Thank you,`,
    companyName || "ForgeTrack Industrial",
  ].join("\n");

  const encoded = encodeURIComponent(msg);
  // Try WhatsApp native deep link first (opens app directly on mobile)
  // wa.me is the universal link that works on both mobile app and WhatsApp Web
  const url = `https://wa.me/${phone}?text=${encoded}`;
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_CUSTOMERS = [
  { id:"C001", name:"Shree Industries",   phone:"919876543210", email:"shree@example.com",  createdAt:"2024-01-10" },
  { id:"C002", name:"Apex Manufacturing", phone:"919123456789", email:"apex@example.com",   createdAt:"2024-02-14" },
  { id:"C003", name:"Metro Tools Ltd",    phone:"919988776655", email:"metro@example.com",  createdAt:"2024-03-05" },
  { id:"C004", name:"Bharat Precision",   phone:"919765432109", email:"bharat@example.com", createdAt:"2024-03-20" },
  { id:"C005", name:"Global Rollers Co.", phone:"919654321098", email:"global@example.com", createdAt:"2024-04-02" },
];
const SEED_JOBS = [
  { id:"JOB-001", customerId:"C001", customerName:"Shree Industries",   customerPhone:"919876543210", productName:"Die",          productDimension:"1335 mm",      workType:"Polishing",   quantityReceived:50,  quantityCompleted:40, deliveryDate:"2025-05-15", priority:"High",   status:"In Progress", notes:"Handle with care",  createdAt:"2025-04-28" },
  { id:"JOB-002", customerId:"C002", customerName:"Apex Manufacturing", customerPhone:"919123456789", productName:"Roller",        productDimension:"500 x 200 mm", workType:"Repair",      quantityReceived:20,  quantityCompleted:20, deliveryDate:"2025-05-10", priority:"Urgent", status:"Delivered",   notes:"",                  createdAt:"2025-04-25" },
  { id:"JOB-003", customerId:"C003", customerName:"Metro Tools Ltd",    customerPhone:"919988776655", productName:"Spacer",        productDimension:"75 mm OD",     workType:"Grinding",    quantityReceived:100, quantityCompleted:30, deliveryDate:"2025-05-02", priority:"Medium", status:"Delayed",     notes:"Customer urgent",   createdAt:"2025-04-20" },
  { id:"JOB-004", customerId:"C004", customerName:"Bharat Precision",   customerPhone:"919765432109", productName:"Cutting Tool",  productDimension:"5x7 inch",     workType:"Coating",     quantityReceived:15,  quantityCompleted:0,  deliveryDate:"2025-05-25", priority:"Low",    status:"Pending",     notes:"",                  createdAt:"2025-05-01" },
  { id:"JOB-005", customerId:"C005", customerName:"Global Rollers Co.", customerPhone:"919654321098", productName:"Metal Plate",   productDimension:"1025 cm",      workType:"Finishing",   quantityReceived:80,  quantityCompleted:60, deliveryDate:"2025-05-20", priority:"High",   status:"In Progress", notes:"Second batch",       createdAt:"2025-05-02" },
  { id:"JOB-006", customerId:"C001", customerName:"Shree Industries",   customerPhone:"919876543210", productName:"Die",           productDimension:"900 mm",       workType:"Maintenance", quantityReceived:10,  quantityCompleted:10, deliveryDate:"2025-05-08", priority:"Medium", status:"Completed",   notes:"",                  createdAt:"2025-04-30" },
  { id:"JOB-007", customerId:"C002", customerName:"Apex Manufacturing", customerPhone:"919123456789", productName:"Roller",        productDimension:"600 x 150 mm", workType:"Polishing",   quantityReceived:35,  quantityCompleted:10, deliveryDate:"2025-05-05", priority:"Urgent", status:"Delayed",     notes:"Critical delivery", createdAt:"2025-04-22" },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  "Pending":     { color:"#f59e0b", bg:"rgba(245,158,11,0.12)" },
  "In Progress": { color:"#3b82f6", bg:"rgba(59,130,246,0.12)" },
  "Completed":   { color:"#10b981", bg:"rgba(16,185,129,0.12)" },
  "Delivered":   { color:"#6366f1", bg:"rgba(99,102,241,0.12)" },
  "Delayed":     { color:"#ef4444", bg:"rgba(239,68,68,0.12)"  },
};
const PRI_COL = { Low:"#6b7280", Medium:"#f59e0b", High:"#f97316", Urgent:"#ef4444" };
const WORK_TYPES = ["Polishing","Repair","Grinding","Coating","Finishing","Maintenance","Rework"];
const STATUSES   = ["Pending","In Progress","Completed","Delivered","Delayed"];
const PRIORITIES = ["Low","Medium","High","Urgent"];
const CHART_COLS = ["var(--accent)","var(--green)","var(--amber)","var(--purple)","var(--cyan)","var(--red)","var(--orange)"];

// Column alias maps for smart import
const CUSTOMER_ALIASES = {
  name:    ["name","customerName","customer name","customer_name","company","Client Name","client"],
  phone:   ["phone","phone number","mobile","contact","telephone","customerPhone","customer phone"],
  email:   ["email","email address","e-mail","mail"],
  address: ["address","addr","location"],
};
const JOB_ALIASES = {
  customerName:      ["customername","customer name","customer","client"],
  customerPhone:     ["customerphone","customer phone","phone","mobile","contact"],
  productName:       ["productname","product name","product","item","part"],
  productDimension:  ["productdimension","product dimension","dimension","size","spec"],
  workType:          ["worktype","work type","type","service","operation"],
  quantityReceived:  ["quantityreceived","quantity received","qty received","received","qty_received","rcvd"],
  quantityCompleted: ["quantitycompleted","quantity completed","qty completed","completed","done","qty_completed"],
  deliveryDate:      ["deliverydate","delivery date","due date","duedate","expected delivery"],
  priority:          ["priority","urgency","importance"],
  status:            ["status","state","stage"],
  notes:             ["notes","note","remarks","comment","comments"],
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG["Pending"];
  return (
    <span style={{ background:c.bg,color:c.color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:5,border:`1px solid ${c.color}30`,whiteSpace:"nowrap" }}>
      <span style={{ width:6,height:6,borderRadius:"50%",background:c.color }} />{status}
    </span>
  );
}
function PriorityDot({ priority }) {
  const c = PRI_COL[priority] || "#6b7280";
  return <span style={{ display:"inline-flex",alignItems:"center",gap:5,color:c,fontSize:12,fontWeight:500,whiteSpace:"nowrap" }}><span style={{ width:7,height:7,borderRadius:"50%",background:c,flexShrink:0 }} />{priority}</span>;
}
function Card({ children, style={} }) {
  return <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:20,...style }}>{children}</div>;
}
function StatCard({ label, value, icon, color="var(--accent)" }) {
  return (
    <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"18px 20px",animation:"fadeIn 0.3s ease" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:11,color:"var(--muted)",fontWeight:500,textTransform:"uppercase",letterSpacing:0.8 }}>{label}</div>
          <div style={{ fontSize:30,fontWeight:700,fontFamily:"var(--font-head)",color:"var(--text)",marginTop:4,lineHeight:1 }}>{value}</div>
        </div>
        <div style={{ width:40,height:40,borderRadius:10,background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{icon}</div>
      </div>
    </div>
  );
}
function Toast({ toasts }) {
  return (
    <div style={{ position:"fixed",top:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:8,maxWidth:340 }}>
      {toasts.map(t=>(
        <div key={t.id} style={{ background:t.type==="success"?"#0d2a1a":t.type==="error"?"#2a0d0d":t.type==="warn"?"#2a1f05":"var(--surface2)", border:`1px solid ${t.type==="success"?"rgba(16,185,129,0.35)":t.type==="error"?"rgba(239,68,68,0.35)":t.type==="warn"?"rgba(245,158,11,0.35)":"var(--border2)"}`, color:t.type==="success"?"var(--green)":t.type==="error"?"var(--red)":t.type==="warn"?"var(--amber)":"var(--text)", padding:"10px 14px",borderRadius:"var(--radius-sm)",fontSize:13,fontWeight:500,animation:"toastIn 0.3s ease",boxShadow:"var(--shadow)",display:"flex",alignItems:"flex-start",gap:8 }}>
          <span style={{ flexShrink:0,marginTop:1 }}>{t.type==="success"?"✓":t.type==="error"?"✕":t.type==="warn"?"⚠":"ℹ"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── ImportButton component ───────────────────────────────────────────────────
// Renders a styled hidden file input + trigger button
function ImportButton({ label, onFile, loading }) {
  const ref = useRef(null);
  return (
    <>
      <input ref={ref} type="file" accept=".csv,text/csv" style={{ display:"none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      <button className="btn btn-import btn-sm" disabled={loading} onClick={() => ref.current?.click()}>
        {loading ? <span className="spinner" /> : "↑"}
        {label}
      </button>
    </>
  );
}

// ─── CSV Import Logic ─────────────────────────────────────────────────────────
function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsText(file, "UTF-8");
  });
}

async function importCustomersFromCSV(file, existingCustomers) {
  const text = await readFileText(file);
  // Strip BOM if present
  const clean = text.replace(/^\uFEFF/, "");
  const rows = parseCSV(clean);
  if (rows.length < 2) throw new Error("CSV is empty or has no data rows");

  const rawHeaders = rows[0];
  const keyMap = mapHeaders(rawHeaders, CUSTOMER_ALIASES);
  const dataRows = rows.slice(1).filter(r => r.some(c => c.trim() !== ""));

  const existing = new Set(existingCustomers.map(c => c.name.toLowerCase().trim()));
  const imported = [];
  const skipped  = [];
  const errors   = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const obj = {};
    keyMap.forEach((key, idx) => { if (key) obj[key] = row[idx] || ""; });

    const name = (obj.name || "").trim();
    if (!name) { errors.push(`Row ${i + 2}: missing customer name`); continue; }
    if (existing.has(name.toLowerCase())) { skipped.push(name); continue; }

    const id = "C" + String(existingCustomers.length + imported.length + 1).padStart(3, "0");
    imported.push({
      id,
      name,
      phone:     (obj.phone   || "").replace(/\s+/g,""),
      email:     obj.email    || "",
      address:   obj.address  || "",
      createdAt: TODAY,
    });
    existing.add(name.toLowerCase());
  }

  return { imported, skipped, errors };
}

async function importJobsFromCSV(file, existingJobs, existingCustomers, setCustomers) {
  const text = await readFileText(file);
  const clean = text.replace(/^\uFEFF/, "");
  const rows = parseCSV(clean);
  if (rows.length < 2) throw new Error("CSV is empty or has no data rows");

  const rawHeaders = rows[0];
  const keyMap = mapHeaders(rawHeaders, JOB_ALIASES);
  const dataRows = rows.slice(1).filter(r => r.some(c => c.trim() !== ""));

  const existingIds = new Set(existingJobs.map(j => j.id.toLowerCase()));
  const importedJobs = [];
  const skipped = [];
  const errors  = [];
  const newCustomers = [...existingCustomers];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const obj = {};
    keyMap.forEach((key, idx) => { if (key) obj[key] = (row[idx] != null ? String(row[idx]) : "").trim(); });

    const customerName = obj.customerName;
    if (!customerName) { errors.push(`Row ${i + 2}: missing customer name`); continue; }
    if (!obj.productName) { errors.push(`Row ${i + 2}: missing product name`); continue; }

    // Auto-link or create customer
    let customer = newCustomers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
    if (!customer) {
      const newId = "C" + String(newCustomers.length + 1).padStart(3, "0");
      customer = { id: newId, name: customerName, phone: obj.customerPhone || "", email: "", createdAt: TODAY };
      newCustomers.push(customer);
    }

    const newJobId = `JOB-${String(existingJobs.length + importedJobs.length + 1).padStart(3, "0")}`;
    if (existingIds.has(newJobId.toLowerCase())) { skipped.push(newJobId); continue; }

    const qr = parseInt(obj.quantityReceived)  || 0;
    const qc = parseInt(obj.quantityCompleted) || 0;
    const validStatus   = STATUSES.includes(obj.status)     ? obj.status   : "Pending";
    const validPriority = PRIORITIES.includes(obj.priority) ? obj.priority : "Medium";
    const validWorkType = WORK_TYPES.includes(obj.workType) ? obj.workType : "Polishing";

    importedJobs.push({
      id:                newJobId,
      customerId:        customer.id,
      customerName:      customer.name,
      customerPhone:     customer.phone || obj.customerPhone || "",
      productName:       obj.productName       || "",
      productDimension:  obj.productDimension  || "",
      workType:          validWorkType,
      quantityReceived:  qr,
      quantityCompleted: Math.min(qc, qr),
      deliveryDate:      obj.deliveryDate      || "",
      priority:          validPriority,
      status:            validStatus,
      notes:             obj.notes             || "",
      createdAt:         TODAY,
    });
    existingIds.add(newJobId.toLowerCase());
  }

  return { importedJobs, newCustomers, skipped, errors };
}

// ─── Auth shared constants (defined OUTSIDE components to prevent remounts) ───
const AUTH_BG  = { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"radial-gradient(ellipse at 20% 50%,rgba(59,130,246,0.07) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(99,102,241,0.07) 0%,transparent 60%),var(--bg)", padding:16 };
const AUTH_BOX = { width:"100%", maxWidth:440, background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:20, padding:36, boxShadow:"var(--shadow-lg)", animation:"fadeIn 0.4s ease" };

// Hoisted outside — stable component identity prevents remount on every keystroke
function AuthLogo() {
  return (
    <div style={{ textAlign:"center",marginBottom:28 }}>
      <div style={{ width:50,height:50,background:"linear-gradient(135deg,var(--accent),var(--accent2))",borderRadius:13,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#fff",fontFamily:"var(--font-head)",marginBottom:12 }}>F</div>
      <div style={{ fontFamily:"var(--font-head)",fontSize:24,fontWeight:700 }}>ForgeTrack</div>
      <div style={{ color:"var(--muted)",fontSize:11,marginTop:3,letterSpacing:1.2,textTransform:"uppercase" }}>Industrial Operations Platform</div>
    </div>
  );
}
function AuthErrBox({ err }) {
  if (!err) return null;
  return <div style={{ background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"var(--red)",padding:"8px 12px",borderRadius:8,fontSize:12,marginBottom:14 }}>{err}</div>;
}
// Validated auth field — shows inline error, red/green border
function AuthField({ label, type="text", placeholder, value, onChange, error, touched }) {
  return (
    <div>
      <label style={{ fontSize:11,color:"var(--muted)",display:"block",marginBottom:5,fontWeight:500 }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        autoComplete={type==="password"?"current-password":"off"}
        style={inputStyle(error, touched)}
      />
      <FieldError msg={touched ? error : ""} />
    </div>
  );
}

// ─── Login Form (separate stable component) ───────────────────────────────────
function LoginForm({ onLogin, onGoSignup }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [touched,  setTouched]  = useState({});
  const [err,      setErr]      = useState("");

  const errors = {
    email:    V.email(email),
    password: password.trim() ? "" : "Password is required",
  };
  const touch = k => setTouched(t => ({ ...t, [k]:true }));
  const touchAll = () => setTouched({ email:true, password:true });

  const handleSubmit = () => {
    touchAll();
    if (errors.email || errors.password) return;
    const users = JSON.parse(localStorage.getItem("ft_users") || "[]");
    const u = users.find(u => u.email === email.trim() && u.password === password);
    if (!u) { setErr("Invalid email or password"); return; }
    setErr("");
    const company = JSON.parse(localStorage.getItem(`ft_company_${u.id}`) || "null");
    localStorage.setItem("ft_session", JSON.stringify({ userId:u.id, name:u.name, email:u.email }));
    onLogin({ user:u, company });
  };

  return (
    <div style={AUTH_BG}>
      <div style={AUTH_BOX}>
        <AuthLogo />
        <div style={{ display:"flex",background:"var(--bg3)",borderRadius:8,padding:3,marginBottom:22 }}>
          <button style={{ flex:1,padding:"7px",borderRadius:6,border:"none",background:"var(--accent)",color:"#fff",fontSize:13,fontWeight:500 }}>Login</button>
          <button onClick={onGoSignup} style={{ flex:1,padding:"7px",borderRadius:6,border:"none",background:"transparent",color:"var(--muted)",fontSize:13,fontWeight:500,cursor:"pointer" }}>Sign Up</button>
        </div>
        <AuthErrBox err={err} />
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <AuthField label="Email" type="email" placeholder="you@company.com" value={email}
            onChange={e=>{setEmail(e.target.value);touch("email");}}
            error={errors.email} touched={touched.email} />
          <AuthField label="Password" type="password" placeholder="••••••••" value={password}
            onChange={e=>{setPassword(e.target.value);touch("password");}}
            error={errors.password} touched={touched.password} />
        </div>
        <button className="btn btn-primary" style={{ width:"100%",justifyContent:"center",marginTop:20,padding:"12px" }}
          onClick={handleSubmit} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}>
          Login to Dashboard →
        </button>
        <div style={{ textAlign:"center",marginTop:12,fontSize:12,color:"var(--muted)" }}>
          No account? <button style={{ background:"none",border:"none",color:"var(--accent)",fontSize:12,cursor:"pointer" }} onClick={onGoSignup}>Sign up free</button>
        </div>
      </div>
    </div>
  );
}

// ─── Signup Form (separate stable component) ──────────────────────────────────
function SignupForm({ onSignup, onGoLogin }) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [touched,  setTouched]  = useState({});
  const [err,      setErr]      = useState("");

  const errors = {
    name:     V.name(name),
    email:    V.email(email),
    password: V.password(password),
    confirm:  V.confirmPwd(confirm, password),
  };
  const touch = k => setTouched(t => ({ ...t, [k]:true }));
  const touchAll = () => setTouched({ name:true, email:true, password:true, confirm:true });

  // Password strength indicator
  const strength = !password ? 0 : [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const strengthLabel = ["","Weak","Fair","Good","Strong","Very Strong"][strength];
  const strengthColor = ["","var(--red)","var(--orange)","var(--amber)","var(--green)","var(--green)"][strength];

  const handleSubmit = () => {
    touchAll();
    if (Object.values(errors).some(e => e)) return;
    const users = JSON.parse(localStorage.getItem("ft_users") || "[]");
    if (users.find(u => u.email === email.trim())) { setErr("Email already registered"); return; }
    setErr("");
    const u = { id: Date.now().toString(), name: name.trim(), email: email.trim(), password };
    localStorage.setItem("ft_users", JSON.stringify([...users, u]));
    onSignup(u);
  };

  return (
    <div style={AUTH_BG}>
      <div style={AUTH_BOX}>
        <AuthLogo />
        <div style={{ display:"flex",background:"var(--bg3)",borderRadius:8,padding:3,marginBottom:22 }}>
          <button onClick={onGoLogin} style={{ flex:1,padding:"7px",borderRadius:6,border:"none",background:"transparent",color:"var(--muted)",fontSize:13,fontWeight:500,cursor:"pointer" }}>Login</button>
          <button style={{ flex:1,padding:"7px",borderRadius:6,border:"none",background:"var(--accent)",color:"#fff",fontSize:13,fontWeight:500 }}>Sign Up</button>
        </div>
        <AuthErrBox err={err} />
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <AuthField label="Full Name" placeholder="e.g. Rahul Kumar" value={name}
            onChange={e=>{ setName(e.target.value); touch("name"); }}
            error={errors.name} touched={touched.name} />
          <AuthField label="Email" type="email" placeholder="you@company.com" value={email}
            onChange={e=>{ setEmail(e.target.value); touch("email"); }}
            error={errors.email} touched={touched.email} />
          <div>
            <AuthField label="Password" type="password" placeholder="Min 8 chars, A-Z, 0-9, symbol" value={password}
              onChange={e=>{ setPassword(e.target.value); touch("password"); }}
              error={errors.password} touched={touched.password} />
            {password && (
              <div style={{ marginTop:6 }}>
                <div style={{ display:"flex",gap:3,marginBottom:3 }}>
                  {[1,2,3,4,5].map(i=>(
                    <div key={i} style={{ flex:1,height:3,borderRadius:2,background:i<=strength?strengthColor:"var(--bg3)",transition:"background .3s" }} />
                  ))}
                </div>
                <div style={{ fontSize:10,color:strengthColor,fontWeight:600 }}>{strengthLabel}</div>
              </div>
            )}
          </div>
          <AuthField label="Confirm Password" type="password" placeholder="Re-enter password" value={confirm}
            onChange={e=>{ setConfirm(e.target.value); touch("confirm"); }}
            error={errors.confirm} touched={touched.confirm} />
        </div>
        <button className="btn btn-primary" style={{ width:"100%",justifyContent:"center",marginTop:20,padding:"12px" }} onClick={handleSubmit}>
          Create Account →
        </button>
      </div>
    </div>
  );
}

// ─── Onboard Form — validated ─────────────────────────────────────────────────
function OnboardForm({ newUser, onComplete }) {
  const [companyName, setCompanyName] = useState("");
  const [industry,    setIndustry]    = useState("Manufacturing");
  const [phone,       setPhone]       = useState("");
  const [email,       setEmail]       = useState("");
  const [gst,         setGst]         = useState("");
  const [address,     setAddress]     = useState("");
  const [workers,     setWorkers]     = useState("");
  const [workTypes,   setWorkTypes]   = useState([]);
  const [touched,     setTouched]     = useState({});

  const errors = {
    companyName: V.companyName(companyName),
    email:       email ? V.email(email) : "",
    phone:       V.phone(phone),
    gst:         V.gst(gst),
    workers:     V.workers(workers),
  };
  const touch  = k  => setTouched(t => ({ ...t, [k]:true }));
  const touchAll   = () => setTouched({ companyName:true, email:true, phone:true, gst:true, workers:true });
  const toggleWT   = w  => setWorkTypes(prev => prev.includes(w) ? prev.filter(x=>x!==w) : [...prev, w]);

  // OBField: renders a labelled validated input — defined outside JSX return, no remount
  const makeOBField = (k, value, setter, label, placeholder, type="text", onKeyDown=null, hint=null, full=false) => (
    <div style={full ? { gridColumn:"1/-1" } : {}}>
      <label style={{ fontSize:11,color:"var(--muted)",display:"block",marginBottom:5,fontWeight:500 }}>{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        style={inputStyle(errors[k], touched[k])}
        onKeyDown={onKeyDown||undefined}
        onChange={e=>{ setter(e.target.value); touch(k); }} />
      {hint && !touched[k] && <div style={{ fontSize:10,color:"var(--muted)",marginTop:3 }}>{hint}</div>}
      <FieldError msg={touched[k] ? errors[k] : ""} />
    </div>
  );

  const handleSubmit = () => {
    touchAll();
    const hasErr = Object.values(errors).some(e=>e);
    if (hasErr) return;
    const company = { companyName:companyName.trim(), industry, phone, email:email.trim(), gst:gst.trim().toUpperCase(), address, workers, workTypes, userId: newUser.id };
    localStorage.setItem(`ft_company_${newUser.id}`, JSON.stringify(company));
    localStorage.setItem("ft_session", JSON.stringify({ userId:newUser.id, name:newUser.name, email:newUser.email }));
    onComplete({ user:newUser, company });
  };

  return (
    <div style={AUTH_BG}>
      <div style={{ ...AUTH_BOX, maxWidth:560 }}>
        <AuthLogo />
        <div style={{ fontFamily:"var(--font-head)",fontWeight:700,fontSize:18,marginBottom:4 }}>Set Up Your Company</div>
        <div style={{ color:"var(--muted)",fontSize:12,marginBottom:20 }}>One last step before entering your dashboard</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          {makeOBField("companyName", companyName, setCompanyName, "Company Name *", "Shree Industrial Works", "text", null, null, true)}
          {makeOBField("industry",    industry,    setIndustry,    "Industry Type",  "Manufacturing, Tooling…")}
          {makeOBField("phone",       phone,       setPhone,       "Company Phone",  "91XXXXXXXXXX", "text", onlyDigits, "Include country code, digits only")}
          {makeOBField("email",       email,       setEmail,       "Company Email",  "admin@company.com", "email")}
          {makeOBField("gst",         gst,         setGst,         "GST Number (optional)", "27ABCDE1234F1Z5", "text", null, "Leave blank if not applicable")}
          {makeOBField("workers",     workers,     setWorkers,     "No. of Workers", "e.g. 25", "text", onlyNumbers)}
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontSize:11,color:"var(--muted)",display:"block",marginBottom:5,fontWeight:500 }}>Company Address</label>
            <textarea value={address} onChange={e=>setAddress(e.target.value)} rows={2} placeholder="Full address..." />
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontSize:11,color:"var(--muted)",display:"block",marginBottom:8,fontWeight:500 }}>Primary Work Types</label>
            <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
              {WORK_TYPES.map(w=>(
                <button key={w} onClick={()=>toggleWT(w)} className="btn btn-sm"
                  style={{ background:workTypes.includes(w)?"var(--accent)":"var(--bg3)",color:workTypes.includes(w)?"#fff":"var(--muted2)",border:`1px solid ${workTypes.includes(w)?"var(--accent)":"var(--border2)"}` }}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button className="btn btn-primary" style={{ width:"100%",justifyContent:"center",marginTop:22,padding:"12px" }} onClick={handleSubmit}>
          Complete Setup & Enter Dashboard →
        </button>
      </div>
    </div>
  );
}

// ─── AuthScreen coordinator (only switches between stable sub-components) ─────
function AuthScreen({ onAuth }) {
  const [screen,   setScreen]   = useState("login");  // "login" | "signup" | "onboard"
  const [pendingUser, setPendingUser] = useState(null);

  const handleLogin  = (data)   => onAuth(data);
  const handleSignup = (newUser) => { setPendingUser(newUser); setScreen("onboard"); };
  const handleOnboard = (data)  => onAuth(data);

  if (screen === "onboard" && pendingUser) return <OnboardForm newUser={pendingUser} onComplete={handleOnboard} />;
  if (screen === "signup")  return <SignupForm  onSignup={handleSignup}  onGoLogin={()=>setScreen("login")} />;
  return <LoginForm onLogin={handleLogin} onGoSignup={()=>setScreen("signup")} />;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard",icon:"⬡",label:"Dashboard" },
  { id:"jobs",     icon:"◈",label:"Job Orders" },
  { id:"customers",icon:"◎",label:"Customers" },
  { id:"work",     icon:"⬔",label:"Work Tracking" },
  { id:"delivery", icon:"◇",label:"Delivery" },
  { id:"reports",  icon:"▦",label:"Reports" },
  { id:"settings", icon:"◉",label:"Settings" },
];
function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  const sidebarRef = useRef(null);

  // Click outside → collapse if expanded
  useEffect(() => {
    if (collapsed) return;
    const handler = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setCollapsed(true);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [collapsed, setCollapsed]);

  const handleNavClick = (id) => {
    if (collapsed) {
      // Expand first, then navigate
      setCollapsed(false);
      setActive(id);
    } else if (active === id) {
      // Same tab clicked while expanded → collapse
      setCollapsed(true);
    } else {
      setActive(id);
    }
  };

  return (
    <aside
      ref={sidebarRef}
      style={{
        width: collapsed ? 60 : 220,
        background: "var(--bg2)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}>
      {/* Logo row */}
      <div style={{ padding:"20px 14px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10, minHeight:68 }}>
        <div style={{ width:32,height:32,background:"linear-gradient(135deg,var(--accent),var(--accent2))",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0,fontFamily:"var(--font-head)",color:"#fff",fontWeight:800 }}>F</div>
        <div style={{ overflow:"hidden", opacity: collapsed ? 0 : 1, transition:"opacity 0.2s", whiteSpace:"nowrap" }}>
          <div style={{ fontFamily:"var(--font-head)",fontWeight:700,fontSize:15 }}>ForgeTrack</div>
          <div style={{ fontSize:10,color:"var(--muted)",letterSpacing:0.5 }}>INDUSTRIAL OPS</div>
        </div>
      </div>
      {/* Nav items */}
      <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:2 }}>
        {NAV.map(n => {
          const on = active === n.id;
          return (
            <button
              key={n.id}
              onClick={() => handleNavClick(n.id)}
              title={collapsed ? n.label : ""}
              style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"9px 10px", borderRadius:8, border:"none",
                background: on ? "rgba(59,130,246,0.12)" : "transparent",
                color: on ? "var(--accent)" : "var(--muted)",
                cursor:"pointer", fontFamily:"var(--font-body)",
                fontSize:13, fontWeight: on ? 600 : 400,
                width:"100%", textAlign:"left",
                whiteSpace:"nowrap", overflow:"hidden",
                transition:"background 0.15s, color 0.15s",
              }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{n.icon}</span>
              <span style={{ opacity: collapsed ? 0 : 1, transition:"opacity 0.18s", overflow:"hidden" }}>
                {n.label}
              </span>
            </button>
          );
        })}
      </nav>
      {/* Collapse hint strip at bottom — subtle, no button */}
      <div style={{ padding:"10px 14px", borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent: collapsed ? "center" : "flex-start", gap:6 }}>
        <div style={{ width:6,height:6,borderRadius:"50%",background:"rgba(99,102,241,0.4)",flexShrink:0 }} />
        <span style={{ fontSize:10,color:"var(--muted)",opacity: collapsed ? 0 : 0.6, transition:"opacity 0.18s", whiteSpace:"nowrap" }}>
          Click active tab to collapse
        </span>
      </div>
    </aside>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar({ page, user, company, jobs, onLogout }) {
  const [open,setOpen] = useState(false);
  const dropRef = useRef(null);
  const initials = (user?.name||"U").split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
  useEffect(()=>{
    if(!open) return;
    const h = e => { if(dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[open]);
  const delayed = jobs.filter(j=>j.status==="Delayed").length;
  return (
    <div style={{ height:52,borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",background:"var(--bg2)",position:"sticky",top:0,zIndex:200 }}>
      <div style={{ fontFamily:"var(--font-head)",fontWeight:600,fontSize:13,color:"var(--muted2)",textTransform:"uppercase",letterSpacing:1 }}>{NAV.find(n=>n.id===page)?.label}</div>
      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
        <div style={{ fontSize:11,background:"var(--surface)",padding:"4px 10px",borderRadius:6,border:"1px solid var(--border)" }}>
          {delayed>0?<span style={{ color:"var(--red)" }}>⚠ {delayed} Delayed</span>:<span style={{ color:"var(--green)" }}>✓ All on track</span>}
        </div>
        <div style={{ position:"relative" }}>
          <button onClick={()=>setOpen(o=>!o)} style={{ display:"flex",alignItems:"center",gap:8,background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:8,padding:"5px 10px",cursor:"pointer" }}>
            <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff" }}>{initials}</div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:12,fontWeight:600,color:"var(--text)",lineHeight:1.2 }}>{user?.name}</div>
              <div style={{ fontSize:10,color:"var(--muted)",lineHeight:1 }}>{company?.companyName||"Company"}</div>
            </div>
            <span style={{ color:"var(--muted)",fontSize:10 }}>▾</span>
          </button>
          {open && (
            <div ref={dropRef} style={{ position:"absolute",right:0,top:"calc(100% + 6px)",background:"var(--surface2)",border:"1px solid var(--border2)",borderRadius:10,minWidth:190,boxShadow:"var(--shadow-lg)",zIndex:300,overflow:"hidden" }}>
              <div style={{ padding:"12px 14px",borderBottom:"1px solid var(--border)" }}>
                <div style={{ fontSize:13,fontWeight:600 }}>{user?.name}</div>
                <div style={{ fontSize:11,color:"var(--muted)" }}>{user?.email}</div>
                {company?.companyName && <div style={{ fontSize:11,color:"var(--accent)",marginTop:2 }}>🏭 {company.companyName}</div>}
              </div>
              <div style={{ padding:"8px" }}>
                <button onClick={onLogout} className="btn btn-danger" style={{ width:"100%",justifyContent:"center" }}>Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ jobs, customers, setPage }) {
  const active    = jobs.filter(j=>j.status!=="Delivered").length;
  const pending   = jobs.filter(j=>j.status==="Pending").length;
  const completed = jobs.filter(j=>j.status==="Completed").length;
  const delayed   = jobs.filter(j=>j.status==="Delayed").length;
  const inProg    = jobs.filter(j=>j.status==="In Progress").length;
  const wt={}, sc={};
  jobs.forEach(j=>{ wt[j.workType]=(wt[j.workType]||0)+1; sc[j.status]=(sc[j.status]||0)+1; });
  const insights = [
    delayed>0&&{ icon:"⚠",text:`${delayed} delayed deliveries need attention` },
    pending>0&&{ icon:"⏳",text:`${pending} jobs pending to start` },
    { icon:"🏆",text:`Top work: ${Object.entries(wt).sort((a,b)=>b[1]-a[1])[0]?.[0]||"—"}` },
    { icon:"📦",text:`${inProg} jobs currently in progress` },
    { icon:"👥",text:`${customers.length} customers in system` },
  ].filter(Boolean);
  const recent=[...jobs].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:24 }}>
      <div>
        <div style={{ fontFamily:"var(--font-head)",fontSize:24,fontWeight:700 }}>Operations Dashboard</div>
        <div style={{ color:"var(--muted)",fontSize:13,marginTop:4 }}>Industrial job tracking & workflow overview</div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14 }}>
        <StatCard label="Active Jobs"  value={active}           icon="◈" color="var(--accent)" />
        <StatCard label="Pending"      value={pending}          icon="⏳" color="var(--amber)" />
        <StatCard label="Completed"    value={completed}        icon="✓" color="var(--green)" />
        <StatCard label="Delayed"      value={delayed}          icon="⚠" color="var(--red)" />
        <StatCard label="Customers"    value={customers.length} icon="◎" color="var(--purple)" />
        <StatCard label="In Progress"  value={inProg}           icon="⬔" color="var(--cyan)" />
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
        <Card>
          <div style={{ fontFamily:"var(--font-head)",fontWeight:600,fontSize:14,marginBottom:16 }}>Work Type Distribution</div>
          {Object.entries(wt).map(([t,c],i)=>{ const pct=Math.round((c/Math.max(jobs.length,1))*100); return (
            <div key={t} style={{ marginBottom:10 }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4 }}><span style={{ color:"var(--muted2)" }}>{t}</span><span style={{ fontWeight:600 }}>{c} <span style={{ color:"var(--muted)" }}>({pct}%)</span></span></div>
              <div style={{ height:6,background:"var(--bg3)",borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:`${pct}%`,background:CHART_COLS[i%CHART_COLS.length],borderRadius:4,transition:"width .8s" }} /></div>
            </div>
          );})}
        </Card>
        <Card>
          <div style={{ fontFamily:"var(--font-head)",fontWeight:600,fontSize:14,marginBottom:16 }}>Job Status Overview</div>
          {Object.entries(STATUS_CFG).map(([status,cfg])=>{ const count=sc[status]||0; return (
            <div key={status} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
              <div style={{ width:10,height:10,borderRadius:"50%",background:cfg.color,flexShrink:0 }} />
              <span style={{ flex:1,fontSize:12,color:"var(--muted2)" }}>{status}</span>
              <span style={{ fontWeight:600,fontSize:13 }}>{count}</span>
              <div style={{ width:60,height:4,background:"var(--bg3)",borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:`${jobs.length?(count/jobs.length)*100:0}%`,background:cfg.color,borderRadius:4 }} /></div>
            </div>
          );})}
        </Card>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
        <Card>
          <div style={{ fontFamily:"var(--font-head)",fontWeight:600,fontSize:14,marginBottom:14 }}>⚡ Smart Insights</div>
          {insights.map((ins,i)=>(
            <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"var(--bg3)",borderRadius:8,border:"1px solid var(--border)",fontSize:12,marginBottom:7,color:"var(--muted2)" }}>
              <span style={{ fontSize:15 }}>{ins.icon}</span>{ins.text}
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontFamily:"var(--font-head)",fontWeight:600,fontSize:14,marginBottom:14 }}>Recent Job Orders</div>
          {recent.map(j=>(
            <div key={j.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)" }}>
              <div><div style={{ fontSize:12,fontWeight:600 }}>{j.id}</div><div style={{ fontSize:11,color:"var(--muted)" }}>{j.customerName} · {j.workType}</div></div>
              <Badge status={j.status} />
            </div>
          ))}
        </Card>
      </div>
      <Card style={{ display:"flex",gap:10,flexWrap:"wrap",alignItems:"center" }}>
        <div style={{ fontFamily:"var(--font-head)",fontWeight:600,fontSize:11,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase",marginRight:4 }}>QUICK ACTIONS</div>
        <button className="btn btn-primary" onClick={()=>setPage("jobs")}>+ Create Job Order</button>
        <button className="btn btn-ghost"   onClick={()=>setPage("customers")}>+ Add Customer</button>
        <button className="btn btn-ghost"   onClick={()=>setPage("reports")}>↓ Export Reports</button>
        <button className="btn btn-ghost"   onClick={()=>setPage("work")}>⬔ Workflow Board</button>
      </Card>
    </div>
  );
}

// ─── Job Form — with full validation ─────────────────────────────────────────
function JobForm({ customers, onSave, onCancel, initial }) {
  const [f, setF] = useState(initial || {
    customerName:"", customerId:"", customerPhone:"",
    productName:"", productDimension:"",
    workType:"Polishing", quantityReceived:"", quantityCompleted:"",
    deliveryDate:"", priority:"Medium", status:"Pending", notes:""
  });
  const [touched, setTouched] = useState({});

  const pend = Math.max(0, (parseInt(f.quantityReceived)||0) - (parseInt(f.quantityCompleted)||0));
  const set  = (k, v) => { setF(p=>({...p,[k]:v})); setTouched(t=>({...t,[k]:true})); };
  const pickCustomer = name => {
    const c = customers.find(c=>c.name===name);
    setF(p=>({ ...p, customerName:name, customerId:c?.id||"", customerPhone:c?.phone||"" }));
    setTouched(t=>({...t, customerName:true}));
  };

  const errors = {
    customerName:    f.customerName ? "" : "Please select a customer",
    productName:     f.productName.trim() ? "" : "Product name is required",
    quantityReceived: V.positiveNum(f.quantityReceived),
    quantityCompleted: (() => {
      if (f.quantityCompleted === "" || f.quantityCompleted === null) return "";
      const qr = parseInt(f.quantityReceived)||0;
      const qc = parseInt(f.quantityCompleted)||0;
      if (qc < 0) return "Cannot be negative";
      if (qc > qr) return `Cannot exceed received quantity (${qr})`;
      return "";
    })(),
    deliveryDate: (initial && f.deliveryDate === initial.deliveryDate)
      ? ""  // don't re-validate unchanged date when editing
      : V.futureDate(f.deliveryDate),
  };

  const touchAll = () => setTouched({ customerName:true, productName:true, quantityReceived:true, deliveryDate:true });

  const handleSave = () => {
    touchAll();
    if (Object.values(errors).some(e=>e)) return;
    onSave({ ...f, pendingQuantity: pend });
  };

  const FE = ({ k }) => <FieldError msg={touched[k] ? errors[k] : ""} />;
  const inputBorder = k => inputStyle(errors[k], touched[k]);

  return (
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
      {/* Customer */}
      <div style={{ gridColumn:"1/-1" }}>
        <label style={{ fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:5 }}>Customer Name *</label>
        <select value={f.customerName} onChange={e=>pickCustomer(e.target.value)} style={inputBorder("customerName")}>
          <option value="">— Select Customer —</option>
          {customers.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        {f.customerPhone && <div style={{ fontSize:11,color:"var(--green)",marginTop:4 }}>📞 {f.customerPhone}</div>}
        <FE k="customerName" />
      </div>
      {/* Product Name */}
      <div>
        <label style={{ fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:5 }}>Product Name *</label>
        <input value={f.productName} onChange={e=>set("productName",e.target.value)}
          placeholder="e.g. Die, Roller, Spacer" style={inputBorder("productName")} />
        <FE k="productName" />
      </div>
      {/* Dimension */}
      <div>
        <label style={{ fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:5 }}>Product Dimension</label>
        <input value={f.productDimension} onChange={e=>set("productDimension",e.target.value)} placeholder="e.g. 1335 mm, 5x7 inch" />
      </div>
      {/* Work Type */}
      <div>
        <label style={{ fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:5 }}>Work Type</label>
        <select value={f.workType} onChange={e=>set("workType",e.target.value)}>{WORK_TYPES.map(w=><option key={w}>{w}</option>)}</select>
      </div>
      {/* Qty Received */}
      <div>
        <label style={{ fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:5 }}>Qty Received *</label>
        <input type="number" min="0" value={f.quantityReceived}
          onChange={e=>set("quantityReceived",e.target.value)}
          onKeyDown={onlyNumbers} placeholder="0"
          style={inputBorder("quantityReceived")} />
        <FE k="quantityReceived" />
      </div>
      {/* Qty Completed */}
      <div>
        <label style={{ fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:5 }}>Qty Completed</label>
        <input type="number" min="0" value={f.quantityCompleted}
          onChange={e=>set("quantityCompleted",e.target.value)}
          onKeyDown={onlyNumbers} placeholder="0"
          style={inputBorder("quantityCompleted")} />
        <FE k="quantityCompleted" />
      </div>
      {/* Pending */}
      <div>
        <label style={{ fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:5 }}>Pending Qty (auto)</label>
        <div style={{ padding:"8px 12px",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",fontSize:14,fontWeight:700,color:pend>0?"var(--amber)":"var(--green)" }}>{pend}</div>
      </div>
      {/* Delivery Date */}
      <div>
        <label style={{ fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:5 }}>Delivery Date *</label>
        <input type="date" value={f.deliveryDate} onChange={e=>set("deliveryDate",e.target.value)}
          min={initial ? undefined : TODAY} style={inputBorder("deliveryDate")} />
        <FE k="deliveryDate" />
      </div>
      {/* Priority */}
      <div>
        <label style={{ fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:5 }}>Priority</label>
        <select value={f.priority} onChange={e=>set("priority",e.target.value)}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select>
      </div>
      {/* Status */}
      <div>
        <label style={{ fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:5 }}>Status</label>
        <select value={f.status} onChange={e=>set("status",e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
      </div>
      {/* Notes */}
      <div style={{ gridColumn:"1/-1" }}>
        <label style={{ fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:5 }}>Notes</label>
        <textarea value={f.notes} onChange={e=>set("notes",e.target.value)} rows={3} placeholder="Additional notes..." />
      </div>
      {/* Actions */}
      <div style={{ gridColumn:"1/-1",display:"flex",gap:8,justifyContent:"flex-end" }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save Job Order</button>
      </div>
    </div>
  );
}

// ─── CSV Format Helper Popovers ───────────────────────────────────────────────
function FormatHint({ title, headers }) {
  const [show, setShow] = useState(false);
  const btnRef = useRef(null);
  const [pos, setPos]   = useState({ top:0, left:0 });

  const openPopup = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const popW = 360;
      let left = r.right - popW;
      if (left < 8) left = 8;
      if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
      setPos({ top: r.bottom + 8, left });
    }
    setShow(s => !s);
  };

  useEffect(() => {
    if (!show) return;
    const handler = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) setShow(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [show]);

  return (
    <div style={{ position:"relative", display:"inline-block" }}>
      <button ref={btnRef} className="btn btn-ghost btn-sm" onClick={openPopup} style={{ fontSize:11, padding:"4px 8px" }}>? Format</button>
      {show && (
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{
            position:"fixed", top:pos.top, left:pos.left, width:360,
            background:"var(--surface2)", border:"1px solid var(--border2)",
            borderRadius:12, padding:18, zIndex:9000,
            boxShadow:"0 8px 40px rgba(0,0,0,0.6)",
            maxHeight:"80vh", overflowY:"auto",
          }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div style={{ fontFamily:"var(--font-head)", fontWeight:700, fontSize:13, color:"var(--text)" }}>{title}</div>
            <button onClick={()=>setShow(false)} style={{ background:"none", border:"none", color:"var(--muted)", fontSize:18, cursor:"pointer", lineHeight:1 }}>×</button>
          </div>
          <div style={{ fontSize:11, color:"var(--muted)", marginBottom:10, lineHeight:1.6 }}>
            Accepted CSV column headers — smart mapping handles common variations:
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
            {headers.map(h=>(
              <span key={h} style={{ background:"var(--bg3)", border:"1px solid var(--border2)", padding:"3px 9px", borderRadius:6, fontSize:11, color:"var(--muted2)", lineHeight:1.5 }}>
                {h}
              </span>
            ))}
          </div>
          <div style={{ background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.18)", borderRadius:8, padding:"8px 10px", fontSize:11, color:"var(--muted2)", lineHeight:1.6 }}>
            💡 Tip: Export existing data first to use as a template for your import CSV.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Jobs Module ──────────────────────────────────────────────────────────────
function Jobs({ jobs, setJobs, customers, setCustomers, addToast, company }) {
  const [showForm, setShowForm]   = useState(false);
  const [editJob,  setEditJob]    = useState(null);
  const [filter,   setFilter]     = useState("All");
  const [search,   setSearch]     = useState("");
  const [importing,setImporting]  = useState(false);

  const filtered = jobs.filter(j =>
    (filter==="All" || j.status===filter) &&
    (!search || j.customerName.toLowerCase().includes(search.toLowerCase()) ||
                j.productName.toLowerCase().includes(search.toLowerCase()) ||
                j.id.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = d => {
    if (editJob) { setJobs(p=>p.map(j=>j.id===editJob.id?{ ...editJob,...d }:j)); addToast("Job updated","success"); }
    else {
      const maxNum = jobs.reduce((mx,j) => {
        const n = parseInt(j.id.replace(/\D/g,"")) || 0; return Math.max(mx,n);
      }, 0);
      setJobs(p=>[...p,{ id:`JOB-${String(maxNum+1).padStart(3,"0")}`,...d,createdAt:TODAY }]);
      addToast("Job created!","success");
    }
    setShowForm(false); setEditJob(null);
  };

  const jobExportHeaders = ["Job ID","Customer Name","Customer Phone","Product Name","Product Dimension","Work Type","Quantity Received","Quantity Completed","Pending Quantity","Delivery Date","Priority","Status","Notes"];
  const getJobExportRows = () => filtered.map(j=>[j.id,j.customerName,j.customerPhone||"",j.productName,j.productDimension,j.workType,j.quantityReceived,j.quantityCompleted,(j.quantityReceived-j.quantityCompleted),j.deliveryDate,j.priority,j.status,j.notes||""]);

  const handleImport = async (file) => {
    setImporting(true);
    try {
      const result = await importJobsFromCSV(file, jobs, customers, setCustomers);
      const { importedJobs, newCustomers, skipped, errors } = result;
      if (importedJobs.length === 0 && errors.length > 0) {
        addToast(`Import failed: ${errors[0]}`,"error"); return;
      }
      // Merge new customers (auto-created) into state
      const addedCustomers = newCustomers.filter(nc => !customers.find(c=>c.name.toLowerCase()===nc.name.toLowerCase()));
      if (addedCustomers.length > 0) setCustomers(prev => [...prev, ...addedCustomers]);
      setJobs(prev => [...prev, ...importedJobs]);
      const parts = [];
      if (importedJobs.length>0) parts.push(`${importedJobs.length} jobs imported`);
      if (addedCustomers.length>0) parts.push(`${addedCustomers.length} new customers created`);
      if (skipped.length>0) parts.push(`${skipped.length} skipped`);
      addToast(parts.join(" · "),"success");
      if (errors.length>0) addToast(`${errors.length} row error(s): ${errors[0]}`,"warn");
    } catch(e) {
      addToast(`Import error: ${e.message}`,"error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
        <div>
          <div style={{ fontFamily:"var(--font-head)",fontSize:22,fontWeight:700 }}>Job Orders</div>
          <div style={{ color:"var(--muted)",fontSize:13 }}>{jobs.length} total · {jobs.filter(j=>j.status==="In Progress").length} in progress</div>
        </div>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
          <FormatHint title="Job Orders Import Format" headers={["customerName","productName","productDimension","workType","quantityReceived","quantityCompleted","deliveryDate","priority","status","notes","customerPhone"]} />
          <ImportButton label="Import CSV" onFile={handleImport} loading={importing} />
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (filtered.length === 0) { addToast("No jobs to export","warn"); return; }
            exportCSV(`jobs_export_${TODAY}.csv`, jobExportHeaders, getJobExportRows());
          }}>↓ Export CSV</button>
          <button className="btn btn-primary" onClick={()=>{ setShowForm(true); setEditJob(null); }}>+ New Job</button>
        </div>
      </div>

      {showForm && (
        <Card style={{ border:"1px solid var(--border2)" }}>
          <div style={{ fontFamily:"var(--font-head)",fontWeight:700,fontSize:16,marginBottom:16 }}>{editJob?"Edit Job Order":"Create Job Order"}</div>
          <JobForm customers={customers} onSave={handleSave} onCancel={()=>{ setShowForm(false); setEditJob(null); }} initial={editJob} />
        </Card>
      )}

      <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ width:200 }} />
        {["All","Pending","In Progress","Completed","Delivered","Delayed"].map(f=>(
          <button key={f} className="btn btn-sm" onClick={()=>setFilter(f)}
            style={{ background:filter===f?"var(--accent)":"var(--surface)",color:filter===f?"#fff":"var(--muted2)",border:`1px solid ${filter===f?"var(--accent)":"var(--border2)"}` }}>{f}</button>
        ))}
      </div>

      <Card style={{ padding:0,overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",minWidth:1000 }}>
            <thead>
              <tr style={{ background:"var(--bg3)",borderBottom:"1px solid var(--border)" }}>
                {["Job ID","Customer","Product","Work","Dim","Rcvd","Done","Pend","Status","Delivery","Priority","Actions"].map(h=>(
                  <th key={h} style={{ padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:600,color:"var(--muted)",letterSpacing:0.5,textTransform:"uppercase",whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 && <tr><td colSpan={12} style={{ padding:32,textAlign:"center",color:"var(--muted)" }}>No jobs found. Create one or import a CSV above.</td></tr>}
              {filtered.map(j=>{
                const pend=(j.quantityReceived||0)-(j.quantityCompleted||0);
                return (
                  <tr key={j.id} style={{ borderBottom:"1px solid var(--border)",transition:"background .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(59,130,246,0.04)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"9px 12px",fontSize:12,fontWeight:600,color:"var(--accent)",whiteSpace:"nowrap" }}>{j.id}</td>
                    <td style={{ padding:"9px 12px",fontSize:12,whiteSpace:"nowrap" }}>{j.customerName}</td>
                    <td style={{ padding:"9px 12px",fontSize:12 }}>{j.productName}</td>
                    <td style={{ padding:"9px 12px" }}><span style={{ background:"var(--bg3)",padding:"2px 7px",borderRadius:4,fontSize:11 }}>{j.workType}</span></td>
                    <td style={{ padding:"9px 12px",fontSize:11,color:"var(--muted2)",whiteSpace:"nowrap" }}>{j.productDimension}</td>
                    <td style={{ padding:"9px 12px",fontSize:12,textAlign:"center" }}>{j.quantityReceived}</td>
                    <td style={{ padding:"9px 12px",fontSize:12,textAlign:"center",color:"var(--green)",fontWeight:600 }}>{j.quantityCompleted}</td>
                    <td style={{ padding:"9px 12px",fontSize:12,textAlign:"center",color:pend>0?"var(--amber)":"var(--green)",fontWeight:700 }}>{pend}</td>
                    <td style={{ padding:"9px 12px" }}><Badge status={j.status} /></td>
                    <td style={{ padding:"9px 12px",fontSize:11,color:"var(--muted2)",whiteSpace:"nowrap" }}>{j.deliveryDate}</td>
                    <td style={{ padding:"9px 12px" }}><PriorityDot priority={j.priority} /></td>
                    <td style={{ padding:"9px 12px" }}>
                      <div style={{ display:"flex",gap:4 }}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>{ setEditJob(j); setShowForm(true); }}>Edit</button>
                        {j.status!=="Delivered" && <>
                          <button className="btn btn-green btn-sm" title="Mark Delivered" onClick={()=>{ setJobs(p=>p.map(x=>x.id===j.id?{...x,status:"Delivered"}:x)); addToast("Marked Delivered","success"); }}>✓</button>
                          <button className="btn btn-wa btn-sm" title="WhatsApp Reminder" onClick={()=>sendWhatsApp(j,company?.companyName)}>💬</button>
                        </>}
                        <button className="btn btn-danger btn-sm" onClick={()=>{ setJobs(p=>p.filter(x=>x.id!==j.id)); addToast("Job deleted","error"); }}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Customers ────────────────────────────────────────────────────────────────
function Customers({ customers, setCustomers, jobs, addToast }) {
  const [showForm, setShowForm]  = useState(false);
  const [form, setForm]          = useState({ name:"",phone:"",email:"" });
  const [search, setSearch]      = useState("");
  const [importing,setImporting] = useState(false);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const [custTouched, setCustTouched] = useState({});
  const custErrors = {
    name:  V.companyName(form.name),
    phone: V.phone(form.phone),
    email: form.email ? V.email(form.email) : "",
  };
  const touchCust = k => setCustTouched(t=>({...t,[k]:true}));

  const save = () => {
    setCustTouched({ name:true, phone:true, email:true });
    if (Object.values(custErrors).some(e=>e)) return;
    const maxCNum = customers.reduce((mx,c) => { const n=parseInt(c.id.replace(/\D/g,""))||0; return Math.max(mx,n); },0);
    const newId = "C" + String(maxCNum+1).padStart(3,"0");
    setCustomers(p=>[...p,{ id:newId,...form,name:form.name.trim(),email:(form.email||"").trim(),createdAt:TODAY }]);
    addToast("Customer added!","success");
    setForm({ name:"", phone:"", email:"" }); setCustTouched({}); setShowForm(false);
  };

  const custExportHeaders = ["Customer Name","Phone","Email","Total Jobs","Pending Jobs","Completed Jobs","Created At"];
  const getCustExportRows = () => customers.map(c=>{
    const cj=jobs.filter(j=>j.customerName===c.name);
    return [c.name,c.phone,c.email,cj.length,cj.filter(j=>["Pending","In Progress"].includes(j.status)).length,cj.filter(j=>["Completed","Delivered"].includes(j.status)).length,c.createdAt];
  });

  const handleImport = async (file) => {
    setImporting(true);
    try {
      const result = await importCustomersFromCSV(file, customers);
      const { imported, skipped, errors } = result;
      if (imported.length === 0 && errors.length > 0) {
        addToast(`Import failed: ${errors[0]}`,"error"); return;
      }
      if (imported.length > 0) setCustomers(prev => [...prev, ...imported]);
      const parts = [];
      if (imported.length>0) parts.push(`${imported.length} customers imported`);
      if (skipped.length>0)  parts.push(`${skipped.length} duplicates skipped`);
      addToast(parts.join(" · ") || "Nothing to import","success");
      if (errors.length>0) addToast(`${errors.length} row error(s): ${errors[0]}`,"warn");
    } catch(e) {
      addToast(`Import error: ${e.message}`,"error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
        <div>
          <div style={{ fontFamily:"var(--font-head)",fontSize:22,fontWeight:700 }}>Customers</div>
          <div style={{ color:"var(--muted)",fontSize:13 }}>{customers.length} registered</div>
        </div>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
          <FormatHint title="Customers Import Format" headers={["name / customerName","phone","email","address"]} />
          <ImportButton label="Import CSV" onFile={handleImport} loading={importing} />
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (customers.length === 0) { addToast("No customers to export","warn"); return; }
            exportCSV(`customers_export_${TODAY}.csv`, custExportHeaders, getCustExportRows());
          }}>↓ Export CSV</button>
          <button className="btn btn-primary" onClick={()=>setShowForm(!showForm)}>+ Add Customer</button>
        </div>
      </div>

      {showForm && (
        <Card style={{ border:"1px solid var(--border2)" }}>
          <div style={{ fontFamily:"var(--font-head)",fontWeight:700,fontSize:15,marginBottom:14 }}>New Customer</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12 }}>
            {[
              {k:"name",  l:"Name *",                    p:"e.g. Shree Industries"},
              {k:"phone", l:"Phone (with country code)", p:"919876543210", digits:true},
              {k:"email", l:"Email",                     p:"email@company.com", type:"email"},
            ].map(x=>(
              <div key={x.k}>
                <label style={{ fontSize:12,color:"var(--muted)",display:"block",marginBottom:5 }}>{x.l}</label>
                <input type={x.type||"text"} value={form[x.k]}
                  style={inputStyle(custErrors[x.k], custTouched[x.k])}
                  onKeyDown={x.digits ? onlyDigits : undefined}
                  onChange={e=>{ setForm(p=>({...p,[x.k]:e.target.value})); touchCust(x.k); }}
                  placeholder={x.p} />
                <FieldError msg={custTouched[x.k] ? custErrors[x.k] : ""} />
              </div>
            ))}
          </div>
          <div style={{ display:"flex",gap:8,marginTop:12,justifyContent:"flex-end" }}>
            <button className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Save Customer</button>
          </div>
        </Card>
      )}

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customers…" style={{ maxWidth:300 }} />

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14 }}>
        {filtered.map(c=>{
          const cj=jobs.filter(j=>j.customerName===c.name);
          const pend=cj.filter(j=>["Pending","In Progress"].includes(j.status)).length;
          const done=cj.filter(j=>["Completed","Delivered"].includes(j.status)).length;
          return (
            <Card key={c.id}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                <div><div style={{ fontFamily:"var(--font-head)",fontWeight:700,fontSize:15 }}>{c.name}</div><div style={{ fontSize:11,color:"var(--muted)",marginTop:2 }}>ID: {c.id}</div></div>
                <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff" }}>{c.name[0]}</div>
              </div>
              <div style={{ fontSize:12,color:"var(--muted2)",display:"flex",flexDirection:"column",gap:4,marginBottom:12 }}>
                <span>📞 {c.phone||"—"}</span><span>✉ {c.email||"—"}</span>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                {[["Total",cj.length,"var(--accent)"],["Pending",pend,"var(--amber)"],["Done",done,"var(--green)"]].map(([l,v,col])=>(
                  <div key={l} style={{ background:"var(--bg3)",borderRadius:8,padding:"8px 10px",textAlign:"center" }}>
                    <div style={{ fontSize:18,fontWeight:700,fontFamily:"var(--font-head)",color:col }}>{v}</div>
                    <div style={{ fontSize:10,color:"var(--muted)",marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
        {filtered.length===0 && <div style={{ color:"var(--muted)",padding:16,fontSize:13 }}>No customers found.</div>}
      </div>
    </div>
  );
}

// ─── Work Tracking ────────────────────────────────────────────────────────────
function WorkTracking({ jobs, setJobs, addToast, company }) {
  const stages = ["Pending","In Progress","Completed","Delayed"];
  const SC = { Pending:"var(--amber)","In Progress":"var(--accent)",Completed:"var(--green)",Delayed:"var(--red)" };
  const move = (id,status) => { setJobs(p=>p.map(j=>j.id===id?{...j,status}:j)); addToast(`Moved to ${status}`,"success"); };
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div>
        <div style={{ fontFamily:"var(--font-head)",fontSize:22,fontWeight:700 }}>Work Tracking</div>
        <div style={{ color:"var(--muted)",fontSize:13 }}>Kanban workflow board · scroll horizontally for all columns</div>
      </div>
      <div className="kanban-board">
        {stages.map(stage=>{
          const col=SC[stage];
          const sj=jobs.filter(j=>j.status===stage);
          return (
            <div key={stage} className="kanban-col" style={{ border:`1px solid ${col}28` }}>
              <div style={{ padding:"12px 16px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",background:`${col}0a` }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}><div style={{ width:9,height:9,borderRadius:"50%",background:col }} /><span style={{ fontFamily:"var(--font-head)",fontWeight:700,fontSize:13 }}>{stage}</span></div>
                <span style={{ background:`${col}22`,color:col,padding:"2px 9px",borderRadius:10,fontSize:11,fontWeight:700 }}>{sj.length}</span>
              </div>
              <div className="kanban-cards">
                {sj.length===0 && <div style={{ padding:"18px 10px",textAlign:"center",color:"var(--muted)",fontSize:12,border:"1px dashed var(--border)",borderRadius:8 }}>No jobs here</div>}
                {sj.map(j=>{
                  const pct=j.quantityReceived>0?Math.round((j.quantityCompleted/j.quantityReceived)*100):0;
                  const pend=(j.quantityReceived||0)-(j.quantityCompleted||0);
                  return (
                    <div key={j.id} className="kanban-card">
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <span style={{ fontSize:11,color:"var(--accent)",fontWeight:700 }}>{j.id}</span>
                        <PriorityDot priority={j.priority} />
                      </div>
                      <div style={{ fontSize:13,fontWeight:700,color:"var(--text)",lineHeight:1.3 }}>{j.productName}</div>
                      <div style={{ fontSize:11,color:"var(--muted2)" }}>{j.customerName}</div>
                      <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                        <span style={{ background:"var(--surface2)",padding:"2px 7px",borderRadius:4,fontSize:10,color:"var(--muted2)" }}>{j.workType}</span>
                        <span style={{ background:"var(--surface2)",padding:"2px 7px",borderRadius:4,fontSize:10,color:"var(--muted2)" }}>{j.productDimension}</span>
                      </div>
                      <div style={{ display:"flex",justifyContent:"space-between",fontSize:11 }}>
                        <span style={{ color:"var(--muted)" }}>Rcvd <b style={{ color:"var(--text)" }}>{j.quantityReceived}</b></span>
                        <span style={{ color:"var(--muted)" }}>Done <b style={{ color:"var(--green)" }}>{j.quantityCompleted}</b></span>
                        <span style={{ color:"var(--muted)" }}>Pend <b style={{ color:"var(--amber)" }}>{pend}</b></span>
                      </div>
                      <div>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--muted)",marginBottom:3 }}><span>Progress</span><span style={{ fontWeight:700,color:col }}>{pct}%</span></div>
                        <div style={{ height:5,background:"var(--surface2)",borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:`${pct}%`,background:col,borderRadius:4,transition:"width .6s" }} /></div>
                      </div>
                      <div style={{ fontSize:10,color:"var(--muted)" }}>📅 {j.deliveryDate}</div>
                      <div className="kanban-actions">
                        {stages.filter(s=>s!==stage).map(s=>(
                          <button key={s} className="btn btn-ghost btn-sm" style={{ fontSize:10,padding:"4px 8px" }} onClick={()=>move(j.id,s)}>→ {s}</button>
                        ))}
                        {stage!=="Delivered" && <button className="btn btn-wa btn-sm" style={{ fontSize:10,padding:"4px 8px" }} onClick={()=>sendWhatsApp(j,company?.companyName)}>💬 WA</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Delivery ─────────────────────────────────────────────────────────────────
function Delivery({ jobs, setJobs, addToast, company }) {
  const getDS = j => {
    if (j.status==="Delivered") return "Delivered";
    if (j.status==="Delayed")   return "Delayed";
    if (j.status==="Completed") return "Ready";   // completed but not yet dispatched
    if (j.quantityCompleted>0&&j.quantityCompleted<j.quantityReceived) return "Partial";
    if (j.quantityCompleted===j.quantityReceived&&j.quantityReceived>0) return "Ready";
    return "Pending";
  };
  const all = jobs.map(j=>({...j,ds:getDS(j)}));
  const DC = { Ready:"var(--green)",Partial:"var(--cyan)",Delivered:"var(--accent)",Delayed:"var(--red)",Pending:"var(--muted)" };



  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"var(--font-head)",fontSize:22,fontWeight:700 }}>Delivery Tracking</div>
          <div style={{ color:"var(--muted)",fontSize:13 }}>Monitor delivery status across all jobs</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => {
            if (all.length === 0) { addToast("No delivery data to export","warn"); return; }
            exportCSV(`delivery_export_${TODAY}.csv`, ["Job ID","Customer Name","Customer Phone","Product Name","Qty Received","Qty Completed","Pending Qty","Delivery Date","Job Status","Delivery Status"], all.map(j=>[j.id,j.customerName,j.customerPhone||"",j.productName,j.quantityReceived,j.quantityCompleted,(j.quantityReceived-j.quantityCompleted),j.deliveryDate,j.status,j.ds]));
          }}>↓ Export CSV</button>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12 }}>
        {[["Ready",all.filter(j=>j.ds==="Ready").length,"var(--green)"],["Partial",all.filter(j=>j.ds==="Partial").length,"var(--cyan)"],["Delivered",all.filter(j=>j.ds==="Delivered").length,"var(--accent)"],["Delayed",all.filter(j=>j.ds==="Delayed").length,"var(--red)"]].map(([l,v,c])=>(
          <div key={l} style={{ background:"var(--surface)",border:`1px solid ${c}30`,borderRadius:"var(--radius)",padding:16,textAlign:"center" }}>
            <div style={{ fontSize:28,fontFamily:"var(--font-head)",fontWeight:700,color:c }}>{v}</div>
            <div style={{ fontSize:12,color:"var(--muted)",marginTop:4 }}>{l}</div>
          </div>
        ))}
      </div>
      <Card style={{ padding:0,overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",minWidth:800 }}>
            <thead>
              <tr style={{ background:"var(--bg3)",borderBottom:"1px solid var(--border)" }}>
                {["Job ID","Customer","Product","Rcvd","Done","Pend","Delivery Date","Status","Delivery","Actions"].map(h=>(
                  <th key={h} style={{ padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:0.5,whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map(j=>(
                <tr key={j.id} style={{ borderBottom:"1px solid var(--border)" }}>
                  <td style={{ padding:"9px 12px",fontSize:12,color:"var(--accent)",fontWeight:600 }}>{j.id}</td>
                  <td style={{ padding:"9px 12px",fontSize:12 }}>{j.customerName}</td>
                  <td style={{ padding:"9px 12px",fontSize:12 }}>{j.productName}</td>
                  <td style={{ padding:"9px 12px",fontSize:12,textAlign:"center" }}>{j.quantityReceived}</td>
                  <td style={{ padding:"9px 12px",fontSize:12,textAlign:"center",color:"var(--green)",fontWeight:600 }}>{j.quantityCompleted}</td>
                  <td style={{ padding:"9px 12px",fontSize:12,textAlign:"center",color:"var(--amber)",fontWeight:600 }}>{(j.quantityReceived||0)-(j.quantityCompleted||0)}</td>
                  <td style={{ padding:"9px 12px",fontSize:11,color:"var(--muted2)" }}>{j.deliveryDate}</td>
                  <td style={{ padding:"9px 12px" }}><Badge status={j.status} /></td>
                  <td style={{ padding:"9px 12px" }}><span style={{ color:DC[j.ds],fontSize:12,fontWeight:600 }}>{j.ds}</span></td>
                  <td style={{ padding:"9px 12px" }}>
                    {j.status!=="Delivered" && (
                      <div style={{ display:"flex",gap:4 }}>
                        <button className="btn btn-green btn-sm" onClick={()=>{ setJobs(p=>p.map(x=>x.id===j.id?{...x,status:"Delivered"}:x)); addToast("Marked Delivered","success"); }}>✓ Deliver</button>
                        <button className="btn btn-wa btn-sm" onClick={()=>sendWhatsApp(j,company?.companyName)}>💬</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────
function Reports({ jobs, customers, addToast }) {
  const [df,setDf]=useState(""); const [dt,setDt]=useState(""); const [ft,setFt]=useState("All");
  const filtered=jobs.filter(j=>{ const d=new Date(j.createdAt); if(df&&d<new Date(df))return false; if(dt&&d>new Date(dt))return false; if(ft!=="All"&&j.status!==ft)return false; return true; });
  const totalR=filtered.reduce((s,j)=>s+(parseInt(j.quantityReceived)||0),0);
  const totalD=filtered.reduce((s,j)=>s+(parseInt(j.quantityCompleted)||0),0);
  const wt={},cc={};
  filtered.forEach(j=>{ wt[j.workType]=(wt[j.workType]||0)+1; cc[j.customerName]=(cc[j.customerName]||0)+1; });



  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"var(--font-head)",fontSize:22,fontWeight:700 }}>Reports</div>
          <div style={{ color:"var(--muted)",fontSize:13 }}>Analytics & operational reports</div>
        </div>
        <button className="btn btn-primary" onClick={() => {
            if (filtered.length === 0) { addToast("No data to export","warn"); return; }
            exportCSV(`reports_export_${TODAY}.csv`, ["Job ID","Customer Name","Customer Phone","Product Name","Product Dimension","Work Type","Quantity Received","Quantity Completed","Pending Quantity","Status","Priority","Delivery Date","Created At","Notes"], filtered.map(j=>[j.id,j.customerName,j.customerPhone||"",j.productName,j.productDimension,j.workType,j.quantityReceived,j.quantityCompleted,(j.quantityReceived-j.quantityCompleted),j.status,j.priority,j.deliveryDate,j.createdAt,j.notes||""]));
          }}>↓ Export CSV</button>
      </div>
      <Card style={{ display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end" }}>
        {[{l:"From Date",v:df,set:setDf},{l:"To Date",v:dt,set:setDt}].map(x=>(
          <div key={x.l}><label style={{ fontSize:11,color:"var(--muted)",display:"block",marginBottom:4 }}>{x.l}</label><input type="date" value={x.v} onChange={e=>x.set(e.target.value)} style={{ width:160 }} /></div>
        ))}
        <div><label style={{ fontSize:11,color:"var(--muted)",display:"block",marginBottom:4 }}>Status</label>
          <select value={ft} onChange={e=>setFt(e.target.value)} style={{ width:150 }}><option>All</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
        <button className="btn btn-ghost btn-sm" onClick={()=>{ setDf(""); setDt(""); setFt("All"); }}>Clear</button>
      </Card>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12 }}>
        <StatCard label="Total Jobs"   value={filtered.length} icon="◈" />
        <StatCard label="Qty Received" value={totalR}          icon="▼" color="var(--cyan)" />
        <StatCard label="Qty Done"     value={totalD}          icon="✓" color="var(--green)" />
        <StatCard label="Pending Qty"  value={totalR-totalD}   icon="⏳" color="var(--amber)" />
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
        <Card>
          <div style={{ fontFamily:"var(--font-head)",fontWeight:600,fontSize:14,marginBottom:14 }}>Work Type Analytics</div>
          {Object.entries(wt).sort((a,b)=>b[1]-a[1]).map(([t,c],i)=>(
            <div key={t} style={{ marginBottom:10 }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4 }}><span>{t}</span><span style={{ fontWeight:600 }}>{c} jobs</span></div>
              <div style={{ height:6,background:"var(--bg3)",borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:`${filtered.length?(c/filtered.length)*100:0}%`,background:CHART_COLS[i%CHART_COLS.length],borderRadius:4 }} /></div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontFamily:"var(--font-head)",fontWeight:600,fontSize:14,marginBottom:14 }}>Top Customers</div>
          {Object.entries(cc).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,count])=>(
            <div key={name} style={{ display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--border)",fontSize:12 }}>
              <span>{name}</span><span style={{ fontWeight:600,color:"var(--accent)" }}>{count} jobs</span>
            </div>
          ))}
        </Card>
      </div>
      <Card style={{ padding:0,overflow:"hidden" }}>
        <div style={{ padding:"14px 16px",borderBottom:"1px solid var(--border)",fontFamily:"var(--font-head)",fontWeight:600,fontSize:13 }}>Job Details ({filtered.length})</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",minWidth:700 }}>
            <thead><tr style={{ background:"var(--bg3)",borderBottom:"1px solid var(--border)" }}>{["Job ID","Customer","Product","Work Type","Rcvd","Done","Status","Delivery"].map(h=><th key={h} style={{ padding:"8px 12px",fontSize:10,color:"var(--muted)",textAlign:"left",textTransform:"uppercase",letterSpacing:0.5 }}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(j=>(
                <tr key={j.id} style={{ borderBottom:"1px solid var(--border)" }}>
                  <td style={{ padding:"8px 12px",fontSize:11,color:"var(--accent)",fontWeight:600 }}>{j.id}</td>
                  <td style={{ padding:"8px 12px",fontSize:12 }}>{j.customerName}</td>
                  <td style={{ padding:"8px 12px",fontSize:12 }}>{j.productName}</td>
                  <td style={{ padding:"8px 12px",fontSize:12 }}>{j.workType}</td>
                  <td style={{ padding:"8px 12px",fontSize:12,textAlign:"center" }}>{j.quantityReceived}</td>
                  <td style={{ padding:"8px 12px",fontSize:12,textAlign:"center",color:"var(--green)" }}>{j.quantityCompleted}</td>
                  <td style={{ padding:"8px 12px" }}><Badge status={j.status} /></td>
                  <td style={{ padding:"8px 12px",fontSize:11,color:"var(--muted2)" }}>{j.deliveryDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Settings — validated ────────────────────────────────────────────────────
function Settings({ company, setCompany, addToast }) {
  const [form,    setForm]    = useState(company || { companyName:"",industry:"",phone:"",email:"",gst:"",address:"",workers:"" });
  const [touched, setTouched] = useState({});

  const errors = {
    companyName: V.companyName(form.companyName),
    email:       form.email ? V.email(form.email) : "",
    phone:       V.phone(form.phone),
    gst:         V.gst(form.gst),
    workers:     V.workers(form.workers),
  };
  const touch  = k => setTouched(t=>({...t,[k]:true}));
  const touchAll = () => setTouched({ companyName:true, email:true, phone:true, gst:true, workers:true });

  const setF = (k,v) => { setForm(p=>({...p,[k]:v})); touch(k); };

  const save = () => {
    touchAll();
    if (Object.values(errors).some(e=>e)) { addToast("Please fix validation errors","error"); return; }
    setCompany(form);
    addToast("Settings saved!","success");
  };

  // makeSettingsField: returns JSX directly — no inline component definition → no remount
  const makeSettingsField = (k, label, placeholder, type="text", onKeyDown=null) => (
    <div>
      <label style={{ fontSize:11,color:"var(--muted)",display:"block",marginBottom:5 }}>{label}</label>
      <input type={type} value={form[k]||""} placeholder={placeholder}
        style={inputStyle(errors[k], touched[k])}
        onKeyDown={onKeyDown||undefined}
        onChange={e=>setF(k,e.target.value)} />
      <FieldError msg={touched[k] ? errors[k] : ""} />
    </div>
  );

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20,maxWidth:640 }}>
      <div>
        <div style={{ fontFamily:"var(--font-head)",fontSize:22,fontWeight:700 }}>Settings</div>
        <div style={{ color:"var(--muted)",fontSize:13 }}>Company profile & preferences</div>
      </div>
      <Card>
        <div style={{ fontFamily:"var(--font-head)",fontWeight:600,marginBottom:16 }}>Company Information</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <div style={{ gridColumn:"1/-1" }}>
            {makeSettingsField("companyName", "Company Name *", "Shree Industrial Works")}
          </div>
          {makeSettingsField("industry", "Industry",       "Manufacturing")}
          {makeSettingsField("phone",    "Phone",          "91XXXXXXXXXX",            "text",  onlyDigits)}
          {makeSettingsField("email",    "Email",          "admin@company.com",       "email")}
          {makeSettingsField("gst",      "GST Number",     "27ABCDE1234F1Z5 (optional)")}
          {makeSettingsField("workers",  "No. of Workers", "e.g. 25",                 "text",  onlyNumbers)}
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontSize:11,color:"var(--muted)",display:"block",marginBottom:5 }}>Address</label>
            <textarea value={form.address||""} onChange={e=>setForm(p=>({...p,address:e.target.value}))} rows={2} />
          </div>
        </div>
      </Card>
      <Card>
        <div style={{ fontFamily:"var(--font-head)",fontWeight:600,marginBottom:8 }}>Default Work Types</div>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {WORK_TYPES.map(w=><span key={w} style={{ background:"var(--bg3)",border:"1px solid var(--border2)",padding:"4px 12px",borderRadius:20,fontSize:12,color:"var(--muted2)" }}>{w}</span>)}
        </div>
      </Card>
      <button className="btn btn-primary" style={{ alignSelf:"flex-start" }} onClick={save}>Save Settings</button>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session,   setSession]   = useState(null);
  const _toastId = useRef(0);
  const [page,      setPage]      = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [jobs,      setJobs]      = useState(() => {
    try { const saved=localStorage.getItem("ft_jobs"); return saved?JSON.parse(saved):SEED_JOBS; } catch(e){ return SEED_JOBS; }
  });
  const [customers, setCustomers] = useState(() => {
    try { const saved=localStorage.getItem("ft_customers"); return saved?JSON.parse(saved):SEED_CUSTOMERS; } catch(e){ return SEED_CUSTOMERS; }
  });
  const [company,   setCompany]   = useState(null);
  const [toasts,    setToasts]    = useState([]);

  // Persist jobs + customers to localStorage on every change
  useEffect(()=>{
    try { localStorage.setItem("ft_jobs", JSON.stringify(jobs)); }
    catch(e){ console.warn("Storage full — job data not persisted:", e.name); }
  }, [jobs]);
  useEffect(()=>{
    try { localStorage.setItem("ft_customers", JSON.stringify(customers)); }
    catch(e){ console.warn("Storage full — customer data not persisted:", e.name); }
  }, [customers]);

  useEffect(()=>{
    try {
      const s=localStorage.getItem("ft_session");
      if(s){
        const sess=JSON.parse(s);
        if(!sess||!sess.userId) return; // corrupted — ignore
        const comp=JSON.parse(localStorage.getItem(`ft_company_${sess.userId}`)||"null");
        setSession({user:sess,company:comp});
        setCompany(comp);
      }
    } catch(e){ localStorage.removeItem("ft_session"); } // wipe corrupted session
  },[]);

  const addToast=(message,type="info")=>{ const id=++_toastId.current; setToasts(t=>[...t,{id,message,type}]); setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),4000); };
  const handleAuth=({user,company})=>{ setSession({user,company}); setCompany(company); };
  const handleLogout=()=>{ localStorage.removeItem("ft_session"); setSession(null); setCompany(null); setPage("dashboard"); };

  if(!session) return <><style>{STYLE}</style><AuthScreen onAuth={handleAuth} /><Toast toasts={toasts} /></>;

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <Dashboard jobs={jobs} customers={customers} setPage={setPage} />;
      case "jobs":      return <Jobs jobs={jobs} setJobs={setJobs} customers={customers} setCustomers={setCustomers} addToast={addToast} company={company} />;
      case "customers": return <Customers customers={customers} setCustomers={setCustomers} jobs={jobs} addToast={addToast} />;
      case "work":      return <WorkTracking jobs={jobs} setJobs={setJobs} addToast={addToast} company={company} />;
      case "delivery":  return <Delivery jobs={jobs} setJobs={setJobs} addToast={addToast} company={company} />;
      case "reports":   return <Reports jobs={jobs} customers={customers} addToast={addToast} />;
      case "settings":  return <Settings company={company} setCompany={setCompany} addToast={addToast} />;
      default:          return <Dashboard jobs={jobs} customers={customers} setPage={setPage} />;
    }
  };

  return (
    <>
      <style>{STYLE}</style>
      <div style={{ display:"flex",minHeight:"100vh" }}>
        <Sidebar active={page} setActive={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div style={{ flex:1,display:"flex",flexDirection:"column",minWidth:0 }}>
          <TopBar page={page} user={session.user} company={company} jobs={jobs} onLogout={handleLogout} />
          <main className="mobile-pad" style={{ flex:1,padding:"24px",overflowY:"auto",background:"var(--bg)" }}>
            <div style={{ maxWidth:1280,margin:"0 auto",animation:"fadeIn 0.25s ease" }} key={page}>
              {renderPage()}
            </div>
          </main>
        </div>
      </div>
      <Toast toasts={toasts} />
    </>
  );
}
