# Sessões — Juliana Sayuri Kaneshima

Cada execução de teste é lida pelo que mudou desde a anterior:

- **Ciclo** — vermelho logo depois de mexer só em teste, e depois verde logo depois de mexer só em código. É o TDD.
- **Nasceu verde** — verde logo depois de mexer só em teste. Ou o comportamento já existia, ou o teste não testa o que diz.
- **Juntos** — teste e código mudaram antes da mesma execução. Não houve vermelho para ver.

**Alertas:** *colou* = prompt com 10 palavras seguidas ou mais iguais às do documento de requisitos (só aparece quando o resumo é gerado com `--requisitos`); *leu* = o agente acessou um arquivo de requisitos; *anexou* = o documento foi anexado à conversa.

Requisições são chamadas ao modelo: cada passo do agente é uma. Skills contam tanto a ferramenta `skill` quanto o comando `/nome`.

| Início | Sessão | Requisições | Skills | Subagentes | Vermelhas / verdes | Ciclos | Nasceu verde | Juntos | Alertas |
|---|---|---|---|---|---|---|---|---|---|
| 19/09 01:47 | [Planejamento do módulo M1 da Semana Acadêmica](ses_f480206a0ffe3cvqilr71bcCJP.md) | 39 | grilling | — | 0 / 0 | 0 | 0 | 0 | — |
| 19/09 17:33 | [Preenchimento de pendências em M1-grade.md](ses_f44a0003cffeZ0RetvMdwWLsx3.md) | 4 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 19/09 17:45 | [Grilling M1: permissões e identificação de](ses_f4494ec21ffel89gvSEVQC369C.md) | 9 | grilling | — | 0 / 0 | 0 | 0 | 0 | — |
| 19/09 17:56 | [Atualização de respostas em entrevistas/M1-grade.md](ses_f448b900dffedE4zzyNmDHJ47j.md) | 4 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 19/09 18:03 | [Criação de specs/M1-grade.md](ses_f4484944bffeZaDxAVTyICwTXs.md) | 11 | to-spec | — | 0 / 0 | 0 | 0 | 0 | — |
| 19/09 18:57 | [TDD na fatia 1 de M1-grade.md](ses_f4452edefffegrvuUqoPTRJoyy.md) | 66 | tdd | — | 9 / 14 | 2 | 2 | 3 | — |
| 19/09 21:30 | [TDD na fatia 2 de M1-grade.md](ses_f43c71189ffeilF2ZeqSNlalnT.md) | 123 | tdd | — | 36 / 6 | 4 | 1 | 0 | — |
| 19/09 22:55 | [TDD na fatia 2 de M1-grade.md](ses_f43799777ffeCqfUqA06AWYQhE.md) | 28 | tdd | — | 6 / 1 | 0 | 0 | 1 | — |
| 20/09 15:42 | [Correção de concorrência e banco nos testes](ses_f3fdf2e49ffeQ5b1aJPkgDk5eb.md) | 7 | — | — | 0 / 1 | 0 | 0 | 0 | — |
| 20/09 16:08 | [TDD da fatia 2 de M1-grade.md](ses_f3fc7dbedffeivCJW7TGvx1tYi.md) | 54 | tdd | — | 7 / 9 | 5 | 1 | 0 | — |
| 20/09 16:32 | [Testes TDD fatia 2 M1-grade.md](ses_f3fb1a6d2ffeIRnM8h5AEtzSZ7.md) | 30 | tdd | — | 1 / 7 | 1 | 4 | 0 | — |
| 20/09 16:40 | [TDD da fatia 3 de M1-grade.md](ses_f3faaa0dcffeCXvid22tX7qbUo.md) | 33 | tdd | — | 4 / 4 | 1 | 0 | 1 | — |
| 20/09 16:50 | [Implementação TDD fatia 4 de M1-grade.md](ses_f3fa1019effeWNScejLz10jJFs.md) | 26 | tdd | — | 2 / 4 | 2 | 0 | 0 | — |
| 20/09 16:58 | [Auditoria módulo M1 com specs/M1-grade.md](ses_f3f998243ffe4w3139ps7cKc3C.md) | 6 | — | auditor | 0 / 0 | 0 | 0 | 0 | — |
| 20/09 17:17 | [New session - 2026-09-20T20:17:02.114Z](ses_f3f88f55effebZZR1kMFNbhVxq.md) | 70 | tdd | — | 4 / 10 | 1 | 8 | 0 | — |
| 20/09 17:51 | [TDD para erro 403 SOMENTE_ORGANIZACAO em rotas](ses_f3f6999f0ffeMukWA2c6ZCjsoK.md) | 27 | tdd | — | 0 / 2 | 0 | 2 | 0 | — |
| 20/09 17:57 | [Skill de telas M1 em React com Vite](ses_f3f63dbadffe80HIJqQ4ajjpDD.md) | 14 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 20/09 18:01 | [Criar subagente revisor-de-contrato.md](ses_f3f602478ffeUR2Mp05QUKMECe.md) | 5 | novo-subagente | — | 0 / 0 | 0 | 0 | 0 | — |
| 20/09 18:05 | [Revisão da API M1 contra contrato-api.md](ses_f3f5c575dffe7Q2IYcW51nw7s9.md) | 11 | — | revisor-de-contrato | 0 / 1 | 0 | 0 | 0 | — |
| 21/09 15:00 | [New session - 2026-09-21T18:00:21.854Z](ses_f3adfb9a2ffeePe6WnXZP2r43B.md) | 44 | telas-m1 | — | 1 / 1 | 0 | 1 | 1 | — |
| 21/09 16:16 | [Executar servidor no npm start com PORT 3000](ses_f3a9a604bffe4HJmaWtYYAO4O2.md) | 10 | — | — | 0 / 1 | 0 | 0 | 0 | — |
| | **Total: 21 sessões** | 621 | grilling (2), to-spec, tdd (9), novo-subagente, telas-m1 | auditor, revisor-de-contrato | 70 / 61 | 16 | 19 | 6 | — |
