# API

- Testes: `npm test`, que roda `node --test`.
- Iniciar: `npm start`; a porta vem da variável `PORT` (padrão 3000).
- Toda regra de tempo usa o relógio da aplicação (modo de teste), nunca a hora do sistema direto.
- Banco: `node:sqlite`, em arquivo local.
- Testes rodam em paralelo: cada processo usa banco próprio (em memória), nunca o arquivo compartilhado.
- Só diga que os testes passam depois de ler a saída completa do `npm test`, sem nenhum erro.
- Nunca use try/catch para esconder erro de banco; se algo falha, o erro precisa aparecer.
- O `npm start` precisa subir a API e ficar rodando: é assim que o juiz testa. Testes passando não provam isso.