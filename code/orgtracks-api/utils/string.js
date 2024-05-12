const clamp = (str, length) => {
  let newStrSegments = str.split("\n");

  if (newStrSegments[0].length > length || newStrSegments.length > 1) {
    return newStrSegments[0].slice(0, length) + "...";
  }
  return newStrSegments[0];
};

module.exports = {
  clamp,
};
