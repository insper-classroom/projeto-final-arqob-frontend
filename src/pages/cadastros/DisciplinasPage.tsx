import { NumberInput, Select, SimpleGrid, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { queries } from '../../api/queries';
import type { Disciplina } from '../../api/types';
import { FormModal } from './FormModal';
import { TabelaCadastro } from './TabelaCadastro';
import { useCadastro, type Cadastro } from './useCadastro';
import { validar } from './validacoes';

export function DisciplinasPage() {
  const { data, error, isPending } = useQuery(queries.disciplinas());
  const cadastro = useCadastro<Disciplina>({
    rota: '/disciplinas',
    nome: 'Disciplina',
    feminino: true,
    invalidar: [['disciplinas'], ['turmas'], ['cursos']],
  });

  return (
    <>
      <TabelaCadastro
        titulo="Disciplinas"
        descricao="O professor responsável pela disciplina é quem lança as notas das turmas dela."
        rotuloNovo="Nova disciplina"
        onNovo={() => cadastro.abrir(null)}
        itens={data}
        carregando={isPending}
        erro={error}
        chave={(d) => d.id}
        textoBusca={(d) => `${d.codigo} ${d.nome} ${d.professor?.nome ?? ''}`}
        onEditar={(d) => cadastro.abrir(d)}
        vazio="Nenhuma disciplina cadastrada."
        colunas={[
          { titulo: 'Disciplina', valor: (d) => <strong>{d.nome}</strong> },
          { titulo: 'Código', valor: (d) => d.codigo },
          { titulo: 'Professor', valor: (d) => d.professor?.nome ?? '—' },
          { titulo: 'Carga horária', valor: (d) => `${d.cargaHoraria} h`, alinhar: 'right' },
        ]}
      />
      {cadastro.aberto && <FormularioDisciplina key={cadastro.emEdicao?.id ?? 'nova'} cadastro={cadastro} />}
    </>
  );
}

function FormularioDisciplina({ cadastro }: { cadastro: Cadastro<Disciplina> }) {
  const disciplina = cadastro.emEdicao;
  const professores = useQuery(queries.professores());
  const form = useForm({
    initialValues: {
      nome: disciplina?.nome ?? '',
      codigo: disciplina?.codigo ?? '',
      cargaHoraria: (disciplina?.cargaHoraria ?? '') as number | string,
      idProfessor: disciplina?.professor?.id != null ? String(disciplina.professor.id) : (null as string | null),
    },
    validate: {
      nome: validar.obrigatorio('Informe o nome'),
      codigo: validar.obrigatorio('Informe o código'),
      cargaHoraria: validar.positivo('A carga horária precisa ser maior que zero'),
      idProfessor: validar.selecionado('Escolha o professor responsável'),
    },
  });

  return (
    <FormModal
      aberto
      titulo={cadastro.editando ? 'Editar disciplina' : 'Nova disciplina'}
      rotuloSalvar={cadastro.editando ? 'Salvar disciplina' : 'Cadastrar disciplina'}
      salvando={cadastro.salvando}
      erro={cadastro.erro}
      onFechar={cadastro.fechar}
      onEnviar={form.onSubmit((v) =>
        cadastro.salvar(
          {
            nome: v.nome.trim(),
            codigo: v.codigo.trim(),
            cargaHoraria: Number(v.cargaHoraria),
            idProfessor: Number(v.idProfessor),
          },
          v.nome.trim(),
        ),
      )}
    >
      <TextInput label="Nome" data-autofocus {...form.getInputProps('nome')} />
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput label="Código" placeholder="ARQ101" {...form.getInputProps('codigo')} />
        <NumberInput
          label="Carga horária"
          suffix=" h"
          min={1}
          allowDecimal={false}
          allowNegative={false}
          {...form.getInputProps('cargaHoraria')}
        />
      </SimpleGrid>
      <Select
        label="Professor responsável"
        placeholder={professores.isPending ? 'Carregando professores…' : 'Escolha o professor'}
        searchable
        nothingFoundMessage="Nenhum professor encontrado"
        data={(professores.data ?? []).map((p) => ({ value: String(p.id), label: p.nome ?? '' }))}
        {...form.getInputProps('idProfessor')}
      />
    </FormModal>
  );
}
