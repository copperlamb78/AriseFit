# AriseFit — Checklist Vivo de Testes End-to-End (Playwright)

Este documento registra o status de cobertura dos testes ponta a ponta na jornada do usuário no frontend do AriseFit (`frontend-arisefit/`).

---

## 💈 Jornada da Vitrine Pública do Cliente (`/b/:slug`)
- [ ] Carregamento da vitrine da barbearia com Hero, logo e catálogo de serviços
- [ ] Visualização de empty state caso a barbearia não possua serviços ativos
- [ ] Seleção de serviço e abertura do drawer/modal de agendamento
- [ ] Padrão canônico do modal de agendamento: cabeçalho e rodapé fixos com corpo rolável
- [ ] Seleção de profissional/barbeiro
- [ ] Seleção de data e slot de horário disponível no carrossel/grid
- [ ] Exibição transparente do valor do serviço, taxa da plataforma e cálculo do sinal Pix (N1-N7)
- [ ] Preenchimento de dados do cliente (Nome, WhatsApp, CPF) com validações
- [ ] Geração do Pix com QR Code, código copia-e-cola e contagem regressiva de 15 minutos (Hold)
- [ ] Teste em viewport mobile (360px e 390px) com touch targets >= 44x44px

---

## 🔐 Jornada de Autenticação & Barbearia
- [ ] Login de proprietário e barbeiro com validação Zod
- [ ] Proteção contra rotas não autorizadas e redirecionamento
- [ ] Gestão de agendamentos e visualização de status (`CONFIRMED`, `COMPLETED`, `CANCELED`)

---

## ⚡ Testes de Resiliência & Caminhos Infelizes
- [ ] Tentativa de reserva concorrente no mesmo slot de horário (Double-Booking Prevention)
- [ ] Expiração de hold de 15 minutos do Pix liberando a vaga
- [ ] Queda de rede simulada com exibição de feedback humanizado e opção de retry
