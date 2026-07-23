import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | The Jiu-Jitsu Lab',
  description: 'Privacy policy for The Jiu-Jitsu Lab — how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicy() {
  return (
    <section className="bg-zinc-950 py-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Legal</p>
        <h1 className="text-4xl font-black mb-2">Privacy <span className="text-teal-400">Policy</span></h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: July 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <div>
            <h2 className="text-xl font-bold text-white mb-3">1. Who We Are</h2>
            <p>
              The Jiu-Jitsu Lab (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a Brazilian Jiu-Jitsu academy located at
              420 Weber St N, Waterloo, Ontario, Canada. You can reach us at{' '}
              <a href="mailto:support@labjiujitsu.com" className="text-teal-400 hover:text-teal-300 transition-colors">
                support@labjiujitsu.com
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">When you book a class, purchase a membership, or contact us, we may collect:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Payment information (processed securely by Square — we do not store card details)</li>
              <li>Booking and transaction history</li>
              <li>Website activity, device information, referral source, and advertising campaign information</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Process bookings and payments</li>
              <li>Send booking confirmations and reminders</li>
              <li>Respond to your inquiries</li>
              <li>Manage your membership</li>
              <li>Measure website usage and advertising performance</li>
              <li>Improve our website, programs, and marketing</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-3">
              We do not sell or rent your personal information. We share limited information with service providers only
              as needed to operate our website, process bookings and payments, and measure our advertising.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services to operate our business:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>
                <span className="text-white font-semibold">Square</span> — payment processing and booking management.
                Square&apos;s privacy policy is available at{' '}
                <a href="https://squareup.com/ca/en/legal/general/privacy" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 transition-colors">
                  squareup.com/ca/en/legal/general/privacy
                </a>.
              </li>
              <li>
                <span className="text-white font-semibold">Google Analytics</span> — website analytics and campaign measurement.
                Google&apos;s privacy policy is available at{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 transition-colors">
                  policies.google.com/privacy
                </a>.
              </li>
              <li>
                <span className="text-white font-semibold">Meta Pixel</span> — advertising measurement and audience insights
                for Facebook and Instagram. Meta&apos;s privacy policy is available at{' '}
                <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 transition-colors">
                  facebook.com/privacy/policy
                </a>.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">5. Cookies and Advertising Technologies</h2>
            <p>
              Google Analytics and Meta Pixel may use cookies or similar technologies to understand website visits and
              attribute bookings to advertising campaigns. You can limit these technologies through your browser settings
              and the advertising preferences offered by Google and Meta.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and comply with applicable laws.
              You may request deletion of your data at any time by contacting us at{' '}
              <a href="mailto:support@labjiujitsu.com" className="text-teal-400 hover:text-teal-300 transition-colors">
                support@labjiujitsu.com
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">7. Your Rights</h2>
            <p className="mb-3">
              Under Canada&apos;s Personal Information Protection and Electronic Documents Act (PIPEDA), you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Access the personal information we hold about you</li>
              <li>Request corrections to inaccurate information</li>
              <li>Withdraw consent for the use of your information (where applicable)</li>
              <li>Request deletion of your information</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:support@labjiujitsu.com" className="text-teal-400 hover:text-teal-300 transition-colors">
                support@labjiujitsu.com
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">8. Security</h2>
            <p>
              We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure.
              Payment data is handled entirely by Square and is never stored on our servers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. The latest version will always be available on this page with
              the updated date at the top.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">10. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or how we handle your data, please contact us at{' '}
              <a href="mailto:support@labjiujitsu.com" className="text-teal-400 hover:text-teal-300 transition-colors">
                support@labjiujitsu.com
              </a>{' '}or text us at{' '}
              <a href="sms:+12269893140" className="text-teal-400 hover:text-teal-300 transition-colors">
                (226) 989-3140
              </a>.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
