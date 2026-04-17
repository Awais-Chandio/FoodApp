import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useTheme } from "../Context/ThemeProvider";
import { createShadow, radius, spacing, typography } from "../constants/designSystem";
import { appImages } from "../constants/imageRegistry";
import SearchBar from "./ui/SearchBar";

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
      <LinearGradient
        colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glossOverlay}
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.locationWrap}>
            <View style={styles.iconBubble}>
              <AntDesign name="environment" size={15} color={colors.white} />
            </View>
            <View>
              <Text style={styles.locationLabel}>Deliver to</Text>
              <Text style={styles.locationValue}>{location}</Text>
            </View>
          </View>

          {rightActionLabel ? (
            <TouchableOpacity
              style={styles.topAction}
              activeOpacity={0.82}
              onPress={onRightActionPress}
            >
              <Text style={styles.topActionText}>{rightActionLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.heroCopy}>
          <View style={styles.kicker}>
            <AntDesign name="heart" size={12} color={colors.white} />
            <Text style={styles.kickerText}>Curated for your cravings</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.highlightRow}>
          {headerHighlights.map((item) => (
            <View
              key={item.id}
              style={[styles.highlightPill, createShadow(colors.shadow, 8)]}
            >
              <AntDesign name={item.icon} size={13} color={colors.white} />
              <Text style={styles.highlightText}>{item.label}</Text>
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
          inputStyle={styles.searchInput}
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
  glossOverlay: {
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
    backgroundColor: "rgba(255,255,255,0.20)",
  },
  locationLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "700",
  },
  locationValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  topAction: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  topActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
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
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  kickerText: {
    marginLeft: spacing.xs,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    marginTop: spacing.lg,
    color: "#FFFFFF",
    fontSize: typography.title,
    fontWeight: "900",
    lineHeight: 36,
    maxWidth: "78%",
  },
  subtitle: {
    marginTop: spacing.sm,
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    lineHeight: 22,
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
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  highlightText: {
    marginLeft: spacing.xs,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  searchBar: {
    marginTop: spacing.xs,
  },
  searchInput: {
    color: "#18181B",
  },
});
