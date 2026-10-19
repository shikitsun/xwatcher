export default function encodeEntry(entry: {
  offset: number;
  duration: number;
}): ArrayBuffer {
  const json = new TextEncoder().encode(JSON.stringify(entry));
  const buffer = new ArrayBuffer(4 + json.byteLength);

  new DataView(buffer).setUint32(0, json.byteLength);
  new Uint8Array(buffer).set(json, 4);

  return buffer;
}
