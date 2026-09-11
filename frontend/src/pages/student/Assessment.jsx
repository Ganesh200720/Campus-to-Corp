import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import ScoreRing from '../../components/ScoreRing'
import {
  ClipboardCheck,
  CheckCircle2,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Lock,
  BookOpen,
  Layers3,
  Trophy,
  PlayCircle,
  ArrowLeft,
  Search,
  X,
} from 'lucide-react'

export default function Assessment() {
  const [phase, setPhase] = useState('structure')
  const [structure, setStructure] = useState([])
  const [selectedSkill, setSelectedSkill] = useState(null)

  // Search + filter
  const [skillSearch, setSkillSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState('all')

  const [expandedModules, setExpandedModules] = useState({})
  const [loading, setLoading] = useState(true)

  const [assessment, setAssessment] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  // Keep the skill/module context after finishing a test
  const [returnSkillId, setReturnSkillId] = useState(null)
  const [returnModuleId, setReturnModuleId] = useState(null)

  useEffect(() => {
    loadStructure()
  }, [])

  const loadStructure = async (keepSkillId = null) => {
    try {
      setLoading(true)

      const res = await api.get('/skills/assessment/structure/')

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.skills || []

      setStructure(data)

      if (data.length > 0) {
        const skillToSelect =
          data.find((skill) => skill.id === keepSkillId) ||
          data.find((skill) => skill.id === selectedSkill?.id) ||
          data[0]

        setSelectedSkill(skillToSelect)

        // Re-open the module the student was working on
        if (returnModuleId) {
          setExpandedModules({
            [returnModuleId]: true,
          })
        }
      }
    } catch (error) {
      console.error('Failed to load assessment structure:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleModule = (moduleId) => {
    setExpandedModules((current) => ({
      ...current,
      [moduleId]: !current[moduleId],
    }))
  }

  const selectSkill = (skill) => {
    setSelectedSkill(skill)
    setExpandedModules({})
  }

  // ============================================================
  // FILTER SKILLS
  // ============================================================

  const filteredSkills = structure.filter((skill) => {
    const name = (skill.name || '').toLowerCase()
    const category = (skill.category || '').toLowerCase()
    const search = skillSearch.toLowerCase().trim()

    const matchesSearch =
      search === '' || name.includes(search)

    let matchesFilter = true

    if (skillFilter === 'technical') {
      matchesFilter =
        category.includes('technical') ||
        category.includes('tech')
    }

    if (skillFilter === 'soft') {
      matchesFilter =
        category.includes('soft')
    }

    return matchesSearch && matchesFilter
  })

  const startAssessment = async (type, item) => {
    try {
      setLoading(true)

      let endpoint = ''

      if (type === 'topic') {
        endpoint = `/skills/assessment/topic/${item.id}/questions/`
      }

      if (type === 'module') {
        endpoint = `/skills/assessment/module/${item.id}/questions/`
      }

      if (type === 'skill') {
        endpoint = `/skills/assessment/skill/${item.id}/questions/`
      }

      const res = await api.get(endpoint)

      const questionData = Array.isArray(res.data)
        ? res.data
        : res.data.questions || []

      setQuestions(questionData)
      setAnswers({})
      setResult(null)

      // Remember where the student came from
      setReturnSkillId(selectedSkill?.id || null)

      if (type === 'topic' || type === 'module') {
        setReturnModuleId(
          type === 'module'
            ? item.id
            : item.module_id || item.module?.id || null
        )
      } else {
        setReturnModuleId(null)
      }

      setAssessment({
        type,
        item,
        title:
          type === 'topic'
            ? item.title
            : type === 'module'
              ? item.title
              : item.name,
      })

      setPhase('taking')
    } catch (error) {
      console.error('Failed to start assessment:', error)

      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        'Unable to load this assessment.'

      alert(message)
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (questionId, option) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: option,
    }))
  }

  const submitAssessment = async () => {
    if (!assessment) return

    const payload = {
      answers: Object.entries(answers).map(
        ([question_id, selected_option]) => ({
          question_id: Number(question_id),
          selected_option,
        })
      ),
    }

    try {
      setLoading(true)

      let endpoint = ''

      if (assessment.type === 'topic') {
        endpoint =
          `/skills/assessment/topic/${assessment.item.id}/submit/`
      }

      if (assessment.type === 'module') {
        endpoint =
          `/skills/assessment/module/${assessment.item.id}/submit/`
      }

      if (assessment.type === 'skill') {
        endpoint =
          `/skills/assessment/skill/${assessment.item.id}/submit/`
      }

      const res = await api.post(endpoint, payload)

      setResult(res.data)
      setPhase('result')
    } catch (error) {
      console.error('Failed to submit assessment:', error)

      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        'Unable to submit the assessment.'

      alert(message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // RETURN TO THE SAME SKILL
  // ============================================================

  const continueLearning = async () => {
    const skillId = returnSkillId

    setPhase('structure')
    setAssessment(null)
    setQuestions([])
    setAnswers({})
    setResult(null)

    await loadStructure(skillId)
  }

  const retryAssessment = () => {
    if (!assessment) return

    startAssessment(
      assessment.type,
      assessment.item
    )
  }

  const isTopicCompleted = (topic) => {
    return (
      topic.completed === true ||
      topic.progress?.completed === true ||
      (
        topic.score !== null &&
        topic.score !== undefined
      )
    )
  }

  const getTopicScore = (topic) => {
    if (
      topic.score !== null &&
      topic.score !== undefined
    ) {
      return Math.round(Number(topic.score))
    }

    if (
      topic.progress?.score !== null &&
      topic.progress?.score !== undefined
    ) {
      return Math.round(
        Number(topic.progress.score)
      )
    }

    return null
  }

  const isModuleCompleted = (module) => {
    return (
      module.completed === true ||
      module.progress?.completed === true
    )
  }

  const getModuleScore = (module) => {
    if (
      module.score !== null &&
      module.score !== undefined
    ) {
      return Math.round(Number(module.score))
    }

    if (
      module.progress?.score !== null &&
      module.progress?.score !== undefined
    ) {
      return Math.round(
        Number(module.progress.score)
      )
    }

    return null
  }

  const areAllTopicsCompleted = (module) => {
    if (!module.topics?.length) {
      return false
    }

    return module.topics.every(
      isTopicCompleted
    )
  }

  const getModuleProgress = (module) => {
    if (!module.topics?.length) {
      return 0
    }

    const completed =
      module.topics.filter(
        isTopicCompleted
      ).length

    return Math.round(
      (completed / module.topics.length) * 100
    )
  }

  const areAllModulesCompleted = (skill) => {
    if (!skill.modules?.length) {
      return false
    }

    return skill.modules.every(
      isModuleCompleted
    )
  }

  if (
    loading &&
    phase === 'structure' &&
    structure.length === 0
  ) {
    return (
      <LoadingState
        label="Loading Skill Assessment..."
      />
    )
  }

  if (
    loading &&
    phase !== 'structure'
  ) {
    return (
      <LoadingState label="Please wait..." />
    )
  }

  // ============================================================
  // RESULT
  // ============================================================

  if (phase === 'result') {
    const score = Number(
      result?.score ??
      result?.overall_score ??
      result?.percentage ??
      0
    )

    const correct =
      result?.correct_answers ??
      result?.correct ??
      0

    const total =
      result?.total_questions ??
      result?.total ??
      questions.length

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <button
          onClick={continueLearning}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft size={16} />
          Back to {selectedSkill?.name || 'Skill Assessment'}
        </button>

        <div className="card p-8 text-center">
          <Trophy
            className="mx-auto mb-3 text-brand-600"
            size={42}
          />

          <h1 className="text-2xl font-bold text-slate-800">
            Assessment Complete
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            {assessment?.title}
          </p>

          <div className="flex justify-center my-7">
            <ScoreRing score={score} />
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Correct Answers
              </p>

              <p className="text-xl font-bold text-slate-800 mt-1">
                {correct}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Total Questions
              </p>

              <p className="text-xl font-bold text-slate-800 mt-1">
                {total}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center mt-7">
            <button
              onClick={retryAssessment}
              className="btn-primary flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Retry Test
            </button>

            <button
              onClick={continueLearning}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // TAKING ASSESSMENT
  // ============================================================

  if (phase === 'taking') {
    const answeredCount =
      Object.keys(answers).length

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={continueLearning}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600"
          >
            <ArrowLeft size={16} />
            Exit Test
          </button>

          <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {assessment?.type === 'topic'
              ? 'Topic Test'
              : assessment?.type === 'module'
                ? 'Module Assessment'
                : 'Final Skill Assessment'}
          </span>
        </div>

        <div className="card p-5 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-bold text-slate-800">
                {assessment?.title}
              </h1>

              <p className="text-xs text-slate-500 mt-1">
                {answeredCount} / {questions.length} answered
              </p>
            </div>

            <ClipboardCheck
              size={24}
              className="text-brand-600"
            />
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 transition-all"
              style={{
                width:
                  questions.length > 0
                    ? `${(answeredCount / questions.length) * 100}%`
                    : '0%',
              }}
            />
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="card p-8 text-center">
            <BookOpen
              size={38}
              className="mx-auto text-slate-400 mb-3"
            />

            <h2 className="font-semibold text-slate-800">
              No questions available
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Questions for this assessment have not been added yet.
            </p>

            <button
              onClick={continueLearning}
              className="btn-primary mt-5"
            >
              Back
            </button>
          </div>
        ) : (
          <>
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-brand-600">
                    Question {index + 1}
                  </span>

                  {question.difficulty && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                      {question.difficulty}
                    </span>
                  )}
                </div>

                <p className="font-medium text-slate-800 mb-5">
                  {question.text}
                </p>

                <div className="space-y-2.5">
                  {['a', 'b', 'c', 'd'].map(
                    (option) => (
                      <label
                        key={option}
                        className={`
                          flex items-center gap-3
                          border rounded-xl px-4 py-3
                          cursor-pointer text-sm
                          transition-colors
                          ${
                            answers[question.id] === option
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-slate-200 hover:bg-slate-50'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          className="accent-brand-600"
                          checked={
                            answers[question.id] ===
                            option
                          }
                          onChange={() =>
                            selectAnswer(
                              question.id,
                              option
                            )
                          }
                        />

                        <span className="font-semibold uppercase text-xs text-slate-400">
                          {option}
                        </span>

                        <span>
                          {question[
                            `option_${option}`
                          ]}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={submitAssessment}
              disabled={
                answeredCount < questions.length
              }
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Assessment ({answeredCount}/
              {questions.length})
            </button>
          </>
        )}
      </div>
    )
  }

  // ============================================================
  // SKILL STRUCTURE
  // ============================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50">
            <ClipboardCheck
              size={25}
              className="text-brand-600"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Skill Assessment
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Build your skills step by step through topics,
              modules and final assessments.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          SEARCH + FILTER
      ======================================================== */}

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={skillSearch}
              onChange={(e) =>
                setSkillSearch(e.target.value)
              }
              placeholder="Search skills..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />

            {skillSearch && (
              <button
                onClick={() => setSkillSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter */}

          <div className="flex gap-2">
            {[
              {
                value: 'all',
                label: 'All Skills',
              },
              {
                value: 'technical',
                label: 'Technical',
              },
              {
                value: 'soft',
                label: 'Soft Skills',
              },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() =>
                  setSkillFilter(filter.value)
                }
                className={`
                  px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-colors whitespace-nowrap
                  ${
                    skillFilter === filter.value
                      ? 'bg-brand-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search count */}

        {(skillSearch ||
          skillFilter !== 'all') && (
          <p className="text-xs text-slate-400 mt-3">
            Showing {filteredSkills.length} of{' '}
            {structure.length} skills
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ======================================================
            SKILL SIDEBAR
        ====================================================== */}

        <div className="lg:col-span-1">
          <div className="card p-4 sticky top-5">
            <div className="flex items-center gap-2 mb-4">
              <Layers3
                size={18}
                className="text-brand-600"
              />

              <h2 className="font-semibold text-slate-800">
                Skills
              </h2>
            </div>

            {filteredSkills.length === 0 ? (
              <div className="py-8 text-center">
                <Search
                  size={30}
                  className="mx-auto text-slate-300 mb-2"
                />

                <p className="text-sm font-medium text-slate-600">
                  No skills found
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Try another search.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSkills.map((skill) => {
                  const active =
                    selectedSkill?.id === skill.id

                  return (
                    <button
                      key={skill.id}
                      onClick={() =>
                        selectSkill(skill)
                      }
                      className={`
                        w-full text-left rounded-xl px-3 py-3
                        transition-colors
                        ${
                          active
                            ? 'bg-brand-50 text-brand-700'
                            : 'hover:bg-slate-50 text-slate-600'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {skill.name}
                        </span>

                        <ChevronRight
                          size={15}
                          className={
                            active
                              ? 'text-brand-600'
                              : 'text-slate-300'
                          }
                        />
                      </div>

                      {skill.category && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          {skill.category}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            SELECTED SKILL
        ====================================================== */}

        <div className="lg:col-span-3">
          {!selectedSkill ? (
            <div className="card p-10 text-center">
              <BookOpen
                size={42}
                className="mx-auto text-slate-300 mb-3"
              />

              <h2 className="font-semibold text-slate-800">
                Select a skill
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Choose a skill from the left to start your assessment.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Skill Header */}

              <div className="card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-brand-600 mb-1">
                      Skill
                    </p>

                    <h2 className="text-xl font-bold text-slate-800">
                      {selectedSkill.name}
                    </h2>

                    {selectedSkill.category && (
                      <p className="text-sm text-slate-500 mt-1">
                        {selectedSkill.category}
                      </p>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-400">
                      Modules
                    </p>

                    <p className="text-lg font-bold text-slate-800">
                      {selectedSkill.modules?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modules */}

              <div className="space-y-4">
                {selectedSkill.modules?.map(
                  (module, moduleIndex) => {
                    const expanded =
                      expandedModules[module.id] === true

                    const moduleCompleted =
                      isModuleCompleted(module)

                    const moduleProgress =
                      getModuleProgress(module)

                    const moduleScore =
                      getModuleScore(module)

                    const topicsCompleted =
                      module.topics?.filter(
                        isTopicCompleted
                      ).length || 0

                    const allTopicsCompleted =
                      areAllTopicsCompleted(module)

                    return (
                      <div
                        key={module.id}
                        className="card overflow-hidden"
                      >
                        {/* Module Header */}

                        <button
                          onClick={() =>
                            toggleModule(module.id)
                          }
                          className="w-full p-5 text-left hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                              <BookOpen
                                size={20}
                                className="text-brand-600"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-400">
                                  MODULE {moduleIndex + 1}
                                </span>

                                {moduleCompleted && (
                                  <CheckCircle2
                                    size={16}
                                    className="text-emerald-500"
                                  />
                                )}
                              </div>

                              <h3 className="font-bold text-slate-800 mt-1">
                                {module.title}
                              </h3>

                              {module.description && (
                                <p className="text-sm text-slate-500 mt-1">
                                  {module.description}
                                </p>
                              )}

                              <div className="mt-3 flex items-center gap-3">
                                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-brand-600"
                                    style={{
                                      width: `${moduleProgress}%`,
                                    }}
                                  />
                                </div>

                                <span className="text-xs text-slate-400">
                                  {topicsCompleted}/
                                  {module.topics?.length || 0}{' '}
                                  topics
                                </span>

                                {moduleScore !== null && (
                                  <span className="text-xs font-semibold text-brand-600">
                                    {moduleScore}%
                                  </span>
                                )}
                              </div>
                            </div>

                            {expanded ? (
                              <ChevronDown
                                size={20}
                                className="text-slate-400 mt-1"
                              />
                            ) : (
                              <ChevronRight
                                size={20}
                                className="text-slate-400 mt-1"
                              />
                            )}
                          </div>
                        </button>

                        {/* Module Content */}

                        {expanded && (
                          <div className="border-t border-slate-100">
                            <div className="p-4 space-y-2">
                              {module.topics?.map(
                                (
                                  topic,
                                  topicIndex
                                ) => {
                                  const completed =
                                    isTopicCompleted(
                                      topic
                                    )

                                  const topicScore =
                                    getTopicScore(
                                      topic
                                    )

                                  return (
                                    <div
                                      key={topic.id}
                                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                        {completed ? (
                                          <CheckCircle2
                                            size={18}
                                            className="text-emerald-500"
                                          />
                                        ) : (
                                          <span className="text-xs font-semibold text-slate-400">
                                            {topicIndex + 1}
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-700">
                                          {topic.title}
                                        </p>

                                        {topic.description && (
                                          <p className="text-xs text-slate-400 mt-0.5">
                                            {
                                              topic.description
                                            }
                                          </p>
                                        )}
                                      </div>

                                      {topicScore !==
                                        null && (
                                        <span className="hidden sm:block text-xs font-semibold text-brand-600">
                                          {topicScore}%
                                        </span>
                                      )}

                                      <button
                                        onClick={() =>
                                          startAssessment(
                                            'topic',
                                            topic
                                          )
                                        }
                                        className={
                                          completed
                                            ? 'px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5'
                                            : 'btn-primary text-xs flex items-center gap-1.5'
                                        }
                                      >
                                        <PlayCircle
                                          size={14}
                                        />

                                        {completed
                                          ? 'Retake'
                                          : 'Take Test'}
                                      </button>
                                    </div>
                                  )
                                }
                              )}
                            </div>

                            {/* Module Assessment */}

                            <div className="border-t border-slate-100 bg-slate-50/60 p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Layers3
                                      size={17}
                                      className="text-brand-600"
                                    />

                                    <p className="text-sm font-semibold text-slate-800">
                                      Module Assessment
                                    </p>
                                  </div>

                                  <p className="text-xs text-slate-500 mt-1">
                                    Test your knowledge across all topics in this module.
                                  </p>
                                </div>

                                {allTopicsCompleted ? (
                                  <button
                                    onClick={() =>
                                      startAssessment(
                                        'module',
                                        module
                                      )
                                    }
                                    className="btn-primary text-xs flex items-center gap-1.5"
                                  >
                                    <PlayCircle
                                      size={14}
                                    />

                                    {moduleCompleted
                                      ? 'Retake Module Test'
                                      : 'Start Module Test'}
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Lock
                                      size={14}
                                    />

                                    Complete all topics first
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }
                )}
              </div>

              {/* Final Skill Assessment */}

              <div className="card p-6 border-2 border-brand-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Trophy
                      size={24}
                      className="text-brand-600"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide font-semibold text-brand-600">
                      Final Assessment
                    </p>

                    <h3 className="text-lg font-bold text-slate-800 mt-1">
                      {selectedSkill.name} Assessment
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Complete the final assessment covering all modules and topics.
                    </p>
                  </div>

                  {areAllModulesCompleted(
                    selectedSkill
                  ) ? (
                    <button
                      onClick={() =>
                        startAssessment(
                          'skill',
                          selectedSkill
                        )
                      }
                      className="btn-primary flex items-center gap-2"
                    >
                      <PlayCircle size={16} />
                      Final Test
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Lock size={16} />
                      Complete all modules
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}