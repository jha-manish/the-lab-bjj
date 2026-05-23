import { SquareClient, SquareEnvironment } from 'square'

export const square = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment:
    process.env.NEXT_PUBLIC_SQUARE_ENV === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
})

export const LOCATION_ID = process.env.SQUARE_LOCATION_ID!

export function bigintReplacer(_key: string, value: unknown) {
  return typeof value === 'bigint' ? value.toString() : value
}
