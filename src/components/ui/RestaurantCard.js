import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppText from "./AppText";
import { useTheme } from "../../Context/ThemeProvider";
import { createShadow, fontFamily, radius, spacing } from "../../constants/designSystem";
import { resolveRestaurantImage } from "../../constants/imageRegistry";

function HeartButton({ favorite, onPress, style }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.heart, { backgroundColor: colors.imageChip }, style]}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={favorite ? "Remove from favorites" : "Save to favorites"}
    >
      <AntDesign
        name={favorite ? "heart" : "hearto"}
        size={16}
        color={favorite ? colors.danger : colors.imageChipText}
      />
    </TouchableOpacity>
  );
}

/**
 * One restaurant, three ways:
 *  - "carousel": Home's horizontal cards (photo, heart, offer, rating, footer, admin actions)
 *  - "row": Search results (full-width photo, name, Menu button, offer pill)
 *  - "compact": Profile's saved restaurants
 *
 * `favorite` + `onToggleFavorite` show the heart. `admin` ({ onEdit, onDelete })
 * shows the admin row on the carousel variant. `onMenuPress` adds the Menu
 * button on the row variant.
 */
export default function RestaurantCard({
  restaurant,
  variant = "carousel",
  width,
  favorite = false,
  onToggleFavorite,
  onPress,
  onMenuPress,
  admin,
  style,
}) {
  const { colors } = useTheme();
  const image = resolveRestaurantImage(restaurant);
  const rating = restaurant.rating || "4.5";
  const time = restaurant.time || "20 min";

  if (variant === "compact") {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.compact,
          createShadow(colors.shadow, 10),
          { backgroundColor: colors.surface, borderColor: colors.borderSoft },
          style,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${restaurant.name}`}
      >
        <Image source={image} style={styles.compactImage} />
        <View style={styles.compactBody}>
          <AppText variant="body" style={styles.bold} numberOfLines={1}>
            {restaurant.name}
          </AppText>
          <View style={styles.compactMeta}>
            <AntDesign name="star" size={12} color={colors.warning} />
            <AppText variant="caption" muted style={styles.compactMetaText}>
              {rating} • {time}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === "row") {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={[
          styles.row,
          createShadow(colors.shadow, 12),
          { backgroundColor: colors.surface, borderColor: colors.borderSoft },
          style,
        ]}
        onPress={onPress}
      >
        <Image source={image} style={styles.rowImage} />
        {onToggleFavorite ? (
          <HeartButton favorite={favorite} onPress={onToggleFavorite} style={styles.heartOnRow} />
        ) : null}
        <View style={styles.rowContent}>
          <View style={styles.rowTitleLine}>
            <AppText variant="h3" style={[styles.bold, styles.rowTitle]} numberOfLines={1}>
              {restaurant.name}
            </AppText>
            {onMenuPress ? (
              <TouchableOpacity onPress={onMenuPress} accessibilityRole="button" accessibilityLabel={`Open ${restaurant.name} menu`}>
                <LinearGradient
                  colors={colors.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.menuButton}
                >
                  <AppText variant="caption" color="onPrimary" style={styles.menuButtonText}>
                    Menu
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.rowMeta}>
            <AntDesign name="star" size={13} color={colors.warning} />
            <AppText variant="label" muted style={styles.rowMetaText}>
              {rating} • {time}
            </AppText>
          </View>
          {restaurant.offer ? (
            <View style={[styles.dealPill, { backgroundColor: colors.accentSoft }]}>
              <AppText variant="caption" color="accentText" style={styles.bold}>
                {restaurant.offer}
              </AppText>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={[
        styles.carousel,
        createShadow(colors.shadow, 14),
        { backgroundColor: colors.surface, borderColor: colors.borderSoft, width },
        style,
      ]}
      onPress={onPress}
    >
      <View>
        <Image source={image} style={styles.carouselImage} />
        <LinearGradient
          colors={["transparent", colors.scrim]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {onToggleFavorite ? <HeartButton favorite={favorite} onPress={onToggleFavorite} /> : null}
        {restaurant.offer ? (
          <View style={[styles.offerTag, { backgroundColor: colors.secondarySoft }]}>
            <AppText variant="caption" color="primaryDeep" style={styles.bold}>
              {restaurant.offer}
            </AppText>
          </View>
        ) : null}
        <View style={styles.imageMeta}>
          <View style={[styles.ratingPill, { backgroundColor: colors.imageChip }]}>
            <AntDesign name="star" size={12} color={colors.warning} />
            <AppText variant="caption" style={[styles.bold, styles.ratingText, { color: colors.imageChipText }]}>
              {rating}
            </AppText>
          </View>
          <AppText variant="label" color="onImage" style={styles.bold}>
            {time} delivery
          </AppText>
        </View>
      </View>

      <View style={styles.carouselBody}>
        <AppText variant="h3" style={styles.bold} numberOfLines={1}>
          {restaurant.name}
        </AppText>
        <AppText variant="label" muted style={styles.metaText} numberOfLines={1}>
          {(restaurant.menu_items || []).length || 0} menu items • Freshly prepared
        </AppText>

        <LinearGradient
          colors={colors.surfaceGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.footer}
        >
          <View style={styles.footerText}>
            <AppText variant="label" color="primaryStrong" style={styles.footerLabel}>
              View menu
            </AppText>
            <AppText variant="caption" muted style={styles.footerMeta}>
              Fast checkout and smart recommendations
            </AppText>
          </View>
          <View style={[styles.footerArrow, { backgroundColor: colors.badge }]}>
            <AntDesign name="arrow-right" size={15} color={colors.primaryStrong} />
          </View>
        </LinearGradient>
      </View>

      {admin ? (
        <View style={styles.adminRow}>
          <TouchableOpacity
            style={[styles.adminAction, { backgroundColor: colors.badge }]}
            onPress={admin.onEdit}
          >
            <AntDesign name="edit" size={15} color={colors.text} />
            <AppText variant="label" style={styles.adminText}>Edit</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.adminAction, { backgroundColor: colors.surfaceMuted }]}
            onPress={admin.onDelete}
          >
            <AntDesign name="delete" size={15} color={colors.danger} />
            <AppText variant="label" color="dangerText" style={styles.adminText}>
              Delete
            </AppText>
          </TouchableOpacity>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bold: {
    fontFamily: fontFamily.bold,
  },
  heart: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  heartOnRow: {
    zIndex: 1,
  },
  // carousel
  carousel: {
    marginRight: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  carouselImage: {
    width: "100%",
    height: 190,
  },
  offerTag: {
    position: "absolute",
    left: spacing.md,
    top: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  imageMeta: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm - 1,
  },
  ratingText: {
    marginLeft: 4,
  },
  carouselBody: {
    padding: spacing.lg,
  },
  metaText: {
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  footerLabel: {
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  footerMeta: {
    marginTop: spacing.xs,
  },
  footerArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  adminRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  adminAction: {
    flex: 1,
    marginRight: spacing.sm,
    minHeight: 44,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  adminText: {
    marginLeft: spacing.xs,
    fontFamily: fontFamily.bold,
  },
  // row
  row: {
    borderWidth: 1,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  rowImage: {
    width: "100%",
    height: 182,
  },
  rowContent: {
    padding: spacing.xl,
  },
  rowTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  menuButton: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 1,
  },
  menuButtonText: {
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  rowMetaText: {
    marginLeft: spacing.xs,
  },
  dealPill: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    marginTop: spacing.md,
  },
  // compact
  compact: {
    width: 168,
    marginRight: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  compactImage: {
    width: "100%",
    height: 96,
  },
  compactBody: {
    padding: spacing.md,
  },
  compactMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  compactMetaText: {
    marginLeft: spacing.xs,
  },
});
