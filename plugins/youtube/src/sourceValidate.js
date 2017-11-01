
/* sourceValidate.js */
const SrcRegExp = new RegExp(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/);
exports.isValidSource = function (origin) {
  return origin.match(SrcRegExp);
}
