const Sequencer = require('@jest/test-sequencer').default;

// Sequences tests by name
class CustomSequencer extends Sequencer {
  sort(tests) {
    const copyTests = Array.from(tests);
    const sortedTests = copyTests.sort((testA, testB) => (testA.path > testB.path ? 1 : -1));
    return sortedTests;
  }
}

module.exports = CustomSequencer;
