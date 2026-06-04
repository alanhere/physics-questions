import { useState, useCallback } from 'react'
import {
  LineChart, Line,
  BarChart, Bar,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts'

// ---------------------------------------------------------------------------
// Topic data
// ---------------------------------------------------------------------------
const TOPICS = [
  {
    name: 'Mechanics',
    subtopics: [
      { label: 'Scalars and vectors; distance, displacement, speed, velocity' },
      { label: 'Equations of uniform acceleration; free fall' },
      { label: 'Projectile motion' },
      { label: "Newton's laws of motion" },
      { label: 'Momentum, impulse and collisions' },
      { label: 'Work, energy and power' },
      { label: 'Circular motion', hlOnly: true },
      { label: 'Simple harmonic motion', hlOnly: true },
      { label: "Density and pressure; Archimedes' principle" },
    ],
  },
  {
    name: 'Heat',
    subtopics: [
      { label: 'Temperature scales; thermometry' },
      { label: 'Specific heat capacity' },
      { label: 'Specific latent heat' },
      { label: 'Conduction, convection and radiation' },
      { label: "Gas laws (Boyle's, Charles's, Gay-Lussac's)" },
      { label: 'Ideal gas equation' },
      { label: 'Thermodynamics; first law', hlOnly: true },
    ],
  },
  {
    name: 'Waves',
    subtopics: [
      { label: 'Wave properties; wave equation' },
      { label: 'Sound; intensity and resonance' },
      { label: 'Reflection and refraction; Snell\'s law' },
      { label: 'Total internal reflection' },
      { label: 'Diffraction; diffraction gratings' },
      { label: "Interference; Young's double slit" },
      { label: 'Stationary waves; nodes and antinodes' },
    ],
  },
  {
    name: 'Optics',
    subtopics: [
      { label: 'Plane and curved mirrors; ray diagrams' },
      { label: 'Converging and diverging lenses; lens formula' },
      { label: 'Magnification and power of a lens' },
      { label: 'The electromagnetic spectrum' },
    ],
  },
  {
    name: 'Electricity',
    subtopics: [
      { label: "Electrostatics; Coulomb's law; electric fields" },
      { label: "Current, charge and Ohm's law" },
      { label: 'Resistance and resistivity' },
      { label: 'Series and parallel circuits' },
      { label: 'EMF and internal resistance' },
      { label: 'Electrical power and energy' },
      { label: 'Capacitance; energy stored in a capacitor' },
      { label: 'Capacitors in series and parallel', hlOnly: true },
    ],
  },
  {
    name: 'Magnetism and Electromagnetism',
    subtopics: [
      { label: 'Magnetic fields; force on a conductor' },
      { label: 'Force on a moving charge' },
      { label: "Electromagnetic induction; Faraday's and Lenz's laws" },
      { label: 'Flux and induced EMF' },
      { label: 'Alternating current; peak and RMS values' },
      { label: 'Transformers' },
      { label: 'DC motors and AC generators' },
    ],
  },
  {
    name: 'Modern Physics',
    subtopics: [
      { label: 'Thermionic emission; the electron gun' },
      { label: "The photoelectric effect; Einstein's equation" },
      { label: 'Atomic structure; Bohr model; line spectra' },
      { label: 'Radioactivity; alpha, beta and gamma radiation' },
      { label: 'Half-life and radioactive decay' },
      { label: 'Nuclear fission and fusion; E = mc²' },
      { label: 'Particle physics; quarks and the Standard Model', hlOnly: true },
    ],
  },
  {
    name: 'Option Topics (HL only)',
    subtopics: [
      { label: 'Applied electricity; rectification and diodes', hlOnly: true },
      { label: 'Acoustics; intensity levels; musical instruments', hlOnly: true },
      { label: 'Atmospheric physics; greenhouse effect', hlOnly: true },
    ],
  },
]

// ---------------------------------------------------------------------------
// System / user prompts
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are an experienced Irish Leaving Certificate Physics teacher creating retrieval practice questions for classroom use. You have deep knowledge of the Irish LC Physics syllabus at both Higher Level and Ordinary Level. You follow the Irish State Examinations Commission syllabus and use only formulae, constants, and values from the official SEC formula and data sheet. All questions must be answerable from the information given in the question alone. Use Irish English spelling throughout (colour, centre, analyse, practise, etc.). Respond only with a valid JSON object — no markdown, no code fences, no explanation or text outside the JSON.`

function buildUserPrompt(level, questionCount, selectedSubtopics) {
  const levelLabel = level === 'HL' ? 'Higher Level' : 'Ordinary Level'
  const topicList = selectedSubtopics.join(', ')
  const interleaveInstruction =
    selectedSubtopics.length > 1
      ? 'Interleave the topics across questions so that no two consecutive questions come from the same subtopic area.'
      : 'All questions may come from the single selected topic.'
  const graphInstruction =
    selectedSubtopics.length > 1
      ? 'Include at least one graph-based question with data suitable for rendering in Recharts (line, bar, or scatter chart).'
      : 'Include a graph-based question if the selected topic lends itself to one.'
  return `Generate ${questionCount} Leaving Certificate Physics retrieval practice questions at ${levelLabel}.
Draw questions only from the following selected topics: ${topicList}.
${interleaveInstruction}
${graphInstruction}
Vary the question types across the set, choosing from: multiple_choice, short_answer, explain, and graph.
Return only a JSON object matching exactly this schema:
{
  "questions": [
    {
      "id": number,
      "topic": "main topic area name",
      "subtopic": "exact subtopic label as provided",
      "type": "multiple_choice" | "short_answer" | "explain" | "graph",
      "question_text": "the question",
      "options": ["A", "B", "C", "D"] or null,
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
      {/* Topic tag — screen only */}
      <div className="topic-tag screen-only mb-1">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
          {q.topic}
        </span>
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
          <p className="font-semibold text-emerald-900 text-base">
            Answer: {q.correct_answer}
          </p>
          {q.explanation && (
            <p className="mt-1 text-sm text-emerald-800">{q.explanation}</p>
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
  const { level, questionCount, selectedSubtopics, expandedTopics } = state

  const isEligible = (subtopic) => !(subtopic.hlOnly && level === 'OL')

  const toggleLevel = (newLevel) => {
    setState((s) => {
      const filtered =
        newLevel === 'OL'
          ? s.selectedSubtopics.filter(
              (label) =>
                !TOPICS.flatMap((t) => t.subtopics).find(
                  (st) => st.label === label && st.hlOnly
                )
            )
          : s.selectedSubtopics
      return { ...s, level: newLevel, selectedSubtopics: filtered }
    })
  }

  const toggleSubtopic = (label) => {
    setState((s) => ({
      ...s,
      selectedSubtopics: s.selectedSubtopics.includes(label)
        ? s.selectedSubtopics.filter((l) => l !== label)
        : [...s.selectedSubtopics, label],
    }))
  }

  const toggleTopic = (topic) => {
    const eligibleLabels = topic.subtopics
      .filter(isEligible)
      .map((st) => st.label)
    setState((s) => {
      const allSelected = eligibleLabels.every((l) =>
        s.selectedSubtopics.includes(l)
      )
      if (allSelected) {
        return {
          ...s,
          selectedSubtopics: s.selectedSubtopics.filter(
            (l) => !eligibleLabels.includes(l)
          ),
        }
      } else {
        const merged = [
          ...s.selectedSubtopics,
          ...eligibleLabels.filter((l) => !s.selectedSubtopics.includes(l)),
        ]
        return { ...s, selectedSubtopics: merged }
      }
    })
  }

  const toggleExpand = (topicName) => {
    setState((s) => ({
      ...s,
      expandedTopics: s.expandedTopics.includes(topicName)
        ? s.expandedTopics.filter((n) => n !== topicName)
        : [...s.expandedTopics, topicName],
    }))
  }

  const selectAll = () => {
    const allEligible = TOPICS.flatMap((t) =>
      t.subtopics.filter(isEligible).map((st) => st.label)
    )
    setState((s) => ({ ...s, selectedSubtopics: allEligible }))
  }

  const clearAll = () => setState((s) => ({ ...s, selectedSubtopics: [] }))

  const canGenerate = selectedSubtopics.length > 0
  const showRepeatWarning = selectedSubtopics.length < questionCount && selectedSubtopics.length > 0
  const showSingleWarning = selectedSubtopics.length === 1

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        LC Physics — Retrieval Practice Generator
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Configure your question set below, then generate and project or print.
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
        <div className="flex gap-2">
          {[4, 8].map((n) => (
            <button
              key={n}
              onClick={() => setState((s) => ({ ...s, questionCount: n }))}
              className={`px-5 py-2 rounded-full font-semibold text-sm border-2 transition-colors ${
                questionCount === n
                  ? 'bg-blue-700 border-blue-700 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
              }`}
            >
              {n} questions
            </button>
          ))}
        </div>
      </section>

      {/* Topic checklist */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Topics
          </h2>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Select all
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:underline font-medium"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {TOPICS.map((topic) => {
            const isExpanded = expandedTopics.includes(topic.name)
            const eligibleSubs = topic.subtopics.filter(isEligible)
            const allChecked =
              eligibleSubs.length > 0 &&
              eligibleSubs.every((st) => selectedSubtopics.includes(st.label))
            const someChecked =
              !allChecked && eligibleSubs.some((st) => selectedSubtopics.includes(st.label))

            return (
              <div key={topic.name} className="border-b border-gray-200 last:border-0">
                {/* Topic header row */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someChecked
                    }}
                    onChange={() => toggleTopic(topic)}
                    className="w-4 h-4 accent-blue-700 cursor-pointer"
                    aria-label={`Select all subtopics under ${topic.name}`}
                  />
                  <span
                    className="flex-1 font-semibold text-gray-800 text-sm"
                    onClick={() => toggleExpand(topic.name)}
                  >
                    {topic.name}
                  </span>
                  <button
                    onClick={() => toggleExpand(topic.name)}
                    className="text-gray-400 hover:text-gray-700 p-0 border-0 bg-transparent w-5 h-5 flex items-center justify-center"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>

                {/* Subtopics */}
                {isExpanded && (
                  <div className="bg-white">
                    {topic.subtopics.map((st) => {
                      const disabled = !isEligible(st)
                      const checked = selectedSubtopics.includes(st.label)
                      return (
                        <label
                          key={st.label}
                          className={`flex items-start gap-2 px-5 py-1.5 text-sm cursor-pointer hover:bg-blue-50 ${
                            disabled ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => !disabled && toggleSubtopic(st.label)}
                            className="w-4 h-4 mt-0.5 accent-blue-700 cursor-pointer"
                          />
                          <span className={disabled ? 'text-gray-400' : 'text-gray-700'}>
                            {st.label}
                            {st.hlOnly && (
                              <span className="ml-1 text-xs text-gray-400 font-medium">[HL]</span>
                            )}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Warnings */}
      {(showRepeatWarning || showSingleWarning) && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          {showSingleWarning
            ? 'With one topic selected, all questions will come from the same area.'
            : 'You have selected fewer topic areas than questions. Some topics may be repeated.'}
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
          onChange={(e) => setState((s) => ({ ...s, apiKey: e.target.value }))}
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
              : 'Please select at least one topic'}
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

  const handlePrint = () => window.print()

  return (
    <div className="min-h-screen bg-white">
      <Toolbar>
        <ToolbarBtn onClick={handlePrint} variant="secondary">
          Print Questions
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
          onClick={() => setState((s) => ({ ...s, view: 'config', questions: null }))}
          variant="danger"
        >
          Generate New
        </ToolbarBtn>
      </Toolbar>

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
  selectedSubtopics: [],
  expandedTopics: TOPICS.map((t) => t.name),
  apiKey: '',
  questions: null,
  loading: false,
  error: null,
}

export default function PhysicsRetrieval() {
  const [state, setState] = useState(INITIAL_STATE)

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
              content: buildUserPrompt(state.level, state.questionCount, state.selectedSubtopics),
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
  }, [state.apiKey, state.level, state.questionCount, state.selectedSubtopics])

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
