const decimal = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const percentual = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

export function formatarNota(valor: number | undefined | null): string {
  return valor == null ? '—' : decimal.format(valor);
}

// Peso vem de 0 a 1; frequência já vem de 0 a 100
export function formatarPeso(peso: number | undefined): string {
  return peso == null ? '—' : `${percentual.format(peso * 100)}%`;
}

export function formatarFrequencia(frequencia: number | undefined): string {
  return frequencia == null ? '—' : `${percentual.format(frequencia)}%`;
}

export function formatarData(iso: string | undefined): string {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

// "2026-11-10T19:00:00" -> "10/11/2026 às 19:00"
export function formatarDataHora(iso: string | undefined): string {
  if (!iso) return '—';
  const [data, hora = ''] = iso.split('T');
  return `${formatarData(data)} às ${hora.slice(0, 5)}`;
}

export const nomePerfil = {
  MASTER: 'Administração',
  PROFESSOR: 'Professor',
  ALUNO: 'Aluno',
} as const;
