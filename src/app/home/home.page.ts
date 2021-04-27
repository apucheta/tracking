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
      lat: -34.77627, 
      lng: -58.910965,
      timestamp: 1619470383829,
    },
  ];
  distancia: string = '';

  isTracking = false;
  watch: string
  currentMapTrack=null;
  //setting map & markers
  @ViewChild('map',{static: true}) mapElement: ElementRef;
  map: any;
  markers = [];


  constructor() {}

  ionViewWillEnter(){
    this.loadMap();
  }

  loadMap(){
    let latLng= new google.maps.LatLng(-34.77627, -58.910965);
    let mapOptions = {
      center: latLng,
      zoom: 10,
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
    this.lugares.push({lat:latitud,lng: long, timestamp: ts});
    //console.log(this.lugares);
    
    let position = new google.maps.LatLng(latitud, long);
    this.map.setCenter(position);
    this.map.setZoom(8);
  }

  updateMap(locations){
    this.markers.map(marker => marker.setMap(null));
    this.markers = [];

    for (let location of locations) {
      //console.log(location);
      
      let latLng = new google.maps.LatLng(location.lat, location.lng);
      //console.log(latLng);
      
      let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });
      this.markers.push(marker);
    }
    this.redrawPath(locations)
  }

  redrawPath(path) {
    //console.log(path[0]);
    if (this.currentMapTrack) {
      this.currentMapTrack.setMap(null);
    }
 
    if (path.length > 1) {
      this.currentMapTrack = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#0011ff',
        strokeOpacity: 1.0,
        strokeWeight: 3
      });
      this.currentMapTrack.setMap(this.map);
    }
    
    this.calDistance(path[0],path[path.length-1]);
  }

  calDistance(origen, destino){
    // calculo la distancia entre los puntos
    //const geocoder = new google.maps.Geocoder();

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [origen],
      destinations: [destino],
      travelMode: google.maps.TravelMode.WALKING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false,
      },(response, status) => {
        if (status !== "OK") {
          alert("Error was: " + status);
        }else{
          this.distancia = response.rows[0]['elements'][0]['distance'].text;
        }
      });
  }
}
