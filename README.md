# srch [![Build Status](https://travis-ci.org/paperhive/srch.svg?branch=master)](https://travis-ci.org/paperhive/srch) [![codecov](https://codecov.io/gh/paperhive/srch/branch/master/graph/badge.svg)](https://codecov.io/gh/paperhive/srch)

## Examples

### findPositions(fullstr, searchstr)
- returns all positions of *searchstr* in *fullstr* as an array
```
findPositions('Hello world', 'World');
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
)
=>  [8]
```
