# Dossiês de Demandas — AriseFit

Este diretório armazena todos os **Dossiês Vivos de Demandas** do AriseFit.

## O Que é um Dossiê da Demanda?

O Dossiê (`docs/dossies/<feature>/dossie.md`) é o **único canal oficial de comunicação, sincronização e persistência de estado** entre os 5 agentes especialistas na esteira do Antigravity:
1. 🏛️ **Principal Engineer** (`principal-engineer`)
2. 💰 **FinOps & Frugal DBA** (`finops-frugal-dba`)
3. 💻 **Developer** (`developer`)
4. 🔍 **Reviewer Gatekeeper** (`reviewer-gatekeeper`)
5. 🛡️ **QA Engineer** (`qa-engineer`)

## Regras de Convivência no Dossiê
- **Leitura Universal**: Todo agente lê o dossiê completo para compreender o contexto, invariantes e decisões.
- **Escrita Estritamente Segregada**: Cada agente escreve **exclusivamente na sua própria seção** (Seções 1 a 5) e atualiza **apenas a sua linha no Ledger de Etapas**.
- **Histórico Verbatim**: A demanda original nunca é parafraseada ou atenuada.
- **Rastreabilidade**: Ciclos de reprovação/correção são gravados na tabela `Log de Ciclos de Correção (Self-Healing)`.

## Como Iniciar uma Nova Demanda
1. Crie uma pasta para a feature: `docs/dossies/<slug-da-feature>/`.
2. Copie o template oficial `docs/dossies/_TEMPLATE/dossie.md` para `docs/dossies/<slug-da-feature>/dossie.md`.
3. Preencha a demanda original no cabeçalho e invoque o **Principal Engineer**.
