const d3 = require('d3-request');
const debug = require('debug')('fire');

module.exports = function(url) {
  return new Promise((resolve, reject) => {
    d3.request(url)
      .mimeType('"application/xml"')
      .response((response) => {
        // check if request was successful
        if (response.status >= 400) {
          // else throw error
          const err = new Error('Network response was not ok.');
          // debug(err);
          console.log(err);
          reject(err);
        }
        return response;
      })
      .get((response) => {
        // debug('Successful response received... resolving')
        console.log('Successful response received... resolving');
        resolve(response);
      });
  });
};
