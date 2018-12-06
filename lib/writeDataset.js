const debug = require('debug')('fire');
const MapboxClient = require('mapbox');
const queue = require('d3-queue').queue;

const deleteCurrentFeatures = require('./deleteCurrentFeatures');
const prudentMapbox = require('./prudentMapbox');

module.exports = (config) => {
  return deleteCurrentFeatures(config)
  .then((features) => {
    const client = new MapboxClient(config.mapboxAcessToken);
    config.mapboxClient = new MapboxClient(config.mapboxAcessToken);
    return updatingFeatures(config, features);
  })
};

function updatingFeatures(config, features) {
  return new Promise((resolve, reject) => {
    // debug('Updating features dataset...');
    console.log('Updating features dataset...');
    const putQueue = queue(20);
    let count = 0;
    features.forEach((feature) => {
      putQueue.defer((next) => {
        prudentMapbox(config.mapboxClient, 'insertFeature', [
          feature,
          config.datasetId,
        ]).then(() => {
          count++
          console.log(`writing ${feature.properties.name}`)
          console.log(`${count} feature(s) written`)
          next();
        }).catch(next);
      });
    });

    putQueue.awaitAll((err) => {
      if (err) {
        // debug('Failed to update features');
        console.log('Failed to update features');
        return reject(new Error(err.message));
      }
      // debug('Successfully updated features');
      console.log('Successfully updated features');
      resolve(features);
    });
  });
}
