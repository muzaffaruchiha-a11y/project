import { useRef, useState } from 'react';
import { RotateCcw, Upload, Download, Plus, Trash2, Edit3, AlertTriangle, BarChart3, BookOpen } from 'lucide-react';
import type { Subject, Test, TestStats } from '../types';
import { supabase } from '../lib/supabase';

interface Props {
  subjects: Subject[];
  onAddSubject: (name: string) => Promise<string | null>;
  onDeleteSubject: (id: number) => Promise<string | null>;
  tests: Test[];
  onAddTest: (test: Omit<Test, 'id' | 'created_at'>) => Promise<string | null>;
  onUpdateTest: (id: number, updates: Partial<Test>) => Promise<string | null>;
  onDeleteTest: (id: number) => Promise<string | null>;
  onResetProgress: () => Promise<void>;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

type SubTab = 'subjects' | 'tests' | 'stats' | 'settings';

export function AdminPanel({
  subjects,
  onAddSubject,
  onDeleteSubject,
  tests,
  onAddTest,
  onUpdateTest,
  onDeleteTest,
  onResetProgress,
  onToast,
}: Props) {
  const [subTab, setSubTab] = useState<SubTab>('subjects');
  const [newSubject, setNewSubject] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [editingTest, setEditingTest] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Add test form state
  const [formSubjectId, setFormSubjectId] = useState<number>(subjects[0]?.id ?? 1);
  const [formAuthor, setFormAuthor] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formA, setFormA] = useState('');
  const [formB, setFormB] = useState('');
  const [formC, setFormC] = useState('');
  const [formD, setFormD] = useState('');
  const [formAnswer, setFormAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Edit test form state
  const [editAuthor, setEditAuthor] = useState('');
  const [editQuestion, setEditQuestion] = useState('');
  const [editA, setEditA] = useState('');
  const [editB, setEditB] = useState('');
  const [editC, setEditC] = useState('');
  const [editD, setEditD] = useState('');
  const [editAnswer, setEditAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');

  const [testStats, setTestStats] = useState<TestStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  function clearForm() {
    setFormAuthor(''); setFormQuestion('');
    setFormA(''); setFormB(''); setFormC(''); setFormD(''); setFormAnswer('A');
  }

  async function handleAddSubject() {
    if (!newSubject.trim()) { onToast("Fan nomini kiriting", 'error'); return; }
    const err = await onAddSubject(newSubject.trim());
    if (err) { onToast("Xato: " + err, 'error'); return; }
    onToast("Fan qo'shildi", 'success');
    setNewSubject('');
  }

  async function handleDeleteSubject(id: number) {
    if (!confirm("Bu fan va uning barcha testlari o'chiriladi. Davom etasizmi?")) return;
    const err = await onDeleteSubject(id);
    if (err) { onToast("Xato: " + err, 'error'); return; }
    onToast("Fan o'chirildi", 'success');
  }

  async function handleAddTest() {
    if (!formAuthor.trim() || !formQuestion.trim() || !formA.trim() || !formB.trim() || !formC.trim() || !formD.trim()) {
      onToast("Ma'lumotlarni to'liq kiriting", 'error');
      return;
    }
    const err = await onAddTest({
      subject_id: formSubjectId,
      author_name: formAuthor.trim(),
      question: formQuestion.trim(),
      option_a: formA.trim(),
      option_b: formB.trim(),
      option_c: formC.trim(),
      option_d: formD.trim(),
      correct_answer: formAnswer,
    });
    if (err) { onToast("Xato: " + err, 'error'); return; }
    onToast("Test qo'shildi", 'success');
    clearForm();
  }

  function startEdit(test: Test) {
    setEditingTest(test.id);
    setEditAuthor(test.author_name);
    setEditQuestion(test.question);
    setEditA(test.option_a); setEditB(test.option_b);
    setEditC(test.option_c); setEditD(test.option_d);
    setEditAnswer(test.correct_answer);
  }

  async function saveEdit() {
    if (!editAuthor.trim() || !editQuestion.trim() || !editA.trim() || !editB.trim() || !editC.trim() || !editD.trim()) {
      onToast("Ma'lumotlarni to'liq kiriting", 'error');
      return;
    }
    const err = await onUpdateTest(editingTest!, {
      author_name: editAuthor.trim(),
      question: editQuestion.trim(),
      option_a: editA.trim(),
      option_b: editB.trim(),
      option_c: editC.trim(),
      option_d: editD.trim(),
      correct_answer: editAnswer,
    });
    if (err) { onToast("Xato: " + err, 'error'); return; }
    onToast("Test yangilandi", 'success');
    setEditingTest(null);
  }

  async function handleDeleteTest(id: number) {
    const err = await onDeleteTest(id);
    if (err) { onToast("Xato: " + err, 'error'); return; }
    onToast("Test o'chirildi", 'success');
  }

  async function handleReset() {
    if (!confirmReset) { setConfirmReset(true); return; }
    await onResetProgress();
    onToast("Progress tozalandi", 'success');
    setConfirmReset(false);
  }

  async function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) { onToast("CSV fayl bo'sh", 'error'); return; }

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1);
    const insertRows: any[] = [];

    for (const row of rows) {
      const cols = row.split(',').map(c => c.trim());
      if (cols.length < 7) continue;
      const subjectName = cols[header.indexOf('subject') ?? -1] || cols[0];
      const question = cols[header.indexOf('question') ?? -1] || cols[1];
      const a = cols[header.indexOf('option_a') ?? -1] || cols[2];
      const b = cols[header.indexOf('option_b') ?? -1] || cols[3];
      const c = cols[header.indexOf('option_c') ?? -1] || cols[4];
      const d = cols[header.indexOf('option_d') ?? -1] || cols[5];
      const answer = (cols[header.indexOf('correct_answer') ?? -1] || cols[6] || 'A').toUpperCase();

      if (!question || !a || !b || !c || !d) continue;
      const subj = subjects.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
      insertRows.push({
        subject_id: subj?.id ?? subjects[0]?.id ?? 1,
        author_name: 'CSV Import',
        question, option_a: a, option_b: b, option_c: c, option_d: d,
        correct_answer: ['A','B','C','D'].includes(answer) ? answer : 'A',
      });
    }

    if (insertRows.length === 0) { onToast("Import qilish uchun ma'lumot topilmadi", 'error'); return; }
    const { error } = await supabase.from('tests').insert(insertRows);
    if (error) { onToast("Import xatosi: " + error.message, 'error'); return; }
    onToast(`${insertRows.length} ta test import qilindi`, 'success');
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleExportCSV() {
    const header = 'subject,question,option_a,option_b,option_c,option_d,correct_answer,author_name';
    const rows = tests.map(t => {
      const subj = subjects.find(s => s.id === t.subject_id);
      return `"${subj?.name ?? ''}","${t.question}","${t.option_a}","${t.option_b}","${t.option_c}","${t.option_d}","${t.correct_answer}","${t.author_name}"`;
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'tests_export.csv'; a.click();
    URL.revokeObjectURL(url);
    onToast("CSV eksport qilindi", 'success');
  }

  async function loadStats() {
    setStatsLoading(true);
    const { data, error } = await supabase.rpc('get_test_statistics');
    if (!error && data) setTestStats(data);
    else {
      // Fallback: compute client-side
      const { data: allResults } = await supabase.from('results').select('test_id, is_correct');
      const { data: allTests } = await supabase.from('tests').select('id');

      if (allResults && allTests) {
        const map = new Map<number, { total: number; correct: number }>();
        for (const t of allTests) map.set(t.id, { total: 0, correct: 0 });
        for (const r of allResults) {
          const entry = map.get(r.test_id);
          if (entry) { entry.total++; if (r.is_correct) entry.correct++; }
        }
        const stats: TestStats[] = [];
        map.forEach((v, test_id) => {
          stats.push({
            test_id,
            total_attempts: v.total,
            correct_count: v.correct,
            incorrect_count: v.total - v.correct,
            accuracy_pct: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
          });
        });
        setTestStats(stats);
      }
    }
    setStatsLoading(false);
  }

  const subTabs: { key: SubTab; label: string; icon: typeof BookOpen }[] = [
    { key: 'subjects', label: 'Fanlar', icon: BookOpen },
    { key: 'tests', label: 'Testlar', icon: Edit3 },
    { key: 'stats', label: 'Statistika', icon: BarChart3 },
    { key: 'settings', label: 'Sozlamalar', icon: RotateCcw },
  ];

  return (
    <div className="space-y-4">
      {/* Sub tabs */}
      <div className="flex gap-1 flex-wrap">
        {subTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setSubTab(key); if (key === 'stats') loadStats(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 border ${
              subTab === key
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Subjects */}
      {subTab === 'subjects' && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Fanlar boshqaruvi</h3>
          <div className="flex gap-2">
            <input
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              placeholder="Yangi fan nomi..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
            />
            <button onClick={handleAddSubject} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
              <Plus className="w-4 h-4" /> Qo'shish
            </button>
          </div>
          <div className="space-y-1.5">
            {subjects.map(s => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-lg">
                <span className="text-sm text-slate-200">{s.name}</span>
                <button onClick={() => handleDeleteSubject(s.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tests */}
      {subTab === 'tests' && (
        <div className="space-y-4">
          {/* Add test form */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Yangi test qo'shish</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Fan</label>
                <select value={formSubjectId} onChange={e => setFormSubjectId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none">
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Muallif F.I.Sh. *</label>
                <input value={formAuthor} onChange={e => setFormAuthor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Muallif ismi" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Savol *</label>
                <textarea value={formQuestion} onChange={e => setFormQuestion(e.target.value)} rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Savol matni" />
              </div>
              {(['A', 'B', 'C', 'D'] as const).map(key => {
                const setter = key === 'A' ? setFormA : key === 'B' ? setFormB : key === 'C' ? setFormC : setFormD;
                const value = key === 'A' ? formA : key === 'B' ? formB : key === 'C' ? formC : formD;
                return (
                  <div key={key}>
                    <label className="text-xs text-slate-400 mb-1 block">Variant {key} *</label>
                    <input value={value} onChange={e => setter(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none" />
                  </div>
                );
              })}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">To'g'ri javob *</label>
                <select value={formAnswer} onChange={e => setFormAnswer(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none">
                  <option value="A">A</option><option value="B">B</option>
                  <option value="C">C</option><option value="D">D</option>
                </select>
              </div>
            </div>
            <button onClick={handleAddTest} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
              Test qo'shish
            </button>
          </div>

          {/* Tests list */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Testlar ro'yxati ({tests.length})</h3>
            {tests.slice(0, 20).map(t => (
              <div key={t.id} className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 space-y-2">
                {editingTest === t.id ? (
                  <div className="space-y-2">
                    <input value={editAuthor} onChange={e => setEditAuthor(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none" />
                    <textarea value={editQuestion} onChange={e => setEditQuestion(e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none resize-none" />
                    <div className="grid grid-cols-2 gap-2">
                      {(['A','B','C','D'] as const).map(k => {
                        const s = k==='A'?setEditA:k==='B'?setEditB:k==='C'?setEditC:setEditD;
                        const v = k==='A'?editA:k==='B'?editB:k==='C'?editC:editD;
                        return <input key={k} value={v} onChange={e=>s(e.target.value)} placeholder={`Variant ${k}`} className="bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none" />;
                      })}
                    </div>
                    <select value={editAnswer} onChange={e => setEditAnswer(e.target.value as any)} className="bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none">
                      <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500">Saqlash</button>
                      <button onClick={() => setEditingTest(null)} className="flex-1 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-600">Bekor</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-slate-300 flex-1">{t.question}</p>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => startEdit(t)} className="text-slate-500 hover:text-blue-400 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteTest(t.id)} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {(['A','B','C','D'] as const).map(k => {
                        const v = k==='A'?t.option_a:k==='B'?t.option_b:k==='C'?t.option_c:t.option_d;
                        const isCorrect = t.correct_answer === k;
                        return <span key={k} className={`text-[10px] px-1.5 py-0.5 rounded ${isCorrect ? 'bg-emerald-900/50 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>{k}: {v}</span>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {tests.length > 20 && <p className="text-xs text-slate-500 text-center">... va yana {tests.length - 20} ta test</p>}
          </div>
        </div>
      )}

      {/* Statistics */}
      {subTab === 'stats' && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Testlar statistikasi</h3>
          {statsLoading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" /></div>
          ) : testStats.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">Statistika yo'q</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-2 text-slate-400">Test ID</th>
                    <th className="text-left py-2 px-2 text-slate-400">Urinishlar</th>
                    <th className="text-left py-2 px-2 text-slate-400">To'g'ri</th>
                    <th className="text-left py-2 px-2 text-slate-400">Noto'g'ri</th>
                    <th className="text-left py-2 px-2 text-slate-400">Foiz</th>
                  </tr>
                </thead>
                <tbody>
                  {testStats.filter(s => s.total_attempts > 0).slice(0, 50).map(s => (
                    <tr key={s.test_id} className="border-b border-slate-800">
                      <td className="py-1.5 px-2 text-slate-300">#{s.test_id}</td>
                      <td className="py-1.5 px-2 text-slate-300">{s.total_attempts}</td>
                      <td className="py-1.5 px-2 text-emerald-400">{s.correct_count}</td>
                      <td className="py-1.5 px-2 text-red-400">{s.incorrect_count}</td>
                      <td className="py-1.5 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          s.accuracy_pct >= 80 ? 'bg-emerald-900/50 text-emerald-300' :
                          s.accuracy_pct >= 50 ? 'bg-amber-900/50 text-amber-300' :
                          'bg-red-900/50 text-red-300'
                        }`}>{s.accuracy_pct}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      {subTab === 'settings' && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm space-y-6">
          <h3 className="text-sm font-semibold text-slate-200">Sozlamalar</h3>

          {/* Reset */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Progressni tozalash</p>
            <p className="text-xs text-slate-500">Barcha javoblar va statistikalar o'chiriladi. Testlar saqlanib qoladi.</p>
            {confirmReset && (
              <div className="flex items-start gap-2 bg-amber-900/30 border border-amber-700/50 rounded-xl p-3 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Barcha progress o'chiriladi. Qayta tasdiqlash uchun bosing.</span>
              </div>
            )}
            <button onClick={handleReset} onBlur={() => setConfirmReset(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                confirmReset ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-red-900/40 hover:border-red-600 hover:text-red-300'
              }`}>
              <RotateCcw className="w-4 h-4" />
              {confirmReset ? 'Tasdiqlash' : 'Progressni tozalash'}
            </button>
          </div>

          {/* CSV Import */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">CSV Import</p>
            <p className="text-xs text-slate-500">Format: subject, question, option_a, option_b, option_c, option_d, correct_answer</p>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-700/60 border border-slate-600 text-slate-300 hover:bg-blue-900/40 hover:border-blue-600 hover:text-blue-300 transition-all duration-200">
              <Upload className="w-4 h-4" /> CSV Import
            </button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleImportCSV} className="hidden" />
          </div>

          {/* CSV Export */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">CSV Export</p>
            <button onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-700/60 border border-slate-600 text-slate-300 hover:bg-emerald-900/40 hover:border-emerald-600 hover:text-emerald-300 transition-all duration-200">
              <Download className="w-4 h-4" /> CSV Eksport
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
