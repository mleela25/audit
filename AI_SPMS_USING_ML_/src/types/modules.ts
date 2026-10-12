// Updated types for the 8 modules with exact field specifications
export interface TuitionWorkEntry {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  subject: string;
  chapterTopic: string;
  workDescription: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
  remarksByMentor: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolClassworkHomework {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  subject: string;
  workType: 'Classwork' | 'Homework';
  description: string;
  status: 'Done' | 'Partially Done' | 'Not Done';
  source: 'Diary Entry' | 'Screenshot' | 'Verbal';
  createdAt: string;
  updatedAt: string;
}

export interface TuitionPendingWork {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  subject: string;
  pendingTask: string;
  reminderSent: boolean;
  status: 'Cleared' | 'Still Pending';
  numberOfRemindersSent: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestTrackerEntry {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  subject: string;
  chapter: string;
  testType: 'School Test' | 'Practice Test' | 'Past Paper' | 'Mock Test';
  syllabus: string;
  marksScored: number;
  totalMarks: number;
  percentage: number;
  performanceTrend: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaperCheckEntry {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  subject: string;
  paperType: 'Homework' | 'Classwork' | 'Test' | 'Practice Paper';
  checkedBy: string;
  status: 'Checked' | 'Not Checked' | 'Recheck Required';
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoubtBoxEntry {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  subject: string;
  chapter: string;
  topic: string;
  doubtType: 'Conceptual' | 'Careless' | 'Memory' | 'Application' | 'Confusion';
  doubtDescription: string;
  resolved: boolean;
  resolvedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CambridgePaperEntry {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  subject: string;
  paperNumber: string;
  code: string;
  variant: '1' | '2' | '3';
  series: 'May/June' | 'Oct/Nov';
  status: 'Assigned' | 'Attempted' | 'Checked' | 'Feedback Given';
  linkToPaper?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkPoolEntry {
  id: string;
  date: string;
  batch: string;
  studentId: string;
  studentName: string;
  workType: 'School Work' | 'Tuition Work';
  subject: string;
  chapterNumber: number;
  chapterName: string;
  topic: string;
  description: string;
  status: 'Assign' | 'Pending' | 'Completed';
  dueDate: string;
  url?: string;
  files?: string[];
  commentByMentor?: string;
  createdAt: string;
  updatedAt: string;
}

export type ModuleType = 'tuition-work' | 'school-classwork' | 'tuition-pending' | 'test-tracker' | 'paper-check' | 'doubt-box' | 'cambridge-paper' | 'work-pool';
export type ViewMode = 'grid' | 'list';