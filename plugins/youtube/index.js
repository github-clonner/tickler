const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');

/* Private variables */
const onUnload = function (resolve, reject) {
  return setTimeout(function () {
    return resolve(true);
  }, 2500);
};

/* Private Methods */
function getId() {
  return uuid();
}

/* Public exports */
module.exports = {
  id: getId(),
  onUnload: new Promise(onUnload),
  middleware(...args) {
    console.log('middleware', args);
  }
};


// Our extension's custom redux middleware. Here we can intercept redux actions and respond to them.
exports.middleware = ({ getState, dispatch }) => (next) => (action) => {
  console.log('middleware', action);
  // switch (action.type) {
  //   default:
  //     return state;
  // }

  // Call the next dispatch method in the middleware chain.
  return next(action);
};
