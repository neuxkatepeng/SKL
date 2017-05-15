var em = function(){};
console = {log: em, debug: em, info: em, warn: em};

function sklCalendar(conf){

	// target: jQuery Object
	// chartId: String，圖表 id
	// chartData: Array，資料數值
	// chartColor: String，圖表顏色
	// level: Array，金額級距
	// callback: function({
	// 	month: text
	// })

	

	var target = conf.target,
		chartId = conf.chartId,
		chartData = conf.hasOwnProperty('chartData')? conf.chartData:[],
		levelData = conf.hasOwnProperty('level')? conf.level:[],
		chartColor = conf.hasOwnProperty('chartColor')? conf.chartColor:'#e2231a';

	// create calendar slide
	var calendar_target = target.find('.skl-calendar-slider-container');

	GardenUtils.plugin.slider({
	  	target: calendar_target,
	  	options: {
	    	isFull: false,
		    loop: false,
		    autoplay: false,
		    margin: 0,
		    page: {
	      		isDisable: false
	    	},
		    navigation: {
		      	isDisable: false
		    }
	  	}
	});

	// create chart
	function _createCalendarChart(chart_conf){
		var chartId = chart_conf.chartId,
			chartColor = chart_conf.hasOwnProperty('chartColor')? chart_conf.chartColor:'',
			chartData = chart_conf.hasOwnProperty('chartData')? chart_conf.chartData:[],
			levelData = chart_conf.hasOwnProperty('levelData')? chart_conf.levelData:[];

		var chart_w = $('.skl-calendar-container:visible').width()+40;

		// active item
		var container = $('#'+chartId).parents('.skl-calendar-container').first();
		var calendarItem = container.find('.skl-calendar-item');
		var activeItem = container.find('.skl-calendar-item.active');
		var activeItem_i = calendarItem.index( activeItem );

		// create data point & color set
		var dataPoints = [], colorSet = [];

		// create dataPoints
		$.each(chartData, function(i, money){
			var match = -1;
	        $.each(levelData, function(j, levelNum) {
	        	// console.log('match', levelNum, money, match);
	            if (levelNum <= money && levelNum > match) {
	                match = (j+1);
	            }
	        });

	        if( match != -1 ){
	            var level = match;
	            dataPoints.push({
	            	y: level, 
	            	label: GardenUtils.format.convertThousandComma(money)
	            });
	        }
		}); // end each: chartData

		// console.log('dataPoints', dataPoints);

		var inactive_color = GardenUtils.display.convertOpacityToHex({
			color: chartColor,
			opacity: 0.5
		});
		$.each(chartData, function(i){
			if( i != activeItem_i ){
				colorSet.push( inactive_color );
			} else {
				colorSet.push( chartColor );
				dataPoints[i]['indexLabelFontColor'] = chartColor;
			}
		});

		GardenUtils.plugin.chart({
		  	chartId: chartId,
		  	height: 100,
		  	width: chart_w,
		  	interactivityEnabled: true,
		  	colorSet: {
		  		name: 'calendar',
		  		colorArray: colorSet
		  	},
		  	axisX: {
		    	isShowLine: false,
		    	isShowLabel: false,
		    	// valueFormatString: "MM",
		    	margin: -25
		  	},
		  	axisY: {
		    	isShowLine: false,
			    isShowLabel: false,
			    labelMaxWidth: 20,
			    maximum: (levelData.length*2 +1)
		  	},
		  	dataArray: [{
			    type: 'column',
			    xValueType: "number", // or number
			    labelPlacement: 'outside',
			    indexLabel: "{label}",
			    indexLabelFontColor: inactive_color, //"#ea8a86",
			    indexLabelFontSize: "13.5",
			    indexLabelMaxWidth: 60,
                click: _chartItemClick,
			    dataPoints: dataPoints
		  	}]
		});

		function _chartItemClick(e){
			var click_i = e.dataPointIndex;
			var container = $('#'+chartId).parents('.skl-calendar-container').first();

			container.find('.skl-calendar-item').eq(click_i).trigger('click');
		}; // end _chartItemClick function
	}; // end _createCalendarChart function
	
	_createCalendarChart({
		chartId: chartId,
		chartColor: chartColor,
		chartData: chartData,
		levelData: levelData
	});

	// calendar item click
	target.find('.skl-calendar-slider .skl-calendar-item').on('click', function(ev){
		ev.preventDefault();

		var container = $(this).parents('.skl-calendar-container').first();

		// pc calendar slider
		var calendarItems = $(this).parents('.skl-calendar-slider').first().find('.skl-calendar-item');
		calendarItems.removeClass('active');
		$(this).toggleClass('active');

		// mobile calendar slider
		var activeItem_i = calendarItems.index( $(this) );
		var mobileItems = container.find('.ga-slider-container .skl-calendar-item');
		mobileItems.removeClass('active');
		mobileItems.eq( activeItem_i ).toggleClass('active');

		var mobileSlider = container.find('.ga-slider-container').first();
		var slideActive_i = activeItem_i==0? 0:parseInt(activeItem_i/4);
		mobileSlider.find('.owl-dot').eq( slideActive_i ).trigger('click');
        var items_ele = mobileSlider.find('.owl-item');
        if( slideActive_i == 0 ){
            mobileSlider.find('.ga-slider-prev').css('opacity', '.3');
            mobileSlider.find('.ga-slider-next').css('opacity', '1');
        } else if( slideActive_i == items_ele.length-1 ){
            mobileSlider.find('.ga-slider-prev').css('opacity', '1');
            mobileSlider.find('.ga-slider-next').css('opacity', '.3');
        } else {
            mobileSlider.find('.ga-slider-prev, .ga-slider-next').css('opacity', '1');
        }


		// has callback
		if( conf.hasOwnProperty('callback') ){
			conf.callback({
				month: $(this).find('.skl-calendar-month').text()
			});
		}

		_createCalendarChart({
			chartId: chartId,
			chartColor: chartColor,
			chartData: chartData,
			levelData: levelData
		});
	}); // end click: skl-calendar-item

	target.find('.ga-slider-container .skl-calendar-item').on('click', function(ev){
		ev.preventDefault();

		var container = $(this).parents('.skl-calendar-slider-container').first();
		var mobileItems = container.find('.ga-slider-container .skl-calendar-item');
		var activeItem_i = mobileItems.index( $(this) );

		container.find('.skl-calendar-slider .skl-calendar-item').eq( activeItem_i ).trigger('click');
	}); // end click: mobile skl-calendar-item


	$(window).resize(function(){
		var window_w = $(this).width();

		if( window_w > 767 ){

			_createCalendarChart({
				chartId: chartId,
				chartColor: chartColor,
				chartData: chartData,
				levelData: levelData
			});
		}
	}); // end resize

	var defaultActive = target.find('.skl-calendar-slider .skl-calendar-item.active');
	if(defaultActive.length > 0){
		setTimeout(function(){
			defaultActive.first().trigger('click');
		}, 550);
	}

}; // end sklCalendar function

function sklCalendarDetail(conf){

	var target = conf.target;

	function _countSlideWidthLeft(slideLeft_conf) {

	    var viewerSlides = slideLeft_conf.viewerSlides;
	    var pieceWidth = slideLeft_conf.pieceWidth;
	    var slideSpeed = slideLeft_conf.slideSpeed;

	    var activePage = -1;
	    //先取得目前slider哪個active
	    $.each(viewerSlides,function(i,slide){
	        slide = $(slide);
	        if(slide.hasClass('activeItem')) {
	            activePage = slide.attr('data-slide-index');
	        }
	    });

	    // console.debug('activePage = ' + activePage);

	    $.each(viewerSlides,function(i,slide) {
	        slide = $(slide);

	        var pageNo = slide.attr('data-slide-index');
	        //要變成負數
	        if(parseInt(activePage) > parseInt(pageNo)) {
	            var between = parseInt(activePage) - parseInt(pageNo);
	            slide.animate({
	                'left': (between * pieceWidth * -1) + 'px'
	            },slideSpeed);
	        }
	        else if(parseInt(activePage) < parseInt(pageNo)) {
	            var between = parseInt(pageNo) - parseInt(activePage);
	            slide.animate({
	                'left': (between * pieceWidth) + 'px'
	            },slideSpeed);
	        }
	        else {
	            slide.animate({
	                'left': '0px'
	            },slideSpeed);
	        }

	        slide.css('width',pieceWidth + 'px');

	    });
	} // end _countSlideWidthLeft function

	function _setSlideItemPosition(slidePos_conf){
		var target = slidePos_conf.target;

		var detailSliderContainer = target.find('.skl-calendar-detail-container-lg .skl-calendar-detail-slider');
		var detailSliderItem = detailSliderContainer.find('.skl-calendar-detail-slider-item');
		detailSliderContainer.width( (detailSliderItem.length * detailSliderItem.first().width()) );
		detailSliderItem.each(function(i){
			$(this).attr('data-slide-index', i);
			$(this).css('left', ($(this).width() * i));
		});
	} // end _setSlideItemPosition function

	_setSlideItemPosition({
		target: target
	});

	target.find('.skl-calendar-detail-lg-btn').on('click', function(ev){
		ev.preventDefault();

		var calendarBtn = $(this);
		var prevBtn = $(), nextBtn = $();
		var itemShiftCount = 2;

		var sliderContainer = calendarBtn.parent().find('.skl-calendar-detail-slider');
		var slideItem = sliderContainer.find('.skl-calendar-detail-slider-item');

		var activeItem = sliderContainer.find('.activeItem');
		var activeItem_i = slideItem.index( sliderContainer.find('.activeItem') );

		if( calendarBtn.hasClass('skl-calendar-detail-slider-prev') ){
			prevBtn = calendarBtn;
			nextBtn = calendarBtn.next();

			activeItem.removeClass('activeItem');
			if( activeItem_i-itemShiftCount < 0 ){
				activeItem.prev().addClass('activeItem');
			} else {
				activeItem.prev().prev().addClass('activeItem');
			}
			
		} else {
			prevBtn = calendarBtn.prev();
			nextBtn = calendarBtn;
			
			activeItem.removeClass('activeItem');
			if( activeItem_i+itemShiftCount > slideItem.length-1 ){
				activeItem.next().addClass('activeItem');
			} else {
				activeItem.next().next().addClass('activeItem');
			}
		}

		var new_activeItem_i = slideItem.index( sliderContainer.find('.activeItem') );

		if( new_activeItem_i >= slideItem.length-itemShiftCount ){
			nextBtn.removeClass('active');
		} else if( new_activeItem_i <= 0 ){
			prevBtn.removeClass('active');
		} else {
			prevBtn.addClass('active');
			nextBtn.addClass('active');
		}

		_countSlideWidthLeft({
			viewerSlides: slideItem,
			pieceWidth: slideItem.first().width(),
			slideSpeed: 500
		});
	}); // end click: skl-calendar-detail-lg-btn

	target.find('.skl-calendar-detail-sm-btn').on('click', function(ev){
		ev.preventDefault();

		$(this).parent().find('.skl-calendar-detail-sm-btn').addClass('active');
		$(this).toggleClass('active');
	}); // end click: skl-calendar-detail-sm-btn

	$(window).resize(function(){
		var window_w = $(this).width();

		if( window_w > 1024 ){
			$('.skl-calendar-detail-container-lg .skl-calendar-detail-slider-container').scrollLeft(0);
			$('.skl-calendar-detail-container-lg .skl-calendar-detail-slider-container').removeAttr('style');
			$('.skl-calendar-detail-container-lg .skl-calendar-detail-slider-next.skl-calendar-detail-lg-btn').addClass('active');
			$('.skl-calendar-detail-container-lg .skl-calendar-detail-slider-container .skl-calendar-detail-slider-item').first().addClass('activeItem');
		} else {
			$('.skl-calendar-detail-container-lg .skl-calendar-detail-slider-container').css('overflow-x', 'scroll');
			$('.skl-calendar-detail-container-lg .skl-calendar-detail-slider-container .skl-calendar-detail-slider-item').removeAttr('style');
			$('.skl-calendar-detail-container-lg').each(function(){
				var target = $(this).parent();
				_setSlideItemPosition({
					target: target
				});
			});
			
			$('.skl-calendar-detail-lg-btn').removeClass('active');
		}
	});
}; // end sklCalendarDetail function
