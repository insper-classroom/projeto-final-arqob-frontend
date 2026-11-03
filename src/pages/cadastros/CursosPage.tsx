import { Badge, Button, Group, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../api/client';
import { queries } from '../../api/queries';
import type { Curso } from '../../api/types';
import { FormModal } from './FormModal';
import { TabelaCadastro } from './TabelaCadastro';
import { useCadastro, type Cadastro } from './useCadastro';
import { validar } from './validacoes';

export function CursosPage() {
  const { data, error, isPending } = useQuery(queries.cursos());
  const cadastro = useCadastro<Curso>({ rota: '/cursos', nome: 'Curso', invalidar: [['cursos'], ['alunos']] });

  return (
    <>
      <TabelaCadastro
        titulo="Cursos"
        descricao="Cada curso tem um professor coordenador e uma grade de disciplinas. Um professor coordena no máximo um curso."
        rotuloNovo="Novo curso"
        onNovo={() => cadastro.abrir(null)}
        itens={data}
        carregando={isPending}
        erro={error}
        chave={(c) => c.id}
        textoBusca={(c) => `${c.nome} ${c.coordenador?.nome ?? ''}`}
        onEditar={(c) => cadastro.abrir(c)}
        vazio="Nenhum curso cadastrado."
        colunas={[
          { titulo: 'Curso', valor: (c) => <strong>{c.nome}</strong> },
          { titulo: 'Coordenador', valor: (c) => c.coordenador?.nome ?? '—' },
          { titulo: 'Duração', valor: (c) => `${c.duracaoSemestres} semestres`, alinhar: 'right' },
          { titulo: 'Disciplinas', valor: (c) => c.disciplinas?.length ?? 0, alinhar: 'right' },
        ]}
      />
      {cadastro.aberto && <FormularioCurso key={cadastro.emEdicao?.id ?? 'novo'} cadastro={cadastro} cursos={data ?? []} />}
    </>
  );
}

function FormularioCurso({ cadastro, cursos }: { cadastro: Cadastro<Curso>; cursos: Curso[] }) {
  const curso = cadastro.emEdicao;
  const professores = useQuery(queries.professores());
  const form = useForm({
    initialValues: {
      nome: curso?.nome ?? '',
      duracaoSemestres: (curso?.duracaoSemestres ?? '') as number | string,
      idCoordenador: curso?.coordenador?.id != null ? String(curso.coordenador.id) : (null as string | null),
    },
    validate: {
      nome: validar.obrigatorio('Informe o nome'),
      duracaoSemestres: validar.positivo('A duração precisa ser maior que zero'),
      idCoordenador: validar.selecionado('Escolha o coordenador'),
    },
  });

  // Professor que já coordena outro curso aparece desabilitado, com o curso ao lado
  const coordenadorDe = new Map(
    cursos.filter((c) => c.id !== curso?.id).map((c) => [c.coordenador?.id, c.nome] as const),
  );

  return (
    <FormModal
      aberto
      titulo={cadastro.editando ? 'Editar curso' : 'Novo curso'}
      rotuloSalvar={cadastro.editando ? 'Salvar curso' : 'Cadastrar curso'}
      salvando={cadastro.salvando}
      erro={cadastro.erro}
      onFechar={cadastro.fechar}
      onEnviar={form.onSubmit((v) =>
        cadastro.salvar(
          { nome: v.nome.trim(), duracaoSemestres: Number(v.duracaoSemestres), idCoordenador: Number(v.idCoordenador) },
          v.nome.trim(),
        ),
      )}
    >
      <TextInput label="Nome" data-autofocus {...form.getInputProps('nome')} />
      <NumberInput
        label="Duração"
        suffix=" semestres"
        min={1}
        allowDecimal={false}
        allowNegative={false}
        {...form.getInputProps('duracaoSemestres')}
      />
      <Select
        label="Coordenador"
        placeholder={professores.isPending ? 'Carregando professores…' : 'Escolha o professor'}
        searchable
        nothingFoundMessage="Nenhum professor encontrado"
        data={(professores.data ?? []).map((p) => {
          const outroCurso = coordenadorDe.get(p.id);
          return {
            value: String(p.id),
            label: outroCurso ? `${p.nome} (coordena ${outroCurso})` : (p.nome ?? ''),
            disabled: Boolean(outroCurso),
          };
        })}
        {...form.getInputProps('idCoordenador')}
      />
      {cadastro.editando && curso?.id != null && <DisciplinasDoCurso idCurso={curso.id} />}
    </FormModal>
  );
}

// A grade do curso muda na hora, sem depender do botão de salvar do formulário
function DisciplinasDoCurso({ idCurso }: { idCurso: number }) {
  const queryClient = useQueryClient();
  const cursos = useQuery(queries.cursos());
  const disciplinas = useQuery(queries.disciplinas());
  const [escolhida, setEscolhida] = useState<string | null>(null);
  const [adicionando, setAdicionando] = useState(false);

  const naGrade = cursos.data?.find((c) => c.id === idCurso)?.disciplinas ?? [];
  const idsNaGrade = new Set(naGrade.map((d) => d.id));
  const disponiveis = (disciplinas.data ?? []).filter((d) => !idsNaGrade.has(d.id));

  async function adicionar() {
    if (!escolhida) return;
    setAdicionando(true);
    try {
      await api(`/cursos/${idCurso}/disciplinas/${escolhida}`, { method: 'POST' });
      await queryClient.invalidateQueries({ queryKey: ['cursos'] });
      notifications.show({ color: 'verde', message: 'Disciplina adicionada ao curso.' });
      setEscolhida(null);
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message });
    } finally {
      setAdicionando(false);
    }
  }

  return (
    <Stack gap="xs" pt="xs">
      <Text fw={700}>Disciplinas do curso</Text>
      {naGrade.length === 0 ? (
        <Text size="sm" c="dimmed">
          Nenhuma disciplina na grade ainda.
        </Text>
      ) : (
        <Group gap={6}>
          {naGrade.map((d) => (
            <Badge key={d.id} variant="light" color="azul" tt="none" size="lg">
              {d.nome}
            </Badge>
          ))}
        </Group>
      )}
      <Group align="flex-end" gap="xs" wrap="nowrap">
        <Select
          flex={1}
          aria-label="Disciplina para adicionar"
          placeholder={disponiveis.length ? 'Escolha uma disciplina' : 'Todas as disciplinas já estão no curso'}
          disabled={disponiveis.length === 0}
          searchable
          data={disponiveis.map((d) => ({ value: String(d.id), label: `${d.nome} (${d.codigo})` }))}
          value={escolhida}
          onChange={setEscolhida}
        />
        <Button variant="light" onClick={adicionar} loading={adicionando} disabled={!escolhida}>
          Adicionar
        </Button>
      </Group>
      <Text size="xs" c="dimmed">
        A API ainda não permite tirar uma disciplina da grade.
      </Text>
    </Stack>
  );
}
