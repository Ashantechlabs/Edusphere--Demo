'use client';

import React, { useState } from 'react';
import { useSchoolStore } from '@/store/useSchoolStore';
import { useToast } from '@/components/ui/Toast';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import {
  AlertTriangle,
  CreditCard,
  Calendar,
  Send,
  Plus,
  FileText,
  CheckCircle2,
  Building2,
  ArrowRight,
  Phone,
  Mail
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function PrincipalDashboard() {
  const {
    students,
    teachers,
    classes,
    announcements,
    ptms,
    addAnnouncement,
    schedulePTM,
    scheduleClassPTM
  } = useSchoolStore();

  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);



  const totalDue = students.reduce((a, s) => a + (s.feeStatus === 'Pending' ? s.feeDue : 0), 0);
  const totalPaid = students.reduce((a, s) => a + (s.feeStatus === 'Paid' ? s.feeDue : 0), 0) + 910000;
  const totalExpected = totalPaid + totalDue;
  const feeRate = parseFloat(((totalPaid / (totalExpected || 1)) * 100).toFixed(1));
  const atRisk = students.filter(s => s.riskStatus === 'High' || s.riskStatus === 'Medium');
  const critical = students.filter(s => s.riskStatus === 'High');
  const upcomingPTMs = ptms.filter(p => p.status === 'Scheduled');

  // ── Modal State ───────────────────────────────────────────
  const [isAnnOpen, setIsAnnOpen] = useState(false);
  const [isPtmOpen, setIsPtmOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const [annForm, setAnnForm] = useState({ title: '', content: '', category: 'Notice' as 'Notice' | 'Academic' | 'Event' | 'Urgent' });
  const [ptmForm, setPtmForm] = useState({
    targetType: 'class' as 'student' | 'class',
    studentId: students[0]?.id || '',
    classId: classes[0]?.id || '',
    teacherId: teachers[0]?.id || '',
    date: '',
    time: '',
    platform: 'Google Meet',
    notes: ''
  });

  // ── Charts Data ───────────────────────────────────────────
  const attendanceData = [
    { day: 'Mon', rate: 92.4 }, { day: 'Tue', rate: 94.1 }, { day: 'Wed', rate: 93.8 },
    { day: 'Thu', rate: 91.2 }, { day: 'Fri', rate: 93.5 }, { day: 'Sat', rate: 88.0 }
  ];

  const classAvgData = classes.map(cls => {
    const clsStudents = students.filter(s => s.classId === cls.id);
    const avg = clsStudents.reduce((acc, s) => {
      const vals = Object.values(s.grades);
      return acc + vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
    }, 0) / (clsStudents.length || 1);
    return { name: cls.id, avg: parseFloat(avg.toFixed(1)) || 78 };
  });

  // ── Handlers ──────────────────────────────────────────────
  const handleAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.content.trim()) {
      toast({ title: 'Error', description: 'Please fill all fields.', variant: 'error' }); return;
    }
    addAnnouncement({
      title: annForm.title, content: annForm.content,
      category: annForm.category,
      targetRoles: ['Principal', 'Admin', 'Teacher', 'Parent', 'Student'],
      author: "Principal's Office"
    });
    setAnnForm({ title: '', content: '', category: 'Notice' });
    setIsAnnOpen(false);
    toast({ title: 'Notice Broadcasted', description: 'Notice published to stakeholder workspace calendars.', variant: 'success' });
  };

  const handlePtmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptmForm.date || !ptmForm.time) {
      toast({ title: 'Error', description: 'Fill date and time.', variant: 'error' }); return;
    }
    if (ptmForm.targetType === 'class') {
      scheduleClassPTM(ptmForm.classId, ptmForm.teacherId, ptmForm.date, ptmForm.time, ptmForm.platform, ptmForm.notes);
      toast({ title: 'Class PTM Slots Booked', description: `Scheduled meeting slots for Grade ${ptmForm.classId}.`, variant: 'success' });
    } else {
      schedulePTM({ studentId: ptmForm.studentId, teacherId: ptmForm.teacherId, date: ptmForm.date, time: ptmForm.time, platform: ptmForm.platform, notes: ptmForm.notes });
      toast({ title: 'PTM Slot Scheduled', description: 'Meeting slot confirmed.', variant: 'success' });
    }
    setIsPtmOpen(false);
  };

  // ── Priority Action Items ─────────────────────────────────
  const priorityActions = [
    {
      id: 'risk',
      label: critical.length > 0 ? `${critical.length} Critical Attendance Alerts` : 'Attendance Compliant',
      desc: critical.length > 0 ? `${critical.map(s => s.name.split(' ')[0]).join(', ')} — presence rate dropped below 75%` : 'All students within presence threshold',
      status: critical.length > 0 ? 'urgent' : 'ok',
      icon: AlertTriangle,
      iconBg: critical.length > 0 ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600',
      action: () => {
        const el = document.getElementById('risk-monitor-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    {
      id: 'fee',
      label: `₹${(totalDue / 100000).toFixed(1)}L Pending Collections`,
      desc: `${students.filter(s => s.feeStatus === 'Pending').length} pending families outstanding for Term 1 tuition fees`,
      status: totalDue > 0 ? 'warn' : 'ok',
      icon: CreditCard,
      iconBg: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
      action: () => setIsReportOpen(true)
    },
    {
      id: 'ptm',
      label: `${upcomingPTMs.length} PTM Meetings Today`,
      desc: 'Mid-term reviews scheduled. 3 parents pending slot confirmation',
      status: 'info',
      icon: Calendar,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
      action: () => {
        const el = document.getElementById('ptm-brief-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  ];

  const todayVal = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Executive Greeting Header ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <p suppressHydrationWarning className="text-[10px] font-bold tracking-wider uppercase text-[var(--foreground-muted)] mb-1">
            {mounted ? todayVal : ''}
          </p>
          <h1 className="text-[1.8rem] font-extrabold tracking-tight text-[var(--foreground)] leading-none">
            Good Morning
          </h1>
          <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-medium flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            EduSphere 360 · Academic Command Center
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="audit-reports-trigger-btn"
            onClick={() => setIsReportOpen(true)}
            className="btn btn-ghost text-[11.5px] py-1.5 px-3"
          >
            <FileText className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
            Audit Reports
          </button>
          <button
            onClick={() => setIsAnnOpen(true)}
            className="btn btn-ghost text-[11.5px] py-1.5 px-3"
          >
            <Send className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
            Send Notice
          </button>
          <button
            onClick={() => setIsPtmOpen(true)}
            className="btn btn-primary text-[11.5px] py-1.5 px-3"
          >
            <Plus className="h-3.5 w-3.5" />
            Schedule PTM
          </button>
        </div>
      </div>

      {/* ── Today's School Snapshot Briefing (No Cards) ─── */}
      <div className="premium-card p-4.5 bg-gradient-to-r from-[var(--surface)] to-[var(--secondary)]">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-3">
          {"Today's School Snapshot · Academic Year 2026-2027"}
        </h2>
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 ${
            8 > 6 ? 'max-h-[105px] overflow-y-auto pr-2 custom-scrollbar' : ''
          }`}
        >
          <div className="briefing-row">
            <CheckCircle2 className="h-4.5 w-4.5 briefing-icon-ok" />
            <span className="text-[13px] font-medium text-[var(--foreground)]">Attendance target achieved in 4 classes (10-A, 10-B, 9-A, 9-B)</span>
          </div>
          <div className="briefing-row">
            <AlertTriangle className="h-4.5 w-4.5 briefing-icon-alert" />
            <span className="text-[13px] font-medium text-[var(--foreground)]">Grade 9-A attendance below threshold ({students.find(s => s.classId === '9-A')?.attendanceRate}% avg)</span>
          </div>
          <div className="briefing-row">
            <AlertTriangle className="h-4.5 w-4.5 briefing-icon-warn" />
            <span className="text-[13px] font-medium text-[var(--foreground)]">{atRisk.length} students flagged at risk (attendance / academic decline)</span>
          </div>
          <div className="briefing-row">
            <CheckCircle2 className="h-4.5 w-4.5 briefing-icon-ok" />
            <span className="text-[13px] font-medium text-[var(--foreground)]">{upcomingPTMs.length} PTM sessions scheduled with parents today</span>
          </div>
          <div className="briefing-row">
            <CheckCircle2 className="h-4.5 w-4.5 briefing-icon-ok" />
            <span className="text-[13px] font-medium text-[var(--foreground)]">Science Exhibition begins in 2 days (A1: Annual Showcase)</span>
          </div>
          <div className="briefing-row">
            <CheckCircle2 className="h-4.5 w-4.5 briefing-icon-ok" />
            <span className="text-[13px] font-medium text-[var(--foreground)]">Fee collection reached {feeRate}% (Outstanding: ₹{(totalDue / 100000).toFixed(1)}L)</span>
          </div>
          <div className="briefing-row">
            <CheckCircle2 className="h-4.5 w-4.5 briefing-icon-ok" />
            <span className="text-[13px] font-medium text-[var(--foreground)]">Term 1 examination schedules published (Theory assessments commence July 6th)</span>
          </div>
          <div className="briefing-row">
            <AlertTriangle className="h-4.5 w-4.5 briefing-icon-alert" />
            <span className="text-[13px] font-medium text-[var(--foreground)]">Weather advisory: Heavy rains forecast tomorrow, remote learning buffers active</span>
          </div>
        </div>
      </div>

      {/* ── Main Command Grid ────────────────────────────── */}
      {/* 70% Left Columns for Actions & Workflows | 30% Right Column for Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── 70% WORKFLOW & ACTIONS COLUMN (lg:col-span-2) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Today's Priority Actions */}
          <div id="priority-brief-section" className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h2 className="text-[13px] font-bold text-[var(--foreground)] tracking-tight">{"Today's Priority Actions"}</h2>
              <span className="tag tag-red text-[9px] font-extrabold">{priorityActions.length} Actions</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {priorityActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.id}
                    onClick={action.action}
                    className="action-item flex flex-col items-start gap-2.5 p-3 hover-lift border border-[var(--border)] bg-[var(--surface)]"
                  >
                    <div className={`action-item-icon p-1.5 rounded-lg ${action.iconBg}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[12.5px] font-bold text-[var(--foreground)] leading-tight">{action.label}</p>
                      <p className="text-[10.5px] text-[var(--foreground-muted)] mt-1 leading-snug">{action.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Risk Monitor & Exceptions */}
          <div id="risk-monitor-section" className="premium-card overflow-hidden border border-[var(--border)]">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--secondary)] flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-[var(--foreground)]">Students Requiring Support</h3>
                <p className="text-[10.5px] text-[var(--foreground-muted)] mt-0.5">Automated intervention triggers based on attendance / grading logs</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="tag tag-red">{critical.length} Critical</span>
                <span className="tag tag-amber">{atRisk.length - critical.length} Monitor</span>
              </div>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {atRisk.map(s => (
                <div key={s.id} className="px-4 py-3 flex items-center gap-3.5 hover:bg-[var(--primary-subtle)] transition-colors">
                  <div className="h-7 w-7 rounded-lg bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-[11px] font-bold text-[var(--foreground-muted)]">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-bold text-[var(--foreground)]">{s.name}</span>
                      <span className="tag tag-slate font-mono py-0">{s.classId}</span>
                      <span className={s.riskStatus === 'High' ? 'risk-high' : 'risk-medium'}>{s.riskStatus}</span>
                    </div>
                    <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5 truncate">{s.riskReason || 'Absences rising above 15% rate threshold.'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <span className="text-[12px] font-bold text-[var(--foreground)]">{s.attendanceRate}%</span>
                      <p className="text-[8.5px] text-[var(--foreground-subtle)] font-bold uppercase tracking-wider">Attendance</p>
                    </div>
                    <a href={`tel:${s.parentPhone}`} className="p-1.5 border border-[var(--border)] rounded-md hover:bg-[var(--secondary)] text-[var(--foreground-muted)] transition-colors">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <a href={`mailto:${s.parentEmail}`} className="p-1.5 border border-[var(--border)] rounded-md hover:bg-[var(--secondary)] text-[var(--foreground-muted)] transition-colors">
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Parent-Teacher Coordination (PTMs) */}
          <div id="ptm-brief-section" className="premium-card overflow-hidden border border-[var(--border)]">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--secondary)] flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-[var(--foreground)]">Pending Parent Communications</h3>
                <p className="text-[10.5px] text-[var(--foreground-muted)] mt-0.5">Upcoming Parent-Teacher Meetings and agenda schedules</p>
              </div>
              <button onClick={() => setIsPtmOpen(true)} className="text-[11px] font-bold text-[var(--primary)] hover:underline">+ Book Slot</button>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {upcomingPTMs.slice(0, 4).map(ptm => {
                const student = students.find(s => s.id === ptm.studentId);
                const teacher = teachers.find(t => t.id === ptm.teacherId);
                return (
                  <div key={ptm.id} className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap hover:bg-[var(--primary-subtle)] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                        <Calendar className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-bold text-[var(--foreground)] truncate">{student?.name || 'Class Discussion'}</p>
                        <p className="text-[10.5px] text-[var(--foreground-muted)] truncate">{teacher?.name} ({teacher?.department}) · {ptm.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-right text-[11.5px]">
                      <div>
                        <p className="font-bold text-[var(--foreground)]">{ptm.date}</p>
                        <p className="text-[10.5px] text-[var(--foreground-muted)] font-mono">{ptm.time}</p>
                      </div>
                      <span className="tag tag-indigo">Scheduled</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Notices & School Circulars */}
          <div id="notices-brief-section" className="premium-card overflow-hidden border border-[var(--border)]">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--secondary)] flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-[var(--foreground)]">Recent Announcements</h3>
                <p className="text-[10.5px] text-[var(--foreground-muted)] mt-0.5">Active circulars broadcasted across stakeholder portals</p>
              </div>
              <button onClick={() => setIsAnnOpen(true)} className="text-[11px] font-bold text-[var(--primary)] hover:underline">+ New notice</button>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {announcements.slice(0, 3).map(ann => (
                <div key={ann.id} className="p-4 hover:bg-[var(--primary-subtle)] transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`tag ${ann.category === 'Urgent' ? 'tag-red' :
                      ann.category === 'Academic' ? 'tag-indigo' :
                        ann.category === 'Event' ? 'tag-violet' : 'tag-slate'
                      }`}>{ann.category}</span>
                    <h4 className="text-[12.5px] font-bold text-[var(--foreground)] truncate">{ann.title}</h4>
                  </div>
                  <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">{ann.content}</p>
                  <div className="flex items-center justify-between text-[9.5px] text-[var(--foreground-subtle)] mt-2 font-semibold">
                    <span>Author: {ann.author}</span>
                    <span>Date: {ann.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── 30% ANALYTICS & PULSE COLUMN (lg:col-span-1) ─── */}
        <div className="lg:col-span-1 space-y-5">

          {/* School Attendance Trend */}
          <div className="premium-card p-4 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h3 className="text-[13px] font-bold text-[var(--foreground)]">Attendance Index</h3>
                <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5">Daily presence rate vs. 90% threshold</p>
              </div>
              <span className="tag tag-green">↑ Stable</span>
            </div>
            <div style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData} margin={{ top: 2, right: 2, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 9.5, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[86, 97]} tick={{ fontSize: 9.5, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, boxShadow: 'var(--shadow-sm)' }}
                    formatter={(v) => [`${v as number | string}%`, 'Attendance']}
                  />
                  <Line
                    type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2}
                    dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 4, fill: '#6366f1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Academic Composite by Class */}
          <div className="premium-card p-4 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h3 className="text-[13px] font-bold text-[var(--foreground)]">Academic Composite</h3>
                <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5">Averaged score benchmarks by class section</p>
              </div>
            </div>
            <div style={{ height: 130 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classAvgData} margin={{ top: 2, right: 2, left: -28, bottom: 0 }} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 9.5, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, boxShadow: 'var(--shadow-sm)' }}
                    formatter={(v) => [`${v as number | string}%`, 'Avg Score']}
                  />
                  <Bar dataKey="avg" radius={[3, 3, 0, 0]}>
                    {classAvgData.map((entry, i) => (
                      <Cell key={i} fill={entry.avg >= 80 ? '#6366f1' : entry.avg >= 70 ? '#f59e0b' : '#ef4444'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Faculty Activity Brief */}
          <div className="premium-card overflow-hidden border border-[var(--border)]">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--secondary)]">
              <h3 className="text-[13px] font-bold text-[var(--foreground)]">Faculty Activity Pulse</h3>
              <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5">{teachers.length} active educators on rotation</p>
            </div>
            <div className="divide-y divide-[var(--border-subtle)] text-[12px]">
              {teachers.slice(0, 3).map(t => (
                <div key={t.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-[var(--primary-subtle)] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-[var(--secondary)] flex items-center justify-center font-bold text-[10px] text-[var(--foreground-muted)]">
                      {t.name.split(' ').slice(-1)[0].charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--foreground)] leading-tight">{t.name}</p>
                      <p className="text-[9.5px] text-[var(--foreground-muted)] mt-0.5">{t.department}</p>
                    </div>
                  </div>
                  <span className="tag tag-slate text-[9px]">{t.classes[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick PDF Audit Ledgers */}
          <div className="premium-card p-4 border border-[var(--border)] space-y-2">
            <h3 className="text-[13px] font-bold text-[var(--foreground)]">Quick Audit Ledgers</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button onClick={() => setIsReportOpen(true)} className="btn btn-ghost py-1 text-center font-bold justify-between">
                <span>Academics Ledger</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <button onClick={() => setIsReportOpen(true)} className="btn btn-ghost py-1 text-center font-bold justify-between">
                <span>Finance Ledger</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <button onClick={() => setIsReportOpen(true)} className="btn btn-ghost py-1 text-center font-bold justify-between">
                <span>Operations Index</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <button onClick={() => setIsReportOpen(true)} className="btn btn-ghost py-1 text-center font-bold justify-between">
                <span>Compliance Log</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ── MODALS & DIALOGS ─────────────────────────────── */}

      {/* Broadcast Announcement Modal */}
      <Dialog
        isOpen={isAnnOpen}
        onClose={() => setIsAnnOpen(false)}
        title="Broadcast Notice Circular"
        description="Publish urgent notices, school circulars, or academic alerts to all stakeholder portals."
        compact={true}
        footer={
          <div className="flex justify-end gap-1.5 text-[12px]">
            <button className="btn btn-ghost" onClick={() => setIsAnnOpen(false)}>Cancel</button>
            <button className="btn btn-primary font-bold" onClick={handleAnnSubmit}>Publish Notice</button>
          </div>
        }
      >
        <form onSubmit={handleAnnSubmit} className="space-y-3.5 text-[12.5px]">
          <div>
            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Notice Category</label>
            <Select
              value={annForm.category}
              onChange={v => setAnnForm({ ...annForm, category: v as 'Notice' | 'Academic' | 'Event' | 'Urgent' })}
              options={[
                { value: 'Notice', label: 'General Notice' },
                { value: 'Academic', label: 'Academic circular' },
                { value: 'Event', label: 'Upcoming Event' },
                { value: 'Urgent', label: 'Urgent Alert' }
              ]}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g. Annual Day Registration"
              className="form-input font-semibold"
              value={annForm.title}
              onChange={e => setAnnForm({ ...annForm, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Details</label>
            <textarea
              rows={3}
              placeholder="Provide event details, routes, or instructions..."
              className="form-input resize-none"
              value={annForm.content}
              onChange={e => setAnnForm({ ...annForm, content: e.target.value })}
              required
            />
          </div>
        </form>
      </Dialog>

      {/* PTM Schedule Modal */}
      <Dialog
        isOpen={isPtmOpen}
        onClose={() => setIsPtmOpen(false)}
        title="Schedule Parent-Teacher Meeting"
        description="Book individual or class-wide bulk PTM slots. Meeting confirmation notifications sync instantly."
        compact={true}
        footer={
          <div className="flex justify-end gap-1.5 text-[12px]">
            <button className="btn btn-ghost" onClick={() => setIsPtmOpen(false)}>Cancel</button>
            <button className="btn btn-primary font-bold" onClick={handlePtmSubmit}>Confirm Meeting Slots</button>
          </div>
        }
      >
        <form onSubmit={handlePtmSubmit} className="space-y-3 text-[12.5px]">
          <div>
            <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1.5">PTM Scope</label>
            <div className="flex gap-4">
              {[
                { v: 'student', l: 'Single Student' },
                { v: 'class', l: 'Entire Class (Bulk)' }
              ].map(opt => (
                <label key={opt.v} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    checked={ptmForm.targetType === opt.v}
                    onChange={() => setPtmForm({ ...ptmForm, targetType: opt.v as 'student' | 'class' })}
                    className="accent-[var(--primary)]"
                  />
                  <span className="font-semibold text-[var(--foreground)]">{opt.l}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {ptmForm.targetType === 'student' ? (
              <div>
                <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Student</label>
                <Select
                  value={ptmForm.studentId}
                  onChange={v => setPtmForm({ ...ptmForm, studentId: v })}
                  options={students.map(s => ({ value: s.id, label: `${s.name} (${s.classId})` }))}
                />
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Class Section</label>
                <Select
                  value={ptmForm.classId}
                  onChange={v => setPtmForm({ ...ptmForm, classId: v })}
                  options={classes.map(c => ({ value: c.id, label: c.name }))}
                />
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Educator / Teacher</label>
              <Select
                value={ptmForm.teacherId}
                onChange={v => setPtmForm({ ...ptmForm, teacherId: v })}
                options={teachers.map(t => ({ value: t.id, label: t.name }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Date</label>
              <input type="date" className="form-input font-medium" value={ptmForm.date} onChange={e => setPtmForm({ ...ptmForm, date: e.target.value })} required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Time Slot</label>
              <input type="text" placeholder="e.g. 10:30 AM" className="form-input font-medium" value={ptmForm.time} onChange={e => setPtmForm({ ...ptmForm, time: e.target.value })} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Platform / Room</label>
              <input type="text" placeholder="Google Meet / Classroom 301" className="form-input font-medium" value={ptmForm.platform} onChange={e => setPtmForm({ ...ptmForm, platform: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-1">Agenda Notes</label>
              <input type="text" placeholder="Olympiad criteria, academic support..." className="form-input font-medium" value={ptmForm.notes} onChange={e => setPtmForm({ ...ptmForm, notes: e.target.value })} />
            </div>
          </div>
        </form>
      </Dialog>

      <Dialog
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Institutional Audit Reports"
        description="Select and download verified administrative and operational compliance reports."
        compact={true}
        footer={<button className="btn btn-ghost text-[12px]" onClick={() => setIsReportOpen(false)}>Close</button>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
          {[
            { title: 'Academic Performance Ledger', desc: 'GPA scores, marks list' },
            { title: 'Operational Health Index', desc: 'Faculty rosters, indicators' },
            { title: 'Financial Ledger Overview', desc: 'Invoices, collections ledger' },
            { title: 'Attendance Compliance Audit', desc: 'Roster attendance logs' }
          ].map((r, i) => (
            <div key={i} className="flex flex-col justify-between p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--primary-subtle)] transition-colors cursor-pointer group">
              <div className="mb-2">
                <p className="font-bold text-[var(--foreground)] leading-tight">{r.title}</p>
                <p className="text-[9.5px] text-[var(--foreground-muted)] mt-1">{r.desc}</p>
              </div>
              <button
                className="btn btn-ghost text-[10px] py-1 px-2.5 font-bold w-full justify-center"
                onClick={() => toast({ title: 'Exporting...', description: `${r.title} compilation saved to Downloads.`, variant: 'success' })}
              >
                Export PDF
              </button>
            </div>
          ))}
        </div>
      </Dialog>

    </div>
  );
}
