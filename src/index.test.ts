import assert from 'node:assert';
import {describe} from 'node:test';
import generateTests from './index.ts';

describe('index', () => {
  describe('Should invoke callback with only Fixugen functions', () => {
    let callbackCount = 0;

    generateTests({
      callback,
      path: [import.meta.dirname, '..', 'test-fixtures', '01'],
      hooks: {
        // @ts-expect-error hooks should not trigger random extra functions
        random: () => callback,
        it: () => callback,
        describe: () => callback
      }
    });

    function callback(args) {
      // console.log(`Callback args: ${JSON.stringify(args)}`); // eslint-disable-line
      assert.equal(callbackCount, 0);
      assert.equal(typeof args, 'object');
      assert.equal(Object.hasOwn(args, 'getFixture'), true);
      assert.equal(Object.hasOwn(args, 'getFixtures'), true);
      assert.equal(Object.hasOwn(args, 'dirName'), true);
      assert.equal(args.getFixture('test.txt'), 'foo');

      callbackCount++; // eslint-disable-line no-plusplus
    }
  });


  describe('Should use metadata file for parameters', () => {
    let callbackCount = 0;

    generateTests({
      useMetadataFile: true,
      path: [import.meta.dirname, '..', 'test-fixtures', '01'],
      callback
    });

    function callback(args) {
      // console.log(`Callback args: ${JSON.stringify(args)}`); // eslint-disable-line
      assert.equal(callbackCount, 0);
      assert.equal(typeof args, 'object');
      assert.equal(Object.hasOwn(args, 'getFixture'), true);
      assert.equal(Object.hasOwn(args, 'getFixtures'), true);
      assert.equal(Object.hasOwn(args, 'dirName'), true);
      assert.equal(Object.hasOwn(args, 'foo'), true);
      assert.equal(args.getFixture('test.txt'), 'foo');
      assert.equal(args.foo, 'bar');

      callbackCount++; // eslint-disable-line no-plusplus
    }
  });

  describe('Should not recurse', () => {
    let callbackCount = 0;

    generateTests({
      path: [import.meta.dirname, '..', 'test-fixtures', '02'],
      recurse: false,
      callback
    });

    function callback(args) {
      // console.log(`Callback args: ${JSON.stringify(args)}`); // eslint-disable-line
      assert.equal(callbackCount, 0);
      assert.equal(typeof args, 'object');
      assert.equal(Object.hasOwn(args, 'getFixture'), true);
      assert.equal(Object.hasOwn(args, 'getFixtures'), true);
      assert.equal(Object.hasOwn(args, 'dirName'), true);
      assert.equal(args.getFixture('test.txt'), 'foo');

      callbackCount++; // eslint-disable-line no-plusplus
    }
  });
});

describe('Test naming', async () => {
  await generateTests({
    path: [import.meta.dirname, '..', 'test-fixtures', 'naming'],
    recurse: true,
    useMetadataFile: true,
    callback: args => {
      // console.log(`Callback args: ${JSON.stringify(args)}`); // eslint-disable-line
      assert.equal(typeof args, 'object');
      assert.equal(Object.hasOwn(args, 'getFixture'), true);
      assert.equal(Object.hasOwn(args, 'getFixtures'), true);
      assert.equal(Object.hasOwn(args, 'dirName'), true);
      assert.equal(args.getFixture('dirName.txt'), args.dirName);
    }
  });
});

describe('Skip', async () => {
  await generateTests({
    path: [import.meta.dirname, '..', 'test-fixtures', 'skip'],
    recurse: true,
    useMetadataFile: true,
    callback: args => {
      // console.log(`Callback args: ${JSON.stringify(args)}`); // eslint-disable-line
      assert.equal(typeof args, 'object');
      assert.equal(Object.hasOwn(args, 'getFixture'), true);
      assert.equal(Object.hasOwn(args, 'getFixtures'), true);
      assert.equal(Object.hasOwn(args, 'dirName'), true);
      assert.equal(args.getFixture('test.txt'), 'foo');
    }
  });
});
