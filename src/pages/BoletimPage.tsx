import { Anchor, Group, Stack, Table, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useParams } from 'react-router-dom';
import { queries } from '../api/queries';
import type { Boletim, Matricula } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { Carregando, Erro, Vazio } from '../components/Estado';
import { StatusBadge } from '../components/StatusBadge';
import { Superficie } from '../components/Superficie';
import { formatarFrequencia, formatarNota, formatarPeso } from '../format';
import classes from './BoletimPage.module.css';

// Dados da turma: vêm da tela anterior (professor e master) ou das matrículas do aluno logado
function useMatriculaDoBoletim(idMatricula: number): Matricula | undefined {
  const { me } = useAuth();
  const location = useLocation();
  const doEstado = (location.state as { matricula?: Matricula } | null)?.matricula;
  const idAluno = me?.perfil === 'ALUNO' ? me.idAluno : undefined;
  const { data } = useQuery({ ...queries.matriculasDoAluno(idAluno ?? 0), enabled: idAluno != null && !doEstado });
  return doEstado ?? data?.find((m) => m.id === idMatricula);
}

export function BoletimPage() {
  const idMatricula = Number(useParams().idMatricula);
  const { me } = useAuth();
  const matricula = useMatriculaDoBoletim(idMatricula);
  const { data: boletim, error, isPending } = useQuery(queries.boletim(idMatricula));

  const voltar =
    me?.perfil === 'ALUNO'
      ? { para: '/matriculas', rotulo: 'Minhas matrículas' }
      : { para: matricula ? `/turmas/${matricula.idTurma}` : '/turmas', rotulo: 'Voltar para a turma' };

  return (
    <Stack gap="lg">
      <Anchor component={Link} to={voltar.para} size="sm">
        {voltar.rotulo}
      </Anchor>
      <Title order={1}>Boletim{matricula?.nomeAluno && me?.perfil !== 'ALUNO' ? ` de ${matricula.nomeAluno}` : ''}</Title>

      {isPending ? <Carregando /> : error ? <Erro erro={error} /> : <Quadro boletim={boletim} matricula={matricula} />}

      {boletim && <TabelaNotas boletim={boletim} />}
    </Stack>
  );
}

function Quadro({ boletim, matricula }: { boletim: Boletim; matricula: Matricula | undefined }) {
  const notas = boletim.notas ?? [];
  const pesoLancado = notas.reduce((soma, nota) => soma + (nota.peso ?? 0), 0);
  const fechado = boletim.status !== 'CURSANDO';
  // Enquanto faltam notas, a média é a soma de pontos já obtidos, não a média final
  const legenda = fechado
    ? 'Média final'
    : notas.length === 0
      ? 'Nenhuma nota lançada ainda'
      : `Pontos acumulados, de ${formatarNota(pesoLancado * 10)} possíveis até agora`;

  return (
    <section className={classes.quadro} aria-label="Resumo do boletim">
      <div className={classes.painel}>
        {matricula && (
          <>
            <p className={classes.disciplina}>{matricula.nomeDisciplina}</p>
            <p className={classes.turma}>
              Turma {matricula.codigoTurma}, semestre {matricula.semestre}
            </p>
          </>
        )}

        <div className={classes.numeros}>
          <div>
            <div className={classes.media}>{formatarNota(boletim.media)}</div>
            <div className={classes.legenda}>{legenda}</div>
          </div>
          <div>
            <div className={classes.dado}>{formatarFrequencia(boletim.frequencia)}</div>
            <div className={classes.legenda}>Frequência</div>
          </div>
          <div>
            <StatusBadge status={boletim.status} sobreEscuro />
            <div className={classes.legenda}>Situação</div>
          </div>
        </div>

        <div className={classes.barra} role="img" aria-label={`${formatarPeso(pesoLancado)} das avaliações com nota`}>
          {notas.map((nota) => (
            <div
              key={nota.idAvaliacao}
              className={classes.segmento}
              style={{ flexGrow: nota.peso ?? 0, flexBasis: 0 }}
              title={`${nota.tipoAvaliacao}: ${formatarNota(nota.valor)}`}
            >
              <div className={classes.preenchimento} style={{ transform: `scaleX(${(nota.valor ?? 0) / 10})` }} />
            </div>
          ))}
          {pesoLancado < 1 && <div className={classes.pendente} style={{ flexGrow: 1 - pesoLancado, flexBasis: 0 }} />}
        </div>
        <div className={classes.legendaBarra}>
          <span>Cada trecho é uma avaliação, do tamanho do seu peso, preenchido conforme a nota.</span>
          {pesoLancado < 1 && <span>Tracejado: {formatarPeso(1 - pesoLancado)} das avaliações sem nota.</span>}
        </div>
      </div>
    </section>
  );
}

function TabelaNotas({ boletim }: { boletim: Boletim }) {
  const notas = boletim.notas ?? [];
  if (notas.length === 0) {
    return (
      <Vazio titulo="Nenhuma nota lançada.">As notas aparecem aqui conforme o professor lança cada avaliação.</Vazio>
    );
  }

  return (
    <Stack gap="xs">
      <Title order={2}>Notas por avaliação</Title>
      <Superficie>
        <Table.ScrollContainer minWidth={480}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Avaliação</Table.Th>
                <Table.Th ta="right">Peso</Table.Th>
                <Table.Th ta="right">Nota</Table.Th>
                <Table.Th ta="right">Pontos na média</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {notas.map((nota) => (
                <Table.Tr key={nota.idAvaliacao}>
                  <Table.Td>{nota.tipoAvaliacao}</Table.Td>
                  <Table.Td ta="right">{formatarPeso(nota.peso)}</Table.Td>
                  <Table.Td ta="right">{formatarNota(nota.valor)}</Table.Td>
                  <Table.Td ta="right">{formatarNota((nota.valor ?? 0) * (nota.peso ?? 0))}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Superficie>
      <Group>
        <Text size="sm" c="dimmed">
          A média é a soma dos pontos: nota vezes peso de cada avaliação. Aprovação com média 6 e frequência de 75%.
        </Text>
      </Group>
    </Stack>
  );
}
