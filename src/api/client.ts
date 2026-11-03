export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081';

const TOKEN_KEY = 'blackboard.token';

// O navegador pode bloquear o localStorage (aba privada, dados bloqueados): sem ele, o login vale só até recarregar
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignora
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignora
    }
  },
};

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Chamado quando a API recusa o token (expirado ou usuário desativado)
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler;
}

const mensagensPadrao: Record<number, string> = {
  400: 'Os dados enviados são inválidos.',
  401: 'Sua sessão expirou. Entre novamente.',
  403: 'Você não tem permissão para acessar isto.',
  404: 'Não encontramos o que você procurou.',
  409: 'Isso conflita com um registro que já existe.',
};

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function api<T>(path: string, options: { method?: Metodo; body?: unknown } = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, `Não foi possível conectar à API em ${API_URL}. Confira se ela está rodando.`);
  }

  if (response.status === 401 && token) {
    tokenStorage.clear();
    onUnauthorized?.();
  }

  if (!response.ok) {
    // A API devolve ProblemDetail ({ detail }) nos erros de negócio e validação
    let detalhe: string | undefined;
    try {
      const corpo = await response.json();
      detalhe = typeof corpo?.detail === 'string' ? corpo.detail : undefined;
    } catch {
      // corpo vazio
    }
    throw new ApiError(response.status, detalhe ?? mensagensPadrao[response.status] ?? 'Algo deu errado na API.');
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
