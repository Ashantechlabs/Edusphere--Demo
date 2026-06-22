'use client';

import React, { useState } from 'react';
import { useSchoolStore } from '@/store/useSchoolStore';
import { useToast } from '@/components/ui/Toast';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import {
  Search, Plus, Mail, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import { Student } from '@/utils/mockData';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface AdminDashboardProps { activeTab: string; }

const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': '#6366f1',
  'Physics': '#0ea5e9',
  'Chemistry': '#8b5cf6',
  'English Language': '#10b981',
  'English Literature': '#10b981',
  'World History': '#f59e0b',
  'Geography': '#ec4899',
};

export default function AdminDashboard({ activeTab }: AdminDashboardProps) {
  const { students, teachers, classes, timetable, addStudent, updateTimetable } = useSchoolStore();
  const { toast } = useToast();

  // ── Student Module ──────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const PER_PAGE = 8; // More items per page for visual density

  const [newForm, setNewForm] = useState({
    name: '', classId: '10-A', gender: 'Male' as 'Male' | 'Female',
    email: '', parentName: '', parentEmail: '', parentPhone: '', grades: {}
  });

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q)) &&
      (filterClass === 'All' || s.classId === filterClass);
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim() || !newForm.parentName.trim()) {
      toast({ title: 'Validation Error', description: 'Name and parent name are required.', variant: 'error' }); return;
    }
    addStudent({
      ...newForm,
      avatar: `https://images.unsplash.com/photo-${newForm.gender === 'Male' ? '1539571696357-5a69c17a67c6' : '1544005313-94ddf0286df2'}?w=150`,
      grades: { Mathematics: 78, Physics: 75, Chemistry: 72, 'English Literature': 80, 'World History': 77 }
    });
    setIsAddOpen(false);
    setNewForm({ name: '', classId: '10-A', gender: 'Male', email: '', parentName: '', parentEmail: '', parentPhone: '', grades: {} });
    toast({ title: 'Student Enrolled', description: 'Profile recorded in system ledgers.', variant: 'success' });
  };

  // ── Teacher Module ──────────────────────────────────────
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherDept, setTeacherDept] = useState('All');
  const filteredTeachers = teachers.filter(t =>
    (t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || t.email.toLowerCase().includes(teacherSearch.toLowerCase())) &&
    (teacherDept === 'All' || t.department === teacherDept)
  );

  // ── Timetable Module ────────────────────────────────────
  const [ttClass, setTtClass] = useState('10-A');
  const [isAllocOpen, setIsAllocOpen] = useState(false);
  const [allocForm, setAllocForm] = useState({
    day: 'Monday' as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday',
    period: 1, subject: 'Mathematics', teacherId: 'T1', room: 'Room 301'
  });
  const [mobileDay, setMobileDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
  const PERIODS = [1, 2, 3, 4, 5, 6];
  const PERIOD_TIMES = ['08:30–09:30', '09:30–10:30', '10:45–11:45', '11:45–12:45', '13:30–14:30', '14:30–15:30'];

  const getCell = (day: string, period: number) =>
    timetable.find(e => e.classId === ttClass && e.day === day && e.period === period);

  const handleCellClick = (day: typeof DAYS[number], period: number) => {
    const existing = getCell(day, period);
    setAllocForm({ day, period, subject: existing?.subject || 'Mathematics', teacherId: existing?.teacherId || 'T1', room: existing?.room || 'Room 301' });
    setIsAllocOpen(true);
  };

  const handleAllocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTimetable({ classId: ttClass, ...allocForm });
    setIsAllocOpen(false);
    toast({ title: 'Timetable Saved', description: `Class ${ttClass} — P${allocForm.period} scheduled.`, variant: 'success' });
  };

  // ── Attendance Overview ─────────────────────────────────
  const classAttendance = classes.map(cls => {
    const clsStudents = students.filter(s => s.classId === cls.id);
    const avg = clsStudents.reduce((a, s) => a + s.attendanceRate, 0) / (clsStudents.length || 1);
    return { name: cls.id, avg: parseFloat(avg.toFixed(1)), count: clsStudents.length };
  });
  const lowAttendance = students.filter(s => s.attendanceRate < 75);

  return (
    <div className="space-y-5 animate-fade-in text-[13px]">

      {/* ── STUDENTS TAB ─────────────────────────────────── */}
      {activeTab === 'Students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border)] pb-3">
            <div>
              <h1 className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)] leading-none">Student Registry</h1>
              <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-medium">{students.length} students enrolled · {students.filter(s => s.feeStatus === 'Pending').length} pending fee collections</p>
            </div>
            <button onClick={() => setIsAddOpen(true)} className="btn btn-primary text-[11.5px] font-bold">
              <Plus className="h-3.5 w-3.5" /> Enroll Student
            </button>
          </div>

          {/* Search Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--foreground-subtle)]" />
              <input
                type="text"
                placeholder="Search name or roll number..."
                className="form-input pl-8.5 font-medium"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="w-full sm:w-44 flex-shrink-0">
              <Select
                value={filterClass}
                onChange={v => { setFilterClass(v); setPage(1); }}
                options={[{ value: 'All', label: 'All Classes' }, ...classes.map(c => ({ value: c.id, label: c.name }))]}
              />
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
            <div className="hidden md:block overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Class</th>
                    <th>Parent / Contact</th>
                    <th>Presence Index</th>
                    <th>Fee Status</th>
                    <th>Academic Risk</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-[12px] text-[var(--foreground-muted)] font-medium">No results found.</td></tr>
                  ) : paginated.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center font-bold text-[11px] text-[var(--foreground-muted)] flex-shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--foreground)]">{s.name}</div>
                            <div className="text-[10px] text-[var(--foreground-muted)] font-mono">{s.rollNo}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="tag tag-indigo font-bold">{s.classId}</span></td>
                      <td>
                        <div className="font-bold text-[var(--foreground)] text-[12px]">{s.parentName}</div>
                        <div className="text-[10px] text-[var(--foreground-muted)] font-mono">{s.parentPhone}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="progress-bar w-12">
                            <div className="progress-fill" style={{ width: `${s.attendanceRate}%`, background: s.attendanceRate >= 85 ? 'var(--success)' : s.attendanceRate >= 75 ? 'var(--warning)' : 'var(--danger)' }} />
                          </div>
                          <span className="text-[11.5px] font-bold text-[var(--foreground)]">{s.attendanceRate}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={s.feeStatus === 'Paid' ? 'tag tag-green' : 'tag tag-amber'}>
                          {s.feeStatus === 'Paid' ? 'Paid' : `₹${(s.feeDue/1000).toFixed(0)}k`}
                        </span>
                      </td>
                      <td>
                        <span className={s.riskStatus === 'High' ? 'risk-high' : s.riskStatus === 'Medium' ? 'risk-medium' : 'risk-low'}>
                          {s.riskStatus}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => setProfileStudent(s)} className="btn btn-ghost text-[10.5px] py-1 px-2">Profile</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="block md:hidden divide-y divide-[var(--border-subtle)]">
              {paginated.length === 0 ? (
                <div className="p-8 text-center text-[12px] text-[var(--foreground-muted)] font-medium">No results found.</div>
              ) : paginated.map(s => (
                <div key={s.id} className="p-3.5 space-y-3 bg-[var(--surface)] text-[12.5px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center font-bold text-[11px] text-[var(--foreground-muted)]">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[var(--foreground)]">{s.name}</div>
                        <div className="text-[10px] text-[var(--foreground-muted)] font-mono">{s.rollNo} · Grade {s.classId}</div>
                      </div>
                    </div>
                    <span className={s.riskStatus === 'High' ? 'risk-high' : s.riskStatus === 'Medium' ? 'risk-medium' : 'risk-low'}>{s.riskStatus}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
                    <div>
                      <p className="text-[8.5px] font-bold uppercase tracking-wider text-[var(--foreground-subtle)]">Parent</p>
                      <p className="font-bold text-[var(--foreground)]">{s.parentName}</p>
                      <p className="font-mono text-[var(--foreground-muted)] mt-0.5">{s.parentPhone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8.5px] font-bold uppercase tracking-wider text-[var(--foreground-subtle)]">Attendance</p>
                      <p className="font-extrabold text-[var(--foreground)]">{s.attendanceRate}%</p>
                    </div>
                  </div>
                  <button onClick={() => setProfileStudent(s)} className="btn btn-ghost text-[10.5px] py-1 w-full">View Ledger Profile</button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)] bg-[var(--secondary)]">
                <span className="text-[11px] text-[var(--foreground-muted)] font-medium">
                  {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} students
                </span>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="btn btn-ghost py-1 px-2 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-bold text-[var(--foreground)]">{page} / {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="btn btn-ghost py-1 px-2 disabled:opacity-40"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TEACHERS TAB ─────────────────────────────────── */}
      {activeTab === 'Teachers' && (
        <div className="space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h1 className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)] leading-none">Faculty Registry</h1>
            <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-medium">{teachers.length} educators active · {[...new Set(teachers.map(t => t.department))].length} academic departments</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--foreground-subtle)]" />
              <input
                type="text"
                placeholder="Search teacher name or email..."
                className="form-input pl-8.5 font-medium"
                value={teacherSearch}
                onChange={e => setTeacherSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-52 flex-shrink-0">
              <Select
                value={teacherDept}
                onChange={setTeacherDept}
                options={[
                  { value: 'All', label: 'All Departments' },
                  { value: 'Mathematics', label: 'Mathematics' },
                  { value: 'Science', label: 'Science' },
                  { value: 'English Literature', label: 'English Literature' },
                  { value: 'History & Social Sciences', label: 'History & Social Sciences' }
                ]}
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map(t => (
              <div key={t.id} className="premium-card p-4 border border-[var(--border)] bg-[var(--surface)] hover-lift flex flex-col justify-between" style={{ minHeight: 140 }}>
                <div>
                  <div className="flex items-start gap-3">
                    <div className="h-8.5 w-8.5 rounded-lg bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center font-bold text-[12px] text-[var(--foreground-muted)]">
                      {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[var(--foreground)] truncate">{t.name}</div>
                      <div className="text-[10.5px] text-[var(--foreground-muted)] font-semibold mt-0.5">{t.department}</div>
                    </div>
                    <span className="text-[9.5px] font-mono text-[var(--foreground-subtle)] font-bold">{t.id}</span>
                  </div>
                  <div className="mt-3.5 pt-3.5 border-t border-[var(--border)] grid grid-cols-2 gap-2 text-[10.5px]">
                    <div>
                      <p className="text-[8.5px] font-bold uppercase tracking-wider text-[var(--foreground-subtle)] mb-1">Rotations</p>
                      <div className="flex flex-wrap gap-1">
                        {t.classes.map(c => <span key={c} className="tag tag-indigo py-0 font-bold">{c}</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[8.5px] font-bold uppercase tracking-wider text-[var(--foreground-subtle)] mb-1">Subjects</p>
                      <p className="text-[var(--foreground)] font-bold truncate">{t.subjects.join(', ')}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[var(--foreground-muted)] border-t border-[var(--border-subtle)] pt-2.5 font-medium">
                  <Mail className="h-3 w-3" />
                  <span className="font-mono truncate">{t.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TIMETABLE TAB ─────────────────────────────────── */}
      {activeTab === 'Timetable' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border)] pb-3">
            <div>
              <h1 className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)] leading-none">Timetable Studio</h1>
              <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-medium">Click slots to allocate room resources and instructors</p>
            </div>
            <div className="flex items-center gap-2 text-[12px] font-semibold">
              <span>Section:</span>
              <Select
                value={ttClass}
                onChange={setTtClass}
                options={classes.map(c => ({ value: c.id, label: c.name }))}
              />
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="flex md:hidden gap-1 overflow-x-auto pb-1">
            {DAYS.map(d => (
              <button
                key={d}
                onClick={() => setMobileDay(d)}
                className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg whitespace-nowrap transition-all ${
                  mobileDay === d ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm' : 'btn btn-ghost'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Grid Layout */}
          <div className="hidden md:block premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--secondary)]">
                    <th className="px-4 py-2 text-left text-[9.5px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] w-28">Period</th>
                    {DAYS.map(d => (
                      <th key={d} className="px-2 py-2 text-center text-[9.5px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map((period, pi) => (
                    <tr key={period} className="border-b border-[var(--border-subtle)]">
                      <td className="px-4 py-2.5">
                        <div className="text-[11.5px] font-bold text-[var(--foreground)]">Period {period}</div>
                        <div className="text-[9px] text-[var(--foreground-subtle)] font-mono font-bold">{PERIOD_TIMES[pi]}</div>
                      </td>
                      {DAYS.map(day => {
                        const cell = getCell(day, period);
                        const color = cell ? (SUBJECT_COLORS[cell.subject] || 'var(--primary)') : null;
                        return (
                          <td key={day} className="px-1.5 py-1.5">
                            <div
                              onClick={() => handleCellClick(day, period)}
                              className="min-h-[48px] rounded-lg border cursor-pointer transition-all hover:opacity-80 flex flex-col justify-center px-2 py-1 text-center"
                              style={{
                                borderColor: color ? `${color}25` : 'var(--border)',
                                background: color ? `${color}0b` : 'var(--secondary)'
                              }}
                            >
                              {cell ? (
                                <>
                                  <div className="text-[11px] font-bold truncate" style={{ color: color || undefined }}>{cell.subject}</div>
                                  <div className="text-[9px] text-[var(--foreground-muted)] font-medium mt-0.5 truncate">
                                    {teachers.find(t => t.id === cell.teacherId)?.name.split(' ').slice(-1)[0]}
                                  </div>
                                  <div className="text-[8px] text-[var(--foreground-subtle)] font-mono font-bold mt-0.5">{cell.room}</div>
                                </>
                              ) : (
                                <div className="text-[9.5px] text-[var(--foreground-subtle)] font-bold">+ Allocate</div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Table View */}
          <div className="block md:hidden premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
            <div className="divide-y divide-[var(--border-subtle)]">
              {PERIODS.map((period, pi) => {
                const cell = getCell(mobileDay, period);
                const color = cell ? (SUBJECT_COLORS[cell.subject] || 'var(--primary)') : null;
                return (
                  <div
                    key={period}
                    onClick={() => handleCellClick(mobileDay, period)}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[var(--primary-subtle)] transition-colors"
                  >
                    <div className="w-14 flex-shrink-0 text-[11.5px]">
                      <div className="font-bold text-[var(--foreground)]">Period {period}</div>
                      <div className="text-[9px] text-[var(--foreground-subtle)] font-mono mt-0.5">{PERIOD_TIMES[pi]}</div>
                    </div>
                    <div
                      className="flex-1 rounded-lg px-3 py-1.5 border"
                      style={{ borderColor: color ? `${color}20` : 'var(--border)', background: color ? `${color}08` : 'var(--secondary)' }}
                    >
                      {cell ? (
                        <div className="text-[12px]">
                          <div className="font-bold" style={{ color: color || undefined }}>{cell.subject}</div>
                          <div className="text-[10px] text-[var(--foreground-muted)] font-medium mt-0.5">
                            {teachers.find(t => t.id === cell.teacherId)?.name} · {cell.room}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[var(--foreground-subtle)] font-bold">Tap to allocate period</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ATTENDANCE OVERVIEW TAB ───────────────────────── */}
      {activeTab === 'Attendance Overview' && (
        <div className="space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h1 className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)] leading-none">Attendance Registry Overview</h1>
            <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-medium">{lowAttendance.length} students currently fall below regulatory 75% threshold</p>
          </div>

          {/* Metrics bar chart */}
          <div className="premium-card p-4.5 border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-[12.5px] font-bold text-[var(--foreground)] tracking-tight">Class-wise Attendance Averages</h3>
              <span className="tag tag-indigo">Weekly log</span>
            </div>
            <div style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classAttendance} margin={{ top: 2, right: 2, left: -28, bottom: 0 }} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 9.5, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
                  <Bar dataKey="avg" radius={[3, 3, 0, 0]}>
                    {classAttendance.map((e, i) => (
                      <Cell key={i} fill={e.avg >= 90 ? 'var(--success)' : e.avg >= 80 ? 'var(--warning)' : 'var(--danger)'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick grade benchmarks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {classAttendance.map(cls => (
              <div key={cls.name} className="premium-card p-3 text-center hover-lift border border-[var(--border)] bg-[var(--surface)]">
                <div className="text-[16px] font-extrabold tracking-tight" style={{ color: cls.avg >= 90 ? 'var(--success)' : cls.avg >= 80 ? 'var(--warning)' : 'var(--danger)' }}>
                  {cls.avg}%
                </div>
                <div className="font-bold text-[var(--foreground)] mt-0.5 text-[11.5px]">Grade {cls.name}</div>
                <div className="text-[9.5px] text-[var(--foreground-muted)] mt-0.5 font-medium">{cls.count} enrolled</div>
                <div className="progress-bar mt-2">
                  <div className="progress-fill" style={{ width: `${cls.avg}%`, background: cls.avg >= 90 ? 'var(--success)' : cls.avg >= 80 ? 'var(--warning)' : 'var(--danger)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Flagged below threshold register */}
          {lowAttendance.length > 0 && (
            <div className="premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
              <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--secondary)] flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-[var(--danger)] flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-[var(--foreground)]">Attendance compliance warnings</h3>
                  <p className="text-[10.5px] text-[var(--foreground-muted)] font-medium mt-0.5">Students below minimum curricular limits (75%)</p>
                </div>
              </div>
              <div className="divide-y divide-[var(--border-subtle)] text-[12.5px]">
                {lowAttendance.map(s => (
                  <div key={s.id} className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[var(--primary-subtle)] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center font-bold text-[11px] text-[var(--foreground-muted)]">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--foreground)]">{s.name}</p>
                        <p className="text-[10px] text-[var(--foreground-muted)] font-medium mt-0.5">Grade {s.classId} · Parent: {s.parentName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-extrabold text-[var(--danger)]">{s.attendanceRate}%</div>
                      <div className="text-[8.5px] text-[var(--foreground-subtle)] font-bold uppercase tracking-wider">Attendance</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODALS & DIALOGS ─────────────────────────────── */}

      {/* Enroll Student Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Enroll New Student"
        description="basic details for the student. Roll numbers and gradebooks are auto-assigned."
        footer={
          <div className="flex justify-end gap-1.5 text-[12px]">
            <button className="btn btn-ghost" onClick={() => setIsAddOpen(false)}>Cancel</button>
            <button className="btn btn-primary font-bold" onClick={handleAddStudent}>Enroll Student</button>
          </div>
        }
      >
        <form onSubmit={handleAddStudent} className="space-y-3.5 text-[12.5px]">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Full Student Name</label>
              <input type="text" placeholder="e.g. Aditi Roy" className="form-input font-semibold" value={newForm.name} onChange={e => setNewForm({ ...newForm, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Class</label>
              <Select value={newForm.classId} onChange={v => setNewForm({ ...newForm, classId: v })} options={classes.map(c => ({ value: c.id, label: c.name }))} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Gender</label>
              <Select value={newForm.gender} onChange={v => setNewForm({ ...newForm, gender: v as 'Male' | 'Female' })} options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]} />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">School Email Address</label>
              <input type="email" placeholder="student@dps.in" className="form-input font-medium" value={newForm.email} onChange={e => setNewForm({ ...newForm, email: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Parent / Guardian</label>
              <input type="text" placeholder="Father or Mother name" className="form-input font-semibold" value={newForm.parentName} onChange={e => setNewForm({ ...newForm, parentName: e.target.value })} required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Contact Phone</label>
              <input type="tel" placeholder="+91 9XXXXXXXXX" className="form-input font-medium" value={newForm.parentPhone} onChange={e => setNewForm({ ...newForm, parentPhone: e.target.value })} />
            </div>
          </div>
        </form>
      </Dialog>

      {/* Student Profile Dialog */}
      {profileStudent && (
        <Dialog
          isOpen={!!profileStudent}
          onClose={() => setProfileStudent(null)}
          title={`${profileStudent.name} — Student Dossier`}
          description={`Grade ${profileStudent.classId} · ID: ${profileStudent.id} · roll No: ${profileStudent.rollNo}`}
          footer={<button className="btn btn-ghost text-[12px] font-bold" onClick={() => setProfileStudent(null)}>Close</button>}
        >
          <div className="space-y-4 text-[12.5px]">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Attendance Rate', value: `${profileStudent.attendanceRate}%` },
                { label: 'Academic Risk', value: profileStudent.riskStatus },
                { label: 'Billing Status', value: profileStudent.feeStatus },
                { label: 'Outstanding Balance', value: `₹${profileStudent.feeDue.toLocaleString('en-IN')}` }
              ].map((f, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
                  <p className="text-[8.5px] font-bold uppercase tracking-wider text-[var(--foreground-subtle)]">{f.label}</p>
                  <p className="text-[13px] font-extrabold text-[var(--foreground)] mt-0.5 leading-none">{f.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-2">Subject Performance</p>
              <div className="space-y-2">
                {Object.entries(profileStudent.grades).map(([subj, score]) => (
                  <div key={subj} className="flex items-center gap-2">
                    <span className="text-[11.5px] font-bold text-[var(--foreground)] w-28 truncate">{subj}</span>
                    <div className="flex-1 progress-bar h-1">
                      <div className="progress-fill" style={{ width: `${score as number}%`, background: (score as number) >= 85 ? 'var(--success)' : (score as number) >= 70 ? 'var(--primary)' : 'var(--warning)' }} />
                    </div>
                    <span className="text-[11.5px] font-extrabold text-[var(--foreground)] w-8 text-right">{score as number}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary)]">
              <p className="text-[8.5px] font-bold uppercase tracking-wider text-[var(--foreground-subtle)] mb-1">Parent / Contact details</p>
              <p className="font-bold text-[var(--foreground)]">{profileStudent.parentName}</p>
              <p className="font-mono text-[var(--foreground-muted)] text-[11px] mt-0.5">{profileStudent.parentPhone}</p>
              <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">{profileStudent.parentEmail}</p>
            </div>
          </div>
        </Dialog>
      )}

      {/* Timetable Slot Allocation Dialog */}
      <Dialog
        isOpen={isAllocOpen}
        onClose={() => setIsAllocOpen(false)}
        title={`Allocate period — ${allocForm.day}, Period ${allocForm.period}`}
        description={`Class Section ${ttClass} · time Slot: ${PERIOD_TIMES[allocForm.period - 1]}`}
        footer={
          <div className="flex justify-end gap-1.5 text-[12px]">
            <button className="btn btn-ghost" onClick={() => setIsAllocOpen(false)}>Cancel</button>
            <button className="btn btn-primary font-bold" onClick={handleAllocSubmit}>Commit Timetable Slot</button>
          </div>
        }
      >
        <form onSubmit={handleAllocSubmit} className="space-y-3.5 text-[12.5px]">
          <div>
            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Subject Area</label>
            <Select
              value={allocForm.subject}
              onChange={v => setAllocForm({ ...allocForm, subject: v })}
              options={['Mathematics', 'Physics', 'Chemistry', 'English Literature', 'English Language', 'World History', 'Geography', 'Physical Education', 'Computer Science'].map(s => ({ value: s, label: s }))}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Assigned Teacher</label>
            <Select
              value={allocForm.teacherId}
              onChange={v => setAllocForm({ ...allocForm, teacherId: v })}
              options={teachers.map(t => ({ value: t.id, label: t.name }))}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Assigned Room</label>
            <input type="text" placeholder="e.g. Lab 1 / Room 301" className="form-input font-medium" value={allocForm.room} onChange={e => setAllocForm({ ...allocForm, room: e.target.value })} />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
