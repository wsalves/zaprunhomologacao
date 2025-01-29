module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Tickets', 'Tickets_integrationId_foreign_idx');

    await queryInterface.sequelize.query('ALTER TABLE Tickets ADD CONSTRAINT Tickets_integrationId_fkey FOREIGN KEY (integrationId) REFERENCES QueueIntegrations(id) ON DELETE SET NULL ON UPDATE CASCADE;');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Tickets', 'Tickets_integrationId_fkey');

    await queryInterface.sequelize.query('ALTER TABLE public."Tickets" ADD CONSTRAINT "Tickets_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."QueueIntegrations"(id) ON DELETE SET NULL ON UPDATE CASCADE;');
  }
};
