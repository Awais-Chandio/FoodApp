import React, { useRef } from "react";
import { Pressable, StyleSheet } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppText from "./ui/AppText";
import FadeInItem from "./ui/FadeInItem";
import MenuItemCard from "./ui/MenuItemCard";
import QtyStepper from "./ui/QtyStepper";
import { useTheme } from "../Context/ThemeProvider";
import { fontFamily, layout, spacing } from "../constants/designSystem";
import { describeOptions, parseSelectedOptions } from "../utils/cartLines";
import { resolveFoodImage } from "../constants/imageRegistry";

const DELETE_ACTION = { name: "delete", label: "Delete" };

/**
 * One cart line. Swipe left to reveal Delete. Screen-reader users get a
 * "Delete" accessibility action instead (swipes are not discoverable without
 * sight), and the stepper's minus removes the line at quantity 1.
 */
export default function CartLine({ item, index = 0, onIncrease, onDecrease, onDelete, onCustomize }) {
  const { colors } = useTheme();
  const swipeRef = useRef(null);
  const options = describeOptions(parseSelectedOptions(item.selected_options));

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
          subtitle={options || "Prepared fresh for checkout"}
          price={`Rs. ${item.price}`}
          style={styles.card}
          footer={
            onCustomize ? (
              <Pressable
                onPress={() => onCustomize(item)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Customize ${item.name}`}
                style={styles.customize}
              >
                <AppText variant="label" color="primaryStrong" style={styles.customizeText}>
                  Customize
                </AppText>
              </Pressable>
            ) : null
          }
          contentAccessibility={{
            accessibilityLabel: `${item.name}${options ? `, ${options}` : ""}, ${item.quantity || 1} in cart, Rs. ${item.price} each`,
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
    borderRadius: layout.cardRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  customize: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
  },
  customizeText: {
    fontFamily: fontFamily.bold,
  },
  actionText: {
    marginTop: spacing.xs,
  },
});
