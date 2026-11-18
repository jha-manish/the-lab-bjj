// Real Google reviews of The Jiu-Jitsu Lab, quoted word for word (excerpts
// are marked with an ellipsis). Only add reviews that actually exist on
// the Google listing, and keep the reviewer's own wording — these are shown
// to visitors as genuine testimonials.

export const GOOGLE_REVIEWS_URL = 'https://www.google.com/maps/place/?q=place_id:ChIJC8GkouL0K4gRqv2ztNsE7pM'
export const GOOGLE_RATING = '4.9'

export type Review = {
  quote: string
  /** First name and last initial only. */
  name: string
  /** Who the reviewer is, e.g. "Parent" or "Member". */
  role: string
}

export const homepageReviews: Review[] = [
  {
    quote:
      "Very anxious going in as I've never done any jujutsu before and my fitness level is no where near what it used to be but I am really enjoying it :)",
    name: 'Laura M.',
    role: "Women's class member",
  },
  {
    quote:
      "I've been training here about a year. It's a great, well-maintained gym with strong instruction and friendly people. If you want to learn BJJ in the KW area, this is the place!",
    name: 'Tommy D.',
    role: 'Member',
  },
  {
    quote:
      'The coaches create such a positive and fun environment for the kids while still teaching discipline, confidence, and strong technique.',
    name: 'Angelica S.',
    role: 'Parent',
  },
  {
    quote:
      'Friendly, welcoming and clean BJJ gym! It’s been a great experience over the last 14 months. Great instructors for all skill levels.',
    name: 'Adam C.',
    role: 'Member',
  },
]

export const parentReviews: Review[] = [
  {
    quote:
      'My kid is enrolled in the kids lessons for more than a year. She really enjoys the class. The gym is always clean, welcoming, and family-friendly. The coaches create such a positive and fun environment for the kids while still teaching discipline, confidence, and strong technique.',
    name: 'Angelica S.',
    role: 'Parent',
  },
  {
    quote:
      "Great kids class, my eight year old daughter loves it. There's a good mix of kids from small weak and clueless all the way up to little warriors that are trying to conquer the world. Everyone has a great time.",
    name: 'Joe I.',
    role: 'Parent',
  },
]
