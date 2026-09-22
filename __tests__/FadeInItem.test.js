import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import FadeInItem, {enteringFor, MAX_ANIMATED_ITEMS} from '../src/components/ui/FadeInItem';

it('only the first few items get an entering animation', () => {
  expect(MAX_ANIMATED_ITEMS).toBe(6);
  expect(enteringFor(0)).toBeDefined();
  expect(enteringFor(5)).toBeDefined();
  expect(enteringFor(6)).toBeUndefined();
  expect(enteringFor(50)).toBeUndefined();
});

it('animated items pass `entering` through; later items render plainly', () => {
  let early;
  let late;
  ReactTestRenderer.act(() => {
    early = ReactTestRenderer.create(<FadeInItem index={2}><Text>a</Text></FadeInItem>);
    late = ReactTestRenderer.create(<FadeInItem index={9}><Text>b</Text></FadeInItem>);
  });
  expect(early.root.findAll(n => n.props.entering !== undefined).length).toBeGreaterThan(0);
  expect(late.root.findAll(n => n.props.entering !== undefined)).toHaveLength(0);
  expect(late.root.findByType(Text).props.children).toBe('b');
});
