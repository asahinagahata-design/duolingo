/* Practice view + renderers for each question type */
(function () {
  const N = window.__NES, P = window.DETPlanner, Q = window.DETQuestions, U = P.util;
  const { views, $, $$, esc, today, uid, TYPE_KEYS, TOPICS, toast, D, cur, planOf, save } = N;
  let curQ = null, timers = [];
  const clearTimers = () => { timers.forEach(clearInterval); timers = []; if (window.speechSynthesis) speechSynthesis.cancel(); };
  N.clearTimers = clearTimers;
  function countdown(el, sec, onEnd) { let t = sec; const tick = () => { el.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; el.classList.toggle("low", t <= 10); }; tick(); const h = setInterval(() => { t--; tick(); if (t <= 0) { clearInterval(h); onEnd && onEnd(); } }, 1000); timers.push(h); }
  function speak(text) { if (!window.speechSynthesis) { toast("このブラウザは読み上げに対応していません"); return; } speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = .95; const v = speechSynthesis.getVoices().find(v => /^en(-|_)US/i.test(v.lang)); if (v) u.voice = v; speechSynthesis.speak(u); }
  function savePractice(type, score, max, extra) { const s = cur(); D(s.id).practice.push({ id: uid("p"), date: today(), type, level: curQ && curQ.level, score, max, ...extra }); save(); }

  views.practice = () => {
    const s = cur(); const d = D(s.id); const last = d.mocks.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
    const lv = Q.levelFromScore(last ? P.mockScore(last) : +s.currentScore); const plan = planOf(s); const w = P.weekOf(plan, today());
    const rec = w ? w.types.filter(t => TYPE_KEYS.includes(t)) : []; const llm = N.S.settings.llm;
    const groups = { R: "読む", L: "聞く", W: "書く", S: "話す" };
    return `<h1>演習問題</h1>
    <div class="card"><div class="grid g3">
      <div class="field"><label>問題形式</label><select id="qType">${Object.entries(groups).map(([k, g]) => `<optgroup label="${g}">${TYPE_KEYS.filter(t => P.TYPES[t].skill === k).map(t => `<option value="${t}" ${rec[0] === t ? "selected" : ""}>${P.TYPES[t].ja}${rec.includes(t) ? "（今週）" : ""}</option>`).join("")}</optgroup>`).join("")}</select></div>
      <div class="field"><label>レベル</label><select id="qLevel">${[[1, "基礎（〜75）"], [2, "中級（80〜100）"], [3, "上級（105〜）"]].map(([v, l]) => `<option value="${v}" ${v === lv ? "selected" : ""}>${l}</option>`).join("")}</select></div>
      <div class="field"><label>話題の好み</label><select id="qTopic"><option value="">指定なし</option>${Object.entries(TOPICS).map(([k, v]) => `<option value="${k}" ${(s.interests || []).includes(k) ? "selected" : ""}>${v}</option>`).join("")}</select></div></div>
      <div class="row"><button class="btn primary" id="gen">問題を作る</button><span class="small muted">${llm.useLLM && llm.apiKey ? "LLM連携：オン（一部の形式）" : "オフライン生成（内蔵のオリジナル問題＋NES単語リスト）"}</span></div>
      ${rec.length ? `<p class="tiny muted mt mb0">今週のおすすめ：${rec.map(t => P.TYPES[t].ja).join("・")}</p>` : ""}</div>
    <div id="qArea" class="q-area"></div>
    <div class="card mt"><h2>最近の演習</h2>${d.practice.length ? `<div class="pill-list">${d.practice.slice(-12).reverse().map(p => `<span class="badge">${U.md(p.date)} ${P.TYPES[p.type].ja} ${p.max ? `${p.score ?? "—"}/${p.max}` : p.words != null ? `${p.words}語` : "完了"}</span>`).join("")}</div>` : `<div class="empty">まだ演習の記録がありません</div>`}</div>`;
  };
  views.practice.mount = () => {
    $("#gen").onclick = async () => { clearTimers(); const t = $("#qType").value, lv = +$("#qLevel").value, tp = $("#qTopic").value; $("#qArea").innerHTML = `<div class="card empty">作成中…</div>`;
      curQ = await Q.generate(t, lv, tp ? [tp] : [], N.S.settings.llm); renderQ(curQ); };
  };

  function rubricBox(kind) { return `<details class="mt"><summary class="small"><b>採点の観点（公式の評価項目）とセルフチェック</b></summary><ul class="small check">${Q.rubric[kind].map(r => `<li><label class="row" style="color:inherit"><input type="checkbox" style="width:auto">${esc(r)}</label></li>`).join("")}</ul><p class="tiny muted">${esc(Q.rubric.bands)}</p></details>`; }
  function writingFeedback(text, minWords) { const c = Q.textCheck(text); const tips = [];
    if (c.words < minWords) tips.push(`語数が少なめ（${c.words}語）。目安は${minWords}語以上。`); if (!c.connectors.length) tips.push("接続語（First / Also / For example / However など）を入れてつなげる。"); if (c.complex.length < 1) tips.push("because / although / which / if などの複文を1つ以上。"); if (c.repeated.length) tips.push(`同じ語の繰り返し：${c.repeated.join(", ")} → 言い換えを。`);
    return `<div class="note ${tips.length ? "warn" : "ok"} mt small"><b>簡易チェック（自動・公式採点ではありません）</b><div>語数 ${c.words}／文 ${c.sentences}／接続語 ${c.connectors.join(", ") || "なし"}／複文 ${c.complex.join(", ") || "なし"}</div>${tips.map(t => `<div>・${esc(t)}</div>`).join("") || "<div>・基本の形はできています。講師の添削で内容と文法を確認しましょう。</div>"}</div>`; }
  const head = (q, extra = "") => `<div class="row between"><div><h2 class="mb0">${P.TYPES[q.type].ja} <span class="badge">${["", "基礎", "中級", "上級"][q.level]}</span></h2><p class="small muted mb0">${esc(q.instructions)}</p></div>${extra}</div><p class="tiny muted">出題元：${esc(q.source || "")}</p>`;
  function renderQ(q) { const A = $("#qArea"); A.oninput = null; const R = renderers[q.type]; A.innerHTML = `<div class="card">${R.html(q)}</div>`; R.mount && R.mount(q, A); }

  const renderers = {
    readSelect: {
      html: q => head(q, `<span class="timer" id="tm">0:05</span>`) + `<div id="rs"></div>`,
      mount(q, A) { let i = 0; const ans = []; const box = $("#rs", A);
        const next = () => { clearTimers(); if (i >= q.items.length) return done(); const it = q.items[i]; box.innerHTML = `<p class="small muted" style="text-align:center">${i + 1} / ${q.items.length}</p><div class="rs-word">${esc(it.word)}</div><div class="rs-btns"><button class="btn" data-v="1">Yes（実在する）</button><button class="btn" data-v="0">No（存在しない）</button></div>`;
          $$("[data-v]", box).forEach(b => (b.onclick = () => { ans.push(b.dataset.v === "1"); i++; next(); })); countdown($("#tm", A), q.perItemSec, () => { ans.push(null); i++; next(); }); };
        const done = () => { const ok = q.items.filter((it, k) => ans[k] === it.real).length; savePractice("readSelect", ok, q.items.length);
          box.innerHTML = `<div class="note ${ok / q.items.length >= .8 ? "ok" : "warn"}"><b>${ok} / ${q.items.length} 正解</b> — 知らない語は「選ばない」のがコツ。</div><div class="tablewrap mt"><table><tr><th>語</th><th>正解</th><th>あなた</th></tr>${q.items.map((it, k) => `<tr><td>${esc(it.word)}</td><td>${it.real ? "実在" : "存在しない"}</td><td>${ans[k] == null ? "時間切れ" : ans[k] === it.real ? "✅" : "❌"}</td></tr>`).join("")}</table></div>`; };
        next(); }
    },
    fillBlanks: {
      html: q => head(q, `<span class="timer" id="tm"></span>`) + `<div class="cloze stack">${q.items.map((it, k) => `<div>${k + 1}. ${esc(it.before)}<span class="gap">${esc(it.prefix)}<input data-k="${k}" size="${Math.max(3, it.rest.length + 1)}" autocomplete="off" autocapitalize="off" spellcheck="false"></span>${esc(it.after)}</div>`).join("")}</div><button class="btn primary mt" id="chk">答え合わせ</button><div id="res"></div>`,
      mount(q, A) { const check = () => { clearTimers(); if ($("#chk", A).disabled) return; let ok = 0; $$("input[data-k]", A).forEach(inp => { const it = q.items[+inp.dataset.k]; const r = inp.value.trim().toLowerCase() === it.rest.toLowerCase(); ok += r; inp.classList.add(r ? "right" : "wrong"); if (!r) inp.insertAdjacentHTML("afterend", `<span class="tiny" style="color:var(--ok)"> → ${esc(it.answer)}${it.ja ? `（${esc(it.ja)}）` : ""}</span>`); });
          $("#chk", A).disabled = true; savePractice("fillBlanks", ok, q.items.length); $("#res", A).innerHTML = `<div class="note mt"><b>${ok} / ${q.items.length}</b> — 品詞・時制・三単現の語尾まで確認しよう。</div>`; };
        $("#chk", A).onclick = check; countdown($("#tm", A), q.timeSec, check); }
    },
    readComplete: {
      html: q => head(q, `<span class="timer" id="tm"></span>`) + `<div class="passage cloze">${q.parts.map((p, k) => p.blank ? `<span class="gap">${esc(p.prefix)}<input data-k="${k}" size="${Math.max(2, p.rest.length + 1)}" autocomplete="off" autocapitalize="off" spellcheck="false"></span>` : esc(p.text)).join("")}</div><button class="btn primary mt" id="chk">答え合わせ</button><div id="res"></div>`,
      mount(q, A) { const check = () => { clearTimers(); if ($("#chk", A).disabled) return; let ok = 0, n = 0; $$("input[data-k]", A).forEach(inp => { const p = q.parts[+inp.dataset.k]; n++; const r = inp.value.trim().toLowerCase() === p.rest.toLowerCase(); ok += r; inp.classList.add(r ? "right" : "wrong"); if (!r) inp.value = p.rest; });
          $("#chk", A).disabled = true; savePractice("readComplete", ok, n); $("#res", A).innerHTML = `<div class="note mt"><b>${ok} / ${n}</b> — 最初と最後の文でテーマをつかみ、機能語（前置詞・冠詞・be動詞）から埋める。空欄は残さない。</div>`; };
        $("#chk", A).onclick = check; countdown($("#tm", A), q.timeSec, check); }
    },
    listenType: {
      html: q => head(q) + `<div class="stack">${q.items.map((t, k) => `<div class="row"><button class="btn sm" data-play="${k}">▶ 再生（残り<span>${q.maxPlays}</span>回）</button><input data-k="${k}" placeholder="聞こえた英文を入力" autocomplete="off" autocapitalize="off" spellcheck="false" style="flex:1;min-width:220px"></div><div class="tiny" id="ans${k}"></div>`).join("")}</div><button class="btn primary mt" id="chk">答え合わせ</button><div id="res"></div>`,
      mount(q, A) { $$("[data-play]", A).forEach(b => { let left = q.maxPlays; b.onclick = () => { if (!left) return; left--; $("span", b).textContent = left; if (!left) b.disabled = true; speak(q.items[+b.dataset.play]); }; });
        $("#chk", A).onclick = () => { let tot = 0; $$("input[data-k]", A).forEach(inp => { const k = +inp.dataset.k; const sim = Q.similarity(inp.value, q.items[k]); tot += sim; $("#ans" + k, A).innerHTML = `正解：<b>${esc(q.items[k])}</b>（一致度 ${Math.round(sim * 100)}%）`; });
          savePractice("listenType", Math.round(tot * 10) / 10, q.items.length); $("#res", A).innerHTML = `<div class="note mt">一致度の平均 ${Math.round(tot / q.items.length * 100)}%。単複・三単現・句読点を見直そう（本番は部分点あり）。</div>`; $("#chk", A).disabled = true; }; }
    },
    interactiveReading: {
      html: q => head(q, `<span class="timer" id="tm"></span>`) + `<h3>${esc(q.title)}</h3>
        <p class="small"><b>① Complete the Sentences</b>：空欄に合う語を選ぶ</p><div class="passage cloze">${q.p1.map((p, k) => p.blank ? `<select data-k="${k}"><option value="">—</option>${p.options.map(o => `<option>${esc(o)}</option>`).join("")}</select>` : esc(p.text)).join("")}</div>
        <p class="small mt"><b>② Complete the Passage</b>：空所に入る文を選ぶ</p><div class="passage">${esc(q.p2Before)} <b>[ ＿＿＿ ]</b> ${esc(q.p2After)}</div><div id="p2">${q.p2Options.map((o, k) => `<button class="opt" data-k="${k}">${esc(o.t)}</button>`).join("")}</div>
        <p class="small mt"><b>③④ Highlight the Answer</b>：下の文章から答えの部分をドラッグで選び「選択を回答にする」</p><div class="passage hl" id="hlp">${esc(q.p2Before)} … ${esc(q.p2After)}</div>
        ${q.highlight.map((h, k) => `<div class="row mt"><div style="flex:1"><b>Q${k + 3}.</b> ${esc(h.q)}<div class="tiny" id="hla${k}">（未選択）</div></div><button class="btn sm" data-hl="${k}">選択を回答にする</button></div>`).join("")}
        <p class="small mt"><b>⑤ Identify the Idea</b>：文章全体の主旨</p><div id="idea">${q.idea.map((o, k) => `<button class="opt" data-k="${k}">${esc(o.t)}</button>`).join("")}</div>
        <p class="small mt"><b>⑥ Title the Passage</b>：最も合うタイトル</p><div id="ttl">${q.titles.map((o, k) => `<button class="opt" data-k="${k}">${esc(o.t)}</button>`).join("")}</div>
        <button class="btn primary mt" id="chk">答え合わせ</button><div id="res"></div>`,
      mount(q, A) { const sel = {}; const hl = {};
        ["p2", "idea", "ttl"].forEach(g => $$(`#${g} .opt`, A).forEach(b => (b.onclick = () => { $$(`#${g} .opt`, A).forEach(x => x.classList.toggle("sel", x === b)); sel[g] = +b.dataset.k; })));
        $$("[data-hl]", A).forEach(b => (b.onclick = () => { const t = String(window.getSelection()).trim(); if (!t) return toast("先に文章をドラッグで選択してください"); hl[b.dataset.hl] = t; $("#hla" + b.dataset.hl, A).textContent = "選択：" + t; }));
        const check = () => { clearTimers(); let ok = 0, n = 0;
          $$("select[data-k]", A).forEach(s => { const r = s.value === q.p1[+s.dataset.k].answer; n++; ok += r; s.style.borderColor = r ? "var(--ok)" : "var(--bad)"; if (!r) s.insertAdjacentHTML("afterend", `<span class="tiny" style="color:var(--ok)">→${esc(q.p1[+s.dataset.k].answer)}</span>`); });
          [["p2", q.p2Options], ["idea", q.idea], ["ttl", q.titles]].forEach(([g, arr]) => { n++; $$(`#${g} .opt`, A).forEach((b, k) => { if (arr[k].ok) b.classList.add("right"); else if (sel[g] === k) b.classList.add("wrong"); }); ok += sel[g] != null && arr[sel[g]].ok ? 1 : 0; });
          q.highlight.forEach((h, k) => { n++; const sim = hl[k] ? Q.similarity(hl[k], h.a) : 0; ok += Math.round(sim * 10) / 10; $("#hla" + k, A).innerHTML = `${hl[k] ? "選択：" + esc(hl[k]) : "（未選択）"}<br><span style="color:var(--ok)">答え：${esc(h.a)}</span>（一致 ${Math.round(sim * 100)}%）`; });
          ok = Math.round(ok * 10) / 10; savePractice("interactiveReading", ok, n); $("#chk", A).disabled = true;
          $("#res", A).innerHTML = `<div class="note mt"><b>${ok} / ${n}</b> — ①品詞で消去 ②前後の文のつながり ③④答えの部分だけ選ぶ ⑤書いてあることだけ ⑥⑤と同じ趣旨のタイトル。</div>`; };
        $("#chk", A).onclick = check; countdown($("#tm", A), q.timeSec, () => toast("時間です（そのまま答え合わせできます）")); }
    },
    interactiveListening: {
      html: q => head(q) + `<div class="note small"><b>${esc(q.title)}</b><br>${esc(q.scenario)}</div><div id="turns" class="mt"></div><div id="sum"></div>`,
      mount(q, A) { let i = 0, ok = 0; const box = $("#turns", A);
        const turn = () => { if (i >= q.turns.length) return summary(); const t = q.turns[i]; box.insertAdjacentHTML("beforeend", `<div class="card" id="t${i}"><div class="row between"><b>相手 ${i + 1}</b><button class="btn sm" data-play>▶ 聞く（1回のみ）</button></div><div class="mt" data-opts hidden>${t.options.map((o, k) => `<button class="opt" data-k="${k}">${esc(o.t)}</button>`).join("")}</div></div>`);
          const c = $("#t" + i, box); $("[data-play]", c).onclick = e => { e.target.disabled = true; speak(t.say); $("[data-opts]", c).hidden = false; };
          $$(".opt", c).forEach(b => (b.onclick = () => { if (c.dataset.done) return; c.dataset.done = 1; const k = +b.dataset.k; t.options.forEach((o, j) => { if (o.ok) $$(".opt", c)[j].classList.add("right"); }); if (!t.options[k].ok) b.classList.add("wrong"); else ok++; c.insertAdjacentHTML("beforeend", `<div class="tiny muted mt">相手の発言：${esc(t.say)}</div>`); i++; turn(); })); };
        const summary = () => { $("#sum", A).innerHTML = `<div class="card"><div class="row between"><b>Summarize the Conversation（75秒）</b><span class="timer" id="tm"></span></div><textarea id="sumT" placeholder="Who talked about what, and what happened?"></textarea><button class="btn primary mt" id="fin">提出</button><div id="fb"></div></div>`;
          const fin = () => { clearTimers(); if ($("#fin", A).disabled) return; const t = $("#sumT", A).value; savePractice("interactiveListening", ok, q.turns.length, { words: Q.textCheck(t).words, text: t.slice(0, 2000) }); $("#fb", A).innerHTML = `<div class="note mt small">返答 ${ok}/${q.turns.length} 正解。<br>要約に入れたいこと：${esc(q.summaryHint)}</div>` + writingFeedback(t, 30); $("#fin", A).disabled = true; };
          $("#fin", A).onclick = fin; countdown($("#tm", A), q.summarySec, fin); };
        turn(); }
    }
  };
  const writeR = (getPrompt, minWords, two) => ({
    html: q => head(q, `<span class="timer" id="tm"></span>`) + getPrompt(q) + `<div class="note small mt"><b>型</b>：${esc(q.template)}</div><textarea id="w1" class="mt" style="min-height:150px" placeholder="Write in English…"></textarea><div class="tiny muted" id="wc">0語</div>
      ${two ? `<div id="step2" hidden><div class="note mt"><b>Step 2（3分）</b>：${esc(q.followUp)}</div><textarea id="w2" class="mt" style="min-height:120px"></textarea></div>` : ""}
      <div class="row mt"><button class="btn" id="start">タイマー開始</button><button class="btn primary" id="fin">${two ? "次へ" : "提出"}</button></div><div id="fb"></div>${rubricBox("writing")}`,
    mount(q, A) { let step = 1; const wc = () => ($("#wc", A).textContent = Q.textCheck(($("#w1", A).value || "") + " " + (($("#w2", A) || {}).value || "")).words + "語"); A.oninput = wc;
      const finish = () => { clearTimers(); if ($("#fin", A).disabled) return; if (two && step === 1) { step = 2; $("#step2", A).hidden = false; $("#fin", A).textContent = "提出"; countdown($("#tm", A), q.followSec, finish); return; }
        const t = $("#w1", A).value + (two ? "\n" + $("#w2", A).value : ""); savePractice(q.type, null, null, { words: Q.textCheck(t).words, text: t.slice(0, 2000) }); $("#fin", A).disabled = true; $("#fb", A).innerHTML = writingFeedback(t, minWords) + `<p class="tiny muted">答案は記録され、講師の画面で確認できます。</p>`; };
      $("#start", A).onclick = () => { clearTimers(); $("#start", A).disabled = true; countdown($("#tm", A), step === 1 ? q.timeSec : q.followSec, finish); }; $("#fin", A).onclick = finish; }
  });
  renderers.writePhoto = writeR(q => `<div class="scene">${q.scene.emoji}</div><div class="note small">場面：${esc(q.scene.ja)}</div>`, 15);
  renderers.interactiveWriting = writeR(q => `<div class="passage"><b>Step 1（5分）</b>：${esc(q.prompt)}</div>`, 80, true);
  renderers.writingSample = writeR(q => `<div class="passage">${esc(q.prompt)}</div>`, 100);
  function recorder(A) { const box = $("#rec", A); if (!navigator.mediaDevices || !window.MediaRecorder) { box.innerHTML = `<span class="tiny muted">このブラウザでは録音できません（タイマーのみ）。</span>`; return { start() {}, stop() {} }; }
    let mr, chunks = []; return { async start() { try { const st = await navigator.mediaDevices.getUserMedia({ audio: true }); mr = new MediaRecorder(st); chunks = []; mr.ondataavailable = e => chunks.push(e.data); mr.onstop = () => { st.getTracks().forEach(t => t.stop()); box.innerHTML = `<audio controls src="${URL.createObjectURL(new Blob(chunks))}"></audio><div class="tiny muted">録音はこの画面でだけ再生できます（保存・送信はしません）。</div>`; }; mr.start(); box.innerHTML = `<span class="badge bad">● 録音中</span>`; } catch (e) { box.innerHTML = `<span class="tiny muted">マイクが使えません（タイマーのみで練習）。</span>`; } }, stop() { if (mr && mr.state === "recording") mr.stop(); } }; }
  const speakR = getPrompt => ({
    html: q => head(q, `<span class="timer" id="tm"></span>`) + getPrompt(q) + `<div class="note small mt"><b>型</b>：${esc(q.template)}</div><div class="row mt"><button class="btn primary" id="start">準備を始める</button><span class="small muted" id="phase"></span></div><div id="rec" class="mt"></div>
      <div class="field mt"><label>話せた秒数（記録用）</label><input type="number" id="secs" min="0" max="${q.timeSec}" style="max-width:140px"></div><button class="btn" id="save">記録</button>${rubricBox("speaking")}`,
    mount(q, A) { const rec = recorder(A);
      $("#start", A).onclick = () => { clearTimers(); $("#start", A).disabled = true; $("#phase", A).textContent = "準備中…"; countdown($("#tm", A), q.prepSec, () => { $("#phase", A).textContent = "話してください"; rec.start(); countdown($("#tm", A), q.timeSec, () => { rec.stop(); $("#phase", A).textContent = "終了"; }); }); };
      $("#save", A).onclick = () => { rec.stop(); clearTimers(); savePractice(q.type, +$("#secs", A).value || null, q.timeSec); toast("記録しました"); $("#save", A).disabled = true; }; }
  });
  renderers.speakPhoto = speakR(q => `<div class="scene">${q.scene.emoji}</div><div class="note small">場面：${esc(q.scene.ja)}</div>`);
  renderers.readThenSpeak = speakR(q => `<div class="passage"><b>${esc(q.prompt)}</b><ul>${q.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul></div>`);
  renderers.speakingSample = speakR(q => `<div class="passage"><b>${esc(q.prompt)}</b></div>`);
  renderers.interactiveSpeaking = {
    html: q => head(q, `<span class="timer" id="tm"></span>`) + `<div class="note small"><b>${esc(q.title)}</b>（全${q.questions.length}問）</div><div class="row mt"><button class="btn primary" id="start">開始</button><span class="small muted" id="phase"></span></div><div id="rec" class="mt"></div><div id="log" class="small mt"></div>${rubricBox("speaking")}`,
    mount(q, A) { const rec = recorder(A); let i = 0;
      const next = () => { clearTimers(); if (i >= q.questions.length) { rec.stop(); $("#phase", A).textContent = "終了"; savePractice("interactiveSpeaking", q.questions.length, q.questions.length); $("#log", A).innerHTML = `<b>質問一覧（見直し用）</b><ol>${q.questions.map(x => `<li>${esc(x)}</li>`).join("")}</ol>`; return; }
        $("#phase", A).innerHTML = `質問 ${i + 1}/${q.questions.length}（聞いたらすぐ答える） <button class="btn sm" id="skip">次へ</button>`; speak(q.questions[i]); $("#skip", A).onclick = () => { i++; next(); }; countdown($("#tm", A), q.perItemSec, () => { i++; next(); }); };
      $("#start", A).onclick = () => { $("#start", A).disabled = true; rec.start(); next(); }; }
  };
})();
