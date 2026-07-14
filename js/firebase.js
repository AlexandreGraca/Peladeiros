// js/firebase.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC9Vtx2SWictAPtLx6WGmVWUMA-EX_zuAY",
  authDomain: "dbpeladeiros.firebaseapp.com",
  projectId: "dbpeladeiros",
  storageBucket: "dbpeladeiros.firebasestorage.app",
  messagingSenderId: "460398325975",
  appId: "1:460398325975:web:b382791c2d132d1a3d0092"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestoreInstance = getFirestore(app);

// Criamos o adaptador de compatibilidade direto na exportação do db!
export const db = {
  // Mantém a referência nativa caso precise em algum lugar
  raw: firestoreInstance,
  
  // Traduz o método .collection() do padrão antigo para o novo
  collection: (path) => {
    return {
      add: (data) => addDoc(collection(firestoreInstance, path), data),
      doc: (id) => {
        return {
          update: (data) => updateDoc(doc(firestoreInstance, path, id), data),
          delete: () => deleteDoc(doc(firestoreInstance, path, id))
        }
      }
    }
  }
};

export const auth = getAuth(app);
