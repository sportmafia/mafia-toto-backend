window.SPORTMAFIA_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCNpkZoUMVbWP7769VrtBP7pzGQEgR3cig",
  authDomain: "sportmafiaapp.firebaseapp.com",
  databaseURL: "https://sportmafiaapp-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sportmafiaapp",
  storageBucket: "sportmafiaapp.firebasestorage.app",
  messagingSenderId: "858820837278",
  appId: "1:858820837278:web:066665961df6187bdd608f",
  measurementId: "G-DBX7LGYHPW"
};

if (!firebase.apps.length) {
  firebase.initializeApp(window.SPORTMAFIA_FIREBASE_CONFIG);
}
window.db = firebase.database();
window.auth = firebase.auth();
