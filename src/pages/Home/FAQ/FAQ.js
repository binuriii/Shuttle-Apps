// Faq.js - content + accordion logic for the FAQ section
import { ref } from 'vue'

/* ---------- Copy: edit freely ---------- */
export const faqContent = {
  heading: 'Questions about\nour iPhone apps', // \n gives the two-line break (CSS: white-space: pre-line)
  intro: 'Quick answers about Shuttle Apps and how to get help.',
  contact: {
    title: 'Got questions?',
    text: "Can't find what you are looking for? Send us an email and we will get back to you.",
    label: 'Contact us',
    href: 'mailto:hello@shuttleapps.com',
  },
}

export const faqItems = [
  {
    q: 'What is Shuttle Apps?',
    a: 'Shuttle Apps is a company that builds iPhone apps to make everyday life easier. We design and build every app ourselves and publish it on the App Store.',
  },
  {
    q: 'Where can I download Shuttle apps?',
    a: 'On the App Store. Every Shuttle app is published there, and the Our apps section on this page links straight to each one.',
  },
  {
    q: 'Are Shuttle apps available on Android?',
    a: 'No. Shuttle Apps only makes apps for iPhone. Focusing on one kind of phone is what lets us get every detail right.',
  },
  {
    q: 'What makes a Shuttle app different?',
    a: 'A Shuttle app is made only for iPhone, so it looks and feels like the rest of your phone, responds instantly and stays simple. Each one takes a single everyday job off your mind.',
  },
  {
    q: 'How do I get help with a Shuttle app?',
    a: 'Email hello@shuttleapps.com with the name of the app and what happened. Someone from Shuttle Apps will get back to you.',
  },
]

/**
 * Accordion: one answer open at a time. Click the open one again to close it.
 * @param start index open at first (-1 for none)
 */
export function useFaq(start = 0) {
  const open = ref(start)
  const toggle = (i) => { open.value = open.value === i ? -1 : i }
  return { open, toggle }
}