import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AccessProviders } from 'src/app/providers/access-profiders';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  username: string = "";
  password: string = "";

  disabledButton: any;

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    private accessProviders: AccessProviders,

    private navCtrl: NavController,
    private storage: Storage
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter(){
    this.disabledButton = false;
  }

  openRegist(){
    this.router.navigate(['/registration']);
  }

  async tryLogin() {
    if(this.username == ''){
      this.presentToast('Username cannot empty');
    }else if(this.password == ''){
      this.presentToast('Password cannot empty');
    }else{
      this.disabledButton = true;
      const loading = await this.loadingCtrl.create({
        message: 'Please wait..'
      });
      await loading.present();

      return new Promise(resolve=>{
        let body = {
          aksi : 'login_system',
          username: this.username,
          password: this.password
        }
        this.accessProviders.postData(body, 'Login').subscribe((data:any) => {
          if(data.success){
            loading.dismiss();
            this.disabledButton = false;
            this.presentToast('Welcome');
            this.storage.set('session_users', data.result);
            this.navCtrl.navigateRoot(['/home']);
          }else{
            loading.dismiss();
            this.presentToast('Username or password did not match')
          }
        },(err) => {
          loading.dismiss();
          this.disabledButton = true;
          this.presentAlertConfirm('Timeout');
        });
      });
    } 
  }

  async presentToast(a){
    const toast = await this.toastCtrl.create({
      message: a,
      duration: 2000
    });
    toast.present()
  }

  async presentAlertConfirm(a){
    const alert = await this.alertController.create({
      header: a,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: (blah) => {
            console.log('Cancel : blah');
          }
        },
        {
          text: 'Try Again',
          handler: () => {
            this.tryLogin()
          }
        }
      ]
    });
    await alert.present();
  }

  signUp(){
    this.navCtrl.navigateForward(['/registration'])
  }

}
