// js/firebase.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
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

// Função auxiliar para gerar os métodos executáveis (.get e .onSnapshot) a partir de uma referência de busca
const criarExecutorBusca = (targetRef) => {
  return {
    get: async () => {
      const querySnapshot = await getDocs(targetRef);
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
    onSnapshot: (callback) => {
      return onSnapshot(targetRef, (querySnapshot) => {
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
    }
  };
};

// Adaptador de compatibilidade completo (Traduz v8 para v9 modular)
export const db = {
  raw: firestoreInstance,
  collection: (path) => {
    const colRef = collection(firestoreInstance, path);
    
    // Retorna as funções base da coleção, mais o método de ordenação encadeado
    return {
      add: (data) => addDoc(colRef, data),
      
      // Suporte para ordenação: db.collection("jogadores").orderBy("nome")
      orderBy: (field, direction = "asc") => {
        const q = query(colRef, orderBy(field, direction));
        return criarExecutorBusca(q);
      },
      
      // Métodos diretos sem ordenação prévia
      ...criarExecutorBusca(colRef),
      
      doc: (id) => {
        const docRef = doc(firestoreInstance, path, id);
        return {
          update: (data) => updateDoc(docRef, data),
          delete: () => deleteDoc(docRef),
          get: async () => {
            const docSnap = await getDoc(docRef);
            return {
              exists: docSnap.exists(),
              id: docSnap.id,
              data: () => docSnap.data()
            };
          },
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
    };
  }
};

export const auth = getAuth(app);
