---
name: telas-m1
description: Orienta a construção das telas web do módulo M1 (React com Vite na pasta app/), isolamento de acesso à API, identificação por X-Usuario, exibição de erros retornados pela API e testes com Vitest utilizando API falsa.
---

# Construção das Telas do Módulo M1 (Grade de Atividades)

Esta skill orienta o desenvolvimento das telas web do **M1 (Grade de Atividades)** consumindo a API Express deste repositório, garantindo conformidade total com o `contrato-api.md`.

## 1. Stack e Organização
- **Framework/Build:** React com Vite, localizados na pasta `app/`.
- **Componentização:** Uma tela por arquivo (ex: `app/src/pages/GradeAtividades.jsx`, `app/src/pages/DetalheAtividade.jsx`, `app/src/pages/CriarAtividade.jsx`).
- **Roteamento:** Utilize bibliotecas leves de roteamento ou renderização condicional baseada em estado/URL conforme a estrutura do projeto.

## 2. Isolamento do Acesso à API
- Todo e qualquer acesso HTTP (`fetch` ou cliente HTTP) deve estar **estritamente isolado** em um módulo dedicado (ex: `app/src/api.js` ou `app/src/services/api.js`).
- Os componentes React nunca devem chamar `fetch` diretamente; eles devem invocar funções exportadas pelo módulo de API (ex: `api.listarAtividades()`, `api.criarAtividade(...)`).

## 3. Identificação do Usuário (`X-Usuario`)
- Toda requisição para rotas protegidas da API deve incluir o cabeçalho HTTP `X-Usuario: <id>` com o identificador do usuário ativo (ex: `org-ana`, `p-carla`, etc.), conforme a seção 1 e 4 do `contrato-api.md`.
- A interface deve permitir selecionar ou configurar o usuário atual (simulando login de organizador ou participante) para injetar o cabeçalho corretamente em todas as chamadas.

## 4. Tratamento de Erros da API
- A API retorna erros no seguinte formato JSON padrão:
  ```json
  {"erro": "CODIGO_DE_ERRO", "mensagem": "Texto descritivo do erro"}
  ```
- **Regra inegociável:** Ao capturar uma resposta de erro da API, a interface **deve exibir exatamente a propriedade `mensagem`** devolvida pelo servidor.
- **Proibido:** É estritamente proibido inventar, traduzir, reescrever ou hardcodar textos de erro na interface (ex: não substitua `mensagem` por "Ops, algo deu errado"). Se a API retornou um erro de negócio ou validação (como `CONFLITO_DE_SALA`, `VAGAS_ACIMA_DA_CAPACIDADE`, etc.), mostre a mensagem exata fornecida pela API.

## 5. Referência ao Contrato (`contrato-api.md`)
Consulte sempre o `contrato-api.md` para garantir os nomes exatos de campos, rotas e códigos de erro do M1:
- **Endpoints M1:**
  - `GET /salas` (todos)
  - `GET /atividades` (todos; filtros `?dia=AAAA-MM-DD` e `?tipo=palestra|minicurso`)
  - `GET /atividades/:id` (todos)
  - `POST /atividades` (organização)
  - `PATCH /atividades/:id` (organização)
  - `POST /atividades/:id/cancelamento` (organização)
- **Principais Campos (Atividade):** `id`, `titulo`, `tipo`, `salaId`, `vagas`, `encontros`, `cargaHorariaMinutos`, `situacao`, `ocupadas`, `vagasRestantes`, `emEspera`.
- **Códigos de Erro Frequentes no M1:** `USUARIO_DESCONHECIDO`, `SOMENTE_ORGANIZACAO`, `NAO_ENCONTRADO`, `DADOS_INVALIDOS`, `QUANTIDADE_DE_ENCONTROS`, `ENCONTRO_INVALIDO`, `VAGAS_ACIMA_DA_CAPACIDADE`, `CONFLITO_DE_SALA`, `CAMPO_NAO_EDITAVEL`, `VAGAS_ABAIXO_DOS_INSCRITOS`, `ATIVIDADE_JA_INICIADA`, `ATIVIDADE_CANCELADA`.

## 6. Testes com Vitest e API Falsa
- Os testes das telas/componentes devem ser realizados com **Vitest** (junto com Testing Library ou utilitários compatíveis).
- **Isolamento de Testes:** Nos testes, a API real **nunca** é chamada diretamente. O módulo de API (`api.js`) ou as requisições `fetch` devem ser substituídos por uma **versão falsa (mock)** ou interceptados (via MSW / mocks do Vitest).
- Valide nos testes tanto os fluxos de sucesso (renderização da grade, criação, alteração) quanto os cenários de erro, assegurando que a mensagem de erro retornada pela API falsa seja renderizada corretamente na tela.
