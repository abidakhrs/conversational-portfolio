import type {
  ConversationState,
  Message,
  QuickAction,
  Education,
  Experience,
  Project,
  SkillCategory,
  Contact,
  Profile,
} from '@/types/portfolio';

// ─── Content data (imported from JSON) ───────────────────────────────

import profileData from '@/data/profile.json';
import educationData from '@/data/education.json';
import experienceData from '@/data/experience.json';
import projectsData from '@/data/projects.json';
import skillsData from '@/data/skills.json';
import contactData from '@/data/contact.json';

const profile = profileData as Profile;
const education = educationData as Education[];
const experience = experienceData as Experience[];
const projects = projectsData as Project[];
const skills = skillsData as SkillCategory[];
const contact = contactData as Contact;

// ─── Derived copy ─────────────────────────────────────────────────────
//
// Narrative text is derived from the data wherever possible so that editing
// the JSON can never silently invalidate a hardcoded claim.

const currentRole = experience.find((e) => e.current);
const companies = Array.from(new Set(experience.map((e) => e.companyShort)));

// Reads as "Cognizant, Deloitte, CyberSphere and FIFWAY" for any data set.
const companyList = [
  companies.slice(0, -1).join(', '),
  companies.slice(-1)[0],
]
  .filter(Boolean)
  .join(' and ');

const experienceSummary = currentRole
  ? `I'm currently a ${currentRole.title} at ${currentRole.company}, and I've worked across ${companyList} — from software development to performance testing. Here's the journey so far.`
  : `I've worked across ${companyList} — from software development to performance testing. Here's the journey so far.`;

const projectDisciplines = Array.from(
  new Set(projects.map((p) => p.type.replace(' Web App', '').replace(' Tool', '')))
);

const projectSummary = `I've built ${projects.length} projects spanning ${projectDisciplines
  .slice(0, -1)
  .join(', ')} and ${projectDisciplines.slice(-1)[0]}. One of them is this page. Yes, really — pick it and I'll explain.`;

// The portfolio you are using is itself one of the projects. When someone
// opens its detail, say the quiet part out loud.
const SELF_PROJECT_ID = 'conversational-portfolio';
const selfAware = (id: string) => id === SELF_PROJECT_ID;

// ─── Helpers ──────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function msg(
  content: string,
  quickActions?: QuickAction[],
  card?: Message['card']
): Omit<Message, 'id' | 'timestamp'> {
  return { role: 'assistant', content, quickActions, card };
}

// The five section shortcuts are reused by several states.
function sectionActions(): QuickAction[] {
  return [
    { label: '🎓 Education', payload: 'education', icon: 'GraduationCap' },
    { label: '💼 Experience', payload: 'experience', icon: 'Briefcase' },
    { label: '🚀 Projects', payload: 'projects', icon: 'Rocket' },
    { label: '🛠️ Skills', payload: 'skills', icon: 'Wrench' },
    { label: '📬 Contact', payload: 'contact', icon: 'Mail' },
  ];
}

// ─── Route to response based on state ────────────────────────────────

export function resolveResponse(state: ConversationState): Omit<Message, 'id' | 'timestamp'> {
  switch (state.type) {
    case 'WELCOME':
      return msg(
        `Hi 👋 I'm **${profile.name}** — ${profile.title} based in ${profile.location}.\n\n${profile.tagline}\n\nNo menu, no scrolling walls of text. Just ask me stuff. What would you like to know?`,
        sectionActions()
      );

    case 'EDUCATION':
      return msg(
        `Here's my academic background — ${education.length} qualifications. The short version: I kept going back for more.`,
        [
          ...education.map((e) => ({
            label: `🎓 ${e.shortName} — ${e.major}`,
            payload: `edu:${e.id}`,
          })),
          { label: '← Back', payload: 'home' },
        ],
        { type: 'education-list', data: education }
      );

    case 'EDUCATION_DETAIL': {
      const edu = education.find((e) => e.id === state.id);
      if (!edu) return resolveResponse({ type: 'EDUCATION' });
      return msg(
        `**${edu.degree}** in ${edu.major} at ${edu.institution}\n\n${edu.description}`,
        [
          { label: '← All Education', payload: 'education' },
          { label: '💼 Experience', payload: 'experience' },
        ],
        { type: 'education-detail', data: edu }
      );
    }

    case 'EXPERIENCE':
      return msg(
        experienceSummary,
        [
          ...experience.map((e) => ({
            label: `${e.current ? '🟢' : '⚪'} ${e.companyShort} — ${e.title}`,
            payload: `exp:${e.id}`,
          })),
          { label: '← Back', payload: 'home' },
        ],
        { type: 'experience-list', data: experience }
      );

    case 'EXPERIENCE_DETAIL': {
      const exp = experience.find((e) => e.id === state.id);
      if (!exp) return resolveResponse({ type: 'EXPERIENCE' });
      return msg(
        `**${exp.title}** at ${exp.company} (${exp.startDate} – ${exp.endDate})\n\n${exp.description}`,
        [
          { label: '← All Experience', payload: 'experience' },
          { label: '🚀 Projects', payload: 'projects' },
        ],
        { type: 'experience-detail', data: exp }
      );
    }

    case 'PROJECTS':
      return msg(
        projectSummary,
        [
          ...projects.map((p) => ({
            label: `🚀 ${p.name}`,
            payload: `project:${p.id}`,
          })),
          { label: '← Back', payload: 'home' },
        ],
        { type: 'project-list', data: projects }
      );

    case 'PROJECT_DETAIL': {
      const project = projects.find((p) => p.id === state.id);
      if (!project) return resolveResponse({ type: 'PROJECTS' });
      const intro = selfAware(project.id)
        ? `**${project.name}** — this very thing you're looking at right now. 👀\n\n${project.tagline}\n\nYes, the portfolio is one of my projects. Clicking this was the demo.\n\n${project.description}`
        : `**${project.name}** — ${project.tagline}\n\n${project.description}`;
      return msg(
        intro,
        [
          { label: '🏗️ Architecture', payload: `topic:${project.id}:architecture` },
          { label: '🤖 AI / Automation', payload: `topic:${project.id}:ai` },
          { label: '💻 Tech Stack', payload: `topic:${project.id}:stack` },
          { label: '⚡ Challenges', payload: `topic:${project.id}:challenges` },
          { label: '← All Projects', payload: 'projects' },
        ],
        { type: 'project-detail', data: project }
      );
    }

    case 'PROJECT_TOPIC': {
      const project = projects.find((p) => p.id === state.projectId);
      if (!project) return resolveResponse({ type: 'PROJECTS' });
      const topicLabels: Record<keyof Project['topics'], string> = {
        architecture: '🏗️ Architecture',
        ai: '🤖 AI / Automation',
        stack: '💻 Tech Stack',
        challenges: '⚡ Challenges',
      };
      return msg(
        `**${topicLabels[state.topic]}** — ${project.name}\n\n${project.topics[state.topic]}`,
        [
          { label: '← Back to project', payload: `project:${project.id}` },
          { label: '🚀 All Projects', payload: 'projects' },
        ],
        { type: 'project-topic', data: project, topic: state.topic }
      );
    }

    case 'SKILLS':
      return msg(
        `Here's my technical toolkit across ${skills.length} categories. Ask me about any of them and I'll happily go deeper.`,
        [
          { label: '💼 Experience', payload: 'experience' },
          { label: '🚀 Projects', payload: 'projects' },
          { label: '← Back', payload: 'home' },
        ],
        { type: 'skills', data: skills }
      );

    case 'CONTACT':
      return msg(
        `Let's talk — ${contact.availability}.\n\n${contact.responseTime}. I actually do reply.`,
        [
          { label: '📧 Email me', payload: `mailto:${contact.email}` },
          { label: '← Back', payload: 'home' },
        ],
        { type: 'contact', data: contact }
      );

    default:
      return msg(
        `Hmm, that one went straight over my head. Try rephrasing, or tap a shortcut — I don't mind being asked twice.`,
        [
          { label: '🎓 Education', payload: 'education' },
          { label: '💼 Experience', payload: 'experience' },
          { label: '🚀 Projects', payload: 'projects' },
          { label: '📬 Contact', payload: 'contact' },
        ]
      );
  }
}

// ─── Intent copy (greeting / help) ───────────────────────────────────
//
// Kept here beside the other assistant copy so the tone stays consistent.

export function greetingResponse(): Omit<Message, 'id' | 'timestamp'> {
  return msg(
    `Hey 👋 Good to see you again. Still me — no need to introduce myself twice. What else can I show you?`,
    sectionActions()
  );
}

export function helpResponse(): Omit<Message, 'id' | 'timestamp'> {
  return msg(
    `Plot twist: I'm a portfolio pretending to be a chatbot 🤖 — no menu required, just type like a human.\n\nTry things like:\n• "Tell me about your experience"\n• "What tech do you use?"\n• "Show me your projects"\n• "How do I contact you?"\n\nOr tap a shortcut below. Bad at small talk? There's a fun one hiding in Projects. 👀`,
    sectionActions()
  );
}

// ─── Stamp message with id + timestamp ───────────────────────────────

export function buildMessage(partial: Omit<Message, 'id' | 'timestamp'>): Message {
  return {
    ...partial,
    id: uid(),
    timestamp: new Date(),
  };
}

// ─── Parse a payload string into a new ConversationState ─────────────
//
// Pure: it only maps a payload to state. External links are reported back
// to the caller via the `external` field rather than opened here, so the
// parser has no hidden I/O side effect.

export interface PayloadResult {
  state: ConversationState;
  external?: string;
}

export function parsePayloadResult(payload: string, current: ConversationState): PayloadResult {
  if (payload === 'home') return { state: { type: 'WELCOME' } };

  if (payload === 'back') {
    switch (current.type) {
      case 'EDUCATION_DETAIL':
        return { state: { type: 'EDUCATION' } };
      case 'EXPERIENCE_DETAIL':
        return { state: { type: 'EXPERIENCE' } };
      case 'PROJECT_DETAIL':
        return { state: { type: 'PROJECTS' } };
      case 'PROJECT_TOPIC':
        return { state: { type: 'PROJECT_DETAIL', id: current.projectId } };
      default:
        return { state: { type: 'WELCOME' } };
    }
  }

  if (payload === 'education') return { state: { type: 'EDUCATION' } };
  if (payload === 'experience') return { state: { type: 'EXPERIENCE' } };
  if (payload === 'projects') return { state: { type: 'PROJECTS' } };
  if (payload === 'skills') return { state: { type: 'SKILLS' } };
  if (payload === 'contact') return { state: { type: 'CONTACT' } };

  if (payload.startsWith('edu:')) return { state: { type: 'EDUCATION_DETAIL', id: payload.slice(4) } };
  if (payload.startsWith('exp:')) return { state: { type: 'EXPERIENCE_DETAIL', id: payload.slice(4) } };
  if (payload.startsWith('project:')) return { state: { type: 'PROJECT_DETAIL', id: payload.slice(8) } };

  if (payload.startsWith('topic:')) {
    const [, projectId, topic] = payload.split(':');
    return {
      state: {
        type: 'PROJECT_TOPIC',
        projectId,
        topic: topic as keyof Project['topics'],
      },
    };
  }

  // External links — reported, not opened, so state stays untouched.
  if (payload.startsWith('mailto:') || payload.startsWith('http')) {
    return { state: current, external: payload };
  }

  return { state: current };
}

// Backwards-compatible helper for callers that only need the next state.
export function parsePayload(payload: string, current: ConversationState): ConversationState {
  return parsePayloadResult(payload, current).state;
}

// ─── Human-readable label for a payload (used for user echo bubbles) ──

export function payloadLabel(payload: string): string {
  if (payload === 'home') return 'Home';
  if (payload === 'back') return '← Back';
  if (payload === 'education') return '🎓 Education';
  if (payload === 'experience') return '💼 Experience';
  if (payload === 'projects') return '🚀 Projects';
  if (payload === 'skills') return '🛠️ Skills';
  if (payload === 'contact') return '📬 Contact';

  if (payload.startsWith('edu:')) {
    return education.find((e) => e.id === payload.slice(4))?.degree ?? 'Education';
  }
  if (payload.startsWith('exp:')) {
    const exp = experience.find((e) => e.id === payload.slice(4));
    return exp ? `${exp.title} — ${exp.companyShort}` : 'Experience';
  }
  if (payload.startsWith('project:')) {
    return projects.find((p) => p.id === payload.slice(8))?.name ?? 'Project';
  }
  if (payload.startsWith('topic:')) {
    const [, projectId, topic] = payload.split(':');
    const project = projects.find((p) => p.id === projectId);
    const topicLabels: Record<string, string> = {
      architecture: 'Architecture',
      ai: 'AI / Automation',
      stack: 'Tech Stack',
      challenges: 'Challenges',
    };
    return project ? `${topicLabels[topic] ?? topic} — ${project.name}` : 'Project detail';
  }

  return payload;
}
