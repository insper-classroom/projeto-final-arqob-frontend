import { Alert, Center, Loader, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';

export function Carregando() {
  return (
    <Center py="xl">
      <Loader aria-label="Carregando" />
    </Center>
  );
}

export function Erro({ erro }: { erro: Error }) {
  return (
    <Alert color="red" variant="light" title="Não foi possível carregar">
      {erro.message}
    </Alert>
  );
}

// Lista vazia: diz o que fazer em vez de só dizer que não há nada
export function Vazio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <Stack gap={4} py="xl" maw={480}>
      <Text fw={700}>{titulo}</Text>
      {children && <Text c="dimmed">{children}</Text>}
    </Stack>
  );
}
