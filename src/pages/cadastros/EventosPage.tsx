import { NumberInput, Select, SimpleGrid, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { queries } from '../../api/queries';
import type { Evento } from '../../api/types';
import { formatarDataHora } from '../../format';
import { FormModal } from './FormModal';
import { ListaParticipantes } from './ListaParticipantes';
import { TabelaCadastro } from './TabelaCadastro';
import { useCadastro, type Cadastro } from './useCadastro';
import { validar } from './validacoes';

export function EventosPage() {
  const { data, error, isPending } = useQuery(queries.eventos());
  const cadastro = useCadastro<Evento>({ rota: '/eventos', nome: 'Evento', invalidar: [['eventos']] });
  const ordenados = data?.toSorted((a, b) => (b.dataHora ?? '').localeCompare(a.dataHora ?? ''));

  return (
    <>
      <TabelaCadastro
        titulo="Eventos"
        descricao="Cada evento pertence a uma organização e ocupa uma sala. As vagas não passam da capacidade da sala."
        rotuloNovo="Novo evento"
        onNovo={() => cadastro.abrir(null)}
        itens={ordenados}
        carregando={isPending}
        erro={error}
        chave={(e) => e.id}
        textoBusca={(e) => `${e.nome} ${e.organizacao?.nome ?? ''}`}
        onEditar={(e) => cadastro.abrir(e)}
        vazio="Nenhum evento cadastrado."
        colunas={[
          { titulo: 'Evento', valor: (e) => <strong>{e.nome}</strong> },
          { titulo: 'Organização', valor: (e) => e.organizacao?.nome ?? '—' },
          { titulo: 'Quando', valor: (e) => formatarDataHora(e.dataHora) },
          { titulo: 'Sala', valor: (e) => (e.sala ? `${e.sala.predio}, ${e.sala.numero}` : '—') },
          { titulo: 'Inscritos', valor: (e) => `${e.inscritos ?? 0} de ${e.vagas}`, alinhar: 'right' },
        ]}
      />
      {cadastro.aberto && <FormularioEvento key={cadastro.emEdicao?.id ?? 'novo'} cadastro={cadastro} />}
    </>
  );
}

function FormularioEvento({ cadastro }: { cadastro: Cadastro<Evento> }) {
  const evento = cadastro.emEdicao;
  const organizacoes = useQuery(queries.organizacoes());
  const salas = useQuery(queries.salas());
  const form = useForm({
    initialValues: {
      nome: evento?.nome ?? '',
      // O campo datetime-local usa "AAAA-MM-DDTHH:mm"
      dataHora: evento?.dataHora?.slice(0, 16) ?? '',
      vagas: (evento?.vagas ?? '') as number | string,
      idOrganizacao: evento?.organizacao?.id != null ? String(evento.organizacao.id) : (null as string | null),
      idSala: evento?.sala?.id != null ? String(evento.sala.id) : (null as string | null),
    },
    validate: {
      nome: validar.obrigatorio('Informe o nome'),
      dataHora: validar.obrigatorio('Informe a data e a hora'),
      vagas: validar.positivo('As vagas precisam ser maiores que zero'),
      idOrganizacao: validar.selecionado('Escolha a organização'),
      idSala: validar.selecionado('Escolha a sala'),
    },
  });

  const capacidade = salas.data?.find((s) => String(s.id) === form.values.idSala)?.capacidade;

  return (
    <FormModal
      aberto
      titulo={cadastro.editando ? 'Editar evento' : 'Novo evento'}
      rotuloSalvar={cadastro.editando ? 'Salvar evento' : 'Cadastrar evento'}
      salvando={cadastro.salvando}
      erro={cadastro.erro}
      onFechar={cadastro.fechar}
      onEnviar={form.onSubmit((v) =>
        cadastro.salvar(
          {
            nome: v.nome.trim(),
            dataHora: `${v.dataHora}:00`,
            vagas: Number(v.vagas),
            idOrganizacao: Number(v.idOrganizacao),
            idSala: Number(v.idSala),
          },
          v.nome.trim(),
        ),
      )}
    >
      <TextInput label="Nome" data-autofocus {...form.getInputProps('nome')} />
      <Select
        label="Organização"
        placeholder={organizacoes.isPending ? 'Carregando organizações…' : 'Escolha a organização'}
        searchable
        nothingFoundMessage="Nenhuma organização encontrada"
        data={(organizacoes.data ?? []).map((o) => ({ value: String(o.id), label: o.nome }))}
        {...form.getInputProps('idOrganizacao')}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput label="Data e hora" type="datetime-local" {...form.getInputProps('dataHora')} />
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
      <NumberInput
        label="Vagas"
        description={
          capacidade != null
            ? `A sala escolhida comporta ${capacidade} pessoas.`
            : 'Escolha a sala para ver quantas pessoas ela comporta.'
        }
        min={1}
        max={capacidade}
        allowDecimal={false}
        allowNegative={false}
        {...form.getInputProps('vagas')}
      />
      {cadastro.editando && evento?.id != null && (
        <ListaParticipantes
          titulo="Inscritos"
          consulta={queries.inscritos(evento.id)}
          vazio="Nenhum aluno inscrito ainda."
        />
      )}
    </FormModal>
  );
}
