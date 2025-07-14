import fixtureFactory from '@natlibfi/fixura';
import {join as joinPath} from 'path';
import {readdirSync, existsSync, readFileSync} from 'fs';
import {describe, it, after, afterEach, before, beforeEach} from 'node:test';

export default ({
  callback,
  path,
  recurse = true,
  fixura = {},
  useMetadataFile = false,
  hooks = {}
}) => {
  if (recurse) {
    // console.log('recurse'); // eslint-disable-line

    const rootDir = joinPath(...path);
    // eslint-disable-next-line array-callback-return
    return readdirSync(rootDir).forEach(dir => setup(dir, rootDir));
  }

  const rootDir = joinPath(...path.slice(0, -1));
  const [subDir] = path.slice(-1);

  setup(subDir, rootDir);

  function setup(dir, rootDir) {
    // console.log(`setup: ${rootDir}/${dir}`); // eslint-disable-line

    describe(dir, async () => {
      beforeEach(hooks.beforeEach || (() => { }));
      afterEach(hooks.afterEach || (() => { }));
      before(hooks.before || (() => { }));
      after(hooks.after || (() => { }));

      const testDirs = readdirSync(joinPath(rootDir, dir));
      await testPump(testDirs, dir, rootDir);
    });
  }

  async function testPump(testDirs, dir, rootDir) {
    const [subDir, ...rest] = testDirs;
    if (subDir === undefined) {
      return;
    }
    const fixtureInterface = fixtureFactory({...fixura, root: [rootDir, dir, subDir]});

    if (useMetadataFile) {
      const metadataPath = joinPath(rootDir, dir, subDir, 'metadata.json');

      if (existsSync(metadataPath)) {
        const {description, skip = false, only = false, ...attributes} = JSON.parse(readFileSync(metadataPath, 'utf8'));
        const subDirIsDigits = Number.isInteger(Number(subDir));
        const testDescription = `${subDirIsDigits ? `${subDir} ` : ''}${skip ? 'SKIPPED ' : ''}${only ? 'ONLY ' : ''}${description || `${subDirIsDigits ? '' : subDir}`}`;
        // console.log(`metadata: ${testDescription}`); // eslint-disable-line
        // eslint-disable-next-line array-callback-return

        if (skip) {
          await it.skip(testDescription, async () => await callback({...attributes, ...fixtureInterface, dirName: dir}));
          return testPump(rest, dir, rootDir);
        }

        if (only) {
          await it.only(testDescription, async () => await callback({...attributes, ...fixtureInterface, dirName: dir}));
          return testPump(rest, dir, rootDir);
        }

        await it(testDescription, async () => await callback({...attributes, ...fixtureInterface, dirName: dir}));
        return testPump(rest, dir, rootDir);
      }
    }

    // console.log(`just test: ${subDir}`); // eslint-disable-line
    // eslint-disable-next-line array-callback-return

    it(subDir, async () => await callback({...fixtureInterface, dirName: dir}));
    return testPump(rest, dir, rootDir);
  }
};
