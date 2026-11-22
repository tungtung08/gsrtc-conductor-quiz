const papersGrid = document.getElementById("papers-grid");

for (let paperNum = 1; paperNum <= 30; paperNum++) {
  const count = typeof allQuestions !== "undefined"
    ? allQuestions.filter((q) => q.paperNo === paperNum).length
    : 0;

  const link = document.createElement("a");
  link.href = `quiz.html?paper=${paperNum}`;
  link.className = "card paper-card";
  link.innerHTML = `
    <span class="card-title">Paper ${paperNum}</span>
    <span class="q-count">${count > 0 ? `${count} MCQs` : "Coming Soon"}</span>
  `;

  papersGrid.appendChild(link);
}
