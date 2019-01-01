const _capitalize = require('lodash/capitalize');
const _isFunction = require('lodash/isFunction');


class Hooks {
  /**
   * scan hook function anc call
   *
   * EX:
   *  type : pre, post
   *  name : save, delete, ...
   *
   * call function preSave and bind parent object
   *
   * @param {string} type
   * @param {string} name
   * @param {object} parent
   * @returns promises
   * @memberof Hooks
   */
  __scanHooks(type, name, parent) {
    let funcName = type + _capitalize(name);
    if (_isFunction(this[funcName])) {
      return this[funcName].call(parent);
    }
    return Promise.resolve();
  }

  /**
   * call pre hook function
   *
   * @param {string} name
   * @param {object} parent
   * @returns
   * @memberof Hooks
   */
  triggerPreHook(name, parent) {
    return this.__scanHooks('pre', name, parent);
  }

  /**
   * call post hook function
   *
   * @param {string} name
   * @param {object} parent
   * @returns
   * @memberof Hooks
   */
  triggerPostHook(name, parent) {
    return this.__scanHooks('post', name, parent);
  }

  /**
   * wrap pre and post hooks function when call func function
   *
   * function call sequence
   * pre Hook function -> func function -> post Hook function
   *
   * @param {string} name
   * @param {object} parent
   * @param {funtion} func
   * @returns
   * @memberof Hooks
   */
  wrapHooks(name, parent, func) {
    let self = this;
    return this.triggerPreHook(name, parent).then(function () {
      return func().then(function (res) {
        return self.triggerPostHook(name, parent).then(function () {
          return res;
        });
      });
    });
  }
}

module.exports = Hooks;
