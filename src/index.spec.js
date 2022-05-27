import {expect} from 'chai';
import generateTests from '.';

describe.only('index', () => {
  it.only('Should invoke callback with only Fixura functions', done => {
    let callbackCount = 0; // eslint-disable-line functional/no-let

    generateTests({
      path: [__dirname, '..', 'test-fixtures', '01'],
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
        it: {
          default: (description, callback) => {
            try {
              expect(description).to.equal('01');
              return callback();
            } catch (err) {
              done(err);
            }
          }
        },
        describe: (description, callback) => {
          try {
            expect(description).to.equal('test');
            return callback();
          } catch (err) {
            done(err);
          }
        }
      }
    });
  });

  it.only('Should use metadata file for parameters', done => {
    let callbackCount = 0; // eslint-disable-line functional/no-let

    generateTests({
      useMetadataFile: true,
      path: [__dirname, '..', 'test-fixtures', '01'],
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
        it: {
          default: (description, callback) => {
            try {
              expect(description).to.equal('01 foo');
              return callback();
            } catch (err) {
              done(err);
            }
          }
        },
        describe: (description, callback) => {
          try {
            expect(description).to.equal('test');
            return callback();
          } catch (err) {
            done(err);
          }
        }
      }
    });
  });

  it.only('Should not recurse', done => {
    let callbackCount = 0; // eslint-disable-line functional/no-let

    generateTests({
      path: [__dirname, '..', 'test-fixtures', '02'],
      recurse: false,
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
        it: {
          default: (description, callback) => {
            try {
              expect(description).to.equal('01');
              return callback();
            } catch (err) {
              done(err);
            }
          }
        },
        describe: (description, callback) => {
          try {
            expect(description).to.equal('02');
            return callback();
          } catch (err) {
            done(err);
          }
        }
      }
    });
  });
});

describe.only('Test naming', async () => {
  await generateTests({
    path: [__dirname, '..', 'test-fixtures', 'naming'],
    recurse: true,
    useMetadataFile: true,
    callback: args => {
      expect(args).to.be.an('object');
      expect(args).to.have.all.keys('getFixture', 'getFixtures');
    }
  });
});

describe.only('Skip', async () => {
  await generateTests({
    path: [__dirname, '..', 'test-fixtures', 'skip'],
    recurse: true,
    useMetadataFile: true,
    callback: args => {
      expect(args).to.be.an('object');
      expect(args).to.have.all.keys('getFixture', 'getFixtures');
      expect(args.getFixture('test.txt')).to.equal('foo');
    }
  });
});

describe.only('Only', async () => {
  await generateTests({
    path: [__dirname, '..', 'test-fixtures', 'only'],
    recurse: true,
    useMetadataFile: true,
    callback: args => {
      expect(args).to.be.an('object');
      expect(args).to.have.all.keys('getFixture', 'getFixtures');
      expect(args.getFixture('test.txt')).to.equal('foo');
    }
  });
});

