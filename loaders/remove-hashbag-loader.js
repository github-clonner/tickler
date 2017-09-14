export default function removeHashBagLoader (source) {
  this.cacheable && this.cacheable();
  console.log('file', this.resourcePath)

  if ((typeof source === 'string') && (/^#!/.test(source))) {
    return source.replace(/^#![^\n\r]*[\r\n]/, '');
  } else {
    return source;
  }
};
