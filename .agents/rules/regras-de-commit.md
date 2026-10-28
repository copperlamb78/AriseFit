# Regras Mandatórias de Commit no AriseFit (Conventional Commits & 1 Commit Por Arquivo)

Todo commit nos repositórios do ecossistema AriseFit (`api-arisefit/` e `frontend-arisefit/`) deve obedecer rigorosamente a este padrão.

---

## 1. Política Mandatória: 1 Commit Semântico Por Arquivo

Para garantir rastreabilidade atômica, reversões cirúrgicas e code review cristalino:
- **NUNCA realize commits agrupados (`git add .` ou múltiplos arquivos em um único commit).**
- O commit deve ser executado **individualmente arquivo por arquivo**:
  ```bash
  git add caminho/do/arquivo.ts
  git commit -m "<tipo>(<escopo>): <descrição no imperativo e em português>"
  ```
- Cada repositório possui seu próprio controle de versão Git. Não misture repositórios no mesmo comando.

---

## 2. Formato do Commit (Conventional Commits em Português)

```text
<tipo>(<escopo>): <descrição no imperativo e em português>
```

- Sem ponto final no título da mensagem.
- Verbo no imperativo/presente (ex.: `adiciona`, `corrige`, `atualiza`, `remove`, `otimiza`).

---

## 3. Tipos Válidos

| Tipo | Finalidade | Exemplo de Escopo |
| :--- | :--- | :--- |
| **`feat`** | Nova funcionalidade para o usuário ou cliente | `feat(checkout): adiciona calculo transparente do sinal pix` |
| **`fix`** | Correção de bug ou falha funcional | `fix(agendamento): resolve corrida de concorrencia no slot` |
| **`sec`** | Correção ou melhoria de segurança (Zero-Trust, IDOR) | `sec(barbearia): valida propriedade do recurso via claims jwt` |
| **`perf`** | Melhoria de desempenho ou otimização FinOps | `perf(vitrine): adiciona projecao seletiva prisma sem n+1` |
| **`docs`** | Documentação, especificações de arquitetura (`docs/`) | `docs(specs): define contrato e dor da funcionalidade de split` |
| **`refactor`** | Refatoração interna sem alteração de comportamento | `refactor(design-system): padroniza modal com header e footer fixos` |
| **`test`** | Adição ou aprimoramento de testes (Jest / Playwright) | `test(e2e): adiciona jornada completa do cliente no storefront` |
| **`chore`** | Manutenção, dependências ou scripts de infraestrutura | `chore(prisma): regenera tipagem do client v7` |

---

## 4. Regra de Ouro Pré-Commit

**Nenhum commit pode ser executado com o build quebrado ou testes falhando.**
- No backend: `npm run build` e suíte Jest devem estar 100% verdes.
- No frontend: `npm run build` e testes Playwright devem estar 100% verdes.
