import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "has_seen_onboarding";

export const hasSeenOnboarding = async () => {
  try {
    return (await AsyncStorage.getItem(KEY)) === "true";
  } catch (error) {
    // If storage is unreadable, do not trap the user in onboarding.
    console.log("could not read onboarding flag", error);
    return true;
  }
};

export const markOnboardingSeen = async () => {
  try {
    await AsyncStorage.setItem(KEY, "true");
  } catch (error) {
    console.log("could not save onboarding flag", error);
  }
};

/** Marks onboarding as done and enters the app with a clean navigation history. */
export const finishOnboarding = async (navigation) => {
  await markOnboardingSeen();
  navigation.reset({ index: 0, routes: [{ name: "Tab" }] });
};
