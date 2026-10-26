export const environment = {
  production: true,
  apiUrl:
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
      ? 'http://localhost:8085'
      : 'https://carbonscope-943871685242.us-central1.run.app',
};
