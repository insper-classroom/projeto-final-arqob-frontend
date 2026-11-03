import { Select, SimpleGrid, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { queries } from '../../api/queries';
import type { Turma } from '../../api/types';
import { FormModal } from './FormModal';
import type { Cadastro } from './useCadastro';
import { validar } from './validacoes';

// Criação e edição de turma (só o master chega aqui)
export function TurmaFormulario({ cadastro }: { cadastro: Cadastro<Turma> }) {
  const turma = cadastro.emEdicao;
  const disciplinas = useQuery(queries.disciplinas());
  const salas = useQuery(queries.salas());
  const form = useForm({
    initialValues: {
      codigo: turma?.codigo ?? '',
      semestre: turma?.semestre ?? '',
      horario: turma?.horario ?? '',
      idDisciplina: turma?.disciplina?.id != null ? String(turma.disciplina.id) : (null as string | null),
      idSala: turma?.sala?.id != null ? String(turma.sala.id) : (null as string | null),
    },
    validate: {
      codigo: validar.obrigatorio('Informe o código da turma'),
      semestre: validar.obrigatorio('Informe o semestre'),
      horario: validar.obrigatorio('Informe o horário'),
      idDisciplina: validar.selecionado('Escolha a disciplina'),
      idSala: validar.selecionado('Escolha a sala'),
    },
  });

  return (
    <FormModal
      aberto
      titulo={cadastro.editando ? 'Editar turma' : 'Nova turma'}
      rotuloSalvar={cadastro.editando ? 'Salvar turma' : 'Cadastrar turma'}
      salvando={cadastro.salvando}
      erro={cadastro.erro}
      onFechar={cadastro.fechar}
      onEnviar={form.onSubmit((v) =>
        cadastro.salvar(
          {
            codigo: v.codigo.trim(),
            semestre: v.semestre.trim(),
            horario: v.horario.trim(),
            idDisciplina: Number(v.idDisciplina),
            idSala: Number(v.idSala),
          },
          v.codigo.trim(),
        ),
      )}
    >
      <Select
        label="Disciplina"
        placeholder={disciplinas.isPending ? 'Carregando disciplinas…' : 'Escolha a disciplina'}
        searchable
        nothingFoundMessage="Nenhuma disciplina encontrada"
        description="O professor da disciplina é quem lança as notas da turma."
        data={(disciplinas.data ?? []).map((d) => ({
          value: String(d.id),
          label: `${d.nome} (${d.codigo}), ${d.professor?.nome ?? 'sem professor'}`,
        }))}
        data-autofocus
        {...form.getInputProps('idDisciplina')}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput label="Código da turma" placeholder="T1" {...form.getInputProps('codigo')} />
        <TextInput label="Semestre" placeholder="2026.2" {...form.getInputProps('semestre')} />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput label="Horário" placeholder="SEG 19:00-21:00" {...form.getInputProps('horario')} />
        <Select
          label="Sala"
          placeholder={salas.isPending ? 'Carregando salas…' : 'Escolha a sala'}
          searchable
          nothingFoundMessage="Nenhuma sala encontrada"
          data={(salas.data ?? []).map((s) => ({
            value: String(s.id),
            label: `Prédio ${s.predio}, sala ${s.numero} (${s.capacidade} lugares)`,
          }))}
          {...form.getInputProps('idSala')}
        />
      </SimpleGrid>
    </FormModal>
  );
}
