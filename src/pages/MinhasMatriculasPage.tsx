import { Anchor, Stack, Table, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { queries } from '../api/queries';
import { useAuth } from '../auth/AuthContext';
import { Carregando, Erro, Vazio } from '../components/Estado';
import { StatusBadge } from '../components/StatusBadge';
import { Superficie } from '../components/Superficie';
import { formatarFrequencia, formatarNota } from '../format';

export function MinhasMatriculasPage() {
  const { me } = useAuth();
  const idAluno = me?.idAluno;
  const { data, error, isPending } = useQuery({ ...queries.matriculasDoAluno(idAluno ?? 0), enabled: idAluno != null });

  return (
    <Stack gap="lg">
      <Title order={1}>Minhas matrículas</Title>

      {idAluno == null ? (
        <Vazio titulo="Seu usuário não está ligado a um cadastro de aluno.">
          Peça à secretaria para concluir seu cadastro.
        </Vazio>
      ) : isPending ? (
        <Carregando />
      ) : error ? (
        <Erro erro={error} />
      ) : data.length === 0 ? (
        <Vazio titulo="Você ainda não está matriculado em nenhuma turma.">
          A matrícula é feita pela secretaria. Quando ela for registrada, a turma aparece aqui.
        </Vazio>
      ) : (
        <Superficie>
          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Disciplina</Table.Th>
                  <Table.Th>Turma</Table.Th>
                  <Table.Th ta="right">Frequência</Table.Th>
                  <Table.Th ta="right">Média final</Table.Th>
                  <Table.Th>Situação</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.map((matricula) => (
                  <Table.Tr key={matricula.id}>
                    <Table.Td>
                      <Anchor component={Link} to={`/matriculas/${matricula.id}/boletim`} fw={700}>
                        {matricula.nomeDisciplina}
                      </Anchor>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {matricula.codigoTurma}, {matricula.semestre}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">{formatarFrequencia(matricula.frequencia)}</Table.Td>
                    <Table.Td ta="right">{formatarNota(matricula.mediaFinal)}</Table.Td>
                    <Table.Td>
                      <StatusBadge status={matricula.status} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Superficie>
      )}
    </Stack>
  );
}
