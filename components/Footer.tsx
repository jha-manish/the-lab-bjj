import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="text-xl font-black text-white mb-2">THE <span className="text-teal-400">JIU-JITSU LAB</span></p>
          <p className="text-gray-400 text-sm">Waterloo's dedicated Brazilian Jiu-Jitsu academy.</p>
          <p className="text-gray-400 text-sm mt-1">Coached by a 2013 IBJJF World Champion.</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Quick Links</p>
          <div className="flex flex-col gap-2 text-sm text-gray-400">
            <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
            <Link href="/schedule" className="hover:text-white transition-colors">Schedule</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/book" className="hover:text-white transition-colors">Book Free Trial</Link>
          </div>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Contact</p>
          <div className="flex flex-col gap-2 text-sm text-gray-400">
            <p>📍 420 Weber St N, Waterloo, ON</p>
            <a href="mailto:support@labjiujitsu.com" className="hover:text-white transition-colors">support@labjiujitsu.com</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-xs text-gray-600">
        © {new Date().getFullYear()} The Jiu-Jitsu Lab. All rights reserved.
      </div>
    </footer>
  )
}
