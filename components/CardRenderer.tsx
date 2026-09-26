'use client';

import { motion } from 'motion/react';
import { ExternalLink, GitFork, MapPin, Calendar, Award, BadgeCheck } from 'lucide-react';
import { SocialIcon } from 'react-social-icons';
import type { CardPayload, Education, Experience, Project, SkillCategory, Certification, Contact } from '@/types/portfolio';

interface Props {
  card: CardPayload;
  onAction: (payload: string) => void;
}

// ─── Education ─────────────────────────────────────────────────────

function EducationCard({ edu, onAction }: { edu: Education; onAction: (p: string) => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => onAction(`edu:${edu.id}`)}
      className="w-full text-left bg-surface border border-border rounded-xl p-3 hover:border-violet-500/60 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{edu.degree}</p>
          <p className="text-xs text-foreground-muted">{edu.institution}</p>
        </div>
        <span className="text-xs text-violet-400 font-medium shrink-0 mt-0.5">{edu.grade}</span>
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-xs text-foreground-muted">
        <span className="flex items-center gap-1"><MapPin size={10} /> {edu.location}</span>
        <span className="flex items-center gap-1"><Calendar size={10} /> {edu.startYear}–{edu.endYear}</span>
      </div>
    </motion.button>
  );
}

function EducationDetail({ edu }: { edu: Education }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{edu.degree}</p>
          <p className="text-xs text-foreground-muted">{edu.major}</p>
        </div>
        <span className="text-xs text-violet-400 font-medium shrink-0">{edu.grade}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-foreground-muted">
        <span className="flex items-center gap-1"><MapPin size={10} /> {edu.institution}</span>
        <span className="flex items-center gap-1"><Calendar size={10} /> {edu.startYear}–{edu.endYear}</span>
      </div>
      <ul className="space-y-1 pt-1">
        {edu.highlights.map((h, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-foreground-muted">
            <span className="text-violet-500 mt-0.5">✦</span>
            {h}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Experience ────────────────────────────────────────────────────

function ExperienceCard({ exp, onAction }: { exp: Experience; onAction: (p: string) => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => onAction(`exp:${exp.id}`)}
      className="w-full text-left bg-surface border border-border rounded-xl p-3 hover:border-violet-500/60 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{exp.title}</p>
          <p className="text-xs text-foreground-muted">{exp.company}</p>
        </div>
        {exp.current && (
          <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
            Current
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-xs text-foreground-muted">
        <span>{exp.startDate} – {exp.endDate}</span>
        <span>{exp.type}</span>
      </div>
    </motion.button>
  );
}

function ExperienceDetail({ exp }: { exp: Experience }) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden space-y-0">
      {/* Company logo banner */}
      {exp.image && (
        <div className="flex items-center justify-center px-4 py-4 border-b border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={exp.image}
            alt={exp.company}
            className="h-8 w-auto object-contain dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
          />
        </div>
      )}

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{exp.title}</p>
            <p className="text-xs text-foreground-muted">{exp.company} · {exp.location}</p>
          </div>
          {exp.current && (
            <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
              Current
            </span>
          )}
        </div>
        <p className="text-xs text-foreground-muted">{exp.startDate} – {exp.endDate} · {exp.type}</p>
        <ul className="space-y-1 pt-1">
          {exp.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-foreground-muted">
              <span className="text-violet-500 mt-0.5">✦</span>
              {h}
            </li>
          ))}
        </ul>
        {exp.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {exp.skills.map((s) => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Project ───────────────────────────────────────────────────────

function ProjectCard({ project, onAction }: { project: Project; onAction: (p: string) => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => onAction(`project:${project.id}`)}
      className="w-full text-left bg-surface border border-border rounded-xl p-3 hover:border-violet-500/60 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{project.name}</p>
          <p className="text-xs text-foreground-muted">{project.tagline}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
          project.status === 'Deployed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
          project.status === 'Internal Tool' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' :
          'bg-amber-500/15 text-amber-400 border border-amber-500/30'
        }`}>
          {project.status}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {project.tech.slice(0, 4).map((t) => (
          <span key={t} className="text-xs px-1.5 py-0.5 bg-white/5 text-foreground-muted rounded border border-border">
            {t}
          </span>
        ))}
        {project.tech.length > 4 && (
          <span className="text-xs text-foreground-muted">+{project.tech.length - 4}</span>
        )}
        {project.url && (
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onAction(`visit:${project.url}`);
            }}
            className="ml-auto inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
          >
            <ExternalLink size={11} /> Visit
          </span>
        )}
      </div>
    </motion.button>
  );
}

function ProjectDetail({ project, onAction }: { project: Project; onAction: (p: string) => void }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{project.name}</p>
          <p className="text-xs text-foreground-muted">{project.type} · {project.year}</p>
        </div>
      </div>

      {(project.url || project.github) && (
        <div className="flex flex-wrap gap-2 pt-0.5">
          {project.url && (
            <button
              onClick={() => onAction(`visit:${project.url}`)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 hover:bg-violet-500/25 hover:text-violet-200 transition-colors cursor-pointer"
            >
              <ExternalLink size={12} /> Visit live site
            </button>
          )}
          {project.github && (
            <button
              onClick={() => onAction(`visit:${project.github}`)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-surface text-foreground-muted border border-border hover:border-violet-500/60 hover:text-violet-300 transition-colors cursor-pointer"
            >
              <GitFork size={12} /> View source
            </button>
          )}
        </div>
      )}

      <ul className="space-y-1 pt-1">
        {project.highlights.map((h, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-foreground-muted">
            <span className="text-violet-500 mt-0.5">✦</span>
            {h}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {project.tech.map((t) => (
          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Project topic ─────────────────────────────────────────────────

const TOPIC_LABELS: Record<keyof Project['topics'], string> = {
  architecture: '🏗️ Architecture',
  ai: '🤖 AI / Automation',
  stack: '💻 Tech Stack',
  challenges: '⚡ Challenges',
};

function ProjectTopic({ project, topic }: { project: Project; topic: keyof Project['topics'] }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 space-y-2">
      <div>
        <p className="text-xs font-semibold text-violet-400">{TOPIC_LABELS[topic]}</p>
        <p className="text-sm font-semibold text-foreground">{project.name}</p>
      </div>
      <p className="text-xs text-foreground-muted leading-relaxed">{project.topics[topic]}</p>
      {topic === 'stack' && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.tech.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Skills ────────────────────────────────────────────────────────

function SkillsCard({ skills }: { skills: SkillCategory[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 space-y-3">
      {skills.map((cat) => (
        <div key={cat.category}>
          <p className="text-xs font-semibold text-foreground-muted mb-1.5">{cat.category}</p>
          <div className="flex flex-wrap gap-1.5">
            {cat.items.map((item) => (
              <span key={item} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Certifications ────────────────────────────────────────────────

function CertificationsCard({ certifications }: { certifications: Certification[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 space-y-2">
      {certifications.map((c) => (
        <div key={c.id} className="flex items-start gap-2.5">
          <span
            className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${
              c.type === 'Award'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
            }`}
          >
            {c.type === 'Award' ? <Award size={12} /> : <BadgeCheck size={12} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground leading-snug">{c.name}</p>
            <p className="text-xs text-foreground-muted">{c.issuer}</p>
          </div>
          <span className="text-xs text-foreground-muted shrink-0 mt-0.5">{c.date}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Contact ───────────────────────────────────────────────────────

function ContactCard({ contact }: { contact: Contact }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 space-y-2">
      <p className="text-xs text-foreground-muted pb-1">{contact.availability}</p>
      {contact.social.map((s) => (
        <div
          key={s.platform}
          onClick={() => window.open(s.url, '_blank', 'noopener,noreferrer')}
          className="flex items-center gap-2.5 text-xs text-foreground-muted hover:text-violet-400 transition-colors py-0.5 group cursor-pointer"
        >
          <SocialIcon
            url={s.url}
            style={{ width: 24, height: 24 }}
            bgColor="transparent"
            fgColor="currentColor"
            className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none"
          />
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main renderer ─────────────────────────────────────────────────

export function CardRenderer({ card, onAction }: Props) {
  switch (card.type) {
    case 'education-list':
      return (
        <div className="w-full space-y-2 max-w-[92%]">
          {card.data.map((edu: Education) => (
            <EducationCard key={edu.id} edu={edu} onAction={onAction} />
          ))}
        </div>
      );
    case 'education-detail':
      return <div className="max-w-[92%]"><EducationDetail edu={card.data} /></div>;

    case 'experience-list':
      return (
        <div className="w-full space-y-2 max-w-[92%]">
          {card.data.map((exp: Experience) => (
            <ExperienceCard key={exp.id} exp={exp} onAction={onAction} />
          ))}
        </div>
      );
    case 'experience-detail':
      return <div className="max-w-[92%]"><ExperienceDetail exp={card.data} /></div>;

    case 'project-list':
      return (
        <div className="w-full space-y-2 max-w-[92%]">
          {card.data.map((p: Project) => (
            <ProjectCard key={p.id} project={p} onAction={onAction} />
          ))}
        </div>
      );
    case 'project-detail':
      return (
        <div className="max-w-[92%]">
          <ProjectDetail project={card.data} onAction={onAction} />
        </div>
      );

    case 'project-topic':
      return (
        <div className="max-w-[92%]">
          <ProjectTopic project={card.data} topic={card.topic} />
        </div>
      );

    case 'skills':
      return <div className="max-w-[92%]"><SkillsCard skills={card.data as SkillCategory[]} /></div>;

    case 'certifications':
      return (
        <div className="max-w-[92%]">
          <CertificationsCard certifications={card.data as Certification[]} />
        </div>
      );

    case 'contact':
      return <div className="max-w-[92%]"><ContactCard contact={card.data as Contact} /></div>;

    default:
      return null;
  }
}
