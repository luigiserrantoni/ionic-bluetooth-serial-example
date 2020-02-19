import { Injectable } from '@angular/core';

// import { Events } from '@ionic/angular';  //removed in ionic 5
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageService {

  BLUETOOTH_ID = 'bluetoothId';
  BLUETOOTH_NAME = 'bluetoothName';
  LANG = 'lang';

  constructor(
 //   public events: Events,	 //removed in ionic 5
    public storage: Storage
  ) {}
  /**
   * Devuelve el tipo de usuario.
   * @return {Promise<string | null>} bluetoothId.
   */
  async getBluetoothId(): Promise<string | null> {
    const bluetoothId = await this.storage.get(this.BLUETOOTH_ID);
    return (bluetoothId) ? bluetoothId : null;
  }
  /**
   * Almacena el tipo de usuario.
   * @param {string} bluetoothId
   */
  async setBluetoothId(bluetoothId: string): Promise<any> {
    return await this.storage.set(this.BLUETOOTH_ID, bluetoothId);
  }
    /**
   * Returns the bluetooth device name.
   * @return {Promise<string>} bluetoothName.
   */
   async getBluetoothName(): Promise<string> {
     return await this.storage.get(this.BLUETOOTH_NAME);
   }
  /**
   * Store the bluetooth device name.
   * @param bluetoothName device name
   */
  async setBluetoothName(bluetoothName: string): Promise<any> {
    return await this.storage.set(this.BLUETOOTH_NAME, bluetoothName);
  }
  /**
   * Almacena el idioma selecionado por el usuario.
   * @param lang Nombre del usuario
   */
  async setLang(lang: string): Promise<any> {
    return await this.storage.set(this.LANG, lang);
  }
  /**
   * Devuelve el idioma selecionado por el usuario.
   * @return {Promise<string>} Nombre de usuario.
   */
  async getLang(): Promise<string> {
    return await this.storage.get(this.LANG);
  }
}
