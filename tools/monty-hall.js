const { useEffect, useMemo, useState } = React;
const h = React.createElement;

const DOORS = [
  { id: 0, label: "Door A" },
  { id: 1, label: "Door B" },
  { id: 2, label: "Door C" },
];

const ASSETS = {
  closedDoor: "../public/images/monty-hall/door.png",
  goatDoor: "../public/images/monty-hall/goat.png",
  prizeDoor: "../public/images/monty-hall/car.png",
  host: "../public/images/monty-hall/host.png",
  contestant: "../public/images/monty-hall/contestant.png",
};

const PHASES = {
  PICK: "pick",
  DECIDE: "decide",
  REVEAL: "reveal",
};

const SPEED_OPTIONS = [
  { label: "Slow", value: 1100 },
  { label: "Normal", value: 650 },
  { label: "Fast", value: 260 },
  { label: "Very fast", value: 90 },
];

function randomDoor() {
  return Math.floor(Math.random() * DOORS.length);
}

function randomBool() {
  return Math.random() < 0.5;
}

function chooseRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function createRound() {
  return {
    winningDoor: randomDoor(),
    selectedDoor: null,
    openedDoor: null,
    finalDoor: null,
    finalChoice: null,
    phase: PHASES.PICK,
  };
}

function chooseHostDoor(winningDoor, selectedDoor) {
  const openableDoors = DOORS
    .map((door) => door.id)
    .filter((doorId) => doorId !== winningDoor && doorId !== selectedDoor);

  // When the contestant initially picked the car, Monty has two valid goats to reveal.
  return chooseRandom(openableDoors);
}

function getSwitchDoor(selectedDoor, openedDoor) {
  return DOORS
    .map((door) => door.id)
    .find((doorId) => doorId !== selectedDoor && doorId !== openedDoor);
}

function runSimulatedGame(strategy) {
  const winningDoor = randomDoor();
  const selectedDoor = randomDoor();
  const openedDoor = chooseHostDoor(winningDoor, selectedDoor);
  const finalDoor = strategy === "switch" ? getSwitchDoor(selectedDoor, openedDoor) : selectedDoor;
  return {
    strategy,
    won: finalDoor === winningDoor,
  };
}

function createSimulationRound() {
  const winningDoor = randomDoor();
  const selectedDoor = randomDoor();
  const simulationChoice = randomBool() ? "switch" : "stay";
  return {
    winningDoor,
    selectedDoor,
    openedDoor: chooseHostDoor(winningDoor, selectedDoor),
    finalDoor: null,
    finalChoice: simulationChoice,
    phase: PHASES.DECIDE,
  };
}

function ImagePlaceholder({ src, alt, fallback, className }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return h(
      "div",
      { className: `${className} placeholder-art`, "aria-label": alt, role: "img" },
      fallback,
    );
  }

  return h("img", {
    src,
    alt,
    className,
    onError: () => setFailed(true),
  });
}

function MontyHallVisualizer() {
  const [round, setRound] = useState(createRound);
  const [stats, setStats] = useState({
    stayWins: 0,
    stayGames: 0,
    switchWins: 0,
    switchGames: 0,
    totalGames: 0,
  });
  const [simulation, setSimulation] = useState({
    targetGames: 100,
    completedGames: 0,
    running: false,
    speedMs: 650,
  });

  const result = round.phase === PHASES.REVEAL ? round.finalDoor === round.winningDoor : null;
  const simulationInProgress = simulation.running || simulation.completedGames > 0;
  const simulationFinished = simulation.completedGames >= simulation.targetGames;
  const stayWinRate = stats.stayGames > 0 ? Math.round((stats.stayWins / stats.stayGames) * 100) : 0;
  const switchWinRate = stats.switchGames > 0 ? Math.round((stats.switchWins / stats.switchGames) * 100) : 0;

  const instruction = useMemo(() => {
    if (simulationInProgress && round.phase === PHASES.DECIDE) {
      return `The host revealed a goat. The simulation will ${round.finalChoice}.`;
    }
    if (simulationInProgress && round.phase === PHASES.REVEAL) {
      return `The simulation chose to ${round.finalChoice}. All doors are revealed.`;
    }
    if (round.phase === PHASES.PICK) return "Choose one door as your first pick.";
    if (round.phase === PHASES.DECIDE) return "Do you want to stay or switch?";
    return "All doors are revealed.";
  }, [round.phase, simulationInProgress]);

  useEffect(() => {
    if (!simulation.running) return undefined;

    if (simulationFinished) {
      setSimulation((currentSimulation) => ({ ...currentSimulation, running: false }));
      return undefined;
    }

    const timer = window.setTimeout(() => {
      advanceSimulation();
    }, simulation.speedMs);

    return () => window.clearTimeout(timer);
  }, [
    round.phase,
    simulation.completedGames,
    simulation.running,
    simulation.speedMs,
    simulation.targetGames,
    simulationFinished,
  ]);

  function handleDoorPick(doorId) {
    if (simulation.running || round.phase !== PHASES.PICK) return;

    setRound((currentRound) => ({
      ...currentRound,
      selectedDoor: doorId,
      openedDoor: chooseHostDoor(currentRound.winningDoor, doorId),
      phase: PHASES.DECIDE,
    }));
  }

  function finishRound(choice) {
    if (round.phase !== PHASES.DECIDE) return;

    const finalDoor =
      choice === "switch" ? getSwitchDoor(round.selectedDoor, round.openedDoor) : round.selectedDoor;
    const won = finalDoor === round.winningDoor;

    setRound((currentRound) => ({
      ...currentRound,
      finalChoice: choice,
      finalDoor,
      phase: PHASES.REVEAL,
    }));

    setStats((currentStats) => ({
      stayWins: currentStats.stayWins + (choice === "stay" && won ? 1 : 0),
      stayGames: currentStats.stayGames + (choice === "stay" ? 1 : 0),
      switchWins: currentStats.switchWins + (choice === "switch" && won ? 1 : 0),
      switchGames: currentStats.switchGames + (choice === "switch" ? 1 : 0),
      totalGames: currentStats.totalGames + 1,
    }));
  }

  function revealSimulationRound(currentRound) {
    const choice = currentRound.finalChoice || "switch";
    const finalDoor = choice === "switch"
      ? getSwitchDoor(currentRound.selectedDoor, currentRound.openedDoor)
      : currentRound.selectedDoor;
    const won = finalDoor === currentRound.winningDoor;

    setRound({
      ...currentRound,
      finalChoice: choice,
      finalDoor,
      phase: PHASES.REVEAL,
    });

    setStats((currentStats) => ({
      ...currentStats,
      stayWins: currentStats.stayWins + (choice === "stay" && won ? 1 : 0),
      stayGames: currentStats.stayGames + (choice === "stay" ? 1 : 0),
      switchWins: currentStats.switchWins + (choice === "switch" && won ? 1 : 0),
      switchGames: currentStats.switchGames + (choice === "switch" ? 1 : 0),
      totalGames: currentStats.totalGames + 1,
    }));

    setSimulation((currentSimulation) => ({
      ...currentSimulation,
      completedGames: Math.min(currentSimulation.completedGames + 1, currentSimulation.targetGames),
    }));
  }

  function advanceSimulation() {
    if (simulationFinished) {
      setSimulation((currentSimulation) => ({ ...currentSimulation, running: false }));
      return;
    }

    if (round.phase === PHASES.DECIDE) {
      revealSimulationRound(round);
      return;
    }

    setRound(createSimulationRound());
  }

  function startSimulation() {
    const shouldStartFresh = simulationFinished || round.phase === PHASES.PICK;

    setSimulation((currentSimulation) => ({
      ...currentSimulation,
      completedGames: currentSimulation.completedGames >= currentSimulation.targetGames
        ? 0
        : currentSimulation.completedGames,
      running: true,
    }));

    if (shouldStartFresh) {
      setRound(createSimulationRound());
    }
  }

  function pauseSimulation() {
    setSimulation((currentSimulation) => ({ ...currentSimulation, running: false }));
  }

  function stepSimulation() {
    setSimulation((currentSimulation) => ({ ...currentSimulation, running: false }));
    if (simulationFinished) {
      setSimulation((currentSimulation) => ({
        ...currentSimulation,
        completedGames: 0,
      }));
      setRound(createSimulationRound());
      return;
    }
    advanceSimulation();
  }

  function updateSimulationTarget(event) {
    const targetGames = Math.max(1, Math.min(10000, Number(event.target.value) || 1));
    setSimulation((currentSimulation) => ({
      ...currentSimulation,
      targetGames,
      completedGames: Math.min(currentSimulation.completedGames, targetGames),
    }));
  }

  function updateSimulationSpeed(event) {
    setSimulation((currentSimulation) => ({
      ...currentSimulation,
      speedMs: Number(event.target.value),
    }));
  }

  function resetRound() {
    setSimulation((currentSimulation) => ({
      ...currentSimulation,
      completedGames: 0,
      running: false,
    }));
    setRound(createRound());
  }

  return h(
    "div",
    { className: "monty-shell" },
    h(
      "nav",
      { className: "breadcrumb", "aria-label": "Breadcrumb" },
      h("a", { href: "../index.html" }, "Puzzles"),
      h("span", { className: "breadcrumb-sep", "aria-hidden": "true" }, "/"),
      h("a", { href: "../problems/monty-hall.html" }, "Monty Hall"),
      h("span", { className: "breadcrumb-sep", "aria-hidden": "true" }, "/"),
      h("a", { href: "../solutions/monty-hall.html" }, "Solution"),
      h("span", { className: "breadcrumb-sep", "aria-hidden": "true" }, "/"),
      h("span", { "aria-current": "page" }, "Visualizer"),
    ),
    h(
      "header",
      { className: "monty-header" },
      h("h1", null, "Monty Hall"),
      h("p", { className: "monty-subtitle" }, "Can you win the car?"),
    ),
    h(
      "section",
      {
        className: "stage-card",
        "aria-label": "Monty Hall visualizer",
      },
      h(
        "div",
        { className: "stage" },
        h(
          "div",
          { className: "character host-card" },
          h(ImagePlaceholder, {
            src: ASSETS.host,
            alt: "Host",
            fallback: "HOST",
            className: "character-art",
          }),
          h("span", { className: "stage-pill" }, "Host"),
        ),
        h(
          "div",
          { className: "doors", "aria-label": "Doors" },
          DOORS.map((door) => {
            const isSelected = round.selectedDoor === door.id;
            const isOpened = round.openedDoor === door.id;
            const isFinal = round.finalDoor === door.id;
            const isWinner = round.winningDoor === door.id;
            const isChosenDoor = round.phase === PHASES.REVEAL ? isFinal : isSelected;
            const isRevealed = round.phase === PHASES.REVEAL || isOpened;
            const asset = !isRevealed
              ? ASSETS.closedDoor
              : isWinner
                ? ASSETS.prizeDoor
                : ASSETS.goatDoor;
            const fallback = !isRevealed ? "DOOR" : isWinner ? "CAR" : "GOAT";
            const marker = (() => {
              if (round.phase === PHASES.REVEAL) {
                if (isFinal && isWinner) return { text: "Chosen door - car", className: "chosen prize" };
                if (isFinal) return { text: "Chosen door - goat", className: "chosen" };
                if (isWinner) return { text: "Car", className: "prize" };
                return null;
              }
              if (isChosenDoor) return { text: "Chosen door", className: "chosen" };
              if (isOpened) return { text: "Goat revealed", className: "" };
              return null;
            })();

            return h(
              "button",
              {
                key: door.id,
                type: "button",
                className: [
                  "door-button",
                  isSelected ? "selected" : "",
                  isOpened && round.phase !== PHASES.REVEAL ? "opened-goat" : "",
                  round.phase === PHASES.REVEAL && isWinner ? "winning" : "",
                  round.phase === PHASES.REVEAL && isFinal ? "final-choice" : "",
                ]
                  .filter(Boolean)
                  .join(" "),
                onClick: () => handleDoorPick(door.id),
                disabled: simulation.running || round.phase !== PHASES.PICK,
                "aria-label": `Choose ${door.label}`,
                "aria-pressed": isSelected,
              },
              h(
                "span",
                { className: "door-plate", "aria-hidden": "true" },
                h(ImagePlaceholder, {
                  src: asset,
                  alt: door.label,
                  fallback,
                  className: "door-art",
                }),
              ),
              h("span", { className: `stage-pill door-label ${isChosenDoor && simulationInProgress ? "sim-solid" : ""}`.trim() }, door.label),
              marker
                ? h("span", { className: `door-mark ${marker.className}`.trim() }, marker.text)
                : null,
            );
          }),
        ),
        h(
          "div",
          { className: "character contestant-card" },
          h(ImagePlaceholder, {
            src: ASSETS.contestant,
            alt: "Contestant",
            fallback: "YOU",
            className: "character-art",
          }),
          h("span", { className: "stage-pill" }, "Contestant"),
        ),
      ),
      h(
        "div",
        { className: "interaction-zone" },
        h("p", { className: "instruction", "aria-live": "polite" }, instruction),
        round.phase === PHASES.DECIDE
          ? h(
              "div",
              { className: "choice-row", "aria-label": "Stay or switch" },
              h("button", { className: `choice-btn ${simulationInProgress && round.finalChoice === "stay" ? "sim-solid" : ""}`.trim(), type: "button", onClick: () => finishRound("stay"), disabled: simulation.running }, "Stay"),
              h("button", { className: `choice-btn primary ${simulationInProgress && round.finalChoice === "switch" ? "sim-solid" : ""}`.trim(), type: "button", onClick: () => finishRound("switch"), disabled: simulation.running }, "Switch"),
            )
          : null,
        round.phase === PHASES.REVEAL
          ? h(
              "div",
              { className: "result-panel" },
              h("div", { className: `result-badge ${result ? "success" : "failure"}` }, result ? "You won the car!" : "You got a goat."),
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
        h("button", { className: "ctrl-btn primary", type: "button", onClick: resetRound }, "Reset"),
        h(
          "label",
          { className: "sim-field" },
          h("span", null, "Games"),
          h("input", {
            type: "number",
            min: "1",
            max: "10000",
            value: simulation.targetGames,
            onChange: updateSimulationTarget,
            disabled: simulation.running,
            "aria-label": "Number of simulation games",
          }),
        ),
        simulation.running
          ? h("button", { className: "ctrl-btn", type: "button", onClick: pauseSimulation }, "Pause")
          : h("button", { className: "ctrl-btn", type: "button", onClick: startSimulation }, "Auto-simulate"),
        h(
          "label",
          { className: "sim-field" },
          h("span", null, "Speed"),
          h(
            "select",
            {
              value: simulation.speedMs,
              onChange: updateSimulationSpeed,
              "aria-label": "Simulation speed",
            },
            SPEED_OPTIONS.map((option) =>
              h("option", { key: option.value, value: option.value }, option.label),
            ),
          ),
        ),
        h("button", { className: "ctrl-btn", type: "button", onClick: stepSimulation, disabled: simulation.running }, "Step"),
      ),
      h(
        "aside",
        { className: "stats-panel", "aria-label": "Game statistics" },
        h("div", null, h("span", null, "Simulation progress"), h("strong", null, `${simulation.completedGames}/${simulation.targetGames}`)),
        h("div", null, h("span", null, "Wins by staying"), h("strong", null, `${stats.stayWins} (${stayWinRate}%)`)),
        h("div", null, h("span", null, "Wins by switching"), h("strong", null, `${stats.switchWins} (${switchWinRate}%)`)),
        h("div", null, h("span", null, "Total games"), h("strong", null, stats.totalGames)),
      ),
    ),
  );
}

ReactDOM.createRoot(document.getElementById("montyHallRoot")).render(h(MontyHallVisualizer));
