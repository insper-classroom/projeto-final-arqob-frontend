import { NumberInput, SimpleGrid, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { queries } from '../../api/queries';
import type { Sala } from '../../api/types';
import { FormModal } from './FormModal';
import { TabelaCadastro } from './TabelaCadastro';
import { useCadastro, type Cadastro } from './useCadastro';
import { validar } from './validacoes';

export function SalasPage() {
  const { data, error, isPending } = useQuery(queries.salas());
  const cadastro = useCadastro<Sala>({ rota: '/salas', nome: 'Sala', feminino: true, invalidar: [['salas'], ['turmas']] });

  return (
    <>
      <TabelaCadastro
        titulo="Salas"
        descricao="Salas recebem turmas e eventos. Duas turmas não ocupam a mesma sala no mesmo horário."
        rotuloNovo="Nova sala"
        onNovo={() => cadastro.abrir(null)}
        itens={data}
        carregando={isPending}
        erro={error}
        chave={(s) => s.id}
        textoBusca={(s) => `${s.predio} ${s.numero} ${s.tipo}`}
        onEditar={(s) => cadastro.abrir(s)}
        vazio="Nenhuma sala cadastrada."
        colunas={[
          { titulo: 'Sala', valor: (s) => <strong>Prédio {s.predio}, sala {s.numero}</strong> },
          { titulo: 'Tipo', valor: (s) => s.tipo },
          { titulo: 'Capacidade', valor: (s) => `${s.capacidade} lugares`, alinhar: 'right' },
        ]}
      />
      {cadastro.aberto && <FormularioSala key={cadastro.emEdicao?.id ?? 'nova'} cadastro={cadastro} />}
    </>
  );
}

function FormularioSala({ cadastro }: { cadastro: Cadastro<Sala> }) {
  const sala = cadastro.emEdicao;
  const form = useForm({
    initialValues: {
      predio: sala?.predio ?? '',
      numero: sala?.numero ?? '',
      tipo: sala?.tipo ?? '',
      capacidade: (sala?.capacidade ?? '') as number | string,
    },
    validate: {
      predio: validar.obrigatorio('Informe o prédio'),
      numero: validar.obrigatorio('Informe o número'),
      tipo: validar.obrigatorio('Informe o tipo, como laboratório ou sala de aula'),
      capacidade: validar.positivo('A capacidade precisa ser maior que zero'),
    },
  });

  return (
    <FormModal
      aberto
      titulo={cadastro.editando ? 'Editar sala' : 'Nova sala'}
      rotuloSalvar={cadastro.editando ? 'Salvar sala' : 'Cadastrar sala'}
      salvando={cadastro.salvando}
      erro={cadastro.erro}
      onFechar={cadastro.fechar}
      onEnviar={form.onSubmit((v) =>
        cadastro.salvar(
          { predio: v.predio.trim(), numero: v.numero.trim(), tipo: v.tipo.trim(), capacidade: Number(v.capacidade) },
          `${v.predio.trim()}, ${v.numero.trim()}`,
        ),
      )}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput label="Prédio" data-autofocus {...form.getInputProps('predio')} />
        <TextInput label="Número" {...form.getInputProps('numero')} />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput label="Tipo" placeholder="Laboratório, sala de aula…" {...form.getInputProps('tipo')} />
        <NumberInput label="Capacidade" min={1} allowDecimal={false} allowNegative={false} {...form.getInputProps('capacidade')} />
      </SimpleGrid>
    </FormModal>
  );
}
