import { Link } from "wouter";
import { Camera, Heart, Code, Users, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutNos() {
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
            <Button variant="outline" size="sm">
              Back to site
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-950/30 border border-purple-800/30 rounded-full px-4 py-2 mb-6">
            <Heart className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Made by photographers, for photographers</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Our Story
          </h1>
          <p className="text-xl text-zinc-300 leading-relaxed">
            FlowClik was born from the real needs of a professional photographer who faced the same challenges as you.
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 md:p-12 mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">The Pain That Inspired the Solution</h2>
                <p className="text-zinc-400 text-sm">Behind every great product, there is a real story</p>
              </div>
            </div>

            <div className="prose prose-invert prose-purple max-w-none space-y-6">
              <p className="text-zinc-300 leading-relaxed text-lg">
                I have been a professional photographer for over <strong className="text-purple-400">30 years</strong>. Throughout this journey, 
                I experienced first-hand the challenges every photographer faces: managing clients, organising bookings, delivering galleries, 
                tracking photo selections, creating final albums and, of course, getting paid for the work.
              </p>

              <p className="text-zinc-300 leading-relaxed text-lg">
                For years, I tried using different tools: Excel spreadsheets, Google Drive, WhatsApp, expensive and complicated systems 
                that promised to solve everything but failed at the basics. <strong className="text-purple-400">Nothing truly worked.</strong>
              </p>

              <p className="text-zinc-300 leading-relaxed text-lg">
                The frustration was constant. Losing precious time with administrative tasks when I should have been photographing. 
                Clients complained about confusing processes. Galleries got lost. Payments were delayed. I knew there had to be 
                a better way.
              </p>

              <div className="bg-purple-950/30 border-l-4 border-purple-500 p-6 rounded-r-lg my-8">
                <p className="text-purple-200 italic text-lg leading-relaxed">
                  "If no tool solves the real problems of a professional photographer, then I will build one myself."
                </p>
              </div>

              <p className="text-zinc-300 leading-relaxed text-lg">
                And that is how <strong className="text-purple-400">FlowClik</strong> was born. Not as yet another "generic management software", 
                but as the platform I always wished I had. Every feature was designed from a real pain point that I experienced or saw 
                fellow photographers struggle with.
              </p>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-950/50 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real Empathy</h3>
              <p className="text-zinc-400 leading-relaxed">
                We understand your pain points because we have been through them ourselves. Every feature solves a real problem photographers face.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-950/50 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Simplicity</h3>
              <p className="text-zinc-400 leading-relaxed">
                Technology should make things easier, not more complicated. FlowClik is intuitive because it was built by the people who use it, not by distant developers.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-950/50 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Community</h3>
              <p className="text-zinc-400 leading-relaxed">
                We are not just software. We are a community of photographers helping photographers grow together.
              </p>
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-gradient-to-br from-purple-950/30 to-pink-950/30 border border-purple-800/30 rounded-2xl p-8 md:p-12 mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Our Mission</h2>
                <p className="text-purple-300 text-sm">What drives us every single day</p>
              </div>
            </div>

            <p className="text-purple-100 leading-relaxed text-lg mb-6">
              We want professional photographers to spend <strong>less time on admin</strong> and <strong>more time doing what they love</strong>: 
              photographing, creating and delivering unforgettable moments for their clients.
            </p>

            <p className="text-purple-100 leading-relaxed text-lg">
              FlowClik is not just a system. It is the tool that frees you from tedious tasks so you can focus on what truly matters: 
              your art, your clients and your professional growth.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
                30+
              </div>
              <p className="text-zinc-400">Years of experience in professional photography</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <p className="text-zinc-400">Built by photographers who understand your challenges</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
                ∞
              </div>
              <p className="text-zinc-400">Commitment to your professional growth</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 md:p-12 text-center">
            <Award className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Join Us
            </h2>
            <p className="text-zinc-300 leading-relaxed text-lg mb-8 max-w-2xl mx-auto">
              Try FlowClik free for 7 days and discover what it is like to have a system that truly understands 
              the work of a professional photographer.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
