import { Alert, Anchor, Button, Group, NumberInput, Stack, Table, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../../api/client';
import { queries } from '../../api/queries';
import type { Avaliacao, Matricula } from '../../api/types';
import { StatusBadge } from '../../components/StatusBadge';
import { Superficie } from '../../components/Superficie';
import { formatarNota } from '../../format';
import classes from './LancamentoNotas.module.css';

type Valor = number | string;

const chaveNota = (idMatricula: number, idAvaliacao: number) => `nota:${idMatricula}:${idAvaliacao}`;
const chaveFrequencia = (idMatricula: number) => `freq:${idMatricula}`;

interface Alteracao {
  chave: string;
  descricao: string;
  enviar: () => Promise<unknown>;
}

interface Props {
  idTurma: number;
  matriculas: Matricula[];
  avaliacoes: Avaliacao[];
}

export function LancamentoNotas({ idTurma, matriculas, avaliacoes }: Props) {
  const queryClient = useQueryClient();
  const [rascunho, setRascunho] = useState<Record<string, Valor>>({});
  const [falhas, setFalhas] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  // Notas atuais vêm do boletim de cada matrícula
  const boletins = useQueries({ queries: matriculas.map((m) => queries.boletim(m.id ?? 0)) });
  const notaAtual = new Map<string, number>();
  boletins.forEach((consulta, i) => {
    for (const nota of consulta.data?.notas ?? []) {
      if (nota.idAvaliacao != null && nota.valor != null) {
        notaAtual.set(chaveNota(matriculas[i].id ?? 0, nota.idAvaliacao), nota.valor);
      }
    }
  });
  const carregandoNotas = boletins.some((consulta) => consulta.isPending);

  const alteracoes: Alteracao[] = [];
  for (const matricula of matriculas) {
    const idMatricula = matricula.id ?? 0;
    for (const avaliacao of avaliacoes) {
      const chave = chaveNota(idMatricula, avaliacao.id ?? 0);
      const valor = rascunho[chave];
      if (valor === undefined || valor === '' || Number(valor) === notaAtual.get(chave)) continue;
      alteracoes.push({
        chave,
        descricao: `${avaliacao.tipo} de ${matricula.nomeAluno}`,
        enviar: () =>
          api('/notas', { method: 'POST', body: { idMatricula, idAvaliacao: avaliacao.id, valor: Number(valor) } }),
      });
    }
    const chave = chaveFrequencia(idMatricula);
    const frequencia = rascunho[chave];
    if (frequencia !== undefined && frequencia !== '' && Number(frequencia) !== matricula.frequencia) {
      alteracoes.push({
        chave,
        descricao: `frequência de ${matricula.nomeAluno}`,
        enviar: () =>
          api(`/matriculas/${idMatricula}/frequencia`, { method: 'PATCH', body: { frequencia: Number(frequencia) } }),
      });
    }
  }

  // Avisa antes de sair da página com alterações não salvas
  const temAlteracoes = alteracoes.length > 0;
  useEffect(() => {
    if (!temAlteracoes) return;
    const aviso = (evento: BeforeUnloadEvent) => evento.preventDefault();
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, [temAlteracoes]);

  function alterar(chave: string, valor: Valor) {
    setRascunho((atual) => ({ ...atual, [chave]: valor }));
    setFalhas((atual) => {
      const resto = { ...atual };
      delete resto[chave];
      return resto;
    });
  }

  async function salvar() {
    setSalvando(true);
    const novasFalhas: Record<string, string> = {};
    const salvas: string[] = [];
    // Uma por vez: cada envio recalcula a situação da matrícula na API
    for (const alteracao of alteracoes) {
      try {
        await alteracao.enviar();
        salvas.push(alteracao.chave);
      } catch (e) {
        novasFalhas[alteracao.chave] = e instanceof ApiError ? e.message : 'Falha ao salvar';
      }
    }

    setRascunho((atual) => Object.fromEntries(Object.entries(atual).filter(([chave]) => !salvas.includes(chave))));
    setFalhas(novasFalhas);
    await queryClient.invalidateQueries({ queryKey: ['matriculas'] });
    await queryClient.invalidateQueries({ queryKey: ['turmas', idTurma, 'matriculas'] });
    setSalvando(false);

    const quantasFalharam = Object.keys(novasFalhas).length;
    if (quantasFalharam === 0) {
      notifications.show({ color: 'verde', message: salvas.length === 1 ? '1 alteração salva.' : `${salvas.length} alterações salvas.` });
    } else {
      notifications.show({
        color: 'red',
        message: `${salvas.length} salvas, ${quantasFalharam} não. Os campos com problema estão marcados.`,
      });
    }
  }

  return (
    <Stack gap="sm">
      <Title order={2}>Notas e frequência</Title>
      <Text size="sm" c="dimmed">
        {avaliacoes.length === 0
          ? 'A turma ainda não tem avaliações: crie uma acima para abrir as colunas de nota. A frequência já pode ser lançada.'
          : 'Notas de 0 a 10 e frequência de 0 a 100%. Os campos alterados ficam destacados até você salvar.'}
      </Text>

      {boletins.some((consulta) => consulta.error) && (
        <Alert color="red" variant="light">
          Algumas notas não puderam ser carregadas. Recarregue a página antes de lançar.
        </Alert>
      )}

      <Superficie>
        <Table.ScrollContainer minWidth={320 + avaliacoes.length * 110}>
          <Table verticalSpacing="xs" withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className={classes.colunaAluno}>Aluno</Table.Th>
                {avaliacoes.map((avaliacao) => (
                  <Table.Th key={avaliacao.id} className={classes.colunaNota}>
                    {avaliacao.tipo}
                    <Text span size="xs" c="dimmed" display="block" fw={400}>
                      peso {Math.round((avaliacao.peso ?? 0) * 100)}%
                    </Text>
                  </Table.Th>
                ))}
                <Table.Th className={classes.colunaNota}>Frequência</Table.Th>
                <Table.Th ta="right">Média</Table.Th>
                <Table.Th>Situação</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {matriculas.map((matricula, i) => {
                const idMatricula = matricula.id ?? 0;
                const boletim = boletins[i].data;
                return (
                  <Table.Tr key={idMatricula}>
                    <Table.Td>
                      <Anchor component={Link} to={`/matriculas/${idMatricula}/boletim`} state={{ matricula }} fw={700}>
                        {matricula.nomeAluno}
                      </Anchor>
                    </Table.Td>
                    {avaliacoes.map((avaliacao) => {
                      const chave = chaveNota(idMatricula, avaliacao.id ?? 0);
                      const original = notaAtual.get(chave);
                      const valor = rascunho[chave] ?? original ?? '';
                      const alterado = rascunho[chave] !== undefined && rascunho[chave] !== '' && Number(rascunho[chave]) !== original;
                      return (
                        <Table.Td key={avaliacao.id}>
                          <NumberInput
                            aria-label={`${avaliacao.tipo} de ${matricula.nomeAluno}`}
                            className={alterado ? classes.alterado : undefined}
                            value={valor}
                            onChange={(novo) => alterar(chave, novo)}
                            disabled={carregandoNotas || salvando}
                            min={0}
                            max={10}
                            clampBehavior="strict"
                            decimalScale={2}
                            decimalSeparator=","
                            allowNegative={false}
                            hideControls
                            placeholder="—"
                            error={falhas[chave]}
                          />
                        </Table.Td>
                      );
                    })}
                    <Table.Td>
                      {(() => {
                        const chave = chaveFrequencia(idMatricula);
                        const valor = rascunho[chave] ?? matricula.frequencia ?? '';
                        const alterado =
                          rascunho[chave] !== undefined && rascunho[chave] !== '' && Number(rascunho[chave]) !== matricula.frequencia;
                        return (
                          <NumberInput
                            aria-label={`Frequência de ${matricula.nomeAluno}`}
                            className={alterado ? classes.alterado : undefined}
                            value={valor}
                            onChange={(novo) => alterar(chave, novo)}
                            disabled={salvando}
                            min={0}
                            max={100}
                            clampBehavior="strict"
                            decimalScale={2}
                            decimalSeparator=","
                            allowNegative={false}
                            hideControls
                            suffix="%"
                            error={falhas[chave]}
                          />
                        );
                      })()}
                    </Table.Td>
                    <Table.Td ta="right">{formatarNota(boletim?.media)}</Table.Td>
                    <Table.Td>
                      <StatusBadge status={matricula.status} />
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Superficie>

      {temAlteracoes && (
        <Group className={classes.barraSalvar} justify="space-between">
          <Text fw={700}>
            {alteracoes.length === 1 ? '1 alteração não salva' : `${alteracoes.length} alterações não salvas`}
          </Text>
          <Group gap="xs">
            <Button
              variant="subtle"
              color="gray.0"
              onClick={() => {
                setRascunho({});
                setFalhas({});
              }}
              disabled={salvando}
            >
              Descartar
            </Button>
            <Button variant="gradient" gradient={{ from: '#2559a8', to: '#2cb04a', deg: 45 }} onClick={salvar} loading={salvando}>
              Salvar alterações
            </Button>
          </Group>
        </Group>
      )}
      <Text size="xs" c="dimmed">
        Uma nota lançada pode ser corrigida, mas não apagada: a API não tem exclusão de nota.
      </Text>
    </Stack>
  );
}
