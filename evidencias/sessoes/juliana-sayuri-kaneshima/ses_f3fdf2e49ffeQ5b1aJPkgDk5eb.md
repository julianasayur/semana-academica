# Correção de concorrência e banco nos testes

| | |
|---|---|
| Sessão | `ses_f3fdf2e49ffeQ5b1aJPkgDk5eb` |
| Pasta | semana-academica/api |
| Período | 20/09 15:42 → 20/09 15:46 |
| Modelo | google/gemini-3.6-flash, google/gemini-3-flash-preview |
| Requisições ao modelo | 7 |
| Tokens de entrada / saída | 72.243 / 1.782 |
| Skills | — |
| Subagentes | — |
| Execuções de teste | 0 vermelhas, 1 verdes |
| TDD | 0 ciclo(s) vermelho → verde · 0 teste(s) que já nasceram verdes · 0 vez(es) teste e código juntos |
| Arquivos editados | 0 de teste, 3 de código, 0 de entrevista, 0 de spec, 0 de contexto, 0 de auditoria |
| Alertas | — |

## Linha do tempo

- `20/09 15:42` **prompt** — Causa do "no such table: usuarios" e do "database is locked": os arquivos de teste rodam em processos paralelos e todos abrem o mesmo ./banco.db, porque o DB_PATH não é definido nos testes; um processo faz DROP TABLE enquanto outro consulta. Além disso, os try/catch em volta de resetarDados escondem o erro. Corrija assim: no package.json, o script "test" deve definir DB_PATH=:memory: e MODO_TESTE…
- `20/09 15:45` **prompt** — continue
- `20/09 15:46` edita código `package.json`
- `20/09 15:46` edita código `index.js` (2×)
- `20/09 15:46` roda `npm test` → verde (13 passaram)
