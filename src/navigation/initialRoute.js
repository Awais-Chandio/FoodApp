/**
 * Where the app goes after the splash screen.
 * - A restored session goes straight to the tabs.
 * - A first launch shows onboarding once.
 * - Everyone else lands on the tabs as a guest.
 */
export const resolveInitialRoute = ({ isLoggedIn, hasSeenOnboarding }) => {
  if (isLoggedIn) {
    return "Tab";
  }
  return hasSeenOnboarding ? "Tab" : "Onboarding";
};
