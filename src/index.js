// cf. https://github.com/sindresorhus/escape-string-regexp
function escapeRegExpCharacters(str) {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

exports.findPositions = function findPositions(fullstr, searchstr) {
  const regExpSearchstr = new RegExp(escapeRegExpCharacters(searchstr), 'g');
  let match = [];
  const matches = [];
  while ((match = regExpSearchstr.exec(fullstr)) !== null) {
    matches.push(match.index);
  }
  return matches;
};


exports.transformSpaces = function transformSpaces(str) {
  const mapping = [];
  let lastOffsetOriginal = 0;
  let lastOffsetTransformed = 0;
  const transformedStr = str.replace(/\s{2,}/g, (match, offset) => {
    const remain = (offset - lastOffsetOriginal) + 1;
    mapping.push({ transformed: remain, original: remain });
    mapping.push({ transformed: 0, original: match.length - 1 });

    lastOffsetOriginal = offset + match.length;
    lastOffsetTransformed += remain;

    return ' ';
  });

  const lenRestTransformed = transformedStr.length - lastOffsetTransformed;
  const lenRestOriginal = str.length - lastOffsetOriginal;

  if (lenRestOriginal !== lenRestTransformed) throw new Error('strings out of sync');
  if (lenRestOriginal) {
    mapping.push({
      transformed: transformedStr.length - lastOffsetTransformed,
      original: str.length - lastOffsetOriginal,
    });
  }

  return { str: transformedStr, mapping };
};


// assumes that elements in positions are sorted
exports.backTransformPositions = function backTransformPositions(positions, mapping) {
  const transformedPositions = [];
  let positionIndex = 0;
  let offsetOriginal = 0;
  let offsetTransformed = 0;
  for (let i = 0; i < mapping.length; i += 1) {
    const map = mapping[i];

    // transform all positions in this map
    while (positionIndex < positions.length &&
        positions[positionIndex] < offsetTransformed + map.transformed) {
      // transform position
      const normalizedPosition = positions[positionIndex] - offsetTransformed;

      transformedPositions.push(
        offsetOriginal + Math.min(normalizedPosition, map.original - 1)
      );

      positionIndex += 1;
    }
    if (positionIndex === positions.length) break;

    // update offsets
    offsetOriginal += map.original;
    offsetTransformed += map.transformed;
  }
  return transformedPositions;
};


exports.backTransformRange = function backTransformRange(range, transformations) {
  let rangeStart = range.position;
  let rangeEnd = range.length + range.position;

  const output = [];
  if (transformations.length === 0) throw new Error('Empty transformations');
  transformations.forEach((transformation) => {
    if (rangeStart < 0 || rangeEnd <= 0) return;

    if (rangeStart < transformation.transformed) {
      let newLength;
      if (rangeEnd < transformation.transformed) {
        newLength = rangeEnd - rangeStart;
      } else {
        newLength = transformation.transformed - rangeStart;
      }
      if (rangeStart < transformation.original) {
        output.push({
          position: rangeStart,
          length: Math.min(newLength, transformation.original - rangeStart),
          transformation,
        });
      }
      rangeStart = 0;
    } else {
      rangeStart -= transformation.transformed;
    }
    rangeEnd -= transformation.transformed;
  });

  if (rangeStart !== 0) throw new Error('Out of range');
  return output;
};


function transformLowercase(str) {
  return {
    str: str.toLowerCase(),
    mapping: [{transformed: str.length, original: str.length}],
  };
}


function transform(transformations, str) {
  let transformedStr = str;
  const mappings = [];
  transformations.forEach((transformation) => {
    const {str: newStr, mapping} = transformation(transformedStr);
    transformedStr = newStr;
    mappings.push(mapping);
  });
  return {transformedStr, mapping: mappings};
}


exports.SearchIndex = class SearchIndex {
  constructor(str) {
    this.transformations = [exports.transformSpaces, transformLowercase];

    const {transformedStr, mapping} = transform(this.transformations, str);
    this.transformedStr = transformedStr;
    this.mappings = mapping;
  }

  search(searchStr) {
    const {transformedStr} = transform(this.transformations, searchStr);
    if (transformedStr.length === 0) throw new Error('transformed string is empty');

    // end position points to the last character
    let startPositions = exports.findPositions(this.transformedStr, transformedStr);
    let endPositions = startPositions.map(position => position + (transformedStr.length - 1));

    // note: slice() copies the array so reverse() can alter the array
    this.mappings.slice().reverse().forEach((mapping) => {
      startPositions = exports.backTransformPositions(startPositions, mapping);
      endPositions = exports.backTransformPositions(endPositions, mapping);
    });

    const ranges = [];
    for (let i = 0; i < startPositions.length; i += 1) {
      ranges.push({position: startPositions[i], length: (endPositions[i] - startPositions[i]) + 1});
    }

    return ranges;
  }
};
