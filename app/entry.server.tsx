import type { AppLoadContext, EntryContext } from 'react-router';
import { renderToString } from 'react-dom/server';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  // For React Router v7, we need to render the app differently
  // The framework handles the routing internally
  const markup = renderToString(
    // React Router v7 handles this internally, we just need to provide the handler
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>React Web App</title>
      </head>
      <body>
        <div id="root" />
      </body>
    </html>
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response('<!DOCTYPE html>' + markup, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
