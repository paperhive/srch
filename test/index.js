const srch = require('../src/index');

describe('findPositions()', () => {
  it('should return zero position for entire string', () => {
    srch.findPositions('test', 'test').should.eql([0]);
  });

  it('should return multiple adjacent positions', () => {
    srch.findPositions('testtest', 'test').should.eql([0, 4]);
  });

  it('should return multiple positions', () => {
    srch.findPositions('wow, test and test!', 'test').should.eql([5, 14]);
  });

  it('should escape RegExp characters', () => {
    srch.findPositions('a [nasty] string', '[nasty]').should.eql([2]);
  });

  // test case sensitivity
  it('should return an empty array if there is no exact match', () => {
    srch.findPositions('testtest', 'Test').should.eql([]);
  });
});

describe('transformSpaces', () => {
  it('should return input if no multiple spaces', () => {
    srch.transformSpaces('this is a test')
      .should.eql({
        str: 'this is a test',
        mapping: [{ transformed: 14, original: 14 }],
      });
  });

  it('should remove spaces', () => {
    srch.transformSpaces('this    is a  test')
      .should.eql({
        str: 'this is a test',
        mapping: [
          { transformed: 5, original: 5 },
          { transformed: 0, original: 3 },
          { transformed: 5, original: 5 },
          { transformed: 0, original: 1 },
          { transformed: 4, original: 4 },
        ],
      });
  });
});

describe('backTransformPositions()', () => {
  it('should return the original positions', () => {
    // original:    'hällo  world'
    // transformed: 'haello world'
    srch.backTransformPositions(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 11],
      [
        { transformed: 1, original: 1 },
        { transformed: 2, original: 1 },
        { transformed: 4, original: 4 },
        { transformed: 0, original: 1 },
        { transformed: 5, original: 5 },
      ]
    ).should.eql([0, 1, 1, 2, 3, 4, 5, 7, 8, 11]);
  });
});

describe('backTransformRange', () => {
  const transformations = [
    {original: 3, transformed: 3, textObject: 1},
    {original: 0, transformed: 1},
    {original: 2, transformed: 2, textObject: 2},
    {original: 0, transformed: 1},
    {original: 25, transformed: 25, textObject: 3},
  ];

  it('should backtransform to ranges', () => {
    srch.backTransformRange({position: 1, length: 10}, transformations)
      .should.eql([
        {position: 1, length: 2, transformation: transformations[0]},
        {position: 0, length: 2, transformation: transformations[2]},
        {position: 0, length: 4, transformation: transformations[4]},
      ]);
  });

  it('should backtransform to ranges', () => {
    srch.backTransformRange({position: 4, length: 10}, transformations)
      .should.eql([
        {position: 0, length: 2, transformation: transformations[2]},
        {position: 0, length: 7, transformation: transformations[4]},
      ]);
  });

  it('should backtransform to ranges', () => {
    srch.backTransformRange({position: 5, length: 10}, transformations)
      .should.eql([
        {position: 1, length: 1, transformation: transformations[2]},
        {position: 0, length: 8, transformation: transformations[4]},
      ]);
  });

  it('should backtransform to ranges', () => {
    srch.backTransformRange({position: 6, length: 10}, transformations)
      .should.eql([
        {position: 0, length: 9, transformation: transformations[4]},
      ]);
  });

  it('should backtransform with position 0', () => {
    srch.backTransformRange({position: 0, length: 4}, transformations)
      .should.eql([
        {position: 0, length: 3, transformation: transformations[0]},
      ]);
  });

  it('should backtransform with empty result range', () => {
    srch.backTransformRange({position: 3, length: 1}, transformations)
      .should.eql([]);
  });

  it('should throw if range outside of transformation ranges', () => {
    (() => srch.backTransformRange({position: 33, length: 1}, transformations))
      .should.throw('Out of range');
  });

  it('should throw if range outside of transformation ranges', () => {
    (() => srch.backTransformRange({position: -2, length: 1}, transformations))
      .should.throw('Out of range');
  });

  it('should throw if transformations are empty', () => {
    (() => srch.backTransformRange({position: 0, length: 1}, []))
      .should.throw('Empty transformations');
  });
});
