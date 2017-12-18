const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const Boom = require('boom');
const lab = exports.lab = Lab.script();

const expect = Code.expect;
const before = lab.before;
const after = lab.after;
const it = lab.it;

const package = require('../package.json');
const routes = require('../routes/routes.js');

let server;

before(async () => {
  try {
    server = Hapi.server({
      port: process.env.PORT || 3000,
      routes: {
        cors: true
      }
    });
    server.route(routes);
  }
  catch (err) {
    expect(err).to.not.exist();
  }
});

after(async () => {
  await server.stop({ timeout: 2000 });
  server = null;
});

lab.experiment('basics', () => {

  it('starts the server', () => {
    expect(server.info.created).to.be.a.number();
  });

  it('is healthy', async () => {
    const response = await server.inject('/health');
    expect(response.payload).to.equal('ok');
  });

});

lab.experiment('rendering-info/web', () => {
  it('renderes a table', { plan: 4 }, async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: require('../resources/fixtures/data/four-column-no-header.json'),
        toolRuntimeConfig: {}
      }
    });
    expect(response.statusCode).to.be.equal(200);
    expect(response.result.markup).startsWith('<div class="s-q-item q-table " id="q_table_someid_');
    expect(response.result.stylesheets[0].name).startsWith('q-table.');
    expect(response.result.scripts[0].content).startsWith('function applyCardLayoutClassq_table_someid_');
  });

  it('returns 400 no payload given', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST'
    });
    expect(response.statusCode).to.be.equal(400);
  });

  it('returns 400 no item given in payload given', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: { 
        item: require('../resources/fixtures/data/four-column-no-header.json')
      }
    });
    expect(response.statusCode).to.be.equal(400);
  });

  it('returns 400 no toolRuntimeConfig given in payload given', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: { 
        toolRuntimeConfig: {}
      }
    });
    expect(response.statusCode).to.be.equal(400);
  });

  it('returns 400 if invalid item given', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: { foo: 'bar' },
        toolRuntimeConfig: {}
      }
    });
    expect(response.statusCode).to.be.equal(400);
  })
});
