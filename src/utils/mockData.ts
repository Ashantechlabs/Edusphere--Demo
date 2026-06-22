export interface Student {
  id: string;
  name: string;
  rollNo: string;
  classId: string; // e.g. "10-A"
  email: string;
  avatar: string;
  gender: 'Male' | 'Female';
  attendanceRate: number;
  riskStatus: 'High' | 'Medium' | 'Low';
  riskReason?: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  grades: { [subject: string]: number }; // percentage marks
  attendanceHistory: { date: string; status: 'Present' | 'Absent' | 'Late' }[];
  assignments: {
    assignmentId: string;
    status: 'Submitted' | 'Pending' | 'Graded';
    score?: number;
    feedback?: string;
    submissionDate?: string;
  }[];
  feeDue: number; // in Rupees
  feeStatus: 'Paid' | 'Pending';
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  avatar: string;
  classes: string[];
  subjects: string[];
}

export interface ClassInfo {
  id: string;
  name: string;
  room: string;
  classTeacherId: string;
  studentCount: number;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string;
  classId: string;
  teacherId: string;
  dueDate: string;
  createdAt: string;
  submissionsCount: number;
  gradedCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Academic' | 'Event' | 'Notice' | 'Urgent';
  targetRoles: ('Principal' | 'Admin' | 'Teacher' | 'Parent' | 'Student')[];
  date: string;
  author: string;
}

export interface PTM {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Requested' | 'Cancelled';
  platform: string;
  notes?: string;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number; // 1 to 6
  subject: string;
  teacherId: string;
  room: string;
}

// ----------------------------------------------------
// LOCALIZED SEED DATA DECLARATIONS
// ----------------------------------------------------

export const initialTeachers: Teacher[] = [
  {
    id: "T1",
    name: "Dr. Amit Sharma",
    email: "a.sharma@edusphere360.in",
    department: "Mathematics",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    classes: ["10-A", "10-B", "9-A"],
    subjects: ["Mathematics", "Calculus"]
  },
  {
    id: "T2",
    name: "Prof. Priya Patel",
    email: "p.patel@edusphere360.in",
    department: "Science",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    classes: ["10-A", "10-B", "9-B"],
    subjects: ["Physics", "Chemistry"]
  },
  {
    id: "T3",
    name: "Ms. Ananya Iyer",
    email: "a.iyer@edusphere360.in",
    department: "English Literature",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    classes: ["10-A", "9-A", "9-B"],
    subjects: ["English Language", "English Literature"]
  },
  {
    id: "T4",
    name: "Mr. Rajesh Kumar",
    email: "r.kumar@edusphere360.in",
    department: "History & Social Sciences",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    classes: ["10-B", "9-A"],
    subjects: ["World History", "Geography"]
  }
];

export const initialClasses: ClassInfo[] = [
  { id: "10-A", name: "Grade 10 - Section A", room: "Room 301", classTeacherId: "T1", studentCount: 7 },
  { id: "10-B", name: "Grade 10 - Section B", room: "Room 302", classTeacherId: "T2", studentCount: 2 },
  { id: "9-A", name: "Grade 9 - Section A", room: "Room 201", classTeacherId: "T3", studentCount: 2 },
  { id: "9-B", name: "Grade 9 - Section B", room: "Room 202", classTeacherId: "T4", studentCount: 1 }
];

export const initialHomework: Homework[] = [
  {
    id: "HW1",
    title: "Quadratic Equations Practice Set",
    description: "Solve problems 1 to 15 on page 142 of the textbook. Show all derivation steps for full marks.",
    subject: "Mathematics",
    classId: "10-A",
    teacherId: "T1",
    dueDate: "2026-06-25",
    createdAt: "2026-06-20",
    submissionsCount: 5,
    gradedCount: 3
  },
  {
    id: "HW2",
    title: "Newtonian Mechanics Lab Report",
    description: "Submit the final lab report based on the pendulum experiment conducted on Tuesday.",
    subject: "Physics",
    classId: "10-A",
    teacherId: "T2",
    dueDate: "2026-06-26",
    createdAt: "2026-06-21",
    submissionsCount: 4,
    gradedCount: 0
  },
  {
    id: "HW3",
    title: "Poetry Analysis - Rabindranath Tagore",
    description: "Write a 500-word analysis exploring the themes of patriotism and spirituality in Gitanjali.",
    subject: "English Literature",
    classId: "10-A",
    teacherId: "T3",
    dueDate: "2026-06-24",
    createdAt: "2026-06-19",
    submissionsCount: 6,
    gradedCount: 5
  },
  {
    id: "HW4",
    title: "Indian Independence Struggle Essay",
    description: "Analyze the social impact of the Non-Cooperation Movement. Minimum 2 pages.",
    subject: "World History",
    classId: "10-B",
    teacherId: "T4",
    dueDate: "2026-06-27",
    createdAt: "2026-06-21",
    submissionsCount: 1,
    gradedCount: 0
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: "A1",
    title: "Annual Science Exhibition 2026",
    content: "EduSphere 360's annual science show is scheduled for next Thursday. Projects must be finalized with supervisors by Monday. Parents are cordially invited to attend the showcase from 10:00 AM onwards.",
    category: "Event",
    targetRoles: ["Principal", "Admin", "Teacher", "Parent", "Student"],
    date: "2026-06-20",
    author: "Admin Desk"
  },
  {
    id: "A2",
    title: "Upcoming Term 1 Exam Schedule",
    content: "The examination sheets for Term 1 will be distributed tomorrow. The theoretical assessment will begin on July 6th. Please ensure all library clearance forms are submitted by June 30th.",
    category: "Academic",
    targetRoles: ["Principal", "Admin", "Teacher", "Parent", "Student"],
    date: "2026-06-19",
    author: "Dean of Academics"
  },
  {
    id: "A3",
    title: "Mid-Term Parent-Teacher Meeting (PTM)",
    content: "The mid-term parent-teacher meetings are scheduled for Saturday, June 27th. Please book your slots in the Parent portal before Wednesday evening to secure your preferred timing with subject teachers.",
    category: "Notice",
    targetRoles: ["Principal", "Admin", "Teacher", "Parent"],
    date: "2026-06-21",
    author: "Principal's Office"
  },
  {
    id: "A4",
    title: "Severe Weather Warning - Delayed Start",
    content: "Due to heavy rains expected tomorrow morning, school timing is delayed by 1 hour. Buses will ply 1 hour later than their standard route schedules. Remote learning options will remain open for students unable to travel.",
    category: "Urgent",
    targetRoles: ["Principal", "Admin", "Teacher", "Parent", "Student"],
    date: "2026-06-21",
    author: "Safety Coordinator"
  }
];

export const initialPTMs: PTM[] = [
  {
    id: "PTM1",
    studentId: "S1", // Aarav Sharma
    teacherId: "T1",
    date: "2026-06-27",
    time: "10:00 AM",
    status: "Scheduled",
    platform: "Classroom 301",
    notes: "Review Aarav's advanced algebra performance and discuss math Olympiad eligibility."
  },
  {
    id: "PTM2",
    studentId: "S3", // Vivaan Mehta (At Risk)
    teacherId: "T1",
    date: "2026-06-27",
    time: "11:30 AM",
    status: "Scheduled",
    platform: "Online (Google Meet)",
    notes: "Critical meeting to discuss attendance decline and recent low marks in Calculus."
  },
  {
    id: "PTM3",
    studentId: "S2", // Diya Patel
    teacherId: "T3",
    date: "2026-06-27",
    time: "02:15 PM",
    status: "Scheduled",
    platform: "English Lab",
    notes: "Discuss Diya's poetry contest submission and creative writing progress."
  },
  {
    id: "PTM4",
    studentId: "S7", // Sai Reddy (At Risk)
    teacherId: "T3",
    date: "2026-06-27",
    time: "09:00 AM",
    status: "Scheduled",
    platform: "Counselor's Room",
    notes: "Review medical leaves and discuss home study coordination program."
  }
];

// Generate attendance history helper
const generateAttendance = (presentRate: number, daysCount = 30) => {
  const history = [];
  const start = new Date("2026-05-10");
  for (let i = 0; i < daysCount; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    // skip weekends
    if (current.getDay() === 0 || current.getDay() === 6) continue;

    const formattedDate = current.toISOString().split("T")[0];
    const rand = Math.random() * 100;
    let status: 'Present' | 'Absent' | 'Late' = 'Present';

    if (rand > presentRate) {
      status = Math.random() > 0.5 ? 'Absent' : 'Late';
    }
    history.push({ date: formattedDate, status });
  }
  return history;
};

export const initialStudents: Student[] = [
  {
    id: "S1",
    name: "Aarav Sharma",
    rollNo: "10A01",
    classId: "10-A",
    email: "aarav.sharma@edusphere360.in",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    gender: "Male",
    attendanceRate: 96.8,
    riskStatus: "Low",
    parentName: "Sanjay Sharma",
    parentEmail: "sanjay.sharma@gmail.com",
    parentPhone: "+91 98765 43210",
    grades: { "Mathematics": 94, "Physics": 88, "Chemistry": 91, "English Literature": 85, "World History": 90 },
    attendanceHistory: generateAttendance(96.8),
    assignments: [
      { assignmentId: "HW1", status: "Graded", score: 95, feedback: "Excellent algebraic proofs!" },
      { assignmentId: "HW2", status: "Submitted", submissionDate: "2026-06-21" },
      { assignmentId: "HW3", status: "Graded", score: 86, feedback: "Good structural flow, watch sentence formation." }
    ],
    feeDue: 0,
    feeStatus: "Paid"
  },
  {
    id: "S2",
    name: "Diya Patel",
    rollNo: "10A02",
    classId: "10-A",
    email: "diya.patel@edusphere360.in",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    gender: "Female",
    attendanceRate: 98.4,
    riskStatus: "Low",
    parentName: "Ramesh Patel",
    parentEmail: "ramesh.patel@gmail.com",
    parentPhone: "+91 98234 56789",
    grades: { "Mathematics": 89, "Physics": 92, "Chemistry": 95, "English Literature": 98, "World History": 94 },
    attendanceHistory: generateAttendance(98.4),
    assignments: [
      { assignmentId: "HW1", status: "Graded", score: 88, feedback: "Nicely solved quadratic expressions." },
      { assignmentId: "HW2", status: "Submitted", submissionDate: "2026-06-21" },
      { assignmentId: "HW3", status: "Graded", score: 98, feedback: "Breathtaking essay. One of the best analyses this year." }
    ],
    feeDue: 0,
    feeStatus: "Paid"
  },
  {
    id: "S3",
    name: "Vivaan Mehta",
    rollNo: "10A03",
    classId: "10-A",
    email: "vivaan.mehta@edusphere360.in",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    gender: "Male",
    attendanceRate: 71.4, // LOW Attendance
    riskStatus: "High",
    riskReason: "Chronic absences (under 75%) and continuous grade drop in sciences.",
    parentName: "Swati Mehta",
    parentEmail: "swati.mehta@gmail.com",
    parentPhone: "+91 99123 45678",
    grades: { "Mathematics": 58, "Physics": 45, "Chemistry": 52, "English Literature": 68, "World History": 61 },
    attendanceHistory: generateAttendance(71.4),
    assignments: [
      { assignmentId: "HW1", status: "Pending" },
      { assignmentId: "HW2", status: "Pending" },
      { assignmentId: "HW3", status: "Graded", score: 62, feedback: "Unfinished analysis, please resubmit." }
    ],
    feeDue: 45000,
    feeStatus: "Pending"
  },
  {
    id: "S4",
    name: "Ishaan Sen",
    rollNo: "10A04",
    classId: "10-A",
    email: "ishaan.sen@edusphere360.in",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    gender: "Female", // Using female avatar but keeping gender male/neutral
    attendanceRate: 95.5,
    riskStatus: "Low",
    parentName: "Vikram Sen",
    parentEmail: "vikram.sen@gmail.com",
    parentPhone: "+91 98111 22233",
    grades: { "Mathematics": 78, "Physics": 80, "Chemistry": 85, "English Literature": 87, "World History": 82 },
    attendanceHistory: generateAttendance(95.5),
    assignments: [
      { assignmentId: "HW1", status: "Graded", score: 79 },
      { assignmentId: "HW2", status: "Submitted", submissionDate: "2026-06-20" },
      { assignmentId: "HW3", status: "Graded", score: 85 }
    ],
    feeDue: 0,
    feeStatus: "Paid"
  },
  {
    id: "S5",
    name: "Aditya Rao",
    rollNo: "10B01",
    classId: "10-B",
    email: "aditya.rao@edusphere360.in",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    gender: "Male",
    attendanceRate: 92.1,
    riskStatus: "Medium",
    riskReason: "Sudden spike in late arrivals and partial assignments submissions.",
    parentName: "Dinesh Rao",
    parentEmail: "dinesh.rao@gmail.com",
    parentPhone: "+91 97654 32109",
    grades: { "Mathematics": 72, "Physics": 68, "Chemistry": 70, "English Literature": 75, "World History": 79 },
    attendanceHistory: generateAttendance(92.1),
    assignments: [
      { assignmentId: "HW4", status: "Submitted", submissionDate: "2026-06-21" }
    ],
    feeDue: 35000,
    feeStatus: "Pending"
  },
  {
    id: "S6",
    name: "Kavya Nair",
    rollNo: "10B02",
    classId: "10-B",
    email: "kavya.nair@edusphere360.in",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    gender: "Female",
    attendanceRate: 96.0,
    riskStatus: "Low",
    parentName: "Suresh Nair",
    parentEmail: "suresh.nair@gmail.com",
    parentPhone: "+91 96123 45678",
    grades: { "Mathematics": 84, "Physics": 82, "Chemistry": 86, "English Literature": 91, "World History": 88 },
    attendanceHistory: generateAttendance(96.0),
    assignments: [
      { assignmentId: "HW4", status: "Pending" }
    ],
    feeDue: 0,
    feeStatus: "Paid"
  },
  {
    id: "S7",
    name: "Sai Reddy",
    rollNo: "09A01",
    classId: "9-A",
    email: "sai.reddy@edusphere360.in",
    avatar: "https://images.unsplash.com/photo-1542345812-d9e8a97d7e45?w=150",
    gender: "Male",
    attendanceRate: 68.2, // LOW Attendance
    riskStatus: "High",
    riskReason: "Extended leaves due to documented medical condition.",
    parentName: "Krishna Reddy",
    parentEmail: "krishna.reddy@gmail.com",
    parentPhone: "+91 95432 10987",
    grades: { "Mathematics": 70, "Physics": 65, "Chemistry": 60, "English Literature": 72, "World History": 70 },
    attendanceHistory: generateAttendance(68.2),
    assignments: [],
    feeDue: 28000,
    feeStatus: "Pending"
  },
  {
    id: "S8",
    name: "Meera Joshi",
    rollNo: "09A02",
    classId: "9-A",
    email: "meera.joshi@edusphere360.in",
    avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150",
    gender: "Female",
    attendanceRate: 99.1,
    riskStatus: "Low",
    parentName: "Alok Joshi",
    parentEmail: "alok.joshi@gmail.com",
    parentPhone: "+91 98989 89898",
    grades: { "Mathematics": 96, "Physics": 94, "Chemistry": 92, "English Literature": 95, "World History": 91 },
    attendanceHistory: generateAttendance(99.1),
    assignments: [],
    feeDue: 0,
    feeStatus: "Paid"
  },
  {
    id: "S9",
    name: "Rohan Gupta",
    rollNo: "09B01",
    classId: "9-B",
    email: "rohan.gupta@edusphere360.in",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    gender: "Male",
    attendanceRate: 94.6,
    riskStatus: "Low",
    parentName: "Manoj Gupta",
    parentEmail: "manoj.gupta@gmail.com",
    parentPhone: "+91 98321 45678",
    grades: { "Mathematics": 81, "Physics": 78, "Chemistry": 75, "English Literature": 80, "World History": 83 },
    attendanceHistory: generateAttendance(94.6),
    assignments: [],
    feeDue: 0,
    feeStatus: "Paid"
  },
  {
    id: "S10",
    name: "Anika Verma",
    rollNo: "09B02",
    classId: "9-B",
    email: "anika.verma@edusphere360.in",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
    gender: "Female",
    attendanceRate: 95.0,
    riskStatus: "Low",
    parentName: "Sandeep Verma",
    parentEmail: "sandeep.verma@gmail.com",
    parentPhone: "+91 97234 56789",
    grades: { "Mathematics": 85, "Physics": 80, "Chemistry": 83, "English Literature": 88, "World History": 82 },
    attendanceHistory: generateAttendance(95.0),
    assignments: [],
    feeDue: 32000,
    feeStatus: "Pending"
  },
  {
    id: "S11",
    name: "Tanya Singh",
    rollNo: "10A05",
    classId: "10-A",
    email: "tanya.singh@edusphere360.in",
    avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150",
    gender: "Female",
    attendanceRate: 97.2,
    riskStatus: "Low",
    parentName: "Pradeep Singh",
    parentEmail: "pradeep.singh@gmail.com",
    parentPhone: "+91 99887 76655",
    grades: { "Mathematics": 92, "Physics": 90, "Chemistry": 89, "English Literature": 92, "World History": 89 },
    attendanceHistory: generateAttendance(97.2),
    assignments: [
      { assignmentId: "HW1", status: "Graded", score: 91 },
      { assignmentId: "HW2", status: "Submitted", submissionDate: "2026-06-20" },
      { assignmentId: "HW3", status: "Graded", score: 94 }
    ],
    feeDue: 0,
    feeStatus: "Paid"
  },
  {
    id: "S12",
    name: "Riya Das",
    rollNo: "10A06",
    classId: "10-A",
    email: "riya.das@edusphere360.in",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150",
    gender: "Female",
    attendanceRate: 94.0,
    riskStatus: "Medium",
    riskReason: "Slight academic decline in Sciences; parent requested close monitoring.",
    parentName: "Debashis Das",
    parentEmail: "debashis.das@gmail.com",
    parentPhone: "+91 98712 34567",
    grades: { "Mathematics": 74, "Physics": 65, "Chemistry": 62, "English Literature": 80, "World History": 85 },
    attendanceHistory: generateAttendance(94.0),
    assignments: [
      { assignmentId: "HW1", status: "Graded", score: 75 },
      { assignmentId: "HW2", status: "Pending" },
      { assignmentId: "HW3", status: "Graded", score: 81 }
    ],
    feeDue: 18000,
    feeStatus: "Pending"
  }
];

// Initial Weekly Timetable
export const initialTimetable: TimetableEntry[] = [
  // Monday
  { id: "TT1", classId: "10-A", day: "Monday", period: 1, subject: "Mathematics", teacherId: "T1", room: "Room 301" },
  { id: "TT2", classId: "10-A", day: "Monday", period: 2, subject: "Physics", teacherId: "T2", room: "Room 301" },
  { id: "TT3", classId: "10-A", day: "Monday", period: 3, subject: "English Language", teacherId: "T3", room: "Room 301" },
  { id: "TT4", classId: "10-A", day: "Monday", period: 4, subject: "World History", teacherId: "T4", room: "Room 301" },
  { id: "TT5", classId: "10-A", day: "Monday", period: 5, subject: "Chemistry", teacherId: "T2", room: "Science Lab" },
  { id: "TT6", classId: "10-A", day: "Monday", period: 6, subject: "Calculus", teacherId: "T1", room: "Room 301" },

  // Tuesday
  { id: "TT7", classId: "10-A", day: "Tuesday", period: 1, subject: "Physics", teacherId: "T2", room: "Room 301" },
  { id: "TT8", classId: "10-A", day: "Tuesday", period: 2, subject: "Mathematics", teacherId: "T1", room: "Room 301" },
  { id: "TT9", classId: "10-A", day: "Tuesday", period: 3, subject: "World History", teacherId: "T4", room: "Room 301" },
  { id: "TT10", classId: "10-A", day: "Tuesday", period: 4, subject: "English Literature", teacherId: "T3", room: "Room 301" },
  { id: "TT11", classId: "10-A", day: "Tuesday", period: 5, subject: "Chemistry", teacherId: "T2", room: "Room 301" },

  // Wednesday
  { id: "TT12", classId: "10-A", day: "Wednesday", period: 1, subject: "Mathematics", teacherId: "T1", room: "Room 301" },
  { id: "TT13", classId: "10-A", day: "Wednesday", period: 2, subject: "Calculus", teacherId: "T1", room: "Room 301" },
  { id: "TT14", classId: "10-A", day: "Wednesday", period: 3, subject: "Physics", teacherId: "T2", room: "Physics Lab" },
  { id: "TT15", classId: "10-A", day: "Wednesday", period: 4, subject: "English Language", teacherId: "T3", room: "Room 301" },

  // Thursday
  { id: "TT16", classId: "10-A", day: "Thursday", period: 1, subject: "Chemistry", teacherId: "T2", room: "Chemistry Lab" },
  { id: "TT17", classId: "10-A", day: "Thursday", period: 2, subject: "Physics", teacherId: "T2", room: "Room 301" },
  { id: "TT18", classId: "10-A", day: "Thursday", period: 3, subject: "English Literature", teacherId: "T3", room: "Room 301" },
  { id: "TT19", classId: "10-A", day: "Thursday", period: 4, subject: "World History", teacherId: "T4", room: "Room 301" },

  // Friday
  { id: "TT20", classId: "10-A", day: "Friday", period: 1, subject: "Calculus", teacherId: "T1", room: "Room 301" },
  { id: "TT21", classId: "10-A", day: "Friday", period: 2, subject: "Mathematics", teacherId: "T1", room: "Room 301" },
  { id: "TT22", classId: "10-A", day: "Friday", period: 3, subject: "Chemistry", teacherId: "T2", room: "Room 301" },
  { id: "TT23", classId: "10-A", day: "Friday", period: 4, subject: "World History", teacherId: "T4", room: "Room 301" }
];
