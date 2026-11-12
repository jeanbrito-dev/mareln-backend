# MaréLN Backend

API da plataforma de eventos do Litoral Norte de São Paulo.

Autenticação, gerenciamento de eventos, usuários, categorias e interações, construídos sobre uma arquitetura modular.

**Status:** em desenvolvimento.

---

## Sumário

- Sobre
- Funcionalidades
- Tecnologias
- Arquitetura
- Pré-requisitos
- Instalação em uma nova máquina
- Configuração das variáveis de ambiente
- Execução com Docker Compose
- Banco de dados e migrations
- Seed de demonstração
- Contas de demonstração
- Integração com o frontend
- Execução local
- Scripts disponíveis
- Persistência e backups
- Solução de problemas

---

## Sobre

O MaréLN conecta moradores e turistas aos eventos do Litoral Norte de São Paulo.

Este repositório contém o backend da plataforma, responsável por:

- Autenticar e autorizar usuários.
- Gerenciar eventos e seus dados.
- Organizar eventos por categorias.
- Registrar favoritos, comentários e avaliações.
- Gerenciar perfis de usuários.
- Oferecer ferramentas de moderação e administração.

O projeto utiliza uma arquitetura modular para facilitar manutenção, testes e evolução.

---

## Funcionalidades

| Recurso | Descrição |
|---|---|
| Autenticação JWT | Login, access token, refresh token e controle de acesso |
| Usuários | Cadastro, consulta e edição de perfis |
| Eventos | Criação, listagem, edição e exclusão |
| Categorias | Organização dos eventos |
| Favoritos | Adição, consulta e remoção de eventos favoritos |
| Comentários | Estrutura de comentários vinculados aos eventos |
| Avaliações | Registro de avaliações |
| Administração | Controle de acesso por perfil e moderação |
| Localização | Coordenadas e precisão da localização |
| Upload de imagens | Armazenamento persistente de arquivos |
| Validação | DTOs com class-validator |

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| NestJS | Framework principal da API |
| TypeScript | Tipagem estática |
| Prisma 7 | ORM, schema e migrations |
| PostgreSQL 16 | Banco de dados relacional |
| JWT | Autenticação |
| bcrypt | Hash de senhas |
| Docker | Containerização |
| Docker Compose | Orquestração dos serviços |

---

## Arquitetura

O backend possui organização modular:

```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── events/
│   ├── categories/
│   ├── interactions/
│   └── admin/
├── prisma/
├── generated/
│   └── prisma/
├── common/
├── app.module.ts
└── main.ts

prisma/
├── schema.prisma
├── migrations/
└── seed.mjs
```

### Fluxo de requisição

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

## Pré-requisitos

Para executar o backend com Docker:

- Git
- Docker Desktop
- Docker Compose

O Node.js e o npm do computador não são necessários para executar a API dentro dos containers.

Para executar também o frontend do Mareln, será necessário instalar Node.js e npm no computador.

---

# Instalação em uma nova máquina

## 1. Clonar os repositórios

Clone o backend:

```bash
git clone <URL_DO_REPOSITORIO_BACKEND>
cd mareln-backend
```

Clone também o frontend em uma pasta separada:

```bash
git clone <URL_DO_REPOSITORIO_FRONTEND>
```

## 2. Criar o arquivo de ambiente

Na pasta `mareln-backend`, execute:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e configure as variáveis necessárias.

## 3. Configurar as variáveis

Exemplo de configuração:

```env
# Autenticação
JWT_SECRET=SUBSTITUA_POR_UM_SEGREDO_FORTE
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# PostgreSQL
POSTGRES_USER=mareln
POSTGRES_PASSWORD=DEFINA_UMA_SENHA_LOCAL
POSTGRES_DB=mareln

# Dados de demonstração
SEED_DEMO_PASSWORD=DEFINA_UMA_SENHA_COM_PELO_MENOS_12_CARACTERES

# Servidor
PORT=3001
CORS_ORIGINS=http://localhost:3000
```

**Atenção às senhas:**

- `JWT_SECRET` deve ser um segredo forte e exclusivo.
- `POSTGRES_PASSWORD` deve utilizar caracteres compatíveis com URL, preferencialmente letras, números, `_` e `-`, pois o Docker Compose monta a `DATABASE_URL` utilizando essa variável.
- `SEED_DEMO_PASSWORD` deve possuir pelo menos 12 caracteres.
- Todas as contas criadas pelo seed utilizam a senha definida em `SEED_DEMO_PASSWORD`.

Nunca versione o arquivo `.env`.

A variável `DATABASE_URL` é montada automaticamente pelo Docker Compose. Não é necessário adicioná-la ao `.env` para o funcionamento pelo Docker.

---

# Execução com Docker Compose

O Docker Compose é o método recomendado para executar o backend.

## 1. Validar a configuração

```bash
docker compose config --quiet
```

Se não houver saída, a configuração foi aceita.

## 2. Construir e iniciar o ambiente

```bash
docker compose up -d --build
```

O comando:

- Constrói a imagem da API.
- Constrói a imagem de migrations.
- Cria o PostgreSQL.
- Cria os volumes persistentes.
- Cria a rede interna.
- Aguarda o PostgreSQL ficar saudável.
- Executa as migrations pendentes.
- Inicia a API.

## 3. Verificar os serviços

```bash
docker compose ps -a
```

O resultado esperado é:

| Serviço | Estado esperado |
|---|---|
| db | Up (healthy) |
| migrate | Exited (0) |
| api | Up (healthy) |

O serviço `migrate` finaliza normalmente depois de aplicar as migrations. Isso não significa falha.

## 4. Endereço da API

Com a configuração de exemplo, a API estará disponível em:

```text
http://localhost:3001
```

O container executa a aplicação internamente na porta 3000, publicada externamente pela porta 3001.

---

# Banco de dados e migrations

O projeto utiliza Prisma 7 com PostgreSQL.

O schema está localizado em:

```text
prisma/schema.prisma
```

O Prisma Client é gerado em:

```text
src/generated/prisma
```

Durante a compilação NestJS, os arquivos são disponibilizados em:

```text
dist/generated/prisma
```

A configuração do Prisma está centralizada em:

```text
prisma.config.ts
```

## Aplicação automática das migrations

No ambiente Docker, o serviço `migrate` executa:

```bash
npm run prisma:migrate:deploy
```

A API depende da conclusão bem-sucedida das migrations.

O fluxo é:

```text
PostgreSQL
    |
    v
Healthcheck
    |
    v
Prisma migrate deploy
    |
    v
API NestJS
```

Não é necessário executar migrations manualmente durante a instalação inicial.

## Criar uma nova migration

Durante o desenvolvimento, depois de alterar o `schema.prisma`, execute:

```bash
npx prisma migrate dev --name nome_da_migration
```

Exemplo:

```bash
npx prisma migrate dev --name add_evento_categoria
```

As migrations devem ser versionadas no Git.

## Consultar o estado das migrations

```bash
docker compose exec api npx prisma migrate status
```

## Validar o schema

```bash
docker compose exec api npx prisma validate
```

---

# Seed de demonstração

O projeto possui um seed para preparar automaticamente uma base de demonstração.

Ele não é executado automaticamente durante a inicialização do Docker. Isso permite controlar quando os dados de demonstração serão cadastrados.

## Executar o seed

Depois que o PostgreSQL e a API estiverem funcionando, execute:

```bash
docker compose run --rm migrate npm run db:seed
```

O script:

- Cria ou atualiza cinco contas reservadas à demonstração.
- Cria ou encontra as seis categorias.
- Cria ou atualiza onze eventos fictícios.
- Prepara quatro favoritos.
- Prepara uma avaliação.
- Utiliza bcrypt para proteger as senhas.

### Dados preparados

| Tipo | Quantidade |
|---|---:|
| Administradores | 1 |
| Divulgadores | 2 |
| Visitantes | 2 |
| Categorias | 6 |
| Eventos aprovados | 8 |
| Eventos pendentes | 2 |
| Eventos rejeitados | 1 |
| Favoritos | 4 |
| Avaliações | 1 |

Os eventos possuem datas futuras definidas no arquivo `prisma/seed.mjs`, imagens não fornecidas pelo seed e coordenadas aproximadas para demonstração.

Os registros são fictícios e não representam eventos reais confirmados.

## Idempotência

O seed utiliza operações de upsert e identificação dos eventos de demonstração para evitar duplicações quando executado novamente.

Ao executar o seed novamente:

- Os cinco usuários de demonstração têm seus dados principais e senhas restaurados.
- Os onze eventos de demonstração são atualizados.
- As seis categorias são preservadas ou criadas.
- Os quatro favoritos de demonstração são garantidos novamente.
- A avaliação de demonstração é restaurada para nota 5.

O script não apaga usuários, eventos ou registros que não pertencem à sua base reservada de demonstração.

**Importante:** uma nova execução pode restaurar favoritos que foram removidos durante os testes. Não execute novamente indiscriminadamente depois de personalizar os dados de demonstração.

O seed é destinado exclusivamente a ambientes de desenvolvimento, testes e apresentação. Não execute em produção.

---

# Contas de demonstração

As contas abaixo são criadas pelo seed:

| Perfil | E-mail |
|---|---|
| Administrador | `admin.demo@mareln.local` |
| Divulgador 1 | `divulgador1.demo@mareln.local` |
| Divulgador 2 | `divulgador2.demo@mareln.local` |
| Visitante 1 | `visitante1.demo@mareln.local` |
| Visitante 2 | `visitante2.demo@mareln.local` |

Todas utilizam a senha definida na variável:

```text
SEED_DEMO_PASSWORD
```

A senha não deve ser armazenada no GitHub nem compartilhada publicamente.

---

# Integração com o frontend

O frontend do Mareln utiliza Next.js e é executado separadamente do backend.

Na pasta `mareln-desktop`, configure o arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MAPTILER_KEY=SUA_CHAVE_PUBLICA_MAPTILER
```

A origem autorizada pelo backend deve corresponder ao endereço do frontend:

```env
CORS_ORIGINS=http://localhost:3000
```

## Executar o frontend

Na pasta `mareln-desktop`, execute:

```bash
npm install
```

Depois:

```bash
npm run dev
```

O frontend estará disponível em:

```text
http://localhost:3000
```

O backend permanece disponível em:

```text
http://localhost:3001
```

Os arquivos `.env` e `.env.local` são configurações locais e não devem ser enviados ao GitHub.

---

# Logs e monitoramento

## Todos os serviços

```bash
docker compose logs -f
```

## API

```bash
docker compose logs -f api
```

## PostgreSQL

```bash
docker compose logs -f db
```

## Migrations

```bash
docker compose logs migrate
```

## Estado dos containers

```bash
docker compose ps -a
```

---

# Parar e iniciar o ambiente

## Parar os serviços

```bash
docker compose down
```

Esse comando remove os containers e a rede, mas preserva os volumes do PostgreSQL e dos uploads.

## Iniciar novamente

```bash
docker compose up -d
```

## Reconstruir após alterações no código

```bash
docker compose up -d --build
```

O Compose reconstruirá as imagens e executará as migrations pendentes antes de iniciar a API.

---

# Persistência e backups

O PostgreSQL utiliza o volume:

```text
postgres_data
```

Os arquivos enviados à API utilizam:

```text
mareln_uploads
```

Executar:

```bash
docker compose down
```

mantém ambos os volumes.

Executar:

```bash
docker compose down -v
```

remove os volumes e, consequentemente, os dados do PostgreSQL e os arquivos de upload armazenados neles.

**Esse comando deve ser utilizado somente quando houver intenção explícita de apagar os dados locais.**

Antes de limpar o banco, faça um backup sempre que os registros forem importantes.

---

# Solução de problemas

## Erro P1000 do Prisma

Indica falha de autenticação no PostgreSQL.

Verifique se:

- `POSTGRES_USER` está correto.
- `POSTGRES_PASSWORD` corresponde à senha armazenada no banco.
- `POSTGRES_DB` está correto.
- A `DATABASE_URL` foi montada corretamente.

A senha configurada no `.env` não altera automaticamente uma senha já registrada em um volume PostgreSQL existente.

## Erro ECONNRESET durante o build

Indica uma falha de conectividade durante a instalação de dependências pelo npm dentro do Docker.

Verifique a conexão com a internet e tente novamente:

```bash
docker compose up -d --build
```

Não remova volumes por causa desse erro.

## Erro de variável de ambiente ausente

Confira se o `.env` foi criado a partir do `.env.example` e se todas as variáveis obrigatórias foram preenchidas.

Valide:

```bash
docker compose config --quiet
```

## API não iniciou

Confira:

```bash
docker compose ps -a
```

E consulte:

```bash
docker compose logs --no-color migrate
docker compose logs --no-color api
```

A API depende da conclusão bem-sucedida do serviço de migrations.

---

# Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run start:dev` | Inicia a API em desenvolvimento |
| `npm run build` | Compila o projeto |
| `npm run start:prod` | Executa a build de produção |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:validate` | Valida o schema Prisma |
| `npm run prisma:migrate:deploy` | Aplica migrations existentes |
| `npm run prisma:migrate:status` | Consulta o estado das migrations |
| `npm run db:seed` | Executa o seed de demonstração |
| `npx prisma migrate dev` | Cria migrations durante o desenvolvimento |
| `npx prisma studio` | Abre o Prisma Studio |

---

# Fluxo recomendado para a equipe

## Primeira instalação

```bash
git clone <URL_DO_REPOSITORIO_BACKEND>
cd mareln-backend
cp .env.example .env
```

Configure o `.env`.

Inicie o backend:

```bash
docker compose up -d --build
```

Confira:

```bash
docker compose ps -a
```

Prepare os dados de demonstração:

```bash
docker compose run --rm migrate npm run db:seed
```

Na pasta do frontend, configure `.env.local` e execute:

```bash
npm install
npm run dev
```

Acesse:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:3001
```

## Atualização do projeto

Depois de obter as alterações do GitHub:

```bash
git pull origin main
```

Reconstrua e inicie:

```bash
docker compose up -d --build
```

As migrations pendentes são aplicadas automaticamente.

Execute o seed somente quando precisar preparar ou restaurar a base de demonstração.

---

**MaréLN Backend**

API da plataforma de eventos do Litoral Norte de São Paulo.