// Runs before every test file: Reanimated, Worklets and Gesture Handler need
// their Jest stand-ins because the native modules do not exist in Node.
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
