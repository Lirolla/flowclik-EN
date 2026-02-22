import { useState } from "react";
import { Link } from "wouter";
import { Camera, ChevronRight, Search, Book, Image, Calendar, Users, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Documentation structure
const docsStructure: Record<string, { icon: any; articles: { id: string; title: string; content: string }[] }> = {
  "Getting Started": {
    icon: Home,
    articles: [
      { id: "login", title: "How to log in", content: `
# How to log in to the system

1. Go to your subdomain: **yoursite.flowclik.com**
2. Click on "Sign in" in the top menu
3. Enter your registered email and password
4. Click "Sign in"

**Forgot your password?**
- Click "Forgot my password" on the login screen
- Enter your email
- You will receive a link to reset it

**Tip:** Save your site to your favourites for quick access!
      ` },
      { id: "configure-profile", title: "Profile setup and customisation", content: `
# Profile setup and customisation

## Personalise your site

1. Go to **Settings** in the side menu
2. Upload your **logo**
3. Choose your **brand colours**
4. Set up your contact information

## Home banner

1. Go to **Banner** in the menu
2. Upload an eye-catching photo
3. Add a title and description
4. Save changes

**Tip:** Use high-quality photos to impress visitors!
      ` },
      { id: "first-booking", title: "Create your first booking", content: `
# Create your first booking

1. Go to **Bookings** in the menu
2. Click **+ New Booking**
3. Fill in the details:
   - Client (or create a new one)
   - Service
   - Date and time
   - Location
4. Click **Save**

The client will automatically receive a confirmation email!

**Tip:** Set up your services first in **Services** in the menu.
      ` },
    ],
  },
  "Galleries": {
    icon: Image,
    articles: [
      { id: "create-gallery", title: "How to create a gallery", content: `
# How to create a gallery

1. Go to **Galleries** in the side menu
2. Click **+ New Gallery**
3. Fill in:
   - Gallery name
   - Description (optional)
   - Access password (optional)
4. Click **Create**

Done! Now you can upload photos.

**Gallery types:**
- **Private:** Password protected only
- **Public:** Anyone with the link can access
      ` },
      { id: "upload-photos", title: "Bulk photo upload", content: `
# Bulk photo upload

1. Open the gallery you created
2. Click **Upload Photos**
3. Drag and drop your photos OR click to select
4. Wait for the upload (progress bar)
5. Photos appear automatically in the gallery

**Tips:**
- Supports JPG, PNG, WEBP
- Maximum 50 photos at a time
- System resizes automatically
- Optional watermark in **Settings**
      ` },
      { id: "share-gallery", title: "Share a gallery with a client", content: `
# Share a gallery with a client

1. Open the gallery
2. Click **Share**
3. Copy the generated link
4. Send it to the client (WhatsApp, email, etc.)

**With password:**
- Client needs to enter the password to access
- More security for private photos

**Without password:**
- Anyone with the link can access
- Ideal for public albums
      ` },
      { id: "enable-sales", title: "Enable sales on a gallery", content: `
# Enable sales on a gallery

1. Go to **Event Sales** in the menu
2. Find the event/gallery
3. Click **Enable Sales**
4. Set the price per photo (e.g. £25.00)
5. Copy the sales link
6. Send it to interested clients

**How it works:**
- Client views photos with watermark
- Selects the photos they want to buy
- Completes purchase by card
- Receives photos without watermark by email

**Tip:** Great for selling event photos (graduations, parties, etc.)
      ` },
    ],
  },
  "Bookings": {
    icon: Calendar,
    articles: [
      { id: "create-booking", title: "Create a new booking", content: `
# Create a new booking

1. Go to **Bookings**
2. Click **+ New Booking**
3. Select or create a client
4. Choose the service
5. Set the date, time and location
6. Add notes (optional)
7. Click **Save**

**Booking status:**
- **Pending:** Awaiting confirmation
- **Confirmed:** Client has confirmed
- **Completed:** Session carried out
- **Cancelled:** Booking cancelled
      ` },
      { id: "manage-status", title: "Manage booking status", content: `
# Manage booking status

1. Open the booking
2. Click **Change Status**
3. Choose the new status
4. Client receives an automatic notification

**Recommended workflow:**
1. Pending → Confirmed (client paid deposit)
2. Confirmed → Completed (session carried out)
3. Completed → Delivered (photos sent)
      ` },
      { id: "booking-payments", title: "Manage payments", content: `
# Manage booking payments

1. Open the booking
2. Go to the **Payment** tab
3. Click **Send Payment Link**
4. Client receives the link by email
5. Pays by card (Stripe)
6. You receive a notification

**Payment types:**
- **Deposit:** Partial amount (e.g. 50%)
- **Full:** Complete amount
- **Remaining:** After delivering photos
      ` },
    ],
  },
  "Clients": {
    icon: Users,
    articles: [
      { id: "register-client", title: "Register a new client", content: `
# Register a new client

1. Go to **Clients** in the menu
2. Click **+ New Client**
3. Fill in:
   - Full name
   - Email
   - Phone
   - Address (optional)
4. Click **Save**

**Tip:** Register clients before creating bookings to speed things up!
      ` },
      { id: "send-contract", title: "Send a digital contract", content: `
# Send a digital contract

1. Set up a contract template in **Contracts**
2. Open the client
3. Click **Send Contract**
4. Client receives it by email
5. Signs digitally
6. You receive a notification

**Benefits:**
- No printing needed
- Legally valid digital signature
- Automatic archiving
      ` },
      { id: "client-chat", title: "Chat with a client", content: `
# Chat with a client

1. Open the client or booking
2. Click **Messages**
3. Type your message
4. Client receives a notification

**Features:**
- Full conversation history
- Real-time notifications
- Attach photos and documents
      ` },
    ],
  },
  "Settings": {
    icon: Settings,
    articles: [
      { id: "configure-services", title: "Set up services and prices", content: `
# Set up services and prices

1. Go to **Services** in the menu
2. Click **+ New Service**
3. Fill in:
   - Name (e.g. "Couple Shoot")
   - Description
   - Price
   - Duration
4. Click **Save**

**Service examples:**
- Individual shoot: £300
- Couple shoot: £450
- Wedding: £2,500
- Graduation: £1,800
      ` },
      { id: "portfolio", title: "Manage portfolio", content: `
# Manage portfolio

1. Go to **Portfolio** in the menu
2. Click **+ Add Photo**
3. Upload the image
4. Add a title and description
5. Organise the order by dragging

**Tips:**
- Use your best photos
- Maximum 20 photos in the portfolio
- Update regularly
- Show a variety of work
      ` },
      { id: "custom-domain", title: "Set up your own domain", content: `
# Set up your own domain

**You have:** yoursite.flowclik.com
**You want:** www.yoursite.co.uk

## Step by step:

1. Purchase a domain (GoDaddy, Namecheap, etc.)
2. Go to **Settings** > **Subscription**
3. Enter your domain
4. Configure DNS as per the instructions
5. Wait for propagation (24-48 hours)

**DNS configuration:**
\`\`\`
Type: A
Name: @
Value: [IP provided by the system]
\`\`\`

**Questions?** Get in touch with support!
      ` },
    ],
  },
};

export default function Docs() {
  const [selectedCategory, setSelectedCategory] = useState("Getting Started");
  const [selectedArticle, setSelectedArticle] = useState(docsStructure["Getting Started"].articles[0]);
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
                Back to site
              </a>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
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
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search articles..."
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
            <p className="text-sm text-zinc-500 mb-4">Was this article helpful?</p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                👍 Yes
              </Button>
              <Button variant="outline" size="sm">
                👎 No
              </Button>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-4">Related articles</h3>
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
