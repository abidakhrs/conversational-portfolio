// ─── Portfolio Data Types ───────────────────────────────────────────

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  avatar: string;
  location: string;
  available: boolean;
  availableText: string;
  social: {
    github: string;
    linkedin: string;
    email: string;
  };
}

export interface Education {
  id: string;
  degree: string;
  major: string;
  institution: string;
  shortName: string;
  location: string;
  startYear: string;
  endYear: string;
  grade: string;
  description: string;
  highlights: string[];
  image: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  companyShort: string;
  location: string;
  type: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
  skills: string[];
  image?: string; // company logo shown at detail level
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  status: string;
  year: string;
  type: string;
  image: string;
  url: string | null;
  github: string | null;
  tech: string[];
  highlights: string[];
  topics: {
    architecture: string;
    ai: string;
    stack: string;
    challenges: string;
  };
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface Contact {
  email: string;
  phone: string;
  location: string;
  responseTime: string;
  availability: string;
  preferredContact: string;
  social: {
    platform: string;
    label: string;
    url: string;
    icon: string;
  }[];
}

// ─── Conversation Engine Types ───────────────────────────────────────

export type ConversationState =
  | { type: 'WELCOME' }
  | { type: 'EDUCATION' }
  | { type: 'EDUCATION_DETAIL'; id: string }
  | { type: 'EXPERIENCE' }
  | { type: 'EXPERIENCE_DETAIL'; id: string }
  | { type: 'PROJECTS' }
  | { type: 'PROJECT_DETAIL'; id: string }
  | { type: 'PROJECT_TOPIC'; projectId: string; topic: keyof Project['topics'] }
  | { type: 'SKILLS' }
  | { type: 'CONTACT' };

export type IntentType =
  | 'EDUCATION'
  | 'EXPERIENCE'
  | 'PROJECTS'
  | 'SKILLS'
  | 'CONTACT'
  | 'BACK'
  | 'HOME'
  | 'GREETING'
  | 'HELP'
  | 'UNKNOWN'
  | 'EXP_COGNIZANT'
  | 'EXP_DELOITTE'
  | 'EXP_FIFWAY'
  | 'PROJ_NIKOH'
  | 'PROJ_WARNA'
  | 'PROJ_TRANSACTION'
  | 'EDU_BACHELOR'
  | 'EDU_DIPLOMA';

export interface IntentResult {
  intent: IntentType;
  confidence: number;
  entityId?: string;
}

// ─── Message Types ───────────────────────────────────────────────────

export type MessageRole = 'assistant' | 'user';

export interface QuickAction {
  label: string;
  payload: string;
  icon?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  quickActions?: QuickAction[];
  // Typed slot for rendered card data
  card?: CardPayload;
}

export type CardPayload =
  | { type: 'education-list'; data: Education[] }
  | { type: 'education-detail'; data: Education }
  | { type: 'experience-list'; data: Experience[] }
  | { type: 'experience-detail'; data: Experience }
  | { type: 'project-list'; data: Project[] }
  | { type: 'project-detail'; data: Project }
  | { type: 'project-topic'; data: Project; topic: keyof Project['topics'] }
  | { type: 'skills'; data: SkillCategory[] }
  | { type: 'contact'; data: Contact };
