/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: any) => children,
}));

jest.mock('../src/navigation/AppNavigator', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return function MockAppNavigator() {
    return <Text>Mock Navigator</Text>;
  };
});

jest.mock('../src/database/dbs', () => ({
  useCreateTables: jest.fn(),
}));

jest.mock('react-native-toast-message', () => {
  return function MockToast() {
    return null;
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
