// js/services/dashboard.service.js
import { db } from '../firebase.js';
import { FinanceiroService } from './financeiro.service.js';

export const DashboardService = {
    /**
     * Coleta e centraliza todas as métricas necessárias para a Dashboard
     */
    async obterDadosDashboard() {
        // 1. Busca os totais financeiros consolidados do mês atual
        const metricasFinanceiras = await FinanceiroService.obterMetricasMensais();

        // 2. Busca o Top 5 jogadores mais assíduos ordenados por presenças totais
        const jogSnap = await db.collection("jogadores")
                                .orderBy("totalPresencas", "desc")
                                .limit(5)
                                .get();

        const rankingJogadores = [];
        jogSnap.forEach(doc => {
            rankingJogadores.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Retorna o pacote de dados limpo para a View renderizar
        return {
            financeiro: metricasFinanceiras,
            ranking: rankingJogadores
        };
    }
};