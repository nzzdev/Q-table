import { JSDOM } from 'jsdom';
import type { AvailabilityResponseObject, RenderingInfo } from '../src/interfaces';

export function getMarkup(result: object | undefined): string {
  const casted = result as RenderingInfo;
  return casted.markup;
}

export function getScripts(result: object | undefined): {content: string}[] {
  const casted = result as RenderingInfo;
  return casted.scripts;
}

export function getStylesheets(result: object | undefined): {name: string}[] {
  const casted = result as RenderingInfo;
  return casted.stylesheets;
}

export function getAvailabilityResponse(result: object | undefined): boolean {
  const casted = result as AvailabilityResponseObject;
  return casted.available;
}

export function element(markup: string, selector: string): Promise<HTMLElement> {
  return new Promise((resolve) => {
    const dom = new JSDOM(markup);

    // We cast it because if it does not exist the test will simply crash.
    // Much easier for writing tests this way.
    const el = dom.window.document.querySelector(selector) as HTMLElement;
    resolve(el);
  });
}

export function elements(markup: string, selector: string): Promise<NodeListOf<HTMLElement>> {
  return new Promise((resolve) => {
    const dom = new JSDOM(markup);

    // We cast it because if it does not exist the test will simply crash.
    // Much easier for writing tests this way.
    const els = dom.window.document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
    resolve(els);
  });
}

export function elementCount(markup: string, selector: string): Promise<number> {
  return new Promise((resolve) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelectorAll(selector).length);
  });
}
