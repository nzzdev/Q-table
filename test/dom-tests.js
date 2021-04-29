const Lab = require("@hapi/lab");
const Code = require("@hapi/code");
const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi");
const lab = (exports.lab = Lab.script());
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const minify = require("html-minifier").minify;

const expect = Code.expect;
const before = lab.before;
const after = lab.after;
const it = lab.it;

const routes = require("../routes/routes.js");
const { row } = require("array2d");
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

function element(markup, selector) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelector(selector));
  });
}

function elements(markup, selector) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelectorAll(selector));
  });
}

function elementCount(markup, selector) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelectorAll(selector).length);
  });
}

lab.experiment("column headers", () => {
  it("shows column headers", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/four-column.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(response.result.markup, ".q-table-cell--head").then(
      (value) => {
        expect(value).to.be.equal(4);
      }
    );
  });

  it("doesn't show column headers", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/four-column-no-header.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(response.result.markup, ".q-table-cell--head").then(
      (value) => {
        expect(value).to.be.equal(0);
      }
    );
  });
});

lab.experiment("cell values", () => {
  it("should display special characters as text", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/special-characters.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(response.result.markup, ".q-table__cell--text").then(
      (value) => {
        expect(value).to.be.equals(32);
      }
    );
  });

  it("should display > 10000 show formatted", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/formatted-numbers.json"),
        toolRuntimeConfig: {},
      },
    });

    elements(response.result.markup, ".q-table__cell--numeric").then(
      (elements) => {
        elements.forEach((element) => {
          expect(element.innerHTML.includes(" ")).to.be.equals(true);
        });
      }
    );
  });

  it("should display < -10000 show formatted", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/formatted-numbers-negative.json"),
        toolRuntimeConfig: {},
      },
    });

    elements(response.result.markup, ".q-table__cell--numeric").then(
      (elements) => {
        elements.forEach((element) => {
          expect(element.innerHTML.includes(" ")).to.be.equals(true);
        });
      }
    );
  });

  it("should display > 1000 when column contains >10000", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/formatted-numbers-mixed.json"),
        toolRuntimeConfig: {},
      },
    });

    elements(response.result.markup, ".q-table__cell--numeric").then(
      (elements) => {
        elements.forEach((element) => {
          expect(element.innerHTML.includes(" ")).to.be.equals(true);
        });
      }
    );
  });
});

lab.experiment("cardlayout", () => {
  it("shows the cardlayout in mobile width", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/cardlayout.json"),
        toolRuntimeConfig: { size: { width: [350, "<"] } },
      },
    });

    elementCount(response.result.markup, ".q-table--card-layout").then(
      (value) => {
        expect(value).to.be.equal(1);
      }
    );
  });
  it("shows the cardlayout in article width", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/cardlayout.json"),
        toolRuntimeConfig: { size: { width: [500, ">"] } },
      },
    });

    elementCount(response.result.markup, ".q-table--card-layout").then(
      (value) => {
        expect(value).to.be.equal(1);
      }
    );
  });
  it("shows the cardlayout in full width", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/cardlayout.json"),
        toolRuntimeConfig: { size: { width: [800, ">"] } },
      },
    });

    elementCount(response.result.markup, ".q-table--card-layout").then(
      (value) => {
        expect(value).to.be.equal(1);
      }
    );
  });
});

lab.experiment("cardlayout on mobile", () => {
  it("shows the cardlayout in mobile width", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/cardlayout-mobile.json"),
        toolRuntimeConfig: { size: { width: [400, "<"] } },
      },
    });

    expect(
      response.result.scripts[1].content.includes("applyCardLayoutClass")
    ).to.be.equal(true);
  });
  it("doesn't show the cardlayout in article width", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/cardlayout-mobile.json"),
        toolRuntimeConfig: { size: { width: [500, ">"] } },
      },
    });

    expect(
      response.result.scripts[1].content.includes("applyCardLayoutClass")
    ).to.be.equal(true);
  });
  it("doesn't show the cardlayout in full width", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/cardlayout-mobile.json"),
        toolRuntimeConfig: { size: { width: [800, ">"] } },
      },
    });
    expect(
      response.result.scripts[1].content.includes("applyCardLayoutClass")
    ).to.be.equal(true);
  });
});

lab.experiment("minibars", () => {
  it("shows table correctly when no minibar-options", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/four-column.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(response.result.markup, "td").then((value) => {
      expect(value).to.be.equal(28);
    });
  });

  it("uses correct cell type", async () => {

    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-negative.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(response.result.markup, "td.q-table-minibar-cell").then(
      (value) => {
        expect(value).to.be.equal(4);
      }
    );
  });

  it("uses the negative bar type", async () => {

    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-negative.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(response.result.markup, "div.q-table-minibar-bar--negative").then(
      (value) => {
        expect(value).to.be.equal(3);
      }
    );
  });

  it("shows negative bar and number", async () => {

    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-negative.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(response.result.markup, "td.q-table-minibar-cell").then(
      (value) => {
        expect(value).to.be.equal(4);
      }
    );

    elementCount(response.result.markup, "td.q-table-minibar-cell--value").then(
      (value) => {
        expect(value).to.be.equal(4);
      }
    );
  });

  it("shows the correct negative bar length", async () => {

    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-negative.json"),
        toolRuntimeConfig: {},
      },
    });

    const dom = new JSDOM(response.result.markup);
    const bars = dom.window.document.querySelectorAll(
      "div.q-table-minibar-bar--negative"
    );

    let widths = []
    bars.forEach((bar) => {
      const regex = /\s*width\s*:\s*([^;"]*)/;
      let width = bar.outerHTML.match(regex)
      widths = [...widths, width[1]];
    });

    expect(widths).to.be.equals(['46.15384615384615%', '38.46153846153846%', '100%'])
  });

  it("uses the positive bar type", async () => {

    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-positive.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(response.result.markup, "div.q-table-minibar-bar--positive").then(
      (value) => {
        expect(value).to.be.equal(3);
      }
    );
  });

  it("uses the positive number and bar", async () => {

    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-positive.json"),
        toolRuntimeConfig: {},
      },
    });


    elementCount(response.result.markup, "td.q-table-minibar-cell--value").then(
      (value) => {
        expect(value).to.be.equal(4);
      }
    );


    elementCount(response.result.markup, "td.q-table-minibar-cell").then(
      (value) => {
        expect(value).to.be.equal(4);
      }
    );
  });

  it("show the corrent positive bar length", async () => {

    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-positive.json"),
        toolRuntimeConfig: {},
      },
    });

    const dom = new JSDOM(response.result.markup);
    const bars = dom.window.document.querySelectorAll(
      "div.q-table-minibar-bar--positive"
    );

    let widths = []
    bars.forEach((bar) => {
      const regex = /\s*width\s*:\s*([^;"]*)/;
      let width = bar.outerHTML.match(regex)
      widths = [...widths, width[1]];
    });

    expect(widths).to.be.equals(['46.15384615384615%', '38.46153846153846%', '100%'])
  });

  it("uses the mixed cell type", async () => {

    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-mixed.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(response.result.markup, "td.q-table-minibar--mixed").then(
      (value) => {
        expect(value).to.be.equal(4);
      }
    );
  });

  it("shows mixed number and bar", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-mixed.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(response.result.markup, ".q-table-minibar-alignment--positive")
      .then((value) => {
        expect(value).to.be.equal(2);
      });

    elementCount(response.result.markup, ".q-table-minibar-bar--positive")
      .then((value) => {
        expect(value).to.be.equal(2);
      });

    elementCount(response.result.markup, ".q-table-minibar-alignment--negative")
      .then((value) => {
        expect(value).to.be.equal(1);
      });

    elementCount(response.result.markup, ".q-table-minibar-bar--negative")
      .then((value) => {
        expect(value).to.be.equal(1);
      });

    elementCount(response.result.markup, ".q-table-minibar-alignment--empty")
      .then((value) => {
        expect(value).to.be.equal(1);
      });

  });

  it("show the corrent mixed bar length", async () => {

    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-positive.json"),
        toolRuntimeConfig: {},
      },
    });

    const dom = new JSDOM(response.result.markup);
    const positiveBars = dom.window.document.querySelectorAll(
      "div.q-table-minibar-bar--positive"
    );

    const negativeBars = dom.window.document.querySelectorAll(
      "div.q-table-minibar-bar--negative"
    );

    let widths = []
    const regex = /\s*width\s*:\s*([^;"]*)/;

    positiveBars.forEach((bar) => {
      let width = bar.outerHTML.match(regex)
      widths = [...widths, width[1]];
    });

    negativeBars.forEach((bar) => {
      let width = bar.outerHTML.match(regex)
      widths = [...widths, width[1]];
    });

    expect(widths).to.be.equals(['46.15384615384615%', '38.46153846153846%', '100%'])
  });

})

lab.experiment("footnotes", () => {
  it("shows annotations for footnotes in table numbering downwords", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/display-footnotes.json"),
        toolRuntimeConfig: {},
      },
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll(
      "span.q-table-footnote-annotation"
    );

    let annotationIndexes = [];

    annotations.forEach((annotation) => {
      annotationIndexes.push(annotation.dataset.annotation);
    });

    expect(annotationIndexes).to.be.equal(["1", "2", "3", "4"]);
  });

  it("shows text of footnotes in footer of table with right index", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/display-footnotes.json"),
        toolRuntimeConfig: {},
      },
    });

    const dom = new JSDOM(response.result.markup);
    const footnotes = dom.window.document.querySelectorAll(
      "div.q-table-footnote-footer"
    );

    let arrayOfFootnotes = [];

    footnotes.forEach((footnote) => {
      arrayOfFootnotes.push({
        index: footnote.childNodes[1].innerHTML.replace("\n        ", ""),
        text: footnote.childNodes[2].innerHTML.replace("\n        ", ""),
      });
    });

    expect(arrayOfFootnotes).to.be.equal([
      {
        index: "1",
        text: "Frisch verheiratet, früher Hanspeter Mustermann",
      },
      {
        index: "2",
        text: "Verhalten in letzter Spalte",
      },
      {
        index: "3",
        text: "Frisch verheiratet, früher Peter Vorderbach",
      },
      {
        index: "4",
        text: "Frisch verheiratet, früher Ralf Hinterbach",
      },
    ]);
  });

  it("shows merged footnotes in footer of table with right index", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/display-merged-footnotes.json"),
        toolRuntimeConfig: {},
      },
    });

    const dom = new JSDOM(response.result.markup);
    const footnotes = dom.window.document.querySelectorAll(
      "div.q-table-footnote-footer"
    );

    let arrayOfFootnotes = [];

    footnotes.forEach((footnote) => {
      arrayOfFootnotes.push({
        index: footnote.childNodes[1].innerHTML.replace("\n        ", ""),
        text: footnote.childNodes[2].innerHTML.replace("\n        ", ""),
      });
    });

    expect(arrayOfFootnotes).to.be.equal([
      {
        index: "1",
        text: "Frisch verheiratet, früher Hanspeter Mustermann",
      },
    ]);
  });

  it("shows multiple merged footnotes in footer of table with right index", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/display-merged-footnotes-multiple.json"),
        toolRuntimeConfig: {},
      },
    });

    const dom = new JSDOM(response.result.markup);
    const footnotes = dom.window.document.querySelectorAll(
      "div.q-table-footnote-footer"
    );

    let arrayOfFootnotes = [];

    footnotes.forEach((footnote) => {
      arrayOfFootnotes.push({
        index: footnote.childNodes[1].innerHTML.replace("\n        ", ""),
        text: footnote.childNodes[2].innerHTML.replace("\n        ", ""),
      });
    });

    expect(arrayOfFootnotes).to.be.equal([
      {
        index: "1",
        text: "Frisch verheiratet, früher Hanspeter Mustermann",
      },
      {
        index: "2",
        text: "Frisch verheiratet, früher Hanspeter Musterfrau",
      },
    ]);
  });

  it("shows annotation of footnotes in header of cardlayout", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/display-footnotes-in-cardlayout.json"),
        toolRuntimeConfig: {},
      },
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll("td");

    const footnoteOne = decodeURI(
      annotations[0].getAttribute("data-label").split("Rank")[1]
    );
    const footnoteTwo = decodeURI(
      annotations[1].getAttribute("data-label").split("Name")[1]
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
        toolRuntimeConfig: {},
      },
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll(
      ".q-table-footnote-annotation"
    );

    const footnoteIndexes = dom.window.document.querySelectorAll(
      ".q-table-footnote-index"
    );

    expect(annotations[0].innerHTML.replace("\n    ", "")).to.be.equal("1");
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
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-footnote-column--single"
    ).then((value) => {
      expect(value).to.be.equal(12);
    });
  });

  it("displays a even bigger padding in column with footnotes with there are more than 9", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/display-alot-of-footnotes.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-footnote-column--double"
    ).then((value) => {
      expect(value).to.be.equal(12);
    });
  });

  it("displays a bigger margin in column when table has footnotes and cardlayout ", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/display-footnotes-in-cardlayout.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-footnote-column-card-layout--single"
    ).then((value) => {
      expect(value).to.be.equal(20);
    });
  });

  it("displays the margin correctly when table has positive minibars", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/footnotes-positive-minibars.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-footnote-column--single"
    ).then((value) => {
      expect(value).to.be.equal(16);
    });
  });

  it("displays the margin correctly when table has negative minibars", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/footnotes-negative-minibars.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-footnote-column--single"
    ).then((value) => {
      expect(value).to.be.equal(16);
    });
  });

  it("displays the margin correctly when table has mixed minibars", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/footnotes-mixed-minibars.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-footnote-column--single"
    ).then((value) => {
      expect(value).to.be.equal(18);
    });
  });

  it("behaves correctly with other metaData in cells", async () => {
    let item = require("../resources/fixtures/data/display-footnotes.json");
    item.data.metaData.cells = [
      {
        data: {
          test: "test",
        },
        rowIndex: 1,
        colIndex: 2,
      },
      {
        data: {
          test1: "test1",
        },
        rowIndex: 2,
        colIndex: 1,
      },
      {
        data: {
          test2: "test2",
        },
        rowIndex: 3,
        colIndex: 1,
      },
      {
        data: {
          footnote: "test3",
          multipleData: true,
        },
        rowIndex: 4,
        colIndex: 1,
      },
    ];
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: item,
        toolRuntimeConfig: {},
      },
    });

    const dom = new JSDOM(response.result.markup);
    const annotations = dom.window.document.querySelectorAll(
      "span.q-table-footnote-annotation"
    );
    let annotationIndexes = [];
    annotations.forEach((annotation) => {
      annotationIndexes.push(annotation.dataset.annotation);
    });

    expect(annotationIndexes).to.be.equal(["1"]);
    expect(response.statusCode).to.be.equal(200);
  });

  it("displays the footnote when the table has colorColumn (numerical)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/colorColumn-numerical-footnotes.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-footnote-column--single"
    ).then((value) => {
      expect(value).to.be.equal(7);
    });

    elementCount(
      response.result.markup,
      ".q-table-footnote-annotation--colorColumn"
    ).then((value) => {
      expect(value).to.be.equal(1);
    });

  })

  it("displays the footnote when the table has colorColumn (categorical)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/colorColumn-categorical-footnotes.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-footnote-column--single"
    ).then((value) => {
      expect(value).to.be.equal(7);
    });

    elementCount(
      response.result.markup,
      ".q-table-footnote-annotation--colorColumn"
    ).then((value) => {
      expect(value).to.be.equal(1);
    });
  })
});

lab.experiment("table search", () => {
  it("shows table search", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/table-search-show.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(response.result.markup, ".q-table__search__input").then(
      (value) => {
        expect(value).to.be.equal(1);
      }
    );
  });

  it("doesn't show table search", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/table-search-hidden.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(response.result.markup, ".q-table__search__input").then(
      (value) => {
        expect(value).to.be.equal(0);
      }
    );
  });

  it("doesn't show table search if property is true but not enough elements", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hyphen-sign-as-number.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(response.result.markup, ".q-table__search__input").then(
      (value) => {
        expect(value).to.be.equal(0);
      }
    );
  })
});

lab.experiment("color column", () => {
  it("displays the numerical legend", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/colorColumn-numerical.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-colorColumn-legend--numerical"
    ).then((value) => {
      expect(value).to.be.equal(1);
    });
  })

  it("displays the correct amount of buckets", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/colorColumn-numerical.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-colorColumn-legend .q-table-colorColumn-legend-bucket"
    ).then((value) => {
      expect(value).to.be.equal(5);
    });
  })

  it("displays label legend", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/colorColumn-numerical.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-colorColumn-legend-marker"
    ).then((value) => {
      expect(value).to.be.equal(1);
    });
  })

  it("doesnt display label legend", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/colorColumn-numerical-no-label.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-colorColumn-legend-marker"
    ).then((value) => {
      expect(value).to.be.equal(0);
    });
  })

  it("displays no-data in legend", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/colorColumn-numerical-no-data.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-colorColumn-legend-info--no-data"
    ).then((value) => {
      expect(value).to.be.equal(1);
    });
  })

  it("doesn't displays no-data in legend", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/colorColumn-numerical-no-label.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-colorColumn-legend-info--no-data"
    ).then((value) => {
      expect(value).to.be.equal(0);
    });
  })

  it("displays single-bucket in legend", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/colorColumn-numerical-no-data.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-colorColumn-legend-info--single-bucket"
    ).then((value) => {
      expect(value).to.be.equal(1);
    });
  })

  it("displays the categorical legend", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/colorColumn-categorical.json"),
        toolRuntimeConfig: {},
      },
    });

    elementCount(
      response.result.markup,
      ".q-table-colorColumn-legend--categorical"
    ).then((value) => {
      expect(value).to.be.equal(1);
    });
  })

  it("displays buckets in custonm color (numerical)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/colorColumn-numerical-custom-colors.json"),
        toolRuntimeConfig: {},
      },
    });

    element(response.result.markup, ".q-table-colorColumn-legend-info--single-bucket .q-table-colorColumn-legend-bucket").then(
      (elem) => {
        expect(elem.style["color"]).to.be.equal("yellow");
      }
    );
  })

  it("displays buckets in custonm order (categorical)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/colorColumn-categorical-custom-order.json"),
        toolRuntimeConfig: {},
      },
    });

    elements(response.result.markup, ".q-table-colorColumn-legend--categorical .s-legend-item-label__item__label").then(
      (elements) => {
        expect(elements[0].innerHTML).to.be.equal("Test1");
        expect(elements[1].innerHTML).to.be.equal("Test2");
      }
    );
  })

  it("displays buckets in custonm color (categorical)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/colorColumn-categorical-custom-colors.json"),
        toolRuntimeConfig: {},
      },
    });

    elements(response.result.markup, ".q-table-colorColumn-legend--categorical .s-legend-item-label__item").then(
      (elements) => {
        expect(elements[0].style["color"]).to.be.equal("pink");
        expect(elements[1].style["color"]).to.be.equal("lightblue");
      }
    );
  })
})