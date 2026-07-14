// js/services/financeiro.service.js
import { db } from '../firebase.js';

export const FinanceiroService = {
    /**
     * Registra uma entrada financeira no histórico
     */
    async registrarPagamento(jogadorId, nome, modalidade, valor, forma, dataPersonalizada = null) {
        if (valor <= 0) return;

        // Usa a data fornecida ou a data atual (considerando fuso local)
        const d = dataPersonalizada ? new Date(dataPersonalizada) : new Date();
        const dataFormatada = d.toISOString().split('T')[0];
        const anoMes = dataFormatada.substring(0, 7);

        await db.collection("pagamentos").add({
            jogadorId,
            nome,
            modalidade,
            valor: parseFloat(valor),
            forma,
            data: dataFormatada,
            anoMes: anoMes,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    /**
     * Calcula as métricas consolidadas do mês atual
     */
    async obterMetricasMensais() {
        const d = new Date();
        const anoMesAtual = d.toISOString().substring(0, 7);

        const snapshot = await db.collection("pagamentos")
                                  .where("anoMes", "==", anoMesAtual)
                                  .get();

        let totalPix = 0;
        let totalDinheiro = 0;
        let totalCredito = 0;
        let receitaTotal = 0;

        snapshot.forEach(doc => {
            const p = doc.data();
            receitaTotal += p.valor;
            if (p.forma === "Pix") totalPix += p.valor;
            else if (p.forma === "Dinheiro") totalDinheiro += p.valor;
            else if (p.forma === "Crédito") totalCredito += p.valor; // Trata devedores pendentes ou cartões
        });

        return { receitaTotal, totalPix, totalDinheiro, totalCredito };
    }
};