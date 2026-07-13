/**
 * Lightweight verification for blog Portable Text rendering.
 * Run: node scripts/test-blog-renderer.mjs
 */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isPortableTextBlock(value) {
  return value && typeof value === 'object' && value._type === 'block' && Array.isArray(value.children);
}

function renderSpan(span, markDefs) {
  if (!span || typeof span.text !== 'string') return '';
  let text = escapeHtml(span.text);
  const marks = span.marks || [];

  marks.forEach((mark) => {
    if (mark === 'strong') {
      text = `<strong>${text}</strong>`;
      return;
    }
    if (mark === 'em') {
      text = `<em>${text}</em>`;
      return;
    }
    const def = (markDefs || []).find((item) => item._key === mark);
    if (def && def._type === 'link' && def.href) {
      text = `<a href="${escapeHtml(def.href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
  });

  return text;
}

function renderBlockTag(style, innerHtml) {
  if (style === 'h2') return `<h2>${innerHtml}</h2>`;
  if (style === 'blockquote') return `<blockquote>${innerHtml}</blockquote>`;
  return `<p>${innerHtml}</p>`;
}

function renderPortableText(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return '';

  let html = '';
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];
    if (!isPortableTextBlock(block)) {
      index += 1;
      continue;
    }

    if (block.listItem) {
      const listType = block.listItem === 'number' ? 'ol' : 'ul';
      html += `<${listType}>`;
      while (index < blocks.length) {
        const listBlock = blocks[index];
        if (!isPortableTextBlock(listBlock) || listBlock.listItem !== block.listItem) break;
        const listInner = (listBlock.children || []).map((child) => renderSpan(child, listBlock.markDefs)).join('');
        html += `<li>${listInner}</li>`;
        index += 1;
      }
      html += `</${listType}>`;
      continue;
    }

    const innerHtml = (block.children || []).map((child) => renderSpan(child, block.markDefs)).join('');
    html += renderBlockTag(block.style || 'normal', innerHtml);
    index += 1;
  }

  return html;
}

const sample = [
  {
    _type: 'block',
    style: 'normal',
    children: [{ _type: 'span', text: 'Intro paragraph from CMS.', marks: [] }],
    markDefs: [],
  },
  {
    _type: 'block',
    style: 'h2',
    children: [{ _type: 'span', text: 'A useful heading', marks: [] }],
    markDefs: [],
  },
  {
    _type: 'block',
    style: 'normal',
    listItem: 'bullet',
    children: [{ _type: 'span', text: 'First list item', marks: [] }],
    markDefs: [],
  },
  {
    _type: 'block',
    style: 'normal',
    listItem: 'bullet',
    children: [{ _type: 'span', text: 'Second list item', marks: [] }],
    markDefs: [],
  },
  {
    _type: 'block',
    style: 'normal',
    children: [
      { _type: 'span', text: 'Read more at ', marks: [] },
      { _type: 'span', text: 'Sanity', marks: ['link1'] },
    ],
    markDefs: [{ _key: 'link1', _type: 'link', href: 'https://www.sanity.io' }],
  },
];

const html = renderPortableText(sample);
const checks = [
  ['intro paragraph', html.includes('Intro paragraph from CMS.')],
  ['heading', html.includes('<h2>A useful heading</h2>')],
  ['bullet list', html.includes('<ul>') && html.includes('<li>First list item</li>')],
  ['link', html.includes('href="https://www.sanity.io"') && html.includes('Sanity</a>')],
];

let failed = 0;
checks.forEach(([name, ok]) => {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    failed += 1;
  } else {
    console.log(`PASS: ${name}`);
  }
});

if (failed) {
  process.exit(1);
}

console.log('All blog renderer checks passed.');
