import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { chaptersAPI, adminAPI } from '../../lib/api';
import { useThemeStore } from '../../stores/themeStore';

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

interface VocabForm {
  word: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
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
  vocab: VocabForm[];
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

const emptyVocab: VocabForm = {
  word: '',
  meaning: '',
  partOfSpeech: 'noun',
  example: '',
};

export default function ChapterEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const { mode, toggle } = useThemeStore();
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
    vocab: [],
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
            vocab: chapter.vocab?.length > 0
              ? chapter.vocab.map((v: any) => ({
                  word: v.word,
                  meaning: v.meaning,
                  partOfSpeech: v.partOfSpeech,
                  example: v.example,
                }))
              : [],
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

  const addVocab = () => {
    setForm({ ...form, vocab: [...form.vocab, { ...emptyVocab }] });
  };

  const updateVocab = (index: number, field: keyof VocabForm, value: string) => {
    const newVocab = [...form.vocab];
    newVocab[index] = { ...newVocab[index], [field]: value };
    setForm({ ...form, vocab: newVocab });
  };

  const removeVocab = (index: number) => {
    setForm({ ...form, vocab: form.vocab.filter((_, i) => i !== index) });
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const copyTemplate = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const templates = [
    {
      id: 'sub-topic-card',
      label: 'Sub-topic Card',
      preview: `<div style="background:var(--color-surface-container-lowest);border:1px solid var(--color-outline-variant);border-radius:1rem;padding:1.5rem;margin-bottom:1rem"><div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem"><div style="width:2.5rem;height:2.5rem;background:color-mix(in srgb,var(--color-primary) 10%,transparent);border-radius:0.5rem;display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined" style="color:var(--color-primary);font-size:20px">bookmark</span></div><h3 style="font-size:1.25rem;font-weight:700;color:var(--color-on-surface);margin:0">1. Noun</h3></div><p style="color:var(--color-on-surface-variant);margin:0;font-size:0.95rem">A noun names someone or something.</p></div>`,
      code: `<div class="sub-topic-card" data-topic="noun">\n  <div class="flex items-center gap-3 mb-4">\n    <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">\n      <span class="material-symbols-outlined text-primary">bookmark</span>\n    </div>\n    <h3 class="font-headline-md text-headline-md text-on-surface">1. Noun</h3>\n  </div>\n  <p class="font-body-lg text-body-lg text-on-surface mb-4">Description here.</p>\n</div>`,
    },
    {
      id: 'tip-callout',
      label: 'Tip Callout',
      preview: `<div style="background:color-mix(in srgb,var(--color-secondary-container) 30%,transparent);border-left:4px solid var(--color-secondary);padding:1rem 1.25rem;border-radius:0 0.5rem 0.5rem 0"><p style="font-weight:600;color:var(--color-on-secondary-container);font-size:0.875rem;margin:0 0 0.25rem">IELTS Tip</p><p style="color:var(--color-on-surface-variant);margin:0;font-size:0.95rem">Learn these words — they appear very often.</p></div>`,
      code: `<div class="bg-secondary-container/30 border-l-4 border-secondary p-4 rounded-r-lg mb-4">\n  <p class="font-label-md text-on-secondary-container font-semibold">IELTS Tip</p>\n  <p class="font-body-md text-on-surface-variant mt-1">Tip content here.</p>\n</div>`,
    },
    {
      id: 'mistake-callout',
      label: 'Mistake Callout',
      preview: `<div style="background:color-mix(in srgb,var(--color-error-container) 20%,transparent);border-left:4px solid var(--color-error);padding:1rem 1.25rem;border-radius:0 0.5rem 0.5rem 0"><p style="font-weight:600;color:var(--color-on-error-container);font-size:0.875rem;margin:0 0 0.25rem">Common Mistake</p><p style="color:var(--color-on-surface-variant);margin:0;font-size:0.95rem"><span style="text-decoration:line-through;color:var(--color-error)">Wrong sentence.</span> → <span style="font-weight:600;color:var(--color-primary)">Correct sentence.</span></p></div>`,
      code: `<div class="bg-error-container/20 border-l-4 border-error p-4 rounded-r-lg mb-4">\n  <p class="font-label-md text-on-error-container font-semibold">Common Mistake</p>\n  <p class="font-body-md text-on-surface-variant mt-1">Mistake content here.</p>\n</div>`,
    },
    {
      id: 'grid-2col',
      label: '2-Column Grid',
      preview: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem"><div style="background:var(--color-surface-container-low);border-radius:0.5rem;padding:0.75rem"><p style="font-weight:600;color:var(--color-primary);font-size:0.875rem;margin:0 0 0.125rem">Common Noun</p><p style="font-size:0.75rem;color:var(--color-on-surface-variant);margin:0">city, dog, teacher</p></div><div style="background:var(--color-surface-container-low);border-radius:0.5rem;padding:0.75rem"><p style="font-weight:600;color:var(--color-primary);font-size:0.875rem;margin:0 0 0.125rem">Proper Noun</p><p style="font-size:0.75rem;color:var(--color-on-surface-variant);margin:0">Dhaka, IELTS, London</p></div></div>`,
      code: `<div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">\n  <div class="bg-surface-container-low rounded-lg p-3">\n    <p class="font-label-md text-primary font-semibold">Label</p>\n    <p class="font-caption text-on-surface-variant">Description</p>\n  </div>\n  <div class="bg-surface-container-low rounded-lg p-3">\n    <p class="font-label-md text-primary font-semibold">Label</p>\n    <p class="font-caption text-on-surface-variant">Description</p>\n  </div>\n</div>`,
    },
    {
      id: 'chips',
      label: 'Chips / Tags',
      preview: `<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.75rem"><span style="background:color-mix(in srgb,var(--color-primary) 10%,transparent);color:var(--color-primary);padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.875rem;font-weight:500">I</span><span style="background:color-mix(in srgb,var(--color-primary) 10%,transparent);color:var(--color-primary);padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.875rem;font-weight:500">you</span><span style="background:color-mix(in srgb,var(--color-primary) 10%,transparent);color:var(--color-primary);padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.875rem;font-weight:500">he</span><span style="background:color-mix(in srgb,var(--color-primary) 10%,transparent);color:var(--color-primary);padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.875rem;font-weight:500">she</span></div>`,
      code: `<div class="flex flex-wrap gap-2 mb-4">\n  <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">Word 1</span>\n  <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">Word 2</span>\n  <span class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">Word 3</span>\n</div>`,
    },
    {
      id: 'examples-list',
      label: 'Examples List',
      preview: `<div><p style="font-weight:600;font-size:0.875rem;color:var(--color-on-surface);margin:0 0 0.5rem;text-transform:uppercase;letter-spacing:0.025em">Examples</p><ul style="list-style:none;padding:0;margin:0"><li style="padding:0.375rem 0 0.375rem 1.25rem;position:relative;line-height:1.6;font-size:0.95rem;color:var(--color-on-surface-variant)"><span style="position:absolute;left:0;top:0.75rem;width:6px;height:6px;border-radius:50%;background:var(--color-primary)"></span><span style="font-weight:600;color:var(--color-primary)">Ali</span> is a student.</li><li style="padding:0.375rem 0 0.375rem 1.25rem;position:relative;line-height:1.6;font-size:0.95rem;color:var(--color-on-surface-variant)"><span style="position:absolute;left:0;top:0.75rem;width:6px;height:6px;border-radius:50%;background:var(--color-primary)"></span><span style="font-weight:600;color:var(--color-primary)">Dhaka</span> is a city.</li></ul></div>`,
      code: `<h4 class="font-label-md text-on-surface font-semibold mb-2">Examples</h4>\n<ul class="space-y-2 mb-4">\n  <li class="font-body-md text-on-surface-variant"><span class="text-primary font-semibold">keyword</span> example text here.</li>\n  <li class="font-body-md text-on-surface-variant"><span class="text-primary font-semibold">keyword</span> example text here.</li>\n</ul>`,
    },
    {
      id: 'intro-callout',
      label: 'Intro Callout',
      preview: `<div style="background:color-mix(in srgb,var(--color-primary) 5%,transparent);border-left:4px solid var(--color-primary);padding:1rem 1.25rem;border-radius:0 0.5rem 0.5rem 0;margin-bottom:1rem"><p style="font-weight:600;color:var(--color-primary);font-size:0.875rem;margin:0 0 0.25rem">How We Learn</p><p style="color:var(--color-on-surface-variant);margin:0;font-size:0.95rem">Everything is in English. Don't worry if you don't understand everything at first.</p></div>`,
      code: `<div class="lesson-intro">\n  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg mb-6">\n    <p class="font-label-md text-primary font-semibold">Title</p>\n    <p class="font-body-md text-on-surface-variant mt-1">Content here.</p>\n  </div>\n</div>`,
    },
    {
      id: 'summary-grid',
      label: 'Summary Grid',
      preview: `<div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--color-outline-variant)"><p style="font-size:1.25rem;font-weight:700;color:var(--color-on-surface);margin:0 0 0.75rem">What You've Learned</p><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem"><div style="background:color-mix(in srgb,var(--color-primary-fixed) 20%,transparent);border-radius:0.5rem;padding:0.5rem;text-align:center"><span class="material-symbols-outlined" style="color:var(--color-primary);font-size:20px">bookmark</span><p style="font-weight:500;color:var(--color-on-surface);margin:0.125rem 0 0;font-size:0.75rem">Noun</p></div><div style="background:color-mix(in srgb,var(--color-primary-fixed) 20%,transparent);border-radius:0.5rem;padding:0.5rem;text-align:center"><span class="material-symbols-outlined" style="color:var(--color-primary);font-size:20px">person</span><p style="font-weight:500;color:var(--color-on-surface);margin:0.125rem 0 0;font-size:0.75rem">Pronoun</p></div><div style="background:color-mix(in srgb,var(--color-primary-fixed) 20%,transparent);border-radius:0.5rem;padding:0.5rem;text-align:center"><span class="material-symbols-outlined" style="color:var(--color-primary);font-size:20px">bolt</span><p style="font-weight:500;color:var(--color-on-surface);margin:0.125rem 0 0;font-size:0.75rem">Verb</p></div><div style="background:color-mix(in srgb,var(--color-primary-fixed) 20%,transparent);border-radius:0.5rem;padding:0.5rem;text-align:center"><span class="material-symbols-outlined" style="color:var(--color-primary);font-size:20px">palette</span><p style="font-weight:500;color:var(--color-on-surface);margin:0.125rem 0 0;font-size:0.75rem">Adjective</p></div></div></div>`,
      code: `<div class="lesson-summary mt-8">\n  <h3 class="font-headline-md text-headline-md text-on-surface mb-4">Summary</h3>\n  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">\n    <div class="bg-primary-fixed/20 rounded-lg p-3 text-center">\n      <span class="material-symbols-outlined text-primary">icon_name</span>\n      <p class="font-label-md text-on-surface mt-1">Label</p>\n    </div>\n  </div>\n</div>`,
    },
  ];

  const materialIcons = ['bookmark', 'person', 'bolt', 'palette', 'speed', 'link', 'account_tree', 'emoji_emotions'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-background fixed top-0 w-full z-50 h-16 flex items-center justify-between px-container-padding md:pl-[268px]">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="active:scale-95 transition-transform text-on-surface-variant hover:opacity-80">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
            {id ? 'Edit Chapter' : 'New Chapter'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">{mode === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-on-primary px-4 py-2 rounded-xl font-label-md text-label-md font-bold active:scale-95 transition-transform disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Editor Panel */}
        <main className="flex-[3] min-w-0 px-container-padding space-y-xl pb-8">
          <div className="space-y-4">
            <div id="editor-title">
              <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:border-primary focus:border-2 focus:outline-none"
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
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:border-primary focus:border-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Read Time (min)</label>
                <input
                  type="number"
                  value={form.readTimeMinutes}
                  onChange={(e) => setForm({ ...form, readTimeMinutes: parseInt(e.target.value) || 10 })}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:border-primary focus:border-2 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:border-primary focus:border-2 focus:outline-none"
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
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:border-primary focus:border-2 focus:outline-none"
                  placeholder="menu_book"
                />
              </div>
            </div>

            <div id="editor-description">
              <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:border-primary focus:border-2 focus:outline-none"
                placeholder="One line description"
              />
            </div>

            <div id="editor-notes">
              <div className="flex items-center justify-between mb-2">
                <label className="font-label-md text-label-md text-on-surface-variant">Study Notes (HTML)</label>
                <button
                  onClick={() => setShowCheatSheet(true)}
                  className="font-label-md text-label-md text-primary flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[16px]">content_paste</span>
                  Cheat Sheet
                </button>
              </div>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full h-64 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:border-primary focus:border-2 focus:outline-none resize-y"
                placeholder="Write study notes in HTML..."
              />
            </div>
          </div>

          <div id="editor-vocab" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-on-surface">Vocabulary</h3>
              <button
                onClick={addVocab}
                className="text-primary font-label-md text-label-md flex items-center gap-1 hover:opacity-80"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Word
              </button>
            </div>

            {form.vocab.map((v, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-on-surface-variant">Word {i + 1}</span>
                  <button
                    onClick={() => removeVocab(i)}
                    className="p-1 rounded-lg hover:bg-error-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-error">delete</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={v.word}
                    onChange={(e) => updateVocab(i, 'word', e.target.value)}
                    className="h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:border-primary focus:border-2 focus:outline-none"
                    placeholder="Word"
                  />
                  <select
                    value={v.partOfSpeech}
                    onChange={(e) => updateVocab(i, 'partOfSpeech', e.target.value)}
                    className="h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:border-primary focus:border-2 focus:outline-none"
                  >
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="preposition">Preposition</option>
                    <option value="conjunction">Conjunction</option>
                    <option value="interjection">Interjection</option>
                  </select>
                </div>
                <input
                  value={v.meaning}
                  onChange={(e) => updateVocab(i, 'meaning', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:border-primary focus:border-2 focus:outline-none"
                  placeholder="Meaning (in English)"
                />
                <textarea
                  value={v.example}
                  onChange={(e) => updateVocab(i, 'example', e.target.value)}
                  className="w-full h-20 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:border-primary focus:border-2 focus:outline-none resize-none"
                  placeholder="Example sentence using the word"
                />
              </div>
            ))}

            {form.vocab.length === 0 && (
              <div className="text-center py-6 border border-dashed border-outline-variant rounded-xl">
                <span className="material-symbols-outlined text-on-surface-variant/30 text-[32px]">translate</span>
                <p className="font-body-md text-on-surface-variant/50 mt-1">No vocabulary yet</p>
              </div>
            )}
          </div>

          <div id="editor-questions" className="space-y-6">
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
                    className="px-3 py-1 rounded-lg border border-outline-variant bg-surface-container-lowest text-label-md text-on-surface"
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
                  className="w-full h-10 px-4 rounded-lg border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:border-primary focus:border-2 focus:outline-none"
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
                          className="px-2 py-1 rounded border border-outline-variant bg-surface-container-lowest text-caption text-on-surface"
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
                        className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md text-sm focus:border-primary focus:border-2 focus:outline-none"
                        placeholder="Question prompt"
                      />

                      {q.type === 'mcq' && (
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, optIndex) => (
                            <input
                              key={optIndex}
                              value={opt}
                              onChange={(e) => updateOption(setIndex, qIndex, optIndex, e.target.value)}
                              className="h-9 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md text-sm focus:border-primary focus:border-2 focus:outline-none"
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                            />
                          ))}
                        </div>
                      )}

                      <input
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(setIndex, qIndex, 'correctAnswer', e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md text-sm focus:border-primary focus:border-2 focus:outline-none"
                        placeholder="Correct answer"
                      />

                      <input
                        value={q.justification}
                        onChange={(e) => updateQuestion(setIndex, qIndex, 'justification', e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md text-sm focus:border-primary focus:border-2 focus:outline-none"
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

        {/* Preview Panel — desktop only */}
        <aside className="hidden md:block flex-[2] min-w-[380px] max-w-[480px] flex-shrink-0">
          <div className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-6">
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_0px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="bg-surface-container-high px-5 py-3 border-b border-outline-variant/50">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Preview</span>
              </div>

              <div className="p-5 space-y-4">
                {form.title && (
                  <div onClick={() => scrollTo('editor-title')} className="flex items-center gap-2 cursor-pointer rounded-lg p-1 -m-1 hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-primary">{form.icon || 'menu_book'}</span>
                    <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{form.title}</h2>
                  </div>
                )}

                {form.description && (
                  <p onClick={() => scrollTo('editor-description')} className="font-body-md text-on-surface-variant cursor-pointer rounded-lg p-1 -m-1 hover:bg-surface-container-low transition-colors">{form.description}</p>
                )}

                {form.title && (
                  <div className="flex items-center gap-3 text-caption text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {form.readTimeMinutes} min
                    </span>
                    <span className="capitalize">{form.difficulty}</span>
                    <span>Order #{form.order}</span>
                  </div>
                )}

                {form.title && <hr className="border-outline-variant/50" />}

                {form.vocab.length > 0 && (
                  <div onClick={() => scrollTo('editor-vocab')} className="cursor-pointer rounded-lg -m-1 p-1 hover:bg-surface-container-low transition-colors">
                    <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Vocabulary ({form.vocab.length} terms)</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.vocab.map((v, i) => (
                        <span key={i} className="bg-primary/10 text-primary px-2.5 py-1 rounded-full font-label-md text-label-md">
                          {v.word || '?'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {form.notes ? (
                  <div onClick={() => scrollTo('editor-notes')} className="cursor-pointer rounded-lg -m-1 p-1 hover:bg-surface-container-low transition-colors">
                    <article
                      className="notes-content preview-notes font-body-md text-body-md text-on-surface-variant leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: form.notes }}
                    />
                  </div>
                ) : form.title ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-on-surface-variant/30" style={{ fontSize: '48px' }}>article</span>
                    <p className="font-body-md text-on-surface-variant/50 mt-2">No notes yet</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-on-surface-variant/20" style={{ fontSize: '64px' }}>visibility</span>
                    <p className="font-body-md text-on-surface-variant/40 mt-3">Start typing to see preview</p>
                  </div>
                )}

                {form.questionSets.length > 0 && form.questionSets.some(qs => qs.title || qs.questions.length > 0) && (
                  <div onClick={() => scrollTo('editor-questions')} className="cursor-pointer rounded-lg -m-1 p-1 hover:bg-surface-container-low transition-colors">
                    <hr className="border-outline-variant/50" />
                    <div className="space-y-3 pt-3">
                      <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Question Sets</span>
                      {form.questionSets.map((qs, i) => (
                        <div key={i} className="flex items-center gap-3 bg-surface-container-low rounded-lg p-3">
                          <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-label-md text-label-md font-bold">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <span className="font-label-md text-on-surface block truncate">{qs.title || `Set ${i + 1}`}</span>
                            <span className="font-caption text-on-surface-variant">{qs.questions.length} questions • {qs.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Cheat Sheet Drawer */}
      {showCheatSheet && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCheatSheet(false)} />
          <div className="relative w-full max-w-[420px] bg-surface-container-lowest h-full shadow-2xl overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/50 px-5 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Cheat Sheet</h2>
                <p className="font-caption text-caption text-on-surface-variant">Click template to copy, then paste in editor</p>
              </div>
              <button
                onClick={() => setShowCheatSheet(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <div className="p-5 space-y-5">
              {templates.map((t) => (
                <div key={t.id} className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30">
                  <div className="px-4 py-3 flex items-center justify-between border-b border-outline-variant/30">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">{t.label}</span>
                    <button
                      onClick={() => copyTemplate(t.id, t.code)}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-label-md text-label-md font-semibold hover:bg-primary/20 transition-colors"
                    >
                      {copiedId === t.id ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <div className="p-4 bg-surface-container">
                    <div dangerouslySetInnerHTML={{ __html: t.preview }} />
                  </div>
                </div>
              ))}

              <div>
                <p className="font-label-md text-on-surface-variant mb-3 font-semibold">Material Icons</p>
                <div className="flex flex-wrap gap-2">
                  {materialIcons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => copyTemplate(`icon-${icon}`, `<span class="material-symbols-outlined">${icon}</span>`)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 hover:border-primary/50 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary">{icon}</span>
                      <span className="font-caption text-caption text-on-surface-variant">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
