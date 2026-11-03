import { PasswordInput, Select, SimpleGrid, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { queries } from '../../api/queries';
import type { Aluno } from '../../api/types';
import { formatarData } from '../../format';
import { FormModal } from './FormModal';
import { TabelaCadastro } from './TabelaCadastro';
import { useCadastro, type Cadastro } from './useCadastro';
import { validar } from './validacoes';

export function AlunosPage() {
  const { data, error, isPending } = useQuery(queries.alunos());
  const cadastro = useCadastro<Aluno>({
    rota: '/alunos',
    nome: 'Aluno',
    invalidar: [['alunos'], ['turmas'], ['matriculas']],
  });

  return (
    <>
      <TabelaCadastro
        titulo="Alunos"
        descricao="Cada aluno pertence a um curso e entra com o próprio email para ver matrículas e boletins."
        rotuloNovo="Novo aluno"
        onNovo={() => cadastro.abrir(null)}
        itens={data}
        carregando={isPending}
        erro={error}
        chave={(a) => a.id}
        textoBusca={(a) => `${a.nome} ${a.ra} ${a.email} ${a.curso?.nome ?? ''}`}
        onEditar={(a) => cadastro.abrir(a)}
        vazio="Nenhum aluno cadastrado."
        colunas={[
          { titulo: 'Nome', valor: (a) => <strong>{a.nome}</strong> },
          { titulo: 'RA', valor: (a) => a.ra },
          { titulo: 'Email', valor: (a) => a.email },
          { titulo: 'Curso', valor: (a) => a.curso?.nome ?? '—' },
          { titulo: 'Ingresso', valor: (a) => formatarData(a.dataIngresso) },
        ]}
      />
      {cadastro.aberto && <FormularioAluno key={cadastro.emEdicao?.id ?? 'novo'} cadastro={cadastro} />}
    </>
  );
}

function FormularioAluno({ cadastro }: { cadastro: Cadastro<Aluno> }) {
  const aluno = cadastro.emEdicao;
  const cursos = useQuery(queries.cursos());
  const form = useForm({
    initialValues: {
      nome: aluno?.nome ?? '',
      email: aluno?.email ?? '',
      ra: aluno?.ra ?? '',
      dataIngresso: aluno?.dataIngresso ?? '',
      idCurso: aluno?.curso?.id != null ? String(aluno.curso.id) : (null as string | null),
      senha: '',
    },
    validate: {
      nome: validar.obrigatorio('Informe o nome'),
      email: validar.email,
      ra: validar.obrigatorio('Informe o RA'),
      dataIngresso: validar.obrigatorio('Informe a data de ingresso'),
      idCurso: validar.selecionado('Escolha o curso'),
      senha: (valor) => (cadastro.editando ? null : validar.senha(valor)),
    },
  });

  return (
    <FormModal
      aberto
      titulo={cadastro.editando ? 'Editar aluno' : 'Novo aluno'}
      rotuloSalvar={cadastro.editando ? 'Salvar aluno' : 'Cadastrar aluno'}
      salvando={cadastro.salvando}
      erro={cadastro.erro}
      onFechar={cadastro.fechar}
      onEnviar={form.onSubmit((v) => {
        const corpo = {
          nome: v.nome.trim(),
          email: v.email.trim(),
          ra: v.ra.trim(),
          dataIngresso: v.dataIngresso,
          idCurso: Number(v.idCurso),
        };
        return cadastro.salvar(cadastro.editando ? corpo : { ...corpo, senha: v.senha }, corpo.nome);
      })}
    >
      <TextInput label="Nome" data-autofocus {...form.getInputProps('nome')} />
      <TextInput label="Email de acesso" type="email" {...form.getInputProps('email')} />
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput label="RA" {...form.getInputProps('ra')} />
        <TextInput label="Data de ingresso" type="date" {...form.getInputProps('dataIngresso')} />
      </SimpleGrid>
      <Select
        label="Curso"
        placeholder={cursos.isPending ? 'Carregando cursos…' : 'Escolha o curso'}
        searchable
        nothingFoundMessage="Nenhum curso encontrado"
        data={(cursos.data ?? []).map((c) => ({ value: String(c.id), label: c.nome ?? '' }))}
        {...form.getInputProps('idCurso')}
      />
      {!cadastro.editando && (
        <PasswordInput label="Senha inicial" description="Mínimo de 6 caracteres." {...form.getInputProps('senha')} />
      )}
    </FormModal>
  );
}
