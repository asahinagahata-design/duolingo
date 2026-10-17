/* Practice question generator. Offline: built-in original bank + templates + NES vocab sheet.
   Optional: LLM hook (OpenAI-compatible chat API) — key is entered by the user in Settings and kept only in this browser. */
(function () {
  const B = window.DET_BANK, V = window.DET_VOCAB || [], WB = window.DET_WORDBANK;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const levelFromScore = s => (!s ? 1 : s <= 75 ? 1 : s <= 100 ? 2 : 3);
  const CEFR = { 1: ["A2", "B1"], 2: ["B1", "B2"], 3: ["B2", "C1", "C2"] };
  const WBK = { 1: "base", 2: "mid", 3: "high" };
  const byLevel = (arr, lv, topics) => {
    let c = arr.filter(x => x.level === lv); if (!c.length) c = arr.filter(x => Math.abs(x.level - lv) <= 1); if (!c.length) c = arr;
    if (topics && topics.length) { const t = c.filter(x => topics.includes(x.topic)); if (t.length && Math.random() < .6) c = t; }
    return c;
  };
  const vocabFor = lv => V.filter(v => CEFR[lv].includes(v.cefr));
  const prefixLen = w => Math.max(1, Math.floor(w.length / 2));

  const gen = {
    readSelect(lv) {
      const realPool = shuffle([...new Set([...WB.real[WBK[lv]], ...vocabFor(lv).map(v => v.word.toLowerCase()).filter(w => /^[a-z]+$/.test(w))])]);
      const fakePool = shuffle(WB.fake[WBK[lv]]); const n = 15; const nReal = 7 + Math.floor(Math.random() * 3);
      const items = shuffle([...realPool.slice(0, nReal).map(w => ({ word: w, real: true })), ...fakePool.slice(0, n - nReal).map(w => ({ word: w, real: false }))]);
      return { type: "readSelect", level: lv, items, perItemSec: 5, instructions: "表示される語が実在する英単語なら「Yes」、存在しない語なら「No」。1語5秒（現行形式）。" };
    },
    fillBlanks(lv) {
      const fromVocab = vocabFor(lv).filter(v => /^[A-Za-z]+$/.test(v.word)).map(v => { const m = v.example.match(new RegExp("\\b(" + v.word.slice(0, Math.max(3, v.word.length - 2)) + "[a-z]*)\\b", "i")); return m ? { level: lv, sentence: v.example, answer: m[1], ja: v.ja } : null; }).filter(Boolean);
      const pool = shuffle([...fromVocab, ...byLevel(B.fillBlanks, lv)]).slice(0, 6);
      const items = pool.map(x => { const i = x.sentence.indexOf(x.answer); const pre = prefixLen(x.answer); return { before: x.sentence.slice(0, i), prefix: x.answer.slice(0, pre), rest: x.answer.slice(pre), after: x.sentence.slice(i + x.answer.length), answer: x.answer, ja: x.ja }; });
      return { type: "fillBlanks", level: lv, items, timeSec: items.length * 20, instructions: "文を完成させる。最初の数文字がヒント。綴りは完全一致で正解（各20秒）。" };
    },
    readComplete(lv, topics, override) {
      const src = override || pick(byLevel(B.readComplete, lv, topics));
      const sents = src.text.match(/[^.!?]+[.!?]+/g).map(s => s.trim()); const parts = []; let k = 0;
      sents.forEach((s, si) => {
        const toks = s.split(/(\s+)/);
        toks.forEach(t => {
          const m = t.match(/^([A-Za-z']+)([^A-Za-z']*)$/);
          if (si > 0 && si < sents.length - 1 && m && m[1].length >= 3 && (k++ % 2 === 1)) { const w = m[1], pre = prefixLen(w); parts.push({ blank: true, prefix: w.slice(0, pre), rest: w.slice(pre) }); if (m[2]) parts.push({ text: m[2] }); }
          else parts.push({ text: t });
        });
        parts.push({ text: " " });
      });
      return { type: "readComplete", level: lv, topic: src.topic, parts, timeSec: 180, instructions: "段落の空欄の単語を完成させる（最初と最後の文には空欄なし）。3分。" };
    },
    listenType(lv) { return { type: "listenType", level: lv, items: shuffle(byLevel(B.listenType, lv)).slice(0, 4).map(x => x.text), maxPlays: 3, perItemSec: 60, instructions: "音声を聞いて英文をそのまま入力。再生は3回まで（ブラウザの読み上げ音声を使用）。句読点も確認。" }; },
    interactiveReading(lv, topics, override) {
      const src = override || pick(byLevel(B.interactiveReading, lv, topics));
      const p1 = []; src.p1.split(/(\[\[[^\]]+\]\])/).forEach(seg => { const m = seg.match(/^\[\[(.+)\]\]$/); if (m) { const o = m[1].split("|"); p1.push({ blank: true, answer: o[0], options: shuffle(o) }); } else if (seg) p1.push({ text: seg }); });
      return { type: "interactiveReading", level: lv, title: src.title, p1, p2Before: src.p2Before, p2After: src.p2After, p2Options: shuffle(src.p2Options.map((t, i) => ({ t, ok: i === 0 }))),
        highlight: src.highlight, idea: shuffle(src.idea.options.map((t, i) => ({ t, ok: i === 0 }))), titles: shuffle(src.titleOptions.map((t, i) => ({ t, ok: i === 0 }))), timeSec: 450,
        instructions: "1つの文章に6問：①文中の空欄に合う語 ②空所に入る文 ③④答えの部分をドラッグで選択 ⑤主旨 ⑥タイトル。目安7〜8分。" };
    },
    interactiveListening(lv) { const s = pick(byLevel(B.interactiveListening, lv)); return { type: "interactiveListening", level: lv, ...s, turns: s.turns.map(t => ({ say: t.say, options: shuffle(t.options.map((o, i) => ({ t: o, ok: i === t.correct }))) })), summarySec: 75, instructions: "会話の相手の発言を聞き（再生は1回のみ）、最も自然な返答を選ぶ。最後に会話を75秒で要約。" }; },
    writePhoto(lv) { return { type: "writePhoto", level: lv, scene: pick(byLevel(B.photoScenes, lv)), timeSec: 60, template: B.templates.photo, instructions: "（試作版は写真の代わりに場面説明）この場面を英語で1分で描写する。" }; },
    speakPhoto(lv) { return { type: "speakPhoto", level: lv, scene: pick(byLevel(B.photoScenes, lv)), prepSec: 20, timeSec: 90, template: B.templates.photo, instructions: "（場面説明で代用）準備20秒→最大90秒話す。沈黙しないこと優先。" }; },
    interactiveWriting(lv, topics) { const x = pick(byLevel(B.interactiveWriting, lv, topics)); return { type: "interactiveWriting", level: lv, prompt: x.prompt, followUp: x.followUp, timeSec: 300, followSec: 180, template: B.templates.opinion, instructions: "Step1：5分で意見を書く → Step2：追加の質問に3分。Step2はStep1と違う観点を足す。" }; },
    writingSample(lv, topics) { const x = pick(byLevel(B.writingSample, lv, topics)); return { type: "writingSample", level: lv, prompt: x.prompt, timeSec: 300, template: B.templates.opinion, instructions: "5分の短いエッセイ（出願先にも送られる答案）。見直しの時間を残す。" }; },
    readThenSpeak(lv, topics) { const x = pick(byLevel(B.readThenSpeak, lv, topics)); return { type: "readThenSpeak", level: lv, prompt: x.prompt, bullets: x.bullets, prepSec: 20, timeSec: 90, template: B.templates.speaking, instructions: "準備20秒→最大90秒。箇条書きの質問すべてに答える。" }; },
    interactiveSpeaking(lv, topics) { const x = pick(byLevel(B.interactiveSpeaking, lv, topics)); return { type: "interactiveSpeaking", level: lv, title: x.title, questions: x.questions, perItemSec: 35, template: B.templates.speaking, instructions: "質問は1回だけ読み上げ（準備時間なし）。各35秒で答える。" }; },
    speakingSample(lv, topics) { const x = pick(byLevel(B.speakingSample, lv, topics)); return { type: "speakingSample", level: lv, prompt: x.prompt, prepSec: 30, timeSec: 180, template: B.templates.speaking, instructions: "準備30秒→最大3分（動画が出願先に送られる設問）。自然な結論で終える。" }; }
  };

  // ---- simple automatic checks (NOT official scoring) ----
  function textCheck(t) {
    const words = (t.match(/[A-Za-z']+/g) || []); const sents = (t.match(/[^.!?]+[.!?]/g) || []).length;
    const lower = words.map(w => w.toLowerCase()); const freq = {}; lower.forEach(w => { if (w.length > 3) freq[w] = (freq[w] || 0) + 1; });
    const reps = Object.entries(freq).filter(([, c]) => c >= 3).map(([w]) => w);
    const conn = ["first", "second", "also", "however", "because", "although", "for example", "for instance", "so", "therefore", "in addition", "finally", "on the other hand", "while", "since"].filter(c => (" " + lower.join(" ") + " ").includes(" " + c + " "));
    const complex = ["because", "although", "which", "who", "if", "when", "that", "while", "so that"].filter(c => lower.includes(c.split(" ")[0]));
    return { words: words.length, sentences: sents, connectors: conn, complex, repeated: reps };
  }
  const norm = s => s.toLowerCase().replace(/[^a-z0-9' ]/g, " ").split(/\s+/).filter(Boolean);
  function similarity(a, b) { const A = norm(a), Bb = norm(b); const dp = Array(A.length + 1).fill(0).map(() => Array(Bb.length + 1).fill(0)); for (let i = 1; i <= A.length; i++) for (let j = 1; j <= Bb.length; j++) dp[i][j] = A[i - 1] === Bb[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]); const l = dp[A.length][Bb.length]; return Bb.length ? (2 * l) / (A.length + Bb.length) : 0; }

  // ---- optional LLM hook ----
  const LLM_TYPES = ["readComplete", "interactiveReading", "interactiveWriting", "writingSample", "readThenSpeak", "interactiveSpeaking", "speakingSample"];
  const SCHEMA = {
    readComplete: '{"topic":"...","text":"5 sentences, plain paragraph"}',
    interactiveReading: '{"title":"...","topic":"...","p1":"paragraph with 4 blanks written as [[correct|wrong1|wrong2]]","p2Before":"...","p2Options":["correct sentence","wrong","wrong","wrong"],"p2After":"...","highlight":[{"q":"question","a":"exact phrase copied from p2Before/p2After"},{"q":"...","a":"..."}],"idea":{"options":["correct main idea","wrong","wrong","wrong"]},"titleOptions":["correct title","wrong","wrong","wrong"]}',
    interactiveWriting: '{"prompt":"...","followUp":"..."}', writingSample: '{"prompt":"..."}', readThenSpeak: '{"prompt":"...","bullets":["...","...","..."]}',
    interactiveSpeaking: '{"title":"日本語の短い題","questions":["q1","q2","q3","q4","q5","q6"]}', speakingSample: '{"prompt":"..."}'
  };
  async function llmGenerate(type, lv, topics, cfg) {
    const words = vocabFor(lv).map(v => v.word); const sample = shuffle(words).slice(0, 8);
    const sys = "You write ORIGINAL practice items in the style of the Duolingo English Test (current 2025+ format). Never copy real test items or published books. Reply with JSON only.";
    const user = `Type: ${type}. Difficulty: ${["", "CEFR A2-B1 (DET 60-75)", "CEFR B1-B2 (DET 80-100)", "CEFR B2-C1 (DET 105+)"][lv]}. Preferred topics: ${(topics || []).join(", ") || "general"}. Try to use some of these words: ${sample.join(", ")}. JSON schema: ${SCHEMA[type]}`;
    const res = await fetch(cfg.endpoint, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + cfg.apiKey },
      body: JSON.stringify({ model: cfg.model, messages: [{ role: "system", content: sys }, { role: "user", content: user }], temperature: 0.8, response_format: { type: "json_object" } }) });
    if (!res.ok) throw new Error("LLM API " + res.status);
    const j = await res.json(); const obj = JSON.parse(j.choices[0].message.content.replace(/^```json|```$/g, ""));
    if (type === "readComplete") return gen.readComplete(lv, topics, { text: obj.text, topic: obj.topic });
    if (type === "interactiveReading") return gen.interactiveReading(lv, topics, obj);
    const base = gen[type](lv, topics); return { ...base, ...obj, llm: true };
  }

  async function generate(type, lv, topics, cfg) {
    if (cfg && cfg.useLLM && cfg.apiKey && cfg.endpoint && LLM_TYPES.includes(type)) {
      try { const q = await llmGenerate(type, lv, topics, cfg); q.source = "LLM"; return q; } catch (e) { const q = gen[type](lv, topics); q.source = "オフライン（LLM失敗: " + e.message + "）"; return q; }
    }
    const q = gen[type](lv, topics); q.source = "オフライン（内蔵問題＋テンプレート）"; return q;
  }
  window.DETQuestions = { generate, gen, levelFromScore, textCheck, similarity, LLM_TYPES, rubric: B.rubric };
})();
