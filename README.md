# FoodApp

FoodApp is a React Native (CLI, not Expo) food-ordering demo. Users browse
restaurants, open menus, build a cart and go through a mock checkout flow. An
admin role can manage restaurants, menu items and a sample user list.

**It is a local-only app.** All data lives in an on-device SQLite database.
There is no backend, no real orders and no payments. The only network feature
is Firebase Cloud Messaging for push notifications.

## What is implemented

**Customer**
- Splash, three onboarding screens (skippable), and guest browsing.
- Email/password register and login, checked against the local database.
  The session is restored from AsyncStorage.
- Home: restaurant lists ("Nearby favorites", "Popular right now") with
  filters (deals, quick bites, top rated), skeleton and empty states.
- Restaurant details, menu with price filters, and an add/remove cart
  stepper.
- Search across restaurants (name, offer, delivery time) with recent
  searches.
- Cart with quantity controls, a count badge on the Cart tab, a flat delivery
  fee, and the promo codes `SAVE10` (10%) and `FOOD5` (5%). Checkout requires
  login. The cart is cleared on logout.
- Order tracking screen (static demo content, not tied to a real order).
- Light, dark and system theme.
- Push notifications (FCM): foreground modal, and routing when a
  notification is opened.

**Admin** (role `admin`)
- Add, edit and delete restaurants and menu items from the Home and Menu
  screens.
- A generic "Manage users" form stored as JSON in SQLite.
- An admin account is seeded on first run; see `src/database/dbs.js`.

## Known limitations

- No backend: data is per device and orders are never placed or stored.
- The order tracking screen is static.
- Favorites (hearts) are in-memory only and are lost on reload.
- Passwords are stored in plain text in SQLite, and the stored session
  includes the password. Do not use real credentials.
- Only restaurant 1 has seeded menu items; other restaurants show an empty
  menu until an admin adds dishes.
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
├── __tests__/             Jest smoke test
├── .github/workflows/     CI: signed release APK on push to main
└── src/
    ├── Admin/             ManageItems (restaurant form), ManageMenuItems (dish form)
    ├── Context/           ThemeProvider, CartContext (cart state, backed by SQLite)
    ├── assets/            images
    ├── components/        NotificationModal
    │   └── ui/            AppButton, EmptyState, SearchBar, SectionHeader, SkeletonCard
    ├── constants/         designSystem (colors, spacing, radius), imageRegistry
    ├── database/          client (SQLite connection), schema (versioned migrations + seed),
    │   │                  sql (promise helpers), dbs (app-start hook, admin_users helpers)
    │   └── repositories/  restaurantRepo, menuRepo, cartRepo, userRepo
    ├── navigation/        AppNavigator, TabNavigator, HomeStack, rootNavigation
    ├── screens/           Auth, Cart, Details, Home (with HomeHeader), Loader, Menu,
    │                      Onboarding, Profile, Search
    └── services/          notificationService (FCM)
```

## Navigation

`Loader` → `Onboarding1-3` → `Tab` (Home, Search, Cart, Profile). Inside the
Home tab: `HomeScreen` → `Details` → `MenuScreen`. Login, Register,
TrackOrder and the admin screens live on the root stack.

## Release builds

CI (`.github/workflows/build.yml`) builds a signed APK on pushes to `main`,
using the repository secrets `ANDROID_KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`,
`KEY_ALIAS` and `KEY_PASSWORD`. Keystores and their text exports are
git-ignored and must never be committed.
