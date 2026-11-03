import { createContext, useContext } from 'react';
import type { Me } from '../api/types';

export interface AuthState {
  token: string | null;
  me: Me | undefined;
  carregando: boolean;
  // Falha ao buscar /me com token presente (API fora do ar, por exemplo)
  erro: Error | null;
  tentarDeNovo: () => void;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return contexto;
}
