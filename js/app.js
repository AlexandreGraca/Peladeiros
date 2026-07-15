// js/app.js
import { auth, db } from './firebase.js';
import { DashboardView } from './views/dashboard.view.js';
import { HistoricoView } from './views/historico.view.js';
import { SorteioView } from './views/sorteio.view.js';
import { FinanceiroView } from './views/financeiro.view.js'; // 🚀 IMPORTAÇÃO DO FINANCEIRO[cite: 5]

const AppState = {
    usuarioLogado: null,
    configSistema: null
};

// Mapeamento de "Rotas" de Abas SPA[cite: 5]
const Rotas = {
    'sorteio': () => {
        document.getElementById('view-sorteio-container').style.display = 'block';
        document.getElementById('view-historico-container').style.display = 'none';
        document.getElementById('view-dashboard-container').style.display = 'none';
        document.getElementById('view-financeiro-container').style.display = 'none'; // 🚀 Oculta financeiro[cite: 5]
    },
    'historico': async () => {
        document.getElementById('view-sorteio-container').style.display = 'none';
        document.getElementById('view-dashboard-container').style.display = 'none';
        document.getElementById('view-financeiro-container').style.display = 'none'; // 🚀 Oculta financeiro[cite: 5]
        
        const histContainer = document.getElementById('view-historico-container');
        histContainer.style.display = 'block';
        await HistoricoView.render('view-historico-container'); //[cite: 5]
    },
    'dashboard': async () => {
        document.getElementById('view-sorteio-container').style.display = 'none';
        document.getElementById('view-historico-container').style.display = 'none';
        document.getElementById('view-financeiro-container').style.display = 'none'; // 🚀 Oculta financeiro[cite: 5]
        
        const dashContainer = document.getElementById('view-dashboard-container');
        dashContainer.style.display = 'block';
        await DashboardView.render('view-dashboard-container'); //[cite: 5]
    },
    'financeiro': async () => { // 🚀 NOVA ROTA EXCLUSIVA DE CAIXA[cite: 5]
        document.getElementById('view-sorteio-container').style.display = 'none';
        document.getElementById('view-historico-container').style.display = 'none';
        document.getElementById('view-dashboard-container').style.display = 'none';
        
        const finContainer = document.getElementById('view-financeiro-container');
        finContainer.style.display = 'block';
        await FinanceiroView.render('view-financeiro-container'); //[cite: 5]
    }
};

export function navegarPara(rota) {
    if (Rotas[rota]) {
        Rotas[rota]();
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const btnAtivo = document.querySelector(`[data-target="${rota}"]`);
        if (btnAtivo) btnAtivo.classList.add('active');
    }
}

// Ouvinte de Autenticação Modular e Único[cite: 5]
auth.onAuthStateChanged(async (user) => {
    const authContainer = document.getElementById('auth-container');
    const appMain = document.getElementById('app-main');

    if (user) {
        AppState.usuarioLogado = user;

        try {
            // Busca as configurações gerais do sistema de forma reativa e modular[cite: 5]
            const configDoc = await db.collection("configuracoes").doc("geral").get();
            if (configDoc.exists) {
                AppState.configSistema = configDoc.data();
                await SorteioView.inicializar(AppState.configSistema); //[cite: 5]

                // Validação de acessos administrativos de e-mails permitidos[cite: 5]
                if (AppState.configSistema.emailsPermitidos && AppState.configSistema.emailsPermitidos.length > 0) {
                    const emailUser = user.email.toLowerCase().trim();
                    const autorizado = AppState.configSistema.emailsPermitidos.some(e => e.toLowerCase().trim() === emailUser);
                    if (!autorizado) {
                        alert("Acesso não autorizado.");
                        auth.signOut();
                        return;
                    }
                }
            }
            
            authContainer.style.display = 'none';
            appMain.style.display = 'block';

            inicializarEventos();
            navegarPara('sorteio'); //[cite: 5]

        } catch (error) {
            console.error("Erro ao inicializar o app principal:", error);
        }
    } else {
        authContainer.style.display = 'flex';
        appMain.style.display = 'none';
    }
});

function inicializarEventos() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            navegarPara(e.currentTarget.getAttribute('data-target'));
        });
    });
}

// Vincula funções seguras de escopo para as chamadas do index.html[cite: 5]
window.executarSorteioModular = () => SorteioView.dispararSorteio(); //[cite: 5]
window.navegarPara = navegarPara; //[cite: 5]