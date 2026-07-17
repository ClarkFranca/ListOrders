# AI_NOTES.md — Relato de Uso de Inteligência Artificial

Este documento descreve como ferramentas de Inteligência Artificial foram utilizadas durante o desenvolvimento do projeto **ListOrders**, quais decisões permaneceram sob responsabilidade do desenvolvedor e de que forma a IA foi utilizada como aceleradora de produtividade, seguindo um modelo de *pair programming*.

---

# Objetivo do Uso da IA

A IA foi utilizada como uma ferramenta de apoio ao desenvolvimento, auxiliando na geração de código repetitivo, validação de ideias e automatização de tarefas de infraestrutura.

Todas as decisões arquiteturais, organização do projeto, definição das tecnologias utilizadas e validação das implementações permaneceram sob responsabilidade do desenvolvedor.

Todo código sugerido pela IA foi revisado, adaptado quando necessário e integrado manualmente ao projeto.

---

# 1. Onde a IA Contribuiu

A IA foi utilizada principalmente para acelerar tarefas mecânicas e reduzir tempo de implementação.

### Infraestrutura

Auxiliou na geração inicial dos arquivos de infraestrutura, incluindo:

- `docker-compose.yml`
- Scripts PowerShell e Batch para inicialização do ambiente
- Verificações de pré-requisitos
- Inicialização automatizada dos serviços
- Rotinas de encerramento de processos utilizando portas conhecidas

Esses arquivos posteriormente foram ajustados manualmente para atender ao fluxo esperado do projeto.

---

### Estruturas de Dados

A IA auxiliou na geração inicial de:

- Entidades
- DTOs
- Seed de dados
- Objetos auxiliares

O código gerado serviu como ponto de partida e foi refinado durante o desenvolvimento.

---

### Interface React

Foi utilizada para acelerar a criação inicial de componentes React, estrutura HTML e CSS base.

Após a geração inicial foram realizados diversos ajustes manuais na organização visual, estilos, layout e experiência de uso.

---

### Apoio Durante Desenvolvimento

Durante o desenvolvimento a IA também foi utilizada para:

- esclarecer dúvidas pontuais;
- sugerir alternativas de implementação;
- revisar trechos de código;
- identificar possíveis melhorias;
- auxiliar na documentação do projeto.

---

# 2. Decisões Arquiteturais Tomadas pelo Desenvolvedor

A arquitetura do projeto foi definida manualmente, buscando simplicidade, legibilidade e facilidade de manutenção.

Entre as principais decisões estão:

## Organização das Pastas

A estrutura do projeto foi planejada para facilitar tanto a leitura humana quanto o entendimento por ferramentas de IA.

Foi adotada uma estrutura simples baseada em:

- Controllers
- Services
- Entities
- DbContext
- DTOs
- Frontend organizado por funcionalidades

Evitaram-se camadas desnecessárias para reduzir complexidade.

---

## Arquitetura Pragmática

Foi escolhida uma arquitetura baseada em:

Controller

↓

Service

↓

DbContext

Ao invés de utilizar padrões mais complexos como:

- CQRS
- MediatR
- Clean Architecture completa
- DDD

A decisão foi tomada considerando o tamanho do domínio do projeto, que possui apenas alguns endpoints e não justificava múltiplas camadas adicionais.

O objetivo foi manter alta coesão, baixo acoplamento e facilidade de manutenção.

---

## Escolha entre EF Core e Dapper

A definição de quando utilizar cada tecnologia foi realizada manualmente.

Foi adotado:

- EF Core para operações de escrita, criação e atualização de pedidos.
- Dapper para consultas analíticas de faturamento onde SQL nativo oferece maior desempenho.

Essa divisão buscou equilibrar produtividade e performance.

---

## Comunicação entre Microsserviços

A estratégia de comunicação assíncrona entre a API .NET e o serviço Node.js foi definida manualmente.

O fluxo implementado foi:

API .NET

↓

Node.js

↓

API .NET

permitindo que o processamento ocorra em background sem bloquear a resposta ao usuário.

---

## Organização do Frontend

A estrutura do React foi definida manualmente priorizando simplicidade.

Foram evitadas estruturas excessivamente fragmentadas contendo diversas camadas de:

- hooks
- services
- adapters
- providers
- barrels

para facilitar manutenção e reduzir navegação entre arquivos.

---

# 3. Sugestões da IA que Foram Rejeitadas ou Adaptadas

Durante o desenvolvimento nem todas as sugestões foram aceitas.

## Uso de CQRS e MediatR

Inicialmente foram sugeridos padrões como CQRS e MediatR.

Após análise foi decidido não utilizá-los por aumentarem significativamente a quantidade de arquivos e abstrações para um domínio pequeno.

---

## Barrel Exports

Foi sugerida a utilização de arquivos `index.ts` para exportação dos componentes.

A estratégia foi descartada para manter os imports explícitos e facilitar navegação no projeto.

---

## Comunicação Síncrona

Inicialmente a IA sugeriu uma chamada HTTP síncrona entre os serviços.

A implementação foi alterada para comunicação assíncrona utilizando disparo em background e resposta HTTP 202 Accepted, reduzindo acoplamento entre os serviços.

---

# 4. Estrutura Pensada para Colaboração com IA

Além da organização voltada para desenvolvedores, o projeto também foi estruturado para facilitar futuras interações com ferramentas de IA.

As principais decisões foram:

- Estrutura de pastas simples e previsível.
- Nomenclatura consistente de arquivos.
- Pouca profundidade de diretórios.
- DTOs próximos dos Controllers.
- Separação clara entre frontend e backend.
- Ausência de abstrações desnecessárias.
- Serviços contendo a maior parte das regras de negócio.

Essa organização reduz o contexto necessário para compreensão do projeto tanto por desenvolvedores quanto por ferramentas de IA.

---

# 5. Considerações Finais

A Inteligência Artificial foi utilizada como uma ferramenta de apoio durante o desenvolvimento, principalmente para acelerar tarefas repetitivas e gerar estruturas iniciais.

As decisões relacionadas à arquitetura, organização do código, definição das tecnologias utilizadas, separação de responsabilidades, fluxo de processamento e revisão das implementações permaneceram sob responsabilidade do desenvolvedor.

Todo código produzido com auxílio da IA passou por análise, adaptação e validação antes de ser incorporado ao projeto.