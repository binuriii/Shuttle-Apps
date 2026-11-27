const u = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`

export const heroContent = {
  titleLine1: 'One less thing',
  titleLine2: 'on your mind.',
  description:
    'Shuttle Apps builds iPhone apps that make everyday life easier. Simple, fast and made with care, so you have one less thing on your mind.',
  cta: { label: 'Get Started', href: '#contact' }
}

// 5 columns, 2 images each. "offset" pushes the column down (staggered look)
export const heroColumns = [
  { offset: 0, images: [
    { src: u('photo-1791238169484-3a168bad2b97'), alt: 'Skincare cream jar', h: 'tall' },
    { src: u('photo-1793131673140-6141e362d35f'), alt: 'Woman with sunglasses', h: 'tall' }
  ]},
  { offset: 4.5, images: [
    { src: u('photo-1793226073156-579b839f098c'), alt: 'Colorful portrait', h: 'tall' },
    { src: u('photo-1789758612917-f3b1108b7c08'), alt: 'Golden portrait', h: 'tall' }
  ]},
  { offset: 7, images: [
    { src: u('photo-1792962212188-c60923f83386'), alt: 'Man portrait', h: 'tall' },
    { src: u('photo-1792264656228-a25b165990b2'), alt: 'Man in vintage shirt', h: 'tall' }
  ]},
  { offset: 4.5, images: [
    { src: u('photo-1792963762769-7b739ebf8ee4'), alt: 'Man in pink with sunglasses', h: 'tall' },
    { src: u('photo-1792815037203-bdd14b255d98'), alt: 'Outdoor drink', h: 'tall' }
  ]},
  { offset: 0, images: [
    { src: u('photo-1714163400262-159571dafbda'), alt: 'Woman on the beach', h: 'tall' },
    { src: u('photo-1680775542490-d0db42ef17a5'), alt: 'Intense portrait', h: 'tall' }
  ]}
]
