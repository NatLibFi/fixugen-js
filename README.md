# Generate Node.js unit tests from fixtures and callbacks
[![NPM Version](https://img.shields.io/npm/v/@natlibfi/fixugen.svg)](https://npmjs.org/package/@natlibfi/fixugen) [![Node Version](https://img.shields.io/node/v/@natlibfi/fixugen.svg)]()

[Mocha](https://mochajs.org/) is used a unit testing framework. Invoke fixugen in a .spec file with Mocha environment injected as usual.

Provides test callbacks with [Fixura's](https://www.npmjs.com/package/@natlibfi/fixura) functions to fetch test fixtures.

## Usage
The test fixture directory is parsed as follows: Each subdirectory becomes a unit test group (Mocha's `describe`) and inner subdirectories each represent individual tests (Mocha's `it`).

```js
import generateTests from '@natlibfi/fixugen';

generateTests({
  path: [__dirname, '..', 'test-fixtures'],
  callback: ({getFixture}) => {
    const expectedValue = getFixture('value.txt');
    const value = generateSomething();
    expect(value).to.equal(expectedValue);
  }
});
```

### Options
- **callback**: A callback function passed to Mocha's `it`. Receives Fixura's function as arguments.
  - **dirName**: callback gets dirName variable that is one folder up
- **path**: An array of path components which make up a path to the test fixtures directory
- **recurse**: Whether to recurse into the subdirectories of **path**. If `false` the last directory of the path is used as the name of the Mocha's describe-call and it's direct subdirectories are used as unit test directories. Defaults to **true**
- **fixura**: Options that are passed to Fixura.
- **useMetadataFile**: If set to true, reads and parses a file named `metadata.json` in each unit test directory. The content must be a JSON object and it's properties as passed to the unit test callback function.
  - If a property `description` is present, it is used as the test's description (Defaults to *false* and folder name is used).
  - If a property `skip` is present, it decides if test is skipped (Defaults to *false*).
  - If a property `only` is present, it decides if this/these tests are only run (Defaults to *false*).
- **hooks**: An object which maps the following properties to Mocha's corresponding callbacks: **after**, **before**, **afterEach**, **beforeEach**

### Example metadata.json
```json
{
  "description": "Example description of test",
  "skip": false,
  "only": false
}
```

## License and copyright

Copyright (c) 2020, 2023-2025 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **MIT** or any later version.
