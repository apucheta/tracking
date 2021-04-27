import { Component, ElementRef, ViewChild } from '@angular/core';

import {Plugins} from '@capacitor/core';

const { Geolocation } = Plugins;

declare var google;
interface location {
  lat: any;
  lng: any;
  timestamp: any;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  lugares: Array<location> = [
    {
      lat: -34.5677206,
      lng: -58.451593100000004,
      timestamp: 1619470383829,
    },
  ];

  isTracking = false;
  watch: string
  
  //setting map & markers
  @ViewChild('map',{static: true}) mapElement: ElementRef;
  map: any;
  markers = [];


  constructor() {}

  ionViewWillEnter(){
    this.loadMap();
  }

  loadMap(){
    let latLng= new google.maps.LatLng(51.9036442, 7.6673267);
    let mapOptions = {
      center: latLng,
      zoom: 5,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  startTracking() {
    this.isTracking = true;
    this.watch = Geolocation.watchPosition({}, (position, err) => {
      if (position) {
        this.addNewLocation(
          position.coords.latitude,
          position.coords.longitude,
          position.timestamp
        );
      }
    });
    
  }

  stopTracking(){
    Geolocation.clearWatch({id: this.watch }).then(()=>{
      this.isTracking = false;
    });
    this.updateMap(this.lugares);
  }

  addNewLocation(latitud,long,ts){
    /* console.log('lat:'+latitud );
    console.log('lng:'+long);
    console.log('timestamp: '+ts); */
    
    /* let elemento: location;
    elemento.lat = lat;
    elemento.lng = lng;
    elemento.timestamp = timestamp;
    console.log(elemento); */
    
    this.lugares.push({lat:latitud,lng: long, timestamp: ts});
    //console.log(this.lugares);
    
    let position = new google.maps.LatLng(latitud, long);
    this.map.setCenter(position);
    this.map.setZoom(15);
  }

  updateMap(locations){
    this.markers.map(marker => marker.setMap(null));
    this.markers = [];

    for (let location of locations) {
      console.log(location);
      
      let latLng = new google.maps.LatLng(location.lat, location.lng);
   
      let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });
      this.markers.push(marker);
    }
  }
}
