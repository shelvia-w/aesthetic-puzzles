const problems = [
  {
    slug: "two-doors-two-guards",
    title: "Two Doors and Two Guards",
    category: "Logic",
    description:
      "One door leads to freedom, the other to doom. One guard always lies, the other always tells the truth. You get one question.",
    statement:
      "You stand before two doors. One leads to freedom, the other to certain doom. Each door is guarded by a guard: one always tells the truth, the other always lies. You don't know which guard is which. You may ask one guard a single yes-or-no question to determine which door leads to freedom. What  do you ask?",
    solution: {
      summary: "Ask either guard: \"If I asked the other guard which door leads to freedom, what would they say?\" Then choose the opposite door.",
      steps: [
        {
          title: "Understand the setup",
          body: "There are two guards and two doors. The truth-teller always answers honestly. The liar always answers dishonestly. You need to find the freedom door with just one question.",
        },
        {
          title: "The key insight: double negation",
          body: "If you ask about what the OTHER guard would say, both guards end up pointing you to the wrong door, because the liar lies about the truth-teller's honest answer, and the truth-teller honestly reports the liar's dishonest answer.",
        },
        {
          title: "Ask the question",
          body: "Ask either guard: \"If I asked the other guard which door leads to freedom, what would they say?\" Both guards will point to the doom door.",
        },
        {
          title: "Choose the opposite",
          body: "Whichever door the guard indicates, choose the OTHER door. That's the one that leads to freedom.",
        },
      ],
    },
    imagePath: "public/images/two-doors-two-guards/main.png",
    solutionImagePath: "public/images/two-doors-two-guards/solution.png",
    accent: "violet",
    categories: ["Logic", "Classic"],
  },
  {
    slug: "monty-hall",
    title: "Monty Hall",
    category: "Probability",
    description:
      "Three doors, one car, two goats. You pick a door, the host opens another. Should you switch?",
    statement:
      "You're on a game show. There are three doors: behind one is a car, behind the other two are goats. You pick a door. The host, who knows what's behind each door, opens a different door to reveal a goat. You're given the chance to switch your choice to the remaining unopened door. Should you switch or stay?",
    solution: {
      summary: "Always switch. Switching gives you a 2/3 chance of winning, while staying gives you only 1/3.",
      steps: [
        {
          title: "Your initial pick",
          body: "When you first choose a door, you have a 1/3 chance of picking the car and a 2/3 chance of picking a goat.",
        },
        {
          title: "The host opens a door",
          body: "The host always opens a door with a goat behind it. This is not random, the host knows where the car is and deliberately avoids it.",
        },
        {
          title: "If you stay",
          body: "Your odds don't change. You still have the same 1/3 chance you started with, because no new information changes your original pick.",
        },
        {
          title: "If you switch",
          body: "The remaining door inherits the 2/3 probability that was spread across the two doors you didn't pick. Since the host eliminated one losing door, all of that probability concentrates on the one remaining door.",
        },
        {
          title: "The conclusion",
          body: "Switching wins 2/3 of the time. Staying wins 1/3 of the time. You should always switch.",
        },
      ],
    },
    imagePath: "public/images/monty-hall/main.png",
    solutionImagePath: "public/images/monty-hall/solution.png",
    accent: "amber",
    categories: ["Probability", "Classic"],
  },
  {
    slug: "river-crossing",
    title: "River Crossing",
    category: "Logic",
    description:
      "A farmer must ferry a wolf, a goat, and a cabbage across a river. The boat fits only one. Who eats whom?",
    statement:
      "A farmer stands on one side of a river with a wolf, a goat, and a cabbage. He has a boat that can carry only himself and one other item. If left alone together, the wolf will eat the goat, and the goat will eat the cabbage. How can the farmer transport all three across the river without anything being eaten?",
    solution: {
      summary: "Take the goat first, then shuttle the wolf or cabbage while bringing the goat back on the return trip to avoid any dangerous pairing.",
      steps: [
        {
          title: "Take the goat across",
          body: "The goat is the problem: it's prey for the wolf and a predator of the cabbage. Removing the goat first leaves the wolf and cabbage together, which is safe.",
        },
        {
          title: "Return alone and take the wolf",
          body: "Go back empty-handed, then bring the wolf to the far side.",
        },
        {
          title: "Bring the goat back",
          body: "You can't leave the wolf and goat together. Take the goat back to the starting side.",
        },
        {
          title: "Take the cabbage across",
          body: "Leave the goat on the starting side and ferry the cabbage over. The wolf and cabbage are safe together on the far side.",
        },
        {
          title: "Return and take the goat",
          body: "Go back one last time and bring the goat across. All three items are now safely on the far side.",
        },
      ],
    },
    imagePath: "public/images/river-crossing/main.png",
    solutionImagePath: "public/images/river-crossing/solution.png",
    accent: "cyan",
    categories: ["Logic", "Classic"],
  },
  {
    slug: "birthday-paradox",
    title: "Birthday Paradox",
    category: "Probability",
    description:
      "How many people do you need in a room before there's a 50% chance two of them share a birthday?",
    statement:
      "Imagine a room full of strangers. How many people need to be in the room before there is a better-than-even chance (probability is greater than 50%) that at least two of them share the same birthday? Assume 365 days in a year and that birthdays are uniformly distributed.",
    solution: {
      summary: "Only <strong>23 people</strong> are needed for a greater than 50% chance that two share a birthday. The number is surprisingly low because every pair of people is a potential match, and the number of pairs grows much faster than the number of people.",
      steps: [
        {
          title: "Count the pairs, not the people",
          body: "With n people, the number of unique pairs is n × (n − 1) / 2. Even 23 people produce 253 pairs, each of which is a chance for a birthday match.",
        },
        {
          title: "Start from no match",
          body: "It's easier to calculate the probability that nobody shares a birthday, then subtract from 1. The first person can have any birthday. The second must avoid 1 day out of 365, the third must avoid 2, and so on.",
        },
        {
          title: "Multiply the survival odds",
          body: "P(no match) = (365/365) × (364/365) × (363/365) × … × ((365 − n + 1)/365). Each factor is slightly less than 1, and they compound quickly.",
        },
        {
          title: "Flip it",
          body: "P(at least one match) = 1 − P(no match). At 23 people this crosses 50%. By 70 people it exceeds 99.9%.",
        },
      ],
    },
    imagePath: "public/images/birthday-paradox/main.png",
    solutionImagePath: "public/images/birthday-paradox/solution.png",
    accent: "rose",
    categories: ["Probability", "Classic"],
  },
];

const filters = ["All", ...new Set(problems.flatMap((problem) => problem.categories))];
