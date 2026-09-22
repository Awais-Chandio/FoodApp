import { Platform, Vibration } from "react-native";

// Short feedback for add-to-cart. Uses React Native's built-in Vibration, so it
// needs no extra package (Android needs the VIBRATE permission, which is in the
// manifest). On iOS Vibration.vibrate() is a fixed, crude buzz. If a real haptics
// library is added later, only this file changes.
const TAP_MS = 12;

/** Never throws, and does nothing where vibration is unavailable (tests, simulators). */
export const tapHaptic = () => {
  try {
    if (Platform.OS === "android") {
      Vibration.vibrate(TAP_MS);
    } else {
      Vibration.vibrate();
    }
  } catch (error) {
    console.log("haptic unavailable", error);
  }
};
