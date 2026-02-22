// Templates default de email para serem inseridos when o photographer ativa o módulo
export const defaultEmailTemplates = [
  {
    name: "Feliz Birthday",
    subject: "🎂 Happy Birthday, {{nome}}!",
    category: "birthday" as const,
    htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Monoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
  <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 30px;text-align:center;">
    <div style="font-size:48px;margin-bottom:10px;">🎂</div>
    <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:600;">Feliz Birthday!</h1>
  </div>
  <div style="padding:30px;">
    <p style="font-size:18px;color:#333;line-height:1.6;">Hello <strong>{{nome}}</strong>,</p>
    <p style="font-size:16px;color:#555;line-height:1.6;">Hoje é um day muito especial e queremos te desejar um feliz birthday cheio de alegria, amor e moments incríveis!</p>
    <p style="font-size:16px;color:#555;line-height:1.6;">Foi uma honra registrar seus moments especiais e esperamos continuar fazendo parte da sua história. 📸</p>
    <div style="text-align:center;margin:30px 0;">
      <p style="font-size:16px;color:#764ba2;font-weight:600;">🎉 Que venham muitos mais years de felicidade! 🎉</p>
    </div>
    <p style="font-size:16px;color:#555;">Com carinho,<br><strong>{{fotografo}}</strong></p>
  </div>
  <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
    <p style="font-size:12px;color:#999;margin:0;">Shipped com ❤️ via FlowClik</p>
  </div>
</div>
</body>
</html>`,
  },
  {
    name: "Promotion Especial",
    subject: "🔥 Exclusive Offer for You, {{nome}}!",
    category: "promotion" as const,
    htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Monoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
  <div style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);padding:40px 30px;text-align:center;">
    <div style="font-size:48px;margin-bottom:10px;">📸</div>
    <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:600;">Promotion Especial!</h1>
    <p style="color:rgba(255,255,255,0.9);font-size:16px;margin-top:10px;">Exclusive para clientes especiais</p>
  </div>
  <div style="padding:30px;">
    <p style="font-size:18px;color:#333;line-height:1.6;">Hello <strong>{{nome}}</strong>,</p>
    <p style="font-size:16px;color:#555;line-height:1.6;">Preparamos uma promotion exclusive para you! Por tempo limitado, estamos oferecendo condições especiais nos nossos photography services.</p>
    <div style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
      <p style="color:#fff;font-size:24px;font-weight:700;margin:0;">Desconto Especial</p>
      <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:5px 0 0;">Get in touch para saber mais!</p>
    </div>
    <p style="font-size:16px;color:#555;line-height:1.6;">Not perca essa oportunidade! Reply to this email ou get in touch para agendar sua sesare.</p>
    <p style="font-size:16px;color:#555;">Abraços,<br><strong>{{fotografo}}</strong></p>
  </div>
  <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
    <p style="font-size:12px;color:#999;margin:0;">Shipped com ❤️ via FlowClik</p>
  </div>
</div>
</body>
</html>`,
  },
  {
    name: "Reminder de Evento",
    subject: "📅 Reminder: Your event is coming up, {{nome}}!",
    category: "reminder" as const,
    htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Monoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
  <div style="background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%);padding:40px 30px;text-align:center;">
    <div style="font-size:48px;margin-bottom:10px;">📅</div>
    <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:600;">Reminder de Evento</h1>
  </div>
  <div style="padding:30px;">
    <p style="font-size:18px;color:#333;line-height:1.6;">Hello <strong>{{nome}}</strong>,</p>
    <p style="font-size:16px;color:#555;line-height:1.6;">Este é um reminder de que seu evento is se aproximando! Estamos preparando tudo para registrar esse momento especial.</p>
    <div style="background:#f0f7ff;border-left:4px solid #4facfe;padding:15px 20px;margin:20px 0;border-radius:0 8px 8px 0;">
      <p style="font-size:16px;color:#333;margin:0;font-weight:600;">📌 Details do Evento</p>
      <p style="font-size:14px;color:#555;margin:8px 0 0;">Confira os details e get in touch caso precise de alguma change.</p>
    </div>
    <p style="font-size:16px;color:#555;line-height:1.6;">Estamos ansiosos para esse day! Wedlquer dúvida, é só respwherer este email.</p>
    <p style="font-size:16px;color:#555;">Até breve,<br><strong>{{fotografo}}</strong></p>
  </div>
  <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
    <p style="font-size:12px;color:#999;margin:0;">Shipped com ❤️ via FlowClik</p>
  </div>
</div>
</body>
</html>`,
  },
  {
    name: "Thank you pela Sesare",
    subject: "💜 Thank you for your trust, {{nome}}!",
    category: "thank_you" as const,
    htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Monoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
  <div style="background:linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%);padding:40px 30px;text-align:center;">
    <div style="font-size:48px;margin-bottom:10px;">💜</div>
    <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:600;">Thank you!</h1>
  </div>
  <div style="padding:30px;">
    <p style="font-size:18px;color:#333;line-height:1.6;">Hello <strong>{{nome}}</strong>,</p>
    <p style="font-size:16px;color:#555;line-height:1.6;">Muito thank you pela trust em nosso trabalho! Foi um prazer registrar seus moments especiais.</p>
    <p style="font-size:16px;color:#555;line-height:1.6;">Suas fotos estão sendo tratadas com muito carinho e em breve estarão disponíveis para you.</p>
    <div style="text-align:center;margin:30px 0;">
      <p style="font-size:16px;color:#a18cd1;font-weight:600;">Esperamos que tenha sido uma experiência incrível! ✨</p>
    </div>
    <p style="font-size:16px;color:#555;line-height:1.6;">Se needsr de algo, estamos à disposição. Ficaremos felizes em atendê-lo novamente!</p>
    <p style="font-size:16px;color:#555;">Com carinho,<br><strong>{{fotografo}}</strong></p>
  </div>
  <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
    <p style="font-size:12px;color:#999;margin:0;">Shipped com ❤️ via FlowClik</p>
  </div>
</div>
</body>
</html>`,
  },
  {
    name: "Boas-Vindas",
    subject: "👋 Bem-vindo(a), {{nome}}!",
    category: "welcome" as const,
    htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Monoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
  <div style="background:linear-gradient(135deg,#43e97b 0%,#38f9d7 100%);padding:40px 30px;text-align:center;">
    <div style="font-size:48px;margin-bottom:10px;">👋</div>
    <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:600;">Bem-vindo(a)!</h1>
  </div>
  <div style="padding:30px;">
    <p style="font-size:18px;color:#333;line-height:1.6;">Hello <strong>{{nome}}</strong>,</p>
    <p style="font-size:16px;color:#555;line-height:1.6;">É com muita alegria que te damos as boas-vindas! Estamos muito felizes em ter you as nosso cliente.</p>
    <p style="font-size:16px;color:#555;line-height:1.6;">Nosso compromisso é registrar seus moments mais especiais com qualidade e dedicação.</p>
    <div style="background:#f0fdf4;border-left:4px solid #43e97b;padding:15px 20px;margin:20px 0;border-radius:0 8px 8px 0;">
      <p style="font-size:16px;color:#333;margin:0;font-weight:600;">O que you can esperar:</p>
      <ul style="font-size:14px;color:#555;margin:8px 0 0;padding-left:20px;">
        <li>Atendimento custom</li>
        <li>Fotos de alta qualidade</li>
        <li>Entrega no prazo combinado</li>
        <li>Gallery online exclusive</li>
      </ul>
    </div>
    <p style="font-size:16px;color:#555;">Seja bem-vindo(a)!<br><strong>{{fotografo}}</strong></p>
  </div>
  <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
    <p style="font-size:12px;color:#999;margin:0;">Shipped com ❤️ via FlowClik</p>
  </div>
</div>
</body>
</html>`,
  },
];
