# Diretrizes de Estilo, Design System & UX no AriseFit

Regras mandatórias para a interface de usuário do frontend SPA (`frontend-arisefit/`).

---

## 0. Precedência Mandatória: Backend como Única Fonte da Verdade (Zero UI sem Backend)

- **Proibição Absoluta de Adicionar Elementos na UI sem Backend:** É terminantemente proibido adicionar qualquer tela, seção, card, botão, campo de input, filtro, aba, badge ou modal na UI sem antes inspecionar o backend (`api-arisefit/`) e certificar-se de que a rota, DTO, model e regras de negócio existem de fato.
- Nunca crie layouts baseados em suposições ou dados fictícios. Se a interface demandar um dado novo, o fluxo de desenvolvimento deve começar obrigatoriamente pela API.
- Consulte a diretriz completa em [regras-verificacao-previa-api.md](file:///.agents/rules/regras-verificacao-previa-api.md).

---

## 1. Design System Oficial & Tailwind CSS 4

- **Componentes Oficiais do Design System (`src/design-system/ui/`)**:
  - É **proibido o uso de tags HTML cruas** (`<button>`, `<input>`, `<select>`, `<dialog>`) nas telas e features.
  - Toda interface deve consumir exclusivamente os componentes atômicos padronizados: `Button`, `Input`, `Badge`, `Card`, `Modal`, `Skeleton`, `Toast`.
- **Tokens de Cores do Tailwind 4**:
  - Utilizar rigorosamente as variáveis de tema definidas no Design System e `index.css`.
  - Evitar cores arbitrárias em linha (ex.: `bg-[#ff0000]`). Use os tokens semânticos de marca, acento, superfície, erro e sucesso.

---

## 2. Padrão Arquitetural Canônico de Modais (`.modal-card`)

Para garantir que formulários e confirmações nunca fiquem cortados ou com botões inacessíveis em dispositivos móveis:
- **Cabeçalho Fixo (`shrink-0`)**: Título claro e botão de fechar acessível.
- **Corpo Rolável (`flex-1 overflow-y-auto min-h-0`)**: O conteúdo do modal rola internamente com espaçamento adequado.
- **Rodapé Fixo (`shrink-0`)**: Botões de ação (*Cancelar*, *Confirmar*, *Concluir Agendamento*) permanecem **sempre visíveis e fixos na base**, independentemente do tamanho da tela ou da altura do teclado virtual.

---

## 3. Padrão Arquitetural Canônico de Botões (`Button.tsx`) & Touch Targets

O componente oficial `Button` (`src/design-system/ui/button.tsx`) é a **única fonte da verdade** para acionamentos na interface:
- **Layout Flex Direto (Proibição de Span Envolvente com SVG)**:
  - O container do `Button` é `inline-flex items-center justify-center gap-2`.
  - Os filhos (`children`) e ícones (`leftIcon`/`rightIcon`) devem ser renderizados diretamente como filhos flex, garantindo alinhamento horizontal perfeitamente centralizado no eixo cruzado (`items-center`).
  - NUNCA envolva todo o conteúdo de texto e ícones dentro de um `<span>` inline genérico quando houver SVGs, pois no Tailwind 4 o preflight atribui `display: block` a SVGs, o que empilha o ícone acima do texto.
- **Inviolabilidade de Linha Única (`whitespace-nowrap`)**:
  - Todo botão deve conter obrigatoriamente `whitespace-nowrap` no `baseStyles` para impedir que rótulos quebrem em múltiplas linhas em containers flex/grid.
- **Ícones Blindados contra Deformação (`[&>svg]:shrink-0`)**:
  - Todo SVG inserido no botão deve ter `shrink-0` (definido no `baseStyles`) para nunca encolher ou ser esmagado pelo texto.
- **Contraste de Acessibilidade WCAG AAA (`--primary-foreground`)**:
  - O botão primário deve utilizar sempre `bg-primary text-primary-foreground hover:bg-primary-hover`.
  - NUNCA force `text-white` em fundos teal/claros. Em modo escuro, o contraste de `#FFFFFF` contra `--primary` (`#14B8A6`) falha nas normas WCAG (2.28:1). A variável `--primary-foreground` resolve para contraste seguro (`#042F2E`, ratio > 8.2:1 AAA).
- **Tipografia Moderna & Feedback Tátil**:
  - Tipografia padrão: `font-semibold text-sm rounded-md`. Evite caixa alta forçada (`uppercase tracking-wider`) que descaracteriza a identidade de produto moderno.
  - Feedback tátil em clique: `active:scale-[0.98] transition-all duration-150`.
- **Touch Targets Mobile**: Todos os botões e elementos clicáveis devem ter dimensão mínima de **44x44px** (ou altura de no mínimo `h-9`/`h-10` com espaçamento acessível) para garantir usabilidade em smartphones.
- Botões compactos em tabelas/listas devem possuir obrigatoriamente `title` e `aria-label` descritivos.

---

## 4. Empty States Informativos e Humanizados

- Vitrines de barbearia sem serviços, agendamentos vazios ou resultados de busca sem correspondência nunca devem ser exibidos em branco ou com layout quebrado.
- Devem exibir:
  1. Ícone visual suave e contextual.
  2. Mensagem humanizada e empática explicando a situação.
  3. Botão de ação primária (CTA) sugerindo o próximo passo (ex.: *"Cadastrar primeiro serviço"*, *"Ver outros horários"*).

---

## 5. Loading Skeletons e Feedback Visual Contínuo

- Toda chamada assíncrona ou carregamento de vitrine deve exibir **Skeleton Loaders** que espelham o layout real do card ou lista durante o carregamento.
- Nunca deixe a tela congelada sem resposta visual imediata.
- Ações de submissão (ex.: confirmar reserva, gerar Pix) devem entrar em estado de ocupado (*busy/loading*), desabilitando cliques repetidos para evitar duplicidade.

---

## 6. Responsividade Mobile-First (360px a 430px)

- O ecossistema AriseFit tem foco prioritário em usuários utilizando smartphones para agendar horários.
- Todas as telas e componentes devem ser testados e validados para telas de **360px a 430px de largura**.

---

## 7. Prevenção de Quebra de Linha em Badges e Alinhamento de Ícones (Zero Layout Shift)

- **Uso Obrigatório da Prop `icon` no `<Badge>`**:
  - NUNCA passe ícones soltos ou misturados dentro de `children` do `<Badge>` (ex.: `<Badge><Sparkles /> Texto</Badge>` é proibido).
  - Use sempre a prop dedicada: `<Badge icon={<Sparkles className="h-3.5 w-3.5 shrink-0" />}>Texto</Badge>`. Isso garante layout flex horizontal em linha única e o espaçamento semântico (`gap-1.5` ou `gap-2`).
- **Inviolabilidade de Linha Única (`whitespace-nowrap`)**:
  - Badges, pílulas de status, tags e selos de segurança/garantia NUNCA devem quebrar linha nem jogar o ícone acima do texto.
  - Devem conter `whitespace-nowrap` e os ícones acompanhantes devem ter a classe `shrink-0` para blindar contra compressão flexbox.

---

## 8. Diretrizes Permanentes de Governança Frontend para Todos os Agentes

Qualquer agente de IA ou desenvolvedor atuando no frontend (`frontend-arisefit/`) deve seguir compulsoriamente os 7 pilares abaixo:

### A. Design System como Única Fonte da Verdade
- Antes de criar ou modificar componentes visuais, consulte o design system existente (`src/design-system/ui/`), incluindo componentes compartilhados, tokens, variantes, tipografia, cores, espaçamentos, bordas e padrões de interação.
- Não invente padrões visuais, bordas, sombras ou paletas incompatíveis com os já estabelecidos.

### B. Reutilização Antes da Duplicação
- Antes de criar qualquer botão, input, modal, dropdown, card, tabela ou elemento visual, verifique se já existe um componente compartilhado apropriado no design system.
- Reutilize ou estenda a implementação existente (`Button`, `Input`, `Badge`, `Card`, `Modal`). É expressamente proibido criar botões HTML crus (`<button>`) ou componentes paralelos concorrentes.

### C. Consistência Global de Infraestrutura
- Toda correção ou ajuste em um componente compartilhado deve considerar e preservar todos os módulos que dependem dele.
- Problemas sistêmicos de layout NUNCA devem ser contornados com hacks isolados em uma única tela. Corrija na infraestrutura compartilhada (tokens, design system, CSS global).

### D. Respeito ao Pipeline Tailwind CSS 4 e CSS
- Respeite rigorosamente a versão instalada do Tailwind CSS 4 e sua configuração com `@theme` em `index.css`.
- É proibido criar classes dinâmicas por concatenação de strings que impeçam a detecção do compilador Vite/Tailwind.
- Evite seletores CSS globais que sobrescrevam propriedades nativas dos componentes.

### E. Validação Visual Obrigatória
- O build passar (`npm run build` ou `tsc`) **NÃO É PROVA SUFICIENTE** de que a interface está correta.
- Sempre que houver alteração visual, inspecione a renderização real via navegador (`browser_subagent`) e execute testes E2E do Playwright.
- Valide estados: normal, hover, foco, desabilitado, loading, contraste WCAG e responsividade (mobile vs desktop).

### F. Testes e Prevenção de Regressões
- Alterações em componentes compartilhados exigem a verificação dos principais fluxos consumidores.
- Preserve o comportamento funcional e de acessibilidade (ARIA labels, submit vs button type, navegação por teclado).

### G. Revisão Crítica Antes de Concluir
- Antes de declarar uma tarefa visual concluída, audite:
  1. O design system foi respeitado?
  2. Foram criadas duplicações?
  3. Há quebras de linha indevidas ou ícones desalinhados?
  4. Há contraste adequado em tema claro e tema escuro?
  5. O Playwright E2E e o build passaram 100% limpos?

---

## 9. Padrão Canônico de Upload de Mídia (`ImageUpload.tsx`)

O componente oficial `ImageUpload` (`src/design-system/ui/ImageUpload.tsx`) é a **única fonte da verdade** para envio de fotos, logotipos, banners e avatares no frontend:
- **Proibição Absoluta de Campos de URL Manual para Arquivos do Usuário**:
  - Se o usuário precisa fornecer uma imagem, use sempre `ImageUpload`.
  - Nunca substitua por `<Input type="url" placeholder="https://..." />` sob pretexto de que a coluna Prisma é `String`.
- **Pré-visualização Imediata e Estados de Feedback**:
  - Exibe avatar circular ou retangular com pré-visualização instantânea via blob local.
  - Indicador de progresso (`Loader2 animate-spin`) durante o envio ao backend.
  - Feedback visual de sucesso e erro com mensagens claras e acolhedoras.
  - Botão de remoção de imagem para reverter ou limpar o arquivo.
- **Validação Local Antecipada**:
  - Limite máximo de **5MB** e formatos permitidos (`image/jpeg`, `image/png`, `image/webp`).
- **Segurança de Armazenamento**:
  - O componente nunca consome credenciais privadas do Cloudinary. O upload transita pelo backend (`/upload/image/:companyId/:imageType`) com validação de Magic Bytes e isolamento Anti-IDOR.

---

## 10. Resiliência de Estado, Ciclo de Vida de Modais e Navegação

Para blindar a interface contra erros como `Cannot read properties of null (reading 'createdAt')`:
- **Proibição de Non-Null Assertions (`!`) em Estados Reativos**:
  - É proibido usar `!` em propriedades de entidades que dependem de seleção assíncrona ou modais (`selectedItem!.createdAt`). Use sempre formatação defensiva (`selectedItem?.createdAt ? ... : '-'`).
- **Limpeza Sincronizada de Estados Dependentes**:
  - Ao fechar modais ou drawers (ex.: estatísticas), resete a entidade selecionada e os dados auxiliares (`setSelectedEmployeeForStats(null); setEmployeeStats(null);`).
- **Renderização Condicional de Modais**:
  - Isole a renderização do modal para quando a entidade existir (`{selectedItem && <Modal ...>...</Modal>}`), impedindo que o React avalie a árvore de filhos quando o estado for `null`.



