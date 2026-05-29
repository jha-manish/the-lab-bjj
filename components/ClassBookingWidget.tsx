'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { TRIAL_CLASSES, type TrialClass } from '@/lib/trial-classes'

const LEVEL_COLORS: Record<string, string> = {
  'Beginners':  'bg-green-500/20 text-green-400 border-green-500/30',
  'All Levels': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Women Only': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Ages 5–15':  'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

// ── Helpers ────────────────────────────────────────────────────────────────
const ET = 'America/Toronto'
const DAYS_PER_WEEK = 7
const PRELOAD_WEEKS = 3
const MAX_WEEK_OFFSET = 7
const DESKTOP_QUERY = '(min-width: 768px)'
const SCROLL_OFFSET_PX = 96

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

function nextNDates(n: number, offsetDays = 0): Date[] {
  const dates: Date[] = []
  const now = new Date()
  for (let i = 1 + offsetDays; i <= n + offsetDays; i++) {
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

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').slice(0, 10)
  const areaCode = digits.slice(0, 3)
  const prefix = digits.slice(3, 6)
  const lineNumber = digits.slice(6, 10)

  if (digits.length <= 3) return areaCode ? `(${areaCode}` : ''
  if (digits.length <= 6) return `(${areaCode}) ${prefix}`
  return `(${areaCode}) ${prefix}-${lineNumber}`
}

// ── Types ─────────────────────────────────────────────────────────────────
interface Slot {
  startAt: string
  appointmentSegments: { teamMemberId?: string; serviceVariationId?: string; serviceVariationVersion?: string }[]
}

type AvailabilityByKey = Record<string, Slot[]>
type Step = 'class' | 'date' | 'details' | 'confirm'

// ── Main component ─────────────────────────────────────────────────────────
export default function ClassBookingWidget() {
  const [step, setStep] = useState<Step>('class')
  const [selectedClass, setSelectedClass] = useState<TrialClass | null>(null)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [availabilityByKey, setAvailabilityByKey] = useState<AvailabilityByKey>({})
  const [weekOffset, setWeekOffset] = useState(0)
  const [loadingWeek, setLoadingWeek] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [confirmedBooking, setConfirmedBooking] = useState<{ id: string; startAt: string } | null>(null)

  const stepRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  const dates = useMemo(() => nextNDates(DAYS_PER_WEEK, weekOffset * DAYS_PER_WEEK), [weekOffset])
  const preloadDates = useMemo(() => nextNDates(DAYS_PER_WEEK * PRELOAD_WEEKS, weekOffset * DAYS_PER_WEEK), [weekOffset])
  const preloadDateKeys = useMemo(() => preloadDates.map(isoDate), [preloadDates])

  const weekLabel = `${labelDate(dates[0]).month} ${labelDate(dates[0]).day} - ${labelDate(dates[dates.length - 1]).month} ${labelDate(dates[dates.length - 1]).day}`

  // Keep a rolling 3-week window warm so advancing a week preloads the next one.
  useEffect(() => {
    const params = new URLSearchParams()
    preloadDateKeys.forEach((date) => params.append('startDate', date))

    setLoadingWeek(true)
    setSlotsError(null)

    fetch(`/api/square/availability/bulk?${params}`)
      .then(r => r.json())
      .then((data: { availability?: AvailabilityByKey; error?: string }) => {
        if (data.error) throw new Error(data.error)
        if (!data.availability) return
        setAvailabilityByKey(current => ({ ...current, ...data.availability }))
      })
      .catch((e) => {
        setSlotsError(e instanceof Error ? e.message : 'Failed to load times')
      })
      .finally(() => setLoadingWeek(false))
  }, [preloadDateKeys])

  function scrollToStep() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = stepRef.current
        if (!el) return

        const rect = el.getBoundingClientRect()
        const isDesktop = window.matchMedia(DESKTOP_QUERY).matches

        if (isDesktop && rect.top >= SCROLL_OFFSET_PX) return

        window.scrollTo({
          top: Math.max(0, window.scrollY + rect.top - SCROLL_OFFSET_PX),
          behavior: 'smooth',
        })
      })
    })
  }

  function selectClass(cls: TrialClass) {
    setSelectedClass(cls)
    setSelectedSlot(null)
    setWeekOffset(0)
    setStep('date')
    scrollToStep()
  }

  function selectSlot(slot: Slot) {
    setSelectedSlot(slot)
    setStep('details')
    scrollToStep()
  }

  function handleDetailsFieldKeyDown(event: KeyboardEvent<HTMLInputElement>, nextControl: HTMLInputElement | HTMLButtonElement | null) {
    if (event.key !== 'Enter') return

    event.preventDefault()
    nextControl?.focus()
  }

  function handleFinalDetailsFieldKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return

    event.preventDefault()
    void submitBooking()
  }

  function handleDetailsKeyboardLoop(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return

    const controls = [
      nameInputRef.current,
      emailInputRef.current,
      phoneInputRef.current,
      confirmButtonRef.current,
    ].filter((control): control is HTMLInputElement | HTMLButtonElement => Boolean(control && !control.disabled))

    if (controls.length === 0) return

    const firstControl = controls[0]
    const lastControl = controls[controls.length - 1]
    const activeElement = document.activeElement

    if (!event.shiftKey && activeElement === lastControl) {
      event.preventDefault()
      firstControl.focus()
    }

    if (event.shiftKey && activeElement === firstControl) {
      event.preventDefault()
      lastControl.focus()
    }
  }

  async function submitBooking() {
    if (!selectedClass || !selectedSlot) return
    if (!form.name || !form.email || !form.phone || submitting) return
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
  const STEPS: Step[] = ['class', 'date', 'details', 'confirm']
  const stepIdx = STEPS.indexOf(step)

  return (
    <div>
      {/* Progress */}
      {step !== 'confirm' && (
        <div className="flex items-center gap-2 mb-8">
          {(['class', 'date', 'details'] as Step[]).map((s, i) => {
            const labels = ['Class', 'Date & Time', 'Details']
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <p className="text-gray-400 text-sm">Pick a class time this week:</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekOffset(offset => Math.max(0, offset - 1))}
                  disabled={weekOffset === 0}
                  className="text-sm font-semibold text-gray-300 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-xs text-gray-500 font-semibold min-w-24 text-center">{weekLabel}</span>
                <button
                  onClick={() => setWeekOffset(offset => Math.min(MAX_WEEK_OFFSET, offset + 1))}
                  disabled={weekOffset === MAX_WEEK_OFFSET}
                  className="text-sm font-semibold text-gray-300 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>

            {slotsError && (
              <div className="mb-4 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {slotsError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-2">
              {dates.map(d => {
                const { weekday, day, month } = labelDate(d)
                const key = availabilityKey(selectedClass.variationId, isoDate(d))
                const now = new Date()
                const daySlots = (availabilityByKey[key] ?? []).filter(s => new Date(s.startAt) > now)
                const isLoading = loadingWeek && !availabilityByKey[key]
                const hasSlots = daySlots.length > 0

                return (
                  <div
                    key={isoDate(d)}
                    className={`rounded-xl border transition-colors ${
                      hasSlots
                        ? 'bg-zinc-900 border-white/10 p-2.5 lg:p-3 min-h-24 lg:min-h-32'
                        : 'bg-zinc-900/40 border-white/5 opacity-60 p-2 lg:p-3 min-h-12 lg:min-h-32'
                    }`}
                  >
                    <div className="flex lg:flex-col lg:items-center items-baseline gap-1 lg:gap-0 mb-2 lg:mb-3">
                      <span className={`text-xs font-semibold ${hasSlots ? 'text-teal-400' : 'text-gray-500'}`}>{weekday}</span>
                      <span className="text-xs lg:text-lg text-gray-300 lg:text-white font-semibold lg:font-black leading-tight">{day}</span>
                      <span className="text-gray-500 lg:text-gray-600 text-xs">{month}</span>
                    </div>

                    {isLoading && (
                      <p className="text-gray-500 text-xs text-center py-2 lg:py-4">Loading…</p>
                    )}

                    {!isLoading && !hasSlots && (
                      <p className="text-gray-600 text-xs text-center py-1 lg:py-4">No class</p>
                    )}

                    {!isLoading && hasSlots && (
                      <div className="flex flex-col gap-2">
                        {daySlots.map(slot => (
                          <button
                            key={slot.startAt}
                            onClick={() => selectSlot(slot)}
                            className="bg-teal-500/10 hover:bg-teal-500 hover:text-black border border-teal-500/30 text-teal-400 font-black text-sm px-2 py-2 rounded-lg transition-colors"
                          >
                            {formatSlotTime(slot.startAt)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step 4: Details ────────────────────────────────────────── */}
        {step === 'details' && selectedClass && selectedSlot && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep('date')} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 bg-zinc-800 hover:bg-zinc-700 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors">
                ← Back
              </button>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                  {selectedClass.name} · {formatSlotTime(selectedSlot.startAt)} · {formatSlotDay(selectedSlot.startAt)}
                </p>
                <p className="font-black text-white">Your details</p>
              </div>
            </div>

            <div onKeyDown={handleDetailsKeyboardLoop} className="bg-zinc-900 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Full name</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  autoCapitalize="words"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={e => handleDetailsFieldKeyDown(e, emailInputRef.current)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email</label>
                <input
                  ref={emailInputRef}
                  type="email"
                  autoCapitalize="none"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  onKeyDown={e => handleDetailsFieldKeyDown(e, phoneInputRef.current)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Phone</label>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(226) 555-0100"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: formatPhoneInput(e.target.value) }))}
                  onKeyDown={handleFinalDetailsFieldKeyDown}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              {submitError && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{submitError}</p>
              )}

              <button
                ref={confirmButtonRef}
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
                onClick={() => { setStep('class'); setSelectedClass(null); setSelectedSlot(null); setWeekOffset(0); setForm({ name: '', email: '', phone: '' }); setConfirmedBooking(null) }}
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
