(function($) {

	$(function(){
		$('.grid').each(function(index){
			var run = index === 0 ? true : false;
			var grid = new SG.Grid($(this), '.grid-item', { numItemsX: 3, 
															itemWidthPercentage: 20,
															itemHeightPercentage: 30,
															run: true
														  });
		});
	});

})(jQuery);