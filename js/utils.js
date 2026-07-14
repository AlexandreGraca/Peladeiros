// js/utils.js

/**
 * Calcula a idade com base em uma string de data (AAAA-MM-DD)
 * @param {string} dataNascimento 
 * @returns {number|null}
 */
export function calcularIdade(dataNascimento) {
    if (!dataNascimento) return null;
    const nasc = new Date(dataNascimento); 
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) {
        idade--;
    }
    return idade;
}