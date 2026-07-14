// js/firebase.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgLwyaeXK0tChW3sndo4dpXrjG1LFLVnk",
  authDomain: "dbpeladeiros.firebaseapp.com",
  projectId: "dbpeladeiros",
  storageBucket: "dbpeladeiros.firebasestorage.app",
  messagingSenderId: "460398325975",
  appId: "1:460398325975:web:b382791c2d132d1a3d0092"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestoreInstance = getFirestore(app);

// Adaptador de compatibilidade completo (Traduz v8 para v9 modular)
export const db = {
  raw: firestoreInstance,
  collection: (path) => {
    const colRef = collection(firestoreInstance, path);
    return {
      add: (data) => addDoc(colRef, data),
      // Suporte para buscar a coleção inteira: db.collection("jogadores").get()
      get: async () => {
        const querySnapshot = await getDocs(colRef);
        // Simula a estrutura antiga de documentos para o app.js ler com .forEach()
        return {
          forEach: (callback) => {
            querySnapshot.forEach(docSnap => {
              callback({
                id: docSnap.id,
                data: () => docSnap.data()
              });
            });
          },
          docs: querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            data: () => docSnap.data()
          }))
        };
      },
      // Suporte para monitoramento em tempo real da coleção inteira: db.collection("jogadores").onSnapshot()
      onSnapshot: (callback) => {
        return onSnapshot(colRef, (querySnapshot) => {
          const simulatedSnapshot = {
            forEach: (cb) => {
              querySnapshot.forEach(docSnap => {
                cb({
                  id: docSnap.id,
                  data: () => docSnap.data()
                });
              });
            },
            docs: querySnapshot.docs.map(docSnap => ({
              id: docSnap.id,
              data: () => docSnap.data()
            }))
          };
          callback(simulatedSnapshot);
        });
      },
      doc: (id) => {
        const docRef = doc(firestoreInstance, path, id);
        return {
          update: (data) => updateDoc(docRef, data),
          delete: () => deleteDoc(docRef),
          // Suporte para buscar um documento específico: db.collection("jogadores").doc(id).get()
          get: async () => {
            const docSnap = await getDoc(docRef);
            return {
              exists: docSnap.exists(),
              id: docSnap.id,
              data: () => docSnap.data()
            };
          },
          // Suporte para escutar atualizações de um documento específico
          onSnapshot: (callback) => {
            return onSnapshot(docRef, (docSnap) => {
              callback({
                exists: docSnap.exists(),
                id: docSnap.id,
                data: () => docSnap.data()
              });
            });
          }
        }
      }
    }
  }
};

export const auth = getAuth(app);
