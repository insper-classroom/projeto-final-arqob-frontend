import { Alert, Button, Group, Modal, NumberInput, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import type { Avaliacao } from '../../api/types';

export interface DadosAvaliacao {
  tipo: string;
  data: string;
  pesoPercentual: number;
}

interface Props {
  aberto: boolean;
  avaliacao: Avaliacao | null; // null cria uma nova
  pesoDisponivel: number; // em pontos percentuais, já descontando a própria avaliação ao editar
  onFechar: () => void;
  onSalvar: (dados: DadosAvaliacao) => Promise<void>;
}

export function AvaliacaoModal({ aberto, avaliacao, pesoDisponivel, onFechar, onSalvar }: Props) {
  const editando = avaliacao !== null;
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const form = useForm<{ tipo: string; data: string; pesoPercentual: number | string }>({
    initialValues: {
      tipo: avaliacao?.tipo ?? '',
      data: avaliacao?.data ?? '',
      pesoPercentual: avaliacao?.peso != null ? Math.round(avaliacao.peso * 100) : '',
    },
    validate: {
      tipo: (valor) => (valor.trim() ? null : 'Dê um nome à avaliação, como "Prova 1"'),
      data: (valor) => (valor ? null : 'Informe a data'),
      pesoPercentual: (valor) => {
        const peso = Number(valor);
        if (valor === '' || !Number.isFinite(peso) || peso < 1) return 'O peso vai de 1% a 100%';
        if (peso > pesoDisponivel) return `Restam ${pesoDisponivel}% de peso nesta turma`;
        return null;
      },
    },
  });

  async function enviar(valores: typeof form.values) {
    setErro(null);
    setSalvando(true);
    try {
      await onSalvar({ tipo: valores.tipo.trim(), data: valores.data, pesoPercentual: Number(valores.pesoPercentual) });
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal opened={aberto} onClose={onFechar} title={editando ? 'Editar avaliação' : 'Nova avaliação'} centered>
      <form onSubmit={form.onSubmit(enviar)} noValidate>
        <Stack gap="md">
          {erro && (
            <Alert color="red" variant="light" role="alert">
              {erro}
            </Alert>
          )}
          <TextInput label="Nome" placeholder="Prova 1" data-autofocus {...form.getInputProps('tipo')} />
          <TextInput label="Data" type="date" {...form.getInputProps('data')} />
          <NumberInput
            label="Peso na média"
            suffix="%"
            min={1}
            max={100}
            allowDecimal={false}
            allowNegative={false}
            {...form.getInputProps('pesoPercentual')}
          />
          <Text size="sm" c="dimmed">
            Restam {pesoDisponivel}% de peso para distribuir nesta turma. A soma dos pesos fecha em 100%.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit" loading={salvando}>
              {editando ? 'Salvar avaliação' : 'Criar avaliação'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
