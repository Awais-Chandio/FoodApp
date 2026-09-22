jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(() => Promise.resolve()),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const {resolveInitialRoute} = require('../src/navigation/initialRoute');
const {
  hasSeenOnboarding,
  markOnboardingSeen,
  finishOnboarding,
} = require('../src/services/onboarding');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
});

describe('resolveInitialRoute', () => {
  it.each([
    // isLoggedIn, hasSeenOnboarding, expected
    [true, false, 'Tab'], // restored session skips onboarding
    [true, true, 'Tab'],
    [false, false, 'Onboarding'], // first launch
    [false, true, 'Tab'], // returning logged-out user browses as a guest
  ])('isLoggedIn=%s hasSeenOnboarding=%s -> %s', (isLoggedIn, seen, expected) => {
    expect(resolveInitialRoute({isLoggedIn, hasSeenOnboarding: seen})).toBe(expected);
  });
});

describe('onboarding flag', () => {
  it('is false on first launch and true once stored', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    expect(await hasSeenOnboarding()).toBe(false);

    AsyncStorage.getItem.mockResolvedValueOnce('true');
    expect(await hasSeenOnboarding()).toBe(true);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('has_seen_onboarding');
  });

  it('does not trap the user in onboarding if storage cannot be read', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('unavailable'));
    expect(await hasSeenOnboarding()).toBe(true);
  });

  it('markOnboardingSeen persists the flag', async () => {
    await markOnboardingSeen();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('has_seen_onboarding', 'true');
  });

  it('finishOnboarding saves the flag, then resets navigation to Tab', async () => {
    const order = [];
    AsyncStorage.setItem.mockImplementationOnce(async () => order.push('saved'));
    const navigation = {reset: jest.fn(() => order.push('reset'))};

    await finishOnboarding(navigation);

    expect(order).toEqual(['saved', 'reset']);
    expect(navigation.reset).toHaveBeenCalledWith({index: 0, routes: [{name: 'Tab'}]});
  });
});
