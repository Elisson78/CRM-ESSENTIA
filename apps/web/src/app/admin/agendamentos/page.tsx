import AgendamentosClientPage from "@/components/agendamentos-page";
import { getBoardData } from "./actions";

// Force dynamic because we are fetching specific user data (although auth might handle it, it's safer for admin panels)
export const dynamic = 'force-dynamic';

export default async function Agendamentos() {
  const { agendamentos, passeios, clientes, guias, columns } = await getBoardData();

  return (
    <AgendamentosClientPage
      initialAgendamentos={agendamentos}
      passeios={passeios}
      clientes={clientes}
      guias={guias}
      columns={columns}
    />
  );
}