/**
 * Created with IntelliJ IDEA.
 * User: Titan
 * Date: 2016/3/7
 * Time: 下午 2:28
 * To change this template use File | Settings | File Templates.
 */

var GardenUtils = {
    plugin: {
        showGoogleMap: function(obj) {

            //            var obj = {
            //                divId : 'googlemap',,
            //                zoom : 15,
            //                address : '',
            //                dialog : '',
            //                icon : 'img/marker_bank.png',
            //                scrollwheel : false,
            //                showDialog : true,
            //                streetPosition: RIGHT_BOTTOM,
            //                zoomPosition: RIGHT_BOTTOM,
            //                mapColorStyle: '',            // default, lightGray
            //                callback: function(){}
            //            };

            console.debug('before', obj);

            obj = $.extend({
                scrollwheel: false,
                zoomPosition: 'RIGHT_BOTTOM',
                streetPosition: 'RIGHT_BOTTOM'
            }, obj);

            console.debug('after', obj);
            var zoom = obj.zoom;
            if (zoom == undefined) zoom = 15;

            var icon = obj.icon;
            if (icon == undefined) icon = '';

            var googleAddr = [];
            var googleAddrDialog = [];

            if ($.isArray(obj.address)) {
                googleAddr = obj.address;
            } else {
                googleAddr.push(obj.address);
            }

            if (obj.dialog != undefined) {
                if ($.isArray(obj.address)) {
                    googleAddrDialog = obj.dialog;
                } else {
                    googleAddrDialog.push(obj.dialog);
                }
            } else {
                googleAddrDialog.push('');
            }

            if( obj.hasOwnProperty('mapColorStyle') ){
                var mapColorStyles = 'default';
                switch( obj.mapColorStyle ){
                    case 'lightGray':
                        mapColorStyles = [{"featureType":"administrative","elementType":"all","stylers":[{"saturation":"-100"}]},{"featureType":"administrative.province","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","elementType":"all","stylers":[{"saturation":-100},{"lightness":"50"},{"visibility":"simplified"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":"-100"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"all","stylers":[{"lightness":"30"}]},{"featureType":"road.local","elementType":"all","stylers":[{"lightness":"40"}]},{"featureType":"transit","elementType":"all","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]},{"featureType":"water","elementType":"labels","stylers":[{"lightness":-25},{"saturation":-100}]}];
                        break;
                    default: mapColorStyles = 'default';
                }
            }

            var isLoadGoogle = false;
            try {
                var geocoder = new google.maps.Geocoder();
                isLoadGoogle = true;
            } catch (e) {;
            }

            if (isLoadGoogle) {
                drawAddress(googleAddr);
            } else {
                try {
                    console.debug('try');
                    $.getScript("//maps.google.com/maps/api/js?sensor=true").done(function() {
                        drawAddress(googleAddr);
                    });
                } catch (err) {
                    console.debug(err.message);
                }
            }

            function drawAddress(googleAddr) {
                var geocoder = new google.maps.Geocoder();

                obj['zoomPosition'] = google_postion(obj.zoomPosition);
                obj['streetPosition'] = google_postion(obj.streetPosition);

                function google_postion(posStr) {
                    switch (posStr) {
                        case 'BOTTOM_CENTER':
                            return google.maps.ControlPosition.BOTTOM_CENTER;
                            break;
                        case 'BOTTOM_LEFT':
                            return google.maps.ControlPosition.BOTTOM_LEFT;
                            break;
                        case 'BOTTOM_RIGHT':
                            return google.maps.ControlPosition.BOTTOM_RIGHT;
                            break;
                        case 'LEFT_BOTTOM':
                            return google.maps.ControlPosition.LEFT_BOTTOM;
                            break;
                        case 'LEFT_CENTER':
                            return google.maps.ControlPosition.LEFT_CENTER;
                            break;
                        case 'LEFT_TOP':
                            return google.maps.ControlPosition.LEFT_TOP;
                            break;
                        case 'RIGHT_BOTTOM':
                            return google.maps.ControlPosition.RIGHT_BOTTOM;
                            break;
                        case 'RIGHT_CENTER':
                            return google.maps.ControlPosition.RIGHT_CENTER;
                            break;
                        case 'RIGHT_TOP':
                            return google.maps.ControlPosition.RIGHT_TOP;
                            break;
                        case 'TOP_CENTER':
                            return google.maps.ControlPosition.TOP_CENTER;
                            break;
                        case 'TOP_LEFT':
                            return google.maps.ControlPosition.TOP_LEFT;
                            break;
                        case 'TOP_RIGHT':
                            return google.maps.ControlPosition.TOP_RIGHT;
                            break;
                    }
                }

                var mapOptions = {
                    zoom: zoom,
                    scrollwheel: obj.scrollwheel,
                    // mapTypeId: google.maps.MapTypeId.ROADMAP
                    zoomControlOptions: {
                        position: obj.zoomPosition
                    },
                    streetViewControlOptions: {
                        position: obj.streetPosition //google.maps.ControlPosition.LEFT_BOTTOM
                    }
                };
                
                console.debug(mapOptions);
                console.debug('map div length = ' + $(obj.divId).length);
                
                //$('#mapDiv').css("height","500px");
                var map = new google.maps.Map(document.getElementById(obj.divId), mapOptions);

                if( mapColorStyles != 'default' ){
                    map.setOptions({styles: mapColorStyles});
                }

                function _okHandler(results,i,address) {
                    map.setCenter(results[0].geometry.location);

                            var tmpImg = $('<img src="' + icon + '"></img>');
                            tmpImg.appendTo($('body'));

                            tmpImg.load(function() {
                                var imgWidth = $(this).width();
                                var imgHeight = $(this).height();

                                tmpImg.remove();

                                var marker = new google.maps.Marker({
                                    map: map,
                                    position: results[0].geometry.location,
                                    icon: {
                                        //size: new google.maps.Size(50, 58),
                                        size: new google.maps.Size(imgWidth, imgHeight),
                                        url: icon
                                    }
                                });

                                //當有Dialog時才綁事件
                                
                                if (googleAddrDialog.length != 0 && googleAddrDialog[0] != '') {
                                    
                                    var infowindow = new google.maps.InfoWindow({
                                        content: googleAddrDialog[i]
                                            /*,
                                                                                     pixelOffset: new google.maps.Size(0, 170)*/
                                    });

                                    google.maps.event.addListener(marker, 'click', function() {
                                        infowindow.open(map, marker);
                                    });

                                    if (obj.showDialog) {
                                        google.maps.event.trigger(marker, 'click');
                                    }
                                }

                                if( obj.hasOwnProperty('callback') ){
                                    obj.callback();
                                }
                            });
                }
                
                function addMarker(i,address) {
                    console.debug('address = ' + address);
                    geocoder.geocode({
                        'address': address
                    }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            _okHandler(results,i,address);

                        } //if
                        else {
                            console.debug('GoogleMap geocode status = '+status);
                            
                            if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                                setTimeout(function() { addMarker(i,address); }, (1000 * 1));
                            }
                            
                            
                        } //else
                    });
                }
                
                $.each(googleAddr, function(i, address) {
                    addMarker(i,address);
                });

                //試看看能不能處理掉IE第一次灰色問題
                $(window).resize();
            }
        },

        screenMoveToEle: function(obj) {

            //            var obj = {
            //                moveToObj : jquery obj,
            //                minHeight : 30
            //            };

            obj = $.extend({
                minHeight: 0
            }, obj);

            console.debug(obj);
            console.debug('top = ' + $(obj.moveToObj).offset().top);
            $('html, body').animate({
                'scrollTop': ($(obj.moveToObj).offset().top - obj.minHeight)
            }, 1000);
        },

        //開始倒數固定時間，若時間內無任何動作，在倒數幾秒內可以呼叫callback function，當畫面點擊任何動作則會倒數計時
        useCountDown: function(obj) {

            //            var obj = {
            //                totalTime : 600, //總時間(秒)
            //                countDownTime : 60, //倒數多少時間後呼叫countDownFn(秒)
            //                countDownFn : function(){}, //倒數多少時間後呼叫的function
            //                countDownIntervalFn : function(){}, //開始倒數每一秒會呼叫callback function
            //                overTimeFn : function(){} //時間到了的function
            //            };

            var totalTime = obj.totalTime;
            var countDownTime = obj.countDownTime;
            var isFinish = false;

            //每秒減1
            setInterval(function() {
                totalTime--;

                //console.debug('totalTime = ' + totalTime);

                //如果時間到了最後倒數，則呼叫callback function
                if (totalTime == countDownTime) {
                    if (obj.countDownFn != undefined) {
                        obj.countDownFn.apply(window, [totalTime]);
                    }
                }

                //如果已經在最後時限，每一秒可以呼叫callback function
                if (totalTime != 0 && countDownTime > totalTime) {
                    if (obj.countDownIntervalFn != undefined) {
                        obj.countDownIntervalFn.apply(window, [totalTime]);
                    }
                }

                //如果時間已經倒數完了，則呼叫callback function
                if (totalTime == 0) {
                    if (obj.overTimeFn != undefined) {
                        obj.overTimeFn.apply(window, []);
                    }

                    isFinish = true;
                }
            }, 1000);

            //綁在body上，點擊畫面任何動作都會重新計算
            $('body').on('click', function() {
                console.debug('on body click');

                if (!isFinish) {
                    totalTime = obj.totalTime;
                }
            });

        },
        print : function(obj) {
        
            var html = obj.html;

            $.ajax({
                type : 'post',
                url : ajaxPrefix + 'jsp/print.jsp?action=save',
                data : {
                    html : html
                },
                success : function(){
                    window.open(ajaxPrefix+'jsp/print.jsp?action=print');
                }
            });
            
        },

        slider: function(conf) {

            ///////////////////////////////////
            // var conf = {
            //     target: ,                    // jQuery Obj
            //     options: {
            //         isFull: true,            // Boolean, 
            //         loop: true,              // Boolean, Infinity loop.
            //         autoplay: true,          // Boolean, Autoplay.
            //         margin: 10,              // Number, margin-right(px) on item.
            //         items: 1,                // Number, The number of items you want to see on the screen.
            //         itemsClass: '',          // String, owl-item class.
            //         carouselClass: '',       // String, owl-carousel class.
            //         page: {
            //             isDisable: false,    // Boolean.
            //             type: 'dot',         // String, Pagination type. 'text' or 'dot'.
            //             textMaxLength: 9,    // Number, the max length of pagination's text.
            //             pageClass: '',       // String, Pagination class.
            //             containerClass: '',  // String, Pagination container class.
            //             pageSpeed: 2000      // Number, Pagination speed.
            //         },
            //         navigation :{
            //             isDisable: true,     // Boolean.
            //             prevClass: '',       // String, prev button class.
            //             nextClass: ''        // String, next button class.
            //         },
            //         event: {
            //             touchDrag  : true,   // Boolean, Touch drag enabled.
            //             mouseDrag  : true    // Boolean, Mouse drag enabled.
            //         }   
            //     },
            //     datas: [{                    // Array.
            //         title: ''                // String, If page.type is 'text'.
            //         content: ''              // String, HTML allowed.
            //     }]
            // };
            ///////////////////////////////////

            var target = conf.target,
                options = $.extend({
                    isFull: true,
                    loop: true,
                    autoplay: true,
                    margin: 10,
                    items: 1,
                    itemsClass: '',
                    carouselClass: '',
                    page: {},
                    navigation: {},
                    event: {}
                }, conf.options),
                datas = [];//conf.datas;

                options.page = $.extend({
                    isDisable: false,
                    type: 'dot',
                    textMaxLength: 9,
                    pageClass: '',
                    containerClass: '',
                    pageSpeed: 2000
                }, options.page);

                options.navigation = $.extend({
                    isDisable: true,
                    prevClass: '',
                    nextClass: ''
                }, options.navigation);

                options.event = $.extend({
                    touchDrag  : true,
                    mouseDrag  : true
                }, options.event);

            //console.log('options', options);

            // create datas
            target.find('.ga-silder').each(function(i){

                $(this).find('.ga-item').each(function(){
                    var pageTitle = $(this).attr('ga-page-title');
                    if (typeof pageTitle === typeof undefined || pageTitle === false) {
                        pageTitle = '';
                    }

                    var dataObj = {};
                    dataObj['title'] = pageTitle;
                    dataObj['content'] = $(this).html();
                    datas.push( dataObj );
                });
            });
            conf['datas'] = datas;

            // create slider
            var isFull = (options.isFull ? options.isFull : (datas.length == options.items ? true:false));
            if(datas.length == options.items) options.autoplay = false;
            target = $('<div class="ga-slider-container" isFull="'+isFull+'"></div>').appendTo(target);
            var carousel = $('<div class="owl-carousel '+options.carouselClass+'"></div>').appendTo( $(target) );
            $.each(datas, function(i, data){
                carousel.append('<div class="item '+options.itemsClass+'">'+data.content+'</div>');
            });

            // bind slider action
            options['autoplaySpeed'] = options.pageSpeed;
            if(options.items > 1){
                options = $.extend({responsive: {}}, options);
                var responsive_tmp = {
                    0: {
                        items: 1
                    },
                    320: {
                        items: 1
                    },
                    768: {
                        items: (options.items>2? 2 : 1)
                    },
                    1024: {
                        items: (options.items>2? 2 : 1)
                    },
                    1025: {
                        items: options.items
                    }};
                $.extend(true, responsive_tmp, options.responsive);
                options.responsive = responsive_tmp;
            }

            if ($(window).width() < 1024) {
                if(options.page.isDisable) options['dots'] = false;
            }

            var $owl = $(target).children('.owl-carousel').owlCarousel(options);

            function _createPage(options){

                if(options.items > 1){
                    options = $.extend({responsive: {}}, options);
                    var responsive_tmp = {
                        0: {
                            items: 1
                        },
                        320: {
                            items: 1
                        },
                        768: {
                            items: (options.items>2? 2 : 1)
                        },
                        1024: {
                            items: (options.items>2? 2 : 1)
                        },
                        1025: {
                            items: options.items
                        }};
                    $.extend(true, responsive_tmp, options.responsive);
                    options.responsive = responsive_tmp;
                }

                options.touchDrag = options.event.touchDrag;
                options.mouseDrag = options.event.mouseDrag;

                // page
                if( datas.length <= options.items ){
                    $(target).find('.owl-dots').addClass('disabled');
                    options.touchDrag = false;
                    options.mouseDrag = false;
                    options.autoplay = false;
                } else {

                    if( !options.navigation.isDisable ){

                        $(target).find('.owl-nav').addClass('disabled');
                        // $(target).find('.owl-dots').addClass('disabled');
                        $(target).find('.owl-dots').addClass('hidden');

                        if( target.find('.ga-slider-prev').length > 0 ){
                            target.find('.ga-slider-prev').remove();
                            target.find('.ga-slider-next').remove();
                        }

                        $('<div class="ga-slider-prev '+options.navigation.prevClass+'"></div>').appendTo( target );
                        $('<div class="ga-slider-next '+options.navigation.nextClass+'"></div>').appendTo( target );

                        if(!options.autoplay){
                            target.find('.ga-slider-prev').css('opacity', '.3');
                        }

                        target.find('.ga-slider-next').click(function() {
                            carousel.trigger('next.owl.carousel');

                            if(!options.autoplay){
                                var slider_target = $(this).parents('.ga-slider-container').first();
                                var items_ele = slider_target.find('.owl-item');
                                var active_item_i = items_ele.index(slider_target.find('.owl-item.active'));
                                if( active_item_i == items_ele.length-1 ){
                                    $(this).css('opacity', '.3');
                                } else {
                                    target.find('.ga-slider-prev, .ga-slider-next').css('opacity', '1');
                                }
                            }
                        });

                        target.find('.ga-slider-prev').click(function() {
                            carousel.trigger('prev.owl.carousel');

                            if(!options.autoplay){
                                var slider_target = $(this).parents('.ga-slider-container').first();
                                var items_ele = slider_target.find('.owl-item');
                                var active_item_i = items_ele.index(slider_target.find('.owl-item.active'));
                                if( active_item_i == 0 ){
                                    $(this).css('opacity', '.3');
                                } else {
                                    target.find('.ga-slider-prev, .ga-slider-next').css('opacity', '1');
                                }
                            }
                        });

                    } else {
                        $(target).find('.owl-dots').addClass( options.page.containerClass );
                    
                        $(target).find('.owl-dot').each(function(i){
                            $(this).attr('type', options.page.type);

                            if(options.page.type == 'text'){
                                var tmp_title = datas[i].title;

                                tmp_title = (tmp_title.length<=options.page.textMaxLength?tmp_title:tmp_title.substr(0, options.page.textMaxLength)+'...');
                                $(this).children('span').text(tmp_title);
                            }

                            if(options.page.hasOwnProperty('pageClass')){
                                $(this).addClass( options.page.pageClass );
                            }
                        });
                    }
                } // end else: datas.length > 1

                if( conf.hasOwnProperty('callback') ){
                    $owl.on('initialized.owl.carousel', function(){
                        conf.callback(target.parent());
                    });
                }

                $owl.on('changed.owl.carousel resized.owl.carousel', function(){

                    if( !options.navigation.isDisable ){
                        $(target).find('.owl-nav').addClass('disabled');
                        // $(target).find('.owl-dots').addClass('disabled');
                        $(target).find('.owl-dots').addClass('hidden');
                    } else if ($(window).width() < 1024) {
                        $(target).find(".owl-controls").hide();
                        $(target).find('.owl-nav').addClass('disabled');
                        // $(target).find('.owl-dots').addClass('disabled');
                        $(target).find('.owl-dots').addClass('hidden');
                    }
                });

                $owl.on('dragged.owl.carousel', function(){
                    var target = $(this).parents('.ga-slider-container').first();
                    var items_ele = target.find('.owl-item');
                    var active_item_i = items_ele.index(target.find('.owl-item.active'));
                    if( active_item_i == 0 ){
                        target.find('.ga-slider-prev').css('opacity', '.3');
                    } else if( active_item_i == items_ele.length-1 ){
                        target.find('.ga-slider-next').css('opacity', '.3');
                    } else {
                        target.find('.ga-slider-prev, .ga-slider-next').css('opacity', '1');
                    }
                });
            }; // end  _createPage function

            
            _createPage(options);
            
            setTimeout(function(){
                //console.debug('options', options);
                $owl.trigger('destroy.owl.carousel');
                $owl.html($owl.find('.owl-stage-outer').html()).removeClass('owl-loaded');
                if( datas.length <= options.items ){
                    options.touchDrag = false;
                    options.mouseDrag = false;
                    options.autoplay = false;
                }
                $owl.owlCarousel(options);
                _createPage(options);
            },500);
            
        }, //end slider function
        listNews: function(conf){

            ///////////////////////////////////
            // var conf = {
            //     target: ,                // Required, jQuery Obj.
            //     typeId: ,                // Required, String.
            //     recsOfPage: 10,          // Optional, Number, the number of records of a page.
            //     isPagination: true,      // Optional, Boolean, has pagination or not.
            //     hasGoToPage: false,      // Optional, Boolean, display go to page or not.
            //     knowMoreUrl: '#'         // Optional, String, the url of know more link.
            // };
            ///////////////////////////////////

            conf = $.extend({
                ajaxUrl: '',
                recsOfPage: 10,
                isPagination: true,
                hasGoToPage: false,
                knowMoreUrl: '#',
                knowMoreTxt: '瞭解更多',
                knowMoreClass: 'knowMore'
            }, conf);

            var target = conf.target,
                typeId = conf.typeId,
                recsOfPage = conf.recsOfPage,
                isPagination = conf.isPagination,
                hasGoToPage = conf.hasGoToPage,
                knowMoreUrl = conf.knowMoreUrl,
                knowMoreTxt = conf.knowMoreTxt,
                knowMoreClass = conf.knowMoreClass,
                ajaxUrl = (conf.ajaxUrl != ''? conf.ajaxUrl: 'jsp/NewsInfo.jsp');

            var _getNewsTabContentData = function(config){

                config = $.extend({page:1}, config);

                $.ajax({
                    url: ajaxPrefix + config.ajaxUrl+'?typeId='+config.typeId+'&pageSize='+config.recsOfPage+'&page='+config.page+'&v=' + new Date().getTime(),
                    datatype: 'json',
                    success: function (json) {
                        console.log('_getNewsTabContentData', json);
                        config['datas'] = json;
                        config.callBack(config);
                    }
                });

                // var datas = $.parseJSON('{"pageInfo":{"totalPage":"15","currentPage":"1","totalRec":"3"},"news":[{"date":"2016-09-12","typeName":"貸款","title":"全球金融網約定收款人帳戶申請書","url":"aaaaaaaaaaaaaaa"},{"date":"2016-10-12","typeName":"測試","title":"GEB約定書（主用戶）","url":"bbbbbbbbbbbbbbb"},{"date":"2016-11-12","typeName":"信用卡","title":"FEDI服務申請書","url":"cccccccccccccc"},{"date":"2016-09-12","typeName":"貸款","title":"全球金融網約定收款人帳戶申請書","url":"aaaaaaaaaaaaaaa"},{"date":"2016-10-12","typeName":"測試","title":"GEB約定書（主用戶）","url":"bbbbbbbbbbbbbbb"},{"date":"2016-11-12","typeName":"信用卡","title":"FEDI服務申請書","url":"cccccccccccccc"}]}');
                // config['datas'] = datas;
                // config.callBack(config);
                
            }; //end _getNewsTabContentData function

            var _createNewsContentData = function(config){
                var target = config.target.empty(),
                    typeId = config.typeId,
                    recsOfPage = config.recsOfPage,
                    isPagination = config.isPagination,
                    hasGoToPage = config.hasGoToPage,
                    datas = config.datas;
                //console.log('_createNewsContentData', config.datas, target);

                if( target.find('ul.list-ul').length == 0 ){
                    var content_ul = $('<ul class="list-ul"></ul>').appendTo( target );
                    config.target = content_ul;
                    _createNewsContentList(config);
                }

                if( isPagination && target.find('.bottom_pagination').length == 0 ){
                    var paginationEle = $('<div class="bottom_pagination"></div>').appendTo( target );

                    console.log('paginationEle', datas.pageInfo);

                    GardenUtils.display.pagination({
                        pageInfo: datas.pageInfo,
                        hasGoToPage: hasGoToPage,
                        target: target.find('.bottom_pagination').empty(),
                        getPageInfoCallBackFn: function(pageNum){
                            config.page = pageNum;
                            config.target = content_ul;
                            config.callBack = function(config){
                                _createNewsContentList(config);
                            };

                            _getNewsTabContentData(config);
                        }
                    });
                } else if( !config.isPagination && target.find('.knowMore').length == 0 && datas.news.length >= config.recsOfPage ){
                    var paginationEle = $('<div class="'+config.knowMoreClass+'"><a href="'+config.knowMoreUrl+'?activeId='+typeId+'" class="index-new-btn-k">'+config.knowMoreTxt+'</a></div>').appendTo( target );
                }
            }; // end _createNewsContentData function

            var _createNewsContentList = function(config){
                var target = config.target.empty(),
                    datas = config.datas.hasOwnProperty('news')?config.datas.news:[];
                //console.log('_createNewsContentList', datas);

                $.each(datas, function(i, data){
                    var newPage = (data.hasOwnProperty('newPage')? data.newPage: false),
                        link_target = (newPage? '_blank':'_self');

                    $('<li><a href="'+data.url+'" class="list-ele" target="'+link_target+'">'
                        +'<h5>'+data.date+'</h5>'
                        +(data.hasOwnProperty('typeName')&&data.typeName !=''?'<span class="list-type">'+data.typeName+'</span>':'')
                        +'<p>'+data.title+'</p>'
                    +'</a></li>').appendTo( target );
                });

                fixFooter();
            }; // end _createNewsContentList function

            _getNewsTabContentData({
                ajaxUrl: ajaxUrl,
                target: target,
                typeId: typeId,
                recsOfPage: recsOfPage,
                isPagination: isPagination,
                hasGoToPage: hasGoToPage,
                knowMoreUrl: knowMoreUrl,
                knowMoreTxt: knowMoreTxt,
                knowMoreClass: knowMoreClass,
                callBack: function(config){
                    _createNewsContentData(config);
                }
            });
        },
        FBPost: function(conf){
            ///////////////////////////////////
            // var conf = {
            //     appId: '',      // String，必填
            //     title: '',      // String，顯示主標
            //     url: '',        // String，連結
            //     picture: '',    // String，圖片（絕對路徑）
            //     description: '' // String，詳細說明
            // };
            ///////////////////////////////////

            conf = $.extend({
                title:'',
                url: '',
                picture: '',
                description: ''
            }, conf);

            var appId = conf.appId,
                title = conf.title,
                url = conf.url,
                picture = conf.picture,
                description = conf.description;

            if($('#fb-root').length == 0) {

                $('body').append('<div id="fb-root"></div>');

                $.getScript('//connect.facebook.net/en_US/all.js' , function(){
                    try {
                        FB.init({
                            appId: appId, //'293189257699769', // 參數
                            status: true,
                            cookie: true
                        });

                        FB.ui(
                            {
                                method: 'feed',
                                name: title, // 參數，顯示主標
                                link: url, // 參數，連結
                                picture: picture, // 參數，圖片（絕對路徑）
                                description: description // 參數，詳細說明
                            }, function(response) {
                                console.debug(response);
                        });
                    } catch(e) {
                        console.warn(e);
                    }
                });
            } // end if: check fb-root exist
            else {
                try {
                        FB.init({
                            appId: appId, //'293189257699769', // 參數
                            status: true,
                            cookie: true
                        });

                        FB.ui(
                            {
                                method: 'feed',
                                name: title, // 參數，顯示主標
                                link: url, // 參數，連結
                                picture: picture, // 參數，圖片（絕對路徑）
                                description: description // 參數，詳細說明
                            }, function(response) {
                                console.debug(response);
                        });
                    } catch(e) {
                        console.warn(e);
                    }
            }
        }, // end FBPost function

        mobileMenu: function(conf){
            // conf
            // dataEleId: String, <div> element's id
            // position: String, optional, left(default) or right.

            conf = $.extend({
                position: 'left',
                isFullScreen: false
            }, conf);

            var dataEle_id = conf.dataEleId;
            var position = conf.position;
            var isFullScreen = conf.isFullScreen;

            var dataEle = $('#'+dataEle_id);
            var navbars = [];
            var title = '', slidingSubmenus = false;

            if( $('#'+dataEle_id+'.mm-menu').length == 0 && dataEle.length != 0 ){

                var navEle = $('<nav id="'+dataEle_id+'"></nav>').appendTo('body');
                navEle.append( dataEle.children('ul') );

                dataEle.find('.ga-mobile-menu-nav').each(function(){
                    var nav_position = $(this).attr('ga-mobile-menu-nav-position');

                    if (typeof nav_position === typeof undefined || nav_position === false) {
                        nav_position = 'top';
                    }

                    navbars.push({
                        content: $(this).prop('outerHTML'),
                        position: nav_position
                    });
                });

                dataEle.remove();
            }

            // bind a click: scroll to top
            $('a[href="#'+dataEle_id+'"]').on('click', function(ev){
                ev.preventDefault();

                $('body').scrollTop(0);
            });

            var mmenu_obj = {
                "slidingSubmenus": slidingSubmenus,
                "navbar": {
                    "title": title
                },
                "navbars": navbars,
                "offCanvas": {
                    "position": position
                },
                "scrollBugFix": false
            };

            if( isFullScreen ){
                mmenu_obj["extensions"] = ["fullscreen"];
            }

            navEle.mmenu( mmenu_obj );


            // bind click: close
            var API = $('#'+dataEle_id).data( "mmenu" );
      
            $('#'+dataEle_id+' .ga-mobile-menu-close-btn').click(function(ev) {
                ev.preventDefault();

                API.close();
            });

        }, // end mobileMenu function

        embedYoutube: function(conf){
            var target = conf.target;
            var response = conf.hasOwnProperty('response')?conf.response:{};
            var window_w = $(window).width();

            // response
            var match = -1;
            $.each(response, function(breakpoint) {
                if (breakpoint <= window_w && breakpoint > match) {
                    match = Number(breakpoint);
                }
            });

            if( match != -1 ){
                target.find('.ga-youtube-embedded').each(function(){
                    $(this).attr('ga-youtube-height', response[match]);
                    $(this).attr('height', response[match]);
                });
            }

            // video events
            target.find('.ga-youtube-embedded').each(function(){
                var youtube_id = $(this).attr('id');
                if( conf.hasOwnProperty('playing') ){
                    embeddedYoutube_conf[youtube_id] = $.extend({
                        playing: function(){
                            conf.playing();
                        }
                    }, embeddedYoutube_conf[youtube_id]);
                }

                if( conf.hasOwnProperty('paused') ){
                    embeddedYoutube_conf[youtube_id] = $.extend({
                        paused: function(){
                            conf.paused();
                        }
                    }, embeddedYoutube_conf[youtube_id]);
                }

                if( conf.hasOwnProperty('ended') ){
                    embeddedYoutube_conf[youtube_id] = $.extend({
                        ended: function(){
                            conf.ended();
                        }
                    }, embeddedYoutube_conf[youtube_id]);
                }
            }); // end each: video event

            $(window).resize(function(){
                GardenUtils.plugin.embedYoutube(conf);
            });
        }, // end embedYoutube function

        zingChart: function(conf){

            /////////////////////////////////////////
            // chartId: 'lineChartTarget',
            // height: "500",  // default: 480
            // width: "100%",  // default: 100%
            // type: 'line',
            // colorSet: {
            //     name: 'nomura',
            //     colorArray: ['#ca2420', ...]
            // },
            // scaleX: {
            //     type: 'date',
            //     step: 'day',    // if type = date, default: day
            //     format: '%m/%d' // if type = date, default: %y/%m/%d -> 17/02/10
            // },
            // dataArray: [{
            //     name: '',
            //     dataPoints: [
            //         [1457101800000, 50], ... // (1) milliseconds
                    
            //         ['2016/10/25', 50], ...  // (2) date string
            //     ]
            // }]
             /////////////////////////////////////////

            var defaultConfig = {
                type: "line", 
                backgroundColor:"#fff",
                title:{
                    text:"", 
                    adjustLayout: true, 
                    fontColor:"#737373", 
                    marginTop: 7 
                }, 
                //legend:{visible: false, // draggable: true, // dragHandler: "icon", align: 'left', verticalAlign: 'bottom', borderWidth: 0, item:{fontColor:"#737373", cursor: "hand", alpha: 1 }, marker:{type:"square", //"circle", borderWidth: 0, cursor: "hand", alpha: 1 }/*, height: 0, width: 0, alpha: 0*/ }, 
                plotarea:{
                    margin:"dynamic 70"
                }, 
                plot:{
                    // aspect: "line", 
                    lineWidth: 2, 
                    marker:{
                        borderWidth: 0, 
                        size: 5 
                    }, 
                    tooltip:{
                        text: "%v", 
                        placement: "node:top",
                        visible: false
                    },
                    valueBox: {
                        text: "%node-value", 
                        placement: "top",
                        fontColor: "black",
                        fontSize: "15px",
                        visible: false
                    },
                    slice:'50%', // for ring
                    borderWidth:0
                }, 
                scaleX:{
                    lineColor: "#737373",
                    item:{
                        fontColor:"#737373"
                    }, 
                    // minValue: 1457101800000,
                    // step: "day", 
                    // transform:{
                    //  type: "date", 
                    //  all: "%y/%m/%d"
                    // },
                    minorTicks: 0,
                    guide:{
                      visible: false,
                      lineStyle: 'solid',
                      lineColor: '#aaa',
                      alpha: 1
                    }
                }, 
                scaleY:{
                    visible: true, 
                    minorTicks: 0, 
                    lineColor: "#737373", 
                    guide:{
                        lineStyle: "solid", 
                        lineColor: "#d8d8d8",
                        visible: false 
                    }, 
                    item:{
                        fontColor:"#737373"
                    } 
                },
                scaleR:{    // for ring
                  refAngle: 270
                },
                preview:{
                    adjustLayout: true, 
                    borderColor:'#E3E3E5', 
                    mask:{
                        borderColor:'#d7002a', 
                        backgroundColor:'#E3E3E5'
                    }, 
                    handleLeft: {
                        alpha: 0, 
                        visible: false 
                    }, 
                    handleRight: {
                        alpha: 0, 
                        visible: false 
                    }, 
                    active: {
                        backgroundColor:'none', 
                        alpha: 1 
                    }, 
                    visible: false 
                }, 
                crosshairX:{
                    visible: false,
                    lineColor: 'black',
                    lineWidth: 2,
                    plotLabel:{
                        multiple: true, 
                        borderRadius: 3, 
                        backgroundColor: 'rgba(0,0,0,.6)', 
                        // padding: '30px', 
                        padding: '15px', 
                        fontSize: '15px', 
                        fontColor: 'white', 
                        text: '%v - %kv - %kt',
                        // maxWidth: '150%',
                        wrapText: true
                    }, 
                    scaleLabel:{
                        visible: false
                    }, 
                    marker:{
                        size: 5, 
                        alpha: 1,
                        backgroundColor: 'black'
                    } 
                }, 
                tooltip:{
                    borderWidth: 0, 
                    backgroundColor: "rgba(0,0,0,0)", 
                    fontColor: "#000", 
                    fontSize: "20px"
                }, 
                series: [
                // {
                //  values:[
                //         [1457101800000, 35], 
                //         [1457449000000, 25]
                //  ], 
                //  lineColor:"#31A59A", 
                //  backgroundColor:"#31A59A", 
                //  marker:{
                //      backgroundColor:"#31A59A"
                //  } 
                // }
                ]
             };

            conf = $.extend({
                chartId: '',
                width: '100%',
                height: '480'
            }, conf);

            var chartId = conf.chartId,
                height = conf.height,
                width = conf.width;

            if( conf.hasOwnProperty('type') ){
                defaultConfig.type = conf.type;
            }

            var colorSet = [];
            if( conf.hasOwnProperty('colorSet') ){
                colorSet = conf.colorSet.colorArray;
            }

            if( conf.hasOwnProperty('plot') ){
                defaultConfig.plot = $.extend(true, defaultConfig.plot, conf.plot);
            }

            defaultConfig.plot['y'] = height/2;

            if( conf.hasOwnProperty('plotarea') ){  
                defaultConfig.plotarea = $.extend(true, defaultConfig.plotarea, conf.plotarea);
            }

            if( conf.hasOwnProperty('displayValue') ){
                if( conf.type == 'ring' ){
                    defaultConfig.plot.valueBox = $.extend(true, {
                        placement: 'in'
                    }, conf.displayValue);
                }
                defaultConfig.plot.valueBox = $.extend(true, defaultConfig.plot.valueBox, conf.displayValue);
            }

            if( conf.hasOwnProperty('scaleX') ){
                var scaleX_conf = conf.scaleX;

                if( scaleX_conf.hasOwnProperty('guide') ){
                    defaultConfig.scaleX.guide = $.extend(true, defaultConfig.scaleX.guide, scaleX_conf.guide);
                }

                if( scaleX_conf.hasOwnProperty('zoomToValues') ){
                    var zoomToValues_arr = scaleX_conf.zoomToValues;
                    if( scaleX_conf.hasOwnProperty('type') && scaleX_conf.type == 'date'
                        && zoomToValues_arr.length > 0 ){
                        
                        if(zoomToValues_arr.length == 2){
                            var end_date = new Date(zoomToValues_arr[1]);
                            zoomToValues_arr[1] = end_date.getTime();
                        }

                        var start_date = new Date(zoomToValues_arr[0]);
                        zoomToValues_arr[0] = start_date.getTime();
                    }

                    defaultConfig.scaleX['zoomToValues'] = zoomToValues_arr;
                }

                if( scaleX_conf.hasOwnProperty('type') && scaleX_conf.type == 'date' ){
                    scaleX_conf = $.extend({
                        step: 'day',
                        format: '%y/%m/%d'
                    }, scaleX_conf);

                    defaultConfig.scaleX['step'] = scaleX_conf.step;
                    defaultConfig.scaleX['transform'] = {
                        type: scaleX_conf.type,
                        all: scaleX_conf.format
                    };

                    if( conf.hasOwnProperty('dataArray') && conf.dataArray.length > 0 ){
                        $.each( conf.dataArray, function(i, dataObj){
                            if( dataObj.hasOwnProperty('dataPoints') 
                                && dataObj.dataPoints.length > 0 ){
                                $.each( dataObj.dataPoints, function(j, dataPoint){
                                    if( typeof dataPoint[0] === 'string' ){
                                        var tmp_date_obj = new Date(dataPoint[0]);
                                        conf.dataArray[i]['dataPoints'][j][0] = tmp_date_obj.getTime();
                                    }
                                });
                            }
                        });
                    }

                    function _getMaxDate(dataArray){
                        var dates=[];
                        $.each( conf.dataArray, function(i, dataObj){
                            if( dataObj.hasOwnProperty('dataPoints') 
                                && dataObj.dataPoints.length > 0 ){
                                $.each( dataObj.dataPoints, function(j, dataPoint){
                                    dates.push( dataPoint[0] );
                                });
                            }
                        });

                        var maxDate=new Date(Math.max.apply(null,dates));

                        return maxDate.getTime();
                    }; // end _getMaxDate function

                    function _getMinDate(dataArray){
                        var dates=[];
                        $.each( conf.dataArray, function(i, dataObj){
                            if( dataObj.hasOwnProperty('dataPoints') 
                                && dataObj.dataPoints.length > 0 ){
                                $.each( dataObj.dataPoints, function(j, dataPoint){
                                    dates.push( dataPoint[0] );
                                });
                            }
                        });
                        
                        var minDate=new Date(Math.min.apply(null,dates));

                        return minDate.getTime();
                    }; // end _getMinDate function

                    if( conf.hasOwnProperty('dataArray') && conf.dataArray.length > 0 ){
                        defaultConfig.scaleX['minValue'] = _getMinDate( conf.dataArray );
                        defaultConfig.scaleX['maxValue'] = _getMaxDate( conf.dataArray );
                    }

                } // end if: type = date
            } // end if: scaleX

            if( conf.hasOwnProperty('scaleY') ){
                defaultConfig.scaleY = $.extend(true, defaultConfig.scaleY, conf.scaleY);
            }

            if( conf.hasOwnProperty('preview') ){
                defaultConfig.preview = $.extend(true, defaultConfig.preview, conf.preview);
                defaultConfig.scaleX['zooming'] = true;
            }

            if( conf.hasOwnProperty('crosshairX') ){
                defaultConfig.crosshairX = $.extend(true, defaultConfig.crosshairX, conf.crosshairX);
                if(width.indexOf('%') != -1){
                    width = $('#'+chartId).width();
                }
                defaultConfig.crosshairX.plotLabel['maxWidth'] = parseInt(width)/2;

                if( conf.crosshairX.hasOwnProperty('displayText') ){
                    var transform_str = conf.crosshairX.displayText;

                    // y 軸值轉換
                    while( transform_str.indexOf('%y') != -1 ){
                        transform_str = transform_str.replace('%y', '%v');
                    };
                    

                    // x 軸值轉換
                    if( conf.crosshairX.hasOwnProperty('xFormat') 
                        && conf.crosshairX.xFormat.type == 'date' ){
                        while( transform_str.indexOf('%x') != -1 ){
                            transform_str = transform_str.replace('%x', 'x:%kt:x');
                        };
                    } else {
                        while( transform_str.indexOf('%x') != -1 ){
                            transform_str = transform_str.replace('%x', '%kv');
                        };
                    } // end if: has xFormat

                    defaultConfig.crosshairX.plotLabel['text'] = transform_str;
                }
                
            }

            if( conf.hasOwnProperty('dataArray') ){

                if( conf.hasOwnProperty('legendId') ){//&& conf.dataArray.length > 1 ){
                    $('#'+chartId).attr('legendId', conf.legendId);
                }

                $.each( conf.dataArray, function(i, dataObj){
                    var data_conf = {};

                    if( dataObj.hasOwnProperty('dataPoints') ){
                        data_conf['values'] = dataObj.dataPoints;
                    }

                    if( dataObj.hasOwnProperty('name') ){
                        data_conf['text'] = dataObj.name;
                    }

                    if( colorSet.length != 0 ){
                        var color = colorSet[i];
                        data_conf['lineColor'] = color;
                        data_conf['marker'] = {};
                        data_conf.marker['backgroundColor'] = color;

                        if( conf.type == 'ring' ){
                            data_conf['backgroundColor'] = color;
                        }
                    }

                    defaultConfig.series.push( data_conf );
                });

                // console.log('series', defaultConfig.series);
            } // end if: dataArray

            // console.log('defaultConfig', defaultConfig, JSON.stringify(defaultConfig));

            zingchart.render({ 
                id: chartId, 
                data: defaultConfig,
                height: height,
                width: width
            });

            function _previewHandlerArrowTop(){
                $('.zc-preview-handler-left, .zc-preview-handler-right').css('top', '0px');
            }; // end _previewHandlerArrowTop function

            zingchart.complete  = function(p) {
                // console.log('complete', p);
                _previewHandlerArrowTop();

                var legendId = $('#'+p.id).attr('legendId');
                if (typeof legendId !== typeof undefined && legendId !== false) {

                    $('#'+legendId+' .ga-chart-legend-item').on('click', function(ev){
                        ev.preventDefault();

                        var item_i = $('#'+legendId+' .ga-chart-legend-item').index( $(this) );

                        $(this).toggleClass('ga-chart-legend-item-hide');

                        zingchart.exec(p.id, 'toggleplot', {
                            'plotindex': item_i,
                            'toggle-action': 'hide'
                        });
                    });

                    $('#'+legendId+' .ga-chart-legend-item.ga-chart-legend-item-hide').trigger('click');
                }
            }; // end zingchart.complete function

            if( conf.hasOwnProperty('crosshairX') && conf.crosshairX.hasOwnProperty('displayText') ){
                var crosshairX_conf = conf.crosshairX;
                $('#'+chartId).attr('chart-guide-display', crosshairX_conf.displayText);
                if( crosshairX_conf.hasOwnProperty('xFormat')
                    && crosshairX_conf.xFormat.hasOwnProperty('type') ){

                    $('#'+chartId).attr('chart-guide-type', crosshairX_conf.xFormat.type);

                    if( crosshairX_conf.xFormat.type == 'date' ){
                        if( crosshairX_conf.xFormat.hasOwnProperty('format') ){
                            $('#'+chartId).attr('chart-guide-format', crosshairX_conf.xFormat.format);
                        } else {
                            $('#'+chartId).attr('chart-guide-format', '%Y/%mm/%dd');
                        }
                    }
                }

                if( conf.hasOwnProperty('getCrosshairX') ){
                    ga_chart_conf[chartId] = $.extend({
                        getCrosshairX: function(pointConf){
                            conf.getCrosshairX(pointConf);
                        }
                    }, ga_chart_conf[chartId]);
                }

                zingchart.guide_mousemove = function(p) {
                    console.log('guide_mousemove', p);

                    function xValueTransform(ms){
                        var displayType = $('#'+p.id).attr('chart-guide-type');
                        var transform_str = ms;

                        // x 軸值轉換
                        if(typeof displayType !== typeof undefined && displayType !== false
                            && displayType == 'date'){
                            var date_obj = new Date(ms);
                            var displayFormat = $('#'+p.id).attr('chart-guide-format');
                            transform_str = displayFormat;

                            function _padLeft(str, lenght) {
                                str = str + "";
                                if (str.length >= lenght) {
                                    return str;
                                } else {
                                    return _padLeft("0" + str, lenght);
                                }
                            }; // end _padLeft function

                            // transform full year: 2017
                            while( transform_str.indexOf('%Y') != -1 ){
                                transform_str = transform_str.replace('%Y', date_obj.getFullYear());
                            };

                            // transform year: 17
                            while( transform_str.indexOf('%y') != -1 ){
                                transform_str = transform_str.replace('%y', (''+date_obj.getFullYear()).substr(2, 2));
                            };

                            // transform month: 01
                            while( transform_str.indexOf('%mm') != -1 ){
                                transform_str = transform_str.replace('%mm', _padLeft((date_obj.getMonth()+1), 2));
                            };

                            // transform month: 1
                            while( transform_str.indexOf('%m') != -1 ){
                                transform_str = transform_str.replace('%m', date_obj.getMonth()+1);
                            };

                            // transform date: 01
                            while( transform_str.indexOf('%dd') != -1 ){
                                transform_str = transform_str.replace('%dd', _padLeft(date_obj.getDate(), 2));
                            };

                            // transform date: 1
                            while( transform_str.indexOf('%d') != -1 ){
                                transform_str = transform_str.replace('%d', date_obj.getDate());
                            };

                        } // end if: chart-guide-type is date
                        return transform_str;
                    }; // end xValueTransform function

                    var x_value_return = '';
                    $.each(p.items, function(i, itemObj){
                        var label_ele = $('#'+p.id+' .zc-guide-label').eq(i);
                        /*var text = label_ele.children('tspan').text();

                        var y_value = text.split(' - ')[0];
                        var x_value = text.split(' - ')[1];
                        var x_ms_value = text.split(' - ')[2];
                        var transform_str = x_value+' - '+y_value;
                        var displayText = $('#'+p.id).attr('chart-guide-display');

                        x_value_return = x_ms_value;

                        if (typeof displayText !== typeof undefined && displayText !== false) {

                            transform_str = displayText;

                            // y 軸值轉換
                            while( transform_str.indexOf('%y') != -1 ){
                                transform_str = transform_str.replace('%y', y_value);
                            };

                            var displayType = $('#'+p.id).attr('chart-guide-type');

                            // x 軸值轉換
                            if(typeof displayType !== typeof undefined && displayType !== false
                                && displayType == 'date'){
                                var ms = parseInt(x_ms_value);
                                var date_obj = new Date(ms);
                                var displayFormat = $('#'+p.id).attr('chart-guide-format');

                                x_value_return = displayFormat;

                                while( transform_str.indexOf('%x') != -1 ){
                                    transform_str = transform_str.replace('%x', displayFormat);
                                };

                                function _padLeft(str, lenght) {
                                    str = str + "";
                                    if (str.length >= lenght) {
                                        return str;
                                    } else {
                                        return _padLeft("0" + str, lenght);
                                    }
                                }; // end _padLeft function

                                // transform full year: 2017
                                while( transform_str.indexOf('%Y') != -1 ){
                                    transform_str = transform_str.replace('%Y', date_obj.getFullYear());
                                    x_value_return = x_value_return.replace('%Y', date_obj.getFullYear());
                                };

                                // transform year: 17
                                while( transform_str.indexOf('%y') != -1 ){
                                    transform_str = transform_str.replace('%y', (''+date_obj.getFullYear()).substr(2, 2));
                                    x_value_return = x_value_return.replace('%y', (''+date_obj.getFullYear()).substr(2, 2));
                                };

                                // transform month: 01
                                while( transform_str.indexOf('%mm') != -1 ){
                                    transform_str = transform_str.replace('%mm', _padLeft((date_obj.getMonth()+1), 2));
                                    x_value_return = x_value_return.replace('%mm', _padLeft((date_obj.getMonth()+1), 2));
                                };

                                // transform month: 1
                                while( transform_str.indexOf('%m') != -1 ){
                                    transform_str = transform_str.replace('%m', date_obj.getMonth()+1);
                                    x_value_return = x_value_return.replace('%m', date_obj.getMonth()+1);
                                };

                                // transform date: 01
                                while( transform_str.indexOf('%dd') != -1 ){
                                    transform_str = transform_str.replace('%dd', _padLeft(date_obj.getDate(), 2));
                                    x_value_return = x_value_return.replace('%dd', _padLeft(date_obj.getDate(), 2));
                                };

                                // transform date: 1
                                while( transform_str.indexOf('%d') != -1 ){
                                    transform_str = transform_str.replace('%d', date_obj.getDate());
                                    x_value_return = x_value_return.replace('%d', date_obj.getDate());
                                };

                            } else {
                                while( transform_str.indexOf('%x') != -1 ){
                                    transform_str = transform_str.replace('%x', x_value);
                                    x_value_return = x_value;
                                };
                            }
                        } // end if: chart-guide-display

                        // label_ele.children('tspan').text(transform_str);*/

                        var x_value_tmp = '';

                        label_ele.children('tspan').each(function(){
                            var label_text = $(this).text();
                            // console.log('label_text', label_text);
                            if( label_text.indexOf('x:') != -1  && label_text.indexOf(':x') != -1 ){
                                x_value_tmp = label_text.split('x:')[1];
                                x_value_tmp = x_value_tmp.split(':x')[0];
                                x_value_return = parseInt(x_value_tmp);

                                var x_transform_value = xValueTransform(x_value_return);
                                x_value_return = label_text.replace('x:'+x_value_tmp+':x', x_transform_value);
                                $(this).text(x_value_return);
                            } // end if: transform x value
                            /* else if( label_text.indexOf('x:') != -1 ){
                                label_text = label_text.split('x:')[1];
                                x_value_tmp += parseInt(label_text);
                            } else if( label_text.indexOf(':x') != -1 ){
                                label_text = label_text.split(':x')[0];
                                x_value_tmp += parseInt(label_text);
                            }*/
                            // console.debug('x_value_tmp', x_value_tmp);
                        }); // end each: tspan
                    }); // end each: nodes item

                    if(ga_chart_conf.hasOwnProperty(p.id)
                        && ga_chart_conf[p.id].hasOwnProperty('getCrosshairX')){
                        ga_chart_conf[p.id].getCrosshairX({
                            x: xValueTransform(p.items[0].keyvalue)
                        });
                    }
                }; // end bind guide_mousemove
            } // end if: crosshairX

        }, // end zingChart function

        chart: function(conf){

            /////////////////////////////////
            // defaultConf = {
            //     data: [{
            //         type: "doughnut", 
            //         innerRadius: "25%", 
            //         startAngle: 270,

            //         indexLabel: "{label} #percent%",
            //         indexLabelPlacement: "inside", // outside, inside, none(added)
            //         indexLabelLineColor: '#d8d8d8', 
            //         indexLabelFontColor: '#000',
            //         indexLabelFontWeightr: 'bold',

            //         dataPoints: [
            //             { y: 35, label: "國內基金" }, 
            //             { y: 15, label: "國外基金"}, 
            //             { y: 25, label: "國外債券"}, 
            //             { y: 25, label: "貨幣"} 
            //         ]
            //     }]
            // };
            /////////////////////////////////

            var defaultConf = {
                interactivityEnabled: false,    // default mouseover event
                toolTip:{
                    enabled: false   // mouseover tooltip
                },
                dataPointWidth: 40,
                data: []
            };

            var chartId = conf.chartId;

            if( conf.hasOwnProperty('colorSet') ){
                CanvasJS.addColorSet(conf.colorSet.name, conf.colorSet.colorArray);
                defaultConf['colorSet'] = conf.colorSet.name;
            }

            if( conf.hasOwnProperty('height') ){
                defaultConf['height'] = conf.height;
            }

            if( conf.hasOwnProperty('width') ){
                defaultConf['width'] = conf.width;
            }

            if( conf.hasOwnProperty('interactivityEnabled') ){
                defaultConf['interactivityEnabled'] = conf.interactivityEnabled;
            }

            if( conf.hasOwnProperty('title') ){
                defaultConf['title'] = conf.title;
            }

            if( conf.hasOwnProperty('axisX') ){
                defaultConf['axisX'] = conf.axisX;
                if( conf.axisX.hasOwnProperty('isShowLine') && !conf.axisX.isShowLine ){
                    defaultConf.axisX['lineColor'] = 'rgba(0,0,0,0)';
                    defaultConf.axisX['tickColor'] = 'rgba(0,0,0,0)';
                    defaultConf.axisX['gridThickness'] = 0;
                }

                if( conf.axisX.hasOwnProperty('isShowLabel') && !conf.axisX.isShowLabel ){
                    defaultConf.axisX['labelFontColor'] = 'rgba(0,0,0,0)';
                }
            }

            if( conf.hasOwnProperty('axisY') ){
                defaultConf['axisY'] = conf.axisY;
                if( conf.axisY.hasOwnProperty('isShowLine') && !conf.axisY.isShowLine ){
                    defaultConf.axisY['lineColor'] = 'rgba(0,0,0,0)';
                    defaultConf.axisY['tickColor'] = 'rgba(0,0,0,0)';
                    defaultConf.axisY['gridThickness'] = 0;
                }

                if( conf.axisY.hasOwnProperty('isShowLabel') && !conf.axisY.isShowLabel ){
                    defaultConf.axisY['labelFontColor'] = 'rgba(0,0,0,0)';
                }
            }

            if( conf.hasOwnProperty('dataArray') && conf.dataArray.length > 0 ){
                $.each(conf.dataArray, function(i, dataObj){
                    var data_conf = { dataPoints: [] };
                    var chartType = dataObj.hasOwnProperty('type')? dataObj.type: 'ring';

                    if( chartType == 'ring' ){
                        data_conf = $.extend({
                            type: "doughnut", 
                            innerRadius: "30%", 
                            startAngle: 270,

                            indexLabel: "{label} #percent%",
                            indexLabelPlacement: "inside",
                            indexLabelLineColor: '#d8d8d8', 
                            indexLabelFontColor: '#000',
                            indexLabelFontWeightr: 'bold',
                            explodeOnClick: false           // default click event
                        }, data_conf);

                        if( dataObj.hasOwnProperty('innerRadius') ){
                            data_conf.innerRadius = dataObj.innerRadius;
                        }

                        if( dataObj.hasOwnProperty('dataPoints') && dataObj.dataPoints.length > 0 ){
                            data_conf.dataPoints = dataObj.dataPoints;
                        }
                    } // end if: type is ring
                    else if( chartType == 'line' || chartType == 'column' ){
                        data_conf = $.extend(true, {
                            type: chartType, 
                            xValueType: 'number',
                            explodeOnClick: false           // default click event
                        }, dataObj);

                        if( !dataObj.hasOwnProperty('labelPlacement') ){
                            dataObj['labelPlacement'] = 'auto';
                        }

                        if( dataObj.hasOwnProperty('dataPoints') && dataObj.dataPoints.length > 0 ){

                            data_conf.dataPoints = [];
                            
                            if( data_conf.xValueType == 'dateTime' ){
                                $.each( dataObj.dataPoints, function(j, dataPoint){
                                    if( typeof dataPoint.x === 'string' ){
                                        var tmp_date_obj = new Date(dataPoint.x);
                                        data_conf.dataPoints.push({
                                            x: tmp_date_obj.getTime(),
                                            y: dataPoint.y
                                        });
                                    }
                                });
                            } else {
                                data_conf.dataPoints = dataObj.dataPoints;
                            }
                        } // end if: has dataPoints
                    } // end if: type is line

                    if( !dataObj.hasOwnProperty('labelPlacement') || dataObj.labelPlacement == 'none' ){
                        data_conf.indexLabelFontColor = 'rgba(0,0,0,0)';
                        data_conf.indexLabelLineColor = 'rgba(0,0,0,0)';
                    } else {
                        data_conf.indexLabelPlacement = dataObj.labelPlacement;
                    }

                    defaultConf.data.push(data_conf);
                }); // end each: dataArray
            } // end if: dataArray

            console.log('defaultConf', defaultConf);

            var chart = new CanvasJS.Chart(chartId, defaultConf);
            chart.render();

            $('#'+chartId).width( $('#'+chartId+' .canvasjs-chart-canvas').width() );
            $('#'+chartId).height( $('#'+chartId+' .canvasjs-chart-canvas').height() );
        }, // end chart function

        keypad: function(conf) {
            // conf{
            //  target:  jqueryObj 
            //  focus:   binding input class or id
            //}

            $target = conf.target;
            focus = conf.focus;
            $target.keypad({
                layout: ['abcdefghij456',
                    'klmnopqrst123',
                    'uvwxyz7890'  +
                    $.keypad.SHIFT 
                ],
                keypadOnly: false,
                randomiseAll: true,
                // randomiseNumeric: true,
                // randomiseAlphabetic: true,
                shiftText: '大小寫切換'
            });

            $target.find(':disabled').css('display','none');
            //var keypadTarget = null;
            $(focus).on('focus', function() {
                /*if (keypadTarget != this) {
                    keypadTarget = this;
                    $target.keypad('option', {
                        target: this
                    });
                }*/

                $target.keypad('option', {
                    target: this,
                    randomiseAll: true
                });
                
            });
        }, // end keypad function

        processBar: function(conf) {
            ///////////////////////////////////
            // var conf = {
            //     target: ,                    // jQuery Obj
            //     type:'',                     // line or ring
            //     options: {
            //         val: 70,               // int 0-100, default '70'.
            //         min: 0,                  // int, default '0'.
            //         max: 100,                // int, default '100'.
            //         fgColor: "#337ab7",      // color, default '#337ab7'.
            //         bgColor: '#d8d8d8',      // color, default '#d8d8d8'.
            //         text: 'none',             // text position, 'in' or 'out' or 'none'.
            //         width: '100',            // int or '100%'.
            //         readonly: true           // Boolean.only for type 'ring'
            //     }
            //}
            ///////////////////////////////////

            var type = conf.type;
            var target = conf.target,
                options = $.extend({
                    val: 70,               
                    min: 0,    
                    max: 100,             
                    fgColor: "#337ab7",
                    bgColor: '#d8d8d8',
                    text: 'none',          
                    width: '100',         
                    readonly: true
                }, conf.options);
            if(type=='line'){
                if(options.width.split('%').length>=2){
                    $('<div class="progress" style="width:'+options.width+';"></div>').appendTo(target);
                }
                else{
                    $('<div class="progress" style="width:'+options.width+'px;"></div>').appendTo(target);
                }
                $('<div class="progress-bar" role="progressbar" aria-valuenow="'+options.val+'" aria-valuemin="'+options.min+'" aria-valuemax="'+options.max+'" style="width:'+options.val+'%;background-color: '+options.fgColor+';"><span class="progressText sr-only">'+options.val+'%</span></div>').appendTo(target.find('.progress'));

                target.find('.progress').css('background-color', options.bgColor);

                if(options.text=='in'){
                    target.find('.progressText').removeClass('sr-only');
                }
                else if(options.text=='out'){
                    $('<div class="progressOutText">'+options.val+'%</div>').appendTo(target);
                }
                else {
                }
            }
            else if(type=='ring'){
                var displayInput = true;
                // if(options.text=='no'||options.text=='out'){
                //     displayInput = false;
                // }
                $('<input type="text" class="dial" value="'+options.val+'">').appendTo(target);
                $(".dial").knob({
                    // 'min':options.min,
                    // 'max':options.max,
                    'fgColor':options.fgColor,
                    'bgColor': options.bgColor,
                    'readOnly':options.readonly,
                    'width':options.width,
                    'height':options.width,
                    'displayInput':displayInput,
                    'format' : function (value) {
                         return value + '%';
                      }
                });
                if(options.text=='out'){
                    // target.find('canvas').after('<span style="position:absolute;margin:0px 20px;height:'+target.find('canvas').css( "height" )+';line-height:'+target.find('canvas').css( "height" )+';color:'+target.find('input.dial').css("color")+';font-weight: bold;font-size:'+target.find('input.dial').css("font-size")+';">'+options.val+'%</span>');
                    target.find('input.dial').css('margin-left','20px');
                    // target.find('input.dial').hide();
                   
                }
                else if(options.text=='none'){
                    target.find('input.dial').hide();
                }
            }
            else{

            }
        }, // end processBar function

        tableCollapse: function(conf){

            var target = conf.target;
            var hasCollapseBtn = conf.hasOwnProperty('hasCollapseBtn')? conf.hasCollapseBtn:true;
            var openIndex = conf.hasOwnProperty('openIndex')? conf.openIndex:-1;

            target.find('thead > tr').prepend('<th class="details-control sorting_disabled hidden"></th>');
            target.find('tbody > tr:not(.child)').prepend('<td class=" details-control hidden"></td>');
            
            var table = target.DataTable({
                filter: false,
                paging: false,
                Info: false,
                ordering: false,
                responsive: true
            });

        
            table.on( 'responsive-resize', function ( e, datatable, columns ) {

                // console.log('responsive-resize');

                controlDetail();

                
            });

            function openTabelWithIndex(open_conf){

                var openIndex = open_conf.openIndex;
                var collapseBtn = open_conf.collapseBtn;

                if( !collapseBtn.eq(1).parent().hasClass('parent') 
                    && !collapseBtn.eq(1).hasClass('hidden') ){
                    if( openIndex == -1 ){
                        collapseBtn.trigger('click');
                    } else {
                        collapseBtn.eq((openIndex+1)).trigger('click');
                    }
                }
            } // end openTabelWithIndex function
            
            
            function controlDetail() {
                var hiddenLen = target.find('tbody tr:first td:not(:first-child):hidden').length;
                var collapseBtn = target.find('.details-control');

                // console.log('hiddenLen', hiddenLen, target.attr('id'));

                if( !hasCollapseBtn ){
                    if( !collapseBtn.parent().hasClass('parent') ){
                        collapseBtn.trigger('click');
                    }
                    collapseBtn.addClass('hidden');
                } else if(hiddenLen > 0) {
                    collapseBtn.removeClass('hidden');                    
                } else {
                    collapseBtn.addClass('hidden');
                }

                openTabelWithIndex({
                    openIndex: openIndex,
                    collapseBtn: collapseBtn
                });
            } // end controlDetail function
            
            controlDetail();
        }, // end tableCollapse function

        datePicker: function(conf){

            var target = conf.target;
            var dateFormat = conf.hasOwnProperty('dateFormat')? conf.dateFormat:'yy-mm-dd';
            var maxMonth = conf.hasOwnProperty('maxMonth')? conf.maxMonth:'';
            var minMonth = conf.hasOwnProperty('minMonth')? conf.minMonth:'';
            var defaultDate = conf.hasOwnProperty('defaultDate')? conf.defaultDate:'';

            var datePicker_obj = {
                dateFormat: dateFormat,
                changeMonth: true,
                changeYear: true
            };

            if( maxMonth != '' ){ /* '+3m +10d' */
                datePicker_obj['maxDate'] = maxMonth+'m';
            }

            if( minMonth != '' ){
                datePicker_obj['minDate'] = minMonth+'m';
            }

            target.datepicker( datePicker_obj );

            if( defaultDate == '' ){
                var d = new Date();
                defaultDate = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
            }
            target.datepicker( 'setDate', defaultDate );
        } // end datePicker function
    },
    browser: {

        getLanguage: function() {
            var lang = window.navigator.userLanguage || window.navigator.language;
            var lang = lang.toLowerCase();

            return lang;
        },
        setCookie: function(obj) {
            /**
             var obj = {
                name : 'cookieName',
                value : 'cookieValue',
                expiresDay : 1,
                isRemeberMe : true
            };
             **/

            var exdays = obj.expiresDay;
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = 'expires=' + d.toUTCString();

            if (obj.isRemeberMe) {
                document.cookie = obj.name + '=' + obj.value + '; ' + expires;
            } else {
                document.cookie = obj.name + '=' + obj.value + ';';
            }
        },
        getCookie: function(obj) {
            /**
             var obj = {
                name : 'cookieName'
            };
             **/

            var name = obj.name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];

                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return '';
        },
        delCookie: function(obj) {
            /**
             var obj = {
                name : 'cookieName'
            };
             **/

            var exdays = -1;
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = 'expires=' + d.toUTCString();
            var cvalue = getCookie(obj);

            document.cookie = obj.name + '=' + cvalue + '; ' + expires;
        },
        ieAlert: function(obj){
        
            /**
            var obj = {
                version : 8,
                title : '瀏覽器建議',
                content : '內容內容內容內容內容內容內容'
            };
            **/
            
            var conf = {
                version : 8
            };
            
            obj = $.extend(conf, obj);
            
            if(_isIEVersion(obj.version)) {
                GardenUtils.display.popup({
                    title:obj.title,             
                    content : obj.content,
                    closeCallBackFn : function(){},
                    showCallBackFn : function(){},
                    isShowSubmit : false,
                    isShowClose : true
                });
            }
            
            function _isIEVersion(ver){
                var b = document.createElement('b')
                b.innerHTML = '<!--[if IE ' + ver + ']><i></i><![endif]-->'
                return b.getElementsByTagName('i').length === 1;
            }
        },
        leaveWeb: function(obj){
        
            /**
            var obj = {
                title : '瀏覽器建議'
            };
            **/
            
            
            $('body').on('click','a[href]', function(ev) {
                var target = $(this);
                var href = $(target).attr('href');          
                var host = window.location.host;
                
                if(href != '' && (href.indexOf('http') != -1 || href.indexOf('https') != -1) && href.indexOf(host) == -1) {
                    console.debug(href);
                    console.debug(host);
                    var res = !confirm(obj.title);
                    
                    if(res) {
                        ev.preventDefault();
                    }
                }
            });
        }
        

    },
    valid: {
        //格式： 
        //var res = GardenUtils.valid.validForm({
        //     type:"alert | show",
        //     formId:["purchaserForm"],
        //     validEmpty : ["addresseeName","addresseeTel","addresseeCity","addresseeDistrict","addresseeAddress"],
        //     validNumber : ["addresseeTel"],
        //     validDecimal : [],
        //     validEmail:[],
        //     validDate:["receiveDate"],
        //     customizeFun:function(){}
        // });
        validForm: function(config) {
            console.debug(config);
            var noPass = [];
            var customizeValidResult = [];
            //var message = [];
            var hasErrName = [];

            if (!config.hasOwnProperty('showAllErr')) {
                config['showAllErr'] = true;
            }

            if (config.formId != undefined && config.formId != "") {

                $(config.formId).each(function(i, n) {

                    // verify empty
                    var empty_groupArr = [];
                    $(config.validEmpty).each(function(j, number) {

                        var errName = number.hasOwnProperty('group') ? number.group : number.name;
                        if (config.showAllErr || hasErrName.indexOf(errName) == -1) {
                            var $this = $('#' + n).find('[name="' + number.name + '"]');

                            //2016-10-02 added by titan,check input type is radio re get jquery obj
                            if($this.attr('type') == 'radio') {
                                $this = $('#' + n).find('[name="' + number.name + '"]:checked');
                            }
                            
                            if ($this.length != 0 && $this.parents(":hidden").length == 0) {
                                var val = (number.hasOwnProperty('notRemoveSpace') && number.notRemoveSpace ? $this.val() : GardenUtils.valid.removeSpace($this.val()));
                                //2016-10-02 added by titan add html editor type check
                                if($this.attr('type') != undefined && $this.attr('type') == 'editor') {
                                    if($this.parent().find('.htmlData.hidden').length != 0) {
                                        val = $this.parent().find('.htmlData.hidden').html();
                                    }
                                    else if($this.parent().find('.highlightData.hidden').length != 0) {
                                        val = $this.parent().find('.highlightData.hidden').html();
                                    }
                                }                               
                                
                                if( $this.attr('type')!='radio' && $this.attr('type')!='checkbox' && $this.attr('type') != 'file' && $this.attr('type') != 'editor' ){
                                    $this.val(val);
                                }
                                
                                var test = number.name;
                                console.debug('n:' + n + '/name:' + number.name + '/val:' + val + '_' + number.msg, val === "");

                                if( $this.attr('type')=='radio' || $this.attr('type')=='checkbox' ){
                                    val = $('input[name="'+number.name+'"]:checked', '#'+config.formId).val();
                                }

                                if( $this.attr('type') == 'file'){

                                    $this.children('[data-provides="fileupload"]').each(function(){
                                        if( $(this).hasClass('fileupload-exists') ){
                                            val = 'fileupload-exists';
                                        }
                                    });
                                }

                                if(val === undefined){
                                    val = '';
                                }

                                if (val === "" || val === "請選擇") { // || val === "00") {
                                    //message.push('請輸入'+number.msg);
                                    if (!number.hasOwnProperty('group')) {
                                        hasErrName.push(errName);

                                        noPass.push({
                                            name: number.name,
                                            type: 'empty',
                                            msg: number.msg,
                                            obj: $this,
                                            val: val
                                        });

                                    } else if (empty_groupArr.indexOf(number.group) == -1) {
                                        hasErrName.push(errName);
                                        empty_groupArr.push(number.group);

                                        noPass.push({
                                            name: number.name,
                                            type: 'empty',
                                            msg: number.msg,
                                            obj: $this,
                                            val: val
                                        });
                                    }

                                }
                            }
                        }
                    }); // end each: valid empty
                    /*$(config.validEmpty).each(function(j, number) {

                        var errName = number.hasOwnProperty('group') ? number.group : number.name;
                        if (config.showAllErr || hasErrName.indexOf(errName) == -1) {
                            var $this = $('#' + n).find('[name="' + number.name + '"]');

                            if ($this.length != 0 && $this.parents(":hidden").length == 0) {
                                var val = (number.hasOwnProperty('notRemoveSpace') && number.notRemoveSpace ? $this.val() : GardenUtils.valid.removeSpace($this.val()));
                                $this.val(val);
                                var test = number.name;
                                console.debug('n:' + n + '/name:' + number.name + '/val:' + val + '_' + number.msg, val === "");

                                if (val === "" || val === undefined || val === "請選擇") { // || val === "00") {
                                    //message.push('請輸入'+number.msg);
                                    if (!number.hasOwnProperty('group')) {
                                        hasErrName.push(errName);

                                        noPass.push({
                                            name: number.name,
                                            type: 'empty',
                                            msg: number.msg,
                                            obj: $this,
                                            val: val
                                        });

                                    } else if (empty_groupArr.indexOf(number.group) == -1) {
                                        hasErrName.push(errName);
                                        empty_groupArr.push(number.group);

                                        noPass.push({
                                            name: number.name,
                                            type: 'empty',
                                            msg: number.msg,
                                            obj: $this,
                                            val: val
                                        });
                                    }

                                }
                            }
                        }
                    }); // end each: valid empty*/

                    //verify number
                    var number_groupArr = [];
                    $(config.validNumber).each(function(j, number) {
                        var errName = number.hasOwnProperty('group') ? number.group : number.name;
                        if (config.showAllErr || hasErrName.indexOf(errName) == -1) {
                            var $this = $('#' + n).find('[name="' + number.name + '"]');

                            console.debug($this);
                            console.debug($this.length);

                            if ($this.length != 0 && $this.parents(":hidden").length == 0) {
                                var val = (number.hasOwnProperty('notRemoveSpace') && number.notRemoveSpace ? $this.val() : GardenUtils.valid.removeSpace(RemoveComma($this.val())));
                                $this.val(val);

                                console.debug('validNumber', val);
                                console.debug('validNumber', number.allowEmpty);

                                if (!number.allowEmpty && val == '' && (!number.hasOwnProperty('group') || number_groupArr.indexOf(number.group) == -1)) {
                                    number_groupArr.push(number.group);
                                    hasErrName.push(errName);

                                    noPass.push({
                                        name: number.name,
                                        type: 'number',
                                        msg: number.msg,
                                        obj: $this,
                                        val: val
                                    });
                                } else {
                                    if (!number.hasOwnProperty('hasHiddenCode')) {
                                        number['hasHiddenCode'] = false;
                                    }
                                    var hiddenConf = {
                                        hasHiddenCode: number.hasHiddenCode,
                                        src: val,
                                        target: number.hiddenTarget,
                                        checkFun: function(conf) {
                                            return isNumeric(conf.num);
                                        },
                                        checkFunParam: {
                                            num: val
                                        }
                                    };

                                    if (!checkHiddenCode(hiddenConf) && val != "" && (!number.hasOwnProperty('group') || number_groupArr.indexOf(number.group) == -1)) {
                                        //message.push(number.msg + ":請輸入正確的數字形式");
                                        number_groupArr.push(number.group);
                                        hasErrName.push(errName);

                                        noPass.push({
                                            name: number.name,
                                            type: 'number',
                                            msg: number.msg,
                                            obj: $this,
                                            val: val
                                        });
                                    }
                                }
                            }
                        }
                    }); // end if: valid number


                    //verify decimal
                    $(config.validDecimal).each(function(j, number) {
                        var errName = number.hasOwnProperty('group') ? number.group : number.name;
                        if (config.showAllErr || hasErrName.indexOf(errName) == -1) {
                            var $this = $('#' + n).find('[name="' + number.name + '"]');

                            if ($this.length != 0 && $this.parents(":hidden").length == 0) {
                                var val = (number.hasOwnProperty('notRemoveSpace') && number.notRemoveSpace ? $this.val() : GardenUtils.valid.removeSpace($this.val()));
                                $this.val(val);

                                if (!number.allowEmpty && val == '') {
                                    hasErrName.push(errName);

                                    noPass.push({
                                        name: number.name,
                                        type: 'decimal',
                                        msg: number.msg,
                                        obj: $this,
                                        val: val
                                    });
                                } else {
                                    if (!isNumeric(val) && val != "") {
                                        //message.push(number.msg + ":請輸入正確的數字形式");
                                        hasErrName.push(errName);

                                        noPass.push({
                                            name: number.name,
                                            type: 'decimal',
                                            msg: number.msg,
                                            obj: $this,
                                            val: val
                                        });
                                    }
                                }

                            }
                        }
                    }); // end if: valid decimal

                    //verify date
                    $(config.validDate).each(function(j, number) {
                        var errName = number.hasOwnProperty('group') ? number.group : number.name;
                        if (config.showAllErr || hasErrName.indexOf(errName) == -1) {
                            var $this;
                            if (number.name.length == 1) {
                                $this = $('#' + n).find('[name="' + number.name + '"]');
                            } else if (number.name.length == 3) {

                                $this = [];

                                $.each(number.name, function(k, nameEle) {
                                    if ($.isNumeric(nameEle)) {
                                        $this.push(nameEle);
                                    } else {
                                        $this.push($('#' + n).find('[name="' + nameEle + '"]'));
                                    }
                                });

                                //$this = [$('#' + n).find('[name="' + number.name[0] + '"]'), $('#' + n).find('[name="' + number.name[1] + '"]'), $('#' + n).find('[name="' + number.name[2] + '"]')];
                            }


                            console.debug('validDate', number);

                            if ($this.length != 0 && (($this.length == 1 && $this.parents(":hidden").length == 0) || ($this.length == 3 && $this[0].parents(":hidden").length == 0))) {
                                var val = '';
                                if (number.name.length == 1) {
                                    val = (number.hasOwnProperty('notRemoveSpace') && number.notRemoveSpace ? $this.val() : GardenUtils.valid.removeSpace($this.val()));
                                    $this.val(val);
                                } else if (number.name.length == 3) {
                                    var val_tmp = '';
                                    $.each($this, function(i, dateName) {

                                        if (i != 0) {
                                            val += number.splitEle;
                                        }

                                        if ($.isNumeric(dateName)) {
                                            val_tmp = dateName;
                                        } else {
                                            val_tmp = (number.hasOwnProperty('notRemoveSpace') && number.notRemoveSpace ? dateName.val() : GardenUtils.valid.removeSpace(dateName.val()));
                                            dateName.val(val_tmp);
                                        }

                                        val += val_tmp;
                                    });
                                    /*var val_y = (number.hasOwnProperty('notRemoveSpace')&&number.notRemoveSpace? $this[0].val() : GardenUtils.valid.removeSpace( $this[0].val() ));
                                     $this[0].val( val_y );
                                     var val_m = (number.hasOwnProperty('notRemoveSpace')&&number.notRemoveSpace? $this[1].val() : GardenUtils.valid.removeSpace( $this[1].val() ));
                                     $this[1].val( val_m );
                                     var val_d = (number.hasOwnProperty('notRemoveSpace')&&number.notRemoveSpace? $this[2].val() : GardenUtils.valid.removeSpace( $this[2].val() ));
                                     $this[2].val( val_d );

                                     val = val_y+number.splitEle+val_m+number.splitEle+val_d;*/

                                }
                                number['val'] = val;

                                if (!number.hasOwnProperty('hiddenEle')) {
                                    number['hiddenEle'] = '*';
                                }


                                var hiddenVal = '',
                                    hiddenIndex = 0;
                                //因為可能會是空字串, 所以加一個判斷 by Foi 0803
                                console.debug(number.hiddenTarget);
                                if (number.hiddenTarget != '' && number.hiddenTarget != undefined) {
                                    var splitDate = number.hiddenTarget.split(number.splitEle);
                                    for (var i = 0; i < splitDate.length; ++i) {
                                        console.log('splitDate', splitDate[i], splitDate[i].indexOf(number.hiddenEle));
                                        if (splitDate[i].indexOf(number.hiddenEle) != -1) {
                                            hiddenVal = splitDate[i];
                                            hiddenIndex = i;
                                        }
                                    }
                                }
                                //var val = number.val;
                                if (!number.hasOwnProperty('hasHiddenCode')) {
                                    number['hasHiddenCode'] = false;
                                }

                                var hiddenConf = {
                                    hasHiddenCode: number.hasHiddenCode,
                                    src: val.split(number.splitEle)[hiddenIndex],
                                    target: hiddenVal,
                                    checkFun: function(conf) {
                                        return IsDate(conf);
                                    },
                                    checkFunParam: number
                                };

                                console.debug(hiddenConf);

                                if (number.allowEmpty) {
                                    //日期可為空
                                    if (!checkHiddenCode(hiddenConf) && val != "") {
                                        /**
                                         message.push("請輸入正確的時間格式");
                                         var currentDate = new Date();
                                         var day = currentDate.getDate();
                                         var month = currentDate.getMonth() + 1;
                                         var year = currentDate.getFullYear();
                                         if (month.toString().length == 1) month = "0" + month;
                                         if (day.toString().length == 1) day = "0" + day;
                                         $this.val(year + '/' + month + '/' + day);
                                         **/
                                        hasErrName.push(errName);

                                        noPass.push({
                                            name: number.name,
                                            type: 'date',
                                            msg: number.msg,
                                            obj: $this.length == 1 ? $this : $this[0],
                                            val: val
                                        });
                                    }
                                } else {
                                    //日期不可為空
                                    if (!checkHiddenCode(hiddenConf) && val != "") {
                                        /**
                                         message.push("請輸入正確的時間格式");
                                         var currentDate = new Date();
                                         var day = currentDate.getDate();
                                         var month = currentDate.getMonth() + 1;
                                         var year = currentDate.getFullYear();
                                         if (month.toString().length == 1) month = "0" + month;
                                         if (day.toString().length == 1) day = "0" + day;
                                         $this.val(year + '/' + month + '/' + day);
                                         **/
                                        hasErrName.push(errName);

                                        noPass.push({
                                            name: number.name,
                                            type: 'date',
                                            msg: number.msg,
                                            obj: $this.length == 1 ? $this : $this[0],
                                            val: val
                                        });
                                    }
                                }
                            }
                        }
                    }); // end if: valid date

                    //verify email
                    $(config.validEmail).each(function(i, number) {
                        var errName = number.hasOwnProperty('group') ? number.group : number.name;
                        if (config.showAllErr || hasErrName.indexOf(errName) == -1) {
                            var $this = $('#' + n).find('[name="' + number.name + '"]');

                            if ($this.length != 0 && $this.parents(":hidden").length == 0) {
                                var val = (number.hasOwnProperty('notRemoveSpace') && number.notRemoveSpace ? $this.val() : GardenUtils.valid.removeSpace($this.val()));
                                $this.val(val);

                                if (!number.hasOwnProperty('hasHiddenCode')) {
                                    number['hasHiddenCode'] = false;
                                }
                                var hiddenConf = {
                                    hasHiddenCode: number.hasHiddenCode,
                                    src: val,
                                    target: number.hiddenTarget,
                                    checkFun: function(conf) {
                                        return checkEmail(conf.email);
                                    },
                                    checkFunParam: {
                                        email: val
                                    }
                                };

                                if (!number.allowEmpty && val == "") {
                                    hasErrName.push(errName);

                                    noPass.push({
                                        name: number.name,
                                        type: 'email',
                                        msg: number.msg,
                                        obj: $this,
                                        val: val
                                    });
                                } else {
                                    if (val != "" && !checkHiddenCode(hiddenConf)) {
                                        hasErrName.push(errName);

                                        noPass.push({
                                            name: number.name,
                                            type: 'email',
                                            msg: number.msg,
                                            obj: $this,
                                            val: val
                                        });
                                    }
                                }
                            }
                        }
                    }); // end if: valid email

                    //verify identity
                    $(config.validIdentity).each(function(i, number) {

                        var errName = number.hasOwnProperty('group') ? number.group : number.name;
                        if (config.showAllErr || hasErrName.indexOf(errName) == -1) {
                            var $this = $('#' + n).find('[name="' + number.name + '"]');

                            if ($this.length != 0 && $this.parents(":hidden").length == 0) {
                                var val = (number.hasOwnProperty('notRemoveSpace') && number.notRemoveSpace ? $this.val() : GardenUtils.valid.removeSpace($this.val()));
                                $this.val(val);

                                if (!number.hasOwnProperty('hasHiddenCode')) {
                                    number['hasHiddenCode'] = false;
                                }
                                var hiddenConf = {
                                    hasHiddenCode: number.hasHiddenCode,
                                    src: val,
                                    target: number.hiddenTarget,
                                    checkFun: function(conf) {
                                        console.log('isForeigner', checkID(conf.id), isValidFrgnID(conf.id));
                                        return (!conf.isForeigner ? checkID(conf.id) : ((checkID(conf.id) || isValidFrgnID(conf.id)) ? true : false));
                                    },
                                    checkFunParam: {
                                        id: val,
                                        isForeigner: number.hasOwnProperty('isForeigner')? number.isForeigner: false
                                    }
                                };

                                if (number.allowEmpty) {

                                    //可為空
                                    if (!checkHiddenCode(hiddenConf) && val != "") {
                                        hasErrName.push(errName);

                                        noPass.push({
                                            name: number.name,
                                            type: 'identity',
                                            msg: number.msg,
                                            obj: $this,
                                            val: val
                                        });
                                        //message.push("請輸入正確的身分證字號");
                                    }
                                } else {
                                    //不可為空
                                    if (val == "") {
                                        hasErrName.push(errName);

                                        noPass.push({
                                            name: number.name,
                                            type: 'identity',
                                            msg: number.msg,
                                            obj: $this,
                                            val: val
                                        });
                                        //message.push("身分證字號不得為空");
                                    } else if (!checkHiddenCode(hiddenConf)) {
                                        hasErrName.push(errName);

                                        noPass.push({
                                            name: number.name,
                                            type: 'identity',
                                            msg: number.msg,
                                            obj: $this,
                                            val: val
                                        });
                                        //message.push("請輸入正確的身分證字號");
                                    }
                                }
                            }
                        }
                    }); // end if: valid identity

                    //verify mobile
                    $(config.validMobile).each(function(i, number) {
                        var errName = number.hasOwnProperty('group') ? number.group : number.name;
                        if (config.showAllErr || hasErrName.indexOf(errName) == -1) {
                            var $this = $('#' + n).find('[name="' + number.name + '"]');

                            if ($this.length != 0 && $this.parents(":hidden").length == 0) {
                                var val = (number.hasOwnProperty('notRemoveSpace') && number.notRemoveSpace ? $this.val() : GardenUtils.valid.removeSpace($this.val()));
                                $this.val(val);

                                if (!number.hasOwnProperty('hasHiddenCode')) {
                                    number['hasHiddenCode'] = false;
                                }
                                var hiddenConf = {
                                    hasHiddenCode: number.hasHiddenCode,
                                    src: val,
                                    target: number.hiddenTarget,
                                    checkFun: function(conf) {
                                        return isMobileNumber(conf.mobile);
                                    },
                                    checkFunParam: {
                                        mobile: val
                                    }
                                };

                                if (!number.allowEmpty && val == "") {
                                    hasErrName.push(errName);

                                    noPass.push({
                                        name: number.name,
                                        type: 'mobile',
                                        msg: number.msg,
                                        obj: $this,
                                        val: val
                                    });
                                } else {
                                    if (!checkHiddenCode(hiddenConf) && val != "") {
                                        hasErrName.push(errName);

                                        noPass.push({
                                            name: number.name,
                                            type: 'mobile',
                                            msg: number.msg,
                                            obj: $this,
                                            val: val
                                        });
                                    }
                                }
                            }
                        }
                    }); // end if: valid mobile

                    //verify Chinese
                    $(config.validChinese).each(function(i, number) {
                        var errName = number.hasOwnProperty('group') ? number.group : number.name;
                        if (config.showAllErr || hasErrName.indexOf(errName) == -1) {
                            var $this = $('#' + n).find('[name="' + number.name + '"]');

                            if ($this.length != 0 && $this.parents(":hidden").length == 0) {
                                var val = (number.hasOwnProperty('notRemoveSpace') && number.notRemoveSpace ? $this.val() : GardenUtils.valid.removeSpace($this.val()));
                                $this.val(val);

                                if (!number.hasOwnProperty('hasHiddenCode')) {
                                    number['hasHiddenCode'] = false;
                                }
                                var hiddenConf = {
                                    hasHiddenCode: number.hasHiddenCode,
                                    src: val,
                                    target: number.hiddenTarget,
                                    checkFun: function(conf) {
                                        return (conf.chinese.match(/^[\u4E00-\u9FA5]+$/) != null);
                                    },
                                    checkFunParam: {
                                        chinese: val
                                    }
                                };

                                if (!number.allowEmpty && val == "") {
                                    hasErrName.push(errName);

                                    noPass.push({
                                        name: number.name,
                                        type: 'chinese',
                                        msg: number.msg,
                                        obj: $this,
                                        val: val
                                    });
                                } else {
                                    if (!checkHiddenCode(hiddenConf) && val != "") {
                                        hasErrName.push(errName);

                                        noPass.push({
                                            name: number.name,
                                            type: 'chinese',
                                            msg: number.msg,
                                            obj: $this,
                                            val: val
                                        });
                                    }
                                }
                            }
                        }
                    }); // end if: valid chinese

                });

                if( config.hasOwnProperty('customizeFun') ){
                    config.customizeFun(customizeValidResult);
                }

                console.debug(noPass);
            } else {
                alert('請輸入驗證範圍');
            }

            // console.debug(message);

            if (noPass.length != 0 || customizeValidResult.length != 0) {

                var displayType = config.type;
                if (displayType == 'alert') {
                    var message = [];

                    //先跑基本的
                    $.each(noPass, function(i, obj) {
                        var name = obj.name;
                        var type = obj.type;
                        var msg = obj.msg;
                        var validObj = obj.obj;
                        var val = obj.val;

                        if (val.indexOf('*') != -1) {
                            msg = msg + '勿輸入遮掩字元，請重新輸入';
                        } else {
                            if (type == 'empty') {
                                /*if(validObj[0].tagName.toLowerCase() == 'input') {
                                        msg = '請輸入' + msg;
                                    }
                                    else {
                                        msg = '請選擇' + msg;
                                    }*/
                                //富邦一律要顯示請輸入,不論是下拉式選單還是輸入框 by Foi 2016/07/12
                                msg = '請輸入' + msg;
                            } else if (type == 'number') {
                                msg = msg + '限輸入數字';
                            } else if (type == 'decimal') {
                                msg = msg + '限輸入數字';
                            } else if (type == 'chinese') {
                                msg = msg + '限輸入中文字';
                            } else if (type == 'date' || type == 'email' || type == 'identity' || type == 'mobile') {
                                if (val.indexOf('*') != -1) {
                                    msg = msg + '勿輸入遮掩字元，請重新輸入';
                                } else {
                                    msg = msg + '格式錯誤';
                                }
                            }
                        }



                        message.push(msg);
                    });

                    //再跑客製的
                    $.each(customizeValidResult, function(i, obj) {
                        console.debug(customizeValidResult);
                        var errName = obj.hasOwnProperty('group') ? obj.group : obj.obj.attr('name');
                        if (config.showAllErr || hasErrName.indexOf(errName) == -1) {
                            var validObj = obj.obj;
                            console.debug(validObj);
                            var msg = obj.msg;

                            var validObjectParent = validObj.parents('div:first');
                            message.push(msg);
                        }
                    }); // end if: customize valid

                    var alertMsg = message.join('\n');
                    alert(alertMsg);
                } else if (displayType == 'show') {
                    //先清空error-msg
                    $('.error-msg').text('');

                    //先跑基本的
                    $.each(noPass, function(i, obj) {
                        console.debug(obj);

                        var name = obj.name;
                        var type = obj.type;
                        var msg = obj.msg;
                        var validObj = obj.obj;
                        var val = obj.val;

                        if (val.indexOf('*') != -1) {
                            msg = msg + '勿輸入遮掩字元，請重新輸入';
                        } else {
                            if (type == 'empty') {
                                //富邦一律要顯示請輸入,不論是下拉式選單還是輸入框 by Foi 2016/07/12
                                msg = '請輸入' + msg;
                            } else if (type == 'number') {
                                msg = msg + '限輸入數字';
                            } else if (type == 'decimal') {
                                msg = msg + '限輸入數字';
                            } else if (type == 'chinese') {
                                msg = msg + '限輸入中文字';
                            } else if (type == 'date' || type == 'email' || type == 'identity' || type == 'mobile') {

                                /** --start 0629  忠毅 register的錯誤訊息是: 身分證字號驗證錯誤  **/
                                if (type == 'identity') {

                                    /**  0716 忠毅  輸入非英數字,規定要顯示: 限輸入英數字  **/
                                    if (/^[a-zA-Z0-9- ]*$/.test(obj.val) == false) {
                                        //alert('string contains non english characters');
                                        msg = '限輸入英數字';
                                    }
                                    /**  0716 忠毅  長度不符,規定要顯示: 輸入長度不符  **/
                                    else if (obj.val.length < 10)
                                        msg = '輸入長度不符';

                                    else
                                        msg = msg + '驗證錯誤';


                                } else {
                                    /** --end 0629  忠毅 register的錯誤訊息是: 身分證字號驗證錯誤  **/

                                    if (val.indexOf('*') != -1) {
                                        msg = msg + '勿輸入遮掩字元，請重新輸入';
                                    } else {
                                        msg = msg + '格式錯誤';
                                    }
                                }

                            }
                        }



                        var validObjParent = validObj.parents('div.right:first');

                        if (validObjParent.length == 0) {
                            validObjParent = validObj.parent();
                        }

                        var oriMsg = validObjParent.find('.error-msg').text();
                        if (oriMsg != '') msg = ',' + msg;
                        validObjParent.find('.error-msg').text(oriMsg + msg);
                    });

                    //再跑客製的
                    $.each(customizeValidResult, function(i, obj) {
                        var errName = obj.hasOwnProperty('group') ? obj.group : obj.obj.attr('name');
                        if (config.showAllErr || hasErrName.indexOf(errName) == -1) {
                            var validObj = obj.obj;
                            console.debug(validObj);
                            var msg = obj.msg;

                            var validObjParent = validObj.parents('div.right:first');
                            console.debug(validObjParent.length);

                            if (validObjParent.length != 0) { //輸入框之parent之class名為right時
                                var oriMsg = validObjParent.find('.error-msg').text();
                                if (oriMsg != '') msg = ',' + msg;
                                validObjParent.find('.error-msg').text(oriMsg + msg);
                            } else { //輸入框之parent之class名不一定時
                                var validObjectParent = validObj.parents('div:first');
                                var oriMsg = validObjectParent.find('.error-msg').text();
                                if (oriMsg != '') msg = ',' + msg;
                                validObjectParent.find('.error-msg').text(oriMsg + msg);
                            }
                        }
                    }); // end if: customize valid
                }



                return false;
            } else {
                return true;
            }

            ////////////////////////////
            // 確認隱碼
            function checkHiddenCode(conf) {

                console.log('checkHiddenCode conf:', conf);

                if (conf.hasHiddenCode && conf.src === conf.target) {
                    return true;
                } else {
                    if (conf.src.indexOf('*') != -1) return false
                    else return conf.checkFun(conf.checkFunParam);
                }
            }
            //身分證字號
            function isValidChar() {

                var test = isValidChar.arguments[0];
                var range = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

                if (isValidChar.arguments.length == 2) {
                    range = isValidChar.arguments[1];
                }

                for (var i = 0; i < test.length; i++) {
                    if (range.indexOf(test.charAt(i)) < 0) {
                        return false;
                    }
                }
                return true;
            }

            function checkID(s) {

                var sum = 0;
                s = s.toUpperCase();

                /*if ((isValidChar(s.substring(0, 2), "ABCDEFGHIJKLMNOPQRSTUVWXYZ")) || (isValidChar(s.substring(s.length-2), "ABCDEFGHIJKLMNOPQRSTUVWXYZ")) ) {

                    return true;

                }

                // 檢核ID正確性

                var chk = "";

                if ((s.length == 10) && (isValidChar(s.substring(8, 10), "0123456789"))) {

                        chk = s.substring(6, 10);

                } else {

                    if (s.length == 7) {

                            chk = s.substring(3, 7);

                    } else {

                            chk = s.substring(4, 8);

                    }

                }

                if (!isValidChar(chk, "0123456789")) {

                        // 檢核ID不正確

                        return false;

                }*/

                if ((s.length != 10)) { //&& (s.length != 8)) {

                        // 身份證字號錯誤

                        return false;

                } else if (s.length == 10) {

                        // 本國國民身份證字號

                        var s1 = "";

                        switch (s.charAt(0)) {

                                case 'A' : s1 = "10"; break;

                                case 'B' : s1 = "11"; break;

                                case 'C' : s1 = "12"; break;

                                case 'D' : s1 = "13"; break;

                                case 'E' : s1 = "14"; break;

                                case 'F' : s1 = "15"; break;

                                case 'G' : s1 = "16"; break;

                                case 'H' : s1 = "17"; break;

                                case 'I' : s1 = "34"; break;

                                case 'J' : s1 = "18"; break;

                                case 'K' : s1 = "19"; break;

                                case 'L' : s1 = "20"; break;

                                case 'M' : s1 = "21"; break;

                                case 'N' : s1 = "22"; break;

                                case 'O' : s1 = "35"; break;

                                case 'P' : s1 = "23"; break;

                                case 'Q' : s1 = "24"; break;

                                case 'R' : s1 = "25"; break;

                                case 'S' : s1 = "26"; break;

                                case 'T' : s1 = "27"; break;

                                case 'U' : s1 = "28"; break;

                                case 'V' : s1 = "29"; break;

                                case 'W' : s1 = "32"; break;

                                case 'X' : s1 = "30"; break;

                                case 'Y' : s1 = "31"; break;

                                case 'Z' : s1 = "33"; break;

                                default  : return false;

                        }

                        if (!isValidChar(s.substring(1), "0123456789")) {

                                // 身份證後九碼不為數字

                                return false;

                        }

                        s1 += s.substring(1);

         

                        var xArray = new Array(1,9,8,7,6,5,4,3,2,1,1);

                        for (var i = 0; i < s1.length; i++) {

                                sum += parseInt(s1.charAt(i)) * xArray[i];

                        }

                        return (sum % 10 == 0) ? true : false;

         

                } /*else if (s.length == 8) {

                        // 法人戶統一編號

                        //Yumi Update-為配合外國人虛擬統編,故如長度為8,不檢核。

                        return true;

                       

                        if (!isValidChar(s, "0123456789")) {

                                // 法人戶統一編號不為數字

                                return false;

                        }

         

                        var d = new Array();

                        for (var i = 0; i < s.length; i++) {

                                d[i] = parseInt(s.charAt(i));

                        }

         

                        var tmpS = 0;

                        tmpS = d[1] * 2;

                        var s11 = Math.floor(tmpS / 10);

                        var s12 = tmpS % 10;

         

                        tmpS = d[3] * 2;

                        var s21 = Math.floor(tmpS / 10);

                        var s22 = tmpS % 10;

         

                        tmpS = d[5] * 2;

                        var s31 = Math.floor(tmpS / 10);

                        var s32 = tmpS % 10;

         

                        tmpS = d[6] * 4;

                        var s41 = Math.floor(tmpS / 10);

                        var s42 = tmpS % 10;

         

                        var sum = d[0] + d[2] + d[4] + d[7] + s11 + s12 + s21 + s22 + s31 + s32 + s41 + s42;

                        if (sum % 10 == 0) {

                                return true;

                        } else if (d[6] != 7) {

                                return false;

                        } else {

                                tmpS = s41 + s42;

                                var s51 = Math.floor(tmpS / 10);

                                var s52 = tmpS % 10;

                                sum = d[0] + d[2] + d[4] + d[7] + s11 + s12 + s21 + s22 + s31 + s32 + s51 + s52;

                                if (sum % 10 == 0) {

                                        return true;

                                } else {

                                        return false;

                                }

                        }

                }*/

            }
            // 檢核外國人統一證號(AA12345675)
            // 第一碼：縣市別代碼；第二碼：性別；第三～九碼：流水號；第十碼：檢核碼
            function isValidFrgnID(s) {

                s = s.toUpperCase();
                if (!s.match(/^[A-Z]{1}[A-D]{1}[0-9]{8}$/)) return false;

                var s1 = getIdCharMap(s.charAt(0)) + getIdCharMap(s.charAt(1)).charAt(1) + s.substring(2);
                var sum = 0;
                var xArray = new Array(1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1);

                console.log('s1', s1);

                for (var i = 0; i < s1.length; i++) {

                    sum += parseInt(s1.charAt(i)) * xArray[i];

                    //console.log('sum', sum);

                }

                return (sum % 10 == 0) ? true : false;
            }

            function getIdCharMap(c) {

                var r = "";

                switch (c) {

                    case 'A':
                        r = "10";
                        break;

                    case 'B':
                        r = "11";
                        break;

                    case 'C':
                        r = "12";
                        break;

                    case 'D':
                        r = "13";
                        break;

                    case 'E':
                        r = "14";
                        break;

                    case 'F':
                        r = "15";
                        break;

                    case 'G':
                        r = "16";
                        break;

                    case 'H':
                        r = "17";
                        break;

                    case 'I':
                        r = "34";
                        break;

                    case 'J':
                        r = "18";
                        break;

                    case 'K':
                        r = "19";
                        break;

                    case 'L':
                        r = "20";
                        break;

                    case 'M':
                        r = "21";
                        break;

                    case 'N':
                        r = "22";
                        break;

                    case 'O':
                        r = "35";
                        break;

                    case 'P':
                        r = "23";
                        break;

                    case 'Q':
                        r = "24";
                        break;

                    case 'R':
                        r = "25";
                        break;

                    case 'S':
                        r = "26";
                        break;

                    case 'T':
                        r = "27";
                        break;

                    case 'U':
                        r = "28";
                        break;

                    case 'V':
                        r = "29";
                        break;

                    case 'W':
                        r = "32";
                        break;

                    case 'X':
                        r = "30";
                        break;

                    case 'Y':
                        r = "31";
                        break;

                    case 'Z':
                        r = "33";
                        break;

                    default:
                        r = "";
                }
                return r;
            }
            //信箱
            function checkEmail(id) {
                /*var pattern = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
                return id.match(pattern);*/

                return (id.indexOf("@") != -1);

                //return (checkLength(id, 5) && id.indexOf("@") != -1);
            }

            function checkLength(dat, len) {
                return (dat.length >= len);
            }
            //整數
            function isInt(value) {
                if (isNaN(value)) {
                    return false;
                }
                var x = parseFloat(value);
                return (x | 0) === x;
            }
            //數字
            function isNumeric(n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            }
            //移除逗號
            function RemoveComma(n) {
                return n.replace(/[,]+/g, '');
            }
            //檢查日期格式
            function IsDate(config) {
                var conf = {
                    format: 'ac'
                };
                $.extend(conf, config);

                //console.error('d:', conf);

                var d = parseInt(conf.val.split(conf.splitEle)[2]);
                var m = parseInt(conf.val.split(conf.splitEle)[1]);
                var y = parseInt(conf.val.split(conf.splitEle)[0]);

                /*var validatePattern = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/;
                var validatePattern_ch = /^(\d{2,3})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/;
                var dateValues = conf.val.match(( conf.format == 'ch'? validatePattern_ch : validatePattern ));
                */

                var validatePattern = (y.toString().length == 4 ? ((m.toString().length == 1 || m.toString().length == 2) ? ((d.toString().length == 1 || d.toString().length == 2) ? true : null) : null) : null);
                var validatePattern_ch = ((y.toString().length == 2 || y.toString().length == 3) ? ((m.toString().length == 1 || m.toString().length == 2) ? ((d.toString().length == 1 || d.toString().length == 2) ? true : null) : null) : null);
                console.debug('validatePattern:', validatePattern, validatePattern_ch);
                var dateValues = (conf.format == 'ch' ? validatePattern_ch : validatePattern);

                if (dateValues == null) return false;
                else {

                    if (conf.format == 'ch') {
                        y += 1911;
                    }

                    console.debug('d:', y, m, d);

                    var date = new Date(y, m - 1, d);
                    if (date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d) {
                        return true;
                    } else {
                        return false;
                    }
                };
            }
            //檢查手機格式
            function isMobileNumber(txtMob) {
                var mob = /^[0]{1}[9]{1}[0-9]{8}$/;
                if (mob.test(txtMob) == false) {
                    return false;
                }
                return true;
            }
        },
        removeSpace: function(str) {
            while (str.indexOf(" ") != -1) {
                str = str.replace(" ", "");
            }
            return str;
        }
    },
    format: {
        inputTrimSpace: function(obj) {
            //var obj = {
            //    name : ['name','id']
            //};

            $.each(obj.name, function(i, name) {
                var input = $('input[name="' + name + '"][type="text"]');

                console.debug(name + ':' + input.length);
                input.on('blur', function() {
                    var val = input.val();
                    console.debug('val = ' + val);
                    input.val(GardenUtils.valid.removeSpace(val));
                });
            });
        },
        inputConvertFullWidth: function(obj) {
            //var obj = {
            //    name : ['name','id']
            //};


            $.each(obj.name, function(i, name) {
                var input = $('input[name="' + name + '"][type="text"]');

                console.debug(name + ':' + input.length);
                input.on('blur', function() {
                    var val = input.val();
                    console.debug('val = ' + val);

                    var after = '';
                    for (i = 0; i < val.length; i++) {
                        if (val.charCodeAt(i) >= 33 && val.charCodeAt(i) <= 270) {
                            after += String.fromCharCode(val.charCodeAt(i) + 65248);
                        } else if (val.charCodeAt(i) == 32) {
                            after += String.fromCharCode(12288);
                        } else {
                            after += val.substring(i, i + 1);
                        }
                    }

                    input.val(after);
                });
            });

        },
        inputFocusBlurEventHandler: function(obj) {

            console.debug(obj);

            /*
            var obj = {
                inputs : [
                                {
                                    inputName : 'inputName1', //輸入框name
                                    trimSpace : true, //是否離開輸入框過濾空白
                                    convertFullWidth : true, //是否離開輸入框後半形轉全形
                                    focusClearVal : true //是否點擊時清空值，離開後若沒改過則還原
                                },
                                {
                                    inputName : 'inputName1',
                                    trimSpace : true,
                                    convertFullWidth : true,
                                    focusClearVal : true
                                }
                        ]
            };
            */

            $.each(obj.inputs, function(i, obj) {

                obj = $.extend({
                    trimSpace: false,
                    convertFullWidth: false,
                    focusClearVal: false
                }, obj);

                console.debug(obj);

                var name = obj.inputName;
                var trimSpace = obj.trimSpace;
                var convertFullWidth = obj.convertFullWidth;
                var focusClearVal = obj.focusClearVal;

                var input = $('input[name="' + name + '"][type="text"]');

                //去掉disabled
                if (!input.is(':disabled')) {

                    console.debug(name + ':' + input.length);


                    //如果有需要點擊空白，離開後判斷是否有修改過，就要綁onFocus事件
                    if (focusClearVal) {
                        input.on('focus', function() {
                            var val = input.val();
                            console.debug('val = ' + val);

                            //先把值存下來
                            input.attr('original', val);

                            //清空值
                            input.val('');
                        });
                    }

                    input.on('blur', function() {
                        var val = input.val();
                        console.debug('val = ' + val);

                        //如果有需要點擊空白，離開後判斷是否有修改過，就要綁onFocus事件
                        var valIsChange = false;
                        if (focusClearVal) {
                            var original = input.attr('original');
                            //如果空白，就帶回原本的值
                            if (val == '') {
                                val = original;
                            } else {
                                valIsChange = true;
                            }
                        }

                        if (valIsChange) {
                            //去掉空白
                            if (trimSpace) {
                                val = GardenUtils.valid.removeSpace(val);
                            }

                            //半形轉全形
                            if (convertFullWidth) {
                                var after = '';
                                for (i = 0; i < val.length; i++) {
                                    if (val.charCodeAt(i) >= 33 && val.charCodeAt(i) <= 270) {
                                        after += String.fromCharCode(val.charCodeAt(i) + 65248);
                                    } else if (val.charCodeAt(i) == 32) {
                                        after += String.fromCharCode(12288);
                                    } else {
                                        after += val.substring(i, i + 1);
                                    }
                                }

                                val = after;
                            }
                        }

                        input.val(val);
                    });
                }
            });
        },
        convertThousandComma: function(number) {


            // console.debug('convertThousandComma number = ' + number);

            var num = number.toString();
            var pattern = /(-?\d+)(\d{3})/;

            while (pattern.test(num)) {
                num = num.replace(pattern, "$1,$2");

            }
            return num;
        }
    },
    display: {
        
        buildMobileSelect: function buildMobileSelect(obj){
        /**
            var obj = {
                rootId : '',//根節點id
                startLevel : 3,//選單從哪一層開始長,
                target : obj, //選單append在哪一塊div上
                activePageId: '' //客製化頁面的上層 id
            };
            **/
            var rootId = obj.rootId;
            var startLevel = obj.startLevel;
            var target = obj.target;
            var activePageId = obj.activePageId;
            
            var siteMap = _ga.site.func_map;
            var apPageObj = window._ga.el.data('ap.page');
            
            if(apPageObj != undefined) {
                
                //先找到自己是哪一頁
                var pageId = apPageObj['id'];
                var me = siteMap.find('[page="'+pageId+'"]');
                
                //如果找不到這一頁，就直接回去了
                if(me.length == 0 && activePageId == '' ) {
                    console.debug('cannot find current page from sitemap[pageId='+pageId+']');
                }
                else {

                    if(me.length == 0){
                        me = siteMap.find('[page="'+activePageId+'"]');
                        console.log('me: ', activePageId, me);
                    }

                    var id = me.attr('id');
                    var level = _pageLevel(id,1,rootId);
                    
                    //算距離差幾層
                    var range = level - startLevel;
                    
                    var mobileMenu = $('<div class="mobile_menu" />');
                    
                    //用差幾層來往推幾層，並長出對應的下拉選單
                    console.debug('range = ' + range);
                    if(range >= 0) {
                        
                        //開始長父層選單
                        console.debug('start create parent select');
                        
                        var mainParent = me;
                        //for(var i=0;i<=range;i++) {
                        for(var i=range;i>=0;--i) {
                            var mainParentFuncId = mainParent.attr('id');
                            mainParent = mainParent.parent();
                            
                            //長選單
                            var select = $('<select class="selectpicker" level="'+(i)+'" ></select>');
                            var options = _getOptions(mainParent.children());
                            select.empty().append(options);
                            
                            //帶入預設值
                            select.find('[value="'+mainParentFuncId+'"]').prop('selected',true);
                            
                            select.off('change').on('change',_selectChangeHandler);
                            
                            select.prependTo(mobileMenu);
                        }
                    }
                    
                    //開始長子層選單
                    console.debug('start create children select');
                    if(me.children().length != 0) {
                        var childSelect = $('<select class="selectpicker" level="'+(range+1)+'"></select>');
                        var childOptions = _getOptions(me.children());
                        
                        childSelect.append('<option>請選擇</option>'+childOptions);
                        childSelect.off('change').on('change',_selectChangeHandler);
                        childSelect.appendTo(mobileMenu);
                    }
                    
                    //長在目標空間
                    mobileMenu.appendTo(target);
                    
                    //設定一開始的寬度
                    _setMobileSelectStyle();
                }

            }
            
            
            function _getOptions(nodeArray){
                var chi = '';
                if(nodeArray.length!=0){
                    nodeArray.each(function(){
                        var name = $(this).attr("name");
                        var id = $(this).attr("id");
                        var pageId = $(this).attr("page");

                        chi = chi + '<option value="'+id+'">'+name+'</option>';
                    });
                }
                return chi;
            }

            function _pageLevel(id,count,rootId){
                var parent = siteMap.find('#' + id).parent();
                // var child = siteMap.find("#"+pageId).children();
                if(parent.attr('id') != rootId){
                    count = _pageLevel(parent.attr("id"),count,rootId);
                    count++
                }

                return count;
            }
            
            function _selectChangeHandler(e) {
            

                var select = $(this);
                var id = select.val();
                var page = siteMap.find('#' + id).attr('page');
                var url = siteMap.find('#' + id).attr("url");
                var level = select.attr('level');
                
                console.debug('id = ' + id);
                console.debug('page = ' + page);
                console.debug('url = ' + url);
                console.debug('level = ' + level);
                
                //如果有設URL就直接連出去
                if(url != undefined && url != '') {
                    if(url.substr(0,2) == '#!') {
                        var href = url.substr(2,url.length-2);
                        if(href.indexOf('?') != -1) {
                            url = href.substr(0,href.indexOf('?')) + '.html' + href.substring(href.indexOf('?'),href.length);
                        }
                        else {
                            url = href + '.html';
                        }
                    }
                
                    if(url.indexOf('http') != -1 || url.indexOf('_resource') != -1) {
                        $('a[href="'+url+'"][target="_blank"]:first')[0].click();
                    }
                    else {
                        location.href = url;
                    }
                
                    
                }
                else {
                    //如果有頁面就連過去
                    if(page!=''&&page!=undefined){  
                        location.href = "#!"+page;
                    }
                    else{
                        //如果什麼都沒有就是長下一層
                        
                        //先把目前這層底下的清單清空
                        $('.mobile_menu select.selectpicker').each(function(){
                            var selectpicker = $(this);
                            var selectLevel = selectpicker.attr('level');
                            
                            if(parseInt(selectLevel) > parseInt(level)) {
                                selectpicker.remove();
                            }
                        });
                        
                        var childSelect = $('<select class="selectpicker" level="'+(parseInt(level)+1)+'"></select>');
                        var childOptions = _getOptions(siteMap.find('#' + id).children());
                        var option = '<option>請選擇</option>' + childOptions;
                        console.debug('option:'+option);

                        childSelect.off('change').on('change',_selectChangeHandler);
                        childSelect.append(option);
                        childSelect.appendTo($('.mobile_menu'));
                        
                        //重算寬度
                        _setMobileSelectStyle();
                    }
                }
                
                
                
            }
            
            function _setMobileSelectStyle(){
                
                var totalSelectSize = $('.mobile_menu select.selectpicker').length;
                var index = totalSelectSize-2;
                
                
                $.each($('.mobile_menu select.selectpicker'),function(i,selectpicker){
                    selectpicker = $(selectpicker);
                    
                    var classVal = 'col-xs-12';
                    if(index >= 0 && i >= index) {
                        classVal = 'col-xs-6';
                    }
                    
                    selectpicker.removeClass().addClass('selectpicker').addClass(classVal);
                });
            }
        },

        pagination: function(obj) {
            //    pageInfo: obj.pageInfo                //分頁資料(包含總頁數 totalPage, 當前頁碼 currentPage, 總資料數 totalRec)
            //    target: jquery ele,                   //分頁的擺放位置
            //    getPageInfoCallBackFn : function(){}  //點分頁後要的function(會自動傳page參數)
            //    maxPage: 5                            //一次顯示幾頁
            //    hasGoToPage: false                    //是否顯示跳到第幾頁
            //    nav: {                                // 上一頁下一頁樣式，string or html
            //      prev: '上一頁',
            //      next: '下一頁'
            //    }
            
            
            if(obj !== undefined ){
                var totalPage = (obj.pageInfo.hasOwnProperty('totalPage') == false)?0:parseInt(obj.pageInfo.totalPage);
                var currentPage = (obj.pageInfo.currentPage == undefined)?0:parseInt(obj.pageInfo.currentPage);
                //var totalRec = (obj.pageInfo.totalRec == undefined)?0:parseInt(obj.pageInfo.totalRec);
                var getPageInfoCallBackFn = (obj.getPageInfoCallBackFn == undefined)?'':obj.getPageInfoCallBackFn;
                var maxPage = (obj.maxPage == undefined)? 5:obj.maxPage;
                var hasGoToPage = (obj.hasGoToPage == undefined)? false:obj.hasGoToPage;

                console.debug(getPageInfoCallBackFn);

                var target = $(obj.target);
                var pageNumberDiv = $('<div class="page_control col-xs-12 center"></div>').appendTo( target );
                if( totalPage > 1 && hasGoToPage ){
                    pageNumberDiv.addClass('col-md-8');
                    var gotoPageDiv = $('<div class="page_jump_control col-xs-12 col-md-4">'
                        +'<div class="sharepage pull-right center">直接到第'
                        +'<select class="n-form-select w100 gotopage"></select>'
                        +'頁</div></div>').appendTo( target );
                } // end if: has go to page
                var pageAreaArray = [];
                var pageNumberArray = [];
                
                //若分頁數超過 maxPage 頁,則要長"上一頁"和"下一頁"
                if (totalPage > maxPage) {                    

                    pageAreaArray.push('<a href="#" class="prev"></a>' +
                        '<ul class="pageNumber"></ul>' +
                        '<a href="#" class="next"></a>');

                }
                //否則就不用長"上一頁"和"下一頁"
                else {
                    pageAreaArray.push('<ul class="pageNumber"></ul>');

                }
                pageNumberDiv.empty();

                if( totalPage > 1 ){
                    pageNumberDiv.append(pageAreaArray.join(''));

                    if(obj.hasOwnProperty('nav')){
                        var prev_html = obj.nav.hasOwnProperty('prev')? obj.nav.prev:'上一頁';
                        var next_html = obj.nav.hasOwnProperty('next')? obj.nav.next:'下一頁';

                        pageNumberDiv.find('.prev').html(prev_html);
                        pageNumberDiv.find('.next').html(next_html);
                    }

                    var pageNumberUL = target.find('.pageNumber'); //放分頁數字的UL元素
                    var pageNumberSelect = target.find('.gotopage'); //放分頁數字的 select 元素                    

                    //長page的數字
                    console.debug(currentPage, totalPage);
                    for (var n = 1; n <= totalPage; n++) {
                        //console.debug(n);
                        pageNumberArray.push('<li class="numberOfPage" id="number' + n + '"><a href="#">' + n + '</a></li>');
                        pageNumberSelect.append('<option value="'+n+'">'+n+'</option>');
                    }
                    
                    pageNumberUL.append(pageNumberArray.join(''));
                    var numberOfPage = target.find('.numberOfPage'); //放分頁數字的LI元素

                    showNumber(target, totalPage,currentPage,(currentPage-(maxPage/2)),(totalPage-(currentPage + (maxPage/2 - 1))),currentPage);
                    //pageNumberUL.find('#number' + currentPage).show();
                
                        
                    //按分頁數字時的事件
                    numberOfPage.off('click').on('click', function(ev) {
                        ev.preventDefault();

                        var $this = $(this);
                        console.debug($this);
                        var index = $this.find('a').text(); //按的分頁數字
                        console.debug(index);
                        var dataArray = [];
                        var indexNumber = parseInt(index);
                        var preNumber = indexNumber - (maxPage/2); //判斷當前頁面前面是否還有五頁以上
                        var nextNumber = totalPage - (indexNumber + (maxPage/2 -1)); //判斷當前頁面後面是否還有4頁以上

                        getPageInfoCallBackFn(index);
                        

                        if( totalPage > maxPage && indexNumber > (maxPage/2) ){

                            pageNumberUL.find('.numberOfPage').each(function(){
                                var num = parseInt($(this).text());
                                if( num < preNumber ){
                                    $(this).hide();
                                }
                            });
                        } else if( totalPage > maxPage && indexNumber <= (maxPage/2) ){
                            pageNumberUL.find('.numberOfPage').each(function(){
                                var num = parseInt($(this).text());
                                if( num > maxPage ){
                                    $(this).hide();
                                }
                            });
                        }

                        //pageNumberUL.find('.numberOfPage').hide();
                        
                        //console.log('yooo', totalPage,index,preNumber,nextNumber,indexNumber);

                        showNumber(target, totalPage,index,preNumber,nextNumber,indexNumber, maxPage);
                        
                        pageNumberUL.find('#number' + indexNumber).show();

                        //先將全部頁面的數字的active拿掉, 再將當下頁面的數字加上active
                        numberOfPage.removeClass('active');
                        $this.addClass('active');

                        // GardenUtils.plugin.screenMoveToEle({
                        //     moveToObj: $('.eva_content').first(),
                        //     minHeight: 70
                        // });
                        
                    });
                    
                    //pageNumberUL.find('#number1').trigger('click');
                    //numberOfPage.first().addClass('active');
                    numberOfPage.first().trigger('click');

                    //按上一頁
                    target.find('.prev').off('click').on('click', function(ev) {
                        ev.preventDefault();
                        
                        var activePage = 0;

                        $.each(numberOfPage, function(index, ele) {
                            var ele = $(ele);
                            if (ele.hasClass('active')) {
                                console.debug(index);
                                activePage = parseInt(ele.children().text())-1; //index;
                            }
                        })

                        pageNumberUL.find('#number' + activePage).trigger('click');
                    });

                    //按下一頁
                    target.find('.next').off('click').on('click', function(ev) {
                        ev.preventDefault();
                        
                        var activePage = 0;

                        $.each(numberOfPage, function(index, ele) {
                            var ele = $(ele);
                            if (ele.hasClass('active')) {
                                console.debug(index, ele, ele.children().text());
                                activePage = parseInt(ele.children().text())+1; //index + 2;
                            }
                        })
                        pageNumberUL.find('#number' + activePage).trigger('click');
                    });

                    target.find('select.gotopage').on('change', function(){
                        target.find('#number'+$(this).val()).trigger('click');
                    });


                    var prev_html = '上一頁';
                    var next_html = '下一頁';
                    var nav_default = true;
                    if(obj.hasOwnProperty('nav')){
                        nav_default = false;
                        prev_html = obj.nav.hasOwnProperty('prev')? obj.nav.prev:'上一頁';
                        next_html = obj.nav.hasOwnProperty('next')? obj.nav.next:'下一頁';
                    }

                    $(window).resize(function(){
                        var window_w = $(window).width();

                        if( window_w < 769 && nav_default ){
                            target.find('.prev, .next').text('');
                        } else {
                            target.find('.prev').html(prev_html);
                            target.find('.next').html(next_html);
                        }
                    });
                    $(window).resize();
                } else {
                    getPageInfoCallBackFn(1);
                }
            }

            function showNumber(target, totalPage,index,preNumber,nextNumber,indexNumber, maxPage){
                console.debug(index);
                
                //先隱藏全部的分頁數字
                    for (var k = 1; k <= totalPage; k++) {
                        target.find('#number' + k).hide();
                    }

                    //若分頁大於 maxPage, 則需要多判斷何時隱藏"上一頁"或"下一頁"
                    if (totalPage > maxPage) {
                        var totalPageString = '' + totalPage;
                        
                        if (index == '1') { //若當前頁是在第一頁, 則隱藏"上一頁"
                            target.find('.prev').hide();
                            target.find('.next').show();
                        } else if (index == totalPage) { //若當前頁是在最後一頁, 則隱藏"下一頁"
                            target.find('.next').hide();
                            target.find('.prev').show();
                        } else {
                            target.find('.prev').show();
                            target.find('.next').show();
                        }

                        //若當前頁面前面沒有五頁以上,則顯示1~10頁的數字
                        if (preNumber <= 0) {
                            for (var j = 1; j <= maxPage; j++) {
                                target.find('#number' + j).show();
                            }
                        }
                        //再檢查當前夜後面有沒有四頁以上
                        else {
                            //若
                            if (nextNumber < 0) {
                                for (var j = totalPage; j >= ((totalPage-maxPage)+1); j--) {
                                    target.find('#number' + j).show();
                                }
                            }
                            //否則顯示當前頁的前五頁和後四頁的數字
                            else {
                                for (var i = 1; i <= (maxPage/2); i++) {
                                    var preShowingNumber = indexNumber - i;
                                    var nextShowingNumber = indexNumber + i;

                                    target.find('#number' + preShowingNumber).show();
                                    if (i !== (maxPage/2)) {
                                        target.find('#number' + nextShowingNumber).show();
                                    }
                                }
                            }
                        }
                    }
                    //若分頁小於10, 則全部顯示
                    else {
                        for (var k = 1; k <= totalPage; k++) {
                            target.find('#number' + k).show();
                        }
                    }
                    
                    //先將全部頁面的數字的active拿掉, 再將當下頁面的數字加上active
                    target.find('.numberOfPage').removeClass('active');
                    target.find('#number'+index).addClass('active');
            }
        },

        popup: function(obj) {
            /**
             var obj = {
                title : '我是標題',
                content : '我是內容',
                closeCallBackFn : function(){popupView},
                showCallBackFn : function(){popupView},
                isShowSubmit : true,
                isShowClose : true,
                closeText : true,
                submitText: true
                styleCSS:''
                popupSize:'' // or large, or small,
                headerClass: 'popup_header_red'
            };
             **/

            //default
            if (obj.isShowClose == undefined) {
                obj.isShowClose = true;
            }

            var closeText = '確定';
            if (obj.closeText !== undefined && obj.closeText !== false) { //如果沒有給obj.closeText 的值, 按鈕的文字就叫"確定", 否則叫"取消"
                closeText = '取消';
            }

            var submitText = '確認';
            if (obj.submitText !== undefined && obj.submitText !== false) { //如果沒有給obj.submitText 的值, 按鈕的文字就叫"確認", 否則叫"確定"
                submitText = '確定';
            }

            if (obj.styleCSS == undefined) {
                obj.styleCSS = '';
            }

            if( obj.headerClass == undefined ){
                obj.headerClass = 'popup_header_red';
            }

            var submitButton = obj.isShowSubmit ? '<button type="button" class="btn btn-primary">' + submitText + '</button>' : '';
            var closeButton = obj.isShowClose ? '<button type="button" class="btn btn-default" data-dismiss="modal">' + closeText + '</button>' : '';

            var popupSize = (obj.hasOwnProperty('popupSize')?(obj.popupSize=='large'?'modal-lg':'modal-sm'):'');
            var popupView = $('<div class="modal fade" id="_popup"><div class="modal-dialog '+popupSize+'" style="' + obj.styleCSS + '"><div class="modal-content"><div class="modal-header '+obj.headerClass+'"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">' + obj.title + '</h4></div><div class="modal-body">' + obj.content + '</div><div class="modal-footer">' + closeButton + submitButton + '</div></div></div></div>').appendTo($('body'));

            popupView.on('hidden.bs.modal', function(e) {
                console.debug('====close modal=====');
                popupView.remove();

                if (obj.closeCallBackFn != undefined) {
                    obj.closeCallBackFn.apply(window, [popupView]);
                }
            });

            popupView.on('shown.bs.modal', function(e) {
                console.debug('====init modal=====');
                if (obj.showCallBackFn != undefined) {
                    obj.showCallBackFn.apply(window, [popupView]);
                }
            });

            popupView.modal('toggle');
            popupView.find('.modal-dialog').css('z-index', 9999);

        },
        setContent: function(json, formplace) {

            var tableHtml = this.toHtml(json);
            $(formplace).html(tableHtml);

        },

        getRowHtml: function(rows, tag) {

            var cutomize = {
                inputbox: function(text, rowIndex) {
                    return '<input type="text" value="' + text + '"></input>';
                },
                textarea: function(text, rowIndex) {
                    return '<textarea type="text" rows="4" cols="50">' + text + '</textarea>';
                },
                select: function(text, rowIndex) {
                    return '<select type="text" value="' + text + '"></select>';
                },
                img: function(text, rowIndex) {
                    return '<img src="' + text + '">';
                },
                label: function(text, rowIndex) {
                    return '<label>' + text + '</label>';
                },
                hyperlink: function(text, rowIndex) {
                    return '<a href="#">' + text + '</a>';
                }

            };

            var rowArr = [];
            $.each(rows, function(idx, objArr) {
                var datas = [];
                // console.debug(objArr);
                $.each(objArr, function(i, obj) {
                    // console.debug(obj);
                    var text = obj.text;
                    var colspan = obj.colspan;
                    var rowspan = obj.rowspan;
                    var id = obj.id;
                    var type = obj.type;
                    var pushData = '';
                    if (tag != 'th') {
                        if (cutomize[type] != undefined) {
                            pushData += cutomize[type].apply(window, [text]);
                        } else {
                            pushData += text;
                        }
                    } else {
                        pushData += text;
                    }

                    datas.push('<' + tag + ' colspan="' + colspan + '" rowspan="' + rowspan + '" tagId="' + id + '">' + pushData + '</' + tag + '>');
                });
                // console.debug(datas.join(''));
                rowArr.push('<tr>' + datas.join('') + '</tr>');
            });
            return rowArr.join('');
        },
        toHtml: function(beanJson) {
            var fux = this;
            var ret;
            var navLiArr = [];
            var tableArr = [];

            var tableBean = beanJson.table;
            if (!(tableBean instanceof Array)) {
                tableBean = [tableBean];
            }

            $.each(tableBean, function(idx, tableObj) {
                var beanId = tableObj.beanId;
                var title = tableObj.title;
                var rows = tableObj.row;
                var titleRows = rows.title;
                var dataRows = rows.data;

                var navLi = '<li><a data-toggle="pill" href="#' + beanId + '">' + title + '</a></li>';
                var titleHtml = GardenUtils.display.getRowHtml(titleRows, 'th');
                var dataHtml = GardenUtils.display.getRowHtml(dataRows, 'td');
                var tableHtml = '<div id="' + beanId + '" class="tab-pane fade">' +
                    '<table class="table">' +
                    '<thead>' + titleHtml + '</thead>' +
                    '<tbody>' + dataHtml + '</tbody></table></div>';

                navLiArr.push(navLi);
                tableArr.push(tableHtml);
            });

            ret = '<div class="tab-content multiTable">' + tableArr.join('') + '</div>';
            if (tableArr.length > 1) {
                ret = '<div><ul class="nav nav-pills multiTableNav" role="tablist">' +
                    navLiArr.join('') + '</ul></div>' + ret;
            }
            ret = $('<div></div>').html(ret);
            ret.find('.multiTable > .tab-pane').eq(0).addClass('in active');
            ret.find('.multiTableNav > li').eq(0).addClass('active');
            return ret;
        },

        megamenu: function(conf){

            // html
            // <ul><li ga-megamenu-id="idStr" ga-megamenu-action="hover/click">
            //  <a>標題內容</a>
            //  <div ga-megamenu-target="idStr">詳細內容</div>
            // </li></ul>

            // conf:
            // target: jQuery element, <ul>

            function megamenu_trigger(config){
                var target = config.target;

                var li_list = config.liList;
                var li_ele = config.liEle;
                var id = li_ele.attr('ga-megamenu-id');
                var megaMenu_content = $('[ga-megamenu-target="'+id+'"]');

                if( !li_ele.hasClass('active') && target.find('[ga-megamenu-target].active').length > 0 ){
                    target.find('[ga-megamenu-target]').removeClass('active');
                    li_list.removeClass('active');
                }
                
                megaMenu_content.toggleClass('active');
                li_ele.toggleClass('active');
            } // end megamenu_trigger function

            var target = conf.target;
            var li_list = target.children('li');

            li_list.each(function(){
                var liEle = $(this),
                    id = liEle.attr('ga-megamenu-id'),
                    action = liEle.attr('ga-megamenu-action');

                if (typeof action === typeof undefined || action === false) {
                    action = 'hover';
                }

                if (typeof id !== typeof undefined && id !== false) {
                    if(action == 'hover' && $(window).width() > 1024) {
                        liEle.hover(function(){ // in
                            conf['liEle'] = liEle;
                            conf['liList'] = li_list;
                            megamenu_trigger(conf);
                        }, function(){ // out
                            conf['liEle'] = liEle;
                            conf['liList'] = li_list;
                            megamenu_trigger(conf);
                        });
                    }
                    else if(action == 'click' || $(window).width() == 1024) {
                        liEle.find('a[href="#"]').off('click').on('click', function(ev){
                            ev.preventDefault();

                            conf['liEle'] = liEle;
                            conf['liList'] = li_list;
                            megamenu_trigger(conf);
                        });
                    }
                } // end if: need megamenu
            }); // end each: li ele
        },

        tab: function(conf){
            // conf
            // target: jQuery element, div
            // tabId: String, optional, select the specified tab
            // callback: function, optional, {
            //      target: active_div
            // }

            var target = conf.target;

            if( conf.hasOwnProperty('tabId') ){
                tabId = conf.tabId;
            } else {
                tabId = '';
            }

            $(target).find('.ga-tab-title-container[ga-tab-overflow="arrow"]').each(function(){
                var container = $(this);
                var max = container.attr('ga-tab-overflow-max');

                if (typeof max === typeof undefined || max === false) {
                    max = 6;
                }

                if( container.children('li').length > max ){
                    container.prepend('<li class="prev"><a></a></li>');
                    container.append('<li class="next"><a></a></li>');

                    container.children('.prev, .next').on('click', function(){
                        var click_href = '';

                        var li_length = container.children('li').length;
                        var active_ele = container.children('li.active');
                        var active_index = container.children('li').index( active_ele );

                        if( $(this).hasClass('prev') ){
                            var prev_index = ((active_index-1 <= 0)? 1: (active_index-1));
                            click_href = container.children('li').eq( prev_index ).children('a').attr('href');
                        } else {
                            var next_index = ((active_index+1 >= li_length-1)? active_index: (active_index+1));
                            click_href = container.children('li').eq( next_index ).children('a').attr('href');
                        }

                        if(container.find('[ga-tab="collapse"]').length > 0){
                            container.find('[ga-tab="collapse"][href="'+click_href+'"]').first().trigger('click');
                        } else {
                           container.find('[href="'+click_href+'"]').first().trigger('click');
                        }

                        displayElements({
                            target: container
                        });
                    }); // end click: prev, next
                }
            }); // end each: ga-tab-title-container

            function displayElements(config){

                // prev: 0, next: length-1
                var container = config.target;
                var max = container.attr('ga-tab-overflow-max');

                if (typeof max === typeof undefined || max === false) {
                    max = 6;
                }

                var li_length = container.children('li').length;
                var active_index = container.children('li').index( container.children('li.active').first() );
                var min_index = 1, max_index = max;

                if( active_index > max ){
                    min_index = active_index - (max -1);
                    max_index = active_index;
                }

                container.children('li').each(function(i){
                    if( i!=0 && i!=li_length-1 ){
                        if( i < min_index || i > max_index ){
                            $(this).addClass('hidden');
                        } else {
                            $(this).removeClass('hidden');
                        }
                    }
                });
            }; // end displayElements function

            $(target).find('[ga-tab="collapse"]:not([target="_blank"])').each(function(i){
                var href = $(this).attr('href');
                var content_div = $( href );
                if( content_div.prev().hasClass('ga-tab-title-mobile') ){
                    content_div.prev().remove();
                }
                content_div.before('<a href="#" class="ga-tab-title-mobile" ga-tab-href="'+href+'">'+$(this).text()+'</a>');

                $(this).off('click').on('click', function(ev){
                    ev.preventDefault();

                    $('a[ga-tab-href="'+$(this).attr('href')+'"]').addClass('tab-click');

                    $('a[ga-tab-href="'+$(this).attr('href')+'"]').trigger('click');
                });
            });

            $(target).find('.ga-tab-title-mobile:not([target="_blank"])').off('click').on('click', function(ev){
                ev.preventDefault();
                
                var content_container = $(this).parents('.ga-tab-content-container').first();
                var title_container = content_container.parents('.ga-tab-container').first().children('.ga-tab-title-container');
                var href = $(this).attr('ga-tab-href');

                if( !$(this).hasClass('active') || $(this).hasClass('tab-click') ){
                    content_container.children('.ga-tab-content').removeClass('active');
                    content_container.children('.ga-tab-title-mobile').removeClass('active');
                    title_container.children('li').removeClass('active');

                    $(this).removeClass('tab-click');
                }

                var active_div = content_container.children( href ),
                    active_a = title_container.find('li > a[href="'+href+'"]');

                $(this).toggleClass('active');
                active_a.parent().toggleClass('active');
                active_div.toggleClass('active');

                var needCallback = (conf.hasOwnProperty('callback')? true:false);
                var triggerCallback = conf.hasOwnProperty('triggerCallback')? conf.triggerCallback:false;
                if( needCallback ){
                    // create content data
                    if( active_div.children().length == 0 || triggerCallback ){
                        conf.callback({
                            target: active_div
                        });
                    }
                }

                var window_w = $(window).width();
                if( window_w < 1025 ){
                    GardenUtils.plugin.screenMoveToEle({
                        moveToObj: $(target)
                    });
                }
            });

            $(target).find('[ga-tab="tab"]').off('click').on('click', function(ev){
                ev.preventDefault();
                
                var href = $(this).attr('href');
                var content_container = $(href).parents('.ga-tab-content-container').first();
                var title_container = content_container.parents('.ga-tab-container').first().children('.ga-tab-title-container');

                content_container.children('.ga-tab-content').removeClass('active');
                title_container.children('li').removeClass('active');

                $(this).removeClass('tab-click');

                var active_div = content_container.children( href ),
                    active_a = title_container.find('li > a[href="'+href+'"]');

                active_a.parent().toggleClass('active');
                active_div.toggleClass('active');

                var needCallback = conf.hasOwnProperty('callback')? true:false;
                var triggerCallback = conf.hasOwnProperty('triggerCallback')? conf.triggerCallback:false;
                if( needCallback ){
                    // create content data
                    if( active_div.children().length == 0 || triggerCallback ){
                        conf.callback({
                            target: active_div
                        });
                    }
                }

                var window_w = $(window).width();
                if( window_w < 1025 ){
                    GardenUtils.plugin.screenMoveToEle({
                        moveToObj: $(target)
                    });
                }
            });

            var tab_resize_trigger = function(){
                var window_w = $(window).width(),
                    hasActive = false;

                $(target).children('.ga-tab-title-container').each(function(){
                    $(this).find('li > [ga-tab]').parent().each(function(){
                        if( $(this).hasClass('active') ){
                            hasActive = true;
                            return false;
                        }
                    });
                });

                if( window_w > 768 && !hasActive || tabId!='' ){
                    if( tabId != '' ){
                        if($(target).find('[ga-tab="collapse"]').length > 0){
                            $(target).find('[ga-tab="collapse"][href="#'+tabId+'"]').first().trigger('click');
                        } else {
                            $(target).find('[href="#'+tabId+'"]').first().trigger('click');
                        }
                        
                    } else {
                        $(target).find('[ga-tab="collapse"]').first().trigger('click');
                    }
                } else {
                    // fixFooter();
                }

                if(!hasActive && $(target).find('[ga-tab="tab"]').length > 0){
                    $(target).find('[ga-tab="tab"]').first().trigger('click');
                }

                $(target).find('.ga-tab-title-container[ga-tab-overflow="arrow"]').each(function(){
                    displayElements({
                        target: $(this)
                    });
                });
            };

            var tab_resize = function(){
                $(window).resize(function(){
                    tab_resize_trigger();
                });
            };
            tab_resize();
            tab_resize_trigger();
        },

        titleCollapse: function(conf){
            $('[ga-collapse="title"]').off('click').on('click', function(ev){
                ev.preventDefault();

                var id = $(this).attr('href');

                if( !$(this).hasClass('active') ){
                    $('[ga-collapse="title"]').removeClass('active');
                    $('.ga-title-collapse-content').removeClass('active');
                } 
                $(this).toggleClass('active');
                $(id+'.ga-title-collapse-content').toggleClass('active');
            });
        },

        QACollapse: function(conf){

            // html
            // <ul class="ga-qa-item-container" ga-qa="collapse" ga-qa-style="before/after">
            //     <li class="ga-qa-item">
            //         <div class="ga-qa-item-top active">
            //             <a href="#" class="ga-qa-title">標題內容 (Q) </a></div>
            //         <div class="ga-qa-content">詳細內容 (A) </div>
            //     </li></ul>


            // conf
            // target: jQuery element, <ul>
            // callback: function(conf), optional

            var target = conf.target;

            target.find('.ga-qa-title').off('click').on('click', function(ev){
                ev.preventDefault();

                var qaId = $(this).attr('href'),
                    active_ele = $(this).parents('.ga-qa-item-top').first();

                if( !active_ele.hasClass('active') ){
                    target.find('.ga-qa-item-top').removeClass('active');

                    if(conf.hasOwnProperty('callback')){
                        conf.callback(conf);
                    }
                }
                
                active_ele.toggleClass('active');
            });
        },

        scrollTop: function(conf){

            // conf
            // target: jQuery element, footer scrolltop btn.
            // footerEle: jQuery element, footer.
            // headerHeight: Number, height of header.

            var default_h = 20;

            var target = conf.target;
            var footer_ele = conf.footerEle;
            var header_height = conf.hasOwnProperty('headerHeight')? conf.headerHeight:0;

            $(window).scroll(function(){

                $('body').trigger('click');

                var btn_offset = target.offset(),
                    footer_offset = footer_ele.offset();

                if(btn_offset.top + target.height() >= footer_offset.top){
                     target.css({
                        position: 'absolute'
                    });
                    target.addClass('fix-at-footer');
                }

                if($(this).scrollTop() + window.innerHeight < footer_offset.top){
                    target.css({
                        position: 'fixed'
                    });
                    target.removeClass('fix-at-footer');
                }

                if ($(this).scrollTop() > header_height) {
                    target.fadeIn();
                } else {
                    target.fadeOut();
                }
            });

            target.off('click').on('click', function(){
                $('html, body').animate({scrollTop : 0},800);
                return false;
            });
        },

        overflowTableScroll: function(){
            $('.table-overflow-scroll').each(function(){
                var parent_ele = $(this).parent();
                var parent_w = parent_ele.width(),
                    self_width = $(this).width();

                // console.debug('self_width = ' + self_width, $(this));
                // console.debug('parent_w = ' + parent_w);

                if((browser.isIe() && self_width > parent_w && parent_w != 0) || 
                    (!browser.isIe() && self_width > parent_w)){
                    if( !parent_ele.hasClass('table_mobile_div') ){
                        var table_div = $('<div class="table_mobile_div"></div>').append($(this).clone()).insertBefore( $(this) );
                        $(this).remove();
                        table_div.css({
                            'overflow-x': 'scroll'
                        });
                    } else {
                        parent_ele.css({
                            'overflow-x': 'scroll'
                        });
                    }
                } else {
                    if(self_width <= parent_w){
                        parent_ele.css({
                            'overflow-x': 'hidden'
                        });
                    }
                }
            }); // end each: table-overflow-scroll

            $(window).resize(function(){
                GardenUtils.display.overflowTableScroll();
            });
        },

        fontSize: function(conf) {
            ///////////////////////////////////
            // var conf = {
            //     target: '',      // Dom Object，目標空間(必填)
            //     fontSize : {},
            //     size : {},
            //     language:'TW | EN'
            // };
            ///////////////////////////////////
            
            conf = $.extend(true, {
                language: 'TW',
                fontSize: {
                    sm: '16',
                    md: '18',
                    lg: '22'
                },
                size: {
                    sm: 'ga-font-text-sm',
                    md: 'ga-font-text-md',
                    lg: 'ga-font-text-lg'
                }
            }, conf);
            
            var target = conf.target;
            var language = conf.language;
            var fontSize = conf.fontSize;
            var size = conf.size;
            
            var sWord = '小';
            var mWord = '中';
            var lWord = '大';
            
            if(language == 'EN') {
                sWord = 'S';
                mWord = 'M';
                lWord = 'L';
            }
            
            if(target != undefined) {

                $('.ga-font-size-container').each(function(){
                    var font_btn = $(this);

                    font_btn.find('button.ga-font-lg, button.ga-font-md, button.ga-font-sm').click(function(ev){
                        ev.preventDefault();

                        font_btn.find('button').removeClass('active');
                        $(this).addClass('active');

                        // var font_size = $(this).hasClass('ga-font-lg')? fontSize.lg:($(this).hasClass('ga-font-md')? fontSize.md:fontSize.sm);
                        // _fontSize(target, font_size,'30');

                        var font_class = $(this).hasClass('ga-font-lg')? size.lg:($(this).hasClass('ga-font-md')? size.md:size.sm);
                        var fontSize_ele = target.find('th,td,span,p,h4,h5,h6,span,ul li,ol li,ul li div,ul ul li div,ol li div,ol ol li div,a');
                        fontSize_ele.each(function(){

                            var attr = $(this).attr( 'ga-font-text-class' );
                            if(typeof attr !== typeof undefined && attr !== false){
                                $(this).removeClass( attr );
                            }

                            $(this).attr( 'ga-font-text-class', font_class );
                            $(this).addClass( font_class );
                        });
                    });

                    font_btn.find('button.active').trigger('click');
                });
            }
            
            function _fontSize(space,size,lineHeight) {

                var fontSize_ele = space.find('th,td,span,p,h4,h5,h6,span,ul li,ol li,ul li div,ul ul li div,ol li div,ol ol li div,a');
                fontSize_ele.each(function(){
                    var styleText = $(this).attr('style');
                    var cssText = (typeof styleText !== typeof undefined && styleText !== false)?styleText:'';

                    var attr = $(this).attr('name');

                    $(this).css('cssText', cssText+'font-size: '+size + 'px!important;'
                        +'line-height:'+ lineHeight + 'px;'
                        +'text-align: inherit;');
                });
            } // end _fontSize function
        }, // end fontSize function

        blockEqualHeight: function(conf){
            conf = $.extend({
                displaySingleWindowWidth: 768
            }, conf);

            var displaySingleWindowWidth = conf.displaySingleWindowWidth;

            $('.ga-height-eq-parent').each(function(){
                var maxHeight = 0;
                var parent_ele = $(this);

                parent_ele.find('.ga-height-eq-child').each(function(){
                    var hasPadding = $(this).innerHeight() - $(this).height() > 0? true:false;
                    var this_height = (!hasPadding? $(this).height('auto').height():$(this).outerHeight() );
                    if( this_height > maxHeight ) maxHeight = this_height;
                });

                var window_w = $(window).width();
                if(window_w > displaySingleWindowWidth) parent_ele.find('.ga-height-eq-child').css( 'min-height', maxHeight );
                else parent_ele.find('.ga-height-eq-child').css( 'min-height', 0 );
            });

            $(window).resize(function(){
                GardenUtils.display.blockEqualHeight({
                    displaySingleWindowWidth: displaySingleWindowWidth
                });
            });
        }, // end blockEqualHeight function

        helper: function(conf) {

            //          conf: {
            //              target: jqueryObj
            //              options:{
            //                      type:  String 'left' or 'right'
            //                      bottom: String  css bottom property, EX: '10px' or '5%' 
            //           }
            //

            var $target = conf.target,
                options = $.extend({
                    type:'right',
                    bottom:'100px',
                },conf.options);

            // set variable
            var type = options.type;
            var pos_bottom= options.bottom;
            var totalWidth = 0;

            if( $target.find('.ga-hidden').length > 0 ){
                var hidWidth = $target.find('.ga-hidden').width();
                var Padding_right = parseInt($target.find('.ga-hidden').css('padding-right'));
                var Padding_left = parseInt($target.find('.ga-hidden').css('padding-left'));
                totalWidth = (hidWidth + Padding_left + Padding_right);
            }
            

            var animateCloseObj = type == 'right' ? {
                right: totalWidth * -1
            } : {
                left: totalWidth * -1
            };

            var animateShowObj = type == 'right' ? {
                right: 0
            } : {
                left: 0
            };

            // set position
            $target.css(type, '-' + totalWidth + 'px');
            $target.css('bottom',pos_bottom);

            // set border radius
            if(type=='right'){
                $target.addClass('ga-right-helper');
            }
            else if(type=='left'){
                $target.addClass('ga-left-helper');
            }

            $target.find('.ga-hidden *').on('click', function(ev){
                ev.stopPropagation();
            });

            if( $target.find('.ga-hidden').length > 0 ){
                // set click event
                $('body').on('click', function() {
                    if (parseInt($target.css(type)) >= 0) {
                        $target.animate(animateCloseObj);
                        $target.removeClass('active');
                    }
                });


                $target.on('click', function(e) {
                    e.preventDefault();
                    if (parseInt($(this).css(type)) < 0) {
                        $(this).animate(animateShowObj);
                        $target.addClass('active');
                    } else {
                        $(this).animate(animateCloseObj);
                        $target.removeClass('active');
                    }
                });
            } // end if: bind click, if has hidden content
        }, // end helper function

        autoClose: function(conf){
            ///////////////////////////////////
            // var conf = {
            //     target: $(),         // jQuery Object，目標空間(必填)
            //     retentionTime : 3000 // number，ms, 暫留時間
            // };
            ///////////////////////////////////

            conf = $.extend({
                retentionTime: 3000
            }, conf);

            var target = conf.target;
            var retentionTime = conf.retentionTime;

            setTimeout(function(){
                // target.fadeOut();
                target.addClass('fadeOut');
            }, retentionTime);
        }, // end autoClose function

        convertOpacityToHex: function(color_conf){

            var opacity = color_conf.opacity,
                hexStr = ''+color_conf.color;

            function _rgba2rgb(RGB_background, RGBA_color){
                var alpha = RGBA_color.a;

                return {
                    r: (1 - alpha) * RGB_background.r + alpha * RGBA_color.r,
                    g: (1 - alpha) * RGB_background.g + alpha * RGBA_color.g,
                    b: (1 - alpha) * RGB_background.b + alpha * RGBA_color.b
                };
            }; // end _rgba2rgb function

            if( hexStr.indexOf('#') == -1 || hexStr.length != 7 ){
                alert('色碼格式錯誤！範例：#ffffff');
                return '';
            }

            var color_r = parseInt(hexStr.substr(1,2), 16),
                color_g = parseInt(hexStr.substr(3,2), 16),
                color_b = parseInt(hexStr.substr(5,2), 16);

            var newColor = _rgba2rgb({
                r: 255,
                g: 255,
                b: 255,
                a: 1
            }, {
                r: color_r,
                g: color_g,
                b: color_b,
                a: opacity
            });

            return '#'+parseInt(newColor.r).toString(16)+''+parseInt(newColor.g).toString(16)+''+parseInt(newColor.b).toString(16);

        }, // end convertOpacityToHex function

        countdown: function(conf){
            // var conf = {
            //     target: ,
            //     minutes: 4,
            //     seconds: 59,
            //     callback: function(){},
            // };

            var target = conf.target;
            var countdownnumber = conf.seconds;
            var countdownnumber_min = conf.minutes;
            //var ga_countdown_id;
            clearTimeout(ga_countdown_id);

            function _isNormalInteger(str) {
                return /^\+?(0|[1-9]\d*)$/.test(str);
            };

            if( !_isNormalInteger(countdownnumber) || !_isNormalInteger(countdownnumber_min) ){
                alert('分鐘或秒數值不為正整數！');
            } else {
                _acorssDay();
                _countdownfunc();

                function tmp_padLeft(conf) {
                    var str = conf.str.toString();
                    if (str.length >= conf.len)
                        return str;
                    else
                        return tmp_padLeft({ str: '0' + str, len: conf.len });
                }; // end padLeft function


                function _countdownfunc() {
                    var tmp_time = tmp_padLeft({ str: countdownnumber_min, len: 2 }) + ':' + tmp_padLeft({ str: countdownnumber, len: 2 });
                    target.html(tmp_time);

                    if (countdownnumber == 0 && countdownnumber_min == 0) {
                        // $("#" + conf.modal_id).modal('show');

                        // $('#' + conf.modal_id + ' a.submitBtn').on('click', function() {
                        //     $("#" + conf.modal_id).modal('hide');
                        //     // alert('haha');
                        //     location.reload();
                        // });

                        clearTimeout(ga_countdown_id);

                        if( conf.hasOwnProperty('callback') ){
                            conf.callback();
                        }

                    } else if (countdownnumber == -1) {

                        countdownnumber_min--;
                        countdownnumber = 59;
                        ga_countdown_id = setTimeout(_countdownfunc, 10);
                    } else {
                        countdownnumber--;
                        ga_countdown_id = setTimeout(_countdownfunc, 1000);
                    }
                }; // end _countdownfunc function

                function _acorssDay() {
                    var d_all = new Date();
                    var d = new Date(d_all.getFullYear(), d_all.getMonth(), d_all.getDate(), d_all.getHours(), d_all.getMinutes() + 5, d_all.getSeconds());

                    var tmp_time = tmp_padLeft({ str: d.getMinutes(), len: 2 }) + ':' + tmp_padLeft({ str: d.getSeconds(), len: 2 });

                    // setTimeout(function() {
                    //     target.html(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + tmp_time);
                    // }, 500);
                }; // end _acorssDay function
            } // end else: is normal int
        }, // end countdown function

        checkboxSelectAll: function(conf){
            
            var targetInputName = conf.target;

            $('[name="'+targetInputName+'"]').on('change', function(){
                var name = $(this).attr('name');
                var isChecked = $(this).prop('checked');

                if( $(this).hasClass('ga-checkbox-all') ){
                    $('[name="'+name+'"]').prop('checked', isChecked);
                } else {
                    var checkedLength = $('[name="'+name+'"]:checked:not(.ga-checkbox-all)').length;
                    var allLength = $('[name="'+name+'"]:not(.ga-checkbox-all)').length;

                    if( checkedLength == allLength ){
                        $('[name="'+name+'"].ga-checkbox-all').prop('checked', true);
                    } else {
                        $('[name="'+name+'"].ga-checkbox-all').prop('checked', false);
                    }
                }
            });
        } // end checkboxSelectAll function
    },
    ajax: {
        loading : function(config) {
        
            config = $.extend({
                async: false,
                datatype : 'json',
                data : ''
            }, config);
        
            //顯示Ajax轉轉圖，另外讓主頁面hide  
            $('#ga-starting').show();
            
            setTimeout(function() {
                $.ajax({
                    url: config.url,
                    data: config.data,
                    datatype: config.dataType,
                    async: config.async,
                    type: 'post',               
                    success:function(json) {
                        //resp = json;
                        config.callback(json);
                        
                        $('#ga-starting').hide();
                    },
                    error : function(){
                        $('#ga-starting').hide();
                    }
                });
            },300);
        },uploadFile: function(form, ajaxUrl, callbackFn) {
            var resp, data;

            //is Support AjaxUpload Function
            function isAjaxUploadSupported() {
                var input = document.createElement('input');
                input.type = 'file';

                return (
                    'multiple' in input &&
                    typeof File != 'undefined' &&
                    typeof FormData != 'undefined' &&
                    typeof(new XMLHttpRequest()).upload != 'undefined');
            }

            function getIframeContentJSON(iframe) {
                //IE may throw an "access is denied" error when attempting to access contentDocument on the iframe in some cases
                try {
                    var doc = iframe.contentWindow.document,
                        response;

                    var innerHTML = doc.body.innerHTML;
                    //plain text response may be wrapped in <pre> tag
                    if (innerHTML.slice(0, 5).toLowerCase() == "<pre>" && innerHTML.slice(-6).toLowerCase() == "</pre>") {
                        innerHTML = doc.body.firstChild.firstChild.nodeValue;
                    }

                    response = innerHTML;
                } catch (err) {
                    alert('IE getIframeContentJSON Error:' + err);
                    response = {
                        isSuccess: 'N'
                    };
                }

                return response;
            }

            if (!isAjaxUploadSupported()) {

                if (!isAjaxUploadSupported()) {
                    // Add event...
                    var response;

                    function eventHandlermyFile() {
                        response = getIframeContentJSON(iframeIdmyFile);

                        if (response != undefined && response != 'undefined') {
                            callbackFn.apply(this, [response]);
                        }
                    }

                    if ($('body iframe#upload_iframe_myFile').length != 0) {
                        $('body iframe#upload_iframe_myFile').remove();
                    }
                    var iframe = $('<iframe name="upload_iframe_myFile" id="upload_iframe_myFile">').prependTo($('body'));
                    iframe.attr('width', '0');
                    iframe.attr('height', '0');
                    iframe.attr('border', '0');
                    iframe.attr('src', 'javascript:false;');
                    iframe.hide();

                    iframe.on('load', function() {
                        eventHandlermyFile();
                    });

                    var iframeIdmyFile = document.getElementById("upload_iframe_myFile");

                    // create form
                    if ($('body form#upload_form').length != 0) {
                        $('body form#upload_form').remove();
                    }

                    form.append('<button type="submit" class="hidden"></button>');
                    form.attr('action', ajaxUrl);
                    form.attr('target', 'upload_iframe_myFile');
                    form.attr('enctype', 'multipart/form-data');
                    form.attr('encoding', 'multipart/form-data');
                    form.attr('method', 'post');
                    form.addClass('hidden');

                    form.submit();
                }

            } // end if: ie
            else {
                data = new FormData(form[0]);

                $.ajax({
                    async: false,
                    url: ajaxUrl,
                    data: data,
                    processData: false,
                    cache: false,
                    contentType: false,
                    type: 'POST',
                    success: function(data) {
                        //alert('success');
                        console.log('after post data = ', JSON.stringify(data));

                        callbackFn.apply(this, [data]);
                    },
                    error: function() {
                        alert('error');
                        callbackFn.apply(this, [$.parseJSON('{ "isSuccess": "N" }')]);
                    }
                });
            } // end else: not ie
        }

    }
};


var browser = {
    isIe: function () {
        return navigator.appVersion.indexOf("MSIE") != -1;
    },
    navigator: navigator.appVersion,
    getVersion: function() {
        var version = 999; // we assume a sane browser
        if (navigator.appVersion.indexOf("MSIE") != -1)
            // bah, IE again, lets downgrade version number
            version = parseFloat(navigator.appVersion.split("MSIE")[1]);
        return version;
    }
};

// Youtube Embedded
var embeddedYoutube_conf = {};
function onYouTubePlayerAPIReady() {
    $('.ga-youtube-embedded').each(function(){
        var target = $(this);
        //var target_id = target.attr('id');
        var height = target.attr('ga-youtube-height');
        var video_id = target.attr('ga-youtube-video');

        if (typeof height === typeof undefined || height === false) {
            height = 315;
        }

        var d = new Date();
        var n = d.getTime();
        target.attr('id', n);
        var target_id = target.attr('id');

        var player = new YT.Player(target_id, {
            height: height,
            width: '100%',
            videoId: video_id,//'kfvxmEuC7bU',
            events: {
                'onStateChange': function (event) {
                    switch (event.data) {
                        // case -1:
                        //     console.log ('unstarted');
                        //     break;
                        case 0:
                            console.log ('ended', target_id, embeddedYoutube_conf);
                            if(embeddedYoutube_conf.hasOwnProperty(target_id)
                                && embeddedYoutube_conf[target_id].hasOwnProperty('ended')){
                                embeddedYoutube_conf[target_id].ended();
                            }
                            break;
                        case 1:
                            console.log ('playing', target_id, embeddedYoutube_conf);
                            if(embeddedYoutube_conf.hasOwnProperty(target_id)
                                && embeddedYoutube_conf[target_id].hasOwnProperty('playing')){
                                embeddedYoutube_conf[target_id].playing();
                            }
                            break;
                        case 2:
                            console.log ('paused', target_id, embeddedYoutube_conf);
                            if(embeddedYoutube_conf.hasOwnProperty(target_id)
                                && embeddedYoutube_conf[target_id].hasOwnProperty('paused')){
                                embeddedYoutube_conf[target_id].paused();
                            }
                            break;
                        // case 3:
                        //     console.log ('buffering');
                        //     break;
                        // case 5:
                        //     console.log ('video cued');
                        //     break;
                    }
                }
            }
        });
    }); // end each: ga-youtube-embeded
} // end onYouTubePlayerAPIReady function
$(window).trigger('resize');

var ga_chart_conf = {};
var ga_countdown_id;