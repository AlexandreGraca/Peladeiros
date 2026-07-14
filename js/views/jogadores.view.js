// Função para salvar tudo integrada ao histórico financeiro
async function salvarTudo() {
    const id = document.getElementById('editId').value;
    const isGoleiro = document.getElementById('m-goleiro-status').value === "true";
    const modSelected = document.getElementById('m-modalidade').value;

    const v1 = parseFloat(document.getElementById('m-valor').value) || 0;
    const v2 = parseFloat(document.getElementById('m-valor2').value) || 0;
    const totalDigitado = v1 + v2;

    // Recupera o estado atual do jogador antes de salvar para evitar repetição de lançamentos
    const jogadorOriginal = listaJogadores.find(x => x.id === id);
    const v1Antigo = parseFloat(jogadorOriginal.valorPago) || 0;
    const v2Antigo = parseFloat(jogadorOriginal.valorPago2) || 0;

    // Validações de limites mínimos de caixa
    if (!isGoleiro && totalDigitado > 0) {
        if (modSelected === "mensalista") {
            const minMensal = parseFloat(configSistema.mensalidade) || 50;
            if (totalDigitado < minMensal) {
                alert(`Erro: Para Mensalistas, o valor mínimo exigido é R$ ${minMensal.toFixed(2)}`);
                return;
            }

            const hoje = new Date();
            const limite = parseInt(configSistema.diaLimite) || 10;
            if (hoje.getDate() > limite) {
                const prosseguir = confirm(`Atenção: Passou do dia limite de recebimento (${limite}). Deseja aceitar a mensalidade mesmo assim?`);
                if (!prosseguir) return;
            }
        } else {
            const minDiaria = parseFloat(configSistema.taxa) || 15;
            if (totalDigitado < minDiaria) {
                alert(`Erro: Para Diaristas, o valor mínimo configurado é R$ ${minDiaria.toFixed(2)}`);
                return;
            }
        }
    }

    try {
        const nomeJogador = document.getElementById('m-nome').value;
        const dadosParaSalvar = {
            nome: nomeJogador,
            nascimento: document.getElementById('m-nasc').value,
            nivel: parseInt(document.getElementById('m-nivel').value),
            modalidade: modSelected,
            valorPago: v1 || "",
            forma: document.getElementById('m-forma').value,
            valorPago2: v2 || "",
            forma2: document.getElementById('m-forma2').value,
            goleiro: isGoleiro
        };

        // Regra para Mensalistas
        if (modSelected === "mensalista") {
            dadosParaSalvar.mesPago = getMesAnoAtual();
            dadosParaSalvar.presencaRodada = true;

            if (totalDigitado > 0) {
                dadosParaSalvar.dataPagamento = getDataFormatadaDoc();
            } else {
                dadosParaSalvar.dataPagamento = jogadorOriginal.dataPagamento || getDataFormatadaDoc();
            }
        }

        // --- INTEGRAÇÃO COM O HISTÓRICO FINANCEIRO ---
        // Só registra no histórico se o valor novo digitado for maior do que o que já estava salvo
        // Isso evita duplicar lançamentos caso você mude o nascimento ou nome do jogador mais tarde.
        if (v1 > v1Antigo) {
            const diferencaV1 = v1 - v1Antigo;
            await FinanceiroService.registrarPagamento(
                id, 
                nomeJogador, 
                modSelected, 
                diferencaV1, 
                document.getElementById('m-forma').value
            );
        }

        if (v2 > v2Antigo) {
            const diferencaV2 = v2 - v2Antigo;
            await FinanceiroService.registrarPagamento(
                id, 
                nomeJogador, 
                modSelected, 
                diferencaV2, 
                document.getElementById('m-forma2').value
            );
        }

        // Atualiza a ficha cadastral do atleta
        await db.collection("jogadores").doc(id).update(dadosParaSalvar);
        fecharModal();
        alert("✅ Alterações salvas e histórico financeiro atualizado!");
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("❌ Erro ao salvar alterações.");
    }
}