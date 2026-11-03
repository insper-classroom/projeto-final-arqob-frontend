import { Button, Group, Select, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../api/client';
import { queries } from '../../api/queries';
import type { Matricula } from '../../api/types';

// Só o master matricula: escolhe entre os alunos que ainda não estão na turma
export function MatricularAluno({ idTurma, matriculas }: { idTurma: number; matriculas: Matricula[] }) {
  const queryClient = useQueryClient();
  const alunos = useQuery(queries.alunos());
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const jaMatriculados = new Set(matriculas.map((m) => m.idAluno));
  const disponiveis = (alunos.data ?? [])
    .filter((a) => !jaMatriculados.has(a.id))
    .toSorted((a, b) => (a.nome ?? '').localeCompare(b.nome ?? ''));

  async function matricular() {
    if (!escolhido) return;
    const aluno = disponiveis.find((a) => String(a.id) === escolhido);
    setEnviando(true);
    try {
      await api('/matriculas', { method: 'POST', body: { idAluno: Number(escolhido), idTurma } });
      await queryClient.invalidateQueries({ queryKey: ['turmas', idTurma, 'matriculas'] });
      await queryClient.invalidateQueries({ queryKey: ['alunos'] });
      notifications.show({ color: 'verde', message: `${aluno?.nome ?? 'Aluno'} matriculado na turma.` });
      setEscolhido(null);
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Stack gap="xs">
      <Title order={2}>Matricular aluno</Title>
      <Group align="flex-end" gap="xs" wrap="nowrap" maw={560}>
        <Select
          flex={1}
          aria-label="Aluno para matricular"
          placeholder={
            alunos.isPending
              ? 'Carregando alunos…'
              : disponiveis.length
                ? 'Escolha um aluno'
                : 'Todos os alunos já estão nesta turma'
          }
          disabled={disponiveis.length === 0}
          searchable
          nothingFoundMessage="Nenhum aluno encontrado"
          data={disponiveis.map((a) => ({ value: String(a.id), label: `${a.nome} (RA ${a.ra})` }))}
          value={escolhido}
          onChange={setEscolhido}
        />
        <Button onClick={matricular} loading={enviando} disabled={!escolhido}>
          Matricular
        </Button>
      </Group>
      <Text size="xs" c="dimmed">
        A matrícula começa com frequência 0% e situação Cursando.
      </Text>
    </Stack>
  );
}
