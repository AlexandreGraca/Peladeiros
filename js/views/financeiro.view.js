// js/views/financeiro.view.js
import { FinanceiroService } from '../services/financeiro.service.js';

export const FinanceiroView = {
    async render(containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = `<div class="loading">Carregando movimentações do caixa...</div>`;

        try {
            // Busca dados consolidados do mês atual no serviço financeiro
            const fin = await FinanceiroService.obterMetricasMensais();
            
            const data = new Date();
            const meses = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
            ];
            const mesAtualNome = meses[data.getMonth()];
            const anoAtual = data.getFullYear();

            // Renderização da Dashboard Financeira Moderna
            container.innerHTML = `
                <div style="background: white; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                    <h3 style="margin: 0; color: var(--primary); display: flex; align-items: center; gap: 8px;">💰 Caixa Mensal - ${mesAtualNome} / ${anoAtual}</h3>
                    <p style="font-size:0.75rem; color:#7f8c8d; margin-top:3px; margin-bottom:0;">Controle financeiro consolidado de arrecadações da associação.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 20px;">
                    <!-- Card Receita Total -->
                    <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;">Arrecadação Total do Mês</span>
                        <h1 style="margin: 8px 0 0 0; font-size: 2.2rem; font-weight: bold;">R$ ${fin.receitaTotal.toFixed(2)}</h1>
                    </div>

                    <!-- Grid de métodos de pagamento -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <!-- PIX -->
                        <div style="background: white; border: 1px solid #eee; border-left: 5px solid #27ae60; padding: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                            <span style="font-size: 0.75rem; color: #7f8c8d; font-weight: bold; display: block;">❖ PIX</span>
                            <h3 style="margin: 5px 0 0 0; color: #27ae60; font-size: 1.2rem;">R$ ${fin.totalPix.toFixed(2)}</h3>
                        </div>

                        <!-- DINHEIRO -->
                        <div style="background: white; border: 1px solid #eee; border-left: 5px solid #f1c40f; padding: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                            <span style="font-size: 0.75rem; color: #7f8c8d; font-weight: bold; display: block;">💲 Dinheiro</span>
                            <h3 style="margin: 5px 0 0 0; color: #d4ac0d; font-size: 1.2rem;">R$ ${fin.totalDinheiro.toFixed(2)}</h3>
                        </div>

                        <!-- DEVEDORES / CRÉDITO -->
                        <div style="background: white; border: 1px solid #eee; border-left: 5px solid #e74c3c; padding: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); grid-column: span 2;">
                            <span style="font-size: 0.75rem; color: #7f8c8d; font-weight: bold; display: block;">💳 Crédito Pendente / Devedores</span>
                            <h3 style="margin: 5px 0 0 0; color: #e74c3c; font-size: 1.2rem;">R$ ${fin.totalCredito.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>

                <div style="background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center;">
                    <span style="font-size: 0.8rem; color: #7f8c8d;">Para gerar relatórios detalhados com as tabelas de pagamentos diários de cada rodada, use a opção de Relatório PDF na aba do Sorteio.</span>
                </div>
            `;
        } catch (error) {
            console.error("Erro ao carregar Dashboard Financeira:", error);
            container.innerHTML = `<div style="color:red; text-align:center; padding:20px;">Erro ao carregar os dados financeiros.</div>`;
        }
    }
};