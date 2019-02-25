var dw_event={
  add:function(obj,etype,fp,cap){
    cap=cap||false;
    if (obj.addEventListener)obj.addEventListener(etype,fp,cap);
    else if(obj.attachEvent)obj.attachEvent("on"+etype,fp);
  }
, 
remove:function(obj,etype,fp,cap){
    cap=cap||false;
    if(obj.removeEventListener)obj.removeEventListener(etype,fp,cap);
    else if(obj.detachEvent)obj.detachEvent("on"+etype,fp);
  }
, 
DOMit:function(e){ 
    e = e?e:window.event;
    e.tgt=e.srcElement?e.srcElement:e.target;
    if(!e.preventDefault)e.preventDefault=function(){return false;}
    if(!e.stopPropagation)e.stopPropagation=function(){if(window.event)window.event.cancelBubble=true;}
    return e;
  }
};

/////
var viewport={
getWinWidth:function(){
    this.width=0;
    if (window.innerWidth) this.width=window.innerWidth-18;
    else if (document.documentElement&&document.documentElement.clientWidth) 
  		this.width = document.documentElement.clientWidth;
    else if (document.body && document.body.clientWidth) 
  		this.width = document.body.clientWidth;
  }
,
getWinHeight:function(){
    this.height=0;
    if(window.innerHeight)this.height=window.innerHeight-18;
  	else if(document.documentElement&&document.documentElement.clientHeight) 
  		this.height=document.documentElement.clientHeight;
  	else if(document.body && document.body.clientHeight) 
  		this.height=document.body.clientHeight;
  }
,
getScrollX:function(){
    this.scrollX=0;
  	if(typeof window.pageXOffset=="number")this.scrollX=window.pageXOffset;
  	else if(document.documentElement&&document.documentElement.scrollLeft)
  		this.scrollX=document.documentElement.scrollLeft;
  	else if(document.body&&document.body.scrollLeft)
  		this.scrollX=document.body.scrollLeft;
  	else if(window.scrollX)this.scrollX=window.scrollX;
  }
,
getScrollY:function(){
    this.scrollY=0;    
    if(typeof window.pageYOffset=="number")this.scrollY=window.pageYOffset;
    else if(document.documentElement&&document.documentElement.scrollTop)
  		this.scrollY=document.documentElement.scrollTop;
  	else if(document.body&&document.body.scrollTop)
  		this.scrollY=document.body.scrollTop;
  	else if(window.scrollY)this.scrollY=window.scrollY;
  }
,
getAll:function(){
    this.getWinWidth();this.getWinHeight();
    this.getScrollX();this.getScrollY();
  } 
};

////////
var Tooltip={
layer:".all",
style:".style",
followMouse:true,
offX:8,
offY:12,
id:"tipDiv",
showDelay:100,
hideDelay:200,
ready:false,
timer:null,
tip:null,
init:function(){
	//kiem tra trinh duyet de lay kieu style va layer
	if(navigator.userAgent.indexOf("MSIE")!=-1){
		this.layer=".all";
		this.style=".style";
	}else if(navigator.userAgent.indexOf("Nav")!=-1){
		this.layer =".layers";
		this.style="";
	 }
	 //tao ra mot cua so div de ghi ra man hinh nay
 	var popDiv=document.createElement("div");
        popDiv.id =this.id;
        popDiv.className ="tipDiv";
        document.body.appendChild(popDiv);
    //tip da san sang phuc vu ban
	this.ready=true;     
}
,
show:function(e,msg){
	if(this.timer)
		{clearTimeout(this.timer);
		 this.timer=0;
		}
		if(!this.ready)return;
		this.tip=document.getElementById(this.id);
		if(this.followMouse)dw_event.add(document,"mousemove",this.trackMouse,true);
		this.writeTip(msg);
		viewport.getAll();
		this.positionTip(e);
		this.timer=setTimeout("Tooltip.toggleVis('"+this.id+"','visible')",this.showDelay);
	}
,writeTip:function(msg){
	if(this.tip
		&&typeof this.tip.innerHTML!="undefined") 
			this.tip.innerHTML=msg;
	}
,positionTip:function(e){
	if(this.tip&&this.tip.style){
		var	x=e.pageX?e.pageX:viewport.scrollX+e.clientX;
		var	y=e.pageX?e.pageY:viewport.scrollY+e.clientY;
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
	this.timer=setTimeout("Tooltip.toggleVis('"+this.id+"', 'hidden')",this.hideDelay);
	if(this.followMouse) dw_event.remove(document,"mousemove",this.trackMouse,true);
	this.tip=null;
	}
,toggleVis:function(layerRef,state){
	eval("document"+this.layer+"['"+layerRef+"']"+this.style+".visibility='"+state+"'")
	}
,trackMouse:function(e)
	{e=dw_event.DOMit(e);
	Tooltip.positionTip(e);
	}
};

//////
//Cac ham sau day duoc su dung cho cac ung dung cua no
//cat cac ham nay khai bao trong cac trang co su dung tooltip
//Muc dich de khong bi bao loi khi khong khai tooltip truoc
function doTooltip(msg){
  if(typeof Tooltip=="undefined"||!Tooltip.ready)return;
  var event=(event)?event:((window.event)?window.event:null);
  if(event)Tooltip.show(event,msg)
  else document.onmousemove=function(e){Tooltip.show(e,msg)}
}
function hideTip(){
  if(typeof Tooltip=="undefined"||!Tooltip.ready)return;
  document.onmousemove=null; //reset chuot di chuyen do gan tren firefox
  Tooltip.hide();
}
//khai bao ham init() nay sau the body khi load
//de no tao ra the div
//Tooltip.init();

/////////////////////////////////////////////////////////////
//End of Tooltip