'use client';

import React from 'react';
import { useSchoolStore } from '@/store/useSchoolStore';
import { useToast } from '@/components/ui/Toast';
import {
  CheckCircle2, FileText, UserCheck, TrendingUp,
  BookOpen, Award, Clock, MapPin, Download,
  Star, Target
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  LineChart, Line
} from 'recharts';

interface StudentDashboardProps { activeTab: string; }

export default function StudentDashboard({ activeTab }: StudentDashboardProps) {
  const { students, homework, selectedStudentId, submitAssignment } = useSchoolStore();
  const { toast } = useToast();

  const student = students.find(s => s.id === selectedStudentId) || students[0];
  const studentAssignments = student.assignments || [];
  const classHomework = homework.filter(hw => hw.classId === student.classId);

  const pendingHw = classHomework.filter(chw => {
    const rec = studentAssignments.find(sa => sa.assignmentId === chw.id);
    return !rec || rec.status === 'Pending';
  });

  const submittedHw = classHomework.filter(chw => {
    const rec = studentAssignments.find(sa => sa.assignmentId === chw.id);
    return rec && (rec.status === 'Submitted' || rec.status === 'Graded');
  });

  const gradedHw = classHomework.filter(chw => {
    const rec = studentAssignments.find(sa => sa.assignmentId === chw.id);
    return rec && rec.status === 'Graded';
  });

  // Grades / Performance data
  const subjectData = Object.entries(student.grades).map(([subject, score]) => ({
    subject: subject.split(' ')[0],
    score,
    avg: subject === 'Mathematics' ? 82 : subject === 'Physics' ? 80 : subject === 'Chemistry' ? 79 : 83
  }));

  const progressData = [
    { wk: 'W1', score: student.id === 'S3' ? 52 : student.id === 'S7' ? 68 : 88 },
    { wk: 'W2', score: student.id === 'S3' ? 50 : student.id === 'S7' ? 71 : 90 },
    { wk: 'W3', score: student.id === 'S3' ? 58 : student.id === 'S7' ? 70 : 94 },
    { wk: 'W4', score: student.id === 'S3' ? 55 : student.id === 'S7' ? 69 : 92 },
    { wk: 'W5', score: student.id === 'S3' ? 60 : student.id === 'S7' ? 74 : 95 },
  ];

  // Compute overall average
  const grades = Object.values(student.grades);
  const overallAvg = grades.length > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : 0;

  // Achievement badges
  const badges: { name: string; desc: string; icon: React.ElementType; color: string }[] = [];
  if (student.grades['Mathematics'] >= 90) badges.push({ name: 'Math Champion', desc: '90%+ in Mathematics', icon: Star, color: '#d97706' });
  if (student.attendanceRate >= 96) badges.push({ name: 'Perfect Attendance', desc: '96%+ presence rate', icon: UserCheck, color: '#059669' });
  if (student.grades['English Literature'] >= 90) badges.push({ name: 'Creative Laureate', desc: '90%+ in English', icon: Award, color: '#7c3aed' });
  if (badges.length === 0) badges.push({ name: 'Rising Star', desc: 'Consistent progress recorded', icon: TrendingUp, color: '#0284c7' });

  // Today's schedule
  const schedule = [
    { time: '08:30', subject: 'Mathematics', teacher: 'Dr. Amit Sharma', room: 'Room 301' },
    { time: '09:30', subject: 'Physics', teacher: 'Prof. Priya Patel', room: 'Room 202' },
    { time: '10:45', subject: 'English Literature', teacher: 'Ms. Ananya Iyer', room: 'Room 104' },
    { time: '11:45', subject: 'Chemistry', teacher: 'Prof. Priya Patel', room: 'Lab 1' },
    { time: '13:30', subject: 'World History', teacher: 'Mr. Rajesh Kumar', room: 'Room 106' },
    { time: '14:30', subject: 'Physical Education', teacher: 'Mr. Arjun Singh', room: 'Ground' },
  ];

  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();

  const handleSubmitAssignment = (assignmentId: string, title: string) => {
    submitAssignment(student.id, assignmentId);
    toast({ title: 'Assignment Submitted', description: `"${title}" submitted successfully.`, variant: 'success' });
  };

  return (
    <div className="space-y-5 animate-fade-in text-[13px]">

      {/* ── DASHBOARD TAB ──────────────────────────────── */}
      {activeTab === 'Dashboard' && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div>
              <p className="text-[10px] font-bold tracking-wider uppercase text-[var(--foreground-muted)] mb-1">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 className="text-[1.5rem] font-extrabold tracking-tight text-[var(--foreground)] leading-none">
                Welcome back, {student.name.split(' ')[0]}
              </h1>
              <p className="text-[11.5px] text-[var(--foreground-muted)] mt-1.5 font-semibold">Grade {student.classId} · Roll No. {student.rollNo}</p>
            </div>
            {student.riskStatus !== 'Low' && (
              <div
                className="px-3.5 py-2 rounded-lg border flex items-center gap-2.5 bg-rose-50/20 dark:bg-rose-950/20"
                style={{ borderColor: student.riskStatus === 'High' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)' }}
              >
                <Target className="h-4 w-4 flex-shrink-0" style={{ color: student.riskStatus === 'High' ? 'var(--danger)' : 'var(--warning)' }} />
                <div>
                  <p className="text-[11px] font-bold" style={{ color: student.riskStatus === 'High' ? 'var(--danger)' : 'var(--warning)' }}>
                    {student.riskStatus === 'High' ? 'Academic Watch' : 'Performance Alert'}
                  </p>
                  <p className="text-[10px] text-[var(--foreground-muted)] font-medium mt-0.5">{student.riskReason}</p>
                </div>
              </div>
            )}
          </div>

          {/* Key Metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Overall Score', value: `${overallAvg}%`, accent: overallAvg >= 85 ? 'var(--success)' : 'var(--warning)', icon: TrendingUp },
              { label: 'Attendance Rate', value: `${student.attendanceRate}%`, accent: student.attendanceRate >= 90 ? 'var(--success)' : 'var(--warning)', icon: UserCheck },
              { label: 'Pending Homework', value: pendingHw.length, accent: 'var(--primary)', icon: BookOpen },
              { label: 'Academic Badges', value: badges.length, accent: 'var(--warning)', icon: Award }
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="premium-card p-3.5 flex items-center gap-3 hover-lift border border-[var(--border)]">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.accent}12`, color: s.accent }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[18px] font-extrabold tracking-tight leading-none" style={{ color: s.accent }}>{s.value}</div>
                    <div className="text-[10px] text-[var(--foreground-muted)] font-semibold mt-1">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Today's Schedule */}
            <div className="space-y-2.5">
              <h2 className="text-[12.5px] font-bold text-[var(--foreground)] tracking-tight">{"Today's Class Schedule"}</h2>
              <div className="premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
                <div className="divide-y divide-[var(--border-subtle)]">
                  {schedule.map((cls, i) => {
                    const [h, m] = cls.time.split(':').map(Number);
                    const isPast = h < currentHour || (h === currentHour && m <= currentMinute);
                    const isCurrent = h === currentHour || (h < currentHour + 1 && h >= currentHour);
                    return (
                      <div key={i} className={`px-3.5 py-2.5 flex items-center gap-3 ${isPast ? 'opacity-50' : isCurrent ? 'bg-[var(--primary-subtle)]' : ''}`}>
                        <span className="text-[10px] font-mono font-bold text-[var(--foreground-muted)] w-10 flex-shrink-0">{cls.time}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-[var(--foreground)] truncate">{cls.subject}</p>
                          <p className="text-[9.5px] text-[var(--foreground-muted)] truncate mt-0.5">{cls.teacher} · {cls.room}</p>
                        </div>
                        {isPast && <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)] flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Achievements & Performance Visuals */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <h2 className="text-[12.5px] font-bold text-[var(--foreground)] tracking-tight">Academic Achievements</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {badges.map((badge, i) => {
                    const Icon = badge.icon;
                    return (
                      <div key={i} className="premium-card p-3 text-center border border-[var(--border)] bg-[var(--surface)]" style={{ borderColor: `${badge.color}25` }}>
                        <div className="h-8 w-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${badge.color}12`, color: badge.color }}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-[11px] font-bold text-[var(--foreground)] leading-snug">{badge.name}</p>
                        <p className="text-[9px] text-[var(--foreground-muted)] font-medium mt-0.5">{badge.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subject Performance Grid */}
              <div className="premium-card p-4 border border-[var(--border)] bg-[var(--surface)]">
                <h3 className="text-[12px] font-bold text-[var(--foreground)] mb-3">Subject Performance Analysis</h3>
                <div style={{ height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData} margin={{ top: 2, right: 2, left: -28, bottom: 0 }} barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="subject" tick={{ fontSize: 9, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                      <YAxis domain={[50, 100]} tick={{ fontSize: 9, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} formatter={(v) => [`${v as number | string}%`, 'Score']} />
                      <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                        {subjectData.map((e, i) => <Cell key={i} fill={e.score >= 85 ? 'var(--primary)' : e.score >= 70 ? 'var(--warning)' : 'var(--danger)'} fillOpacity={0.8} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGNMENTS TAB ────────────────────────────── */}
      {activeTab === 'Assignments' && (
        <div className="space-y-5">
          <div className="border-b border-[var(--border)] pb-3">
            <h1 className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)]">Pending Homework</h1>
            <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-medium">{pendingHw.length} assignments outstanding · {submittedHw.length} submitted for grading</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Awaiting Submission', count: pendingHw.length, color: 'var(--warning)' },
              { label: 'Awaiting Grading', count: submittedHw.length - gradedHw.length, color: 'var(--primary)' },
              { label: 'Completed & Graded', count: gradedHw.length, color: 'var(--success)' }
            ].map(s => (
              <div key={s.label} className="premium-card p-3 text-center border border-[var(--border)]">
                <div className="text-[18px] font-extrabold" style={{ color: s.color }}>{s.count}</div>
                <div className="text-[9.5px] font-bold text-[var(--foreground-muted)] mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
            <div className="divide-y divide-[var(--border-subtle)]">
              {classHomework.map(hw => {
                const rec = studentAssignments.find(sa => sa.assignmentId === hw.id);
                const status = rec?.status || 'Pending';
                const isPending = status === 'Pending';
                const dueDate = new Date(hw.dueDate);
                const isOverdue = dueDate < new Date() && isPending;
                return (
                  <div key={hw.id} className="p-4 flex items-start gap-4 hover:bg-[var(--primary-subtle)] transition-colors">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${status === 'Graded' ? 'bg-emerald-50 dark:bg-emerald-950/20' : status === 'Submitted' ? 'bg-indigo-50 dark:bg-indigo-950/20' : isOverdue ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-amber-50 dark:bg-amber-950/20'}`}>
                      {status === 'Graded' ? <CheckCircle2 className="h-4 w-4 text-[var(--success)]" /> :
                       status === 'Submitted' ? <Clock className="h-4 w-4 text-[var(--primary)]" /> :
                       isOverdue ? <FileText className="h-4 w-4 text-[var(--danger)]" /> :
                       <BookOpen className="h-4 w-4 text-[var(--warning)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-[13px] font-bold text-[var(--foreground)]">{hw.title}</p>
                          <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">{hw.subject} · Due Date: {hw.dueDate}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 text-[10.5px]">
                          {rec?.score !== undefined && <span className="tag tag-indigo font-bold">{rec.score}%</span>}
                          <span className={`tag ${status === 'Graded' ? 'tag-green' : status === 'Submitted' ? 'tag-blue' : isOverdue ? 'tag-red' : 'tag-amber'}`}>
                            {isOverdue ? 'Overdue' : status}
                          </span>
                        </div>
                      </div>
                      {rec?.feedback && (
                        <p className="text-[11px] text-[var(--foreground-muted)] mt-2 italic px-3 py-1.5 rounded-md bg-[var(--primary-subtle)] border border-[var(--primary-muted)]">
                          {`"${rec.feedback}"`}
                        </p>
                      )}
                      {hw.description && (
                        <p className="text-[11px] text-[var(--foreground-muted)] mt-1.5 leading-relaxed line-clamp-2">{hw.description}</p>
                      )}
                      {isPending && (
                        <button
                          onClick={() => handleSubmitAssignment(hw.id, hw.title)}
                          className="btn btn-primary text-[10.5px] py-1 px-2.5 mt-2.5"
                        >
                          Submit Work
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {classHomework.length === 0 && (
                <div className="p-10 text-center">
                  <BookOpen className="h-8 w-8 text-[var(--foreground-subtle)] mx-auto mb-2" />
                  <p className="text-[12px] text-[var(--foreground-muted)] font-medium">No homework assignments scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PROGRESS TAB ───────────────────────────────── */}
      {activeTab === 'Progress Report' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h1 className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)]">Progress Report</h1>
              <p className="text-[12px] text-[var(--foreground-muted)] mt-0.5 font-medium">Term 1 Performance Analysis Ledger</p>
            </div>
            <button className="btn btn-ghost text-[11px] py-1.5 px-3" onClick={() => toast({ title: 'Exporting PDF', description: 'Academic ledger compiled and exported.', variant: 'success' })}>
              <Download className="h-3.5 w-3.5 text-[var(--foreground-muted)]" /> Export PDF
            </button>
          </div>

          {/* Overview Metric Row */}
          <div className="premium-card p-4 border border-[var(--border)] bg-[var(--surface)]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
              {[
                { label: 'Overall Average', value: `${overallAvg}%`, color: overallAvg >= 85 ? 'var(--success)' : 'var(--warning)' },
                { label: 'Attendance Rate', value: `${student.attendanceRate}%`, color: student.attendanceRate >= 90 ? 'var(--success)' : 'var(--warning)' },
                { label: 'Homework Completed', value: `${submittedHw.length}/${classHomework.length}`, color: 'var(--primary)' },
                { label: 'Section Rank', value: student.id === 'S1' ? '2nd' : student.id === 'S3' ? '18th' : '12th', color: 'var(--foreground)' }
              ].map((m, i) => (
                <div key={i} className="px-3 text-center first:pl-0 last:pr-0">
                  <div className="text-[20px] font-extrabold" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-[10px] font-bold text-[var(--foreground-muted)] mt-1 uppercase tracking-wider">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Detailed Subject Scores */}
            <div className="premium-card p-4.5 border border-[var(--border)] bg-[var(--surface)] space-y-3.5">
              <h2 className="text-[12.5px] font-bold text-[var(--foreground)] tracking-tight">Subject-wise Marks breakdown</h2>
              <div className="space-y-3">
                {Object.entries(student.grades).map(([subj, score]) => (
                  <div key={subj}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-bold text-[var(--foreground)]">{subj}</span>
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="text-[10.5px] text-[var(--foreground-muted)] font-medium">Avg: 82%</span>
                        <span className="text-[12px] font-extrabold text-[var(--foreground)]">{score}%</span>
                      </div>
                    </div>
                    <div className="progress-bar h-1.5">
                      <div className="progress-fill" style={{ width: `${score}%`, background: (score as number) >= 85 ? 'var(--success)' : (score as number) >= 70 ? 'var(--primary)' : 'var(--warning)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score trend chart */}
            <div className="premium-card p-4.5 border border-[var(--border)] bg-[var(--surface)]">
              <h2 className="text-[12.5px] font-bold text-[var(--foreground)] tracking-tight mb-3">Weekly Academic Progression</h2>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData} margin={{ top: 2, right: 2, left: -28, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="wk" tick={{ fontSize: 9.5, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[40, 100]} tick={{ fontSize: 9.5, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} formatter={(v) => [`${v as number | string}%`, 'Score']} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEDULE TAB ───────────────────────────────── */}
      {activeTab === 'Schedules' && (
        <div className="space-y-5">
          <div className="border-b border-[var(--border)] pb-3">
            <h1 className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)]">Class Schedules</h1>
            <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-medium">Grade {student.classId} · Room allocation and timetables</p>
          </div>

          <div className="premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
            <div className="divide-y divide-[var(--border-subtle)]">
              {schedule.map((cls, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-4 hover:bg-[var(--primary-subtle)] transition-colors">
                  <div className="w-12 text-center flex-shrink-0">
                    <div className="text-[13px] font-bold font-mono text-[var(--foreground)]">{cls.time}</div>
                    <div className="text-[8.5px] font-bold text-[var(--foreground-subtle)] uppercase mt-0.5">AM</div>
                  </div>
                  <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ background: i % 4 === 0 ? 'var(--primary)' : i % 4 === 1 ? 'var(--success)' : i % 4 === 2 ? 'var(--warning)' : 'var(--info)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-bold text-[var(--foreground)]">{cls.subject}</p>
                    <p className="text-[11px] text-[var(--foreground-muted)] font-medium mt-0.5">{cls.teacher}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 text-[11px] text-[var(--foreground-muted)] font-mono font-medium">
                    <MapPin className="h-3.5 w-3.5 text-[var(--foreground-subtle)]" />
                    <span>{cls.room}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
