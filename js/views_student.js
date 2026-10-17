/* Student-facing views: home, plan, log */
(function () {
  const N = window.__NES, P = window.DETPlanner, U = P.util;
  const { views, $, $$, esc, today, uid, WD, chart, statusBadge, phaseBadge, daysLeft, nextLessonDate, todayTasks, toast, D, cur, planOf, save, isInst } = N;
  const render = () => N.render();

  views.home = () => {
    const s = cur(); if (!s) return `<div class="card empty">生徒が登録されていません。</div>`;
    const plan = planOf(s), d = D(s.id), st = P.status(s, plan, d, today()); const { w, list } = todayTasks(s, plan);
    const checks = d.taskChecks[today()] || []; const left = daysLeft(s); const nl = nextLessonDate(s);
    const nextTest = plan.tests.find(t => t >= today()); const wkLogs = d.logs.filter(l => l.date >= U.addDays(today(), -6));
    const wkMin = wkLogs.reduce((a, l) => a + (+l.minutes || 0), 0);
    return `
    <div class="row between"><div><h1>${esc(s.name)}さんのホーム</h1><p class="muted small mb0">${U.md(today())}（${WD[U.parse(today()).getDay()]}）・${w.n}週目／全${plan.N}週 ${phaseBadge(w.phase)}</p></div>${statusBadge(st)}</div>
    <div class="grid g4 mt">
      <div class="card kpi"><div class="l">目標スコア</div><div class="v">${plan.feasibility.target}</div><div class="tiny muted">現在 ${esc(s.currentScore)}${s.stretchScore ? `・狙い ${s.stretchScore}` : ""}</div></div>
      <div class="card kpi"><div class="l">締切まで</div><div class="v">${left == null ? "—" : left + "日"}</div><div class="tiny muted">${s.deadline ? U.md(s.deadline) : "未設定"}</div></div>
      <div class="card kpi"><div class="l">直近7日の学習</div><div class="v">${Math.round(wkMin / 6) / 10}<small style="font-size:.9rem">時間</small></div><div class="progress mt"><span style="width:${Math.min(100, Math.round(wkMin / plan.weeklyMinutes * 100))}%"></span></div></div>
      <div class="card kpi"><div class="l">次のレッスン</div><div class="v" style="font-size:1.25rem">${nl ? U.md(nl) + "（" + s.lessonDay + "）" : "—"}</div><div class="tiny muted">${esc(s.lessonTime || "")}</div></div>
    </div>
    <div class="grid g2 mt">
      <div class="card"><div class="row between"><h2 class="mb0">今日のタスク</h2><span class="small muted" id="cnt">${checks.length}/${list.length}</span></div>
        <p class="small muted">今週のフォーカス：<b>${esc(w.focus)}</b></p>
        <div id="tasks">${list.map(t => `<label class="task ${checks.includes(t.id) ? "done" : ""}"><input type="checkbox" data-id="${t.id}" ${checks.includes(t.id) ? "checked" : ""}><span class="t">${esc(t.label)}</span>${t.min ? `<span class="min">${t.min}分</span>` : ""}</label>`).join("")}</div>
        <div class="row mt"><a class="btn primary" href="#/log">学習を記録する</a><a class="btn" href="#/practice">演習する</a></div></div>
      <div class="card"><h2>スコアの推移</h2>${chart(s, plan, d.mocks)}
        <div class="small mt">${st.reasons.map(r => `<div>・${esc(r)}</div>`).join("")}</div>
        ${nextTest ? `<div class="note mt small">本番受験の候補日：<b>${U.md(nextTest)}</b>（30日に2回まで・公式）。日程と回数は講師と相談して確定。</div>` : ""}</div>
    </div>
    ${s.monthFocus ? `<div class="card mt"><h3>レッスンで決めた方針</h3><p class="mb0">${esc(s.monthFocus)}</p></div>` : ""}`;
  };
  views.home.mount = () => { const s = cur(); $$("#tasks input").forEach(cb => (cb.onchange = () => { const d = D(s.id); const a = new Set(d.taskChecks[today()] || []); cb.checked ? a.add(cb.dataset.id) : a.delete(cb.dataset.id); d.taskChecks[today()] = [...a]; save(); cb.closest(".task").classList.toggle("done", cb.checked); $("#cnt").textContent = `${a.size}/${$$("#tasks input").length}`; })); };

  views.plan = () => {
    const s = cur(); const plan = planOf(s), fz = plan.feasibility; const nowW = P.weekOf(plan, today()); const d = D(s.id); const ph = plan.phases;
    const badges = w => `${w.mock ? `<div class="badge info" style="margin-top:6px">公式練習テスト・目安${w.mock.expected}</div>` : ""}${w.tests.map(t => `<div class="badge warn" style="margin-top:6px">本番候補 ${U.md(t)}</div>`).join("")}${d.weekNotes[w.n] ? `<div class="tiny muted mt">講師メモ：${esc(d.weekNotes[w.n])}</div>` : ""}`;
    return `
    <div class="row between"><div><h1>学習プラン</h1><p class="muted small mb0">${esc(s.name)}さん・${U.md(s.startDate)}〜 全${plan.N}週・現在 ${esc(s.currentScore)} → 目標 ${fz.target}</p></div>
      <div class="row no-print"><button class="btn" onclick="print()">印刷</button>${isInst() ? `<a class="btn" href="#/edit/${s.id}">条件を変更</a>` : ""}</div></div>
    <div class="card mt"><div class="row between"><h2 class="mb0">見通し</h2><span class="badge ${fz.level}">${esc(fz.label)}</span></div><div class="mt">${fz.msgs.map(m => `<div class="note ${m.lv === "info" ? "" : m.lv}">${esc(m.t)}</div>`).join("")}</div></div>
    <div class="card"><h2>3つのフェーズ</h2><div class="phasebar">${ph.map(p => `<span class="p${p.n}" style="width:${p.weeks / plan.N * 100}%"></span>`).join("")}</div>
      <div class="grid g3 mt">${ph.map(p => `<div><div>${phaseBadge(p.n)}</div><div class="small mt"><b>${U.md(p.from)}〜${U.md(p.to)}（${p.weeks}週）</b></div><div class="small muted">${esc(p.goal)}</div>
        <div class="tiny mt"><b>毎日の目安（平日${s.weekdayMinutes || 60}分）</b>${p.daily.map(t => `<div>・${esc(t.label)}…${t.min}分</div>`).join("")}</div></div>`).join("")}</div></div>
    <div class="card"><h2>週ごとのロードマップ</h2>
      <div class="tablewrap wk-table"><table><thead><tr><th>週</th><th>フォーカス</th><th>問題形式</th><th>レッスン</th><th>宿題</th><th>チェック</th></tr></thead><tbody>
      ${plan.weeks.map(w => `<tr class="${nowW && nowW.n === w.n ? "now" : ""}"><td><b>${w.n}</b><div class="tiny muted">${w.label}</div><span class="badge p${w.phase}" style="margin-top:4px">P${w.phase}</span></td><td>${esc(w.focus)}</td><td class="small">${esc(w.typesJa)}</td><td class="small">${esc(w.lesson)}</td><td class="small">${esc(w.hw)}</td><td class="small">${esc(w.check)}${badges(w)}</td></tr>`).join("")}
      </tbody></table></div>
      <div class="week-cards">${plan.weeks.map(w => `<div class="card" style="${nowW && nowW.n === w.n ? "border-color:var(--brand)" : ""}"><div class="row between"><b>${w.n}週目 <span class="muted small">${w.label}</span></b><span class="badge p${w.phase}">P${w.phase}</span></div><div class="mt"><b>${esc(w.focus)}</b></div><div class="small muted">${esc(w.typesJa)}</div><div class="small mt">📘 ${esc(w.lesson)}</div><div class="small">📝 ${esc(w.hw)}</div><div class="small">✅ ${esc(w.check)}</div>${badges(w)}</div>`).join("")}</div>
      <p class="tiny muted mt">チェックポイントの点数はNES内の目標設定（現在→目標を直線でつないだ目安）で、予測値ではありません。模試＝DET公式の無料練習テスト（englishtest.duolingo.com/practice）。</p></div>
    <div class="card"><h2>受験と条件</h2><div class="grid g2">
      <div class="small stack"><div><b>本番の受験候補日</b>（${{ max: "30日2回ペースで最大", monthly: "月1回", final: "最後にまとめて" }[s.testPolicy] || "—"}）<br>${plan.tests.map(t => U.md(t)).join("・") || "—"}<br><span class="tiny muted">安全側で16日間隔。正確な回数ルールは受験前に公式ヘルプで確認。</span></div>${s.testPolicyNote ? `<div class="muted">${esc(s.testPolicyNote)}</div>` : ""}</div>
      <div class="small stack">${[["締切", s.deadlineNote], ["目標", s.targetNote], ["学習時間", s.studyTimeNote], ["苦手", s.weakNote], ["単語", s.vocabNote], ["方針", s.monthFocus]].filter(x => x[1]).map(x => `<div><b>${x[0]}</b>：${esc(x[1])}</div>`).join("")}</div></div></div>`;
  };

  views.log = () => {
    const s = cur(); const d = D(s.id); const plan = planOf(s); const { list } = todayTasks(s, plan);
    const logs = d.logs.slice().sort((a, b) => b.date.localeCompare(a.date)); const mocks = d.mocks.slice().sort((a, b) => b.date.localeCompare(a.date));
    const byN = {}; d.logs.filter(l => l.newWords && l.burden).forEach(l => { (byN[l.newWords] = byN[l.newWords] || []).push(+l.burden); });
    const stars = n => `<div class="stars" data-name="${n}">${[1, 2, 3, 4, 5].map(v => `<button type="button" data-v="${v}">${v}</button>`).join("")}</div>`;
    return `
    <h1>学習の記録</h1>
    <div class="grid g2">
      <div class="card"><h2>今日の学習</h2><form id="logForm">
        <div class="grid g2"><div class="field"><label>日付</label><input type="date" name="date" value="${today()}" required></div><div class="field"><label>学習時間（分）</label><input type="number" name="minutes" min="0" step="5" required placeholder="例：90"></div></div>
        <div class="field"><label>やったこと</label><div class="chips">${list.map(t => `<label class="chip"><input type="checkbox" name="tasks" value="${t.id}">${esc(t.label.split("：")[0].replace(/（.*$/, ""))}</label>`).join("")}</div></div>
        <div class="grid g3"><div class="field"><label>新しく覚えた単語数</label><input type="number" name="newWords" min="0" placeholder="例：30"></div><div class="field"><label>単語の範囲（No.）から</label><input type="number" name="wFrom" min="1" placeholder="${s.vocabProgress ? +s.vocabProgress + 1 : ""}"></div><div class="field"><label>まで</label><input type="number" name="wTo" min="1"></div></div>
        <div class="field"><label>単語の負担感（1 楽 〜 5 きつい）</label>${stars("burden")}</div>
        <div class="field"><label>自己評価（1〜5）</label>${stars("rating")}</div>
        <div class="field"><label>メモ（分からなかったこと・質問など）</label><textarea name="note" placeholder="例：50語は夕方の2周目がきつかった"></textarea></div>
        <button class="btn primary">記録する</button></form></div>
      <div class="card"><h2>模試・本番のスコア</h2><form id="mockForm">
        <div class="grid g2"><div class="field"><label>日付</label><input type="date" name="date" value="${today()}" required></div><div class="field"><label>種類</label><select name="kind"><option value="practice">公式練習テスト（無料）</option><option value="official">本番</option></select></div></div>
        <div class="grid g3"><div class="field"><label>総合（本番）</label><input type="number" name="score" step="5" min="10" max="160"></div><div class="field"><label>推定範囲 下限</label><input type="number" name="low" step="5" min="10" max="160"></div><div class="field"><label>上限</label><input type="number" name="high" step="5" min="10" max="160"></div></div>
        <div class="grid g4">${["R", "L", "W", "S"].map(k => `<div class="field"><label>${{ R: "Reading", L: "Listening", W: "Writing", S: "Speaking" }[k]}</label><input type="number" name="sub${k}" step="5" min="10" max="160"></div>`).join("")}</div>
        <div class="field"><label>メモ（時間切れ・止まった形式など）</label><input name="note"></div>
        <button class="btn primary">スコアを追加</button></form>
        <div class="mt">${chart(s, plan, d.mocks)}</div></div>
    </div>
    ${Object.keys(byN).length ? `<div class="card mt"><h2>単語数と負担感</h2><p class="small muted">1日の新出語数ごとの平均負担感（30語と50語の比較用）</p><div class="pill-list">${Object.entries(byN).sort((a, b) => a[0] - b[0]).map(([n, a]) => `<span class="badge info">${n}語/日：負担 ${(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1)}（${a.length}日）</span>`).join("")}</div></div>` : ""}
    <div class="grid g2 mt">
      <div class="card"><h2>記録の履歴</h2>${logs.length ? `<div class="tablewrap"><table><thead><tr><th>日付</th><th>分</th><th>単語</th><th>負担/自己評価</th><th>メモ</th><th></th></tr></thead><tbody>${logs.map(l => `<tr><td>${U.md(l.date)}</td><td>${l.minutes}</td><td>${l.newWords || "—"}${l.wFrom ? `<div class="tiny muted">No.${l.wFrom}–${l.wTo || ""}</div>` : ""}</td><td>${l.burden || "—"} / ${l.rating || "—"}</td><td class="small">${esc(l.note)}${l.feedback ? `<div class="tiny" style="color:var(--brand)">講師：${esc(l.feedback)}</div>` : ""}</td><td><button class="btn ghost sm" data-del-log="${l.id}">削除</button></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">まだ記録がありません</div>`}</div>
      <div class="card"><h2>スコアの履歴</h2>${mocks.length ? `<div class="tablewrap"><table><thead><tr><th>日付</th><th>種類</th><th>スコア</th><th>R/L/W/S</th><th></th></tr></thead><tbody>${mocks.map(m => `<tr><td>${U.md(m.date)}</td><td>${m.kind === "official" ? "本番" : "練習"}</td><td><b>${m.score != null && m.score !== "" ? m.score : `${m.low}–${m.high}`}</b><div class="tiny muted">${esc(m.note || "")}</div></td><td class="small">${["R", "L", "W", "S"].map(k => (m.sub && m.sub[k]) || "—").join(" / ")}</td><td><button class="btn ghost sm" data-del-mock="${m.id}">削除</button></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">まだスコアがありません</div>`}</div>
    </div>`;
  };
  views.log.mount = () => {
    const s = cur(); const d = D(s.id); const vals = {};
    $$(".stars").forEach(g => $$("button", g).forEach(b => (b.onclick = () => { $$("button", g).forEach(x => x.classList.toggle("on", x === b)); vals[g.dataset.name] = +b.dataset.v; })));
    $("#logForm").onsubmit = e => { e.preventDefault(); const f = new FormData(e.target);
      d.logs.push({ id: uid("g"), date: f.get("date"), minutes: +f.get("minutes"), tasks: f.getAll("tasks"), newWords: +f.get("newWords") || null, wFrom: +f.get("wFrom") || null, wTo: +f.get("wTo") || null, burden: vals.burden || null, rating: vals.rating || null, note: f.get("note") });
      const ch = new Set(d.taskChecks[f.get("date")] || []); f.getAll("tasks").forEach(t => ch.add(t)); d.taskChecks[f.get("date")] = [...ch];
      if (+f.get("wTo") && +f.get("wTo") > (+s.vocabProgress || 0)) s.vocabProgress = +f.get("wTo");
      save(); toast("記録しました"); render(); };
    $("#mockForm").onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); const n = k => (f.get(k) === "" ? null : +f.get(k));
      if (n("score") == null && (n("low") == null || n("high") == null)) return toast("総合スコア、または推定範囲（下限・上限）を入力してください");
      d.mocks.push({ id: uid("m"), date: f.get("date"), kind: f.get("kind"), score: n("score"), low: n("low"), high: n("high"), sub: { R: n("subR"), L: n("subL"), W: n("subW"), S: n("subS") }, note: f.get("note") }); save(); toast("スコアを追加しました"); render(); };
    $$("[data-del-log]").forEach(b => (b.onclick = () => { if (confirm("この記録を削除しますか？")) { d.logs = d.logs.filter(l => l.id !== b.dataset.delLog); save(); render(); } }));
    $$("[data-del-mock]").forEach(b => (b.onclick = () => { if (confirm("このスコアを削除しますか？")) { d.mocks = d.mocks.filter(l => l.id !== b.dataset.delMock); save(); render(); } }));
  };
})();
