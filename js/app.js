// js/app.js
import { auth, db } from './firebase.js';
import { DashboardView } from './views/dashboard.view.js';
import { HistoricoView } from './views/historico.view.js';
import { SorteioView } from './views/sorteio.view.js';
import { FinanceiroView } from './views/financeiro.view.js'; // 🚀 IMPORTAÇÃO DO FINANCEIRO

const AppState = {
    usuarioLogado: null,
    configSistema: null
};

// Mapeamento de "Rotas" de Abas SPA
const Rotas = {
    'sorteio': () => {
        document.getElementById('view-sorteio-container').style.display = 'block';
        document.getElementById('view-historico-container').style.display = 'none';
        document.getElementById('view-dashboard-container').style.display = 'none';
        document.getElementById('view-financeiro-container').style.display = 'none'; // 🚀 Oculta financeiro
    },
    'historico': async () => {
        document.getElementById('view-sorteio-container').style.display = 'none';
        document.getElementById('view-dashboard-container').style.display = 'none';
        document.getElementById('view-financeiro-container').style.display = 'none'; // 🚀 Oculta financeiro
        
        const histContainer = document.getElementById('view-historico-container');
        histContainer.style.display = 'block';
        await HistoricoView.render('view-historico-container');
    },
    'dashboard': async () => {
        document.getElementById('view-sorteio-container').style.display = 'none';
        document.getElementById('view-historico-container').style.display = 'none';
        document.getElementById('view-financeiro-container').style.display = 'none'; // 🚀 Oculta financeiro
        
        const dashContainer = document.getElementById('view-dashboard-container');
        dashContainer.style.display = 'block';
        await DashboardView.render('view-dashboard-container');
    },
    'financeiro': async () => { // 🚀 NOVA ROTA EXCLUSIVA DE CAIXA
        document.getElementById('view-sorteio-container').style.display = 'none';
        document.getElementById('view-historico-container').style.display = 'none';
        document.getElementById('view-dashboard-container').style.display = 'none';
        
        const finContainer = document.getElementById('view-financeiro-container');
        finContainer.style.display = 'block';
        await FinanceiroView.render('view-financeiro-container');
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

auth.onAuthStateChanged(async (user) => {
    const authContainer = document.getElementById('auth-container');
    const appMain = document.getElementById('app-main');

    if (user) {
        AppState.usuarioLogado = user;

        try {
            const configDoc = await db.collection("configuracoes").doc("geral").get();
            if (configDoc.exists) {
                AppState.configSistema = configDoc.data();
                await SorteioView.inicializar(AppState.configSistema);

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
            navegarPara('sorteio');

        } catch (error) {
            console.error(error);
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

window.executarSorteioModular = () => SorteioView.dispararSorteio();
window.navegarPara = navegarPara;