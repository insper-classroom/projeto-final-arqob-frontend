import { AppShell, Box, Burger, Button, Group, Stack, Text } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import type { Perfil } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { nomePerfil } from '../format';
import classes from './AppLayout.module.css';

// Itens de menu por perfil
const menu: Record<Perfil, { rotulo: string; para: string }[]> = {
  ALUNO: [
    { rotulo: 'Minhas matrículas', para: '/matriculas' },
    { rotulo: 'Organizações e eventos', para: '/organizacoes' },
  ],
  PROFESSOR: [{ rotulo: 'Minhas turmas', para: '/turmas' }],
  MASTER: [
    { rotulo: 'Turmas', para: '/turmas' },
    { rotulo: 'Disciplinas', para: '/cadastros/disciplinas' },
    { rotulo: 'Cursos', para: '/cadastros/cursos' },
    { rotulo: 'Professores', para: '/cadastros/professores' },
    { rotulo: 'Alunos', para: '/cadastros/alunos' },
    { rotulo: 'Salas', para: '/cadastros/salas' },
    { rotulo: 'Organizações', para: '/cadastros/organizacoes' },
    { rotulo: 'Eventos', para: '/cadastros/eventos' },
  ],
};

export function AppLayout() {
  const { me, sair } = useAuth();
  const [aberto, { toggle, close }] = useDisclosure();
  // No desktop o menu fica sempre visível e a barra do topo some
  const desktop = useMediaQuery('(min-width: 48em)');
  const itens = me?.perfil ? menu[me.perfil] : [];
  const { pathname } = useLocation();

  return (
    <AppShell
      header={{ height: 60, collapsed: desktop }}
      navbar={{ width: 272, breakpoint: 'sm', collapsed: { mobile: !aberto } }}
      padding={{ base: 'md', sm: 'xl' }}
    >
      <AppShell.Header className={classes.header} hiddenFrom="sm">
        <Group h="100%" px="md" justify="space-between">
          <Link to="/" className={classes.marca} onClick={close}>
            Blackboard
          </Link>
          <Burger opened={aberto} onClick={toggle} color="#f4f6f9" size="sm" aria-label="Abrir menu" />
        </Group>
      </AppShell.Header>

      {/* Menu como ilha flutuante: o painel escuro se destaca do fundo em vez de colar na borda */}
      <AppShell.Navbar className={classes.trilho}>
        <Stack justify="space-between" h="100%" className={classes.ilha}>
          <Stack gap="xl">
            <Box visibleFrom="sm" pt="xs">
              <Link to="/" className={classes.marca}>
                Blackboard
              </Link>
            </Box>
            <nav aria-label="Menu principal">
              <Stack gap={4}>
                {itens.map((item) => (
                  <NavLink key={item.para} to={item.para} className={classes.link} onClick={close}>
                    {item.rotulo}
                  </NavLink>
                ))}
              </Stack>
            </nav>
          </Stack>

          <Stack gap="sm" className={classes.usuario}>
            <div>
              <Text className={classes.nome}>{me?.nome ?? me?.email}</Text>
              {me?.perfil && <Text className={classes.perfil}>{nomePerfil[me.perfil]}</Text>}
            </div>
            <Button variant="default" className={classes.sair} onClick={sair}>
              Sair
            </Button>
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>
        {/* A key reinicia a animação de entrada a cada troca de tela */}
        <div key={pathname} className={classes.conteudo}>
          <Outlet />
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
