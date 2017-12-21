const processArgs = process.argv.slice(2);
const appConfig = JSON.parse(processArgs);
const jobs = [
    appConfig.add_column ? 'add_column' : null,
    appConfig.transform_column ? 'transform_column' : null,
    appConfig.column_match ? 'column_match' : null,
  ];
let chunckNum = 0;

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  let chunkByLines = chunk.split('\n');

  if (chunckNum === 0) {
    chunkByLines = chunkByLines.splice(1, chunkByLines.length);
  }

  const chunkData = horizontalParse(chunkByLines, appConfig);

  if (chunckNum === 0) {
    process.stdout.write(`${appConfig.table_header.join(',')},diff\n`);
  }
  process.stdout.write(`${updateChunk(handleJobs(jobs, appConfig, chunkData))}\n`);
  chunckNum++;
});

process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') return process.exit();
  process.emit('error', err);
});

const updateChunk = (chunkData, includeHeader) =>
  chunkData.map(chunk => [chunk.grade, chunk.text, chunk.from, chunk.to, chunk.diff].join(','))
    .join('\n');

const handleJobs = (jobs, config, chunkData) => chunkData
  .filter((data, index) => {
    if (jobs.includes('column_match')) {
      let isValid = true;
      const matchableColumns = Object.keys(config.column_match);

      matchableColumns.map(colName => {
        const columnPattern = config.column_match[colName].pattern;

        if (!data[colName].toString().match(columnPattern)) {
          isValid = false;
        }
      });

      return isValid;
    } else {
      return data;
    }
  })
  .map(data => {
  if (jobs.includes('add_column')) {
      data[config.add_column.column_name] = ruleToData(data, config.add_column.rule);
  }

  if (jobs.includes('transform_column')) {
    const transofrmableColumns = Object.keys(config.transform_column);
    transofrmableColumns.map(colName => {

      const transormableFields = config.transform_column[colName];
      Object.keys(transormableFields).forEach(function(fieldKey) {
        data[colName] = data[colName] === fieldKey
            ? transormableFields[fieldKey]
            : data[colName];
      });
    })
  }

  return data;
});

const horizontalParse = (chunkArray, config) => {
  let parsedData = [];

  chunkArray.forEach(chunkLine => {
    const parsedLine = chunkLine.split(/\,[^\s]/);
    parsedData.push(parsedLine.reduce((acc, lineItem, i) => {
      acc[config.table_header[i]] = lineItem;
      return acc;
    }, {}));
  });

  return parsedData;
};

const ruleToData = (data, rule) => {
  const rulePeaces = rule.split(' ');
  const ruleAction = rulePeaces[1];
  const columnType = rulePeaces[0].split(':')[1];

  // Can me scaled for other types of operations (for demo just time values).
  if (columnType === 'time') {
    if (ruleAction === '-') {
      // return moment(rulePeaces[0]).diff(moment(rulePeaces[2], 'days'));
      return getDaysBetweenDates(`2${data[rulePeaces[0].split(':')[0]]}`, `2${data[rulePeaces[2].split(':')[0]]}`);
    }
  }
};

const getDaysBetweenDates = (d0, d1) => {
  const msPerDay = 8.64e7;
  let x0 = new Date(d0);
  let x1 = new Date(d1);

  x0.setHours(12,0,0);
  x1.setHours(12,0,0);

  return `${Math.round( (x1 - x0) / msPerDay )} days`;
};
