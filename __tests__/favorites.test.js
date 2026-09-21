import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {show: jest.fn(), hide: jest.fn()},
}));
jest.mock('../src/screens/Auth/AuthContext', () => ({useAuth: jest.fn()}));
jest.mock('../src/navigation/rootNavigation', () => ({
  navigationRef: {isReady: jest.fn(() => true), navigate: jest.fn()},
}));
jest.mock('../src/database/repositories/favoritesRepo', () => ({
  listRestaurants: jest.fn(),
  toggle: jest.fn(),
}));

const Toast = require('react-native-toast-message').default;
const {useAuth} = require('../src/screens/Auth/AuthContext');
const {navigationRef} = require('../src/navigation/rootNavigation');
const favoritesRepo = require('../src/database/repositories/favoritesRepo');
const {FavoritesProvider, useFavorites} = require('../src/Context/FavoritesContext');

const westway = {id: 1, name: 'Westway', rating: 4.6, time: '15 min'};
const fortune = {id: 2, name: 'Fortune', rating: 4.8, time: '25 min'};
const seafood = {id: 3, name: 'Seafood', rating: 4.6, time: '20 min'};

// Simulates the favorites table per user so reloads return realistic data.
let table;
const setUpFakeTable = (initial = {}) => {
  table = {};
  Object.entries(initial).forEach(([user, list]) => {
    table[user] = list.map(restaurant => ({...restaurant}));
  });
  favoritesRepo.listRestaurants.mockImplementation(userId =>
    Promise.resolve((table[userId] || []).map(restaurant => ({...restaurant}))),
  );
  favoritesRepo.toggle.mockImplementation((userId, restaurantId) => {
    const list = table[userId] || [];
    const exists = list.some(restaurant => restaurant.id === restaurantId);
    const all = [westway, fortune, seafood];
    table[userId] = exists
      ? list.filter(restaurant => restaurant.id !== restaurantId)
      : [all.find(restaurant => restaurant.id === restaurantId), ...list];
    return Promise.resolve(!exists);
  });
};

const signedIn = id => useAuth.mockReturnValue({user: {id, role: 'user'}, isLoggedIn: true});
const guest = () => useAuth.mockReturnValue({user: {role: 'guest'}, isLoggedIn: false});

let favorites;
const Probe = () => {
  favorites = useFavorites();
  return null;
};

let renderer;
const mount = async () => {
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <FavoritesProvider>
        <Probe />
      </FavoritesProvider>,
    );
  });
};
const remount = async () => {
  await ReactTestRenderer.act(async () => {
    renderer.update(
      <FavoritesProvider>
        <Probe />
      </FavoritesProvider>,
    );
  });
};
const run = fn => ReactTestRenderer.act(async () => fn());

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  setUpFakeTable();
  signedIn(7);
});

afterEach(() => {
  console.log.mockRestore();
});

it('loads the signed-in user\'s favorites', async () => {
  setUpFakeTable({7: [fortune, westway], 8: [seafood]});

  await mount();

  expect(favorites.loading).toBe(false);
  expect(favorites.count).toBe(2);
  expect(favorites.isFavorite(1)).toBe(true);
  expect(favorites.isFavorite(3)).toBe(false); // user 8's favorite
  expect(favorites.favorites.map(r => r.name)).toEqual(['Fortune', 'Westway']);
});

it('toggle() adds a favorite, persists it and lists the restaurant', async () => {
  await mount();

  await run(() => favorites.toggle(1));

  expect(favoritesRepo.toggle).toHaveBeenCalledWith(7, 1);
  expect(favorites.isFavorite(1)).toBe(true);
  expect(favorites.favorites.map(r => r.id)).toEqual([1]);
  expect(favorites.count).toBe(1);
});

it('toggle() removes an existing favorite', async () => {
  setUpFakeTable({7: [westway]});
  await mount();

  await run(() => favorites.toggle(1));

  expect(favorites.isFavorite(1)).toBe(false);
  expect(favorites.favorites).toEqual([]);
});

it('flips the heart immediately, before the write finishes (optimistic)', async () => {
  await mount();
  let finishWrite;
  favoritesRepo.toggle.mockImplementationOnce(
    () => new Promise(resolve => (finishWrite = resolve)),
  );

  let pending;
  await run(async () => {
    pending = favorites.toggle(2);
  });
  expect(favorites.isFavorite(2)).toBe(true); // write still in flight

  await run(async () => {
    table[7] = [fortune];
    finishWrite(true);
    await pending;
  });
  expect(favorites.isFavorite(2)).toBe(true);
});

it('rolls back and shows an error toast when the write fails', async () => {
  await mount();
  favoritesRepo.toggle.mockRejectedValueOnce(new Error('disk full'));

  await run(() => favorites.toggle(1));

  expect(favorites.isFavorite(1)).toBe(false); // re-read from the database
  expect(favorites.count).toBe(0);
  expect(Toast.show).toHaveBeenCalledWith(
    expect.objectContaining({type: 'error', text1: 'Could not update your favorites'}),
  );
});

it('two quick taps on the same restaurant end up not favorited, in order', async () => {
  await mount();

  await run(async () => {
    const first = favorites.toggle(1);
    const second = favorites.toggle(1);
    await Promise.all([first, second]);
  });

  expect(favoritesRepo.toggle).toHaveBeenCalledTimes(2);
  expect(favorites.isFavorite(1)).toBe(false);
});

it('guests get a "Log in" toast that opens Login, and nothing is written', async () => {
  guest();
  await mount();

  await run(() => favorites.toggle(1));

  expect(favoritesRepo.toggle).not.toHaveBeenCalled();
  expect(favorites.isFavorite(1)).toBe(false);
  const toast = Toast.show.mock.calls[0][0];
  expect(toast).toMatchObject({type: 'info', text1: 'Log in to save favorites'});

  toast.onPress();
  expect(Toast.hide).toHaveBeenCalled();
  expect(navigationRef.navigate).toHaveBeenCalledWith('Login');
});

it('clears on logout and reloads for the next user', async () => {
  setUpFakeTable({7: [westway], 8: [fortune]});
  await mount();
  expect(favorites.isFavorite(1)).toBe(true);

  guest();
  await remount();
  expect(favorites.count).toBe(0);
  expect(favorites.favorites).toEqual([]);

  signedIn(8);
  await remount();
  expect(favorites.isFavorite(1)).toBe(false);
  expect(favorites.isFavorite(2)).toBe(true);
});
