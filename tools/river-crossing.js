const { useCallback, useEffect, useMemo, useState } = React;
const h = React.createElement;

const ITEMS = {
  WOLF: "wolf",
  GOAT: "goat",
  CABBAGE: "cabbage",
};

const ITEM_LIST = [ITEMS.WOLF, ITEMS.GOAT, ITEMS.CABBAGE];

const LABELS = {
  wolf: "Wolf",
  goat: "Goat",
  cabbage: "Cabbage",
  farmer: "Farmer",
};

const EMOJI = {
  wolf: "🐺",
  goat: "🐐",
  cabbage: "🥦",
  farmer: "🧑‍🌾",
};

const CONFLICTS = [
  [ITEMS.WOLF, ITEMS.GOAT],
  [ITEMS.GOAT, ITEMS.CABBAGE],
];

const SOLUTION_STEPS = [
  { carry: ITEMS.GOAT, direction: "cross" },
  { carry: null, direction: "cross" },
  { carry: ITEMS.WOLF, direction: "cross" },
  { carry: ITEMS.GOAT, direction: "cross" },
  { carry: ITEMS.CABBAGE, direction: "cross" },
  { carry: null, direction: "cross" },
  { carry: ITEMS.GOAT, direction: "cross" },
];

function createInitialState() {
  return {
    left: new Set(ITEM_LIST),
    right: new Set(),
    farmerSide: "left",
    boat: null,
    history: [],
    status: "playing",
    eatenMessage: null,
  };
}

function checkConflict(items) {
  for (const [a, b] of CONFLICTS) {
    if (items.has(a) && items.has(b)) {
      if (a === ITEMS.WOLF && b === ITEMS.GOAT) return `The wolf ate the goat!`;
      return `The goat ate the cabbage!`;
    }
  }
  return null;
}

function checkWin(state) {
  return state.right.size === ITEM_LIST.length && state.farmerSide === "right";
}

function RiverCrossingVisualizer() {
  const [state, setState] = useState(createInitialState);
  const [animating, setAnimating] = useState(false);
  const [autoSolving, setAutoSolving] = useState(false);
  const [solveStep, setSolveStep] = useState(0);

  const farmerSide = state.farmerSide;
  const otherSide = farmerSide === "left" ? "right" : "left";

  const instruction = useMemo(() => {
    if (state.status === "won") return "All safely across! Well done.";
    if (state.status === "lost") return state.eatenMessage;
    if (state.boat !== null) return `${LABELS[state.boat]} is in the boat. Cross the river or unload.`;
    return "Click an item on your side to load it, or cross empty.";
  }, [state.status, state.boat, state.eatenMessage]);

  const moveCount = state.history.length;

  useEffect(() => {
    if (!autoSolving) return;
    if (solveStep >= SOLUTION_STEPS.length) {
      setAutoSolving(false);
      return;
    }

    const timer = window.setTimeout(() => {
      const step = SOLUTION_STEPS[solveStep];
      setState((prev) => {
        if (prev.status !== "playing") return prev;
        let next = { ...prev, left: new Set(prev.left), right: new Set(prev.right) };

        if (step.carry) {
          next[next.farmerSide].delete(step.carry);
          next.boat = step.carry;
        } else {
          next.boat = null;
        }

        const destination = next.farmerSide === "left" ? "right" : "left";
        if (next.boat !== null) {
          next[destination].add(next.boat);
        }
        next.farmerSide = destination;
        next.boat = null;
        next.history = [...next.history, { carry: step.carry, to: destination }];

        if (checkWin(next)) {
          next.status = "won";
        }

        return next;
      });
      setSolveStep((s) => s + 1);
    }, 900);

    return () => clearTimeout(timer);
  }, [autoSolving, solveStep]);

  function loadItem(item) {
    if (state.status !== "playing" || animating || autoSolving) return;
    if (!state[farmerSide].has(item)) return;
    if (state.boat !== null) return;

    setState((prev) => {
      const updated = new Set(prev[farmerSide]);
      updated.delete(item);
      return { ...prev, [farmerSide]: updated, boat: item };
    });
  }

  function unloadItem() {
    if (state.status !== "playing" || animating || autoSolving) return;
    if (state.boat === null) return;

    setState((prev) => {
      const updated = new Set(prev[farmerSide]);
      updated.add(prev.boat);
      return { ...prev, [farmerSide]: updated, boat: null };
    });
  }

  function crossRiver() {
    if (state.status !== "playing" || animating || autoSolving) return;

    setAnimating(true);
    setTimeout(() => {
      setState((prev) => {
        const destination = prev.farmerSide === "left" ? "right" : "left";
        const next = {
          ...prev,
          left: new Set(prev.left),
          right: new Set(prev.right),
          farmerSide: destination,
          history: [...prev.history, { carry: prev.boat, to: destination }],
        };

        if (next.boat !== null) {
          next[destination].add(next.boat);
          next.boat = null;
        }

        if (checkWin(next)) {
          next.status = "won";
          return next;
        }

        const leftConflict = next.farmerSide === "right" ? checkConflict(next.left) : null;
        const rightConflict = next.farmerSide === "left" ? checkConflict(next.right) : null;
        const conflict = leftConflict || rightConflict;

        if (conflict) {
          next.status = "lost";
          next.eatenMessage = conflict;
        }

        return next;
      });
      setAnimating(false);
    }, 500);
  }

  function reset() {
    setAutoSolving(false);
    setSolveStep(0);
    setAnimating(false);
    setState(createInitialState());
  }

  function startAutoSolve() {
    reset();
    setTimeout(() => {
      setAutoSolving(true);
      setSolveStep(0);
    }, 100);
  }

  function renderBank(side) {
    const items = Array.from(state[side]);
    const isFarmerHere = state.farmerSide === side;

    return h(
      "div",
      { className: `bank bank-${side}` },
      h("div", { className: "bank-label" }, side === "left" ? "Start" : "Finish"),
      h(
        "div",
        { className: "bank-items" },
        isFarmerHere
          ? h("div", { className: "entity farmer-entity" }, h("span", { className: "entity-emoji" }, EMOJI.farmer), h("span", { className: "entity-label" }, "Farmer"))
          : null,
        items.map((item) =>
          h(
            "button",
            {
              key: item,
              type: "button",
              className: `entity item-entity ${isFarmerHere && state.status === "playing" && state.boat === null ? "pickable" : ""}`,
              onClick: () => loadItem(item),
              disabled: !isFarmerHere || state.status !== "playing" || state.boat !== null || autoSolving,
            },
            h("span", { className: "entity-emoji" }, EMOJI[item]),
            h("span", { className: "entity-label" }, LABELS[item]),
          ),
        ),
      ),
    );
  }

  function renderBoat() {
    const boatClass = `boat ${state.farmerSide === "right" ? "boat-right" : "boat-left"} ${animating ? "boat-moving" : ""}`;

    return h(
      "div",
      { className: "river-zone" },
      h(
        "div",
        { className: "river" },
        h("div", { className: "wave wave-1" }),
        h("div", { className: "wave wave-2" }),
        h("div", { className: "wave wave-3" }),
      ),
      h(
        "div",
        { className: boatClass },
        h("div", { className: "boat-icon" }, "⛵"),
        h("div", { className: "boat-emoji" }, EMOJI.farmer),
        state.boat !== null
          ? h(
              "button",
              {
                type: "button",
                className: "boat-passenger",
                onClick: unloadItem,
                disabled: state.status !== "playing" || autoSolving,
                "aria-label": `Unload ${LABELS[state.boat]}`,
              },
              h("span", { className: "entity-emoji" }, EMOJI[state.boat]),
            )
          : h("div", { className: "boat-empty" }, "Empty"),
      ),
    );
  }

  return h(
    "div",
    { className: "rc-shell" },
    h(
      "nav",
      { className: "breadcrumb", "aria-label": "Breadcrumb" },
      h("a", { href: "../index.html" }, "Puzzles"),
      h("span", { className: "breadcrumb-sep", "aria-hidden": "true" }, "/"),
      h("a", { href: "../problems/river-crossing.html" }, "River Crossing"),
      h("span", { className: "breadcrumb-sep", "aria-hidden": "true" }, "/"),
      h("a", { href: "../solutions/river-crossing.html" }, "Solution"),
      h("span", { className: "breadcrumb-sep", "aria-hidden": "true" }, "/"),
      h("span", { "aria-current": "page" }, "Visualizer"),
    ),
    h(
      "header",
      { className: "rc-header" },
      h("h1", null, "River Crossing"),
      h("p", { className: "rc-subtitle" }, "Get everyone across safely"),
    ),
    h(
      "section",
      { className: "stage-card", "aria-label": "River crossing visualizer" },
      h(
        "div",
        { className: "scene" },
        renderBank("left"),
        renderBoat(),
        renderBank("right"),
      ),
      h(
        "div",
        { className: "interaction-zone" },
        h("p", { className: `instruction ${state.status === "lost" ? "instruction-danger" : ""} ${state.status === "won" ? "instruction-success" : ""}`, "aria-live": "polite" }, instruction),
        state.status === "playing"
          ? h(
              "div",
              { className: "action-row" },
              h(
                "button",
                {
                  className: "choice-btn primary",
                  type: "button",
                  onClick: crossRiver,
                  disabled: animating || autoSolving,
                },
                state.farmerSide === "left" ? "Cross →" : "← Cross",
              ),
            )
          : null,
        state.status !== "playing"
          ? h(
              "div",
              { className: "result-panel" },
              h("div", { className: `result-badge ${state.status === "won" ? "success" : "failure"}` }, state.status === "won" ? "All safely across!" : "Game over"),
            )
          : null,
      ),
    ),
    h(
      "section",
      { className: "lower-row", "aria-label": "Controls and statistics" },
      h(
        "div",
        { className: "controls" },
        h("button", { className: "ctrl-btn primary", type: "button", onClick: reset }, "Reset"),
        h("button", { className: "ctrl-btn", type: "button", onClick: startAutoSolve, disabled: autoSolving }, "Auto-solve"),
      ),
      h(
        "aside",
        { className: "stats-panel", "aria-label": "Game statistics" },
        h("div", null, h("span", null, "Moves"), h("strong", null, moveCount)),
        h("div", null, h("span", null, "Farmer"), h("strong", null, state.farmerSide === "left" ? "Start side" : "Finish side")),
        h("div", null, h("span", null, "Boat"), h("strong", null, state.boat ? LABELS[state.boat] : "Empty")),
        h("div", null, h("span", null, "Status"), h("strong", null, state.status === "playing" ? "In progress" : state.status === "won" ? "Solved" : "Failed")),
      ),
    ),
  );
}

ReactDOM.createRoot(document.getElementById("riverCrossingRoot")).render(h(RiverCrossingVisualizer));
