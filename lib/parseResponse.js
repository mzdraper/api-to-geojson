const togeojson = require('togeojson');
const DomParser = require('xmldom').DOMParser;
const parser = new DomParser();
const flatten = require('geojson-flatten');
const debug = require('debug')('fire');
const getResponse = require('./getResponse');

// constants
const API_URL = 'https://rmgsc.cr.usgs.gov/outgoing/GeoMAC/ActiveFirePerimeters.kml';
const CUSTOM_ID = 'fire';

module.exports = (config) => {
  return getResponse(API_URL)
    .then((response) => {
      // check for last-modified header
      const last_mod = response.getResponseHeader('last-modified');
      // get response content
      const data = response.responseText;
      // in this case, we want geojson so we parse the string, get the xml, convert to geojson
      const xml = parser.parseFromString(data);
      const geo = togeojson.kml(xml);
      // flatten the geojson to remove GeometryCollection
      const flattened = flatten(geo);
      const { features } = flattened;
      features.forEach(function(feature, index) {
        // console.log('----------------------')
        // console.log(feature.properties.name);
        // This is optional. It adds the date the file was last modified as an property.
        feature.properties.last_mod = last_mod;
        // if perimeter
        // if (feature.geometry.type === 'Polygon') {
        //   feature.id = `perimeter-${new Date().getFullYear()}-${feature.properties.name.split(' ')[0]}`;
        // } else {
        //   feature.id = `point-${new Date().getFullYear()}-${feature.properties.name.split(' ')[0]}`;
        // }
      })
      // return parsed features
      // debug('Successfully parsed the response!');
      console.log('Successfully parsed the response!')
      console.log(`there are ${features.length} features in the response from GeoMAC`)
      return features;
    })
}
