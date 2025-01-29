import { QueryInterface } from "sequelize";


//
//Bug encontrado: Uma empresa não pode criar uma conexão com o mesmo nome de outra empresa 
//dentro do saas o nome da conexão é tipo unique no Bd 
//Exemplo de caso de uso : Empresa A cria uma conexão chamada “Fixo”, 
//a empresa B não consegue criar uma conexão com o nome “Fixo”
//

module.exports = {
  up: async (queryInterface: QueryInterface ) => {
    await queryInterface.removeConstraint("Whatsapps", "name");
  },

  down: async () => {

  }
};



