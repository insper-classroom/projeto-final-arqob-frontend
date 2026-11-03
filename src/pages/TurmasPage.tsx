import { Anchor, Button, Group, Stack, Table, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { queries } from '../api/queries';
import type { Turma } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { Carregando, Erro, Vazio } from '../components/Estado';
import { Superficie } from '../components/Superficie';
import { TurmaFormulario } from './cadastros/TurmaFormulario';
import { useCadastro } from './cadastros/useCadastro';

export function TurmasPage() {
  const { me } = useAuth();
  const ehProfessor = me?.perfil === 'PROFESSOR';
  const { data, error, isPending } = useQuery(queries.turmas());
  const cadastro = useCadastro<Turma>({ rota: '/turmas', nome: 'Turma', feminino: true, invalidar: [['turmas']] });

  // Professor vê só as turmas em que dá aula; master vê todas
  const turmas = (data ?? [])
    .filter((turma) => !ehProfessor || turma.disciplina?.professor?.id === me?.idProfessor)
    .toSorted(
      (a, b) =>
        (b.semestre ?? '').localeCompare(a.semestre ?? '') ||
        (a.disciplina?.nome ?? '').localeCompare(b.disciplina?.nome ?? ''),
    );

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <Title order={1}>{ehProfessor ? 'Minhas turmas' : 'Turmas'}</Title>
        {!ehProfessor && <Button onClick={() => cadastro.abrir(null)}>Nova turma</Button>}
      </Group>

      {isPending ? (
        <Carregando />
      ) : error ? (
        <Erro erro={error} />
      ) : turmas.length === 0 ? (
        <Vazio titulo={ehProfessor ? 'Você ainda não dá aula em nenhuma turma.' : 'Nenhuma turma cadastrada.'}>
          {ehProfessor
            ? 'As turmas das suas disciplinas aparecem aqui assim que a secretaria as cadastrar.'
            : 'Cadastre disciplinas e turmas pela API para que elas apareçam aqui.'}
        </Vazio>
      ) : (
        <Superficie>
          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Disciplina</Table.Th>
                  <Table.Th>Turma</Table.Th>
                  <Table.Th>Semestre</Table.Th>
                  <Table.Th>Horário</Table.Th>
                  <Table.Th>Sala</Table.Th>
                  {!ehProfessor && <Table.Th>Professor</Table.Th>}
                  {!ehProfessor && <Table.Th />}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {turmas.map((turma) => (
                  <Table.Tr key={turma.id}>
                    <Table.Td>
                      <Anchor component={Link} to={`/turmas/${turma.id}`} fw={700}>
                        {turma.disciplina?.nome}
                      </Anchor>
                    </Table.Td>
                    <Table.Td>{turma.codigo}</Table.Td>
                    <Table.Td>{turma.semestre}</Table.Td>
                    <Table.Td>{turma.horario}</Table.Td>
                    <Table.Td>
                      {turma.sala ? `Prédio ${turma.sala.predio}, sala ${turma.sala.numero}` : '—'}
                    </Table.Td>
                    {!ehProfessor && <Table.Td>{turma.disciplina?.professor?.nome}</Table.Td>}
                    {!ehProfessor && (
                      <Table.Td ta="right">
                        <Button size="compact-sm" variant="subtle" onClick={() => cadastro.abrir(turma)}>
                          Editar
                        </Button>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Superficie>
      )}
      {cadastro.aberto && <TurmaFormulario key={cadastro.emEdicao?.id ?? 'nova'} cadastro={cadastro} />}
    </Stack>
  );
}
