// js/services/historico.service.js
import { db } from '../firebase.js';

export const HistoricoService = {
    /**
     * Recupera todas as partidas salvas no Firestore ordenadas da mais recente para a mais antiga
     */
    async obterPartidas() {
        const snap = await db.collection("partidas")
                            .orderBy("data", "desc")
                            .get();
        
        const partidas = [];
        snap.forEach(doc => {
            partidas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return partidas;
    }
};