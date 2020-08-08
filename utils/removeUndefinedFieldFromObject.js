module.exports = (object) => {
  for (const key in object) {
    if (
      object.hasOwnProperty(key)
      && (object[key] === undefined || object[key] === null)
    ) {
      delete object[key];
    }
  }
};
