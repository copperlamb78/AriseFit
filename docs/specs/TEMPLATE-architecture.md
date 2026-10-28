# Template de Especificação Arquitetural & DoR Técnico

> **Autor:** 🏛️ Principal Engineer (Tech Lead & PM)  
> **Feature:** [Nome da Funcionalidade]  
> **Data:** YYYY-MM-DD  
> **Status:** `READY_FOR_FINOPS`

---

## 1. Visão Geral & Objetivo de Negócio
- **Descrição da Demanda:**
- **Público-Alvo:** (Clientes da vitrine / Donos de Barbearia / Barbeiros)
- **Camadas Impactadas:** `api-arisefit/` | `frontend-arisefit/`

---

## 2. Verificação Prévia na API (`api-arisefit/`)
- [ ] Inspecionado controllers, DTOs e Prisma schema em `src/modules/`
- **Endpoints Existentes Utilizados:**
- **Novos Endpoints Necessários (se aplicável):**

---

## 3. Contratos de API & DTOs
### Rota: `VERBO /api/v1/...`
- **Request Body (JSON):**
```json
{
}
```
- **Response 200/201 (JSON):**
```json
{
}
```
- **Possíveis Respostas de Erro:** `400`, `401`, `403`, `404`, `409`

---

## 4. Modelagem de Dados & Impacto no Prisma
- **Alterações de Entidade / Campos:**
- **Compatibilidade Retroativa:** (Expand & Contract)

---

## 5. Critérios de Aceite Gherkin
```gherkin
Cenário: [Caminho Feliz]
  Dado que ...
  Quando ...
  Então ...

Cenário: [Caminho Infeliz / Concorrência / Erro de Validação]
  Dado que ...
  Quando ...
  Então ...
```

---

## 6. Governança Zero-Trust & Riscos
- **Anti-IDOR:** Identidade extraída via claims do token JWT.
- **Fail-Closed:** Comportamento seguro em falha de conexão.
