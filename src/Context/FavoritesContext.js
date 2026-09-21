import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Toast from "react-native-toast-message";
import * as favoritesRepo from "../database/repositories/favoritesRepo";
import { useAuth } from "../screens/Auth/AuthContext";
import { navigationRef } from "../navigation/rootNavigation";

const FavoritesContext = createContext(null);

export function useFavorites() {
  const value = useContext(FavoritesContext);
  if (!value) {
    throw new Error("useFavorites must be used inside a FavoritesProvider");
  }
  return value;
}

const promptLogin = () =>
  Toast.show({
    type: "info",
    text1: "Log in to save favorites",
    text2: "Tap here to log in.",
    onPress: () => {
      Toast.hide();
      if (navigationRef.isReady()) {
        navigationRef.navigate("Login");
      }
    },
  });

/**
 * The saved restaurants of the signed-in user, shared by every screen so the
 * heart on Home, the heart on Detail and the Profile list never drift apart.
 *
 * toggle() is optimistic: the heart flips at once, the writes run one after
 * another, and if one fails the state is re-read from the database (so the
 * heart rolls back) and an error toast is shown. Guests cannot save anything:
 * for them toggle() shows a "Log in" toast instead. State reloads when the
 * user changes and is cleared on logout.
 */
export function FavoritesProvider({ children }) {
  const { user, isLoggedIn } = useAuth();
  const userId = isLoggedIn ? user?.id ?? null : null;

  const [ids, setIds] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Synchronous mirrors, so two taps in the same tick see each other.
  const idsRef = useRef([]);
  const userIdRef = useRef(userId);
  const queueRef = useRef(Promise.resolve());
  const pendingRef = useRef(0);
  userIdRef.current = userId;

  const commitIds = useCallback((next) => {
    idsRef.current = next;
    setIds(next);
  }, []);

  const reload = useCallback(async () => {
    const forUser = userIdRef.current;
    if (!forUser) {
      commitIds([]);
      setRows([]);
      return;
    }
    const restaurants = await favoritesRepo.listRestaurants(forUser);
    // The user may have changed while the query ran; drop the stale answer.
    if (userIdRef.current !== forUser) {
      return;
    }
    setRows(restaurants);
    commitIds(restaurants.map((restaurant) => restaurant.id));
  }, [commitIds]);

  useEffect(() => {
    commitIds([]);
    setRows([]);
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    reload()
      .catch((error) => console.log("favorites load error", error))
      .finally(() => setLoading(false));
  }, [userId, commitIds, reload]);

  const toggle = useCallback(
    (restaurantId) => {
      if (!userId) {
        promptLogin();
        return Promise.resolve();
      }

      const current = idsRef.current;
      commitIds(
        current.includes(restaurantId)
          ? current.filter((id) => id !== restaurantId)
          : [restaurantId, ...current]
      );

      pendingRef.current += 1;
      const write = queueRef.current.then(() => favoritesRepo.toggle(userId, restaurantId));
      queueRef.current = write.catch(() => {});

      return write.then(
        async () => {
          pendingRef.current -= 1;
          // Re-read only when the queue is empty, so a second tap in flight
          // is not overwritten by the first tap's result.
          if (pendingRef.current === 0) {
            await reload().catch((error) => console.log("favorites reload error", error));
          }
        },
        async (error) => {
          pendingRef.current -= 1;
          console.log("favorite toggle failed", error);
          Toast.show({ type: "error", text1: "Could not update your favorites" });
          await reload().catch((reloadError) =>
            console.log("favorites reload error", reloadError)
          );
        }
      );
    },
    [userId, commitIds, reload]
  );

  const value = useMemo(() => {
    const idSet = new Set(ids);
    return {
      isFavorite: (restaurantId) => idSet.has(restaurantId),
      toggle,
      // Rows come from the last read, so an un-hearted restaurant disappears at
      // once and a newly hearted one appears when the write has been confirmed.
      favorites: rows.filter((restaurant) => idSet.has(restaurant.id)),
      count: ids.length,
      loading,
    };
  }, [ids, rows, loading, toggle]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
