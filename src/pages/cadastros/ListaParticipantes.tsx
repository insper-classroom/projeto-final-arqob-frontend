import { ScrollArea, Stack, Table, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import type { AlunoResumo } from '../../api/types';

// Lista de alunos (membros de organização ou inscritos de evento) dentro do modal de edição
export function ListaParticipantes({
  titulo,
  consulta,
  vazio,
}: {
  titulo: string;
  consulta: { queryKey: unknown[]; queryFn: () => Promise<AlunoResumo[]> };
  vazio: string;
}) {
  const { data, error, isPending } = useQuery(consulta);

  return (
    <Stack gap={6} pt="xs">
      <Text fw={700}>
        {titulo}
        {data ? ` (${data.length})` : ''}
      </Text>
      {isPending ? (
        <Text size="sm" c="dimmed">
          Carregando…
        </Text>
      ) : error ? (
        <Text size="sm" c="red">
          {error.message}
        </Text>
      ) : data.length === 0 ? (
        <Text size="sm" c="dimmed">
          {vazio}
        </Text>
      ) : (
        <ScrollArea.Autosize mah={200} type="auto">
          <Table verticalSpacing={6} fz="sm">
            <Table.Tbody>
              {data.map((aluno) => (
                <Table.Tr key={aluno.id}>
                  <Table.Td fw={700}>{aluno.nome}</Table.Td>
                  <Table.Td>RA {aluno.ra}</Table.Td>
                  <Table.Td c="dimmed">{aluno.email}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
      )}
    </Stack>
  );
}
