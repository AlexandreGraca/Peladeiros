// js/views/sorteio.view.js
import { db } from '../firebase.js';
import { SorteioService } from '../services/sorteio.service.js';
import { calcularIdade } from '../utils.js';

export const SorteioView = {
    listaJogadores: [],
    timesAtuais: [],
    configSistema: null,

    async inicializar(config) {
        this.configSistema = config;
        
        // Ativa os ouvintes em tempo real do banco de dados para os jogadores
        db.collection("jogadores").orderBy("nome").onSnapshot(snap => {
            this.listaJogadores = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderizarListas();
        });

        // Ativa os ouvintes em tempo real para os times sorteados
        db.collection("configuracoes").doc("timesSorteados").onSnapshot(doc => {
            if (!doc.exists || !doc.data().ativo) {
                document.getElementById("times").innerHTML = "";
                this.timesAtuais = [];
                return;
            }
            this.timesAtuais = doc.data().times;
            this.mostrarTimesSorteados();
        });
    },

    checarConfirmacao(j) {
        if (j.goleiro) return true;
        const d = new Date();
        const mesAnoAtual = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        
        if (j.modalidade === "mensalista") {
            return j.mesPago === mesAnoAtual && j.presencaRodada === true;
        } else {
            const total = (parseFloat(j.valorPago) || 0) + (parseFloat(j.valorPago2) || 0);
            return total >= (parseFloat(this.configSistema.taxa) || 15);
        }
    },

    renderizarListas() {
        const lc = document.getElementById('listaConfirmados');
        const le = document.getElementById('listaEspera');
        if (!lc || !le) return;

        lc.innerHTML = ""; 
        le.innerHTML = "";
        let c = 0, e = 0;

        const d = new Date();
        const mesAnoAtual = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        this.listaJogadores.forEach(j => {
            const isC = this.checarConfirmacao(j);
            const total = (parseFloat(j.valorPago) || 0) + (parseFloat(j.valorPago2) || 0);
            const idade = calcularIdade(j.nascimento);
            const prefixoGoleiro = j.goleiro ? "🧤 " : "";

            const isMensalistaPago = j.modalidade === "mensalista" && j.mesPago === mesAnoAtual;
            const textoLateral = isMensalistaPago ? "MENSAL (PAGO)" : (total > 0 ? 'R$ ' + total.toFixed(2) : '---');
            const rotuloMod = j.modalidade === "mensalista" ? " Mensalista" : " Diarista";

            const temCredito = j.forma === "Crédito" || j.forma2 === "Crédito";
            const classeCorFundo = temCredito ? 'bg-credito' : (isC ? 'bg-confirmado' : 'bg-espera');

            const html = `
                <li class="player-item ${classeCorFundo}" onclick="abrirEdicao('${j.id}')">
                    <div><strong>${prefixoGoleiro}${j.nome}</strong> ${idade ? `(${idade}a)` : ''} <span style="font-size:0.7rem; color:#888;">[${rotuloMod}]</span></div>
                    <div style="font-weight:bold; color:${temCredito ? 'var(--danger)' : 'var(--accent)'}">${textoLateral}</div>
                </li>
            `;

            if (isC) { 
                lc.innerHTML += html; 
                c++; 
            } else { 
                le.innerHTML += html; 
                e++; 
            }
        });

        document.getElementById('tituloConfirmados').innerText = `Confirmados (${c})`;
        document.getElementById('tituloEspera').innerText = `Lista de Espera / Cadastro (${e})`;
    },

    mostrarTimesSorteados() {
        const box = document.getElementById("times");
        if (!box) return;

        const total = this.timesAtuais.reduce((soma, t) => soma + t.membros.length, 0);
        box.innerHTML = `<h3>Times Sorteados (${total} jogadores)</h3>`;

        this.timesAtuais.forEach(t => {
            const medI = t.idades.length ? (t.somaIdade / t.idades.length).toFixed(1) : "N/A";
            box.innerHTML += `
                <div class="card-time" style="border-left:10px solid ${t.cor}">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <strong style="color:${t.cor}">${t.nome}</strong>
                        <div>
                            <span class="badge-info">👥 ${t.membros.length} Jogs</span>
                            <span class="badge-info">🎂 Méd: ${medI}a</span>
                        </div>
                    </div>
                    <div style="margin-top:8px;font-size:0.85rem;">
                        ${t.membros.join("<br>")}
                    </div>
                </div>
            `;
        });
    },

    async dispararSorteio() {
        const confirmados = this.listaJogadores.filter(j => this.checarConfirmacao(j));
        if (confirmados.length === 0) {
            alert("Nenhum jogador confirmado para realizar o sorteio!");
            return;
        }

        try {
            await SorteioService.realizarSorteio(confirmados, this.configSistema);
            alert("🎲 Times sorteados equilibrando a idade com sucesso!");
        } catch (error) {
            alert(error.message);
        }
    }
};