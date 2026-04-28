const problem = problems.find((item) => item.slug === document.body.dataset.problem);
const detailPage = document.querySelector("#solutionDetail");

if (problem && detailPage) {
  document.title = `${problem.title} - Solution | Aesthetic Puzzles`;

  const commonMistakesBySlug = {
    "two-doors-two-guards": [
      {
        title: "Ask which door is safe directly",
        body:
          'Asking one guard, "Which door leads to freedom?" only works if you already know whether that guard tells the truth. The trick is asking what the other guard would say, because both possible guards then point to the wrong door.',
      },
      {
        title: "Try to figure out which guard is lying",
        body: "You do not need to identify the liar. The trick question works no matter which guard you ask.",
      },
    ],
    "monty-hall": [
      {
        title: "Assume the final choice is 50/50",
        body:
          "After the host opens a goat door, it feels like two doors remain so each should be equally likely. But your first pick is still only 1/3 likely to be the car, and the unchosen unopened door carries the remaining 2/3 chance.",
      },
      {
        title: "Treat the host's reveal as random",
        body:
          "The host is not opening a random door. They know where the car is and deliberately reveal a goat, which is why switching gives you information your first guess did not have.",
      },
    ],
    "river-crossing": [
      {
        title: "Take the wolf or cabbage first",
        body:
          "If you take the wolf first, the goat eats the cabbage while you're gone. If you take the cabbage first, the wolf eats the goat. The goat must go first because the wolf and cabbage are safe together.",
      },
      {
        title: "Forget to bring the goat back",
        body:
          "After delivering the wolf, you can't just leave it with the goat and go back for the cabbage. You must bring the goat back to the starting side to prevent it from being eaten, then take the cabbage over.",
      },
    ],
  };

  const steps = problem.solution.steps
    .map(
      (step, i) => `
        <div class="solution-step">
          <span class="step-number">${i + 1}</span>
          <div>
            <h3>${step.title}</h3>
            <p>${step.body}</p>
          </div>
        </div>
      `,
    )
    .join("");

  const mistakes = commonMistakesBySlug[problem.slug] || [];
  const mistakeCards = mistakes
    .map(
      (mistake, i) => `
          <article class="mistake-item">
            <h3>${i + 1}. ${mistake.title}</h3>
            <p>${mistake.body}</p>
          </article>
        `,
    )
    .join("");

  detailPage.innerHTML = `
    <nav class="top-nav-row">
      <a class="back-link" href="../problems/${problem.slug}.html"><span aria-hidden="true">&larr;</span> Back to Problem</a>
      <a class="back-link" href="../tools/${problem.slug}.html"><span aria-hidden="true">&#9654;</span> Open Interactive Visualizer</a>
    </nav>
    <section class="solution-page-card">
      <figure class="solution-media ${problem.accent}" aria-label="${problem.title} solution illustration">
        <img src="../${problem.solutionImagePath}" alt="${problem.title} solution illustration" />
      </figure>
      <div class="solution-copy">
        <p class="solution-eyebrow">Solution</p>
        <h1>${problem.title}</h1>
        <p class="solution-summary">${problem.solution.summary}</p>
        <div class="solution-steps">
          ${steps}
        </div>
        <div class="solution-actions">
          <button class="tool-cta mistake-cta" id="mistakeBtn" type="button">
            <span class="tool-cta-icon" aria-hidden="true">?</span> Common Mistakes
          </button>
        </div>
      </div>
    </section>
    <div class="mistake-popup" id="mistakePopup" aria-hidden="true">
      <section class="mistake-card" role="dialog" aria-modal="true" aria-labelledby="mistakeTitle">
        <button class="mistake-close" id="mistakeClose" type="button" aria-label="Close common mistake">&times;</button>
        <h2 id="mistakeTitle">Common Mistakes</h2>
        <div class="mistake-list">
          ${mistakeCards}
        </div>
      </section>
    </div>
  `;

  const popup = document.querySelector("#mistakePopup");
  const openPopup = document.querySelector("#mistakeBtn");
  const closePopup = document.querySelector("#mistakeClose");

  const setPopupOpen = (isOpen) => {
    popup.classList.toggle("visible", isOpen);
    popup.setAttribute("aria-hidden", String(!isOpen));
  };

  openPopup.addEventListener("click", () => setPopupOpen(true));
  closePopup.addEventListener("click", () => setPopupOpen(false));
  popup.addEventListener("click", (event) => {
    if (event.target === popup) setPopupOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setPopupOpen(false);
  });
}
