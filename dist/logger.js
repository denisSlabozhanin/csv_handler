'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.console = undefined;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var console = exports.console = function console(msg, time) {
  console.log('[' + _chalk2.default.yellow(time || (0, _moment2.default)().format('HH:mm:ss')) + '] ' + _chalk2.default.blue(msg));
};