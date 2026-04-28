const problem = problems.find((item) => item.slug === document.body.dataset.problem);
const detailPage = document.querySelector("#problemDetail");

if (problem && detailPage) {
  const categoryBadges = problem.categories.map((cat) => `<span class="badge">${cat}</span>`).join("");
  document.title = `${problem.title} | Aesthetic Puzzles`;

  detailPage.innerHTML = `
    <nav class="top-nav-row">
      <a class="back-link" href="../index.html"><span aria-hidden="true">←</span> Back to Puzzles</a>
      <a class="back-link" href="../solutions/${problem.slug}.html"><span aria-hidden="true">→</span> View Solution</a>
    </nav>
    <section class="puzzle-page-card">
      <figure class="puzzle-hero-media ${problem.accent}" aria-label="${problem.title} illustration">
        <img src="../${problem.imagePath}" alt="${problem.title} puzzle illustration" />
      </figure>
      <div class="puzzle-description">
        <h1>${problem.title}</h1>
        <div class="badges">${categoryBadges}</div>
        <p class="puzzle-statement">${problem.statement}</p>
      </div>
    </section>
  `;
}
