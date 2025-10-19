export type Subject = {
  id: string;
  name: string;
};

const commonSubjects: Subject[] = [
  { id: 'math', name: 'Mathematics' },
  { id: 'science', name: 'Science' },
  { id: 'english', name: 'English' },
  { id: 'history', name: 'History' },
];

const gradeSubjects: Record<string, Subject[]> = {
  'Class 6': commonSubjects,
  'Class 7': commonSubjects,
  'Class 8': commonSubjects,
  'Class 9': commonSubjects,
  'Class 10': commonSubjects,
  'Class 11': [
      ...commonSubjects,
      { id: 'computer-science', name: 'Computer Science' }
  ],
  'Class 12': [
      ...commonSubjects,
      { id: 'computer-science', name: 'Computer Science' }
  ],
  'College': [
    { id: 'computer-science', name: 'Computer Science' },
    { id: 'art', name: 'Art' },
  ],
  'Competitive Exam': [
    { id: 'math', name: 'Quantitative Aptitude' },
    { id: 'english', name: 'Verbal Ability' },
  ],
};

export const getSubjectsForGrade = (grade: string): Subject[] => {
  return gradeSubjects[grade] || [];
};
