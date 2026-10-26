import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height) {
  // RGBA buffer
  const stride = width * 4;
  const rawData = Buffer.alloc((stride + 1) * height);

  // Colors: primary blue #2563eb, accent #38bdf8, white #ffffff
  const bgR = 0x25, bgG = 0x63, bgB = 0xeb;
  const whiteR = 0xff, whiteG = 0xff, whiteB = 0xff;
  const cyanR = 0x38, cyanG = 0xbd, cyanB = 0xf8;

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.44;
  const rPin = width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (stride + 1);
    rawData[rowOffset] = 0; // Filter type None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = bgR, g = bgG, b = bgB, a = 255;

      // Pin center & circle
      const pinCenterY = cy - height * 0.08;
      const distPin = Math.sqrt(dx * dx + (y - pinCenterY) * (y - pinCenterY));

      // Draw pin head
      if (distPin < rPin) {
        // inner cyan circle
        if (distPin < rPin * 0.55) {
          r = cyanR; g = cyanG; b = cyanB;
        } else {
          r = whiteR; g = whiteG; b = whiteB;
        }
      } else if (y >= pinCenterY && y <= pinCenterY + rPin * 1.5 && Math.abs(dx) <= (1 - (y - pinCenterY) / (rPin * 1.5)) * rPin) {
        // pin triangle tip
        r = whiteR; g = whiteG; b = whiteB;
      } else if (dist < rOuter && dist > rOuter - 6) {
        // subtle outer ring
        r = whiteR; g = whiteG; b = whiteB;
        a = 120;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG chunks
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc >>> 0, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512));
fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180));
fs.writeFileSync('public/favicon.ico', createPNG(64, 64));
console.log('Successfully generated all PWA icons!');
