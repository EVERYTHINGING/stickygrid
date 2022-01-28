/* Stickygrid Copyright 2017 Michael Parisi (EVERYTHINGING) */

/*
	TODO
	-performance enhancments (only update points and items if they are within a certain distance of being in the viewport)
*/

SG.GridItem = function(grid, el, tl, tr, br, bl){
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
		$el.addClass('selected');
		viewportInfo = grid.getViewportInfo();;

		var percentageX = width/viewportInfo.width;
		var percentageY = height/viewportInfo.height;
		var offsetX = 100;
		var offsetY = 100;

		// var wrL = viewportInfo.$el.offset().left;
		// var wrT = viewportInfo.$el.position().top;
		// var wW = viewportInfo.width - wrL;
		// var wH = (SG.isIOS)? viewportInfo.height + parseInt(window.pageYOffset, 10) : viewportInfo.height + viewportInfo.$el.scrollTop();

		// var tlX = 0 - wrL + offsetX;
		// var tlY = viewportInfo.$el.scrollTop() - wrT + offsetY;
		// var trX = wW - offsetX;
		// var trY = viewportInfo.$el.scrollTop() - wrT + offsetY;
		// var brX = wW - offsetX;
		// var brY = wH - wrT - offsetY;
		// var blX = 0 - wrL + offsetX;
		// var blY = wH - wrT - offsetY;

		var tl = { 
			x: viewportInfo.$el.position().left + offsetX,
			y: viewportInfo.$el.scrollTop() + (viewportInfo.$el.position().top + offsetY)
		};

		var tr = { 
			x: (viewportInfo.$el.position().left + viewportInfo.width) - offsetX,
			y: viewportInfo.$el.scrollTop() +  (viewportInfo.$el.position().top + offsetY)
		};

		var bl = { 
			x: viewportInfo.$el.position().left + offsetX,
			y: viewportInfo.$el.scrollTop() + ((viewportInfo.$el.position().top + viewportInfo.height) - offsetY),
		};

		var br = { 
			x: (viewportInfo.$el.position().left + viewportInfo.width) - offsetX,
			y: viewportInfo.$el.scrollTop() + ((viewportInfo.$el.position().top + viewportInfo.height) - offsetY),
		};


		var rand1 = Math.abs((Math.random()*tweenDelayMax)-(tweenDelayMax/2));
		var rand2 = Math.abs((Math.random()*tweenDelayMax)-(tweenDelayMax/2));
		var rand3 = Math.abs((Math.random()*tweenDelayMax)-(tweenDelayMax/2));
		var rand4 = Math.abs((Math.random()*tweenDelayMax)-(tweenDelayMax/2));

		var maxDelay = Math.max(rand1, rand2, rand3, rand4);

		var tweenTL = new TWEEN.Tween(that.tl)
							   .to({ x: tl.x, y: tl.y }, tweenSpeed)
							   .delay(rand1)
							   .easing(TWEEN.Easing.Elastic.Out)
							   .start();
		var tweenTR = new TWEEN.Tween(that.tr)
							   .to({ x: tr.x, y: tr.y }, tweenSpeed)
							   .delay(rand2)
							   .easing(TWEEN.Easing.Elastic.Out)
							   .start();
		var tweenBR = new TWEEN.Tween(that.bl)
							   .to({ x: bl.x, y: bl.y }, tweenSpeed)
							   .delay(rand3)
							   .easing(TWEEN.Easing.Elastic.Out)
							   .start();
		var tweenBL = new TWEEN.Tween(that.br)
							   .to({ x: br.x, y: br.y }, tweenSpeed)
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
		$el.removeClass('selected');
		SG.events.dispatch(SG.ItemUnClickEvent, { item: that });
	};

	this.removeListeners = function(){
		$el.off("mouseover");
		$el.off("mouseout");
		$el.off("click");
	};

	this.resetEl = function(){
		$el.css(SG.VendorTransform, "none");
		this.removeListeners();
	};

	this.update = function(){
		if(!this.tlOrig.equals(that.tl) || !this.trOrig.equals(that.tr) || !this.brOrig.equals(that.br) || !this.blOrig.equals(that.bl)){

			SG.ComputeMatrix.transform2d($el[0], 
										 that.tl.x,
										 that.tl.y,
										 that.tr.x,
										 that.tr.y,
										 that.bl.x,
										 that.bl.y,
										 that.br.x,
										 that.br.y,
										 Number(selected));

		}

		if(selected){
			TWEEN.update();
		}
	}
}

SG.Grid = function($gridElement, itemSelector, opts){
	var that = this;

	var $viewportElement = $gridElement.parent('.grid-wrapper').parent('.viewport');
	var viewportWidth = $viewportElement.width();
	var viewportHeight = $viewportElement.height();
	var $itemElements;
	var points;
	var items;
	var $firstItem;
	var numItems;
	var itemWidth;
	var itemHeight;
	var numItemsY;
	var pointsArrayXY;
	var selectedItem = null;

	var lastScrolledLeft = 0, lastScrolledTop = 0;
	var mouseX = 100000, mouseY = 100000;

	var defaults = {
		numItemsX: 3,
		itemWidthPercentage: 20,
		itemHeightPercentage: 30,
		maxProx: 300,
		speed: -100,
		speedMulti: 1,
		maxOffset: 20,
		newItemSelectDelay: 100,
		run: true
	};

	this.options = $.extend({}, defaults, opts);

	var run = this.options.run;

	this.init = function(){
		$itemElements = $gridElement.find("> "+itemSelector);
		points = [];
		items = [];
		$firstItem = $itemElements.eq(0);
		numItems = $itemElements.length;
		itemWidth = Math.round(viewportWidth*(that.options.itemWidthPercentage/100));
		itemHeight = Math.round(viewportHeight*(that.options.itemHeightPercentage/100));
		numItemsY = Math.ceil(numItems/that.options.numItemsX);
		pointsArrayXY = [];
		
		$gridElement.width(that.options.numItemsX*itemWidth);
		$gridElement.height(numItemsY*itemHeight);

		var p, i = 0;

		for(var y = 0; y < numItemsY+1; y++)
		{				
			pointsArrayXY[y] = [];
			
			for(var x = 0; x < that.options.numItemsX+1; x++)
			{
				var offset = new SG.Point((Math.random()*(that.options.maxOffset*2))-that.options.maxOffset, (Math.random()*(that.options.maxOffset*2))-that.options.maxOffset);

				p = new SG.Point(x*itemWidth+offset.x, y*itemHeight+offset.y);
				pointsArrayXY[y][x] = p;
				points.push(p);
				
				if(x > 0 && y > 0 && i < $itemElements.length)
				{
					var gridItem = new SG.GridItem(that, 
												   $itemElements.eq(i),
												   pointsArrayXY[y-1][x-1],
												   pointsArrayXY[y-1][x],
												   pointsArrayXY[y][x],
												   pointsArrayXY[y][x-1]);
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

		$viewportElement.scroll(function(event) {
			if(lastScrolledLeft != $viewportElement.scrollLeft()){
	            mouseX -= lastScrolledLeft;
	            lastScrolledLeft = $viewportElement.scrollLeft();
	            mouseX += lastScrolledLeft;
	        }
	        if(lastScrolledTop != $viewportElement.scrollTop()){
	            mouseY -= lastScrolledTop;
	            lastScrolledTop = $viewportElement.scrollTop();
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
			}, that.options.newItemSelectDelay);
		}else{
			selectedItem = e.data.item;	
			selectedItem.select();
			SG.$body.css({ overflow: "hidden" });
		}

		$viewportElement.css("overflow-y", "hidden");
		//setTimeout(function(){ run = false; }, 2000);
	};

	this.onItemUnClick = function(e){
		$viewportElement.scrollTop(selectedItem.tlOrig.y);
		selectedItem = null;
		SG.$body.css({ overflow: "inherit" });
		$gridElement.css("transform-style", "preserve-3d");
		$viewportElement.css("overflow-y", "scroll");
		run = true;
	};

	this.onItemOpened = function(e){
		//run = false;
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

					p.x = (p.x - (distanceX/prox)*(that.options.maxProx/prox)*that.options.speed*that.options.speedMulti) - ((p.x - p.origX)/2);
					p.y = (p.y - (distanceY/prox)*(that.options.maxProx/prox)*that.options.speed*that.options.speedMulti) - ((p.y - p.origY)/2);

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

		viewportWidth = $viewportElement.width();
		viewportHeight = $viewportElement.height();

		if(selectedItem){ selectedItem.unselect(); }

		for(var i = 0; i < items.length; i++){
			items[i].resetEl();
		}

		this.init();

		run = true;
	};

	this.getViewportInfo = function(){
		return { $el: $viewportElement, width: viewportWidth, height: viewportHeight }
	};

	this.init();
	this.addListeners();
	this.update();
}