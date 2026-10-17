/* Instructor views (students list, student detail, profile edit), settings, router */
(function () {
  const N = window.__NES, P = window.DETPlanner, U = P.util;
  const { views, $, $$, esc, today, uid, TYPE_KEYS, TOPICS, WD, chart, statusBadge, toast, D, planOf, save, isInst } = N;
  const render = () => N.render();
  const denied = () => `<div class="card empty">講師モードでのみ表示できます。</div>`;

  views.students = () => {
    if (!isInst()) return denied();
    const rows = N.S.students.map(s => { const plan = planOf(s); const d = D(s.id); const st = P.status(s, plan, d, today()); const w = P.weekOf(plan, today()); const last = d.mocks.slice().sort((a, b) => b.date.localeCompare(a.date))[0]; const lastLog = d.logs.slice().sort((a, b) => b.date.localeCompare(a.date))[0]; const nextCp = plan.weeks.find(x => x.mock && x.end >= today()); return { s, plan, st, w, last, lastLog, nextCp }; });
    return `<div class="row between"><h1>生徒一覧</h1><a class="btn primary" href="#/edit/new">＋ 生徒を登録</a></div>
    <div class="card"><div class="tablewrap"><table><thead><tr><th>生徒</th><th>状態</th><th>週・フェーズ</th><th>現在→目標</th><th>最新スコア</th><th>次のチェック</th><th>最終記録</th><th></th></tr></thead><tbody>
    ${rows.map(r => `<tr><td><a href="#/student/${r.s.id}"><b>${esc(r.s.name)}</b></a><div class="tiny muted">${esc(r.s.grade || "")}</div></td><td>${statusBadge(r.st)}<div class="tiny muted">${r.st.reasons.map(esc).join("<br>")}</div></td><td>${r.w ? `${r.w.n}/${r.plan.N}週` : "開始前"}<div>${r.w ? `<span class="badge p${r.w.phase}">P${r.w.phase}</span>` : ""}</div></td><td>${esc(r.s.currentScore)} → ${r.plan.feasibility.target}<div><span class="badge ${r.plan.feasibility.level}">${r.plan.feasibility.label}</span></div></td>
      <td>${r.last ? `${P.mockScore(r.last)}<div class="tiny muted">${U.md(r.last.date)} ${r.last.kind === "official" ? "本番" : "練習"}</div>` : "—"}</td><td>${r.nextCp ? `${U.md(r.nextCp.end)}<div class="tiny muted">目安${r.nextCp.mock.expected}</div>` : "—"}</td><td>${r.lastLog ? U.md(r.lastLog.date) : "—"}</td><td><a class="btn sm" href="#/student/${r.s.id}">開く</a></td></tr>`).join("")}
    </tbody></table></div><p class="tiny muted mt mb0">状態：最新の模試・本番と、その週のチェックポイント目安の差（−5点以内＝順調、−10点以内＝注意、それ以下＝遅れ）と、直近7日の学習時間（計画の80%以上＝順調、50%以上＝注意）の悪い方で判定。</p></div>`;
  };

  views.student = id => {
    if (!isInst()) return denied(); const s = N.S.students.find(x => x.id === id); if (!s) return `<div class="card empty">生徒が見つかりません</div>`; N.setCurrent(id);
    const plan = planOf(s), d = D(id), st = P.status(s, plan, d, today()); const lessons = d.lessons.slice().sort((a, b) => b.date.localeCompare(a.date));
    const logs = d.logs.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14); const prac = d.practice.slice().reverse().slice(0, 15);
    const rng = d.logs.filter(l => l.wFrom && l.wTo).slice(-7); const lo = rng.length ? Math.min(...rng.map(l => l.wFrom)) : 1; const hi = rng.length ? Math.max(...rng.map(l => l.wTo)) : (+s.vocabProgress || "");
    const nowW = P.weekOf(plan, today());
    return `<div class="row between"><div><a class="small" href="#/students">← 生徒一覧</a><h1>${esc(s.name)} <span class="small muted">${esc(s.grade || "")}</span></h1></div><div class="row"><a class="btn" href="#/plan">プラン</a><a class="btn" href="#/log">記録</a><a class="btn" href="#/edit/${id}">プロフィール編集</a></div></div>
    <div class="grid g2"><div class="card"><div class="row between"><h2 class="mb0">状況</h2>${statusBadge(st)}</div><div class="small mt">${st.reasons.map(r => `<div>・${esc(r)}</div>`).join("")}</div>${chart(s, plan, d.mocks)}</div>
      <div class="card"><h2>プロフィール</h2><div class="small stack">${[["現在", `${s.currentScore}（${s.currentScoreDate || "日付不明"}）／4技能 ${["R", "L", "W", "S"].map(k => (s.sub && s.sub[k]) || "—").join("・")}`], ["目標", `${plan.feasibility.target}${s.stretchScore ? `（狙い${s.stretchScore}）` : ""}${s.minimumScore ? `・最低${s.minimumScore}` : ""}`], ["締切", s.deadline], ["レッスン", `週${s.lessonsPerWeek || "—"}回・${s.lessonDay || ""} ${s.lessonTime || ""}`], ["背景", s.profileNote], ["4技能", s.subNote], ["締切メモ", s.deadlineNote], ["苦手", s.weakNote], ["単語", s.vocabNote], ["受験", s.testPolicyNote], ["授業", s.lessonNote]].filter(x => x[1]).map(x => `<div><b>${x[0]}</b>：${esc(x[1])}</div>`).join("")}</div></div></div>
    <div class="grid g2 mt">
      <div class="card"><h2>レッスンノートを追加</h2><form id="lessonForm"><div class="grid g2"><div class="field"><label>日付</label><input type="date" name="date" value="${today()}"></div><div class="field"><label>講師</label><input name="instructor" value="${esc(N.S.settings.instructorName)}"></div></div>
        ${[["content", "やったこと"], ["feedback", "フィードバック"], ["homework", "宿題"], ["next", "次回やること"]].map(([k, l]) => `<div class="field"><label>${l}</label><textarea name="${k}" style="min-height:64px"></textarea></div>`).join("")}<button class="btn primary">保存</button></form></div>
      <div class="card"><h2>単語チェック（授業の最初）</h2><p class="small muted">記録された単語範囲から番号をランダムに選びます（単語帳の中身は保存しません）。</p><div class="grid g3"><div class="field"><label>No.から</label><input type="number" id="wcFrom" value="${lo}"></div><div class="field"><label>まで</label><input type="number" id="wcTo" value="${hi}"></div><div class="field"><label>問題数</label><input type="number" id="wcN" value="10"></div></div><button class="btn" id="wcGo">出題する番号を選ぶ</button><div id="wcOut" class="mt"></div>
        <h3 class="mt">週の講師メモ（プランに表示）</h3><div class="row"><select id="wnW" style="max-width:120px">${plan.weeks.map(w => `<option value="${w.n}" ${nowW && nowW.n === w.n ? "selected" : ""}>${w.n}週目</option>`).join("")}</select><input id="wnT" placeholder="例：IRを2週に延長" style="flex:1"><button class="btn" id="wnSave">保存</button></div></div>
    </div>
    <div class="card mt"><h2>レッスンノート</h2>${lessons.length ? lessons.map(l => `<div class="card"><div class="row between"><b>${esc(l.date)}（${esc(l.instructor || "")}）</b><button class="btn ghost sm" data-del-lesson="${l.id}">削除</button></div>${[["やったこと", l.content], ["フィードバック", l.feedback], ["宿題", l.homework], ["次回", l.next]].filter(x => x[1]).map(x => `<div class="small mt"><b>${x[0]}</b>：${esc(x[1])}</div>`).join("")}</div>`).join("") : `<div class="empty">まだありません</div>`}</div>
    <div class="grid g2 mt"><div class="card"><h2>最近の学習記録</h2>${logs.length ? logs.map(l => `<div class="task" style="display:block"><div class="row between"><b>${U.md(l.date)}・${l.minutes}分</b><span class="tiny muted">単語${l.newWords || "—"} 負担${l.burden || "—"} 自己評価${l.rating || "—"}</span></div><div class="small">${esc(l.note || "")}</div>${l.feedback ? `<div class="small" style="color:var(--brand)">講師：${esc(l.feedback)}</div>` : `<div class="row mt"><input placeholder="この日の記録へのコメント" data-fb="${l.id}" style="flex:1"><button class="btn sm" data-fbsave="${l.id}">保存</button></div>`}</div>`).join("") : `<div class="empty">記録なし</div>`}</div>
      <div class="card"><h2>最近の演習</h2>${prac.length ? prac.map(p => `<div class="task" style="display:block"><b>${U.md(p.date)} ${P.TYPES[p.type].ja}</b> <span class="small muted">${p.max ? `${p.score ?? "—"}/${p.max}` : ""}${p.words != null ? ` ${p.words}語` : ""}</span>${p.text ? `<details><summary class="tiny">答案を見る</summary><div class="small passage">${esc(p.text)}</div></details>` : ""}</div>`).join("") : `<div class="empty">演習なし</div>`}</div></div>`;
  };
  views.student.mount = id => {
    const d = D(id); if (!$("#lessonForm")) return;
    $("#lessonForm").onsubmit = e => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); d.lessons.push({ id: uid("l"), ...f }); save(); toast("レッスンノートを保存しました"); render(); };
    $("#wcGo").onclick = () => { const a = +$("#wcFrom").value, b = +$("#wcTo").value, n = +$("#wcN").value; if (!a || !b || b < a) return toast("範囲を入力してください"); const pool = Array.from({ length: b - a + 1 }, (_, i) => a + i); const out = []; while (out.length < Math.min(n, b - a + 1)) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); $("#wcOut").innerHTML = `<div class="pill-list">${out.sort((x, y) => x - y).map(x => `<span class="badge info">No.${x}</span>`).join("")}</div>`; };
    $("#wnSave").onclick = () => { d.weekNotes[$("#wnW").value] = $("#wnT").value; save(); toast("保存しました"); };
    $$("[data-fbsave]").forEach(b => (b.onclick = () => { const l = d.logs.find(x => x.id === b.dataset.fbsave); l.feedback = $(`[data-fb="${l.id}"]`).value; save(); render(); }));
    $$("[data-del-lesson]").forEach(b => (b.onclick = () => { if (confirm("削除しますか？")) { d.lessons = d.lessons.filter(x => x.id !== b.dataset.delLesson); save(); render(); } }));
  };

  views.edit = id => {
    if (!isInst()) return denied(); const isNew = id === "new";
    const s = isNew ? { startDate: today(), weekdayMinutes: 60, lessonsPerWeek: 1, testPolicy: "final", weakTypes: [], interests: [], grammarReview: false, sub: {} } : N.S.students.find(x => x.id === id);
    if (!s) return `<div class="card empty">生徒が見つかりません</div>`;
    const f = (k, l, type = "text", extra = "") => `<div class="field"><label>${l}</label><input name="${k}" type="${type}" value="${esc(s[k] ?? "")}" ${extra}></div>`;
    const t = (k, l) => `<div class="field"><label>${l}</label><textarea name="${k}" style="min-height:60px">${esc(s[k] || "")}</textarea></div>`;
    const chip = (name, k, label, on) => `<label class="chip ${on ? "on" : ""}"><input type="checkbox" name="${name}" value="${k}" ${on ? "checked" : ""}>${label}</label>`;
    return `<h1>${isNew ? "生徒を登録" : esc(s.name) + "さんのプロフィール"}</h1><form id="pf">
    <div class="card"><h2>基本</h2><div class="grid g3">${f("name", "氏名 *", "text", "required")}${f("grade", "学年など")}${f("instructor", "担当講師")}</div>${t("profileNote", "メモ（背景・目的）")}
      <div class="field"><label>興味のある話題（演習問題に反映）</label><div class="chips">${Object.entries(TOPICS).map(([k, v]) => chip("interests", k, v, (s.interests || []).includes(k))).join("")}</div></div></div>
    <div class="card"><h2>スコア</h2><div class="grid g4">${f("currentScore", "現在の総合 *", "number", 'min="10" max="160" step="5" required')}${f("currentScoreDate", "受験日", "date")}${f("targetScore", "目標 *", "number", 'min="10" max="160" required')}${f("minimumScore", "最低ライン", "number", 'min="10" max="160" step="5"')}</div>
      <div class="grid g4">${["R", "L", "W", "S"].map(k => `<div class="field"><label>${{ R: "Reading", L: "Listening", W: "Writing", S: "Speaking" }[k]}（任意）</label><input type="number" name="sub${k}" min="10" max="160" step="5" value="${(s.sub && s.sub[k]) || ""}"></div>`).join("")}</div>${f("stretchScore", "狙うスコア（任意）", "number", 'min="10" max="160" step="5"')}${t("targetNote", "目標・出願先のメモ")}${t("subNote", "4技能のメモ")}<div id="fz"></div></div>
    <div class="card"><h2>期間と学習時間</h2><div class="grid g3">${f("startDate", "開始日 *", "date", "required")}${f("deadline", "締切（スコア提出）", "date")}${f("weeks", "または期間（週）※入力すると締切より優先", "number", 'min="2" max="52"')}</div>
      <div class="grid g4">${f("weekdayMinutes", "平日の学習（分/日）*", "number", 'min="10" step="5" required')}${f("weekendMinutes", "休日の学習（分/日）", "number", 'min="0" step="5"')}${f("lessonsPerWeek", "レッスン回数/週", "number", 'min="0" max="7"')}<div class="field"><label>レッスン曜日・時間</label><div class="row" style="flex-wrap:nowrap"><select name="lessonDay"><option value=""></option>${WD.map(w => `<option ${s.lessonDay === w ? "selected" : ""}>${w}</option>`).join("")}</select><input name="lessonTime" value="${esc(s.lessonTime || "")}" placeholder="20:30"></div></div></div>
      <div class="grid g3">${f("phase1Weeks", "フェーズ1の週数（空欄＝自動）", "number", 'min="1" max="20"')}<div class="field"><label>本番の受け方</label><select name="testPolicy">${[["final", "最後にまとめて"], ["monthly", "月1回"], ["max", "30日2回ペースで最大"]].map(([v, l]) => `<option value="${v}" ${s.testPolicy === v ? "selected" : ""}>${l}</option>`).join("")}</select></div><div class="field"><label>&nbsp;</label>${chip("grammarReview", "1", "中学文法の復習を入れる", s.grammarReview)}</div></div>
      ${t("deadlineNote", "締切のメモ")}${t("studyTimeNote", "学習時間のメモ")}${t("testPolicyNote", "受験回数のメモ")}${t("lessonNote", "レッスンのメモ")}</div>
    <div class="card"><h2>苦手な問題形式</h2><p class="small muted">チェックした形式はフェーズ2で先に扱い、余った週を追加で割り当てます。</p><div class="chips">${TYPE_KEYS.map(k => chip("weakTypes", k, P.TYPES[k].ja, (s.weakTypes || []).includes(k))).join("")}</div>${t("weakNote", "苦手のメモ")}</div>
    <div class="card"><h2>単語</h2><div class="grid g4">${f("vocabBook", "単語帳")}${f("vocabProgress", "覚えた範囲（No.）", "number")}${f("dailyNewWords", "1日の新出語数", "number")}${f("dailyNewWordsStretch", "挑戦する語数", "number")}</div>${t("vocabNote", "単語のメモ")}${t("monthFocus", "レッスンで決めた方針（ホームに表示）")}</div>
    <div class="row mt"><button class="btn primary">${isNew ? "登録してプランを作る" : "保存してプランを更新"}</button><a class="btn" href="${isNew ? "#/students" : "#/student/" + id}">キャンセル</a>${!isNew ? `<button type="button" class="btn danger" id="del" style="margin-left:auto">この生徒を削除</button>` : ""}</div></form>`;
  };
  views.edit.mount = id => {
    const form = $("#pf"); if (!form) return; const isNew = id === "new";
    const nums = ["currentScore", "targetScore", "minimumScore", "stretchScore", "weeks", "weekdayMinutes", "weekendMinutes", "lessonsPerWeek", "phase1Weeks", "vocabProgress", "dailyNewWords", "dailyNewWordsStretch"];
    const read = () => { const fd = new FormData(form); const o = {};
      for (const [k, v] of fd.entries()) if (!["interests", "weakTypes", "subR", "subL", "subW", "subS", "grammarReview"].includes(k)) o[k] = nums.includes(k) ? (v === "" ? null : +v) : v;
      o.interests = fd.getAll("interests"); const picked = fd.getAll("weakTypes"); o.grammarReview = !!fd.get("grammarReview");
      const prev = isNew ? [] : (N.S.students.find(x => x.id === id).weakTypes || []); o.weakTypes = [...prev.filter(k => picked.includes(k)), ...picked.filter(k => !prev.includes(k))];
      o.sub = { R: +fd.get("subR") || null, L: +fd.get("subL") || null, W: +fd.get("subW") || null, S: +fd.get("subS") || null }; if (!o.deadline) o.deadline = null; return o; };
    const preview = () => { const o = read(); if (!o.currentScore || !o.targetScore || !o.startDate) return; const fz = P.feasibility(o); $("#fz").innerHTML = `<div class="mt">${fz.msgs.map(m => `<div class="note ${m.lv === "info" ? "" : m.lv}">${esc(m.t)}</div>`).join("")}</div>`; };
    form.addEventListener("input", preview); form.addEventListener("change", e => { const c = e.target.closest(".chip"); if (c) c.classList.toggle("on", e.target.checked); }); preview();
    form.onsubmit = e => { e.preventDefault(); const o = read();
      if (isNew) { const s = { id: uid("s_"), active: true, ...o }; N.S.students.push(s); D(s.id); N.setCurrent(s.id); save(); toast("登録しました"); location.hash = "#/plan"; }
      else { Object.assign(N.S.students.find(x => x.id === id), o); save(); toast("保存しました"); location.hash = "#/student/" + id; } };
    const del = $("#del"); if (del) del.onclick = () => { if (confirm("この生徒と記録をすべて削除しますか？（元に戻せません。先に書き出し推奨）")) { N.S.students = N.S.students.filter(x => x.id !== id); delete N.S.data[id]; save(); location.hash = "#/students"; } };
  };

  views.settings = () => {
    const L = N.S.settings.llm;
    return `<h1>設定・データ</h1>
    <div class="card"><h2>データの書き出し・読み込み</h2><p class="small muted">データはこの端末のブラウザにだけ保存されています。生徒と講師で共有するには、JSONを書き出して相手の端末で読み込みます（自動同期は未対応）。</p>
      <div class="row"><button class="btn primary" id="exp">JSONを書き出す</button><label class="btn" style="margin:0">JSONを読み込む<input type="file" id="imp" accept="application/json" hidden></label>${isInst() ? `<button class="btn danger" id="reset">初期データに戻す</button>` : ""}</div></div>
    ${isInst() ? `<div class="card"><h2>講師の設定</h2><div class="grid g3"><div class="field"><label>講師名</label><input id="iname" value="${esc(N.S.settings.instructorName)}"></div><div class="field"><label>講師PIN（変更）</label><input id="pin" type="password" placeholder="新しいPIN" autocomplete="new-password"></div><div class="field"><label>この端末の生徒（生徒モードで表示）</label><select id="dev">${N.S.students.map(s => `<option value="${s.id}" ${N.S.settings.deviceStudentId === s.id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></div></div><button class="btn" id="saveInst">保存</button></div>
    <div class="card"><h2>LLM連携（任意）</h2><p class="small muted">APIキーを入れると、読解・ライティング・スピーキングの一部の形式をLLMで生成します（OpenAI互換の Chat Completions API）。キーはこの端末のブラウザだけに保存され、書き出すJSONには含まれません。本番運用ではキーをブラウザに置かず、サーバー経由にしてください。</p>
      <div class="grid g3"><div class="field"><label>エンドポイント</label><input id="ep" value="${esc(L.endpoint)}"></div><div class="field"><label>モデル名</label><input id="model" value="${esc(L.model)}" placeholder="使用するモデル名"></div><div class="field"><label>APIキー</label><input id="key" type="password" value="${esc(L.apiKey)}" autocomplete="off"></div></div>
      <label class="chip ${L.useLLM ? "on" : ""}" style="display:inline-flex"><input type="checkbox" id="use" ${L.useLLM ? "checked" : ""}>LLMで生成する（失敗したら自動でオフライン生成）</label><div class="mt"><button class="btn" id="saveLLM">保存</button></div></div>` : `<div class="card small muted">講師用の設定は講師モードで表示されます。</div>`}`;
  };
  views.settings.mount = () => {
    $("#exp").onclick = () => { const copy = JSON.parse(JSON.stringify(N.S)); copy.settings.llm.apiKey = ""; delete copy.settings.pin; const b = new Blob([JSON.stringify(copy, null, 1)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `nes-det-coach_${today()}.json`; document.body.appendChild(a); a.click(); a.remove(); };
    $("#imp").onchange = async e => { const file = e.target.files[0]; if (!file) return; try { const o = JSON.parse(await file.text()); if (!o.students || !o.data) throw 0; const keep = N.S.settings; o.settings = { ...keep, ...(o.settings || {}), pin: keep.pin, llm: keep.llm, role: keep.role }; N.setS(o); save(); toast("読み込みました"); render(); } catch (err) { toast("このファイルは読み込めません"); } };
    $("#imp").closest("label").onclick = e => { if (e.target.id !== "imp") { e.preventDefault(); $("#imp").click(); } };
    const r = $("#reset"); if (r) r.onclick = () => { if (confirm("すべてのデータを初期データ（デモ生徒のみ）に戻します。よろしいですか？")) { localStorage.removeItem(N.KEY); N.load(); N.S.settings.role = "instructor"; save(); render(); } };
    const si = $("#saveInst"); if (si) si.onclick = () => { N.S.settings.instructorName = $("#iname").value; if ($("#pin").value) N.S.settings.pin = $("#pin").value; N.S.settings.deviceStudentId = $("#dev").value; save(); toast("保存しました"); };
    const sl = $("#saveLLM"); if (sl) sl.onclick = () => { Object.assign(N.S.settings.llm, { endpoint: $("#ep").value.trim(), model: $("#model").value.trim(), apiKey: $("#key").value.trim(), useLLM: $("#use").checked }); save(); toast("保存しました"); };
  };

  // ---------- router ----------
  N.render = function () {
    N.clearTimers && N.clearTimers();
    const [, route = "home", arg] = (location.hash || "#/home").split("/");
    $$(".role-toggle button").forEach(b => b.classList.toggle("on", b.dataset.role === N.S.settings.role));
    const sel = $("#studentSelect"); sel.hidden = !isInst();
    if (isInst()) { if (!N.getCurrent() || !N.S.students.find(s => s.id === N.getCurrent())) N.setCurrent((N.S.students[0] || {}).id); sel.innerHTML = N.S.students.map(s => `<option value="${s.id}" ${s.id === N.getCurrent() ? "selected" : ""}>${esc(s.name)}</option>`).join(""); }
    const links = (isInst() ? [["students", "生徒一覧"]] : []).concat([["home", "ホーム"], ["plan", "プラン"], ["log", "記録"], ["practice", "演習"], ["settings", "設定"]]);
    $("#nav").innerHTML = links.map(([k, l]) => `<a href="#/${k}" class="${k === route || (k === "students" && ["student", "edit"].includes(route)) ? "on" : ""}">${l}</a>`).join("");
    const v = views[route] || views.home; $("#app").innerHTML = v(arg); v.mount && v.mount(arg); window.scrollTo(0, 0);
  };
  $("#studentSelect").onchange = e => { N.setCurrent(e.target.value); const [, route] = location.hash.split("/"); if (route === "student" || route === "edit") location.hash = "#/student/" + N.getCurrent(); else N.render(); };
  window.addEventListener("hashchange", N.render);
  N.load(); N.render();
})();
