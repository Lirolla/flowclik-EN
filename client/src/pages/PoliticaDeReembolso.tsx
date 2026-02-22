import { Link } from "wouter";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PoliticaDeRefund() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Refund Policy</h1>
          <p className="text-zinc-400 mb-8">Last updated: {new Date().toLocaleDateString('en-GB')}</p>

          <div className="prose prose-invert prose-purple max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Satisfaction Guarantee</h2>
              <p className="text-zinc-300 leading-relaxed">
                TV Londres Ltd, operator of the FlowClik platform, is committed to the satisfaction of our 
                clients. We offer a fair and transparent refund policy for subscriptions to our 
                SaaS management platform for photographers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Free Trial Period</h2>
              <p className="text-zinc-300 leading-relaxed">
                All new subscribers are entitled to a <strong>7-day free trial</strong>. During this 
                period, you may cancel at any time at no cost. You will not be charged if you 
                cancel before the end of the trial period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Refund Policy - 14 Days</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                We offer a full refund for new subscribers who request cancellation within 
                <strong> 14 calendar days</strong> after the first payment (after the end of the free 
                trial period).
              </p>
              <p className="text-zinc-300 leading-relaxed">
                <strong>Conditions for refund:</strong>
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Request made within 14 days after the first payment</li>
                <li>Applicable only to the first subscription (new clients)</li>
                <li>Refund processed within 10 business days</li>
                <li>Amount refunded via the same payment method used</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Renewals and Recurring Subscriptions</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                <strong>Important:</strong> The 14-day refund policy applies ONLY to the first 
                payment from new subscribers. Subsequent monthly or annual renewals <strong>are not 
                eligible for refund</strong>.
              </p>
              <p className="text-zinc-300 leading-relaxed">
                You may cancel your subscription at any time through the settings panel, and you will retain 
                access to services until the end of the already paid period. There will be no future charges after cancellation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Add-ons and Additional Services</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Purchased add-ons (such as extra storage or additional galleries) follow the same policy:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Refund available within 14 days after the first purchase of the add-on</li>
                <li>Monthly renewals of add-ons are not refundable</li>
                <li>Cancellation of add-ons can be done at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. How to Request a Refund</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                To request an eligible refund, follow the steps below:
              </p>
              <ol className="list-decimal ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Send an email to <strong className="text-purple-400">support@flowclik.com</strong></li>
                <li>Include in the subject line: "Refund Request - [Your Registration Email]"</li>
                <li>In the body of the email, provide:
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Your full name and registration email</li>
                    <li>Subscription date</li>
                    <li>Reason for cancellation (optional, but helps us improve)</li>
                  </ul>
                </li>
                <li>Await confirmation within 2 business days</li>
                <li>Refund processed within 10 business days after approval</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Exceptions and Special Cases</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                The refund policy <strong>DOES NOT apply</strong> in the following cases:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Accounts suspended for violation of the Terms of Service</li>
                <li>Abusive or fraudulent use of the platform</li>
                <li>Requests made after the 14-day period</li>
                <li>Automatic renewals (second charge onwards)</li>
                <li>Plan downgrade (switching to a lower plan)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Subscription Cancellation</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                You may cancel your subscription at any time through:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Settings Panel → Subscription → Cancel Subscription</li>
                <li>Email to support@flowclik.com requesting cancellation</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                After cancellation, you will continue to have access to the platform until the end of the already paid period. 
                Your data will be retained for 30 days in case you wish to reactivate your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Refund Processing</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Approved refunds are processed as follows:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Credit/Debit Card:</strong> 5-10 business days (depends on the issuing bank)</li>
                <li><strong>PayPal:</strong> 3-5 business days</li>
                <li><strong>Other methods:</strong> Up to 10 business days</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                The amount will be refunded via the same payment method used for the original purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Disputes and Chargebacks</h2>
              <p className="text-zinc-300 leading-relaxed">
                Before opening a dispute or chargeback with your bank or card provider, please 
                contact us first. We are committed to resolving any issue amicably. Unnotified disputes 
                may result in account suspension and inability to use the platform in the future.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Changes to This Policy</h2>
              <p className="text-zinc-300 leading-relaxed">
                We reserve the right to modify this Refund Policy at any time. Significant changes 
                will be communicated by email with at least 30 days notice. Active subscriptions 
                at the time of the change will continue to be governed by the policy in effect at the time of subscription.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Contact Information</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                For questions about this Refund Policy or to request a refund:
              </p>
              <p className="text-purple-400">
                <strong>TV Londres Ltd</strong><br />
                Email: support@flowclik.com<br />
                Website: flowclik.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
