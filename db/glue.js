const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
var hri = require('human-readable-ids').hri;


// Initialize Firebase Admin SDK with your service account key JSON file
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
if (admin.apps.length === 0) {
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://latentglue.firebaseio.com", // Replace with your Firebase project URL
});
}
const db = admin.firestore();

// Get data by UUID
async function getGlueByUUID(uuid) {
  try {
    const docRef = db.collection("glues").doc(uuid);
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      return docSnapshot.data();
    } else {
      throw new Error("Document not found");
    }
  } catch (error) {
    throw error;
  }
}

// Set data with a Unix timestamp and return the UUID
async function setGlue(data) {
  try {
    const uuid = hri.random();
    const timestamp = Date.now(); // Get the current Unix timestamp in milliseconds
    const docRef = db.collection("glues").doc(uuid);

    await docRef.set({
      id: uuid,
      data,
      timestamp,
    });

    return uuid;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getGlueByUUID,
  setGlue,
};