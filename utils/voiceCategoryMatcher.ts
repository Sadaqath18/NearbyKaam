import { JOB_CATEGORY_LABELS } from "../i18n/jobCategories";
import { JobCategory } from "../types";

export function matchCategoryFromSpeech(
  speech: string,
  language: string,
): JobCategory | null {
  const text = speech.toLowerCase();

  for (const [key, config] of Object.entries(JOB_CATEGORY_LABELS)) {
    const keywords = config.voice?.[language] || config.voice?.en || [];

    if (keywords.some((k) => text.includes(k.toLowerCase()))) {
      return key as JobCategory;
    }
  }

  return null;
}
