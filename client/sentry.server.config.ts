// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  environment: process.env.NODE_ENV || "development",
  dsn: "https://8b30784878b623beeb659ac581d38a73@o4508460812599296.ingest.us.sentry.io/4508514964733952",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  beforeSend(event, hint) {
    if (event.request?.url?.includes("localhost")) {
      return null; // 이벤트 무시
    }
    return event;
  },
});
