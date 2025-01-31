import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  companyId: string | number;
  userId: string | number;
  userProfile: string;
}

const query = `
  select dt_ref, DATE_FORMAT(dt_ref, '%d/%m/%Y') dt_referencia , label, qtd, ROUND(100.0*(qtd/sum(qtd) over ()), 2) pertentual  from (
  select
  date_trunc('day', t."createdAt") dt_ref,
  --DATE_FORMAT(date_trunc('day', t."createdAt"), '%d/%m/%Y') ,
  t.channel as label,
  count(1) as qtd
  from Tickets t
  INNER JOIN "LogTickets" lt ON lt.ticketId = t."id"
  where t.companyId = :companyId  AND lt."userId" = :userId
  and (lt."type" LIKE 'open' OR lt."type" LIKE 'receivedTransfer')
  and date_trunc('day', t."createdAt") between :startDate and :endDate
  group by date_trunc('day', t."createdAt"), t.channel
  ) a
  order by 1
`;

const queryAdmin = `
  select dt_ref, DATE_FORMAT(dt_ref, '%d/%m/%Y') dt_referencia , label, qtd, ROUND(100.0*(qtd/sum(qtd) over ()), 2) pertentual  from (
  select
  date_trunc('day', t."createdAt") dt_ref,
  --DATE_FORMAT(date_trunc('day', t."createdAt"), '%d/%m/%Y') ,
  t.channel as label,
  count(1) as qtd
  from Tickets t
  INNER JOIN "LogTickets" lt ON lt.ticketId = t."id"
  where t.companyId = :companyId
  and (lt."type" LIKE 'open' OR lt."type" LIKE 'receivedTransfer')
  and date_trunc('day', t."createdAt") between :startDate and :endDate
  group by date_trunc('day', t."createdAt"), t.channel
  ) a
  order by 1
`;

const DashTicketsEvolutionChannels = async ({
  startDate,
  endDate,
  companyId,
  userId,
  userProfile
}: Request): Promise<any[]> => {
  const data = await sequelize.query(
    userProfile == "admin" ? queryAdmin : query,
    {
      replacements: {
        companyId,
        startDate,
        endDate,
        userId
      },
      type: QueryTypes.SELECT
      // logging: console.log
    }
  );
  return data;
};

export default DashTicketsEvolutionChannels;
