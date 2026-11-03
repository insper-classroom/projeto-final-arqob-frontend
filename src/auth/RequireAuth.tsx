import { Button, Center, Group, Loader, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Perfil } from '../api/types';
import { useAuth } from './AuthContext';

// Exige login; com perfis informados, só deixa passar esses perfis
export function RequireAuth({ perfis, children }: { perfis?: Perfil[]; children: ReactNode }) {
  const { token, me, carregando, erro, tentarDeNovo, sair } = useAuth();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace state={{ de: location.pathname }} />;

  if (erro && !me) {
    return (
      <Center h="100dvh" p="md">
        <Stack align="center" gap="sm" maw={420}>
          <Text ta="center">{erro.message}</Text>
          <Group>
            <Button onClick={tentarDeNovo}>Tentar de novo</Button>
            <Button variant="default" onClick={sair}>
              Sair
            </Button>
          </Group>
        </Stack>
      </Center>
    );
  }

  if (carregando || !me) {
    return (
      <Center h="100dvh">
        <Loader aria-label="Carregando" />
      </Center>
    );
  }

  if (perfis && (!me.perfil || !perfis.includes(me.perfil))) return <Navigate to="/" replace />;

  return children;
}
