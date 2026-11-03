import { PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { queries } from '../../api/queries';
import type { Professor } from '../../api/types';
import { FormModal } from './FormModal';
import { TabelaCadastro } from './TabelaCadastro';
import { useCadastro, type Cadastro } from './useCadastro';
import { validar } from './validacoes';

export function ProfessoresPage() {
  const { data, error, isPending } = useQuery(queries.professores());
  const cadastro = useCadastro<Professor>({
    rota: '/professores',
    nome: 'Professor',
    invalidar: [['professores'], ['turmas'], ['disciplinas'], ['cursos']],
  });

  return (
    <>
      <TabelaCadastro
        titulo="Professores"
        descricao="Cada professor tem um login próprio para lançar notas nas turmas das suas disciplinas."
        rotuloNovo="Novo professor"
        onNovo={() => cadastro.abrir(null)}
        itens={data}
        carregando={isPending}
        erro={error}
        chave={(p) => p.id}
        textoBusca={(p) => `${p.nome} ${p.email} ${p.titulacao ?? ''}`}
        onEditar={(p) => cadastro.abrir(p)}
        vazio="Nenhum professor cadastrado."
        colunas={[
          { titulo: 'Nome', valor: (p) => <strong>{p.nome}</strong> },
          { titulo: 'Email', valor: (p) => p.email },
          { titulo: 'Titulação', valor: (p) => p.titulacao || '—' },
        ]}
      />
      {cadastro.aberto && <FormularioProfessor key={cadastro.emEdicao?.id ?? 'novo'} cadastro={cadastro} />}
    </>
  );
}

function FormularioProfessor({ cadastro }: { cadastro: Cadastro<Professor> }) {
  const professor = cadastro.emEdicao;
  const form = useForm({
    initialValues: {
      nome: professor?.nome ?? '',
      email: professor?.email ?? '',
      titulacao: professor?.titulacao ?? '',
      senha: '',
    },
    validate: {
      nome: validar.obrigatorio('Informe o nome'),
      email: validar.email,
      senha: (valor) => (cadastro.editando ? null : validar.senha(valor)),
    },
  });

  return (
    <FormModal
      aberto
      titulo={cadastro.editando ? 'Editar professor' : 'Novo professor'}
      rotuloSalvar={cadastro.editando ? 'Salvar professor' : 'Cadastrar professor'}
      salvando={cadastro.salvando}
      erro={cadastro.erro}
      onFechar={cadastro.fechar}
      onEnviar={form.onSubmit((v) => {
        const corpo = { nome: v.nome.trim(), email: v.email.trim(), titulacao: v.titulacao.trim() || null };
        return cadastro.salvar(cadastro.editando ? corpo : { ...corpo, senha: v.senha }, corpo.nome);
      })}
    >
      <TextInput label="Nome" data-autofocus {...form.getInputProps('nome')} />
      <TextInput label="Email de acesso" type="email" {...form.getInputProps('email')} />
      <TextInput label="Titulação" placeholder="Mestre, Doutor…" {...form.getInputProps('titulacao')} />
      {!cadastro.editando && (
        <PasswordInput label="Senha inicial" description="Mínimo de 6 caracteres." {...form.getInputProps('senha')} />
      )}
    </FormModal>
  );
}
