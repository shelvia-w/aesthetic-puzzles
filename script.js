const state = {
  activeFilter: "All",
  query: "",
};

const grid = document.querySelector("#problemGrid");
const filtersNode = document.querySelector("#filters");
const searchInput = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");

function renderFilters() {
  filtersNode.innerHTML = filters
    .map(
      (filter) => `
        <button class="chip" type="button" data-filter="${filter}" aria-pressed="${filter === state.activeFilter}">
          ${filter}
        </button>
      `,
    )
    .join("");
}

function getVisibleProblems() {
  const query = state.query.trim().toLowerCase();

  return problems.filter((problem) => {
    const matchesFilter =
      state.activeFilter === "All" || problem.categories.includes(state.activeFilter);
    const searchable = [problem.title, problem.category, problem.description, ...problem.categories]
      .join(" ")
      .toLowerCase();

    return matchesFilter && searchable.includes(query);
  });
}

function renderProblems() {
  const visibleProblems = getVisibleProblems();
  emptyState.hidden = visibleProblems.length > 0;
  grid.innerHTML = visibleProblems.map(renderProblemCard).join("");
}

function renderProblemCard(problem) {
  const categoryBadges = problem.categories.map((cat) => `<span class="badge">${cat}</span>`).join("");

  return `
    <a class="card" href="problems/${problem.slug}.html" aria-label="Open ${problem.title} puzzle">
      <article class="card-inner">
        <figure class="preview ${problem.accent}" aria-label="${problem.title} illustration">
          <img src="${problem.imagePath}" alt="${problem.title} puzzle illustration" loading="lazy" />
        </figure>
        <div class="card-copy">
          <div class="card-heading">
            <h2>${problem.title}</h2>
          </div>
          <div class="badges">
            ${categoryBadges}
          </div>
        </div>
      </article>
    </a>
  `;
}

filtersNode.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");

  if (!button) {
    return;
  }

  state.activeFilter = button.dataset.filter;
  renderFilters();
  renderProblems();
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderProblems();
});

renderFilters();
renderProblems();
