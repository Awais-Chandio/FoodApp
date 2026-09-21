module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Must stay last: it compiles Reanimated/Gesture Handler worklets.
  plugins: ['react-native-worklets/plugin'],
};
