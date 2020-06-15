/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Generate Node.js unit tests from fixtures and callbacks
*
* Copyright (C) 2020 University Of Helsinki (The National Library Of Finland)
*
* This file is part of fixugen-js
*
* fixugen-js program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* fixugen-js is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

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
  const itCallback = mocha.it || /* istanbul ignore next: Needs to be overriden in tests */ it;

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
            const {description, ...attributes} = JSON.parse(readFileSync(metadataPath, 'utf8'));
            return itCallback(description || subDir, () => callback({...attributes, ...fixtureInterface}));
          }
        }

        itCallback(subDir, () => callback(fixtureInterface));
      });

      function setupMochaCallbacks() {
        const afterCallback = mocha.after || (() => {});// eslint-disable-line no-empty-function
        const beforeCallback = mocha.before || (() => {});// eslint-disable-line no-empty-function
        const beforeEachCallback = mocha.beforeEach || (() => {});// eslint-disable-line no-empty-function
        const afterEachCallback = mocha.afterEach || (() => {});// eslint-disable-line no-empty-function

        after(afterCallback);
        before(beforeCallback);
        beforeEach(beforeEachCallback);
        afterEach(afterEachCallback);
      }
    });
  }
};
