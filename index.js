const debug = require('debug')('fire');
const writeDataset = require('./lib/writeDataset');

module.exports.fetchAndPush = (event, context, callback) => {
  return writeDataset({
    mapboxAcessToken: process.env.MAPBOX_ACCESS_TOKEN,
    datasetId: process.env.DATASET_ID
  }).then(() => {
    // debug('Successfully wrote features to the dataset.');
    console.log('Successfully wrote features to the dataset.');
    callback();
  }).catch((err) => {
    // debug('Failed writing features to the dataset');
    console.log('Failed writing features to the dataset');
    // debug(err);
    console.log(err);
    if (err.stack)
      // debug(err.stack);
      console.log(err.stack);
    if (err instanceof Error) {
      callback(err);
    } else {
      callback(new Error(err && err.message));
    }
  })
};
