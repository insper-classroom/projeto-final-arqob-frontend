import { Alert, Button, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, type CSSProperties } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import classes from './LoginPage.module.css';

const atraso = (ms: number) => ({ '--atraso': `${ms}ms` }) as CSSProperties;

function Seta() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LoginPage() {
  const { token, entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // A API no plano gratuito do Render dorme sem uso; a primeira chamada pode levar perto de 1 minuto
  const [demorando, setDemorando] = useState(false);

  const form = useForm({
    initialValues: { email: '', senha: '' },
    validate: {
      email: (valor) => (/^\S+@\S+\.\S+$/.test(valor) ? null : 'Informe um email válido'),
      senha: (valor) => (valor.length > 0 ? null : 'Informe a senha'),
    },
  });

  if (token) return <Navigate to="/" replace />;

  const destino = (location.state as { de?: string } | null)?.de ?? '/';

  async function enviar(valores: { email: string; senha: string }) {
    setErro(null);
    setEnviando(true);
    const aviso = setTimeout(() => setDemorando(true), 4000);
    try {
      await entrar(valores.email.trim(), valores.senha);
      navigate(destino, { replace: true });
    } catch (e) {
      setErro(e instanceof ApiError && e.status === 401 ? 'Email ou senha incorretos.' : (e as Error).message);
    } finally {
      clearTimeout(aviso);
      setDemorando(false);
      setEnviando(false);
    }
  }

  return (
    <div className={classes.pagina}>
      <div className={classes.grade}>
        <section className={classes.apresentacao} aria-label="Blackboard">
          <span className={`${classes.selo} ${classes.revelar}`} style={atraso(0)}>
            <span className={classes.ponto} aria-hidden="true" />
            Ambiente virtual das disciplinas
          </span>
          <h1 className={`${classes.marca} ${classes.revelar}`} style={atraso(90)}>
            Blackboard
          </h1>
          <div className={classes.traco} aria-hidden="true" />
          <p className={`${classes.descricao} ${classes.revelar}`} style={atraso(220)}>
            Alunos acompanham notas e frequência. Professores lançam avaliações. A secretaria organiza as turmas.
          </p>
        </section>

        <main className={`${classes.casca} ${classes.revelar}`} style={atraso(320)}>
          <div className={classes.nucleo}>
            <form onSubmit={form.onSubmit(enviar)} noValidate>
              <Stack gap="lg">
                <div>
                  <h2 className={classes.titulo}>Entrar</h2>
                  <p className={classes.subtitulo}>Use o email e a senha da instituição.</p>
                </div>
                {erro && (
                  <Alert color="red" variant="light" role="alert" radius="lg">
                    {erro}
                  </Alert>
                )}
                <TextInput
                  label="Email"
                  type="email"
                  size="md"
                  autoComplete="username"
                  autoFocus
                  {...form.getInputProps('email')}
                />
                <PasswordInput label="Senha" size="md" autoComplete="current-password" {...form.getInputProps('senha')} />
                <Button
                  type="submit"
                  loading={enviando}
                  fullWidth
                  className={classes.entrar}
                  rightSection={
                    <span className={classes.seta}>
                      <Seta />
                    </span>
                  }
                  justify="space-between"
                >
                  Entrar
                </Button>
                {demorando && (
                  <Text size="sm" c="dimmed" role="status">
                    O servidor estava em repouso e está ligando. Na primeira entrada do dia isso pode levar até 1 minuto.
                  </Text>
                )}
              </Stack>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
