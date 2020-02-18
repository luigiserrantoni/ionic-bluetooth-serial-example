import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { StorageService } from '../storage/storage.service';
import { Observable, Subscription, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
/**
 * This class handles bluetooth connectivity.
 *
 * @author <a href="mailto:jlozoya1995@gmail.com">Juan Lozoya</a>
 * @see [Bluetooth Serial](https://ionicframework.com/docs/native/bluetooth-serial/)
 */
@Injectable()
export class BluetoothService {

  private connection: Subscription;
  private connectionCommunication: Subscription;
  private reader: Observable<any>;
  Connectedid = '';       //id of connected device, empy if not conencted

  constructor(
    private bluetoothSerial: BluetoothSerial,
    private storage: StorageService
  ) {  }
  /**
   * Search for available bluetooth devices, evaluate if it is possible to use the functionality
   * bluetooth on the device.
   * @return {Promise<Object>} Return a list of the devices that were located.
   */
  searchBluetooth(): Promise<Object> {
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.isEnabled().then(success => {
        this.bluetoothSerial.discoverUnpaired().then(response => {
          if (response.length > 0) {
            resolve(response);
          } else {
            reject('BLUETOOTH.NOT_DEVICES_FOUND');
          }
        }).catch((error) => {
          console.log(`[bluetooth.service-41] Error: ${JSON.stringify(error)}`);
          reject('BLUETOOTH.NOT_AVAILABLE_IN_THIS_DEVICE');
        });
      }, fail => {
        console.log(`[bluetooth.service-45] Error: ${JSON.stringify(fail)}`);
        reject('BLUETOOTH.NOT_AVAILABLE');
      });
    });
  }
  /**
   * Check if you are already connected to a bluetooth device or not.
   */
  checkConnection() {
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.isConnected().then(isConnected => {
        resolve('BLUETOOTH.CONNECTED');
      }, notConnected => {
        reject('BLUETOOTH.NOT_CONNECTED');
      });
    });
  }
  /**
   * It connects to a bluetooth device by its id.
   * @param id It is the id of the device you want to connect to
   * @return {Promise<any>} Return a message to indicate if you successfully connected or not.
   */
  deviceConnection(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.connection = this.bluetoothSerial.connect(id).subscribe(() => {
        this.storage.setBluetoothId(id);
        this.Connectedid=id;
        resolve('BLUETOOTH.CONNECTED');
      }, fail => {
        console.log(`[bluetooth.service-88] Error conexión: ${JSON.stringify(fail)}`);
        this.Connectedid='';
        reject('BLUETOOTH.CANNOT_CONNECT');
      });
    });
  }
  /**
   * Close the socket for connection with a bluetooth device.
   * @return {Promise<boolean>}
   */
  disconnect(): Promise<boolean> {
    return new Promise((result) => {
      if (this.connectionCommunication) {
        this.connectionCommunication.unsubscribe();
      }
      if (this.connection) {
        this.connection.unsubscribe();
      }
      result(true);
    });
  }
  /**
   * Set the socket for serial communications after connecting with a bluetooth device
   * @param message It is the text you want to send.
   * @returns {Observable<any>} Return the text that arrives via serious connection
   * bluetooth to the device, if there is no connection, a message returns indicating that:
   * _You are not connected to any bluetooth device_.
   */
  dataInOut(message: string): Observable<any> {
    return Observable.create(observer => {
      this.bluetoothSerial.isConnected().then((isConnected) => {
        this.reader = from(this.bluetoothSerial.write(message)).pipe(mergeMap(() => {
            return this.bluetoothSerial.subscribeRawData();
          })).pipe(mergeMap(() => {
            return this.bluetoothSerial.readUntil('\n');   // <= delimitador
          }));
        this.reader.subscribe(data => {
          observer.next(data);
        });
      }, notConected => {
        observer.next('BLUETOOTH.NOT_CONNECTED');
        observer.complete();
      });
    });
  }
  /**
   * It is a method that can be called from other parts of the code to try to connect with the
   * id of the last bluetooth device to which it is connected.
   * @return {Promise<any>} Return a message to indicate if you successfully connected or not.
   */
  storedConnection(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.getBluetoothId().then(bluetoothId => {
        console.log(`[bluetooth.service-129] ${bluetoothId}`);
        this.deviceConnection(bluetoothId).then(success => {
          resolve(success);
        }, fail => {
          reject(fail);
        });
      });
    });
  }
}
