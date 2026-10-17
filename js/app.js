/* NES DET Coach — UI (vanilla JS, hash routing, localStorage) */
(function () {
  const P = window.DETPlanner, Q = window.DETQuestions, U = P.util;
  const KEY = "nes-det-coach.v1";
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const today = () => U.iso(Date.now());
  const uid = p => p + Math.random().toString(36).slice(2, 9);
  const TYPE_KEYS = Object.keys(P.TYPES);
  const TOPICS = { sports: "スポーツ", education: "教育・留学", daily: "日常", travel: "旅行", health: "健康", society: "社会", science: "科学", environment: "環境", technology: "テクノロジー" };
  const WD = ["日", "月", "火", "水", "木", "金", "土"];

  // ---------- state ----------
  let S;
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; } if (!S || !S.students) { S = window.DET_SEED(); save(); } }
  function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
  const D = id => (S.data[id] = S.data[id] || { logs: [], mocks: [], lessons: [], practice: [], taskChecks: {}, weekNotes: {} });
  const isInst = () => S.settings.role === "instructor";
  let currentId = null;
  const cur = () => S.students.find(s => s.id === (isInst() ? currentId : S.settings.deviceStudentId)) || S.students[0];
  const planOf = s => P.generatePlan(s);

  function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (el.hidden = true), 2200); }
  function modal(html, onMount) { $("#modalCard").innerHTML = html; $("#modal").hidden = false; onMount && onMount($("#modalCard")); }
  function closeModal() { $("#modal").hidden = true; }
  $("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });

  // ---------- role ----------
  function setRole(r) {
    if (r === "instructor" && !isInst()) {
      modal(`<h2>講師モード</h2><p class="muted small">講師用PINを入力してください（初期値は README を参照）。</p><input id="pin" type="password" inputmode="numeric" autocomplete="off" placeholder="PIN"><div class="row mt"><button class="btn primary" id="ok">入る</button><button class="btn" id="cancel">キャンセル</button></div>`, el => {
        $("#pin", el).focus();
        const go = () => { if ($("#pin", el).value === S.settings.pin) { S.settings.role = "instructor"; save(); closeModal(); location.hash = "#/students"; window.__NES.render(); } else toast("PINが違います"); };
        $("#ok", el).onclick = go; $("#pin", el).onkeydown = e => e.key === "Enter" && go(); $("#cancel", el).onclick = closeModal;
      });
      return;
    }
    if (r === "student") { S.settings.role = "student"; save(); location.hash = "#/home"; window.__NES.render(); }
  }
  $$(".role-toggle button").forEach(b => (b.onclick = () => setRole(b.dataset.role)));

  // ---------- chart ----------
  function chart(s, plan, mocks) {
    const W = 640, H = 240, pl = 36, pr = 12, pt = 14, pb = 28;
    const t0 = U.parse(s.startDate).getTime() - 30 * U.DAY, t1 = U.parse(plan.weeks[plan.weeks.length - 1].end).getTime();
    const ms = mocks.slice().sort((a, b) => a.date.localeCompare(b.date)); const vals = ms.flatMap(m => [m.low, m.high, m.score].filter(v => v != null && v !== "").map(Number));
    const lo = Math.max(10, Math.floor((Math.min(+s.currentScore, ...vals) - 10) / 10) * 10), hi = Math.min(160, Math.ceil((Math.max(plan.feasibility.target, s.stretchScore || 0, ...vals) + 10) / 10) * 10);
    const x = t => pl + (W - pl - pr) * (t - t0) / (t1 - t0), y = v => pt + (H - pt - pb) * (1 - (v - lo) / (hi - lo));
    let g = "";
    for (let v = lo; v <= hi; v += 10) g += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="#eef0f4"/><text x="${pl - 6}" y="${y(v) + 4}" font-size="10" text-anchor="end" fill="#8a93a5">${v}</text>`;
    const d = new Date(t0); d.setDate(1); d.setMonth(d.getMonth() + 1);
    while (d.getTime() <= t1) { g += `<text x="${x(d.getTime())}" y="${H - 8}" font-size="10" text-anchor="middle" fill="#8a93a5">${d.getMonth() + 1}月</text>`; d.setMonth(d.getMonth() + 1); }
    plan.phases.forEach(ph => { g += `<rect x="${x(U.parse(ph.from).getTime())}" y="${H - pb}" width="${x(U.parse(ph.to).getTime() + U.DAY) - x(U.parse(ph.from).getTime())}" height="4" fill="var(--p${ph.n})"/>`; });
    g += `<line x1="${pl}" x2="${W - pr}" y1="${y(plan.feasibility.target)}" y2="${y(plan.feasibility.target)}" stroke="#1f9d6b" stroke-dasharray="5 4"/><text x="${W - pr}" y="${y(plan.feasibility.target) - 4}" font-size="10" text-anchor="end" fill="#1f9d6b">目標 ${plan.feasibility.target}</text>`;
    if (s.minimumScore) g += `<line x1="${pl}" x2="${W - pr}" y1="${y(s.minimumScore)}" y2="${y(s.minimumScore)}" stroke="#c98a06" stroke-dasharray="2 4"/><text x="${W - pr}" y="${y(s.minimumScore) - 4}" font-size="10" text-anchor="end" fill="#c98a06">最低ライン ${s.minimumScore}</text>`;
    const cp = [[U.parse(s.startDate).getTime(), +s.currentScore], ...plan.weeks.filter(w => w.mock).map(w => [U.parse(w.end).getTime(), w.mock.expected])];
    g += `<polyline fill="none" stroke="#9aa6c2" stroke-dasharray="4 4" points="${cp.map(([t, v]) => x(t) + "," + y(v)).join(" ")}"/>` + cp.slice(1).map(([t, v]) => `<circle cx="${x(t)}" cy="${y(v)}" r="3" fill="#fff" stroke="#9aa6c2"/>`).join("");
    const pts = ms.map(m => [U.parse(m.date).getTime(), P.mockScore(m), m]);
    if (pts.length > 1) g += `<polyline fill="none" stroke="#2f5bea" stroke-width="2.5" points="${pts.map(([t, v]) => x(t) + "," + y(v)).join(" ")}"/>`;
    pts.forEach(([t, v, m]) => { if (m.low != null && m.high != null && m.low !== "" && (m.score == null || m.score === "")) g += `<line x1="${x(t)}" x2="${x(t)}" y1="${y(+m.low)}" y2="${y(+m.high)}" stroke="#2f5bea" stroke-width="6" stroke-opacity=".18" stroke-linecap="round"/>`;
      g += m.kind === "official" ? `<rect x="${x(t) - 5}" y="${y(v) - 5}" width="10" height="10" fill="#2f5bea"/>` : `<circle cx="${x(t)}" cy="${y(v)}" r="5" fill="#fff" stroke="#2f5bea" stroke-width="2.5"/>`;
      g += `<text x="${x(t)}" y="${y(v) - 9}" font-size="10" text-anchor="middle" fill="#2f5bea">${v}</text>`; });
    const tx = x(Date.now()); if (tx > pl && tx < W - pr) g += `<line x1="${tx}" x2="${tx}" y1="${pt}" y2="${H - pb}" stroke="#d4473b" stroke-opacity=".35"/><text x="${tx + 3}" y="${pt + 8}" font-size="10" fill="#d4473b">今日</text>`;
    return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="スコア推移">${g}</svg><div class="legend mt"><span><i style="background:#2f5bea"></i>■本番 ●練習テスト（範囲は薄い帯）</span><span><i style="background:#9aa6c2"></i>チェックポイントの目安（NES内の目標設定・予測ではない）</span><span><i style="background:#1f9d6b"></i>目標</span></div></div>`;
  }

  // ---------- small components ----------
  const statusBadge = st => `<span class="badge ${st.level === "none" ? "" : st.level}">${esc(st.label)}</span>`;
  const phaseBadge = n => `<span class="badge p${n}">フェーズ${n}：${esc(P.PHASES[n - 1].name)}</span>`;
  function daysLeft(s) { if (!s.deadline) return null; return Math.ceil((U.parse(s.deadline) - U.parse(today())) / U.DAY); }
  function nextLessonDate(s) { if (!s.lessonDay) return null; const wd = WD.indexOf(s.lessonDay); if (wd < 0) return null; let d = U.parse(today()); for (let i = 0; i < 8; i++) { if (d.getDay() === wd) return U.iso(d); d = new Date(d.getTime() + U.DAY); } }
  function todayTasks(s, plan) {
    const w = P.weekOf(plan, today()) || plan.weeks[0]; const ph = plan.phases.find(p => p.n === w.phase);
    const list = ph.daily.map(t => ({ ...t, label: t.id === "format" ? `今週の形式の演習：${w.typesJa}` : t.label }));
    list.push({ id: "hw", label: `今週の宿題：${w.hw}`, min: null });
    return { w, list };
  }
  const views = {};
  window.__NES = { get S() { return S; }, D, cur, planOf, views, $, $$, esc, today, uid, TYPE_KEYS, TOPICS, WD, chart, statusBadge, phaseBadge, daysLeft, nextLessonDate, todayTasks, toast, modal, closeModal, save, load, KEY, isInst, setCurrent: id => (currentId = id), getCurrent: () => currentId, setS: v => (S = v) };
})();
