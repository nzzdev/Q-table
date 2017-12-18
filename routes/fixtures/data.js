const fixtureDataDirectory = '../../resources/fixtures/data';

// provide every fixture data file present in ../../resources/fixtures/data
const fixtureData = [
  require(`${fixtureDataDirectory}/two-column.json`),
  require(`${fixtureDataDirectory}/four-column.json`),
  require(`${fixtureDataDirectory}/four-column-no-header.json`),
];

module.exports = {
  path: '/fixtures/data',
  method: 'GET',
  options: {
    tags: ['api'],
    cors: true
  },
  handler: (request, h) => {
    return fixtureData;
  }
}
