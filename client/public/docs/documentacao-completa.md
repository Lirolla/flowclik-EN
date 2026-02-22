# Documentação Completa FlowClik

**Manual completo do sistema de gestão para fotógrafos**

---

## 📚 Índice

1. [Primeiros Passos](#primeiros-passos)
2. [Jornada Completa do Cliente](#jornada-completa-do-cliente)
3. [Painel Admin Detalhado](#painel-admin-detalhado)
4. [Pagamentos e Vendas](#pagamentos-e-vendas)
5. [Comunicação com Clientes](#comunicacao-com-clientes)
6. [Troubleshooting](#troubleshooting)
7. [Dicas Práticas](#dicas-praticas)

---

## 🚀 Primeiros Passos

### Como fazer login

**Acessando seu painel:**

Acesse seu subdomínio personalizado (exemplo: **seusite.flowclick.com**) e clique no botão "Entrar" no canto superior direito. Digite seu email e senha cadastrados durante o registro e clique em "Entrar" para acessar o painel administrativo.

**Se você esqueceu sua senha:**

Na tela de login, clique em "Esqueci minha senha", digite o email cadastrado e você receberá um link de redefinição por email em até 5 minutos. Clique no link recebido, crie uma nova senha e faça login com a nova senha.

**Dicas de segurança:**

Nunca compartilhe sua senha com ninguém. Use uma senha forte com mínimo 8 caracteres combinando letras e números. Salve seu site nos favoritos do navegador para acesso rápido. Sempre faça logout ao usar computadores compartilhados.

**No primeiro acesso:**

Você verá o Dashboard com resumo de agendamentos, receita prevista, galerias criadas e atalhos rápidos para funções principais.

---

### Configurar seu site pela primeira vez

**Passo 1: Informações Básicas**

Acesse "Configurações" no menu lateral esquerdo. Na seção "Informações Básicas", preencha o nome do site (exemplo: "Fotografia Silva"), slogan (exemplo: "Eternizando seus momentos") e faça upload da sua logo clicando em "Upload" e selecionando arquivo PNG ou JPG.

**Passo 2: Configurar Banner da Home**

No menu lateral, clique em "Banner", depois em "+ Novo Slide". Faça upload de uma foto impactante (recomendado 1920x1080px), adicione título (exemplo: "Fotografia Profissional") e descrição (exemplo: "Eternize seus melhores momentos"), depois clique em "Salvar". Você pode adicionar até 5 slides que alternam automaticamente.

**Passo 3: Criar Serviços**

Acesse "Serviços" no menu lateral e clique em "+ Novo Serviço". Preencha nome (exemplo: "Ensaio Fotográfico"), descrição detalhada do que está incluído, preço (exemplo: £250.00), duração em minutos (exemplo: 300 = 5 horas) e tipo (Fotografia, Vídeo ou Ambos). Clique em "Salvar" e repita para cada serviço que você oferece.

**Passo 4: Configurar Informações de Contato**

Volte em "Configurações" e na seção "Informações de Contato", preencha telefone (com código do país), email profissional, WhatsApp (aparecerá botão flutuante no site) e endereço completo.

**Passo 5: Redes Sociais**

Ainda em "Configurações", na seção "Redes Sociais", adicione URLs completas do Instagram, Facebook e YouTube. Os ícones aparecerão automaticamente no rodapé do seu site.

**Passo 6: Adicionar Portfólio**

Acesse "Portfólio" no menu lateral e clique em "+ Adicionar ao Portfólio". Faça upload de suas melhores fotos e para cada uma adicione título (exemplo: "Ensaio Newborn - Maria"), localização (exemplo: "Londres, UK") e descrição (conte a história por trás da foto). Marque "Mostrar na Home" para destacar. Adicione pelo menos 8 fotos para preencher bem a home.

**Pronto! Seu site já está no ar.** Acesse seusite.flowclick.com para ver como ficou.

---

### Cadastrar primeiro cliente

**Por que cadastrar clientes?**

Ao cadastrar clientes no sistema, você pode criar agendamentos vinculados ao cliente, acompanhar histórico de serviços, enviar galerias personalizadas, gerenciar pagamentos e ter relatórios de clientes mais ativos.

**Como cadastrar:**

Acesse "Clientes" no menu lateral e clique em "+ Novo Cliente". Preencha nome completo (exemplo: "Maria Silva"), email (usado para login do cliente e notificações) e telefone (com código do país, exemplo: +44 7545 335396).

Opcionalmente, preencha endereço completo: CEP/Postcode, endereço (rua e número), complemento (apartamento, bloco), cidade e estado/county. O sistema detecta automaticamente o país baseado na configuração, mas você pode alterar manualmente se necessário. Clique em "Salvar" para finalizar.

**Cliente cadastrado automaticamente:**

Quando um cliente faz um agendamento pelo site público (em /agendar), ele é cadastrado automaticamente no sistema. Você só precisa cadastrar manualmente se quiser criar um agendamento antes do cliente solicitar.

**Visualizar histórico do cliente:**

Na lista de clientes, clique no botão "Histórico" para ver todos os agendamentos do cliente, valores gastos, status de cada serviço e pedidos de fotos.

---

## 👤 Jornada Completa do Cliente

### Etapa 1: Cliente descobre seu site

O cliente acessa **seusite.flowclick.com** e vê banner com suas melhores fotos, portfólio de trabalhos anteriores, serviços oferecidos com preços e informações de contato.

O cliente pode navegar pelas galerias públicas, ver seus vídeos (se habilitado), clicar no botão WhatsApp flutuante para falar com você ou clicar em "Agendar Agora" para solicitar serviço.

### Etapa 2: Cliente agenda serviço

O cliente clica em "Agendar Agora" ou acessa /agendar e preenche formulário em 3 etapas:

**Etapa 1:** Escolhe o serviço (vê nome, descrição, preço, duração)  
**Etapa 2:** Escolhe data e horário preferido  
**Etapa 3:** Preenche dados pessoais (nome, email, telefone, local do evento, número de pessoas, observações)

Ao clicar em "Enviar Solicitação", o agendamento é criado no sistema com status "Pendente", cliente é cadastrado automaticamente, você recebe notificação por email e cliente vê mensagem de sucesso.

### Etapa 3: Você aprova o agendamento

Você recebe email "Novo agendamento recebido!", acessa "Agendamentos" no painel admin, clica no agendamento pendente, revisa informações do cliente e clica em "Aprovar" (ou "Recusar" se não puder atender).

O status muda para "Confirmado" e cliente recebe email de confirmação com data e horário confirmados, local do evento, instruções para o dia e seu contato para dúvidas.

### Etapa 4: Você gerencia o pagamento

No painel de detalhes do agendamento, na seção "Gerenciar Pagamento", você vê valor do serviço (preço base), botão "+ Adicionar Serviço Extra" (se cliente pediu algo a mais), total (serviço base + extras), quanto cliente já pagou e quanto ainda falta.

Se cliente pediu extras (exemplo: "30 fotos a mais", "Álbum físico"), clique em "+ Adicionar Serviço Extra", digite descrição e valor, e o total atualiza automaticamente.

Para registrar pagamento, clique em "Registrar Pagamento" e escolha forma de pagamento:

- **Dinheiro:** registra pagamento completo
- **Transferência 50%:** registra metade agora
- **Cartão 100%:** envia link Stripe para cliente pagar online

Clique em "Confirmar" e o pagamento é registrado no histórico, cliente recebe email de confirmação de pagamento e você vê quanto ainda falta receber.

### Etapa 5: Dia do ensaio fotográfico

Status muda para "Ensaio Realizado" (você muda manualmente), você faz as fotos/vídeos e cliente vai para casa feliz aguardando as fotos.

### Etapa 6: Você envia fotos para seleção

Acesse "Agendamentos", abra o agendamento, clique na aba "Fotografia", clique em "Upload de Fotos" e arraste e solte TODAS as fotos do ensaio (tratadas mas não editadas). O sistema cria galeria automaticamente.

Para enviar link para cliente, no painel do agendamento, clique em "Copiar Link Cliente" e envie link por WhatsApp/Email para o cliente. Cliente acessa com email + senha da galeria.

O status muda para "Aguardando Seleção do Cliente", cliente recebe email "Suas fotos estão prontas para seleção!" e cliente acessa galeria vendo TODAS as fotos com marca d'água "LIROLLA - PREVIEW".

### Etapa 7: Cliente seleciona fotos favoritas

Cliente acessa link que você enviou, faz login com email + senha e vê painel do cliente com status do projeto (barra de progresso), atalho para "Ver Galeria", chat para falar com você e histórico de pagamentos.

Cliente clica em "Ver Galeria", vê todas as fotos em grid, clica no coração ❤️ nas fotos que mais gostou, pode adicionar comentários em cada foto (exemplo: "Quero essa mais clara", "Tirar o fundo dessa") e quando terminar, clica em "Enviar Seleção".

O status muda para "Editando Fotos Selecionadas", você recebe notificação por email "Cliente selecionou X fotos!" e cliente recebe confirmação "Seleção recebida! Em breve você receberá as fotos editadas."

### Etapa 8: Você edita as fotos selecionadas

Você recebe email "Cliente selecionou fotos!", acessa "Seleções de Clientes" no menu lateral, vê a galeria do cliente com contador "12 fotos selecionadas", clica para ver quais fotos cliente escolheu, vê comentários/palpites do cliente em cada foto e edita as fotos no Photoshop/Lightroom.

Volta ao sistema e faz upload das fotos editadas finais clicando em "Upload Foto Editada" em cada foto. Sistema mostra lado a lado: Original vs Editada.

### Etapa 9: Cliente aprova álbum final

Quando TODAS as fotos estiverem editadas, clique em "Copiar Link do Álbum Final" e envie link para cliente.

Cliente acessa e vê banner impactante com foto aleatória do álbum, galeria completa de fotos editadas (SEM marca d'água), barra de progresso "12/12 fotos editadas", botão "Baixar Todas as Fotos" (gera ZIP) e botão "Aprovar Álbum Completo".

Cliente baixa fotos e clica em "Aprovar Álbum". O status muda para "Entregue", você recebe notificação "Cliente aprovou o álbum final!", cliente recebe email "Obrigado! Seu álbum foi aprovado." e trabalho concluído! 🎉

### Etapa 10: Cliente compartilha com amigos (Marketing Viral!)

Cliente clica em "Compartilhar Álbum" no painel dele e sistema gera link compartilhável: **seusite.flowclick.com/album-compartilhavel/maria-silva**. Cliente envia para amigos e família.

Quando amigos acessam, veem wall de email (precisam informar email para ver fotos) e emails ficam salvos em "Leads" no seu painel admin. Você pode enviar email marketing para esses leads depois. Esses leads são QUENTES porque já viram seu trabalho e gostaram!

**Resumo do Fluxo:**

1. Cliente agenda pelo site
2. Você aprova agendamento
3. Cliente paga (dinheiro/transferência/cartão)
4. Você faz o ensaio
5. Você envia fotos para seleção
6. Cliente escolhe favoritas e comenta
7. Você edita fotos selecionadas
8. Cliente aprova álbum final
9. Cliente baixa fotos
10. Cliente compartilha e você ganha leads!

---

## ⚙️ Painel Admin Detalhado

### Dashboard - Visão Geral

O Dashboard é a primeira página que você vê ao fazer login. Ele mostra um resumo completo do seu negócio.

**Cards de Estatísticas:**

**Total de Agendamentos:** Mostra quantos agendamentos você tem no total, incluindo todos os status (pendentes, confirmados, entregues). Clique para ir direto para Agendamentos.

**Receita Prevista:** Soma de TODOS os agendamentos (confirmados + pendentes). Valor em libras (£), reais (R$) ou dólares ($) conforme configuração. Não conta agendamentos cancelados.

**Taxa de Confirmação:** Porcentagem de agendamentos aprovados vs pendentes. Exemplo: 85% = 17 confirmados de 20 solicitações. Quanto maior, melhor!

**Taxa de Entrega:** Porcentagem de trabalhos concluídos. Exemplo: 60% = 12 entregues de 20 confirmados. Mostra sua produtividade.

**Gráficos:**

**Agendamentos por Status:** Barras de progresso coloridas mostrando quantos agendamentos em cada etapa (Pendente amarelo, Confirmado verde, Ensaio Realizado azul, Fotos em Edição roxo, Aguardando Seleção laranja, Editando Selecionadas índigo, Entregue verde esmeralda).

**Receita por Status:** Mostra quanto dinheiro está em cada etapa. Exemplo: £500 em "Confirmado", £300 em "Entregue". Ajuda a prever fluxo de caixa.

**Agendamentos por Mês:** Gráfico dos últimos 12 meses mostrando quantos agendamentos você teve em cada mês. Identifica alta temporada vs baixa temporada.

**Tabelas:**

**Pedidos Recentes:** Últimos 5 pedidos de fotos stock mostrando ID, Cliente, Email, Total, Status, Data. Clique no ID para ver detalhes.

**Próximos Agendamentos:** Próximos 5 agendamentos confirmados mostrando ID, Cliente, Serviço, Data/Hora, Status. Ordenado por data (mais próximo primeiro). Ajuda a se preparar para os ensaios.

**Atalhos Rápidos:** Botões para acessar rapidamente "+ Novo Agendamento", "Ver Todos os Agendamentos", "Mensagens de Clientes" e "Seleções Pendentes".

---

### Agendamentos - Gerenciar Trabalhos

A seção Agendamentos é onde você gerencia todos os trabalhos dos clientes.

**Visualizações:**

**Calendário (Padrão):** Calendário mensal estilo Google Calendar com cards coloridos por status em cada dia. Navegação com setas esquerda/direita. Clique no card para abrir detalhes.

**Lista:** Botão "Lista" no topo mostra tabela com TODOS os agendamentos. Filtros disponíveis: buscar por nome do cliente e filtrar por status (dropdown). Paginação: 10 agendamentos por página. Clique na linha para abrir detalhes.

**Criar Novo Agendamento:**

Clique em "+ Novo Agendamento" e preencha formulário:

- **Selecionar Cliente:** Dropdown com clientes cadastrados ou clique "+ Novo Cliente" para cadastrar na hora
- **Selecionar Serviço:** Dropdown com serviços criados mostrando nome, preço e duração
- **Data e Horário:** Escolha data no calendário e digite horário preferido (exemplo: 14:00)
- **Detalhes do Evento:** Local (endereço onde será o ensaio), número de pessoas (quantas participarão), duração estimada em horas, observações (pedidos especiais do cliente)

Clique em "Criar Agendamento". Agendamento criado com status "Pendente", cliente recebe email de confirmação e aparece no calendário.

**Painel de Detalhes do Agendamento:**

Quando você clica em um agendamento, abre painel lateral com 2 abas:

**Aba "Detalhes":**

- **Informações do Cliente:** Nome, Email, Telefone, Data, Horário, Local, Número de pessoas, Duração, Observações
- **Timeline do Workflow:** 7 etapas visuais com ícones, etapa atual destacada em verde, botão "Avançar" para próximo status, histórico de mudanças de status
- **Gerenciar Pagamento:** Valor do Serviço (preço base com botão editar), Serviços Extras (lista de itens adicionais com botão "+ Adicionar Serviço Extra", cada extra mostra descrição e valor, botão lixeira para remover), Total (soma automática serviço + extras), Pago (quanto cliente já pagou), Restante (quanto ainda falta), botão "Registrar Pagamento", histórico de transações
- **Ações Rápidas:** Aprovar (se pendente), Recusar (se pendente), Editar agendamento, Excluir agendamento

**Aba "Fotografia":**

- **Estatísticas da Galeria:** Total de fotos (quantas você enviou), Fotos favoritas (quantas cliente marcou), Taxa de seleção (porcentagem de fotos escolhidas)
- **Ações:** Upload de Fotos (abre página para enviar fotos), Copiar Link Cliente (copia link da galeria), Liberar/Bloquear Download (toggle para permitir cliente baixar)

**Botões no Header do Painel:** Galeria do Ensaio (gerenciar fotos do ensaio), Álbum Final (upload de fotos editadas finais), Copiar Link Cliente (link para cliente acessar painel), Liberar/Bloquear Download (status do download).

**Workflow Automático:**

O sistema avança automaticamente em alguns casos: cliente envia seleção muda para "Editando Selecionadas", cliente aprova álbum muda para "Entregue", você aprova agendamento envia email para cliente, você muda status envia email para cliente.

**Notificações por Email:**

Cliente recebe email automaticamente quando agendamento é aprovado, status muda, fotos são enviadas para seleção e álbum final está pronto.

---

## 💰 Pagamentos e Vendas

### Como gerenciar pagamentos de clientes

O sistema oferece 3 formas de pagamento para você receber dos clientes.

**Acessar Gerenciamento de Pagamento:**

Acesse "Agendamentos", clique no agendamento do cliente e na aba "Detalhes", role até "Gerenciar Pagamento".

**Estrutura de Pagamento:**

**Valor do Serviço:** Preço base do serviço contratado, copiado automaticamente ao criar agendamento, botão "Editar" para ajustar se necessário.

**Serviços Extras:** Lista de itens adicionais cobrados. Exemplos: "30 fotos a mais (£50)", "Álbum físico (£100)". Botão "+ Adicionar Serviço Extra": clique no botão, digite descrição (exemplo: "Álbum físico 20x30cm"), digite valor em libras/reais/dólares (exemplo: 100), clique "Adicionar", extra aparece na lista. Botão lixeira para remover extra.

**Total:** Soma automática: Serviço Base + Todos os Extras. Atualiza em tempo real ao adicionar/remover extras. Exemplo: £250 (serviço) + £50 (extra) + £100 (extra) = £400.

**Pago:** Quanto cliente já pagou. Soma de todos os pagamentos registrados.

**Restante:** Quanto ainda falta receber. Cálculo: Total - Pago. Quando chega a £0.00, está quitado!

**Registrar Pagamento:**

Clique em "Registrar Pagamento" e escolha forma de pagamento:

**Opção 1: Dinheiro** - Cliente pagou em dinheiro. Sistema registra 100% do valor total. Clique em "Confirmar". Pagamento adicionado ao histórico. Cliente recebe email de confirmação.

**Opção 2: Transferência 50%** - Cliente fez transferência bancária de metade. Sistema registra 50% do valor total. Clique em "Confirmar". Você pode registrar outra transferência depois para completar.

**Opção 3: Cartão 100% (Stripe)** - Envia link de pagamento Stripe para cliente. Cliente paga online com cartão. Sistema registra automaticamente quando pagamento for aprovado. Requer configuração do Stripe (veja guia de configuração).

**Histórico de Transações:**

Abaixo do gerenciamento, você vê lista de todos os pagamentos recebidos. Cada transação mostra data e hora, forma de pagamento, valor pago e status (Pago / Pendente).

**Editar Valor Total:**

Se cliente pediu algo extra DEPOIS de criar agendamento, clique no botão "Editar" ao lado do Valor do Serviço, digite novo valor total, clique em "Salvar", total atualiza automaticamente e restante recalcula. Ou use "Adicionar Serviço Extra" para manter histórico detalhado!

**Notificações Automáticas:**

Cliente recebe email quando você registra pagamento, pagamento Stripe é aprovado ou pagamento Stripe falha.

**Dicas:**

- Registre pagamentos imediatamente para não esquecer
- Use Serviços Extras para transparência (cliente vê detalhamento)
- Peça 50% adiantado antes do ensaio (transferência)
- Restante após entrega das fotos editadas

---

## 💬 Comunicação com Clientes

### Sistema de mensagens integrado

O sistema tem chat integrado para você conversar com clientes em tempo real.

**Painel de Mensagens (Admin):**

Acesse "Mensagens" no menu lateral e vê layout estilo WhatsApp Web com lista de conversas à esquerda e chat ativo à direita.

**Lista de Conversas:**

Cada conversa mostra nome do cliente, preview da última mensagem, tempo relativo (exemplo: "5 minutos atrás") e badge vermelho com número de mensagens não lidas.

**Chat Ativo:**

Quando você clica em uma conversa, header mostra nome do cliente, histórico de mensagens no centro (mensagens do cliente lado esquerdo cinza, suas mensagens lado direito azul, data e hora em cada mensagem), campo de texto embaixo e botão "Enviar".

**Enviar Mensagem:**

Digite mensagem no campo de texto, clique em "Enviar" ou pressione Enter, mensagem aparece instantaneamente e cliente recebe notificação.

**Marcar como Lida:**

Quando você abre uma conversa, mensagens são marcadas como lidas automaticamente e badge de não lidas desaparece.

**Chat do Cliente:**

Cliente acessa chat em /cliente/chat/:id. Cliente acessa painel do cliente, clica em "Chat" nos atalhos rápidos, vê histórico de mensagens, digita mensagem e clica "Enviar", vê sua resposta instantaneamente.

Cliente recebe notificação quando você responde. Você recebe notificação quando cliente envia mensagem.

**Casos de Uso:**

- Cliente tira dúvidas: "Posso levar meu cachorro no ensaio?" / "Claro! Adoramos pets nas fotos 🐶"
- Cliente pede alteração: "Pode deixar a foto 5 mais clara?" / "Vou ajustar e enviar novamente!"
- Você envia atualizações: "Oi Maria! Suas fotos editadas estão prontas. Acesse o álbum final para baixar 📸"
- Combinar detalhes: "Podemos mudar o horário para 15h?" / "Sem problemas! Já atualizei o agendamento."

**Dicas:**

- Responda rápido para melhorar experiência do cliente
- Use emojis para deixar conversa mais amigável
- Seja claro e objetivo nas respostas
- Confirme recebimento de pedidos do cliente
- Envie atualizações proativas sobre andamento do trabalho

---

## 🔧 Troubleshooting

### Problemas comuns e soluções

**Upload de Fotos:**

**Problema: "Erro ao fazer upload"**

Causas possíveis: Foto muito grande (> 25MB), formato não suportado, conexão de internet instável.

Soluções: Comprima foto antes de enviar (use Photoshop/Lightroom), converta para JPG se estiver em formato diferente, tente enviar uma foto por vez, verifique sua conexão de internet.

**Problema: "Upload trava em 50%"**

Solução: Aguarde até 2 minutos (fotos grandes demoram). Se não completar, recarregue página e tente novamente. Reduza resolução da foto para 4000px.

**Pagamentos:**

**Problema: "Cliente não recebeu link de pagamento Stripe"**

Soluções: Verifique se email do cliente está correto, peça para cliente verificar spam/lixo eletrônico, reenvie link clicando em "Registrar Pagamento" novamente.

**Problema: "Pagamento Stripe não foi registrado"**

Causas: Webhook do Stripe não configurado, cliente não completou pagamento.

Soluções: Verifique no dashboard do Stripe se pagamento foi aprovado. Se aprovado mas não registrado, configure webhook (veja guia). Se pendente, peça para cliente completar pagamento.

**Galerias:**

**Problema: "Cliente não consegue acessar galeria"**

Soluções: Verifique se senha está correta, envie link correto (seusite.flowclick.com/galeria/:slug), peça para cliente usar navegador atualizado (Chrome, Safari, Edge), verifique se galeria não foi excluída.

**Problema: "Fotos não aparecem na galeria"**

Soluções: Verifique se upload foi concluído (veja lista de fotos existentes), recarregue página da galeria (Ctrl+F5 ou Cmd+R), limpe cache do navegador, tente em navegador diferente.

---

## 💡 Dicas Práticas

### Organização

**Nomeie Galerias de Forma Clara:**

Bom: "Ensaio Newborn - Maria Silva - 15/01/2025"  
Ruim: "Galeria 1"

Por quê: Facilita encontrar galeria depois.

**Use Descrições Detalhadas:**

Adicione na descrição da galeria tipo de ensaio, localização, número de fotos e observações especiais.

Exemplo: "Ensaio newborn em estúdio. 50 fotos tratadas. Cliente pediu tons pastéis."

**Organize Clientes por Tags:**

Crie sistema próprio de organização: adicione prefixo no nome ("[VIP] Maria Silva"), use observações para anotar preferências, mantenha histórico atualizado.

### Workflow Eficiente

**Fluxo Recomendado:**

1. Cliente agenda → Você aprova em até 24h
2. Peça 50% adiantado → Registre pagamento
3. Dia do ensaio → Mude status para "Ensaio Realizado"
4. Envie TODAS as fotos em até 7 dias → Cliente seleciona
5. Edite fotos selecionadas em até 14 dias
6. Envie álbum final → Cliente aprova
7. Receba restante → Registre pagamento
8. Mude para "Entregue" → Trabalho concluído!

**Prazos Sugeridos:**

- Aprovação de agendamento: 24 horas
- Envio de fotos para seleção: 7 dias após ensaio
- Edição de fotos selecionadas: 14 dias após seleção
- Entrega final: 21 dias após ensaio (total)

### Comunicação

**Seja Proativo:**

Envie atualizações sem cliente pedir: "Oi Maria! Ensaio foi ótimo. Fotos estarão prontas em 5 dias!", "Recebi sua seleção! Vou começar a editar hoje.", "Suas fotos estão 50% editadas. Em breve você recebe!"

**Use Chat para Tudo:**

Confirmar detalhes do ensaio, avisar atrasos, pedir informações adicionais, enviar previews, agradecer após aprovação.

**Responda Rápido:**

Mensagens: até 2 horas. Emails: até 24 horas. WhatsApp: imediato (se possível).

### Vendas

**Maximize Vendas de Eventos:**

1. Faça fotos de TODOS no evento (não só contratante)
2. Ative vendas logo após cliente aprovar álbum
3. Envie email para leads imediatamente
4. Compartilhe em redes sociais do evento
5. Defina prazo (exemplo: "Vendas até 31/01")
6. Ofereça desconto para compras acima de 10 fotos

**Preços Competitivos:**

- Fotos digitais avulsas: £15-£25
- Fotos emolduradas: £50-£100
- Fotos stock: £20-£50
- Pacotes: Desconto de 10-20%

**Upsell Inteligente:**

Ofereça extras durante agendamento: "Quer 30 fotos a mais editadas? +£50", "Álbum físico 20x30cm? +£100", "Vídeo curto do ensaio? +£80".

---

**Fim da Documentação Completa FlowClik**

*Última atualização: Janeiro 2025*
