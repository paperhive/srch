const srch = require('../src/index');

describe('findPositions()', () => {
  it('should return zero position for entire string', () => {
    srch.findPositions('test', 'test').should.eql([0]);
  });

  it('should return multiple adjacent positions', () => {
    srch.findPositions('testtest', 'Test').should.eql([0, 4]);
  });

  it('should return multiple positions', () => {
    srch.findPositions('wow, test and test!', 'test').should.eql([5, 14]);
  });
});

describe('transformSpaces', () => {
  it('should remove spaces', () => {
    srch.transformSpaces('this    is a test')
      .should.eql({
        str: 'this is a test',
        mapping: [
          { transformed: 5, original: 5 },
          { transformed: 0, original: 3 },
          { transformed: 9, original: 9 },
        ],
      });
  });
});

describe('backTransformPositions()', () => {
  it('should return the original positions', () => {
    // original:    'hällo  world'
    // transformed: 'haello world'
    srch.backTransformPositions(
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [
        { transformed: 7, original: 6 },
        { transformed: 0, original: 1 },
        { transformed: 5, original: 5 },
      ]
    ).should.eql([0, 1, 1, 2, 3, 4, 5, 6, 7]);
  });
});
