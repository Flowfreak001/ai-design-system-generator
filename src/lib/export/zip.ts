// Minimal ZIP writer (STORE method, no compression, no dependencies).
// Produces a spec-compliant archive good enough for text/markdown packages.

type Entry = { name: string; data: Uint8Array };

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(v: number): number[] {
  return [v & 0xff, (v >>> 8) & 0xff];
}
function u32(v: number): number[] {
  return [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
}

/** Build a ZIP (store-only) from named text/binary entries. */
export function buildZip(files: { name: string; content: string | Uint8Array }[]): Uint8Array {
  const enc = new TextEncoder();
  const entries: Entry[] = files.map((f) => ({
    name: f.name,
    data: typeof f.content === "string" ? enc.encode(f.content) : f.content,
  }));

  const chunks: number[] = [];
  const central: number[] = [];
  let offset = 0;

  for (const e of entries) {
    const nameBytes = enc.encode(e.name);
    const crc = crc32(e.data);
    const size = e.data.length;

    // Local file header
    const local = [
      ...u32(0x04034b50),
      ...u16(20), // version needed
      ...u16(0x0800), // flags: UTF-8 names
      ...u16(0), // method: store
      ...u16(0), // mod time
      ...u16(0), // mod date
      ...u32(crc),
      ...u32(size),
      ...u32(size),
      ...u16(nameBytes.length),
      ...u16(0), // extra length
    ];
    chunks.push(...local, ...nameBytes, ...e.data);

    // Central directory record
    central.push(
      ...u32(0x02014b50),
      ...u16(20), // version made by
      ...u16(20),
      ...u16(0x0800),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(size),
      ...u32(size),
      ...u16(nameBytes.length),
      ...u16(0),
      ...u16(0), // comment
      ...u16(0), // disk start
      ...u16(0), // internal attrs
      ...u32(0), // external attrs
      ...u32(offset),
      ...nameBytes,
    );

    offset += local.length + nameBytes.length + size;
  }

  const centralOffset = offset;
  const centralSize = central.length;
  const eocd = [
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(entries.length),
    ...u16(entries.length),
    ...u32(centralSize),
    ...u32(centralOffset),
    ...u16(0),
  ];

  return Uint8Array.from([...chunks, ...central, ...eocd]);
}
