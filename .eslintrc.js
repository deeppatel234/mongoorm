'use strict';

module.exports = {
  extends: ["airbnb-base"],

  // Stop ESLint from looking for a configuration file in parent folders
  'root': true,

  plugins: [
    'jest'
  ],

  rules: {
    "linebreak-style": 0,
    "eol-last": ["error", "always"],
    "no-underscore-dangle": 0,
    "class-methods-use-this": 0,
    "prefer-const": 0,
    "no-param-reassign": 0,
    "func-names": 0,
    "prefer-arrow-callback": 0,
    "consistent-return": 0,
    "no-await-in-loop": 0,
  },

  env: {
    "jest/globals": true,
  }
}
