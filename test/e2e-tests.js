const Lab = require("@hapi/lab");
const Code = require("@hapi/code");
const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi");
const lab = (exports.lab = Lab.script());

const expect = Code.expect;
const before = lab.before;
const after = lab.after;
const it = lab.it;

const routes = require("../routes/routes.js");

let server;

before(async () => {
  try {
    server = Hapi.server({
      port: process.env.PORT || 3000,
      routes: {
        cors: true,
      },
    });
    server.validator(Joi);
    server.route(routes);
  } catch (err) {
    expect(err).to.not.exist();
  }
});

after(async () => {
  await server.stop({ timeout: 2000 });
  server = null;
});

lab.experiment("basics", () => {
  it("starts the server", () => {
    expect(server.info.created).to.be.a.number();
  });

  it("is healthy", async () => {
    const response = await server.inject("/health");
    expect(response.payload).to.equal("ok");
  });
});

lab.experiment("rendering-info/web", () => {
  it("renders a table", { plan: 4 }, async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/four-column-no-header.json"),
        toolRuntimeConfig: {},
      },
    });
    expect(response.statusCode).to.be.equal(200);
    expect(response.result.markup).startsWith(
      '<div class="s-q-item q-table " id="q_table_someid_'
    );
    expect(response.result.stylesheets[0].name).startsWith("q-table.");
    expect(response.result.scripts[0].content).to.be.a.string();
  });

  it("returns 400 if no payload given", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
    });
    expect(response.statusCode).to.be.equal(400);
  });

  it("returns 400 if no item given in payload", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/four-column-no-header.json"),
      },
    });
    expect(response.statusCode).to.be.equal(400);
  });

  it("returns 400 if no toolRuntimeConfig given in payload", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        toolRuntimeConfig: {},
      },
    });
    expect(response.statusCode).to.be.equal(400);
  });

  it("returns 400 if invalid item given", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: { foo: "bar" },
        toolRuntimeConfig: {},
      },
    });
    expect(response.statusCode).to.be.equal(400);
  });
});

lab.experiment("migration endpoint", () => {
  it("returns 304 for /migration", async () => {
    const request = {
      method: "POST",
      url: "/migration",
      payload: {
        item: require("../resources/fixtures/data/minibars-negative.json"),
      },
    };
    const response = await server.inject(request);
    expect(response.statusCode).to.be.equal(304);
  });
});

lab.experiment("option availability endpoint", () => {
  it("returns true for option availability of selectedColumn", async () => {
    const request = {
      method: "POST",
      url: "/option-availability/selectedColumnMinibar",
      payload: {
        item: require("../resources/fixtures/data/minibars-mixed.json"),
      },
    };
    const response = await server.inject(request);
    expect(response.result.available).to.be.equal(true);
  });

  it("returns false for option availability of selectedColumn", async () => {
    const request = {
      method: "POST",
      url: "/option-availability/selectedColumnMinibar",
      payload: {
        item: require("../resources/fixtures/data/two-column.json"),
      },
    };
    const response = await server.inject(request);
    expect(response.result.available).to.be.equal(false);
  });
});

lab.experiment("dynamic schema endpoint", () => {
  it("returns enums of selectedColumn", async () => {
    const request = {
      method: "POST",
      url: "/dynamic-schema/selectedColumnMinibar",
      payload: {
        item: require("../resources/fixtures/data/minibars-negative.json"),
      },
    };
    const response = await server.inject(request);
    expect(response.result.enum).to.be.equal([null, 1, 2, 3]);
    expect(response.result["Q:options"].enum_titles).to.be.equal([
      "keine",
      "2016",
      "2017",
      "+/- %",
    ]);
  });
});

lab.experiment("fixture data endpoint", () => {
  it("returns 36 fixture data items for /fixtures/data", async () => {
    const response = await server.inject("/fixtures/data");
    expect(response.statusCode).to.be.equal(200);
    expect(response.result.length).to.be.equal(36);
  });
});
