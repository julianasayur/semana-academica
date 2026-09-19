# Semana Acadêmica

Responda sempre em português.

## Stack
- API: Node.js com Express, na pasta `api/`.
- Banco: SQLite embutido do Node (`node:sqlite`), em arquivo. Proibido servidor de banco, Docker ou serviço na nuvem.
- Interface: web com React e Vite, na pasta `app/`.
- O código deve rodar em Node 22.13 ou mais novo; não use recursos que só existem em versões mais recentes.
- Os comandos do `projeto.json` precisam funcionar no Linux só com o Node instalado.

## Contrato
- `contrato-api.md` é restrição do cliente: nunca edite esse arquivo.
- Rotas, nomes de campos e códigos de erro seguem o contrato exatamente, sem traduzir nem renomear.
- O modo de teste descrito no contrato é obrigatório.

## Regras de trabalho
- Regra de negócio só entra no código se estiver em `specs/`. Se faltar informação, pergunte; não invente.
- Nunca edite um teste existente para fazê-lo passar.
- Mensagem de commit cita a regra da spec: `M1-R3: descrição`.
- Não altere nada dentro de `evidencias/`.