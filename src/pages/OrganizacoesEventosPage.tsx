import { Badge, Button, Group, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../api/client';
import { queries } from '../api/queries';
import type { Evento, Organizacao } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { Carregando, Erro, Vazio } from '../components/Estado';
import { Superficie } from '../components/Superficie';
import { formatarData } from '../format';
import classes from './OrganizacoesEventosPage.module.css';

const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function OrganizacoesEventosPage() {
  const { me } = useAuth();
  const idAluno = me?.idAluno;
  const queryClient = useQueryClient();
  const aluno = useQuery({ ...queries.aluno(idAluno ?? 0), enabled: idAluno != null });
  const organizacoes = useQuery(queries.organizacoes());
  const eventos = useQuery(queries.eventos());
  // Chave da ação em andamento, para mostrar o carregamento só no botão clicado
  const [emAndamento, setEmAndamento] = useState<string | null>(null);
  // Horário local no mesmo formato da API (LocalDateTime, sem fuso), fixado ao abrir a página
  const [agora] = useState(() => {
    const local = new Date();
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toISOString().slice(0, 19);
  });

  if (idAluno == null) {
    return (
      <Vazio titulo="Seu usuário não está ligado a um cadastro de aluno.">
        Peça à secretaria para concluir seu cadastro.
      </Vazio>
    );
  }

  const minhasOrganizacoes = new Set((aluno.data?.organizacoes ?? []).map((o) => o.id));
  const meusEventos = new Set((aluno.data?.eventos ?? []).map((e) => e.id));
  const proximos = (eventos.data ?? [])
    .filter((e) => (e.dataHora ?? '') > agora)
    .toSorted((a, b) => (a.dataHora ?? '').localeCompare(b.dataHora ?? ''));

  async function acao(chave: string, metodo: 'POST' | 'DELETE', caminho: string, sucesso: string) {
    setEmAndamento(chave);
    try {
      await api(caminho, { method: metodo });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['alunos', idAluno] }),
        queryClient.invalidateQueries({ queryKey: ['eventos'] }),
        queryClient.invalidateQueries({ queryKey: ['organizacoes'] }),
      ]);
      notifications.show({ color: 'verde', message: sucesso });
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message });
    } finally {
      setEmAndamento(null);
    }
  }

  const carregando = aluno.isPending || organizacoes.isPending || eventos.isPending;
  const erro = aluno.error ?? organizacoes.error ?? eventos.error;

  return (
    <Stack gap="xl">
      <div>
        <Title order={1}>Organizações e eventos</Title>
        <Text c="dimmed" mt={4}>
          Participe das organizações estudantis e garanta vaga nos eventos que elas promovem.
        </Text>
      </div>

      {carregando ? (
        <Carregando />
      ) : erro ? (
        <Erro erro={erro} />
      ) : (
        <>
          <Stack gap="sm">
            <Title order={2}>Próximos eventos</Title>
            {proximos.length === 0 ? (
              <Text c="dimmed">Nenhum evento marcado por enquanto.</Text>
            ) : (
              <Superficie>
                <div className={classes.lista}>
                  {proximos.map((evento) => (
                    <LinhaEvento
                      key={evento.id}
                      evento={evento}
                      inscrito={meusEventos.has(evento.id)}
                      carregando={emAndamento === `evento-${evento.id}`}
                      onInscrever={() =>
                        acao(`evento-${evento.id}`, 'POST', `/alunos/${idAluno}/eventos/${evento.id}`, `Inscrição em "${evento.nome}" feita.`)
                      }
                      onCancelar={() =>
                        acao(
                          `evento-${evento.id}`,
                          'DELETE',
                          `/alunos/${idAluno}/eventos/${evento.id}`,
                          `Inscrição em "${evento.nome}" cancelada.`,
                        )
                      }
                    />
                  ))}
                </div>
              </Superficie>
            )}
          </Stack>

          <Stack gap="sm">
            <Title order={2}>Organizações estudantis</Title>
            {(organizacoes.data ?? []).length === 0 ? (
              <Text c="dimmed">Nenhuma organização cadastrada ainda.</Text>
            ) : (
              <Superficie>
                <div className={classes.lista}>
                  {(organizacoes.data ?? []).map((organizacao) => (
                    <LinhaOrganizacao
                      key={organizacao.id}
                      organizacao={organizacao}
                      membro={minhasOrganizacoes.has(organizacao.id)}
                      carregando={emAndamento === `org-${organizacao.id}`}
                      onParticipar={() =>
                        acao(
                          `org-${organizacao.id}`,
                          'POST',
                          `/alunos/${idAluno}/organizacoes/${organizacao.id}`,
                          `Agora você participa de "${organizacao.nome}".`,
                        )
                      }
                      onSair={() =>
                        acao(
                          `org-${organizacao.id}`,
                          'DELETE',
                          `/alunos/${idAluno}/organizacoes/${organizacao.id}`,
                          `Você saiu de "${organizacao.nome}".`,
                        )
                      }
                    />
                  ))}
                </div>
              </Superficie>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
}

function LinhaEvento(props: {
  evento: Evento;
  inscrito: boolean;
  carregando: boolean;
  onInscrever: () => void;
  onCancelar: () => void;
}) {
  const { evento, inscrito } = props;
  const [data, hora = ''] = (evento.dataHora ?? '').split('T');
  const [, mes, dia] = data.split('-');
  const lotado = (evento.vagasRestantes ?? 0) === 0;

  return (
    <div className={classes.item}>
      <div className={classes.data} aria-hidden="true">
        <div className={classes.dia}>{dia}</div>
        <div className={classes.mes}>{meses[Number(mes) - 1]}</div>
      </div>
      <div>
        <Group gap="xs">
          <Text className={classes.titulo}>{evento.nome}</Text>
          {inscrito && (
            <Badge color="verde" variant="light" tt="none">
              Inscrito
            </Badge>
          )}
        </Group>
        <Text className={classes.detalhe}>
          {formatarData(data)} às {hora.slice(0, 5)}, prédio {evento.sala?.predio}, sala {evento.sala?.numero}
        </Text>
        <Text className={classes.detalhe}>
          {evento.organizacao?.nome},{' '}
          {lotado ? 'sem vagas' : `${evento.vagasRestantes} de ${evento.vagas} vagas livres`}
        </Text>
      </div>
      <div className={classes.acao}>
        {inscrito ? (
          <Button variant="subtle" color="red" onClick={props.onCancelar} loading={props.carregando}>
            Cancelar inscrição
          </Button>
        ) : (
          <Button onClick={props.onInscrever} loading={props.carregando} disabled={lotado}>
            {lotado ? 'Lotado' : 'Inscrever-se'}
          </Button>
        )}
      </div>
    </div>
  );
}

function LinhaOrganizacao(props: {
  organizacao: Organizacao;
  membro: boolean;
  carregando: boolean;
  onParticipar: () => void;
  onSair: () => void;
}) {
  const { organizacao, membro } = props;
  const total = organizacao.totalMembros ?? 0;
  return (
    <div className={classes.item}>
      <div className={classes.inicial} aria-hidden="true">
        {organizacao.nome.charAt(0)}
      </div>
      <div>
        <Group gap="xs">
          <Text className={classes.titulo}>{organizacao.nome}</Text>
          {membro && (
            <Badge color="verde" variant="light" tt="none">
              Você participa
            </Badge>
          )}
        </Group>
        <Text className={classes.detalhe}>
          {organizacao.tipo}, desde {formatarData(organizacao.dataFundacao).slice(-4)},{' '}
          {total === 1 ? '1 membro' : `${total} membros`}
        </Text>
      </div>
      <div className={classes.acao}>
        {membro ? (
          <Button variant="subtle" color="red" onClick={props.onSair} loading={props.carregando}>
            Sair
          </Button>
        ) : (
          <Button variant="light" onClick={props.onParticipar} loading={props.carregando}>
            Participar
          </Button>
        )}
      </div>
    </div>
  );
}
