'use strict';

var processArgs = process.argv.slice(2);
var appConfig = JSON.parse(processArgs);
var jobs = [appConfig.add_column ? 'add_column' : null, appConfig.transform_column ? 'transform_column' : null, appConfig.column_match ? 'column_match' : null];
var chunckNum = 0;
var dataHeader = void 0;

process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
  var chunkByLines = chunk.split('\n');

  if (chunckNum === 0) {
    chunkByLines = chunkByLines.splice(1, chunkByLines.length);
  }

  var chunkData = horizontalParse(chunkByLines, appConfig);

  if (chunckNum === 0) {
    process.stdout.write(appConfig.table_header.join(',') + ',diff\n');
  }
  process.stdout.write(updateChunk(handleJobs(jobs, appConfig, chunkData)) + '\n');
  chunckNum++;
});

process.stdout.on('error', function (err) {
  if (err.code === 'EPIPE') return process.exit();
  process.emit('error', err);
});

var updateChunk = function updateChunk(chunkData, includeHeader) {
  return chunkData.map(function (chunk) {
    return [chunk.grade, chunk.text, chunk.from, chunk.to, chunk.diff].join(',');
  }).join('\n');
};

var handleJobs = function handleJobs(jobs, config, chunkData) {
  return chunkData.filter(function (data, index) {
    if (jobs.includes('column_match')) {
      var isValid = true;
      var matchableColumns = Object.keys(config.column_match);

      matchableColumns.map(function (colName) {
        var columnPattern = config.column_match[colName].pattern;

        if (!data[colName].toString().match(columnPattern)) {
          isValid = false;
        }
      });

      return isValid;
    } else {
      return data;
    }
  }).map(function (data) {
    if (jobs.includes('add_column')) {
      data[config.add_column.column_name] = ruleToData(data, config.add_column.rule);
    }

    if (jobs.includes('transform_column')) {
      var transofrmableColumns = Object.keys(config.transform_column);
      transofrmableColumns.map(function (colName) {

        var transormableFields = config.transform_column[colName];
        Object.keys(transormableFields).forEach(function (fieldKey) {
          data[colName] = data[colName] === fieldKey ? transormableFields[fieldKey] : data[colName];
        });
      });
    }

    return data;
  });
};

var horizontalParse = function horizontalParse(chunkArray, config) {
  var parsedData = [];

  chunkArray.forEach(function (chunkLine) {
    var parsedLine = chunkLine.split(/\,[^\s]/);
    parsedData.push(parsedLine.reduce(function (acc, lineItem, i) {
      acc[config.table_header[i]] = lineItem;
      return acc;
    }, {}));
  });

  return parsedData;
};

var ruleToData = function ruleToData(data, rule) {
  var rulePeaces = rule.split(' ');
  var ruleAction = rulePeaces[1];
  var columnType = rulePeaces[0].split(':')[1];

  // Can me scaled for other types of operations (for demo just time values).
  if (columnType === 'time') {
    if (ruleAction === '-') {
      // return moment(rulePeaces[0]).diff(moment(rulePeaces[2], 'days'));
      return getDaysBetweenDates('2' + data[rulePeaces[0].split(':')[0]], '2' + data[rulePeaces[2].split(':')[0]]);
    }
  }
};

var getDaysBetweenDates = function getDaysBetweenDates(d0, d1) {
  var msPerDay = 8.64e7;
  var x0 = new Date(d0);
  var x1 = new Date(d1);

  x0.setHours(12, 0, 0);
  x1.setHours(12, 0, 0);

  return Math.round((x1 - x0) / msPerDay) + ' days';
};