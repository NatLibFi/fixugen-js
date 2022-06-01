import fixtureFactory from '@natlibfi/fixura';
import {join as joinPath} from 'path';
import {readdirSync, existsSync, readFileSync} from 'fs';

export default ({
  callback,
  path,
  recurse = true,
  fixura = {},
  useMetadataFile = false,
  mocha = {}
}) => {
  const describeCallback = mocha.describe || /* istanbul ignore next: Needs to be overriden in tests */ describe;
  const itCallback = generateIt;

  function generateIt(only = false, skip = false) {
    if (skip) {
      return mocha.it?.skip || /* istanbul ignore next: Needs to be overriden in tests */ it.skip;
    }

    if (only) {
      return mocha.it?.only || /* istanbul ignore next: Needs to be overriden in tests */ it.only;
    }

    return mocha.it?.default || /* istanbul ignore next: Needs to be overriden in tests */ it;
  }

  if (recurse) {
    const rootDir = joinPath(...path);
    return readdirSync(rootDir).forEach(dir => setup(dir, rootDir));
  }

  const rootDir = joinPath(...path.slice(0, -1));
  const [subDir] = path.slice(-1);
  setup(subDir, rootDir);

  function setup(dir, rootDir) {
    describeCallback(dir, () => {
      setupMochaCallbacks();

      readdirSync(joinPath(rootDir, dir)).forEach(subDir => {
        const fixtureInterface = fixtureFactory({...fixura, root: [rootDir, dir, subDir]});

        if (useMetadataFile) {
          const metadataPath = joinPath(rootDir, dir, subDir, 'metadata.json');

          if (existsSync(metadataPath)) {
            const {description, skip = false, only = false, ...attributes} = JSON.parse(readFileSync(metadataPath, 'utf8'));
            const subDirIsDigits = Number.isInteger(Number(subDir));
            const testDescription = `${subDirIsDigits ? `${subDir} ` : ''}${skip ? 'SKIPPED ' : ''}${only ? 'ONLY ' : ''}${description || `${subDirIsDigits ? '' : subDir}`}`;
            return itCallback(only, skip)(testDescription, () => callback({...attributes, ...fixtureInterface}));
          }
        }

        itCallback()(subDir, () => callback(fixtureInterface));
      });

      function setupMochaCallbacks() {
        const afterCallback = mocha.after || (() => { });// eslint-disable-line no-empty-function
        const beforeCallback = mocha.before || (() => { });// eslint-disable-line no-empty-function
        const beforeEachCallback = mocha.beforeEach || (() => { });// eslint-disable-line no-empty-function
        const afterEachCallback = mocha.afterEach || (() => { });// eslint-disable-line no-empty-function

        after(afterCallback);
        before(beforeCallback);
        beforeEach(beforeEachCallback);
        afterEach(afterEachCallback);
      }
    });
  }
};
