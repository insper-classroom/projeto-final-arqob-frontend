// Mesmas regras da API, para o erro aparecer no campo antes de enviar
export const validar = {
  obrigatorio: (mensagem: string) => (valor: string | null) => (valor && valor.trim() ? null : mensagem),
  email: (valor: string) => (/^\S+@\S+\.\S+$/.test(valor.trim()) ? null : 'Informe um email válido'),
  senha: (valor: string) => (valor.length >= 6 && valor.length <= 72 ? null : 'A senha precisa ter de 6 a 72 caracteres'),
  positivo: (mensagem: string) => (valor: number | string) => (Number(valor) > 0 ? null : mensagem),
  selecionado: (mensagem: string) => (valor: string | null) => (valor ? null : mensagem),
};
