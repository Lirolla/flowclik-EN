import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Camera, Search, Book, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DocsNew() {
  const [markdownContent, setMarkdownContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    // Set page title
    document.title = "FlowClik";
  }, []);

  useEffect(() => {
    // Load documentation Markdown
    fetch('/docs/documentacao-completa.md')
      .then(response => response.text())
      .then(text => setMarkdownContent(text))
      .catch(error => console.error('Error loading documentation:', error));
  }, []);

  // Extract sections from Markdown
  const sections = markdownContent.split(/^## /gm).filter(Boolean);
  const tableOfContents = sections.map(section => {
    const lines = section.split('\n');
    const title = lines[0].replace(/^#+\s*/, '').trim();
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return { id, title };
  });

  // Filter content by search
  const filteredContent = searchTerm
    ? markdownContent.split('\n').filter(line =>
        line.toLowerCase().includes(searchTerm.toLowerCase())
      ).join('\n')
    : markdownContent;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <Camera className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                FlowClik
              </span>
            </a>
          </Link>
          <Link href="/">
            <a className="text-zinc-400 hover:text-white transition text-sm">
              Back to site
            </a>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="Search documentation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Table of Contents */}
              <nav className="space-y-1">
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-400">
                  <Book className="w-4 h-4" />
                  <span>Contents</span>
                </div>
                {tableOfContents.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSection(section.id);
                      const element = document.getElementById(section.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`block px-4 py-2 rounded-lg text-sm transition ${
                      activeSection === section.id
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
                <Book className="w-4 h-4" />
                <span>Full Documentation</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-zinc-300">FlowClik</span>
              </div>

              {/* Markdown Content */}
              <div className="prose prose-invert prose-purple max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-3xl font-bold text-white mb-6 mt-8" {...props} />
                    ),
                    h2: ({ node, children, ...props }) => {
                      const text = String(children);
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return <h2 id={id} className="text-2xl font-bold text-white mt-8 mb-4" {...props}>{children}</h2>;
                    },
                    h3: ({ node, children, ...props }) => {
                      const text = String(children);
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return <h3 id={id} className="text-xl font-semibold text-purple-400 mt-6 mb-3" {...props}>{children}</h3>;
                    },
                    h4: ({ node, ...props }) => (
                      <h4 className="text-lg font-semibold text-zinc-300 mt-4 mb-2" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="text-zinc-300 leading-relaxed mb-4" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="text-white font-semibold" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc ml-6 mb-4 text-zinc-300" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal ml-6 mb-4 text-zinc-300" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-2" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 border-purple-500 pl-4 italic text-zinc-400 my-4" {...props} />
                    ),
                    code: ({ node, inline, ...props }: any) =>
                      inline ? (
                        <code className="bg-zinc-800 px-2 py-1 rounded text-purple-400 text-sm" {...props} />
                      ) : (
                        <code className="block bg-zinc-800 p-4 rounded text-purple-400 text-sm overflow-x-auto" {...props} />
                      ),
                    a: ({ node, ...props }) => (
                      <a className="text-purple-400 hover:text-purple-300 underline" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                      <hr className="border-zinc-800 my-8" {...props} />
                    ),
                  }}
                >
                  {filteredContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
