import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'

function crc32(buf) {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crcBuf])
}

function generatePNG(size) {
  const cx = size / 2, cy = size / 2
  const radius = size * 0.42

  // Draw pixel grid
  const rows = []
  for (let y = 0; y < size; y++) {
    rows.push(0) // filter: None
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < radius) {
        // Red circle — #ef4444
        rows.push(239, 68, 68, 255)
      } else {
        // White background
        rows.push(255, 255, 255, 255)
      }
    }
  }

  // Simple "I" letter in white at center
  const letterSize = Math.floor(size * 0.35)
  const lx = Math.floor(cx - letterSize * 0.08)
  const ly = Math.floor(cy - letterSize * 0.5)
  for (let iy = 0; iy < letterSize; iy++) {
    for (let ix = 0; ix < Math.floor(letterSize * 0.18); ix++) {
      const px = lx + ix
      const py = ly + iy
      if (px >= 0 && px < size && py >= 0 && py < size) {
        const rowStart = py * (size * 4 + 1) + 1 + px * 4
        rows[rowStart] = 255
        rows[rowStart + 1] = 255
        rows[rowStart + 2] = 255
        rows[rowStart + 3] = 255
      }
    }
  }

  const raw = Buffer.from(rows)
  const compressed = deflateSync(raw)

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // RGBA

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))])
}

mkdirSync('public', { recursive: true })
writeFileSync('public/icon-192.png', generatePNG(192))
writeFileSync('public/icon-512.png', generatePNG(512))
writeFileSync('public/apple-touch-icon.png', generatePNG(180))
console.log('✓ Icons generated: icon-192.png, icon-512.png, apple-touch-icon.png')
