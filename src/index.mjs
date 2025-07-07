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
  const describeCallback = describe;

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

    describeCallback(dir, {only: true, skip: false}, () => {
      after(hooks.after || (() => { }));
      before(hooks.before || (() => { }));
      beforeEach(hooks.beforeEach || (() => { }));
      afterEach(hooks.afterEach || (() => { }));

      readdirSync(joinPath(rootDir, dir)).forEach(subDir => {
        const fixtureInterface = fixtureFactory({...fixura, root: [rootDir, dir, subDir]});

        if (useMetadataFile) {
          const metadataPath = joinPath(rootDir, dir, subDir, 'metadata.json');

          if (existsSync(metadataPath)) {
            const {description, skip = false, only = false, ...attributes} = JSON.parse(readFileSync(metadataPath, 'utf8'));
            const subDirIsDigits = Number.isInteger(Number(subDir));
            const testDescription = `${subDirIsDigits ? `${subDir} ` : ''}${skip ? 'SKIPPED ' : ''}${only ? 'ONLY ' : ''}${description || `${subDirIsDigits ? '' : subDir}`}`;
            // console.log(`metadata: ${testDescription}`); // eslint-disable-line
            // eslint-disable-next-line array-callback-return
            return it(testDescription, {only, skip}, callback({...attributes, ...fixtureInterface, dirName: dir}));
          }
        }

        // console.log(`just test: ${subDir}`); // eslint-disable-line
        // eslint-disable-next-line array-callback-return
        return it(subDir, {only: false, skip: false}, callback({...fixtureInterface, dirName: dir}));
      });
    });
  }
};
