import { Link } from "wouter";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermosDeServico() {
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to site
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8">
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-zinc-400 mb-4">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
          <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4 mb-8">
            <p className="text-purple-300 text-sm">
              <strong className="text-purple-200">Company:</strong> TV Londres Ltd<br />
              <strong className="text-purple-200">Trading As:</strong> FlowClik<br />
              <strong className="text-purple-200">Website:</strong> flowclik.com
            </p>
          </div>

          <div className="prose prose-invert prose-purple max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-zinc-300 leading-relaxed">
                By accessing and using the FlowClik platform, you agree to comply with and be bound by the following 
                Terms of Service. If you do not agree with any part of these terms, you must not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Description of Service</h2>
              <p className="text-zinc-300 leading-relaxed">
                FlowClik is a SaaS (Software as a Service) platform that provides management tools for professional photographers, 
                including client management, bookings, photo galleries, image selection, final albums and a photo sales system.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Registration and Account</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                To use our services, you must:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorised use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Plans and Payments</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                FlowClik offers different subscription plans. Payments are processed through Stripe, our payment partner. 
                By subscribing to a plan, you agree to:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Recurring monthly or annual payments as per the chosen plan</li>
                <li>Automatic renewal until cancellation</li>
                <li>A 14-day refund policy for new subscriptions</li>
                <li>Possible price adjustments with 30 days prior notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Acceptable Use</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Use the platform for illegal or unauthorised purposes</li>
                <li>Upload offensive, defamatory content or content that violates copyright</li>
                <li>Attempt to access restricted areas of the system or other users' accounts</li>
                <li>Overload or interfere with the platform infrastructure</li>
                <li>Resell or redistribute our services without authorisation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Intellectual Property</h2>
              <p className="text-zinc-300 leading-relaxed">
                All content on the FlowClik platform (code, design, logos, text) is the property of FlowClik and 
                protected by copyright laws. Photos and content uploaded by photographers remain 
                the property of the respective photographers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Storage and Backup</h2>
              <p className="text-zinc-300 leading-relaxed">
                We provide cloud storage as per the photographer's plan. Although we perform regular backups, 
                we recommend that you maintain your own backup copies of important files. We are not responsible 
                for data loss due to technical failures, accidental deletion or account cancellation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Cancellation and Termination</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                You may cancel your subscription at any time through the settings panel. Upon cancellation:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>You will have access to the services until the end of the paid period</li>
                <li>Your data will be retained for 30 days after cancellation</li>
                <li>After 30 days, your data will be permanently deleted</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Limitation of Liability</h2>
              <p className="text-zinc-300 leading-relaxed">
                FlowClik is provided "as is" without warranties of any kind. We are not liable for any 
                indirect, incidental or consequential damages resulting from the use or inability to use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Modifications to Terms</h2>
              <p className="text-zinc-300 leading-relaxed">
                We may modify these Terms of Service at any time. We will notify you of significant changes 
                by email or through the platform. Continued use after changes constitutes 
                acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Governing Law</h2>
              <p className="text-zinc-300 leading-relaxed">
                These Terms of Service are governed by the laws of England and Wales. Any disputes shall be resolved in 
                the competent courts of England and Wales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Contact</h2>
              <p className="text-zinc-300 leading-relaxed">
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-purple-400 mt-2">
                Email: support@flowclik.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
