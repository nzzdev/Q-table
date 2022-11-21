import Hapi from '@hapi/hapi';
import { JSDOM } from 'jsdom';
import Joi from 'joi';
import type { AvailabilityResponseObject, RenderingInfo, ToolRuntimeConfigSize } from '../src/interfaces';

// We have to ignore because this files does 'not' exists until it's build.
// But we only run tests against the final build of the app to make sure we
// have a prod version that we are testing.
// @ts-ignore
import routes from '../dist/routes.js';
export function createServer() {
  let server: Hapi.Server;

  // Start the server before the tests.
  beforeAll(() => {
    try {
      server = Hapi.server({
        port: process.env.PORT || 3000,
      });
      server.validator(Joi);
      server.route(routes);
    } catch (err) {
      expect(err).not.toBeDefined();
    }
  });

  // Destroy server after tests.
  afterAll(async () => {
    await server.stop({ timeout: 2000 });

    // @ts-ignore.
    server = null;
  });

  return () =>  {
    // console.log('WHYY', server);
    return server;
  }

}
export function createMarkupWithScript(response: Hapi.ServerInjectResponse): string {
  const markup = getMarkup(response.result);
  const scripts = getScripts(response.result);

  let newHtml = `
    ${markup}
  `;

  scripts.forEach(script => {
    newHtml += `<script>${script.content}</script>`;
  });

  return newHtml;
}

export function getMarkup(result: object | undefined): string {
  const casted = result as RenderingInfo;
  return casted.markup;
}

export function getScripts(result: object | undefined): { content: string }[] {
  const casted = result as RenderingInfo;
  return casted.scripts;
}

export function getStylesheets(result: object | undefined): { name: string }[] {
  const casted = result as RenderingInfo;
  return casted.stylesheets;
}

export function getAvailabilityResponse(result: object | undefined): boolean {
  const casted = result as AvailabilityResponseObject;
  return casted.available;
}


export function element(markup: string, selector: string): Promise<HTMLElement> {
  return new Promise(resolve => {
    const dom = createDOM(markup);

    // We cast it because if it does not exist the test will simply crash.
    // Much easier for writing tests this way.
    const el = dom.window.document.querySelector(selector) as HTMLElement;
    resolve(el);
  });
}

export function elements(markup: string, selector: string): Promise<NodeListOf<HTMLElement>> {
  return new Promise(resolve => {
    const dom = createDOM(markup);

    // We cast it because if it does not exist the test will simply crash.
    // Much easier for writing tests this way.
    const els = dom.window.document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
    resolve(els);
  });
}

export function elementCount(markup: string, selector: string): Promise<number> {
  return new Promise(resolve => {
    const dom = createDOM(markup);
    resolve(dom.window.document.querySelectorAll(selector).length);
  });
}

export function createDOM(markup: string): JSDOM {
  return new JSDOM(markup, { runScripts: 'dangerously' });
}

export function getSizeObjectForToolRuntimeConfig(width: number): ToolRuntimeConfigSize {
  return {
    width: [{ value: width, unit: 'px', comparison: '=' }],
  };
}

export function getArticleWidthSizeForToolRuntimeConfig(): ToolRuntimeConfigSize {
  return getSizeObjectForToolRuntimeConfig(500);
}

export function getFullWidthSizeForToolRuntimeConfig(): ToolRuntimeConfigSize {
  return getSizeObjectForToolRuntimeConfig(800);
}

export function cardLayoutSizeObjectForToolRuntimeConfig(): ToolRuntimeConfigSize {
  return getSizeObjectForToolRuntimeConfig(400);
}
