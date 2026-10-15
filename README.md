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
- [Persistência do banco](#persistência-do-banco-de-dados)
- [Prisma e migrations](#prisma-e-migrations)
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

> Ao utilizar `docker run --env-file .env`, mantenha os valores sem aspas para evitar problemas de interpretação da `DATABASE_URL`.

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

> **Atenção:** nunca versione o arquivo `.env`. Em produção, utilize um `JWT_SECRET` longo, aleatório e exclusivo.

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

Crie uma rede para permitir que o backend encontre o PostgreSQL:

```bash
docker network create mareln-network
```

Esse comando precisa ser executado apenas uma vez.

Para visualizar as redes existentes:

```bash
docker network ls
```

---

### 2. Criar o volume do PostgreSQL

Crie um volume para persistir os dados:

```bash
docker volume create mareln-postgres-data
```

Para visualizar os volumes:

```bash
docker volume ls
```

---

### 3. Subir o PostgreSQL

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

Confira se o container está rodando:

```bash
docker ps
```

Veja os logs:

```bash
docker logs mareln-postgres
```

Quando o PostgreSQL estiver pronto, os logs devem indicar que o banco está aceitando conexões.

---

### 5. Configurar o `.env`

Para execução totalmente em Docker:

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

Nesse cenário.

Dentro do container do backend:

```text
localhost
```

representa o próprio container NestJS.

Para acessar o PostgreSQL, utilize:

```text
mareln-postgres
```

---

### 6. Construir a imagem do backend

Na raiz do projeto:

```bash
docker build -t mareln-backend .
```

O Docker utiliza o `Dockerfile` para gerar a imagem:

```text
mareln-backend
```

O fluxo de build é:

```text
Node.js
   |
   v
Instala dependências
   |
   v
Copia o projeto
   |
   v
Gera Prisma Client
   |
   v
Compila NestJS
   |
   v
Imagem mareln-backend
```

---

### 7. Executar o backend

Execute o backend conectado à mesma rede do PostgreSQL:

```bash
docker run -d --name mareln-api --network mareln-network --env-file .env -p 3000:3000 mareln-backend
```

A API ficará disponível em:

```text
http://localhost:3000
```

O mapeamento:

```text
3000:3000
```

significa:

```text
porta 3000 da máquina -> porta 3000 do container
```

---

### 8. Verificar a conexão com o banco

Confira a `DATABASE_URL` recebida pelo container:

```bash
docker exec mareln-api printenv DATABASE_URL
```

O resultado esperado é:

```text
postgresql://mareln:1234@mareln-postgres:5432/mareln
```

Para verificar o estado das migrations:

```bash
docker exec mareln-api npx prisma migrate status
```

Se existirem migrations ainda não aplicadas, o Prisma exibirá quais estão pendentes.

---

### 9. Aplicar as migrations

Para aplicar as migrations existentes no banco Docker:

```bash
docker exec mareln-api npx prisma migrate deploy
```

Depois confirme:

```bash
docker exec mareln-api npx prisma migrate status
```

O banco deverá aparecer como atualizado.

> Em containers, utilize `prisma migrate deploy` para aplicar migrations já existentes. `prisma migrate dev` é voltado ao desenvolvimento e criação de novas migrations.

---

### 10. Reiniciar o backend

Após aplicar as migrations, se necessário:

```bash
docker restart mareln-api
```

Para acompanhar a aplicação:

```bash
docker logs -f mareln-api
```

---

## Comunicação entre os containers

Os dois containers precisam estar na mesma rede:

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

Por isso:

```env
DATABASE_URL=postgresql://mareln:1234@mareln-postgres:5432/mareln
```

funciona sem precisar utilizar o endereço IP do container.

---

## Persistência do banco de dados

O PostgreSQL armazena seus dados em:

```text
/var/lib/postgresql/data
```

Dentro do container.

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

Se o container PostgreSQL for removido:

```bash
docker rm mareln-postgres
```

o volume continua existindo.

Ao criar novamente um container utilizando:

```bash
-v mareln-postgres-data:/var/lib/postgresql/data
```

os dados anteriores continuam disponíveis.

> Remover o volume apaga permanentemente os dados armazenados nele.

---

## Prisma e migrations

O Prisma Client é gerado durante o build da imagem:

```bash
npx prisma generate
```

Para verificar a configuração:

```bash
docker exec mareln-api npx prisma validate
```

Para verificar o estado das migrations:

```bash
docker exec mareln-api npx prisma migrate status
```

Para aplicar migrations existentes:

```bash
docker exec mareln-api npx prisma migrate deploy
```

Para regenerar o Prisma Client dentro do container:

```bash
docker exec mareln-api npx prisma generate
```

### Fluxo recomendado

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

Containers em execução:

```bash
docker ps
```

Todos os containers:

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

Inicie primeiro o banco:

```bash
docker start mareln-postgres
```

Depois o backend:

```bash
docker start mareln-api
```

Para acompanhar:

```bash
docker logs -f mareln-api
```

---

## Reiniciar containers

```bash
docker restart mareln-postgres
docker restart mareln-api
```

O comando `restart` mantém as configurações já existentes do container.

Se alguma variável de ambiente, rede ou configuração passada no `docker run` precisar mudar, recrie o container em vez de apenas reiniciá-lo.

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

Remover o container PostgreSQL não remove automaticamente:

```text
mareln-postgres-data
```

---

## Atualizando a aplicação com Docker

Depois de alterar o código:

### 1. Reconstrua a imagem

```bash
docker build -t mareln-backend .
```

### 2. Pare o backend antigo

```bash
docker stop mareln-api
```

### 3. Remova o container antigo

```bash
docker rm mareln-api
```

### 4. Crie o novo container

```bash
docker run -d --name mareln-api --network mareln-network --env-file .env -p 3000:3000 mareln-backend
```

### 5. Verifique migrations

```bash
docker exec mareln-api npx prisma migrate status
```

### 6. Aplique migrations pendentes

```bash
docker exec mareln-api npx prisma migrate deploy
```

### 7. Acompanhe os logs

```bash
docker logs -f mareln-api
```

Não é necessário recriar o PostgreSQL ou seu volume sempre que o código do backend mudar.

---

## Dockerfile

O backend utiliza:

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

### Fluxo

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

O `.dockerignore` evita que arquivos desnecessários sejam enviados durante o build.

Exemplo:

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

Ela contém o `schema.prisma`, necessário para:

```bash
npx prisma generate
```

e para o funcionamento das migrations.

---

## Scripts

### Aplicação

| Comando | Descrição |
| --- | --- |
| `npm run start:dev` | Inicia a API em modo desenvolvimento com hot reload |
| `npm run build` | Gera a build de produção |
| `npm run start:prod` | Executa a build de produção |
| `npx prisma migrate dev` | Cria e aplica migrations em desenvolvimento |
| `npx prisma migrate deploy` | Aplica migrations existentes |
| `npx prisma migrate status` | Exibe o estado das migrations |
| `npx prisma studio` | Abre uma interface visual para o banco |
| `npx prisma generate` | Regenera o Prisma Client |
| `npx prisma validate` | Valida o schema Prisma |

### Docker — Backend

| Comando | Descrição |
| --- | --- |
| `docker build -t mareln-backend .` | Constrói a imagem do backend |
| `docker run -d --name mareln-api --network mareln-network --env-file .env -p 3000:3000 mareln-backend` | Executa o backend |
| `docker logs mareln-api` | Exibe os logs |
| `docker logs -f mareln-api` | Acompanha os logs |
| `docker stop mareln-api` | Para o backend |
| `docker start mareln-api` | Inicia novamente |
| `docker restart mareln-api` | Reinicia o backend |
| `docker rm mareln-api` | Remove o container |

### Docker — PostgreSQL

| Comando | Descrição |
| --- | --- |
| `docker pull postgres:16` | Baixa a imagem PostgreSQL |
| `docker logs mareln-postgres` | Exibe os logs |
| `docker stop mareln-postgres` | Para o banco |
| `docker start mareln-postgres` | Inicia novamente |
| `docker restart mareln-postgres` | Reinicia o banco |
| `docker rm mareln-postgres` | Remove o container |

### Docker — Prisma

| Comando | Descrição |
| --- | --- |
| `docker exec mareln-api npx prisma validate` | Valida o schema Prisma |
| `docker exec mareln-api npx prisma migrate status` | Verifica migrations |
| `docker exec mareln-api npx prisma migrate deploy` | Aplica migrations |
| `docker exec mareln-api npx prisma generate` | Regenera o Prisma Client |
| `docker exec mareln-api printenv DATABASE_URL` | Exibe a conexão usada pelo container |

### Docker — Infraestrutura

| Comando | Descrição |
| --- | --- |
| `docker ps` | Lista containers em execução |
| `docker ps -a` | Lista todos os containers |
| `docker images` | Lista imagens |
| `docker network ls` | Lista redes |
| `docker volume ls` | Lista volumes |
| `docker network create mareln-network` | Cria a rede do projeto |
| `docker volume create mareln-postgres-data` | Cria o volume do PostgreSQL |

---

## Desenvolvimento

O backend está sendo desenvolvido de forma incremental como parte da primeira versão do MaréLN.

Novos módulos, regras de negócio e recursos serão adicionados conforme a evolução da plataforma.

A aplicação pode ser executada diretamente com Node.js ou completamente através de Docker.

Na execução Docker:

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
Imagem mareln-backend
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

O Docker é responsável por padronizar o ambiente de execução da aplicação, permitindo que diferentes desenvolvedores utilizem as mesmas versões e configurações.

Cada desenvolvedor pode clonar o projeto, criar seus próprios containers e executar a aplicação sem precisar instalar o PostgreSQL diretamente na máquina.

O fluxo atual de inicialização com Docker é:

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
Buildar backend
   |
   v
Subir backend
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