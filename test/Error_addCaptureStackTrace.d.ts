// V8-specific API available in Node.js/Bun
interface ErrorConstructor {
  captureStackTrace(targetObject: object, constructorOpt?: Function): void;
}
