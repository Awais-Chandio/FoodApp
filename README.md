# FoodApp

FoodApp is a React Native (CLI, not Expo) food-ordering demo. Users browse
restaurants, open menus, build a cart, check out, follow a simulated delivery and
reorder past orders. An admin role can manage restaurants, menu items and a
sample user list.

**It is a local-only app.** All data lives in an on-device SQLite database.
There is no backend and no real payments: orders are saved on the device and
their delivery progress is simulated. The only network feature
is Firebase Cloud Messaging for push notifications.

## What is implemented

**Customer**
- Splash, one swipeable onboarding (skippable), and guest browsing.
- Email/password register and login, checked against the local database
  (hashed passwords). The session is restored from AsyncStorage.
- Home: an offers carousel (active promos and restaurant offers), an "Order
  again" row for signed-in users, restaurant lists with one row of filter chips
  (deals, quick bites, top rated), skeleton and empty states.
- Restaurant details (with ratings and the latest reviews) and a menu with
  sticky category tabs, dish descriptions, veg/spice tags and price/Veg-only
  filters. Every seeded restaurant has a full demo menu. Mains and drinks open a
  "customize" sheet (size, add-ons) with a live total; the cart keeps each
  combination as its own line and lets you edit it.
- Favorites: the heart on Home and Details saves a restaurant for the signed-in
  user (stored in SQLite, per user). Saved restaurants are listed on Profile.
  Guests get a "Log in to save favorites" prompt.
- Search across restaurants (name, offer, delivery time) and dishes (name),
  shown as Restaurants and Dishes sections, with recent searches. Tapping a
  dish opens its restaurant's menu.
- Cart with swipe-to-delete (with Undo), a free-delivery progress bar (free from
  Rs. 800), quantity controls, a count badge on the Cart tab, a flat delivery
  fee, and promo codes read from the `promos` table: `SAVE10` (10%), `FOOD5`
  (5%) and `WELCOME20` (20%, minimum order Rs. 400, expires 31 Dec 2026). The
  applied code is shown as a chip with Remove, and is dropped with a message if
  the cart stops qualifying. Checkout requires login. The cart is cleared on
  logout.
- Checkout: a validated delivery address (prefilled from your last order) and
  a payment choice, Cash on delivery or Card (demo, no card details are ever
  collected). Placing the order saves it, its items and the totals, and empties
  the cart in one database transaction.
- Order tracking: real order details and a status that moves Placed → Preparing
  → On the way → Delivered (20 s, 60 s and 120 s after placing), saved in the
  database and shown with an animated stepper.
- Order history (Profile → Order history) with a Reorder button that replaces
  the cart with a past order at today's prices (choices are re-applied to the
  current options). Delivered orders can be rated: stars and a comment, one
  review per restaurant per order. A restaurant's rating blends its base rating
  with real reviews.
- Light, dark and system theme ("Ember" palette, Plus Jakarta Sans). Colors
  come only from `src/constants/designSystem.js` (an ESLint rule rejects hex and
  rgba literals elsewhere), and a Jest test checks the contrast of every
  text/background pair in both modes. Text uses `AppText` (type scale, 1.3x
  font-scaling cap).
- Push notifications (FCM): foreground modal, and routing when a
  notification is opened.

**Admin** (role `admin`)
- Add, edit and delete restaurants and menu items from the Home and Menu
  screens.
- A generic "Manage users" form stored as JSON in SQLite.
- An admin account is seeded on first run; see `src/database/dbs.js`.

## Known limitations

- No backend: data is per device, and there is no real kitchen, rider or
  payment. Order progress is simulated from the time the order was placed, and
  only advances while the app is open or the next time you open it.
- Sign-in is checked on the device. Passwords are stored as salted PBKDF2
  hashes in SQLite and the saved session holds only id, email and role, which
  protects a copied database file. It is not server-side authentication, so do
  not use real credentials.
- Orders placed before reviews existed cannot be reviewed (their items carry no
  restaurant). Add-to-cart haptics use the built-in `Vibration` (a crude buzz on
  iOS); swap `src/utils/haptics.js` for a haptics library later.
- Dish photos are reused (`food1`, `food2`, `food3`, `chicken`) until real
  ones exist, so photos repeat across menus.
- Promo codes and dish options have no admin screen yet; they live in the
  `promos`, `option_groups` and `options` tables (options are seeded from
  `src/database/seedData.js`).
- Push notifications are configured for Android. iOS has no
  `GoogleService-Info.plist` or Firebase setup, so iOS push is not expected
  to work.

## Tech stack

| Area | Library |
|---|---|
| Framework | React Native 0.81.1 (CLI), React 19.1, New Architecture and Hermes enabled |
| Language | JavaScript (TypeScript only for the Jest test) |
| Navigation | React Navigation 7: stack, native-stack, bottom-tabs |
| State | React Context (`AuthContext`, `ThemeProvider`, `CartContext`) |
| Local data | `react-native-sqlite-storage`, `@react-native-async-storage/async-storage` |
| Push | `@react-native-firebase/app` + `messaging` |
| Password hashing | `react-native-quick-crypto` (PBKDF2-SHA256), with its peers `react-native-nitro-modules` and `react-native-quick-base64`. Requires the New Architecture. |
| UI | `react-native-linear-gradient`, AntDesign icons (`@react-native-vector-icons/ant-design`), `react-native-toast-message`, `@react-native-picker/picker`, `@react-native-community/datetimepicker` |
| Animation | React Native `Animated`. `react-native-reanimated` is installed but not used yet. |

Firebase Auth, Firestore and Storage are **not** used.

## Getting started

Prerequisites: Node 20 or newer, the
[React Native environment setup](https://reactnative.dev/docs/set-up-your-development-environment)
for your platform, JDK 17 and Android Studio for Android, and Xcode with
CocoaPods for iOS.

```sh
npm install
npm start            # Metro bundler, keep it running

npm run android      # in a second terminal
# iOS
bundle install
(cd ios && bundle exec pod install)
npm run ios
```

Push notifications on Android need `android/app/google-services.json` for
your Firebase project. The repo already contains one.

```sh
npm run lint
npm test
```

## Project structure

```
FoodApp/
├── App.js                 providers, NavigationContainer, push-notification routing
├── index.js               app entry + FCM background handler
├── android/  ios/         native projects
├── assets/fonts/          Plus Jakarta Sans (Regular, SemiBold, Bold; OFL), linked with react-native-asset
├── __tests__/             Jest tests (one suite runs the real SQL on node:sqlite, Node 22+)
├── jest/                  test helper: SQLite adapter for those tests
├── .github/workflows/     CI: signed release APK on push to main
└── src/
    ├── Admin/             ManageItems (restaurant form), ManageMenuItems (dish form)
    ├── Context/           ThemeProvider, CartContext (cart + applied promo), FavoritesContext
    ├── assets/            images
    ├── components/        NotificationModal, OrderStatusStepper
    │   └── ui/            AppText, AppButton, AppToast, FilterChip, QtyStepper, MenuItemCard,
    │                      RestaurantCard, TextField, ScreenHeader, EmptyState, SearchBar,
    │                      SectionHeader, SkeletonCard
    ├── constants/         designSystem (colors, spacing, radius), imageRegistry
    ├── database/          client (SQLite connection), schema (versioned migrations + seed),
    │   │                  seedData (demo restaurants, dishes), sql (promise helpers),
    │   │                  dbs (app-start hook, admin_users helpers)
    │   └── repositories/  restaurantRepo, menuRepo, cartRepo, userRepo, orderRepo,
    │                      favoritesRepo, promoRepo
    ├── navigation/        AppNavigator, TabNavigator, HomeStack, rootNavigation
    ├── screens/           Auth, Cart, Checkout, Details, Home (with HomeHeader), Loader,
    │                      Menu, Onboarding, Orders (history), Profile, Search
    ├── services/          notificationService (FCM), passwordHash, onboarding flag
    └── utils/             pricing (totals, promo rules), search, orderStatus (delivery schedule), validation
```

## Navigation

`Loader` decides where to go: a restored session goes straight to `Tab`, a
first launch shows `Onboarding1-3` once (flag `has_seen_onboarding` in
AsyncStorage), and everyone else lands on `Tab` as a guest. `Tab` holds Home,
Search, Cart and Profile. Inside the Home tab: `HomeScreen` → `Details` →
`MenuScreen`. Login, Register, Checkout, TrackOrder and OrderHistory live on
the root stack. Placing an order resets the stack to `[Tab, TrackOrder]`, so
Back from tracking returns to the tabs.

Login and logout use `navigation.reset`, so Back never returns to a stale
screen. The admin routes (`ManageMenuItems`, `ManageUsers`, `Users`, and
`ManageItems` in the Home stack) are only registered when the signed-in user
has the `admin` role. This is a UI guard: with a local database it cannot stop
someone who controls the device.

## Release builds

CI (`.github/workflows/build.yml`) builds a signed APK on pushes to `main`,
using the repository secrets `ANDROID_KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`,
`KEY_ALIAS` and `KEY_PASSWORD`. Keystores and their text exports are
git-ignored and must never be committed.
