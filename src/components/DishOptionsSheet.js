import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import AntDesign from "@react-native-vector-icons/ant-design";
import AppButton from "./ui/AppButton";
import AppText from "./ui/AppText";
import BottomSheet from "./ui/BottomSheet";
import QtyStepper from "./ui/QtyStepper";
import SkeletonCard from "./ui/SkeletonCard";
import useAsyncData from "../hooks/useAsyncData";
import * as optionsRepo from "../database/repositories/optionsRepo";
import { useTheme } from "../Context/ThemeProvider";
import { fontFamily, layout, radius, spacing } from "../constants/designSystem";
import { resolveFoodImage } from "../constants/imageRegistry";
import {
  defaultSelectionIds,
  optionsByIds,
  priceWithOptions,
  reconcileSelection,
  toggleOption,
  validateSelection,
} from "../utils/cartLines";
import { formatMoney } from "../utils/pricing";

const deltaLabel = (delta) => {
  const value = Number(delta || 0);
  if (!value) {
    return "";
  }
  return `${value > 0 ? "+" : "-"}${formatMoney(Math.abs(value))}`;
};

const hint = (group) => {
  if (group.type === "single") {
    return group.required ? "Required · choose 1" : "Optional · choose 1";
  }
  const limit = group.max_select ? `up to ${group.max_select}` : "any";
  return `${group.required ? "Required" : "Optional"} · ${limit}`;
};

/**
 * "Customize" sheet for a dish: image, name, description, its option groups
 * (radios for single, checkboxes for multi), a quantity stepper and a button
 * that shows the live total. `initialOptions`/`initialQuantity` prefill it when
 * editing a cart line (mode "edit" says "Update" instead of "Add to cart").
 * onSubmit receives { selectedOptions, quantity }.
 */
export default function DishOptionsSheet({
  visible,
  item,
  mode = "add",
  initialOptions = null,
  initialQuantity = 1,
  onClose,
  onSubmit,
}) {
  const { colors } = useTheme();
  const itemId = item?.id;
  const { data: groups, loading, error, reload } = useAsyncData(
    () => (itemId ? optionsRepo.listGroupsForItem(itemId) : Promise.resolve([])),
    [itemId]
  );
  const [selectedIds, setSelectedIds] = useState([]);
  const [quantity, setQuantity] = useState(initialQuantity);

  // Every time the sheet opens (or its options load) start from the defaults,
  // or from the line being edited with options that no longer exist dropped.
  useEffect(() => {
    if (!visible || !groups) {
      return;
    }
    setSelectedIds(
      initialOptions
        ? reconcileSelection(groups, initialOptions).selected.map((option) => option.id)
        : defaultSelectionIds(groups)
    );
    setQuantity(initialQuantity);
    // initialOptions/initialQuantity describe the line being opened; they only matter on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, groups]);

  if (!item) {
    return null;
  }

  const list = groups || [];
  const selectedOptions = optionsByIds(list, selectedIds);
  const { ok, errors } = validateSelection(list, selectedIds);
  const unitPrice = priceWithOptions(item.price, selectedOptions);
  const total = unitPrice * quantity;

  const renderOption = (group, option) => {
    const selected = selectedIds.includes(option.id);
    const atLimit =
      group.type === "multi" &&
      group.max_select &&
      !selected &&
      list
        .find((candidate) => candidate.id === group.id)
        .options.filter((candidate) => selectedIds.includes(candidate.id)).length >= group.max_select;
    const single = group.type === "single";

    return (
      <Pressable
        key={option.id}
        onPress={() => setSelectedIds((current) => toggleOption(list, current, group.id, option.id))}
        disabled={atLimit}
        accessibilityRole={single ? "radio" : "checkbox"}
        accessibilityState={{ checked: selected, disabled: Boolean(atLimit) }}
        accessibilityLabel={`${option.name}${deltaLabel(option.price_delta) ? `, ${deltaLabel(option.price_delta)}` : ""}`}
        style={[
          styles.option,
          { borderColor: selected ? colors.primaryStrong : colors.borderSoft, opacity: atLimit ? 0.5 : 1 },
        ]}
      >
        <View
          style={[
            styles.indicator,
            single ? styles.radio : styles.checkbox,
            {
              borderColor: selected ? colors.primaryStrong : colors.borderStrong,
              backgroundColor: selected && !single ? colors.primaryStrong : "transparent",
            },
          ]}
        >
          {selected && single ? (
            <View style={[styles.radioDot, { backgroundColor: colors.primaryStrong }]} />
          ) : null}
          {selected && !single ? <AntDesign name="check" size={12} color={colors.onPrimary} /> : null}
        </View>
        <AppText variant="body" style={styles.optionName}>
          {option.name}
        </AppText>
        <AppText variant="label" muted>
          {deltaLabel(option.price_delta)}
        </AppText>
      </Pressable>
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel={`Customize ${item.name}`}>
      <View style={styles.header}>
        <Image source={resolveFoodImage(item.image_key || item.name)} style={styles.image} />
        <View style={styles.headerText}>
          <AppText variant="h3" numberOfLines={2}>
            {item.name}
          </AppText>
          {item.description ? (
            <AppText variant="label" muted numberOfLines={2} style={styles.description}>
              {item.description}
            </AppText>
          ) : null}
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <SkeletonCard width={null} height={120} style={styles.skeleton} />
        ) : error ? (
          <View>
            <AppText variant="body" color="dangerText">
              Could not load the options.
            </AppText>
            <AppButton label="Try again" variant="outline" onPress={() => reload()} style={styles.retry} />
          </View>
        ) : (
          list.map((group) => (
            <View key={group.id} style={styles.group} accessibilityRole={group.type === "single" ? "radiogroup" : undefined}>
              <View style={styles.groupTitle}>
                <AppText variant="body" style={styles.bold}>
                  {group.name}
                </AppText>
                <AppText variant="caption" color={errors[group.id] ? "dangerText" : "textSecondary"}>
                  {errors[group.id] || hint(group)}
                </AppText>
              </View>
              {group.options.map((option) => renderOption(group, option))}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <QtyStepper
          value={quantity}
          onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
          onIncrease={() => setQuantity((current) => Math.min(current + 1, 20))}
          style={styles.stepper}
        />
        <View style={styles.submit}>
          <AppButton
            label={`${mode === "edit" ? "Update" : "Add to cart"} · ${formatMoney(total)}`}
            disabled={loading || Boolean(error) || !ok}
            onPress={() => onSubmit({ selectedOptions, quantity })}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: layout.pagePadding,
    paddingBottom: spacing.md,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  description: {
    marginTop: spacing.xs,
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    paddingHorizontal: layout.pagePadding,
    paddingBottom: spacing.md,
  },
  skeleton: {
    width: "100%",
  },
  retry: {
    marginTop: spacing.md,
  },
  group: {
    marginBottom: spacing.lg,
  },
  groupTitle: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  bold: {
    fontFamily: fontFamily.bold,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  indicator: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  radio: {
    borderRadius: 11,
  },
  checkbox: {
    borderRadius: 6,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionName: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: layout.pagePadding,
    paddingTop: spacing.md,
  },
  stepper: {
    marginRight: spacing.md,
  },
  submit: {
    flex: 1,
  },
});
