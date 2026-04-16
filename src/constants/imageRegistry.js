export const appImages = {
  heroBackground: require("../assets/Group-118.png"),
  wave: require("../assets/Vector-3.png"),
  logo: require("../assets/Group-6.png"),
  onboardingFood: require("../assets/popcorn-1-1.png"),
  onboardingPayment: require("../assets/money.png"),
  onboardingDelivery: require("../assets/restaurant-1.png"),
};

export const restaurantImageMap = {
  "1": require("../assets/Westway.png"),
  "2": require("../assets/Fortune.png"),
  "3": require("../assets/Seafood.png"),
  "4": require("../assets/food1.jpg"),
  "5": require("../assets/food2.jpg"),
  "6": require("../assets/food3.jpg"),
  "7": require("../assets/Moonland.png"),
  "8": require("../assets/Starfish.png"),
  "9": require("../assets/BlackNodles.png"),
  Westway: require("../assets/Westway.png"),
  Fortune: require("../assets/Fortune.png"),
  Seafood: require("../assets/Seafood.png"),
  Moonland: require("../assets/Moonland.png"),
  Starfish: require("../assets/Starfish.png"),
  "Black Noodles": require("../assets/BlackNodles.png"),
  BlackNodles: require("../assets/BlackNodles.png"),
  BlackNoodles: require("../assets/BlackNodles.png"),
  chicken: require("../assets/chicken.jpg"),
  food1: require("../assets/food1.jpg"),
  food2: require("../assets/food2.jpg"),
  food3: require("../assets/food3.jpg"),
};

export const categoryAssetMap = {
  all: require("../assets/all.png"),
  pizza: require("../assets/pizza.png"),
  beverages: require("../assets/beverages.png"),
  asian: require("../assets/asian.png"),
};

const cleanKey = (value) => String(value || "").trim().replace(/\.(png|jpe?g|webp)$/i, "");

export const resolveFoodImage = (value, fallbackKey = "food1") => {
  if (!value) {
    return restaurantImageMap[fallbackKey] || restaurantImageMap.food1;
  }

  if (typeof value === "object" && value.uri) {
    return value;
  }

  const rawValue = String(value).trim();
  if (/^(https?:|file:|content:|data:)/i.test(rawValue)) {
    return { uri: rawValue };
  }

  const cleaned = cleanKey(rawValue);
  return (
    restaurantImageMap[rawValue] ||
    restaurantImageMap[cleaned] ||
    restaurantImageMap[fallbackKey] ||
    restaurantImageMap.food1
  );
};

export const resolveRestaurantImage = (item) => {
  if (!item) {
    return restaurantImageMap.food1;
  }

  const candidates = [
    item.image_path,
    item.image_key,
    item.name,
    String(item.id || ""),
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    const resolved = resolveFoodImage(candidate, "food1");
    if (resolved) {
      return resolved;
    }
  }

  return restaurantImageMap.food1;
};
