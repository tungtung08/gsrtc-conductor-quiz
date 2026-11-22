const params = new URLSearchParams(window.location.search);
const subjectParam = params.get("subject");
const paperParam = params.get("paper");

let filteredQuestions = [];
let heading = "MCQ Test";

if (subjectParam) {
  heading = `Subject: ${subjectParam}`;
  filteredQuestions = allQuestions.filter(
    (q) => q.subject.toLowerCase() === subjectParam.toLowerCase()
  );
} else {
  const pNo = parseInt(paperParam, 10) || 1;
  heading = `Model Paper ${pNo}`;
  filteredQuestions = allQuestions.filter((q) => q.paperNo === pNo);
}

let currentIndex = 0;
const userChoices = {}; // { [index]: chosenOptionIndex }

const headingEl = document.getElementById("test-heading");
const countEl = document.getElementById("question-count");
const metaEl = document.getElementById("meta-info");
const scoreEl = document.getElementById("live-score");
const questionEl = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedbackEl = document.getElementById("feedback-text");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

headingEl.textContent = heading;

function calculateScore() {
  let score = 0;
  Object.keys(userChoices).forEach((idxStr) => {
    const idx = Number(idxStr);
    if (userChoices[idx] === filteredQuestions[idx].answer) {
      score++;
    }
  });
  return score;
}

function renderQuiz() {
  scoreEl.textContent = `Score: ${calculateScore()} / ${filteredQuestions.length}`;

  if (filteredQuestions.length === 0) {
    countEl.textContent = "0 / 0";
    metaEl.textContent = heading;
    questionEl.textContent = "આ વિભાગના પ્રશ્નો હજુ data.js માં ઉમેરવાના બાકી છે.";
    optionsContainer.innerHTML = "";
    feedbackEl.textContent = "";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  const q = filteredQuestions[currentIndex];
  const chosen = userChoices[currentIndex];
  const answered = chosen !== undefined;
  const labels = ["A", "B", "C", "D"];

  countEl.textContent = `${currentIndex + 1} / ${filteredQuestions.length}`;
  metaEl.textContent = `Paper ${q.paperNo} • ${q.subject}`;
  questionEl.textContent = `${currentIndex + 1}) ${q.question}`;
  optionsContainer.innerHTML = "";

  q.options.forEach((optText, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";

    if (answered) {
      btn.disabled = true;
      if (idx === q.answer) {
        btn.classList.add("correct"); // Sahi answer -> Green
      }
      if (idx === chosen && chosen !== q.answer) {
        btn.classList.add("wrong"); // Galat answer -> Red
      }
    }

    btn.textContent = `(${labels[idx]}) ${optText}`;
    btn.addEventListener("click", () => {
      if (userChoices[currentIndex] !== undefined) return;
      userChoices[currentIndex] = idx;
      renderQuiz();
    });

    optionsContainer.appendChild(btn);
  });

  if (answered) {
    if (chosen === q.answer) {
      feedbackEl.textContent = "સાચો જવાબ! (Correct)";
      feedbackEl.className = "feedback-text ok";
    } else {
      feedbackEl.textContent = `ખોટો જવાબ! સાચો વિકલ્પ (${labels[q.answer]}) છે.`;
      feedbackEl.className = "feedback-text bad";
    }
  } else {
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback-text";
  }

  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === filteredQuestions.length - 1;
}

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuiz();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentIndex < filteredQuestions.length - 1) {
    currentIndex++;
    renderQuiz();
  }
});

renderQuiz();
