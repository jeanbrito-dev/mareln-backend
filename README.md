# MaréLN Backend

API da plataforma de eventos do Litoral Norte de São Paulo.

Autenticação, gerenciamento de eventos, usuários, categorias e interações, construídos sobre uma arquitetura modular preparada para evolução.

**Status:** em desenvolvimento

---

## Sumário

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Começando](#começando)
- [Execução com Docker Compose](#execução-com-docker-compose)
- [Execução local](#execução-local)
- [Prisma e migrations](#prisma-e-migrations)
- [Docker](#docker)
- [Scripts](#scripts)
- [Desenvolvimento](#desenvolvimento)

---

## Sobre

O MaréLN conecta moradores e turistas aos eventos do Litoral Norte de São Paulo.

Este repositório contém o backend da plataforma, responsável por:

- Autenticar e autorizar usuários
- Gerenciar eventos e seus dados
- Organizar eventos por categorias
- Registrar interações da plataforma
- Oferecer ferramentas de moderação e administração

O projeto foi estruturado de forma modular para facilitar manutenção, testes e evolução.

---

## Funcionalidades

| Recurso | Descrição |
| --- | --- |
| Autenticação JWT | Login, access token, refresh token e controle de acesso |
| Usuários | Cadastro, consulta, edição e gerenciamento de contas |
| Eventos | Criação, listagem, edição e remoção de eventos |
| Categorias | Organização e classificação dos eventos |
| Interações | Estrutura preparada para favoritos, comentários e avaliações |
| Administração | Controle de acesso por perfil |
| Validação de dados | DTOs validados com `class-validator` |

---

## Stack

| Tecnologia | Uso |
| --- | --- |
| [NestJS](https://nestjs.com/) | Framework principal da API |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Prisma](https://www.prisma.io/) | ORM, schema e migrations |
| [PostgreSQL](https://www.postgresql.org/) | Banco de dados relacional |
| [JWT](https://jwt.io/) | Autenticação stateless |
| [class-validator](https://github.com/typestack/class-validator) | Validação dos DTOs |
| [Docker](https://www.docker.com/) | Containerização da aplicação |
| Docker Compose | Orquestração da API, banco e migrations |

---

## Arquitetura

A aplicação segue uma estrutura modular baseada nas funcionalidades da plataforma.

```text
src/
├── modules/
│   ├── auth/            # Autenticação e autorização
│   ├── users/           # Usuários
│   ├── events/          # Eventos
│   ├── categories/      # Categorias
│   ├── interactions/    # Interações
│   └── admin/           # Administração
│
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── generated/
│   └── prisma/          # Prisma Client gerado
│
├── common/              # Recursos compartilhados
├── app.module.ts
└── main.ts

prisma/
├── schema.prisma
└── migrations/
```

### Fluxo da aplicação

```text
Cliente
   |
   v
Controller
   |
   v
DTO + ValidationPipe
   |
   v
Guards
   |
   v
Service
   |
   v
Prisma Client
   |
   v
PostgreSQL
```

---

## Arquitetura com Docker

O ambiente Docker utiliza três etapas principais:

```text
+-------------------+
|    PostgreSQL     |
|        db         |
+---------+---------+
          |
          | healthcheck
          v
+-------------------+
|    Migrations     |
|      migrate      |
+---------+---------+
          |
          | concluído com sucesso
          v
+-------------------+
|      NestJS       |
|       api         |
+---------+---------+
          |
          v
 localhost:3000
```

O fluxo garante que:

1. o PostgreSQL seja iniciado;
2. o banco esteja saudável;
3. todas as migrations sejam aplicadas;
4. somente depois a API seja iniciada.

Dessa forma, a aplicação não inicia sobre um banco desatualizado.

---

# Começando

Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
cd mareln-backend
```

O projeto pode ser executado de duas formas:

- Docker Compose — recomendado
- Ambiente local

---

# Execução com Docker Compose

Este é o método recomendado para executar o projeto.

## Pré-requisitos

É necessário apenas:

- Docker Desktop ou Docker Engine
- Docker Compose

Não é necessário instalar manualmente:

- PostgreSQL
- Prisma
- Node.js para executar os containers

---

## 1. Configure as variáveis de ambiente

Copie:

```text
.env.example
```

para:

```text
.env
```

Exemplo:

```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

> Nunca versione seu `.env`.

A conexão entre API e PostgreSQL é configurada pelo próprio Docker Compose.

Dentro dos containers, o banco é acessado pelo nome do serviço:

```text
db
```

e não por:

```text
localhost
```

---

## 2. Suba todo o ambiente

Execute:

```bash
docker compose up --build -d --wait
```

Esse único comando:

- constrói a imagem da API;
- cria o PostgreSQL;
- cria o volume do banco;
- cria a rede interna;
- aguarda o PostgreSQL ficar saudável;
- executa as migrations;
- inicia a API;
- aguarda os healthchecks.

Quando finalizar com sucesso, a API estará disponível em:

```text
http://localhost:3000
```

---

## 3. Verifique os serviços

```bash
docker compose ps -a
```

O ambiente deve apresentar os serviços em estado saudável ou concluído.

O serviço de migrations é executado apenas uma vez e finaliza após aplicar as migrations.

---

## Logs

### Ambiente completo

```bash
docker compose logs -f
```

### API

```bash
docker compose logs -f api
```

### PostgreSQL

```bash
docker compose logs -f db
```

### Migrations

```bash
docker compose logs migrate
```

---

## Parar o ambiente

```bash
docker compose down
```

Esse comando remove os containers e a rede criada pelo Compose, mas mantém os dados do PostgreSQL.

---

## Subir novamente

```bash
docker compose up -d --wait
```

Se não houve alteração no código ou no Dockerfile, não é necessário utilizar `--build`.

---

## Rebuild após alteração no código

Quando houver alterações que precisam entrar na imagem:

```bash
docker compose up --build -d --wait
```

O Compose recria o necessário automaticamente.

Não é necessário executar manualmente:

```text
docker stop
docker rm
docker run
docker network create
docker volume create
```

---

## Apagar completamente o banco local

Use apenas quando quiser remover também os dados persistidos:

```bash
docker compose down -v
```

> Esse comando apaga o volume do PostgreSQL e todos os dados armazenados nele.

---

# Execução local

Também é possível executar o projeto sem Docker.

## Pré-requisitos

- Node.js
- npm
- PostgreSQL

---

## 1. Instale as dependências

```bash
npm install
```

---

## 2. Configure o `.env`

Exemplo:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/mareln
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## 3. Gere o Prisma Client

```bash
npm run prisma:generate
```

ou:

```bash
npx prisma generate
```

---

## 4. Aplique as migrations

Para desenvolvimento:

```bash
npx prisma migrate dev
```

---

## 5. Inicie a API

```bash
npm run start:dev
```

A API estará disponível em:

```text
http://localhost:3000
```

---

# Prisma e migrations

O projeto utiliza Prisma com PostgreSQL.

O Prisma Client é gerado a partir de:

```text
prisma/schema.prisma
```

e salvo em:

```text
src/generated/prisma
```

A configuração do Prisma é centralizada em:

```text
prisma.config.ts
```

---

## Criando uma nova migration

Ao alterar o `schema.prisma`, durante o desenvolvimento execute:

```bash
npx prisma migrate dev --name nome_da_migration
```

Exemplo:

```bash
npx prisma migrate dev --name add_evento_categoria
```

Isso cria uma nova pasta em:

```text
prisma/migrations/
```

As migrations devem ser versionadas no Git.

---

## Docker Compose

No ambiente Docker, não é necessário executar migrations manualmente.

O serviço:

```text
migrate
```

executa automaticamente:

```bash
prisma migrate deploy
```

antes da API ser iniciada.

O fluxo é:

```text
PostgreSQL
    |
    v
healthcheck
    |
    v
prisma migrate deploy
    |
    v
API
```

---

## Verificar migrations manualmente

Se necessário:

```bash
docker compose exec api npx prisma migrate status
```

---

## Validar o schema

```bash
docker compose exec api npx prisma validate
```

ou localmente:

```bash
npm run prisma:validate
```

---

# Docker

## Dockerfile

O projeto utiliza build multi-stage.

A ideia é separar:

```text
Build
  |
  v
Prisma generate
  |
  v
NestJS build
  |
  v
Imagem final
```

A imagem final contém apenas o necessário para execução da aplicação.

Isso reduz:

- tamanho da imagem;
- arquivos desnecessários;
- dependências de desenvolvimento no runtime.

---

## Docker Compose

O `docker-compose.yml` é responsável por orquestrar:

```text
db
|
├── PostgreSQL
├── volume persistente
└── healthcheck

migrate
|
├── depende do banco saudável
└── executa Prisma migrations

api
|
├── depende das migrations
├── executa NestJS
└── healthcheck
```

A rede entre os serviços é criada automaticamente pelo Docker Compose.

---

## Persistência

O PostgreSQL utiliza um volume Docker.

Isso permite:

```text
Container PostgreSQL removido
            |
            v
Volume continua existindo
            |
            v
Dados permanecem salvos
```

Executar:

```bash
docker compose down
```

mantém os dados.

Executar:

```bash
docker compose down -v
```

remove os dados.

---

# Scripts

## Aplicação

| Comando | Descrição |
| --- | --- |
| `npm run start:dev` | Inicia a API em desenvolvimento |
| `npm run build` | Compila o projeto |
| `npm run start:prod` | Executa a build de produção |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:validate` | Valida o schema Prisma |
| `npm run prisma:migrate:deploy` | Aplica migrations existentes |
| `npm run prisma:migrate:status` | Verifica o estado das migrations |
| `npx prisma migrate dev` | Cria migrations durante o desenvolvimento |
| `npx prisma studio` | Abre o Prisma Studio |

---

## Docker Compose

| Comando | Descrição |
| --- | --- |
| `docker compose up --build -d --wait` | Constrói e inicia todo o ambiente |
| `docker compose up -d --wait` | Inicia o ambiente já construído |
| `docker compose ps -a` | Exibe o estado dos serviços |
| `docker compose logs -f` | Acompanha todos os logs |
| `docker compose logs -f api` | Logs da API |
| `docker compose logs -f db` | Logs do PostgreSQL |
| `docker compose logs migrate` | Logs das migrations |
| `docker compose down` | Encerra o ambiente preservando o banco |
| `docker compose down -v` | Encerra o ambiente e apaga o banco |

---

# Validação do ambiente Docker

O fluxo Docker foi validado partindo de um banco vazio.

Foram verificados:

- PostgreSQL saudável;
- migrations aplicadas com sucesso;
- API saudável;
- `GET /` retornando HTTP 200;
- consultas em `/categorias` acessando o banco;
- consultas em `/eventos` acessando o banco;
- ausência de drift entre banco e Prisma Schema;
- Prisma Schema válido;
- build concluído com sucesso;
- lint concluído com sucesso.

---

# Fluxo recomendado para a equipe

## Primeira execução

```bash
git clone <URL_DO_REPOSITORIO>
cd mareln-backend
```

Crie o `.env`:

```bash
cp .env.example .env
```

Edite o:

```text
JWT_SECRET
```

Depois execute:

```bash
docker compose up --build -d --wait
```

Pronto.

---

## Atualizando o projeto

Depois de um:

```bash
git pull
```

execute:

```bash
docker compose up --build -d --wait
```

O Compose atualizará a imagem, executará migrations pendentes e reiniciará a API na ordem correta.

---

## Desenvolvimento

O GitHub é responsável pelo versionamento do código.

O Docker é responsável por padronizar o ambiente de execução.

O Prisma é responsável pela comunicação entre a aplicação e o PostgreSQL.

O Docker Compose integra toda a infraestrutura necessária para executar o backend.

Fluxo atual:

```text
GitHub
   |
   v
Código
   |
   v
Docker Compose
   |
   +--------------------+
   |                    |
   v                    v
PostgreSQL            Build API
   |                    |
   v                    v
Healthcheck        Prisma Client
   |                    |
   +---------+----------+
             |
             v
         Migrations
             |
             v
           NestJS
             |
             v
      http://localhost:3000
```

Para executar o projeto em uma nova máquina, o fluxo principal é simplesmente:

```bash
docker compose up --build -d --wait
```

---

**MaréLN Backend**  
API da plataforma de eventos do Litoral Norte de São Paulo.