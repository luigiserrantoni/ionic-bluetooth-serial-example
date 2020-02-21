## Attempt of update to run on Ionic 5
- Updated modules (package.json)
- Events disabled in storage.service.ts (removed from ionic 5, seems is not used)
- Added Italian language
- Translated comments in english
- Removed @angular/http module (already use @angular/common/http)
- Modified the form action used to submit the meggage to sendMessage(message) (file bluetooth.page.html)
- Layot change in bluetooth.page.html: separated the items in different sections and included in cards
- Replaced the refresh method for device scan with a button
- Receive data implemented. Received data is sent to page using an observable.
- Inserted a Debug screen

To be done...
Screen refresh to show received data (acctually shown only on update, not shown after delete of list)
Package the data into the observable in sting+/n
Test on receive data for different data types
Test on device disconnection


To install cordova
```bash
npm i -g cordova
npm i -g cordova-res
ionic cordova platform add android
```
To compile android apk
```bash
ionic cordova build android
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
