/* Seed data. デモ生徒のサンプルデータ（架空）。
   初回起動時にロードされます。独自の生徒を追加してテストできます。 */
window.DET_SEED = function () {
  return {
    version: 1,
    students: [{
      id: "s_demo", name: "デモ 生徒", grade: "高校生",
      profileNote: "これはデモ用の架空の生徒です。実際に生徒を登録する際は、講師モードから「生徒を登録」してください。",
      startDate: "2026-01-01", deadline: "2026-04-01", weeks: null,
      deadlineNote: "デモ用のサンプル締切です。",
      currentScore: 70, currentScoreDate: "2026-01-01", sub: { R: null, L: null, W: null, S: null },
      subNote: "",
      targetScore: 100, stretchScore: 105, minimumScore: 85,
      targetNote: "デモ用の目標スコアです。",
      weekdayMinutes: 60, weekendMinutes: null,
      studyTimeNote: "",
      lessonsPerWeek: 1, lessonDay: "土", lessonTime: "14:00", lessonNote: "",
      weakTypes: ["interactiveWriting", "readThenSpeak"],
      weakNote: "デモ用の苦手形式です。",
      grammarReview: true, phase1Weeks: 3,
      vocabBook: "", vocabProgress: 100, dailyNewWords: 20, dailyNewWordsStretch: 30,
      vocabNote: "",
      testPolicy: "monthly", testPolicyNote: "",
      interests: ["general"],
      monthFocus: "",
      instructor: "講師", active: true
    }],
    data: {
      s_demo: {
        logs: [], practice: [], taskChecks: {}, weekNotes: {},
        mocks: [{ id: "m1", date: "2026-01-01", kind: "official", score: 70, low: null, high: null, sub: { R: null, L: null, W: null, S: null }, note: "デモ用のサンプルスコア" }],
        lessons: []
      }
    },
    settings: { role: "student", pin: "1234", deviceStudentId: "s_demo", instructorName: "講師",
      llm: { useLLM: false, endpoint: "https://api.openai.com/v1/chat/completions", model: "", apiKey: "" } }
  };
};
