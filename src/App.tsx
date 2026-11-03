import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { AppLayout } from './layout/AppLayout';
import { BoletimPage } from './pages/BoletimPage';
import { AlunosPage } from './pages/cadastros/AlunosPage';
import { CursosPage } from './pages/cadastros/CursosPage';
import { DisciplinasPage } from './pages/cadastros/DisciplinasPage';
import { EventosPage } from './pages/cadastros/EventosPage';
import { OrganizacoesPage } from './pages/cadastros/OrganizacoesPage';
import { ProfessoresPage } from './pages/cadastros/ProfessoresPage';
import { SalasPage } from './pages/cadastros/SalasPage';
import { InicioPage } from './pages/InicioPage';
import { LoginPage } from './pages/LoginPage';
import { MinhasMatriculasPage } from './pages/MinhasMatriculasPage';
import { OrganizacoesEventosPage } from './pages/OrganizacoesEventosPage';
import { TurmaPage } from './pages/TurmaPage';
import { TurmasPage } from './pages/TurmasPage';

// Cadastros: só o master
const cadastros = [
  { caminho: 'disciplinas', Pagina: DisciplinasPage },
  { caminho: 'cursos', Pagina: CursosPage },
  { caminho: 'professores', Pagina: ProfessoresPage },
  { caminho: 'alunos', Pagina: AlunosPage },
  { caminho: 'salas', Pagina: SalasPage },
  { caminho: 'organizacoes', Pagina: OrganizacoesPage },
  { caminho: 'eventos', Pagina: EventosPage },
];

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<InicioPage />} />
        <Route
          path="matriculas"
          element={
            <RequireAuth perfis={['ALUNO']}>
              <MinhasMatriculasPage />
            </RequireAuth>
          }
        />
        <Route path="matriculas/:idMatricula/boletim" element={<BoletimPage />} />
        <Route
          path="organizacoes"
          element={
            <RequireAuth perfis={['ALUNO']}>
              <OrganizacoesEventosPage />
            </RequireAuth>
          }
        />
        <Route
          path="turmas"
          element={
            <RequireAuth perfis={['MASTER', 'PROFESSOR']}>
              <TurmasPage />
            </RequireAuth>
          }
        />
        <Route
          path="turmas/:idTurma"
          element={
            <RequireAuth perfis={['MASTER', 'PROFESSOR']}>
              <TurmaPage />
            </RequireAuth>
          }
        />
        {cadastros.map(({ caminho, Pagina }) => (
          <Route
            key={caminho}
            path={`cadastros/${caminho}`}
            element={
              <RequireAuth perfis={['MASTER']}>
                <Pagina />
              </RequireAuth>
            }
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
