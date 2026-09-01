import { pageMetadata } from '@/lib/seo'

// The contact page is a client component ('use client', for the form
// state), so metadata can't live in page.tsx — it has to come from this
// layout instead. Without it, /contact was inheriting the root layout's
// default canonical (the homepage), which told Google this page was a
// duplicate of "/" and kept it out of the index.
export const metadata = pageMetadata({
  title: 'Contact Us',
  description: 'Get in touch with The Jiu-Jitsu Lab in Waterloo, ON. Questions about classes, memberships, or booking a free trial.',
  path: '/contact',
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
