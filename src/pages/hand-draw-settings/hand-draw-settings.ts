import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';

@Component({
  selector: 'page-hand-draw-settings',
  templateUrl: 'hand-draw-settings.html'
})
export class HandDrawSettingsPage {
  

  signatureForm:any = {
    //title:"Ký",
    colors: [
      {name:'dr-dark',    color:"#0f0f0f", value: 1}
      ,{name:'dr-green',  color:"#1abc9c", value: 2}
      ,{name:'dr-blue',   color:"#3498db", value: 3}
      ,{name:'dr-vilolet',color:"#9b59b6", value: 4}
      ,{name:'dr-orange', color:"#e67e22", value: 5}
      ,{name:'dr-red',    color:"#e74c3c", value: 6}          
    ]
    ,buttons:[
      {color:"danger", icon:"trash", next:"DEL"}
      , {color:"primary", icon:"camera", next:"SAVE"}
    ]
    ,brushes:[
              {size:2.5, color:"dark", style:"0.25em", icon:"radio-button-on", value: 1}
              ,{size:5, color:"dark", style:"0.5em", icon:"radio-button-on", value: 2}
              ,{size:10, color:"dark", style:"1em", icon:"radio-button-on", value: 3}
              ,{size:20, color:"dark", style:"2em", icon:"radio-button-on", value: 4}
    ]
}

  canvasElement: any;
  lastX: number;
  lastY: number;

  brush:any = {
    size:2.5,
    color:"dark",
    style: "0.25em"
  }

  currentColor: string;
  brushSize: number;


  storedImages = [];

  constructor(private platform: Platform) {  }

  ngOnInit(){
    this.currentColor = this.signatureForm.colors[0];
    this.brushSize = this.signatureForm.brushes[0];
    
  }

  changeColor(cl) {
    this.currentColor = cl.color;
    this.signatureForm.brushes.forEach(el => {
      el.color = cl.name;
    });
  }

  changeSize(size) {
    this.brushSize = size;
  }

  onClickClose(){


  }

  


}