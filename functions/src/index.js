const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
const {
  beforeUserCreated,
  HttpsError,
} = require("firebase-functions/v2/identity");

initializeApp();
const db = getFirestore();

const checkinTimeToSet = async classID => {
  const classData = (await db.doc(`classes/${classID}`).get()).data();
  console.log(classData);
  classData.start = classData.start.toDate();
  classData.end = classData.end.toDate();
  const currentDateTime = new Date();

  if (currentDateTime < classData.start) {
    return classData.start;
  } else if (currentDateTime > classData.end) {
    return classData.end;
  } else {
    return currentDateTime;
  }
};

exports.beforeCreated = beforeUserCreated(event => {
  const user = event.data;

  if (!user?.email?.includes("@miamioh.edu")) {
    logger.info(`Unauthorized email: ${user.email}`);
    throw new HttpsError("permission-denied", "Unauthorized email");
  }
});

exports.newCheckin = onDocumentCreated("checkins/{checkinID}", async event => {
  const snapshot = event.data;
  if (!snapshot) return;

  const checkinData = snapshot.data();

  if (checkinData.status === "Present") {
    const timestamp = await checkinTimeToSet(checkinData.classID);

    db.doc(`users/${checkinData.email}`).update({
      present: FieldValue.increment(1),
      lastAttended: timestamp,
    });
  } else if (checkinData.status === "Excused") {
    db.doc(`users/${checkinData.email}`).update({
      excused: FieldValue.increment(1),
    });
  } else if (checkinData.status === "Dishonest") {
    db.doc(`users/${checkinData.email}`).update({
      dishonest: FieldValue.increment(1),
    });
  }
});

exports.updatedCheckin = onDocumentUpdated(
  "checkins/{checkinID}",
  async event => {
    const oldData = event.data.before.data();
    const newData = event.data.after.data();

    // Skip logic if no status change was made
    if (oldData.status === newData.status) return;

    const updateObject = {};

    // Decrement Old Status
    if (oldData.status !== "Absent" && oldData.status !== null) {
      updateObject[oldData.status.toLowerCase()] = FieldValue.increment(-1);
    }

    // Increment New Status
    if (newData.status !== "Absent" && newData.status !== null) {
      updateObject[newData.status.toLowerCase()] = FieldValue.increment(1);
    }

    // Recalculate lastAttended if needed
    if (newData.status === "Present") {
      const timestamp = await checkinTimeToSet(newData.classID);
      updateObject.lastAttended = timestamp;
    } else {
      // Get most recent present checkin and set the timestamp to lastAttended
      const lastPresentCheckin = await db
        .collection("checkins")
        .where("email", "==", newData.email)
        .where("section", "==", newData.section)
        .where("status", "==", "Present")
        .where("timestamp", "<=", new Date())
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();
      if (lastPresentCheckin.empty) {
        updateObject.lastAttended = null;
      } else {
        updateObject.lastAttended = lastPresentCheckin.docs[0].data().timestamp;
      }
    }

    // Push update to user document
    db.doc(`users/${newData.email}`).update(updateObject);
  }
);
