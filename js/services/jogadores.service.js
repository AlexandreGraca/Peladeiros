const JogadoresService = {

    collection: db.collection("jogadores"),

    ouvir(callback){

        return this.collection
            .orderBy("nome")
            .onSnapshot(snapshot=>{

                const jogadores = snapshot.docs.map(doc=>({

                    id:doc.id,

                    ...doc.data()

                }));

                callback(jogadores);

            });

    },

    async adicionar(jogador){

        return await this.collection.add(jogador);

    },

    async atualizar(id,dados){

        return await this.collection
            .doc(id)
            .update(dados);

    },

    async excluir(id){

        return await this.collection
            .doc(id)
            .delete();

    },

    async buscar(id){

        const doc = await this.collection
            .doc(id)
            .get();

        if(!doc.exists)
            return null;

        return{

            id:doc.id,

            ...doc.data()

        };

    }

}