import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AntDesign from "@react-native-vector-icons/ant-design";
import { useTheme } from "../Context/ThemeProvider";
import {
  createShadow,
  radius,
  spacing,
  typography,
} from "../constants/designSystem";
import { appImages } from "../constants/imageRegistry";
import SearchBar from "./ui/SearchBar";

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

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View
          style={[
            styles.promoCard,
            createShadow("#000000", 14),
            styles.promoSurface,
          ]}
        >
          <View>
            <Text style={styles.promoEyebrow}>Today&apos;s pick</Text>
            <Text style={styles.promoTitle}>Free delivery on your first order</Text>
          </View>
          <View style={styles.promoBadge}>
            <Text style={styles.promoBadgeText}>NEW</Text>
          </View>
        </View>

        <SearchBar
          value={searchValue}
          onChangeText={onChangeSearch}
          onPress={onSearchPress}
          editable={searchEditable}
          placeholder={searchPlaceholder}
          onClear={searchValue ? () => onChangeSearch?.("") : undefined}
          containerStyle={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 292,
  },
  heroImage: {
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  content: {
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  locationLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  locationValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  topAction: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  topActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    marginTop: spacing.xl,
    color: "#FFFFFF",
    fontSize: typography.title,
    fontWeight: "800",
    lineHeight: 34,
    maxWidth: "78%",
  },
  subtitle: {
    marginTop: spacing.sm,
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: "90%",
  },
  promoCard: {
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  promoSurface: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  promoEyebrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginBottom: spacing.xs,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  promoTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    maxWidth: 220,
  },
  promoBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  promoBadgeText: {
    color: "#EB611F",
    fontSize: 12,
    fontWeight: "800",
  },
  searchBar: {
    marginTop: spacing.lg,
  },
  searchInput: {
    color: "#24160F",
  },
});
