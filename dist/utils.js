'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.colored = exports.parseJsonFile = undefined;

var _fs = require('fs');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseJsonFile = exports.parseJsonFile = function parseJsonFile(filePath) {
  return JSON.parse((0, _fs.readFileSync)(filePath));
};

var colored = exports.colored = {
  error: _chalk2.default.red.bold,
  errorText: _chalk2.default.red,
  time: _chalk2.default.yellow,
  notify: _chalk2.default.blue
};