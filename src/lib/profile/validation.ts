const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateDisplayName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (trimmed.length < 2)
    return { ok: false, error: 'Name must be at least 2 characters.' };
  if (trimmed.length > 60)
    return { ok: false, error: 'Name must be under 60 characters.' };
  return { ok: true };
}

export function validateUsername(value: string): ValidationResult {
  const trimmed = value.trim().toLowerCase();
  if (!USERNAME_RE.test(trimmed)) {
    return {
      ok: false,
      error:
        'Username must be 3–30 characters, using lowercase letters, numbers, or underscores.',
    };
  }
  return { ok: true };
}

export function validateBio(value: string): ValidationResult {
  if (value.trim().length > 300)
    return { ok: false, error: 'Bio must be under 300 characters.' };
  return { ok: true };
}

export function validatePhone(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true };
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 13) {
    return { ok: false, error: 'Please enter a valid Malawian phone number.' };
  }
  return { ok: true };
}

export function validateShopName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (trimmed.length < 2)
    return { ok: false, error: 'Shop name must be at least 2 characters.' };
  if (trimmed.length > 80)
    return { ok: false, error: 'Shop name must be under 80 characters.' };
  return { ok: true };
}

export function validateShopAddress(value: string): ValidationResult {
  const trimmed = value.trim();
  if (trimmed.length < 5)
    return {
      ok: false,
      error: 'Please enter a fuller address (street, area, or landmark).',
    };
  if (trimmed.length > 200)
    return { ok: false, error: 'Address must be under 200 characters.' };
  return { ok: true };
}

export function validateBusinessHours(value: string): ValidationResult {
  if (value.trim().length > 200)
    return { ok: false, error: 'Business hours must be under 200 characters.' };
  return { ok: true };
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}