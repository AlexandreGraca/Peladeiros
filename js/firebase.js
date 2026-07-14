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
  orderBy,
  where,
  limit
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

// Função auxiliar para gerar executores a partir de uma query construída
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

// Adaptador de compatibilidade completo (v8 para v9 modular)
export const db = {
  raw: firestoreInstance,
  collection: (path) => {
    const colRef = collection(firestoreInstance, path);
    
    // Função interna que permite acumular filtros, ordenações e limites de forma encadeada
    const criarQueryEncadeada = (constraints = []) => {
      const construirFiltros = () => {
        return constraints.length > 0 ? query(colRef, ...constraints) : colRef;
      };

      return {
        // Suporte para filtro: .where("campo", "==", "valor")
        where: (field, op, value) => {
          return criarQueryEncadeada([...constraints, where(field, op, value)]);
        },
        // Suporte para ordenação: .orderBy("campo", "asc/desc")
        orderBy: (field, direction = "asc") => {
          return criarQueryEncadeada([...constraints, orderBy(field, direction)]);
        },
        // Suporte para limite: .limit(numero)
        limit: (num) => {
          return criarQueryEncadeada([...constraints, limit(num)]);
        },
        // Métodos de execução
        ...criarExecutorBusca(construirFiltros())
      };
    };

    return {
      add: (data) => addDoc(colRef, data),
      
      // Expõe os métodos diretamente a partir da coleção básica
      where: (field, op, value) => criarQueryEncadeada([where(field, op, value)]),
      orderBy: (field, direction = "asc") => criarQueryEncadeada([orderBy(field, direction)]),
      limit: (num) => criarQueryEncadeada([limit(num)]),
      
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
