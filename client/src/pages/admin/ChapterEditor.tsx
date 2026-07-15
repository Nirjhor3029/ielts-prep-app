import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { chaptersAPI, adminAPI } from '../../lib/api';

interface QuestionForm {
  type: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  justification: string;
}

interface QuestionSetForm {
  type: string;
  title: string;
  timeLimitMinutes: number;
  questions: QuestionForm[];
}

interface ChapterForm {
  title: string;
  module: string;
  order: number;
  description: string;
  readTimeMinutes: number;
  difficulty: string;
  notes: string;
  icon: string;
  isPublished: boolean;
  questionSets: QuestionSetForm[];
}

const emptyQuestion: QuestionForm = {
  type: 'mcq',
  prompt: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  justification: '',
};

const emptyQuestionSet: QuestionSetForm = {
  type: 'practice',
  title: '',
  timeLimitMinutes: 10,
  questions: [{ ...emptyQuestion }],
};

export default function ChapterEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ChapterForm>({
    title: '',
    module: 'grammar',
    order: 1,
    description: '',
    readTimeMinutes: 10,
    difficulty: 'beginner',
    notes: '',
    icon: 'menu_book',
    isPublished: false,
    questionSets: [{ ...emptyQuestionSet }],
  });

  useEffect(() => {
    if (!id) return;
    chaptersAPI.list()
      .then((data) => {
        const chapter = data.chapters.find((ch: any) => ch._id === id);
        if (chapter) {
          setForm({
            title: chapter.title,
            module: chapter.module,
            order: chapter.order,
            description: chapter.description,
            readTimeMinutes: chapter.readTimeMinutes,
            difficulty: chapter.difficulty,
            notes: chapter.notes,
            icon: chapter.icon,
            isPublished: chapter.isPublished,
            questionSets: chapter.questionSets?.length > 0
              ? chapter.questionSets.map((qs: any) => ({
                  type: qs.type,
                  title: qs.title,
                  timeLimitMinutes: qs.timeLimitMinutes || 10,
                  questions: qs.questions?.length > 0
                    ? qs.questions.map((q: any) => ({
                        type: q.type,
                        prompt: q.prompt,
                        options: q.options || ['', '', '', ''],
                        correctAnswer: String(q.correctAnswer),
                        justification: q.justification,
                      }))
                    : [{ ...emptyQuestion }],
                }))
              : [{ ...emptyQuestionSet }],
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        await adminAPI.updateChapter(id, form);
      } else {
        await adminAPI.createChapter(form);
      }
      navigate('/admin');
    } catch (err: any) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addQuestionSet = () => {
    setForm({
      ...form,
      questionSets: [...form.questionSets, { ...emptyQuestionSet, type: form.questionSets.length === 0 ? 'practice' : 'test' }],
    });
  };

  const addQuestion = (setIndex: number) => {
    const newSets = [...form.questionSets];
    newSets[setIndex] = {
      ...newSets[setIndex],
      questions: [...newSets[setIndex].questions, { ...emptyQuestion }],
    };
    setForm({ ...form, questionSets: newSets });
  };

  const updateQuestion = (setIndex: number, qIndex: number, field: keyof QuestionForm, value: any) => {
    const newSets = [...form.questionSets];
    const newQuestions = [...newSets[setIndex].questions];
    newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
    newSets[setIndex] = { ...newSets[setIndex], questions: newQuestions };
    setForm({ ...form, questionSets: newSets });
  };

  const updateOption = (setIndex: number, qIndex: number, optIndex: number, value: string) => {
    const newSets = [...form.questionSets];
    const newQuestions = [...newSets[setIndex].questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[optIndex] = value;
    newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
    newSets[setIndex] = { ...newSets[setIndex], questions: newQuestions };
    setForm({ ...form, questionSets: newSets });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-background fixed top-0 w-full max-w-[768px] left-1/2 -translate-x-1/2 z-50 h-16 flex items-center justify-between px-container-padding">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="active:scale-95 transition-transform text-on-surface-variant hover:opacity-80">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md font-bold">
            {id ? 'Edit Chapter' : 'New Chapter'}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-on-primary px-4 py-2 rounded-xl font-label-md text-label-md font-bold active:scale-95 transition-transform disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </header>

      <main className="pt-20 px-container-padding max-w-[768px] mx-auto space-y-xl">
        <div className="space-y-4">
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md focus:border-primary focus:border-2 focus:outline-none"
              placeholder="Chapter title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md focus:border-primary focus:border-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Read Time (min)</label>
              <input
                type="number"
                value={form.readTimeMinutes}
                onChange={(e) => setForm({ ...form, readTimeMinutes: parseInt(e.target.value) || 10 })}
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md focus:border-primary focus:border-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md focus:border-primary focus:border-2 focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Icon</label>
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md focus:border-primary focus:border-2 focus:outline-none"
                placeholder="menu_book"
              />
            </div>
          </div>

          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md focus:border-primary focus:border-2 focus:outline-none"
              placeholder="One line description"
            />
          </div>

          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Study Notes (HTML)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full h-64 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md focus:border-primary focus:border-2 focus:outline-none resize-y"
              placeholder="Write study notes in HTML..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md text-on-surface">Question Sets</h3>
            <button
              onClick={addQuestionSet}
              className="text-primary font-label-md text-label-md flex items-center gap-1 hover:opacity-80"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Set
            </button>
          </div>

          {form.questionSets.map((qs, setIndex) => (
            <div key={setIndex} className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-label-md text-label-md text-on-surface">Set {setIndex + 1}</h4>
                <select
                  value={qs.type}
                  onChange={(e) => {
                    const newSets = [...form.questionSets];
                    newSets[setIndex] = { ...newSets[setIndex], type: e.target.value };
                    setForm({ ...form, questionSets: newSets });
                  }}
                  className="px-3 py-1 rounded-lg border border-outline-variant text-label-md"
                >
                  <option value="practice">Practice</option>
                  <option value="test">Test</option>
                </select>
              </div>

              <input
                value={qs.title}
                onChange={(e) => {
                  const newSets = [...form.questionSets];
                  newSets[setIndex] = { ...newSets[setIndex], title: e.target.value };
                  setForm({ ...form, questionSets: newSets });
                }}
                className="w-full h-10 px-4 rounded-lg border border-outline-variant bg-surface-container-low text-body-md focus:border-primary focus:border-2 focus:outline-none"
                placeholder="Set title (e.g., Present Simple - Practice 1)"
              />

              <div className="space-y-4">
                {qs.questions.map((q, qIndex) => (
                  <div key={qIndex} className="bg-surface-container-low rounded-lg p-4 space-y-3 border border-outline-variant/50">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-on-surface-variant">Q{qIndex + 1}</span>
                      <select
                        value={q.type}
                        onChange={(e) => updateQuestion(setIndex, qIndex, 'type', e.target.value)}
                        className="px-2 py-1 rounded border border-outline-variant text-caption"
                      >
                        <option value="mcq">MCQ</option>
                        <option value="fill-blank">Fill Blank</option>
                        <option value="error-identification">Error ID</option>
                        <option value="sentence-correction">Sentence Correction</option>
                      </select>
                    </div>

                    <input
                      value={q.prompt}
                      onChange={(e) => updateQuestion(setIndex, qIndex, 'prompt', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-white text-body-md text-sm focus:border-primary focus:border-2 focus:outline-none"
                      placeholder="Question prompt"
                    />

                    {q.type === 'mcq' && (
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, optIndex) => (
                          <input
                            key={optIndex}
                            value={opt}
                            onChange={(e) => updateOption(setIndex, qIndex, optIndex, e.target.value)}
                            className="h-9 px-3 rounded-lg border border-outline-variant bg-white text-body-md text-sm focus:border-primary focus:border-2 focus:outline-none"
                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                          />
                        ))}
                      </div>
                    )}

                    <input
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(setIndex, qIndex, 'correctAnswer', e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant bg-white text-body-md text-sm focus:border-primary focus:border-2 focus:outline-none"
                      placeholder="Correct answer"
                    />

                    <input
                      value={q.justification}
                      onChange={(e) => updateQuestion(setIndex, qIndex, 'justification', e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant bg-white text-body-md text-sm focus:border-primary focus:border-2 focus:outline-none"
                      placeholder="Justification (explanation)"
                    />
                  </div>
                ))}

                <button
                  onClick={() => addQuestion(setIndex)}
                  className="w-full py-2 border border-dashed border-outline-variant rounded-lg text-primary font-label-md text-label-md hover:bg-primary/5 transition-colors"
                >
                  + Add Question
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
