'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, Square, CheckSquare, Sparkles, TrendingUp, Award } from 'lucide-react'

interface Question {
  id: string
  text: string
  type: 'single_choice' | 'multiple_choice'
  weight: number
  options: Array<{
    id: string
    text: string
    score: number
  }>
}

interface EvaluationRendererProps {
  title?: string
  description?: string
  questions: Question[]
  scoring_ranges?: Array<{
    min_score: number
    max_score: number
    category: string
    next_step_id?: string
  }>
  onSubmit: (data: Record<string, any>) => void
  processing?: boolean
}

export function EvaluationRenderer({
  title = 'Evaluación',
  description,
  questions = [],
  scoring_ranges = [],
  onSubmit,
  processing = false
}: EvaluationRendererProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [calculatedScore, setCalculatedScore] = useState(0)
  const [maxPossibleScore, setMaxPossibleScore] = useState(0)

  useEffect(() => {
    // Calcular puntaje máximo posible
    const maxScore = questions.reduce((total, question) => {
      const maxQuestionScore = Math.max(...question.options.map(opt => opt.score))
      return total + (maxQuestionScore * question.weight)
    }, 0)
    setMaxPossibleScore(maxScore)
  }, [questions])

  useEffect(() => {
    // Calcular puntaje actual en tiempo real
    let score = 0
    questions.forEach(question => {
      const answer = answers[question.id]
      if (!answer) return

      if (question.type === 'single_choice' && typeof answer === 'string') {
        const option = question.options.find(opt => opt.id === answer)
        if (option) score += option.score * question.weight
      } else if (question.type === 'multiple_choice' && Array.isArray(answer)) {
        answer.forEach(answerId => {
          const option = question.options.find(opt => opt.id === answerId)
          if (option) score += option.score * question.weight
        })
      }
    })
    setCalculatedScore(score)
  }, [answers, questions])

  const handleSingleChoice = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  const handleMultipleChoice = (questionId: string, optionId: string) => {
    setAnswers(prev => {
      const current = prev[questionId] as string[] || []
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId]
      return { ...prev, [questionId]: updated }
    })
  }

  const isQuestionAnswered = (question: Question) => {
    const answer = answers[question.id]
    if (question.type === 'single_choice') return !!answer
    if (question.type === 'multiple_choice') return Array.isArray(answer) && answer.length > 0
    return false
  }

  const getCompletionPercentage = () => {
    const answeredCount = questions.filter(isQuestionAnswered).length
    return (answeredCount / questions.length) * 100
  }

  const getCurrentCategory = () => {
    for (const range of scoring_ranges) {
      if (calculatedScore >= range.min_score && calculatedScore <= range.max_score) {
        return range.category
      }
    }
    return 'Sin categoría'
  }

  const handleSubmit = () => {
    if (questions.every(isQuestionAnswered)) {
      setShowResults(true)
      setTimeout(() => {
        onSubmit(answers)
      }, 2000)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  if (showResults) {
    return (
      <div className="space-y-6">
        {/* Header con animación */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ¡Evaluación Completada!
          </h2>
        </div>

        {/* Resultados */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-4">
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {calculatedScore}
              </div>
              <div className="text-lg text-gray-600">
                de {maxPossibleScore} puntos posibles
              </div>
              <Progress 
                value={(calculatedScore / maxPossibleScore) * 100} 
                className="h-3 bg-gray-200"
              />
            </div>

            <Badge 
              variant="secondary" 
              className="text-lg px-6 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200"
            >
              Categoría: {getCurrentCategory()}
            </Badge>

            <div className="text-sm text-gray-500">
              Procesando resultados y avanzando al siguiente paso...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-800">Evaluación Interactiva</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
        )}
      </div>

      {/* Progress Bar */}
      <Card className="border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progreso: {Math.round(getCompletionPercentage())}%
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>{calculatedScore} pts</span>
            </div>
          </div>
          <Progress value={getCompletionPercentage()} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
            <span>Máximo: {maxPossibleScore} pts</span>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <div className="flex gap-2 justify-center flex-wrap">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestion(index)}
            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
              index === currentQuestion
                ? 'bg-purple-600 border-purple-600 text-white shadow-lg scale-110'
                : isQuestionAnswered(questions[index])
                ? 'bg-green-100 border-green-400 text-green-700 hover:scale-105'
                : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-purple-300 hover:scale-105'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Current Question */}
      {questions[currentQuestion] && (
        <Card className="border-2 border-purple-200 shadow-lg">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Question Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-purple-300 text-purple-700">
                    Pregunta {currentQuestion + 1}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Peso: {questions[currentQuestion].weight}x
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">
                  {questions[currentQuestion].text}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option) => {
                  const isSelected = questions[currentQuestion].type === 'single_choice'
                    ? answers[questions[currentQuestion].id] === option.id
                    : Array.isArray(answers[questions[currentQuestion].id]) && 
                      (answers[questions[currentQuestion].id] as string[]).includes(option.id)

                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (questions[currentQuestion].type === 'single_choice') {
                          handleSingleChoice(questions[currentQuestion].id, option.id)
                        } else {
                          handleMultipleChoice(questions[currentQuestion].id, option.id)
                        }
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                        isSelected
                          ? 'border-purple-400 bg-purple-50 shadow-md scale-[1.02]'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {questions[currentQuestion].type === 'single_choice' ? (
                            isSelected ? (
                              <CheckCircle2 className="w-6 h-6 text-purple-600" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-400 group-hover:text-purple-400" />
                            )
                          ) : (
                            isSelected ? (
                              <CheckSquare className="w-6 h-6 text-purple-600" />
                            ) : (
                              <Square className="w-6 h-6 text-gray-400 group-hover:text-purple-400" />
                            )
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={`text-base ${isSelected ? 'text-purple-900 font-medium' : 'text-gray-700'}`}>
                            {option.text}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge 
                            variant={isSelected ? "default" : "secondary"}
                            className={`${isSelected ? 'bg-purple-600' : 'bg-gray-100 text-gray-600'}`}
                          >
                            +{option.score} pts
                          </Badge>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          Anterior
        </Button>

        <div className="flex gap-3">
          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={nextQuestion}
              disabled={!isQuestionAnswered(questions[currentQuestion])}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!questions.every(isQuestionAnswered) || processing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 shadow-lg"
            >
              {processing ? 'Procesando...' : 'Finalizar Evaluación'}
            </Button>
          )}
        </div>
      </div>

      {/* Live Score Display */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-800">Puntaje en tiempo real</span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              {calculatedScore} / {maxPossibleScore}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}