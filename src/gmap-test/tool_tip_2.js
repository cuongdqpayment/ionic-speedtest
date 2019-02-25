var dw_event = {
  add: function(obj, etype, fp, cap) {
    cap = cap || false;
    if (obj.addEventListener) obj.addEventListener(etype, fp, cap);
    else if (obj.attachEvent) obj.attachEvent("on" + etype, fp);
  }, 

  remove: function(obj, etype, fp, cap) {
    cap = cap || false;
    if (obj.removeEventListener) obj.removeEventListener(etype, fp, cap);
    else if (obj.detachEvent) obj.detachEvent("on" + etype, fp);
  }, 

  DOMit: function(e) { 
    e = e? e: window.event;
    e.tgt = e.srcElement? e.srcElement: e.target;
    
    if (!e.preventDefault) e.preventDefault = function () 
    { return false; 
    }
    if (!e.stopPropagation) e.stopPropagation = function () 
    { 
    if (window.event) window.event.cancelBubble = true; 
    }
        
    return e;
  } 
};

/////
var viewport = {
  getWinWidth: function () {
    this.width = 0;
    if (window.innerWidth) this.width = window.innerWidth - 18;
    else if (document.documentElement && document.documentElement.clientWidth) 
  		this.width = document.documentElement.clientWidth;
    else if (document.body && document.body.clientWidth) 
  		this.width = document.body.clientWidth;
  },
  
  getWinHeight: function () {
    this.height = 0;
    if (window.innerHeight) this.height = window.innerHeight - 18;
  	else if (document.documentElement && document.documentElement.clientHeight) 
  		this.height = document.documentElement.clientHeight;
  	else if (document.body && document.body.clientHeight) 
  		this.height = document.body.clientHeight;
  },
  
  getScrollX: function () {
    this.scrollX = 0;
  	if (typeof window.pageXOffset == "number") this.scrollX = window.pageXOffset;
  	else if (document.documentElement && document.documentElement.scrollLeft)
  		this.scrollX = document.documentElement.scrollLeft;
  	else if (document.body && document.body.scrollLeft) 
  		this.scrollX = document.body.scrollLeft; 
  	else if (window.scrollX) this.scrollX = window.scrollX;
  },
  
  getScrollY: function () {
    this.scrollY = 0;    
    if (typeof window.pageYOffset == "number") this.scrollY = window.pageYOffset;
    else if (document.documentElement && document.documentElement.scrollTop)
  		this.scrollY = document.documentElement.scrollTop;
  	else if (document.body && document.body.scrollTop) 
  		this.scrollY = document.body.scrollTop; 
  	else if (window.scrollY) this.scrollY = window.scrollY;
  },
  
  getAll: function () {
    this.getWinWidth(); this.getWinHeight();
    this.getScrollX();  this.getScrollY();
  } 
};

////////
var Tooltip= 
{
followMouse:true,
offX: 8,
offY: 12,
tipID: "tipDiv",
showDelay: 100,
hideDelay: 200,
ready:true,
timer:null,
tip:null
,show:function(e,msg)
	{if(this.timer)
		{clearTimeout(this.timer);
		 this.timer=0;
		}
		if(!this.ready)return;
		this.tip=document.getElementById(this.tipID);
		if(this.followMouse) dw_event.add(document,"mousemove",this.trackMouse,true);
		this.writeTip(msg);
		viewport.getAll();
		this.positionTip(e);
		this.timer=setTimeout("Tooltip.toggleVis('"+this.tipID+"', 'visible')",this.showDelay);
	}
,writeTip:function(msg)
	{if(this.tip
		&&typeof this.tip.innerHTML!="undefined") 
			this.tip.innerHTML=msg;
	}
,positionTip:function(e)
	{if(this.tip&&this.tip.style){
		var x=e.pageX?e.pageX:e.clientX+viewport.scrollX;
		var y=e.pageY?e.pageY:e.clientY+viewport.scrollY;
		if(x+this.tip.offsetWidth+this.offX>viewport.width+viewport.scrollX){
			x=x-this.tip.offsetWidth-this.offX;
			if(x<0)x=0;
		}
		else x=x+this.offX;
		if(y+this.tip.offsetHeight+this.offY>viewport.height+viewport.scrollY){
			y=y-this.tip.offsetHeight-this.offY;
			if(y<viewport.scrollY)y=viewport.height+viewport.scrollY-this.tip.offsetHeight;
		}
		else y=y+this.offY;
		
		this.tip.style.left=x+"px";
		this.tip.style.top=y+"px";
		}
	}
,hide:function(){
	if(this.timer){
		clearTimeout(this.timer);
		this.timer=0;
		}
	this.timer=setTimeout("Tooltip.toggleVis('"+this.tipID+"', 'hidden')",this.hideDelay);
	if(this.followMouse) dw_event.remove(document,"mousemove",this.trackMouse,true);
	this.tip=null;
	}
,toggleVis:function(id,vis)
	{var el=document.getElementById(id);
	if(el)el.style.visibility=vis;
	}
,trackMouse:function(e)
	{e=dw_event.DOMit(e);
	Tooltip.positionTip(e);
	}
};

//////
function doTooltip(e, msg) {
  if ( typeof Tooltip == "undefined" || !Tooltip.ready ) return;
  Tooltip.show(e, msg);
}

function hideTip() {
  if ( typeof Tooltip == "undefined" || !Tooltip.ready ) return;
  Tooltip.hide();
}

////

var Toolpopup={
offX:8,
offY:12,
popupID: "popupDiv",
pop:null,
posX:0,
posY:0,
init:function(){this.pop=this.getPop(this.popupID)},
getPosition:function(e){
	if(this.pop){
		viewport.getAll();
		var x=e.pageX?e.pageX:e.clientX+viewport.scrollX;
		var y=e.pageY?e.pageY:e.clientY+viewport.scrollY;
		if(x+this.pop.offsetWidth+this.offX>viewport.width+viewport.scrollX){
			x=x-this.pop.offsetWidth-this.offX;
			if(x<0)x=0;
		}
		else x=x+this.offX;
		if(y+this.pop.offsetHeight+this.offY>viewport.height+viewport.scrollY){
			y=y-this.pop.offsetHeight-this.offY;
			if(y<viewport.scrollY)y=viewport.height+viewport.scrollY-this.pop.offsetHeight;
		}
		else y=y+this.offY;
		
		this.posX=x;
		this.posY=y;
	}
},
showPopup:function(){
	if(this.pop){
    this.hidePopup();
	//e.cancelBubble = true;
	this.moveObject(this.popupID,this.posX,this.posY);
	if(this.changeVisibility(this.popupID,'visible'))return true;
	else return false;
    } else return false;
},
hidePopup:function(){
    this.changeVisibility(this.popupID,'hidden');
},
moveObject:function(id, xx, yy) {
    var st=this.getStyleObject(id);
    if(st){
		st.left = xx;
		st.top = yy;
		return true;
    } else return false;
},
getPop:function(id) {
    if(document.getElementById && document.getElementById(id)) return document.getElementById(id);
    else if (document.all && document.all(id)) return document.all(id);
    else if (document.layers && document.layers[id]) return document.layers[id];
    else return false;
},
getStyleObject:function(id) {
    // cross-browser function to get an object's style object given its id
    if(document.getElementById && document.getElementById(id)) {
	// W3C DOM
	return document.getElementById(id).style;
    } else if (document.all && document.all(id)) {
	// MSIE 4 DOM
	return document.all(id).style;
    } else if (document.layers && document.layers[id]) {
	// NN 4 DOM.. note: this won't find nested layers
	return document.layers[id];
    } else {
	return false;
    }
},
changeVisibility:function(id,status) {
    var st = this.getStyleObject(id);
    if(st) st.visibility = status;
} 
};
//chen cau lenh sau cuoi cua trang can su dung popup
//Toolpopup.init();





//if(document.getElementById){document.onclick=function(){Toolpopup.hidePopup()};};