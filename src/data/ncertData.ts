import { ClassOption } from '../types';
import chapterNamesData from '../../chapter_names.json';

export const CLASSES_LIST: ClassOption[] = Array.from({ length: 12 }, (_, i) => ({
  id: `class-${i + 1}`,
  label: `Class ${i + 1}`,
  gradeNumber: i + 1,
}));

export const SUBJECTS_BY_CLASS: Record<string, string[]> = {
  // Class 1 - 5: Primary
  primary: ['English', 'Hindi', 'Mathematics', 'EVS (Environmental Studies)'],
  // Class 6 - 8: Middle School
  middle: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  // Class 9 - 10: Secondary
  secondary: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  // Class 11 - 12: Higher Secondary (combined stream list)
  senior: [
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'English',
    'Accountancy',
    'Business Studies',
    'Economics',
    'History',
    'Political Science',
    'Geography',
  ],
};

export function getSubjectsForClass(classId: string): string[] {
  const gradeNum = parseInt(classId.replace('class-', ''), 10) || 9;
  if (gradeNum >= 1 && gradeNum <= 5) {
    return SUBJECTS_BY_CLASS.primary;
  } else if (gradeNum >= 6 && gradeNum <= 8) {
    return SUBJECTS_BY_CLASS.middle;
  } else if (gradeNum >= 9 && gradeNum <= 10) {
    return SUBJECTS_BY_CLASS.secondary;
  } else {
    return SUBJECTS_BY_CLASS.senior;
  }
}

// NCERT Chapter repository mapped by class and subject key (e.g. "class-9:Science")
export const CHAPTERS_DATABASE: Record<string, string[]> = {
  // Class 9 Science
  'class-9:Science': [
    'Matter in Our Surroundings',
    'Is Matter Around Us Pure',
    'Atoms and Molecules',
    'Structure of the Atom',
    'The Fundamental Unit of Life (Cell)',
    'Tissues',
    'Motion',
    'Force and Laws of Motion',
    'Gravitation',
    'Work and Energy',
    'Sound',
    'Improvement in Food Resources',
  ],
  // Class 9 Mathematics
  'class-9:Mathematics': [
    'Number Systems',
    'Polynomials',
    'Coordinate Geometry',
    'Linear Equations in Two Variables',
    'Introduction to Euclid’s Geometry',
    'Lines and Angles',
    'Triangles',
    'Quadrilaterals',
    'Circles',
    'Heron’s Formula',
    'Surface Areas and Volumes',
    'Statistics',
  ],
  // Class 10 Science
  'class-10:Science': [
    'Chemical Reactions and Equations',
    'Acids, Bases and Salts',
    'Metals and Non-metals',
    'Carbon and its Compounds',
    'Life Processes',
    'Control and Coordination',
    'How do Organisms Reproduce?',
    'Heredity and Evolution',
    'Light - Reflection and Refraction',
    'The Human Eye and the Colorful World',
    'Electricity',
    'Magnetic Effects of Electric Current',
    'Our Environment',
  ],
  // Class 10 Mathematics
  'class-10:Mathematics': [
    'Real Numbers',
    'Polynomials',
    'Pair of Linear Equations in Two Variables',
    'Quadratic Equations',
    'Arithmetic Progressions',
    'Triangles',
    'Coordinate Geometry',
    'Introduction to Trigonometry',
    'Some Applications of Trigonometry',
    'Circles',
    'Areas Related to Circles',
    'Surface Areas and Volumes',
    'Statistics',
    'Probability',
  ],
  // Class 11 Physics
  'class-11:Physics': [
    'Units and Measurements',
    'Motion in a Straight Line',
    'Motion in a Plane',
    'Laws of Motion',
    'Work, Energy and Power',
    'System of Particles and Rotational Motion',
    'Gravitation',
    'Mechanical Properties of Solids',
    'Mechanical Properties of Fluids',
    'Thermal Properties of Matter',
    'Thermodynamics',
    'Kinetic Theory',
    'Oscillations',
    'Waves',
  ],
  // Class 12 Physics
  'class-12:Physics': [
    'Electric Charges and Fields',
    'Electrostatic Potential and Capacitance',
    'Current Electricity',
    'Moving Charges and Magnetism',
    'Magnetism and Matter',
    'Electromagnetic Induction',
    'Alternating Current',
    'Electromagnetic Waves',
    'Ray Optics and Optical Instruments',
    'Wave Optics',
    'Dual Nature of Radiation and Matter',
    'Atoms',
    'Nuclei',
    'Semiconductor Electronics',
  ],
  // Class 6 Science
  'class-6:Science': [
    'Components of Food',
    'Sorting Materials into Groups',
    'Separation of Substances',
    'Getting to Know Plants',
    'Body Movements',
    'The Living Organisms — Characteristics and Habitats',
    'Motion and Measurement of Distances',
    'Light, Shadows and Reflections',
    'Electricity and Circuits',
    'Fun with Magnets',
    'Air Around Us',
  ],
  // Class 7 Science
  'class-7:Science': [
    'Nutrition in Plants',
    'Nutrition in Animals',
    'Heat',
    'Acids, Bases and Salts',
    'Physical and Chemical Changes',
    'Respiration in Organisms',
    'Transportation in Animals and Plants',
    'Reproduction in Plants',
    'Motion and Time',
    'Electric Current and its Effects',
    'Light',
    'Forests: Our Lifeline',
    'Wastewater Story',
  ],
  // Class 8 Science
  'class-8:Science': [
    'Crop Production and Management',
    'Microorganisms: Friend and Foe',
    'Coal and Petroleum',
    'Combustion and Flame',
    'Conservation of Plants and Animals',
    'Reproduction in Animals',
    'Reaching the Age of Adolescence',
    'Force and Pressure',
    'Friction',
    'Sound',
    'Chemical Effects of Electric Current',
    'Some Natural Phenomena',
    'Light',
  ],
};

function getSubjectKey(subject: string): string {
  const normalized = subject.toLowerCase().trim();
  if (normalized === 'mathematics') return 'maths';
  if (normalized === 'evs (environmental studies)') return 'evs';
  return normalized.replace(/\s+/g, '-');
}

export function getChaptersForClassAndSubject(classId: string, subject: string): string[] {
  const subjectKey = getSubjectKey(subject);
  // @ts-ignore
  const classData = chapterNamesData[classId];
  if (classData && classData[subjectKey]) {
    const chaptersObj = classData[subjectKey];
    const uniqueChapters = new Set<string>();

    for (const key of Object.keys(chaptersObj)) {
      const val = chaptersObj[key];
      if (typeof val === 'string') {
        const parts = val.split('--');
        const chapterName = parts.length > 1 ? parts.slice(1).join('--').trim() : val.trim();

        const lowerName = chapterName.toLowerCase();
        const isPrelims = lowerName === 'prelims / contents' || lowerName === 'prelims/contents';
        const isGlossary = lowerName === 'glossary';
        const isAppendix = lowerName === 'appendix';
        const isSubjectName = lowerName === subject.toLowerCase();
        const isChapterNum = /^chapter\s*\d+$/i.test(lowerName);
        const isJustNumber = /^\d+$/.test(lowerName);
        const isCodeLike = /^[a-z0-9]{5,10}$/i.test(lowerName) && /\d/.test(lowerName);

        if (!isPrelims && !isGlossary && !isAppendix && !isSubjectName && !isChapterNum && !isJustNumber && !isCodeLike) {
          uniqueChapters.add(chapterName);
        }
      }
    }

    const chaptersList = Array.from(uniqueChapters);
    if (chaptersList.length > 0) {
      return chaptersList;
    }
  }

  const key = `${classId}:${subject}`;
  if (CHAPTERS_DATABASE[key]) {
    return CHAPTERS_DATABASE[key];
  }

  // Fallback generic chapters if specific combination is not in sample database
  return [
    `Introduction to ${subject}`,
    `Fundamental Concepts & Terminology`,
    `Core Principles & Theories`,
    `Practical Applications & Examples`,
    `Advanced Analytical Problems`,
    `Summary & Comprehensive Revision`,
  ];
}
