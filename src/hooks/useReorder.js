import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../screens/Auth/AuthContext";
import * as orderRepo from "../database/repositories/orderRepo";

/**
 * "Reorder" for a past order: refills the cart at today's prices. If the cart
 * already has items it asks before replacing them. Shared by Order history and
 * Home's "Order again" row.
 */
export default function useReorder() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { count: cartCount, replaceAll } = useCart();
  const [reorderingId, setReorderingId] = useState(null);

  const performReorder = async (order) => {
    setReorderingId(order.id);
    try {
      const { lines, unavailable, optionsDropped = 0 } = await orderRepo.getReorderLines(order.id, user.id);

      if (!lines.length) {
        Toast.show({
          type: "error",
          text1: "Can't reorder",
          text2: "None of these dishes are on the menu anymore.",
        });
        return;
      }

      await replaceAll(lines);
      Toast.show({
        type: "success",
        text1: "Cart updated",
        text2: [
          unavailable
            ? `${unavailable} ${unavailable === 1 ? "dish is" : "dishes are"} no longer available.`
            : null,
          optionsDropped
            ? `${optionsDropped} ${optionsDropped === 1 ? "option is" : "options are"} no longer offered and was dropped.`
            : null,
        ]
          .filter(Boolean)
          .join(" ") || "Your previous order is back in the cart.",
      });
      navigation.navigate("Tab", { screen: "AddToCartScreen" });
    } catch (error) {
      console.log("reorder error", error);
      Toast.show({ type: "error", text1: "Could not reorder", text2: "Please try again." });
    } finally {
      setReorderingId(null);
    }
  };

  const reorder = (order) => {
    if (cartCount === 0) {
      performReorder(order);
      return;
    }

    Alert.alert(
      "Replace your cart?",
      `Your cart has ${cartCount} ${cartCount === 1 ? "item" : "items"}. Reordering will replace ${
        cartCount === 1 ? "it" : "them"
      }.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Replace", style: "destructive", onPress: () => performReorder(order) },
      ]
    );
  };

  return { reorder, reorderingId };
}
