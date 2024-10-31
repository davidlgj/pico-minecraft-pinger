import { WiFi } from "wifi";
import { NeoPixel } from "neopixel";
import { Button } from "button";
import storage from "storage";
import { ping } from "./minecraft";

const PING_TIME = 5 * 60 * 1000;
const wifi = new WiFi();
const np = new NeoPixel(26, 3);
const btn = new Button(12);

let mainLoopIsGoing = false;

const connect = (ssid: string, password: string) => {
  console.log("connecting to wifi");
  return new Promise<void>((resolve, reject) =>
    wifi.connect(
      {
        ssid,
        password,
        enforce: true,
      },
      (err, info) => {
        console.log("wifi result", err, info);
        if (err) {
          console.log("wifi connect error", err);
          reject(err);
        } else {
          resolve();
        }
      },
    ),
  );
};

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

async function startup() {
  np.clear();
  np.show();
  await delay(500);
  np.setPixel(0, np.color(0, 0xaa, 0));
  np.show();
  await delay(500);
  np.setPixel(1, np.color(0xaa, 0, 0xaa));
  np.show();
  await delay(500);
  np.setPixel(2, np.color(0xaa, 0xaa, 0));
  np.show();
  await delay(1000);
  np.clear();
  np.show();
}

async function mainLoop(host: string, port: number) {
  mainLoopIsGoing = true;

  const tick = async () => {
    try {
      const data = await ping(host, port);

      np.clear();
      if (data.players.online) {
        const fraction = data.players.online / data.players.max;
        // The other has strength
        // TODO: Make it fancier
        np.setPixel(
          0,
          np.color(Math.floor(255 * fraction), 0, Math.floor(255 * fraction)),
        );
        np.setPixel(
          1,
          np.color(0, Math.floor(255 * fraction), Math.floor(255 * fraction)),
        );
        np.setPixel(2, np.color(0, 0, Math.floor(255 * fraction)));
      } else {
        console.log("No playes online :(");
      }
      np.show();
      setTimeout(tick, PING_TIME);
    } catch (err: unknown) {
      console.log("error!", err);
      mainLoopIsGoing = false;

      // Red led to show error
      np.clear();
      np.setPixel(0, np.color(0xff, 0, 0));
      np.show();

      // TODO: recover and connect again
    }
  };

  // Start it off
  await tick();
}

async function main(ssid: string, passwd: string, host: string, port: number) {
  await startup();
  try {
    np.clear();
    np.setPixel(0, np.color(0, 0, 0x44));
    np.show();

    await connect(ssid, passwd);
    np.setPixel(1, np.color(0, 0, 0x44));
    np.show();

    // My Asus router seems to do stuff so we loose connection, maybe moving connection to closer
    // mesh node. W/o this delay the server won't get connected...
    await delay(10000);

    // Start mainloop
    if (!mainLoopIsGoing) {
      await mainLoop(host, port);
    }
  } catch (err: unknown) {
    console.log("error!", err);

    // Red led to show error
    np.clear();
    np.setPixel(0, np.color(0xff, 0, 0));
    np.show();

    // Wait 5s before trying again
    setTimeout(() => main(ssid, passwd, host, port), 5000);
  }
}

const ssid = storage.getItem("ssid");
const passwd = storage.getItem("passwd");
const host = storage.getItem("host");
const port = Number.parseInt(storage.getItem("port") || "25565");

if (!ssid || !passwd) {
  console.log(
    "No wifi ssid or passwd supplier. Use storage.setItem('ssid', '<your ssid>') and storage.setItem('passwd', '<password>') to set it.",
  );
  np.clear();
  np.setPixel(0, np.color(0xff, 0, 0));
  np.setPixel(1, np.color(0x00, 0xaa, 0));
  np.show();
} else if (!host) {
  console.log(
    "No minecraft server host set. Use storage.setItem('host', '<ip-adress>') to set the ip-adress of the minecraft server. Domain name is not supported. Optionally set port with storage.setItem('port', '<portnr>')",
  );
  np.clear();
  np.setPixel(0, np.color(0xaa, 0x33, 0x33));
  np.setPixel(2, np.color(0, 0, 0xaa));
  np.show();
} else {
  main(ssid, passwd, host, port);
}

// TODO: make button do something
btn.on("click", () => {
  console.log("button clicked!");
});
