import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { AccessProviders } from 'src/app/providers/access-profiders';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {

  submitButton: any;
  passconfirm: any;
  branch: any;
  depo: any;
  fullname: any;
  username: any;
  phone: any;
  salescode: any;
  selectedBranch: any;
  selectedDepo: any;
  crepassword: any;
  conpassword: any;

  constructor(
    private toastCtrl: ToastController,
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    private accessProviders: AccessProviders,
    private navCtrl: NavController
  ) { 

    // get Data branch active
    this.getBranch();
    this.submitButton = true;

  }

  ngOnInit() {
    // ngOnInit section
  }

  async getBranch(){
    const loading = await this.loadingCtrl.create({
      message: 'Please wait..'
    });
    await loading.present();

    return new Promise(resolve=>{
      let body = {
        aksi : 'get_branch'
      }
      this.accessProviders.postData(body, 'Register').subscribe((data:any) => {
        if(data.success){
          loading.dismiss();
          this.branch = [];
          for (let i = 0; i < data.result.length; i++) {
            this.branch.push(
              {
                'kdcabang': data.result[i].KdCabang,
                'namacabang': data.result[i].NamaCabang,
              }
            )              
          }
        }else{
          loading.dismiss();
          this.presentAlertConfirm('Unstable connection');
        }
      },(err) => {
        loading.dismiss();
        this.presentAlertConfirm('Unstable connection');
      });
    });
  }

  async presentAlertConfirm(a){
    const alert = await this.alertController.create({
      header: a,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            // Cancel handler
          }
        },
        {
          text: 'Try Again',
          handler: () => {
            this.getBranch();
          }
        }
      ]
    });
    await alert.present();
  }

  selectBranch($event){
    this.selectedBranch = $event.target.value;
    this.getDepo(this.selectedBranch);
    this.selectedDepo = '';
  }

  getDepo(a){
    return new Promise(resolve=>{
      let body = {
        aksi : 'get_depo',
        cabang : a
      }
      this.accessProviders.postData(body, 'Register').subscribe((data:any) => {
        if(data.success){
          this.depo = [];
          for (let i = 0; i < data.result.length; i++) {
            this.depo.push(
              {
                'kddepo': data.result[i].KdDepo,
                'namadepo': data.result[i].NamaDepo,
              }
            )              
          }
        }else{
          this.presentAlertDepoConfirm('Unstable connection');
        }
      },(err) => {
        this.presentAlertDepoConfirm('Unstable connection');
      });
    });
  }

  async presentAlertDepoConfirm(a){
    const alert = await this.alertController.create({
      header: a,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            // Cancel handler
          }
        },
        {
          text: 'Try Again',
          handler: () => {
            this.getDepo(a);
          }
        }
      ]
    });
    await alert.present();
  }

  selectDepo($event){
    this.selectedDepo = $event.target.value;
  }

  onCrepassword(a){
    this.crepassword = a.target.value;
    if(this.crepassword == ''){
      this.passconfirm = 2;
      this.conpassword = '';
    }
  }

  onConpassword(b){
    this.conpassword = b.target.value;
    if(this.crepassword !== this.conpassword){
      this.submitButton = true;
      this.passconfirm = 0;
    } else if(this.crepassword === this.conpassword){
      this.submitButton = false;
      this.passconfirm = 1;
    }

    if(this.conpassword == ''){
      this.passconfirm = 2;
    }
  }

  async tryRegist() {

    const loading = await this.loadingCtrl.create({
      message: 'Please wait..'
    });
    await loading.present();

    return new Promise(resolve=>{
      let body = {
        aksi : 'get_submit_regist',
        fullname : this.fullname,
        username: this.username,
        phone: this.phone,
        salescode: this.salescode.toUpperCase(),
        branch: this.selectedBranch,
        depo: this.selectedDepo,
        password: this.conpassword
      }

      console.log(body);
      
      this.accessProviders.postData(body, 'Register').subscribe((data:any) => {
        var message = data.msg;
        if(data.success){
          loading.dismiss();
          this.presentToast(message);
          this.navCtrl.navigateBack(['/login'])
        }else{
          loading.dismiss();
          this.presentToast(message);
        }
      },(err) => {
        loading.dismiss();
        this.presentAlertConfirmRegist('Unstable connection');
      });

    });
  }

  async presentToast(a){
    const toast = await this.toastCtrl.create({
      message: a,
      duration: 2500
    });
    toast.present()
  }

  async presentAlertConfirmRegist(a){
    const alert = await this.alertController.create({
      header: a,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            //
          }
        },
        {
          text: 'Try Again',
          handler: () => {
            this.tryRegist()
          }
        }
      ]
    });
    await alert.present();
  }

}
