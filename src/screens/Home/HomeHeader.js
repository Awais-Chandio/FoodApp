import React from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "../../components/ui/AppText";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useTheme } from "../../Context/ThemeProvider";
import {
  createShadow,
  fontFamily,
  radius,
  spacing,
  typeScale,
} from "../../constants/designSystem";
import { appImages } from "../../constants/imageRegistry";
import SearchBar from "../../components/ui/SearchBar";

const headerHighlights = [
  { id: "rating", icon: "star", label: "4.8 rating" },
  { id: "delivery", icon: "clockcircleo", label: "12-20 min" },
  { id: "fresh", icon: "fire", label: "Fresh picks" },
];

export default function HomeHeader({
  title = "Crave something bold",
  subtitle = "Fresh food, fast delivery, and better choices every day.",
  location = "Karachi, PK",
  searchValue = "",
  onChangeSearch,
  onSearchPress,
  searchPlaceholder = "Search dishes, restaurants, offers",
  searchEditable = true,
  rightActionLabel,
  onRightActionPress,
}) {
  const { colors } = useTheme();

  return (
    <ImageBackground
      source={appImages.heroBackground}
      style={styles.hero}
      resizeMode="cover"
      imageStyle={styles.heroImage}
    >
      <LinearGradient
        colors={colors.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.locationWrap}>
            <View style={[styles.iconBubble, { backgroundColor: colors.glassOnPrimary }]}>
              <AntDesign name="environment" size={15} color={colors.onPrimary} />
            </View>
            <View>
              <AppText style={[styles.locationLabel, { color: colors.onPrimary }]}>Deliver to</AppText>
              <AppText style={[styles.locationValue, { color: colors.onPrimary }]}>{location}</AppText>
            </View>
          </View>

          {rightActionLabel ? (
            <TouchableOpacity
              style={[styles.topAction, { backgroundColor: colors.glassOnPrimary, borderColor: colors.glassOnPrimaryBorder }]}
              activeOpacity={0.82}
              onPress={onRightActionPress}
            >
              <AppText style={[styles.topActionText, { color: colors.onPrimary }]}>{rightActionLabel}</AppText>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.heroCopy}>
          <View style={[styles.kicker, { backgroundColor: colors.glassOnPrimary, borderColor: colors.glassOnPrimaryBorder }]}>
            <AntDesign name="heart" size={12} color={colors.onPrimary} />
            <AppText style={[styles.kickerText, { color: colors.onPrimary }]}>Curated for your cravings</AppText>
          </View>
          <AppText style={[styles.title, { color: colors.onPrimary }]}>{title}</AppText>
          <AppText style={[styles.subtitle, { color: colors.onPrimary }]}>{subtitle}</AppText>
        </View>

        <View style={styles.highlightRow}>
          {headerHighlights.map((item) => (
            <View
              key={item.id}
              style={[styles.highlightPill, { backgroundColor: colors.glassOnPrimary, borderColor: colors.glassOnPrimaryBorder }, createShadow(colors.shadow, 8)]}
            >
              <AntDesign name={item.icon} size={13} color={colors.onPrimary} />
              <AppText style={[styles.highlightText, { color: colors.onPrimary }]}>{item.label}</AppText>
            </View>
          ))}
        </View>

        <SearchBar
          value={searchValue}
          onChangeText={onChangeSearch}
          onPress={onSearchPress}
          editable={searchEditable}
          placeholder={searchPlaceholder}
          onClear={searchValue ? () => onChangeSearch?.("") : undefined}
          containerStyle={[styles.searchBar, createShadow(colors.shadow, 14)]}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 328,
  },
  heroImage: {
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  content: {
    paddingTop: spacing.huge + spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationWrap: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "72%",
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  locationLabel: {
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
  },
  locationValue: {
    ...typeScale.body,
    fontFamily: fontFamily.bold,
  },
  topAction: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  topActionText: {
    ...typeScale.label,
    fontFamily: fontFamily.bold,
  },
  heroCopy: {
    marginTop: spacing.xl + spacing.xs,
  },
  kicker: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  kickerText: {
    marginLeft: spacing.xs,
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
  },
  title: {
    marginTop: spacing.lg,
    ...typeScale.h1,
    maxWidth: "78%",
  },
  subtitle: {
    marginTop: spacing.sm,
    ...typeScale.label,
    fontFamily: fontFamily.regular,
    maxWidth: "88%",
  },
  highlightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  highlightPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  highlightText: {
    marginLeft: spacing.xs,
    ...typeScale.caption,
    fontFamily: fontFamily.bold,
  },
  searchBar: {
    marginTop: spacing.xs,
  },
});
