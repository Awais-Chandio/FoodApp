import {Platform, Vibration} from 'react-native';
import {tapHaptic} from '../src/utils/haptics';

beforeEach(() => jest.restoreAllMocks());

it('vibrates briefly on Android', () => {
  const spy = jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
  Platform.OS = 'android';
  tapHaptic();
  expect(spy).toHaveBeenCalledWith(12);
});

it('uses the plain buzz on iOS', () => {
  const spy = jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
  Platform.OS = 'ios';
  tapHaptic();
  expect(spy).toHaveBeenCalledWith();
});

it('never throws when vibration is unavailable', () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {
    throw new Error('no vibrator');
  });
  expect(() => tapHaptic()).not.toThrow();
});
