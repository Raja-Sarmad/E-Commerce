export type PasswordChecks = {
  minLength: boolean;
  uppercase: boolean;
  number: boolean;
  specialChar: boolean;
};

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password),
  };
}

/** Required: 8+ chars, one uppercase, one number. Special char is optional. */
export function isPasswordValid(password: string): boolean {
  const checks = getPasswordChecks(password);
  return checks.minLength && checks.uppercase && checks.number;
}

export function passwordValidationMessage(password: string): string | null {
  const checks = getPasswordChecks(password);
  if (!checks.minLength) return "Password must be at least 8 characters.";
  if (!checks.uppercase) return "Password must contain at least one uppercase letter.";
  if (!checks.number) return "Password must contain at least one number.";
  return null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}
