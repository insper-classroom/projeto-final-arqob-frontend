import { Alert, Button, Group, Modal, Stack } from '@mantine/core';
import type { FormEvent, ReactNode } from 'react';

interface Props {
  aberto: boolean;
  titulo: string;
  rotuloSalvar: string;
  salvando: boolean;
  erro: string | null;
  onFechar: () => void;
  onEnviar: (evento?: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

// Modal padrão dos cadastros: campos, erro da API e ações
export function FormModal({ aberto, titulo, rotuloSalvar, salvando, erro, onFechar, onEnviar, children }: Props) {
  return (
    <Modal opened={aberto} onClose={onFechar} title={titulo} centered size="lg">
      <form onSubmit={onEnviar} noValidate>
        <Stack gap="md">
          {erro && (
            <Alert color="red" variant="light" role="alert">
              {erro}
            </Alert>
          )}
          {children}
          <Group justify="flex-end" mt="xs">
            <Button variant="default" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit" loading={salvando}>
              {rotuloSalvar}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
