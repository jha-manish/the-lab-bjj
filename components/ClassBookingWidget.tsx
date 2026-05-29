'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { TRIAL_CLASSES, type TrialClass } from '@/lib/trial-classes'

const LEVEL_COLORS: Record<string, string> = {
  'Beginners':  'bg-green-500/20 text-green-400 border-green-500/30',
  'All Levels': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Women Only': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Ages 5–15':  'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

// ── Helpers ────────────────────────────────────────────────────────────────
const ET = 'America/Toronto'

function formatSlotTime(isoUtc: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ET,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(isoUtc))
}

function formatSlotDay(isoUtc: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ET,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(isoUtc))
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function availabilityKey(serviceVariationId: string, startDate: string) {
  return `${serviceVariationId}:${startDate}`
}

function nextNDates(n: number): Date[] {
  const dates: Date[] = []
  const now = new Date()
  for (let i = 1; i <= n; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    dates.push(d)
  }
  return dates
}

function labelDate(d: Date) {
  const weekday = d.toLocaleDateString('en-CA', { weekday: 'short' })
  const day = d.getDate()
  const month = d.toLocaleDateString('en-CA', { month: 'short' })
  return { weekday, day, month }
}

// ── Types ─────────────────────────────────────────────────────────────────
interface Slot {
  startAt: string
  appointmentSegments: { teamMemberId?: string; serviceVariationId?: string; serviceVariationVersion?: string }[]
}

type AvailabilityByKey = Record<string, Slot[]>
type Step = 'class' | 'date' | 'time' | 'details' | 'confirm'

// ── Main component ─────────────────────────────────────────────────────────
export default function ClassBookingWidget() {
  const [step, setStep] = useState<Step>('class')
  const [selectedClass, setSelectedClass] = useState<TrialClass | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [availabilityByKey, setAvailabilityByKey] = useState<AvailabilityByKey>({})
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [confirmedBooking, setConfirmedBooking] = useState<{ id: string; startAt: string } | null>(null)

  const stepRef = useRef<HTMLDivElement>(null)

  const dates = useMemo(() => nextNDates(21), [])
  const dateKeys = useMemo(() => dates.map(isoDate), [dates])

  // Warm every class/date pair so later steps can read from browser memory.
  useEffect(() => {
    const params = new URLSearchParams()
    dateKeys.forEach((date) => params.append('startDate', date))

    fetch(`/api/square/availability/bulk?${params}`)
      .then(r => r.json())
      .then((data: { availability?: AvailabilityByKey }) => {
        if (!data.availability) return
        setAvailabilityByKey(current => ({ ...current, ...data.availability }))
      })
      .catch(() => {
        // The per-date fetch below still works if the warmup request fails.
      })
  }, [dateKeys])

  // Fetch slots when date is selected
  useEffect(() => {
    if (!selectedClass || !selectedDate) return
    setSlotsLoading(true)
    setSlotsError(null)
    setSlots([])
    setSelectedSlot(null)

    const dateKey = isoDate(selectedDate)
    const key = availabilityKey(selectedClass.variationId, dateKey)
    const cachedSlots = availabilityByKey[key]
    const now = new Date()

    if (cachedSlots) {
      setSlots(cachedSlots.filter(s => new Date(s.startAt) > now))
      setSlotsLoading(false)
      return
    }

    const params = new URLSearchParams({
      serviceVariationId: selectedClass.variationId,
      serviceVariationVersion: selectedClass.variationVersion,
      startDate: dateKey,
    })

    const controller = new AbortController()

    fetch(`/api/square/availability?${params}`, { signal: controller.signal })
      .then(r => r.json())
      .then((data: { availabilities?: Slot[]; error?: string }) => {
        if (data.error) throw new Error(data.error)
        const availabilities = data.availabilities ?? []
        const future = availabilities.filter(s => new Date(s.startAt) > now)
        setAvailabilityByKey(current => ({ ...current, [key]: availabilities }))
        setSlots(future)
      })
      .catch(e => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setSlotsError(e.message ?? 'Failed to load times')
      })
      .finally(() => setSlotsLoading(false))

    return () => controller.abort()
  }, [selectedClass, selectedDate, availabilityByKey])

  function scrollToStep() {
    setTimeout(() => stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function selectClass(cls: TrialClass) {
    setSelectedClass(cls)
    setSelectedDate(null)
    setSlots([])
    setSelectedSlot(null)
    setStep('date')
    scrollToStep()
  }

  function selectDate(d: Date) {
    setSelectedDate(d)
    setSelectedSlot(null)
    setStep('time')
    scrollToStep()
  }

  function selectSlot(slot: Slot) {
    setSelectedSlot(slot)
    setStep('details')
    scrollToStep()
  }

  async function submitBooking() {
    if (!selectedClass || !selectedSlot) return
    setSubmitting(true)
    setSubmitError(null)
    const seg = selectedSlot.appointmentSegments[0]

    try {
      const res = await fetch('/api/square/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceVariationId: selectedClass.variationId,
          serviceVariationVersion: selectedClass.variationVersion,
          teamMemberId: seg?.teamMemberId ?? '',
          startAt: selectedSlot.startAt,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
        }),
      })
      const data = (await res.json()) as { booking?: { id: string; startAt?: string }; error?: string }
      if (!res.ok || data.error) throw new Error(data.error ?? 'Booking failed')
      setConfirmedBooking({ id: data.booking!.id, startAt: selectedSlot.startAt })
      setStep('confirm')
      scrollToStep()
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Progress bar ──────────────────────────────────────────────────────
  const STEPS: Step[] = ['class', 'date', 'time', 'details', 'confirm']
  const stepIdx = STEPS.indexOf(step)

  return (
    <div>
      {/* Progress */}
      {step !== 'confirm' && (
        <div className="flex items-center gap-2 mb-8">
          {(['class', 'date', 'time', 'details'] as Step[]).map((s, i) => {
            const labels = ['Class', 'Date', 'Time', 'Details']
            const done = STEPS.indexOf(s) < stepIdx
            const active = s === step
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className={`h-px w-6 sm:w-10 ${done ? 'bg-teal-500' : 'bg-white/20'}`} />}
                <div className={`flex items-center gap-1.5 text-sm font-semibold ${active ? 'text-white' : done ? 'text-teal-400' : 'text-gray-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${active ? 'bg-teal-500 text-black' : done ? 'bg-teal-500/20 text-teal-400' : 'bg-white/10 text-gray-500'}`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <span className="hidden sm:inline">{labels[i]}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div ref={stepRef} className="scroll-mt-24">

        {/* ── Step 1: Select Class ───────────────────────────────────── */}
        {step === 'class' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TRIAL_CLASSES.map(cls => (
              <button
                key={cls.itemId}
                onClick={() => selectClass(cls)}
                className="text-left bg-zinc-900 border border-white/10 hover:border-teal-500/50 rounded-xl p-6 flex flex-col gap-3 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-black text-lg text-white">{cls.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded border font-semibold whitespace-nowrap shrink-0 ${LEVEL_COLORS[cls.level]}`}>
                    {cls.level}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">{cls.desc}</p>
                {'tip' in cls && cls.tip && (
                  <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 font-semibold">
                    💡 {cls.tip}
                  </p>
                )}
                <p className="text-teal-400 text-xs font-semibold">🕐 {cls.time}</p>
                <div className="mt-1 text-center bg-teal-500/10 text-teal-400 border border-teal-500/30 font-black text-sm px-4 py-2.5 rounded">
                  Select →
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2: Select Date ────────────────────────────────────── */}
        {step === 'date' && selectedClass && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep('class')} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 bg-zinc-800 hover:bg-zinc-700 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors">
                ← Back
              </button>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Booking</p>
                <p className="font-black text-white">{selectedClass.name}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">Pick a date — next 3 weeks:</p>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {dates.map(d => {
                const { weekday, day, month } = labelDate(d)
                return (
                  <button
                    key={isoDate(d)}
                    onClick={() => selectDate(d)}
                    className="flex flex-col items-center bg-zinc-900 border border-white/10 hover:border-teal-500 rounded-xl py-3 px-1 transition-all group"
                  >
                    <span className="text-gray-500 text-xs font-semibold group-hover:text-teal-400 transition-colors">{weekday}</span>
                    <span className="text-white font-black text-lg leading-tight">{day}</span>
                    <span className="text-gray-600 text-xs">{month}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step 3: Select Time ────────────────────────────────────── */}
        {step === 'time' && selectedClass && selectedDate && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep('date')} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 bg-zinc-800 hover:bg-zinc-700 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors">
                ← Back
              </button>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                  {selectedClass.name} · {selectedDate.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <p className="font-black text-white">Pick a time</p>
              </div>
            </div>

            {slotsLoading && (
              <div className="text-center py-12 text-gray-500">Loading available times…</div>
            )}
            {slotsError && (
              <div className="text-center py-12 text-red-400 text-sm">{slotsError}</div>
            )}
            {!slotsLoading && !slotsError && slots.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No available times on that day.</p>
                <button onClick={() => setStep('date')} className="text-teal-400 hover:text-teal-300 text-sm font-semibold transition-colors">
                  Choose a different date →
                </button>
              </div>
            )}
            {!slotsLoading && slots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map(slot => (
                  <button
                    key={slot.startAt}
                    onClick={() => selectSlot(slot)}
                    className="bg-zinc-900 border border-white/10 hover:border-teal-500 rounded-xl px-4 py-3 text-center transition-all group"
                  >
                    <p className="font-black text-white text-lg group-hover:text-teal-400 transition-colors">
                      {formatSlotTime(slot.startAt)}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">{formatSlotDay(slot.startAt)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Details ────────────────────────────────────────── */}
        {step === 'details' && selectedClass && selectedSlot && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep('time')} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 bg-zinc-800 hover:bg-zinc-700 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors">
                ← Back
              </button>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                  {selectedClass.name} · {formatSlotTime(selectedSlot.startAt)} · {formatSlotDay(selectedSlot.startAt)}
                </p>
                <p className="font-black text-white">Your details</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Full name</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Phone</label>
                <input
                  type="tel"
                  placeholder="(226) 555-0100"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              {submitError && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{submitError}</p>
              )}

              <button
                onClick={submitBooking}
                disabled={submitting || !form.name || !form.email || !form.phone}
                className="mt-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black px-6 py-3 rounded-lg text-base transition-colors"
              >
                {submitting ? 'Booking…' : 'Confirm Free Trial →'}
              </button>

              <p className="text-gray-600 text-xs text-center">
                No credit card required. Your first week is free.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 5: Confirmation ───────────────────────────────────── */}
        {step === 'confirm' && confirmedBooking && selectedClass && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-teal-400 text-3xl">✓</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">You&apos;re booked!</h2>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-sm mx-auto">
              See you on the mat for <span className="text-white font-semibold">{selectedClass.name}</span> on{' '}
              <span className="text-white font-semibold">{formatSlotDay(confirmedBooking.startAt)}</span> at{' '}
              <span className="text-white font-semibold">{formatSlotTime(confirmedBooking.startAt)}</span>.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              A confirmation has been sent to <span className="text-white">{form.email}</span>.
              Arrive 10–15 minutes early so we can show you around.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://maps.app.goo.gl/aJwg6Sc1smkmKRTz7"
                target="_blank"
                rel="noreferrer"
                className="bg-zinc-900 border border-white/10 hover:border-white text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                📍 Get directions
              </a>
              <button
                onClick={() => { setStep('class'); setSelectedClass(null); setSelectedDate(null); setSelectedSlot(null); setForm({ name: '', email: '', phone: '' }); setConfirmedBooking(null) }}
                className="text-teal-400 hover:text-teal-300 font-semibold text-sm transition-colors px-6 py-3"
              >
                Book another class
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
