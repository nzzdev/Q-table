const Lab = require("lab");
const Code = require("code");
const Hapi = require("hapi");
const Boom = require("boom");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const lab = (exports.lab = Lab.script());

const expect = Code.expect;
const before = lab.before;
const after = lab.after;
const it = lab.it;

const package = require("../package.json");
const routes = require("../routes/routes.js");

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
        toolRuntimeConfig: {}
      }
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
      method: "POST"
    });
    expect(response.statusCode).to.be.equal(400);
  });

  it("returns 400 if no item given in payload", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/four-column-no-header.json")
      }
    });
    expect(response.statusCode).to.be.equal(400);
  });

  it("returns 400 if no toolRuntimeConfig given in payload", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        toolRuntimeConfig: {}
      }
    });
    expect(response.statusCode).to.be.equal(400);
  });

  it("returns 400 if invalid item given", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: { foo: "bar" },
        toolRuntimeConfig: {}
      }
    });
    expect(response.statusCode).to.be.equal(400);
  });
});

lab.experiment("footnotes", () => {
  it("shows annotations for footnotes in table numbering downwords", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/display-footnotes.json"),
        toolRuntimeConfig: {}
      }
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll(
      "span.q-table-annotation"
    );

    let annotationIndexes = [];

    annotations.forEach(annotation => {
      annotationIndexes.push(annotation.innerHTML);
    });

    expect(annotationIndexes).to.be.equal(["1", "2", "3", "4"]);
  });

  it("shows text of footnotes in footer of table with right index", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/display-footnotes.json"),
        toolRuntimeConfig: {}
      }
    });

    const dom = new JSDOM(response.result.markup);
    const footnotes = dom.window.document.querySelectorAll(
      "div.q-table-footer-footnote"
    );

    let arrayOfFootnotes = [];

    footnotes.forEach(footnote => {
      arrayOfFootnotes.push({
        index: footnote.childNodes[1].innerHTML,
        text: footnote.childNodes[2].innerHTML
      });
    });

    expect(arrayOfFootnotes).to.be.equal([
      {
        index: "1",
        text: " Frisch verheiratet, früher Hanspeter Mustermann"
      },
      {
        index: "2",
        text: " Verhalten in letzter Spalte"
      },
      {
        index: "3",
        text: " Frisch verheiratet, früher Peter Vorderbach"
      },
      {
        index: "4",
        text: " Frisch verheiratet, früher Ralf Hinterbach"
      }
    ]);
  });

  it("displays a bigger padding in column with footnotes when column with minibars follows", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/display-footnotes-before-minibar.json"),
        toolRuntimeConfig: {}
      }
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll(
      ".q-table-col-footnotes-single"
    ).length;
    expect(annotations).to.be.equal(6);
  });

  it("displays a even bigger padding in column with footnotes with there are more than 9", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/display-alot-of-footnotes.json"),
        toolRuntimeConfig: {}
      }
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll(
      ".q-table-col-footnotes-double"
    ).length;
    const annotationsLast = dom.window.document.querySelectorAll(
      ".q-table-col-footnotes-double-last"
    ).length;
    expect(annotations).to.be.equal(6);
    expect(annotationsLast).to.be.equal(6);
  });

  it("behaves correctly with other metaData in cells", async () => {
    let item = require("../resources/fixtures/data/display-footnotes.json");
    item.data.metaData.cells = [
      {
        data: {
          test: "test"
        },
        rowIndex: 1,
        colIndex: 2
      },
      {
        data: {
          test1: "test1"
        },
        rowIndex: 2,
        colIndex: 1
      },
      {
        data: {
          test2: "test2"
        },
        rowIndex: 3,
        colIndex: 1
      },
      {
        data: {
          footnote: "test3",
          multipleData: true
        },
        rowIndex: 4,
        colIndex: 1
      }
    ];
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: item,
        toolRuntimeConfig: {}
      }
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll(
      "span.q-table-annotation"
    );
    let annotationIndexes = [];
    annotations.forEach(annotation => {
      annotationIndexes.push(annotation.innerHTML);
    });

    expect(annotationIndexes).to.be.equal(["1"]);
    expect(response.statusCode).to.be.equal(200);
  });
});
