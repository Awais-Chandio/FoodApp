import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppText from "./ui/AppText";
import SkeletonCard from "./ui/SkeletonCard";
import { useTheme } from "../Context/ThemeProvider";
import { createShadow, fontFamily, layout, spacing } from "../constants/designSystem";

export const AUTO_ADVANCE_MS = 4000;
const RESUME_DELAY_MS = 6000;

/**
 * Paging banner list with dots. It advances by itself every 4 s and pauses
 * while the user touches it (resuming a few seconds after they let go). Hides
 * when there are no offers; shows a skeleton while loading.
 */
export default function OfferCarousel({ offers, loading = false, onOfferPress }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const pageWidth = width - layout.pagePadding * 2;
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const resumeTimer = useRef(null);
  const indexRef = useRef(0);
  indexRef.current = index;

  useEffect(() => {
    if (offers.length < 2) {
      return undefined;
    }
    const timer = setInterval(() => {
      if (pausedRef.current) {
        return;
      }
      const next = (indexRef.current + 1) % offers.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setIndex(next);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [offers.length]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  const pause = () => {
    pausedRef.current = true;
    clearTimeout(resumeTimer.current);
  };
  const resumeSoon = () => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY_MS);
  };

  if (loading) {
    return <SkeletonCard width={null} height={112} style={styles.skeleton} />;
  }
  if (!offers.length) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={offers}
        keyExtractor={(offer) => offer.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={pageWidth}
        decelerationRate="fast"
        getItemLayout={(_data, i) => ({ length: pageWidth, offset: pageWidth * i, index: i })}
        onTouchStart={pause}
        onScrollBeginDrag={pause}
        onScrollEndDrag={resumeSoon}
        onTouchEnd={resumeSoon}
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / pageWidth))
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onOfferPress(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.subtitle}`}
            style={{ width: pageWidth }}
          >
            <LinearGradient
              colors={item.kind === "promo" ? colors.heroGradient : colors.heroGradientAlt}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.banner, createShadow(colors.shadow, layout.cardElevation)]}
            >
              <View style={[styles.iconBubble, { backgroundColor: colors.glassOnPrimary }]}>
                <AntDesign name={item.kind === "promo" ? "tag" : "fire"} size={22} color={colors.onPrimary} />
              </View>
              <View style={styles.text}>
                <AppText variant="h3" color="onPrimary" style={styles.title} numberOfLines={2}>
                  {item.title}
                </AppText>
                <AppText variant="label" color="onPrimary" numberOfLines={2}>
                  {item.subtitle}
                </AppText>
              </View>
              <AntDesign name="arrow-right" size={18} color={colors.onPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
      {offers.length > 1 ? (
        <View style={styles.dots}>
          {offers.map((offer, i) => (
            <View
              key={offer.id}
              style={[
                styles.dot,
                i === index ? styles.dotActive : null,
                { backgroundColor: i === index ? colors.primaryStrong : colors.border },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: layout.sectionGap,
  },
  skeleton: {
    width: "100%",
    marginBottom: layout.sectionGap,
  },
  banner: {
    minHeight: 112,
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  text: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontFamily: fontFamily.bold,
    marginBottom: spacing.xs,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 22,
  },
});
