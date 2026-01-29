import { JOB_CATEGORY_LABELS } from "../i18n/jobCategories";
import { JobCategory } from "../types";
import { CATEGORY_KEY_MAP, JobCategoryKey } from "../i18n/jobCategoryMap";

export function matchCategoryFromSpeech(
  speech: string,
  language: string,
): JobCategory | null {
  const text = speech.toLowerCase();

  let bestMatch: { category: JobCategory; score: number } | null = null;

  for (const [key, config] of Object.entries(JOB_CATEGORY_LABELS)) {
    const categoryKey = key as JobCategoryKey;
    const category = CATEGORY_KEY_MAP[categoryKey];
    if (!category) continue;

    const keywords = config.voice?.[language] ?? config.voice?.en ?? [];

    let score = 0;

    for (const k of keywords) {
      if (text.includes(k.toLowerCase())) {
        score += k.length; // longer keyword = stronger intent
      }
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { category, score };
    }
  }

  return bestMatch?.category ?? null;
}
