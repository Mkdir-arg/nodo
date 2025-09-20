'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EvaluationConfig, EvaluationQuestion } from '@/lib/flows/types';

interface EvaluationConfigEditorProps {
  config: EvaluationConfig;
  onChange: (key: string, value: any) => void;
}

export function EvaluationConfigEditor({ config, onChange }: EvaluationConfigEditorProps) {
  const [questions, setQuestions] = useState<EvaluationQuestion[]>(config.questions || []);
  const [scoringRanges, setScoringRanges] = useState(config.scoring_ranges || []);

  const addQuestion = () => {
    const newQuestion: EvaluationQuestion = {
      id: `q_${questions.length + 1}`,
      text: `Pregunta ${questions.length + 1}`,
      type: 'single_choice',
      weight: 1,
      options: [
        { id: 'opt1', text: 'Opción 1', score: 0 },
        { id: 'opt2', text: 'Opción 2', score: 5 }
      ]
    };
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    onChange('questions', updatedQuestions);
  };

  const updateQuestion = (index: number, question: Partial<EvaluationQuestion>) => {
    const updatedQuestions = questions.map((q, i) => i === index ? { ...q, ...question } : q);
    setQuestions(updatedQuestions);
    onChange('questions', updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    onChange('questions', updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex];
    const options = [...question.options];
    options.push({
      id: `opt_${options.length + 1}`,
      text: `Opción ${options.length + 1}`,
      score: 0
    });
    updateQuestion(questionIndex, { options });
  };

  const updateOption = (questionIndex: number, optionIndex: number, key: 'text' | 'score', value: string | number) => {
    const question = questions[questionIndex];
    const options = question.options.map((opt, i) => 
      i === optionIndex ? { ...opt, [key]: value } : opt
    );
    updateQuestion(questionIndex, { options });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    const options = question.options.filter((_, i) => i !== optionIndex);
    updateQuestion(questionIndex, { options });
  };

  const addScoringRange = () => {
    const newRange = {
      min_score: 0,
      max_score: 10,
      category: `Categoría ${scoringRanges.length + 1}`,
      next_step_id: ''
    };
    const updatedRanges = [...scoringRanges, newRange];
    setScoringRanges(updatedRanges);
    onChange('scoring_ranges', updatedRanges);
  };

  const updateScoringRange = (index: number, key: string, value: any) => {
    const updatedRanges = scoringRanges.map((range, i) => 
      i === index ? { ...range, [key]: value } : range
    );
    setScoringRanges(updatedRanges);
    onChange('scoring_ranges', updatedRanges);
  };

  const removeScoringRange = (index: number) => {
    const updatedRanges = scoringRanges.filter((_, i) => i !== index);
    setScoringRanges(updatedRanges);
    onChange('scoring_ranges', updatedRanges);
  };

  return (
    <div className="space-y-6">
      {/* Configuración básica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Título de la Evaluación</Label>
          <Input
            id="title"
            value={config.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Evaluación Técnica"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Input
            id="description"
            value={config.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Responda las siguientes preguntas"
          />
        </div>
      </div>

      {/* Preguntas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">📋 Preguntas</h4>
          <Button type="button" onClick={addQuestion} variant="outline">
            + Agregar Pregunta
          </Button>
        </div>

        <div className="space-y-4">
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium">Pregunta {questionIndex + 1}</h5>
                <Button 
                  type="button" 
                  onClick={() => removeQuestion(questionIndex)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Eliminar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="md:col-span-2">
                  <Label>Texto de la pregunta</Label>
                  <Input
                    value={question.text}
                    onChange={(e) => updateQuestion(questionIndex, { text: e.target.value })}
                    placeholder="¿Cuál es su experiencia en...?"
                  />
                </div>
                <div>
                  <Label>Peso</Label>
                  <Input
                    type="number"
                    value={question.weight}
                    onChange={(e) => updateQuestion(questionIndex, { weight: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <Label>Tipo de pregunta</Label>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(questionIndex, { type: e.target.value as EvaluationQuestion['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="single_choice">Opción única</option>
                    <option value="multiple_choice">Múltiples opciones</option>
                  </select>
                </div>
              </div>

              {/* Opciones de respuesta */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Opciones de respuesta</Label>
                  <Button 
                    type="button" 
                    onClick={() => addOption(questionIndex)}
                    variant="outline"
                    size="sm"
                  >
                    + Opción
                  </Button>
                </div>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2 items-center">
                      <Input
                        placeholder="Texto de la opción"
                        value={option.text}
                        onChange={(e) => updateOption(questionIndex, optionIndex, 'text', e.target.value)}
                        className="flex-1"
                      />
                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="Puntos"
                          value={option.score}
                          onChange={(e) => updateOption(questionIndex, optionIndex, 'score', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay preguntas configuradas. Haga clic en "Agregar Pregunta" para comenzar.
          </div>
        )}
      </div>

      {/* Rangos de puntuación */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">🎯 Rangos de Puntuación</h4>
          <Button type="button" onClick={addScoringRange} variant="outline">
            + Agregar Rango
          </Button>
        </div>

        <div className="space-y-3">
          {scoringRanges.map((range, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Categoría"
                    value={range.category}
                    onChange={(e) => updateScoringRange(index, 'category', e.target.value)}
                  />
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={range.min_score}
                    onChange={(e) => updateScoringRange(index, 'min_score', parseInt(e.target.value) || 0)}
                  />
                </div>
                <span>-</span>
                <div className="w-20">
                  <Input
                    type="number"
                    placeholder="Max"
                    value={range.max_score}
                    onChange={(e) => updateScoringRange(index, 'max_score', parseInt(e.target.value) || 0)}
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeScoringRange(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>

        {scoringRanges.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No hay rangos configurados. Los rangos determinan la bifurcación automática.
          </div>
        )}
      </div>
    </div>
  );
}