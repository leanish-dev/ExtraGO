declare const __BUILD_TIME__: string;

export const SERVER_BUILD_TIME: number =
  typeof __BUILD_TIME__ !== "undefined"
    ? new Date(__BUILD_TIME__).getTime()
    : Date.now();

export const SERVER_BUILD_ISO: string =
  typeof __BUILD_TIME__ !== "undefined"
    ? __BUILD_TIME__
    : new Date().toISOString();
