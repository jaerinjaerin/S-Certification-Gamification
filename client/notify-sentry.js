const Sentry = require("@sentry/node");

// Sentry 초기화
Sentry.init({
  dsn: "https://8b30784878b623beeb659ac581d38a73@o4508460812599296.ingest.us.sentry.io/4508514964733952",
});

const errorMessage = "PM2 process crashed or exited abnormally";

// Sentry로 알림 전송
Sentry.captureMessage(errorMessage, "fatal");
// console.log("Error reported to Sentry");
