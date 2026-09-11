/**
 * Standard Canonical Professions in BookSaathi
 */
export const CANONICAL_PROFESSIONS = [
  'Doctor',
  'CA',
  'Lawyer',
  'Consultant',
  'Therapist',
  'Tutor',
  'Trainer',
  'Nutritionist',
  'Coach',
  'Freelancer',
  'Other',
];

/**
 * Normalizes any compound or localized profession string (e.g., 'CA / Tax Consultant',
 * 'Doctor / Clinic', 'Lawyer / Advocate', 'Salon / Beauty Specialist')
 * into a valid canonical profession enum.
 */
export const normalizeProfession = (val) => {
  if (!val || typeof val !== 'string') return 'Doctor';
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();

  // Exact canonical match (case-insensitive)
  const exactMatch = CANONICAL_PROFESSIONS.find(
    (p) => p.toLowerCase() === lower
  );
  if (exactMatch) return exactMatch;

  // Compound / keyword match
  if (lower.includes('ca') || lower.includes('tax') || lower.includes('accountant') || lower.includes('audit')) {
    return 'CA';
  }
  if (lower.includes('doc') || lower.includes('clinic') || lower.includes('health') || lower.includes('physician') || lower.includes('medic')) {
    return 'Doctor';
  }
  if (lower.includes('law') || lower.includes('advocat') || lower.includes('legal') || lower.includes('attorney')) {
    return 'Lawyer';
  }
  if (lower.includes('therap') || lower.includes('psychol') || lower.includes('counsel') || lower.includes('mental')) {
    return 'Therapist';
  }
  if (lower.includes('tut') || lower.includes('educat') || lower.includes('teach') || lower.includes('profess')) {
    return 'Tutor';
  }
  if (lower.includes('train') || lower.includes('gym')) {
    return 'Trainer';
  }
  if (lower.includes('nutri') || lower.includes('diet')) {
    return 'Nutritionist';
  }
  if (lower.includes('coach') || lower.includes('fitness')) {
    return 'Coach';
  }
  if (lower.includes('consult') || lower.includes('advisor') || lower.includes('business')) {
    return 'Consultant';
  }
  if (lower.includes('free') || lower.includes('creator') || lower.includes('freelanc') || lower.includes('developer') || lower.includes('designer')) {
    return 'Freelancer';
  }

  return 'Other';
};
