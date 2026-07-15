// js/views/historico.view.js
import { HistoricoService } from '../services/historico.service.js';

export const HistoricoView = {
    /**
     * 🚀 CORRIGIDO: Função inteligente que formata tanto String antiga quanto Timestamp novo do Firebase
     */
    formatarData(dataOriginal) {
        if (!dataOriginal) return "N/A";

        // Caso 1: Se já for um Timestamp do Firebase modular (formato novo)
        if (typeof dataOriginal === 'object' && dataOriginal.seconds) {
            // Converte Timestamp para objeto Date nativo do JS
            const d = dataOriginal.toDate();
            const dia = String(d.getDate()).padStart(2, '0');
            const mes = String(d.getMonth() + 1).padStart(2, '0');
            const ano = d.getFullYear();
            return `${dia}/${mes}/${ano}`;
        }

        // Caso 2: Se for a String legada 'AAAA-MM-DD' (suporte ao histórico antigo)
        if (typeof dataOriginal === 'string' && dataOriginal.includes('-')) {
            const partes = dataOriginal.split('-');
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }

        return "Data Inv.";
    },

    async render(containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = `<div class="loading">Carregando histórico de confrontos...</div>`;

        try {
            const partidas = await HistoricoService.obterPartidas();

            if (partidas.length === 0) {
                container.innerHTML = `<p style="text-align:center; color:#999; padding: 20px;">Nenhum sorteio registrado no histórico ainda.</p>`;
                return;
            }

            // Título minimalista e direto
            let htmlGeral = `
                <div style="margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #eee;">
                    <h3 style="margin: 0; color: var(--primary); display: flex; align-items: center; gap: 8px;">📅 Histórico Geral de Partidas</h3>
                </div>
            `;

            partidas.forEach(partida => {
                // ALTERADO: Chutando para a nossa função de formatação inteligente[cite: 10]
                const dataFormatada = this.formatarData(partida.data);
                
                const totalJogadores = partida.jogadoresPresentes ? partida.jogadoresPresentes.length : 0;

                let htmlTimes = "";

                if (partida.times && Array.isArray(partida.times)) {
                    partida.times.forEach(t => {
                        const medI = t.idades && t.idades.length 
                            ? (t.somaIdade / t.idades.length).toFixed(1) + "a" 
                            : "N/A";

                        htmlTimes += `
                            <div style="background: #fafafa; border: 1px solid #eee; border-left: 5px solid ${t.cor}; border-radius: 6px; padding: 10px; margin-bottom: 8px;">
                                <div style="font-weight: bold; margin-bottom: 5px; font-size: 0.9rem; display: flex; justify-content: space-between; color: ${t.cor};">
                                    <span>${t.nome}</span>
                                    <span style="font-size: 0.7rem; color: #888;">🎂 Méd: ${medI}</span>
                                </div>
                                <div style="font-size: 0.8rem; color: #444; line-height: 1.4;">
                                    ${t.membros.join('<br>')}
                                </div>
                            </div>
                        `;
                    });
                }

                htmlGeral += `
                    <div style="background: var(--white); border: 1px solid #eee; border-radius: 8px; padding: 12px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 10px;">
                            <span style="font-weight: bold; color: var(--primary); font-size: 0.95rem;">🗓️ ${dataFormatada}</span>
                            <span class="badge-info" style="font-size: 0.65rem;">👥 ${totalJogadores} Atletas</span>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                            ${htmlTimes}
                        </div>
                    </div>
                `;
            });

            container.innerHTML = htmlGeral;

        } catch (error) {
            console.error("Erro ao renderizar histórico:", error);
            container.innerHTML = `<div style="color:red; text-align:center; padding:20px;">Erro ao carregar o histórico de partidas.</div>`;
        }
    }
};