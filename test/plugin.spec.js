import test from 'ava';
import {transform} from 'babel-core';
import plugin from '../src/plugin';

test('transforms an HTML import to an inline Vue render function', t => {
  const {code} = transform(
    `
    import foo from './fixtures/foo.html'
    `,
    {
      filename: __filename,
      plugins: [
        plugin
      ]
    }
  );

  t.snapshot(code);
});

test('allows whitelisting files that should be inlined', t => {
  const {code} = transform(
    `
    import foo from './fixtures/foo.html'
    import bar from './fixtures/bar.html'
    `,
    {
      filename: __filename,
      plugins: [
        [
          plugin,
          {
            include: 'f*.html'
          }
        ]
      ]
    }
  );

  t.snapshot(code);
});

test('throws an exception when an HTML import cannot be found', t => {
  t.throws(() => transform(
    `
    import bar from './fixtures/bar.html'
    `,
    {
      filename: __filename,
      plugins: [
        plugin
      ]
    }
  ));
});
