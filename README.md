# srch [![Build Status](https://travis-ci.org/paperhive/srch.svg?branch=master)](https://travis-ci.org/paperhive/srch) [![codecov](https://codecov.io/gh/paperhive/srch/branch/master/graph/badge.svg)](https://codecov.io/gh/paperhive/srch)

## Examples

### findPositions(fullstr, searchstr)
- returns all positions of *searchstr* in *fullstr* as an array
```
findPositions('Hello world', 'world');
=>  [6]
```

### transformSpaces(str)
- removes redundant spaces of *str*
- returns an object consisting of *str* without redudant spaces and a mapping which indicates the relation between the original and the transformed string
```
transformSpaces('Hello   world');
=>  {
      str: 'Hello world',
      mapping: [
        { transformed: 6, original: 6 },
        { transformed: 0, original: 2 },
        { transformed: 5, original: 5 },
      ],
    }
```

### backTransformPositions(positions, mapping)
- returns the positions in the original string as an array
```
backTransformPositions(
  [6],
  [
    { transformed: 6, original: 6 },
    { transformed: 0, original: 2 },
    { transformed: 5, original: 5 },
  ],
);
=>  [8]
```

### backTransformRange(range, transformations)
- transforms range back to original (untransformed) string
```
const transformations = [
  {original: 3, transformed: 3, textObject: 1},
  {original: 0, transformed: 1, whitespace: true},
  {original: 2, transformed: 2, textObject: 2},
  {original: 0, transformed: 1, whitespace: true},
  {original: 25, transformed: 25, textObject: 3},
];

backTransformRange({position: 0, length: 4}, transformations);
=>  [{
      position: 0,
      length: 3,
      transformation:
        {original: 3, transformed: 3, textObject: 1}
    }]

backTransformRange({position: 6, length: 10}, transformations);
=>  [{
      position: 0,
      length: 9,
      transformation:
        {original: 25, transformed: 25, textObject: 3}
    }]

```

### search(searchStr)
- returns ranges of `searchStr` in a search index
```
const index = new SearchIndex('this  is a  test');
index.search('is a test');
=>  [{position: 6, length: 10}]

const index = new SearchIndex('  hello   world ,  HELLO    WORLD   ');
index.search('hello world');
=>  [{position: 2, length: 13}, {position: 19, length: 14}]

```
