import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setOnUnauthorized, tokenStorage } from '../api/client';
import { queries } from '../api/queries';
import type { LoginResponse } from '../api/types';
import { AuthContext, type AuthState } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());

  const meQuery = useQuery({ ...queries.me(), enabled: token !== null, staleTime: Infinity, retry: false });

  const sair = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  // Token recusado pela API no meio do uso: volta para o login avisando o motivo
  useEffect(() => {
    setOnUnauthorized(() => {
      sair();
      notifications.show({ color: 'red', message: 'Sua sessão expirou. Entre novamente.' });
    });
    return () => setOnUnauthorized(null);
  }, [sair]);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const { token: novoToken } = await api<LoginResponse>('/login', { method: 'POST', body: { email, senha } });
      if (!novoToken) throw new Error('A API não devolveu o token de acesso.');
      tokenStorage.set(novoToken);
      queryClient.clear();
      setToken(novoToken);
    },
    [queryClient],
  );

  const valor = useMemo<AuthState>(
    () => ({
      token,
      me: meQuery.data,
      carregando: token !== null && meQuery.isPending,
      erro: meQuery.error,
      tentarDeNovo: () => void meQuery.refetch(),
      entrar,
      sair,
    }),
    [token, meQuery, entrar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
