const { useEffect, useMemo, useState } = React;
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

const IMAGES = {
  wolf: "../public/images/river-crossing/wolf.png",
  goat: "../public/images/river-crossing/goat.png",
  cabbage: "../public/images/river-crossing/cabbage.png",
  farmer: "../public/images/river-crossing/farmer.png",
  boat: "../public/images/river-crossing/boat.png",
  river: "../public/images/river-crossing/river.png",
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

const BASE_BOAT_ANIMATION_MS = 1000;
const BASE_AUTO_SOLVE_STEP_DELAY_MS = 150;
const BASE_AUTO_SOLVE_SELECT_MS = 450;
const SPEED_OPTIONS = [
  { value: 0.25, label: "Slow" },
  { value: 0.5, label: "Normal" },
  { value: 1, label: "Fast" },
  { value: 1.5, label: "Very fast" },
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
  const [boatSide, setBoatSide] = useState("left");
  const [autoSelectedItem, setAutoSelectedItem] = useState(null);
  const [autoSpeed, setAutoSpeed] = useState(1);

  const farmerSide = state.farmerSide;
  const otherSide = farmerSide === "left" ? "right" : "left";

  const instruction = useMemo(() => {
    if (state.status === "won") return null;
    if (state.status === "lost") return null;
    if (state.boat !== null) return `${LABELS[state.boat]} is in the boat. Cross the river or unload.`;
    return "Click an item on your side to load it, or cross empty.";
  }, [state.status, state.boat, state.eatenMessage]);

  const moveCount = state.history.length;
  const boatAnimationMs = BASE_BOAT_ANIMATION_MS / autoSpeed;
  const autoSolveStepDelayMs = BASE_AUTO_SOLVE_STEP_DELAY_MS / autoSpeed;
  const autoSolveSelectMs = BASE_AUTO_SOLVE_SELECT_MS / autoSpeed;
  const canStep = state.status === "playing" && !animating && !autoSolving && autoSelectedItem === null && solveStep < SOLUTION_STEPS.length;
  const controlsBusy = animating || autoSelectedItem !== null;

  useEffect(() => {
    if (!autoSolving) return;
    if (solveStep >= SOLUTION_STEPS.length) {
      setAutoSolving(false);
      return;
    }

    let loadTimer = null;
    let finishTimer = null;

    function moveBoat(step, destination) {
      setAnimating(true);
      setBoatSide(destination);

      finishTimer = window.setTimeout(() => {
        setState((prev) => {
          const next = {
            ...prev,
            left: new Set(prev.left),
            right: new Set(prev.right),
            farmerSide: destination,
            history: [...prev.history, { carry: step.carry, to: destination }],
          };

          if (next.boat !== null) {
            next[destination].add(next.boat);
            next.boat = null;
          }

          if (checkWin(next)) {
            next.status = "won";
          }

          return next;
        });

        setAnimating(false);
        setSolveStep((s) => s + 1);
      }, boatAnimationMs);
    }

    const timer = window.setTimeout(() => {
      if (state.status !== "playing") {
        setAutoSolving(false);
        return;
      }

      const step = SOLUTION_STEPS[solveStep];
      const destination = state.farmerSide === "left" ? "right" : "left";

      if (step.carry) {
        setAutoSelectedItem(step.carry);
        loadTimer = window.setTimeout(() => {
          setAutoSelectedItem(null);
          setState((prev) => {
            if (prev.status !== "playing") return prev;
            const next = { ...prev, left: new Set(prev.left), right: new Set(prev.right) };
            next[next.farmerSide].delete(step.carry);
            next.boat = step.carry;
            return next;
          });

          moveBoat(step, destination);
        }, autoSolveSelectMs);
        return;
      }

      setState((prev) => {
        if (prev.status !== "playing") return prev;
        return { ...prev, boat: null };
      });
      moveBoat(step, destination);
    }, autoSolveStepDelayMs);

    return () => {
      clearTimeout(timer);
      if (loadTimer !== null) clearTimeout(loadTimer);
      if (finishTimer !== null) clearTimeout(finishTimer);
    };
  }, [autoSolving, solveStep, state.farmerSide, state.status]);

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

    const destination = farmerSide === "left" ? "right" : "left";

    setAnimating(true);
    setBoatSide(destination);

    setTimeout(() => {
      setBoatSide(destination);
      setState((prev) => {
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
        } else {
          const leftConflict = next.farmerSide === "right" ? checkConflict(next.left) : null;
          const rightConflict = next.farmerSide === "left" ? checkConflict(next.right) : null;
          const conflict = leftConflict || rightConflict;
          if (conflict) {
            next.status = "lost";
            next.eatenMessage = conflict;
          }
        }

        return next;
      });

      setAnimating(false);
    }, boatAnimationMs);
  }

  function stepSolution() {
    if (!canStep) return;

    const step = SOLUTION_STEPS[solveStep];
    const destination = farmerSide === "left" ? "right" : "left";

    function crossAndUnload() {
      setAnimating(true);
      setBoatSide(destination);

      setTimeout(() => {
        setState((prev) => {
          const next = {
            ...prev,
            left: new Set(prev.left),
            right: new Set(prev.right),
            farmerSide: destination,
            history: [...prev.history, { carry: step.carry, to: destination }],
          };

          if (next.boat !== null) {
            next[destination].add(next.boat);
            next.boat = null;
          }

          if (checkWin(next)) {
            next.status = "won";
          }

          return next;
        });

        setAnimating(false);
        setSolveStep((s) => s + 1);
      }, boatAnimationMs);
    }

    if (step.carry) {
      setAutoSelectedItem(step.carry);
      setTimeout(() => {
        setAutoSelectedItem(null);
        setState((prev) => {
          if (prev.status !== "playing") return prev;
          const next = { ...prev, left: new Set(prev.left), right: new Set(prev.right) };
          next[next.farmerSide].delete(step.carry);
          next.boat = step.carry;
          return next;
        });
        crossAndUnload();
      }, autoSolveSelectMs);
      return;
    }

    setState((prev) => (prev.status === "playing" ? { ...prev, boat: null } : prev));
    crossAndUnload();
  }

  function reset() {
    setAutoSolving(false);
    setSolveStep(0);
    setAnimating(false);
    setAutoSelectedItem(null);
    setBoatSide("left");
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
      h("div", { className: "bank-label" }, side === "left" ? "Origin" : "Goal"),
      h(
        "div",
        { className: "bank-items" },
        isFarmerHere && !animating
          ? h("div", { className: "entity farmer-entity" }, h("img", { className: "entity-art", src: IMAGES.farmer, alt: "Farmer" }), h("span", { className: "entity-label" }, "Farmer"))
          : null,
        items.map((item) => {
          const selected = autoSelectedItem === item && isFarmerHere;
          return h(
            "button",
            {
              key: item,
              type: "button",
              className: `entity item-entity ${isFarmerHere && state.status === "playing" && state.boat === null ? "pickable" : ""} ${selected ? "selected" : ""}`,
              onClick: () => loadItem(item),
              disabled: !isFarmerHere || state.status !== "playing" || state.boat !== null || autoSolving,
            },
            h("img", { className: "entity-art", src: IMAGES[item], alt: LABELS[item] }),
            h("span", { className: "entity-label" }, LABELS[item]),
          );
        }),
      ),
    );
  }

  function renderBoat() {
    const boatClass = `boat ${boatSide === "right" ? "boat-right" : "boat-left"}`;
    const boatStyle = { transitionDuration: `${boatAnimationMs}ms` };

    return h(
      "div",
      { className: "river-zone" },
      h(
        "div",
        { className: "river" },
        h("img", { className: "river-art", src: IMAGES.river, alt: "" }),
        h("div", { className: "wave wave-1" }),
        h("div", { className: "wave wave-2" }),
        h("div", { className: "wave wave-3" }),
      ),
      h(
        "div",
        { className: boatClass, style: boatStyle },
        h("img", { className: "boat-art", src: IMAGES.boat, alt: "Boat" }),
        h(
          "div",
          { className: "boat-occupants" },
          h("img", { className: "boat-farmer-art", src: IMAGES.farmer, alt: "Farmer" }),
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
                h("img", { className: "entity-art", src: IMAGES[state.boat], alt: LABELS[state.boat] }),
              )
            : null,
        ),
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
                boatSide === "left" ? "Cross →" : "← Cross",
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
      { className: "lower-row", "aria-label": "Controls" },
      h(
        "div",
        { className: "controls" },
        h(
          "div",
          { className: "control-pair" },
          h("button", { className: "ctrl-btn primary", type: "button", onClick: reset }, "Reset"),
          h("button", { className: "ctrl-btn", type: "button", onClick: stepSolution, disabled: !canStep }, "Step"),
        ),
        h(
          "div",
          { className: "control-pair" },
          h("button", { className: "ctrl-btn", type: "button", onClick: startAutoSolve, disabled: autoSolving || controlsBusy }, "Auto-solve"),
          h(
            "div",
            { className: "speed-select-wrap" },
            h("span", { className: "speed-label" }, "Speed"),
            h(
              "select",
              {
                className: "speed-select",
                value: autoSpeed,
                onChange: (event) => setAutoSpeed(Number(event.target.value)),
                disabled: autoSolving || controlsBusy,
                "aria-label": "Auto-solve speed",
              },
              SPEED_OPTIONS.map((option) =>
                h("option", { key: option.value, value: option.value }, option.label),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

ReactDOM.createRoot(document.getElementById("riverCrossingRoot")).render(h(RiverCrossingVisualizer));
