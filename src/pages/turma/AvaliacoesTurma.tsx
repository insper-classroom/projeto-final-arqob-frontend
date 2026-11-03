import { Button, Group, Progress, Stack, Table, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api, ApiError } from '../../api/client';
import { Superficie } from '../../components/Superficie';
import type { Avaliacao, AvaliacaoRequest } from '../../api/types';
import { formatarData } from '../../format';
import { AvaliacaoModal, type DadosAvaliacao } from './AvaliacaoModal';

// Pesos em pontos percentuais inteiros, para não acumular erro de ponto flutuante
const pesoPercentual = (avaliacao: Avaliacao) => Math.round((avaliacao.peso ?? 0) * 100);

export function AvaliacoesTurma({ idTurma, avaliacoes }: { idTurma: number; avaliacoes: Avaliacao[] }) {
  const queryClient = useQueryClient();
  // undefined: fechado; null: criando; avaliação: editando
  const [emEdicao, setEmEdicao] = useState<Avaliacao | null | undefined>(undefined);

  const pesoUsado = avaliacoes.reduce((soma, a) => soma + pesoPercentual(a), 0);
  const pesoDisponivel = 100 - pesoUsado + (emEdicao ? pesoPercentual(emEdicao) : 0);

  async function atualizar() {
    await queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
    await queryClient.invalidateQueries({ queryKey: ['matriculas'] });
    await queryClient.invalidateQueries({ queryKey: ['turmas', idTurma, 'matriculas'] });
  }

  async function salvar(dados: DadosAvaliacao) {
    const corpo: AvaliacaoRequest = { tipo: dados.tipo, data: dados.data, peso: dados.pesoPercentual / 100, idTurma };
    if (emEdicao) {
      await api(`/avaliacoes/${emEdicao.id}`, { method: 'PUT', body: corpo });
      notifications.show({ color: 'verde', message: `Avaliação "${dados.tipo}" salva.` });
    } else {
      await api('/avaliacoes', { method: 'POST', body: corpo });
      notifications.show({ color: 'verde', message: `Avaliação "${dados.tipo}" criada.` });
    }
    setEmEdicao(undefined);
    await atualizar();
  }

  const excluir = useMutation({
    mutationFn: (avaliacao: Avaliacao) => api(`/avaliacoes/${avaliacao.id}`, { method: 'DELETE' }),
    onSuccess: async (_, avaliacao) => {
      notifications.show({ color: 'verde', message: `Avaliação "${avaliacao.tipo}" excluída.` });
      await atualizar();
    },
    onError: (erro) =>
      notifications.show({
        color: 'red',
        message:
          erro instanceof ApiError && erro.status === 409
            ? 'Esta avaliação já tem notas lançadas e não pode ser excluída.'
            : erro.message,
      }),
  });

  function confirmarExclusao(avaliacao: Avaliacao) {
    modals.openConfirmModal({
      title: 'Excluir avaliação',
      centered: true,
      children: <Text size="sm">Excluir "{avaliacao.tipo}"? Isso não pode ser desfeito.</Text>,
      labels: { confirm: 'Excluir avaliação', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => excluir.mutate(avaliacao),
    });
  }

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-end">
        <Title order={2}>Avaliações</Title>
        <Button onClick={() => setEmEdicao(null)} disabled={pesoUsado >= 100}>
          Nova avaliação
        </Button>
      </Group>

      <Stack gap={6}>
        <Progress value={pesoUsado} color={pesoUsado === 100 ? 'verde' : 'azul'} size="sm" aria-label="Peso distribuído" />
        <Text size="sm" c="dimmed">
          {pesoUsado === 100
            ? 'Pesos completos: 100% distribuído. A situação dos alunos fecha quando todas as notas forem lançadas.'
            : `${pesoUsado}% do peso distribuído. Crie avaliações até somar 100% para a média final poder ser calculada.`}
        </Text>
      </Stack>

      {avaliacoes.length === 0 ? (
        <Text c="dimmed">Nenhuma avaliação ainda. Crie a primeira para começar a lançar notas.</Text>
      ) : (
        <Superficie>
          <Table.ScrollContainer minWidth={480}>
            <Table verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Avaliação</Table.Th>
                  <Table.Th>Data</Table.Th>
                  <Table.Th ta="right">Peso</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {avaliacoes.map((avaliacao) => (
                  <Table.Tr key={avaliacao.id}>
                    <Table.Td fw={700}>{avaliacao.tipo}</Table.Td>
                    <Table.Td>{formatarData(avaliacao.data)}</Table.Td>
                    <Table.Td ta="right">{pesoPercentual(avaliacao)}%</Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end" wrap="nowrap">
                        <Button size="compact-sm" variant="subtle" onClick={() => setEmEdicao(avaliacao)}>
                          Editar
                        </Button>
                        <Button size="compact-sm" variant="subtle" color="red" onClick={() => confirmarExclusao(avaliacao)}>
                          Excluir
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Superficie>
      )}

      {emEdicao !== undefined && (
        <AvaliacaoModal
          aberto
          avaliacao={emEdicao}
          pesoDisponivel={pesoDisponivel}
          onFechar={() => setEmEdicao(undefined)}
          onSalvar={salvar}
        />
      )}
    </Stack>
  );
}
