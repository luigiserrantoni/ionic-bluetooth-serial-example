## Attempt of update to run on Ionic 5
- Updated modules (package.json)
- Events disabled in storage.service.ts (removed from ionic 5)
- Added Italian language

To be done...
http -> @angular/common/http

To install cordova
```bash
npm i -g cordova
npm i -g cordova-res
ionic cordova platform add android
```

Original Readme:
## Ionic bluetooth serial

Utiliza la librería [Bluetooth Serial](https://ionicframework.com/docs/native/bluetooth-serial/), y el estilo de ionic 4.

La librería no está optimizada para conectar dos dispositivos con android.

Para descargar usa:

```bash
$ git clone https://github.com/jlozoya/ionic-bluetooth-serial-example.git
$ npm install
$ ionic cordova run android --device
```
