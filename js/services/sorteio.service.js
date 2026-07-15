// js/services/sorteio.service.js
import { calcularIdade } from '../utils.js';
import { db, firebaseFieldValue } from '../firebase.js';

export const SorteioService = {
    /**
     * Realiza o sorteio dividindo de forma equilibrada por IDADE e salva no Firestore.
     */
    async realizarSorteio(jogadoresConfirmados, configSistema) {
        if (!jogadoresConfirmados || jogadoresConfirmados.length === 0) {
            throw new Error("Nenhum jogador confirmado para o sorteio!");
        }

        // 1. Define o limite de jogadores por time com base na configuração do sistema
        const limitePorTime = parseInt(configSistema.atletasPorEquipe) || 7;
        const totalConfirmados = jogadoresConfirmados.length;

        // 2. CÁLCULO DINÂMICO: Divide o total de confirmados pelo limite por equipe (mínimo de 2 times)
        let numTimesNecessarios = Math.ceil(totalConfirmados / limitePorTime);
        if (numTimesNecessarios < 2) numTimesNecessarios = 2; // Garante que haja pelo menos uma disputa de 2 times

        // Pega os nomes e cores configurados para os times
        const nomesTimes = configSistema.nomesTimes || ["Verde", "Amarelo", "Vermelho", "Roxo", "Laranja"];
        const coresTimes = configSistema.coresTimes || ["#2ecc71", "#f1c40f", "#e74c3c", "#9b59b6", "#e67e22"];

        // 3. Separa goleiros dos jogadores de linha
        const goleiros = jogadoresConfirmados.filter(j => j.goleiro);
        const linha = jogadoresConfirmados.filter(j => !j.goleiro);

        // 4. Calcula as idades e ordena os jogadores de linha por idade (decrescente para equilibrar)
        linha.forEach(j => {
            j.idadeCalculada = calcularIdade(j.nascimento) || 30; // Idade padrão se não definida
        });
        linha.sort((a, b) => b.idadeCalculada - a.idadeCalculada);

        // Inicializa as estruturas apenas com a quantidade de times calculada dinamicamente
        const times = [];
        for (let i = 0; i < numTimesNecessarios; i++) {
            times.push({
                nome: nomesTimes[i] || `Time ${i + 1}`,
                cor: coresTimes[i] || "#7f8c8d",
                membros: [],
                idades: [],
                somaIdade: 0
            });
        }

        // 5. Distribui os goleiros primeiro (se houver) de forma alternada nos times necessários
        goleiros.forEach((goleiro, index) => {
            const timeIndex = index % numTimesNecessarios;
            times[timeIndex].membros.push(`🧤 ${goleiro.nome}`);
            times[timeIndex].idades.push(calcularIdade(goleiro.nascimento) || 30);
            times[timeIndex].somaIdade += (calcularIdade(goleiro.nascimento) || 30);
        });

        // 6. Distribui os jogadores de linha de forma equilibrada (Serpente/Zig-zag por idade)
        let indo = true;
        let timeAtual = 0;

        linha.forEach(jogador => {
            times[timeAtual].membros.push(jogador.nome);
            times[timeAtual].idades.push(jogador.idadeCalculada);
            times[timeAtual].somaIdade += jogador.idadeCalculada;

            // Lógica de ziguezague para balanceamento ideal entre os times criados
            if (indo) {
                if (timeAtual === numTimesNecessarios - 1) {
                    indo = false; // Bateu no final, volta
                } else {
                    timeAtual++;
                }
            } else {
                if (timeAtual === 0) {
                    indo = true; // Bateu no início, avança
                } else {
                    timeAtual--;
                }
            }
        });

        // 7. Grava o sorteio ativo diretamente na coleção de configurações do Firebase
        await db.collection("configuracoes").doc("timesSorteados").set({
            ativo: true,
            data: firebaseFieldValue.serverTimestamp(),
            times: times,
            totalJogadores: totalConfirmados
        });

        return times;
    },

    /**
     * Registra o histórico definitivo e adiciona +1 presença para cada jogador confirmado
     */
    /**
     * Registra o histórico definitivo e adiciona +1 presença para cada jogador confirmado
     */
    async salvarHistoricoPartida(jogadoresConfirmados, timesSorteados) {
        if (!jogadoresConfirmados || jogadoresConfirmados.length === 0) {
            throw new Error("Nenhum jogador confirmado para salvar histórico!");
        }

        // Função auxiliar interna para gerar a data de hoje como string AAAA-MM-DD
        const getDataHojeString = () => {
            const d = new Date();
            const dia = String(d.getDate()).padStart(2, '0');
            const mes = String(d.getMonth() + 1).padStart(2, '0');
            const ano = d.getFullYear();
            return `${ano}-${mes}-${dia}`;
        };

        try {
            // 1. Salva o documento no histórico geral de partidas
            await db.collection("historico").add({
                // ALTERADO: Agora salvando a data como STRING compatível com o split('-') do historico.view.js
                data: getDataHojeString(), 
                
                // Mapeia jogadores compatível com a View[cite: 10]
                jogadoresPresentes: jogadoresConfirmados.map(j => ({ id: j.id, nome: j.nome, goleiro: !!j.goleiro })),
                
                times: timesSorteados
            });

            // 2. Passa jogador por jogador adicionando +1 na presença acumulada deles no banco
            for (const jogador of jogadoresConfirmados) {
                const jogadorRef = db.collection("jogadores").doc(jogador.id);
                const docSnap = await jogadorRef.get();
                
                if (docSnap.exists) {
                    const dadosAtuais = docSnap.data();
                    
                    // Lendo EXCLUSIVAMENTE o campo 'totalPresencas' correto do seu banco[cite: 5]
                    const presencasAtuais = parseInt(dadosAtuais.totalPresencas) || 0;
                    
                    // Gravando de volta no campo oficial 'totalPresencas'[cite: 5]
                    await jogadorRef.update({
                        totalPresencas: presencasAtuais + 1
                    });
                }
            }

        } catch (error) {
            console.error("Erro ao salvar histórico de partidas:", error);
            throw new Error("Falha ao salvar histórico e computar presenças.");
        }
    },

    /**
     * Centraliza a limpeza do sorteio ativo no banco de dados
     */
    async encerrarSorteio() {
        await db.collection("configuracoes").doc("timesSorteados").set({
            ativo: false,
            data: firebaseFieldValue.serverTimestamp(),
            times: [],
            totalJogadores: 0
        });
    }
};