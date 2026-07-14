const UI = {

    abrirModal(id){

        document.getElementById(id).style.display="flex";

    },

    fecharModal(id){

        document.getElementById(id).style.display="none";

    },

    mostrarLoading(){

        console.log("Carregando...");

    },

    esconderLoading(){

        console.log("Pronto.");

    },

    alerta(msg){

        alert(msg);

    }

}