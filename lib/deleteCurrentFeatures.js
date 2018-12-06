const debug = require('debug')('fire');
const MapboxClient = require('mapbox');
const queue = require('d3-queue').queue;
const mbxDatasets = require('@mapbox/mapbox-sdk/services/datasets');

const getCurrentFeatures = require('./getCurrentFeatures');
const prudentMapbox = require('./prudentMapbox');

module.exports = (config) => {
  return getCurrentFeatures(config)
  .then((dataObj) => {
    return new Promise((resolve, reject) => {
      // debug('deleting old features...')
      console.log('deleting old features...')
      const putQueue = queue(20);

      dataObj.featuresToDelete.forEach((f) => {
        putQueue.defer((next) => {
          const client = new MapboxClient(config.mapboxAcessToken);
          config.mapboxClient = new MapboxClient(config.mapboxAcessToken);
          prudentMapbox(config.mapboxClient, 'deleteFeature', [
          f.id,
          config.datasetId
          ]).then(() => {
            console.log(`deleting ${f.id}...`);
            // debug(`deleting ${f.id}...`);
            next();
          }).catch(next);
        });
      });

      putQueue.awaitAll((err) => {
        if (err) {
          // debug('Failed to delete features');
          console.log('Failed to delete features');
          console.log(new Error(err.message))
          return reject(new Error(err.message));
        }
          // debug('Successfully deleted features');
          console.log('Successfully deleted features')
          resolve(dataObj.features);
      });
    });
  });
};
