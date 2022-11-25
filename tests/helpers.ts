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

export function element(response: Hapi.ServerInjectResponse, selector: string): Promise<HTMLElement> {
  return new Promise(resolve => {
    const dom = createDOM(response);

    // We cast it because if it does not exist the test will simply crash.
    // Much easier for writing tests this way.
    const el = dom.window.document.querySelector(selector) as unknown as HTMLElement;
    resolve(el);
  });
}

export function elements(response: Hapi.ServerInjectResponse, selector: string): Promise<NodeListOf<HTMLElement>> {
  return new Promise(resolve => {
    const dom = createDOM(response);

    // We cast it because if it does not exist the test will simply crash.
    // Much easier for writing tests this way.
    const els = dom.window.document.querySelectorAll(selector) as unknown as NodeListOf<HTMLElement>;
    resolve(els);
  });
}

export function elementCount(response: Hapi.ServerInjectResponse, selector: string): Promise<number | null> {
  return new Promise(resolve => {
    try {
      const dom = createDOM(response);
      const elementsFound = dom.window.document.querySelectorAll(selector);
      resolve(elementsFound.length);

    } catch (e: any) {
      console.error(e.message);
      resolve(null);
    }
  });
}

export function createDOM(response: Hapi.ServerInjectResponse): JSDOM {
  const markup = createMarkupWithScript(response);

  return new JSDOM(markup, { resources: 'usable', runScripts: 'dangerously' });
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
