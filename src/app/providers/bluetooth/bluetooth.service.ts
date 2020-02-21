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
  //receiverObservable: Observable<any>;
  ConnectedId = '';       //id of connected device, empty if not conencted
  ConnectedName = '';       //Name of connected device, empty if not conencted
  private RxSubscription: Subscription;
  private decoder = new TextDecoder('utf-8');

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
        this.bluetoothSerial.discoverUnpaired().then(response => {      //da contrillare UNPAIRED
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
        this.ConnectedId='';
        this.ConnectedName='';
        reject('BLUETOOTH.NOT_CONNECTED');
      });
    });
  }
  /**
   * It connects to a bluetooth device by its id.
   * @param id It is the id of the device you want to connect to
   * @param name Ii is the name of the device you want to connect to
   * @return {Promise<any>} Return a message to indicate if you successfully connected or not.
   */
  deviceConnection(id: string, name: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.connection = this.bluetoothSerial.connect(id).subscribe(() => {      //"connection" is a subscription
        this.storage.setBluetoothId(id);
        this.storage.setBluetoothName(name);
        this.ConnectedId=id;
        this.ConnectedName=name;
        //this.startReceiverObservable();
        resolve('BLUETOOTH.CONNECTED');
      }, fail => {                                                              //Error callback function, invoked when error occurs or the connection disconnects.
        console.log(`[bluetooth.service-88] Connection error: ${JSON.stringify(fail)}`);
        this.ConnectedId='';                                                    //if a reconecction is in progress the variables are set, need to be cleared        
        this.ConnectedName='';
        //this.stopReceiverObservable();
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
      this.ConnectedId='';
      this.ConnectedName='';
     // this.stopReceiverObservable();
      result(true);
    });
  }
  /**
   * Set the socket for serial communications after connecting with a bluetooth device
   * @param message It is the text you want to send.
   * @returns {Observable<any>} Return the text that arrives via serial connection
   * bluetooth to the device, if there is no connection, a message returns indicating that:
   * _You are not connected to any bluetooth device_.
   */
  dataInOut(message: string): Observable<any> {
    return Observable.create(observer => {
      this.bluetoothSerial.isConnected().then((isConnected) => {                        //if connected execute callback (isConnected) => {...
        this.reader = from(this.bluetoothSerial.write(message)).pipe(mergeMap(() => {   //fill the "reader" observable with new created observer (from Creates an Observable from other type of data)
            return this.bluetoothSerial.subscribeRawData();                             //bluetoothSerial.write returns nothing. pipe take nothing and pass the data to subscribeRawData that adds
          })).pipe(mergeMap(() => {
            return this.bluetoothSerial.readUntil('\n');   // <= delimitador
          }));

        this.reader.subscribe(data => {
          observer.next(data);                                                          //send to subscriber(s) the data
        });
      }, notConected => {                                                               //if not execute callback notConected => { ....
        observer.next('BLUETOOTH.NOT_CONNECTED');                                       //send to subscriber(s) the error string
        observer.complete();
      });
    });
  }


RxObservable(): Observable<any> {
  return Observable.create(observer => {
    this.bluetoothSerial.subscribeRawData().subscribe(
    data => observer.next(this.decoder.decode(data)));          // the success callback is called whenever data is received
    });
      //    return this.bluetoothSerial.subscribeRawData();
};

 /**
   * Start the socket for serial communications after connecting with a bluetooth device
   * @param 
   * @returns {Observable<any>} Return the text that arrives via serial connection
   * bluetooth to the device, if there is no connection, a message returns indicating that:
   * _You are not connected to any bluetooth device_.
   */
   //  startReceiverObservable() {
  //  this.RxSubscription = this.receiverObservable.subscribe(data => {
   //   return this.bluetoothSerial.subscribeRawData();                                                          //send to subscriber(s) the data
   // });
  //}
  
 /**
   * Stop the socket for serial communications after disconnecting a bluetooth device
   * @param 
   * @returns 
   */
 // stopReceiverObservable() {
 //   this.RxSubscription.unsubscribe();
 // }

    /**
   * Send data to bluetooth device
   * @param message It is the text you want to send.
   * @returns {Observable<any>} Return 'SEND_OK'
   * if there is no connection, a message returns indicating that:
   * _You are not connected to any bluetooth device_.
   */
  dataSend(message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.isConnected().then((isConnected) => {                        //if connected execute callback (isConnected) => {...
        this.bluetoothSerial.write(message).then(success => {
          resolve('SEND_OK');
        }, error => {                                                           //comunication error. Bielive given only by disconnection
          this.ConnectedId='';                                                  //so managed in tha same way
          this.ConnectedName='';
          reject('BLUETOOTH.CANNOT_CONNECT');
        });
      }, fail => {                                                               //if not execute callback notConected => { ....
        this.ConnectedId='';
        this.ConnectedName='';
        reject('BLUETOOTH.NOT_CONNECTED');
      });
    });
  }


    /**
  var dataBuffer = new Buffer("FF01DED100010401010104","hex");

  this.bluetoothSerial.isConnected()
  .then(data => {
      this.bluetoothSerial.write(dataBuffer).then(data => {
          this.output += "\r\nWrite : " + JSON.stringify(data);
      },
      error =>{
          this.output += "\r\nWrite Error : " + JSON.stringify(error);
      });
  })
  .catch(error => {
    this.output += "\r\nBT disconnected";
  });
  */

  /**
   * It is a method that can be called from other parts of the code to try to connect with the
   * id of the last bluetooth device to which it is connected.
   * @return {Promise<any>} Return a message to indicate if you successfully connected or not.
   */
  storedConnection(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.getBluetoothId().then(bluetoothId => {
        console.log(`[bluetooth.service-129] ${bluetoothId}`);
        this.storage.getBluetoothName().then(bluetoothName => {
          this.deviceConnection(bluetoothId, bluetoothName).then(success => {
            resolve(success);
            }, fail => {
              reject(fail);
            });
        });
      });
    });
  }
}
