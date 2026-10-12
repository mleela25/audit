import { SchoolPattern } from '../types';

// Keep only school patterns as reference data, remove all mock student data
export const schoolPatterns: SchoolPattern[] = [
  {
    schoolName: 'Delhi Public School',
    board: 'CBSE',
    examFrequency: 'Monthly + Quarterly',
    chapterPacing: 2.5,
    examStyle: 'Comprehensive with MCQs and Descriptive',
    subjects: ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi']
  },
  {
    schoolName: 'Ryan International School',
    board: 'ICSE',
    examFrequency: 'Weekly Tests + Semester',
    chapterPacing: 2,
    examStyle: 'Detailed Descriptive with Practical',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History']
  },
  {
    schoolName: 'Fountainhead School',
    board: 'IGCSE',
    examFrequency: 'Continuous Assessment + Final',
    chapterPacing: 1.8,
    examStyle: 'International Standard with Coursework',
    subjects: ['Mathematics', 'Sciences', 'English', 'Global Perspectives', 'ICT']
  },
  {
    schoolName: 'Kendriya Vidyalaya',
    board: 'CBSE',
    examFrequency: 'Unit Tests + Term Exams',
    chapterPacing: 2.2,
    examStyle: 'NCERT Based with Application',
    subjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science']
  },
  {
    schoolName: 'St. Xavier\'s High School',
    board: 'GSEB',
    examFrequency: 'Monthly + Semester',
    chapterPacing: 2.8,
    examStyle: 'State Board Pattern with Gujarati',
    subjects: ['Mathematics', 'Science', 'English', 'Gujarati', 'Social Studies']
  },
  {
    schoolName: 'Zydus School',
    board: 'CBSE',
    examFrequency: 'Periodic + Annual',
    chapterPacing: 2.3,
    examStyle: 'Modern Teaching with Technology',
    subjects: ['Mathematics', 'Science', 'English', 'Computer Science', 'Physical Education']
  },
  {
    schoolName: 'Udgam School',
    board: 'IGCSE',
    examFrequency: 'Continuous + Cambridge Exams',
    chapterPacing: 1.5,
    examStyle: 'International Curriculum',
    subjects: ['Mathematics', 'Sciences', 'English Literature', 'Business Studies', 'Art & Design']
  },
  {
    schoolName: 'Navrachana School',
    board: 'IB',
    examFrequency: 'Internal Assessment + Final',
    chapterPacing: 1.2,
    examStyle: 'Inquiry Based Learning',
    subjects: ['Mathematics', 'Sciences', 'Languages', 'Theory of Knowledge', 'Extended Essay']
  },
  {
    schoolName: 'Anand Niketan',
    board: 'CBSE',
    examFrequency: 'Monthly + Board Prep',
    chapterPacing: 2.4,
    examStyle: 'Board Exam Focused',
    subjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science']
  },
  {
    schoolName: 'Calorx Public School',
    board: 'GSEB',
    examFrequency: 'Unit Tests + Board Exams',
    chapterPacing: 2.6,
    examStyle: 'Traditional with Modern Methods',
    subjects: ['Mathematics', 'Science', 'English', 'Gujarati', 'Sanskrit']
  }
];
