import React from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

// Only the first few items on screen animate. Scrolling a long list must not
// replay entry animations for every row that comes into view.
export const MAX_ANIMATED_ITEMS = 6;
const STAGGER_MS = 70;

export const enteringFor = (index) =>
  index < MAX_ANIMATED_ITEMS ? FadeInDown.delay(index * STAGGER_MS).duration(350) : undefined;

/** Fades and slides its child up, staggered by `index`. Items past the first few render plainly. */
export default function FadeInItem({ index = 0, style, children }) {
  if (index >= MAX_ANIMATED_ITEMS) {
    return <View style={style}>{children}</View>;
  }
  return (
    <Animated.View entering={enteringFor(index)} style={style}>
      {children}
    </Animated.View>
  );
}
