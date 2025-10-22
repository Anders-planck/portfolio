/**
 * Get localized CV section keys for translation
 * These correspond to keys in messages/{locale}.json under the 'cv' namespace
 */

import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

// Soft skill keys
export const SOFT_SKILL_KEYS = ['problemSolving', 'teamCollaboration', 'adaptability', 'qualityFocus'] as const;
export type SoftSkillKey = typeof SOFT_SKILL_KEYS[number];

// Language keys
export const LANGUAGE_KEYS = ['french', 'italian', 'english'] as const;
export type LanguageKey = typeof LANGUAGE_KEYS[number];

// Language level keys
export const LANGUAGE_LEVEL_KEYS = ['native', 'b2', 'b1'] as const;
export type LanguageLevelKey = typeof LANGUAGE_LEVEL_KEYS[number];

// Language configuration
export const LANGUAGES_CONFIG: Record<LanguageKey, { level: LanguageLevelKey; proficiency: number }> = {
  french: { level: 'native', proficiency: 100 },
  italian: { level: 'b2', proficiency: 75 },
  english: { level: 'b1', proficiency: 65 },
};

export const cvTranslationKeys = {
  // Soft Skills
  softSkills: [
    { key: 'problemSolving', name: 'Problem Solving' },
    { key: 'teamCollaboration', name: 'Team Collaboration' },
    { key: 'adaptability', name: 'Adaptability' },
    { key: 'qualityFocus', name: 'Quality Focus' },
  ],

  // Skill Categories
  skillCategories: {
    backend: 'Backend',
    frontend: 'Frontend',
    database: 'Database',
    devops: 'DevOps',
    api: 'API',
  },

  // Language Names (for translation)
  languageNames: {
    french: 'French',
    italian: 'Italian',
    english: 'English',
  },

  // Language Proficiency Levels
  proficiencyLevels: {
    native: 'Native',
    b2: 'B2',
    b1: 'B1',
  },
}

/**
 * Helper to get translated work experience
 * Translation keys follow pattern: cv.experience.{index}.{field}
 */
export function getWorkExperienceTranslationKey(index: number, field: string): string {
  return `cv.experience.${index}.${field}`
}

/**
 * Helper to get translated project data
 * Translation keys follow pattern: cv.experience.{expIndex}.projects.{projIndex}.{field}
 */
export function getProjectTranslationKey(expIndex: number, projIndex: number, field: string): string {
  return `cv.experience.${expIndex}.projects.${projIndex}.${field}`
}

/**
 * Helper to get translated education data
 * Translation keys follow pattern: cv.education.{index}.{field}
 */
export function getEducationTranslationKey(index: number, field: string): string {
  return `cv.education.${index}.${field}`
}

/**
 * Helper to get translated personal project data
 * Translation keys follow pattern: cv.personalProjects.{index}.{field}
 */
export function getPersonalProjectTranslationKey(index: number, field: string): string {
  return `cv.personalProjects.${index}.${field}`
}

/**
 * Helper to get bio translation key
 */
export function getBioTranslationKey(): string {
  return 'cv.bio'
}

/**
 * Helper to get professional goal translation key
 */
export function getProfessionalGoalTranslationKey(): string {
  return 'cv.professionalGoal'
}

/**
 * Client-side CV translation hook
 *
 * @example
 * const cvT = useCvTranslations();
 * const bio = cvT.bio();
 * const goal = cvT.professionalGoal();
 * const skill = cvT.softSkill('problemSolving');
 */
export function useCvTranslations() {
  const t = useTranslations('cv');

  return {
    bio: () => t('bio'),
    professionalGoal: () => t('professionalGoal'),

    softSkill: (key: SoftSkillKey) => ({
      name: t(`softSkills.${key}.name`),
      description: t(`softSkills.${key}.description`),
    }),

    language: (key: LanguageKey) => ({
      name: t(`languages.${key}`),
      level: t(`languages.${LANGUAGES_CONFIG[key].level}`),
      proficiency: LANGUAGES_CONFIG[key].proficiency,
    }),

    experience: {
      description: (expIndex: number) => t(`experience.${expIndex}.description`),
      project: {
        description: (expIndex: number, projIndex: number) =>
          t(`experience.${expIndex}.projects.${projIndex}.description`),
        achievement: (expIndex: number, projIndex: number, achIndex: number) =>
          t(`experience.${expIndex}.projects.${projIndex}.achievements.${achIndex}`),
      },
    },

    education: {
      description: (eduIndex: number) => t(`education.${eduIndex}.description`),
    },

    personalProject: {
      description: (projIndex: number) => t(`personalProjects.${projIndex}.description`),
      achievement: (projIndex: number, achIndex: number) =>
        t(`personalProjects.${projIndex}.achievements.${achIndex}`),
    },
  };
}

/**
 * Server-side CV translation helper
 *
 * @example
 * const cvT = await getCvTranslations(locale);
 * const bio = cvT.bio();
 * const goal = cvT.professionalGoal();
 */
export async function getCvTranslations(locale: string) {
  const t = await getTranslations({ locale, namespace: 'cv' });

  return {
    bio: () => t('bio'),
    professionalGoal: () => t('professionalGoal'),

    softSkill: (key: SoftSkillKey) => ({
      name: t(`softSkills.${key}.name`),
      description: t(`softSkills.${key}.description`),
    }),

    language: (key: LanguageKey) => ({
      name: t(`languages.${key}`),
      level: t(`languages.${LANGUAGES_CONFIG[key].level}`),
      proficiency: LANGUAGES_CONFIG[key].proficiency,
    }),

    experience: {
      description: (expIndex: number) => t(`experience.${expIndex}.description`),
      project: {
        description: (expIndex: number, projIndex: number) =>
          t(`experience.${expIndex}.projects.${projIndex}.description`),
        achievement: (expIndex: number, projIndex: number, achIndex: number) =>
          t(`experience.${expIndex}.projects.${projIndex}.achievements.${achIndex}`),
      },
    },

    education: {
      description: (eduIndex: number) => t(`education.${eduIndex}.description`),
    },

    personalProject: {
      description: (projIndex: number) => t(`personalProjects.${projIndex}.description`),
      achievement: (projIndex: number, achIndex: number) =>
        t(`personalProjects.${projIndex}.achievements.${achIndex}`),
    },
  };
}

/**
 * Get all soft skills with translations (client-side)
 *
 * @example
 * const skills = useSoftSkills();
 * skills.forEach(skill => console.log(skill.name, skill.description));
 */
export function useSoftSkills() {
  const cvT = useCvTranslations();
  return SOFT_SKILL_KEYS.map(key => ({
    key,
    ...cvT.softSkill(key),
  }));
}

/**
 * Get all languages with translations (client-side)
 *
 * @example
 * const languages = useLanguages();
 * languages.forEach(lang => console.log(lang.name, lang.level, lang.proficiency));
 */
export function useLanguages() {
  const cvT = useCvTranslations();
  return LANGUAGE_KEYS.map(key => ({
    key,
    ...cvT.language(key),
  }));
}
