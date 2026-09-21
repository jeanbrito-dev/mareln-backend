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

## Stack

| Tecnologia | Uso |
| --- | --- |
| [NestJS](https://nestjs.com/) | Framework principal da API |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Prisma](https://www.prisma.io/) | ORM, schema e migrations |
| [MySQL](https://www.mysql.com/) | Banco de dados relacional |
| [JWT](https://jwt.io/) | Autenticação stateless |
| [class-validator](https://github.com/typestack/class-validator) | Validação de DTOs |

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
Controller  -->  validação (DTO + class-validator)  -->  Guard (JWT)
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

## Começando

### Pré-requisitos

- Node.js 18 ou superior
- npm
- MySQL em execução

### Instalação

Clone o projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd mareln-backend
```

Instale as dependências:

```bash
npm install
```

Configure o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/mareln"
JWT_SECRET="your-secret-key"
```

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | String de conexão com o MySQL |
| `JWT_SECRET` | Chave usada para assinar os tokens JWT |

> **Atenção:** nunca versione o arquivo `.env`. Em produção, utilize um `JWT_SECRET` longo, aleatório e exclusivo.

Execute as migrations:

```bash
npx prisma migrate dev
```

Inicie o servidor:

```bash
npm run start:dev
```

A API estará disponível em:

```text
http://localhost:3000
```

## Scripts

Scripts padrão de um projeto NestJS. Consulte o `package.json` para a lista completa.

| Comando | Descrição |
| --- | --- |
| `npm run start:dev` | Inicia a API em modo desenvolvimento com hot reload |
| `npm run build` | Gera a build de produção |
| `npm run start:prod` | Executa a build de produção |
| `npx prisma migrate dev` | Cria e aplica migrations em desenvolvimento |
| `npx prisma studio` | Abre uma interface visual para o banco de dados |
| `npx prisma generate` | Regenera o Prisma Client |

## Desenvolvimento

O backend está sendo desenvolvido de forma incremental como parte da primeira versão do MaréLN. Novos módulos, regras de negócio e recursos serão adicionados conforme a evolução da plataforma.

---

**MaréLN Backend**
API da plataforma de eventos do Litoral Norte de São Paulo.