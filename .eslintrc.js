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
  },

  env: {
    "jest/globals": true,
  }
}
