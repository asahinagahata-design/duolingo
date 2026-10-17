/* NES DET Coach — built-in ORIGINAL question bank (written for NES; not copied from any book or official test).
   level: 1 = 基礎 (〜75), 2 = 中級 (80〜100), 3 = 上級 (105〜). topic tags let the app prefer a student's interests. */
window.DET_BANK = {
  // ---------- Read and Complete (C-test): first & last sentence stay intact, middle words get cut ----------
  readComplete: [
    { level: 1, topic: "sports", text: "Tom plays baseball for his school team. He practices every day after class, even when it rains. His coach says that hard work is more important than talent. Tom believes this, so he never skips training. Next month, his team will play in a big tournament." },
    { level: 1, topic: "daily", text: "My family moved to a new town last spring. At first, I did not know anyone at my school. One day, a classmate asked me to join the lunch club. We talked about music and movies for an hour. Now she is my best friend." },
    { level: 1, topic: "travel", text: "Many students want to study in another country. Living abroad helps them learn a language quickly. They also meet people from different cultures. However, it can be hard to be away from family. Good planning makes the experience much easier." },
    { level: 2, topic: "health", text: "Sleep plays an important role in how we learn. During deep sleep, the brain organizes the information it received during the day. Students who stay up late before an exam often remember less than those who rest well. Short naps can also improve focus in the afternoon. Experts recommend a regular bedtime, even on weekends." },
    { level: 2, topic: "sports", text: "Injuries are a common problem for young athletes. Many of them train too hard without enough rest, and their bodies cannot recover. A good recovery plan usually includes stretching, healthy food, and enough sleep. Some players also work with trainers who check their progress every week. With patience, most athletes return to the field stronger than before." },
    { level: 2, topic: "society", text: "Public libraries have changed a lot in recent years. In the past, people visited them mainly to borrow books. Today, many libraries offer free internet, study rooms, and classes for adults. Some even lend tools and musical instruments to local residents. For many communities, the library has become a place to meet and learn together." },
    { level: 3, topic: "science", text: "Scientists have long debated why humans forget information so quickly. One influential theory suggests that memories fade unless they are actively retrieved. When a learner recalls a fact several times over increasing intervals, the memory becomes significantly more stable. This principle, often called spaced repetition, is now built into many language learning applications. Critics, however, point out that understanding a concept deeply matters as much as remembering it." },
    { level: 3, topic: "environment", text: "Cities around the world are experimenting with ways to reduce traffic in their centers. Some have introduced charges for drivers who enter crowded areas during peak hours. Others have invested heavily in bicycle lanes and reliable public transportation. Although these policies are sometimes unpopular at first, residents often support them once air quality improves. The challenge is to design solutions that are fair to people who depend on cars for work." }
  ],
  // ---------- Fill in the Blanks: extra sentences (vocab sheet sentences are added automatically) ----------
  fillBlanks: [
    { level: 1, sentence: "She was very tired, so she went to bed early.", answer: "tired" },
    { level: 1, sentence: "Please close the window because it is cold.", answer: "window" },
    { level: 1, sentence: "He forgot his umbrella and got wet in the rain.", answer: "forgot" },
    { level: 1, sentence: "Our team won the game in the last inning.", answer: "inning" },
    { level: 1, sentence: "I usually study English for an hour every evening.", answer: "usually" },
    { level: 1, sentence: "The train was late, so we missed the beginning of the movie.", answer: "missed" },
    { level: 2, sentence: "Regular exercise can improve both your mood and your memory.", answer: "improve" },
    { level: 2, sentence: "The coach decided to change the batting order before the final.", answer: "decided" },
    { level: 2, sentence: "Most universities require an English score for international students.", answer: "require" },
    { level: 2, sentence: "He apologized for arriving late to the meeting.", answer: "apologized" },
    { level: 2, sentence: "The company plans to expand its business into Asia next year.", answer: "expand" },
    { level: 3, sentence: "The new evidence made the original theory far less plausible.", answer: "plausible" },
    { level: 3, sentence: "Her resilient attitude helped her recover from a serious injury.", answer: "resilient" },
    { level: 3, sentence: "The results were inconsistent, so the researchers repeated the experiment.", answer: "inconsistent" }
  ],
  // ---------- Listen and Type (browser text-to-speech reads these) ----------
  listenType: [
    { level: 1, text: "I have practice after school today." },
    { level: 1, text: "Can you tell me where the station is?" },
    { level: 1, text: "We went to the beach last summer." },
    { level: 1, text: "My brother is taller than my father." },
    { level: 1, text: "She drinks coffee every morning." },
    { level: 1, text: "The game starts at seven tonight." },
    { level: 2, text: "The library will be closed during the holidays." },
    { level: 2, text: "He has been studying English for three years." },
    { level: 2, text: "If it rains tomorrow, the game will be canceled." },
    { level: 2, text: "Students are required to submit their essays by Friday." },
    { level: 2, text: "The team's new pitcher throws faster than anyone else." },
    { level: 2, text: "I would like to change my reservation to next week." },
    { level: 3, text: "Although the experiment failed, the researchers learned a great deal." },
    { level: 3, text: "The university offers scholarships to students who show strong leadership." },
    { level: 3, text: "Recent studies suggest that regular sleep improves long-term memory." },
    { level: 3, text: "The committee postponed its decision until further evidence was available." }
  ],
  // ---------- Interactive Reading: passage + 6 questions ----------
  interactiveReading: [
    {
      level: 2, topic: "sports", title: "Learning a Language Through Sport",
      // Q1 Complete the Sentences: [[word|opt1|opt2|opt3]] — first option is correct (shuffled in UI)
      p1: "Many young athletes move abroad to [[continue|continuing|continued]] their careers. At first, the language barrier can feel [[overwhelming|overwhelm|overwhelmed]]. Simple tasks, such as ordering food or [[understanding|understand|understood]] a coach's instructions, take a lot of energy. However, sport gives players a natural [[reason|reasonable|reasoning]] to communicate every day.",
      // Q2 Complete the Passage: choose the sentence for the gap
      p2Before: "Teammates often become the first teachers. They use gestures, repeat key words, and laugh together when someone makes a mistake.",
      p2Options: [
        "Because of this friendly pressure, many players pick up useful phrases surprisingly quickly.",
        "Baseball was first played professionally in the nineteenth century.",
        "Some stadiums can hold more than fifty thousand fans.",
        "Coaches usually prefer players who do not talk during practice."
      ],
      p2After: "Still, everyday conversation is only the first step. Players who plan to study at a university also need academic English, which is more formal and uses a wider range of vocabulary.",
      // Q3–4 Highlight the Answer
      highlight: [
        { q: "What do teammates do to help new players understand?", a: "They use gestures, repeat key words, and laugh together" },
        { q: "Why do some players need academic English?", a: "Players who plan to study at a university also need academic English" }
      ],
      idea: { options: [
        "Sport can help athletes learn a language, but academic study needs extra preparation.",
        "Athletes should not move abroad until they speak the language perfectly.",
        "Coaches are responsible for teaching players grammar.",
        "Baseball is the most popular sport among international students."
      ] },
      titleOptions: [ "From the Field to the Classroom", "The History of Baseball", "Why Coaches Dislike Talking", "Building a Bigger Stadium" ]
    },
    {
      level: 3, topic: "science", title: "Why We Forget",
      p1: "Most people assume that forgetting is simply a [[failure|fail|failed]] of memory. Researchers, however, increasingly view it as a [[useful|use|usefully]] process. By letting go of details that are rarely needed, the brain can [[focus|focused|focusing]] on information that matters. The problem for students is that exam vocabulary often [[falls|fall|fallen]] into the category of rarely used details.",
      p2Before: "To fight this natural tendency, learners can review new words at carefully planned intervals.",
      p2Options: [
        "Each successful review signals to the brain that the information is worth keeping.",
        "Dictionaries were much heavier in the past than they are today.",
        "Some languages have more than one alphabet.",
        "Exams are usually held in large, quiet rooms."
      ],
      p2After: "Equally important is the quality of each review. Simply looking at a word list is less effective than trying to recall the meaning before checking the answer.",
      highlight: [
        { q: "How do researchers increasingly view forgetting?", a: "they increasingly view it as a useful process" },
        { q: "What is more effective than simply looking at a word list?", a: "trying to recall the meaning before checking the answer" }
      ],
      idea: { options: [
        "Forgetting is natural, but planned and active review helps us keep important words.",
        "The brain can remember every detail if we sleep enough.",
        "Students should avoid learning new vocabulary before exams.",
        "Word lists are the most effective way to study."
      ] },
      titleOptions: [ "Working With Our Forgetful Brains", "A History of Dictionaries", "How to Build a Quiet Exam Room", "Languages With Many Alphabets" ]
    },
    {
      level: 1, topic: "daily", title: "A New School",
      p1: "Ken moved to a new school in April. On his first day, he felt very [[nervous|nervously|nerve]]. He did not [[know|knew|known]] where the classrooms were. A kind student named Aya [[showed|show|showing]] him around the building and introduced him to her friends.",
      p2Before: "After a few weeks, Ken started to enjoy his new life.",
      p2Options: [
        "He joined the baseball club and practiced with his new friends every afternoon.",
        "The school building was built more than fifty years ago.",
        "Aya's favorite color is blue.",
        "Trains in the city are often crowded in the morning."
      ],
      p2After: "Now, when a new student arrives, Ken is the first person to say hello.",
      highlight: [
        { q: "Who helped Ken on his first day?", a: "A kind student named Aya" },
        { q: "What does Ken do now when a new student arrives?", a: "Ken is the first person to say hello" }
      ],
      idea: { options: [
        "With help from others, Ken got used to his new school and now helps others.",
        "Ken did not like his new school at all.",
        "Aya wanted to move to another school.",
        "The baseball club needed more members."
      ] },
      titleOptions: [ "Finding a Place at a New School", "The Oldest School Building", "Crowded Morning Trains", "Aya's Favorite Things" ]
    }
  ],
  // ---------- Interactive Listening: Listen and Respond (TTS) + Summarize ----------
  interactiveListening: [
    {
      level: 2, title: "履修相談（学生と大学の職員）", scenario: "You are a student talking to an advisor at your university about your class schedule.",
      turns: [
        { say: "Hi, thanks for coming in. I see you want to change your schedule. What seems to be the problem?",
          options: ["My morning class overlaps with team practice, so I'd like to move it to the afternoon.", "I like the weather here very much.", "No, thank you. I already ate lunch.", "The library opens at nine."], correct: 0 },
        { say: "I understand. There's an afternoon section on Tuesdays and Thursdays, but it's almost full. Would that work for you?",
          options: ["Yes, that would work. Could you add me before it fills up?", "I don't have any brothers or sisters.", "It was a great game last night.", "Please turn left at the corner."], correct: 0 },
        { say: "Done. You're registered. Just remember that the reading list for that section is a little longer.",
          options: ["Thanks for letting me know. I'll get the books this week.", "I'm sorry, I can't swim.", "That sounds like a long movie.", "My phone number has changed."], correct: 0 }
      ],
      summaryHint: "誰が・何の相談をして・どう解決したか（クラスが練習と重なる→火木午後に変更→読書リストが多い）"
    },
    {
      level: 1, title: "部活の練習時間（チームメイト同士）", scenario: "You are talking with a teammate about practice this weekend.",
      turns: [
        { say: "Hey, did you hear that practice on Saturday is starting earlier?",
          options: ["No, I didn't. What time does it start now?", "Yes, I like pizza.", "It's on the second floor.", "I bought new shoes yesterday morning."], correct: 0 },
        { say: "It starts at eight instead of ten, because the field is being used in the afternoon.",
          options: ["Oh, okay. I'll need to take an earlier bus, then.", "That's a beautiful painting.", "I've never been to Canada.", "Please send me the recipe."], correct: 0 },
        { say: "Do you want to meet at the station and go together?",
          options: ["Sure, let's meet there at seven thirty.", "I don't think it will snow.", "My favorite subject is math.", "He is my older cousin."], correct: 0 }
      ],
      summaryHint: "土曜の練習が8時開始に早まった理由（午後にグラウンドが使われる）と、駅で7時半に待ち合わせること"
    }
  ],
  // ---------- Writing / Speaking prompts ----------
  photoScenes: [ // text stand-ins for photos (prototype has no image set)
    { level: 1, ja: "公園のベンチで、年配の男性が新聞を読んでいて、そばで犬が寝ている。後ろに大きな木。", emoji: "🧓📰🐕🌳" },
    { level: 1, ja: "野球場で、ユニフォーム姿の選手がバットを構え、観客席に大勢のファンがいる。夕方。", emoji: "⚾🏟️👥🌇" },
    { level: 1, ja: "台所で、親子が一緒にカレーを作っている。テーブルに野菜が並んでいる。", emoji: "👩‍👧🍛🥕" },
    { level: 2, ja: "雨の駅前で、傘をさした人々が横断歩道を渡っている。手前でタクシーを待つ女性。", emoji: "🌧️☂️🚕" },
    { level: 2, ja: "図書館の自習スペースで、学生3人がノートパソコンを開いて話し合っている。", emoji: "📚💻🧑‍🎓" },
    { level: 3, ja: "空港の出発ロビーで、スーツケースを持った若者が家族と別れのハグをしている。窓の外に飛行機。", emoji: "✈️🧳🤗" }
  ],
  interactiveWriting: [
    { level: 1, topic: "daily", prompt: "Describe a hobby you enjoy. Why do you like it?", followUp: "How has this hobby changed you or your daily life?" },
    { level: 1, topic: "sports", prompt: "Who is a person you admire? Explain why.", followUp: "What is one thing you have done to become more like this person?" },
    { level: 2, topic: "education", prompt: "Some people think students should study abroad. Others think it is better to study in their own country. What is your opinion?", followUp: "What are some difficulties of studying abroad, and how can students deal with them?" },
    { level: 2, topic: "sports", prompt: "Should high school athletes focus only on their sport, or should they also spend time on academic study?", followUp: "Describe a way a student athlete could balance training and study." },
    { level: 2, topic: "technology", prompt: "Do smartphones help or hurt students' learning?", followUp: "What rules, if any, should schools have about phones?" },
    { level: 3, topic: "environment", prompt: "Should governments charge money for plastic bags to protect the environment?", followUp: "Besides charging money, what other actions could reduce plastic waste?" },
    { level: 3, topic: "society", prompt: "Is it better to work for a large company or a small one?", followUp: "How might your answer change depending on a person's stage of life?" }
  ],
  writingSample: [
    { level: 1, topic: "daily", prompt: "Describe your favorite place in your hometown and explain why it is special to you." },
    { level: 2, topic: "sports", prompt: "What is the most important lesson you have learned from sports or another activity? Explain with an example." },
    { level: 2, topic: "education", prompt: "Many universities want students with experiences outside the classroom. What experience would you share, and why?" },
    { level: 3, topic: "society", prompt: "Some people believe failure is necessary for success. Do you agree or disagree? Use specific reasons and examples." }
  ],
  readThenSpeak: [
    { level: 1, topic: "daily", prompt: "Talk about a time you helped someone.", bullets: ["Who did you help?", "What did you do?", "How did you feel afterward?"] },
    { level: 1, topic: "sports", prompt: "Talk about a sport you enjoy.", bullets: ["What is the sport?", "When did you start?", "Why do you like it?"] },
    { level: 2, topic: "education", prompt: "Talk about a goal you have for the next year.", bullets: ["What is the goal?", "Why is it important to you?", "What steps will you take to reach it?"] },
    { level: 2, topic: "travel", prompt: "Talk about a time you were in a foreign country or a new place.", bullets: ["Where were you?", "What surprised you?", "What did you learn?"] },
    { level: 3, topic: "society", prompt: "Talk about a difficult decision you made.", bullets: ["What was the decision?", "What options did you have?", "Do you think you made the right choice? Why?"] }
  ],
  interactiveSpeaking: [ // one set = a short "interview"; questions are played once with no prep time
    { level: 1, topic: "sports", title: "スポーツと日常", questions: ["What sport do you like to play or watch?", "How often do you do it?", "Who do you usually play or watch with?", "What is the hardest part of this sport?", "Would you recommend it to a friend? Why?", "How would your life be different without it?"] },
    { level: 2, topic: "education", title: "留学と将来", questions: ["Why do you want to study abroad?", "What kind of school life do you imagine?", "What do you think will be most difficult at first?", "How are you preparing for that challenge?", "What would you like to do after graduation?", "How could your experience help other students?"] },
    { level: 3, topic: "society", title: "社会と変化", questions: ["How has technology changed the way people communicate?", "Is that change mostly positive or negative?", "What problems can social media cause for young people?", "Who should be responsible for solving those problems?", "Can you give an example from your own experience?", "How do you think communication will change in the next ten years?"] }
  ],
  speakingSample: [
    { level: 1, topic: "daily", prompt: "Introduce yourself and talk about something you are proud of." },
    { level: 2, topic: "sports", prompt: "Describe a challenge you have overcome and what it taught you." },
    { level: 3, topic: "education", prompt: "What do you hope to contribute to your university community? Explain with examples." }
  ],
  // ---------- Rubric (official criteria names; band notes = NES summary of the official rubric) ----------
  rubric: {
    writing: ["内容（Content）：設問の全部に答え、理由・例で展開している", "つながり（Discourse coherence）：接続語・代名詞で文がつながっている", "文法（Grammar）：複文（because / although / which / if）を正しく使えている", "語彙（Lexis）：同じ語の繰り返しが少なく、適切な語を選べている"],
    speaking: ["内容（Content）：質問・箇条書きの全部に答えている", "つながり（Discourse coherence）：First / Also / For example / So などで流れがある", "流暢さ（Fluency）：長い沈黙がなく、時間をほぼ使い切っている", "文法（Grammar）：時制・三単現・複数形が正しい", "語彙（Lexis）：言い換えができ、繰り返しが少ない", "発音（Pronunciation）：聞き手が理解できる"],
    bands: "60–95帯：基本的な回答・基本の接続語のみ・短いまとまり。100–125帯：関連があり部分的に展開・接続語を適切に使う・ある程度長く話せる（DET公式ルーブリックの要約）。"
  },
  templates: {
    photo: "概要1文 → 詳細1〜2文（位置・服装・動作）→ 推測1文（It looks like… / They might be…）。This is a picture of… は省略。",
    opinion: "意見（I think…）→ 理由1（First, …）→ 具体例（For example, …）→ 理由2（Also, …）→ まとめ（So, …）。文そのものは暗記せず、型だけ使う。",
    speaking: "最初の1文で質問に直接答える → 理由 → 具体例（自分の経験）→ 一言でまとめる。沈黙しないことを最優先。"
  }
};
