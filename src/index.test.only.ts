import assert from 'node:assert';
import {describe} from 'node:test';
import generateTests from './index.ts';

describe('Only', () => {
  generateTests({
    path: [import.meta.dirname, '..', 'test-fixtures', 'only'],
    recurse: true,
    useMetadataFile: true,
    callback: args => {
      assert.equal(typeof args, 'object');
      assert.equal(Object.hasOwn(args, 'getFixture'), true);
      assert.equal(Object.hasOwn(args, 'getFixtures'), true);
      assert.equal(Object.hasOwn(args, 'dirName'), true);
      assert.equal(args.getFixture('test.txt'), 'foo');
    }
  });
});
