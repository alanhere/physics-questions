import { useState, useCallback, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  LineChart, Line,
  BarChart, Bar,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts'

// ---------------------------------------------------------------------------
// Topic data — aligned to the 2025 LC Physics specification (NCCA)
// Each subtopic lists the specific learning outcomes students should be able to demonstrate.
// hlOnly: true marks sections that appear in bold in the spec (HL only).
// ---------------------------------------------------------------------------
const TOPICS = [
  {
    name: 'Strand 1: Forces and Motion',
    subtopics: [
      {
        label: '1.1 Particle motion in a straight line',
        outcomes: [
          'Model the motion of a particle in a straight line using displacement, velocity, acceleration and time',
          'Investigate and interpret displacement–time and velocity–time graphs for constant and varying motion',
          'Derive and apply the kinematic equations: v = u + at, s = ut + ½at², v² = u² + 2as',
          'Identify and distinguish between scalar and vector quantities',
          'Resolve vectors into perpendicular components and calculate the resultant of two vectors',
          'Verify the law of addition of vectors in one and two dimensions',
        ],
      },
      {
        label: '1.2 Forces acting on a particle',
        outcomes: [
          "Model real-world situations using Newton's three laws of motion (F = ma)",
          "Verify Newton's 2nd law of motion",
          'Model problems involving the motion of a particle under a constant resultant force',
          'Solve problems involving normal force, friction, tension, buoyancy and gravitational force',
          'Solve problems relating to pressure in solids (P = F/A) and fluids (P = hρg)',
          'Investigate density (ρ = m/V)',
          'Investigate the principle of conservation of momentum (p = mv)',
          "Verify that collisions are governed by Newton's laws and conservation of momentum",
          'Model direct collisions in one dimension and in two dimensions using perpendicular and parallel components',
        ],
      },
      {
        label: '1.3 Stretching and compressing objects',
        outcomes: [
          'Investigate the force needed to compress or stretch an object',
          "Verify Hooke's law for elastic objects: F = −ks",
          'Calculate elastic potential energy stored in a stretched or compressed material: E = ½ks²',
        ],
      },
      {
        label: '1.4 Work, energy and power',
        outcomes: [
          'Define and calculate work done by a constant force: W = Fs',
          'Model and calculate gravitational potential energy (Ep = mgh), kinetic energy (Ek = ½mv²) and elastic potential energy',
          'Calculate power: P = W/t',
          'Apply the principle of conservation of energy to real-life situations',
          'Investigate the principle of conservation of energy using primary and secondary data',
        ],
      },
      {
        label: '1.5 Gravitational fields',
        hlOnly: true,
        outcomes: [
          'Model the gravitational field strength at any point in a gravitational field, including at the surface of a planet: g = GM/r²',
          'Determine g using primary data (e.g. simple pendulum: g = 4π²l/T²)',
          'Calculate escape velocity from a celestial body',
        ],
      },
      {
        label: '1.6 Circular motion and orbital mechanics',
        outcomes: [
          'Explain centripetal force and centripetal acceleration',
          'Model the dynamics of an object moving in a circle with constant angular velocity: F = mv²/r',
          "Verify Kepler's 3rd law using secondary data: T² ∝ r³",
          'Model the orbits of planets and satellites in near-Earth and geostationary orbits',
        ],
      },
    ],
  },
  {
    name: 'Strand 2: Wave Motion and Energy Transfer',
    subtopics: [
      {
        label: '2.1 Heat and temperature',
        outcomes: [
          'Analyse the suitability of materials for use as thermometers',
          'Determine specific heat capacity using primary data: Q = mcΔT',
          'Determine specific latent heat of vaporisation and fusion: Q = mL',
          'Verify mathematical models of heat energy, latent heat and temperature change',
          'Solve real-life problems involving heat transfer, change of state and improving efficiency',
          'Investigate the impact of insulation on energy consumption and sustainability using secondary sources',
        ],
      },
      {
        label: '2.2 Wave motion and resonance',
        outcomes: [
          'Model wave motion using the wave equation: v = fλ',
          'Describe transverse and longitudinal waves using amplitude, frequency, wavelength and period',
          'Investigate resonance in real-life situations using secondary sources',
        ],
      },
      {
        label: '2.3 Wave behaviour',
        outcomes: [
          'Model wave behaviour: reflection, refraction, diffraction, interference and polarisation',
          "Verify models for refraction using primary and secondary data (Snell's law: n₁sinθ₁ = n₂sinθ₂)",
        ],
      },
      {
        label: '2.4 Electromagnetic energy and optics',
        outcomes: [
          'Verify the thin lens model using primary and secondary data for converging lenses and secondary data for diverging lenses: 1/f = 1/u + 1/v',
          'Investigate the use of optics in technological and medical applications using secondary sources',
          'Categorise electromagnetic waves by their wavelength, frequency, ionising ability and everyday use',
          'Investigate dispersion and explain the phenomenon',
          'Investigate solar irradiance and its impact on life on Earth using secondary sources',
        ],
      },
      {
        label: '2.5 Sound energy',
        outcomes: [
          'Examine evidence to support the mechanical wave nature of sound',
          'Relate the pitch and loudness of sounds to their wave properties using observation and secondary data',
          'Investigate the use of ultrasound in technological and medical contexts using secondary sources',
        ],
      },
      {
        label: '2.6 Principle of superposition of waves',
        outcomes: [
          'Model standing waves on a stretched string as resulting from the interference of two waves moving in opposite directions',
          'Verify standing waves on a stretched string using primary and secondary data',
          'Relate the length of a string to the fundamental frequency of a standing wave using secondary data',
          'Investigate the wave nature of light and determine its wavelength using primary and secondary data (Young\'s slits / diffraction grating)',
        ],
      },
      {
        label: '2.7 Wave effects — the Doppler effect',
        outcomes: [
          'Model real-life situations involving the Doppler effect',
          'Investigate the Doppler effect in real-life applications using secondary sources (e.g. speed detection, medical imaging)',
        ],
      },
    ],
  },
  {
    name: 'Strand 3: Electric and Magnetic Fields',
    subtopics: [
      {
        label: '3.1 Electrostatics and electric fields',
        outcomes: [
          'Describe and explain forces between charged objects and between charged and neutral objects',
          'Classify materials as conductors or insulators and explain their behaviour',
          'Solve problems involving static electrical phenomena',
          "Model the electrostatic force between point charges using Coulomb's law: F = kq₁q₂/r²",
          'Discuss the electric field as a model for non-contact interaction between charges',
          'Define electric field strength at a point: E = F/q',
          'Use field lines to represent the relative strength and direction of electric fields around charged objects',
        ],
      },
      {
        label: '3.2 Current electricity and circuits',
        outcomes: [
          'Apply the relationship between current and charge: Q = It',
          'Apply the relationship between work, charge and potential difference: V = W/Q',
          'Apply relationships between current, voltage, power and resistance: V = IR, P = VI',
          'Analyse series and parallel circuits, including the rules for voltage and current',
          'Apply formulae for resistors in series and parallel',
          'Investigate the use of semiconductors in real-world applications using secondary sources',
          'Model the relationship between current and voltage across a diode in forward and reverse bias using primary and secondary data',
          "Verify Ohm's law for an ohmic conductor using primary and secondary data",
          'Investigate current–voltage characteristics of non-ohmic conductors',
          'Investigate the effect of temperature on the resistance of a conductor',
        ],
      },
      {
        label: '3.3 Magnetic fields and the motor effect',
        outcomes: [
          'Describe and draw magnetic field patterns around a permanent magnet, a current-carrying straight wire, and a solenoid',
          'Investigate the use of permanent and temporary magnets in real-life situations',
          'Relate the magnetic force on a current-carrying conductor to field and current: F = BIl',
          'Explain the motor effect and describe how a DC motor works',
        ],
      },
      {
        label: '3.4 Electromagnetic induction and generators',
        outcomes: [
          "Investigate the relationship between a change in magnetic flux and induced EMF and subsequent current flow in a conducting coil (Faraday's law; Lenz's law)",
          'Model the generator effect, AC and DC generators, and transformers',
          'Investigate the use of induced potential difference in a variety of applications using secondary sources',
          'Solve problems involving the efficiency of transformers',
          'Investigate transmission losses in the National Grid using secondary sources',
          'Investigate issues related to electrical generation and distribution using secondary sources',
        ],
      },
    ],
  },
  {
    name: 'Strand 4: Modern Physics — Atomic and Nuclear',
    subtopics: [
      {
        label: '4.1 The electron and thermionic emission',
        outcomes: [
          'Describe evidence supporting the existence and properties of the electron (e.g. cathode ray experiments)',
          'Explain the basic principles of thermionic emission',
          'Describe the deflection of a beam of electrons in electric and magnetic fields',
        ],
      },
      {
        label: '4.2 The photoelectric effect',
        outcomes: [
          'Verify the photoelectric effect and explain the effect of varying intensity and frequency of incident radiation',
          "Explain how photoelectric emission supports the particle model of light (photons; E = hf)",
          'Relate the photoelectric effect to the operation of a photocell',
          'Investigate real-life applications of the photoelectric effect',
          'Compare x-ray production and the photoelectric effect',
        ],
      },
      {
        label: '4.3 Atomic structure and emission spectra',
        outcomes: [
          'Model the atom and explain emission spectra of atoms',
          'Appreciate how the analysis of emission spectra data has contributed to our understanding of the universe',
        ],
      },
      {
        label: '4.4 Radioactivity and nuclear decay',
        outcomes: [
          'Analyse evidence supporting the existence of natural background radiation',
          'Classify alpha, beta and gamma emissions in terms of relative ionising effects, penetrating power, charge, mass and deflection in fields',
          'Model spontaneous radioactive decay using the decay equation',
          'Apply the half-life model to solve problems involving activity and amount of sample remaining',
          'Analyse the Cockcroft and Walton experiment and appreciate its significance as the first nuclear transformation by artificially accelerated particles',
        ],
      },
      {
        label: '4.5 Particle physics and nuclear energy',
        outcomes: [
          'Describe matter in terms of fundamental particles (quarks, leptons) and their properties using secondary sources',
          'Explain how forces are communicated between fundamental particles (exchange particles)',
          'Model nuclear fission, nuclear fusion and particle–antiparticle interactions (E = mc²)',
          'Evaluate evidence about issues related to nuclear fission and fusion in electrical generation',
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// URL share — compress questions into a URL hash and decompress on load
// Uses the browser's built-in CompressionStream (no extra dependencies).
// ---------------------------------------------------------------------------
async function encodeQuestionsToHash(questions, level) {
  const json = JSON.stringify({ questions, level })
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  const buf = await new Response(stream).arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  // base64url (no padding, URL-safe chars)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function decodeHashToQuestions(hash) {
  const b64 = hash.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  const text = await new Response(stream).text()
  return JSON.parse(text) // { questions, level }
}

// ---------------------------------------------------------------------------
// System / user prompts
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are an experienced Irish Leaving Certificate Physics teacher creating retrieval practice questions for classroom use. You have deep knowledge of the Irish LC Physics syllabus at both Higher Level and Ordinary Level as defined by the NCCA specification published August 2024.

CRITICAL RULES — these apply to every response without exception:

1. Respond only with a valid JSON object. No markdown, no code fences, no explanation or text outside the JSON object.
2. Use Irish English spelling throughout: colour, centre, analyse, practise, recognise, behaviour, fibre, metre, litre.
3. All formulae, constants and numerical values must match those on the official SEC formula and data sheet.
4. Every question must be answerable from the information given in the question alone.
5. Every question must contain exactly one action verb from the NCCA LC Physics glossary.
6. The model answer must fulfil precisely what that action verb demands — no more and no less.
7. Format all answers using Markdown inside the JSON string. Use numbered lists for calculation steps, **bold** for key equations and final answers, and paragraph breaks between sections. Escape double quotes inside strings. Do not use raw \\n sequences — use actual Markdown structure.

═══════════════════════════════════════
ACTION VERB DEFINITIONS (NCCA official)
═══════════════════════════════════════

Analyse — study in detail; break down to identify parts, relationships and essential structure; interpret information to reach conclusions.
Apply — select and use knowledge to explain a given situation or real circumstances.
Appreciate — recognise the meaning of; show a practical understanding of.
Calculate — obtain a numerical answer showing all relevant stages in the working.
Categorise — arrange or place items into groups according to shared properties or criteria.
Classify — group things based on common characteristics.
Compare — give an account of similarities and/or differences between two or more items, referring to both throughout.
Define — give the precise meaning of a word, phrase, concept or physical quantity.
Demonstrate — prove or make clear by reasoning or evidence, illustrating with examples or practical application.
Derive — arrive at a statement or formula through logical deduction; manipulate a mathematical relationship to give a new equation.
Describe — develop a detailed picture or image of a structure or process using words; cover all key features in logical order.
Determine — obtain the only possible answer by calculation, substituting measured or known values into a standard formula.
Discuss — offer a considered, balanced review including a range of arguments, factors or hypotheses; present conclusions clearly with supporting evidence.
Estimate — give a reasoned order of magnitude statement or calculation of a quantity.
Evaluate — examine data or evidence to make judgements; describe how evidence supports or does not support a conclusion; identify limitations; make reasoned appraisals.
Examine — consider an argument or concept in a way that uncovers assumptions and relationships.
Explain — give a detailed account including reasons or causes.
Explore — observe or study in order to establish facts.
Identify — recognise and state briefly a distinguishing fact, pattern or feature.
Illustrate — use examples to describe something.
Investigate — make a detailed, systematic examination to establish facts and reach conclusions.
Justify — give valid reasons or evidence to support an answer or conclusion.
Measure — quantify changes by reading a measuring tool.
Model — make justified predictions or describe phenomena using words, diagrams, numbers, graphs or equations as appropriate.
Outline — give the main points; restrict to essentials.
Predict — give an expected result; explain a new event based on observations using logical connections.
Prove — use a sequence of logical steps to obtain the required result in a formal way.
Recall — remember or recognise from prior learning.
Recognise — identify facts, characteristics or concepts critical to understanding a situation.
Relate — associate, giving reasons.
Resolve — split a vector quantity into two perpendicular components using trigonometry.
Solve — obtain the answer to a problem by applying relevant physics principles and mathematical operations, showing all working.
Use — apply knowledge or rules to put theory into practice.
Verify — give evidence to support the truth of a statement.

═══════════════════════════════════════
ANSWER FORMAT RULES BY ACTION VERB
═══════════════════════════════════════

── CALCULATE and DETERMINE ──
Use a numbered Markdown list, one step per item:
1. State the formula in symbolic form.
2. Substitute the known values with units.
3. Show each arithmetic step.
4. State the **final answer with units in bold**.

Do not round intermediate values. Round the final answer to 3 significant figures unless the result is a clean integer or the question specifies otherwise.

Example of correct Calculate answer (as it should appear inside the JSON string):
"1. **Formula:** E_k = ½mv²\n2. **Substitute:** E_k = ½ × 2 × 6²\n3. **Calculate:** E_k = ½ × 2 × 36\n4. **Answer:** **E_k = 36 J**"

── DERIVE ──
State the starting relationship first. Show each algebraic manipulation on a new line. Clearly identify the derived result at the end.

── ESTIMATE ──
State the values being assumed and the reason for choosing them. Carry out a simplified calculation. Conclude with a statement of the order of magnitude.

── VERIFY ──
Calculate the quantity independently using the given data. Compare the result to the stated value. Conclude with an explicit statement of whether the result confirms or contradicts the claim.

── PROVE ──
Set out each logical or mathematical step sequentially on a new line. Every step must follow from the previous one. Conclude by stating that the required result has been obtained.

── DEFINE ──
Write one or two precise sentences giving the exact meaning of the term or physical quantity. Where a formula defines the quantity, include it with the symbols identified.

Example of correct Define answer:
"Electric field strength at a point is defined as the force per unit positive charge placed at that point, given by E = F/q, where F is the force in newtons and q is the charge in coulombs. The SI unit is newtons per coulomb (N/C), which is equivalent to volts per metre (V/m)."

── EXPLAIN ──
Write a prose paragraph of three to five sentences. Open with a direct statement that answers the question. Develop the physical mechanism or principle with reasons and causes. Close with the observable consequence or real-world significance. Use plain prose — no bullet points — but you may bold key physics terms on first use.

Example of correct Explain answer:
"A transformer does not work with direct current because it relies on electromagnetic induction to transfer energy between coils. For an EMF to be induced in the secondary coil, the magnetic flux through it must be continuously changing. An alternating current in the primary coil produces a continuously changing magnetic field and therefore a continuously changing flux through the secondary coil, inducing an alternating EMF. A direct current produces a constant magnetic field, so the flux does not change and no EMF is induced in the secondary coil."

── DESCRIBE ──
Write a detailed prose account covering all key features of the structure or process in logical order. Use causal connectives (as a result, this causes, consequently) to link steps. Do not merely list features.

── COMPARE ──
Write a single continuous prose paragraph that refers explicitly to both items throughout. Pair corresponding features directly against each other. Never describe one item fully and then the other separately.

Example of correct Compare answer:
"Alpha radiation consists of helium nuclei carrying a charge of +2, whereas beta radiation consists of fast-moving electrons carrying a charge of −1. Because alpha particles are relatively massive and highly charged, they are the most strongly ionising of the radiations but the least penetrating, being stopped by a few centimetres of air or a sheet of paper. Beta particles, being much lighter and less strongly charged, are considerably less ionising than alpha particles but far more penetrating, requiring a few millimetres of aluminium to stop them."

── DISCUSS ──
Write a balanced, considered prose account presenting more than one argument, factor or perspective. Include a concluding statement that is explicitly supported by the evidence or arguments presented. Neither one-sided advocacy nor unsupported assertion is acceptable.

── MODEL ──
Choose the most appropriate representation for the situation: an equation, a labelled diagram description, a graph description, or a prose explanation of the underlying physics. State the assumptions the model makes. Apply the model to the specific situation in the question and state what it predicts or shows.

── INVESTIGATE ──
State the aim of the investigation in one sentence. Identify the independent and dependent variables and the key control variables. Outline the method in prose, describing how the data would be collected and what would be measured. State the expected relationship and how the data would confirm or contradict it.

── APPLY ──
Identify the relevant physics principle or formula in one sentence. Show how the known information maps onto that principle. Carry out any necessary calculation or reasoning. Conclude with an explicit statement of the result or explanation of the situation.

── CLASSIFY / CATEGORISE ──
State the classification scheme or criteria being used. Assign each item to its category with a brief reason. Present as a short prose account, not a table.

── EXAMINE ──
Identify the claim, evidence or concept being examined. State what the evidence shows and what it does not show. Identify any assumptions or limitations. Conclude with a clear statement of what the examination reveals.

── RELATE ──
State the two quantities or concepts being related. Express the relationship in both words and, where appropriate, a formula. Explain the physical reason for the relationship. Give a brief example or consequence.

── USE ──
State which rule, formula or principle is being used and why it applies. Substitute the relevant values and carry out the necessary steps. State the result clearly.

── SOLVE ──
Use the same numbered step format as CALCULATE:
1. Identify the relevant principle or formula.
2. List the known quantities with units.
3. Substitute and carry out each arithmetic step.
4. State the **final answer with units in bold**.

── RESOLVE ──
State the vector being resolved and the angle involved. Write the two component equations (horizontal: F cos θ; vertical: F sin θ). Substitute the values and state both components with units.

── APPRECIATE ──
Write two to three prose sentences. Acknowledge what is significant or meaningful about the phenomenon, discovery or application. Connect it to a broader context in physics or society. No bullet points.

── IDENTIFY and RECALL ──
Write one or two brief, direct sentences stating the distinguishing fact, feature or definition. No elaboration beyond what is asked.

── OUTLINE ──
Write the main points only in full prose sentences. Restrict strictly to the essentials the question demands. Do not elaborate or explain beyond the key points.

── JUSTIFY ──
State the conclusion first in one sentence. Then write a prose paragraph providing the physical reasoning or evidence that supports that conclusion. The justification must be grounded in physics principles.

── PREDICT ──
State the expected outcome clearly in one sentence. Then explain in prose the logical chain of reasoning from the given information that leads to that prediction.

── EVALUATE ──
Examine the evidence or data presented. State in prose what it supports and identify any limitations or assumptions. Conclude with an explicit evaluative judgement. Do not simply summarise the data.

── ANALYSE ──
Break the situation down into its component parts. Identify the relationships between those parts in prose. Interpret what they mean and conclude with a statement of what the analysis reveals.

── GRAPH QUESTIONS ──
Graph answers must follow this structure in order:
1. Interpret the shape: state in one sentence what the form of the graph tells us physically (e.g. "The straight line through the origin indicates that current is directly proportional to voltage, confirming that Ohm's law is obeyed over this range.").
2. Identify the data points: name the specific coordinates being used as ordered pairs before any calculation.
3. Show the calculation: follow the same step-by-step format as Calculate answers above.
4. State the physical meaning: conclude with one sentence stating what the numerical result means physically.
Where the question involves the area under a graph, state explicitly what physical quantity that area represents before calculating it.

═══════════════════════════════════════
JSON SCHEMA — return exactly this structure
═══════════════════════════════════════

{
  "questions": [
    {
      "id": number,
      "topic": "main topic area name",
      "subtopic": "exact subtopic label as provided",
      "action_verb": "the NCCA action verb used in this question",
      "type": "multiple_choice" | "short_answer" | "explain" | "graph",
      "question_text": "the full question text",
      "options": ["A", "B", "C", "D"] or null,
      "correct_answer": "full model answer following the conventions above, using \\n for line breaks between steps",
      "explanation": "one or two sentences connecting the answer to common student errors or broader concepts; may be empty string if nothing further is needed",
      "graph": {
        "graph_type": "line" | "bar" | "scatter",
        "x_axis": "Label (unit)",
        "y_axis": "Label (unit)",
        "data_points": [{ "x": number, "y": number }]
      } or null
    }
  ]
}`

// Returns all outcome strings from the TOPICS tree, optionally filtered to eligible level
function allOutcomesFor(subtopics, level) {
  return subtopics
    .filter((st) => !(st.hlOnly && level === 'OL'))
    .flatMap((st) => st.outcomes)
}

function buildUserPrompt(level, questionCount, selectedOutcomes) {
  const levelLabel = level === 'HL' ? 'Higher Level' : 'Ordinary Level'

  // Group selected outcomes back into their sections for a structured prompt block
  const allSubtopics = TOPICS.flatMap((t) => t.subtopics)
  const sections = allSubtopics
    .map((st) => ({
      label: st.label,
      selected: st.outcomes.filter((o) => selectedOutcomes.includes(o)),
    }))
    .filter((s) => s.selected.length > 0)

  const topicBlock = sections
    .map((s) => {
      const outcomeList = s.selected.map((o) => `    • ${o}`).join('\n')
      return `${s.label}\n${outcomeList}`
    })
    .join('\n\n')

  const interleaveInstruction =
    sections.length > 1
      ? 'Spread questions across the selected sections — no two consecutive questions should target the same section.'
      : 'All questions may come from the single selected section.'
  const graphInstruction =
    sections.length > 1
      ? 'Include at least one graph-based question with data suitable for rendering in Recharts (line, bar, or scatter chart).'
      : 'Include a graph-based question if the selected section lends itself to one.'

  return `Generate ${questionCount} Leaving Certificate Physics retrieval practice questions at ${levelLabel}.

Each question MUST be directly grounded in one of the specific learning outcomes listed below. The question should ask students to do exactly what the learning outcome says — model, calculate, verify, explain, classify, investigate, apply, justify, etc. You may also use justify when it naturally fits the content of a learning outcome, even if the outcome uses a different verb. Do not invent questions on topics outside this list.

Selected learning outcomes (grouped by section):

${topicBlock}

${interleaveInstruction}
${graphInstruction}
Vary the question types across the set, choosing from: multiple_choice, short_answer, explain, and graph.

Return only a JSON object matching exactly this schema:
{
  "questions": [
    {
      "id": number,
      "topic": "strand name (e.g. Strand 1: Forces and Motion)",
      "subtopic": "section label (e.g. 1.2 Forces acting on a particle)",
      "learning_outcome": "the specific learning outcome this question targets (copy it exactly from the list above)",
      "type": "multiple_choice" | "short_answer" | "explain" | "graph",
      "question_text": "the question",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."] or null,
      "correct_answer": "the correct answer",
      "explanation": "brief explanation for the teacher",
      "graph": {
        "graph_type": "line" | "bar" | "scatter",
        "x_axis": "Label (unit)",
        "y_axis": "Label (unit)",
        "data_points": [{ "x": number, "y": number }]
      } or null
    }
  ]
}`
}

// ---------------------------------------------------------------------------
// Graph renderer
// ---------------------------------------------------------------------------
function GraphRenderer({ graph, height = 280 }) {
  if (!graph || !graph.data_points || graph.data_points.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500 my-3">
        Graph unavailable
      </div>
    )
  }

  const commonProps = {
    data: graph.data_points,
    margin: { top: 10, right: 30, left: 10, bottom: 30 },
  }

  const xLabel = graph.x_axis || 'x'
  const yLabel = graph.y_axis || 'y'

  const xAxis = (
    <XAxis dataKey="x" type="number" domain={['auto', 'auto']}>
      <Label value={xLabel} position="insideBottom" offset={-20} style={{ fontSize: 12 }} />
    </XAxis>
  )

  const yAxis = (
    <YAxis dataKey="y" type="number" domain={['auto', 'auto']}>
      <Label value={yLabel} angle={-90} position="insideLeft" offset={20} style={{ fontSize: 12 }} />
    </YAxis>
  )

  let chart
  if (graph.graph_type === 'bar') {
    chart = (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" />
        {xAxis}
        {yAxis}
        <Bar dataKey="y" fill="#3b82f6" />
      </BarChart>
    )
  } else if (graph.graph_type === 'scatter') {
    chart = (
      <ScatterChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" />
        {xAxis}
        {yAxis}
        <Scatter data={graph.data_points} fill="#3b82f6" />
      </ScatterChart>
    )
  } else {
    chart = (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" />
        {xAxis}
        {yAxis}
        <Tooltip />
        <Line type="linear" dataKey="y" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    )
  }

  return (
    <div className="my-3 graph-container" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {chart}
      </ResponsiveContainer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Question card
// ---------------------------------------------------------------------------
function QuestionCard({ q, index, showAnswer }) {
  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <div className="question-block mb-6 pb-6 border-b border-gray-200 last:border-0">
      {/* Topic / subtopic tags — screen only */}
      <div className="topic-tag screen-only mb-1 flex flex-wrap gap-1">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
          {q.subtopic}
        </span>
        {q.learning_outcome && (
          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded italic">
            {q.learning_outcome}
          </span>
        )}
      </div>

      {/* Graph */}
      {q.type === 'graph' && q.graph && (
        <GraphRenderer graph={q.graph} height={280} />
      )}
      {q.type === 'graph' && !q.graph && (
        <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500 my-3">
          Graph unavailable
        </div>
      )}

      {/* Question text */}
      <p className="text-lg font-semibold text-gray-900 leading-snug">
        <span className="text-blue-700 mr-2">{index}.</span>
        {q.question_text}
      </p>

      {/* Multiple choice options */}
      {q.type === 'multiple_choice' && q.options && (
        <div className="mt-3 grid grid-cols-1 gap-1 pl-6">
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="font-bold text-gray-700 w-5 shrink-0">{optionLabels[i]}</span>
              <span className="text-gray-800">{opt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Blank answer line for print (short_answer / explain) */}
      {(q.type === 'short_answer' || q.type === 'explain') && (
        <div className="print-answer-space mt-3 pl-6">
          <div className="border-b-2 border-dashed border-gray-300 h-8" />
          {q.type === 'explain' && (
            <>
              <div className="border-b-2 border-dashed border-gray-300 h-8 mt-3" />
              <div className="border-b-2 border-dashed border-gray-300 h-8 mt-3" />
            </>
          )}
        </div>
      )}

      {/* Answer panel — shown only in answer view */}
      {showAnswer && (
        <div className="answer-panel mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="font-semibold text-emerald-900 text-sm uppercase tracking-wide mb-2">Answer</p>
          <div className="prose prose-sm prose-emerald max-w-none text-emerald-900 [&_ol]:pl-5 [&_ol]:space-y-1 [&_li]:leading-snug [&_p]:leading-relaxed [&_p]:mb-2 [&_strong]:font-bold">
            <ReactMarkdown>{q.correct_answer}</ReactMarkdown>
          </div>
          {q.explanation && (
            <div className="mt-3 pt-3 border-t border-emerald-200">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Note</p>
              <p className="text-sm text-emerald-800 italic">{q.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Configuration panel
// ---------------------------------------------------------------------------
function ConfigPanel({ state, setState }) {
  const { level, questionCount, selectedOutcomes, expandedTopics, expandedSections } = state

  const isSectionEligible = (subtopic) => !(subtopic.hlOnly && level === 'OL')

  // ── Level toggle ──────────────────────────────────────────────────────────
  const toggleLevel = (newLevel) => {
    setState((s) => {
      if (newLevel === 'OL') {
        // Drop outcomes belonging to HL-only sections
        const hlOutcomes = new Set(
          TOPICS.flatMap((t) =>
            t.subtopics.filter((st) => st.hlOnly).flatMap((st) => st.outcomes)
          )
        )
        return {
          ...s,
          level: newLevel,
          selectedOutcomes: s.selectedOutcomes.filter((o) => !hlOutcomes.has(o)),
        }
      }
      return { ...s, level: newLevel }
    })
  }

  // ── Outcome-level toggle ──────────────────────────────────────────────────
  const toggleOutcome = (outcome) => {
    setState((s) => ({
      ...s,
      selectedOutcomes: s.selectedOutcomes.includes(outcome)
        ? s.selectedOutcomes.filter((o) => o !== outcome)
        : [...s.selectedOutcomes, outcome],
    }))
  }

  // ── Section-level toggle (all outcomes in one section) ────────────────────
  const toggleSection = (subtopic) => {
    const outcomes = subtopic.outcomes
    setState((s) => {
      const allSelected = outcomes.every((o) => s.selectedOutcomes.includes(o))
      if (allSelected) {
        return { ...s, selectedOutcomes: s.selectedOutcomes.filter((o) => !outcomes.includes(o)) }
      } else {
        const merged = [...s.selectedOutcomes, ...outcomes.filter((o) => !s.selectedOutcomes.includes(o))]
        return { ...s, selectedOutcomes: merged }
      }
    })
  }

  // ── Strand-level toggle (all outcomes in a strand) ────────────────────────
  const toggleStrand = (topic) => {
    const outcomes = topic.subtopics
      .filter(isSectionEligible)
      .flatMap((st) => st.outcomes)
    setState((s) => {
      const allSelected = outcomes.every((o) => s.selectedOutcomes.includes(o))
      if (allSelected) {
        return { ...s, selectedOutcomes: s.selectedOutcomes.filter((o) => !outcomes.includes(o)) }
      } else {
        const merged = [...s.selectedOutcomes, ...outcomes.filter((o) => !s.selectedOutcomes.includes(o))]
        return { ...s, selectedOutcomes: merged }
      }
    })
  }

  // ── Expand/collapse helpers ───────────────────────────────────────────────
  const toggleExpandTopic = (name) => {
    setState((s) => ({
      ...s,
      expandedTopics: s.expandedTopics.includes(name)
        ? s.expandedTopics.filter((n) => n !== name)
        : [...s.expandedTopics, name],
    }))
  }

  const toggleExpandSection = (label) => {
    setState((s) => ({
      ...s,
      expandedSections: s.expandedSections.includes(label)
        ? s.expandedSections.filter((l) => l !== label)
        : [...s.expandedSections, label],
    }))
  }

  // ── Select/clear all ──────────────────────────────────────────────────────
  const selectAll = () => {
    const all = TOPICS.flatMap((t) =>
      t.subtopics.filter(isSectionEligible).flatMap((st) => st.outcomes)
    )
    setState((s) => ({ ...s, selectedOutcomes: all }))
  }

  const clearAll = () => setState((s) => ({ ...s, selectedOutcomes: [] }))

  const canGenerate = selectedOutcomes.length > 0
  const showRepeatWarning =
    selectedOutcomes.length > 0 && selectedOutcomes.length < questionCount

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        LC Physics — Retrieval Practice Generator
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Select the learning outcomes you want to practise, then generate and project or print.
      </p>

      {/* Level selector */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Level
        </h2>
        <div className="flex gap-2">
          {['HL', 'OL'].map((l) => (
            <button
              key={l}
              onClick={() => toggleLevel(l)}
              className={`px-5 py-2 rounded-full font-semibold text-sm border-2 transition-colors ${
                level === l
                  ? 'bg-blue-700 border-blue-700 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
              }`}
            >
              {l === 'HL' ? 'Higher Level' : 'Ordinary Level'}
            </button>
          ))}
        </div>
      </section>

      {/* Question count */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Number of Questions
        </h2>
        <div className="flex gap-2 flex-wrap">
          {[4, 6].map((n) => (
            <button
              key={n}
              onClick={() => setState((s) => ({ ...s, questionCount: n }))}
              className={`px-5 py-2 rounded-full font-semibold text-sm border-2 transition-colors ${
                questionCount === n
                  ? 'bg-blue-700 border-blue-700 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* Topic / outcome checklist */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Learning Outcomes
            {selectedOutcomes.length > 0 && (
              <span className="ml-2 text-blue-600 font-normal normal-case">
                ({selectedOutcomes.length} selected)
              </span>
            )}
          </h2>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-xs text-blue-600 hover:underline font-medium">
              Select all
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={clearAll} className="text-xs text-gray-500 hover:underline font-medium">
              Clear all
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {TOPICS.map((topic) => {
            const isTopicExpanded = expandedTopics.includes(topic.name)
            const eligibleSections = topic.subtopics.filter(isSectionEligible)
            const allStrandOutcomes = eligibleSections.flatMap((st) => st.outcomes)
            const strandAllChecked =
              allStrandOutcomes.length > 0 &&
              allStrandOutcomes.every((o) => selectedOutcomes.includes(o))
            const strandSomeChecked =
              !strandAllChecked && allStrandOutcomes.some((o) => selectedOutcomes.includes(o))

            return (
              <div key={topic.name} className="border-b border-gray-200 last:border-0">

                {/* ── Strand row ── */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 select-none">
                  <input
                    type="checkbox"
                    checked={strandAllChecked}
                    ref={(el) => { if (el) el.indeterminate = strandSomeChecked }}
                    onChange={() => toggleStrand(topic)}
                    className="w-4 h-4 accent-blue-700 cursor-pointer shrink-0"
                    aria-label={`Select all outcomes in ${topic.name}`}
                  />
                  <span
                    className="flex-1 font-semibold text-gray-800 text-sm cursor-pointer"
                    onClick={() => toggleExpandTopic(topic.name)}
                  >
                    {topic.name}
                  </span>
                  <button
                    onClick={() => toggleExpandTopic(topic.name)}
                    className="text-gray-400 hover:text-gray-700 p-0 border-0 bg-transparent w-5 h-5 flex items-center justify-center cursor-pointer"
                    aria-label={isTopicExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isTopicExpanded ? '▲' : '▼'}
                  </button>
                </div>

                {/* ── Sections within strand ── */}
                {isTopicExpanded && (
                  <div className="bg-white">
                    {topic.subtopics.map((st) => {
                      const disabled = !isSectionEligible(st)
                      const isSectionExpanded = expandedSections.includes(st.label)
                      const sectionAllChecked =
                        !disabled &&
                        st.outcomes.length > 0 &&
                        st.outcomes.every((o) => selectedOutcomes.includes(o))
                      const sectionSomeChecked =
                        !sectionAllChecked &&
                        !disabled &&
                        st.outcomes.some((o) => selectedOutcomes.includes(o))

                      return (
                        <div key={st.label} className={disabled ? 'opacity-40' : ''}>

                          {/* Section row */}
                          <div className="flex items-center gap-2 px-5 py-1.5 hover:bg-blue-50 select-none border-t border-gray-100 first:border-0">
                            <input
                              type="checkbox"
                              checked={sectionAllChecked}
                              ref={(el) => { if (el) el.indeterminate = sectionSomeChecked }}
                              disabled={disabled}
                              onChange={() => !disabled && toggleSection(st)}
                              className="w-4 h-4 accent-blue-700 cursor-pointer shrink-0"
                              aria-label={`Select all outcomes in ${st.label}`}
                            />
                            <span
                              className={`flex-1 text-sm font-medium cursor-pointer ${disabled ? 'text-gray-400' : 'text-gray-700'}`}
                              onClick={() => !disabled && toggleExpandSection(st.label)}
                            >
                              {st.label}
                              {st.hlOnly && (
                                <span className="ml-1 text-xs text-gray-400 font-normal">[HL]</span>
                              )}
                            </span>
                            {!disabled && (
                              <button
                                onClick={() => toggleExpandSection(st.label)}
                                className="text-gray-400 hover:text-gray-600 p-0 border-0 bg-transparent text-xs cursor-pointer"
                                aria-label={isSectionExpanded ? 'Collapse outcomes' : 'Expand outcomes'}
                              >
                                {isSectionExpanded ? '▲' : '▼'}
                              </button>
                            )}
                          </div>

                          {/* ── Individual outcomes ── */}
                          {isSectionExpanded && !disabled && (
                            <div className="bg-blue-50/30">
                              {st.outcomes.map((outcome) => {
                                const checked = selectedOutcomes.includes(outcome)
                                return (
                                  <label
                                    key={outcome}
                                    className="flex items-start gap-2 px-10 py-1.5 text-xs cursor-pointer hover:bg-blue-100/50 border-t border-blue-100/60"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleOutcome(outcome)}
                                      className="w-3.5 h-3.5 mt-0.5 accent-blue-700 cursor-pointer shrink-0"
                                    />
                                    <span className="text-gray-600 leading-snug">{outcome}</span>
                                  </label>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Warning */}
      {showRepeatWarning && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          Fewer learning outcomes selected than questions requested — some outcomes may generate more than one question.
        </div>
      )}

      {/* API key input */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Anthropic API Key
        </h2>
        <input
          type="password"
          value={state.apiKey}
          onChange={(e) => {
            const key = e.target.value
            localStorage.setItem('anthropic_api_key', key)
            setState((s) => ({ ...s, apiKey: key }))
          }}
          placeholder="sk-ant-..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Your key is never stored. It is sent directly to the Anthropic API from your browser.
        </p>
      </section>

      {/* Generate button */}
      <div className="relative group inline-block w-full">
        <button
          disabled={!canGenerate || !state.apiKey}
          onClick={() => setState((s) => ({ ...s, view: 'generating' }))}
          className={`w-full py-3 rounded-xl font-bold text-base transition-colors ${
            canGenerate && state.apiKey
              ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Generate Questions
        </button>
        {(!canGenerate || !state.apiKey) && (
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
            {!state.apiKey
              ? 'Please enter your Anthropic API key'
              : 'Please select at least one learning outcome'}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------
function Toolbar({ children }) {
  return (
    <div className="toolbar flex gap-3 p-4 bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
      {children}
    </div>
  )
}

function ToolbarBtn({ onClick, children, variant = 'secondary' }) {
  const base = 'px-4 py-2 rounded-lg font-semibold text-sm transition-colors border'
  const styles = {
    primary: 'bg-blue-700 text-white border-blue-700 hover:bg-blue-800',
    secondary: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
    danger: 'bg-white text-red-600 border-red-300 hover:bg-red-50',
  }
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Questions view
// ---------------------------------------------------------------------------
function QuestionsView({ state, setState, showAnswer }) {
  const levelLabel = state.level === 'HL' ? 'Higher Level' : 'Ordinary Level'
  const [shareStatus, setShareStatus] = useState('idle') // 'idle' | 'copying' | 'copied' | 'show'
  const [shareUrl, setShareUrl] = useState('')

  const handlePrint = () => window.print()

  const handleShare = async () => {
    setShareStatus('copying')
    try {
      const encoded = await encodeQuestionsToHash(state.questions, state.level)
      const url = `${window.location.origin}${window.location.pathname}#q=${encoded}`
      setShareUrl(url)

      // Try modern clipboard API (requires HTTPS in production)
      let copied = false
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(url)
          copied = true
        } catch { /* fall through */ }
      }
      // Fallback: execCommand
      if (!copied) {
        const el = document.createElement('textarea')
        el.value = url
        el.style.cssText = 'position:fixed;top:-9999px;left:-9999px'
        document.body.appendChild(el)
        el.select()
        try { copied = document.execCommand('copy') } catch { /* fall through */ }
        document.body.removeChild(el)
      }

      if (copied) {
        setShareStatus('copied')
        setTimeout(() => setShareStatus('idle'), 3000)
      } else {
        // Last resort: show the URL so user can copy manually
        setShareStatus('show')
      }
    } catch (err) {
      console.error('Share error:', err)
      setShareStatus('idle')
    }
  }

  const shareLabel =
    shareStatus === 'copying' ? 'Building…' :
    shareStatus === 'copied'  ? '✓ Copied!' :
    shareStatus === 'show'    ? 'Share link' :
    'Share link'

  return (
    <div className="min-h-screen bg-white">
      <Toolbar>
        <ToolbarBtn onClick={handlePrint} variant="secondary">
          Print
        </ToolbarBtn>
        {!showAnswer ? (
          <ToolbarBtn
            onClick={() => setState((s) => ({ ...s, view: 'answers' }))}
            variant="primary"
          >
            Show Answers
          </ToolbarBtn>
        ) : (
          <ToolbarBtn
            onClick={() => setState((s) => ({ ...s, view: 'questions' }))}
            variant="secondary"
          >
            Hide Answers
          </ToolbarBtn>
        )}
        <ToolbarBtn
          onClick={handleShare}
          variant={shareStatus === 'copied' ? 'primary' : 'secondary'}
        >
          {shareLabel}
        </ToolbarBtn>
        {!state.sharedView && (
          <ToolbarBtn
            onClick={() => setState((s) => ({ ...s, view: 'config', questions: null, sharedView: false }))}
            variant="danger"
          >
            Generate New
          </ToolbarBtn>
        )}
      </Toolbar>

      {/* Share URL panel — shown when clipboard API is unavailable */}
      {shareStatus === 'show' && (
        <div className="no-print bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center gap-3">
          <span className="text-sm text-blue-800 font-medium shrink-0">Share link:</span>
          <input
            readOnly
            value={shareUrl}
            onFocus={(e) => e.target.select()}
            className="flex-1 text-xs font-mono bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => setShareStatus('idle')}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Print-only header */}
        <div className="print-header print-only mb-6">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-lg">LC Physics — Retrieval Practice</span>
            <span className="font-semibold">{levelLabel}</span>
          </div>
          <div className="flex gap-8 text-sm border-t border-gray-300 pt-2">
            <span>Name: ___________________________________</span>
            <span>Date: ________________</span>
          </div>
        </div>

        {/* Screen header */}
        <div className="screen-only mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            LC Physics — Retrieval Practice
          </h1>
          <p className="text-gray-500 font-medium">{levelLabel}</p>
        </div>

        {/* Questions */}
        {state.questions.map((q, i) => (
          <QuestionCard key={q.id} q={q} index={i + 1} showAnswer={showAnswer} />
        ))}

        {/* Print footer */}
        <div className="print-footer print-only mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
          Low-stakes retrieval practice
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const INITIAL_STATE = {
  view: 'config',
  level: 'HL',
  questionCount: 4,
  selectedOutcomes: [],
  expandedTopics: TOPICS.map((t) => t.name),
  expandedSections: [],
  apiKey: localStorage.getItem('anthropic_api_key') || '',
  questions: null,
  loading: false,
  error: null,
  sharedView: false,
}

export default function PhysicsRetrieval() {
  const [state, setState] = useState(INITIAL_STATE)

  // Detect a shared link on first load (#q=...)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#q=')) {
      decodeHashToQuestions(hash.slice(3))
        .then(({ questions, level }) => {
          setState((s) => ({ ...s, questions, level, view: 'questions', sharedView: true }))
        })
        .catch(() => { /* invalid hash — ignore, show config */ })
    }
  }, [])

  const generate = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': state.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: buildUserPrompt(state.level, state.questionCount, state.selectedOutcomes),
            },
          ],
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        const msg = err?.error?.message || `API error ${response.status}`
        const apiErr = new Error(msg)
        apiErr.isApiError = true
        throw apiErr
      }

      const data = await response.json()
      let text = data.content.map((block) => block.text || '').join('')
      // Strip markdown code fences if the model wrapped the JSON despite instructions
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
      let parsed
      try {
        parsed = JSON.parse(text)
      } catch {
        throw new SyntaxError('parse_failed')
      }

      setState((s) => ({
        ...s,
        questions: parsed.questions,
        loading: false,
        view: 'questions',
      }))
    } catch (err) {
      const message =
        err instanceof SyntaxError && err.message === 'parse_failed'
          ? 'The response could not be parsed. Please try again.'
          : err.isApiError
          ? err.message
          : 'Could not connect to the API. Please check your connection and try again.'
      setState((s) => ({ ...s, loading: false, error: message, view: 'error' }))
    }
  }, [state.apiKey, state.level, state.questionCount, state.selectedOutcomes])

  // Trigger generation when view switches to 'generating'
  if (state.view === 'generating' && !state.loading) {
    generate()
  }

  if (state.loading || state.view === 'generating') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-700 border-t-transparent mb-4" />
        <p className="text-lg text-gray-600 font-medium">Generating questions…</p>
      </div>
    )
  }

  if (state.view === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 font-medium text-lg mb-6">{state.error}</p>
          <button
            onClick={() => setState((s) => ({ ...s, view: 'config', error: null }))}
            className="px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (state.view === 'questions' || state.view === 'answers') {
    return (
      <QuestionsView
        state={state}
        setState={setState}
        showAnswer={state.view === 'answers'}
      />
    )
  }

  return <ConfigPanel state={state} setState={setState} />
}
