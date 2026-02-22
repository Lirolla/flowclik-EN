import { useState } from "react";
import { Link } from "wouter";
import { Camera, ChevronRight, Search, Book, Image, Calendar, Users, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Estrutura de documentation
const docsStructure: Record<string, { icon: any; articles: { id: string; title: string; content: string }[] }> = {
  "Firsts Steps": {
    icon: Home,
    articles: [
      { id: "login", title: "Como fazer login", content: `
# Como fazer login no sistema

1. Acesse your subdomain: **yoursite.flowclik.com**
2. Clique em "Sign in" no menu superior
3. Digite your email e senha cadastrados
4. Clique em "Sign in"

**Esqueceu a senha?**
- Clique em "Forgot my password" na tshe de login
- Digite your email
- You will receive um link para redefinir

**Dica:** Salve your site nos favourite para acesso fast!
      ` },
      { id: "configure-profile", title: "Configure profile e customisation", content: `
# Configure profile e customisation

## Personalize your site

1. Acesse **Settings** no menu lateral
2. Make upload do your **logo**
3. Escolha as **cores da your marca**
4. Configure information de contato

## Banner da home

1. Go to **Banner** in the menu
2. Make upload de uma foto impactante
3. Adicione title e description
4. Salve as changes

**Dica:** Use fotos de alta qualidade para impressionar visitbefore!
      ` },
      { id: "first-agendamento", title: "Criar first agendamento", content: `
# Criar first agendamento

1. Acesse **Agendamentos** no menu
2. Clique em **+ New Agendamento**
3. Preencha os dados:
   - Cliente (ou crie new)
   - Service
   - Data e time
   - Local
4. Clique em **Salvar**

O cliente will receive email de confirmation automaticamente!

**Dica:** Set up your services before em **Services** no menu.
      ` },
    ],
  },
  "Galleries": {
    icon: Image,
    articles: [
      { id: "criar-galeria", title: "Como criar uma galeria", content: `
# Como criar uma galeria

1. Acesse **Gallery** no menu lateral
2. Clique em **+ New Gallery**
3. Preencha:
   - Nome da galeria
   - Description (optional)
   - Senha de acesso (optional)
4. Clique em **Criar**

Ready! Now you can fazer upload de fotos.

**Tipos de galeria:**
- **Privada:** Only com senha
- **Public:** Wedlquer pessoa com o link
      ` },
      { id: "upload-fotos", title: "Upload de fotos em massa", content: `
# Upload de fotos em massa

1. Abra a galeria criada
2. Clique em **Upload de Fotos**
3. Arraste e solte as fotos OU clique para shecionar
4. Aguarde o upload (barra de progresso)
5. Fotos aparecem automaticamente na galeria

**Dicas:**
- Suporta JPG, PNG, WEBP
- Maximum 50 fotos por vez
- Sistema redimensiona automaticamente
- Marca d'optional watermark on **Settings**
      ` },
      { id: "compartilhar-galeria", title: "Compartilhar galeria com cliente", content: `
# Compartilhar galeria com cliente

1. Abra a galeria
2. Clique em **Compartilhar**
3. Copie o link gerado
4. Envie para o cliente (WhatsApp, email, etc)

**Com senha:**
- Cliente needs digitar senha para acessar
- Mais security para fotos privadas

**Sem senha:**
- Wedlquer pessoa com link acessa
- Ideal para albums publics
      ` },
      { id: "habilitar-vendas", title: "Habilitar vendas na galeria", content: `
# Habilitar vendas na galeria

1. Acesse **Vendas de Eventos** no menu
2. Encontre o evento/galeria
3. Clique em **Ativar Vendas**
4. Defina o price por foto (ex: £ 25,00)
5. Copie o link de vendas
6. Envie para clientes interessados

**Como works:**
- Client sees photos with watermark
- Sheciona fotos que quer comprar
- Finaliza compra com card
- Recebe fotos sem watermark por email

**Dica:** Great for selling event photos (graduations, parties, etc.)
      ` },
    ],
  },
  "Appointments": {
    icon: Calendar,
    articles: [
      { id: "criar-agendamento", title: "Criar new agendamento", content: `
# Criar new agendamento

1. Acesse **Agendamentos**
2. Clique em **+ New Agendamento**
3. Select ou crie cliente
4. Escolha o service
5. Defina data, time e local
6. Adicione notes (optional)
7. Clique em **Salvar**

**Status do agendamento:**
- **Pending:** Awaiting confirmation
- **Confirmado:** Cliente confirmou
- **Completed:** Ensaio realizado
- **Cancelled:** Agendamento cancelled
      ` },
      { id: "manage-status", title: "Manage status de agendamentos", content: `
# Manage status de agendamentos

1. Abra o agendamento
2. Clique em **Mudar Status**
3. Escolha o new status
4. Cliente recebe notification automatic

**Fluxo recomendado:**
1. Pending → Confirmado (cliente pagou sinal)
2. Confirmado → Completed (ensaio realizado)
3. Completed → Delivered (fotos enviadas)
      ` },
      { id: "pagamentos-agendamento", title: "Manage pagamentos", content: `
# Manage pagamentos de agendamentos

1. Abra o agendamento
2. Go to the **Payment** tab
3. Clique em **Enviar Link de Pagamento**
4. Cliente recebe link por email
5. Paga com card (Stripe)
6. You recebe notification

**Tipos de pagamento:**
- **Sinal:** Parte do valor (ex: 50%)
- **Total:** Valor complete
- **Restante:** After entregar fotos
      ` },
    ],
  },
  "Clients": {
    icon: Users,
    articles: [
      { id: "cadastrar-cliente", title: "Cadastrar new cliente", content: `
# Cadastrar new cliente

1. Acesse **Clientes** no menu
2. Clique em **+ New Cliente**
3. Preencha:
   - Nome complete
   - Email
   - Telefone
   - Address (optional)
4. Clique em **Salvar**

**Dica:** Cadastre clientes before de criar agendamentos para agilizar!
      ` },
      { id: "enviar-contrato", title: "Enviar contrato digital", content: `
# Enviar contrato digital

1. Configure modelo de contrato em **Contratos**
2. Abra o cliente
3. Clique em **Enviar Contrato**
4. Cliente recebe por email
5. Assina digitalmente
6. You recebe notification

**Vantagens:**
- Sem impresare
- Assinatura digital valid
- Arquivamento automatic
      ` },
      { id: "chat-cliente", title: "Chat com cliente", content: `
# Chat com cliente

1. Abra o cliente ou agendamento
2. Clique em **Messages**
3. Digite your message
4. Cliente recebe notification

**Recursos:**
- History complete de conversas
- Notifications em tempo real
- Anexar fotos e documentos
      ` },
    ],
  },
  "Settings": {
    icon: Settings,
    articles: [
      { id: "configure-servicos", title: "Configure services e prices", content: `
# Configure services e prices

1. Acesse **Services** no menu
2. Clique em **+ New Service**
3. Preencha:
   - Nome (ex: "Ensaio Casal")
   - Description
   - Price
   - Duration
4. Clique em **Salvar**

**Examples de services:**
- Ensaio individual: £ 300
- Ensaio casal: £ 450
- Casamento: £ 2.500
- Graduation: £ 1.800
      ` },
      { id: "portfolio", title: "Manage portfolio", content: `
# Manage portfolio

1. Acesse **Portfolio** no menu
2. Clique em **+ Add Foto**
3. Make upload da imagem
4. Adicione title e description
5. Organize a ordem arrastando

**Dicas:**
- Use yours betteres fotos
- Maximum 20 fotos no portfolio
- Currentize regularmente
- Mostre variedade de trabalhos
      ` },
      { id: "dominio-proprio", title: "Configure domain own", content: `
# Configure domain own

**You tem:** yoursite.flowclik.com
**Whatr ter:** www.yoursite.com.br

## Step by step:

1. Compre um domain (Record.br, GoDaddy, etc)
2. Acesse **Settings** > **Subscription**
3. Digite your domain
4. Configure DNS conforme instructions
5. Aguarde propagation (24-48h)

**Configuration DNS:**
\`\`\`
Tipo: A
Nome: @
Valor: [IP fornecido pelo sistema]
\`\`\`

**Questions?** Get in touch com suporte!
      ` },
    ],
  },
};

export default function Docs() {
  const [selectedCategory, setSelectedCategory] = useState("Firsts Steps");
  const [selectedArticle, setSelectedArticle] = useState(docsStructure["Firsts Steps"].articles[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const categories = Object.keys(docsStructure);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/venda">
            <a className="flex items-center gap-2">
              <Camera className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                FlowClik
              </span>
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <a className="text-zinc-400 hover:text-white transition text-sm">
                Voltar ao site
              </a>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-80 border-r border-zinc-800 bg-zinc-950/30 min-h-[calc(100vh-73px)] sticky top-[73px] ${sidebarOpen ? "" : "hidden"}`}>
          <div className="p-6">
            {/* Search */}
            <div className="rshetive mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <nav className="space-y-6">
              {categories.map((category) => {
                const CategoryIcon = docsStructure[category].icon;
                const articles = docsStructure[category].articles;

                return (
                  <div key={category}>
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className={`flex items-center gap-2 w-full text-left font-semibold mb-3 transition ${
                        selectedCategory === category
                          ? "text-purple-400"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <CategoryIcon className="w-5 h-5" />
                      {category}
                    </button>
                    
                    <ul className="space-y-2 ml-7">
                      {articles.map((article) => (
                        <li key={article.id}>
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setSelectedArticle(article);
                            }}
                            className={`text-sm w-full text-left transition ${
                              selectedArticle.id === article.id
                                ? "text-purple-400 font-medium"
                                : "text-zinc-500 hover:text-white"
                            }`}
                          >
                            {article.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8 max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
            <Link href="/docs">
              <a className="hover:text-white transition">Documentation</a>
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>{selectedCategory}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{selectedArticle.title}</span>
          </div>

          {/* Article */}
          <article className="prose prose-invert prose-purple max-w-none">
            <div
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: selectedArticle.content
                  .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-bold mb-6">$1</h1>')
                  .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
                  .replace(/^\*\*(.+?)\*\*/gm, '<strong class="text-purple-400">$1</strong>')
                  .replace(/^- (.+)$/gm, '<li class="ml-6 mb-2">$1</li>')
                  .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 mb-2 list-decimal">$1</li>')
                  .replace(/`([^`]+)`/g, '<code class="bg-zinc-800 px-2 py-1 rounded text-sm">$1</code>')
                  .replace(/```([\s\S]+?)```/g, '<pre class="bg-zinc-900 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>'),
              }}
            />
          </article>

          {/* Feedback */}
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500 mb-4">Este artigo foi useful?</p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                👍 Sim
              </Button>
              <Button variant="outline" size="sm">
                👎 Not
              </Button>
            </div>
          </div>

          {/* Rsheted Articles */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-4">Artigos rshecionados</h3>
            <div className="grid gap-4">
              {docsStructure[selectedCategory].articles
                .filter((a) => a.id !== selectedArticle.id)
                .slice(0, 3)
                .map((article) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-purple-500/50 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Book className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <span className="text-sm font-medium">{article.title}</span>
                      <ChevronRight className="w-4 h-4 text-zinc-600 ml-auto" />
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
