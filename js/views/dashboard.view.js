// js/views/dashboard.view.js
import { DashboardService } from '../services/dashboard.service.js';

export const DashboardView = {
    async render(containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = `<div class="loading">Carregando estatísticas dos jogadores...</div>`;

        try {
            const dados = await DashboardService.obterDadosDashboard();

            let rankingHtml = "";
            let medalhas = ["🥇", "🥈", "🥉", "🏃‍♂️", "🏃‍♂️"];
            
            dados.ranking.forEach((j, i) => {
                rankingHtml += `
                    <div style="display:flex; justify-content:space-between; padding: 10px 0; border-bottom:1px solid #eee; align-items: center;">
                        <span>
                            <span style="margin-right: 8px; font-size: 1.1rem;">${medalhas[i] || "🏃‍♂️"}</span>
                            <strong>${j.nome}</strong>
                        </span>
                        <span class="badge-info" style="background: #e8f5e9; color: var(--accent); padding: 5px 10px; font-size: 0.8rem;">
                            ${j.totalPresencas || 0} Presenças
                        </span>
                    </div>
                `;
            });

            container.innerHTML = `
                <div style="background: white; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                    <h3 style="margin: 0; color: var(--primary); display: flex; align-items: center; gap: 8px;">📊 Estatísticas de Desempenho</h3>
                    <p style="font-size:0.75rem; color:#7f8c8d; margin-top:3px; margin-bottom:0;">Métricas de engajamento, assiduidade e frequência da pelada.</p>
                </div>

                <div style="background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                    <h3 style="margin-top:0; color:var(--primary); display:flex; align-items:center; gap:8px;">🏆 Ranking de Assiduidade (Top 5)</h3>
                    <p style="font-size:0.75rem; color:#7f8c8d; margin-top:-5px; margin-bottom:15px;">Os atletas campeões de presença que mais compareceram às partidas.</p>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        ${rankingHtml || "<p style='font-size:0.9rem; color:#999; text-align: center;'>Nenhuma presença computada no sistema ainda.</p>"}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Erro ao renderizar Estatísticas:", error);
            container.innerHTML = `<div style="color:red; text-align:center; padding:20px;">Erro ao carregar as estatísticas dos jogadores.</div>`;
        }
    }
};