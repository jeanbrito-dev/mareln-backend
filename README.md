# MaréLN Backend

API da plataforma de eventos do Litoral Norte de São Paulo.

Autenticação, gerenciamento de eventos, usuários, categorias e interações, construídos sobre uma arquitetura modular preparada para evolução.

**Status:** em desenvolvimento

---

## Sumário

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Stacks](#stacks)
- [Arquitetura](#arquitetura)
- [Começando](#começando)
- [Execução local](#opção-1--execução-local)
- [Execução com Docker](#opção-2--execução-com-docker)
- [Build, imagem e container](#build-imagem-e-container)
- [Persistência do banco](#persistência-do-banco-de-dados)
- [Prisma e migrations](#prisma-e-migrations)
- [Atualizando o backend](#atualizando-o-backend)
- [Scripts](#scripts)
- [Desenvolvimento](#desenvolvimento)

---

## Sobre

O MaréLN conecta moradores e turistas aos eventos do Litoral Norte de São Paulo.

Este repositório contém o backend da plataforma, responsável por:

- Autenticar e autorizar usuários
- Gerenciar eventos e seus dados
- Organizar eventos por categorias
- Registrar interações: favoritos, comentários e avaliações
- Oferecer ferramentas de moderação e administração

O projeto foi pensado de forma modular desde o início. Cada funcionalidade vive no seu próprio módulo, o que facilita a manutenção, os testes e a adição de novos recursos.

---

## Funcionalidades

| Recurso | Descrição |
| --- | --- |
| Autenticação JWT | Login seguro com tokens e controle de acesso por perfil |
| Usuários e perfis | Cadastro, perfis e gerenciamento de contas |
| Eventos | Criação, listagem, edição e detalhamento de eventos |
| Categorias | Classificação dos eventos para facilitar a descoberta |
| Interações | Favoritos, comentários e avaliações |
| Administração | Moderação de conteúdo e gestão da plataforma |
| Validação de dados | Entrada validada com `class-validator` |

---

## Stacks

| Tecnologia | Uso |
| --- | --- |
| [NestJS](https://nestjs.com/) | Framework principal da API |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Prisma](https://www.prisma.io/) | ORM, schema e migrations |
| [PostgreSQL](https://www.postgresql.org/) | Banco de dados relacional |
| [JWT](https://jwt.io/) | Autenticação stateless |
| [class-validator](https://github.com/typestack/class-validator) | Validação de DTOs |
| [Docker](https://www.docker.com/) | Padronização do ambiente e execução em containers |

---

## Arquitetura

A organização é modular, baseada nas principais funcionalidades da plataforma:

```text
src/
├── modules/
│   ├── auth/            # Autenticação e autorização
│   ├── users/           # Usuários e perfis
│   ├── events/          # Eventos e seus dados
│   ├── categories/      # Categorias dos eventos
│   ├── interactions/    # Favoritos, comentários e avaliações
│   └── admin/           # Moderação e administração
│
├── database/            # Integração com o banco de dados
├── common/              # Recursos compartilhados
├── app.module.ts        # Módulo raiz
└── main.ts              # Ponto de entrada da aplicação

prisma/
└── schema.prisma        # Modelagem do banco de dados
```

Cada módulo concentra seu próprio controller, service e as regras de negócio relacionadas à funcionalidade.

### Módulos

| Módulo | Função |
| --- | --- |
| `auth` | Autenticação e autorização |
| `users` | Usuários e perfis |
| `events` | Eventos e seus dados |
| `categories` | Categorias dos eventos |
| `interactions` | Favoritos, comentários e avaliações |
| `admin` | Moderação e administração |

### Fluxo geral

```text
Cliente
   |
   v
Controller
   |
   v
Validação (DTO + class-validator)
   |
   v
Guard (JWT)
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

### Arquitetura com Docker

Na execução utilizando Docker, o backend e o PostgreSQL rodam em containers separados.

Os containers são conectados através de uma rede Docker própria.

```text
Navegador / Cliente
        |
        | localhost:3000
        v
+-----------------------+
|      mareln-api       |
|       NestJS          |
+-----------------------+
        |
        | mareln-postgres:5432
        v
+-----------------------+
|   mareln-postgres     |
|     PostgreSQL        |
+-----------------------+
        |
        v
mareln-postgres-data
      (volume)
```

O volume mantém os dados do PostgreSQL mesmo que o container do banco seja removido e recriado.

---

## Começando

O projeto pode ser executado de duas formas:

- Localmente, utilizando Node.js, npm e PostgreSQL
- Com Docker, utilizando containers separados para o backend e PostgreSQL

### Clone o projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd mareln-backend
```

---

## Configuração das variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto.

A configuração da `DATABASE_URL` depende da forma utilizada para executar a aplicação.

### Ambiente local

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/mareln
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Ambiente Docker

Quando o backend e o PostgreSQL estão em containers na mesma rede Docker:

```env
DATABASE_URL=postgresql://mareln:1234@mareln-postgres:5432/mareln
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

> Ao utilizar `docker run --env-file .env`, mantenha os valores sem aspas.

Dentro da rede Docker:

```text
mareln-postgres
```

é o hostname utilizado pelo backend para encontrar o container do PostgreSQL.

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | String de conexão com o PostgreSQL |
| `JWT_SECRET` | Chave usada para assinar os tokens JWT |
| `JWT_EXPIRES_IN` | Tempo de expiração do access token |
| `JWT_REFRESH_EXPIRES_IN` | Tempo de expiração do refresh token |

> **Atenção:** nunca versione o arquivo `.env`.

Recomenda-se manter um arquivo `.env.example`:

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## Opção 1 — Execução local

### Pré-requisitos

- Node.js 18 ou superior
- npm
- PostgreSQL em execução

### Instale as dependências

```bash
npm install
```

### Gere o Prisma Client

```bash
npx prisma generate
```

### Execute as migrations

```bash
npx prisma migrate dev
```

### Inicie o servidor

```bash
npm run start:dev
```

A API estará disponível em:

```text
http://localhost:3000
```

---

## Opção 2 — Execução com Docker

Nesta opção, tanto o backend quanto o PostgreSQL são executados em containers.

Não é necessário instalar PostgreSQL diretamente na máquina.

### Pré-requisitos

- Docker Desktop ou Docker Engine

---

### 1. Criar a rede Docker

```bash
docker network create mareln-network
```

A rede precisa ser criada apenas uma vez.

Para visualizar:

```bash
docker network ls
```

---

### 2. Criar o volume do PostgreSQL

```bash
docker volume create mareln-postgres-data
```

Para visualizar:

```bash
docker volume ls
```

---

### 3. Criar e iniciar o container do PostgreSQL

#### PowerShell

```powershell
docker run -d `
  --name mareln-postgres `
  --network mareln-network `
  -e POSTGRES_USER=mareln `
  -e POSTGRES_PASSWORD=1234 `
  -e POSTGRES_DB=mareln `
  -v mareln-postgres-data:/var/lib/postgresql/data `
  postgres:16
```

#### Bash / Linux / macOS

```bash
docker run -d \
  --name mareln-postgres \
  --network mareln-network \
  -e POSTGRES_USER=mareln \
  -e POSTGRES_PASSWORD=1234 \
  -e POSTGRES_DB=mareln \
  -v mareln-postgres-data:/var/lib/postgresql/data \
  postgres:16
```

Esse container será criado com:

```text
Container: mareln-postgres
Usuário:   mareln
Senha:     1234
Banco:     mareln
Porta:     5432
Volume:    mareln-postgres-data
```

Como apenas o backend precisa acessar o PostgreSQL, não é necessário publicar a porta `5432` para a máquina host.

---

### 4. Verificar o PostgreSQL

```bash
docker ps
```

Logs:

```bash
docker logs mareln-postgres
```

---

### 5. Configurar o `.env`

```env
DATABASE_URL=postgresql://mareln:1234@mareln-postgres:5432/mareln
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Não utilize:

```env
DATABASE_URL=postgresql://mareln:1234@localhost:5432/mareln
```

Dentro do container do backend, `localhost` representa o próprio container NestJS.

---

### 6. Buildar a imagem do backend

Na raiz do projeto:

```bash
docker build -t mareln-backend .
```

Esse comando lê o `Dockerfile` e cria a imagem:

```text
mareln-backend
```

Confira:

```bash
docker images
```

Exemplo:

```text
REPOSITORY        TAG       IMAGE ID       CREATED
mareln-backend    latest    ...
```

---

### 7. Criar e iniciar o container do backend

Depois da imagem pronta:

```bash
docker run -d --name mareln-api --network mareln-network --env-file .env -p 3000:3000 mareln-backend
```

Esse comando utiliza:

```text
imagem mareln-backend
        |
        v
container mareln-api
```

A API ficará disponível em:

```text
http://localhost:3000
```

---

### 8. Verificar o backend

```bash
docker ps
```

Você deverá ver:

```text
mareln-api
mareln-postgres
```

Logs:

```bash
docker logs -f mareln-api
```

---

### 9. Verificar a conexão com o banco

```bash
docker exec mareln-api printenv DATABASE_URL
```

Esperado:

```text
postgresql://mareln:1234@mareln-postgres:5432/mareln
```

Depois:

```bash
docker exec mareln-api npx prisma migrate status
```

---

### 10. Aplicar as migrations

```bash
docker exec mareln-api npx prisma migrate deploy
```

Depois confirme:

```bash
docker exec mareln-api npx prisma migrate status
```

---

## Build, imagem e container

No Docker, essas três coisas são diferentes:

```text
Dockerfile
   |
   | docker build
   v
Imagem
   |
   | docker run
   v
Container
```

### Dockerfile

Define como a imagem deve ser construída.

### Imagem

É o pacote pronto da aplicação.

Exemplo:

```text
mareln-backend
```

### Container

É uma instância da imagem em execução.

Exemplo:

```text
mareln-api
```

Então:

```bash
docker build -t mareln-backend .
```

cria a imagem.

E:

```bash
docker run --name mareln-api mareln-backend
```

cria o container usando essa imagem.

---

## Comunicação entre os containers

Os containers precisam estar na mesma rede:

```text
mareln-network
```

Fluxo:

```text
mareln-api
     |
     | DATABASE_URL
     v
mareln-postgres:5432
```

Os containers conseguem utilizar seus nomes como hostnames dentro da rede Docker.

---

## Persistência do banco de dados

O PostgreSQL salva seus dados em:

```text
/var/lib/postgresql/data
```

Esse diretório é ligado ao volume:

```text
mareln-postgres-data
```

através de:

```bash
-v mareln-postgres-data:/var/lib/postgresql/data
```

Fluxo:

```text
PostgreSQL
     |
     v
/var/lib/postgresql/data
     |
     v
mareln-postgres-data
```

Se o container for removido:

```bash
docker rm mareln-postgres
```

o volume continua existindo.

Ao criar outro container usando o mesmo volume, os dados continuam disponíveis.

> Remover o volume apaga permanentemente os dados armazenados nele.

---

## Prisma e migrations

O Prisma Client é gerado durante o build da imagem:

```bash
npx prisma generate
```

Validar o schema:

```bash
docker exec mareln-api npx prisma validate
```

Verificar migrations:

```bash
docker exec mareln-api npx prisma migrate status
```

Aplicar migrations existentes:

```bash
docker exec mareln-api npx prisma migrate deploy
```

Regenerar o Prisma Client:

```bash
docker exec mareln-api npx prisma generate
```

Fluxo:

```text
PostgreSQL iniciado
      |
      v
Backend iniciado
      |
      v
prisma migrate status
      |
      v
prisma migrate deploy
      |
      v
Banco atualizado
```

---

## Ver containers

```bash
docker ps
```

Todos:

```bash
docker ps -a
```

---

## Ver logs

### Backend

```bash
docker logs mareln-api
```

Tempo real:

```bash
docker logs -f mareln-api
```

### PostgreSQL

```bash
docker logs mareln-postgres
```

Tempo real:

```bash
docker logs -f mareln-postgres
```

---

## Parar os containers

### Backend

```bash
docker stop mareln-api
```

### PostgreSQL

```bash
docker stop mareln-postgres
```

---

## Iniciar novamente

Banco:

```bash
docker start mareln-postgres
```

Backend:

```bash
docker start mareln-api
```

---

## Reiniciar containers

```bash
docker restart mareln-postgres
docker restart mareln-api
```

Se variáveis, rede ou configuração do `docker run` mudarem, recrie o container em vez de apenas reiniciar.

---

## Remover containers

### Backend

```bash
docker stop mareln-api
docker rm mareln-api
```

### PostgreSQL

```bash
docker stop mareln-postgres
docker rm mareln-postgres
```

O volume continua existindo:

```text
mareln-postgres-data
```

---

## Atualizando o backend

Depois de alterar o código:

### 1. Buildar novamente a imagem

```bash
docker build -t mareln-backend .
```

### 2. Parar o container antigo

```bash
docker stop mareln-api
```

### 3. Remover o container antigo

```bash
docker rm mareln-api
```

### 4. Criar novo container com a nova imagem

```bash
docker run -d --name mareln-api --network mareln-network --env-file .env -p 3000:3000 mareln-backend
```

### 5. Verificar migrations

```bash
docker exec mareln-api npx prisma migrate status
```

### 6. Aplicar migrations pendentes

```bash
docker exec mareln-api npx prisma migrate deploy
```

### 7. Ver logs

```bash
docker logs -f mareln-api
```

Fluxo:

```text
Alterou código
    |
    v
docker build
    |
    v
Nova imagem
    |
    v
docker stop
    |
    v
docker rm
    |
    v
docker run
    |
    v
Novo container
```

Não é necessário recriar o PostgreSQL ou o volume sempre que o backend mudar.

---

## Dockerfile

```dockerfile
FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

Fluxo:

```text
FROM node:22
      |
      v
WORKDIR /app
      |
      v
COPY package*.json
      |
      v
npm ci
      |
      v
COPY .
      |
      v
prisma generate
      |
      v
npm run build
      |
      v
npm run start:prod
```

---

## .dockerignore

```text
node_modules
dist
build

.git
.gitignore
.github

.env
.env.*
!.env.example

coverage
.nyc_output

.vscode
.idea

*.log
npm-debug.log*

*.tsbuildinfo

.temp
.tmp

generated/prisma
src/generated/prisma
```

A pasta:

```text
prisma/
```

não deve ser ignorada.

Ela contém o `schema.prisma`, necessário para o Prisma Client e migrations.

---

## Scripts

### Aplicação

| Comando | Descrição |
| --- | --- |
| `npm run start:dev` | Inicia a API em modo desenvolvimento |
| `npm run build` | Gera a build |
| `npm run start:prod` | Executa a build de produção |
| `npx prisma migrate dev` | Cria e aplica migrations em desenvolvimento |
| `npx prisma migrate deploy` | Aplica migrations existentes |
| `npx prisma migrate status` | Exibe o estado das migrations |
| `npx prisma studio` | Abre interface visual do banco |
| `npx prisma generate` | Regenera o Prisma Client |
| `npx prisma validate` | Valida o schema |

### Docker — Backend

| Comando | Descrição |
| --- | --- |
| `docker build -t mareln-backend .` | Cria a imagem do backend |
| `docker run -d --name mareln-api --network mareln-network --env-file .env -p 3000:3000 mareln-backend` | Cria e inicia o container |
| `docker logs mareln-api` | Exibe logs |
| `docker logs -f mareln-api` | Acompanha logs |
| `docker stop mareln-api` | Para o backend |
| `docker start mareln-api` | Inicia novamente |
| `docker restart mareln-api` | Reinicia |
| `docker rm mareln-api` | Remove o container |

### Docker — PostgreSQL

| Comando | Descrição |
| --- | --- |
| `docker pull postgres:16` | Baixa a imagem PostgreSQL |
| `docker logs mareln-postgres` | Exibe logs |
| `docker stop mareln-postgres` | Para o banco |
| `docker start mareln-postgres` | Inicia novamente |
| `docker restart mareln-postgres` | Reinicia |
| `docker rm mareln-postgres` | Remove o container |

### Docker — Prisma

| Comando | Descrição |
| --- | --- |
| `docker exec mareln-api npx prisma validate` | Valida o schema |
| `docker exec mareln-api npx prisma migrate status` | Verifica migrations |
| `docker exec mareln-api npx prisma migrate deploy` | Aplica migrations |
| `docker exec mareln-api npx prisma generate` | Regenera o client |
| `docker exec mareln-api printenv DATABASE_URL` | Exibe a conexão usada |

### Docker — Infraestrutura

| Comando | Descrição |
| --- | --- |
| `docker ps` | Lista containers em execução |
| `docker ps -a` | Lista todos os containers |
| `docker images` | Lista imagens |
| `docker network ls` | Lista redes |
| `docker volume ls` | Lista volumes |
| `docker network create mareln-network` | Cria a rede |
| `docker volume create mareln-postgres-data` | Cria o volume |

---

## Desenvolvimento

O backend está sendo desenvolvido de forma incremental como parte da primeira versão do MaréLN.

Novos módulos, regras de negócio e recursos serão adicionados conforme a evolução da plataforma.

A aplicação pode ser executada localmente ou completamente através de Docker.

Fluxo atual com Docker:

```text
GitHub
   |
   v
Código do projeto
   |
   v
Dockerfile
   |
   v
docker build
   |
   v
Imagem mareln-backend
   |
   v
docker run
   |
   v
Container mareln-api
   |
   | mareln-network
   v
Container mareln-postgres
   |
   v
Volume mareln-postgres-data
```

O GitHub continua responsável pelo versionamento do código.

O Docker é responsável por padronizar o ambiente de execução da aplicação.

Cada desenvolvedor pode clonar o projeto, criar seus próprios containers e executar a aplicação sem precisar instalar o PostgreSQL diretamente na máquina.

Fluxo de inicialização:

```text
Criar rede
   |
   v
Criar volume
   |
   v
Subir PostgreSQL
   |
   v
docker build
   |
   v
Criar imagem
   |
   v
docker run
   |
   v
Criar container do backend
   |
   v
Verificar migrations
   |
   v
Aplicar migrations
   |
   v
API disponível
```

---

**MaréLN Backend**  
API da plataforma de eventos do Litoral Norte de São Paulo.