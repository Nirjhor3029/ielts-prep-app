import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { chaptersAPI, adminAPI } from '../../lib/api';

export default function AdminDashboard() {
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chaptersAPI.list()
      .then((data) => setChapters(data.chapters))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleTogglePublish = async (id: string) => {
    try {
      const data = await adminAPI.togglePublish(id);
      setChapters(chapters.map((ch) =>
        ch._id === id ? { ...ch, isPublished: data.chapter.isPublished } : ch
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    try {
      await adminAPI.deleteChapter(id);
      setChapters(chapters.filter((ch) => ch._id !== id));
    } catch (err) {
      console.error(err);
    }
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
          <Link to="/profile" className="active:scale-95 transition-transform text-on-surface-variant hover:opacity-80">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md font-bold">Admin Panel</h1>
        </div>
        <Link
          to="/admin/chapters/new"
          className="bg-primary text-on-primary px-4 py-2 rounded-xl font-label-md text-label-md font-bold active:scale-95 transition-transform"
        >
          + New Chapter
        </Link>
      </header>

      <main className="pt-20 px-container-padding max-w-[768px] mx-auto space-y-xl">
        <p className="font-body-md text-on-surface-variant">
          Manage your IELTS content. Create and edit chapters, questions, and study notes.
        </p>

        <div className="space-y-md">
          {chapters.map((chapter) => (
            <div key={chapter._id} className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-primary">{chapter.icon || 'menu_book'}</span>
                </div>
                <div>
                  <h3 className="font-label-md text-on-surface block">{chapter.title}</h3>
                  <span className="font-caption text-on-surface-variant">
                    Order: {chapter.order} • {chapter.questionSets?.length || 0} question sets
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTogglePublish(chapter._id)}
                  className={`px-3 py-1 rounded-full font-label-md text-label-md ${
                    chapter.isPublished
                      ? 'bg-primary/10 text-primary'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {chapter.isPublished ? 'Published' : 'Draft'}
                </button>
                <Link
                  to={`/admin/chapters/${chapter._id}`}
                  className="p-2 rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">edit</span>
                </Link>
                <button
                  onClick={() => handleDelete(chapter._id)}
                  className="p-2 rounded-lg hover:bg-error-container transition-colors"
                >
                  <span className="material-symbols-outlined text-error">delete</span>
                </button>
              </div>
            </div>
          ))}

          {chapters.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">menu_book</span>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No chapters yet</h3>
              <p className="font-body-md text-on-surface-variant mb-4">Create your first chapter to get started.</p>
              <Link
                to="/admin/chapters/new"
                className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md font-bold inline-block"
              >
                Create Chapter
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
