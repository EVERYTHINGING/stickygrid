/* Stickygrid Copyright 2017 Michael Parisi (EVERYTHINGING) */

SG.GridItem = function(el, tl, tr, br, bl, smallWidth, smallHeight){
	var that = this;
	var $el = el;
	this.tl = tl;
	this.tr = tr;
	this.br = br;
	this.bl = bl;
	this.tlOrig = tl.copy();
	this.trOrig = tr.copy();
	this.brOrig = br.copy();
	this.blOrig = bl.copy();
	var width = $el.width();
	var height = $el.height();
	var elPosOrig = $el.position();
	if(elPosOrig.left != 0){ elPosOrig.left -= width+smallWidth; }
	if(elPosOrig.top != 0){ elPosOrig.top -= height+smallHeight; }
	$el.css({ left: elPosOrig.left, top: elPosOrig.top });

	var selected = false;

	var tweenDelayMax = 200;
	var tweenSpeed = 500;

	this.init = function(){
		$el.css({ "background-color": "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")" });
		this.addListeners();
	}

	this.addListeners = function(){
		$el.on("mouseover", function(){
			
		});
		$el.on("mouseout", function(){
			
		});
		$el.on("click", function(){
			that.onClick();
		});
	};

	this.onClick = function(){
		if(!selected){
			SG.events.dispatch(SG.ItemClickEvent, { item: that });
		}else{
			that.unselect();
		}
	};

	this.select = function(){
		selected = true; 
		
		var percentageX = width/SG.windowWidth;
		var percentageY = height/SG.windowHeight;
		var offsetX = (SG.windowWidth-(SG.windowWidth*percentageX))/2;
		var offsetY = (SG.windowHeight-(SG.windowHeight*percentageY))/2;

		var wrL = $el.parent().offset().left;
		var wrT = $el.parent().position().top;
		var wW = SG.windowWidth - wrL;
		var wH = (SG.isIOS)? SG.windowHeight + parseInt(window.pageYOffset, 10) : SG.windowHeight + SG.$document.scrollTop();

		var tlX = 0 - wrL + offsetX;
		var tlY = SG.$document.scrollTop() - wrT + offsetY;
		var trX = wW - offsetX;
		var trY = SG.$document.scrollTop() - wrT + offsetY;
		var brX = wW - offsetX;
		var brY = wH - wrT - offsetY;
		var blX = 0 - wrL + offsetX;
		var blY = wH - wrT - offsetY;

		var rand1 = Math.abs((Math.random()*tweenDelayMax)-(tweenDelayMax/2));
		var rand2 = Math.abs((Math.random()*tweenDelayMax)-(tweenDelayMax/2));
		var rand3 = Math.abs((Math.random()*tweenDelayMax)-(tweenDelayMax/2));
		var rand4 = Math.abs((Math.random()*tweenDelayMax)-(tweenDelayMax/2));

		var maxDelay = Math.max(rand1, rand2, rand3, rand4);

		var tweenTL = new TWEEN.Tween(that.tl)
							   .to({ x: tlX, y: tlY }, tweenSpeed)
							   .delay(rand1)
							   .easing(TWEEN.Easing.Elastic.Out)
							   .start();
		var tweenTR = new TWEEN.Tween(that.tr)
							   .to({ x: trX, y: trY }, tweenSpeed)
							   .delay(rand2)
							   .easing(TWEEN.Easing.Elastic.Out)
							   .start();
		var tweenBR = new TWEEN.Tween(that.br)
							   .to({ x: brX, y: brY }, tweenSpeed)
							   .delay(rand3)
							   .easing(TWEEN.Easing.Elastic.Out)
							   .start();
		var tweenBL = new TWEEN.Tween(that.bl)
							   .to({ x: blX, y: blY }, tweenSpeed)
							   .delay(rand4)
							   .easing(TWEEN.Easing.Elastic.Out)
							   .start();

		setTimeout(function(){
			tweenTL.stop();
			tweenTR.stop();
			tweenBR.stop();
			tweenBL.stop();
			if(selected){ SG.events.dispatch(SG.ItemOpenedEvent, { item: that }); }
		}, tweenSpeed+maxDelay+100);
	};

	this.unselect = function(){
		selected = false;
		SG.events.dispatch(SG.ItemUnClickEvent, { item: that });
	};

	this.removeListeners = function(){
		$el.off("mouseover");
		$el.off("mouseout");
		$el.off("click");
	};

	this.resetEl = function(){
		if (SG.isIOS){
			$el.css("webkitTransform", "none");
		}else{
			$el.css(SG.VendorTransform, "none");
		}

		this.removeListeners();
	};

	this.update = function(){
		if(!this.tlOrig.equals(that.tl) || !this.trOrig.equals(that.tr) || !this.brOrig.equals(that.br) || !this.blOrig.equals(that.bl)){

			SG.ComputeMatrix.transform2d($el[0], 
						that.tl.x - elPosOrig.left,
						that.tl.y - elPosOrig.top,
						that.tr.x - elPosOrig.left,
						that.tr.y - elPosOrig.top,
						that.bl.x - elPosOrig.left,
						that.bl.y - elPosOrig.top,
						that.br.x - elPosOrig.left,
						that.br.y - elPosOrig.top,
						Number(selected));

		}

		if(selected){
			TWEEN.update();
		}
	}
}

SG.Grid = function(gridSelector, itemSelector, opts){
	var that = this;

	var $gridElement = $(gridSelector);

	var $itemElements;
	var points;
	var items;
	var $firstItem;
	var numItems;
	var itemWidth;
	var itemHeight;
	var numItemsX;
	var numItemsY;
	var pointsArrayXY;
	var selectedItem = null;

	var lastScrolledLeft = 0, lastScrolledTop = 0;
	var mouseX = 100000, mouseY = 100000;
	var run = true;

	var defaults = {
		maxProx: 300,
		speed: -100,
		speedMulti: 1,
		maxOffset: 20,
		newItemSelectDelay: 100,
	};

	var options = $.extend({}, defaults, opts);

	this.init = function(){
		$itemElements = $(itemSelector);
		points = [];
		items = [];
		$firstItem = $itemElements.eq(0);
		numItems = $itemElements.length;
		itemWidth = Math.round(SG.windowWidth/4.5);
		itemHeight = Math.round(SG.windowHeight/3);
		numItemsX = 3;
		numItemsY = Math.ceil(numItems/numItemsX, 10);
		pointsArrayXY = [];
		
		$gridElement.width(numItemsX*itemWidth);
		$gridElement.height(numItemsY*itemHeight);

		var p, i = 0;

		for(var y = 0; y < numItemsY+1; y++)
		{				
			pointsArrayXY[y] = [];
			
			for(var x = 0; x < numItemsX+1; x++)
			{
				var offset = new SG.Point((Math.random()*(options.maxOffset*2))-options.maxOffset, (Math.random()*(options.maxOffset*2))-options.maxOffset);

				p = new SG.Point(x*itemWidth+offset.x, y*itemHeight+offset.y);
				pointsArrayXY[y][x] = p;
				points.push(p);
				
				if(x > 0 && y > 0 && i < $itemElements.length)
				{
					var gridItem = new SG.GridItem($itemElements.eq(i),
												pointsArrayXY[y-1][x-1],
												pointsArrayXY[y-1][x],
												pointsArrayXY[y][x],
												pointsArrayXY[y][x-1],
												itemWidth,
												itemHeight);
					gridItem.init();
					items.push(gridItem);
					i++;
				}
			}
		}
	};

	this.addListeners = function(){
		SG.$window.on("mousemove", this.onMouseMove);

		if (SG.isIOS){
			document.addEventListener("touchmove", this.onTouchMove, false);
		}

		SG.$window.scroll(function(event) {
			if(lastScrolledLeft != SG.$document.scrollLeft()){
	            mouseX -= lastScrolledLeft;
	            lastScrolledLeft = SG.$document.scrollLeft();
	            mouseX += lastScrolledLeft;
	        }
	        if(lastScrolledTop != SG.$document.scrollTop()){
	            mouseY -= lastScrolledTop;
	            lastScrolledTop = SG.$document.scrollTop();
	            mouseY += lastScrolledTop;
	        }
	    });

	    SG.$window.on("resize", function(){
			that.resize();
		});

	    SG.events.addListener(SG.ItemClickEvent, that.onItemClick);
	    SG.events.addListener(SG.ItemUnClickEvent, that.onItemUnClick);
	    SG.events.addListener(SG.ItemOpenedEvent, that.onItemOpened);
	};

	this.onTouchMove = function(e){
		var first = e.touches.item(0); 
		mouseX = first.pageX - parseInt($gridElement.offset().left, 10);
		mouseY = first.pageY - parseInt($gridElement.position().top, 10);
		e.preventDefault();
	};

	this.onMouseMove = function(e){
		mouseX = e.pageX - parseInt($gridElement.offset().left, 10)
		mouseY = e.pageY - parseInt($gridElement.position().top, 10)
	};

	this.onItemClick = function(e){
		if(selectedItem != null){
			selectedItem.unselect();
			setTimeout(function(){
				selectedItem = e.data.item;
				selectedItem.select();
				SG.$body.css({ overflow: "hidden" });
			}, options.newItemSelectDelay);
		}else{
			selectedItem = e.data.item;	
			selectedItem.select();
			SG.$body.css({ overflow: "hidden" });
		}
	};

	this.onItemUnClick = function(e){
		SG.$document.scrollTop(selectedItem.tlOrig.y);
		selectedItem = null;
		SG.$body.css({ overflow: "inherit" });
		$gridElement.css("transform-style", "preserve-3d");
		run = true;
	};

	this.onItemOpened = function(e){
		run = false;
		$gridElement.css("transform-style", "flat");
	};

	var p, prox, angle, distanceX, distanceY;
	var centerX, centerY;
	var i, j, item;

	this.update = function(){
		if(run){
		
			for(i = 0; i < points.length; i++){
				p = points[i];

				if(selectedItem == null){
					distanceX = p.x - mouseX;
					distanceY = p.y - mouseY;
					prox = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

					p.x = (p.x - (distanceX/prox)*(options.maxProx/prox)*options.speed*options.speedMulti) - ((p.x - p.origX)/2);
					p.y = (p.y - (distanceY/prox)*(options.maxProx/prox)*options.speed*options.speedMulti) - ((p.y - p.origY)/2);

				}else if(p != selectedItem.tl && p != selectedItem.tr && p != selectedItem.br && p != selectedItem.bl){
					centerX = (selectedItem.tlOrig.x + (selectedItem.trOrig.x-selectedItem.tlOrig.x));
					centerY = (selectedItem.tlOrig.y + (selectedItem.blOrig.y-selectedItem.tlOrig.y));
					distanceX = p.origX - centerX;
					distanceY = p.origY - centerY;
					prox = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
					angle = Math.atan2(distanceY, distanceX);

					p.x = (p.origX + (distanceX*10));
					p.y = (p.origY + (distanceY*10));
				}
			}
			
			for(j = 0; j < items.length; j++){
				item = items[j];
				item.update();
			}			
		}

		window.requestAnimationFrame(that.update);
	};

	this.resize = function(){
		run = false;

		SG.windowWidth = SG.$window.width();
		SG.windowHeight = SG.$window.height();

		if(selectedItem){ selectedItem.unselect(); }

		for(var i = 0; i < items.length; i++){
			items[i].resetEl();
		}

		this.init();

		run = true;
	};

	this.init();
	this.addListeners();
	this.update();
}