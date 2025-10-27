
export type Subject = {
  id: string;
  name: string;
};

export type SubjectCategory = {
  category: string;
  subjects: Subject[];
};

export type GradeStream = {
  [key: string]: SubjectCategory[];
};

export type GradeLevel = {
  [key: string]: GradeStream | SubjectCategory[];
};

const schoolSubjects: { [key: string]: SubjectCategory[] } = {
  'common': [
    {
      category: 'Core Subjects',
      subjects: [
        { id: 'science', name: 'Science' },
        { id: 'math', name: 'Mathematics' },
        { id: 'social-science', name: 'Social Science' },
        { id: 'english', name: 'English' },
        { id: 'tamil', name: 'Tamil' },
      ],
    },
    {
      category: 'Additional',
      subjects: [
        { id: 'evs', name: 'Environmental Studies' },
        { id: 'cs', name: 'Computer Science' },
        { id: 'gk', name: 'General Knowledge' },
      ],
    },
  ],
};

const higherSecondaryStreams: GradeStream = {
    'Bio-Maths': [
        { category: 'Core Subjects', subjects: [
            { id: 'physics', name: 'Physics' },
            { id: 'chemistry', name: 'Chemistry' },
            { id: 'biology', name: 'Biology' },
            { id: 'math', name: 'Mathematics' },
            { id: 'english', name: 'English' },
            { id: 'tamil', name: 'Tamil / Second Language' },
        ]}
    ],
    'Computer Science': [
        { category: 'Core Subjects', subjects: [
            { id: 'physics', name: 'Physics' },
            { id: 'chemistry', name: 'Chemistry' },
            { id: 'math', name: 'Mathematics' },
            { id: 'computer-science', name: 'Computer Science' },
            { id: 'english', name: 'English' },
            { id: 'tamil', name: 'Tamil / Second Language' },
        ]}
    ],
    'Commerce': [
        { category: 'Core Subjects', subjects: [
            { id: 'accountancy', name: 'Accountancy' },
            { id: 'business-studies', name: 'Business Studies' },
            { id: 'economics', name: 'Economics' },
            { id: 'math-cs-app', name: 'Mathematics / Computer Applications' },
            { id: 'english', name: 'English' },
            { id: 'tamil', name: 'Tamil / Second Language' },
        ]}
    ],
};

const collegeStreams: GradeStream = {
    'Engineering': [
        { category: 'Common First Year', subjects: [
            { id: 'eng-math', name: 'Engineering Mathematics' },
            { id: 'eng-physics', name: 'Physics for Engineers' },
            { id: 'eng-chem', name: 'Chemistry for Engineers' },
            { id: 'eng-prog', name: 'Computer Programming' },
            { id: 'eee-fun', name: 'Electrical & Electronics Fundamentals' },
            { id: 'eng-mech', name: 'Mechanics / Engineering Graphics' },
        ]},
        { category: 'Core Branch Subjects', subjects: [
            { id: 'mech-core', name: 'Mechanical Core' },
            { id: 'ece-core', name: 'ECE Core' },
            { id: 'cse-core', name: 'CSE/IT Core' },
            { id: 'civil-core', name: 'Civil Core' },
            { id: 'eee-core', name: 'EEE Core' },
        ]}
    ],
    'Arts and Science': [
        { category: 'Subjects', subjects: [
            { id: 'literature', name: 'English Literature' },
            { id: 'social-science', name: 'History / Political Science / Sociology' },
            { id: 'psychology', name: 'Psychology' },
            { id: 'economics', name: 'Economics' },
            { id: 'cs-ds', name: 'Computer Applications / Data Science' },
            { id: 'math-stats', name: 'Mathematics / Statistics' },
        ]}
    ],
    'Medical': [
        { category: 'Core Subjects', subjects: [
            { id: 'physics', name: 'Physics' },
            { id: 'chemistry', name: 'Chemistry' },
            { id: 'biology', name: 'Biology' },
            { id: 'anatomy', name: 'Anatomy' },
            { id: 'physiology', name: 'Physiology' },
            { id: 'biochemistry', name: 'Biochemistry' },
        ]}
    ],
    'Law': [
        { category: 'Core Subjects', subjects: [
            { id: 'const-law', name: 'Constitutional Law' },
            { id: 'crim-law', name: 'Criminal Law' },
            { id: 'civil-law', name: 'Civil Law' },
            { id: 'contract-law', name: 'Contract Law' },
        ]}
    ],
    'Architecture': [
        { category: 'Core Subjects', subjects: [
            { id: 'design-principles', name: 'Design Principles' },
            { id: 'arch-drawing', name: 'Architectural Drawing' },
            { id: 'bldg-materials', name: 'Building Materials & Construction' },
            { id: 'struct-mech', name: 'Structural Mechanics' },
        ]}
    ]
};

const competitiveExams: GradeStream = {
    'UPSC': [
        { category: 'Prelims', subjects: [
            { id: 'gs1', name: 'General Studies (GS Paper I)' },
            { id: 'csat', name: 'CSAT (GS Paper II)' },
        ]},
        { category: 'Mains', subjects: [
            { id: 'essay', name: 'Essay' },
            { id: 'gs-mains', name: 'General Studies I–IV' },
            { id: 'optional', name: 'Optional Subject' },
        ]}
    ],
    'TNPSC': [
        { category: 'Core Subjects', subjects: [
            { id: 'gs-tnpsc', name: 'General Studies' },
            { id: 'current-affairs', name: 'Current Affairs' },
            { id: 'aptitude', name: 'Aptitude & Mental Ability' },
            { id: 'tamil-lang', name: 'Tamil Language Paper' },
        ]}
    ],
    'GATE': [
        { category: 'Core Subjects', subjects: [
            { id: 'eng-math', name: 'Engineering Mathematics' },
            { id: 'core-eng', name: 'Core Engineering Subject' },
            { id: 'gen-aptitude', name: 'General Aptitude' },
        ]}
    ],
    'CSAT': [
        { category: 'Core Subjects', subjects: [
            { id: 'comprehension', name: 'Comprehension' },
            { id: 'reasoning', name: 'Logical Reasoning' },
            { id: 'decision-making', name: 'Decision Making' },
            { id: 'mental-ability', name: 'General Mental Ability' },
        ]}
    ]
};


export const gradeSubjectMap: GradeLevel = {
    'Class 6': schoolSubjects['common'],
    'Class 7': schoolSubjects['common'],
    'Class 8': schoolSubjects['common'],
    'Class 9': schoolSubjects['common'],
    'Class 10': schoolSubjects['common'],
    'Class 11': higherSecondaryStreams,
    'Class 12': higherSecondaryStreams,
    'College': collegeStreams,
    'Competitive Exam': competitiveExams
};

export const getSubjectsForGrade = (grade: string, stream?: string): SubjectCategory[] => {
    const level = gradeSubjectMap[grade];
    if (!level) return [];

    // If a stream is provided and the level has streams (is not an array)
    if (stream && !Array.isArray(level) && level[stream]) {
        return level[stream];
    }
    
    // If the level is just an array of categories (for grades 6-10)
    if (Array.isArray(level)) {
        return level;
    }

    // Fallback for higher levels if no stream is selected or matches (e.g., return all subjects)
    if (!Array.isArray(level)) {
        return Object.values(level).flat();
    }

    return [];
};
