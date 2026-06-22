'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSchoolStore } from '@/store/useSchoolStore';
import { useToast } from '@/components/ui/Toast';
import { Dialog } from '@/components/ui/Dialog';

import {
  Calendar, CheckCircle2, BookOpen, CreditCard, Send,
  Clock, ChevronDown, AlertTriangle, UserCheck, Check
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  LineChart, Line
} from 'recharts';

interface ParentDashboardProps { activeTab: string; }

const getPastScores = (studentId: string, subject: string, currentScore: number): number[] => {
  if (studentId === 'S1') {
    if (subject.startsWith('Math')) return [90, 92, 95];
    if (subject.startsWith('Phy')) return [85, 87, 86];
    if (subject.startsWith('Chem')) return [88, 90, 89];
    if (subject.startsWith('Eng')) return [82, 84, 83];
    if (subject.startsWith('World')) return [88, 89, 87];
  } else if (studentId === 'S3') {
    if (subject.startsWith('Math')) return [65, 62, 60];
    if (subject.startsWith('Phy')) return [55, 50, 48];
    if (subject.startsWith('Chem')) return [58, 56, 54];
    if (subject.startsWith('Eng')) return [72, 70, 69];
    if (subject.startsWith('World')) return [68, 64, 63];
  } else if (studentId === 'S7') {
    if (subject.startsWith('Math')) return [72, 68, 71];
    if (subject.startsWith('Phy')) return [66, 68, 67];
    if (subject.startsWith('Chem')) return [62, 61, 63];
    if (subject.startsWith('Eng')) return [75, 73, 74];
    if (subject.startsWith('World')) return [72, 71, 73];
  }
  const seed = studentId.charCodeAt(1) + subject.charCodeAt(0);
  const offset1 = (seed % 6) - 3;
  const offset2 = ((seed + 2) % 6) - 3;
  const offset3 = ((seed + 4) % 6) - 3;
  return [
    Math.min(100, Math.max(40, currentScore + offset1)),
    Math.min(100, Math.max(40, currentScore + offset2)),
    Math.min(100, Math.max(40, currentScore + offset3))
  ];
};

const CHILD_OPTIONS = [
  { value: 'S1', label: 'Aarav Sharma', class: '10-A', status: 'Regular', statusType: 'ok' },
  { value: 'S3', label: 'Vivaan Mehta', class: '10-A', status: 'Academic Watch', statusType: 'warn' },
  { value: 'S7', label: 'Sai Reddy', class: '9-A', status: 'Medical Watch', statusType: 'info' }
];

export default function ParentDashboard({ activeTab }: ParentDashboardProps) {
  const { students, teachers, homework, announcements, ptms, selectedStudentId, setSelectedStudentId, payStudentFee } = useSchoolStore();
  const { toast } = useToast();

  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const activeChild = CHILD_OPTIONS.find(c => c.value === selectedStudentId) || CHILD_OPTIONS[0];

  // Metrics
  const studentAssignments = activeStudent.assignments || [];
  const classHomework = homework.filter(hw => hw.classId === activeStudent.classId);
  const pendingHw = classHomework.filter(chw => {
    const rec = studentAssignments.find(sa => sa.assignmentId === chw.id);
    return !rec || rec.status === 'Pending';
  });
  const studentPTMs = ptms.filter(p => p.studentId === activeStudent.id);
  const activePTM = studentPTMs.find(p => p.status === 'Scheduled');

  // Charts
  const subjectData = Object.entries(activeStudent.grades).map(([subj, score]) => {
    const pastScores = getPastScores(activeStudent.id, subj, score);
    const pastAvg = Math.round(pastScores.reduce((a, b) => a + b, 0) / pastScores.length);
    return {
      subject: subj.split(' ')[0],
      score,
      avg: pastAvg
    };
  });
  const activeGrades = Object.values(activeStudent.grades);
  const overallAvg = activeGrades.length > 0 ? Math.round(activeGrades.reduce((a, b) => a + b, 0) / activeGrades.length) : 85;

  const activeStudentSubjects = Object.keys(activeStudent.grades);
  const pastUT1Scores = activeStudentSubjects.map(subj => getPastScores(activeStudent.id, subj, activeStudent.grades[subj])[0]);
  const pastUT2Scores = activeStudentSubjects.map(subj => getPastScores(activeStudent.id, subj, activeStudent.grades[subj])[1]);
  const pastQtrScores = activeStudentSubjects.map(subj => getPastScores(activeStudent.id, subj, activeStudent.grades[subj])[2]);

  const ut1Avg = Math.round(pastUT1Scores.reduce((a, b) => a + b, 0) / pastUT1Scores.length);
  const ut2Avg = Math.round(pastUT2Scores.reduce((a, b) => a + b, 0) / pastUT2Scores.length);
  const qtrAvg = Math.round(pastQtrScores.reduce((a, b) => a + b, 0) / pastQtrScores.length);

  const progressData = [
    { name: 'UT 1', score: ut1Avg },
    { name: 'UT 2', score: ut2Avg },
    { name: 'Quarterly', score: qtrAvg },
    { name: 'Current', score: overallAvg },
  ];

  // Child switcher dropdown state
  const [childDropOpen, setChildDropOpen] = useState(false);

  // Communication
  const [selectedTeacherId, setSelectedTeacherId] = useState('T1');
  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];
  const [messages, setMessages] = useState<{ sender: 'Parent' | 'Teacher'; text: string; time: string }[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Seed conversation based on teacher + child selection
  useEffect(() => {
    const convos: Record<string, Record<string, { sender: 'Parent' | 'Teacher'; text: string; time: string }[]>> = {
      T1: {
        S1: [
          { sender: 'Teacher', text: 'Namaste Sanjay Ji! Aarav has done exceptionally well in the recent algebra unit test — scored 94%. Really proud of his consistency.', time: '10:30 AM' },
          { sender: 'Parent', text: 'That is wonderful news, Dr. Sharma! He has been putting in a lot of extra effort. When are the Olympiad sessions scheduled?', time: '10:35 AM' },
          { sender: 'Teacher', text: 'Special batch starts from Monday. I have posted the full schedule in the announcement section. Please check and confirm his slot.', time: '10:37 AM' },
        ],
        S3: [
          { sender: 'Teacher', text: 'Namaste Swati Ji, I wanted to reach out regarding Vivaan\'s calculus homework. He has missed the last two submissions.', time: 'Yesterday' },
          { sender: 'Parent', text: 'Hello Dr. Sharma, yes he has been down with viral fever. I will make sure he finishes them by tonight.', time: 'Yesterday' },
          { sender: 'Teacher', text: 'Thank you for the update. Please ask him to review the video lecture notes so he can catch up on integrals. I will not penalise for late submission given the health reasons.', time: '09:00 AM' },
        ],
        S7: [
          { sender: 'Teacher', text: 'Namaste Krishna Ji, how is Sai Reddy recovering? I can email the mathematics revision sheets to his home address.', time: 'Yesterday' },
          { sender: 'Parent', text: 'Hello Dr. Sharma, he is slowly recovering from surgery. Sending the math sheets would be very helpful, thank you.', time: '04:15 PM' },
        ]
      },
      T2: {
        S1: [
          { sender: 'Teacher', text: 'Hello Sanjay Ji! Aarav\'s science lab performance is excellent. His titration experiment was precise and well-documented.', time: '11:00 AM' },
          { sender: 'Parent', text: 'Thank you Prof. Patel! He really enjoys the practical sessions. Do we need to buy any science journals?', time: '11:05 AM' },
          { sender: 'Teacher', text: 'No, all reference materials are provided in the online PDF library. Just ensure he reads Chapters 8-10 before next week.', time: '11:08 AM' },
        ],
        S3: [
          { sender: 'Teacher', text: 'Hello Swati Ji, Vivaan\'s physics lab reports are still pending. He needs to submit them to clear the term internals.', time: '2 days ago' },
          { sender: 'Parent', text: 'Hello Prof. Patel, I will sit with him and ensure he uploads the pending lab files by tomorrow.', time: '2 days ago' },
        ],
        S7: [
          { sender: 'Teacher', text: 'Hello Krishna Ji, I have prepared printed revision notes for Sai. Please WhatsApp me your address and I\'ll courier them.', time: 'Today' },
          { sender: 'Parent', text: 'That is so kind of you Prof. Patel. I am sending you the address right away.', time: 'Today' },
        ]
      },
      T3: {
        S1: [
          { sender: 'Teacher', text: 'Good afternoon! Aarav\'s essay on Tagore\'s philosophy was outstanding. I am nominating it for the inter-school essay competition.', time: '3 days ago' },
          { sender: 'Parent', text: 'That is wonderful, Ma\'am! He spent a lot of time researching Gitanjali. Please do share the competition details.', time: '3 days ago' },
        ],
        S3: [
          { sender: 'Teacher', text: 'Hello, I wanted to discuss Vivaan\'s English essay scores. His vocabulary and analytical depth need some attention.', time: '3 days ago' },
          { sender: 'Parent', text: 'Hello Ma\'am, is there any specific area we should focus on at home?', time: '3 days ago' },
          { sender: 'Teacher', text: 'Mainly descriptive writing and vocabulary. I recommend reading the Gitanjali analysis sheets I uploaded to the portal.', time: '10:00 AM' },
        ],
        S7: [
          { sender: 'Teacher', text: 'Hello Krishna Ji, I will share chapter summaries and simplified notes with Sai. No need to stress about deadlines for now.', time: 'Yesterday' },
          { sender: 'Parent', text: 'Thank you Ms. Iyer, that is very considerate of you.', time: 'Yesterday' },
        ]
      },
      T4: {
        S1: [
          { sender: 'Teacher', text: 'Hello Sanjay Ji, a reminder that Aarav\'s History project on the Mughal Empire is due this Friday.', time: 'Yesterday' },
          { sender: 'Parent', text: 'Hello Mr. Kumar, he is working on the final bibliography section today.', time: '05:00 PM' },
        ],
        S3: [
          { sender: 'Teacher', text: 'Hello, regarding Vivaan\'s history project submission — please ensure he submits by the extended deadline of Monday.', time: 'Yesterday' },
          { sender: 'Parent', text: 'Hello Mr. Kumar, we are finalising the files tonight.', time: '05:00 PM' },
        ],
        S7: [
          { sender: 'Teacher', text: 'Hello, Sai\'s project deadline has been extended to 3 weeks from today given the medical circumstances.', time: 'Today' },
        ]
      }
    };

    const key = selectedTeacherId;
    const childKey = activeStudent.id;
    const convo = convos[key]?.[childKey] || convos[key]?.S1 || [];
    const timer = setTimeout(() => {
      setMessages(convo);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedTeacherId, activeStudent.id]);

  const handleSendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setMessages(prev => [...prev, { sender: 'Parent', text: newMsg, time: 'Just now' }]);
    setNewMsg('');
    setIsTyping(true);
    setTimeout(() => {
      const q = newMsg.toLowerCase();
      let reply = 'Received. Let me verify the log files and get back to you soon.';
      if (q.includes('exam') || q.includes('test')) reply = 'Mid-term schedules are active in the notice board. July 6th start date.';
      else if (q.includes('homework') || q.includes('grade')) reply = 'Assignments are graded. Please check the Academics marks ledger.';
      else if (q.includes('attendance')) reply = 'Roster attendance logs are synchronized daily. Let me check the exceptions register.';
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'Teacher', text: reply, time: 'Just now' }]);
      toast({ title: `Message from ${selectedTeacher.name}`, description: 'New response received.', variant: 'info' });
    }, 1600);
  };

  // Fee payment
  const [isFeeOpen, setIsFeeOpen] = useState(false);
  const feeDue = activeStudent.feeDue;
  const feeStatus = activeStudent.feeStatus;

  const handlePayFee = () => {
    payStudentFee(activeStudent.id);
    setIsFeeOpen(false);
    toast({ title: 'Tuition Fees Paid', description: `Settle receipt logged for ₹${feeDue.toLocaleString('en-IN')}.`, variant: 'success' });
  };

  const handleRsvp = (action: 'Accept' | 'Reschedule') => {
    toast({ title: `PTM slot ${action}ed`, description: action === 'Accept' ? 'Calendar booked.' : 'Proposed reschedule slot.', variant: 'success' });
  };

  // ── Child Switcher Header ────────────────────────────────
  const renderChildSwitcher = () => (
    <div className="relative">
      <div
        onClick={() => setChildDropOpen(!childDropOpen)}
        className="premium-card px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[var(--primary-subtle)] border border-[var(--border)] bg-[var(--surface)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-8.5 w-8.5 rounded-lg bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)] font-bold text-[12.5px] border border-[var(--primary-muted)]">
            {activeStudent.name.charAt(0)}
          </div>
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Active Context</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[13.5px] font-bold text-[var(--foreground)] leading-none">{activeStudent.name}</span>
              <span className={`tag ${activeChild.statusType === 'warn' ? 'tag-amber' : activeChild.statusType === 'info' ? 'tag-blue' : 'tag-green'} text-[9px] py-0`}>
                {activeChild.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--foreground-muted)]">
          <span>Grade {activeStudent.classId}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${childDropOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {childDropOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 surface-raised rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in p-1 text-[12.5px] border border-[var(--border)]">
          {CHILD_OPTIONS.map(opt => {
            const isActive = opt.value === selectedStudentId;
            return (
              <button
                key={opt.value}
                onClick={() => { setSelectedStudentId(opt.value); setChildDropOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left cursor-pointer transition-colors ${isActive ? 'bg-[var(--primary-subtle)] font-semibold text-[var(--primary)]' : 'hover:bg-[var(--primary-subtle)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-[var(--secondary)] flex items-center justify-center font-bold text-[11px] text-[var(--foreground-muted)] border border-[var(--border)]">
                    {opt.label.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--foreground)]">{opt.label}</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] font-medium">Grade {opt.class}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`tag ${opt.statusType === 'warn' ? 'tag-amber' : opt.statusType === 'info' ? 'tag-blue' : 'tag-green'} text-[8.5px] py-0`}>{opt.status}</span>
                  {isActive && <Check className="h-3.5 w-3.5 text-[var(--primary)]" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in text-[13px]">
      {renderChildSwitcher()}

      {/* ── DASHBOARD TAB ───────────────────────────────── */}
      {activeTab === 'Dashboard' && (
        <div className="space-y-5">
          {/* Quick Status pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Attendance Rate', value: `${activeStudent.attendanceRate}%`, sub: activeStudent.attendanceRate >= 85 ? 'Compliant status' : 'Attention required', accent: activeStudent.attendanceRate >= 85 ? 'var(--success)' : 'var(--warning)', icon: UserCheck },
              { label: 'Pending Work', value: pendingHw.length, sub: `${classHomework.length - pendingHw.length} assignments done`, accent: 'var(--primary)', icon: BookOpen },
              { label: 'Upcoming PTM', value: activePTM ? activePTM.date : 'None', sub: activePTM ? activePTM.time : 'No slots booked', accent: 'var(--info)', icon: Calendar },
              { label: 'Outstanding Fees', value: feeStatus === 'Paid' ? 'Paid' : `₹${(feeDue / 1000).toFixed(0)}k`, sub: feeStatus === 'Paid' ? 'Receipts logged' : 'Term 1 balance due', accent: feeStatus === 'Paid' ? 'var(--success)' : 'var(--danger)', icon: CreditCard }
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="premium-card p-3.5 flex items-center gap-3 hover-lift border border-[var(--border)] bg-[var(--surface)]">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${m.accent}12`, color: m.accent }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">{m.label}</p>
                    <p className="text-[16px] font-extrabold tracking-tight leading-tight mt-0.5" style={{ color: m.accent }}>{m.value}</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] font-medium mt-0.5 truncate">{m.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fee collection warning action */}
          {feeStatus === 'Pending' && (
            <div
              className="premium-card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 cursor-pointer hover:bg-rose-50/10 border-rose-100 dark:border-rose-950/20 bg-[var(--surface)] transition-all"
              style={{ borderLeft: '3px solid var(--danger)' }}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-[var(--danger)] flex-shrink-0">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[12.5px] font-bold text-[var(--foreground)]">outstanding Tuition Balance — ₹{feeDue.toLocaleString('en-IN')}</p>
                  <p className="text-[10.5px] text-[var(--foreground-muted)] font-medium mt-0.5">Term 1 billing schedule for {activeStudent.name} is outstanding. Clearance required by June 30th.</p>
                </div>
              </div>
              <button onClick={() => setIsFeeOpen(true)} className="btn btn-primary text-[11px] py-1.5 px-3 flex-shrink-0 font-bold">
                Pay Now
              </button>
            </div>
          )}

          {/* Recharts Progress logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="premium-card p-4.5 border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12.5px] font-bold text-[var(--foreground)] tracking-tight">Subject Progress</h3>
                <span className="tag tag-indigo">vs Last 3 Exams Avg</span>
              </div>
              <div style={{ height: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} margin={{ top: 2, right: 2, left: -28, bottom: 0 }} barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="subject" tick={{ fontSize: 9, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 9, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
                    <Bar dataKey="score" radius={[3, 3, 0, 0]} name={`${activeStudent.name.split(' ')[0]}'s Score`}>
                      {subjectData.map((e, i) => <Cell key={i} fill={e.score >= 85 ? 'var(--primary)' : e.score >= 70 ? 'var(--warning)' : 'var(--danger)'} fillOpacity={0.8} />)}
                    </Bar>
                    <Bar dataKey="avg" radius={[3, 3, 0, 0]} fill="var(--border)" name="Last 3 Exams Avg" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="premium-card p-4.5 border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12.5px] font-bold text-[var(--foreground)] tracking-tight">Exam Score Progression</h3>
                <span className="tag tag-indigo">Last 3 Exams + Current</span>
              </div>
              <div style={{ height: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData} margin={{ top: 2, right: 2, left: -28, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[40, 100]} tick={{ fontSize: 9.5, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} formatter={(v) => [`${v as number | string}%`, 'Overall Score']} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Active PTM meeting notifications */}
          {activePTM && (
            <div className="premium-card p-4 border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-8.5 w-8.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-bold text-[var(--foreground)]">Parent-Teacher Meeting Scheduled</p>
                    <p className="text-[11px] text-[var(--foreground-muted)] font-medium mt-0.5">{activePTM.date} at {activePTM.time} · Location: {activePTM.platform}</p>
                    {activePTM.notes && <p className="text-[10.5px] text-[var(--foreground-muted)] font-medium mt-1 italic">{`"${activePTM.notes}"`}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleRsvp('Accept')} className="btn btn-primary text-[10.5px] py-1.5 px-3 font-bold">Confirm RSVP</button>
                  <button onClick={() => handleRsvp('Reschedule')} className="btn btn-ghost text-[10.5px] py-1.5 px-3">Reschedule</button>
                </div>
              </div>
            </div>
          )}

          {/* Notices */}
          <div className="premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--secondary)] flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[var(--foreground)]">Administrative Notice Board</h3>
              <span className="tag tag-slate">{announcements.length} Notices</span>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {announcements.slice(0, 3).map(ann => (
                <div key={ann.id} className="p-3.5 hover:bg-[var(--primary-subtle)] transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`tag ${ann.category === 'Urgent' ? 'tag-red' : ann.category === 'Academic' ? 'tag-indigo' : ann.category === 'Event' ? 'tag-violet' : 'tag-slate'}`}>{ann.category}</span>
                    <h4 className="text-[12.5px] font-bold text-[var(--foreground)]">{ann.title}</h4>
                  </div>
                  <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed mt-0.5">{ann.content}</p>
                  <div className="flex items-center justify-between text-[9px] text-[var(--foreground-subtle)] mt-2 font-semibold">
                    <span>{ann.author}</span>
                    <span>{ann.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ATTENDANCE TAB ───────────────────────────────── */}
      {activeTab === 'Attendance History' && (
        <div className="space-y-5">
          <div className="border-b border-[var(--border)] pb-3">
            <h1 className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)]">Attendance History</h1>
            <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-medium">{activeStudent.name} · Cumulative presence rate: {activeStudent.attendanceRate}%</p>
          </div>

          <div className="premium-card p-4.5 border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-[28px] font-extrabold tracking-tight leading-none" style={{ color: activeStudent.attendanceRate >= 90 ? 'var(--success)' : activeStudent.attendanceRate >= 75 ? 'var(--warning)' : 'var(--danger)' }}>
                  {activeStudent.attendanceRate}%
                </div>
                <div>
                  <p className="text-[12.5px] font-bold text-[var(--foreground)]">Cumulative attendance</p>
                  <p className="text-[10px] text-[var(--foreground-muted)] font-medium mt-0.5">Academic standard benchmark: 75%</p>
                </div>
              </div>
              <span className={`tag ${activeStudent.attendanceRate >= 90 ? 'tag-green' : activeStudent.attendanceRate >= 75 ? 'tag-amber' : 'tag-red'}`}>
                {activeStudent.attendanceRate >= 90 ? 'High Compliance' : activeStudent.attendanceRate >= 75 ? 'Acceptable' : 'Under Review'}
              </span>
            </div>
            <div className="progress-bar h-2">
              <div className="progress-fill" style={{ width: `${activeStudent.attendanceRate}%`, background: activeStudent.attendanceRate >= 90 ? 'var(--success)' : activeStudent.attendanceRate >= 75 ? 'var(--warning)' : 'var(--danger)' }} />
            </div>
          </div>

          <div className="premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
            <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--secondary)]">
              <h3 className="text-[13px] font-bold text-[var(--foreground)]">Historical Session register</h3>
            </div>
            <div className="divide-y divide-[var(--border-subtle)] text-[12.5px]">
              {(activeStudent.attendanceHistory || []).slice(0, 10).map((rec, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between hover:bg-[var(--primary-subtle)] transition-colors">
                  <span className="font-bold text-[var(--foreground)] font-mono">{rec.date}</span>
                  <span className={`tag ${rec.status === 'Present' ? 'tag-green' : rec.status === 'Late' ? 'tag-amber' : 'tag-red'}`}>{rec.status}</span>
                </div>
              ))}
              {(activeStudent.attendanceHistory || []).length === 0 && (
                <div className="p-8 text-center text-[12px] text-[var(--foreground-muted)]">No rosters loaded.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ACADEMICS TAB ───────────────────────────────── */}
      {activeTab === 'Academics' && (
        <div className="space-y-5">
          <div className="border-b border-[var(--border)] pb-3">
            <h1 className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)]">Academic Ledger</h1>
            <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-medium">{activeStudent.name} · Cumulative semester benchmarks</p>
          </div>

          {/* Subject progress list */}
          <div className="premium-card p-4.5 border border-[var(--border)] bg-[var(--surface)]">
            <h3 className="text-[12.5px] font-bold text-[var(--foreground)] tracking-tight mb-3">Subject-wise Marks breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[9.5px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] bg-[var(--secondary)]">
                    <th className="py-3 px-4">SUBJECT</th>
                    <th className="py-3 px-4 text-center">UNIT TEST 1</th>
                    <th className="py-3 px-4 text-center">UNIT TEST 2</th>
                    <th className="py-3 px-4 text-center">QUARTERLY</th>
                    <th className="py-3 px-4 text-center">CURRENT</th>
                    <th className="py-3 px-4 text-center">GRADE</th>
                    <th className="py-3 px-4 text-right">TREND</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-medium">
                  {Object.entries(activeStudent.grades).map(([subj, score]) => {
                    const pastScores = getPastScores(activeStudent.id, subj, score);
                    const pastAvg = Math.round(pastScores.reduce((a, b) => a + b, 0) / pastScores.length);
                    const diff = score - pastAvg;
                    const isAbove = diff >= 0;
                    return (
                      <tr key={subj} className="hover:bg-[var(--primary-subtle)] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[var(--foreground)] text-[13px]">{subj}</td>
                        <td className="py-3.5 px-4 text-center text-[var(--foreground-muted)]">{pastScores[0]}%</td>
                        <td className="py-3.5 px-4 text-center text-[var(--foreground-muted)]">{pastScores[1]}%</td>
                        <td className="py-3.5 px-4 text-center text-[var(--foreground-muted)]">{pastScores[2]}%</td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-[var(--foreground)] text-[13.5px] bg-[var(--secondary)]/50">{score}%</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`tag w-8 text-center ${score >= 90 ? 'tag-green' : score >= 80 ? 'tag-indigo' : score >= 70 ? 'tag-amber' : 'tag-red'}`}>
                            {score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-flex items-center gap-0.5 text-[9.5px] font-bold px-2 py-0.5 rounded ${isAbove ? 'text-[#059669] bg-[#ecfdf5] dark:text-[#34d399] dark:bg-[#34d399]/10' : 'text-[#d97706] bg-[#fffbeb] dark:text-[#fbbf24] dark:bg-[#fbbf24]/10'}`}>
                            {isAbove ? `↑ +${diff}%` : `↓ ${Math.abs(diff)}%`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Homework lists */}
          <div className="premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--secondary)] flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[var(--foreground)]">Homework Submissions Log</h3>
              <span className="tag tag-amber font-extrabold">{pendingHw.length} Pending</span>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {classHomework.map(hw => {
                const rec = studentAssignments.find(sa => sa.assignmentId === hw.id);
                const status = rec?.status || 'Pending';
                return (
                  <div key={hw.id} className="px-4 py-3 flex items-center gap-3 hover:bg-[var(--primary-subtle)] transition-colors">
                    <div className={`h-7.5 w-7.5 rounded-lg flex items-center justify-center flex-shrink-0 ${status === 'Graded' ? 'bg-emerald-50 dark:bg-emerald-950/20' : status === 'Submitted' ? 'bg-indigo-50 dark:bg-indigo-950/20' : 'bg-amber-50 dark:bg-amber-950/20'}`}>
                      {status === 'Graded' ? <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" /> :
                        status === 'Submitted' ? <Clock className="h-3.5 w-3.5 text-[var(--primary)]" /> :
                          <BookOpen className="h-3.5 w-3.5 text-[var(--warning)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold text-[var(--foreground)] truncate">{hw.title}</p>
                      <p className="text-[10px] text-[var(--foreground-muted)] font-medium mt-0.5">{hw.subject} · Due Date: {hw.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {rec?.score && <span className="tag tag-indigo font-bold">{rec.score}%</span>}
                      <span className={`tag ${status === 'Graded' ? 'tag-green' : status === 'Submitted' ? 'tag-blue' : 'tag-amber'}`}>{status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── COMMUNICATION TAB ───────────────────────────── */}
      {activeTab === 'Communication' && (
        <div className="space-y-5">
          <div className="border-b border-[var(--border)] pb-3">
            <h1 className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)]">Direct Communications</h1>
            <p className="text-[12px] text-[var(--foreground-muted)] mt-1.5 font-medium">Coordinate directly with class teachers · Records are archived for audits</p>
          </div>

          {/* Teacher directory selector */}
          <div className="premium-card p-3 border border-[var(--border)] bg-[var(--surface)] space-y-2">
            <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] block mb-1">Select Faculty Teacher</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {teachers.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeacherId(t.id)}
                  className={`px-3 py-2 rounded-lg border text-left cursor-pointer transition-all ${selectedTeacherId === t.id ? 'border-[var(--primary)] bg-[var(--primary-subtle)] font-semibold' : 'border-[var(--border)] hover:bg-[var(--primary-subtle)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                >
                  <p className="text-[12px] font-bold truncate text-[var(--foreground)]">{t.name.split(' ').slice(-1)[0]}</p>
                  <p className="text-[9px] text-[var(--foreground-muted)] mt-0.5 font-medium truncate">{t.subjects[0]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Clean Message chatbox */}
          <div className="premium-card overflow-hidden border border-[var(--border)] bg-[var(--surface)] flex flex-col" style={{ height: 400 }}>
            {/* Header banner */}
            <div className="px-4 py-3.5 border-b border-[var(--border)] bg-[var(--secondary)] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-[var(--primary-subtle)] flex items-center justify-center font-bold text-[11px] text-[var(--primary)] border border-[var(--primary-muted)]">
                  {selectedTeacher.name.split(' ').slice(-1)[0].charAt(0)}
                </div>
                <div>
                  <p className="text-[12.5px] font-bold text-[var(--foreground)]">{selectedTeacher.name}</p>
                  <p className="text-[9.5px] text-[var(--foreground-muted)] font-medium mt-0.5">{selectedTeacher.department} · classes: {selectedTeacher.classes.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="live-dot text-[var(--success)]">
                  <span className="glow-dot" style={{ background: 'var(--success)', width: '5px', height: '5px', borderRadius: '50%', display: 'block' }} />
                </span>
                <span className="text-[10px] text-[var(--success)] font-extrabold tracking-wide">ONLINE</span>
              </div>
            </div>

            {/* Message feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'Parent' ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex flex-col gap-1 max-w-[75%]">
                    {msg.sender !== 'Parent' && (
                      <span className="text-[8.5px] font-bold text-[var(--foreground-subtle)] uppercase tracking-wider px-1">
                        {selectedTeacher.name.split(' ').slice(-1)[0]}
                      </span>
                    )}
                    <div className={msg.sender === 'Parent' ? 'chat-bubble-out font-medium' : 'chat-bubble-in font-medium'}>
                      {msg.text}
                    </div>
                    <span className={`text-[8.5px] text-[var(--foreground-subtle)] font-semibold px-1 ${msg.sender === 'Parent' ? 'text-right' : 'text-left'}`}>{msg.time}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="chat-bubble-in flex items-center gap-1 px-3.5 py-2">
                    {[0, 1, 2].map(d => (
                      <span key={d} className="w-1 h-1 rounded-full bg-[var(--foreground-muted)] animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Send form */}
            <form onSubmit={handleSendMsg} className="p-2.5 border-t border-[var(--border)] bg-[var(--secondary)] flex items-center gap-2 flex-shrink-0">
              <input
                type="text"
                placeholder={`Type message for ${selectedTeacher.name.split(' ').slice(-1)[0]}...`}
                className="flex-1 px-3 py-2 text-[12px] font-medium border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--foreground-subtle)] outline-none rounded-lg focus:border-[var(--primary)] transition-all"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
              />
              <button type="submit" className="btn btn-primary text-[10.5px] py-2 px-3 flex-shrink-0 font-bold">
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Tuition Fee Invoice Modal ──────────────────── */}
      <Dialog
        isOpen={isFeeOpen}
        onClose={() => setIsFeeOpen(false)}
        title="Settle School Tuition Fees"
        description={`Tuition balance invoice details for ${activeStudent.name} (Grade ${activeStudent.classId})`}
        footer={
          <div className="flex justify-end gap-1.5 text-[12px]">
            <button className="btn btn-ghost" onClick={() => setIsFeeOpen(false)}>Cancel</button>
            <button className="btn btn-primary font-bold" onClick={handlePayFee}>Confirm Digital Settlement</button>
          </div>
        }
      >
        <div className="space-y-4 text-[12.5px]">
          <div className="p-3.5 rounded-lg bg-[var(--primary-subtle)] border border-[var(--primary-muted)] flex items-center justify-between">
            <div>
              <p className="font-bold text-[var(--foreground)]">Term 1 School Tuition Fee</p>
              <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5">EduSphere 360 · AY 2025–26</p>
            </div>
            <p className="text-[18px] font-extrabold text-[var(--primary)]">₹{feeDue.toLocaleString('en-IN')}</p>
          </div>
          <div className="space-y-2 text-[12px] text-[var(--foreground-muted)]">
            {[
              { label: 'Basic Tuition Rates', amount: Math.round(feeDue * 0.65) },
              { label: 'Activity & Lab charges', amount: Math.round(feeDue * 0.15) },
              { label: 'Transport billing route', amount: Math.round(feeDue * 0.12) },
              { label: 'Digital Library & Materials', amount: Math.round(feeDue * 0.08) }
            ].map(item => (
              <div key={item.label} className="flex justify-between py-1.5 border-b border-[var(--border-subtle)] font-medium">
                <span>{item.label}</span>
                <span className="font-bold text-[var(--foreground)]">₹{item.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 font-bold text-[13px] text-[var(--foreground)] border-t border-[var(--border-strong)]">
              <span>Total Invoice Amount</span>
              <span className="text-[var(--primary)]">₹{feeDue.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <p className="text-[9.5px] text-[var(--foreground-subtle)] text-center font-semibold">Note: Settlement is processed locally in demo sandbox environment.</p>
        </div>
      </Dialog>
    </div>
  );
}
