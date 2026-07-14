// js/firebase.js

const firebaseConfig = {
    apiKey: "AIzaSyC9VtX2SWiCtAPtLx6WGmVwUMA-EX_zuAY",
    authDomain: "dbpeladeiros.firebaseapp.com",
    projectId: "dbpeladeiros",
    storageBucket: "dbpeladeiros.firebasestorage.app",
    messagingSenderId: "460398325975",
    appId: "1:460398325975:web:b382791c2d132d1a3d0092"
};

// Se o Firebase global ainda não foi inicializado, inicializa agora
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const auth = firebase.auth();