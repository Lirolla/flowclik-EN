import { sendEmail } from "../_core/email";
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb, getTenantId } from "../db";
import { contractTemplates, contracts, appointments, services, tenants, users, siteConfig } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import jsPDF from "jspdf";

export const contractsRouter = router({
  /**
   * Get all contract templates
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
    const db = await getDb();
    if (!db) return [];
    return db.select().from(contractTemplates)
      .where(eq(contractTemplates.tenantId, getTenantId(ctx)))
      .orderBy(desc(contractTemplates.createdAt));
  }),

  /**
   * Create template
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      content: z.string(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(contractTemplates).values({
        name: input.name,
        description: input.description || null,
        content: input.content,
        isActive: input.isActive !== false ? 1 : 0,
        tenantId: getTenantId(ctx),
      });
      return { success: true };
    }),

  /**
   * Update template
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string(),
      description: z.string().optional(),
      content: z.string(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(contractTemplates)
        .set({
          name: input.name,
          description: input.description || null,
          content: input.content,
          isActive: input.isActive !== false ? 1 : 0,
        })
        .where(and(eq(contractTemplates.id, input.id), eq(contractTemplates.tenantId, getTenantId(ctx))));
      return { success: true };
    }),

  /**
   * Delete template
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(contractTemplates)
        .where(and(eq(contractTemplates.id, input.id), eq(contractTemplates.tenantId, getTenantId(ctx))));
      return { success: true };
    }),

  /**
   * Seed default templates (insere os 4 modelos prontos)
   */
  seedDefaults: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const tenantId = getTenantId(ctx);
      
      // Verificar se já tem templates
      const existing = await db.select().from(contractTemplates)
        .where(eq(contractTemplates.tenantId, tenantId));
      
      if (existing.length > 0) {
        return { success: false, message: "Já existem templates cadastrados. Exclua-os primeiro se quiser recriar." };
      }

      const defaultTemplates = [
        {
          name: "Contrato de Ensaio Fotográfico",
          description: "Para ensaios pessoais, sensuais, gestantes, família, 15 anos, newborn. Inclui cláusulas de direito de imagem e privacidade.",
          content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS - ENSAIO

CONTRATANTE: {cliente}
E-mail: {email}
Telefone: {telefone}
CPF: {cpf}
Endereço: {endereco}

CONTRATADO(A): {fotografo}
CPF/CNPJ: {fotografo_documento}
Endereço Profissional: {fotografo_endereco}

As partes acima identificadas celebram o presente contrato de prestação de serviços fotográficos, que se regerá pelas seguintes cláusulas e condições:

CLÁUSULA 1ª – DO OBJETO
O presente contrato tem por objeto a prestação de serviços fotográficos de ensaio, conforme especificações:
• Tipo de Ensaio: {servico}
• Data da Sessão: {data}
• Horário: {horario}
• Local: {local}
• Duração Estimada: {duracao}

CLÁUSULA 2ª – DO VALOR E FORMA DE PAGAMENTO
2.1. O valor total dos serviços é de R$ {valor}.
2.2. O pagamento poderá ser realizado via PIX, transferência bancária ou link de pagamento.
2.3. Sinal de 50% no ato da contratação, restante até a data da sessão.

CLÁUSULA 3ª – DO SERVIÇO INCLUÍDO
3.1. Estão inclusos no valor contratado:
• Sessão fotográfica com duração estimada conforme acordado;
• Tratamento e edição profissional das fotografias selecionadas;
• Entrega das fotos em alta resolução por meio digital (galeria online).
3.2. O prazo de entrega das fotos editadas é de até 15 (quinze) dias úteis após a sessão.

CLÁUSULA 4ª – DOS DIREITOS AUTORAIS (Lei 9.610/1998)
4.1. As fotografias produzidas são obras protegidas por direitos autorais, sendo o(a) CONTRATADO(A) o(a) titular dos direitos patrimoniais e morais sobre as mesmas.
4.2. O(A) CONTRATANTE recebe licença de uso pessoal e não comercial das fotografias entregues.
4.3. É vedada a alteração, manipulação digital ou aplicação de filtros nas fotografias entregues sem autorização prévia do(a) fotógrafo(a).
4.4. A reprodução, distribuição ou uso comercial das fotografias depende de autorização expressa e por escrito do(a) CONTRATADO(A).

CLÁUSULA 5ª – DO DIREITO DE IMAGEM
5.1. O(A) CONTRATANTE autoriza / não autoriza (riscar o que não se aplica) o uso de suas imagens pelo(a) CONTRATADO(A) para fins de divulgação profissional, incluindo portfólio, redes sociais e site.
5.2. Em caso de ensaio de natureza íntima ou sensual, o(a) CONTRATADO(A) se compromete a NÃO utilizar as imagens para qualquer fim de divulgação sem autorização expressa e por escrito do(a) CONTRATANTE.
5.3. O(A) CONTRATADO(A) garante sigilo absoluto sobre as imagens produzidas, em conformidade com a LGPD (Lei 13.709/2018).

CLÁUSULA 6ª – DO CANCELAMENTO E REAGENDAMENTO
6.1. Cancelamento com até 7 dias de antecedência: devolução integral do sinal.
6.2. Cancelamento com menos de 7 dias: sinal não será devolvido.
6.3. Cancelamento no dia ou não comparecimento: valor total será devido.
6.4. Reagendamento permitido uma vez, sem custo, com aviso de 48 horas.
6.5. Condições climáticas adversas (ensaios externos): reagendamento sem custo.

CLÁUSULA 7ª – DAS OBRIGAÇÕES DO CONTRATADO
7.1. Realizar a sessão fotográfica com zelo e profissionalismo.
7.2. Entregar as fotografias editadas no prazo estipulado.
7.3. Manter sigilo sobre dados pessoais e imagens do(a) CONTRATANTE (LGPD).
7.4. Disponibilizar as fotos em galeria online segura por no mínimo 30 dias.

CLÁUSULA 8ª – DAS OBRIGAÇÕES DO CONTRATANTE
8.1. Efetuar os pagamentos nas datas acordadas.
8.2. Comparecer no local e horário agendados.
8.3. Informar eventuais restrições ou necessidades especiais.
8.4. Respeitar os direitos autorais do(a) fotógrafo(a).

CLÁUSULA 9ª – DA PROTEÇÃO DE DADOS (LGPD - Lei 13.709/2018)
9.1. Os dados pessoais coletados serão utilizados exclusivamente para a execução deste contrato.
9.2. O(A) CONTRATADO(A) se compromete a não compartilhar dados pessoais com terceiros.

CLÁUSULA 10ª – DO FORO
Para dirimir quaisquer controvérsias, as partes elegem o foro da comarca de domicílio do(a) CONTRATANTE, nos termos do art. 101, I, do CDC.

{cidade}, {data_contrato}

_______________________________
CONTRATANTE: {cliente}
CPF: {cpf}

_______________________________
CONTRATADO(A): {fotografo}
CPF/CNPJ: {fotografo_documento}`,
        },
        {
          name: "Contrato de Cobertura de Casamento",
          description: "Para casamentos, formaturas e cerimônias. Inclui cláusulas sobre cobertura do evento, segundo fotógrafo e álbum.",
          content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS - CASAMENTO / CERIMÔNIA

CONTRATANTE(S): {cliente}
E-mail: {email}
Telefone: {telefone}
CPF: {cpf}
Endereço: {endereco}

CONTRATADO(A): {fotografo}
CPF/CNPJ: {fotografo_documento}
Endereço Profissional: {fotografo_endereco}

CLÁUSULA 1ª – DO OBJETO
Cobertura fotográfica do evento:
• Tipo de Evento: {servico}
• Data: {data}
• Horário: {horario}
• Local: {local}
• Duração da Cobertura: {duracao}

CLÁUSULA 2ª – DO VALOR E PAGAMENTO
2.1. Valor total: R$ {valor}.
2.2. Sinal de 30% na assinatura para reserva da data; 40% até 30 dias antes; 30% até 7 dias antes.
2.3. Formas: PIX, transferência bancária ou link de pagamento.
2.4. A reserva da data somente será confirmada após o recebimento do sinal.

CLÁUSULA 3ª – DOS SERVIÇOS INCLUÍDOS
3.1. Cobertura fotográfica completa (cerimônia e recepção); edição profissional; entrega mínima de 300 fotos em alta resolução; galeria online; making of.
3.2. Prazo de entrega: até 45 dias úteis após o evento.

CLÁUSULA 4ª – DA COBERTURA DO EVENTO
4.1. O(A) fotógrafo(a) cobrirá os principais momentos com profissionalismo e liberdade artística.
4.2. O(A) CONTRATANTE deverá informar previamente momentos específicos que deseja registrados.

CLÁUSULA 5ª – DOS DIREITOS AUTORAIS (Lei 9.610/1998)
5.1. Fotografias são obras autorais protegidas. CONTRATANTE recebe licença de uso pessoal e familiar.
5.2. Uso comercial por terceiros requer autorização expressa.
5.3. Vedada alteração ou aplicação de filtros sem autorização.

CLÁUSULA 6ª – DO DIREITO DE IMAGEM
6.1. CONTRATANTE autoriza uso para portfólio, redes sociais e site do(a) fotógrafo(a).
6.2. Restrições devem ser comunicadas por escrito antes do evento.

CLÁUSULA 7ª – DO CANCELAMENTO
7.1. Até 90 dias antes: devolução de 80% do sinal.
7.2. Entre 90 e 30 dias: devolução de 50% do sinal.
7.3. Menos de 30 dias: sinal não devolvido.
7.4. Cancelamento pelo(a) CONTRATADO(A): devolução integral + multa de 20%.
7.5. Força maior: reagendamento sem ônus.

CLÁUSULA 8ª – DA RESPONSABILIDADE
8.1. Equipamento profissional com backup (segundo corpo de câmera).
8.2. Falha técnica com perda total: devolução integral dos valores.

CLÁUSULA 9ª – DA ALIMENTAÇÃO E LOGÍSTICA
9.1. CONTRATANTE providenciará refeição para fotógrafo(a) e assistente(s).
9.2. Deslocamentos superiores a 50 km: custo adicional de transporte.

CLÁUSULA 10ª – DA PROTEÇÃO DE DADOS (LGPD)
10.1. Dados pessoais tratados com sigilo, conforme Lei 13.709/2018.

CLÁUSULA 11ª – DO FORO
Foro da comarca de domicílio do(a) CONTRATANTE.

{cidade}, {data_contrato}

_______________________________
CONTRATANTE: {cliente}
CPF: {cpf}

_______________________________
CONTRATADO(A): {fotografo}
CPF/CNPJ: {fotografo_documento}`,
        },
        {
          name: "Contrato de Evento Corporativo / Social",
          description: "Para festas, aniversários, formaturas, eventos corporativos, confraternizações e lançamentos.",
          content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS - EVENTO

CONTRATANTE: {cliente}
E-mail: {email}
Telefone: {telefone}
CPF/CNPJ: {cpf}
Endereço: {endereco}

CONTRATADO(A): {fotografo}
CPF/CNPJ: {fotografo_documento}
Endereço Profissional: {fotografo_endereco}

CLÁUSULA 1ª – DO OBJETO
Cobertura fotográfica do evento:
• Tipo de Evento: {servico}
• Data: {data}
• Horário: {horario}
• Local: {local}
• Duração: {duracao}

CLÁUSULA 2ª – DO VALOR E PAGAMENTO
2.1. Valor total: R$ {valor}.
2.2. 50% de sinal na contratação; 50% até a data do evento.
2.3. Formas: PIX, transferência bancária ou link de pagamento.

CLÁUSULA 3ª – DOS SERVIÇOS
3.1. Cobertura fotográfica pelo período contratado; edição profissional; entrega digital em galeria online (alta resolução).
3.2. Prazo de entrega: até 20 dias úteis após o evento.

CLÁUSULA 4ª – DOS DIREITOS AUTORAIS (Lei 9.610/1998)
4.1. Fotógrafo(a) é titular dos direitos autorais.
4.2. CONTRATANTE recebe licença de uso institucional e divulgação do evento.
4.3. Uso em campanhas publicitárias requer autorização adicional.

CLÁUSULA 5ª – DO DIREITO DE IMAGEM
5.1. CONTRATANTE declara possuir autorização dos participantes para registro fotográfico.
5.2. Fotógrafo(a) poderá usar imagens no portfólio, salvo restrição expressa.

CLÁUSULA 6ª – DO CANCELAMENTO
6.1. Mais de 15 dias: devolução integral do sinal.
6.2. Menos de 15 dias: sinal retido como taxa de reserva.
6.3. No dia ou não comparecimento: valor total devido.
6.4. Reagendamento permitido uma vez, com aviso de 72 horas.

CLÁUSULA 7ª – CONDIÇÕES GERAIS
7.1. Acesso livre aos ambientes do evento.
7.2. Alimentação para eventos com duração superior a 4 horas.

CLÁUSULA 8ª – PROTEÇÃO DE DADOS (LGPD)
8.1. Dados pessoais tratados exclusivamente para execução do contrato.
8.2. Imagens de menores não serão usadas para divulgação sem autorização dos responsáveis.

CLÁUSULA 9ª – DO FORO
Foro da comarca de domicílio do(a) CONTRATANTE.

{cidade}, {data_contrato}

_______________________________
CONTRATANTE: {cliente}
CPF/CNPJ: {cpf}

_______________________________
CONTRATADO(A): {fotografo}
CPF/CNPJ: {fotografo_documento}`,
        },
        {
          name: "Contrato Simplificado de Fotografia",
          description: "Modelo simples e direto para qualquer tipo de serviço fotográfico. Ideal para trabalhos rápidos e sessões avulsas.",
          content: `CONTRATO SIMPLIFICADO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS

CONTRATANTE: {cliente}
E-mail: {email} | Telefone: {telefone}
CPF: {cpf}

CONTRATADO(A): {fotografo}
CPF/CNPJ: {fotografo_documento}

1. SERVIÇO: {servico}
2. DATA: {data} | HORÁRIO: {horario}
3. LOCAL: {local}
4. VALOR: R$ {valor}
5. PAGAMENTO: Conforme acordado entre as partes.

6. ENTREGA: Fotos editadas em até 15 dias úteis via galeria digital.

7. DIREITOS AUTORAIS: As fotografias são de autoria do(a) CONTRATADO(A), conforme Lei 9.610/98. O(A) CONTRATANTE recebe licença de uso pessoal.

8. CANCELAMENTO: Cancelamentos com menos de 48h de antecedência implicam na retenção de 50% do valor como taxa de reserva.

9. IMAGEM: O(A) CONTRATANTE autoriza ( ) SIM ( ) NÃO o uso das fotos para portfólio do(a) fotógrafo(a).

10. LGPD: Dados pessoais tratados conforme Lei 13.709/2018, exclusivamente para este contrato.

11. FORO: Comarca de domicílio do(a) CONTRATANTE.

{cidade}, {data_contrato}

___________________          ___________________
CONTRATANTE                  CONTRATADO(A)
{cliente}                    {fotografo}
CPF: {cpf}                   CPF/CNPJ: {fotografo_documento}`,
        },
      ];

      for (const tmpl of defaultTemplates) {
        await db.insert(contractTemplates).values({
          name: tmpl.name,
          description: tmpl.description,
          content: tmpl.content,
          isActive: 1,
          tenantId,
        });
      }

      return { success: true, count: defaultTemplates.length };
    }),

  /**
   * Generate contract from appointment + template
   * Substitui todas as variáveis com dados reais do agendamento
   */
  generateFromAppointment: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      appointmentId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const tenantId = getTenantId(ctx);

      // Buscar template
      const [template] = await db.select().from(contractTemplates)
        .where(and(eq(contractTemplates.id, input.templateId), eq(contractTemplates.tenantId, tenantId)))
        .limit(1);
      if (!template) throw new Error("Template não encontrado");

      // Buscar appointment com dados do serviço
      const [appointment] = await db.select({
        id: appointments.id,
        clientName: appointments.clientName,
        clientEmail: appointments.clientEmail,
        clientPhone: appointments.clientPhone,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        eventLocation: appointments.eventLocation,
        numberOfPeople: appointments.numberOfPeople,
        estimatedDuration: appointments.estimatedDuration,
        finalPrice: appointments.finalPrice,
        customServiceName: appointments.customServiceName,
        notes: appointments.notes,
        serviceName: services.name,
        servicePrice: services.price,
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(eq(appointments.id, input.appointmentId), eq(appointments.tenantId, tenantId)))
      .limit(1);
      
      if (!appointment) throw new Error("Agendamento não encontrado");

      // Buscar dados do tenant (fotógrafo)
      const [tenant] = await db.select().from(tenants)
        .where(eq(tenants.id, tenantId)).limit(1);

      // Buscar dados do admin (fotógrafo)
      const [adminUser] = await db.select().from(users)
        .where(and(eq(users.tenantId, tenantId), eq(users.role, 'admin'))).limit(1);

      // Preparar variáveis
      const serviceName = appointment.customServiceName || appointment.serviceName || 'Sessão Fotográfica';
      const price = appointment.finalPrice || appointment.servicePrice || 0;
      const priceFormatted = (price / 100).toFixed(2).replace('.', ',');
      const signalFormatted = (price / 200).toFixed(2).replace('.', ',');
      const dateFormatted = appointment.appointmentDate 
        ? new Date(appointment.appointmentDate).toLocaleDateString('pt-BR')
        : '___/___/______';
      const today = new Date().toLocaleDateString('pt-BR');

      // Substituir variáveis
      let content = template.content;
      const replacements: Record<string, string> = {
        '{cliente}': appointment.clientName || '________________________',
        '{email}': appointment.clientEmail || '________________________',
        '{telefone}': appointment.clientPhone || '________________________',
        '{cpf}': '________________________',
        '{endereco}': '________________________',
        '{fotografo}': tenant?.name || adminUser?.name || '________________________',
        '{fotografo_documento}': '________________________',
        '{fotografo_endereco}': '________________________',
        '{servico}': serviceName,
        '{data}': dateFormatted,
        '{horario}': appointment.appointmentTime || 'A combinar',
        '{local}': appointment.eventLocation || 'A definir',
        '{duracao}': appointment.estimatedDuration || 'A combinar',
        '{valor}': priceFormatted,
        '{valor_sinal}': signalFormatted,
        '{cidade}': '________________________',
        '{data_contrato}': today,
        '{local_recepcao}': '________________________',
      };

      for (const [key, value] of Object.entries(replacements)) {
        content = content.split(key).join(value);
      }

      // Buscar siteConfig para logo
      const [config] = await db.select({
        logoUrl: siteConfig.logoUrl,
        siteName: siteConfig.siteName,
      }).from(siteConfig).where(eq(siteConfig.tenantId, tenantId)).limit(1);

      return {
        success: true,
        content,
        templateName: template.name,
        clientName: appointment.clientName,
        appointmentDate: dateFormatted,
        serviceName,
        price: priceFormatted,
        logoUrl: config?.logoUrl || null,
        siteName: config?.siteName || null,
        clientEmail: appointment.clientEmail || null,
        clientPhone: appointment.clientPhone || null,
      };
    }),

  /**
   * Generate PDF from filled contract content
   */
  generatePDF: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      appointmentId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const tenantId = getTenantId(ctx);

      // Buscar template
      const [template] = await db.select().from(contractTemplates)
        .where(and(eq(contractTemplates.id, input.templateId), eq(contractTemplates.tenantId, tenantId)))
        .limit(1);
      if (!template) throw new Error("Template não encontrado");

      // Buscar appointment com serviço
      const [appointment] = await db.select({
        id: appointments.id,
        clientName: appointments.clientName,
        clientEmail: appointments.clientEmail,
        clientPhone: appointments.clientPhone,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        eventLocation: appointments.eventLocation,
        estimatedDuration: appointments.estimatedDuration,
        finalPrice: appointments.finalPrice,
        customServiceName: appointments.customServiceName,
        serviceName: services.name,
        servicePrice: services.price,
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(eq(appointments.id, input.appointmentId), eq(appointments.tenantId, tenantId)))
      .limit(1);
      
      if (!appointment) throw new Error("Agendamento não encontrado");

      // Buscar tenant
      const [tenant] = await db.select().from(tenants)
        .where(eq(tenants.id, tenantId)).limit(1);
      const [adminUser] = await db.select().from(users)
        .where(and(eq(users.tenantId, tenantId), eq(users.role, 'admin'))).limit(1);

      // Preparar variáveis
      const serviceName = appointment.customServiceName || appointment.serviceName || 'Sessão Fotográfica';
      const price = appointment.finalPrice || appointment.servicePrice || 0;
      const priceFormatted = (price / 100).toFixed(2).replace('.', ',');
      const signalFormatted = (price / 200).toFixed(2).replace('.', ',');
      const dateFormatted = appointment.appointmentDate 
        ? new Date(appointment.appointmentDate).toLocaleDateString('pt-BR')
        : '___/___/______';
      const today = new Date().toLocaleDateString('pt-BR');

      let content = template.content;
      const replacements: Record<string, string> = {
        '{cliente}': appointment.clientName || '________________________',
        '{email}': appointment.clientEmail || '________________________',
        '{telefone}': appointment.clientPhone || '________________________',
        '{cpf}': '________________________',
        '{endereco}': '________________________',
        '{fotografo}': tenant?.name || adminUser?.name || '________________________',
        '{fotografo_documento}': '________________________',
        '{fotografo_endereco}': '________________________',
        '{servico}': serviceName,
        '{data}': dateFormatted,
        '{horario}': appointment.appointmentTime || 'A combinar',
        '{local}': appointment.eventLocation || 'A definir',
        '{duracao}': appointment.estimatedDuration || 'A combinar',
        '{valor}': priceFormatted,
        '{valor_sinal}': signalFormatted,
        '{cidade}': '________________________',
        '{data_contrato}': today,
        '{local_recepcao}': '________________________',
      };

      for (const [key, value] of Object.entries(replacements)) {
        content = content.split(key).join(value);
      }

      // Buscar siteConfig para logo
      const [config] = await db.select({
        logoUrl: siteConfig.logoUrl,
        siteName: siteConfig.siteName,
      }).from(siteConfig).where(eq(siteConfig.tenantId, tenantId)).limit(1);

      // Gerar PDF
      const doc = new jsPDF();
      let startY = 20;
      
      // Adicionar logo se disponível
      if (config?.logoUrl) {
        try {
          doc.addImage(config.logoUrl, 'PNG', 20, 10, 50, 25);
          startY = 42;
        } catch (e) {
          // Se falhar ao adicionar imagem, continua sem logo
          console.log('Erro ao adicionar logo ao PDF:', e);
        }
      }
      
      // Título
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const titleLines = doc.splitTextToSize(template.name.toUpperCase(), 170);
      doc.text(titleLines, 20, startY);
      
      // Conteúdo
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(content, 170);
      
      let y = startY + 15;
      const pageHeight = 280;
      
      for (const line of lines) {
        if (y > pageHeight) {
          doc.addPage();
          y = 20;
        }
        // Bold para cláusulas
        if (line.startsWith('CLÁUSULA') || line.startsWith('CONTRAT')) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }
        doc.text(line, 20, y);
        y += 5;
      }

      const pdfBase64 = doc.output("datauristring");
      return {
        success: true,
        pdfData: pdfBase64,
        fileName: `contrato-${appointment.clientName?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`,
      };
    }),

  // Salvar contrato no banco
  saveContract: protectedProcedure
    .input(z.object({
      appointmentId: z.number(),
      templateId: z.number(),
      content: z.string(),
      clientName: z.string(),
      clientEmail: z.string().optional(),
      templateName: z.string().optional(),
      serviceName: z.string().optional(),
      price: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verificar se já existe um contrato para este agendamento
      const existing = await db.select().from(contracts)
        .where(and(
          eq(contracts.appointmentId, input.appointmentId),
          eq(contracts.tenantId, tenantId)
        ))
        .limit(1);
      
      if (existing.length > 0) {
        // Atualizar contrato existente
        await db.update(contracts)
          .set({
            content: input.content,
            templateName: input.templateName || null,
            serviceName: input.serviceName || null,
            price: input.price || null,
          })
          .where(eq(contracts.id, existing[0].id));
        return { success: true, id: existing[0].id, updated: true };
      }
      
      // Criar novo contrato
      const result = await db.insert(contracts).values({
        tenantId,
        appointmentId: input.appointmentId,
        templateId: input.templateId,
        clientName: input.clientName,
        clientEmail: input.clientEmail || null,
        content: input.content,
        templateName: input.templateName || null,
        serviceName: input.serviceName || null,
        price: input.price || null,
        status: 'draft',
      });
      
      return { success: true, id: (result as any)[0].insertId, updated: false };
    }),

  // Enviar contrato por email via Resend
  sendContractEmail: protectedProcedure
    .input(z.object({
      appointmentId: z.number(),
      templateId: z.number(),
      content: z.string(),
      clientName: z.string(),
      clientEmail: z.string(),
      templateName: z.string().optional(),
      serviceName: z.string().optional(),
      price: z.string().optional(),
      logoUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Buscar siteConfig para nome do estúdio
      const [config] = await db.select({
        siteName: siteConfig.siteName,
      }).from(siteConfig).where(eq(siteConfig.tenantId, tenantId)).limit(1);
      
      const studioName = config?.siteName || 'FlowClik';
      
      // Montar HTML do email
      const contentHtml = input.content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      
      const html = `
        <div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          ${input.logoUrl ? `<div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #ddd;"><img src="${input.logoUrl}" alt="${studioName}" style="max-height: 60px; max-width: 200px;" /></div>` : ''}
          <h2 style="color: #333; font-size: 18px; margin-bottom: 5px;">${input.templateName || 'Contrato de Serviço Fotográfico'}</h2>
          <p style="color: #666; font-size: 13px; margin-bottom: 20px;">Serviço: ${input.serviceName || ''} | Valor: R$ ${input.price || ''}</p>
          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; font-size: 13px; line-height: 1.8; color: #333; white-space: pre-wrap;">${contentHtml}</div>
          <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
            <p>Enviado por ${studioName} via FlowClik</p>
          </div>
        </div>
      `;
      
      const sent = await sendEmail({
        to: input.clientEmail,
        subject: `${input.templateName || 'Contrato'} - ${studioName}`,
        html,
        text: input.content,
      });
      
      if (sent) {
        // Salvar/atualizar contrato como enviado
        const existing = await db.select().from(contracts)
          .where(and(
            eq(contracts.appointmentId, input.appointmentId),
            eq(contracts.tenantId, tenantId)
          ))
          .limit(1);
        
        if (existing.length > 0) {
          await db.update(contracts)
            .set({ status: 'sent', sentAt: new Date().toISOString().slice(0, 19).replace('T', ' '), content: input.content })
            .where(eq(contracts.id, existing[0].id));
        } else {
          await db.insert(contracts).values({
            tenantId,
            appointmentId: input.appointmentId,
            templateId: input.templateId,
            clientName: input.clientName,
            clientEmail: input.clientEmail,
            content: input.content,
            templateName: input.templateName || null,
            serviceName: input.serviceName || null,
            price: input.price || null,
            status: 'sent',
            sentAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          });
        }
      }
      
      return { success: sent };
    }),

  // Listar contratos salvos
  getSavedContracts: protectedProcedure
    .query(async ({ ctx }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(contracts)
        .where(eq(contracts.tenantId, tenantId))
        .orderBy(desc(contracts.createdAt));
      return result;
    }),

});
