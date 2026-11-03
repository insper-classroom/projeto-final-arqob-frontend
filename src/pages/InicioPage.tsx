import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Cada perfil começa na sua tela principal
export function InicioPage() {
  const { me } = useAuth();
  return <Navigate to={me?.perfil === 'ALUNO' ? '/matriculas' : '/turmas'} replace />;
}
