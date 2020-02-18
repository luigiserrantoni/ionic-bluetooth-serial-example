import { TranslateService } from '@ngx-translate/core';
import { Component } from '@angular/core';

import { Platform, Config } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { StorageService } from './providers/providers';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService,
    private storage: StorageService,
    private config: Config
  ) {
    this.initTranslate();
    this.initializeApp();
  }
  /**
   * Close the splash screen to show the application.
   */
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
  /**
   * Set the default language for the translation strings and the current language.
   */
  initTranslate() {
    this.translate.setDefaultLang('en');
    this.storage.getLang().then(lang => {
      if (!lang && this.translate.getBrowserLang() !== undefined) {
        this.translate.use(this.translate.getBrowserLang());
      } else {
        this.translate.use(lang || 'en'); // Set your language here
      }
      this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
        this.config.set('backButtonText', values.BACK_BUTTON_TEXT);
      });
    });
  }
}
