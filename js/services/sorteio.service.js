// js/services/sorteio.service.js
import { calcularIdade } from '../utils.js';
import { db } from '../firebase.js';

export const SorteioService = {
    /**
     * Realiza o sorteio dividindo de forma equilibrada por IDADE e salva o histórico.
     */
    async realizarSorteio(jogadoresConfirmados, configSistema) {
        // ... (código existente do sorteio permanece igual)
    },

    /**
     * Registra o histórico definitivo e adiciona +1 presença para cada jogador confirmado
     */
    async salvarHistoricoPartida(jogadoresConfirmados, timesSorteados) {
        // ... (código existente do histórico permanece igual)[cite: 5]
    },

    /**
     * 🚀 NOVO MÉTODO: Centraliza a limpeza do sorteio ativo no banco de dados
     */
    async encerrarSorteio() {
        await db.collection("configuracoes").doc("timesSorteados").set({
            ativo: false,
            data: firebase.firestore.FieldValue.serverTimestamp(),
            times: [],
            totalJogadores: 0
        });
    }
};