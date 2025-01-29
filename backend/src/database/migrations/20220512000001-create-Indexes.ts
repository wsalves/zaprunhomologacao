import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await  queryInterface.addIndex("Schedules", ["companyId"], {
        name: "idx_sched_company_id"
      });
      
      await queryInterface.addIndex("Contacts", ["companyId"], {
        name: "idx_cont_company_id"
      });

      await queryInterface.addIndex("Tags", ["companyId"], {
        name: "idx_tg_company_id"
      });

      await queryInterface.addIndex("Messages", ["companyId", "ticketId"], {
        name: "idx_ms_company_id_ticket_id"
      });

      await queryInterface.addIndex("CampaignShipping", ["campaignId"], {
        name: "idx_cpsh_campaign_id"
      });

      await queryInterface.addIndex("ContactListItems", ["contactListId"], {
        name: "idx_ctli_contact_list_id"
      });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("Schedules", "idx_sched_company_id");
    await queryInterface.removeIndex("Contacts", "idx_cont_company_id");
    await queryInterface.removeIndex("Tags", "idx_tg_company_id");
    await queryInterface.removeIndex("Messages", "idx_ms_company_id_ticket_id");
    await queryInterface.removeIndex("CampaignShipping", "idx_cpsh_campaign_id");
    await queryInterface.removeIndex("ContactListItems", "idx_ctli_contact_list_id");
  }
};
