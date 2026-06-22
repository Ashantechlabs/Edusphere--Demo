import { create } from 'zustand';
import {
  Student,
  Teacher,
  ClassInfo,
  Homework,
  Announcement,
  PTM,
  TimetableEntry,
  initialStudents,
  initialTeachers,
  initialClasses,
  initialHomework,
  initialAnnouncements,
  initialPTMs,
  initialTimetable
} from '@/utils/mockData';

export type UserRole = 'Principal' | 'Admin' | 'Teacher' | 'Parent' | 'Student';

export interface NotificationMsg {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

interface SchoolState {
  activeRole: UserRole;
  selectedStudentId: string; // The active student context for Parents/Students
  students: Student[];
  teachers: Teacher[];
  classes: ClassInfo[];
  homework: Homework[];
  announcements: Announcement[];
  ptms: PTM[];
  timetable: TimetableEntry[];
  notifications: NotificationMsg[];

  // Actions
  setRole: (role: UserRole) => void;
  setSelectedStudentId: (id: string) => void;
  addStudent: (student: Omit<Student, 'id' | 'rollNo' | 'attendanceRate' | 'riskStatus' | 'attendanceHistory' | 'assignments' | 'feeDue' | 'feeStatus'>) => void;
  markAttendance: (
    classId: string,
    date: string,
    records: { studentId: string; status: 'Present' | 'Absent' | 'Late' }[]
  ) => void;
  updateGrades: (studentId: string, subject: string, mark: number) => void;
  createHomework: (homework: Omit<Homework, 'id' | 'createdAt' | 'submissionsCount' | 'gradedCount'>) => void;
  submitAssignment: (studentId: string, assignmentId: string) => void;
  gradeAssignment: (studentId: string, assignmentId: string, score: number, feedback: string) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  schedulePTM: (ptm: Omit<PTM, 'id' | 'status'>) => void;
  scheduleClassPTM: (
    classId: string,
    teacherId: string,
    date: string,
    time: string,
    platform: string,
    notes: string
  ) => void;
  payStudentFee: (studentId: string) => void;
  updateTimetable: (entry: Omit<TimetableEntry, 'id'>) => void;
  addNotification: (title: string, message: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useSchoolStore = create<SchoolState>((set) => ({
  activeRole: 'Principal',
  selectedStudentId: 'S1', // Aarav Sharma
  students: initialStudents,
  teachers: initialTeachers,
  classes: initialClasses,
  homework: initialHomework,
  announcements: initialAnnouncements,
  ptms: initialPTMs,
  timetable: initialTimetable,
  notifications: [
    {
      id: "N1",
      title: "New Circular Published",
      message: "Safety Coordinator: Severe Weather Warning - Delayed Start.",
      date: "2026-06-21",
      read: false
    },
    {
      id: "N2",
      title: "Homework Due Reminder",
      message: "Shakespearean Gitanjali Poetry Analysis is due in 3 days.",
      date: "2026-06-21",
      read: false
    },
    {
      id: "N3",
      title: "System Update",
      message: "Welcome to EduSphere 360 v2.1.0.",
      date: "2026-06-20",
      read: true
    }
  ],

  setRole: (role) => set({ activeRole: role }),

  setSelectedStudentId: (id) => set({ selectedStudentId: id }),

  addStudent: (studentData) => set((state) => {
    const classId = studentData.classId;
    const sameClassCount = state.students.filter(s => s.classId === classId).length + 1;
    const classAbbr = classId.replace('-', '');
    const rollNo = `${classAbbr}${sameClassCount.toString().padStart(2, '0')}`;
    const id = `S${state.students.length + 1}`;

    const newStudent: Student = {
      ...studentData,
      id,
      rollNo,
      attendanceRate: 100.0,
      riskStatus: 'Low',
      attendanceHistory: [],
      assignments: [],
      feeDue: 35000, // Default admission fees
      feeStatus: 'Pending'
    };

    // Update classes student count
    const updatedClasses = state.classes.map(c =>
      c.id === classId ? { ...c, studentCount: c.studentCount + 1 } : c
    );

    // Trigger Notification
    const newNotif: NotificationMsg = {
      id: `N_ADD_${Date.now()}`,
      title: "New Admission",
      message: `${studentData.name} has been enrolled in ${classId}.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };

    return {
      students: [...state.students, newStudent],
      classes: updatedClasses,
      notifications: [newNotif, ...state.notifications]
    };
  }),

  markAttendance: (classId, date, records) => set((state) => {
    const updatedStudents = state.students.map((student) => {
      if (student.classId !== classId) return student;

      const record = records.find(r => r.studentId === student.id);
      if (!record) return student;

      const filteredHistory = student.attendanceHistory.filter(h => h.date !== date);
      const updatedHistory = [...filteredHistory, { date, status: record.status }];

      const totalDays = updatedHistory.length;
      const presentCount = updatedHistory.filter(h => h.status === 'Present' || h.status === 'Late').length;
      const rate = totalDays > 0 ? parseFloat(((presentCount / totalDays) * 100).toFixed(1)) : 100;

      let riskStatus: 'High' | 'Medium' | 'Low' = 'Low';
      let riskReason = '';
      if (rate < 75) {
        riskStatus = 'High';
        riskReason = `Attendance rate has dropped critically to ${rate}%.`;
      } else if (rate < 85) {
        riskStatus = 'Medium';
        riskReason = `Attendance rate is warning-low at ${rate}%.`;
      }

      return {
        ...student,
        attendanceHistory: updatedHistory,
        attendanceRate: rate,
        riskStatus,
        riskReason: riskReason || student.riskReason
      };
    });

    const newNotif: NotificationMsg = {
      id: `N_ATT_${Date.now()}`,
      title: "Attendance Updated",
      message: `Attendance marked for class ${classId} on ${date}.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };

    return {
      students: updatedStudents,
      notifications: [newNotif, ...state.notifications]
    };
  }),

  updateGrades: (studentId, subject, mark) => set((state) => {
    const updatedStudents = state.students.map((student) => {
      if (student.id !== studentId) return student;

      const updatedGrades = { ...student.grades, [subject]: mark };
      const gradesArray = Object.values(updatedGrades);
      const avg = gradesArray.reduce((a, b) => a + b, 0) / gradesArray.length;

      let riskStatus = student.riskStatus;
      let riskReason = student.riskReason;
      if (avg < 60) {
        riskStatus = 'High';
        riskReason = `Academic alert: overall average score is ${avg.toFixed(1)}%.`;
      } else if (avg < 70 && riskStatus !== 'High') {
        riskStatus = 'Medium';
        riskReason = `Academic notice: overall average is ${avg.toFixed(1)}%.`;
      } else if (avg >= 70 && riskStatus !== 'Low' && student.attendanceRate >= 85) {
        riskStatus = 'Low';
        riskReason = '';
      }

      return {
        ...student,
        grades: updatedGrades,
        riskStatus,
        riskReason
      };
    });

    return { students: updatedStudents };
  }),

  createHomework: (homeworkData) => set((state) => {
    const newHw: Homework = {
      ...homeworkData,
      id: `HW${state.homework.length + 1}`,
      createdAt: new Date().toISOString().split('T')[0],
      submissionsCount: 0,
      gradedCount: 0
    };

    const updatedStudents = state.students.map((student) => {
      if (student.classId !== homeworkData.classId) return student;

      return {
        ...student,
        assignments: [
          ...student.assignments,
          { assignmentId: newHw.id, status: 'Pending' as const }
        ]
      };
    });

    const newNotif: NotificationMsg = {
      id: `N_HW_${Date.now()}`,
      title: "New Assignment Created",
      message: `${homeworkData.subject} assignment: "${homeworkData.title}" posted for ${homeworkData.classId}.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };

    return {
      homework: [newHw, ...state.homework],
      students: updatedStudents,
      notifications: [newNotif, ...state.notifications]
    };
  }),

  submitAssignment: (studentId, assignmentId) => set((state) => {
    const updatedStudents = state.students.map((student) => {
      if (student.id !== studentId) return student;

      const updatedAssignments = student.assignments.map((item) =>
        item.assignmentId === assignmentId
          ? { ...item, status: 'Submitted' as const, submissionDate: new Date().toISOString().split('T')[0] }
          : item
      );

      return {
        ...student,
        assignments: updatedAssignments
      };
    });

    const updatedHomework = state.homework.map((hw) =>
      hw.id === assignmentId
        ? { ...hw, submissionsCount: hw.submissionsCount + 1 }
        : hw
    );

    const studentName = state.students.find(s => s.id === studentId)?.name || 'A student';
    const hwTitle = state.homework.find(h => h.id === assignmentId)?.title || 'homework';

    const newNotif: NotificationMsg = {
      id: `N_SUB_${Date.now()}`,
      title: "Assignment Submitted",
      message: `${studentName} submitted "${hwTitle}".`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };

    return {
      students: updatedStudents,
      homework: updatedHomework,
      notifications: [newNotif, ...state.notifications]
    };
  }),

  gradeAssignment: (studentId, assignmentId, score, feedback) => set((state) => {
    const updatedStudents = state.students.map((student) => {
      if (student.id !== studentId) return student;

      const updatedAssignments = student.assignments.map((item) =>
        item.assignmentId === assignmentId
          ? { ...item, status: 'Graded' as const, score, feedback }
          : item
      );

      const homeworkObj = state.homework.find(h => h.id === assignmentId);
      const subject = homeworkObj?.subject || '';
      const updatedGrades = { ...student.grades };
      if (subject) {
        updatedGrades[subject] = score;
      }

      return {
        ...student,
        assignments: updatedAssignments,
        grades: updatedGrades
      };
    });

    const updatedHomework = state.homework.map((hw) =>
      hw.id === assignmentId
        ? { ...hw, gradedCount: hw.gradedCount + 1 }
        : hw
    );

    const hwTitle = state.homework.find(h => h.id === assignmentId)?.title || 'homework';

    const newNotif: NotificationMsg = {
      id: `N_GRADE_${Date.now()}`,
      title: "Assignment Graded",
      message: `Your submission for "${hwTitle}" has been graded: ${score}%.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };

    return {
      students: updatedStudents,
      homework: updatedHomework,
      notifications: [newNotif, ...state.notifications]
    };
  }),

  addAnnouncement: (announcementData) => set((state) => {
    const newAnn: Announcement = {
      ...announcementData,
      id: `A${state.announcements.length + 1}`,
      date: new Date().toISOString().split('T')[0]
    };

    const newNotif: NotificationMsg = {
      id: `N_ANN_${Date.now()}`,
      title: `Notice: ${newAnn.title}`,
      message: `${newAnn.author}: ${newAnn.content.slice(0, 60)}...`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };

    return {
      announcements: [newAnn, ...state.announcements],
      notifications: [newNotif, ...state.notifications]
    };
  }),

  schedulePTM: (ptmData) => set((state) => {
    const newPtm: PTM = {
      ...ptmData,
      id: `PTM${state.ptms.length + 1}`,
      status: 'Scheduled'
    };

    const studentName = state.students.find(s => s.id === ptmData.studentId)?.name || 'your child';
    const teacherName = state.teachers.find(t => t.id === ptmData.teacherId)?.name || 'Teacher';

    const newNotif: NotificationMsg = {
      id: `N_PTM_${Date.now()}`,
      title: "PTM Scheduled",
      message: `Parent-Teacher Meeting scheduled for ${studentName} with ${teacherName} on ${ptmData.date} at ${ptmData.time}.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };

    return {
      ptms: [...state.ptms, newPtm],
      notifications: [newNotif, ...state.notifications]
    };
  }),

  scheduleClassPTM: (classId, teacherId, date, time, platform, notes) => set((state) => {
    const classStudents = state.students.filter(s => s.classId === classId);
    const newPTMs: PTM[] = [];
    const newNotifs: NotificationMsg[] = [];
    const teacherName = state.teachers.find(t => t.id === teacherId)?.name || 'Teacher';
    const todayDate = new Date().toISOString().split('T')[0];

    classStudents.forEach((student, index) => {
      const id = `PTM_C_${classId}_${Date.now()}_${index}`;
      newPTMs.push({
        id,
        studentId: student.id,
        teacherId,
        date,
        time,
        platform,
        status: 'Scheduled',
        notes
      });

      newNotifs.push({
        id: `N_PTM_C_${Date.now()}_${index}`,
        title: `PTM Scheduled for ${classId}`,
        message: `Parent-Teacher Meeting scheduled for ${student.name} with ${teacherName} on ${date} at ${time}.`,
        date: todayDate,
        read: false
      });
    });

    return {
      ptms: [...state.ptms, ...newPTMs],
      notifications: [...newNotifs, ...state.notifications]
    };
  }),

  payStudentFee: (studentId) => set((state) => {
    const updatedStudents = state.students.map((student) => {
      if (student.id === studentId) {
        return {
          ...student,
          feeDue: 0,
          feeStatus: 'Paid' as const
        };
      }
      return student;
    });

    const studentName = state.students.find(s => s.id === studentId)?.name || 'Student';
    const newNotif: NotificationMsg = {
      id: `N_PAY_${Date.now()}`,
      title: "Fee Payment Successful",
      message: `Term 1 fees ₹0 cleared successfully for ${studentName}. Receipt dispatched.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };

    return {
      students: updatedStudents,
      notifications: [newNotif, ...state.notifications]
    };
  }),

  updateTimetable: (entryData) => set((state) => {
    const filtered = state.timetable.filter(
      (item) => !(item.classId === entryData.classId && item.day === entryData.day && item.period === entryData.period)
    );

    const newEntry: TimetableEntry = {
      ...entryData,
      id: `TT${state.timetable.length + 1}`
    };

    return {
      timetable: [...filtered, newEntry]
    };
  }),

  addNotification: (title, message) => set((state) => ({
    notifications: [
      {
        id: `N_${Date.now()}`,
        title,
        message,
        date: new Date().toISOString().split('T')[0],
        read: false
      },
      ...state.notifications
    ]
  })),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    )
  })),

  clearNotifications: () => set({ notifications: [] })
}));
