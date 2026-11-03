import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Azul da marca: botões, links e foco
const azul: MantineColorsTuple = [
  '#eaf1fb',
  '#d3e1f5',
  '#a7c2ea',
  '#789fdd',
  '#5183d2',
  '#3a71c9',
  '#2d66bd',
  '#2559a8',
  '#1d4a8f',
  '#143a73',
];

// Verde da marca: confirmações e aprovação
const verde: MantineColorsTuple = [
  '#eaf8ec',
  '#d3f0d8',
  '#a6e0b0',
  '#76cf86',
  '#4fc163',
  '#38b84f',
  '#2cb04a',
  '#22963d',
  '#1a7a31',
  '#105d24',
];

export const theme = createTheme({
  primaryColor: 'azul',
  primaryShade: 7,
  colors: { azul, verde },
  black: '#0d1117',
  fontFamily: '"Atkinson Hyperlegible", system-ui, sans-serif',
  headings: {
    fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2rem', lineHeight: '1.15' },
      h2: { fontSize: '1.5rem', lineHeight: '1.2' },
      h3: { fontSize: '1.2rem', lineHeight: '1.3' },
    },
  },
  defaultRadius: 'md',
  focusRing: 'auto',
  components: {
    // Botões em pílula; campos e modais com cantos mais generosos
    Button: { defaultProps: { radius: 'xl' } },
    Badge: { defaultProps: { radius: 'xl' } },
    Modal: { defaultProps: { radius: 'lg', overlayProps: { backgroundOpacity: 0.4, blur: 6 } } },
    Notification: { defaultProps: { radius: 'lg' } },
  },
});

// Cores de status da matrícula
export const statusCor = {
  CURSANDO: '#5b6675',
  APROVADO: '#1f8a3b',
  REPROVADO: '#c2412d',
} as const;
