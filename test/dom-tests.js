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

    return elementCount(response.result.markup, ".q-table-cell--head").then(
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

    return elementCount(response.result.markup, ".q-table-cell--head").then(
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

    return elementCount(response.result.markup, ".q-table__cell--text").then(
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

    return elements(response.result.markup, ".q-table__cell--numeric").then(
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

    return elements(response.result.markup, ".q-table__cell--numeric").then(
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

    return elements(response.result.markup, ".q-table__cell--numeric").then(
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

    return elementCount(response.result.markup, ".q-table--card-layout").then(
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

    return elementCount(response.result.markup, ".q-table--card-layout").then(
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

    return elementCount(response.result.markup, ".q-table--card-layout").then(
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
  it("shows the same markup for positive minibars", async () => {
    const workingMinibarsMarkup = `<div class=\"s-q-item q-table\"id=\"q_table_someid_\"style=\"opacity: 0;\"><h3 class=\"s-q-item__title\">FIXTURE: minibars with negative values</h3><div class=\"s-q-item__subtitle\">State by state breakdown</div><div style=\"overflow-x: auto;\"><table class=\"q-table__table\"><thead class=\"s-font-note s-font-note--strong\"><th class=\"q-table__cell q-table-cell--head q-table__cell--text\"></th><th class=\"q-table__cell q-table-cell--head q-table__cell--numeric\">2016</th><th class=\"q-table__cell q-table-cell--head q-table__cell--numeric\">2017</th><th class=\"q-table__cell q-table-cell--head q-table__cell--numeric\"colspan=\"2\"id=\"q-table-minibar-header\">+/- %</th></thead><tbody class=\"s-font-note\"><tr><td data-label=\" \n  \n    \n  \"class=\"q-table__cell q-table__cell--text\">Auftragseingang</td><td data-label=\"2016 \n  \n    \n  \"class=\"q-table__cell q-table__cell--numeric\">10 375</td><td data-label=\"2017 \n  \n    \n  \"class=\"q-table__cell q-table__cell--numeric\">10 989</td><td class=\"q-table-minibar-cell\"data-minibar=\"negative\"style=\"padding-left: 12px; padding-right: 0px !important;\"><div class=\"q-table-minibar-bar--negative s-viz-color-one-5\"style=\"width: 46.15384615384615%; background-color:;\"></div></td><td data-label=\"+/- % \n  \n    \n  \"class=\"q-table__cell q-table__cell--numeric q-table-minibar-cell--value\"data-minibar=\"negative\"style=\"padding-right: 12px;\">–6</td></tr><tr><td data-label=\" \n  \"class=\"q-table__cell q-table__cell--text\">Umsatz</td><td data-label=\"2016 \n  \"class=\"q-table__cell q-table__cell--numeric\">9 683</td><td data-label=\"2017 \n  \"class=\"q-table__cell q-table__cell--numeric\">10 178</td><td class=\"q-table-minibar-cell\"data-minibar=\"negative\"style=\"padding-left: 12px; padding-right: 0px !important;\"><div class=\"q-table-minibar-bar--negative s-viz-color-one-5\"style=\"width: 38.46153846153846%; background-color:;\"></div></td><td data-label=\"+/- % \n  \"class=\"q-table__cell q-table__cell--numeric q-table-minibar-cell--value\"data-minibar=\"negative\"style=\"padding-right: 12px;\">–5</td></tr><tr><td data-label=\" \n  \"class=\"q-table__cell q-table__cell--text\">Ebit-Mage (%)</td><td data-label=\"2016 \n  \"class=\"q-table__cell q-table__cell--numeric\">11,7</td><td data-label=\"2017 \n  \"class=\"q-table__cell q-table__cell--numeric\">11,7</td><td class=\"q-table-minibar-cell\"data-minibar=\"negative\"style=\"padding-left: 12px; padding-right: 0px !important;\"><div class=\"q-table-minibar-bar--empty s-viz-color-one-5\"></div></td><td data-label=\"+/- % \n  \"class=\"q-table__cell q-table__cell--numeric q-table-minibar-cell--value\"data-minibar=\"negative\"style=\"padding-right: 12px;\">-</td></tr><tr><td data-label=\" \n  \"class=\"q-table__cell q-table__cell--text\">Cashflow aus Geschäftstätigkeite</td><td data-label=\"2016 \n  \"class=\"q-table__cell q-table__cell--numeric\">929</td><td data-label=\"2017 \n  \"class=\"q-table__cell q-table__cell--numeric\">810</td><td class=\"q-table-minibar-cell\"data-minibar=\"negative\"style=\"padding-left: 12px; padding-right: 0px !important;\"><div class=\"q-table-minibar-bar--negative s-viz-color-one-5\"style=\"width: 100%; background-color:;\"></div></td><td data-label=\"+/- % \n  \"class=\"q-table__cell q-table__cell--numeric q-table-minibar-cell--value\"data-minibar=\"negative\"style=\"padding-right: 12px;\">–13</td></tr></tbody></table></div><div class=\"s-q-item__footer\">Quelle: The Centers for Disease Control and Prevention</div></div>`;

    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-negative.json"),
        toolRuntimeConfig: {},
      },
    });

    const html = response.result.markup.replace(
      /(?<=q_table_someid_)[\w+.-]+/,
      ""
    );

    const resultResp = minify(html.replace("\n ", ""), {
      collapseWhitespace: true,
      removeComments: true,
      removeTagWhitespace: true,
      useShortDoctype: true,
    });

    expect(resultResp).to.be.equals(workingMinibarsMarkup);
  });

  it("shows the same markup for negative minibars", async () => {
    const workingMinibarsMarkup = `<div class=\"s-q-item q-table\"id=\"q_table_someid_\"style=\"opacity: 0;\"><h3 class=\"s-q-item__title\">FIXTURE: minibars with negative values</h3><div class=\"s-q-item__subtitle\">State by state breakdown</div><div style=\"overflow-x: auto;\"><table class=\"q-table__table\"><thead class=\"s-font-note s-font-note--strong\"><th class=\"q-table__cell q-table-cell--head q-table__cell--text\"></th><th class=\"q-table__cell q-table-cell--head q-table__cell--numeric\">2016</th><th class=\"q-table__cell q-table-cell--head q-table__cell--numeric\">2017</th><th class=\"q-table__cell q-table-cell--head q-table__cell--numeric\"colspan=\"2\"id=\"q-table-minibar-header\">+/- %</th></thead><tbody class=\"s-font-note\"><tr><td data-label=\" \n  \n    \n  \"class=\"q-table__cell q-table__cell--text\">Auftragseingang</td><td data-label=\"2016 \n  \n    \n  \"class=\"q-table__cell q-table__cell--numeric\">10 375</td><td data-label=\"2017 \n  \n    \n  \"class=\"q-table__cell q-table__cell--numeric\">10 989</td><td class=\"q-table-minibar-cell\"data-minibar=\"negative\"style=\"padding-left: 12px; padding-right: 0px !important;\"><div class=\"q-table-minibar-bar--negative s-viz-color-one-5\"style=\"width: 46.15384615384615%; background-color:;\"></div></td><td data-label=\"+/- % \n  \n    \n  \"class=\"q-table__cell q-table__cell--numeric q-table-minibar-cell--value\"data-minibar=\"negative\"style=\"padding-right: 12px;\">–6</td></tr><tr><td data-label=\" \n  \"class=\"q-table__cell q-table__cell--text\">Umsatz</td><td data-label=\"2016 \n  \"class=\"q-table__cell q-table__cell--numeric\">9 683</td><td data-label=\"2017 \n  \"class=\"q-table__cell q-table__cell--numeric\">10 178</td><td class=\"q-table-minibar-cell\"data-minibar=\"negative\"style=\"padding-left: 12px; padding-right: 0px !important;\"><div class=\"q-table-minibar-bar--negative s-viz-color-one-5\"style=\"width: 38.46153846153846%; background-color:;\"></div></td><td data-label=\"+/- % \n  \"class=\"q-table__cell q-table__cell--numeric q-table-minibar-cell--value\"data-minibar=\"negative\"style=\"padding-right: 12px;\">–5</td></tr><tr><td data-label=\" \n  \"class=\"q-table__cell q-table__cell--text\">Ebit-Mage (%)</td><td data-label=\"2016 \n  \"class=\"q-table__cell q-table__cell--numeric\">11,7</td><td data-label=\"2017 \n  \"class=\"q-table__cell q-table__cell--numeric\">11,7</td><td class=\"q-table-minibar-cell\"data-minibar=\"negative\"style=\"padding-left: 12px; padding-right: 0px !important;\"><div class=\"q-table-minibar-bar--empty s-viz-color-one-5\"></div></td><td data-label=\"+/- % \n  \"class=\"q-table__cell q-table__cell--numeric q-table-minibar-cell--value\"data-minibar=\"negative\"style=\"padding-right: 12px;\">-</td></tr><tr><td data-label=\" \n  \"class=\"q-table__cell q-table__cell--text\">Cashflow aus Geschäftstätigkeite</td><td data-label=\"2016 \n  \"class=\"q-table__cell q-table__cell--numeric\">929</td><td data-label=\"2017 \n  \"class=\"q-table__cell q-table__cell--numeric\">810</td><td class=\"q-table-minibar-cell\"data-minibar=\"negative\"style=\"padding-left: 12px; padding-right: 0px !important;\"><div class=\"q-table-minibar-bar--negative s-viz-color-one-5\"style=\"width: 100%; background-color:;\"></div></td><td data-label=\"+/- % \n  \"class=\"q-table__cell q-table__cell--numeric q-table-minibar-cell--value\"data-minibar=\"negative\"style=\"padding-right: 12px;\">–13</td></tr></tbody></table></div><div class=\"s-q-item__footer\">Quelle: The Centers for Disease Control and Prevention</div></div>`;

    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-negative.json"),
        toolRuntimeConfig: {},
      },
    });

    const html = response.result.markup.replace(
      /(?<=q_table_someid_)[\w+.-]+/,
      ""
    );

    const resultResp = minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeTagWhitespace: true,
      useShortDoctype: true,
    });

    expect(resultResp).to.be.equals(workingMinibarsMarkup);
  });

  it("shows the same markup for mixed minibars", async () => {
    const workingMinibarsMarkup = `<div class=\"s-q-item q-table\"id=\"q_table_someid_\"style=\"opacity: 0;\"><h3 class=\"s-q-item__title\">FIXTURE: minibars with positive and negative values</h3><div class=\"s-q-item__subtitle\">State by state breakdown</div><div style=\"overflow-x: auto;\"><table class=\"q-table__table\"><thead class=\"s-font-note s-font-note--strong\"><th class=\"q-table__cell q-table-cell--head q-table__cell--text\"></th><th class=\"q-table__cell q-table-cell--head q-table__cell--numeric\">2016</th><th class=\"q-table__cell q-table-cell--head q-table__cell--numeric\">2017</th><th class=\"q-table__cell q-table-cell--head q-table__cell--numeric\"id=\"q-table-minibar-header\">+/- %</th></thead><tbody class=\"s-font-note\"><tr><td data-label=\" \"data-minibar=\"mixed\"class=\"q-table__cell q-table__cell--text\">Auftragseingang</td><td data-label=\"2016 \"data-minibar=\"mixed\"class=\"q-table__cell q-table__cell--numeric\">10 375</td><td data-label=\"2017 \"data-minibar=\"mixed\"class=\"q-table__cell q-table__cell--numeric\">10 989</td><td data-label=\"+/- % \"data-minibar=\"mixed\"class=\"q-table__cell q-table-minibar--mixed\"><div data-minibar=\"positive\"class=\"q-table-minibar-alignment--positive q-table__cell q-table__cell--numeric\">6</div><div data-minibar=\"positive\"class=\"q-table-minibar-bar--positive q-table-minibar--positive s-viz-color-diverging-2-2\"style=\"width: 23.076923076923077%;background-color:;\"></div></td></tr><tr><td data-label=\" \"data-minibar=\"mixed\"class=\"q-table__cell q-table__cell--text\">Umsatz</td><td data-label=\"2016 \"data-minibar=\"mixed\"class=\"q-table__cell q-table__cell--numeric\">9 683</td><td data-label=\"2017 \"data-minibar=\"mixed\"class=\"q-table__cell q-table__cell--numeric\">10 178</td><td data-label=\"+/- % \"data-minibar=\"mixed\"class=\"q-table__cell q-table-minibar--mixed\"><div data-minibar=\"positive\"class=\"q-table-minibar-alignment--positive q-table__cell q-table__cell--numeric\">5</div><div data-minibar=\"positive\"class=\"q-table-minibar-bar--positive q-table-minibar--positive s-viz-color-diverging-2-2\"style=\"width: 19.23076923076923%;background-color:;\"></div></td></tr><tr><td data-label=\" \"data-minibar=\"mixed\"class=\"q-table__cell q-table__cell--text\">Ebit-Mage (%)</td><td data-label=\"2016 \"data-minibar=\"mixed\"class=\"q-table__cell q-table__cell--numeric\">11,7</td><td data-label=\"2017 \"data-minibar=\"mixed\"class=\"q-table__cell q-table__cell--numeric\">11,7</td><td data-label=\"+/- % \"data-minibar=\"mixed\"class=\"q-table__cell q-table-minibar--mixed\"><div data-minibar=\"empty\"class=\"q-table-minibar-alignment--empty q-table__cell q-table__cell--numeric\">-</div></td></tr><tr><td data-label=\" \"data-minibar=\"mixed\"class=\"q-table__cell q-table__cell--text\">Cashflow aus Geschäftstätigkeite</td><td data-label=\"2016 \"data-minibar=\"mixed\"class=\"q-table__cell q-table__cell--numeric\">929</td><td data-label=\"2017 \"data-minibar=\"mixed\"class=\"q-table__cell q-table__cell--numeric\">810</td><td data-label=\"+/- % \"data-minibar=\"mixed\"class=\"q-table__cell q-table-minibar--mixed\"><div data-minibar=\"negative\"class=\"q-table-minibar-alignment--negative q-table__cell q-table__cell--numeric\">–13</div><div data-minibar=\"negative\"class=\"q-table-minibar-bar--negative q-table-minibar--negative s-viz-color-diverging-2-1\"style=\"width: 50%;background-color:;\"></div></td></tr></tbody></table></div><div class=\"s-q-item__footer\">Quelle: The Centers for Disease Control and Prevention</div></div>`;
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/minibars-mixed.json"),
        toolRuntimeConfig: {},
      },
    });

    const html = response.result.markup.replace(
      /(?<=q_table_someid_)[\w+.-]+/,
      ""
    );

    const resultResp = minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeTagWhitespace: true,
      useShortDoctype: true,
    });

    expect(resultResp).to.be.equals(workingMinibarsMarkup);
  });

  it("shows table correctly when no minibar-options", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/four-column.json"),
        toolRuntimeConfig: {},
      },
    });

    return elementCount(response.result.markup, "td").then((value) => {
      expect(value).to.be.equal(28);
    });
  });
});

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
      "span.q-table-annotation"
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
      "div.q-table-footer-footnote"
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
        text: " Frisch verheiratet, früher Hanspeter Mustermann",
      },
      {
        index: "2",
        text: " Verhalten in letzter Spalte",
      },
      {
        index: "3",
        text: " Frisch verheiratet, früher Peter Vorderbach",
      },
      {
        index: "4",
        text: " Frisch verheiratet, früher Ralf Hinterbach",
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
      "div.q-table-footer-footnote"
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
        text: " Frisch verheiratet, früher Hanspeter Mustermann",
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
      "div.q-table-footer-footnote"
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
        text: " Frisch verheiratet, früher Hanspeter Mustermann",
      },
      {
        index: "2",
        text: " Frisch verheiratet, früher Hanspeter Musterfrau",
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
        toolRuntimeConfig: {},
      },
    });

    return elementCount(
      response.result.markup,
      ".q-table-col-footnotes-single"
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

    return elementCount(
      response.result.markup,
      ".q-table-col-footnotes-double"
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

    return elementCount(
      response.result.markup,
      ".q-table-col-footnotes-cardlayout-single"
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

    return elementCount(
      response.result.markup,
      ".q-table-col-footnotes-single"
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

    return elementCount(
      response.result.markup,
      ".q-table-col-footnotes-single"
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

    return elementCount(
      response.result.markup,
      ".q-table-col-footnotes-single"
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
      "span.q-table-annotation"
    );
    let annotationIndexes = [];
    annotations.forEach((annotation) => {
      annotationIndexes.push(annotation.dataset.annotation);
    });

    expect(annotationIndexes).to.be.equal(["1"]);
    expect(response.statusCode).to.be.equal(200);
  });
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

    return elementCount(response.result.markup, ".search-form-input").then(
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

    return elementCount(response.result.markup, ".search-form-input").then(
      (value) => {
        expect(value).to.be.equal(0);
      }
    );
  });
});