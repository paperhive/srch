exports.findPositions = function findPositions(fullstr, searchstr) {
  const regExpSearchstr = new RegExp(searchstr, 'gi');
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

function transformPosition(position, mapping) {
  let lastOffsetOriginal = 0;
  let runningPosition = position;

  for (let i = 0; i < mapping.length; i += 1) {
    const map = mapping[i];

    if (runningPosition < map.transformed) {
      return lastOffsetOriginal + Math.min(runningPosition, map.original - 1);
    }

    lastOffsetOriginal += map.original;
    runningPosition -= map.transformed;
  }

  throw new Error('incorrect position/mapping combination');
}

exports.backTransformPositions = function backTransformPositions(positions, mapping) {
  return positions.map(position => transformPosition(position, mapping));
};
