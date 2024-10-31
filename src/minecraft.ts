import * as net from "net";
import * as varint from "varint";

const SEGMENT_BITS = 0x7f;
const CONTINUE_BIT = 0x80;

const createPacket = (buff: number[]) => {
  // Pascket starts with a varint
  return new Uint8Array([...varint.encode(buff.length), ...buff]);
};

export type MinecraftStatus = {
  version: { name: string; protocol: number };
  enforcesSecureChat: boolean;
  description: string;
  players: { max: number; online: number };
};

// enter valid host ip
export const ping = (host: string, port = 25565): Promise<MinecraftStatus> =>
  new Promise((resolve, reject) => {
    let returned = false;
    const conn = { host, port };
    const client = net.createConnection(conn, () => {
      // 'connect' listener.
      console.log("connected to minecraft server!");

      // "mc.burningbroccoli.se" as Uint8Array bytes using kaluma TextEncoder.encode
      const te = new TextEncoder();
      const adress = te.encode(host);

      // Port is unsigned short, i.e. 16 bit
      const p16 = new Uint16Array([port]);
      const portBytes = new Uint8Array(p16.buffer);

      const buf = [
        // Packet ID
        0x00,
        // -1 varInt
        0xff,
        0xff,
        0xff,
        0xff,
        0x0f,
        // Adress length
        ...varint.encode(adress.length),
        ...adress,
        // Port 16 bit short, 2 bytes
        portBytes[0],
        portBytes[0],
        0x01, // Status request, i.e 1
      ];

      // Handshake
      client.write(createPacket(buf));

      // The follow up with status ping
      client.write(createPacket([0x00]));
    });

    client.on("data", (data) => {
      const arr = Array.from(data);

      // First is packet length
      console.log(varint.decode(arr));
      let offset = varint.decode.bytes || 0;
      console.log("bytes decoded", offset);

      // Skip packet byte
      offset++;

      // Read JSON string length
      console.log(varint.decode(arr, offset));
      offset += varint.decode.bytes || 0;

      // Now we should have only the json string left
      const td = new TextDecoder();
      const decoded = td.decode(new Uint8Array(arr.slice(offset)));
      console.log("decoded", decoded);
      if (!returned) {
        returned = true;
        resolve(JSON.parse(decoded));
      }
      client.end();
    });
    client.on("end", () => {
      if (!returned) {
        returned = true;
        reject();
      }
      console.log("disconnected from server");
    });
    client.on("error", (err) => {
      console.error(err);
      if (!returned) {
        returned = true;
        reject(err);
      }
    });
  });
