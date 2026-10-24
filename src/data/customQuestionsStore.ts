import { FullDatabase } from './database';

export interface ParsedQuestionItem {
  id: string;
  questionNumber: string;
  department: string;
  subspecialty: string;
  topic: string;
  fullQuestionText: string;
  marks?: string;
}

export interface ParsedPaperResult {
  examTitle: string;
  examDiet: string;
  isMockExam: boolean;
  paperType: string;
  department: string;
  questions: ParsedQuestionItem[];
}

export interface UploadHistoryItem {
  id: string;
  timestamp: number;
  examTitle: string;
  examDiet: string;
  isMockExam: boolean;
  questionCount: number;
  imagePreview?: string;
  departments: string[];
}

const STORAGE_KEY_CUSTOM_DB = 'final_mb_custom_database';
const STORAGE_KEY_CUSTOM_TEXTS = 'final_mb_custom_questions_text';
const STORAGE_KEY_HISTORY = 'final_mb_upload_history';

/**
 * Retrieve custom database entries saved in localStorage
 */
export function getCustomDatabase(): FullDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_DB);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load custom database from localStorage', e);
  }
  return {};
}

/**
 * Retrieve custom verbatim texts saved in localStorage
 */
export function getCustomQuestionsText(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_TEXTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load custom questions text from localStorage', e);
  }
  return {};
}

/**
 * Retrieve upload history
 */
export function getUploadHistory(): UploadHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load upload history from localStorage', e);
  }
  return [];
}

/**
 * Deep merge base database with custom database
 */
export function mergeDatabases(base: FullDatabase, custom: FullDatabase): FullDatabase {
  const merged: FullDatabase = {};

  // First copy base
  for (const [dept, subMap] of Object.entries(base)) {
    merged[dept] = {};
    for (const [sub, topics] of Object.entries(subMap)) {
      merged[dept][sub] = topics.map((t) => ({
        topic: t.topic,
        occurrences: [...t.occurrences],
      }));
    }
  }

  // Then merge custom
  for (const [dept, subMap] of Object.entries(custom)) {
    if (!merged[dept]) {
      merged[dept] = {};
    }
    for (const [sub, topics] of Object.entries(subMap)) {
      if (!merged[dept][sub]) {
        merged[dept][sub] = [];
      }
      for (const customTopic of topics) {
        const existingTopic = merged[dept][sub].find(
          (t) => t.topic.trim().toLowerCase() === customTopic.topic.trim().toLowerCase()
        );
        if (existingTopic) {
          // Merge occurrences without duplicates
          for (const occ of customTopic.occurrences) {
            if (!existingTopic.occurrences.includes(occ)) {
              existingTopic.occurrences.push(occ);
            }
          }
        } else {
          merged[dept][sub].push({
            topic: customTopic.topic,
            occurrences: [...customTopic.occurrences],
          });
        }
      }
    }
  }

  return merged;
}

/**
 * Merge base questions text dictionary with custom dictionary
 */
export function mergeQuestionTexts(
  base: Record<string, string>,
  custom: Record<string, string>
): Record<string, string> {
  return {
    ...base,
    ...custom,
  };
}

/**
 * Commit parsed questions from an uploaded paper to persistent storage
 */
export function saveUploadedQuestions(
  paperMeta: {
    examTitle: string;
    examDiet: string;
    isMockExam: boolean;
    paperType?: string;
    imagePreview?: string;
  },
  questions: ParsedQuestionItem[]
): { occurrencesAdded: string[]; departmentsAffected: string[] } {
  const currentCustomDb = getCustomDatabase();
  const currentCustomTexts = getCustomQuestionsText();
  const currentHistory = getUploadHistory();

  const occurrencesAdded: string[] = [];
  const departmentsSet = new Set<string>();

  const dietClean = paperMeta.examDiet.trim();
  const isMock = paperMeta.isMockExam;

  questions.forEach((q) => {
    const dept = q.department?.trim() || 'Internal Medicine';
    const sub = q.subspecialty?.trim() || 'General';
    const topicTitle = q.topic?.trim() || 'Clinical Management';
    departmentsSet.add(dept);

    // Format occurrence string e.g.:
    // "LAQ 1, October 2026 Mock (Surgery)" or "Q3, April 2025 (Medicine)"
    const deptTag = dept.includes('Surgery')
      ? 'Surgery'
      : dept.includes('Psychiatry')
      ? 'Psychiatry'
      : dept.includes('Community')
      ? 'Comm. Med'
      : 'Medicine';

    const occTag = isMock ? 'Mock' : '';
    const dietPart = `${dietClean}${occTag ? ` ${occTag}` : ''}${deptTag ? ` (${deptTag})` : ''}`;
    const occString = `${q.questionNumber.trim()}, ${dietPart}`.trim();
    occurrencesAdded.push(occString);

    // 1. Add text to custom texts dictionary with multiple key aliases
    currentCustomTexts[occString] = q.fullQuestionText;
    currentCustomTexts[`${q.questionNumber.trim()}, ${dietClean}${occTag ? ` ${occTag}` : ''}`] = q.fullQuestionText;
    currentCustomTexts[`${q.questionNumber.trim()}, ${dietClean}`] = q.fullQuestionText;

    // 2. Add to database structure
    if (!currentCustomDb[dept]) {
      currentCustomDb[dept] = {};
    }
    if (!currentCustomDb[dept][sub]) {
      currentCustomDb[dept][sub] = [];
    }

    const existing = currentCustomDb[dept][sub].find(
      (t) => t.topic.trim().toLowerCase() === topicTitle.toLowerCase()
    );

    if (existing) {
      if (!existing.occurrences.includes(occString)) {
        existing.occurrences.push(occString);
      }
    } else {
      currentCustomDb[dept][sub].push({
        topic: topicTitle,
        occurrences: [occString],
      });
    }
  });

  // Save to history
  const historyItem: UploadHistoryItem = {
    id: `upload_${Date.now()}`,
    timestamp: Date.now(),
    examTitle: paperMeta.examTitle || 'Uploaded Medical Exam Paper',
    examDiet: dietClean,
    isMockExam: isMock,
    questionCount: questions.length,
    imagePreview: paperMeta.imagePreview,
    departments: Array.from(departmentsSet),
  };

  currentHistory.unshift(historyItem);

  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_DB, JSON.stringify(currentCustomDb));
    localStorage.setItem(STORAGE_KEY_CUSTOM_TEXTS, JSON.stringify(currentCustomTexts));
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(currentHistory));
  } catch (err) {
    console.error('Failed to write to localStorage', err);
  }

  return {
    occurrencesAdded,
    departmentsAffected: Array.from(departmentsSet),
  };
}

/**
 * Clear all custom uploaded papers and reset back to standard question bank
 */
export function clearCustomDatabase(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_DB);
    localStorage.removeItem(STORAGE_KEY_CUSTOM_TEXTS);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch (e) {
    console.error('Failed to clear custom database', e);
  }
}
