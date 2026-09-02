// Metro pre-bundle polyfills (runs BEFORE React Native environment setup)
if (typeof globalThis !== 'undefined' && typeof globalThis.DOMException === 'undefined') {
  globalThis.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'DOMException';
    }
  };
}

if (typeof global !== 'undefined' && typeof global.DOMException === 'undefined') {
  global.DOMException = globalThis.DOMException;
}
