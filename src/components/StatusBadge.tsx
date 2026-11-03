import { Badge } from '@mantine/core';
import type { StatusMatricula } from '../api/types';
import { statusCor } from '../theme';

const rotulo: Record<StatusMatricula, string> = {
  CURSANDO: 'Cursando',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
};

// Sobre o painel escuro o contorno cinza some, então "Cursando" vira selo claro
export function StatusBadge({ status, sobreEscuro = false }: { status: StatusMatricula | undefined; sobreEscuro?: boolean }) {
  if (!status) return null;
  const cursando = status === 'CURSANDO';
  return (
    <Badge
      color={cursando && sobreEscuro ? '#f4f6f9' : statusCor[status]}
      c={cursando && sobreEscuro ? '#0d1117' : undefined}
      variant={cursando && !sobreEscuro ? 'outline' : 'filled'}
      tt="none"
    >
      {rotulo[status]}
    </Badge>
  );
}
