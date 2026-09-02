// Polyfill DOMException BEFORE any library imports (axios, expo-router, etc)
if (typeof globalThis !== 'undefined' && typeof globalThis.DOMException === 'undefined') {
  globalThis.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'DOMException';
    }
  };
}

import 'expo-router/entry';
