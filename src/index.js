import fs from 'fs';
import moment from 'moment';
import * as child_process from 'child_process';
import { parseJsonFile, colored } from './utils';

const config = parseJsonFile('./config.json');
const inputFile = process.argv[2];

if (!inputFile.match(config.accept_files.pattern)) {
  console.error(
    colored.error('ERROR: '),
    colored.errorText(`The file provided as input file doesn't match the requirements specified in "config" file.`)
  );
  process.exit();
}

const reader = fs.createReadStream;
const writer = fs.createWriteStream('./output/output.csv');

const parameters = [ JSON.stringify(config) ];
const options = {
  stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ]
};

const processesList = [];

  const child = child_process.fork('./src/child.js', parameters, options);

console.log(`[${colored.time(moment().format('HH:mm:ss'))}] ${colored.notify('Processing started successfully...')}`);

const readFileChuncks = reader(process.argv[2])
  .pipe(child.stdin);


child.stdout.pipe(writer);

child.stdout.on('data', (output) => {
  //console.log(output.toString());
});
