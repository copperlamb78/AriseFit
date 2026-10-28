---
name: security-idor-prevention
description: Guia de segurança ofensiva e defensiva contra Insecure Direct Object References (IDOR), Broken Object Level Authorization (BOLA), Broken Function Level Authorization (BFLA) e Mass Assignment no AriseFit.
---

# Prevenção Robusta de IDOR / BOLA / BFLA — AriseFit

Esta skill fornece diretrizes prescritivas para evitar falhas de controle de acesso exploráveis via proxies de interceptação (como Burp Suite / OWASP ZAP) em rotas do NestJS.

---

## 🎯 Os 5 Vetores Críticos de Autorização

### Vetor 1: BOLA Horizontal Intra-Tenant (Usuário A acessando dados de Usuário B no mesmo Tenant)
- **Cenário**: Cliente A acessa `/appointments/apt-123`. Se o código fizer apenas `prisma.appointment.findUnique({ where: { id } })` sem validar se o agendamento pertence a `req.user.id`, o Cliente B pode visualizar agendamentos alheios trocando o UUID.
- **Padrão de Correção**:
  ```typescript
  // Incorreto
  const apt = await this.prisma.appointment.findUnique({ where: { id } });
  
  // Correto (Verificação de Posse)
  const apt = await this.prisma.appointment.findFirst({
    where: {
      id,
      userId: user.id, // ou companyId: user.companyId
    },
  });
  if (!apt) throw new NotFoundException('Agendamento não encontrado.');
  ```

### Vetor 2: BOLA Cross-Tenant (Proibição Absoluta de IDs de Tenant no Body)
- **Cenário**: O endpoint de criação ou atualização recebe `{ "companyId": "vitima-id", "serviceId": "..." }` no body JSON da requisição. O invasor adultera o valor no payload.
- **Padrão de Correção**:
  - **NUNCA** aceitar `companyId` ou `userId` no payload de requisições autenticadas.
  - Extrair a identidade e o vínculo empresarial estritamente dos claims JWT (`req.user.id`, `req.user.companyId`).
  - Remover esses campos dos DTOs de entrada ou marcá-los com decoradores que impeçam preenchimento pelo cliente.

### Vetor 3: BFLA Vertical Entre Roles (Escalada de Privilégio)
- **Cenário**: Um usuário autenticado como `CLIENT` envia requisição para rotas administrativas (`/api/v1/admin/financial-summary`).
- **Padrão de Correção**:
  - Utilizar Guards de autorização baseados em roles combinados (`@UseGuards(JwtAuthGuard, RolesGuard)`) e decorar explicitamente o controller e método com `@Roles(Role.ADMIN, Role.SUPER_ADMIN)`.
  - Princípio *Fail-Closed*: Se o controller não tiver decorador de papel e for uma rota protegida, assumir negação por padrão.

### Vetor 4: Mass Assignment / Over-Posting em DTOs
- **Cenário**: Ao atualizar o perfil (`PATCH /users/profile`), o atacante adiciona `"role": "SUPER_ADMIN"` ou `"asaasCustomerId": "novo-id"` no JSON. Se o controller passar o body diretamente para o Prisma (`prisma.user.update({ data: dto })`), o atacante ganha privilégios de super admin.
- **Padrão de Correção**:
  - Configuração global estrita do `ValidationPipe`:
    ```typescript
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Remove propriedades não declaradas no DTO
        forbidNonWhitelisted: true, // Rejeita a requisição se houver propriedade extra
        transform: true,
      }),
    );
    ```
  - DTOs específicos e estritos para cada operação (`UpdateProfileDto` NUNCA deve conter o campo `role`).

### Vetor 5: Validação Item a Item em Operações em Lote
- **Cenário**: Cancelamento ou reagendamento de múltiplos horários (`POST /appointments/batch-cancel`) com array de IDs `["id-meu-1", "id-vitima-2"]`. Se o backend apenas fizer `where: { id: { in: ids } }`, afetará registros da vítima.
- **Padrão de Correção**:
  - Sempre ancorar a cláusula `where` ao `userId` ou `companyId` do token:
    ```typescript
    await this.prisma.appointment.updateMany({
      where: {
        id: { in: ids },
        companyId: user.companyId, // Garante que nenhum registro fora do tenant seja tocado
      },
      data: { status: AppointmentStatus.CANCELLED },
    });
    ```

---

## 🔍 Checklist de Auditoria para o Reviewer Gatekeeper
- [ ] O endpoint confia em algum ID de usuário ou empresa vindo do body ou query?
- [ ] O DTO possui campos sensíveis como `role`, `balance`, `isAdmin` ou chaves financeiras?
- [ ] O `whitelist: true` e `forbidNonWhitelisted: true` estão ativos no pipe de validação?
- [ ] A consulta de banco valida explicitamente a propriedade do registro antes de retornar ou modificar?
