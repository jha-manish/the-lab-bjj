export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { squareFetch, findOrCreateCustomer } from '@/lib/square'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name: string
      email: string
      phone: string
      message: string
    }

    const { name, email, phone, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
    }

    // Find or create the customer in Square
    const customerId = await findOrCreateCustomer(email, name, phone)

    // Append the message as a note on the customer record
    if (customerId && message) {
      await squareFetch(`/customers/${customerId}`, {
        method: 'PUT',
        body: JSON.stringify({
          note: `[Contact Form] ${new Date().toLocaleDateString('en-CA')} — ${message}`,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json(
      { error: 'We could not send your message. Please try again in a moment or contact us directly.' },
      { status: 500 }
    )
  }
}
