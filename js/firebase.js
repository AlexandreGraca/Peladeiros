// js/firebase.js

// 1. Importa os métodos oficiais e modernos diretamente da CDN do Firebase v9+
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC9VtX2SWiCtAPtLx6WGmVwUMA-EX_zuAY",
    authDomain: "dbpeladeiros.firebaseapp.com",
    projectId: "dbpeladeiros",
    storageBucket: "dbpeladeiros.firebasestorage.app",
    messagingSenderId: "460398325975",
    appId: "1:460398325975:web:b382791c2d132d1a3d0092"
};

// 2. Inicializa o Firebase garantindo que não haja duplicidade de instâncias
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 3. Exporta as instâncias prontas para serem consumidas pelos seus Services e pelo app.js
export const db = getFirestore(app);
export const auth = getAuth(app);
