import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | The Jiu-Jitsu Lab',
  description: 'Terms of service for The Jiu-Jitsu Lab — rules, liability, memberships, and your agreement with us.',
}

export default function TermsOfService() {
  return (
    <section className="bg-zinc-950 py-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Legal</p>
        <h1 className="text-4xl font-black mb-2">Terms of <span className="text-teal-400">Service</span></h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: May 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <div>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing this website, booking a class, or purchasing a membership at The Jiu-Jitsu Lab
              (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service.
              If you do not agree, please do not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">2. Memberships & Payments</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>All membership fees are billed in Canadian dollars (CAD).</li>
              <li>Monthly memberships renew automatically unless cancelled before the next billing date.</li>
              <li>Commitment plan payments (3-month, 6-month, 12-month) are charged upfront and are non-refundable after the first 7 days.</li>
              <li>Drop-in fees are non-refundable once a class has been attended.</li>
              <li>We reserve the right to update pricing with 30 days written notice.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">3. Cancellations & Refunds</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Monthly memberships may be cancelled at any time. Cancellation takes effect at the end of the current billing period.</li>
              <li>Class bookings may be cancelled up to 24 hours in advance for a full credit.</li>
              <li>No-shows and late cancellations (under 24 hours) are non-refundable.</li>
              <li>Refund requests for exceptional circumstances should be directed to{' '}
                <a href="mailto:support@labjiujitsu.com" className="text-teal-400 hover:text-teal-300 transition-colors">
                  support@labjiujitsu.com
                </a>.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">4. Assumption of Risk & Liability Waiver</h2>
            <p className="mb-3">
              Brazilian Jiu-Jitsu is a contact sport that carries inherent risks including, but not limited to,
              bruising, sprains, fractures, and other injuries. By participating in any class or activity at
              The Jiu-Jitsu Lab, you acknowledge and accept these risks.
            </p>
            <p>
              To the fullest extent permitted by law, The Jiu-Jitsu Lab, its coaches, staff, and affiliates
              shall not be liable for any injury, loss, or damage arising from participation in our programs
              or use of our facilities.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">5. Code of Conduct</h2>
            <p className="mb-3">All members and visitors are expected to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Treat all training partners, coaches, and staff with respect.</li>
              <li>Maintain personal hygiene and wear clean training gear.</li>
              <li>Follow all instructions given by coaches on the mat.</li>
              <li>Tap early and respect your training partner&apos;s safety.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate membership for any member who violates this code of conduct.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">6. Health & Medical</h2>
            <p>
              By booking or attending classes, you confirm that you are in suitable physical condition to participate.
              You agree to inform a coach of any injuries or medical conditions before training.
              We are not responsible for any pre-existing medical conditions that are aggravated during training.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">7. Intellectual Property</h2>
            <p>
              All content on this website — including text, images, logos, and design — is the property of
              The Jiu-Jitsu Lab and may not be reproduced or used without written permission.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">8. Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of our services after changes are
              posted constitutes acceptance of the updated terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">9. Governing Law</h2>
            <p>
              These terms are governed by the laws of the Province of Ontario and the federal laws of Canada
              applicable therein. Any disputes shall be resolved in the courts of Ontario.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">10. Contact</h2>
            <p>
              Questions about these terms? Contact us at{' '}
              <a href="mailto:support@labjiujitsu.com" className="text-teal-400 hover:text-teal-300 transition-colors">
                support@labjiujitsu.com
              </a>.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
