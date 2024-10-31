# Minecraft pinger Raspberry Pi Pico + Neopixels and KalumaJS

Pings a minecraft every 5 min server getting the player count and lights neopixel leds more and
more depending on playercount.

## Setup Pico
See https://kalumajs.org/ for installation instructions of the kaluma js firmware.

## Install
Checkout repo and do an `npm install` or similar with package manager of choice.

During development you can use `dev` to flash and then land in the shell.
```sh
npm run dev
```

Just flash the minecraft pinger script
```sh
npm run flash
```

...or just enter the kaluma shell
```sh
npm run shell
```

## Setting ssid, password and minecraft server

The pinger needs `ssid`, `passwd` and `host` ip adress of the minecraft server to function.
Domain name is not supported, since no DNS lookup implemented.

You can set it by first entering the shell, `npm run shell`, and the using the kaluma js `storage` api functions.

```sh
storage.setItem('ssid', 'my-ssid')
storage.setItem('passwd', 'my-password')
storage.setItem('host', '192.168.0.77')
```
This is saved in the flash of the microcontroller and you only need to do it once.

You can also set port with `storage.setItem('port', '25565')`, but it's optional and will default to mincraft standard port.


## TODO

* Something is off with the types, `node_modules/@types/node` gets included even though we have `typeRoot` set in tsconfig.json and it conflicts with kaluma typing.
  You have to be careful to not use anything not available in for instance `net`
* Cleanup and make a type PR for some of the types in global.d.ts
* Better mainloop code that will retry to connect to wifi if failing
* An animation or something nicer when detecting players online
* Use the button for something.


## References
https://wiki.vg/Server_List_Ping
https://kalumajs.org/
