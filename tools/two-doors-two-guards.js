const $ = (id) => document.getElementById(id);

const els = {
  caption: $("captionText"),
  speechBubble: $("speechBubble"),
  speechContent: $("speechContent"),
  thoughtLeft: $("thoughtLeft"),
  thoughtLeftContent: $("thoughtLeftContent"),
  thoughtRight: $("thoughtRight"),
  thoughtRightContent: $("thoughtRightContent"),
  guardLeft: $("guardLeft"),
  guardRight: $("guardRight"),
  guardLeftLabel: $("guardLeftLabel"),
  guardRightLabel: $("guardRightLabel"),
  blueDoor: $("blueDoor"),
  redDoor: $("redDoor"),
  doorLeftLabel: $("doorLeftLabel"),
  doorRightLabel: $("doorRightLabel"),
  doorLeftResult: $("doorLeftResult"),
  doorRightResult: $("doorRightResult"),
  doorLeftBtn: $("doorLeftBtn"),
  doorRightBtn: $("doorRightBtn"),
  guardLeftBtn: $("guardLeftBtn"),
  guardRightBtn: $("guardRightBtn"),
  choiceButtons: $("choiceButtons"),
  askLeftBtn: $("askLeftBtn"),
  askRightBtn: $("askRightBtn"),
  resultPanel: $("resultPanel"),
  resultBadge: $("resultBadge"),
  resultExplanation: $("resultExplanation"),
  btnNewRound: $("btnNewRound"),
  btnExplain: $("btnExplain"),
};

const PHASES = {
  CHOOSE_GUARD: "choose_guard",
  SEE_RESPONSE: "see_response",
  CHOOSE_DOOR: "choose_door",
  REVEAL: "reveal",
};

const DOOR_ART = {
  leftClosed: "../public/images/two-doors-two-guards/door1.png",
  rightClosed: "../public/images/two-doors-two-guards/door2.png",
  freedom: "../public/images/two-doors-two-guards/door-heaven.png",
  doom: "../public/images/two-doors-two-guards/door-doom.png",
};

let puzzle = {};
let phase = null;

function randomBool() {
  return Math.random() < 0.5;
}

function generatePuzzle() {
  const freedomDoor = randomBool() ? "left" : "right";
  const truthfulGuard = randomBool() ? "left" : "right";
  return {
    freedomDoor,
    doomDoor: freedomDoor === "left" ? "right" : "left",
    truthfulGuard,
    lyingGuard: truthfulGuard === "left" ? "right" : "left",
    askedGuard: null,
    indicatedDoor: null,
    chosenDoor: null,
  };
}

function getGuardResponse(askedSide) {
  // "Which door would the OTHER guard say leads to freedom?"
  // Both guards always indicate the DOOM door.
  return puzzle.doomDoor;
}

function doorName(side) {
  return side === "left" ? "Door A" : "Door B";
}

function guardName(side) {
  return side === "left" ? "Left Guard" : "Right Guard";
}

function clearScene() {
  setDoorArt("left", DOOR_ART.leftClosed);
  setDoorArt("right", DOOR_ART.rightClosed);

  els.speechBubble.classList.remove("visible", "animate-in");
  els.speechContent.textContent = "";

  els.thoughtLeft.classList.remove("visible");
  els.thoughtRight.classList.remove("visible");
  els.thoughtLeftContent.textContent = "";
  els.thoughtRightContent.textContent = "";

  els.guardLeft.classList.remove("active", "dimmed", "clickable");
  els.guardRight.classList.remove("active", "dimmed", "clickable");
  els.guardLeftLabel.textContent = "Guard";
  els.guardRightLabel.textContent = "Guard";
  els.guardLeftBtn.disabled = true;
  els.guardRightBtn.disabled = true;

  els.blueDoor.classList.remove(
    "highlight-correct", "highlight-wrong", "reveal-freedom", "reveal-doom", "dimmed",
    "clickable", "user-chose"
  );
  els.redDoor.classList.remove(
    "highlight-correct", "highlight-wrong", "reveal-freedom", "reveal-doom", "dimmed",
    "clickable", "user-chose"
  );
  els.doorLeftBtn.disabled = true;
  els.doorRightBtn.disabled = true;

  els.doorLeftResult.textContent = "";
  els.doorLeftResult.classList.remove("visible", "freedom", "doom");
  els.doorRightResult.textContent = "";
  els.doorRightResult.classList.remove("visible", "freedom", "doom");
  els.doorLeftLabel.classList.remove("selected");
  els.doorRightLabel.classList.remove("selected");

  els.choiceButtons.classList.remove("hidden");
  els.resultPanel.classList.remove("visible");
}

function setCaption(text) {
  els.caption.textContent = text;
}

function doorEl(side) {
  return side === "left" ? els.blueDoor : els.redDoor;
}

function doorLabelEl(side) {
  return side === "left" ? els.doorLeftLabel : els.doorRightLabel;
}

function doorArtEl(side) {
  return doorEl(side).querySelector(".door-art");
}

function setDoorArt(side, src) {
  doorArtEl(side).src = src;
}

function doorResultEl(side) {
  return side === "left" ? els.doorLeftResult : els.doorRightResult;
}

function guardEl(side) {
  return side === "left" ? els.guardLeft : els.guardRight;
}

function guardLabelEl(side) {
  return side === "left" ? els.guardLeftLabel : els.guardRightLabel;
}

function thoughtEl(side) {
  return side === "left" ? els.thoughtLeft : els.thoughtRight;
}

function thoughtContentEl(side) {
  return side === "left" ? els.thoughtLeftContent : els.thoughtRightContent;
}

// ── Phase: Choose Guard ──

function enterChooseGuard() {
  phase = PHASES.CHOOSE_GUARD;
  clearScene();
  setCaption("Choose a guard to ask your question.");

  els.guardLeft.classList.add("clickable");
  els.guardRight.classList.add("clickable");
  els.guardLeftBtn.disabled = false;
  els.guardRightBtn.disabled = false;

  els.choiceButtons.classList.remove("hidden");
  els.askLeftBtn.style.display = "";
  els.askRightBtn.style.display = "";
}

// ── Phase: See Response ──

function enterSeeResponse(askedSide) {
  phase = PHASES.SEE_RESPONSE;
  puzzle.askedGuard = askedSide;

  els.guardLeft.classList.remove("clickable");
  els.guardRight.classList.remove("clickable");
  els.guardLeftBtn.disabled = true;
  els.guardRightBtn.disabled = true;
  els.choiceButtons.classList.add("hidden");

  const otherSide = askedSide === "left" ? "right" : "left";
  const asked = guardEl(askedSide);
  const other = guardEl(otherSide);

  asked.classList.add("active");
  other.classList.add("dimmed");

  els.speechBubble.classList.add("visible", "animate-in");
  els.speechContent.textContent =
    `You ask the ${guardName(askedSide)}:\n "Which door would the other guard say leads to freedom?"`;

  setCaption("The guard considers the question...");

  setTimeout(() => {
    if (phase !== PHASES.SEE_RESPONSE) return;

    const indicated = getGuardResponse(askedSide);
    puzzle.indicatedDoor = indicated;

    const thought = thoughtEl(askedSide);
    const thoughtContent = thoughtContentEl(askedSide);
    thought.classList.add("visible");
    thoughtContent.textContent = doorName(indicated);

    setCaption(
      `The ${guardName(askedSide)} points to ${doorName(indicated)}. Now choose a door.`
    );

    enterChooseDoor();
  }, 1600);
}

// ── Phase: Choose Door ──

function enterChooseDoor() {
  phase = PHASES.CHOOSE_DOOR;

  els.blueDoor.classList.add("clickable");
  els.redDoor.classList.add("clickable");
  els.doorLeftBtn.disabled = false;
  els.doorRightBtn.disabled = false;
}

// ── Phase: Reveal ──

function enterReveal(chosenSide) {
  phase = PHASES.REVEAL;
  puzzle.chosenDoor = chosenSide;

  els.blueDoor.classList.remove("clickable");
  els.redDoor.classList.remove("clickable");
  els.doorLeftBtn.disabled = true;
  els.doorRightBtn.disabled = true;

  const won = chosenSide === puzzle.freedomDoor;
  const chosenDoor = doorEl(chosenSide);
  const otherDoorSide = chosenSide === "left" ? "right" : "left";

  chosenDoor.classList.add("user-chose");
  doorLabelEl(chosenSide).classList.add("selected");

  // Hide response bubble
  thoughtEl(puzzle.askedGuard).classList.remove("visible");

  // Brief pause then reveal
  setTimeout(() => {
    if (phase !== PHASES.REVEAL) return;

    // Show freedom door
    const freedomEl = doorEl(puzzle.freedomDoor);
    const doomEl = doorEl(puzzle.doomDoor);
    const freedomResult = doorResultEl(puzzle.freedomDoor);
    const doomResult = doorResultEl(puzzle.doomDoor);

    setDoorArt(puzzle.freedomDoor, DOOR_ART.freedom);
    setDoorArt(puzzle.doomDoor, DOOR_ART.doom);

    freedomEl.classList.add("highlight-correct", "reveal-freedom");
    freedomResult.textContent = "Freedom";
    freedomResult.classList.add("visible", "freedom");

    doomEl.classList.add("highlight-wrong", "reveal-doom");
    doomResult.textContent = "Doom";
    doomResult.classList.add("visible", "doom");

    // Reveal guard identities
    guardLabelEl(puzzle.truthfulGuard).textContent = "Truthful";
    guardLabelEl(puzzle.lyingGuard).textContent = "Liar";
    guardEl(puzzle.askedGuard).classList.remove("active");
    guardEl(puzzle.askedGuard === "left" ? "right" : "left").classList.remove("dimmed");

    // Show result
    els.resultBadge.className = "result-badge " + (won ? "success" : "failure");
    els.resultBadge.textContent = won ? "You escaped!" : "You chose doom...";

    const askedType = puzzle.askedGuard === puzzle.truthfulGuard ? "truthful" : "lying";
    const indicatedName = doorName(puzzle.indicatedDoor);
    const freedomName = doorName(puzzle.freedomDoor);

    let explanation;
    if (askedType === "truthful") {
      explanation =
        `You asked the truthful guard. They honestly reported what the liar would say: ` +
        `the liar would have lied and pointed to ${indicatedName} (the doom door). ` +
        `The correct strategy is to always choose the opposite of what you're told: ${freedomName}.`;
    } else {
      explanation =
        `You asked the lying guard. They lied about what the truthful guard would say: ` +
        `the truthful guard would have pointed to ${freedomName}, but the liar flipped it to ${indicatedName}. ` +
        `The correct strategy is to always choose the opposite of what you're told: ${freedomName}.`;
    }
    els.resultExplanation.textContent = explanation;
    els.resultPanel.classList.add("visible");

    setCaption(
      won
        ? `You chose ${doorName(chosenSide)}: freedom! The opposite of what the guard indicated.`
        : `You chose ${doorName(chosenSide)}: doom. The guard pointed to ${indicatedName}, and the trick is to pick the other door.`
    );
  }, 800);
}

// ── Explanation overlay ──

function showExplanation() {
  let overlay = document.querySelector(".explain-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "explain-overlay";
    overlay.innerHTML = `
      <div class="explain-scrim"></div>
      <div class="explain-card">
        <div class="explain-header">
          <h2>Why Does This Work?</h2>
          <button class="explain-close" type="button" aria-label="Close">&times;</button>
        </div>
        <div class="explain-steps">
          <div class="explain-step">
            <span class="step-num">1</span>
            <div>
              <h3>The Setup</h3>
              <p>One guard always tells the truth. The other always lies. You don't know which is which. You get one question.</p>
            </div>
          </div>
          <div class="explain-step">
            <span class="step-num">2</span>
            <div>
              <h3>The Key Question</h3>
              <p>Ask either guard: "Which door would the <em>other</em> guard say leads to freedom?" This makes both guards point to the wrong door, whether they are truthful or lying.</p>
            </div>
          </div>
          <div class="explain-step">
            <span class="step-num">3</span>
            <div>
              <h3>If You Ask the Truthful Guard</h3>
              <p>The truthful guard honestly reports the liar's answer. The liar would point to the doom door. So the truthful guard tells you the doom door.</p>
            </div>
          </div>
          <div class="explain-step">
            <span class="step-num">4</span>
            <div>
              <h3>If You Ask the Lying Guard</h3>
              <p>The lying guard lies about the truthful guard's answer. The truthful guard would point to the freedom door. The liar flips it and tells you the doom door.</p>
            </div>
          </div>
          <div class="explain-step">
            <span class="step-num">5</span>
            <div>
              <h3>The Result</h3>
              <p>No matter which guard you ask, the answer always points to the <strong>wrong</strong> door. So choose the <strong>opposite</strong> door, and you'll always find freedom.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector(".explain-scrim").addEventListener("click", hideExplanation);
    overlay.querySelector(".explain-close").addEventListener("click", hideExplanation);
  }

  requestAnimationFrame(() => overlay.classList.add("visible"));
}

function hideExplanation() {
  const overlay = document.querySelector(".explain-overlay");
  if (overlay) overlay.classList.remove("visible");
}

// ── Event listeners ──

els.askLeftBtn.addEventListener("click", () => {
  if (phase === PHASES.CHOOSE_GUARD) enterSeeResponse("left");
});

els.askRightBtn.addEventListener("click", () => {
  if (phase === PHASES.CHOOSE_GUARD) enterSeeResponse("right");
});

els.guardLeftBtn.addEventListener("click", () => {
  if (phase === PHASES.CHOOSE_GUARD) enterSeeResponse("left");
});

els.guardRightBtn.addEventListener("click", () => {
  if (phase === PHASES.CHOOSE_GUARD) enterSeeResponse("right");
});

els.doorLeftBtn.addEventListener("click", () => {
  if (phase === PHASES.CHOOSE_DOOR) enterReveal("left");
});

els.doorRightBtn.addEventListener("click", () => {
  if (phase === PHASES.CHOOSE_DOOR) enterReveal("right");
});

els.btnNewRound.addEventListener("click", () => {
  puzzle = generatePuzzle();
  enterChooseGuard();
});

els.btnExplain.addEventListener("click", showExplanation);

// ── Init ──

puzzle = generatePuzzle();
enterChooseGuard();
