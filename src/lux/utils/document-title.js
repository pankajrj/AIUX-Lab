const APP_NAME = 'my-app';

export function setDocumentTitle(pageTitle) {
  if (typeof document === 'undefined') return;
  document.title = pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME;
}
