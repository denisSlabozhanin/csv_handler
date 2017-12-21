'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _child_process = require('child_process');

var child_process = _interopRequireWildcard(_child_process);

var _utils = require('./utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = (0, _utils.parseJsonFile)('./config.json');
var inputFile = process.argv[2];

if (!inputFile.match(config.accept_files.pattern)) {
  console.error(_utils.colored.error('ERROR: '), _utils.colored.errorText('The file provided as input file doesn\'t match the requirements specified in "config" file.'));
  process.exit();
}

var reader = _fs2.default.createReadStream;
var writer = _fs2.default.createWriteStream('./output/output.csv');

var parameters = [JSON.stringify(config)];
var options = {
  stdio: ['pipe', 'pipe', 'pipe', 'ipc']
};

var processesList = [];

var child = child_process.fork('./src/child.js', parameters, options);

console.log('[' + _utils.colored.time((0, _moment2.default)().format('HH:mm:ss')) + '] ' + _utils.colored.notify('Processing started successfully...'));

var readFileChuncks = reader(process.argv[2]).pipe(child.stdin);

child.stdout.pipe(writer);

child.stdout.on('data', function (output) {
  //console.log(output.toString());
});