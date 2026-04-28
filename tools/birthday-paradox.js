const { useCallback, useEffect, useMemo, useRef, useState } = React;
const h = React.createElement;

const ASSETS = {
  room: "../public/images/birthday-paradox/room.png",
  male: "../public/images/birthday-paradox/male.png",
  female: "../public/images/birthday-paradox/female.png",
};

const DAYS_IN_YEAR = 365;
const MAX_PEOPLE = 100;
const NOTABLE_THRESHOLDS = [
  { n: 23, label: "50%" },
  { n: 57, label: "99%" },
  { n: 70, label: "99.9%" },
];

function computeProbability(n) {
  if (n <= 1) return 0;
  if (n >= DAYS_IN_YEAR) return 1;

  let pNoMatch = 1;
  for (let i = 0; i < n; i++) {
    pNoMatch *= (DAYS_IN_YEAR - i) / DAYS_IN_YEAR;
  }
  return 1 - pNoMatch;
}

function buildCurve() {
  const points = [];
  for (let n = 1; n <= MAX_PEOPLE; n++) {
    points.push({ n, p: computeProbability(n) });
  }
  return points;
}

function generateBirthdays(n) {
  const birthdays = [];
  for (let i = 0; i < n; i++) {
    birthdays.push(Math.floor(Math.random() * DAYS_IN_YEAR));
  }
  return birthdays;
}

function findMatches(birthdays) {
  const seen = new Map();
  const matched = new Set();
  birthdays.forEach((day, i) => {
    if (seen.has(day)) {
      matched.add(seen.get(day));
      matched.add(i);
    } else {
      seen.set(day, i);
    }
  });
  return matched;
}

function formatDay(dayIndex) {
  const date = new Date(2024, 0, 1 + dayIndex);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

function ProbabilityChart({ n, curve }) {
  const width = 600;
  const height = 280;
  const padL = 48;
  const padR = 16;
  const padT = 30;
  const padB = 36;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const toX = useCallback((val) => padL + (val / MAX_PEOPLE) * plotW, [plotW]);
  const toY = useCallback((val) => padT + (1 - val) * plotH, [plotH]);

  const pathD = curve
    .map((pt, i) => `${i === 0 ? "M" : "L"}${toX(pt.n).toFixed(1)},${toY(pt.p).toFixed(1)}`)
    .join(" ");

  const currentP = computeProbability(n);
  const cx = toX(n);
  const cy = toY(currentP);

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return h(
    "svg",
    {
      className: "chart-svg",
      viewBox: `0 0 ${width} ${height}`,
      "aria-label": `Probability chart showing ${(currentP * 100).toFixed(1)}% at ${n} people`,
    },
    gridLines.map((v) =>
      h("line", {
        key: v,
        x1: padL,
        x2: width - padR,
        y1: toY(v),
        y2: toY(v),
        className: "chart-grid",
      }),
    ),
    gridLines.map((v) =>
      h(
        "text",
        { key: `label-${v}`, x: padL - 6, y: toY(v) + 4, className: "chart-label", textAnchor: "end" },
        `${Math.round(v * 100)}%`,
      ),
    ),
    [1, 23, 50, 75, 100].map((v) =>
      h(
        "text",
        { key: `x-${v}`, x: toX(v), y: height - 6, className: "chart-label", textAnchor: "middle" },
        v,
      ),
    ),
    h("line", {
      x1: toX(n),
      x2: toX(n),
      y1: padT,
      y2: padT + plotH,
      className: "chart-indicator-line",
    }),
    h("line", {
      x1: padL,
      x2: padL + plotW,
      y1: toY(0.5),
      y2: toY(0.5),
      className: "chart-fifty-line",
    }),
    h("path", { d: pathD, className: "chart-curve", fill: "none" }),
    h("circle", { cx, cy, r: 5.5, className: "chart-dot" }),
    h(
      "text",
      {
        x: cx,
        y: Math.max(14, cy - 12),
        className: "chart-dot-label",
        textAnchor: "middle",
      },
      `${(currentP * 100).toFixed(1)}%`,
    ),
  );
}

function PersonDot({ index, matched, birthday }) {
  const gender = index % 2 === 0 ? "male" : "female";
  const cls = `person-dot ${gender} ${matched ? "matched" : ""}`;
  const icon = gender === "male" ? ASSETS.male : ASSETS.female;
  return h(
    "div",
    { className: cls, title: `Person ${index + 1}: ${formatDay(birthday)}` },
    h("img", { className: "person-icon", src: icon, alt: "" }),
    matched && h("span", { className: "person-match-badge" }, formatDay(birthday)),
  );
}

function BirthdayParadoxVisualizer() {
  const [n, setN] = useState(23);
  const [birthdays, setBirthdays] = useState(() => generateBirthdays(23));
  const [simCount, setSimCount] = useState(0);
  const [simMatches, setSimMatches] = useState(0);
  const [simRunning, setSimRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const simRef = useRef({ count: 0, matches: 0 });
  const speedRef = useRef(simSpeed);
  speedRef.current = simSpeed;
  const SPEED_OPTIONS = [
    { label: "Slow", batch: 1, delay: 250 },
    { label: "Normal", batch: 1, delay: 100 },
    { label: "Fast", batch: 1, delay: 0 },
    { label: "Very Fast", batch: 10, delay: 0 },
  ];

  const curve = useMemo(buildCurve, []);
  const probability = computeProbability(n);
  const matched = useMemo(() => findMatches(birthdays), [birthdays]);
  const hasMatch = matched.size > 0;
  const pairs = (n * (n - 1)) / 2;

  function handleSliderChange(e) {
    const newN = Number(e.target.value);
    setN(newN);
    setBirthdays(generateBirthdays(newN));
  }

  function handleInputChange(e) {
    const val = Math.max(1, Math.min(MAX_PEOPLE, Number(e.target.value) || 1));
    setN(val);
    setBirthdays(generateBirthdays(val));
  }

  function reroll() {
    setBirthdays(generateBirthdays(n));
  }

  function resetSim() {
    setSimRunning(false);
    setSimCount(0);
    setSimMatches(0);
    simRef.current = { count: 0, matches: 0 };
  }

  useEffect(() => {
    if (!simRunning) return;
    let timer;
    let cancelled = false;
    const theoretical = (probability * 100).toFixed(1);
    function tick() {
      if (cancelled) return;
      const speed = SPEED_OPTIONS[speedRef.current];
      let localMatches = 0;
      for (let i = 0; i < speed.batch; i++) {
        const bdays = generateBirthdays(n);
        if (findMatches(bdays).size > 0) localMatches++;
      }
      const ref = simRef.current;
      ref.count += speed.batch;
      ref.matches += localMatches;
      setSimCount(ref.count);
      setSimMatches(ref.matches);
      const empirical = ((ref.matches / ref.count) * 100).toFixed(1);
      if (ref.count >= 1000 && empirical === theoretical) {
        setSimRunning(false);
        return;
      }
      if (speed.delay > 0) {
        timer = setTimeout(tick, speed.delay);
      } else {
        timer = requestAnimationFrame(tick);
      }
    }
    timer = requestAnimationFrame(tick);
    return () => { cancelled = true; clearTimeout(timer); cancelAnimationFrame(timer); };
  }, [simRunning, n, probability]);

  const simRate = simCount > 0 ? ((simMatches / simCount) * 100).toFixed(1) : null;

  return h(
    "div",
    { className: "bp-shell" },
    h(
      "nav",
      { className: "breadcrumb", "aria-label": "Breadcrumb" },
      h("a", { href: "../index.html" }, "Puzzles"),
      h("span", { className: "breadcrumb-sep", "aria-hidden": "true" }, "/"),
      h("a", { href: "../problems/birthday-paradox.html" }, "Birthday Paradox"),
      h("span", { className: "breadcrumb-sep", "aria-hidden": "true" }, "/"),
      h("a", { href: "../solutions/birthday-paradox.html" }, "Solution"),
      h("span", { className: "breadcrumb-sep", "aria-hidden": "true" }, "/"),
      h("span", { "aria-current": "page" }, "Visualizer"),
    ),
    h(
      "header",
      { className: "bp-header" },
      h("h1", null, "Birthday Paradox"),
      h("p", { className: "bp-subtitle" }, "How many people until a match?"),
    ),
    h(
      "section",
      { className: "stage-card", "aria-label": "Birthday Paradox visualizer" },
      h(
        "div",
        { className: "controls-row" },
        h(
          "div",
          { className: "slider-group" },
          h(
            "label",
            { className: "slider-label", htmlFor: "peopleSlider" },
            "People in the room",
          ),
          h(
            "div",
            { className: "slider-input-row" },
            h("input", {
              id: "peopleSlider",
              type: "range",
              min: 1,
              max: MAX_PEOPLE,
              value: n,
              onChange: handleSliderChange,
              className: "people-slider",
            }),
            h("input", {
              type: "number",
              min: 1,
              max: MAX_PEOPLE,
              value: n,
              onChange: handleInputChange,
              className: "people-input",
              "aria-label": "Number of people",
            }),
          ),
        ),
        h(
          "div",
          { className: "hero-stat" },
          h(
            "div",
            { className: "hero-stat-value" },
            `${(probability * 100).toFixed(1)}%`,
          ),
          h("div", { className: "hero-stat-label" }, "chance of a shared birthday"),
        ),
      ),
      h(
        "div",
        { className: "info-row" },
        h(
          "div",
          { className: "info-chip" },
          h("span", { className: "info-chip-label" }, "Unique pairs"),
          h("span", { className: "info-chip-value" }, pairs),
        ),
        NOTABLE_THRESHOLDS.map((t) =>
          h(
            "div",
            { key: t.n, className: `info-chip ${n >= t.n ? "info-chip-active" : ""}` },
            h("span", { className: "info-chip-label" }, t.label),
            h("span", { className: "info-chip-value" }, `${t.n} people`),
          ),
        ),
      ),
      h(ProbabilityChart, { n, curve }),
      h(
        "div",
        { className: "room-section" },
        h(
          "div",
          { className: "room-header" },
          h(
            "div",
            { className: "room-title" },
            h(ImagePlaceholder, {
              src: ASSETS.room,
              alt: "",
              fallback: "",
              className: "room-icon",
            }),
            h("span", null, "The Room"),
          ),
          h(
            "button",
            { className: "ctrl-btn", type: "button", onClick: reroll },
            "Reroll birthdays",
          ),
        ),
        h(
          "div",
          { className: "room-grid", "aria-label": "People in the room" },
          birthdays.map((bday, i) =>
            h(PersonDot, {
              key: i,
              index: i,
              matched: matched.has(i),
              birthday: bday,
            }),
          ),
        ),
        h(
          "p",
          { className: `room-result ${hasMatch ? "room-result-match" : ""}`, "aria-live": "polite" },
          hasMatch
            ? "A birthday match was found!"
            : "No matches this time.",
        ),
      ),
    ),
    h(
      "section",
      { className: "lower-row", "aria-label": "Monte Carlo simulation" },
      h(
        "div",
        { className: "sim-section" },
        h("h2", { className: "sim-title" }, "Monte Carlo Simulation"),
        h("p", { className: "sim-desc" }, `Watch the empirical rate converge to the theoretical ${(probability * 100).toFixed(1)}% with ${n} people.`),
        h(
          "div",
          { className: "sim-controls" },
          h("button", { className: "ctrl-btn primary sim-reset-btn", type: "button", onClick: resetSim }, "Reset"),
          h(
            "div",
            { className: "sim-control-pair" },
            h("button", {
              className: `ctrl-btn${simRunning ? " active" : ""}`,
              type: "button",
              onClick: () => {
                if (simRunning) {
                  setSimRunning(false);
                } else {
                  setTimeout(() => setSimRunning(true), 0);
                }
              },
            }, simRunning ? h(React.Fragment, null, h("span", { className: "btn-icon", "aria-hidden": "true" }, "⏸"), "Pause") : h(React.Fragment, null, h("span", { className: "btn-icon", "aria-hidden": "true" }, "▶"), "Play")),
            h(
              "div",
              { className: "speed-select-wrap" },
              h("span", { className: "speed-label" }, "Speed"),
              h("select", {
                className: "speed-select",
                value: simSpeed,
                onChange: (e) => setSimSpeed(Number(e.target.value)),
              }, SPEED_OPTIONS.map((opt, i) =>
                h("option", { key: i, value: i }, opt.label)
              )),
            ),
          ),
        ),
      ),
      h(
        "aside",
        { className: "stats-panel", "aria-label": "Simulation statistics" },
        h("div", null, h("span", null, "Trials run"), h("strong", null, simCount.toLocaleString())),
        h("div", null, h("span", null, "Matches found"), h("strong", null, simMatches.toLocaleString())),
        h("div", null, h("span", null, "Empirical rate"), h("strong", null, simRate !== null ? `${simRate}%` : "—")),
        h("div", null, h("span", null, "Theoretical"), h("strong", null, `${(probability * 100).toFixed(1)}%`)),
      ),
    ),
  );
}

ReactDOM.createRoot(document.getElementById("birthdayParadoxRoot")).render(h(BirthdayParadoxVisualizer));
