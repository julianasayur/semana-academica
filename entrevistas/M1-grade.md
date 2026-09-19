# Entrevista: M1 — Grade de atividades

| P-xx | Pergunta | Resposta | Fontes | Status |
|---|---|---|---|---|
| P1 | Qual o número mínimo e máximo de encontros permitidos para uma Palestra e para um Minicurso (`QUANTIDADE_DE_ENCONTROS`)? | | | Pendente |
| P2 | O que define um `ENCONTRO_INVALIDO`? Existe duração mínima/máxima? Devem ser nos dias do evento? | | | Pendente |
| P3 | `CONFLITO_DE_SALA` exige intervalo entre atividades? `VAGAS_ACIMA_DA_CAPACIDADE` permite exceção? | | | Pendente |
| P4 | Quais campos são `CAMPO_NAO_EDITAVEL`? Quando a atividade é considerada `ATIVIDADE_JA_INICIADA`? | | | Pendente |
| P5 | Regras exatas de transição para `situacao` (`prevista`, `em_andamento`, `encerrada`) baseadas no relógio? | | | Pendente |
| P6 | O que acontece no cancelamento? Continua na listagem? Qual a `situacao`? Existe prazo limite? | | | Pendente |
| P7 | No `PATCH /atividades/:id`, o erro `VAGAS_ABAIXO_DOS_INSCRITOS` considera apenas confirmados ou inclui a lista de espera? | | | Pendente |
| P8 | No `GET /atividades`, os filtros `?dia` e `?tipo` são cumulativos? Como tratar atividades multi-dia no filtro? | | | Pendente |
| P9 | Como é calculado o campo `cargaHorariaMinutos`? Considera intervalos entre encontros ou apenas a soma das durações? | | | Pendente |
| P10 | Se a atividade já está cancelada, tentar cancelá-la de novo ou editá-la (`PATCH`) gera `ATIVIDADE_CANCELADA`? | | | Pendente |
| P11 | Como são calculados `ocupadas`, `vagasRestantes` e `emEspera`? `ocupadas` inclui convocadas? | | | Pendente |
| P12 | Uma atividade pode ter encontros que se sobrepõem no tempo (ex: dois encontros no mesmo horário)? | | | Pendente |
| P13 | Quais as regras de validação para `titulo` (tamanho mín/máx) e `vagas` (valor mínimo)? | | | Pendente |
| P14 | No `PATCH /atividades/:id`, o que acontece se a organização tentar alterar a `vagas` para um valor menor que a `capacidade` da sala, mas acima dos inscritos? | | | Pendente |
| P15 | Qual a tolerância para `FORA_DA_JANELA` em relação ao início e fim dos encontros? | | | Pendente |
| P16 | Qual a ordem de exibição dos resultados em `GET /salas` e `GET /atividades`? | | | Pendente |
| P17 | No `PATCH /atividades/:id`, é permitido alterar a sala (`salaId`) ou os encontros? Se sim, em quais condições? | | | Pendente |
| P18 | Como os IDs dos encontros (`enc_...`) devem ser gerados? Eles devem ser únicos por atividade ou por todo o sistema? | | | Pendente |
| P19 | Se `salaId` não existir no `POST` ou `PATCH`, o erro é `404` ou `422`? | | | Pendente |
| P20 | O endpoint `POST /atividades/:id/cancelamento` requer algum corpo de requisição em JSON ou deve ser chamado sem corpo? | | | Pendente |
