import { Anchor, Stack, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { queries } from '../api/queries';
import { useAuth } from '../auth/AuthContext';
import { Carregando, Erro, Vazio } from '../components/Estado';
import { AvaliacoesTurma } from './turma/AvaliacoesTurma';
import { LancamentoNotas } from './turma/LancamentoNotas';
import { MatricularAluno } from './turma/MatricularAluno';

// Master e o professor da turma chegam aqui; a API recusa (403) o professor de outra turma
export function TurmaPage() {
  const idTurma = Number(useParams().idTurma);
  const { me } = useAuth();
  const turma = useQuery(queries.turma(idTurma));
  const matriculas = useQuery(queries.matriculasDaTurma(idTurma));
  const avaliacoes = useQuery(queries.avaliacoes());

  const avaliacoesDaTurma = (avaliacoes.data ?? [])
    .filter((avaliacao) => avaliacao.idTurma === idTurma)
    .toSorted((a, b) => (a.data ?? '').localeCompare(b.data ?? '') || (a.id ?? 0) - (b.id ?? 0));

  const erro = matriculas.error ?? avaliacoes.error ?? turma.error;

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Anchor component={Link} to="/turmas" size="sm">
          Voltar para as turmas
        </Anchor>
        {turma.data && (
          <div>
            <Title order={1}>{turma.data.disciplina?.nome}</Title>
            <Text c="dimmed" mt={4}>
              Turma {turma.data.codigo}, semestre {turma.data.semestre}, {turma.data.horario}
            </Text>
          </div>
        )}
      </Stack>

      {erro ? (
        <Erro erro={erro} />
      ) : !matriculas.data || !avaliacoes.data ? (
        <Carregando />
      ) : (
        <>
          <AvaliacoesTurma idTurma={idTurma} avaliacoes={avaliacoesDaTurma} />
          {me?.perfil === 'MASTER' && <MatricularAluno idTurma={idTurma} matriculas={matriculas.data} />}
          {matriculas.data.length === 0 ? (
            <Vazio titulo="Nenhum aluno matriculado nesta turma.">
              {me?.perfil === 'MASTER'
                ? 'Use "Matricular aluno" acima para incluir o primeiro.'
                : 'Os alunos aparecem aqui quando a secretaria registra as matrículas.'}
            </Vazio>
          ) : (
            <LancamentoNotas idTurma={idTurma} matriculas={matriculas.data} avaliacoes={avaliacoesDaTurma} />
          )}
        </>
      )}
    </Stack>
  );
}
