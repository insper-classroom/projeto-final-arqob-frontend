import type { components } from './schema';

// Tipos gerados do OpenAPI da API (npm run gen:api)
type Schemas = components['schemas'];

export type Me = Schemas['MeResponse'];
export type Perfil = NonNullable<Me['perfil']>;
export type LoginResponse = Schemas['LoginResponse'];
export type Matricula = Schemas['MatriculaResponse'];
export type StatusMatricula = NonNullable<Matricula['status']>;
export type Boletim = Schemas['BoletimResponse'];
export type Nota = Schemas['NotaResponse'];
export type Turma = Schemas['TurmaResponse'];
export type Avaliacao = Schemas['AvaliacaoResponse'];
export type AvaliacaoRequest = Schemas['AvaliacaoRequest'];
export type Professor = Schemas['ProfessorResponse'];
export type Aluno = Schemas['AlunoResponse'];
export type Curso = Schemas['CursoResponse'];
export type Sala = Schemas['Sala'];
export type Disciplina = Schemas['DisciplinaResponse'];
export type Organizacao = Schemas['OrganizacaoEstudantil'];
export type Evento = Schemas['EventoResponse'];
export type AlunoResumo = Schemas['AlunoResumoResponse'];
