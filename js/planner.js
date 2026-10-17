/* Plan generator + feasibility + on-track status. Pure functions (no DOM). */
(function () {
  const TYPES = {
    readSelect: { ja: "Read and Select", skill: "R" },
    fillBlanks: { ja: "Fill in the Blanks", skill: "R" },
    readComplete: { ja: "Read and Complete", skill: "R" },
    listenType: { ja: "Listen and Type", skill: "L" },
    interactiveReading: { ja: "Interactive Reading", skill: "R" },
    interactiveListening: { ja: "Interactive Listening", skill: "L" },
    writePhoto: { ja: "Write About the Photo", skill: "W" },
    interactiveWriting: { ja: "Interactive Writing", skill: "W" },
    speakPhoto: { ja: "Speak About the Photo", skill: "S" },
    readThenSpeak: { ja: "Read, Then Speak", skill: "S" },
    interactiveSpeaking: { ja: "Interactive Speaking", skill: "S" },
    writingSample: { ja: "Writing Sample", skill: "W" },
    speakingSample: { ja: "Speaking Sample", skill: "S" }
  };
  // Weekly modules (from NES plan DET_60to91_plan.html, current DET format only)
  const M = {
    diag: { focus: "現状把握・習慣づくり", types: [], lesson: "ヒアリング・形式別ミニ診断・計画説明", hw: "単語（毎日）／タイピング練習／Listen and Type 毎日5文", check: "学習時間を毎日記録できたか" },
    vocab: { focus: "語彙・読む基礎", types: ["readSelect", "fillBlanks"], lesson: "偽単語の見分け方、文脈・品詞で埋める練習", hw: "単語／Fill in the Blanks 演習／機能語リスト", check: "FIBの綴りミスが減ったか" },
    grammar: { focus: "文法・文構造（中学文法）", types: ["fillBlanks", "readComplete"], lesson: "名詞のかたまり（どこまでが主語か）・動詞の形と時制を見分ける", hw: "文法書の該当範囲／英文を「主語・動詞・それ以外」に区切る練習", check: "動詞の形・時制の選択ミスが減ったか" },
    listen: { focus: "聞く基礎＋短い読解", types: ["listenType", "readComplete"], lesson: "聞き方の手順（1回目で全部打つ→2・3回目で直す）、主語・動詞を探す読み方", hw: "Listen and Type 毎日10文／Read and Complete 1日1題", check: "句読点・単複・三単現のミス数" },
    photo: { focus: "写真描写の型", types: ["writePhoto", "speakPhoto"], lesson: "「概要→詳細→推測」の型、位置・推測表現", hw: "写真Write 毎日2枚／Speak 1枚録音", check: "1分で書ける語数・話せる秒数" },
    ir: { focus: "長文読解", types: ["interactiveReading"], lesson: "6問の順番と時間配分、品詞→文脈→コロケーション", hw: "Interactive Reading 2セット／単語", check: "IRを時間内に終えられるか" },
    il: { focus: "会話リスニング＋要約", types: ["interactiveListening"], lesson: "返答の選び方、75秒要約の型（誰が・何を・どうなった）", hw: "Interactive Listening 2セット＋要約／Listen and Type継続", check: "要約で状況・要点・結末が書けるか" },
    iw: { focus: "5分ライティング", types: ["interactiveWriting"], lesson: "意見→理由＋例の段落、Step2で新しい観点を足す", hw: "Interactive Writing 2本（添削）／接続語リスト", check: "5分で書ける語数・複文の数" },
    speak: { focus: "話す問題の型", types: ["readThenSpeak", "interactiveSpeaking"], lesson: "設問の全部に答える、理由＋具体例で伸ばす、すぐ話し出す練習", hw: "Read, Then Speak・Interactive Speaking 録音（毎日1〜2本）", check: "何秒話せたか・長い沈黙の回数" },
    sample: { focus: "出願先が見る答案", types: ["writingSample", "speakingSample"], lesson: "5分エッセイ・3分スピーチの構成（意見→理由2〜3＋例）", hw: "Writing / Speaking Sample 各2本（添削）", check: "3分のうち何秒話せるか" },
    weak: { focus: "弱点集中", types: [], lesson: "直近の模試で低かった形式の解き直し・時間内演習", hw: "弱点形式を毎日", check: "弱点形式のミスの種類が減ったか" },
    full: { focus: "本番形式の通し", types: Object.keys(TYPES), lesson: "本番と同じ順・時間で通し練習、受験ルール確認（部屋・カメラ・身分証）", hw: "公式練習テスト／受験環境のリハーサル", check: "目標圏内か最終判断" },
    final: { focus: "仕上げ・本番", types: [], lesson: "直前の確認（型・時間・当日の流れ）、メンタル調整", hw: "軽い復習のみ", check: "受験完了・結果の振り返り" },
    review: { focus: "復習・定着", types: [], lesson: "ここまでの形式の総復習と時間内演習", hw: "苦手だった形式を中心に演習", check: "前の週のミスが再発していないか" }
  };
  const PHASES = [
    { n: 1, name: "基礎・形式理解", goal: "全形式の操作と時間に慣れる。語彙・タイピング・写真描写の型を固める" },
    { n: 2, name: "長文・アウトプット", goal: "長い問題（Interactive系）と5分ライティング・話す問題で点を取る型を作る" },
    { n: 3, name: "実戦", goal: "本番と同じ時間で通し練習、弱点だけ集中、受験ルール確認、本番" }
  ];
  const DAY = 864e5;
  const iso = d => { const x = new Date(d); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
  const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => iso(parse(s).getTime() + n * DAY);
  const md = s => { const d = parse(s); return (d.getMonth() + 1) + "/" + d.getDate(); };
  const roundUp5 = n => Math.ceil(n / 5) * 5;

  function totalWeeks(p) {
    if (p.weeks) return Math.max(2, Math.min(52, +p.weeks));
    if (p.deadline && p.startDate) return Math.max(2, Math.min(52, Math.floor((parse(p.deadline) - parse(p.startDate)) / DAY / 7)));
    return 12;
  }
  function phaseLengths(N, p) {
    if (N <= 3) return N === 2 ? [1, 0, 1] : [1, 1, 1];
    let p1 = p.phase1Weeks ? Math.min(+p.phase1Weeks, N - 2) : Math.round(N / 3);
    const rest = N - p1; const p3 = Math.max(1, Math.min(Math.floor(rest / 2), Math.max(2, Math.ceil(N / 5)))); return [p1, rest - p3, p3];
  }
  const isWeakMod = (key, weak) => M[key].types.some(t => weak.includes(t));
  function fill(mods, n, weak) { // fit a module list into n weeks
    if (n <= 0) return [];
    if (mods.length > n) { // merge neighbours
      const out = []; const per = mods.length / n;
      for (let i = 0; i < n; i++) out.push(mods.slice(Math.round(i * per), Math.round((i + 1) * per)));
      return out;
    }
    const out = mods.map(m => [m]); const extra = mods.filter(m => isWeakMod(m, weak));
    let k = 0;
    while (out.length < n) { const m = extra.length ? extra[k++ % extra.length] : "review"; out.splice(Math.min(out.length, out.findIndex(x => x[0] === m) + 1 || out.length), 0, [m === "review" ? m : m]); }
    return out;
  }
  function merge(keys) {
    const ms = keys.map(k => M[k]); const j = f => ms.map(m => m[f]).join(" ＋ ");
    return { keys, focus: j("focus"), types: [...new Set(ms.flatMap(m => m.types))], lesson: j("lesson"), hw: j("hw"), check: j("check") };
  }

  function feasibility(p) {
    const N = totalWeeks(p); const msgs = [];
    let target = +p.targetScore; const cur = +p.currentScore;
    if (target % 5 !== 0) { msgs.push({ lv: "warn", t: `DETのスコアは5点刻み（公式）なので「${target}点」はありません。「${target}点以上」が条件なら実際は${roundUp5(target)}点が必要です。` }); target = roundUp5(target); }
    const gain = target - cur; const perWeek = gain / N; const mins = +p.weekdayMinutes || 0;
    let level = "ok", label = "現実的な範囲";
    if (gain <= 0) { level = "ok"; label = "目標スコアに到達済み"; }
    else if (perWeek > 2.5 || (perWeek > 1.5 && mins && mins < 45)) { level = "bad"; label = "かなり厳しい"; }
    else if (perWeek > 1.5 || (mins && mins < 30)) { level = "warn"; label = "挑戦的"; }
    if (gain > 0) msgs.push({ lv: level, t: `+${gain}点を${N}週で（週あたり約${perWeek.toFixed(1)}点）→ NES内の目安では「${label}」。※公式の伸び幅データはないため、点数の約束はせず模試の推定スコアで判断します。` });
    if (level !== "ok") msgs.push({ lv: "info", t: "選択肢：A. このまま進め、中間の模試で判断／B. 期間を延ばす（フェーズ2・3を延長）／C. 中間目標を置いて一度受験→弱点を直して再受験" });
    if (cur <= 95 && target >= 60) msgs.push({ lv: "info", t: "CEFR（公式）：60〜95＝B1、100〜125＝B2。" + (cur >= 60 && target <= 95 ? "同じB1帯の中での移動ですが、コツだけでなく英語力そのものの伸びが必要です。" : "") });
    if (p.minimumScore) msgs.push({ lv: "info", t: `最低ライン：${p.minimumScore}点（これを下回ると出願先が限られる）。` });
    return { level, label, target, gain, N, msgs };
  }

  function testDates(p, N) { // candidate dates for the real test (max 2 per 30 days — official)
    const start = p.startDate, end = p.deadline || addDays(start, N * 7 - 1); const out = [];
    if (p.testPolicy === "final") out.push(addDays(start, (N - 1) * 7 + 2));
    else {
      const gap = p.testPolicy === "monthly" ? 30 : 16; let d = addDays(start, 14);
      while (parse(d) <= parse(end)) { out.push(d); d = addDays(d, gap); }
    }
    return out.filter(d => parse(d) <= parse(end));
  }

  function dailyTasks(p, phase) {
    const wk = +p.weekdayMinutes || 60;
    const alloc = { 1: [["vocab", .35], ["lt", .15], ["format", .25], ["output", .15], ["typing", .10]],
                    2: [["vocab", .20], ["lt", .10], ["format", .40], ["output", .30]],
                    3: [["vocab", .15], ["format", .40], ["weakfmt", .30], ["output", .15]] }[phase];
    const L = { vocab: p.vocabBook ? `単語：${p.vocabBook} 新出${p.dailyNewWords || 30}語${p.dailyNewWordsStretch ? `（いけたら${p.dailyNewWordsStretch}語）` : ""}＋復習（朝・夕・翌朝の1日2〜3周）` : "単語（綴り・発音も）＋前日分の復習",
      lt: "Listen and Type 5〜10文（1回目で全部打つ→直す→句読点確認）", format: "今週の形式の演習（ロードマップの宿題欄）",
      output: "書く or 話す：写真1枚 or お題1つ（語数・秒数を記録）", typing: "英文タイピング練習", weakfmt: "弱点形式の時間内演習" };
    return alloc.map(([k, r]) => ({ id: k, label: L[k], min: Math.max(5, Math.round(wk * r / 5) * 5) }));
  }

  function generatePlan(p) {
    const fz = feasibility(p); const N = fz.N; const weak = p.weakTypes || [];
    const [n1, n2, n3] = phaseLengths(N, p);
    let m1 = ["diag", "vocab"]; if (p.grammarReview) m1.push("grammar"); m1.push("listen", "photo");
    let m2 = ["ir", "il", "iw", "speak", "sample"];
    // weak-type modules first inside phase 2 (keeps the order otherwise)
    const firstWeak = k => { const i = M[k].types.map(t => weak.indexOf(t)).filter(i => i >= 0); return i.length ? Math.min(...i) : 99; };
    m2 = m2.map((k, i) => [k, i]).sort((a, b) => firstWeak(a[0]) - firstWeak(b[0]) || a[1] - b[1]).map(x => x[0]);
    const m3 = n3 >= 3 ? [...Array(n3 - 2).fill("weak"), "full", "final"] : n3 === 2 ? ["full", "final"] : ["final"];
    const weeks1 = n2 === 0 && n1 === 1 ? [["diag", "vocab", "photo"]] : fill(m1, n1, weak);
    const weeks = [...weeks1.map(k => ({ phase: 1, keys: k })), ...fill(m2, n2, weak).map(k => ({ phase: 2, keys: k })), ...m3.map(k => ({ phase: 3, keys: [k] }))];
    // mock checkpoints: end of P1, end of P2, week N-1, + fill gaps > 5 weeks
    let cps = new Set([n1, n1 + n2, N - 1].filter(w => w >= 2 && w < N));
    const sorted = [0, ...[...cps].sort((a, b) => a - b), N];
    for (let i = 1; i < sorted.length; i++) if (sorted[i] - sorted[i - 1] > 5) cps.add(sorted[i - 1] + Math.round((sorted[i] - sorted[i - 1]) / 2));
    const cur = +p.currentScore; const tgt = fz.target;
    const expected = w => Math.min(tgt, roundUp5(cur + (tgt - cur) * (w / N)));
    const tests = testDates(p, N);
    const out = weeks.map((w, i) => {
      const n = i + 1; const start = addDays(p.startDate, i * 7); const end = addDays(start, 6);
      const mod = merge(w.keys);
      return { n, phase: w.phase, start, end, label: `${md(start)}–${md(end)}`, ...mod, typesJa: mod.types.length > 6 ? "全形式" : mod.types.map(t => TYPES[t].ja).join("／") || (w.keys[0] === "diag" ? "全形式（診断）" : w.keys[0] === "weak" ? "模試で低かった形式" : "全形式（軽め）"),
        mock: cps.has(n) ? { expected: expected(n) } : null, tests: tests.filter(d => d >= start && d <= end) };
    });
    const phases = PHASES.map((ph, i) => { const ws = out.filter(w => w.phase === ph.n); return ws.length ? { ...ph, weeks: ws.length, from: ws[0].start, to: ws[ws.length - 1].end, daily: dailyTasks(p, ph.n) } : null; }).filter(Boolean);
    return { generatedAt: iso(Date.now()), N, feasibility: fz, phases, weeks: out, tests,
      weeklyMinutes: (+p.weekdayMinutes || 60) * 5 + (+(p.weekendMinutes || p.weekdayMinutes) || 60) * 2 };
  }

  function weekOf(plan, dateStr) { const w = plan.weeks.find(w => dateStr >= w.start && dateStr <= w.end); return w || (dateStr < plan.weeks[0].start ? null : plan.weeks[plan.weeks.length - 1]); }
  const mockScore = m => m.score != null && m.score !== "" ? +m.score : (+m.low + +m.high) / 2;

  function status(p, plan, data, today) {
    const res = { level: "none", label: "データ待ち", reasons: [] };
    const N = plan.N; const tgt = plan.feasibility.target; const cur = +p.currentScore;
    const mocks = (data.mocks || []).filter(m => m.date >= p.startDate && m.date <= today).sort((a, b) => a.date.localeCompare(b.date));
    let scoreLv = null;
    if (mocks.length) {
      const m = mocks[mocks.length - 1]; const wn = Math.max(1, Math.ceil((parse(m.date) - parse(p.startDate) + DAY) / DAY / 7));
      const exp = Math.min(tgt, roundUp5(cur + (tgt - cur) * (Math.min(wn, N) / N))); const s = mockScore(m); const diff = s - exp;
      scoreLv = diff >= -5 ? "ok" : diff >= -10 ? "warn" : "bad";
      res.reasons.push(`最新の${m.kind === "official" ? "本番" : "模試"}（${md(m.date)}）${s}点／${wn}週目の目安${exp}点（差${diff >= 0 ? "+" : ""}${diff}）`);
    }
    const from = addDays(today, -6); const logs = (data.logs || []).filter(l => l.date >= from && l.date <= today);
    const mins = logs.reduce((a, l) => a + (+l.minutes || 0), 0); const elapsed = Math.min(7, Math.max(1, Math.round((parse(today) - parse(p.startDate)) / DAY) + 1));
    const planned = Math.round(plan.weeklyMinutes * elapsed / 7); const ratio = planned ? mins / planned : 0;
    const timeLv = ratio >= .8 ? "ok" : ratio >= .5 ? "warn" : "bad";
    res.reasons.push(`直近${elapsed}日の学習 ${mins}分／計画 ${planned}分（${Math.round(ratio * 100)}%）`);
    res.studyRatio = ratio;
    const rank = { ok: 0, warn: 1, bad: 2 };
    if (!mocks.length && !logs.length) return { ...res, level: "none", label: "データ待ち" };
    const lv = scoreLv ? (rank[scoreLv] >= rank[timeLv] ? scoreLv : timeLv) : timeLv;
    return { ...res, level: lv, label: { ok: "順調", warn: "注意", bad: "遅れ" }[lv] };
  }

  window.DETPlanner = { TYPES, PHASES, generatePlan, feasibility, status, weekOf, mockScore, util: { iso, parse, addDays, md, roundUp5, DAY } };
})();
