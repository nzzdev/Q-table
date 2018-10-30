const Lab = require("lab");
const Code = require("code");
const Hapi = require("hapi");
const Boom = require("boom");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const lab = (exports.lab = Lab.script());
var minify = require("html-minifier").minify;

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

lab.experiment("minibars", () => {
  it("shows the same markup for positive minibars", async () => {
    const workingMinibarsMarkup = `<div class="s-q-item q-table"id="q_table_someid_"style="opacity: 0;"><h3 class="s-q-item__title">FIXTURE: minibars with negative values</h3><div class="q-table__subtitle s-font-note">State by state breakdown</div><table class="q-table__table"><thead class="s-font-note s-font-note--strong"><th class="q-table__cell q-table-cell--head q-table__cell--text"></th><th class="q-table__cell q-table-cell--head q-table__cell--numeric">2016</th><th class="q-table__cell q-table-cell--head q-table__cell--numeric">2017</th><th class="q-table__cell q-table-cell--head q-table__cell--numeric"colspan="2"id="q-table-minibar-header">+/- %</th></thead><tbody class="s-font-note"><tr><td data-label=" "class="q-table__cell q-table__cell--text q-table-col-footnotes-cardlayout-single">Auftragseingang</td><td data-label="2016 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">10 375</td><td data-label="2017 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">10 989</td><td class="q-table-minibar-cell"data-minibar="negative"style="padding-left: 12px; padding-right: 0px !important;"><div data-minibar-type="bar"class="q-table-minibar-bar--negative s-viz-color-one-5"style="width: 46.15384615384615%;background-color:;"></div></td><td data-label="+/- % "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single q-table-minibar-cell--value"data-minibar="negative"data-minibar-type="value"style="padding-right: 12px;">-6</td></tr><tr><td data-label=" "class="q-table__cell q-table__cell--text q-table-col-footnotes-cardlayout-single">Umsatz</td><td data-label="2016 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">9683</td><td data-label="2017 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">10 178</td><td class="q-table-minibar-cell"data-minibar="negative"style="padding-left: 12px; padding-right: 0px !important;"><div data-minibar-type="bar"class="q-table-minibar-bar--negative s-viz-color-one-5"style="width: 38.46153846153846%;background-color:;"></div></td><td data-label="+/- % "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single q-table-minibar-cell--value"data-minibar="negative"data-minibar-type="value"style="padding-right: 12px;">-5</td></tr><tr><td data-label=" "class="q-table__cell q-table__cell--text q-table-col-footnotes-cardlayout-single">Ebit-Mage (%)</td><td data-label="2016 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">11,7</td><td data-label="2017 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">11,7</td><td class="q-table-minibar-cell"data-minibar="negative"style="padding-left: 12px; padding-right: 0px !important;"><div data-minibar-type="bar"class="q-table-minibar-bar--empty s-viz-color-one-5"></div></td><td data-label=\"+/- % \"class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single q-table-minibar-cell--value"data-minibar="negative"data-minibar-type="value"style="padding-right: 12px;">-</td></tr><tr><td data-label=" "class="q-table__cell q-table__cell--text q-table-col-footnotes-cardlayout-single">Cashflow aus Geschäftstätigkeite</td><td data-label="2016 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">929</td><td data-label="2017 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">810</td><td class="q-table-minibar-cell"data-minibar="negative"style="padding-left: 12px; padding-right: 0px !important;"><div data-minibar-type="bar"class="q-table-minibar-bar--negative s-viz-color-one-5"style="width: 100%;background-color:;"></div></td><td data-label="+/- % "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single q-table-minibar-cell--value"data-minibar="negative"data-minibar-type="value"style="padding-right: 12px;">-13</td></tr></tbody></table><div class="s-q-item__footer">Quelle: The Centers for Disease Control and Prevention</div></div>`;

    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-negative.json"),
        toolRuntimeConfig: {}
      }
    });

    const html = response.result.markup.replace(
      /(?<=q_table_someid_)[\w+.-]+/,
      ""
    );

    const resultResp = minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeTagWhitespace: true,
      useShortDoctype: true
    });

    expect(resultResp).to.be.equals(workingMinibarsMarkup);
  });

  it("shows the same markup for negative minibars", async () => {
    const workingMinibarsMarkup = `<div class="s-q-item q-table"id="q_table_someid_"style="opacity: 0;"><h3 class="s-q-item__title">FIXTURE: minibars with negative values</h3><div class="q-table__subtitle s-font-note">State by state breakdown</div><table class="q-table__table"><thead class="s-font-note s-font-note--strong"><th class="q-table__cell q-table-cell--head q-table__cell--text"></th><th class="q-table__cell q-table-cell--head q-table__cell--numeric">2016</th><th class="q-table__cell q-table-cell--head q-table__cell--numeric">2017</th><th class="q-table__cell q-table-cell--head q-table__cell--numeric"colspan="2"id="q-table-minibar-header">+/- %</th></thead><tbody class="s-font-note"><tr><td data-label=" "class="q-table__cell q-table__cell--text q-table-col-footnotes-cardlayout-single">Auftragseingang</td><td data-label="2016 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">10 375</td><td data-label="2017 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">10 989</td><td class="q-table-minibar-cell"data-minibar="negative"style="padding-left: 12px; padding-right: 0px !important;"><div data-minibar-type="bar"class="q-table-minibar-bar--negative s-viz-color-one-5"style="width: 46.15384615384615%;background-color:;"></div></td><td data-label="+/- % "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single q-table-minibar-cell--value"data-minibar="negative"data-minibar-type="value"style="padding-right: 12px;">-6</td></tr><tr><td data-label=" "class="q-table__cell q-table__cell--text q-table-col-footnotes-cardlayout-single">Umsatz</td><td data-label="2016 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">9683</td><td data-label="2017 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">10 178</td><td class="q-table-minibar-cell"data-minibar="negative"style="padding-left: 12px; padding-right: 0px !important;"><div data-minibar-type="bar"class="q-table-minibar-bar--negative s-viz-color-one-5"style="width: 38.46153846153846%;background-color:;"></div></td><td data-label="+/- % "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single q-table-minibar-cell--value"data-minibar="negative"data-minibar-type="value"style="padding-right: 12px;">-5</td></tr><tr><td data-label=" "class="q-table__cell q-table__cell--text q-table-col-footnotes-cardlayout-single">Ebit-Mage (%)</td><td data-label="2016 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">11,7</td><td data-label="2017 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">11,7</td><td class="q-table-minibar-cell"data-minibar="negative"style="padding-left: 12px; padding-right: 0px !important;"><div data-minibar-type="bar"class="q-table-minibar-bar--empty s-viz-color-one-5"></div></td><td data-label=\"+/- % \"class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single q-table-minibar-cell--value"data-minibar="negative"data-minibar-type="value"style="padding-right: 12px;">-</td></tr><tr><td data-label=" "class="q-table__cell q-table__cell--text q-table-col-footnotes-cardlayout-single">Cashflow aus Geschäftstätigkeite</td><td data-label="2016 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">929</td><td data-label="2017 "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single">810</td><td class="q-table-minibar-cell"data-minibar="negative"style="padding-left: 12px; padding-right: 0px !important;"><div data-minibar-type="bar"class="q-table-minibar-bar--negative s-viz-color-one-5"style="width: 100%;background-color:;"></div></td><td data-label="+/- % "class="q-table__cell q-table__cell--numeric q-table-col-footnotes-cardlayout-single q-table-minibar-cell--value"data-minibar="negative"data-minibar-type="value"style="padding-right: 12px;">-13</td></tr></tbody></table><div class="s-q-item__footer">Quelle: The Centers for Disease Control and Prevention</div></div>`;

    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-negative.json"),
        toolRuntimeConfig: {}
      }
    });

    const html = response.result.markup.replace(
      /(?<=q_table_someid_)[\w+.-]+/,
      ""
    );

    const resultResp = minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeTagWhitespace: true,
      useShortDoctype: true
    });

    expect(resultResp).to.be.equals(workingMinibarsMarkup);
  });

  it("shows the same markup for mixed minibars", async () => {
    const workingMinibarsMarkup = `<div class="s-q-item q-table"id="q_table_someid_"style="opacity: 0;"><h3 class="s-q-item__title">FIXTURE: minibars with positive and negative values</h3><div class="q-table__subtitle s-font-note">State by state breakdown</div><table class="q-table__table"><thead class="s-font-note s-font-note--strong"><th class="q-table__cell q-table-cell--head q-table__cell--text"></th><th class="q-table__cell q-table-cell--head q-table__cell--numeric">2016</th><th class="q-table__cell q-table-cell--head q-table__cell--numeric">2017</th><th class="q-table__cell q-table-cell--head q-table__cell--numeric"id="q-table-minibar-header">+/- %</th></thead><tbody class="s-font-note"><tr><td data-label=" "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--positive q-table__cell--text">Auftragseingang</td><td data-label="2016 "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--positive q-table__cell--numeric">10 375</td><td data-label="2017 "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--positive q-table__cell--numeric">10 989</td><td data-label="+/- % "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--positive q-table-minibar--positive"><div data-minibar="positive"data-minibar-type="value"class="q-table-minibar-alignment--positive q-table__cell q-table__cell--numeric">6</div><div data-minibar="positive"data-minibar-type="bar"class="q-table-minibar-bar--positive q-table-minibar--positive s-viz-color-diverging-2-2"style="width: 23.076923076923077%;background-color:;"></div></td></tr><tr><td data-label=" "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--positive q-table__cell--text">Umsatz</td><td data-label="2016 "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--positive q-table__cell--numeric">9683</td><td data-label="2017 "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--positive q-table__cell--numeric">10 178</td><td data-label="+/- % "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--positive q-table-minibar--positive"><div data-minibar="positive"data-minibar-type="value"class="q-table-minibar-alignment--positive q-table__cell q-table__cell--numeric">5</div><div data-minibar="positive"data-minibar-type="bar"class="q-table-minibar-bar--positive q-table-minibar--positive s-viz-color-diverging-2-2"style="width: 19.23076923076923%;background-color:;"></div></td></tr><tr><td data-label=" "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--empty q-table__cell--text">Ebit-Mage (%)</td><td data-label="2016 "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--empty q-table__cell--numeric">11,7</td><td data-label="2017 "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--empty q-table__cell--numeric">11,7</td><td data-label="+/- % "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--empty q-table-minibar--empty"><div data-minibar="empty"data-minibar-type="value"class="q-table-minibar-alignment--empty q-table__cell q-table__cell--numeric">-</div></td></tr><tr><td data-label=" "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--negative q-table__cell--text">Cashflow aus Geschäftstätigkeite</td><td data-label="2016 "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--negative q-table__cell--numeric">929</td><td data-label="2017 "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--negative q-table__cell--numeric">810</td><td data-label="+/- % "data-minibar="mixed"class="q-table__cell q-table-col-footnotes-cardlayout-single q-table-minibar--negative q-table-minibar--negative"><div data-minibar="negative"data-minibar-type="value"class="q-table-minibar-alignment--negative q-table__cell q-table__cell--numeric">-13</div><div data-minibar="negative"data-minibar-type="bar"class="q-table-minibar-bar--negative q-table-minibar--negative s-viz-color-diverging-2-1"style="width: 50%;background-color:;"></div></td></tr></tbody></table><div class="s-q-item__footer">Quelle: The Centers for Disease Control and Prevention</div></div>`;
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-mixed.json"),
        toolRuntimeConfig: {}
      }
    });

    const html = response.result.markup.replace(
      /(?<=q_table_someid_)[\w+.-]+/,
      ""
    );

    const resultResp = minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeTagWhitespace: true,
      useShortDoctype: true
    });

    expect(resultResp).to.be.equals(workingMinibarsMarkup);
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
        index: footnote.childNodes[1].innerHTML.replace("\n        ", ""),
        text: footnote.childNodes[2].innerHTML.replace("\n        ", "")
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

  it("shows annotation of footnotes in header of cardlayout", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/display-footnotes-in-cardlayout.json"),
        toolRuntimeConfig: {}
      }
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll("td");

    const footnoteOne = decodeURI(
      annotations[0].getAttribute("data-label").split(" ")[1]
    );
    const footnoteTwo = decodeURI(
      annotations[1].getAttribute("data-label").split(" ")[1]
    );

    expect(footnoteOne).to.be.equal("\u00b9");
    expect(footnoteTwo).to.be.equal("\u00b2");
  });

  it("hides footnotes because header is hidden", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hide-footnotes-in-header.json"),
        toolRuntimeConfig: {}
      }
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll(
      ".q-table-annotation"
    );

    const footnoteIndexes = dom.window.document.querySelectorAll(
      ".q-table-footnote-index"
    );

    expect(annotations[0].innerHTML.replace("\n        ", "")).to.be.equal("1");
    expect(footnoteIndexes[0].innerHTML.replace("\n        ", "")).to.be.equal(
      "1"
    );
    expect(annotations.length).to.be.equal(6);
    expect(footnoteIndexes.length).to.be.equal(6);
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
    expect(annotations).to.be.equal(12);
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
    expect(annotations).to.be.equal(12);
  });

  it("displays a bigger margin in column when table has footnotes and cardlayout ", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/display-footnotes-in-cardlayout.json"),
        toolRuntimeConfig: {}
      }
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll(
      ".q-table-col-footnotes-cardlayout-single"
    ).length;
    expect(annotations).to.be.equal(20);
  });

  it("displays the margin correctly when table has positive minibars", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/footnotes-positive-minibars.json"),
        toolRuntimeConfig: {}
      }
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll(
      ".q-table-col-footnotes-single"
    ).length;
    expect(annotations).to.be.equals(16);
  });

  it("displays the margin correctly when table has negative minibars", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/footnotes-negative-minibars.json"),
        toolRuntimeConfig: {}
      }
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll(
      ".q-table-col-footnotes-single"
    ).length;
    expect(annotations).to.be.equals(16);
  });

  it("displays the margin correctly when table has mixed minibars", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/footnotes-mixed-minibars.json"),
        toolRuntimeConfig: {}
      }
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll(
      ".q-table-col-footnotes-single"
    ).length;
    expect(annotations).to.be.equals(18);
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
