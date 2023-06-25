const logger = require("firebase-functions/logger");
const {
  beforeUserCreated,
  HttpsError,
} = require("firebase-functions/v2/identity");

exports.beforeCreated = beforeUserCreated(event => {
  const user = event.data;

  if (!user?.email?.includes("@miamioh.edu")) {
    logger.info(`Unauthorized email: ${user.email}`);
    throw new HttpsError("permission-denied", "Unauthorized email");
  }
});
