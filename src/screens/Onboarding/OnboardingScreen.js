import React, { useRef, useState } from "react";
import { Animated, FlatList, Image, StyleSheet, View, useWindowDimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AppText from "../../components/ui/AppText";
import AppButton from "../../components/ui/AppButton";
import { useTheme } from "../../Context/ThemeProvider";
import { createShadow, fontFamily, radius, spacing, typeScale } from "../../constants/designSystem";
import { appImages } from "../../constants/imageRegistry";
import { finishOnboarding } from "../../services/onboarding";

export const ONBOARDING_SLIDES = [
  {
    id: "discover",
    image: appImages.onboardingFood,
    title: "Discover dishes that feel worth ordering",
    subtitle:
      "Browse cleaner restaurant cards, faster filters, and stronger food visuals from the first screen.",
  },
  {
    id: "checkout",
    image: appImages.onboardingPayment,
    title: "Keep checkout cleaner and easier to trust",
    subtitle:
      "Stronger cart summaries, clearer totals, and simpler payment feedback keep the ordering flow confident.",
  },
  {
    id: "track",
    image: appImages.onboardingDelivery,
    title: "Track delivery with clearer progress",
    subtitle:
      "Move from discovery to ordering to delivery with the same polished orange visual language.",
  },
];

function Dot({ index, scrollX, width, color }) {
  const range = [(index - 1) * width, index * width, (index + 1) * width];
  const dotWidth = scrollX.interpolate({
    inputRange: range,
    outputRange: [8, 24, 8],
    extrapolate: "clamp",
  });
  return <Animated.View style={[styles.dot, { width: dotWidth, backgroundColor: color }]} />;
}

/** One swipeable onboarding driven by ONBOARDING_SLIDES (or the `slides` prop). */
export default function OnboardingScreen({ navigation, slides = ONBOARDING_SLIDES }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const listRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const isLast = index === slides.length - 1;

  const goNext = () => {
    if (isLast) {
      finishOnboarding(navigation);
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const renderSlide = ({ item, index: slideIndex }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.badge, { backgroundColor: colors.badge }]}>
        <AppText style={[styles.badgeText, { color: colors.primaryDeep }]}>
          Step {slideIndex + 1} of {slides.length}
        </AppText>
      </View>
      <LinearGradient
        colors={colors.heroGradientAlt}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.imageWrap, createShadow(colors.shadow, 16)]}
      >
        <Image source={item.image} style={styles.image} />
      </LinearGradient>
      <AppText style={styles.title}>{item.title}</AppText>
      <AppText muted style={styles.subtitle}>
        {item.subtitle}
      </AppText>
    </View>
  );

  return (
    <LinearGradient
      colors={colors.surfaceGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        getItemLayout={(_data, i) => ({ length: width, offset: width * i, index: i })}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
        }
      />

      <View style={styles.dots} accessibilityLabel={`Page ${index + 1} of ${slides.length}`}>
        {slides.map((slide, i) => (
          <Dot key={slide.id} index={i} scrollX={scrollX} width={width} color={colors.primaryStrong} />
        ))}
      </View>

      <View style={styles.footer}>
        <AppButton
          label={isLast ? "Start exploring" : "Next"}
          onPress={goNext}
          style={styles.primaryButton}
        />
        <AppButton label="Skip" variant="secondary" onPress={() => finishOnboarding(navigation)} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxl,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xxl,
  },
  badgeText: {
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
  },
  imageWrap: {
    width: 288,
    height: 288,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 260,
    height: 260,
    resizeMode: "contain",
  },
  title: {
    marginTop: spacing.xl,
    ...typeScale.h1,
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing.md,
    ...typeScale.body,
    textAlign: "center",
    maxWidth: 300,
  },
  dots: {
    flexDirection: "row",
    alignSelf: "center",
    marginVertical: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: spacing.xl,
  },
  primaryButton: {
    marginBottom: spacing.md,
  },
});
