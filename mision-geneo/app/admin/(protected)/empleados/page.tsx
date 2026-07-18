import { Download } from "lucide-react";
import { getEmployees } from "@/lib/admin-data";
import { Reveal } from "../../_components/Reveal";
import { EmptyState } from "../../_components/ui";
import EmployeesTable from "../../_components/EmployeesTable";

export const dynamic = "force-dynamic";

export default async function EmpleadosPage() {
  const employees = await getEmployees();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-ink font-extrabold text-2xl tracking-tight">Empleados</h1>
          <p className="text-muted text-sm">Quién se capacita y quién ya se certificó.</p>
        </div>
        {employees.length > 0 && (
          <a
            href="/admin/export/empleados"
            className="inline-flex items-center justify-center gap-2 min-h-11 rounded-full border-2 border-line text-muted hover:border-geneo hover:text-geneo active:border-geneo active:text-geneo font-bold text-sm px-5 transition-colors"
          >
            <Download size={16} />
            Exportar CSV
          </a>
        )}
      </header>

      {employees.length === 0 ? (
        <EmptyState
          title="Todavía no hay empleados"
          hint="Cuando alguien se registre desde la app de una farmacia, aparece acá."
        />
      ) : (
        <Reveal>
          <EmployeesTable employees={employees} />
        </Reveal>
      )}
    </div>
  );
}
