const state = {
  activeFilter: "All",
  query: "",
};

const grid = document.querySelector("#problemGrid");
const filtersNode = document.querySelector("#filters");
const filterToggle = document.querySelector("#filterToggle");
const filterToggleLabel = document.querySelector("#filterToggleLabel");
const searchInput = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");
const aboutTrigger = document.querySelector("#aboutTrigger");
const aboutDrawer = document.querySelector("#aboutDrawer");
const aboutBackdrop = document.querySelector("#aboutBackdrop");
const aboutClose = document.querySelector("#aboutClose");
let aboutBackdropTimer;

function renderFilters() {
  filterToggleLabel.textContent = state.activeFilter;
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

function setMobileFiltersOpen(isOpen) {
  filterToggle.setAttribute("aria-expanded", String(isOpen));
  filtersNode.classList.toggle("filters-open", isOpen);
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
  setMobileFiltersOpen(false);
  renderFilters();
  renderProblems();
});

filterToggle.addEventListener("click", () => {
  const isOpen = filterToggle.getAttribute("aria-expanded") === "true";
  setMobileFiltersOpen(!isOpen);
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderProblems();
});

function setAboutDrawerOpen(isOpen) {
  window.clearTimeout(aboutBackdropTimer);
  aboutTrigger.setAttribute("aria-expanded", String(isOpen));
  aboutDrawer.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("drawer-open", isOpen);

  if (isOpen) {
    aboutBackdrop.hidden = false;
    requestAnimationFrame(() => {
      aboutBackdrop.classList.add("visible");
      aboutDrawer.classList.add("visible");
    });
    aboutClose.focus();
    return;
  }

  aboutBackdrop.classList.remove("visible");
  aboutDrawer.classList.remove("visible");
  aboutTrigger.focus();
  aboutBackdropTimer = window.setTimeout(() => {
    aboutBackdrop.hidden = true;
  }, 180);
}

aboutTrigger.addEventListener("click", () => {
  setAboutDrawerOpen(true);
});

aboutClose.addEventListener("click", () => {
  setAboutDrawerOpen(false);
});

aboutBackdrop.addEventListener("click", () => {
  setAboutDrawerOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && aboutDrawer.classList.contains("visible")) {
    setAboutDrawerOpen(false);
  }
});

renderFilters();
renderProblems();
