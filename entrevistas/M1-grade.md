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
