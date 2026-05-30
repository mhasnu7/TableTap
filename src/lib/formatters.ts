export const formatCurrency = (amount: number) => {
  return `₹${amount.toFixed(2)}`;
}

export const normalizePhoneNumber = (phone: string) => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Keep last 10 digits
  return digits.slice(-10);
}
