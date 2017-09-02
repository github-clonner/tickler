const isObject = obj => obj && typeof obj === 'object'
const hasKey = (obj, key) => key in obj

export const Undefined = new Proxy({}, {
  /*
  get: function (target, property) {
    console.log('Undefinedx get called: ', property)
    return Undefined;
  },
  */
  apply: function(target, thisArg, argumentsList) {
    console.log('Undefinedx apply called: ', target, argumentsList);
    return function () {};
  }
});

export const isUndefined = obj => (obj === Undefined)
export const either = (val, fallback) => (val === Undefined? fallback : val)

const returnPropertyOnObject = (target, property) =>
  isObject(target[property])
    ? safe(target[property])
    : target[property]

function safe (obj) {
  return new Proxy(obj, {
    get: (target, property, receiver) => {
      console.log('safe get called: ', target, property, receiver)
      return hasKey(target, property)
      ? returnPropertyOnObject(target, property)
      : Undefined
    },
    apply: function(target, thisArg, argumentsList) {
      console.log('safe apply called: ', target, argumentsList);
      return {};
    }
  });
}

export default safe;
