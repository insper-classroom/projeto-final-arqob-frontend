import { api } from './client';
import type {
  Aluno,
  AlunoResumo,
  Avaliacao,
  Boletim,
  Curso,
  Disciplina,
  Evento,
  Matricula,
  Me,
  Organizacao,
  Professor,
  Sala,
  Turma,
} from './types';

// Chaves e buscas usadas pelo TanStack Query
export const queries = {
  me: () => ({ queryKey: ['me'], queryFn: () => api<Me>('/me') }),
  matriculasDoAluno: (idAluno: number) => ({
    queryKey: ['alunos', idAluno, 'matriculas'],
    queryFn: () => api<Matricula[]>(`/alunos/${idAluno}/matriculas`),
  }),
  boletim: (idMatricula: number) => ({
    queryKey: ['matriculas', idMatricula, 'boletim'],
    queryFn: () => api<Boletim>(`/matriculas/${idMatricula}/notas`),
  }),
  turmas: () => ({ queryKey: ['turmas'], queryFn: () => api<Turma[]>('/turmas') }),
  // Cadastros (listas completas; a busca é feita na tela)
  professores: () => ({ queryKey: ['professores'], queryFn: () => api<Professor[]>('/professores') }),
  alunos: () => ({ queryKey: ['alunos'], queryFn: () => api<Aluno[]>('/alunos') }),
  cursos: () => ({ queryKey: ['cursos'], queryFn: () => api<Curso[]>('/cursos') }),
  salas: () => ({ queryKey: ['salas'], queryFn: () => api<Sala[]>('/salas') }),
  disciplinas: () => ({ queryKey: ['disciplinas'], queryFn: () => api<Disciplina[]>('/disciplinas') }),
  aluno: (idAluno: number) => ({ queryKey: ['alunos', idAluno], queryFn: () => api<Aluno>(`/alunos/${idAluno}`) }),
  organizacoes: () => ({
    queryKey: ['organizacoes'],
    queryFn: () => api<Organizacao[]>('/organizacoes-estudantis'),
  }),
  membros: (idOrganizacao: number) => ({
    queryKey: ['organizacoes', idOrganizacao, 'membros'],
    queryFn: () => api<AlunoResumo[]>(`/organizacoes-estudantis/${idOrganizacao}/membros`),
  }),
  eventos: () => ({ queryKey: ['eventos'], queryFn: () => api<Evento[]>('/eventos') }),
  inscritos: (idEvento: number) => ({
    queryKey: ['eventos', idEvento, 'inscritos'],
    queryFn: () => api<AlunoResumo[]>(`/eventos/${idEvento}/inscritos`),
  }),
  turma: (idTurma: number) => ({
    queryKey: ['turmas', idTurma],
    queryFn: () => api<Turma>(`/turmas/${idTurma}`),
  }),
  // A API lista todas as avaliações; a tela filtra pela turma
  avaliacoes: () => ({ queryKey: ['avaliacoes'], queryFn: () => api<Avaliacao[]>('/avaliacoes') }),
  matriculasDaTurma: (idTurma: number) => ({
    queryKey: ['turmas', idTurma, 'matriculas'],
    queryFn: () => api<Matricula[]>(`/turmas/${idTurma}/matriculas`),
  }),
};
