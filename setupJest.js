import { TextEncoder, TextDecoder } from 'util'

global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));

// Fixing a missing api issue with JSDOM.
Object.defineProperty(window, 'TextEncoder', {
  writable: true,
  value: TextEncoder
});

Object.defineProperty(window, 'TextDecoder', {
  writable: true,
  value: TextDecoder
});
