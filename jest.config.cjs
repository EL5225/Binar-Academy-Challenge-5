const { defaults } = require("jest-config");

/** @type {import('jest').Config} */
const config = {
  transform: {},
  ...defaults,
};

module.exports = config;
