import { SimpleGrid, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { queries } from '../../api/queries';
import type { Organizacao } from '../../api/types';
import { formatarData } from '../../format';
import { FormModal } from './FormModal';
import { ListaParticipantes } from './ListaParticipantes';
import { TabelaCadastro } from './TabelaCadastro';
import { useCadastro, type Cadastro } from './useCadastro';
import { validar } from './validacoes';

export function OrganizacoesPage() {
  const { data, error, isPending } = useQuery(queries.organizacoes());
  const cadastro = useCadastro<Organizacao>({
    rota: '/organizacoes-estudantis',
    nome: 'Organização',
    feminino: true,
    invalidar: [['organizacoes'], ['eventos']],
  });

  return (
    <>
      <TabelaCadastro
        titulo="Organizações estudantis"
        descricao="Atléticas, ligas e coletivos. Os alunos entram pela própria conta e as organizações promovem eventos."
        rotuloNovo="Nova organização"
        onNovo={() => cadastro.abrir(null)}
        itens={data}
        carregando={isPending}
        erro={error}
        chave={(o) => o.id}
        textoBusca={(o) => `${o.nome} ${o.tipo}`}
        onEditar={(o) => cadastro.abrir(o)}
        vazio="Nenhuma organização cadastrada."
        colunas={[
          { titulo: 'Organização', valor: (o) => <strong>{o.nome}</strong> },
          { titulo: 'Tipo', valor: (o) => o.tipo },
          { titulo: 'Fundação', valor: (o) => formatarData(o.dataFundacao) },
          { titulo: 'Membros', valor: (o) => o.totalMembros ?? 0, alinhar: 'right' },
        ]}
      />
      {cadastro.aberto && <FormularioOrganizacao key={cadastro.emEdicao?.id ?? 'nova'} cadastro={cadastro} />}
    </>
  );
}

function FormularioOrganizacao({ cadastro }: { cadastro: Cadastro<Organizacao> }) {
  const organizacao = cadastro.emEdicao;
  const form = useForm({
    initialValues: {
      nome: organizacao?.nome ?? '',
      tipo: organizacao?.tipo ?? '',
      dataFundacao: organizacao?.dataFundacao ?? '',
    },
    validate: {
      nome: validar.obrigatorio('Informe o nome'),
      tipo: validar.obrigatorio('Informe o tipo, como esportiva ou acadêmica'),
      dataFundacao: validar.obrigatorio('Informe a data de fundação'),
    },
  });

  return (
    <FormModal
      aberto
      titulo={cadastro.editando ? 'Editar organização' : 'Nova organização'}
      rotuloSalvar={cadastro.editando ? 'Salvar organização' : 'Cadastrar organização'}
      salvando={cadastro.salvando}
      erro={cadastro.erro}
      onFechar={cadastro.fechar}
      onEnviar={form.onSubmit((v) =>
        cadastro.salvar({ nome: v.nome.trim(), tipo: v.tipo.trim(), dataFundacao: v.dataFundacao }, v.nome.trim()),
      )}
    >
      <TextInput label="Nome" data-autofocus {...form.getInputProps('nome')} />
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput label="Tipo" placeholder="Esportiva, acadêmica…" {...form.getInputProps('tipo')} />
        <TextInput label="Data de fundação" type="date" {...form.getInputProps('dataFundacao')} />
      </SimpleGrid>
      {cadastro.editando && organizacao?.id != null && (
        <ListaParticipantes
          titulo="Membros"
          consulta={queries.membros(organizacao.id)}
          vazio="Nenhum aluno participa ainda. Os alunos entram pela tela Organizações e eventos."
        />
      )}
    </FormModal>
  );
}
