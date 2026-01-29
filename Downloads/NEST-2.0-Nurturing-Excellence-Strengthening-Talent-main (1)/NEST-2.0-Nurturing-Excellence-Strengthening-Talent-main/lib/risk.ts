import { Priority, Severity } from "@/types";

/**
 * Risk & Triage Module
 * Provides automated risk assessment and follow-up recommendations
 */

interface ComputePriorityInput {
  severity: Severity;
  keywords?: string[];
  hospitalizationFlag?: boolean;
}

interface ShouldTriggerFollowUpInput {
  completenessScore: number;
  priority: Priority;
}

// Life-threatening keywords that trigger P0
const LIFE_THREATENING_KEYWORDS = [
  "death",
  "fatal",
  "died",
  "anaphylaxis",
  "cardiac arrest",
  "respiratory failure",
  "stroke",
  "seizure",
  "coma",
  "life-threatening",
  "life threatening",
];

/**
 * Compute priority based on severity, keywords, and hospitalization status
 * 
 * Rules:
 * - Hospitalization OR life-threatening keywords OR SEVERE => P0
 * - MODERATE => P1
 * - MILD => P2
 */
export function computePriority(input: ComputePriorityInput): Priority {
  const { severity, keywords = [], hospitalizationFlag = false } = input;

  // Check for life-threatening keywords
  const hasLifeThreateningKeyword = keywords.some((keyword) =>
    LIFE_THREATENING_KEYWORDS.some((ltKeyword) =>
      keyword.toLowerCase().includes(ltKeyword.toLowerCase())
    )
  );

  // P0: Critical - Hospitalization, life-threatening, or severe
  if (
    hospitalizationFlag ||
    hasLifeThreateningKeyword ||
    severity === Severity.SEVERE
  ) {
    return Priority.P0;
  }

  // P1: High - Moderate severity
  if (severity === Severity.MODERATE) {
    return Priority.P1;
  }

  // P2: Normal - Mild severity
  return Priority.P2;
}

/**
 * Determine if a follow-up should be triggered based on completeness and priority
 * 
 * Rules:
 * - P0 cases should always trigger follow-up if completeness < 100%
 * - P1 cases should trigger if completeness < 80%
 * - P2 cases should trigger if completeness < 60%
 */
export function shouldTriggerFollowUp(
  input: ShouldTriggerFollowUpInput
): boolean {
  const { completenessScore, priority } = input;

  // If already complete, no need for follow-up
  if (completenessScore >= 100) {
    return false;
  }

  switch (priority) {
    case Priority.P0:
      // Critical cases always need follow-up if incomplete
      return completenessScore < 100;
    case Priority.P1:
      // High priority cases need follow-up if < 80% complete
      return completenessScore < 80;
    case Priority.P2:
      // Normal priority cases need follow-up if < 60% complete
      return completenessScore < 60;
    default:
      return false;
  }
}

/**
 * Get a human-readable recommendation message
 */
export function getFollowUpRecommendation(
  priority: Priority,
  completenessScore: number,
  shouldTrigger: boolean
): string {
  if (!shouldTrigger) {
    return "No immediate follow-up required.";
  }

  if (priority === Priority.P0) {
    return `CRITICAL: Immediate follow-up required. Case is only ${completenessScore}% complete.`;
  }

  if (priority === Priority.P1) {
    return `HIGH PRIORITY: Follow-up recommended. Case is ${completenessScore}% complete.`;
  }

  return `Follow-up suggested to improve case completeness (currently ${completenessScore}%).`;
}
