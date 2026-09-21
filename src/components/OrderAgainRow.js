import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AppText from "./ui/AppText";
import SectionHeader from "./ui/SectionHeader";
import { useTheme } from "../Context/ThemeProvider";
import { createShadow, fontFamily, layout, radius, spacing } from "../constants/designSystem";
import { formatMoney } from "../utils/pricing";

export const summarizeOrder = (order) =>
  order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ");

/** Home's "Order again": a card per recent order with its total and a Reorder button. */
export default function OrderAgainRow({ orders, onReorder, reorderingId }) {
  const { colors } = useTheme();

  if (!orders.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <SectionHeader title="Order again" subtitle="Your recent orders, one tap away." />
      <FlatList
        data={orders}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(order) => String(order.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item: order }) => {
          const busy = reorderingId === order.id;
          return (
            <View
              style={[
                styles.card,
                createShadow(colors.shadow, 10),
                { backgroundColor: colors.surface, borderColor: colors.borderSoft },
              ]}
            >
              <AppText variant="label" style={styles.summary} numberOfLines={3}>
                {summarizeOrder(order)}
              </AppText>
              <AppText variant="body" color="primaryStrong" style={styles.total}>
                {formatMoney(order.total)}
              </AppText>
              <TouchableOpacity
                onPress={() => onReorder(order)}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel={`Reorder: ${summarizeOrder(order)}`}
              >
                <LinearGradient
                  colors={colors.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.button, busy ? styles.busy : null]}
                >
                  <AppText variant="label" color="onPrimary" style={styles.buttonText}>
                    {busy ? "Adding..." : "Reorder"}
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: layout.sectionGap,
  },
  list: {
    paddingBottom: spacing.xs,
    paddingRight: spacing.xs,
  },
  card: {
    width: 228,
    marginRight: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  summary: {
    minHeight: 60,
  },
  total: {
    marginVertical: spacing.sm,
    fontFamily: fontFamily.bold,
  },
  button: {
    borderRadius: radius.pill,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  busy: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: fontFamily.bold,
  },
});
