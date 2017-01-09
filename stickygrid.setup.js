/* Stickygrid Copyright 2017 Michael Parisi (EVERYTHINGING) */

///////// SG SETUP

window.SG = {};

//Global Vars

SG.$document = $(document);
SG.$window = $(window);
SG.$body = $('body');
SG.windowWidth = SG.$window.width();
SG.windowHeight = SG.$window.height();

//Events

SG.ItemClickEvent = "ItemClickEvent";
SG.ItemUnClickEvent = "ItemUnClickEvent";
SG.ItemOpenedEvent = "ItemOpenedEvent";

SG.EventTarget = function () {
  
  _listeners = {};
  
  this.addListener = function (type, listener) {
        if (typeof _listeners[type] == "undefined"){
            _listeners[type] = [];
        }
        _listeners[type].push(listener);
    }
  
  this.dispatch = function (event, data) {
        if (typeof event == "string"){
            event = { type: event, data: data };
        }
        if (!event.target){
            event.target = this;
        }
        if (!event.type){
            throw new Error("Event object missing 'type' property.");
        }
        if (_listeners[event.type] instanceof Array){
            var listeners = _listeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++){
                listeners[i].call(this, event);
            }
        }
    }

    this.removeListener = function(type, listener) {
        if (_listeners[type] instanceof Array){
            var listeners = _listeners[type];
            for (var i=0, len=listeners.length; i < len; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    }
}

SG.events = new SG.EventTarget();

//VendorTransform

SG.getVendorTransform = function() {

 var vendorTransform = "transform";

  var property = "transform",
      prefixes = ['-moz-', '', '-ms-', '-webkit-', '-o-'];

  for (var i = 0; i < prefixes.length; i++) {
    if (typeof document.body.style[prefixes[i] + property] !== 'undefined') {

      vendorTransform = prefixes[i] + property;

      return vendorTransform;
    }
  }

  return vendorTransform;
}

SG.VendorTransform = SG.getVendorTransform();

//Compute Matrix

SG.ComputeMatrix = new ComputeMatrix(SG.VendorTransform);

//IOS?

SG.isIOS = (navigator.platform == "iPad" || navigator.platform == "iPhone" || navigator.platform == "iPod" || navigator.platform == "iPhone Simulator" || navigator.platform == "iPad Simulator");

//Point

SG.Point = function(x, y){
	this.x = x || 0;
	this.y = y || 0;
	this.origX = x;
	this.origY = y;

	this.copy = function(){
		return new SG.Point(this.x, this.y);
	};

	this.equals = function(p){
 		return (this.x === p.x && this.y === p.y);
 	};
}

//Tween Library

/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

var TWEEN=TWEEN||function(){var n=[];return{getAll:function(){return n},removeAll:function(){n=[]},add:function(t){n.push(t)},remove:function(t){var r=n.indexOf(t);-1!==r&&n.splice(r,1)},update:function(t,r){if(0===n.length)return!1;var i=0;for(t=void 0!==t?t:TWEEN.now();i<n.length;)n[i].update(t)||r?i++:n.splice(i,1);return!0}}}();TWEEN.now="undefined"==typeof window&&"undefined"!=typeof process?function(){var n=process.hrtime();return 1e3*n[0]+n[1]/1e6}:"undefined"!=typeof window&&void 0!==window.performance&&void 0!==window.performance.now?window.performance.now.bind(window.performance):void 0!==Date.now?Date.now:function(){return(new Date).getTime()},TWEEN.Tween=function(n){var t,r=n,i={},e={},u={},o=1e3,a=0,f=!1,c=!1,s=!1,h=0,l=null,p=TWEEN.Easing.Linear.None,E=TWEEN.Interpolation.Linear,d=[],v=null,I=!1,w=null,M=null,T=null;this.to=function(n,t){void 0!==t&&(o=t),e=n;for(var u in e)void 0!==r[u]&&(i[u]=parseFloat(r[u],10));return this},this.start=function(n){TWEEN.add(this),c=!0,I=!1,l=void 0!==n?n:TWEEN.now(),l+=h;for(var t in e){if(e[t]instanceof Array){if(0===e[t].length)continue;e[t]=[r[t]].concat(e[t])}void 0!==r[t]&&(i[t]=r[t],i[t]instanceof Array==!1&&(i[t]*=1),u[t]=i[t]||0)}return this},this.stop=function(){return c?(TWEEN.remove(this),c=!1,null!==T&&T.call(r,r),this.stopChainedTweens(),this):this},this.end=function(){return this.update(l+o),this},this.stopChainedTweens=function(){for(var n=0,t=d.length;t>n;n++)d[n].stop()},this.delay=function(n){return h=n,this},this.repeat=function(n){return a=n,this},this.repeatDelay=function(n){return t=n,this},this.yoyo=function(n){return f=n,this},this.easing=function(n){return p=n,this},this.interpolation=function(n){return E=n,this},this.chain=function(){return d=arguments,this},this.onStart=function(n){return v=n,this},this.onUpdate=function(n){return w=n,this},this.onComplete=function(n){return M=n,this},this.onStop=function(n){return T=n,this},this.update=function(n){var c,T,N;if(l>n)return!0;I===!1&&(null!==v&&v.call(r,r),I=!0),T=(n-l)/o,T=T>1?1:T,N=p(T);for(c in e)if(void 0!==i[c]){var O=i[c]||0,W=e[c];W instanceof Array?r[c]=E(W,N):("string"==typeof W&&(W="+"===W.charAt(0)||"-"===W.charAt(0)?O+parseFloat(W):parseFloat(W)),"number"==typeof W&&(r[c]=O+(W-O)*N))}if(null!==w&&w.call(r,N),1===T){if(a>0){isFinite(a)&&a--;for(c in u){if("string"==typeof e[c]&&(u[c]=u[c]+parseFloat(e[c])),f){var m=u[c];u[c]=e[c],e[c]=m}i[c]=u[c]}return f&&(s=!s),l=void 0!==t?n+t:n+h,!0}null!==M&&M.call(r,r);for(var g=0,y=d.length;y>g;g++)d[g].start(l+o);return!1}return!0}},TWEEN.Easing={Linear:{None:function(n){return n}},Quadratic:{In:function(n){return n*n},Out:function(n){return n*(2-n)},InOut:function(n){return(n*=2)<1?.5*n*n:-.5*(--n*(n-2)-1)}},Cubic:{In:function(n){return n*n*n},Out:function(n){return--n*n*n+1},InOut:function(n){return(n*=2)<1?.5*n*n*n:.5*((n-=2)*n*n+2)}},Quartic:{In:function(n){return n*n*n*n},Out:function(n){return 1- --n*n*n*n},InOut:function(n){return(n*=2)<1?.5*n*n*n*n:-.5*((n-=2)*n*n*n-2)}},Quintic:{In:function(n){return n*n*n*n*n},Out:function(n){return--n*n*n*n*n+1},InOut:function(n){return(n*=2)<1?.5*n*n*n*n*n:.5*((n-=2)*n*n*n*n+2)}},Sinusoidal:{In:function(n){return 1-Math.cos(n*Math.PI/2)},Out:function(n){return Math.sin(n*Math.PI/2)},InOut:function(n){return.5*(1-Math.cos(Math.PI*n))}},Exponential:{In:function(n){return 0===n?0:Math.pow(1024,n-1)},Out:function(n){return 1===n?1:1-Math.pow(2,-10*n)},InOut:function(n){return 0===n?0:1===n?1:(n*=2)<1?.5*Math.pow(1024,n-1):.5*(-Math.pow(2,-10*(n-1))+2)}},Circular:{In:function(n){return 1-Math.sqrt(1-n*n)},Out:function(n){return Math.sqrt(1- --n*n)},InOut:function(n){return(n*=2)<1?-.5*(Math.sqrt(1-n*n)-1):.5*(Math.sqrt(1-(n-=2)*n)+1)}},Elastic:{In:function(n){return 0===n?0:1===n?1:-Math.pow(2,10*(n-1))*Math.sin(5*(n-1.1)*Math.PI)},Out:function(n){return 0===n?0:1===n?1:Math.pow(2,-10*n)*Math.sin(5*(n-.1)*Math.PI)+1},InOut:function(n){return 0===n?0:1===n?1:(n*=2,1>n?-.5*Math.pow(2,10*(n-1))*Math.sin(5*(n-1.1)*Math.PI):.5*Math.pow(2,-10*(n-1))*Math.sin(5*(n-1.1)*Math.PI)+1)}},Back:{In:function(n){var t=1.70158;return n*n*((t+1)*n-t)},Out:function(n){var t=1.70158;return--n*n*((t+1)*n+t)+1},InOut:function(n){var t=2.5949095;return(n*=2)<1?.5*n*n*((t+1)*n-t):.5*((n-=2)*n*((t+1)*n+t)+2)}},Bounce:{In:function(n){return 1-TWEEN.Easing.Bounce.Out(1-n)},Out:function(n){return 1/2.75>n?7.5625*n*n:2/2.75>n?7.5625*(n-=1.5/2.75)*n+.75:2.5/2.75>n?7.5625*(n-=2.25/2.75)*n+.9375:7.5625*(n-=2.625/2.75)*n+.984375},InOut:function(n){return.5>n?.5*TWEEN.Easing.Bounce.In(2*n):.5*TWEEN.Easing.Bounce.Out(2*n-1)+.5}}},TWEEN.Interpolation={Linear:function(n,t){var r=n.length-1,i=r*t,e=Math.floor(i),u=TWEEN.Interpolation.Utils.Linear;return 0>t?u(n[0],n[1],i):t>1?u(n[r],n[r-1],r-i):u(n[e],n[e+1>r?r:e+1],i-e)},Bezier:function(n,t){for(var r=0,i=n.length-1,e=Math.pow,u=TWEEN.Interpolation.Utils.Bernstein,o=0;i>=o;o++)r+=e(1-t,i-o)*e(t,o)*n[o]*u(i,o);return r},CatmullRom:function(n,t){var r=n.length-1,i=r*t,e=Math.floor(i),u=TWEEN.Interpolation.Utils.CatmullRom;return n[0]===n[r]?(0>t&&(e=Math.floor(i=r*(1+t))),u(n[(e-1+r)%r],n[e],n[(e+1)%r],n[(e+2)%r],i-e)):0>t?n[0]-(u(n[0],n[0],n[1],n[1],-i)-n[0]):t>1?n[r]-(u(n[r],n[r],n[r-1],n[r-1],i-r)-n[r]):u(n[e?e-1:0],n[e],n[e+1>r?r:e+1],n[e+2>r?r:e+2],i-e)},Utils:{Linear:function(n,t,r){return(t-n)*r+n},Bernstein:function(n,t){var r=TWEEN.Interpolation.Utils.Factorial;return r(n)/r(t)/r(n-t)},Factorial:function(){var n=[1];return function(t){var r=1;if(n[t])return n[t];for(var i=t;i>1;i--)r*=i;return n[t]=r,r}}(),CatmullRom:function(n,t,r,i,e){var u=.5*(r-n),o=.5*(i-t),a=e*e,f=e*a;return(2*t-2*r+u+o)*f+(-3*t+3*r-2*u-o)*a+u*e+t}}},function(n){"function"==typeof define&&define.amd?define([],function(){return TWEEN}):"undefined"!=typeof module&&"object"==typeof exports?module.exports=TWEEN:void 0!==n&&(n.TWEEN=TWEEN)}(this);