import { readFileSync } from 'fs';
import chalk from 'chalk';

export const parseJsonFile = (filePath) => JSON.parse(readFileSync(filePath));

export const colored = {
  error: chalk.red.bold,
  errorText: chalk.red,
  time: chalk.yellow,
  notify: chalk.blue
};
