import { BluetoothService, StorageService } from './../../providers/providers';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
/**
 * This class provides the user with the interface to manipulate some options.
 * @author <a href="mailto:jlozoya1995@gmail.com">Juan Lozoya</a>
 */
@Component({
  selector: 'app-bluetooth',
  templateUrl: 'bluetooth.page.html',
  styleUrls: ['bluetooth.page.scss']
})
export class BluetoothPage implements OnInit, OnDestroy {

  devices: any[] = [];
  showSpinner = false;
  isConnected = false;
  message = '';
  messages = [];

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private bluetooth: BluetoothService,
    private storage: StorageService
  ) {
  }
  /**
   * Load part of the content after initializing the component.
   */
  ngOnInit() {
    this.showSpinner = true;
    this.bluetooth.storedConnection().then((connected) => {
      this.isConnected = true;
      this.Connectedid=this.bluetooth.Connectedid;
      this.showSpinner = false;
      this.sendMessage('connected on storedConnection() on ngOnInit()');
    }, (fail) => {
      this.Connectedid='';
      this.bluetooth.searchBluetooth().then((devices: Array<Object>) => {
        this.devices = devices;
        this.showSpinner = false;
      }, (error) => {
        this.presentToast(this.translate.instant(error));
        this.showSpinner = false;
      });
    });
  }
  /**
   * Close the bluetooth connection.
   */
  disconnect(): Promise<boolean> {
    return new Promise(result => {
      this.isConnected = false;
      this.bluetooth.disconnect().then(response => {
        result(response);
      });
    });
  }
  /**
   * When closing the application, it ensures that the bluetooth connection is closed.
   */
  ngOnDestroy() {
    this.disconnect();
  }
  /**
   * Search for bluetooth devices by dragging the screen down.
   * @param refresher
   */
  refreshBluetooth(refresher) {
    if (refresher) {
      this.bluetooth.searchBluetooth().then((successMessage: Array<Object>) => {
        this.devices = [];
        this.devices = successMessage;
        refresher.target.complete();
      }, fail => {
        this.presentToast(this.translate.instant(fail));
        refresher.target.complete();
      });
    }
  }
  /**
   * Check if you are already connected to a bluetooth device or not.
   * @param seleccion They are the data of the selected item from the list
   */
  checkConnection(seleccion) {
    this.bluetooth.checkConnection().then(async (isConnected) => {
      const alert = await this.alertCtrl.create({
        header: this.translate.instant('BLUETOOTH.ALERTS.RECONNECT.TITLE'),
        message: this.translate.instant('BLUETOOTH.ALERTS.RECONNECT.MESSAGE'),
        buttons: [
          {
            text: this.translate.instant('CANCEL'),
            role: 'cancel',
            handler: () => {}
          },
          {
            text: this.translate.instant('ACCEPT'),
            handler: () => {
              this.disconnect().then(() => {
                this.bluetooth.deviceConnection(seleccion.id).then(success => {
                  this.sendMessage('Reconnection established by checkConnection()');
                  this.isConnected = true;
                  this.Connectedid=this.bluetooth.Connectedid;
                  this.presentToast(this.translate.instant(success));
                }, fail => {
                  this.isConnected = false;
                  this.Connectedid='';
                  this.presentToast(this.translate.instant(fail));
                });
              });
            }
          }
        ]
      });
      await alert.present();
    }, async (notConnected) => {
      const alert = await this.alertCtrl.create({
        header: this.translate.instant('BLUETOOTH.ALERTS.CONNECT.TITLE'),
        message: this.translate.instant('BLUETOOTH.ALERTS.CONNECT.MESSAGE'),
        buttons: [
          {
            text: this.translate.instant('CANCEL'),
            role: 'cancel',
            handler: () => {}
          },
          {
            text: this.translate.instant('ACCEPT'),
            handler: () => {
              this.bluetooth.deviceConnection(seleccion.id).then(success => {
                this.sendMessage('Connection established by checkConnection()');
                this.isConnected = true;
                this.Connectedid=this.bluetooth.Connectedid;
                this.presentToast(this.translate.instant(success));
              }, fail => {
                this.isConnected = false;
                this.Connectedid='';
                this.presentToast(this.translate.instant(fail));
              });
            }
          }
        ]
      });
      await alert.present();
    });
  }
  /**
   * Send text messages via serial when connecting via bluetooth.
   */
  sendMessage(message: string) {
    this.bluetooth.dataInOut(`${message}\n`).subscribe(data => {
      if (data !== 'BLUETOOTH.NOT_CONNECTED') {
        try {
          if (data) {
            const entry = JSON.parse(data);
            this.addLine(message);
          }
        } catch (error) {
          console.log(`[bluetooth-168]: ${JSON.stringify(error)}`);
        }
         this.presentToast(data);       //data output to toast era commentato
        this.message = '';
      } else {
        this.presentToast(this.translate.instant(data));
      }
    });
  }
  /**
   * Retrieve the basic server information for line graphs.
   * @param message
   */
  addLine(message) {
    this.messages.push(message);
  }
  /**
   * Present a message box.
   * @param {string} text Message to show.
   */
  async presentToast(text: string) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000
    });
    await toast.present();
  }
}
