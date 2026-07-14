// =======================================
// Autenticação
// =======================================

async function loginGoogle() {

    const provider = new firebase.auth.GoogleAuthProvider();

    try {

        await auth.signInWithPopup(provider);

    } catch (erro) {

        console.error("Erro no login:", erro);

        alert("Erro ao realizar login.");

    }

}

async function logout() {

    await auth.signOut();

    location.reload();

}


// =======================================
// Inicialização
// =======================================

auth.onAuthStateChanged(async (usuario) => {

    if (!usuario) {

        document.getElementById("auth-container").style.display = "flex";
        document.getElementById("app-main").style.display = "none";

        return;

    }

    App.usuario = usuario;

    try {

        await carregarConfiguracoes();

        if (!usuarioPermitido(usuario.email)) {

            alert("Usuário não autorizado.");

            logout();

            return;

        }

        document.getElementById("auth-container").style.display = "none";
        document.getElementById("app-main").style.display = "block";

        inicializarSistema();

    }

    catch (erro) {

        console.error(erro);

    }

});


// =======================================
// Verifica e-mail permitido
// =======================================

function usuarioPermitido(email) {

    if (!App.configuracoes.emailsPermitidos.length)
        return true;

    return App.configuracoes.emailsPermitidos
        .map(e => e.toLowerCase())
        .includes(email.toLowerCase());

}


// =======================================
// Inicialização Geral
// =======================================

async function inicializarSistema(){

    App.iniciar();

    JogadoresService.ouvir((jogadores)=>{

        App.jogadores = jogadores;

        JogadoresView.render(jogadores);

    });

}