# FoodApp

FoodApp is a React Native mobile application designed for food ordering and delivery. It allows users to browse restaurants, view menus, add items to cart, track orders, and manage their profiles. The app includes an admin panel for managing menu items and restaurants. This project demonstrates real-world mobile app development with Firebase integration, SQLite for local storage, and a clean, user-friendly interface.

## Project Summary

- **Project type:** React Native CLI mobile application
- **Primary goal:** Food ordering and delivery platform
- **Target audience:** Consumers looking for convenient food ordering and delivery services
- **Platform:** Android / iOS via React Native

## Features

### User Features
- **Authentication:** Email/password sign up, login, logout, and session restore using Firebase Auth
- **Onboarding:** Introductory screens for new users
- **Home Screen:** Browse restaurants, categories (All meals, Deals, Fast delivery, Top picks), filters (All, Hot deals, Quick bites, Top rated)
- **Menu Browsing:** View restaurant details, menus, and items
- **Search:** Search for restaurants and menu items
- **Cart Management:** Add items to cart, view cart, proceed to checkout
- **Order Tracking:** Track order status and delivery
- **Profile Management:** View and edit user profile, manage preferences
- **Favorites:** Mark restaurants as favorites

### Admin Features
- **Admin Panel:** Manage restaurants, menu items, and users
- **Item Management:** Add, edit, delete menu items
- **User Management:** View and manage registered users

### Additional Features
- **Offline Support:** Local SQLite database for caching data
- **Real-time Updates:** Firebase Firestore for real-time data synchronization
- **Image Storage:** Firebase Storage for uploading and storing images
- **Notifications:** Toast messages and snackbars for user feedback
- **Theming:** Dark/light theme support
- **Responsive Design:** Optimized for different screen sizes

## Tech Stack

- **React Native:** 0.81.1 (CLI-based)
- **Navigation:** React Navigation (Stack, Tabs, Native Stack)
- **Authentication & Database:** Firebase (Auth, Firestore, Storage)
- **Local Storage:** AsyncStorage and SQLite
- **State Management:** React Context (ThemeProvider, AuthContext)
- **UI Components:** Custom components with LinearGradient, Vector Icons
- **Forms & Validation:** Basic form handling (can be extended with libraries like React Hook Form)
- **Image Handling:** React Native Image Picker
- **Animations:** React Native Reanimated
- **Other Libraries:** DateTimePicker, Snackbar, Toast Message, Splash Screen, etc.

## Installation

### Prerequisites
- Node.js (version 18 or higher)
- React Native development environment set up for Android/iOS
- Android Studio (for Android) or Xcode (for iOS)
- Firebase project configured with Auth, Firestore, and Storage enabled

### Steps
1. Clone the repository:
   ```
   git clone <repository-url>
   cd FoodApp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Storage
   - Download the `google-services.json` file for Android and place it in `android/app/`
   - For iOS, configure the Firebase SDK in Xcode

4. Configure the app:
   - Update Firebase configuration in the app (if needed, check Firebase config files)

5. Run the app:
   - For Android: `npm run android`
   - For iOS: `npm run ios`

## Usage

1. **Launch the App:** Run the app on an emulator or device.
2. **Onboarding:** New users will see onboarding screens.
3. **Authentication:** Sign up or log in with email and password.
4. **Browse:** Explore restaurants and menus on the home screen.
5. **Order:** Add items to cart and place orders.
6. **Track:** Monitor order status in the cart section.
7. **Admin Access:** If logged in as admin, access the admin panel to manage items.

## Project Structure

```
FoodApp/
├── android/                 # Android-specific files
├── ios/                     # iOS-specific files
├── src/
│   ├── Admin/               # Admin screens (AdminScreen, ManageItems, ManageMenuItems)
│   ├── assets/              # Image assets and mappings
│   ├── components/          # Reusable UI components (DetailScreen, HomeHeader, etc.)
│   │   └── ui/              # UI-specific components (AppButton, EmptyState, etc.)
│   ├── constants/           # Design system, image registry
│   ├── Context/             # React Context providers (ThemeProvider)
│   ├── database/            # SQLite database setup and queries
│   ├── navigation/          # Navigation configurations (AppNavigator, TabNavigator, etc.)
│   ├── screens/             # Feature screens
│   │   ├── Auth/            # Authentication screens (Login, Register)
│   │   ├── Cart/            # Cart and order tracking
│   │   ├── Home/            # Home screen
│   │   ├── Loader/          # Loading screen
│   │   ├── Onboarding/      # Onboarding screens
│   │   └── Profile/         # Profile and user management
│   └── ...
├── __tests__/               # Jest tests
├── package.json             # Dependencies and scripts
├── app.json                 # App configuration
└── README.md                # This file
```

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Current Status

- Base React Native project is set up and running.
- Authentication, navigation, and core screens are implemented.
- Firebase integration for auth and database is in place.
- Admin panel and user management are functional.
- Ongoing: Enhancing UI/UX, adding more features like payment integration, and optimizing performance.

## Run locally

```sh
npm install
npm start
npm run android
# or
npm run ios
```

> Note: Android and iOS setup depend on your local React Native development environment. Follow React Native official setup if you have not configured it.

## Notes

This project is intentionally scoped for one developer to deliver end-to-end functionality in phases. The emphasis is on clean architecture, backend integration, real user flows, and interview-friendly implementation.
