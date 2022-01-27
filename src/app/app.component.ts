import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private storage: Storage,
    private navCtrl: NavController
  ) {
    this.InitializeApp();
  }

  InitializeApp(){
    this.storage.get('session_users').then((res) => {
      if(res == null){
        this.navCtrl.navigateRoot('/welcome');
        // this.navCtrl.navigateRoot('/registration');
      }else{
        this.navCtrl.navigateRoot('/home');
        // this.navCtrl.navigateRoot('/profile');
      }
    });
  }

}
