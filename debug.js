require('dotenv').config();
const debug = require('debug')('fire');
const writeDataset = require('./lib/writeDataset');

writeDataset({
  mapboxAcessToken: '{YOUR-ACCESS-TOKEN}',
  datasetId: 'cjkalrdza03gcf8sachvljiww'
  })
  .then(() => {
    debug('Successfully wrote features to the dataset.');
  })
  .catch((err) => {
    debug('Failed');
    debug(err);
    if (err.stack) debug(err.stack);
  });
