import { Button, Group, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useState, type ReactNode } from 'react';
import { Carregando, Erro, Vazio } from '../../components/Estado';
import { Superficie } from '../../components/Superficie';

export interface Coluna<T> {
  titulo: string;
  valor: (item: T) => ReactNode;
  alinhar?: 'left' | 'right';
}

interface Props<T> {
  titulo: string;
  descricao: string;
  rotuloNovo: string;
  onNovo: () => void;
  itens: T[] | undefined;
  carregando: boolean;
  erro: Error | null;
  colunas: Coluna<T>[];
  // Texto em que a busca procura, como nome, email ou código
  textoBusca: (item: T) => string;
  chave: (item: T) => number | undefined;
  onEditar: (item: T) => void;
  vazio: string;
}

// Normaliza para buscar sem diferenciar maiúsculas nem acentos
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function TabelaCadastro<T>(props: Props<T>) {
  const [busca, setBusca] = useState('');
  const termo = normalizar(busca.trim());
  const filtrados = (props.itens ?? []).filter((item) => !termo || normalizar(props.textoBusca(item)).includes(termo));

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <div>
          <Title order={1}>{props.titulo}</Title>
          <Text c="dimmed" mt={4}>
            {props.descricao}
          </Text>
        </div>
        <Button onClick={props.onNovo}>{props.rotuloNovo}</Button>
      </Group>

      {props.carregando ? (
        <Carregando />
      ) : props.erro ? (
        <Erro erro={props.erro} />
      ) : (props.itens ?? []).length === 0 ? (
        <Vazio titulo={props.vazio}>Use "{props.rotuloNovo}" para cadastrar o primeiro.</Vazio>
      ) : (
        <Stack gap="sm">
          <TextInput
            placeholder="Buscar"
            aria-label={`Buscar em ${props.titulo.toLowerCase()}`}
            value={busca}
            onChange={(evento) => setBusca(evento.currentTarget.value)}
            maw={360}
            radius="xl"
          />
          {filtrados.length === 0 ? (
            <Text c="dimmed">Nada encontrado para "{busca}".</Text>
          ) : (
            <Superficie>
              <Table.ScrollContainer minWidth={640}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      {props.colunas.map((coluna) => (
                        <Table.Th key={coluna.titulo} ta={coluna.alinhar}>
                          {coluna.titulo}
                        </Table.Th>
                      ))}
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filtrados.map((item) => (
                      <Table.Tr key={props.chave(item)}>
                        {props.colunas.map((coluna) => (
                          <Table.Td key={coluna.titulo} ta={coluna.alinhar}>
                            {coluna.valor(item)}
                          </Table.Td>
                        ))}
                        <Table.Td ta="right">
                          <Button size="compact-sm" variant="subtle" onClick={() => props.onEditar(item)}>
                            Editar
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Superficie>
          )}
        </Stack>
      )}
    </Stack>
  );
}
