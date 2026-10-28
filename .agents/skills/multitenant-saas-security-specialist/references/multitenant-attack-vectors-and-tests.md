# Catálogo de Vetores de Ataque Multi-Tenant (MT-01 a MT-07) e Receitas de Testes

Este documento detalha os 7 principais vetores de vulnerabilidade multi-tenant e como escrever testes automatizados (Jest e Playwright) para garantir que o AriseFit permaneça imune a vazamentos.

---

## 🛡️ Matriz de Vetores e Especificações de Teste

### MT-01: Cross-Tenant Token Replay (Reutilização de JWT em Outro Tenant)
- **Vetor**: Atacante autenticado na Empresa A pega seu token JWT e tenta consultar `/companies/empresa-b/appointments` ou enviar `companyId` da Empresa B.
- **Teste Automatizado Recomendado (Supertest / Jest)**:
  ```typescript
  it('MT-01: deve bloquear com 403 Forbidden acesso a recursos de outro tenant usando token válido da Empresa A', async () => {
    const tokenEmpresaA = await generateValidToken({ userId: 'user-a', companyId: 'empresa-a-id' });
    const response = await request(app.getHttpServer())
      .get('/api/v1/companies/empresa-b-id/appointments')
      .set('Authorization', `Bearer ${tokenEmpresaA}`);
    expect(response.status).toBe(403);
  });
  ```

### MT-02: Tenant Spoofing via Headers HTTP (Host / X-Forwarded-Host)
- **Vetor**: Atacante manipula o header `Host: empresa-vitima.arisefit.com` ou `X-Forwarded-Host` para forçar o backend a carregar dados do tenant da vítima.
- **Teste Automatizado Recomendado**:
  ```typescript
  it('MT-02: deve ignorar headers X-Forwarded-Host não confiáveis e resolver tenant estritamente por domínio canônico', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/public/services')
      .set('X-Forwarded-Host', 'malicious-host.com')
      .set('Host', 'localhost');
    expect(response.status).not.toBe(500);
  });
  ```

### MT-03: Broken Function Level Authorization (BFLA em Nível de Empresa)
- **Vetor**: Usuário com perfil `CLIENT` ou `EMPLOYEE` chama endpoint de configuração bancária `/companies/:id/financial-profile` ou alteração de taxa de sinal.
- **Teste Automatizado Recomendado**:
  ```typescript
  it('MT-03: deve proibir acesso a configurações financeiras para papéis sem privilégio COMPANY_OWNER', async () => {
    const tokenEmployee = await generateValidToken({ userId: 'emp-1', companyId: 'empresa-a-id', role: Role.EMPLOYEE });
    const response = await request(app.getHttpServer())
      .patch('/api/v1/companies/empresa-a-id/financial-settings')
      .set('Authorization', `Bearer ${tokenEmployee}`)
      .send({ downPaymentPercent: 30 });
    expect(response.status).toBe(403);
  });
  ```

### MT-04: Context Bleeding em Tarefas Agendadas e Cache
- **Vetor**: O `@Cron` que cancela agendamentos expirados ou o cache em memória aplica regras de um tenant aos agendamentos de outro tenant.
- **Teste Automatizado Recomendado**:
  ```typescript
  it('MT-04: cancelamento de agendamentos pendentes deve isolar tenant e processar estritamente cada companyId', async () => {
    // Insere agendamento expirado no tenant A e tenant B
    await appointmentsService.expirePendingAppointments();
    const aptA = await prisma.appointment.findUnique({ where: { id: 'apt-a' } });
    const aptB = await prisma.appointment.findUnique({ where: { id: 'apt-b' } });
    expect(aptA.companyId).toBe('empresa-a-id');
    expect(aptB.companyId).toBe('empresa-b-id');
  });
  ```

### MT-05: Cross-Tenant Ciphertext Splicing (Transplante de Dados Cifrados)
- **Vetor**: Invasor copia credencial cifrada da Empresa A no banco e a cola no registro da Empresa B.
- **Teste Automatizado Recomendado**:
  ```typescript
  it('MT-05: decriptação de dado sensível da Empresa A no contexto da Empresa B deve falhar devido ao AAD (companyId)', () => {
    const encryptedData = cryptoService.encrypt('asaas-api-key-segredo', 'empresa-a-id');
    expect(() => {
      cryptoService.decrypt(encryptedData, 'empresa-b-id');
    }).toThrow(); // Falha de autenticação GCM
  });
  ```

### MT-06: Noisy Neighbor (Exaustão de Recursos por um Único Tenant)
- **Vetor**: Tenant A dispara 500 requisições simultâneas e tenta derrubar a aplicação para todos os demais tenants.
- **Teste Automatizado Recomendado**:
  ```typescript
  it('MT-06: rate limit particionado por tenant deve bloquear apenas o tenant abusivo sem afetar os demais', async () => {
    const tokenA = await generateValidToken({ userId: 'user-a', companyId: 'tenant-a' });
    const tokenB = await generateValidToken({ userId: 'user-b', companyId: 'tenant-b' });
    
    // Dispara rajada no tenant A
    for (let i = 0; i < 30; i++) {
      await request(app.getHttpServer()).get('/api/v1/appointments').set('Authorization', `Bearer ${tokenA}`);
    }
    const resA = await request(app.getHttpServer()).get('/api/v1/appointments').set('Authorization', `Bearer ${tokenA}`);
    expect(resA.status).toBe(429); // Tenant A bloqueado

    // Tenant B continua operando normalmente
    const resB = await request(app.getHttpServer()).get('/api/v1/appointments').set('Authorization', `Bearer ${tokenB}`);
    expect(resB.status).toBe(200);
  });
  ```

### MT-07: Deprovisioning Seguro e Inativação Limpa
- **Vetor**: Empresa cancelada é desativada, mas seu histórico fica visível se outra empresa adotar o mesmo slug.
- **Teste Automatizado Recomendado**:
  ```typescript
  it('MT-07: inativação de empresa deve proteger slug histórico e impedir vazamento para nova empresa com mesmo nome', async () => {
    await companyService.deactivateCompany('empresa-antiga-id');
    const response = await request(app.getHttpServer()).get('/api/v1/companies/empresa-antiga-slug');
    expect(response.status).toBe(404);
  });
  ```
