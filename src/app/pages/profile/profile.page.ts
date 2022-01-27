import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AccessProviders } from 'src/app/providers/access-profiders';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  full_name: any;
  code_sales: any;
  username: any;
  trans: any;
  trans2: any;
  todaydate: any;

  constructor(
    private storage: Storage,
    private accessProviders: AccessProviders,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) {

    this.storage.get('session_users').then((res) => {
      this.full_name = res[0].full_name;
      this.code_sales = res[0].code_sales;
      this.username = res[0].username;
      // this.username = 'man';

      this.getDataTrans(this.username);
      this.getDataTransToday(this.username);
      
    });

  }

  ngOnInit() {
  }

  async getDataTrans(user : any){
    const loading = await this.loadingCtrl.create({
      message: 'Please wait..'
    });
    await loading.present();

    return new Promise(resolve=>{
      let body = {
        aksi : 'get_transaction_data',
        username: user,
      }
      this.accessProviders.postData(body, 'Transaction').subscribe((data:any) => {
        var msg = data.msg;
        if(data.success){
          loading.dismiss();
          this.trans = [];
          for (let i = 0; i < data.result.length; i++) {
            this.trans.push({
              'tot_outlet'    : data.result[i].tot_outlet,
              'tot_netto'     : data.result[i].tot_netto,
              'tot_netto_rp'  : data.result[i].tot_netto_rp,
            });
          }
        }else{
          loading.dismiss();
          this.presentToast(msg)
        }
      },(err) => {
        loading.dismiss();
        this.alertgetDataTrans('Timeout');
      });
    });
  }

  async getDataTransToday(user : any){
    const loading = await this.loadingCtrl.create({
      message: 'Please wait..'
    });
    await loading.present();

    return new Promise(resolve=>{
      let body = {
        aksi : 'get_transaction_today',
        username: user,
      }
      this.accessProviders.postData(body, 'Transaction').subscribe((data:any) => {
        var msg = data.msg;
        if(data.success){
          loading.dismiss();
          this.trans2 = [];
          this.todaydate = data.result[0].todaydate;
          for (let i = 0; i < data.result.length; i++) {
            this.trans2.push({
              'tot_outlet_tdy'    : data.result[i].tot_outlet_tdy,
              'tot_netto_tdy'     : data.result[i].tot_netto_tdy,
              'tot_netto_rp_tdy'  : data.result[i].tot_netto_rp_tdy,
            });
          }
        }else{
          loading.dismiss();
          this.presentToast(msg)
        }
      },(err) => {
        loading.dismiss();
        this.alertgetDataTransToday('Timeout');
      });
    });
  }

  async presentToast(a){
    const toast = await this.toastCtrl.create({
      message: a,
      position: 'top',
      duration: 2000
    });
    toast.present()
  }

  async alertgetDataTrans(a){
    const alert = await this.alertCtrl.create({
      header: a,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: (blah) => { }
        },
        {
          text: 'Try Again',
          handler: () => {
            this.getDataTrans(this.username);
          }
        }
      ]
    });
    await alert.present();
  }

  async alertgetDataTransToday(a){
    const alert = await this.alertCtrl.create({
      header: a,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: (blah) => { }
        },
        {
          text: 'Try Again',
          handler: () => {
            this.alertgetDataTransToday(this.username);
          }
        }
      ]
    });
    await alert.present();
  }

  logout(){
    this.presentAlertConfirm('Logout?')
  }

  async presentAlertConfirm(a){
    const alert = await this.alertCtrl.create({
      header: a,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: (blah) => { }
        },
        {
          text: 'Yes',
          handler: () => {
            this.storage.clear();
            this.navCtrl.navigateRoot(['/welcome']);
          }
        }
      ]
    });
    await alert.present();
  }

}
