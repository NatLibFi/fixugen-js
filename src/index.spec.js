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

import {expect} from 'chai';
import generateTests from '.';

describe('index', () => {
  it('Should invoke callback with only Fixura functions', done => {
    let callbackCount = 0; // eslint-disable-line functional/no-let

    generateTests({
      path: [__dirname, '..', 'test-fixtures'],
      callback: args => {
        try {
          expect(callbackCount).to.equal(0);
          expect(args).to.be.an('object');
          expect(args).to.have.all.keys('getFixture', 'getFixtures');
          expect(args.getFixture('test.txt')).to.equal('foo');

          callbackCount++; // eslint-disable-line no-plusplus
          done();
        } catch (err) {
          done(err);
        }
      },
      mocha: {
        it: (description, callback) => {
          try {
            expect(description).to.equal('01');
            return callback();
          } catch (err) {
            done(err);
          }
        },
        describe: (description, callback) => {
          try {
            expect(description).to.equal('index');
            return callback();
          } catch (err) {
            done(err);
          }
        }
      }
    });
  });

  it('Should use metadata file for parameters', done => {
    let callbackCount = 0; // eslint-disable-line functional/no-let

    generateTests({
      useMetadataFile: true,
      path: [__dirname, '..', 'test-fixtures'],
      callback: args => {
        try {
          expect(callbackCount).to.equal(0);
          expect(args).to.be.an('object');
          expect(args).to.have.all.keys('getFixture', 'getFixtures', 'foo');
          expect(args.getFixture('test.txt')).to.equal('foo');
          expect(args.foo).to.equal('bar');

          callbackCount++; // eslint-disable-line no-plusplus
          done();
        } catch (err) {
          done(err);
        }
      },
      mocha: {
        it: (description, callback) => {
          try {
            expect(description).to.equal('foo');
            return callback();
          } catch (err) {
            done(err);
          }
        },
        describe: (description, callback) => {
          try {
            expect(description).to.equal('index');
            return callback();
          } catch (err) {
            done(err);
          }
        }
      }
    });
  });
});
