# ListOrders — Desafio Técnico Full Stack Pleno

Este projeto é um sistema simplificado de gestão e faturamento de **Pedidos**, desenvolvido como desafio técnico.

---

## 🚀 Como Rodar

O projeto foi configurado com um script de automação único para facilitar a inicialização. **Tudo roda a partir de um único comando.**

### Requisitos
* **Docker / Docker Desktop** (utilizado apenas para subir o PostgreSQL 17)
* **PowerShell** (nativo no Windows ou instalado via `pwsh`)
* **Node.js** (versão 18+) e **.NET SDK** (versão 8+) instalados localmente.

### Inicialização
1. Abra um terminal do PowerShell como Administrador na raiz do projeto.
2. Execute o script de inicialização:
   ```powershell
   ./scripts/start.ps1
   ```

*O que o script faz automaticamente:*
* **Encerra** qualquer container Docker do projeto anterior, processos órfãos do `.NET` (`dotnet run`) e processos do `node` (`npm run dev`) em execução para liberar as portas.
* **Sobe** o PostgreSQL 17 via `docker-compose.yml` (sem necessidade de instalar o banco localmente).
* **Aguardará** até que o banco de dados esteja totalmente ativo (`pg_isready`).
* **Sobe** a API .NET (porta 5000), executando automaticamente o *migrations* e o *seeder* que alimenta o banco com **15.000 pedidos realistas** (cerca de 45.000 itens) para validação de performance de forma imediata.
* **Instala** as dependências do React e inicia o servidor do Vite (porta 5173).

---

## 🛠️ Arquitetura e Decisões de Engenharia

O projeto foi construído sob um **MVC Pragmático Modernizado**, inspirado no padrão simplificado do WMS Nestlé, priorizando a legibilidade, facilidade de explicação em apresentações e produtividade para IAs.

### 1. Backend (.NET 8/10)
* **Fluxo**: `Controller -> Service -> DbContext (EF Core)`.
* **Services**: Toda a regra de negócio se concentra no `OrderService`.
* **Sem Repository Pattern**: O EF Core já implementa o Unit of Work (`DbContext`) e Repositório (`DbSet`). Camadas extras seriam *boilerplate* sem ganho prático.
* **Sem Interfaces Desnecessárias**: Não criamos interfaces para classes com apenas uma implementação concreta (ex: `OrderService`).
* **DTOs Localizados**: Os DTOs de requisição e resposta moram na mesma pasta e arquivo dos controllers correspondentes (`Controllers/Orders/OrderDtos.cs`). Isso reduz cliques no editor e mantém o contexto unificado.
* **EF Core vs Dapper**:
  * **EF Core**: Usado na criação do pedido (segurança e tracking) e na listagem paginada.
  * **Dapper**: Usado na agregação de faturamento por dia (`/api/orders/revenue`). Escrever a consulta nativa com `GROUP BY` e `SUM` em SQL puro é mais performático e legível do que em LINQ.

### 2. Frontend (React + TypeScript)
* **Estrutura baseada em Views**: Organizado na pasta `views/` por tela (ex: `views/orders/`).
* **Layout Flat**: Para evitar fragmentação excessiva de subpastas (como `components/`, `types/` e `hooks/` aninhados), as views mantêm os arquivos em um único nível plano. Isso otimiza o contexto para ferramentas de IA e humanos.
* **Design Premium**: Interface escura e moderna com cartões em *glassmorphism*, painéis responsivos e gráfico de faturamento renderizado nativamente via CSS puro de alta performance.

### 3. Microsserviço Node.js
* Localizado em `services/order-processor/`, separado do fluxo principal do frontend e da API.
* Recebe uma notificação assíncrona da API .NET quando um pedido é criado e executa o processamento em background (202 Accepted).

---

## 📂 Estrutura do Projeto

```
ListOrders/
├── docker-compose.yml               # PostgreSQL container
├── scripts/
│   └── start.ps1                    # Script único de inicialização
├── src/
│   ├── Api/                         # Backend ASP.NET Core
│   │   ├── Entities/                # Entidades de domínio puras
│   │   ├── Data/                    # EF Core DbContext, Mappings e Seed
│   │   ├── Services/                # Regra de negócio (EF Core + Dapper)
│   │   └── Controllers/             # API Controllers + DTOs internos
│   └── Web/                         # Frontend React + Vite
│       ├── src/
│       │   ├── shared/              # Utilitários globais
│       │   └── views/               # Telas organizadas por feature
└── services/
    └── order-processor/             # Microsserviço Node.js
```
