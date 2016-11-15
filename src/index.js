// cf. https://github.com/sindresorhus/escape-string-regexp
function escapeRegExpCharacters(str) {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

exports.findPositions = function findPositions(fullstr, searchstr) {
  const regExpSearchstr = new RegExp(escapeRegExpCharacters(searchstr), 'gi');
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
