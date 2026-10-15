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
- [Scripts](#scripts)
- [Desenvolvimento](#desenvolvimento)

---

## Sobre

O MaréLN conecta moradores e turistas aos eventos do Litoral Norte de São Paulo. Este repositório contém o backend da plataforma, responsável por:

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

## Stack

| Tecnologia | Uso |
| --- | --- |
| [NestJS](https://nestjs.com/) | Framework principal da API |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Prisma](https://www.prisma.io/) | ORM, schema e migrations |
| [MySQL](https://www.mysql.com/) | Banco de dados relacional |
| [JWT](https://jwt.io/) | Autenticação stateless |
| [class-validator](https://github.com/typestack/class-validator) | Validação de DTOs |
| [Docker](https://www.docker.com/) | Padronização do ambiente e execução em container |

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
MySQL
```

---

## Começando

O projeto pode ser executado de duas formas:

- Localmente, utilizando Node.js e npm
- Em container, utilizando Docker

### Clone o projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd mareln-backend
```

### Configuração das variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto.

Exemplo:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/mareln"
JWT_SECRET="your-secret-key"
```

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | String de conexão com o MySQL |
| `JWT_SECRET` | Chave usada para assinar os tokens JWT |

> **Atenção:** nunca versione o arquivo `.env`. Em produção, utilize um `JWT_SECRET` longo, aleatório e exclusivo.

Recomenda-se manter também um arquivo `.env.example` no repositório:

```env
DATABASE_URL=
JWT_SECRET=
```

---

## Opção 1 — Execução local

### Pré-requisitos

- Node.js 18 ou superior
- npm
- MySQL em execução

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

### Pré-requisitos

- Docker Desktop ou Docker Engine
- MySQL acessível pela aplicação

### Construa a imagem

Na raiz do projeto:

```bash
docker build -t mareln-backend .
```

Esse comando utiliza o `Dockerfile` do projeto para criar uma imagem chamada:

```text
mareln-backend
```

### Execute o container

```bash
docker run --name mareln-api --env-file .env -p 3000:3000 mareln-backend
```

A API estará disponível em:

```text
http://localhost:3000
```

O mapeamento:

```text
3000:3000
```

representa:

```text
porta 3000 da máquina -> porta 3000 do container
```

### Executar em segundo plano

Para deixar o container rodando em background:

```bash
docker run -d --name mareln-api --env-file .env -p 3000:3000 mareln-backend
```

### Ver containers em execução

```bash
docker ps
```

### Ver logs

```bash
docker logs mareln-api
```

Para acompanhar os logs em tempo real:

```bash
docker logs -f mareln-api
```

### Parar o container

```bash
docker stop mareln-api
```

### Iniciar novamente

```bash
docker start mareln-api
```

### Remover o container

```bash
docker rm mareln-api
```

---

## Banco local + Docker

Se o MySQL estiver rodando diretamente na máquina host, existe uma diferença importante.

Na execução local:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/mareln"
```

Dentro do container, `localhost` representa o próprio container.

Por isso, ao utilizar Docker no Windows ou macOS, pode ser necessário usar:

```env
DATABASE_URL="mysql://USER:PASSWORD@host.docker.internal:3306/mareln"
```

Assim, o container consegue acessar o MySQL que está rodando na máquina local.

---

## Atualizando a aplicação com Docker

Depois de alterar o código, é necessário reconstruir a imagem:

```bash
docker build -t mareln-backend .
```

Se o container antigo ainda existir, pare-o:

```bash
docker stop mareln-api
```

Depois remova-o:

```bash
docker rm mareln-api
```

E execute novamente:

```bash
docker run --name mareln-api --env-file .env -p 3000:3000 mareln-backend
```

---

## Scripts

### Aplicação

| Comando | Descrição |
| --- | --- |
| `npm run start:dev` | Inicia a API em modo desenvolvimento com hot reload |
| `npm run build` | Gera a build de produção |
| `npm run start:prod` | Executa a build de produção |
| `npx prisma migrate dev` | Cria e aplica migrations em desenvolvimento |
| `npx prisma studio` | Abre uma interface visual para o banco de dados |
| `npx prisma generate` | Regenera o Prisma Client |

### Docker

| Comando | Descrição |
| --- | --- |
| `docker build -t mareln-backend .` | Constrói a imagem Docker da aplicação |
| `docker run --env-file .env -p 3000:3000 mareln-backend` | Executa a API em um container |
| `docker ps` | Lista containers em execução |
| `docker logs mareln-api` | Exibe os logs do container |
| `docker stop mareln-api` | Para o container |
| `docker start mareln-api` | Inicia novamente um container parado |
| `docker rm mareln-api` | Remove o container |

---

## Desenvolvimento

O backend está sendo desenvolvido de forma incremental como parte da primeira versão do MaréLN.

Novos módulos, regras de negócio e recursos serão adicionados conforme a evolução da plataforma.

A aplicação pode ser executada diretamente com Node.js ou através de Docker, permitindo que diferentes desenvolvedores trabalhem em um ambiente de execução padronizado.

O Docker não substitui o fluxo de desenvolvimento com Git e GitHub. O código continua sendo versionado normalmente, enquanto o Docker garante que a aplicação seja construída e executada em um ambiente consistente.

---

**MaréLN Backend**  
API da plataforma de eventos do Litoral Norte de São Paulo.