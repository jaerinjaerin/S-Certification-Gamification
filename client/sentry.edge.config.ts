// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  environment: process.env.ENV || "development",
  dsn: "https://8b30784878b623beeb659ac581d38a73@o4508460812599296.ingest.us.sentry.io/4508514964733952",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  beforeSend(event) {
    if (event.request?.url?.includes("localhost")) {
      return null; // 이벤트 무시
    }
    return event; // 이벤트 전송
  },
});
