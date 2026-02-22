import { Link } from "wouter";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PoliticaDePrivacy() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-zinc-400 mb-8">Last updated: {new Date().toLocaleDateString('en-GB')}</p>

          <div className="prose prose-invert prose-purple max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Introduction</h2>
              <p className="text-zinc-300 leading-relaxed">
                FlowClik ("we", "our" or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose and protect your information when you use 
                our management platform for photographers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-purple-400 mt-6 mb-3">2.1 Information Provided by You</h3>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Registration Data:</strong> Name, email, phone number, address</li>
                <li><strong>Payment Data:</strong> Processed by Stripe (we do not store card data)</li>
                <li><strong>Content:</strong> Photos, videos and other files you upload</li>
                <li><strong>Client Data:</strong> Information about the clients you register on the platform</li>
              </ul>

              <h3 className="text-xl font-semibold text-purple-400 mt-6 mb-3">2.2 Information Collected Automatically</h3>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent</li>
                <li><strong>Technical Data:</strong> IP address, browser type, operating system</li>
                <li><strong>Cookies:</strong> We use cookies to maintain your session and improve the experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Provide, operate and maintain our platform</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send transactional emails (confirmations, notifications)</li>
                <li>Improve our services and develop new features</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal and regulatory obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Sharing of Information</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Stripe:</strong> Payment processor (subject to their privacy policy)</li>
                <li><strong>Service Providers:</strong> Hosting (Cloudflare R2), email (Resend), analytics</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed mt-4">
                <strong>We do not sell</strong> your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Storage and Security</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Your information is stored on secure cloud servers. We implement technical 
                and organisational security measures, including:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Data encryption in transit (HTTPS/TLS)</li>
                <li>Data encryption at rest</li>
                <li>Role-based access control</li>
                <li>Regular backups</li>
                <li>24/7 security monitoring</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                Despite our efforts, no system is 100% secure. You are responsible for maintaining 
                the confidentiality of your password.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Data Retention</h2>
              <p className="text-zinc-300 leading-relaxed">
                We retain your information for as long as your account is active or as necessary to provide 
                our services. After account cancellation, your data is retained for 30 days to allow 
                reactivation, and then is permanently deleted. We may retain certain information for longer periods 
                when required by law or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Your Rights</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Under the UK GDPR, you have the following rights regarding your personal data:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Access:</strong> Request a copy of your data</li>
                <li><strong>Rectification:</strong> Update incorrect information</li>
                <li><strong>Erasure:</strong> Request deletion of your data</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Objection:</strong> Object to the processing of your data</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing at any time</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                To exercise these rights, please contact us at support@flowclik.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Cookies and Similar Technologies</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                We use cookies and similar technologies for:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
                <li><strong>Performance Cookies:</strong> Analytics to understand how you use the platform</li>
                <li><strong>Preference Cookies:</strong> To remember your settings and preferences</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                You can control cookies through your browser settings, but this may affect 
                the functionality of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. International Transfers</h2>
              <p className="text-zinc-300 leading-relaxed">
                Your data may be transferred and processed in countries outside the UK, including the United States 
                (cloud servers). We ensure that such transfers are made with adequate protections in 
                compliance with applicable data protection laws, including the use of Standard Contractual Clauses where appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Children's Privacy</h2>
              <p className="text-zinc-300 leading-relaxed">
                Our platform is not directed at individuals under 18 years of age. We do not knowingly collect information 
                from children. If you believe we have collected data from a child, please contact us 
                immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Changes to This Policy</h2>
              <p className="text-zinc-300 leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of significant changes 
                by email or through a notice on the platform. The "Last updated" date at the top 
                indicates when this policy was last revised.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Governing Law - UK GDPR</h2>
              <p className="text-zinc-300 leading-relaxed">
                This Privacy Policy is governed by the UK General Data Protection Regulation (UK GDPR) 
                and the Data Protection Act 2018, along with other applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">13. Contact</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                For questions about this Privacy Policy or to exercise your rights, please contact us:
              </p>
              <p className="text-purple-400">
                Email: support@flowclik.com<br />
                Data Protection Officer (DPO): dpo@flowclik.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
