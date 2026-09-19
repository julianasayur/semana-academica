# Spec — M1: Grade de atividades

## 1. Objetivo
Permitir que a organização crie, altere e cancele atividades (palestras e minicursos) associadas a salas e horários válidos durante a Semana Acadêmica, e que participantes e organizadores consultem salas e atividades disponíveis.

## 2. Fora de escopo
- Inscrições em atividades e lista de espera (tratado no M2).
- Registro de presença, QR code e presença manual (tratado no M3).
- Emissão de certificados e extrato de horas (tratado no M4).
- Painel gerencial, sem chance e bloqueios (tratado no M5).
- Criação de usuários e salas (dados iniciais fixos).

## 3. Modelo

### Atividade
- `id`: string (gerado, prefixo `atv_` + 8 hexadecimais minúsculos) — informado pelo sistema / gerado.
- `titulo`: string (obrigatório, não vazio) — informado pelo cliente.
- `tipo`: string (`palestra` ou `minicurso`) — informado pelo cliente.
- `salaId`: string (identificador da sala existente) — informado pelo cliente.
- `vagas`: inteiro (mínimo 1, teto na capacidade da sala) — informado pelo cliente.
- `encontros`: lista de Encontros (em ordem de início) — informado pelo cliente.
- `cargaHorariaMinutos`: inteiro — calculado (soma das durações dos encontros em minutos).
- `situacao`: string (`prevista`, `em_andamento`, `encerrada`, `cancelada`) — calculado pelo relógio.
- `ocupadas`: inteiro (confirmadas + convocadas) — calculado.
- `vagasRestantes`: inteiro (`vagas` - `ocupadas`) — calculado.
- `emEspera`: inteiro (quantidade de inscrições em espera) — calculado.

### Encontro
- `id`: string (gerado, prefixo `enc_` + 8 hexadecimais minúsculos, único no sistema) — gerado.
- `inicio`: ISO 8601 com fuso — informado pelo cliente.
- `fim`: ISO 8601 com fuso — informado pelo cliente.

### Sala
- `id`: string (`auditorio`, `sala-101`, `sala-102`, `lab-3`) — dados iniciais.
- `nome`: string — dados iniciais.
- `capacidade`: inteiro — dados iniciais.

## 4. Endpoints

- `GET /salas` (todos os usuários identificados) → `200 [Sala]`
- `GET /atividades` (todos os usuários identificados; filtros opcionais `?dia=AAAA-MM-DD` e `?tipo=palestra|minicurso`) → `200 [Atividade]`
- `GET /atividades/:id` (todos os usuários identificados) → `200 Atividade`
- `POST /atividades` (somente organização) → `201 Atividade`
- `PATCH /atividades/:id` (somente organização) → `200 Atividade`
- `POST /atividades/:id/cancelamento` (somente organização) → `200 Atividade`

## 5. Regras

- **R1 (Autenticação):** Toda rota do M1 exige o cabeçalho `X-Usuario` com um ID de usuário válido e existente. Se ausente ou inexistente, recusa com `401 USUARIO_DESCONHECIDO`. (P21, contrato-api.md)
- **R2 (Perfil de Organização):** As rotas de escrita (`POST /atividades`, `PATCH /atividades/:id`, `POST /atividades/:id/cancelamento`) exigem que o usuário autenticado tenha papel `organizacao`. Se for `participante`, recusa com `403 SOMENTE_ORGANIZACAO`. (P22, RN-101, contrato-api.md)
- **R3 (Perfil de Leitura):** As rotas de leitura (`GET /salas`, `GET /atividades`, `GET /atividades/:id`) permitem acesso a qualquer usuário autenticado (`organizacao` ou `participante`). (P23, contrato-api.md)
- **R4 (Existência de Atividade):** Operações em atividades específicas (`GET /atividades/:id`, `PATCH /atividades/:id`, `POST /atividades/:id/cancelamento`) exigem que a atividade exista. Se não existir, recusa com `404 NAO_ENCONTRADO`. (P24, contrato-api.md)
- **R5 (Corpo de Requisição):** Requisições com corpo malformado, não-JSON ou campos obrigatórios ausentes/com tipos inválidos geram `422 DADOS_INVALIDOS`. (P13, P25, contrato-api.md)
- **R6 (Ordem das Verificações):** A ordem de prioridade para verificação de erros é: 1º Identificação (401), 2º Perfil (403), 3º Existência (404), 4º Corpo (422 DADOS_INVALIDOS), e por último as regras de negócio específicas da atividade. (P25, contrato-api.md)
- **R7 (Quantidade de Encontros):** Palestras devem ter exatamente 1 encontro; minicursos devem ter de 2 a 5 encontros. Caso contrário, recusa com `422 QUANTIDADE_DE_ENCONTROS`. (P1, RN-102, RN-103)
- **R8 (Validade do Encontro):** Cada encontro deve durar entre 1 hora e 4 horas, começar e terminar no mesmo dia (sem atravessar a meia-noite), situar-se entre os dias 19 e 23/10/2026 (horário de Brasília). Caso contrário, recusa com `422 ENCONTRO_INVALIDO`. (P2, RN-104, RN-105)
- **R9 (Sem Sobreposição na Atividade):** Os encontros de uma mesma atividade não podem se sobrepor no tempo. Caso contrário, recusa com `422 ENCONTRO_INVALIDO`. (P2, P12, RN-106)
- **R10 (Conflito de Sala e Intervalo):** Não pode haver conflito de horários de encontros na mesma sala, exigindo pelo menos 15 minutos de intervalo entre o término de um encontro e o início de outro na mesma sala. Atividades canceladas não contam para conflito. Se houver conflito, recusa com `409 CONFLITO_DE_SALA`. (P3, RN-108)
- **R11 (Capacidade da Sala):** As vagas devem ser um número inteiro de no mínimo 1 e no máximo a capacidade da sala da atividade, tanto no `POST` quanto no `PATCH`. Acima da capacidade, recusa com `422 VAGAS_ACIMA_DA_CAPACIDADE`; abaixo de 1 ou não inteiro, recusa com `422 DADOS_INVALIDOS`. (P3, P13, RN-107)
- **R12 (Sala Inexistente no POST):** No `POST /atividades`, se o `salaId` informado não existir, recusa com `422 DADOS_INVALIDOS`. (P19, contrato-api.md)
- **R13 (Validação de Título):** O campo `titulo` é obrigatório e não pode ser vazio. Caso contrário, recusa com `422 DADOS_INVALIDOS`. (P13, contrato-api.md)
- **R14 (Campos Não Editáveis no PATCH):** Na alteração (`PATCH /atividades/:id`), apenas `titulo` e `vagas` podem ser modificados; campos como `salaId`, `tipo` e a lista de `encontros` são não editáveis após a criação. Qualquer tentativa de alterar campos não editáveis recusa com `422 CAMPO_NAO_EDITAVEL`. (P4, P17, P19, RN-110)
- **R15 (Atividade Já Iniciada no Cancelamento):** Uma atividade só pode ser cancelada antes de iniciar. A atividade é considerada iniciada quando o relógio atinge o início do primeiro encontro (inclusive). Se já iniciou, recusa com `422 ATIVIDADE_JA_INICIADA`. (P4, P6, RN-112)
- **R16 (Atividade Cancelada):** Uma atividade cancelada não pode ser alterada (`PATCH`) nem cancelada novamente. Tentativas recusam com `422 ATIVIDADE_CANCELADA`. (P10, RN-113)
- **R17 (Vagas Abaixo dos Inscritos no PATCH):** Na alteração de vagas (`PATCH /atividades/:id`), o novo número de vagas pode ficar entre o total de ocupantes (confirmadas + convocadas) e a capacidade da sala. Se o número de vagas for menor que as ocupações atuais, recusa com `409 VAGAS_ABAIXO_DOS_INSCRITOS`. (P7, P14, RN-111)
- **R18 (Carga Horária Calculada):** O campo `cargaHorariaMinutos` é calculado pela soma das durações dos encontros em minutos, desconsiderando intervalos. Se a organização enviar esse campo no corpo, ele é ignorado. (P9, RN-109)
- **R19 (IDs de Encontros):** Os IDs de encontros gerados pelo sistema seguem o formato `enc_` seguido de 8 hexadecimais minúsculos, sendo únicos em todo o sistema. (P18, contrato-api.md)
- **R20 (Cancelamento Sem Corpo):** O endpoint `POST /atividades/:id/cancelamento` não requer corpo de requisição; se algum corpo for enviado, ele é ignorado. (P20)
- **R21 (Filtros de Listagem):** No `GET /atividades`, os filtros `?dia=AAAA-MM-DD` e `?tipo=palestra|minicurso` são cumulativos. Uma atividade aparece se possuir pelo menos um encontro no dia especificado (no fuso de Brasília) e corresponder ao tipo, quando informados. (P8, RN-116)
- **R22 (Ordenação de Resultados):** No `GET /atividades`, os resultados são ordenados pelo início do 1º encontro e, em caso de empate, pelo título em ordem alfabética. Atividades canceladas continuam aparecendo. No `GET /salas`, os resultados seguem a ordem dos dados iniciais. (P6, P16, RN-115)
- **R23 (Situação Calculada):** A situação é calculada pelo relógio: `prevista` antes do início do 1º encontro; `em_andamento` a partir do início do 1º encontro (inclusive) até antes do fim do último; `encerrada` a partir do fim do último encontro (inclusive); `cancelada` prevalece sobre todas. (P5, P6, RN-114)
- **R24 (Métrica de Ocupação):** Os campos de métricas são calculados da seguinte forma: `ocupadas` = inscrições confirmadas + convocadas; `vagasRestantes` = `vagas` - `ocupadas`; `emEspera` = contagem de inscrições em espera. (P11, RN-111, contrato-api.md)

## 6. Critérios de aceite

1. (R1) GET /salas sem cabeçalho `X-Usuario` ou com ID inexistente → 401 `USUARIO_DESCONHECIDO`.
2. (R2) POST /atividades por usuário com papel `participante` → 403 `SOMENTE_ORGANIZACAO`.
3. (R3) GET /salas por usuário com papel `participante` → 200 `[Sala]`.
4. (R4) GET /atividades/atv_inexistente → 404 `NAO_ENCONTRADO`.
5. (R6, R1) POST /atividades com usuário inexistente → 401 `USUARIO_DESCONHECIDO` (verificação antes de perfil, existência e corpo).
6. (R7) POST /atividades com palestra tendo 2 encontros → 422 `QUANTIDADE_DE_ENCONTROS`.
7. (R8) POST /atividades com encontro durando 5 horas → 422 `ENCONTRO_INVALIDO`.
8. (R9) POST /atividades com dois encontros da mesma atividade sobrepostos no tempo → 422 `ENCONTRO_INVALIDO`.
9. (R10) POST /atividades com conflito de horário na mesma sala (menos de 15 min de intervalo) → 409 `CONFLITO_DE_SALA`.
10. (R11) POST /atividades com vagas superior à capacidade da sala (ex: 50 vagas na Sala 101) → 422 `VAGAS_ACIMA_DA_CAPACIDADE`.
11. (R12) POST /atividades com `salaId` inexistente → 422 `DADOS_INVALIDOS`.
12. (R13) POST /atividades com `titulo` vazio → 422 `DADOS_INVALIDOS`.
13. (R14) PATCH /atividades/:id alterando a `salaId`, `tipo` ou `encontros` → 422 `CAMPO_NAO_EDITAVEL`.
14. (R15) POST /atividades/:id/cancelamento com relógio após o início do 1º encontro → 422 `ATIVIDADE_JA_INICIADA`.
15. (R16) PATCH /atividades/:id em atividade já cancelada → 422 `ATIVIDADE_CANCELADA`.
16. (R17) PATCH /atividades/:id reduzindo vagas abaixo do número de ocupantes atuais (confirmadas + convocadas) → 409 `VAGAS_ABAIXO_DOS_INSCRITOS`.
17. (R18) POST /atividades calculando corretamente `cargaHorariaMinutos` e ignorando valor enviado no corpo.
18. (R21) GET /atividades?dia=2026-10-19&tipo=minicurso retornando apenas minicursos do dia especificado.
19. (R23) GET /atividades mostrando situação `prevista`, `em_andamento`, `encerrada` ou `cancelada` conforme o relógio de teste.
20. (R10) Sala 101 com encontro das 08:00 às 10:00; outro encontro na sala 101 começando às 10:14 → 409 `CONFLITO_DE_SALA`; começando às 10:15 → 201.
21. (R10) Encontro de atividade cancelada não gera conflito de sala.
22. (R8) Encontro das 23:00 às 00:30 → 422 `ENCONTRO_INVALIDO`.
23. (R21) Encontro das 21:00 às 22:30 de 20/10 (horário de Brasília) aparece em `?dia=2026-10-20`.
24. (R15) Cancelamento com o relógio exatamente no início do 1º encontro → 422 `ATIVIDADE_JA_INICIADA`.
25. (R22) Atividade cancelada aparece em `GET /atividades`.
26. (R23) Com o relógio exatamente no fim do último encontro, a situação é `encerrada`.

## 7. Como isto será verificado
A verificação será feita por meio de testes de integração HTTP na API Express, utilizando a costura externa `criarServidor()` com `MODO_TESTE=1`, manipulando o relógio via `PUT /_teste/relogio` e reiniciando o estado via `POST /_teste/reset`.
Como o M2 não faz parte desta entrega, os testes de R17 e R24 inserem inscrições diretamente no banco.

## 8. Fatias de entrega

1. **Fatia 1 (Identificação e leitura básica):** validação de `X-Usuario`, GET /salas, GET /atividades/:id inexistente (R1, R3, R4, R6).
2. **Fatia 2 (Criação e validações):** POST /atividades (R2, R5, R7, R8, R9, R10, R11, R12, R13, R18, R19).
3. **Fatia 3 (Listagem e situação):** GET /atividades com filtros, ordenação, situação e métricas (R21, R22, R23, R24).
4. **Fatia 4 (Alteração e cancelamento):** PATCH /atividades/:id e POST /atividades/:id/cancelamento (R14, R15, R16, R17, R20).
