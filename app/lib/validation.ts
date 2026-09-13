// Pure format checks for the demo forms. Nothing here is a real payment or identity check.

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function passesLuhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

// 13 to 19 digits, spaces allowed between groups, valid Luhn checksum.
export function isCardNumber(value: string): boolean {
  const digits = value.replace(/\s+/g, "");
  return /^\d{13,19}$/.test(digits) && passesLuhn(digits);
}

// MM/YY, not earlier than the current month (UTC).
export function isCardExpiry(value: string, now = new Date()): boolean {
  const match = /^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const current = now.getUTCFullYear() * 12 + now.getUTCMonth() + 1;
  return year * 12 + month >= current;
}

export function isCardCode(value: string): boolean {
  return /^\d{3,4}$/.test(value.trim());
}
