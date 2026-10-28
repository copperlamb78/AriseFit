---
name: enterprise-security-cryptography-specialist
description: Especialista em segurança de nível corporativo (Enterprise AppSec), criptografia autenticada moderna (AEAD AES-256-GCM), proteção Zero-Trust Fail-Closed, revogação de sessões e sanitização estrita de erros HTTP no AriseFit.
---

# Enterprise Security & Cryptography Specialist — AriseFit

Esta skill define as práticas criptográficas e de segurança corporativa adotadas no ecossistema AriseFit para assegurar proteção máxima de dados de pagamento, senhas e chaves de API.

---

## 🔐 Pilares Criptográficos e de Segurança

### 1. Princípio Zero-Trust e Caminho Crítico Fail-Closed
- **Conceito**: Nenhum componente, serviço ou usuário é confiável por padrão, mesmo dentro da rede interna.
- **Implementação Fail-Closed**:
  - Em qualquer falha de validação, erro inesperado de banco ou divergência de estado, o sistema deve assumir a negação de acesso (HTTP 401 Unauthorized / HTTP 403 Forbidden).
  - Nunca retornar dados parciais ou liberar fluxo com fallback inseguro.

### 2. Criptografia Autenticada em Repouso (AEAD `AES-256-GCM`)
- **Algoritmo**: Utilizar exclusivamente `AES-256-GCM` com IV de 96 bits aleatório gerado a cada cifra.
- **AAD (Additional Authenticated Data)**:
  - Incluir obrigatoriamente metadados contextuais (ex: `tenantId` ou `userId`) como dados associados autenticados.
  - Isso garante que um ciphertext não possa ser transplantado para outro registro ou tenant sem que a integridade seja violada.
- **Formato Canônico do Envelope**:
  `iv.tag.ciphertext` codificado em base64url ou hex.

### 3. Revogação Instantânea de Sessões & Tokens
- **Mecanismo**:
  - Tokens JWT de curta duração (ex: 15 minutos) combinados com Refresh Tokens rotativos persistidos no banco de dados com hash seguro (`bcrypt`).
  - Ao realizar logout ou detecção de atividade suspeita, o `refreshToken` do usuário é invalidado no banco (`refreshToken: null`) e o campo `disabledAt` / `mustChangePassword` revoga imediatamente o acesso.

### 4. Hardening de Headers e Cookies HTTP
- **Configuração de Helmet no NestJS**:
  ```typescript
  app.use(helmet({
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true,
    referrerPolicy: { policy: 'no-referrer' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  }));
  ```
- **Cookies**: Sempre marcados com `HttpOnly: true`, `Secure: true`, `SameSite: 'strict'`.

### 5. Sanitização Estrita de Respostas de Erro (RFC 7807 / RFC 9457 Problem Details)
- **Proibição Absoluta de Information Leakage**:
  - Nenhuma resposta de erro da API pode vazar stack traces, queries SQL do Prisma, nomes de tabelas, versões de bibliotecas ou detalhes de infraestrutura em ambiente de produção.
  - Implementar um `AllExceptionsFilter` global no NestJS que intercepte exceções não tratadas e retorne uma estrutura uniforme e segura:
    ```json
    {
      "type": "https://api.arisefit.com/errors/internal-server-error",
      "title": "Erro Interno do Servidor",
      "status": 500,
      "detail": "Ocorreu uma falha inesperada ao processar sua solicitação. O incidente foi registrado.",
      "instance": "/api/v1/checkout/pix",
      "timestamp": "2026-10-18T15:30:00Z"
    }
    ```
