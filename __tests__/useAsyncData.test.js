import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import useAsyncData from '../src/hooks/useAsyncData';

let result;
const Probe = ({loader, dep}) => {
  result = useAsyncData(loader, [dep]);
  return null;
};
const mount = async (loader, dep = 1) => {
  let tree;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<Probe loader={loader} dep={dep} />);
  });
  return tree;
};

beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
afterEach(() => console.log.mockRestore());

it('starts loading, then exposes the data', async () => {
  let resolve;
  const tree = await mount(() => new Promise(r => (resolve = r)));
  expect(result).toMatchObject({loading: true, data: null, error: null});
  await ReactTestRenderer.act(async () => resolve(['a']));
  expect(result).toMatchObject({loading: false, data: ['a'], error: null});
  tree.unmount();
});

it('exposes an error, and reload() retries', async () => {
  const loader = jest.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce('ok');
  await mount(loader);
  expect(result.error.message).toBe('boom');
  expect(result.loading).toBe(false);
  await ReactTestRenderer.act(async () => result.reload());
  expect(result).toMatchObject({data: 'ok', error: null, loading: false});
});

it('quiet reload keeps the data and never shows loading; a quiet failure keeps the data too', async () => {
  const loader = jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2).mockRejectedValueOnce(new Error('x'));
  await mount(loader);
  await ReactTestRenderer.act(async () => {
    const pending = result.reload({quiet: true});
    expect(result.loading).toBe(false);
    await pending;
  });
  expect(result.data).toBe(2);
  await ReactTestRenderer.act(async () => result.reload({quiet: true}));
  expect(result.data).toBe(2);
  expect(result.error).toBeTruthy();
});

it('ignores a slow earlier load that finishes after a newer one', async () => {
  const resolvers = [];
  const loader = jest.fn(() => new Promise(r => resolvers.push(r)));
  await mount(loader);
  await ReactTestRenderer.act(async () => {
    result.reload();
  });
  await ReactTestRenderer.act(async () => resolvers[1]('new'));
  await ReactTestRenderer.act(async () => resolvers[0]('old'));
  expect(result.data).toBe('new');
});

it('reloads when deps change', async () => {
  const loader = jest.fn(() => Promise.resolve('x'));
  const tree = await mount(loader, 1);
  await ReactTestRenderer.act(async () => {
    tree.update(<Probe loader={loader} dep={2} />);
  });
  expect(loader).toHaveBeenCalledTimes(2);
});
