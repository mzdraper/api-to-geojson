const debug = require('debug')('fire');
const MapboxClient = require('mapbox');
const queue = require('d3-queue').queue;
const mbxDatasets = require('@mapbox/mapbox-sdk/services/datasets');

const parseResponse = require('./parseResponse');
const prudentMapbox = require('./prudentMapbox');

module.exports = (config) => {
  return parseResponse(config)
  .then((features) => {
    const datasetsClient = mbxDatasets({ accessToken: config.mapboxAcessToken });
    const featuresToDelete = [];
    return new Promise((resolve, reject) => {
      datasetsClient
        .listFeatures({
          datasetId: config.datasetId
        })
        .eachPage((error, response, next) => {
          if (error) {
            // debug(error)
            console.log(error)
            reject(error);
          }

          response.body.features.forEach((f) => {
            featuresToDelete.push(f);
          })

          if (response.hasNextPage()) {
            // debug('Receiving features')
            console.log('Receiving features')
            next();
          } else {
            console.log(`The dataset has currently ${featuresToDelete.length} that needs deleting`)
            // debug('Features received.')
            console.log('Features received.')

            const dataObj = {
              featuresToDelete, features
            }

            resolve(dataObj);
          }
        })
    })
  });
};
