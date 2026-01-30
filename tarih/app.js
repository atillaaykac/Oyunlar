// AYT Tarih - app.js (FIXED: null addEventListener + robust selectors)
// - DOMContentLoaded ile başlar (elementler garanti).
// - ID farklıysa fallback selector ile butonları yine bulur.
// Özellikler aynı: Sonraki, yanlışta kilit, başarı %, kronometre, testte Ana Menü, ses kontrolleri.

document.addEventListener("DOMContentLoaded", () => {
  // ---------- Helpers ----------
  const $id = (id) => document.getElementById(id);
  const $qs = (sel) => document.querySelector(sel);

  function pick(id, fallbackSelector) {
    return $id(id) || (fallbackSelector ? $qs(fallbackSelector) : null);
  }

  function showScreen(which) {
    // which: "menu" | "quiz" | "result"
    menuScreen?.classList.toggle("active", which === "menu");
    quizScreen?.classList.toggle("active", which === "quiz");
    resultScreen?.classList.toggle("active", which === "result");
  }

  // ---------- DOM (with fallbacks) ----------
  const menuScreen = pick("menuScreen");
  const quizScreen = pick("quizScreen");
  const resultScreen = pick("resultScreen");

  const categorySelect = pick("categorySelect", "#menuScreen select#categorySelect, #menuScreen select[name='category']");
  const subCategorySelect = pick("subCategorySelect", "#menuScreen select#subCategorySelect, #menuScreen select[name='subCategory']");

  // --- Categories (UI only). DATA keys must match subcategory values.
  const CATEGORY_MAP = {
    mm: [
      { value: "cemiyetler", label: "Cemiyetler" },
      { value: "genelgeler", label: "Genelgeler ve Kongreler" },
      { value: "son", label: "Milli Mücadele Sonu" },
      { value: "dogu", label: "Cepheler-Doğu" },
      { value: "guney", label: "Cepheler-Güney" },
      { value: "bati", label: "Cepheler-Batı" },
    ],
    ww2: [
      { value: "ww2_surec", label: "2.Dünya Savaşı-Süreç" },
      { value: "ww2_sonrasi", label: "2.Dünya Savaşı Sonrası" },
    ],
    osmanli: [
      { value: "osmanli_karisik", label: "Beylikten Devlete Osmanlı - Karışık" },
    ],
    inkilap: [
      { value: "inkilap_karisik", label: "Atatürkçülük ve Türk İnkılabı - Karışık" },
    ]
  };

  function populateSubcategories(catKey) {
    if (!subCategorySelect) return;
    const list = CATEGORY_MAP[catKey] || CATEGORY_MAP.mm;
    subCategorySelect.innerHTML = "";
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = "Lütfen Alt Kategori Seçiniz";
    subCategorySelect.appendChild(ph);
    list.forEach(s => {
      const o = document.createElement("option");
      o.value = s.value;
      o.textContent = s.label;
      subCategorySelect.appendChild(o);
    });
  }

  // Init & bind category select (if present)
  const initialCat = categorySelect?.value === "ww2" ? "ww2" : "mm";
  populateSubcategories(initialCat);
  categorySelect?.addEventListener("change", () => populateSubcategories(categorySelect.value));
  const startBtn = pick("startBtn", "#menuScreen .menu-buttons .primary, #menuScreen button.primary");
  const howToBtn = pick("howToBtn", "#menuScreen .menu-buttons button:not(.primary)");

  const questionIndexEl = pick("questionIndex");
  const scoreEl = pick("score");
  const questionTextEl = pick("questionText");
  const optionsEl = pick("options");

  const timerEl = pick("timer");
  const liveRateEl = pick("liveRate");
  const nextBtn = pick("nextBtn", "#quizScreen .quiz-actions .primary");
  const menuBtn = pick("menuBtn", "#quizScreen .quiz-actions button:not(.primary)");

  const correctCountEl = pick("correctCount");
  const wrongCountEl = pick("wrongCount");
  const successRateEl = pick("successRate");
  const wrongListEl = pick("wrongList");
  const finalTimeEl = pick("finalTime");

  // ---------- AUDIO ----------
  const bgMusic = pick("bgMusic");
  const correctSound = pick("correctSound");
  const wrongSound = pick("wrongSound");
  const muteBtn = pick("muteBtn");
  const volumeSlider = pick("volumeSlider");

  // If critical nodes missing, don't crash; show a helpful message.
  const criticalMissing = [];
  if (!menuScreen) criticalMissing.push("menuScreen");
  if (!quizScreen) criticalMissing.push("quizScreen");
  if (!resultScreen) criticalMissing.push("resultScreen");
  if (!subCategorySelect) criticalMissing.push("subCategorySelect");
  if (!startBtn) criticalMissing.push("startBtn");
  if (!nextBtn) criticalMissing.push("nextBtn");
  if (!optionsEl) criticalMissing.push("options");
  if (!questionTextEl) criticalMissing.push("questionText");

  if (criticalMissing.length) {
    console.error("Eksik element(ler):", criticalMissing.join(", "));
    // Fail softly: keep menu visible; do not throw.
    return;
  }

  // ---------- STATE ----------
  let questions = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let selectedCount = 100;
  let wrongQuestions = [];

  let lockedToCorrect = false;
  let answeredCorrect = false;

  // Timer
  let timerSeconds = 0;
  let timerHandle = null;

  // ---------- AUDIO PREFS ----------
  const AUDIO_KEY = "ayt_tarih_audio";
  const defaultAudio = { muted: false, volume: 0.25 };
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  function loadAudioPrefs() {
    try {
      const raw = localStorage.getItem(AUDIO_KEY);
      if (!raw) return { ...defaultAudio };
      const p = JSON.parse(raw);
      return {
        muted: !!p.muted,
        volume: clamp01(Number.isFinite(Number(p.volume)) ? Number(p.volume) : defaultAudio.volume),
      };
    } catch {
      return { ...defaultAudio };
    }
  }

  function saveAudioPrefs(p) {
    try { localStorage.setItem(AUDIO_KEY, JSON.stringify(p)); } catch {}
  }

  let audioPrefs = loadAudioPrefs();

  function applyAudioPrefs() {
    if (!bgMusic || !correctSound || !wrongSound) return;

    const vol = audioPrefs.muted ? 0 : audioPrefs.volume;
    bgMusic.volume = vol;
    correctSound.volume = vol;
    wrongSound.volume = vol;

    if (volumeSlider) volumeSlider.value = String(Math.round(audioPrefs.volume * 100));
    if (muteBtn) {
      muteBtn.textContent = audioPrefs.muted ? "🔇" : "🔊";
      muteBtn.setAttribute("aria-pressed", audioPrefs.muted ? "true" : "false");
    }
  }

  applyAudioPrefs();

  // Start bg music on first user gesture (if not muted)
  window.addEventListener("click", () => {
    if (bgMusic && !audioPrefs.muted && bgMusic.paused) {
      bgMusic.play().catch(() => {});
    }
  }, { once: true });

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      audioPrefs.muted = !audioPrefs.muted;
      applyAudioPrefs();
      saveAudioPrefs(audioPrefs);
      if (bgMusic && !audioPrefs.muted) bgMusic.play().catch(() => {});
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener("input", () => {
      audioPrefs.volume = clamp01(parseInt(volumeSlider.value, 10) / 100);
      if (audioPrefs.volume > 0) audioPrefs.muted = false;
      applyAudioPrefs();
      saveAudioPrefs(audioPrefs);
    });
  }

  // ---------- HELP ----------
  if (howToBtn) {
    howToBtn.addEventListener("click", () => {
      alert(
        "Alt kategoriyi seç, soru sayısını belirle ve Başla'ya bas.\n" +
        "Yanlış yaparsan yalnızca doğru şık aktif kalır.\n" +
        "Doğruyu işaretleyince 'Sonraki' açılır.\n" +
        "İstersen test sırasında 'Ana Menü' ile çıkabilirsin."
      );
    });
  }

  // ---------- Question count ----------
  document.querySelectorAll(".question-count button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".question-count button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCount = parseInt(btn.dataset.count, 10);
    });
  });

  // ---------- Menu button during quiz ----------
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      const ok = confirm("Test bitmeden ana menüye dönmek istiyor musun? (İlerlemen sıfırlanacak)");
      if (ok) goToMenu();
    });
  }

  // ---------- Start ----------
  startBtn.addEventListener("click", () => {
    const sub = subCategorySelect.value;
    if (!sub) {
      alert("Lütfen alt kategori seç");
      return;
    }

    if (!window.DATA || !window.DATA[sub] || window.DATA[sub].length === 0) {
      alert("Bu alt kategori için soru yok");
      return;
    }

    questions = shuffle([...window.DATA[sub]]).slice(0, selectedCount);

    // reset
    currentQuestionIndex = 0;
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    wrongQuestions = [];
    lockedToCorrect = false;
    answeredCorrect = false;

    // timer
    stopTimer();
    timerSeconds = 0;
    renderTimer();
    startTimer();

    // UI
    updateLiveRate();
    showScreen("quiz");

    loadQuestion();
  });

  // ---------- Next ----------
  nextBtn.addEventListener("click", () => {
    if (!answeredCorrect) return;

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      loadQuestion();
    } else {
      finishQuiz();
    }
  });

  // ---------- Load question ----------
  function loadQuestion() {
    const q = questions[currentQuestionIndex];

    lockedToCorrect = false;
    answeredCorrect = false;

    nextBtn.disabled = true;
    nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? "Bitir" : "Sonraki";

    if (questionIndexEl) questionIndexEl.textContent = `${currentQuestionIndex + 1} / ${questions.length}`;
    if (scoreEl) scoreEl.textContent = String(score);
    questionTextEl.textContent = q.question;

    optionsEl.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.type = "button";
      btn.addEventListener("click", () => selectAnswer(btn, i, q));
      optionsEl.appendChild(btn);
    });
  }

  // ---------- Answer selection ----------
  function selectAnswer(button, index, q) {
    const buttons = [...optionsEl.querySelectorAll("button")];
    const correctIndex = q.answer;

    if (lockedToCorrect && index !== correctIndex) return;

    if (index === correctIndex) {
      button.classList.add("correct");
      buttons.forEach((b) => b.classList.add("disabled"));

      if (!answeredCorrect) {
        if (correctSound) {
          correctSound.currentTime = 0;
          correctSound.play().catch(() => {});
        }
        score += 10;
        correctCount++;
      }

      answeredCorrect = true;
      nextBtn.disabled = false;
      updateLiveRate();
      return;
    }

    // wrong
    button.classList.add("wrong");

    if (!lockedToCorrect) {
      if (wrongSound) {
        wrongSound.currentTime = 0;
        wrongSound.play().catch(() => {});
      }
      wrongCount++;
      wrongQuestions.push(q);
      updateLiveRate();
    }

    lockedToCorrect = true;

    // disable all non-correct
    buttons.forEach((b, i) => {
      if (i !== correctIndex) b.classList.add("disabled");
      else b.classList.remove("disabled");
    });

    buttons[correctIndex].classList.add("correct");
    nextBtn.disabled = true;
  }

  // ---------- Live rate ----------
  function updateLiveRate() {
    if (!questions.length) {
      if (liveRateEl) liveRateEl.textContent = "%0";
      return;
    }
    const raw = ((correctCount - wrongCount) / questions.length) * 100;
    const pct = Math.max(0, Math.min(100, Math.round(raw)));
    if (liveRateEl) liveRateEl.textContent = `%${pct}`;
  }

  // ---------- Timer ----------
  function startTimer() {
    timerHandle = setInterval(() => {
      timerSeconds += 1;
      renderTimer();
    }, 1000);
  }
  function stopTimer() {
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = null;
  }
  function renderTimer() {
    if (timerEl) timerEl.textContent = formatTime(timerSeconds);
  }
  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // ---------- Finish ----------
  function finishQuiz() {
    stopTimer();
    showScreen("result");

    if (correctCountEl) correctCountEl.textContent = String(correctCount);
    if (wrongCountEl) wrongCountEl.textContent = String(wrongCount);

    const raw = ((correctCount - wrongCount) / questions.length) * 100;
    const pct = Math.max(0, Math.min(100, Math.round(raw)));
    if (successRateEl) successRateEl.textContent = `%${pct}`;
    if (finalTimeEl) finalTimeEl.textContent = formatTime(timerSeconds);

    if (wrongListEl) {
      wrongListEl.innerHTML = "";
      wrongQuestions.forEach((q) => {
        const li = document.createElement("li");
        li.innerHTML = `<b>${q.question}</b><br>Doğru cevap: ${q.options[q.answer]}`;
        wrongListEl.appendChild(li);
      });
    }
  }

  // ---------- Go to menu ----------
  function goToMenu() {
    stopTimer();

    questions = [];
    currentQuestionIndex = 0;
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    wrongQuestions = [];
    lockedToCorrect = false;
    answeredCorrect = false;

    optionsEl.innerHTML = "";
    questionTextEl.textContent = "";
    if (questionIndexEl) questionIndexEl.textContent = "";
    if (scoreEl) scoreEl.textContent = "0";
    if (liveRateEl) liveRateEl.textContent = "%0";
    if (timerEl) timerEl.textContent = "00:00";
    nextBtn.disabled = true;
    nextBtn.textContent = "Sonraki";

    showScreen("menu");
  }

  // ---------- Utils ----------
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
});
