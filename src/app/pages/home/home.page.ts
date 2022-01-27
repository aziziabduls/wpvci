import { Component, OnInit, ViewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { AlertController, IonContent, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { CupertinoPane, CupertinoSettings } from 'cupertino-pane';
import { AccessProviders } from 'src/app/providers/access-profiders';

import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  map: Leaflet.Map;

  @ViewChild(IonContent) content: IonContent;

  myImage: string = null;
  position: Position = null;
  myPane: any;
  myPaneDetail: any;
  actButton: any;
  geoButton: any;
  sendButton: any;

  transaction_id: any;
  username: any;
  code_sales: any;
  code_branch: any;
  code_depo: any;
  outlet_name: any;
  outlet_address: any;
  outlet_city: any;
  lat: any;
  lng: any;
  qtyItem: string = "";

  det_transaction_id : any;
  det_code_sales : any;
  det_username : any;
  det_branch_name : any;
  det_depo_name : any;
  det_outlet_name : any;
  det_outlet_address : any;
  det_outlet_city : any;
  det_latitude : any;
  det_longitude : any;
  det_netto_order : any;
  det_created_date : any;
  det_confirm_date : any;
  det_status : any;

  current_: String = new Date().toISOString();
  id_trans: any;
  subscription: any;

  trans: any;

  constructor(
    private accessProviders: AccessProviders,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private storage: Storage,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    // private platform: Platform
  ) {

    this.sendButton = true;
    // this.geoButton = true;
    // this.getDataUser();

    
    
  }

  ionViewDidEnter(){
    this.getDataUser();
    // this.leafletMap();

    // disable back button
    // this.subscription = this.platform.backButton.subscribeWithPriority(9999, () => {
      // do nothing
    // });
  }

  ionViewDidLeave() {
    // this.closePane()
    // this.closePanedetail()
    // this.subscription.unsubscribe();
  }

  ionViewWillLeave() {
    // this.presentAlertConfirm('keluar?');
  }

  getDataUser(){
    this.storage.get('session_users').then((res) => {
      this.username = res[0].username;
      // this.username = 'man';
      this.getHistoryTrans(this.username);
    })
  }

  onChangeTime(a){
    this.qtyItem = a.target.value;
    
    if(this.qtyItem === '' || this.qtyItem === '0' || this.qtyItem === null || this.qtyItem === undefined){
      this.sendButton = true;
    } else{
      this.sendButton = false;
    }
  }

  async sendTransaction(){
    if(this.qtyItem === '' || this.qtyItem === '0' || this.qtyItem === null || this.qtyItem === undefined){
      await this.presentToast('Please check again your submit value');
    }else{

      const loading = await this.loadingCtrl.create({
        message: 'Please wait..'
      });
      await loading.present();

      this.storage.get('session_users').then((res) => {
        this.username = res[0].username;
        this.code_sales = res[0].code_sales;
        this.code_branch = res[0].branch;
        this.code_depo = res[0].depo;
        var year_month = this.current_.substring(2, 4) + "" + this.current_.substring(5, 7);
        this.id_trans = this.code_branch + res[0].id + year_month;

        // console.log(this.id_trans);
        // console.log(this.username);
        // console.log(this.code_sales);
        // console.log(this.code_branch);
        // console.log(this.code_depo);
        // console.log(this.outlet_name);
        // console.log(this.outlet_address);
        // console.log(this.outlet_city);
        // console.log(this.lat);
        // console.log(this.lng);
        // console.log(this.qtyItem);

        return new Promise(resolve=>{
          let body = {
            aksi : 'send_transaction',
            id_trans: this.id_trans,
            username: this.username,
            code_sales : this.code_sales,
            code_branch : this.code_branch,
            code_depo : this.code_depo,
            outlet_name : this.outlet_name,
            outlet_address : this.outlet_address,
            outlet_city : this.outlet_city,
            lat : this.lat,
            lng : this.lng,
            netto_order : this.qtyItem
        
          }
          this.accessProviders.postData(body, 'Transaction').subscribe((data:any) => {
            var msg = data.msg;
            if(data.success){
              loading.dismiss();
              this.discardTrans();
              this.presentToast(msg);

              this.storage.get('session_users').then((res) => {
                this.username = res[0].username;
                this.getHistoryTrans(this.username)
              });

            }else{
              loading.dismiss();
              this.presentToast(msg)
            }
          },(err) => {
            loading.dismiss();
            this.alertConfSend('Timeout');
          });
        });
      });
      
      
    }
  }

  async alertConfSend(a){
    const alert = await this.alertCtrl.create({
      header: a,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: (blah) => {
            // this.showPanes()
          }
        },
        {
          text: 'Try Again',
          handler: () => {
            this.sendTransaction();
          }
        }
      ]
    });
    await alert.present();
  }

  discardTrans(){
    this.position = null;
    this.myImage = '';
    this.id_trans = '';
    this.username = '';
    this.code_sales = '';
    this.code_branch = '';
    this.code_depo = '';
    this.outlet_name = '';
    this.outlet_address = '';
    this.outlet_city = '';
    this.lat = '';
    this.lng = '';
    this.qtyItem = '';

    //this.geoButton = true;
  }

  async presentToast(a){
    const toast = await this.toastCtrl.create({
      message: a,
      position: 'top',
      duration: 2000
    });
    toast.present()
  }

  async takePicture() {
    // this.closePane();
    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    this.myImage = image.webPath;
    this.getCurrentPosition();
  }

  async getCurrentPosition() {
    // this.closePane();
    const loading = await this.loadingCtrl.create({
      message: 'Please wait..'
    });
    await loading.present();

    const coordinates = await Geolocation.getCurrentPosition();
    this.position = coordinates;
    this.lat = coordinates.coords.latitude;
    this.lng = coordinates.coords.longitude;

    if(this.position){
      loading.dismiss();
      this.geoButton = false;
    }else{
      this.geoButton = true;
    }

    // if(this.position){
    //   setTimeout(()=>{
    //     this.scrollToBottom();
    //   },800)
    // }
  }

  scrollToBottom(){
    this.content.scrollToBottom();
  }

  logout(){
    // this.closePane();
    this.presentAlertConfirm('Logout?')
  }

  async presentAlertConfirm(a){
    const alert = await this.alertCtrl.create({
      header: a,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: (blah) => {
            // this.showPanes()
            // console.log('Cancel : blah');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            // this.closePane();
            this.storage.clear();
            this.navCtrl.navigateRoot(['/welcome']);
          }
        }
      ]
    });
    await alert.present();
  }

  showPanes(){
    this.myPane = new CupertinoPane(
      '.cupertino-pane', // Pane container selector
      { 
        parentElement: 'body', // Parent container
        breaks: {
            middle: { enabled: true, height: 350, bounce: true },
            bottom: { enabled: true, height: 100 },
        },
        bottomClose: false,
        buttonDestroy: true,
        // onDrag: () => console.log('Drag event'),
        onWillDismiss: () => {
          this.actButton = true;
        }
      }
    );

    this.myPane.present({animate: true});
    this.actButton = false;
    
    // this.myPane.present({animate: true}).then(res => {
    //   console.log(res);
    // });

  }

  showPanesDetail(
      transaction_id,
      username,
      code_sales,
      branch_name,
      depo_name,
      outlet_name,
      outlet_address,
      outlet_city,
      latitude,
      longitude,
      netto_order,
      created_date,
      confirm_date,
      status
    ){

      this.det_transaction_id = transaction_id;
      this.det_code_sales = code_sales;
      this.det_username = username;
      this.det_code_sales = code_sales;
      this.det_branch_name = branch_name;
      this.det_depo_name = depo_name;
      this.det_outlet_name = outlet_name;
      this.det_outlet_address = outlet_address;
      this.det_outlet_city = outlet_city;
      this.det_latitude = latitude;
      this.det_longitude = longitude;
      this.det_netto_order = netto_order;
      this.det_created_date = created_date;
      this.det_confirm_date = confirm_date;
      this.det_status = status;

      // var lat = latitude;
      // var lng = longitude;

      // leafletMap() {
        // this.map = Leaflet.map('mapId').setView([lat, lng], 25);
        // Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //   attribution: 'Angular LeafLet',
        // }).addTo(this.map);

        // const markPoint = Leaflet.marker([lat, lng]);
        // markPoint.bindPopup('<p>Your Position</p>');
        // this.map.addLayer(markPoint);
    
        // Leaflet.marker([lat, lng]).addTo(this.map).bindPopup('Your Position').openPopup();

        // Leaflet.marker([34, 77]).addTo(this.map).bindPopup('Leh').openPopup();
    
        // antPath([[28.644800, 77.216721], [34.1526, 77.5771]],
        //   { color: '#FF0000', weight: 5, opacity: 0.6 })
        //   .addTo(this.map);
      // }
    
      /** Remove map when we have multiple map object */
      // ngOnDestroy() {
      //   this.map.remove();
      // }

    this.myPaneDetail = new CupertinoPane(
      '.cupertino-pane-detail', // Pane container selector
      { 
        parentElement: 'body', // Parent container
        breaks: {
            middle: { enabled: true, height: 550, bounce: true },
            bottom: { enabled: true, height: 100 },
        },
        bottomClose: true,
        backdrop: true,
        buttonDestroy: true,
        // onDrag: () => console.log('Drag event'),
        onWillDismiss: () => {
          this.actButton = true;
          this.getDataUser();
          // this.map.remove();
        }
      }
    );

    this.myPaneDetail.present({animate: true});
    this.actButton = false;
    
    // this.myPane.present({animate: true}).then(res => {
    //   console.log(res);
    // });

    


  }

  closePane(){
    this.actButton = true;
    this.myPane.destroy({animate: true});
  }

  closePanedetail(){
    this.actButton = true;
    this.myPaneDetail.destroy({animate: true})
  }

  goToProfile(){
    this.navCtrl.navigateForward(['/profile'])
  }

  async getHistoryTrans(user){
    const loading = await this.loadingCtrl.create({
      message: 'Please wait..'
    });
    await loading.present();

    return new Promise(resolve=>{
      let body = {
        aksi : 'get_transaction_history',
        username: user,
        // username: 'man',
      }
      this.accessProviders.postData(body, 'Transaction').subscribe((data:any) => {
        var msg = data.msg;
        if(data.success){
          loading.dismiss();
          this.trans = [];
          for (let i = 0; i < data.result.length; i++) {
            this.trans.push({
              'transaction_id'  : data.result[i].transaction_id,
              'username'  : data.result[i].username,
              'code_sales'  : data.result[i].code_sales,
              'branch_name'  : data.result[i].branch_name,
              'depo_name'  : data.result[i].depo_name,
              'outlet_name'  : data.result[i].outlet_name,
              'outlet_address'  : data.result[i].outlet_address,
              'outlet_city'  : data.result[i].outlet_city,
              'latitude'  : data.result[i].latitude,
              'longitude'  : data.result[i].longitude,
              'netto_order'  : data.result[i].netto_order,
              'created_date'  : data.result[i].created_date,
              'confirm_date'  : data.result[i].confirm_date,
              'status'  : data.result[i].status,
            });
          }

          // console.log(this.trans);
          
        }else{
          loading.dismiss();
        }
      },(err) => {
        loading.dismiss();
        this.alertConfGetHistory('Timeout');
      });
    });
  }

  async alertConfGetHistory(a){
    const alert = await this.alertCtrl.create({
      header: a,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: (blah) => {
            // this.showPanes()
          }
        },
        {
          text: 'Try Again',
          handler: () => {
            this.getHistoryTrans(this.username);
          }
        }
      ]
    });
    await alert.present();
  }


}
