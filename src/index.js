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
  return {str: '', mapping: [{ transformed: 0, original: 0 }]};
};

exports.backTransformPositions = function backTransformPositions(positions, mapping) {
  return [];
};
