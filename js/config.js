// =======================================
// Configurações
// =======================================

async function carregarConfiguracoes() {

    const doc = await db
        .collection("configuracoes")
        .doc("geral")
        .get();

    if (!doc.exists)
        return;

    App.configuracoes = {

        ...App.configuracoes,

        ...doc.data()

    };

}