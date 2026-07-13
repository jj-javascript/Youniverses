/**
 * Seed sample blog posts into Sanity.
 * Requires a write token: SANITY_WRITE_TOKEN (create at sanity.io/manage → API → Tokens).
 *
 * Usage:
 *   cd studio
 *   SANITY_WRITE_TOKEN=sk... npm run seed
 */

import {readFile} from 'fs/promises'
import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PROJECT_ID = 'janrh8g1'
const DATASET = 'production01'
const API_VERSION = '2024-01-01'

const token = process.env.SANITY_WRITE_TOKEN

if (!token) {
  console.error('Missing SANITY_WRITE_TOKEN. Create a token with Editor permissions at sanity.io/manage.')
  process.exit(1)
}

function block(text, style = 'normal') {
  return {
    _type: 'block',
    _key: crypto.randomUUID().slice(0, 12),
    style,
    children: [{_type: 'span', _key: crypto.randomUUID().slice(0, 12), text, marks: []}],
    markDefs: [],
  }
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function uploadImage(filePath, filename) {
  const absolutePath = resolve(__dirname, filePath)
  const imageBuffer = await readFile(absolutePath)

  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/assets/images/${DATASET}?filename=${encodeURIComponent(filename)}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/webp',
      Authorization: `Bearer ${token}`,
    },
    body: imageBuffer,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Image upload failed (${filename}): ${response.status} ${text}`)
  }

  const result = await response.json()
  return result.document._id
}

const posts = [
  {
    title: 'Reading the cards when the path forks',
    imagePath: '../../img/optimized/testBlog1-480.webp',
    excerpt:
      'Tarot is not about predicting a fixed future. It is about naming the crossroads you are already standing in — and hearing what your intuition already knows.',
    publishedAt: '2026-03-12T12:00:00Z',
    readMinutes: 6,
    body: [
      block(
        'When someone sits across from me and asks, “What is going to happen?” I gently redirect. Tarot reads the terrain you are walking now — the weather, the fork in the road, the part of you that already knows which way leans true.'
      ),
      block(
        'In a session, we name what is moving. We look at what you are avoiding because it feels too honest. The cards do not sentence you to a fate; they mirror the conversation your inner guide is already trying to have.'
      ),
      block('What a spread actually offers', 'h2'),
      block(
        'A three-card spread might hold past pattern, present tension, and the quality of energy asking to be integrated. That is different from fortune-telling. It is reflection with structure — a way to make intuition legible enough to act on.'
      ),
      block('“The card does not decide for you. It helps you hear yourself decide.”', 'blockquote'),
      block(
        'If you are standing at a fork, the most useful question is rarely “Which path is correct?” It is closer to: “What do I need to honor in myself before I choose?” That is the work this blog — and these sessions — are here to support.'
      ),
    ],
  },
  {
    title: 'Your birth chart is a map, not a sentence',
    imagePath: '../../img/optimized/testBlog2-480.webp',
    excerpt:
      'The placements in your natal chart describe patterns, not prisons. Here is how I read a chart as a living conversation with who you are becoming.',
    publishedAt: '2026-02-20T12:00:00Z',
    readMinutes: 5,
    body: [
      block(
        'Your birth chart is not a verdict. It is a language for describing how energy moves through you — where you lean in, where you resist, where you are still learning to trust yourself.'
      ),
      block(
        'When I read a chart with someone, we are not hunting for a fixed identity. We are naming patterns that repeat, gifts that want expression, and tensions that ask for honest integration.'
      ),
      block(
        'A challenging placement is not punishment. It is often the part of the chart that asks the most growth — and offers the most depth when you meet it with curiosity instead of fear.'
      ),
      block(
        'The map changes meaning as you change. That is why chart work belongs in conversation, not in a single reading you file away and forget.'
      ),
    ],
  },
  {
    title: 'Three questions I ask before every session',
    imagePath: '../../img/optimized/testBlog3-480.webp',
    excerpt:
      'Before we pull a card or open a chart, we get clear on what you actually want from our time together. These three questions set the tone for honest work.',
    publishedAt: '2026-01-15T12:00:00Z',
    readMinutes: 4,
    body: [
      block('Before any session, I want to know what brought you here today — not the polished version, the real one.'),
      block(
        'Second: what would feel like a useful outcome when we are done? Clarity, validation, a next step, or simply space to be honest without performing.'
      ),
      block(
        'Third: what are you willing to look at if the cards or chart point there? This question sets the tone for work that is reflective, not performative.'
      ),
      block('These three questions do not need perfect answers. They open the door so our time together can be grounded in what you actually need.'),
    ],
  },
]

const mutations = []

for (const post of posts) {
  const documentId = `seed-post-${slugify(post.title)}`
  const filename = post.imagePath.split('/').pop()

  console.log(`Uploading image for: ${post.title}`)
  const assetId = await uploadImage(post.imagePath, filename)
  console.log(`  -> Asset: ${assetId}`)

  console.log(`Creating post: ${documentId}`)

  mutations.push({
    createOrReplace: {
      _id: documentId,
      _type: 'post',
      title: post.title,
      slug: {_type: 'slug', current: slugify(post.title)},
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      readMinutes: post.readMinutes,
      body: post.body,
      coverImage: {
        _type: 'image',
        asset: {_type: 'reference', _ref: assetId},
      },
    },
  })
}

const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({mutations}),
})

if (!response.ok) {
  const text = await response.text()
  console.error('Seed failed:', response.status, text)
  process.exit(1)
}

const result = await response.json()
console.log(`Seeded ${posts.length} blog posts into ${DATASET}.`)
console.log(JSON.stringify(result, null, 2))
