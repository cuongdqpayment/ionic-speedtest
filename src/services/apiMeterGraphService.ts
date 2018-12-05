import { Injectable } from '@angular/core';

@Injectable()
export class ApiGraphService {
    private worker;
    constructor() { }
    
    initUI(bk, fg, prClor) {
        this.drawMeter(this.I("dlMeter"), 0, bk, fg, 0,prClor);
        this.I("dlText").textContent = "";
    }

    I(id) { return document.getElementById(id); }

    drawMeter(c, amount, bk, fg, progress, prog) {
        var ctx = c.getContext("2d");
        var dp = window.devicePixelRatio || 1;
        var cw = c.clientWidth * dp, ch = c.clientHeight * dp;
        var sizScale = ch * 0.0055;
        if (c.width == cw && c.height == ch) {
            ctx.clearRect(0, 0, cw, ch);
        } else {
            c.width = cw;
            c.height = ch;
        }
        ctx.beginPath();
        ctx.strokeStyle = bk;
        ctx.lineWidth = 16 * sizScale;
        ctx.arc(c.width / 2, c.height - 58 * sizScale, c.height / 1.8 - ctx.lineWidth, -Math.PI * 1.1, Math.PI * 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = fg;
        ctx.lineWidth = 16 * sizScale;
        ctx.arc(c.width / 2, c.height - 58 * sizScale, c.height / 1.8 - ctx.lineWidth, -Math.PI * 1.1, amount * Math.PI * 1.2 - Math.PI * 1.1);
        ctx.stroke();
        if (typeof progress !== "undefined") {
            ctx.fillStyle = prog;
            ctx.fillRect(c.width * 0.3, c.height - 16 * sizScale, c.width * 0.4 * progress, 4 * sizScale);
        }
    }

    mbpsToAmount(s) {
        return 1 - (1 / (Math.pow(1.3, Math.sqrt(s))));
    }

    msToAmount(s) {
        return 1 - (1 / (Math.pow(1.08, Math.sqrt(s))));
    }

    updateUI(data, bk, fg, prClor) {
        if (data){
            var status = data.testState;
            this.I("dlText").textContent = (status == 1 && data.dlStatus == 0) ? "..." : data.dlStatus;
            this.drawMeter(this.I("dlMeter"), this.mbpsToAmount(Number(data.dlStatus * (status == 1 ? this.oscillate() : 1))), bk, fg, Number(data.dlProgress), prClor);  
        }
    }

    oscillate() {
        return 1 + 0.02 * Math.sin(Date.now() / 100);
    }
    
}