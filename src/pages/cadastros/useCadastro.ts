import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../api/client';

// Estado comum dos cadastros: qual registro está aberto no modal e o envio para a API
export function useCadastro<T extends { id?: number }>(opcoes: {
  rota: string; // ex.: '/professores'
  nome: string; // ex.: 'Professor', usado nas mensagens
  invalidar: string[][]; // listas que mudam depois de salvar
  feminino?: boolean; // concordância das mensagens: "Sala cadastrada"
}) {
  const queryClient = useQueryClient();
  // undefined: fechado; null: criando; registro: editando
  const [emEdicao, setEmEdicao] = useState<T | null | undefined>(undefined);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function abrir(item: T | null) {
    setErro(null);
    setEmEdicao(item);
  }

  async function salvar(corpo: unknown, descricao: string) {
    setErro(null);
    setSalvando(true);
    try {
      if (emEdicao) {
        await api(`${opcoes.rota}/${emEdicao.id}`, { method: 'PUT', body: corpo });
        notifications.show({ color: 'verde', message: `${opcoes.nome} "${descricao}" ${opcoes.feminino ? 'atualizada' : 'atualizado'}.` });
      } else {
        await api(opcoes.rota, { method: 'POST', body: corpo });
        notifications.show({ color: 'verde', message: `${opcoes.nome} "${descricao}" ${opcoes.feminino ? 'cadastrada' : 'cadastrado'}.` });
      }
      await Promise.all(opcoes.invalidar.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      setEmEdicao(undefined);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return {
    emEdicao,
    editando: emEdicao !== null && emEdicao !== undefined,
    aberto: emEdicao !== undefined,
    abrir,
    fechar: () => setEmEdicao(undefined),
    salvar,
    salvando,
    erro,
  };
}

// Tipo do retorno do hook, para passar o cadastro aos formulários
export type Cadastro<T extends { id?: number }> = ReturnType<typeof useCadastro<T>>;
