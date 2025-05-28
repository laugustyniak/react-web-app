import type { AppLoadContext, EntryContext } from 'react-router';
import { renderToString } from 'react-dom/server';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
  loadContext: AppLoadContext
) {
  // For React Router v7, the framework provides the rendered content in entryContext
  const markup = renderToString(entryContext.appShell);

  responseHeaders.set('Content-Type', 'text/html');

  return new Response('<!DOCTYPE html>' + markup, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
