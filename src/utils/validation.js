/** Returns an error message for an invalid delivery address, or null when it is fine. */
export const validateAddress = (address) => {
  const value = String(address ?? "").trim();

  if (value.length < 10) {
    return "Enter a full delivery address (at least 10 characters).";
  }
  if (value.length > 200) {
    return "The address is too long (200 characters at most).";
  }
  if (!/[A-Za-z]/.test(value)) {
    return "The address must include letters, not only numbers.";
  }
  return null;
};
