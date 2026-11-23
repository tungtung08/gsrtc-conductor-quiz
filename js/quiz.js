const params = new URLSearchParams(window.location.search);
const subjectParam = params.get("subject");
const paperParam = params.get("paper");

let allQuestions = [];
let activeQuestions = [];
let currentIndex = 0;
const userChoices = {};

const headingEl = document.getElementById("test-heading");
const countEl = document.getElementById("question-count");
const metaEl = document.getElementById("meta-info");
const scoreEl = document.getElementById("live-score");
const questionEl = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedbackEl = document.getElementById("feedback-text");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

function parseQuestionsText(rawText) {
  const blocks = rawText.trim().split(/\n\s*\n/);
  const parsed = [];

  blocks.forEach((block, i) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 6) return;

    const headerMatch = lines[0].match(/\[Paper:\s*(\d+)\]\s*\[Subject:\s*([^\]]+)\]/i);
    const paperNo = headerMatch ? parseInt(headerMatch[1], 10) : 1;
    const subject = headerMatch ? headerMatch[2].trim() : "General";

    const question = lines[1].replace(/^Q:\s*/i, "").trim();
    const options = [
      lines[2].replace(/^[A]\)\s*/i, "").trim(),
      lines[3].replace(/^[B]\)\s*/i, "").trim(),
      lines[4].replace(/^[C]\)\s*/i, "").trim(),
      lines[5].replace(/^[D]\)\s*/i, "").trim()
    ];

    const ansLine = lines.find((l) => /^Ans:/i.test(l)) || "Ans: A";
    const ansLetter = ansLine.replace(/^Ans:\s*/i, "").trim().toUpperCase();
    const answerIndex = { A: 0, B: 1, C: 2, D: 3 }[ansLetter] ?? 0;

    parsed.push({
      id: i + 1,
      paperNo,
      subject,
      question,
      options,
      answer: answerIndex
    });
  });

  return parsed;
}

function getScore() {
  let score = 0;
  Object.keys(userChoices).forEach((idxStr) => {
    const idx = Number(idxStr);
    if (userChoices[idx] === activeQuestions[idx].answer) score++;
  });
  return score;
}

function renderQuestion() {
  scoreEl.textContent = `Score: ${getScore()} / ${activeQuestions.length}`;

  if (activeQuestions.length === 0) {
    countEl.textContent = "0 / 0";
    questionEl.textContent = "Is paper ya subject ke questions abhi data/questions.txt me nahi hain.";
    optionsContainer.innerHTML = "";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  const q = activeQuestions[currentIndex];
  const chosen = userChoices[currentIndex];
  const answered = chosen !== undefined;
  const labels = ["A", "B", "C", "D"];

  countEl.textContent = `${currentIndex + 1} / ${activeQuestions.length}`;
  metaEl.textContent = `Paper ${q.paperNo} • ${q.subject}`;
  questionEl.textContent = `${currentIndex + 1}) ${q.question}`;
  optionsContainer.innerHTML = "";

  q.options.forEach((optText, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";

    if (answered) {
      btn.disabled = true;
      if (idx === q.answer) btn.classList.add("correct"); // Sahi -> Green
      if (idx === chosen && chosen !== q.answer) btn.classList.add("wrong"); // Galat -> Red
    }

    btn.textContent = `(${labels[idx]}) ${optText}`;
    btn.addEventListener("click", () => {
      if (userChoices[currentIndex] !== undefined) return;
      userChoices[currentIndex] = idx;
      renderQuestion();
    });

    optionsContainer.appendChild(btn);
  });

  if (answered) {
    feedbackEl.textContent =
      chosen === q.answer
        ? "સાચો જવાબ! (Correct)"
        : `ખોટો જવાબ! સાચો વિકલ્પ (${labels[q.answer]}) છે.`;
    feedbackEl.className = chosen === q.answer ? "feedback-text ok" : "feedback-text bad";
  } else {
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback-text";
  }

  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === activeQuestions.length - 1;
}

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentIndex < activeQuestions.length - 1) {
    currentIndex++;
    renderQuestion();
  }
});

async function initQuiz() {
  try {
    const res = await fetch("data/questions.txt");
    const text = await res.text();
    allQuestions = parseQuestionsText(text);

    if (subjectParam) {
      headingEl.textContent = `Subject: ${subjectParam}`;
      activeQuestions = allQuestions.filter(
        (q) => q.subject.toLowerCase() === subjectParam.toLowerCase()
      );
    } else {
      const pNo = parseInt(paperParam, 10) || 1;
      headingEl.textContent = `Model Paper ${pNo}`;
      activeQuestions = allQuestions.filter((q) => q.paperNo === pNo);
    }

    renderQuestion();
  } catch (err) {
    questionEl.textContent = "data/questions.txt load karne me error aayi.";
  }
}

initQuiz();
