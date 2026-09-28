import fixtureFactory, {type Reader} from '@natlibfi/fixura';
import {join as joinPath} from 'path';
import {readdirSync, existsSync, readFileSync} from 'fs';
import {describe, it, after, afterEach, before, beforeEach} from 'node:test';

export type CallbackArgs = {
  dirName: string,
} & ReturnType<typeof fixtureFactory> & Record<string, unknown>

export interface FixugenOpts {
  // eslint-disable-next-line no-unused-vars
  callback: (callbackOpts: CallbackArgs) => Promise<void> | void,
  path: string[],
  recurse?: boolean,
  fixura?: {
    reader?: Reader,
    failWhenNotFound?: boolean
  },
  useMetadataFile?: boolean,
  hooks?: {
    before?: () => void,
    beforeEach?: () => void,
    after?: () => void,
    afterEach?: () => void
  }
}

export default function generateTests({
  callback,
  path,
  recurse = true,
  fixura = {},
  useMetadataFile = false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  hooks = {before: () => {}, beforeEach: () => {}, after: () => {}, afterEach: () => {}}
}: FixugenOpts) {
  if (recurse) {
    // console.log('recurse'); // eslint-disable-line

    const rootDir = joinPath(...path);
    return readdirSync(rootDir, {withFileTypes: true}).filter(e => e.isDirectory()).map(e => e.name).forEach(dir => setup(dir, rootDir));
  }

  const rootDir = joinPath(...path.slice(0, -1));
  const [subDir] = path.slice(-1) as [string];

  setup(subDir, rootDir);

  function setup(dir: string, rootDir: string) {
    // console.log(`setup: ${rootDir}/${dir}`); // eslint-disable-line

    describe(dir, async () => {
      beforeEach(hooks.beforeEach);
      afterEach(hooks.afterEach);
      before(hooks.before);
      after(hooks.after);

      const testDirs = readdirSync(joinPath(rootDir, dir), {withFileTypes: true}).filter(e => e.isDirectory()).map(e => e.name);
      await testPump(testDirs, dir, rootDir);
    });
  }

  async function testPump(testDirs: string[], dir: string, rootDir: string) {
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
    it(subDir, async () => await callback({...fixtureInterface, dirName: dir}));
    return testPump(rest, dir, rootDir);
  }
};
