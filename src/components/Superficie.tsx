import type { ReactNode } from 'react';
import classes from './Superficie.module.css';

// Superfície de trabalho para tabelas e listas, com moldura dupla
export function Superficie({ children }: { children: ReactNode }) {
  return (
    <div className={classes.casca}>
      <div className={classes.nucleo}>{children}</div>
    </div>
  );
}
