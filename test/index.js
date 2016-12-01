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
    {original: 0, transformed: 1, whitespace: true},
    {original: 2, transformed: 2, textObject: 2},
    {original: 0, transformed: 1, whitespace: true},
    {original: 25, transformed: 25, textObject: 3},
    {original: 10, transformed: 1, whitespace: true},
    {original: 5, transformed: 5, textObject: 4},
  ];

  // removes whitespace at the end
  it('should backtransform 1 range with position 0', () => {
    srch.backTransformRange({position: 0, length: 4}, transformations)
      .should.eql([
        {position: 0, length: 3, transformation: transformations[0]},
      ]);
  });

  it('should backtransform 1 range with position 2', () => {
    srch.backTransformRange({position: 2, length: 1}, transformations)
      .should.eql([
        {position: 2, length: 1, transformation: transformations[0]},
      ]);
  });

  // no whitepace involved
  it('should backtransform 1 range with position 4', () => {
    srch.backTransformRange({position: 4, length: 2}, transformations)
      .should.eql([
        {position: 0, length: 2, transformation: transformations[2]},
      ]);
  });

  // removes whitespace at the beginning
  it('should backtransform 1 range with position 6', () => {
    srch.backTransformRange({position: 6, length: 10}, transformations)
      .should.eql([
        {position: 0, length: 9, transformation: transformations[4]},
      ]);
  });

  it('should backtransform 1 range with position 8', () => {
    srch.backTransformRange({position: 8, length: 10}, transformations)
      .should.eql([
        {position: 1, length: 10, transformation: transformations[4]},
      ]);
  });

  // removes whitespace in the middle
  it('should backtransform 2 ranges with positon 4', () => {
    srch.backTransformRange({position: 4, length: 10}, transformations)
      .should.eql([
        {position: 0, length: 2, transformation: transformations[2]},
        {position: 0, length: 7, transformation: transformations[4]},
      ]);
  });

  // removes whitespace in the middle; starts within a text interval
  it('should backtransform 2 ranges with position 5', () => {
    srch.backTransformRange({position: 5, length: 10}, transformations)
      .should.eql([
        {position: 1, length: 1, transformation: transformations[2]},
        {position: 0, length: 8, transformation: transformations[4]},
      ]);
  });

  // removes whitespace in the middle; starts within a text interval
  it('should backtransform 3 ranges with position 1', () => {
    srch.backTransformRange({position: 1, length: 11}, transformations)
      .should.eql([
        {position: 1, length: 2, transformation: transformations[0]},
        {position: 0, length: 2, transformation: transformations[2]},
        {position: 0, length: 5, transformation: transformations[4]},
      ]);
  });

  it('should backtransform with empty result range', () => {
    srch.backTransformRange({position: 3, length: 1}, transformations)
      .should.eql([]);
  });

  it('should backtransform', () => {
    srch.backTransformRange({position: 32, length: 1}, transformations)
      .should.eql([{position: 0, length: 1}]);
  });

  it('should backtransform', () => {
    srch.backTransformRange({position: 32, length: 2}, transformations)
      .should.eql([
        {position: 0, length: 10},
        {position: 0, length: 1, transformation: transformations[4]},
      ]);
  });

  it('should throw if range outside of transformation ranges', () => {
    (() => srch.backTransformRange({position: 39, length: 1}, transformations))
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

describe('SearchIndex', () => {
  it('should find ranges', () => {
    const index = new srch.SearchIndex('this  is a  test');
    index.search('is a test').should.eql([{position: 6, length: 10}]);
  });

  it('should find ranges with spaces at the end and beginning', () => {
    const index = new srch.SearchIndex('   hello  world  ');
    index.search('hello world').should.eql([{position: 3, length: 12}]);
  });

  it('should find ranges: transformed string equals original', () => {
    const index = new srch.SearchIndex('hello world');
    index.search('hello world').should.eql([{position: 0, length: 11}]);
  });

  it('should find ranges: 2 occurences of searchStr in text', () => {
    const index = new srch.SearchIndex('hello world, hello world');
    index.search('hello world').should.eql([{position: 0, length: 11}, {position: 13, length: 11}]);
  });

  it('should find ranges: 2 occurences of searchStr in text with spaces', () => {
    const index = new srch.SearchIndex('  hello   world ,  hello    world   ');
    index.search('hello world').should.eql([{position: 2, length: 13}, {position: 19, length: 14}]);
  });

  it('should find ranges: mixed lower and upper case', () => {
    const index = new srch.SearchIndex('TEST test TEst TeSt  ');
    index.search('test').should.eql([
      {position: 0, length: 4}, {position: 5, length: 4},
      {position: 10, length: 4}, {position: 15, length: 4},
    ]);
  });
});
