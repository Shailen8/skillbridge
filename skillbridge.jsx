import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════
// AI CALL via Anthropic proxy (no CORS issue)
// ══════════════════════════════════════════════
async function callAI(messages, systemPrompt) {
  const sys = systemPrompt || `You are SkillBridge MP's AI Career Intelligence system for students in Madhya Pradesh, India.
Be warm, expert, encouraging. Mix Hindi naturally (bilkul, bahut accha, shabash).
Give concrete advice: real company names (TCS, Infosys, Wipro, Zomato, Flipkart),
realistic INR salaries, specific free courses (NPTEL, YouTube, Coursera free tier),
practical Tier-2 city tips. Use emojis, clear headers, bullet points.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: sys,
      messages,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.[0]?.text || "Sorry, no response received.";
}

// ══════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════
const DEMO_USERS = [
  { id: 1, role: "student", name: "Priya Sharma", email: "priya@student.com", phone: "9876543210", password: "student123", college: "RGPV Bhopal", course: "B.Tech CSE", year: "3rd Year", avatar: "👩‍🎓" },
  { id: 2, role: "student", name: "Rahul Verma", email: "rahul@student.com", phone: "9876543211", password: "student123", college: "IIT Indore", course: "B.Tech IT", year: "2nd Year", avatar: "👨‍🎓" },
  { id: 3, role: "admin", name: "Dr. Anjali Singh", email: "admin@skillbridge.in", phone: "9000000001", password: "admin123", college: "SkillBridge HQ", course: "Administrator", year: "", avatar: "👩‍💼" },
];

const QUIZ_QUESTIONS = [
  { q: "When solving a problem, you prefer to:", opts: ["Analyze data and find patterns", "Build and create something hands-on", "Understand people and help them", "Research and explore new ideas"], domain: "Analytical vs Creative" },
  { q: "Which subject excites you most?", opts: ["Mathematics & Statistics", "Programming & Technology", "Business & Entrepreneurship", "Design & Arts"], domain: "Domain Interest" },
  { q: "Your ideal work environment:", opts: ["Working with data and numbers", "Building software and apps", "Leading a team or project", "Designing user experiences"], domain: "Work Style" },
  { q: "Which challenge sounds most interesting?", opts: ["Making predictions using AI models", "Building scalable web apps", "Launching a startup product", "Securing systems from hackers"], domain: "Challenge Preference" },
  { q: "How do you learn best?", opts: ["Watching tutorials & taking notes", "Building projects by trial & error", "Learning from mentors & peers", "Reading docs & books"], domain: "Learning Style" },
  { q: "Which skill do you enjoy most?", opts: ["Excel, statistics, data analysis", "Coding, algorithms, debugging", "Communication, pitching ideas", "Drawing, designing interfaces"], domain: "Current Skills" },
  { q: "What impact do you want to make?", opts: ["Use data to drive decisions", "Build products used by millions", "Create a successful business", "Protect people's digital security"], domain: "Impact Goal" },
  { q: "Which industry excites you most?", opts: ["Healthcare & Biotech", "Fintech & Banking", "Gaming & Entertainment", "E-commerce & Retail"], domain: "Industry Interest" },
  { q: "How comfortable are you with maths?", opts: ["Very comfortable — I enjoy it", "Somewhat comfortable", "I prefer logic over math", "I prefer creative work"], domain: "Math Comfort" },
  { q: "Your biggest career goal in 5 years?", opts: ["Lead a data science team", "Build my own tech startup", "Become a senior software architect", "Work as a cybersecurity expert"], domain: "Career Vision" },
];

const TRENDS = [
  { n: "Python / ML", pct: 96, col: "#3b82f6", arrow: "↑↑" },
  { n: "Generative AI", pct: 94, col: "#8b5cf6", arrow: "↑↑" },
  { n: "Cloud (AWS/GCP)", pct: 89, col: "#f59e0b", arrow: "↑" },
  { n: "Cybersecurity", pct: 85, col: "#22c55e", arrow: "↑" },
  { n: "Data Science", pct: 88, col: "#06b6d4", arrow: "↑" },
  { n: "React / Next.js", pct: 82, col: "#ec4899", arrow: "→" },
  { n: "DevOps / Docker", pct: 78, col: "#f97316", arrow: "↑" },
  { n: "Blockchain", pct: 45, col: "#64748b", arrow: "↓" },
];

const ADMIN_STUDENTS = [
  { name: "Priya Sharma", college: "RGPV Bhopal", score: 87, streak: 24, status: "Active" },
  { name: "Rahul Verma", college: "IIT Indore", score: 72, streak: 12, status: "Active" },
  { name: "Anjali Patel", college: "LNCT Bhopal", score: 91, streak: 30, status: "Active" },
  { name: "Rohan Gupta", college: "SGSITS Indore", score: 65, streak: 7, status: "Inactive" },
  { name: "Sneha Joshi", college: "MANIT Bhopal", score: 78, streak: 18, status: "Active" },
];

// ══════════════════════════════════════════════
// CSS-in-JS styles
// ══════════════════════════════════════════════
const S = {
  // layout
  page: { minHeight: "100vh", background: "#030912", color: "#e8f0fe", fontFamily: "'DM Sans', sans-serif", position: "relative" },
  card: { background: "rgba(8,15,30,0.85)", border: "1px solid rgba(56,165,255,0.15)", borderRadius: 16, padding: "1.4rem" },
  // inputs
  input: { width: "100%", background: "rgba(3,9,18,0.8)", border: "1px solid rgba(56,165,255,0.18)", borderRadius: 10, padding: "0.75rem 1rem", color: "#e8f0fe", fontFamily: "inherit", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", background: "rgba(3,9,18,0.8)", border: "1px solid rgba(56,165,255,0.18)", borderRadius: 10, padding: "0.75rem 1rem", color: "#e8f0fe", fontFamily: "inherit", fontSize: "0.9rem", outline: "none", resize: "vertical", minHeight: 100, boxSizing: "border-box" },
  select: { width: "100%", background: "rgba(3,9,18,0.9)", border: "1px solid rgba(56,165,255,0.18)", borderRadius: 10, padding: "0.75rem 1rem", color: "#e8f0fe", fontFamily: "inherit", fontSize: "0.9rem", outline: "none" },
  label: { display: "block", fontSize: "0.82rem", color: "#94aac8", marginBottom: "0.4rem", fontWeight: 500 },
  // buttons
  btnPrimary: { background: "linear-gradient(135deg,#3b82f6,#06b6d4)", color: "#fff", border: "none", padding: "0.75rem 1.8rem", borderRadius: 10, fontWeight: 600, fontSize: "0.92rem", cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: "0.5rem" },
  btnSm: { background: "linear-gradient(135deg,#3b82f6,#06b6d4)", color: "#fff", border: "none", padding: "0.45rem 1rem", borderRadius: 7, fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" },
  btnGhost: { background: "transparent", color: "#e8f0fe", border: "1px solid rgba(56,165,255,0.25)", padding: "0.45rem 1rem", borderRadius: 7, fontWeight: 500, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" },
  // ai box
  aiBox: { background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: 14, padding: "1.4rem", marginTop: "1.2rem", lineHeight: 1.75, fontSize: "0.9rem", whiteSpace: "pre-wrap" },
};

// ══════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════

function Orbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,.1),transparent 70%)", filter: "blur(90px)", top: -150, left: -150, animation: "d1 20s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,.08),transparent 70%)", filter: "blur(90px)", bottom: -100, right: -100, animation: "d2 24s ease-in-out infinite" }} />
      <style>{`@keyframes d1{0%,100%{transform:translate(0,0)}50%{transform:translate(50px,35px)}}@keyframes d2{0%,100%{transform:translate(0,0)}50%{transform:translate(-40px,-25px)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4;transform:scale(1.3)}}@keyframes slideIn{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}

function Loader() {
  return <div style={{ width: 18, height: 18, border: "2px solid rgba(59,130,246,.2)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin .8s linear infinite", display: "inline-block" }} />;
}

function AIResult({ text, loading }) {
  if (!text && !loading) return null;
  return (
    <div style={S.aiBox}>
      {loading ? <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#94aac8" }}><Loader /> AI is generating your response...</span> : text}
    </div>
  );
}

function Notif({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return <div style={{ position: "fixed", top: 80, right: 20, background: "linear-gradient(135deg,#3b82f6,#06b6d4)", color: "#fff", padding: "0.75rem 1.4rem", borderRadius: 10, fontSize: "0.88rem", fontWeight: 600, zIndex: 2000, animation: "slideIn .3s ease", boxShadow: "0 8px 30px rgba(59,130,246,.4)" }}>{msg}</div>;
}

// ══════════════════════════════════════════════
// LOGIN PAGE
// ══════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [tab, setTab] = useState("login"); // login | register
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", college: "", course: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState([...DEMO_USERS]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = () => {
    setErr("");
    if (!form.email || !form.password) { setErr("Email aur password required hai!"); return; }
    const user = registered.find(u =>
      u.email.toLowerCase() === form.email.toLowerCase() &&
      u.password === form.password &&
      u.role === role
    );
    if (!user) { setErr("Invalid credentials! Demo credentials neeche dekho."); return; }
    onLogin(user);
  };

  const handleRegister = () => {
    setErr("");
    if (!form.name || !form.email || !form.phone || !form.password) { setErr("Saare required fields bharo!"); return; }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) { setErr("Valid email address enter karo!"); return; }
    if (!/^\d{10}$/.test(form.phone)) { setErr("10-digit valid phone number enter karo!"); return; }
    if (form.password.length < 6) { setErr("Password kam se kam 6 characters ka hona chahiye!"); return; }
    if (registered.find(u => u.email === form.email)) { setErr("Yeh email already registered hai!"); return; }
    const newUser = { id: Date.now(), role: "student", name: form.name, email: form.email, phone: form.phone, password: form.password, college: form.college || "Not specified", course: form.course || "Not specified", year: "1st Year", avatar: "👨‍🎓" };
    setRegistered(r => [...r, newUser]);
    setTab("login");
    setForm(f => ({ ...f, name: "", phone: "", college: "", course: "" }));
    setErr("✅ Registration successful! Ab login karo.");
  };

  return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem" }}>
      <Orbs />
      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, background: "linear-gradient(135deg,#fff,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>
            Skill<span style={{ WebkitTextFillColor: "#3b82f6" }}>Bridge</span> MP
          </div>
          <div style={{ color: "#94aac8", fontSize: "0.9rem" }}>AI Career Intelligence Platform · Madhya Pradesh</div>
        </div>

        <div style={{ ...S.card, backdropFilter: "blur(20px)" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, background: "rgba(3,9,18,.6)", borderRadius: 10, padding: 4, marginBottom: "1.5rem" }}>
            {["login", "register"].map(t => (
              <button key={t} onClick={() => { setTab(t); setErr(""); }} style={{ flex: 1, padding: "0.55rem", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.88rem", background: tab === t ? "linear-gradient(135deg,#3b82f6,#06b6d4)" : "transparent", color: tab === t ? "#fff" : "#94aac8", transition: "all .2s" }}>
                {t === "login" ? "🔐 Login" : "✨ Register"}
              </button>
            ))}
          </div>

          {/* Role Selector */}
          {tab === "login" && (
            <div style={{ display: "flex", gap: 8, marginBottom: "1.2rem" }}>
              {["student", "admin"].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: "0.6rem", borderRadius: 9, border: `2px solid ${role === r ? "#3b82f6" : "rgba(56,165,255,.15)"}`, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.85rem", background: role === r ? "rgba(59,130,246,.15)" : "transparent", color: role === r ? "#3b82f6" : "#94aac8", transition: "all .2s" }}>
                  {r === "student" ? "🎓 Student" : "⚙️ Admin"}
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            {tab === "register" && (
              <>
                <div>
                  <label style={S.label}>Full Name *</label>
                  <input style={S.input} placeholder="Apna poora naam likhein" value={form.name} onChange={e => set("name", e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                  <div>
                    <label style={S.label}>College / Institute</label>
                    <input style={S.input} placeholder="e.g. RGPV Bhopal" value={form.college} onChange={e => set("college", e.target.value)} />
                  </div>
                  <div>
                    <label style={S.label}>Course</label>
                    <input style={S.input} placeholder="e.g. B.Tech CSE" value={form.course} onChange={e => set("course", e.target.value)} />
                  </div>
                </div>
              </>
            )}
            <div>
              <label style={S.label}>Email Address *</label>
              <input style={S.input} type="email" placeholder="yourname@email.com" value={form.email} onChange={e => set("email", e.target.value)} onKeyDown={e => e.key === "Enter" && tab === "login" && handleLogin()} />
            </div>
            {tab === "register" && (
              <div>
                <label style={S.label}>Mobile Number * (10 digits)</label>
                <input style={S.input} type="tel" placeholder="9876543210" maxLength={10} value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/, ""))} />
              </div>
            )}
            <div>
              <label style={S.label}>Password *</label>
              <input style={S.input} type="password" placeholder={tab === "register" ? "Min 6 characters" : "Enter password"} value={form.password} onChange={e => set("password", e.target.value)} onKeyDown={e => e.key === "Enter" && tab === "login" && handleLogin()} />
            </div>
          </div>

          {err && <div style={{ marginTop: "0.8rem", padding: "0.6rem 1rem", borderRadius: 8, background: err.startsWith("✅") ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.1)", border: `1px solid ${err.startsWith("✅") ? "rgba(34,197,94,.25)" : "rgba(239,68,68,.25)"}`, color: err.startsWith("✅") ? "#22c55e" : "#ef4444", fontSize: "0.85rem" }}>{err}</div>}

          <button onClick={tab === "login" ? handleLogin : handleRegister} style={{ ...S.btnPrimary, width: "100%", justifyContent: "center", marginTop: "1.2rem", padding: "0.9rem" }}>
            {loading ? <Loader /> : tab === "login" ? "🚀 Login Karo" : "✨ Account Banao"}
          </button>

          {/* Demo credentials */}
          {tab === "login" && (
            <div style={{ marginTop: "1.2rem", padding: "1rem", background: "rgba(59,130,246,.06)", border: "1px solid rgba(59,130,246,.15)", borderRadius: 10 }}>
              <div style={{ fontSize: "0.78rem", color: "#94aac8", marginBottom: "0.5rem", fontWeight: 600 }}>🔑 Demo Credentials:</div>
              <div style={{ fontSize: "0.78rem", color: "#94aac8", lineHeight: 1.8 }}>
                <b style={{ color: "#06b6d4" }}>Student:</b> priya@student.com / student123<br />
                <b style={{ color: "#8b5cf6" }}>Admin:</b> admin@skillbridge.in / admin123
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: "0.6rem", flexWrap: "wrap" }}>
                <button onClick={() => { setRole("student"); set("email", "priya@student.com"); set("password", "student123"); }} style={{ ...S.btnSm, background: "rgba(6,182,212,.2)", color: "#06b6d4", border: "1px solid rgba(6,182,212,.3)" }}>Quick: Student</button>
                <button onClick={() => { setRole("admin"); set("email", "admin@skillbridge.in"); set("password", "admin123"); }} style={{ ...S.btnSm, background: "rgba(139,92,246,.2)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,.3)" }}>Quick: Admin</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════
function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("overview");

  const navItems = [
    ["overview", "🏠", "Overview"],
    ["students", "👥", "Students"],
    ["analytics", "📊", "Analytics"],
    ["internships", "🏢", "Internships"],
    ["settings", "⚙️", "Settings"],
  ];

  return (
    <div style={{ ...S.page, paddingTop: 66 }}>
      <Orbs />
      {/* Topbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, height: 66, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4%", background: "rgba(3,9,18,.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(56,165,255,.13)", zIndex: 100 }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.25rem", fontWeight: 800, background: "linear-gradient(135deg,#fff,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Skill<span style={{ WebkitTextFillColor: "#3b82f6" }}>Bridge</span> MP <span style={{ fontSize: "0.7rem", background: "rgba(139,92,246,.2)", border: "1px solid rgba(139,92,246,.3)", color: "#8b5cf6", borderRadius: 5, padding: "2px 8px", verticalAlign: "middle", WebkitTextFillColor: "#8b5cf6" }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#94aac8", fontSize: "0.85rem" }}>{user.avatar} {user.name}</span>
          <button onClick={onLogout} style={{ ...S.btnGhost, fontSize: "0.82rem" }}>Logout</button>
        </div>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 66px)", position: "relative", zIndex: 1 }}>
        {/* Sidebar */}
        <div style={{ background: "rgba(3,9,18,.9)", borderRight: "1px solid rgba(56,165,255,.13)", padding: "1.5rem 0", position: "sticky", top: 66, height: "calc(100vh - 66px)", overflowY: "auto" }}>
          {navItems.map(([id, icon, label]) => (
            <div key={id} onClick={() => setTab(id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.65rem 1.4rem", fontSize: "0.87rem", color: tab === id ? "#e8f0fe" : "#94aac8", cursor: "pointer", borderLeft: `3px solid ${tab === id ? "#3b82f6" : "transparent"}`, background: tab === id ? "rgba(59,130,246,.08)" : "transparent", transition: "all .2s" }}>
              <span>{icon}</span> {label}
            </div>
          ))}
          <div style={{ padding: "1.4rem", marginTop: "auto", borderTop: "1px solid rgba(56,165,255,.13)" }}>
            <button onClick={onLogout} style={{ ...S.btnGhost, width: "100%", fontSize: "0.82rem" }}>← Logout</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "2rem", overflowY: "auto" }}>
          {tab === "overview" && <AdminOverview />}
          {tab === "students" && <AdminStudents />}
          {tab === "analytics" && <AdminAnalytics />}
          {tab === "internships" && <AdminInternships />}
          {tab === "settings" && <AdminSettings user={user} />}
        </div>
      </div>
    </div>
  );
}

function AdminOverview() {
  const stats = [{ v: "1,247", l: "Total Students", c: "#3b82f6" }, { v: "847", l: "Active This Week", c: "#22c55e" }, { v: "92%", l: "Avg Completion", c: "#06b6d4" }, { v: "156", l: "Internships Placed", c: "#8b5cf6" }];
  return (
    <div>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.4rem" }}>⚙️ Admin Dashboard</div>
      <div style={{ color: "#94aac8", fontSize: "0.9rem", marginBottom: "1.8rem" }}>SkillBridge MP platform overview — Madhya Pradesh</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {stats.map((s, i) => (
          <div key={i} style={{ ...S.card, textAlign: "center" }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.8rem", fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ color: "#94aac8", fontSize: "0.76rem", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
        <div style={S.card}>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "#94aac8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>📋 Recent Registrations</div>
          {ADMIN_STUDENTS.slice(0, 4).map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid rgba(56,165,255,.1)" }}>
              <div>
                <div style={{ fontSize: "0.86rem", fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: "0.76rem", color: "#94aac8" }}>{s.college}</div>
              </div>
              <span style={{ background: s.status === "Active" ? "rgba(34,197,94,.15)" : "rgba(148,170,200,.1)", color: s.status === "Active" ? "#22c55e" : "#94aac8", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}>{s.status}</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "#94aac8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>🎯 Platform Health</div>
          {[["API Response Time", "98%", "#22c55e"], ["Tool Usage Rate", "74%", "#3b82f6"], ["Student Satisfaction", "96%", "#06b6d4"], ["Internship Match Rate", "82%", "#8b5cf6"]].map(([l, v, c], i) => (
            <div key={i} style={{ marginBottom: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 4 }}><span>{l}</span><span style={{ color: c }}>{v}</span></div>
              <div style={{ height: 6, background: "rgba(255,255,255,.07)", borderRadius: 3 }}><div style={{ height: "100%", width: v, background: `linear-gradient(90deg,${c},${c}88)`, borderRadius: 3 }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminStudents() {
  return (
    <div>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.8rem" }}>👥 All Students</div>
      <div style={S.card}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(56,165,255,.15)" }}>
              {["Name", "College", "Score", "Streak", "Status", "Action"].map(h => (
                <th key={h} style={{ padding: "0.7rem 0.8rem", textAlign: "left", color: "#94aac8", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ADMIN_STUDENTS.map((s, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(56,165,255,.08)" }}>
                <td style={{ padding: "0.75rem 0.8rem", fontWeight: 600 }}>👤 {s.name}</td>
                <td style={{ padding: "0.75rem 0.8rem", color: "#94aac8" }}>{s.college}</td>
                <td style={{ padding: "0.75rem 0.8rem" }}><span style={{ color: s.score >= 80 ? "#22c55e" : s.score >= 65 ? "#f59e0b" : "#ef4444", fontWeight: 700 }}>{s.score}%</span></td>
                <td style={{ padding: "0.75rem 0.8rem", color: "#06b6d4" }}>🔥 {s.streak} days</td>
                <td style={{ padding: "0.75rem 0.8rem" }}><span style={{ background: s.status === "Active" ? "rgba(34,197,94,.15)" : "rgba(148,170,200,.1)", color: s.status === "Active" ? "#22c55e" : "#94aac8", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}>{s.status}</span></td>
                <td style={{ padding: "0.75rem 0.8rem" }}><button style={{ ...S.btnSm, fontSize: "0.72rem", padding: "3px 10px" }}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminAnalytics() {
  return (
    <div>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.8rem" }}>📊 Analytics</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
        <div style={S.card}>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "#94aac8", marginBottom: "1rem", textTransform: "uppercase" }}>🔥 Most Used Tools</div>
          {[["AI Aptitude Test", 89, "#3b82f6"], ["Career Mentor Chat", 76, "#06b6d4"], ["Resume Builder", 68, "#8b5cf6"], ["Mock Interview", 54, "#22c55e"], ["Roadmap Generator", 71, "#f59e0b"]].map(([n, p, c], i) => (
            <div key={i} style={{ marginBottom: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem", marginBottom: 4 }}><span>{n}</span><span style={{ color: c }}>{p}%</span></div>
              <div style={{ height: 7, background: "rgba(255,255,255,.07)", borderRadius: 4 }}><div style={{ height: "100%", width: `${p}%`, background: c, borderRadius: 4, transition: "width 1s ease" }} /></div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "#94aac8", marginBottom: "1rem", textTransform: "uppercase" }}>🎯 Career Interests</div>
          {[["Data Science / ML", 34, "#3b82f6"], ["Full Stack Dev", 28, "#06b6d4"], ["Cybersecurity", 14, "#22c55e"], ["Product Management", 12, "#8b5cf6"], ["Cloud / DevOps", 12, "#f59e0b"]].map(([n, p, c], i) => (
            <div key={i} style={{ marginBottom: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem", marginBottom: 4 }}><span>{n}</span><span style={{ color: c }}>{p}%</span></div>
              <div style={{ height: 7, background: "rgba(255,255,255,.07)", borderRadius: 4 }}><div style={{ height: "100%", width: `${p}%`, background: c, borderRadius: 4 }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminInternships() {
  const [notif, setNotif] = useState("");
  const internships = [
    { co: "TCS", role: "Data Science Intern", loc: "Bhopal", sal: "₹15K/mo", apps: 24 },
    { co: "Infosys", role: "ML Engineer Intern", loc: "Indore/Remote", sal: "₹20K/mo", apps: 18 },
    { co: "Wipro", role: "Python Dev Intern", loc: "Bhopal", sal: "₹12K/mo", apps: 31 },
    { co: "MP Govt Digital", role: "AI Research Intern", loc: "Bhopal", sal: "₹10K/mo", apps: 9 },
  ];
  return (
    <div>
      {notif && <Notif msg={notif} onDone={() => setNotif("")} />}
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.8rem" }}>🏢 Internship Management</div>
      {internships.map((i, idx) => (
        <div key={idx} style={{ ...S.card, marginBottom: "0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#06b6d4", fontWeight: 600, marginBottom: 3 }}>{i.co}</div>
            <div style={{ fontWeight: 700 }}>{i.role}</div>
            <div style={{ color: "#94aac8", fontSize: "0.8rem" }}>📍 {i.loc} · 💰 {i.sal} · 👥 {i.apps} applications</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setNotif(`✅ ${i.role} at ${i.co} approved!`)} style={S.btnSm}>Approve</button>
            <button onClick={() => setNotif(`📧 Notifications sent for ${i.co}`)} style={{ ...S.btnGhost, fontSize: "0.8rem" }}>Notify</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminSettings({ user }) {
  const [notif, setNotif] = useState("");
  return (
    <div>
      {notif && <Notif msg={notif} onDone={() => setNotif("")} />}
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.8rem" }}>⚙️ Settings</div>
      <div style={S.card}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "#94aac8", marginBottom: "1.2rem", textTransform: "uppercase" }}>Admin Profile</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[["Name", user.name], ["Email", user.email], ["Phone", user.phone || "N/A"], ["Role", "Platform Administrator"]].map(([l, v]) => (
            <div key={l}>
              <label style={S.label}>{l}</label>
              <input style={{ ...S.input, opacity: 0.7 }} value={v} readOnly />
            </div>
          ))}
        </div>
        <button onClick={() => setNotif("✅ Settings saved!")} style={{ ...S.btnPrimary, marginTop: "1rem" }}>Save Changes</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// STUDENT DASHBOARD
// ══════════════════════════════════════════════
function StudentDashboard({ user, onLogout }) {
  const [tool, setTool] = useState("overview");
  const [notif, setNotif] = useState("");

  const navItems = [
    ["overview", "🏠", "Overview"],
    ["aptitude", "🧪", "AI Aptitude Test"],
    ["mentor", "💬", "AI Mentor"],
    ["roadmap", "🗺️", "Skill Roadmap"],
    ["gap", "📋", "Skill Gap Analyzer"],
    ["resume", "📄", "Resume Builder"],
    ["interview", "🎤", "Mock Interview"],
    ["internships", "🏢", "Internships"],
    ["trends", "📈", "Industry Trends"],
    ["careers", "🔭", "Career Explorer"],
  ];

  const showNotif = (msg) => setNotif(msg);

  return (
    <div style={{ ...S.page, paddingTop: 66 }}>
      <Orbs />
      {notif && <Notif msg={notif} onDone={() => setNotif("")} />}
      {/* Topbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, height: 66, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4%", background: "rgba(3,9,18,.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(56,165,255,.13)", zIndex: 100 }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.25rem", fontWeight: 800, background: "linear-gradient(135deg,#fff,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", cursor: "pointer" }}>
          Skill<span style={{ WebkitTextFillColor: "#3b82f6" }}>Bridge</span> MP
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#94aac8", fontSize: "0.85rem" }}>{user.avatar} {user.name}</span>
          <button onClick={onLogout} style={{ ...S.btnGhost, fontSize: "0.82rem" }}>Logout</button>
        </div>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 66px)", position: "relative", zIndex: 1 }}>
        {/* Sidebar */}
        <div style={{ background: "rgba(3,9,18,.9)", borderRight: "1px solid rgba(56,165,255,.13)", padding: "1.5rem 0", position: "sticky", top: 66, height: "calc(100vh - 66px)", overflowY: "auto" }}>
          <div style={{ padding: "0 1.4rem 1.2rem", borderBottom: "1px solid rgba(56,165,255,.13)", marginBottom: "0.6rem" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", marginBottom: "0.6rem" }}>{user.avatar}</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>{user.name}</div>
            <div style={{ color: "#94aac8", fontSize: "0.76rem" }}>{user.course} · {user.college}</div>
          </div>
          {navItems.map(([id, icon, label]) => (
            <div key={id} onClick={() => setTool(id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.65rem 1.4rem", fontSize: "0.87rem", color: tool === id ? "#e8f0fe" : "#94aac8", cursor: "pointer", borderLeft: `3px solid ${tool === id ? "#3b82f6" : "transparent"}`, background: tool === id ? "rgba(59,130,246,.08)" : "transparent", transition: "all .2s" }}>
              <span style={{ fontSize: "1rem", width: 20, textAlign: "center" }}>{icon}</span> {label}
            </div>
          ))}
          <div style={{ padding: "1.4rem", borderTop: "1px solid rgba(56,165,255,.13)", marginTop: "1rem" }}>
            <button onClick={onLogout} style={{ ...S.btnGhost, width: "100%", fontSize: "0.82rem" }}>← Logout</button>
          </div>
        </div>

        {/* Main */}
        <div style={{ overflowY: "auto" }}>
          {tool === "overview" && <ToolOverview user={user} setTool={setTool} />}
          {tool === "aptitude" && <ToolAptitude showNotif={showNotif} />}
          {tool === "mentor" && <ToolMentor user={user} />}
          {tool === "roadmap" && <ToolRoadmap showNotif={showNotif} />}
          {tool === "gap" && <ToolGap />}
          {tool === "resume" && <ToolResume user={user} showNotif={showNotif} />}
          {tool === "interview" && <ToolInterview />}
          {tool === "internships" && <ToolInternships showNotif={showNotif} />}
          {tool === "trends" && <ToolTrends />}
          {tool === "careers" && <ToolCareers />}
        </div>
      </div>
    </div>
  );
}

// ── Overview ──
function ToolOverview({ user, setTool }) {
  const skills = [["Python", "#3b82f6", 82], ["Machine Learning", "#8b5cf6", 61], ["Data Analysis", "#22c55e", 75], ["SQL", "#f59e0b", 55], ["Statistics", "#06b6d4", 48]];
  const tasks = [["Complete Python Pandas tutorial", "Due today", "#3b82f6"], ["Practice 3 SQL queries", "Due today", "#22c55e"], ["Read ML article: Random Forest", "Tomorrow", "#f59e0b"], ["Apply to TCS Data Science internship", "This week", "#8b5cf6"]];
  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.4rem" }}>🏠 Welcome back, {user.name.split(" ")[0]}!</div>
      <div style={{ color: "#94aac8", fontSize: "0.9rem", marginBottom: "1.8rem" }}>Your AI career journey is in progress. 3 tasks due today.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[["87%", "Career Readiness", "#3b82f6"], ["24🔥", "Day Streak", "#06b6d4"], ["6/10", "Skills Mastered", "#8b5cf6"], ["12", "Job Matches", "#22c55e"]].map(([v, l, c], i) => (
          <div key={i} style={{ ...S.card, textAlign: "center" }}><div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.7rem", fontWeight: 800, color: c }}>{v}</div><div style={{ color: "#94aac8", fontSize: "0.76rem", marginTop: 2 }}>{l}</div></div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
        <div style={S.card}>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "#94aac8", textTransform: "uppercase", marginBottom: "1.2rem" }}>📊 Skill Progress</div>
          {skills.map(([name, color, pct], i) => (
            <div key={i} style={{ marginBottom: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 4 }}><span>{name}</span><span style={{ color }}>{pct}%</span></div>
              <div style={{ height: 7, background: "rgba(255,255,255,.07)", borderRadius: 4 }}><div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 1.2s ease" }} /></div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "#94aac8", textTransform: "uppercase", marginBottom: "1.2rem" }}>🎯 Today's Tasks</div>
          {tasks.map(([t, d, c], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.6rem 0", borderBottom: "1px solid rgba(56,165,255,.1)" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: c, flexShrink: 0 }} />
              <div><div style={{ fontSize: "0.86rem", fontWeight: 500 }}>{t}</div><div style={{ fontSize: "0.76rem", color: "#94aac8" }}>{d}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...S.card, marginTop: "1.2rem" }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "#94aac8", textTransform: "uppercase", marginBottom: "1rem" }}>🚀 Quick Actions</div>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          {[["🧪", "Take Aptitude Test", "aptitude"], ["💬", "Chat with AI Mentor", "mentor"], ["📄", "Build Resume", "resume"], ["🎤", "Mock Interview", "interview"]].map(([icon, label, id]) => (
            <button key={id} onClick={() => setTool(id)} style={S.btnSm}>{icon} {label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Aptitude Test ──
function ToolAptitude({ showNotif }) {
  const [phase, setPhase] = useState("start"); // start | quiz | result
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const selectOpt = (optText) => {
    const newAnswers = [...answers, { q: QUIZ_QUESTIONS[idx].q, a: optText }];
    setAnswers(newAnswers);
    if (idx < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setIdx(i => i + 1), 350);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (ans) => {
    setPhase("result");
    setLoading(true);
    const summary = ans.map((a, i) => `Q${i + 1}: ${a.q}\nAnswer: ${a.a}`).join("\n\n");
    try {
      const text = await callAI([{ role: "user", content: `Student from Madhya Pradesh completed career aptitude assessment:\n\n${summary}\n\nProvide:\n🎯 TOP 3 CAREER MATCHES (with % match score)\n📊 PERSONALITY TYPE (brief)\n💪 KEY STRENGTHS (3 points)\n🚀 IMMEDIATE NEXT STEPS (3 specific actions this week)\n⚡ FIRST SKILL TO LEARN with a specific free resource\n\nBe specific, encouraging, practical for an Indian student.` }]);
      setResult(text);
    } catch (e) {
      setResult("❌ AI connection error. Please check and try again.");
    }
    setLoading(false);
  };

  const reset = () => { setPhase("start"); setIdx(0); setAnswers([]); setResult(""); };

  const q = QUIZ_QUESTIONS[idx];
  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.4rem" }}>🧪 AI Aptitude Test</div>
      <div style={{ color: "#94aac8", fontSize: "0.9rem", marginBottom: "1.8rem" }}>10 questions · AI-powered analysis · Get career recommendations instantly</div>
      <div style={S.card}>
        {phase === "start" && (
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧪</div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.8rem" }}>AI Aptitude Assessment</h3>
            <p style={{ color: "#94aac8", fontSize: "0.9rem", marginBottom: "1.5rem", maxWidth: 400, margin: "0 auto 1.5rem" }}>Answer 10 questions about your interests, strengths, and preferences. Our AI will identify your ideal career path.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              {[["⏱️", "~10 min"], ["🎯", "10 questions"], ["🤖", "AI Analysis"], ["📊", "Instant Results"]].map(([icon, label]) => (
                <div key={label} style={{ textAlign: "center" }}><div style={{ fontSize: "1.4rem" }}>{icon}</div><div style={{ fontSize: "0.78rem", color: "#94aac8" }}>{label}</div></div>
              ))}
            </div>
            <button onClick={() => setPhase("quiz")} style={{ ...S.btnPrimary, margin: "0 auto" }}>🚀 Start Assessment</button>
          </div>
        )}

        {phase === "quiz" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#94aac8", marginBottom: "0.5rem" }}>
              <span>Question {idx + 1} of {QUIZ_QUESTIONS.length}</span>
              <span style={{ color: "#06b6d4" }}>{q.domain}</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,.07)", borderRadius: 3, marginBottom: "1.5rem" }}>
              <div style={{ height: "100%", width: `${((idx + 1) / QUIZ_QUESTIONS.length) * 100}%`, background: "linear-gradient(90deg,#3b82f6,#06b6d4)", borderRadius: 3, transition: "width .5s ease" }} />
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem", lineHeight: 1.5 }}>{q.q}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {q.opts.map((opt, i) => (
                <div key={i} onClick={() => selectOpt(opt)} style={{ background: "rgba(59,130,246,.07)", border: "1px solid rgba(56,165,255,.15)", borderRadius: 10, padding: "0.75rem 1rem", cursor: "pointer", fontSize: "0.88rem", transition: "all .2s" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "rgba(59,130,246,.14)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(56,165,255,.15)"; e.currentTarget.style.background = "rgba(59,130,246,.07)"; }}>
                  {opt}
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "result" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎉</div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.3rem", marginBottom: "0.5rem" }}>Analysis Complete!</h3>
            <AIResult text={result} loading={loading} />
            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", marginTop: "1.2rem", flexWrap: "wrap" }}>
              <button onClick={reset} style={S.btnSm}>🔄 Retake Test</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mentor Chat ──
function ToolMentor({ user }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: `Namaste ${user.name.split(" ")[0]}! 🙏 Main aapka AI Career Mentor hoon. Career guidance, skill roadmaps, internship tips — kuch bhi poochho Hindi ya English mein!\n\nMujhe batao — aap kis career mein jaana chahte ho?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const winRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => { if (winRef.current) winRef.current.scrollTop = winRef.current.scrollHeight; }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const userMsg = { role: "user", text: msg };
    setMessages(m => [...m, userMsg]);
    historyRef.current = [...historyRef.current, { role: "user", content: msg }];
    setLoading(true);
    const typingMsg = { role: "ai", text: "⏳ Thinking...", id: "typing" };
    setMessages(m => [...m, typingMsg]);
    try {
      const reply = await callAI(historyRef.current, `You are SkillBridge MP's AI Career Mentor for students in Madhya Pradesh, India. Be warm, practical, encouraging. Mix Hindi naturally. Give specific advice for Indian job market — real companies, courses, INR salaries. Keep responses helpful and concise. Use emojis.`);
      historyRef.current = [...historyRef.current, { role: "assistant", content: reply }];
      setMessages(m => [...m.filter(x => x.id !== "typing"), { role: "ai", text: reply }]);
    } catch {
      setMessages(m => [...m.filter(x => x.id !== "typing"), { role: "ai", text: "❌ Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.4rem" }}>💬 AI Career Mentor</div>
      <div style={{ color: "#94aac8", fontSize: "0.9rem", marginBottom: "1.8rem" }}>Ask anything about careers, skills, or industry trends — 24/7 AI guidance</div>
      <div style={S.card}>
        <div ref={winRef} style={{ background: "rgba(3,9,18,.7)", border: "1px solid rgba(56,165,255,.13)", borderRadius: 14, height: 380, overflowY: "auto", padding: "1.2rem", marginBottom: "0.8rem" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: "0.7rem", marginBottom: "0.9rem", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.role === "ai" ? "rgba(59,130,246,.2)" : "rgba(139,92,246,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0, marginTop: 2 }}>{m.role === "ai" ? "🤖" : "👩"}</div>
              <div style={{ maxWidth: "78%", padding: "0.75rem 1rem", borderRadius: 12, fontSize: "0.88rem", lineHeight: 1.65, whiteSpace: "pre-wrap", background: m.role === "ai" ? "rgba(59,130,246,.1)" : "linear-gradient(135deg,#3b82f6,#06b6d4)", border: m.role === "ai" ? "1px solid rgba(59,130,246,.18)" : "none", color: m.role === "user" ? "#fff" : "#e8f0fe" }}>{m.text}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.7rem" }}>
          <input style={{ ...S.input, borderRadius: 10 }} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && send()} placeholder="e.g. Data Scientist kaise bane? / Best skills for 2025?" disabled={loading} />
          <button onClick={() => send()} disabled={loading} style={{ ...S.btnPrimary, padding: "0.7rem 1.2rem", flexShrink: 0 }}>{loading ? <Loader /> : "➤"}</button>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["Data Science career path?", "Best skills for 2025?", "How to find internship?", "Python ya Java seekhun?"].map(s => (
            <button key={s} onClick={() => send(s)} disabled={loading} style={{ background: "rgba(59,130,246,.08)", border: "1px solid rgba(56,165,255,.15)", color: "#94aac8", padding: "0.3rem 0.8rem", borderRadius: 6, fontSize: "0.76rem", cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Roadmap ──
function ToolRoadmap({ showNotif }) {
  const [form, setForm] = useState({ career: "Data Scientist", level: "Complete Beginner", duration: "6 months", time: "2–4 hours/day", skills: "Python basics, Excel" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true); setResult("");
    try {
      const text = await callAI([{ role: "user", content: `Create a detailed personalized skill development roadmap for:\n- Target Career: ${form.career}\n- Current Level: ${form.level}\n- Duration: ${form.duration}\n- Daily Study Time: ${form.time}\n- Current Skills: ${form.skills}\n- Location: Madhya Pradesh, India\n\nProvide month-by-month roadmap with:\n📅 Each month/phase with specific topics\n📚 Specific free courses (NPTEL, YouTube, Coursera free)\n🛠️ Projects to build each phase\n🏆 Milestone checkpoints\n💡 Indian job market tips\n🎯 Final outcome & job readiness\n\nFormat with headers and bullets. Be practical and motivating!` }]);
      setResult(text);
      showNotif("✅ Roadmap generated for " + form.career);
    } catch { setResult("❌ Error. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.4rem" }}>🗺️ AI Skill Roadmap Generator</div>
      <div style={{ color: "#94aac8", fontSize: "0.9rem", marginBottom: "1.8rem" }}>Get a personalized 6–12 month learning plan tailored to your career goal</div>
      <div style={S.card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[["career", "Target Career", ["Data Scientist", "AI / ML Engineer", "Full Stack Developer", "Cybersecurity Analyst", "Product Manager", "Cloud Architect", "UX/UI Designer"]],
            ["level", "Current Level", ["Complete Beginner", "Basic Knowledge", "Intermediate", "Advanced"]],
            ["duration", "Duration", ["3 months", "6 months", "9 months", "12 months"]],
            ["time", "Daily Study Time", ["1–2 hours/day", "2–4 hours/day", "4–6 hours/day"]]
          ].map(([key, label, opts]) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <label style={S.label}>{label}</label>
              <select style={S.select} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={S.label}>Current Skills (comma separated)</label>
          <input style={S.input} value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="e.g. Python basics, Excel, HTML" />
        </div>
        <button onClick={generate} disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }}>
          {loading ? <><Loader /> Generating...</> : "🗺️ Generate My Roadmap"}
        </button>
        <AIResult text={result} loading={loading} />
      </div>
    </div>
  );
}

// ── Gap Analyzer ──
function ToolGap() {
  const [role, setRole] = useState("Data Scientist at TCS/Infosys");
  const [resume, setResume] = useState("B.Tech CSE final year student. Skills: Python (basics), HTML, CSS, JavaScript (beginner), MS Excel, Communication skills. Projects: Simple calculator app, college website. Certifications: None.");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true); setResult("");
    try {
      const text = await callAI([{ role: "user", content: `Analyze skill gaps for Indian student targeting: "${role}"\n\nCurrent profile:\n${resume}\n\nProvide:\n❌ MISSING CRITICAL SKILLS (ranked by importance)\n⚠️ SKILLS THAT NEED IMPROVEMENT\n✅ EXISTING STRENGTHS\n📋 TOP 5 SKILLS TO LEARN IMMEDIATELY (with free resources)\n📊 READINESS SCORE: X/100\n⏱️ TIME TO JOB-READY: X months\n🎯 ACTION PLAN: Next 30 days steps\n\nBe honest but encouraging for Indian job market.` }]);
      setResult(text);
    } catch { setResult("❌ Error. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.4rem" }}>📋 Skill Gap Analyzer</div>
      <div style={{ color: "#94aac8", fontSize: "0.9rem", marginBottom: "1.8rem" }}>Paste your resume — AI detects what's missing for your target role</div>
      <div style={S.card}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={S.label}>Target Job Role</label>
          <select style={S.select} value={role} onChange={e => setRole(e.target.value)}>
            {["Data Scientist at TCS/Infosys", "AI Engineer at Startup", "Full Stack Developer", "Cybersecurity Analyst", "Product Manager", "Cloud Engineer (AWS/Azure)"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={S.label}>Your Current Skills / Resume Summary</label>
          <textarea style={S.textarea} rows={5} value={resume} onChange={e => setResume(e.target.value)} />
        </div>
        <button onClick={analyze} disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }}>
          {loading ? <><Loader /> Analyzing...</> : "🔍 Analyze My Skill Gaps"}
        </button>
        <AIResult text={result} loading={loading} />
      </div>
    </div>
  );
}

// ── Resume Builder ──
function ToolResume({ user, showNotif }) {
  const [form, setForm] = useState({
    name: user.name, role: "Data Scientist", college: `${user.college}, ${user.course}`,
    email: user.email,
    skills: "Python, Machine Learning, SQL, Data Analysis, Pandas, NumPy, TensorFlow, Communication",
    projects: "1. Customer Churn Prediction - ML model with 92% accuracy using Random Forest\n2. E-commerce Sales Dashboard - Built interactive analytics using Python & Plotly\n3. NLP Sentiment Analyzer - Twitter sentiment analysis with 85% accuracy",
    exp: "Data Science Intern - XYZ Tech Bhopal (June–Aug 2024): Built ML pipelines, reduced data processing time by 40%"
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const build = async () => {
    setLoading(true); setResult("");
    try {
      const text = await callAI([{ role: "user", content: `Generate a professional ATS-optimized resume:\nName: ${form.name}\nTarget Role: ${form.role}\nEducation: ${form.college}\nEmail: ${form.email}\nSkills: ${form.skills}\nProjects: ${form.projects}\nExperience: ${form.exp}\n\nCreate a clean resume with:\n- Strong action verbs\n- Quantified achievements\n- ATS-optimized for ${form.role} in India\n- Professional summary\n- Standard format: Summary, Education, Skills, Projects, Experience\n\nFormat as a real professional resume in plain text.` }]);
      setResult(text);
      showNotif("✅ Resume generated successfully!");
    } catch { setResult("❌ Error. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.4rem" }}>📄 AI Resume Builder</div>
      <div style={{ color: "#94aac8", fontSize: "0.9rem", marginBottom: "1.8rem" }}>Fill in your details — AI generates a professional, ATS-optimized resume</div>
      <div style={S.card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          {[["name", "Full Name"], ["role", "Target Role"], ["college", "College & Course"], ["email", "Email"]].map(([k, l]) => (
            <div key={k}>
              <label style={S.label}>{l}</label>
              <input style={S.input} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={S.label}>Skills (comma separated)</label>
          <input style={S.input} value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={S.label}>Projects</label>
          <textarea style={S.textarea} rows={3} value={form.projects} onChange={e => setForm(f => ({ ...f, projects: e.target.value }))} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={S.label}>Experience</label>
          <textarea style={S.textarea} rows={2} value={form.exp} onChange={e => setForm(f => ({ ...f, exp: e.target.value }))} />
        </div>
        <button onClick={build} disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }}>
          {loading ? <><Loader /> Generating Resume...</> : "📄 Generate ATS Resume"}
        </button>
        <AIResult text={result} loading={loading} />
      </div>
    </div>
  );
}

// ── Mock Interview ──
function ToolInterview() {
  const [phase, setPhase] = useState("setup");
  const [type, setType] = useState("Data Science Technical");
  const [level, setLevel] = useState("Fresher (0–1 year)");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [qNum, setQNum] = useState(1);

  const startInterview = async () => {
    setPhase("question");
    setLoading(true);
    try {
      const q = await callAI([{ role: "user", content: `You are interviewing a ${level} candidate for ${type} role at an Indian tech company. Ask ONE specific interview question. Only the question — no intro, no explanation. Make it realistic for companies like TCS, Infosys, or top startups. This is question 1 of 5.` }]);
      setQuestion(q);
    } catch { setQuestion("❌ Error loading question. Please try again."); }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true); setFeedback("");
    try {
      const fb = await callAI([{ role: "user", content: `Interview Question: ${question}\n\nCandidate Answer: ${answer}\n\nEvaluate for Indian fresher. Provide:\n📊 SCORES (out of 10):\n- Technical Accuracy: X/10\n- Communication: X/10\n- Confidence: X/10\n- Overall: X/10\n✅ WHAT YOU DID WELL\n❌ NEEDS IMPROVEMENT\n💡 BETTER ANSWER WOULD INCLUDE\n🎯 PRO TIP for Indian Tech Interviews\n\nBe constructive and encouraging.` }]);
      setFeedback(fb);
      setPhase("feedback");
    } catch { setFeedback("❌ Error. Please try again."); }
    setLoading(false);
  };

  const nextQuestion = async () => {
    if (qNum >= 5) { setPhase("done"); return; }
    setPhase("question"); setAnswer(""); setFeedback(""); setLoading(true);
    const newQ = qNum + 1; setQNum(newQ);
    try {
      const q = await callAI([{ role: "user", content: `You are interviewing a ${level} candidate for ${type}. Ask ONE interview question. Only the question. Question ${newQ} of 5.` }]);
      setQuestion(q);
    } catch { setQuestion("❌ Error. Please try again."); }
    setLoading(false);
  };

  const reset = () => { setPhase("setup"); setQuestion(""); setAnswer(""); setFeedback(""); setQNum(1); };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.4rem" }}>🎤 AI Mock Interview</div>
      <div style={{ color: "#94aac8", fontSize: "0.9rem", marginBottom: "1.8rem" }}>Practice real interview questions with AI feedback on technical accuracy & communication</div>
      <div style={S.card}>
        {phase === "setup" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.2rem" }}>
              <div>
                <label style={S.label}>Interview Type</label>
                <select style={S.select} value={type} onChange={e => setType(e.target.value)}>
                  {["Data Science Technical", "Software Engineering", "HR / Behavioral", "Product Management", "Machine Learning"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Difficulty Level</label>
                <select style={S.select} value={level} onChange={e => setLevel(e.target.value)}>
                  {["Fresher (0–1 year)", "Junior (1–3 years)", "Mid-level (3–5 years)"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <button onClick={startInterview} style={S.btnPrimary}>🎤 Start Mock Interview</button>
          </div>
        )}

        {(phase === "question" || phase === "feedback") && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ color: "#94aac8", fontSize: "0.82rem" }}>Question {qNum} of 5</span>
              <div style={{ height: 6, width: 200, background: "rgba(255,255,255,.07)", borderRadius: 3 }}><div style={{ height: "100%", width: `${(qNum / 5) * 100}%`, background: "linear-gradient(90deg,#3b82f6,#06b6d4)", borderRadius: 3 }} /></div>
            </div>
            <div style={{ background: "rgba(3,9,18,.8)", border: "1px solid rgba(56,165,255,.13)", borderRadius: 14, padding: "1.4rem", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#06b6d4", marginBottom: "0.5rem" }}>Interviewer:</div>
              {loading && !question ? <span style={{ color: "#94aac8", display: "flex", alignItems: "center", gap: 8 }}><Loader /> Loading question...</span> : <div style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>{question}</div>}
            </div>
            {phase === "question" && (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={S.label}>Your Answer</label>
                  <textarea style={S.textarea} rows={5} value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type your answer as if you're speaking to the interviewer..." />
                </div>
                <button onClick={submitAnswer} disabled={loading || !answer.trim()} style={{ ...S.btnPrimary, opacity: loading || !answer.trim() ? 0.6 : 1 }}>
                  {loading ? <><Loader /> Getting Feedback...</> : "✅ Submit & Get Feedback"}
                </button>
              </>
            )}
            {phase === "feedback" && (
              <>
                <AIResult text={feedback} loading={false} />
                <div style={{ display: "flex", gap: "0.8rem", marginTop: "1rem", flexWrap: "wrap" }}>
                  <button onClick={nextQuestion} style={S.btnSm}>{qNum >= 5 ? "🏁 Finish Session" : "➡ Next Question"}</button>
                  <button onClick={reset} style={{ ...S.btnGhost, fontSize: "0.8rem" }}>End Session</button>
                </div>
              </>
            )}
          </div>
        )}

        {phase === "done" && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.8rem" }}>Interview Session Complete!</h3>
            <p style={{ color: "#94aac8", marginBottom: "1.5rem" }}>Excellent practice! You answered 5 questions. Keep practicing daily to ace your interviews!</p>
            <button onClick={reset} style={{ ...S.btnPrimary, margin: "0 auto" }}>🔄 Start New Session</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Internships ──
function ToolInternships({ showNotif }) {
  const [skill, setSkill] = useState("Python, Data Science, Machine Learning");
  const [loc, setLoc] = useState("Bhopal");
  const [list, setList] = useState([
    { co: "TCS", role: "Data Science Intern", loc: "Bhopal / Remote", sal: "₹15,000/mo", match: "94%", tag: "Hot", desc: "Work on real ML projects with senior data scientists" },
    { co: "Infosys", role: "ML Engineer Intern", loc: "Indore / Remote", sal: "₹20,000/mo", match: "89%", tag: "New", desc: "Build and deploy machine learning models at scale" },
    { co: "Wipro", role: "Python Dev Intern", loc: "Bhopal", sal: "₹12,000/mo", match: "85%", tag: "", desc: "Python development for enterprise software projects" },
    { co: "Juspay (Startup)", role: "Data Analyst Intern", loc: "Remote", sal: "₹18,000/mo", match: "91%", tag: "Hot", desc: "Analyze payment data and build business insights dashboards" },
    { co: "MP Govt Digital", role: "AI Research Intern", loc: "Bhopal", sal: "₹10,000/mo", match: "82%", tag: "Govt", desc: "AI initiatives for Madhya Pradesh government digital transformation" },
  ]);
  const [loading, setLoading] = useState(false);

  const findInternships = async () => {
    setLoading(true);
    try {
      const text = await callAI([{ role: "user", content: `Generate 6 realistic internship listings for a student in ${loc}, Madhya Pradesh with skills: ${skill}.\n\nFor each use EXACTLY this format:\nCOMPANY: [name]\nROLE: [role]\nLOCATION: [city/remote]\nSTIPEND: [INR/month]\nMATCH: [XX%]\nTAG: [Hot/New/Govt/Remote or blank]\nDESC: [2-line description]\n---\n\nUse real Indian companies (TCS, Infosys, Wipro, startups, govt). Realistic stipends.` }]);
      const blocks = text.split("---").filter(b => b.trim());
      const parsed = blocks.map(b => {
        const get = (key) => { const m = b.match(new RegExp(key + ":\\s*(.+)")); return m ? m[1].trim() : ""; };
        return { co: get("COMPANY"), role: get("ROLE"), loc: get("LOCATION"), sal: get("STIPEND"), match: get("MATCH"), tag: get("TAG"), desc: get("DESC") };
      }).filter(i => i.co && i.role);
      if (parsed.length > 0) setList(parsed);
    } catch { }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.4rem" }}>🏢 Internship Marketplace</div>
      <div style={{ color: "#94aac8", fontSize: "0.9rem", marginBottom: "1.8rem" }}>AI-matched internships from 300+ companies across Madhya Pradesh & India</div>
      <div style={{ ...S.card, marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={S.label}>Your Skills / Interest</label>
            <input style={S.input} value={skill} onChange={e => setSkill(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Location</label>
            <select style={{ ...S.select, minWidth: 130 }} value={loc} onChange={e => setLoc(e.target.value)}>
              {["Bhopal", "Indore", "Remote", "Any MP City", "Pan India"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <button onClick={findInternships} disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }}>
            {loading ? <><Loader /> Searching...</> : "🔍 Find Matches"}
          </button>
        </div>
      </div>
      {list.map((item, i) => (
        <div key={i} style={{ ...S.card, marginBottom: "0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .3s" }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(56,165,255,.28)"; e.currentTarget.style.transform = "translateX(4px)"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(56,165,255,.15)"; e.currentTarget.style.transform = ""; }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#06b6d4", fontWeight: 600, marginBottom: 3 }}>
              {item.co} {item.tag && <span style={{ background: "rgba(239,68,68,.15)", color: "#ef4444", borderRadius: 4, padding: "1px 6px", fontSize: "0.7rem", marginLeft: "0.3rem" }}>{item.tag}</span>}
            </div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>{item.role}</div>
            <div style={{ color: "#94aac8", fontSize: "0.8rem" }}>📍 {item.loc} · 💰 {item.sal} · 🎯 {item.match} match</div>
            {item.desc && <div style={{ color: "#94aac8", fontSize: "0.78rem", marginTop: 3 }}>{item.desc}</div>}
          </div>
          <button onClick={() => showNotif(`✅ Application sent to ${item.co}!`)} style={{ ...S.btnSm, flexShrink: 0, marginLeft: "1rem" }}>Apply Now</button>
        </div>
      ))}
    </div>
  );
}

// ── Trends ──
function ToolTrends() {
  const [query, setQuery] = useState("What skills are most in-demand for freshers in India 2025?");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true); setResult("");
    try {
      const text = await callAI([{ role: "user", content: `${query}\n\nProvide detailed analysis for students in India, especially Madhya Pradesh. Include: specific data, trends, salary ranges, top companies hiring, actionable advice. Use clear formatting with emojis.` }]);
      setResult(text);
    } catch { setResult("❌ Error. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.4rem" }}>📈 Industry Demand Tracker</div>
      <div style={{ color: "#94aac8", fontSize: "0.9rem", marginBottom: "1.8rem" }}>Live skill demand from 50,000+ job listings across India — updated daily</div>
      <div style={{ ...S.card, marginBottom: "1.2rem" }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "#94aac8", textTransform: "uppercase", marginBottom: "1rem" }}>🔥 Trending Skills Right Now</div>
        {TRENDS.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.8rem" }}>
            <div style={{ width: 140, fontSize: "0.85rem" }}>{t.n}</div>
            <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,.07)", borderRadius: 4 }}>
              <div style={{ height: "100%", width: `${t.pct}%`, background: t.col, borderRadius: 4, transition: "width 1.5s ease" }} />
            </div>
            <div style={{ width: 55, textAlign: "right", fontSize: "0.8rem", color: "#06b6d4", fontWeight: 600 }}>
              {t.pct}% <span style={{ color: t.arrow.includes("↑") ? "#22c55e" : t.arrow === "↓" ? "#ef4444" : "#f59e0b" }}>{t.arrow}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={S.label}>Get AI Analysis for a specific skill or industry</label>
          <input style={S.input} value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. How is demand for Python developers in 2025?" />
        </div>
        <button onClick={analyze} disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }}>
          {loading ? <><Loader /> Analyzing Trends...</> : "📊 Get AI Trend Analysis"}
        </button>
        <AIResult text={result} loading={loading} />
      </div>
    </div>
  );
}

// ── Career Explorer ──
function ToolCareers() {
  const [career, setCareer] = useState("Data Scientist");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const explore = async (name) => {
    const c = name || career;
    setCareer(c); setLoading(true); setResult("");
    try {
      const text = await callAI([{ role: "user", content: `Comprehensive career guide for: "${c}"\n\nFor Indian student from Madhya Pradesh:\n🎯 WHAT THIS ROLE DOES (day-to-day)\n💰 SALARY IN INDIA (fresher → senior → lead)\n🛠️ REQUIRED SKILLS (must-have + good-to-have)\n📚 LEARNING PATH (step by step, 0 to job-ready)\n🏢 TOP COMPANIES HIRING IN INDIA (with packages)\n📈 JOB MARKET OUTLOOK (demand, growth)\n⏱️ TIME TO LAND FIRST JOB from scratch\n🎓 BEST CERTIFICATIONS (free + paid)\n💡 INSIDER TIPS for Indian students\n\nBe detailed, realistic, and encouraging!` }]);
      setResult(text);
    } catch { setResult("❌ Error. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.4rem" }}>🔭 Career Path Explorer</div>
      <div style={{ color: "#94aac8", fontSize: "0.9rem", marginBottom: "1.8rem" }}>Explore any career in depth — skills, salary, roadmap, top companies</div>
      <div style={S.card}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={S.label}>Which career do you want to explore?</label>
          <input style={S.input} value={career} onChange={e => setCareer(e.target.value)} placeholder="e.g. Data Scientist, AI Engineer, Cybersecurity Analyst..." onKeyDown={e => e.key === "Enter" && explore()} />
        </div>
        <button onClick={() => explore()} disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }}>
          {loading ? <><Loader /> Exploring...</> : "🔭 Explore This Career"}
        </button>
        <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", marginTop: "1rem" }}>
          {["Data Scientist", "AI Engineer", "Cybersecurity", "Product Manager", "Full Stack Dev", "Cloud Architect", "UX Designer", "DevOps Engineer"].map(c => (
            <button key={c} onClick={() => explore(c)} style={{ background: "rgba(8,15,30,.85)", border: "1px solid rgba(56,165,255,.15)", color: "#94aac8", padding: "0.5rem 0.8rem", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem", transition: "all .2s" }}
              onMouseOver={e => { e.currentTarget.style.borderColor = "#06b6d4"; e.currentTarget.style.color = "#e8f0fe"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(56,165,255,.15)"; e.currentTarget.style.color = "#94aac8"; }}>
              {c}
            </button>
          ))}
        </div>
        <AIResult text={result} loading={loading} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => setUser(null);

  if (!user) return <LoginPage onLogin={handleLogin} />;
  if (user.role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} />;
  return <StudentDashboard user={user} onLogout={handleLogout} />;
}
