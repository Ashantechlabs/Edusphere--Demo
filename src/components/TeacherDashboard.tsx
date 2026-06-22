'use client';

import React, { useState } from 'react';
import { useSchoolStore } from '@/store/useSchoolStore';
import { useToast } from '@/components/ui/Toast';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import {
  CheckCircle2, FileText, Plus, BookOpen, Edit2,
  Clock, ClipboardCheck, Users
} from 'lucide-react';
import { Student } from '@/utils/mockData';

interface RankedStudent extends Student {
  score: number;
}

interface TeacherDashboardProps { activeTab: string; }

const GRADE_COLOR = (score: number) => {
  if (score >= 90) return { color: 'var(--success)', bg: 'var(--success-subtle)' };
  if (score >= 80) return { color: 'var(--primary)', bg: 'var(--primary-subtle)' };
  if (score >= 70) return { color: 'var(--warning)', bg: 'var(--warning-subtle)' };
  return { color: 'var(--danger)', bg: 'var(--danger-subtle)' };
};

export default function TeacherDashboard({ activeTab }: TeacherDashboardProps) {
  const { students, homework, markAttendance, updateGrades, createHomework, gradeAssignment, teachers } = useSchoolStore();
  const { toast } = useToast();

  const TEACHER_ID = 'T1';
  const teacher = teachers.find(t => t.id === TEACHER_ID);
  const teacherClasses = teacher?.classes || [];
  const teacherStudents = students.filter(s => teacherClasses.includes(s.classId));
  const teacherHw = homework.filter(hw => teacherClasses.includes(hw.classId));
  const pendingReview = teacherStudents.flatMap(s =>
    (s.assignments || []).filter(a => a.status === 'Submitted').map(a => ({ student: s, assignmentId: a.assignmentId }))
  ).filter(item => teacherHw.some(hw => hw.id === item.assignmentId));

  // ── Today's Schedule ────────────────────────────────────
  const todaySchedule = [
    { time: '08:30 AM', class: '10-A', subject: 'Mathematics', room: 'Room 301', done: true },
    { time: '09:30 AM', class: '10-B', subject: 'Mathematics', room: 'Room 302', done: false },
    { time: '11:45 AM', class: '9-A', subject: 'Calculus', room: 'Room 301', done: false },
    { time: '02:30 PM', class: '10-A', subject: 'Advanced Algebra', room: 'Room 301', done: false },
  ];

  // ── Attendance Module ────────────────────────────────────
  const [attClass, setAttClass] = useState('10-A');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attRecords, setAttRecords] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});

  const attStudents = React.useMemo(() => students.filter(s => s.classId === attClass), [students, attClass]);

  React.useEffect(() => {
    const records: typeof attRecords = {};
    attStudents.forEach(s => {
      const existing = (s.attendanceHistory || []).find(h => h.date === attDate);
      records[s.id] = existing?.status || 'Present';
    });
    const timer = setTimeout(() => {
      setAttRecords(records);
    }, 0);
    return () => clearTimeout(timer);
  }, [attStudents, attDate]);

  const markAll = (status: 'Present' | 'Absent' | 'Late') => {
    const rec: typeof attRecords = {};
    attStudents.forEach(s => rec[s.id] = status);
    setAttRecords(rec);
    toast({ title: 'Bulk Selection', description: `All marked as ${status}.`, variant: 'info' });
  };

  const submitAttendance = () => {
    markAttendance(attClass, attDate, Object.entries(attRecords).map(([studentId, status]) => ({ studentId, status })));
    toast({ title: 'Attendance Saved', description: `Roll call complete for ${attClass} on ${attDate}.`, variant: 'success' });
  };

  const presentCount = Object.values(attRecords).filter(v => v === 'Present').length;
  const absentCount = Object.values(attRecords).filter(v => v === 'Absent').length;
  const lateCount = Object.values(attRecords).filter(v => v === 'Late').length;

  // ── Gradebook Module ─────────────────────────────────────
  const [gradeClass, setGradeClass] = useState('10-A');
  const [gradeSubject, setGradeSubject] = useState('Mathematics');
  const [editStudent, setEditStudent] = useState<RankedStudent | null>(null);
  const [editScore, setEditScore] = useState(85);

  const gradeStudents = students.filter(s => s.classId === gradeClass);
  const rankedStudents = [...gradeStudents]
    .map(s => ({ ...s, score: s.grades[gradeSubject] ?? -1 }))
    .sort((a, b) => b.score - a.score);
  const subjectAvg = gradeStudents.reduce((a, s) => a + (s.grades[gradeSubject] ?? 0), 0) / (gradeStudents.length || 1);

  const handleSaveGrade = () => {
    if (!editStudent) return;
    updateGrades(editStudent.id, gradeSubject, editScore);
    const studentName = editStudent.name;
    setEditStudent(null);
    toast({ title: 'Grade Saved', description: `${studentName} — ${gradeSubject}: ${editScore}%`, variant: 'success' });
  };

  // ── Homework Module ──────────────────────────────────────
  const [isNewHwOpen, setIsNewHwOpen] = useState(false);
  const [gradeHwOpen, setGradeHwOpen] = useState<{ student: Student; assignmentId: string } | null>(null);
  const [gradeScore, setGradeScore] = useState(80);
  const [gradeFeedback, setGradeFeedback] = useState('');

  const [hwForm, setHwForm] = useState({
    title: '', description: '', subject: 'Mathematics',
    classId: teacherClasses[0] || '10-A', dueDate: ''
  });

  const handleCreateHw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwForm.title.trim() || !hwForm.dueDate) {
      toast({ title: 'Validation Error', description: 'Title and due date are required.', variant: 'error' }); return;
    }
    createHomework({ title: hwForm.title, description: hwForm.description, subject: hwForm.subject, classId: hwForm.classId, teacherId: TEACHER_ID, dueDate: hwForm.dueDate });
    setHwForm({ title: '', description: '', subject: 'Mathematics', classId: teacherClasses[0] || '10-A', dueDate: '' });
    setIsNewHwOpen(false);
    toast({ title: 'Assignment Created', description: 'Homework posted to student workspace calendars.', variant: 'success' });
  };

  const handleGradeSubmit = () => {
    if (!gradeHwOpen) return;
    gradeAssignment(gradeHwOpen.student.id, gradeHwOpen.assignmentId, gradeScore, gradeFeedback);
    setGradeHwOpen(null);
    setGradeScore(80); setGradeFeedback('');
    toast({ title: 'Assignment Graded', description: `Score recorded: ${gradeScore}%`, variant: 'success' });
  };

  // ── Dashboard Overview ───────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--border)] pb-3">
        <p className="text-[10px] font-bold tracking-wider uppercase text-[var(--foreground-muted)] mb-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-[1.5rem] font-extrabold tracking-tight text-[var(--foreground)] leading-none">Educator Workspace</h1>
        <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-semibold">Dr. Amit Sharma · Math Dept · Rotations: {teacherClasses.join(', ')}</p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'My Students', value: teacherStudents.length, icon: Users, accent: 'var(--primary)' },
          { label: 'Classes Scheduled', value: todaySchedule.length, icon: Clock, accent: 'var(--info)' },
          { label: 'Awaiting Grading', value: pendingReview.length, icon: FileText, accent: 'var(--warning)' },
          { label: 'Active Assignments', value: teacherHw.length, icon: BookOpen, accent: 'var(--success)' }
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="premium-card p-3.5 flex items-center gap-3 hover-lift border border-[var(--border)]">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.accent}12`, color: s.accent }}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[18px] font-extrabold tracking-tight text-[var(--foreground)] leading-none">{s.value}</div>
                <div className="text-[10px] text-[var(--foreground-muted)] mt-1 font-semibold">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-[12.5px] font-bold text-[var(--foreground)] tracking-tight">{"Today's Class Timetable"}</h2>
          <div className="premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
            <div className="divide-y divide-[var(--border-subtle)]">
              {todaySchedule.map((cls, i) => (
                <div key={i} className={`px-4 py-3 flex items-center gap-3 ${cls.done ? 'opacity-60' : 'hover:bg-[var(--primary-subtle)] transition-colors'}`}>
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cls.done ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-indigo-50 dark:bg-indigo-950/20'}`}>
                    {cls.done ? <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" /> : <Clock className="h-3.5 w-3.5 text-[var(--primary)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-[var(--foreground)]">{cls.subject}</span>
                      <span className="tag tag-indigo py-0">{cls.class}</span>
                    </div>
                    <div className="text-[10px] text-[var(--foreground-muted)] font-medium mt-0.5">{cls.room}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] font-bold text-[var(--foreground)]">{cls.time}</div>
                    {cls.done && <div className="text-[9px] text-[var(--success)] font-extrabold tracking-wide">DONE</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-[12.5px] font-bold text-[var(--foreground)] tracking-tight">Homework Submissions Awaiting Review</h2>
            {pendingReview.length > 0 && <span className="tag tag-amber font-extrabold">{pendingReview.length} Pending</span>}
          </div>
          <div className="premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
            {pendingReview.length === 0 ? (
              <div className="p-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-[var(--success)] mx-auto mb-2" />
                <p className="text-[12px] font-bold text-[var(--foreground)]">All caught up!</p>
                <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5 font-medium">No homework reviews pending.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {pendingReview.slice(0, 5).map((item, i) => {
                  const hw = teacherHw.find(h => h.id === item.assignmentId);
                  return (
                    <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-[var(--primary-subtle)] transition-colors">
                      <div className="h-7 w-7 rounded-lg bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-[11px] font-bold text-[var(--foreground-muted)]">
                        {item.student.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[var(--foreground)]">{item.student.name}</p>
                        <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5 truncate">{hw?.title || 'Assignment'} · {hw?.subject}</p>
                      </div>
                      <button
                        onClick={() => setGradeHwOpen(item)}
                        className="btn btn-primary text-[10.5px] py-1 px-2.5 flex-shrink-0 font-bold"
                      >
                        Grade
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Attendance Render ────────────────────────────────────
  const renderAttendance = () => (
    <div className="space-y-5 text-[13px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <h1 className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)]">Daily Roll Call</h1>
          <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-medium">Commit class daily rosters · Data syncs to parent communications portals</p>
        </div>
        <button onClick={submitAttendance} className="btn btn-primary text-[11.5px] font-bold">
          <ClipboardCheck className="h-3.5 w-3.5" /> Submit Roll Call
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2.5">
        <div className="flex-1 min-w-[150px]">
          <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] block mb-1">Class Section</label>
          <Select value={attClass} onChange={setAttClass} options={teacherClasses.map(c => ({ value: c, label: `Grade ${c}` }))} />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] block mb-1">Session Date</label>
          <input type="date" className="form-input font-medium" value={attDate} onChange={e => setAttDate(e.target.value)} />
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Present', count: presentCount, color: 'var(--success)' },
          { label: 'Absent', count: absentCount, color: 'var(--danger)' },
          { label: 'Late Arrival', count: lateCount, color: 'var(--warning)' }
        ].map(s => (
          <div key={s.label} className="premium-card p-3 text-center border border-[var(--border)] bg-[var(--surface)]" style={{ borderColor: `${s.color}20` }}>
            <div className="text-[20px] font-extrabold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-[10px] font-bold text-[var(--foreground-muted)] mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--foreground-muted)]">
        <span>Mark Class Roster:</span>
        {(['Present', 'Absent', 'Late'] as const).map(s => (
          <button
            key={s}
            onClick={() => markAll(s)}
            className={`btn text-[10.5px] py-1 px-2.5 ${s === 'Present' ? 'btn-ghost' : s === 'Absent' ? 'btn-danger' : 'btn-ghost'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Student list */}
      <div className="premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
        {attStudents.length === 0 ? (
          <div className="p-8 text-center text-[12px] text-[var(--foreground-muted)] font-medium">No student rosters loaded for {attClass}.</div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {attStudents.map(s => {
              const status = attRecords[s.id] || 'Present';
              return (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[var(--primary-subtle)] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center font-bold text-[11px] text-[var(--foreground-muted)]">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[12.5px] font-bold text-[var(--foreground)]">{s.name}</p>
                      <p className="text-[10px] text-[var(--foreground-muted)] font-mono mt-0.5">{s.rollNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {(['Present', 'Late', 'Absent'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAttRecords(p => ({ ...p, [s.id]: opt }))}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                          status === opt
                            ? opt === 'Present' ? 'bg-[var(--success)] text-white border-[var(--success)] shadow-sm'
                            : opt === 'Absent' ? 'bg-[var(--danger)] text-white border-[var(--danger)] shadow-sm'
                            : 'bg-[var(--warning)] text-white border-[var(--warning)] shadow-sm'
                            : 'bg-[var(--secondary)] text-[var(--foreground-muted)] border-[var(--border)]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ── Gradebook Render ─────────────────────────────────────
  const renderGradebook = () => (
    <div className="space-y-5 text-[13px]">
      <div className="border-b border-[var(--border)] pb-3">
        <h1 className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)]">Gradebook Registry</h1>
        <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-medium">Record marks ledger. Current Class average: <span className="font-bold text-[var(--primary)]">{subjectAvg.toFixed(1)}%</span></p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <div className="flex-1 min-w-[150px]">
          <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] block mb-1">Class Section</label>
          <Select value={gradeClass} onChange={setGradeClass} options={teacherClasses.map(c => ({ value: c, label: `Grade ${c}` }))} />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] block mb-1">Subject</label>
          <Select value={gradeSubject} onChange={setGradeSubject} options={['Mathematics', 'Calculus', 'Advanced Algebra'].map(s => ({ value: s, label: s }))} />
        </div>
      </div>

      <div className="premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--secondary)] flex items-center justify-between text-[11px] font-bold text-[var(--foreground-muted)]">
          <span>{gradeStudents.length} Registered Students</span>
          <div className="flex items-center gap-2.5">
            <span className="tag tag-green">High: {rankedStudents[0]?.score ?? 'N/A'}%</span>
            <span className="tag tag-red">Low: {rankedStudents[rankedStudents.length - 1]?.score ?? 'N/A'}%</span>
          </div>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {rankedStudents.map((s, rank) => {
            const gc = GRADE_COLOR(s.score);
            const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null;
            return (
              <div key={s.id} className="px-4 py-3 flex items-center gap-4 hover:bg-[var(--primary-subtle)] transition-colors">
                <span className="text-[12px] w-5 text-center font-bold text-[var(--foreground-muted)]">{medal || `#${rank + 1}`}</span>
                <div className="h-7 w-7 rounded-lg bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center font-bold text-[11px] text-[var(--foreground-muted)]">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold text-[var(--foreground)]">{s.name}</p>
                  <p className="text-[10px] text-[var(--foreground-muted)] font-mono mt-0.5">{s.rollNo}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 hidden sm:block">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${s.score > 0 ? s.score : 0}%`, background: gc.color }} />
                    </div>
                  </div>
                  <div
                    className="px-2 py-0.5 rounded text-[11px] font-bold min-w-[40px] text-center"
                    style={{ color: gc.color, background: gc.bg }}
                  >
                    {s.score > 0 ? `${s.score}%` : '—'}
                  </div>
                  <button
                    onClick={() => { setEditStudent(s); setEditScore(s.score > 0 ? s.score : 80); }}
                    className="btn btn-ghost text-[10.5px] py-1 px-2 hover-lift"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Homework Render ──────────────────────────────────────
  const renderHomework = () => (
    <div className="space-y-5 text-[13px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <h1 className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)]">Homework Manager</h1>
          <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-medium">{teacherHw.length} assignments active · {pendingReview.length} submissions awaiting score check</p>
        </div>
        <button onClick={() => setIsNewHwOpen(true)} className="btn btn-primary text-[11.5px] font-bold">
          <Plus className="h-3.5 w-3.5" /> Post Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teacherHw.map(hw => {
          const dueDate = new Date(hw.dueDate);
          const isOverdue = dueDate < new Date();
          return (
            <div key={hw.id} className="premium-card p-4 border border-[var(--border)] bg-[var(--surface)] hover-lift flex flex-col justify-between min-h-[150px]">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-[13px] font-bold text-[var(--foreground)] leading-snug">{hw.title}</h3>
                    <p className="text-[10px] text-[var(--foreground-muted)] font-semibold mt-0.5">{hw.subject} · Grade {hw.classId}</p>
                  </div>
                  <span className={isOverdue ? 'tag tag-red flex-shrink-0' : 'tag tag-indigo flex-shrink-0'}>
                    {isOverdue ? 'Overdue' : 'Active'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed line-clamp-2">{hw.description}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--border)] grid grid-cols-3 gap-2 text-center text-[10.5px]">
                <div>
                  <div className="font-extrabold text-[var(--foreground)]">{hw.submissionsCount}</div>
                  <div className="text-[8.5px] text-[var(--foreground-subtle)] uppercase tracking-wider font-semibold">Submitted</div>
                </div>
                <div>
                  <div className="font-extrabold text-[var(--foreground)]">{hw.gradedCount}</div>
                  <div className="text-[8.5px] text-[var(--foreground-subtle)] uppercase tracking-wider font-semibold">Graded</div>
                </div>
                <div>
                  <div className="font-bold text-[var(--foreground)] truncate">{hw.dueDate}</div>
                  <div className="text-[8.5px] text-[var(--foreground-subtle)] uppercase tracking-wider font-semibold">Due</div>
                </div>
              </div>
            </div>
          );
        })}
        {teacherHw.length === 0 && (
          <div className="col-span-full premium-card p-10 text-center border border-[var(--border)] bg-[var(--surface)]">
            <BookOpen className="h-8 w-8 text-[var(--foreground-subtle)] mx-auto mb-2" />
            <p className="text-[12px] text-[var(--foreground-muted)] font-medium">No homework assignments scheduled.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {activeTab === 'Dashboard' && renderDashboard()}
      {activeTab === 'Mark Attendance' && renderAttendance()}
      {activeTab === 'Gradebook' && renderGradebook()}
      {activeTab === 'Homework' && renderHomework()}

      {/* Grade Edit Modal */}
      <Dialog
        isOpen={!!editStudent}
        onClose={() => setEditStudent(null)}
        title={`Edit Mark Ledger — ${editStudent?.name}`}
        description={`${gradeSubject} · Class ${gradeClass} · Previous: ${editStudent && editStudent.score > 0 ? `${editStudent.score}%` : 'Not graded'}`}
        footer={
          <div className="flex justify-end gap-1.5 text-[12px]">
            <button className="btn btn-ghost" onClick={() => setEditStudent(null)}>Cancel</button>
            <button className="btn btn-primary font-bold" onClick={handleSaveGrade}>Save Grade</button>
          </div>
        }
      >
        <div className="space-y-4 text-[12.5px]">
          <div>
            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Percentage Score (0–100)</label>
            <input
              type="number" min={0} max={100}
              className="form-input text-center text-[18px] font-bold border border-[var(--border)]"
              value={editScore}
              onChange={e => setEditScore(Math.min(100, Math.max(0, Number(e.target.value))))}
            />
          </div>
          <div className="progress-bar h-1.5">
            <div className="progress-fill" style={{ width: `${editScore}%`, background: GRADE_COLOR(editScore).color }} />
          </div>
          <p className="text-[11.5px] text-center font-semibold text-[var(--foreground-muted)]">
            Performance Index: <strong style={{ color: GRADE_COLOR(editScore).color }}>
              {editScore >= 90 ? 'Excellent' : editScore >= 80 ? 'Proficient' : editScore >= 70 ? 'Satisfactory' : 'Below Standards'}
            </strong>
          </p>
        </div>
      </Dialog>

      {/* New Homework Modal */}
      <Dialog
        isOpen={isNewHwOpen}
        onClose={() => setIsNewHwOpen(false)}
        title="Schedule Homework Assignment"
        description="Assignment posts to student workspaces and parent logs instantly."
        footer={
          <div className="flex justify-end gap-1.5 text-[12px]">
            <button className="btn btn-ghost" onClick={() => setIsNewHwOpen(false)}>Cancel</button>
            <button className="btn btn-primary font-bold" onClick={handleCreateHw}>Publish Homework</button>
          </div>
        }
      >
        <form onSubmit={handleCreateHw} className="space-y-3.5 text-[12.5px]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Subject</label>
              <Select value={hwForm.subject} onChange={v => setHwForm({ ...hwForm, subject: v })} options={['Mathematics', 'Calculus', 'Advanced Algebra'].map(s => ({ value: s, label: s }))} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Class Section</label>
              <Select value={hwForm.classId} onChange={v => setHwForm({ ...hwForm, classId: v })} options={teacherClasses.map(c => ({ value: c, label: `Grade ${c}` }))} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Assignment Title</label>
            <input type="text" placeholder="e.g. Limits and Continuity Practice Sheet" className="form-input font-semibold" value={hwForm.title} onChange={e => setHwForm({ ...hwForm, title: e.target.value })} required />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Instructions / description</label>
            <textarea rows={3} placeholder="Provide instructions, reading links, or submission formats..." className="form-input resize-none" value={hwForm.description} onChange={e => setHwForm({ ...hwForm, description: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Due Date</label>
            <input type="date" className="form-input font-medium" value={hwForm.dueDate} onChange={e => setHwForm({ ...hwForm, dueDate: e.target.value })} required />
          </div>
        </form>
      </Dialog>

      {/* Grade Submission Modal */}
      <Dialog
        isOpen={!!gradeHwOpen}
        onClose={() => setGradeHwOpen(null)}
        title={`Grade Homework submission — ${gradeHwOpen?.student?.name}`}
        description={`${teacherHw.find(h => h.id === gradeHwOpen?.assignmentId)?.title || 'Assignment'}`}
        footer={
          <div className="flex justify-end gap-1.5 text-[12px]">
            <button className="btn btn-ghost" onClick={() => setGradeHwOpen(null)}>Cancel</button>
            <button className="btn btn-primary font-bold" onClick={handleGradeSubmit}>Submit Grade</button>
          </div>
        }
      >
        <div className="space-y-4 text-[12.5px]">
          <div>
            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Score percentage (0–100)</label>
            <input type="number" min={0} max={100} className="form-input text-center text-[18px] font-bold" value={gradeScore} onChange={e => setGradeScore(Math.min(100, Math.max(0, Number(e.target.value))))} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Constructive feedback</label>
            <textarea rows={3} placeholder="Great structural flow; please focus on integrating methods in problem 3..." className="form-input resize-none" value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
