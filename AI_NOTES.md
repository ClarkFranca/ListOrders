# AI_NOTES.md — Relato de Uso de Inteligência Artificial

Este documento descreve como as ferramentas de Inteligência Artificial foram utilizadas no desenvolvimento do projeto **ListOrders**, as decisões tomadas para aumentar a produtividade e como a arquitetura do projeto foi pensada para otimizar o fluxo de trabalho com IAs.

---

## 1. Onde a IA Ajudou

A IA foi uma parceira ativa de pair programming, atuando em:
* **Definição da Arquitetura Pragmática**: Auxiliou no mapeamento do projeto de referência (WMS Nestlé) para encontrar oportunidades de simplificação arquitetural (corte de mappings XML, remoção de interfaces desnecessárias, agregação de DTOs nas pastas dos Controllers).
* **Geração de Código de Infraestrutura**: Escrita rápida do `docker-compose.yml` e do script de automação robusto em PowerShell (`scripts/start.ps1`) para gerenciar ciclos de vida de containers, checagem de portas e reinicialização de processos.
* **Mapeamento de Entidades e DTOs**: Criação limpa de estruturas de dados e geração do algoritmo de Seed de dados em lotes (gerando 15.000 pedidos realistas rapidamente em EF Core).
* **Componentização de UI**: Criação rápida de componentes de interface em React com estilos CSS nativos e responsivos.

---

## 2. Onde a IA Errou e Correções Feitas

* **MediatR / CQRS por Padrão**: Inicialmente, a IA sugeriu aplicar padrões como CQRS e MediatR como "boas práticas". Isso foi corrigido de imediato, alinhando com a premissa de manter o projeto com a menor quantidade de arquivos possível e evitar abstrações de indireção para um projeto de apenas 3 endpoints.
* **Imports no Frontend**: A IA tentou usar barrel exports (`index.ts`) para exportar componentes das views. Isso foi removido para facilitar a leitura humana e evitar que IAs leiam importações redundantes.
* **Processamento Bloqueante**: A IA inicialmente propôs fazer uma chamada HTTP síncrona do .NET para o Node.js. Corrigimos para um disparo em background com `_ = NotifyOrderCreatedAsync(order.Id)` e resposta 202 Accepted no Node.js para garantir acoplamento fraco e resiliência caso o microsserviço esteja desligado.

---

## 3. O que Foi Escrito à Mão e Por Quê

* **Divisão de EF Core vs Dapper**: A decisão conceitual de onde usar cada um. O endpoint de Faturamento (`revenue`) foi otimizado manualmente com Dapper em SQL nativo para maximizar performance e legibilidade, enquanto a criação de pedidos foi mantida no EF Core para segurança transacional.
* **Estilização Visual (global.css)**: Ajustes manuais de cores (Slate e Violet) e estrutura de layout (Backdrop blur / Glassmorphic cards) para garantir que a interface pareça profissional e premium.
* **Controle de Processos no Script de Start**: Escrita personalizada da lógica de encerramento automático dos processos `dotnet` e `node` que estejam rodando em background para evitar conflito de portas na máquina de teste do avaliador.

---

## 4. Estruturação do Projeto para IA (AI-Friendly Design)

Para que uma ferramenta de IA trabalhe com o máximo de produtividade em um repositório, o design do projeto seguiu as seguintes premissas:
1. **Localização de Contexto (DTOs inline)**: Todos os DTOs foram mantidos na mesma pasta ou arquivo do Controller (`OrderDtos.cs`). Dessa forma, a IA não precisa pular por pastas globais de contratos para entender as assinaturas da API.
2. **Views Flat**: No React, a pasta `views/orders/` contém arquivos planos (sem subpastas de types, hooks ou components). Isso permite que a IA leia e edite o contexto da funcionalidade com muito menos saltos no sistema de arquivos.
3. **Padrão de Nomenclatura Estrito**: Nomes como `orders/types.ts` e `orders/useOrders.ts` facilitam o mapeamento mental da IA sobre a função exata de cada arquivo.
4. **Ausência de Abstrações de Interface Unica**: Não há interfaces para serviços com apenas uma implementação concreta, diminuindo a quantidade de arquivos que a IA precisa indexar.
