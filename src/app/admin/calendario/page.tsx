export const dynamic = "force-dynamic";
import { CalendarioGlobal } from "@/components/calendario-global";
import { getBoardData } from "@/app/admin/agendamentos/actions";

export default async function CalendarioPage() {
  const data = await getBoardData();

  return (
    <CalendarioGlobal
      initialAgendamentos={data.agendamentos}
      initialPasseios={data.passeios}
      initialClientes={data.clientes}
      initialGuias={data.guias}
      initialColumns={data.columns}
    />
  );
}





