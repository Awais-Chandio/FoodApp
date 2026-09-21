import React, { useRef } from "react";
import { Pressable, StyleSheet } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppText from "./ui/AppText";
import FadeInItem from "./ui/FadeInItem";
import MenuItemCard from "./ui/MenuItemCard";
import QtyStepper from "./ui/QtyStepper";
import { useTheme } from "../Context/ThemeProvider";
import { radius, spacing } from "../constants/designSystem";
import { resolveFoodImage } from "../constants/imageRegistry";

const DELETE_ACTION = { name: "delete", label: "Delete" };

/**
 * One cart line. Swipe left to reveal Delete. Screen-reader users get a
 * "Delete" accessibility action instead (swipes are not discoverable without
 * sight), and the stepper's minus removes the line at quantity 1.
 */
export default function CartLine({ item, index = 0, onIncrease, onDecrease, onDelete }) {
  const { colors } = useTheme();
  const swipeRef = useRef(null);

  const renderDelete = () => (
    <Pressable
      onPress={() => {
        swipeRef.current?.close();
        onDelete(item);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Delete ${item.name}`}
      style={[styles.action, { backgroundColor: colors.danger }]}
    >
      <AntDesign name="delete" size={20} color={colors.onPrimary} />
      <AppText variant="caption" color="onPrimary" style={styles.actionText}>
        Delete
      </AppText>
    </Pressable>
  );

  return (
    <FadeInItem index={index} style={styles.row}>
      <ReanimatedSwipeable
        ref={swipeRef}
        renderRightActions={renderDelete}
        overshootRight={false}
        friction={2}
        rightThreshold={40}
      >
        <MenuItemCard
          image={resolveFoodImage(item.image_path || item.image_key || item.name)}
          title={item.name}
          subtitle="Prepared fresh for checkout"
          price={`Rs. ${item.price}`}
          style={styles.card}
          contentAccessibility={{
            accessibilityLabel: `${item.name}, ${item.quantity || 1} in cart, Rs. ${item.price} each`,
            accessibilityActions: [DELETE_ACTION],
            onAccessibilityAction: (event) => {
              if (event.nativeEvent.actionName === DELETE_ACTION.name) {
                onDelete(item);
              }
            },
          }}
          trailing={
            <QtyStepper
              vertical
              value={item.quantity || 1}
              onIncrease={() => onIncrease(item)}
              onDecrease={() => onDecrease(item)}
            />
          }
        />
      </ReanimatedSwipeable>
    </FadeInItem>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: 0,
  },
  action: {
    width: 88,
    marginLeft: spacing.sm,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    marginTop: spacing.xs,
  },
});
