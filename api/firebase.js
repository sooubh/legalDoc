
const admin = require('firebase-admin');

// TODO: Replace the following with your Firebase project's credentials
const serviceAccount = require('./path/to/your/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
