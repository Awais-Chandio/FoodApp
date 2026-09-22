import {
  MENU_BY_RESTAURANT,
  MENU_SEED,
  menuBackfillStatements,
  RESTAURANT_SEED,
} from '../src/database/seedData';
import {restaurantImageMap} from '../src/constants/imageRegistry';

describe('seed data integrity', () => {
  const restaurantNames = RESTAURANT_SEED.map(row => row[1]);

  it('has a menu for every seeded restaurant and no menu for an unknown one', () => {
    expect(Object.keys(MENU_BY_RESTAURANT).sort()).toEqual([...restaurantNames].sort());
  });

  it('seeds restaurants with unique ids and names', () => {
    expect(new Set(RESTAURANT_SEED.map(row => row[0])).size).toBe(RESTAURANT_SEED.length);
    expect(new Set(restaurantNames).size).toBe(restaurantNames.length);
  });

  it.each(restaurantNames)('%s has 5 to 8 dishes with unique names', name => {
    const dishes = MENU_BY_RESTAURANT[name];
    expect(dishes.length).toBeGreaterThanOrEqual(5);
    expect(dishes.length).toBeLessThanOrEqual(8);
    expect(new Set(dishes.map(dish => dish[0])).size).toBe(dishes.length);
  });

  it('gives every dish a name, a positive price and an image key that exists in imageRegistry', () => {
    Object.values(MENU_BY_RESTAURANT)
      .flat()
      .forEach(([name, price, , imageKey]) => {
        expect(typeof name).toBe('string');
        expect(name.trim()).toBe(name);
        expect(name.length).toBeGreaterThan(0);
        expect(price).toBeGreaterThan(0);
        expect(restaurantImageMap[imageKey]).toBeTruthy();
      });
  });

  it('keeps the original four Westway dishes first, so their ids stay 1..4', () => {
    expect(MENU_SEED.slice(0, 4).map(row => [row[0], row[1], row[2]])).toEqual([
      [1, 'Moonland Special', 210],
      [1, 'Burger Deluxe', 170],
      [1, 'Veggie Supreme', 150],
      [1, 'Margherita Pizza', 180],
    ]);
  });

  it('flattens to one row per dish with the restaurant id', () => {
    const total = Object.values(MENU_BY_RESTAURANT).reduce((sum, dishes) => sum + dishes.length, 0);
    expect(MENU_SEED).toHaveLength(total);
    const moonlandId = RESTAURANT_SEED.find(row => row[1] === 'Moonland')[0];
    expect(MENU_SEED.filter(row => row[0] === moonlandId)).toHaveLength(MENU_BY_RESTAURANT.Moonland.length);
  });

  it('builds one back-fill statement per dish, each with 6 bound parameters', () => {
    const statements = menuBackfillStatements();
    expect(statements).toHaveLength(MENU_SEED.length);
    statements.forEach(([sql, params]) => {
      expect(sql).toMatch(/NOT EXISTS/);
      expect(sql.match(/\?/g)).toHaveLength(6);
      expect(params).toHaveLength(6);
    });
  });
});
