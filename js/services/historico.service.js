// js/services/historico.service.js
import { db } from '../firebase.js';

export const HistoricoService = {
    /**
     * 🚀 CORRIGIDO: Recupera as partidas da coleção "historico" onde estamos salvando no sorteio.service.js
     */
    async obterPartidas() {
        // Apontando para o caminho correto de gravação ("historico")[cite: 5]
        const snap = await db.collection("historico")
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