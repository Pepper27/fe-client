/*Timelines Flashsale*/
var timelines = {
	flashsale_tab1: [
		{
			show: true,
			startHour: window.settings.flashsale.tab1.startHour,
			startMinute: window.settings.flashsale.tab1.startMinute, 
			endHour: window.settings.flashsale.tab1.endHour, 
			endMinute: window.settings.flashsale.tab1.endMinute
		}
	],
	flashsale_tab2: [
		{
			show: window.settings.flashsale.tab2.show,
			startHour: window.settings.flashsale.tab2.startHour,
			startMinute: window.settings.flashsale.tab2.startMinute, 
			endHour: window.settings.flashsale.tab2.endHour, 
			endMinute: window.settings.flashsale.tab2.endMinute
		}
	],
	flashsale_tab3: [
		{
			show: window.settings.flashsale.tab3.show,
			startHour: window.settings.flashsale.tab3.startHour,
			startMinute: window.settings.flashsale.tab3.startMinute, 
			endHour: window.settings.flashsale.tab3.endHour, 
			endMinute: window.settings.flashsale.tab3.endMinute
		}
	],
	flashsale_tab4: [
		{
			show: window.settings.flashsale.tab4.show,
			startHour: window.settings.flashsale.tab4.startHour,
			startMinute: window.settings.flashsale.tab4.startMinute, 
			endHour: window.settings.flashsale.tab4.endHour, 
			endMinute: window.settings.flashsale.tab4.endMinute
		}
	],
	flashsale_tab5: [
		{
			show: window.settings.flashsale.tab5.show,
			startHour: window.settings.flashsale.tab5.startHour,
			startMinute: window.settings.flashsale.tab5.startMinute, 
			endHour: window.settings.flashsale.tab5.endHour, 
			endMinute: window.settings.flashsale.tab5.endMinute
		}
	]
};
var isFirstSaleValid = true;
var timeLine_avai = 0;
window.autoApplyCoupon = parseInt("1");

PDR.Index = {
	init: function(){
		var that = this;
		if($('#slider-custom-banner .swiper-slide').length > 1){
			$('#slider-custom-banner .swiper-button-next').removeClass('d-none');
			$('#slider-custom-banner .swiper-button-prev').removeClass('d-none');
			$('#slider-custom-banner .swiper-pagination').removeClass('d-none');
			that.sliderBannerCustom();
		}
		that.sliderBanner();
		that.sliderCollection();
		that.sliderModule();
		if (window.settings.flashsale.show) {
			that.flashsale();
		}
		setTimeout(function(){
      PDR.Helper.viewedProduct();
    },3000);
		AOS.init();
	},
	sliderBannerCustom: function(){
		var swiper = new Swiper("#slider-custom-banner", {
			loop: true,
			slidesPerView: 1,
			spaceBetween: 1,
			autoplay: {
				delay: 3000,
			},
			navigation: {
				nextEl: "#slider-custom-banner .swiper-button-next",
				prevEl: "#slider-custom-banner .swiper-button-prev",
			},
			pagination: {
				el: '#slider-custom-banner .swiper-pagination',
				type: 'bullets',
				clickable: true
			},
		});
	},
	sliderBanner: function(){
		var swiper = new Swiper("#slider-banners-home", {
			loop: true,
			slidesPerView: 1,
			spaceBetween: 1,
			autoplay: {
				delay: 3000,
			},
			navigation: {
				nextEl: "#slider-banners-home .swiper-button-next",
				prevEl: "#slider-banners-home .swiper-button-prev",
			},
			pagination: {
				el: '#slider-banners-home .swiper-pagination',
				type: 'bullets',
				clickable: true
			},
		});
	},
	sliderModule: function(){
		if($(window).width() > 767){
			new Swiper('#slider-policy .swiper', {
				loop: true,
				slidesPerView: 1.6,
				spaceBetween: 10,
				breakpoints: {
					767: {
						slidesPerView: 2,
					},
					1460: {
						slidesPerView: 3,
					}
				},
				pagination: {
					el: '#slider-policy .swiper-pagination',
					type: 'bullets',
					clickable: true
				}
			});
		}
	},
	sliderCollection: function(){ 
		var id1 = $('#slider-collection-1').attr('data-id');
		var titleColl1 = $('#slider-collection-1').attr('data-title');
		var urlColl1   = $('#slider-collection-1').attr('data-handle');
		
		var id2 = $('#slider-collection-2').attr('data-id');
		var titleColl2 = $('#slider-collection-2').attr('data-title');
		var urlColl2   = $('#slider-collection-2').attr('data-handle');
		
		if($(window).width() > 767){
      if($('#slider-collection-1').length > 0){
  			PDR.Global.getItemSlide(id1,titleColl1,urlColl1,1,8,'#slider-collection-1',function(){
  				var swiper1 = new Swiper("#slider-collection-1 .swiper", {
  					loop: true,
  					slidesPerView: 4,
  					breakpoints: {
  						735: {
  							slidesPerView: 4,
  						},
  						1024: {
  							slidesPerView: 4,
  						},
  						1460: {
  							slidesPerView: 4,
  						}
  					},
  					pagination: {
  						el: '#slider-collection-1 .swiper-pagination',
  						type: 'bullets',
  						clickable: true
  					},
  					navigation: {
  						nextEl: '#slider-collection-1 .swiper-button-next',
  						prevEl: '#slider-collection-1 .swiper-button-prev',
  					}
  				});
  			});
      }

      if($('#slider-collection-2').length > 0){
  			PDR.Global.getItemSlide(id2,titleColl2,urlColl2,1,8,'#slider-collection-2',function(){
  				var swiper2 = new Swiper("#slider-collection-2 .swiper", {
  					loop: true,
  					slidesPerView: 4,
  					breakpoints: {
  						735: {
  							slidesPerView: 4,
  						},
  						1024: {
  							slidesPerView: 4,
  						},
  						1460: {
  							slidesPerView: 4,
  						}
  					},
  					pagination: {
  						el: '#slider-collection-2 .swiper-pagination',
  						type: 'bullets',
  						clickable: true
  					},
  					navigation: {
  						nextEl: '#slider-collection-2 .swiper-button-next',
  						prevEl: '#slider-collection-2 .swiper-button-prev',
  					}
  				});
  			});
      }
		}
		else {
      if($('#slider-collection-1').length > 0){
  			PDR.Global.getItemSlide(id1,titleColl1,urlColl1,1,8,'#slider-collection-1');
      }
      if($('#slider-collection-2').length > 0){
  			PDR.Global.getItemSlide(id2,titleColl2,urlColl2,1,8,'#slider-collection-2');
      }
		}
	},
	flashsale: function(){
		//var limitProd = 12;
		//const use_hideprice = true; // settings
		
		function slideAjax(ind){
			if( $('#flashsale_tab'+ind+' .list-products').length > 0 ){
				if($(window).width() > 767){
					new Swiper('#flashsale_tab'+ind+' .swiper:not(.swiper-initialized)', {
						loop: false,
						slidesPerView: 4,
						breakpoints: {
							735: {
								slidesPerView: 4,
							},
							1024: {
								slidesPerView: 4,
							},
							1460: {
								slidesPerView: 4,
							}
						},
						pagination: {
							el: '#flashsale_tab'+ind+' .swiper-pagination',
							type: 'bullets',
							clickable: true
						},
						navigation: {
							nextEl: '#flashsale_tab'+ind+' .swiper-button-next',
							prevEl: '#flashsale_tab'+ind+' .swiper-button-prev',
						}
					});
				}
			}
		}
		slideAjax(1);
	
		$(document).on('click','.s-tabs .tab-nav li a',function(){
			//debugger;
			var target = $(this).parent().attr('data-tab');
			$('.tab-countdown,.s-tabs .tab-nav li').removeClass('active');
			$(this).parent().addClass('active');
			$('.tab-countdown[data-tab="'+target+'"]').addClass('active');
		});
		
		if (window.settings.flashsale.usecountdown) {
			var startDay = window.settings.flashsale.startday, endDay = window.settings.flashsale.endday;
			var now = new Date();

			if(now.getDate() >= startDay && now.getDate() <= endDay){
				$.each(timelines,function(tab_fs,val_fs){
					if(val_fs[0].show){
						timelines[tab_fs][0].year = now.getFullYear();
						timelines[tab_fs][0].month = now.getMonth();
						timelines[tab_fs][0].day = now.getDate();
						timeLine_avai++;
					}
				});

				/*
				timelines.flashsale_tab1[0].year = timelines.flashsale_tab2[0].year = timelines.flashsale_tab3[0].year = timelines.flashsale_tab4[0].year = timelines.flashsale_tab5[0].year = now.getFullYear();
				timelines.flashsale_tab1[0].month = timelines.flashsale_tab2[0].month = timelines.flashsale_tab3[0].month = timelines.flashsale_tab4[0].month = timelines.flashsale_tab5[0].month = now.getMonth() + 1;
				timelines.flashsale_tab1[0].day = timelines.flashsale_tab2[0].day = timelines.flashsale_tab3[0].day = timelines.flashsale_tab4[0].day = timelines.flashsale_tab5[0].day = now.getDate();
				*/

				// Initialize countdowns for all tabs
				var index_timelines = 0;
				for (const tabId in timelines) {
					//updateCountdown(tabId,index_timelines);
					newCountdown(tabId,index_timelines);
					index_timelines++;
				}
				/*
				var count_el_current = $('.tab-nav li.current-time').length;
				var count_el = $('.tab-nav li').length;
				if (count_el_current > 0){
					$('#home-flashsale-3 .tab-nav li.current-time:eq(0) a').click();
				}
				else {
					$('#home-flashsale-3 .tab-countdown:eq(0)').addClass('active');		
					$('#home-flashsale-3 .tab-nav li:eq(0) a').click();	
				} 
				*/
			}
			else{
				$('.s-tabs').addClass('d-none');
				$('.countdown-heading').removeClass('active');
			}

			function newCountdown(tabId,indTab) {
				var x = setInterval(function() {
					var now = new Date().getTime();
					const timeline = timelines[tabId];
					const eventStart = new Date(timeline[0].year, timeline[0].month, settings.flashsale.startday/*timeline[0].day*/, timeline[0].startHour, timeline[0].startMinute);
					const eventEnd = new Date(timeline[0].year, timeline[0].month, settings.flashsale.endday/*timeline[0].day*/, timeline[0].endHour, timeline[0].endMinute);

					var status = 'prepare';
					var countDownDate = eventStart.getTime();
					if (eventStart <= now && eventEnd > now) {
						status = 'on-air';
						countDownDate = eventEnd.getTime();
					} 
					else if (now >= eventEnd) {
						status = 'expired';
					} 

					if(status == 'prepare' || status == 'on-air'){
						var distance = countDownDate - now;

						var days = Math.floor(distance / (1000 * 60 * 60 * 24));
						var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
						var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
						var seconds = Math.floor((distance % (1000 * 60)) / 1000);
						var time_show = `<div class="box"><span class="number">${days}</span><span class="text">Ngày</span></div><div class="box"><span class="number">${hours}</span><span class="text">Giờ</span></div><div class="box"><span class="number">${minutes}</span><span class="text">Phút</span></div><div class="box"><span class="number">${seconds}</span><span class="text">Giây</span></div>`;

						if(status == 'prepare'){
							$('.s-tabs .tab-nav li[data-tab="'+tabId+'"] .subtitle').html(window.settings.flashsale.status2);
							$('.countdown-heading[data-tab="'+tabId+'"] .countdown-title label').html(window.settings.flashsale.title1);
							$('.countdown-heading[data-tab="'+tabId+'"] .countdown-prev').html('');
							$('.countdown-heading[data-tab="'+tabId+'"] .countdown-prev').html(time_show).removeClass('d-none');
						}
						else{
							$('.s-tabs .tab-nav li[data-tab="'+tabId+'"] .subtitle').html(window.settings.flashsale.status1);
							$('.countdown-heading[data-tab="'+tabId+'"] .countdown-title label').html(window.settings.flashsale.title2);
							$('.countdown-heading[data-tab="'+tabId+'"] .countdown-prev').html('').addClass('d-none');
							$('.countdown-heading[data-tab="'+tabId+'"] .countdown-in').html('');
							$('.countdown-heading[data-tab="'+tabId+'"] .countdown-in').html(time_show).removeClass('d-none');
						}

						if(isFirstSaleValid){
							$('.s-tabs .tab-nav li[data-tab="'+tabId+'"] a').click();
							isFirstSaleValid = false;
						}

						if (distance < 0) {
							clearInterval(x);
							if(status == 'prepare') newCountdown(tabId,indTab);
							if(status == 'on-air') {
								$('.countdown-heading[data-tab="'+tabId+'"] .countdown-prev').html('').addClass('d-none');
								$('.countdown-heading[data-tab="'+tabId+'"] .countdown-in').html('').addClass('d-none');
								if(indTab < Object.keys(timelines).length - 1){
									$('.countdown-heading[data-tab="'+tabId+'"] .countdown-next').html('No upcoming events').addClass('d-none');
									$('.s-tabs .tab-nav li[data-tab="'+tabId+'"] + li a').click();
								}
								else{
									$('.s-tabs').addClass('d-none');
								}
							}
						}
					}
					else{
						clearInterval(x);
						if(!isFirstSaleValid) isFirstSaleValid = true;
						$('.s-tabs .tab-nav li[data-tab="'+tabId+'"] .subtitle').html(window.settings.flashsale.status3);
						$('.countdown-heading[data-tab="'+tabId+'"] .countdown-prev').html('').addClass('d-none');
						$('.countdown-heading[data-tab="'+tabId+'"] .countdown-in').html('').addClass('d-none');
						$('.countdown-heading[data-tab="'+tabId+'"] .countdown-next').html('No upcoming events').addClass('d-none');
						if(indTab < timeLine_avai - 1){
							if(isFirstSaleValid){
								$('.countdown-heading[data-tab="'+tabId+'"] .countdown-next').html('No upcoming events').addClass('d-none');
								$('.s-tabs .tab-nav li[data-tab="'+tabId+'"] + li a').click();
							}
						}
						else{
							$('.s-tabs').addClass('d-none');
							$('.countdown-heading').removeClass('active');
						}
					}
				}, 1000);
			}
			
		}
		else {
			$('.s-tabs .tab-nav li[data-tab="flashsale_tab1"] a').click();
		}
		
		$('#home-flashsale-3 .tab-nav li a').on('shown.bs.tab', function(e){
			var idColl = $('#home-flashsale-3 .tab-nav li.active').attr('data-id');
			var titleColl = $('#home-flashsale-3 .tab-nav li.active').attr('data-id');
			
			var target = $('#home-flashsale-3 .tab-nav li.active').attr('data-tab');
			var handle = $('#home-flashsale-3 .tab-nav li a.active').attr("data-handle");
			var v = $('#tabs-ajax #'+target+' .list-products .product-loop:not(.product-loading)').length;
			var indexTab = $('#home-flashsale-3 .tab-nav li a.active').parent().index();
			$('#home-flashsale-3 .tab-content').removeClass('active show');
			$('#home-flashsale-3 .tab-content#'+target).addClass('active show');
			if(v == 0){	
				if(handle == ''){
					$.ajax({
						url: '/collections/all?view=home-product-data-no',
						success:function(data){
							setTimeout(function(){
								$('#tabs-ajax .tab-content.show .list-products').html('');
								$('#tabs-ajax .tab-content.show .list-products').append(data);
							},350)
						}
					});
				}
				else{
					PDR.Global.getItemSlide(idColl,titleColl,handle,1,12,'#tabs-ajax .tab-content.show#'+target);
					setTimeout(function(){
						slideAjax(indexTab+1);
					},300);
					PDR.Wishlist.renderFavorites();
					
					/*
					$.ajax({
						url: handle+'?view=home-product-data',
						async: true,
						success:function(data){
							data = data.replace(/hfs_3_loop/g,'hfs_3_'+(indexTab+1)+'_loop_');
							$('#tabs-ajax .tab-content.show .list-products').html('');
							$('#tabs-ajax .tab-content.show .list-products').append(data);
							
							setTimeout(function(){
								slideAjax(indexTab+1);
							},300);
							
							PDR.Wishlist.renderFavorites();
						}
					});
					*/
				}
			}
		});
	},
}
PDR.Product = {
	check_recommend: false,
	current_variant: null,	
	init: function(){
		var that = this;
		
		that.renderProductDetail.init();
		that.fancyboxGallery();
		that.multiStore();
		that.setViewedProduct();
		that.similarStyles();
		that.sliderCollection();
		that.productAction();
		that.atcProduct();
		that.sliderMessage();
		that.giftPacking();

		PDR.Helper.accordion();
		PDR.Rating.init();
		PDR.Helper.viewedProduct();
	},
	renderProductDetail: {
		init: function(){
			var that = this;
			if(data_meta != ''){
				that.renderMetal();
			}
			else {
				$('.swatch.swatch-metal').addClass('d-none');
			}
			
			if(data_main.options.join(',').indexOf('Kích ') > -1 ){
				var vitri_size = -1; 
				data_main.options.map((option,index) => {if (option.indexOf('Kích ') > -1) vitri_size = index });
				that.renderSize(vitri_size);
			}
			else{
				$('.swatch.swatch-size').addClass('d-none');
			}

			if (PDR.Product.current_variant == null){
				PDR.Product.current_variant = data_main.variants[0];
			}
			that.renderInfo(PDR.Product.current_variant);
			that.changeSize();
			that.changeMetal();
			that.renderImage();
			that.changeSizeSelect();

			if(accountJS.id != ''){
				PDR.Wishlist.getWishlistProduct(data_main.id,function(data_wishlist){
					console.log(data_wishlist);
				});
			}
		},
		renderMetal: function(){
			data_meta = JSON.parse(data_meta);
			var items = '';
			var metalCurrent = '';
			var first_metal = true;
			$.each(data_meta,function(metal,icons){
				if(icons.icon != null){
					var pid = product_data.filter(prd => prd.handle == icons.handle);
					pid = pid.length > 0? pid[0].id : '';
					var textDefault = ['bạc','mạ vàng 14k','mạ vàng hồng 14k','vàng','rose','gold','silver'];
					if(pid != '') metalCurrent = metal;
					items += `<div class="swatch-element ${pid != ''?'sd':''}" data-url="/products/${icons.handle}" data-pid="${pid}" data-option1="${metal}">
											<label class="${(textDefault.includes(metal.toLowerCase())) ? 'default' : ''}" style="background-image:url(${icons.icon != null ? icons.icon : '//theme.hstatic.net/1000409940/1000612443/14/blog_no_img.jpg'})"><img class="d-none" src="${icons.icon != null ? icons.icon : '//theme.hstatic.net/1000409940/1000612443/14/blog_no_img.jpg'}" alt="${metal}" /></label>	
											<span>${metal}</span>
										</div>`;
				}
			});

			if (items == ''){
				PDR.Product.current_variant = data_main.variants[0];
				$('.swatch.swatch-metal').addClass('d-none');
			}
			else {
				$('.select-swap--metal').html(items);
				$('.swatch-metal').find(".swatch-header.metal .title span:last-child").html(metalCurrent);
			}
		},
		renderSize: function(vitri_size){
			var items = ''; var select = '<option>Chọn Size</option>';
			var first_available = false;
			var sizeCurrent = '', availables = [];
			var option_size = 'option1';
			if(vitri_size == 1) option_size = 'option2';
			if(vitri_size == 2) option_size = 'option3';

			var count_unavailable = 0;
			data_main.variants.map(size => {
				var checkBarcodeHide = false;
				if(data_main.tags.includes('hide:'+size.barcode) || data_main.tags.includes('hide: '+size.barcode)){
					checkBarcodeHide = true;
					size.is_hide = true;
				}	

				if(data_main.variants.length == 1){
					sizeCurrent = size[option_size];
				}
				if(!$.isEmptyObject(paramUrl) && paramUrl.hasOwnProperty('size')){
					if(data_main.available){
						if(paramUrl.size == size[option_size] && size.available){
							sizeCurrent = size[option_size];
							PDR.Product.current_variant = size;
						}
						else if(size.available){
							availables.push(size);
						}
					}
				}
				else{
					if(size.available && first_available == false){
						first_available = true; 
						sizeCurrent = size[option_size];
						PDR.Product.current_variant = size;
					}
				}

				if(!size.available) count_unavailable++;
				//Render swatch size
				if(checkBarcodeHide){
					items += `<div class="swatch-element ${checkBarcodeHide?'hidebarcode':''} ${size.available?'':'soldout'}" data-option2="${size[option_size]}"><label><span>${size[option_size]}</span></label></div>`;
				}
				else {
					items += `<div class="swatch-element ${checkBarcodeHide?'hidebarcode':''} ${sizeCurrent != '' && sizeCurrent == size[option_size]?'sd':''} ${size.available?'':'soldout'}" data-option2="${size[option_size]}"><label><span>${size[option_size]}</span></label></div>`;
				}
				//Render select size
				select += `<option class="option-size" value="${size[option_size]}" >${size[option_size]}</option>`;
			});

			if(!data_main.available || count_unavailable == data_main.variants.length) PDR.Product.current_variant = data_main.variants[0];

			$('.select-swap--size').html(items);

			if(data_main.variants.length > 1){
				$('#btn-sizeguide').removeClass('d-none');
				$('#accordion-sizeguide').removeClass('d-none');
				$('#multistock #swatchSize').html(select);
				$('#provinceStore').html('').append('<option value="all">Chọn Tỉnh/Thành phố</option>');
				$('#stock-box').html('');
        var isFirst = true;
        data_main.variants.map(variant => {
          if(variant.available && isFirst){
            PDR.Product.renderProductDetail.getStore(variant.id);
            isFirst = false;
          }
        });
			}
			else{
				$('#btn-sizeguide').addClass('d-none');
				$('#accordion-sizeguide').addClass('d-none');
				$('#multistock #swatchSize').hide();
				if(!data_main.variants[0].available) PDR.Product.renderProductDetail.getStore(data_main.variants[0].id);
			}

			if(!$.isEmptyObject(paramUrl) && paramUrl.hasOwnProperty('size') && sizeCurrent == '' && availables.length > 0){
				$('.select-swap--size .swatch-element[data-option2="'+avaiables[0][option_size]+'"]').click();
			}
			else if(sizeCurrent != ''){
				$('.swatch-size').find(".header.size .header-title span:last-child").html(sizeCurrent);
			}
		},
		renderInfo: function(variant){

			window.productCollect.push(window.data_main);
			PDR.Rating.ratingProduct(1,0,0);

			$('h1').html(data_main.title);
			$('.accordion-item:first-child .accordion-content .content-box').html(data_main.description);

			var tagbadges = data_main.tags.filter(tag => tag.indexOf('badge:') > -1);
			if(tagbadges.length > 0){
				$('.pr-labels .badge').html(tagbadges[0].split(':')[1]);
				$('.pr-labels').removeClass('d-none');
			}
			/*Check tag CTKM*/
			var getTagCTKM = data_main.tags == null ? [] : data_main.tags.filter((value) => value.indexOf('I-DAY') > -1);
			var valTagCTKM	= '';
			if(getTagCTKM.length > 0){
				valTagCTKM = getTagCTKM[0];
				$('.pr-controls #btn-addtocart').attr('data-ctkm',valTagCTKM);
				$('.pr-controls #btn-buynow').attr('data-ctkm',valTagCTKM);
			}

      var getTagCTKM2 = data_main.tags == null ? [] : data_main.tags.filter((value) => value.indexOf('Doubleday99') > -1);
			var valTagCTKM2	= '';
			if(getTagCTKM2.length > 0){
				valTagCTKM2 = getTagCTKM2[0];
				$('.pr-controls #btn-addtocart').attr('data-ctkm-2',valTagCTKM2);
				$('.pr-controls #btn-buynow').attr('data-ctkm-2',valTagCTKM2);
			}

			if (variant.sku != null) {
				$('.pr-sku span').html(variant.sku);
			}
			else {
				$('.pr-sku span').html('Đang cập nhật');
			}

			$('#product-select').val(variant.id);
			$('#product-select').attr('data-sku',variant.sku);
			if(variant.price < variant.compare_at_price){
				var pro_sold = variant.price;
				var pro_comp = variant.compare_at_price / 100;
				var sale = 100 - (pro_sold / pro_comp);
				var kq_sale = Math.round(sale);
				$('.pr-price del').html(Haravan.formatMoney(variant.compare_at_price, window.shop.moneyFormat)).removeClass('d-none');
				$('.pr-price del').removeClass('d-none');
				$('.pr-price span').html(Haravan.formatMoney(variant.price,window.shop.moneyFormat));
				$('.pr-price span').addClass('reduced').attr('content',variant.price / 100);
				$('.pr-price span.badge').html('(-'+kq_sale+'%)').removeClass('d-none');
			} 
			else {
				$('.pr-price span').html(Haravan.formatMoney(variant.price, window.shop.moneyFormat));
				$('.pr-price span').removeClass('reduced').attr('content',variant.price / 100);
				$('.pr-price del').addClass('d-none');
				$('.pr-price span.badge').addClass('d-none');
			}

			if(variant.price > 0){
				$('.pr-controls #btn-addtocart').removeClass('d-none');
        $('.pr-controls #btn-Engraving').removeClass('d-none');
				if(data_main.available && variant.price > 0){
					if((variant.available && !variant.hasOwnProperty('is_hide')) || (variant.hasOwnProperty('is_hide') && !variant.is_hide)){
						$('.productdetail-info').removeClass('isSoldout');
						$('.pr-controls #btn-addtocart').removeClass('disabled').prop('disabled', false); 
						$(".pr-controls #btn-addtocart span").html('Thêm vào giỏ');
						$('.pr-controls #btn-buynow').removeClass('disabled').prop('disabled', false); 
						$('.pr-controls #btn-buynow').removeClass('d-none')

						//PDR.Product.renderProductDetail.getStore(variant.id);
            $('.pr-controls #btn-Engraving').removeClass('d-none');
					}
					else {}
				}
				else{
					$('.productdetail-info').addClass('isSoldout');
					$('.pr-controls #btn-addtocart').addClass('disabled').prop('disabled', true);
					$(".pr-controls #btn-addtocart").find('span').html('Hết hàng');
					$('.pr-controls #btn-buynow').addClass('d-none');
					$('.pr-controls #btn-buynow').addClass('disabled').prop('disabled', true);

          $('.pr-controls #btn-Engraving').addClass('d-none');
				}
			}
			else {
				$('.pr-controls #btn-addtocart').addClass('d-none');
				$('.pr-controls #btn-buynow').addClass('d-none');
        $('.pr-controls #btn-Engraving').addClass('d-none');
			}		
		},
		changeSize: function(){
			var self = this;
			$(document).on('click', '.select-swap--size .swatch-element', function(){
				var $this = $(this);
				$('.select-swap--size .swatch-element').removeClass('sd');
				$this.addClass('sd');
				var pid = $('.select-swap--metal .swatch-element.sd').attr('data-pid'); 
				var data = product_data.filter(x => x.id == pid);
				var metal = $('.select-swap--metal .swatch-element.sd').attr('data-option1');
				var size = $('.select-swap--size .swatch-element.sd').attr('data-option2');
				if(data.length > 0){
					var variant = data[0].variants.filter(vari => vari.option1 == metal && vari.option2 == size);
					if(variant.length > 0){
						self.renderInfo(variant[0]);
						PDR.Product.current_variant = variant[0];
					}
				}
				else {
					var variant = data_main.variants.filter(vari => vari.title.indexOf(size) > -1);
					if(variant.length > 0){
						self.renderInfo(variant[0]);
						PDR.Product.current_variant = variant[0];
					}
				}

				$this.parents('.swatch-size').find(".header.size .header-title span:last-child").html(size);

				var url = window.location.pathname+'?size='+size;
				self.pushUrl(url);

				//PDR.Product.changeArrProMulti();
				PDR.Product.renderProductDetail.getStore(variant[0].id);
			});
		},
		changeMetal: function(){
			var self = this;
			$(document).on('click', '.select-swap--metal .swatch-element', function(){
				$('.pr-gallery--item').addClass('no-img--loading');

				$('.pr-labels').addClass('d-none').find('.badge').html('');
				$('.product-reviews--render').html('');
				$('.pr-reviews--number .number-rate').html('0.0');
				$('.pr-reviews--number .number-rv').html('(0)');

				$('.product-reviews--body').addClass('d-none');
				$('.product-reviews--number span').html('0/5');
				$('.product-reviews--total strong').html('0');
				$('.isLoad').css('width','0px');
				$('.items-process .isCount').html('0 đánh giá');

				var $this = $(this);
				var url = $this.attr('data-url');
				var pId = $this.attr('data-pid');
				var metal = $this.attr('data-option1');

				if(pId == ''){
					$.ajax({
						url: url+'.js',
						async: false,
						success: function(data){

              try {
                PAN.Print.dataProduct = data;
              }
              catch(err){
                
              }
              
							product_data.push(data);
							$this.attr('data-pid',data.id);
							var options = data.options.map(option => {return option.name});
							data.options = options;
							data_main = data;

							$('.pr-button-wishlist').attr('data-handle',data_main.handle).attr('data-id',data_main.id).attr('data-price',data_main.price / 100);
							if(options.includes('Kích thước')){
								var vitri_size = options.indexOf('Kích thước');
								self.renderSize(vitri_size);
								if(data_main.variants.length >= 1) $('.swatch-size').removeClass('d-none');
								else $('.swatch-size').addClass('d-none');
							}
							self.renderInfo(data_main.variants[0]);
							self.renderImage();

							if(data_main.available){
								if(PDR.Product.current_variant.available){
									self.pushUrl(url+'?size='+PDR.Product.current_variant.option2);
								}
							}
							else{
								self.pushUrl(url);
							}

							if(accountJS.id != ''){
								PDR.Wishlist.getWishlistProduct(data_main.id,function(data_wishlist){
									console.log(data_wishlist);
									if(data_wishlist.err == false && $.isEmptyObject(data_wishlist.data)){
										$('.pr-button-wishlist').removeClass('added');
									}
									else{
										$('.pr-button-wishlist').addClass('added');
									}
								});
							}
						}
					});
				}
				else{
					data_main = product_data.filter(prd => prd.id == pId)[0];

          try {
            PAN.Print.dataProduct = data_main;
          }
          catch(err){
            
          }
          
					$('.pr-button-wishlist').attr('data-handle',data_main.handle).attr('data-id',data_main.id).attr('data-price',data_main.price / 100);
					if(data_main.options.includes('Kích thước')){
						var vitri_size = data_main.options.indexOf('Kích thước');
						self.renderSize(vitri_size);
						if(data_main.variants.length >= 1) $('.swatch-size').removeClass('d-none');
						else $('.swatch-size').addClass('d-none');
					}
					self.renderInfo(data_main.variants[0]);
					self.renderImage();

					if(data_main.available){
						if(PDR.Product.current_variant.available){
							self.pushUrl(url+'?size='+PDR.Product.current_variant.option2);
						}
					}
					else{
						self.pushUrl(url);
					}

					if(accountJS.id != ''){
						PDR.Wishlist.getWishlistProduct(data_main.id,function(data_wishlist){
							if(data_wishlist.err == false && $.isEmptyObject(data_wishlist.data)){
								$('.pr-button-wishlist').removeClass('added');
							}
							else{
								$('.pr-button-wishlist').addClass('added');
							}
						});
					}
				}

				$('.select-swap--metal .swatch-element').removeClass('sd');
				$this.addClass('sd');
				$this.parents('.swatch-metal').find(".swatch-header.metal .title span:last-child").html(metal);

				$('.pr-infos--complete-with').addClass('d-none');
				$('.pr-infos--complete-with .ajax-render').html('');
				PDR.Product.check_recommend = false;
				//PDR.Product.MixMatch();	
				//PDR.Product.changeArrProMulti();

				//if(data_main.variants.length == 1) PDR.Product.renderProductDetail.getStore(PDR.Product.current_variant.id);
				console.log(data_main.variants[0]);
			});
		},
		renderImage: function(){
			var html_img = '';
			data_main.images.map((img,ind_img) => {
				if(img.indexOf('_icon') == -1 && img.indexOf('/icon') == -1  && img.indexOf('-icon') == -1){
					var src_img = Haravan.resizeImage(img,'master');
					html_img += `
						<div class="pr-gallery--item swiper-slide ${ind_img == 0?'main-picture':'secondary-picture'}" data-image="${src_img}">
							<div class="pr-gallery--box">
								<a data-fancybox="gallery" class="aspect-ratio" href="${src_img}">
									<img src="${src_img}" alt="${data_main.title}">
								</a>
							</div>
						</div>
					`;
				}
			});
			if($(window).width() > 1099){
				$('#pr-gallery .swiper-wrapper').html(html_img);
			}
			else{
				var galleryTop = document.querySelector('#pr-gallery').swiper;
				if (galleryTop) {
					galleryTop.destroy(true,true);
				}
				function createNew() {
					galleryTop = new Swiper("#pr-gallery", {
						pagination: {
							el: "#pr-gallery .swiper-pagination",
							clickable: true,
						},
						navigation: {
							nextEl: "#pr-gallery .swiper-button-next",
							prevEl: "#pr-gallery .swiper-button-prev",
						},
					});
					galleryTop.update();
				}
				$('#pr-gallery .swiper-wrapper').html(html_img);
				createNew();
			}

			$(".select-swap--metal .swatch-element" ).hover(
				function() { 
					var value = $(this).find('span').html();
					$(this).parents(".swatch-metal").find(".swatch-header .title span:last-child").html( value );
				},
				function(){
					var value = $(".select-swap--metal .swatch-element.sd span").html();
					$(this).parents(".swatch-metal").find(".swatch-header  .title span:last-child").html( value );
				},
			);

			PDR.Product.fancyboxGallery();

		},
		pushUrl: function(url){
			history.replaceState(null, '', url);
		},
		changeSizeSelect: function(){
			$(document).on('change', '#multistock #swatchSize', function(){
				var pid = $('.select-swap--metal .swatch-element.sd').attr('data-pid'); 
				var data = product_data.filter(x => x.id == pid);
				var metal = $('.select-swap--metal .swatch-element.sd').attr('data-option1');
				var size = $(this).val();
				if(data.length > 0){
					var variant = data[0].variants.filter(vari => vari.option1 == metal && vari.option2 == size);
					if(variant.length > 0){
						PDR.Product.renderProductDetail.getStore(variant[0].id);
					}
				}
			});
		},
		getStore: function(variantid,storPrdTitle,isFirstTime){
			$('#stock-box').html('');
			$('#provinceStore').html('').append('<option value="all">Chọn Tỉnh/Thành phố</option>');

			var storeProvince = {};
			$.ajax({
				url: "/products/"+data_main.handle+"?variant=" + variantid+"&view=location",
				success:function(data){
					data = JSON.parse(data);
					if( data.locations.length > 0 ){
						$('#stock-box').removeClass('d-none');
						$('#provinceStore').html('').append('<option value="all">Chọn Tỉnh/Thành phố</option>');
						var array_html = '';
						var inventory_ecom = 0; // 835954 kho ecom 
						var inventory_phone_all = '02877766899'; //Dùng chung cho toàn cửa hàng
						$.each(data.locations,function(i,v){
							if(v.location_id == '835954') inventory_ecom = v.inventory_location;
							if(!(storeProvince[v.province_code])){ storeProvince[v.province_code] = v.province_name; }

							var inventory_id_hide = [ '1576832','1519350'];
							if($.inArray(v.location_id, inventory_id_hide) === -1){
								array_html += "<li data-code='"+v.province_code+"' class=''>";
								array_html += "<div class='bold-light'>" + v.location_name + "</div>";
								array_html += "<div class='medium-light'><span>Điện thoại:</span><a href='tel:"+inventory_phone_all+"' >" + /*v.location_phone*/ inventory_phone_all  + "</a></div>";
								array_html += "<div class='desc'><span>Địa chỉ:</span>" + v.location_address + "</div>";
								if( v.inventory_location > 0 ){
									array_html += "<span class='status green'>Còn hàng</span>";
								}
								else {
									array_html += "<span class='status red'>Hết hàng</span>";
								}
								array_html += '<span class="linkchat"> Chat với cửa hàng <a href="/" target="_blank">tại đây</a></span></li>';
							}
						});

						if(inventory_ecom < 5){
							$('.noti_inventory span').html(inventory_ecom).parent().removeClass('d-none');
						}
						else{
							$('.noti_inventory').addClass('d-none');
						}
						
						$.each(storeProvince,function(j,k){
							$('#provinceStore').append('<option value="'+j+'">'+k+'</option>');
						});
						if( array_html != '' ){
							$('.no-stock').addClass('d-none'); 
							$('#stock-box').html(array_html);
							$('#stock-box li[data-code="'+$('#provinceStore').val()+'"]').removeClass('d-none');
						}
						else {
							$('.no-stock').removeClass('d-none'); 
						}
					} 
					else {
						$('#provinceStore').addClass('d-none');
						$('#stock-box').addClass('d-none');
						$('.no-stock').removeClass('d-none');
					}			
				}
			});
		}
	},
	fancyboxGallery: function(){
		if($(window).width() > 1099){
			$('[data-fancybox="gallery"]').fancybox({
				loop : false,
				thumbs : {
					autoStart : true,
					axis      : 'x'
				},
				btnTpl: {
					zoom: '<button data-fancybox-zoom="" class="fancybox-button fancybox-button--zoom" title="Zoom"><svg aria-hidden="false" aria-label="Toggle fullscreen" class="c-icon c-carousel-modal__icon" fill="currentColor" focusable="false" role="img" version="1.1" viewBox="0 0 400 400"><text class="c-icon--title">Toggle fullscreen</text><path d="M399.7 0H264v36.5h99.5v99.2H400V0M0 .1v135.8h36.5V36.4h99.2V-.1H0M.3 399.8H136v-36.6H36.5V264H0v135.8M400 399.6V263.9h-36.5v99.5h-99.2v36.5H400" role="presentation"></path></svg></button>',
					close: '<button data-fancybox-close="" class="fancybox-button fancybox-button--close" title="Close"><svg aria-hidden="false" aria-label="Close" class="c-icon c-carousel-modal__icon" fill="currentColor" focusable="false" role="img" version="1.1" viewBox="0 0 400 400"><path d="M393.1,359.4L233.5,200L393.2,40.5c4.4-4.4,6.8-10.3,6.8-16.6c0-6.3-2.5-12.2-7-16.6c-4.4-4.4-10.6-7-16.8-7c-6.3,0-12.2,2.4-16.4,6.8L200,166.7L40.3,7.3c-4.4-4.4-10.4-6.9-16.7-6.9S11.3,2.8,6.9,7.3c-9.3,9.3-9.2,23.9,0.2,33.2l159.7,159.3L7.1,359.4c-4.5,4.5-7,10.5-7,16.9c0,6.2,2.4,12.1,6.9,16.5c4.4,4.4,10.4,6.9,16.7,6.9c6.2,0,12.1-2.4,16.7-6.9l159.9-159.5l159.5,159.3c4.5,4.5,10.5,7,16.8,7c6.1,0,12.1-2.5,16.4-6.8c4.4-4.4,6.9-10.3,6.9-16.5C400,370,397.6,364,393.1,359.4z" role="presentation"></path></svg></button>',
					arrowLeft:
					'<button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="">' +
					'<svg aria-hidden="false" aria-label="Previous feature" class="c-icon" fill="#7f7776" focusable="false" role="img" version="1.1" viewBox="0 0 400 400"><path d="M100,200c0,2,0.8,3.7,2,4.9l185.7,193c1.4,1.4,3.1,2.1,5.3,2.1c3.9,0,7-3.1,7-7.2c0-1.8-0.8-3.5-2-4.9L117,200L298,12.1 c1.2-1.4,2-3.1,2-4.9c0-4.1-3.1-7.2-7-7.2c-2.1,0-3.9,0.8-5.3,2.1L102,195.1C100.8,196.3,100,198,100,200z" role="presentation"></path></svg>' +
					'</button>',
					arrowRight:
					'<button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="">' +
					'<svg aria-hidden="false" aria-label="Next feature" class="c-icon" fill="#7f7776" focusable="false" role="img" version="1.1" viewBox="0 0 400 400"><path d="M298,195.1L112.3,2.1C110.9,0.8,109.2,0,107,0c-3.9,0-7,3.1-7,7.2c0,1.8,0.8,3.5,2,4.9L283,200L102,387.9 c-1.2,1.4-2,3.1-2,4.9c0,4.1,3.1,7.2,7,7.2c2.1,0,3.9-0.8,5.3-2.1l185.7-193c1.2-1.2,2-2.9,2-4.9C300,198,299.2,196.3,298,195.1z" role="presentation"></path></svg>' +
					"</button>"
				},
			})
		}
	},
	multiStore: function(){
		$('#btn-findsore').on('click',function(){
			$('#multistock').modal('show');
		});
		$('#provinceStore').on('change',function(){
			$('#stock-box li').addClass('d-none');
			if ($('#provinceStore').val() == 'all'){
				$('#stock-box li').removeClass('d-none');
			}
			else {
				$('#stock-box li[data-code="'+$('#provinceStore').val()+'"]').removeClass('d-none');
			}
		});
	},
	setViewedProduct: function(){
		if(window.product.data.price > 0){
			var phand = [];
			var pid = '';
			var ptype = [];
			let unShow = ['Quà Tặng Không Bán','Combo Ẩn','TẠM HẾT HÀNG'];
			if(!unShow.includes(window.product.type)){
				var list_viewed = localStorage.getItem('last_viewed_products');
				if(list_viewed == null){
          localStorage.setItem('last_viewed_products',window.product.id);
        }
				else{
					var check_viewed = list_viewed.split(',');
					if($.inArray(window.product.id, check_viewed) === -1){
						var new_viewed = window.product.id + ',' + check_viewed.join(',');
						localStorage.setItem('last_viewed_products',new_viewed);
					}
				}
			}
		}
	},
	similarStyles: function(){
		var product = window.product.data;
		var url = '/search.js?q=filter=(' + encodeURIComponent('(product_type:product='+product.type+')') + ')&include=metafields[product]&page=1&limit=10';
		$.get(url).done(function(data){
			if(data.total > 0){
				$('#list-similar-products .swiper-wrapper').html('');
				data.products.map((item,ind) => {
					var html_loop = `<div class="swiper-slide"><div class="product-loop">` + PDR.Global.renderLoop(item,(ind + 1)) + `</div></div>`;
					$('#list-similar-products .list-products').append(html_loop);
				});
				PDR.Wishlist.renderFavorites();		
				if($(window).width() >= 991){
					var swiper = new Swiper("#list-similar-products .swiper", {
						slidesPerView: 4,
						slidesPerGroup: 4,
						spaceBetween: 12,
						speed: 1000,
						centeredSlides: false,
						navigation: {
							nextEl: "#list-similar-products .swiper-button-next",
							prevEl: "#list-similar-products .swiper-button-prev",
						},
					}); 
				}
			}
			else{
				$('.section-similar').addClass('d-none');
			}
		});
	},
	sliderCollection: function(){ 
		var id1 = $('#list-foryou-products').attr('data-id');
		var titleColl1 = $('#list-foryou-products').attr('data-title');
		var urlColl1   = $('#list-foryou-products').attr('data-handle');

		if($(window).width() > 767){
			PDR.Global.getItemSlide(id1,titleColl1,urlColl1,1,8,'#list-foryou-products',function(){
				var swiper1 = new Swiper("#list-foryou-products .swiper", {
					slidesPerView: 4,
					slidesPerGroup: 4,
					spaceBetween: 12,
					speed: 1000,
					centeredSlides: false,
					navigation: {
						nextEl: "#list-foryou-products .swiper-button-next",
						prevEl: "#list-foryou-products .swiper-button-prev",
					},
				}); 
			});
		}
		else {
			PDR.Global.getItemSlide(id1,titleColl1,urlColl1,1,8,'#list-foryou-products');
		}
	},
	productAction: function(){
		$(".js-scroll").on('click', function(event) {
			if (this.hash !== "") {
				event.preventDefault();
				var hash = this.hash;
				var y = $(hash).offset().top;
				PDR.Helper.smoothScroll(y-140, 500);
			}
		});
	},
	atcProduct: function(){
		/*
		var text1 = 'Thông báo', 
				text2 = 'ĐÃ THÊM VÀO GIỎ HÀNG',
				text3 = 'Mỗi sản phẩm chỉ được mua với số lượng tối đa là 10';

		$(document).on('click', '#btn-addtocart:not(.loading):not(.disabled):not(.added)', function(e){
			e.preventDefault();
			var isValid = true;
			
			if(isValid){
				$('#mainLoading').addClass('active');
				$('#btn-addtocart').addClass('loading');

				var quantity = parseInt($('#product-page .input-quantity').val());
				var id = PDR.Product.current_variant.id;
				var	dataAdd = {
					id: id, 
					quantity: quantity
				};
				var acceptBuy = true;

				if(cartJS.items.length > 0){
					cartJS.items.filter(x => {
						if(x.variant_id == id){
							if((x.quantity + quantity) > 5){
								acceptBuy = false;
							}
						}
					});
				}
				else {
					if(quantity > 10){
						acceptBuy = false;
					}
				}
				var param = {
					type: 'POST',
					url: '/cart/add.js',
					data: dataAdd,
					dataType: 'json',
					success: function(line_item) {
						PDR.Global.cartAjax(function(){
							$('#mainLoading').removeClass('active');

							PDR.Helper.getMiniCart();
							$('#btn-addtocart').addClass('added');

							$('#btn-addtocart').removeClass('loading');
							setTimeout(function(){
								$('#btn-addtocart').removeClass('added');
							},3000);
						},);
					},
					error: function(XMLHttpRequest, textStatus) {
						if ( XMLHttpRequest.status == 422 ){
							PDR.Helper.SwalWarning("Thông báo","Đã có lỗi xảy ra",'error',false,false,2000);
							$('#mainLoading').removeClass('active');
							$('#btn-addtocart').removeClass('loading');
						}
					}
				}

				if(acceptBuy){
					$.ajax(param);
				}
				else {
					PDR.Helper.SwalWarning(text1,text3,'error',false,false,2000);
					$('#mainLoading').removeClass('active');
					$('#btn-addtocart').removeClass('loading');
				}
			}
		});
		*/
		
		$(document).on('click', '#btn-addtocart:not(.loading):not(.disabled):not(.added)', function(e){
			e.preventDefault();
			$('#mainLoading').addClass('active');
			$('#btn-addtocart').addClass('loading');
			//var id = $('#product-select').val();
			//let sku = $(`#product-select [value="${id}"]`).attr('data-sku');
			var quantity = parseInt($('.product-layout .input-quantity').val());
			var id  = PDR.Product.current_variant.id;
			let sku = PDR.Product.current_variant.sku;
			var tagCTKM = $(this).attr('data-ctkm');
      var tagCTKM2 = $(this).attr('data-ctkm-2');
			
			var exist = cartJS.items.filter(item => item.variant_id == id);
			if(exist.length > 0){
				var properties = exist[0].properties;
				if(!properties.hasOwnProperty('cates')) properties.cates = cates;
				if(!properties.hasOwnProperty('CTKM')) properties.CTKM = tagCTKM;
        if(!properties.hasOwnProperty('CTKM') && tagCTKM2 != '') properties.CTKM2 = tagCTKM2;
			}
			else{
				var properties = { cates: cates, CTKM: tagCTKM  };
        if(tagCTKM2 != '') properties.CTKM2 = tagCTKM2;
			}
			let flagLimitSku = PDR.Helper.checkLimitSku(sku, 1);
			if(!flagLimitSku) return PDR.Helper.SwalWarning("Xin lỗi bạn!", "Chương trình chỉ áp dụng tối đa 2 sản phẩm", "error",false,false,4000);
					
			var param = {
				type: 'POST',
				url: '/cart/add.js',
				data:  { id: id, quantity: quantity, properties: properties },
				dataType: 'json',
				success: function(datacart) {
					PDR.GA4.GTMAddToCart(datacart);
					PDR.Global.cartAjax(function(){
						PDR.Helper.getMiniCart();
						
						$('#mainLoading').removeClass('active');
						$('#btn-addtocart').addClass('added');
						$('#btn-addtocart').removeClass('loading');
						
						setTimeout(function(){
							$('#btn-addtocart').removeClass('added');
						},3000);
					},);
				},
				error: function(XMLHttpRequest, textStatus) {
					if ( XMLHttpRequest.status == 422 ){
						PDR.Helper.SwalWarning("Thông báo","Đã có lỗi xảy ra",'error',false,false,2000);
						$('#mainLoading').removeClass('active');
						$('#btn-addtocart').removeClass('loading');
					}
				}
			}
			$.ajax(param);
		});
		
		$(document).on('click', '#btn-buynow:not(.loading):not(.disabled):not(.added)', function(e){
			e.preventDefault();
			$('#mainLoading').addClass('active');
			$('#btn-buynow').addClass('loading');
			
			//var id = $('#product-select').val();
			//let sku = $(`#product-select [value="${id}"]`).attr('data-sku');
			var quantity = parseInt($('.product-layout .input-quantity').val());
			var id  = PDR.Product.current_variant.id;
			let sku = PDR.Product.current_variant.sku;
			var tagCTKM = $(this).attr('data-ctkm');
      var tagCTKM2 = $(this).attr('data-ctkm-2');
      
			var exist = cartJS.items.filter(item => item.variant_id == id);
			if(exist.length > 0){
				var properties = exist[0].properties;
				if(!properties.hasOwnProperty('cates')) properties.cates = cates;
				if(!properties.hasOwnProperty('CTKM')) properties.CTKM = tagCTKM;
        if(!properties.hasOwnProperty('CTKM') && tagCTKM2 != '') properties.CTKM2 = tagCTKM2;
			}
			else{
				var properties = { cates: cates, CTKM: tagCTKM };
        if(tagCTKM2 != '') properties.CTKM2 = tagCTKM2;
			}
			let flagLimitSku = PDR.Helper.checkLimitSku(sku, 1);
			if(!flagLimitSku) return PDR.Helper.SwalWarning("Xin lỗi bạn!", "Chương trình chỉ áp dụng tối đa 2 sản phẩm", "error",false,false,4000);
			$.ajax({
				type: 'POST',
				async: false,
				url: '/cart/add.js',
				data:  { id: id, quantity: 1, properties: properties },
				dataType: 'json',
				success: function(datacart) {
					PDR.GA4.GTMAddToCart(datacart);
					PDR.Global.cartAjax(function(){
						$('#mainLoading').removeClass('active');
							window.location = '/cart';
					},);
				},
				error: function(XMLHttpRequest, textStatus) {
					if ( XMLHttpRequest.status == 422 ){
						PDR.Helper.SwalWarning("Thông báo","Có trục trặc về tồn kho!",'error',false,false,2000);
						$('#mainLoading').removeClass('active');
						$('#btn-addtocart').removeClass('loading');
					}
				}
			})
	
		});
	},
	sliderMessage: function(){
		var swiper = new Swiper(".js-promo-message", {
			loop: true,
			autoplay: {
				delay: 4000,
			},
			pagination: {
				el: '.js-promo-message .swiper-pagination',
				clickable: true,
				renderBullet: function (index, className) {
					return '<span class="' + className + ' bullet-' + index + '"></span>';
				},
			}
		});
	},
	giftPacking: function(){
		function renderItemMini(data) {
			if(typeof data.tags == 'string'){
				data.tags = data.tags.split(',');
			}
			if(!data.hasOwnProperty('url')) {
				data.variants[0].compare_at_price = Number(data.variants[0].compare_at_price)*100;
				data.variants[0].price = Number(data.variants[0].price)*100;
			}

			var img_desk = 'https://theme.hstatic.net/200000726949/1001078399/14/noimage.jpg';
			var img_mb = 'https://theme.hstatic.net/200000726949/1001078399/14/noimage.jpg';

			// Image
			if(data.featured_image != '' && data.featured_image != null){
				img_mb = Haravan.resizeImage(data.featured_image,'large');
				img_desk = Haravan.resizeImage(data.featured_image,'grande');
			}		
			if(data.image != '' && data.image != null){
				img_mb = Haravan.resizeImage(data.image.src,'large');
				img_desk = Haravan.resizeImage(data.image.src,'grande');
			}

			//Link product
			var url_prod = data.hasOwnProperty('url') ? data.url : '/products/'+data.handle;

			//Check Price
			var sale = 0, del = 0;
			var compare_at_price = Number(data.variants[0].compare_at_price);
			var price = Number(data.variants[0].price);
			if(compare_at_price > price){
				del = data.hasOwnProperty('url') ? compare_at_price : compare_at_price;
				del = Haravan.formatMoney(del,shop.moneyFormat);
				sale = Math.round((compare_at_price - price)/compare_at_price * 100);
			}
			
			
			var sku_available = data.variants.filter(v => v.available );

			var htmlLoopMini = `
				<div class="loopmini-wrap">
					<div class="loopmini-head">
						<div class="loopmini-img">
							<picture>
								<source data-srcset="${img_desk}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" media="(min-width: 768px)">
								<source data-srcset="${img_mb}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" media="(max-width: 767px)">
								<img class="lazyload img-default" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" data-src="${img_desk}" alt="${data.title}">
							</picture>
						</div>
						<a href="${url_prod}" class="loopmini-link"></a>
					</div>
					<div class="loopmini-body">		
						<div class="loopmini-prices">
							<b class="${data.variants[0].price == 0?'d-none':''} ${sale == 0?'normal':'hightlight'}">${Haravan.formatMoney(data.hasOwnProperty('url') ? data.variants[0].price : data.variants[0].price  ,shop.moneyFormat)}</b>
							<del class="${sale == 0?'d-none':''}">${del}</del>
							<div class="tag-free ${data.variants[0].price == 0?'':'d-none'}">Miễn phí</div>
						</div>	
						<h3 class="loopmini-title"><a href="${url_prod}" title="${data.title}">${data.title}</a></h3>
						<div class="loopmini-desc">${data.body_html}</div>
						<div class="loopmini-buttons">
							<a aria-label="Thêm vào giỏ" href="${$('#giftpacking-collection').attr('data-handle')}" class="loop-action" data-variantid="${(sku_available.length > 0) ? sku_available[0].id : data.variants[0].id}" data-sku="${(sku_available.length > 0) ? sku_available[0].sku : data.variants[0].sku}" >Thêm vào giỏ</a>
						</div>
					</div>
				</div>`;
			return htmlLoopMini;	 
		}
		function getItemGrid(id,title,url,page,limit,target){ 
			var url_get = url+'/products.json?include=metafields[product]&page='+page+'&limit='+limit;
			$.get(url_get).done(function(data){
				if(data.products.length > 0){
					$(target+' .list--products-gift').html('');
					data.products.map((item,ind) => {
						var htmlLoopMini = `<div class="loopmini">` + renderItemMini(item,limit*(page - 1) + (ind + 1)) + `</div>`;
						$(target+' .list--products-gift').append(htmlLoopMini);
					});
				}
			});
		}
		
		$('.js-giftpacking').on('click',function(){
			var id = $('#giftpacking-collection').attr('data-id');
			var titleColl = $('#giftpacking-collection').attr('data-title');
			var urlColl   = $('#giftpacking-collection').attr('data-handle');
			getItemGrid(id,titleColl,urlColl,1,10,'#giftpacking-collection');
			$('#giftpackingModal').modal('show');
		});
		
	},
}
PDR.Collection = {
	strFilter: '',
	origin: {
		total_product: 0,
		total_page: 0
	},
	allowLoadMore: true,
	paramTracking: [],
	init: function() {	
		var that = this;
		//that.sliderCate();
		var paramSearch = window.location.search.replace('?','');
		if(!$.isEmptyObject(paramUrl)){
			if(paramUrl.hasOwnProperty('sort_by')){
				var count_param = Object.keys(paramUrl).length;
				if(count_param == 1){
					$('input[name="cfb-sort-input"][value="'+paramUrl.sort_by+'"]').prop('checked',true);
					//$('#collection-page .products-grid').html('');
					that.getCollectionItem(1,true);
					that.backUpSidebar();
				}
				else{
					that.backUpSidebar();
					PDR.Collection.stringFilter();
				}
			}
			else{
				that.backUpSidebar();
				PDR.Collection.stringFilter();
			}
		}
		else{
			//$('#collection-page .products-grid').html('');
			that.getCollectionItem(1);
		}
		that.actionFilter();
		that.loadMore();
		that.renderCollectionInfo();
	},
	renderCollectionInfo: function(){
		
		//Render Color
		var indexColor = 0;
		var color_arr = coll_tags.filter(tag => tag.indexOf("color:") > -1);
		$.each(color_arr,function(i,v){
			i = v.replace('color:','');
			var style_bg = 'style="background: '+color_code[i]+'"';
			if( i == 'Màu nude'){
				style_bg = 'style="background: url('+color_code[i]+') no-repeat; background-size: 150% 150%; background-position: center;"';
			}
			var html_filter = '<li><input type="checkbox" id="data-color-p' + indexColor + '" value="' + i + '" name="color-filter" data-color="(tag:product=*'+i+')" /><label data-value="'+i.toLowerCase()+'" for="data-color-p'+ indexColor +'" '+style_bg+'>'+i+'</label><span>'+i+'</span></li>';
			indexColor ++;
			$('.filter-color ul').append(html_filter);
		});
		
		// Check collapse
		$('.sidebar_box').each(function(){
			if($(this).find('.checkbox-list li').length > 0){
				$(this).find('.sidebar_box-content').addClass('show');
				$(this).find('.sidebar_box-subtitle').attr('aria-expanded','true');
				$(this).removeClass('d-none');
			}
			else {
				$(this).find('.sidebar_box-content').removeClass('show');
				$(this).find('.sidebar_box-subtitle').attr('aria-expanded','false');
				$(this).attr('aria-expanded','false');
				$(this).addClass('d-none');
			}
		});
		
		//render MainBanner + cate + collection sub
		var htmlBanner = '';
		var htmlCate = '';
		if(data_render != '' ){
			if(data_render.hasOwnProperty('mainbanner') && data_render.mainbanner.length > 0){
				$('#hero-banner .hero-wrapper').css({
					'background-image': 'url(' + data_render.mainbanner[0].desktop + ')',
					'background-color': '#ffffff',
					'background-position': 'right'
				});
				$('#hero-banner .hero-banner img').attr('src',data_render.mainbanner[0].mobile);
			}
			if(data_render.hasOwnProperty('category') && data_render.category.length > 0){
				$.each(data_render.category,function(i,v){
					htmlCate +='<div class="swiper-slide">';
					htmlCate +=	'<div class="item-cate">';
					htmlCate += 	'<div class="icon">';
					htmlCate += 		'<a href="'+v.link+'"><img src="'+v.icon+'"></a>';
					htmlCate += 	'</div>';
					htmlCate += 	'<div class="title">';
					htmlCate += 		'<h3>'+v.title+'</h3>';
					htmlCate += 	'</div>';
					htmlCate += '</div>';
					htmlCate +='</div>';
					$('#slider-cate .list-cates').html('');
					$('#slider-cate .list-cates').append(htmlCate);
				});
			}
			else {
				$('#slider-cate').addClass('d-none');
			}
			if(data_render.hasOwnProperty('collection') && data_render.collection.length > 0){
				if(data_render.collection[0].show && data_render.collection[0].handle != ' '){
					var id0 = $('#slider-collection-0').attr('data-id');
					var titleColl0 = $('#slider-collection-0').attr('data-title');

					if($(window).width() > 767){
						PDR.Global.getItemSlide(id0,titleColl0,data_render.collection[0].handle,1,8,'#slider-collection-0',function(){
							var swiper1 = new Swiper("#slider-collection-0 .swiper", {
								loop: true,
								slidesPerView: 4,
								breakpoints: {
									735: {
										slidesPerView: 4,
									},
									1024: {
										slidesPerView: 4,
									},
									1460: {
										slidesPerView: 4,
									}
								},
								pagination: {
									el: '#slider-collection-0 .swiper-pagination',
									type: 'bullets',
									clickable: true
								},
								navigation: {
									nextEl: '#slider-collection-0 .swiper-button-next',
									prevEl: '#slider-collection-0 .swiper-button-prev',
								}
							});
						});
					}
					else {
						PDR.Global.getItemSlide(id0,titleColl0,data_render.collection[0].handle,1,8,'#slider-collection-0');
					}
				}
				else {
					$('#js-render-coll-0').addClass('d-none');
				}

				if(data_render.collection[1].show && data_render.collection[1].handle != ' '){
					var id1 = $('#slider-collection-1').attr('data-id');
					var titleColl1 = $('#slider-collection-1').attr('data-title');

					if($(window).width() > 767){
						PDR.Global.getItemSlide(id1,titleColl1,data_render.collection[1].handle,1,8,'#slider-collection-1',function(){
							var swiper1 = new Swiper("#slider-collection-1 .swiper", {
								loop: true,
								slidesPerView: 4,
								breakpoints: {
									735: {
										slidesPerView: 4,
									},
									1024: {
										slidesPerView: 4,
									},
									1460: {
										slidesPerView: 4,
									}
								},
								pagination: {
									el: '#slider-collection-1 .swiper-pagination',
									type: 'bullets',
									clickable: true
								},
								navigation: {
									nextEl: '#slider-collection-1 .swiper-button-next',
									prevEl: '#slider-collection-1 .swiper-button-prev',
								}
							});
						});
					}
					else {
						PDR.Global.getItemSlide(id1,titleColl1,data_render.collection[1].handle,1,8,'#slider-collection-1');
					}
				}
				else {
					$('#js-render-coll-1').addClass('d-none');
				}
			}

		}
		else {
			$('#slider-cate').addClass('d-none');
			$('#js-render-coll-1').addClass('d-none');
			$('#js-render-coll-0').addClass('d-none');
		}
		
		//Xoá hình - để tạm xoá sau
		var imageCollecFunc = function(){
			if($('.hero-desc img').length > 0){
				var imageCollec = $('.hero-desc img').attr('src');
				$('.hero-desc img').remove();
			}
		}
		imageCollecFunc();
		
		if($(window).width() < 992) {
			$('.sortBy').removeClass('dropdown-menu').appendTo($('.sort-box-scroll .layered_filter_group').addClass('collection-sortbyfilter'));
			$('.title_sortby').appendTo($('.mb-filter-wrapper .btn-sortby-mb'));
			// Event open sort on mobile and ipad
			$(document).on("click", '.collection-sort h3', function(e){
				$('body').toggleClass('lock-scroll');
				jQuery('.wrapper-sort').toggleClass('sort-visible');
				jQuery('.wrapper-sort .boxscroll').css('height','250px');
				$('.refinement-section').toggleClass('has-filter');
			});
			// Event open filter on mobile and ipad
			$(document).on("click", '.collection-filter h3', function(e){
				$('body').toggleClass('lock-scroll');
				jQuery('.wrapper-filter').toggleClass('filter-visible');
				jQuery('.wrapper-filter .filter-box-scroll').css('max-height','40vh');
				jQuery('.wrapper-filter .boxscroll').css('max-height','34vh');
				$('.refinement-section').toggleClass('has-filter');
			});
			
			$(document).on("click", '.js-sortby-mb-click', function(e){
				 $( ".collection-sort h3" ).trigger( "click" );
			});
			$(document).on("click", '.js-filter-mb-click', function(e){
				$( ".collection-filter h3" ).trigger( "click" );
			});


			var t = $(".list-btn-mb");
			var e = $(".list-btn-mb").offset().top, 
					n = $(".mb-filter-wrapper").height();
			$(window).scroll(function() {
				if ($(document).scrollTop() > e){
					t.addClass("sticky-refinement-mobile");
					$(".grid-count-section").css("padding-top", n + "px")
				}
				else {
					t.removeClass("sticky-refinement-mobile").removeAttr("style");
					t.removeClass("refinement-scroll-up");
					t.removeClass("refinement-scroll-down");
					$(".grid-count-section").removeAttr("style");
				}
			});
		}

	},
	getCollectionItem: function(page,filter){
		var idColl = $('#collection-page').attr('data-id');
		var sortby = default_sort != 'manual' ? $('.sortBy input[value="'+default_sort+'"]').attr('data-filter') : '(price:product=asc)';

		if($('.sortBy li.active').length > 0) sortby = $('.sortBy li.active input').attr('data-filter');

		var url_get = '/search.js?q=filter=((collectionid:product'+(idColl == '0'?'>=':'=')+idColl+'))&sortby='+sortby+'&include=metafields[product]&page='+(page != undefined?page:1)+'&limit='+num_per_page;
		if((PDR.Collection.strFilter == '' && filter == undefined) || (filter != undefined && filter == false)){
			PDR.Collection.strFilter = '';
			var check_pathname = window.location.pathname.split('/').reverse();
			if(check_pathname[0] == ''){
				check_pathname.splice(0,1);
			}

			check_pathname = check_pathname.reverse().join('/');
			url_get = check_pathname+'/products.json?limit='+num_per_page+'&page='+(page != undefined?page:1)+'&include=metafields[product]';
		}

		if(filter != undefined && filter && PDR.Collection.strFilter != ''){
			url_get = '/search.js?q=filter='+PDR.Collection.strFilter+'&include=metafields[product]'+'&page='+(page != undefined?page:1)+'&limit='+num_per_page;
		}
		$('.js-ResultCount span').html(default_products+' kết quả');

		$.get(url_get).done(function(data){
			if(PDR.Collection.strFilter == '' && url_get.indexOf('search') > -1) {
				PDR.Collection.strFilter = '(collectionid:product'+(idColl == '0'?'>=':'=')+idColl+')&sortby='+sortby;
			}
			if(data.total > 0 || (data.hasOwnProperty('products') && data.products.length > 0)){
				if($('#collection-page .grid-products').length == 0){
					$('#collection-page .grid-count-section').html('<div class="grid-products"></div>');
				}

				if((page != undefined && page == 1 || page == undefined) && url_get.indexOf('search') > -1){
					$('.js-ResultCount span').html(data.total+' kết quả');
				}

				if(url_get.indexOf('search') > -1){
					$('#js-btn-more').attr('data-current',page).attr('data-pages',Math.ceil(data.total / num_per_page));
					if(PDR.Collection.origin.total_product == 0 && PDR.Collection.origin.total_page == 0){
						PDR.Collection.origin.total_product = data.total;
						PDR.Collection.origin.total_page = Math.ceil(data.total / num_per_page);
						if(PDR.Collection.origin.total_page == page){
							$('#js-btn-more').addClass('d-none');
						}
						else {
							$('#js-btn-more').removeClass('d-none');
						}
					}
					else {
						if(PDR.Collection.origin.total_page == page){
							$('#js-btn-more').addClass('d-none');
						}
					}
				}
				else{
					$('#js-btn-more').attr('data-current',page).attr('data-pages',default_total);
					if(PDR.Collection.origin.total_product == 0 && PDR.Collection.origin.total_page == 0){
						PDR.Collection.origin.total_product = default_products;
						PDR.Collection.origin.total_page = default_total;
						if(PDR.Collection.origin.total_page == page){
							$('#js-btn-more').addClass('d-none');
						}
						else {
							$('#js-btn-more').removeClass('d-none');
						}
					}	
					else {
						if(PDR.Collection.origin.total_page == page){
							$('#js-btn-more').addClass('d-none');
						}
					}
				}

				var html_loop = '';
				var countbanner = page == 1 ? 0 : $('#collection-page .grid-products .product-banner').length;

				data.products.map((item,ind) => {
					var number_loop = num_per_page*(page - 1) + (ind + 1);
					html_loop += `<div class="product-tile product-loop ${number_loop}">` + PDR.Global.renderLoop(item,number_loop) + `</div>`;


					//render Subbanner
					if(data_render.hasOwnProperty('subbanner') && data_render.subbanner.length > 0 && (number_loop % 6 == 0) && countbanner < data_render.subbanner.length ){
						if(data_render.subbanner[0].show && data_render.subbanner[0].type == 'banner' && data_render.subbanner[0].banner != ''  ){
							html_loop += '<div class="product-tile product-banner '+number_loop+'"><div class="product-loop-wrap"><a href="'+data_render.subbanner[0].bannerlink+'"><img src="'+data_render.subbanner[0].banner+'" class="img-append"></a></div></div>';
							countbanner++;
						}
					}
				});

				if(page == 1) $('#collection-page .grid-products').html(html_loop);
				else $('#collection-page .grid-products').append(html_loop);
				PDR.Collection.allowLoadMore = true;
				$('html,body').removeClass('open-overlay open-noscroll open-sidebar-filter');
        window.customerReview?.renderLayoutStarProductRating?.();
			}
			else{
				$('.js-ResultCount span').html('0 kết quả');
				$('#js-btn-more').attr('data-current',0).attr('data-pages',0).addClass('d-none');
				$('.grid-count-section').html('<div class="grid-empty alert-info">Chưa có sản phẩm nào trong danh mục này</div>');
				PDR.Collection.allowLoadMore = true;
				$('html,body').removeClass('open-overlay open-noscroll open-sidebar-filter');
			}
		});
	},
	stringFilter: function(){
		var $this = this;
		var idColl = $('#collection-page').attr('data-id');
		var query = [];
		var change_url = [];
		
		if($(window).width() < 992) {
			$('body').removeClass('lock-scroll');
			$('.wrapper-filter').removeClass('filter-visible');
			$('.wrapper-sort').removeClass('sort-visible');
			$('.refinement-section').removeClass('has-filter');
		}
		
		/* Type Product */
		if($('#filter-type input:checked').length > 0){
			var temp = [];
			var picked = [];
			$('#filter-type input:checked').each(function(){
				var metal = $(this).attr('data-type');
				temp.push(metal);
				picked.push($(this).val());
			});
			query.push('('+temp.join('||')+')');
			var index_group = $('#filter-type').parents('.filter_group').index();
			$('.filter_tags:eq('+index_group+') b').text(picked.join(','));
			$('.filter_tags:eq('+index_group+')').addClass('opened');
			change_url.push('type='+picked.join(','));
		}

		/* Filter Metal */
		if($('#filter-metal input:checked').length > 0){
			var temp = [];
			var picked = [];
			$('#filter-metal input:checked').each(function(){
				var metal = $(this).attr('data-metal');
				temp.push(metal);
				picked.push($(this).val());
			});
			query.push('('+temp.join('||')+')');
			var index_group = $('#filter-metal').parents('.filter_group').index();
			$('.filter_tags:eq('+index_group+') b').text(picked.join(','));
			$('.filter_tags:eq('+index_group+')').addClass('opened');
			change_url.push('metal='+picked.join(','));
		}

		/* Filter Color */
		if($('#filter-color input:checked').length > 0){
			var temp = [];
			var picked = [];
			$('#filter-color input:checked').each(function(){
				var color = $(this).val();
				temp.push('(tag:product=*'+color+')');
				picked.push(color);
			});
			query.push('('+temp.join('||')+')');
			var index_group = $('#filter-color').parents('.filter_group').index();
			$('.filter_tags:eq('+index_group+') b').text(picked.join(','));
			$('.filter_tags:eq('+index_group+')').addClass('opened');
			change_url.push('color='+picked.join(','));
		}

		/* Filter Vendor */
		if($('#filter-vendor input:checked').length > 0){
			var temp = [];
			var picked = [];
			$('#filter-vendor input:checked').each(function(){
				var vendor = $(this).attr('data-vendor');
				temp.push(vendor);
				picked.push($(this).val());
			});
			query.push('('+temp.join('||')+')');
			var index_group = $('#filter-vendor').parents('.filter_group').index();
			$('.filter_tags:eq('+index_group+') b').text(picked.join(','));
			$('.filter_tags:eq('+index_group+')').addClass('opened');
			change_url.push('vendor='+picked.join(','));
		}

		/* Filter Theme */
		if($('#filter-theme input:checked').length > 0){
			var temp = [];
			var picked = [];
			$('#filter-theme input:checked').each(function(){
				var theme = $(this).val();
				temp.push('(tag:product=*'+theme+')');
				picked.push(theme);
			});
			query.push('('+temp.join('||')+')');
			var index_group = $('#filter-theme').parents('.filter_group').index();
			$('.filter_tags:eq('+index_group+') b').text(picked.join(','));
			$('.filter_tags:eq('+index_group+')').addClass('opened');
			change_url.push('theme='+picked.join(','));
		}

		/* Filter Size */
		if($('#filter-size input:checked').length > 0){
			var temp = [];
			var picked = [];
			$('#filter-size input:checked').each(function(){
				var size = $(this).attr('data-size');
				temp.push(size);
				picked.push($(this).val());
			});
			query.push('('+temp.join('||')+')');
			var index_group = $('#filter-size').parents('.filter_group').index();
			$('.filter_tags:eq('+index_group+') b').text(picked.join(','));
			$('.filter_tags:eq('+index_group+')').addClass('opened');
			change_url.push('size='+picked.join(','));
		}

		/* Filter Price */
		if($('#filter-price input:checked').length > 0){
			var temp = [];
			var picked = [];
			$('#filter-price input:checked').each(function(){
				var price = $(this).attr('data-price');
				temp.push(price);
				picked.push($(this).val());
			});
			query.push('('+temp.join('||')+')');
			var index_group = $('#filter-price').parents('.filter_group').index();
			$('.filter_tags:eq('+index_group+') b').text(picked.join(','));
			$('.filter_tags:eq('+index_group+')').addClass('opened');
			change_url.push('price='+picked.join(','));
		}

		/* Filter Prm */
		if($('#filter-prm input:checked').length > 0){
			var temp = [];
			var picked = [];
			$('#filter-prm input:checked').each(function(){
				var prm = $(this).val();
				temp.push('(tag:product=*'+prm+')');
				picked.push(prm);
			});
			query.push('('+temp.join('||')+')');
			var index_group = $('#filter-prm').parents('.filter_group').index();
			$('.filter_tags:eq('+index_group+') b').text(picked.join(','));
			$('.filter_tags:eq('+index_group+')').addClass('opened');
			change_url.push('prm='+picked.join(','));
		}

		if(query.length > 0){
			query = '(collectionid:product'+(idColl == '0'?'>=':'=')+idColl+')&&'+ query.join('&&');
			PDR.Collection.strFilter = '(' + encodeURIComponent( query ) + ')';
		}

		/* Sort */
		if($('.sortBy li.active').length > 0){
			var idColl = $('#collection-page').attr('data-id');
			var sort = $('.sortBy li.active input').attr('data-filter');
			sort = 'sortby=' + sort;
			if (idColl == '0'){
				if(query.length == 0) PDR.Collection.strFilter = '(collectionid:product>='+idColl+')';
			}
			else {
				if(query.length == 0) PDR.Collection.strFilter = '(collectionid:product='+idColl+')';
			}
			PDR.Collection.strFilter += '&' + sort;
			change_url.push('sort_by='+$('.sortBy li.active input').val());

			$('.collection-sortbyfilter .sort-selected').text($('.sortBy li.active input').siblings('label').text());
			$('.btn-sortby-mb .sort-selected').text($('.sortBy li.active input').siblings('label').text());
			$('.filter_tags_sortby b').text($('.sortBy li.active input').siblings('label').text());
			$('.filter_tags_sortby').addClass('opened');
		}

		if($('.layered_filter_tags .filter_tags.opened').length > 0) $('.layered_filter_tags_wrapper').removeClass('d-none');
		else $('.layered_filter_tags_wrapper').addClass('d-none');

		//$('#collection-page .products-grid').html('');
		PDR.Collection.getCollectionItem(1,query.length > 0 || $('.sortBy li.active').length > 0?true:false);

		history.pushState(null, "", window.location.pathname+( change_url.length > 0 || $this.paramTracking.length > 0 ? '?'+change_url.join('&')+$this.paramTracking.join('&') : '') );

		/* Save query string with key is string replace on URL. Target: After refresh with url can quick load result then backup options picked. */
		var logFilter = sessionStorage.getItem('query');
		logFilter = logFilter == null?{}:JSON.parse(logFilter);
		logFilter[change_url.join('&')] = PDR.Collection.strFilter;
		sessionStorage.setItem('query',JSON.stringify(logFilter));
		
		var x = $('#hero-banner').offset().top;
		PDR.Helper.smoothScroll(x-140, 500);
	},
	backUpSidebar: function(){
		var $this = this;
		$.each(paramUrl,function(key,value){

			if(key == 'metal'){
				var metals = paramUrl.metal.split(',');
				metals.map(metal => {
					$('#filter-metal input[value="'+decodeURIComponent(metal)+'"]').prop('checked',true);
				});
				var index_group = $('#filter-metal').parents('.filter_group').index();
				$('.filter_tags:eq('+index_group+') b').text(decodeURIComponent(paramUrl.metal));
				$('.filter_tags:eq('+index_group+')').addClass('opened');
			}
			else if(key == 'type'){
				var types = paramUrl.type.split(',');
				types.map(type => {
					$('#filter-type input[value="'+decodeURIComponent(type)+'"]').prop('checked',true);
				});
				var index_group = $('#filter-type').parents('.filter_group').index();
				$('.filter_tags:eq('+index_group+') b').text(decodeURIComponent(paramUrl.type));
				$('.filter_tags:eq('+index_group+')').addClass('opened');
			}
			else if(key == 'color'){
				var colors = paramUrl.color.split(',');
				colors.map(color => {
					$('#filter-color input[value="'+decodeURIComponent(color)+'"]').prop('checked',true);
				});
				var index_group = $('#filter-color').parents('.filter_group').index();
				$('.filter_tags:eq('+index_group+') b').text(decodeURIComponent(paramUrl.color));
				$('.filter_tags:eq('+index_group+')').addClass('opened');
			}
			else if(key == 'vendor'){
				var vendors = paramUrl.vendor.split(',');
				vendors.map(vendor => {
					$('#filter-vendor input[value="'+decodeURIComponent(vendor)+'"]').prop('checked',true);
				});
				var index_group = $('#filter-vendor').parents('.filter_group').index();
				$('.filter_tags:eq('+index_group+') b').text(decodeURIComponent(paramUrl.vendor));
				$('.filter_tags:eq('+index_group+')').addClass('opened');
			}
			else if(key == 'theme'){
				var themes = paramUrl.theme.split(',');
				themes.map(theme => {
					$('#filter-theme input[value="'+decodeURIComponent(theme)+'"]').prop('checked',true);
				});
				var index_group = $('#filter-theme').parents('.filter_group').index();
				$('.filter_tags:eq('+index_group+') b').text(decodeURIComponent(paramUrl.theme));
				$('.filter_tags:eq('+index_group+')').addClass('opened');
			}
			else if(key == 'size'){
				var sizes = paramUrl.size.split(',');
				sizes.map(size => {
					$('#filter-size input[value="'+decodeURIComponent(size)+'"]').prop('checked',true);
				});
				var index_group = $('#filter-size').parents('.filter_group').index();
				$('.filter_tags:eq('+index_group+') b').text(decodeURIComponent(paramUrl.size));
				$('.filter_tags:eq('+index_group+')').addClass('opened');
			}
			else if(key == 'price'){
				var prices = paramUrl.price.split(',');
				prices.map(price => {
					$('#filter-price input[value="'+decodeURIComponent(price)+'"]').prop('checked',true);
				});
				var index_group = $('#filter-price').parents('.filter_group').index();
				$('.filter_tags:eq('+index_group+') b').text(decodeURIComponent(paramUrl.price));
				$('.filter_tags:eq('+index_group+')').addClass('opened');
			}
			else if(key == 'prm'){
				var prms = paramUrl.prm.split(',');
				prms.map(prm => {
					$('#filter-prm input[value="'+decodeURIComponent(prm)+'"]').prop('checked',true);
				});
				var index_group = $('#filter-prm').parents('.filter_group').index();
				$('.filter_tags:eq('+index_group+') b').text(decodeURIComponent(paramUrl.prm));
				$('.filter_tags:eq('+index_group+')').addClass('opened');
			}
			else if(key == 'sort_by'){
				$('.sortBy li').removeClass('default');
				$('.sortBy li').removeClass('active');
				$('.sortBy input[value="'+paramUrl.sort_by+'"]').parent().addClass('active');
				var sort = $('.sortBy input[value="'+paramUrl.sort_by+'"] + label').text();

				$('.collection-sortbyfilter .sort-selected').text(sort);
				$('.btn-sortby-mb .sort-selected').text(sort);
				
				$('.filter_tags_sortby b').text(sort);
				$('.filter_tags_sortby').addClass('opened');
			}
			else {
				$this.paramTracking.push(key+'='+value);
			}
		});

		if($('.layered_filter_tags .filter_tags.opened').length > 0) $('.layered_filter_tags_wrapper').removeClass('d-none');
	},
	actionFilter: function(){
		/* Apply Filter Picked At Sidebar */
		//$('.filter_controls .u-btn.u-btn--primary').on('click',function(){
		//PDR.Collection.stringFilter();
		//});


		/* Checklist */
		$(document).on('click','.checkbox-list li > input',function() {
			$(this).parent().toggleClass('active');
			//if ($(window).width() >= 992) 
			PDR.Collection.stringFilter();
			
			var indexTitle = $(this).parents('.filter_group').index();
			if ($(this).parents('.filter_group').find('input:checked').length > 0) {
				var textFilter = [];
				$(this).parents('.filter_group').find('input:checked').each(function() {
					var textVal = $(this).siblings('label').html();
					textFilter.push(textVal);
				});
				$('.filter_tags:eq(' + indexTitle + ') b').html(textFilter.join(',')).parent().addClass('opened');
			} 
			else {
				$('.filter_tags:eq(' + indexTitle + ') b').html('').parent().removeClass('opened');
			}

			if ($('.checkbox-list li.active').length == 0) {
				$('.layered_filter_tags_wrapper').addClass('d-none');
			}
			else {
				$('.layered_filter_tags_wrapper').removeClass('d-none');
			}
		
		});
		
		/* Sort */
		$('input[name="cfb-sort-input"]').on('change',function(){
			$('.sortBy li').removeClass('default');
			$('.sortBy li').removeClass('active');
			$(this).parent().addClass('active');
			PDR.Collection.stringFilter();
		});

		/* Remove Filter At Div Summary */
		$('.filter_tags_remove').on('click',function(){
			var ind_tag = $(this).parent().index();
			if($(this).parent().hasClass('filter_tags_sortby')){
				$('.sortBy li').removeClass('active');
				$('.sortBy li input').prop('checked',false);
				$('.btn-sortby-mb .sort-selected').text('Sản phẩm nổi bật');
				$('.collection-sortbyfilter .sort-selected').text('Sản phẩm nổi bật');
				$('.sortBy li input[value="manual"]').parents('li').addClass('default');
			}
			else{
				$('.filter_group:eq('+ind_tag+') input:checked').click();
			}

			$(this).parent().removeClass('opened');
			PDR.Collection.stringFilter();
		});

		/* Remove All At Sidebar */
		$('.filter_tags_remove_all').on('click',function(){
			$('.filter_group input[type="checkbox"]').prop('checked',false);
			$('.layered_filter_tags .filter_tags').removeClass('opened');

			$('.sortBy input').prop('checked',false);
			$('.sortBy li').removeClass('active');
			$('.btn-sortby-mb .sort-selected').text('Sản phẩm nổi bật');
			$('.collection-sortbyfilter .sort-selected').text('Sản phẩm nổi bật');
			$('.sortBy li input[value="manual"]').parents('li').addClass('default');

			PDR.Collection.stringFilter();
			$('body').removeClass('open-overlay open-noscroll open-sidebar-filter');
		});
	},
	loadMore: function(){
		$(document).on('click','#js-btn-more',function(e){
			if($('.product-loop').length > 0){
				if (PDR.Collection.allowLoadMore ) {
					var total = Number($("#js-btn-more").attr('data-pages'));
					var current = Number($("#js-btn-more").attr('data-current'));
					if(current + 1 <= total){
						console.log('a')
						PDR.Collection.allowLoadMore = false;
						if(PDR.Collection.strFilter != ''){
							PDR.Collection.getCollectionItem(current + 1,true);
						}
						else{
							PDR.Collection.getCollectionItem(current + 1);
						}
					}
				}
			}
		});
	}
}
PDR.CollectionSelect = {
	init: function() {
		var that = this;
		that.zoneCollection();  
		that.Bundle();
	},
	zoneCollection: function(){
		var id0 = $('#slider-collection-bundle').attr('data-id');
		var titleColl0 = $('#slider-collection-bundle').attr('data-title');
		var urlColl0   = $('#slider-collection-bundle').attr('data-handle');
		
		var id1 = $('#step-1--list').attr('data-id');
		var titleColl1 = $('#step-1--list').attr('data-title');
		var urlColl1   = $('#step-1--list').attr('data-handle');

		if($(window).width() >= 1100){
			PDR.Global.getItemSlide(id0,titleColl0,urlColl0,1,20,'#slider-collection-bundle',function(){
				var swiper0 = new Swiper("#slider-collection-bundle .swiper", {
					loop: true,
					slidesPerView: 5,
					slidesPerGroup: 5,
					spaceBetween: 2,
					speed: 1000,
					centeredSlides: false,
					navigation: {
						nextEl: "#slider-collection-bundle .swiper-button-next",
						prevEl: "#slider-collection-bundle .swiper-button-prev",
					},
				}); 
			});
			PDR.Global.getItemSlide(id1,titleColl1,urlColl1,1,20,'#step-1--list',function(){
				var swiper1 = new Swiper("#step-1--list .swiper", {
					loop: true,
					slidesPerView: 3,
					slidesPerGroup: 3,
					spaceBetween: 2,
					speed: 1000,
					centeredSlides: false,
					navigation: {
						nextEl: "#step-1--list .swiper-button-next",
						prevEl: "#step-1--list .swiper-button-prev",
					},
				}); 
			});
		}
		else {
			PDR.Global.getItemSlide(id0,titleColl0,urlColl0,1,20,'#slider-collection-bundle');
			PDR.Global.getItemSlide(id1,titleColl1,urlColl1,1,20,'#step-1--list');
		}
		
	},
	Bundle: function(){
		function buildMiniCart(){
			var html = '';
			var origin_price = 0;
			var bundle_price = 0;
			var bundle_list = [];
			cartJS.items.map(x => {
				if(x.properties != null && x.properties.hasOwnProperty('isBundle')){
					origin_price += x.line_price_orginal;
					bundle_price += x.line_price;
					bundle_list.push(x);
				}
			});

			$('.minicart-price').html(Haravan.formatMoney(bundle_price, window.shop.moneyFormat));
			if(origin_price > bundle_price){
				$('.minicart-price-origin').html(Haravan.formatMoney(origin_price, window.shop.moneyFormat)).removeClass('d-none');
			}
			else{
				$('.minicart-price-origin').html('').addClass('d-none');
			}

			if(bundle_list.length > 0){
				bundle_list.map((product,index) => {
					html += '<div class="item-mini">';
					html += 	'<div class="box-media" data-qty="&times;'+product.quantity+'">';
					html +=			'<div class="remove-item" data-line="'+index+'" data-id="'+product.id+'">';
					html +=				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" role="img" aria-label="icon cross"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.222 9.922a.1.1 0 010 .142L.08 19.206a.1.1 0 000 .14l.56.572a.1.1 0 00.141 0l9.148-9.147a.1.1 0 01.142 0l9.142 9.142a.1.1 0 00.14 0l.572-.56a.1.1 0 000-.142l-9.147-9.147a.1.1 0 010-.142L19.92.78a.1.1 0 000-.14l-.56-.572a.1.1 0 00-.142 0l-9.147 9.147a.1.1 0 01-.142 0L.787.073a.1.1 0 00-.14 0l-.572.56a.1.1 0 000 .141l9.147 9.148z" fill="#27251F"></path></svg>';
					html +=			'</div>';
					html += 		'<a href="'+product.url+'">';
					html += 			'<img src="'+product.image+'" alt="'+product.title+'">';
					html += 		'</a>';
					html += 	'</div>';
					html += '</div>';
				});
				$('.minicart-left .js-render-item').html(html).removeClass('minicart-empty');
			}
			else {
				html = '<div class="empty-cart">Giỏ hàng của bạn trống!</div>';
				$('.minicart-left .js-render-item').html(html).addClass('minicart-empty');
			}

		}
		buildMiniCart();
		
		$(document).on('click', '.add-charm', function(e){
			e.preventDefault();
			var id = $(this).attr('data-variantid'), quantity = 1;
			let sku = $(this).attr('data-sku');
			let flagLimitSku = PDR.Helper.checkLimitSku(sku, 1);
			if(!flagLimitSku) return PDR.Helper.SwalWarning("Xin lỗi bạn!", "Chương trình chỉ áp dụng tối đa 2 sản phẩm", "error",false,false,4000);
			
			var tagCTKM = $(this).parents('.product-loop-wrap').find('.product-loop-labels').attr('data-ctkm');
			var data_add = {id:id, quantity:quantity, properties: { 'isBundle': true, 'CTKM': tagCTKM }};
			var param = {
				url: '/cart/add.js',
				type: 'POST',
				data: data_add,
				dataType: 'JSON',
				async: false,
				success: function(data){
					PDR.GA4.GTMAddToCart(data);
					$.get('/cart.js').done(function(cart){
						cartJS = cart;
						PDR.Helper.getMiniCart();
						buildMiniCart();
						PDR.Helper.SwalWarning("Thông báo", "Thêm vào giỏ thành công", "success",false,false,4000);
					});
				},
				error: function(x,y){
					PDR.Helper.SwalWarning("Xin lỗi bạn!", "Có trục trặc về tồn kho!", "error",false,false,4000);
				}
			}
			$.ajax(param);
		});
		$(document).on('click', '.remove-item', function(){
			var line = parseInt($(this).attr('data-line')) + 1;
			$.ajax({
				type: 'POST',
				url: '/cart/change.js',	
				data:'quantity=0&line=' + line,	
				async: false,
				dataType: 'json',
				success: function(data) {		
					$.get('/cart.js').done(function(cart){
						cartJS = cart;
						PDR.Helper.getMiniCart();
						buildMiniCart();
						PDR.Helper.SwalWarning("Thông báo", "Đã xóa sản phẩm", "success",false,false,4000);
					});
				}
			});
		});
		$('.process-checkout').click(function(){
			window.location.href = '/cart';
		});
	}
}
PDR.Customers = {
	dataOrderGiftPE: {},
	dataOrderDiscountPE: {},
	totalPageOrder: 0,
	init: function(){
		var that = this;
		if(template.indexOf('login') !== -1){
			that.initLogin();
			PDR.Helper.passwordVisibility();
		}
		if(template.indexOf('register') !== -1){
			that.initRegister();
			PDR.Helper.passwordVisibility();
		}
		if(template.indexOf('reset') !== -1){
			PDR.Helper.passwordVisibility();
		}
		if(template === 'customers[account].histories'){
			that.initHistory.init();
		}
		if(template === 'customers[order]'){
			that.initOrderDetail();
		}
		if(template === 'customers[addresses]'){
			that.initAddresses.init();
		}
		if(template.indexOf('wishlist')){
			that.wishlist();
		}
		if(template === 'customers[account]'){
			that.initAddresses.init();
			that.initUpdate.init();
			PDR.Customers.initHistory.getOrders('profile');
		}
	},
	initLogin: function(){
		$(document).ready(function(){
			if(window.location.hash == '#recover'){
				$('#password-reset').trigger('click');
			}
		});
		$(document).on('click','#password-reset',function(e){
			e.preventDefault();
			$('#modal-account-recover').modal();
		});
	},
	initRegister: function(){},
	initUpdate: {
		init: function(){
			var that = this;
			that.getProvinceAndDistrict();
			that.customerUpdate();
		},
		getProvinceAndDistrict: function(){
			/* Get list countries */
			countries = addressData.countries;
			let countryId = 241;
			let provinces = addressData[countryId];

			$.each(provinces.provinces, function(i, data) {
				$('select[name="address[province]"]').append('<option value="' + data.n + '" data-province="'+ data.i + '" data-code="'+ data.c +'">' + data.n + '</option>');
			});
			$(document).on('change','select[name="address[province]"]',function(e){
				let provinceName = $(this).val();
				let	provinceId = $(this).find('option[value="'+provinceName+'"]').attr('data-province');
				let	provinceCode = $(this).find('option[value="'+provinceName+'"]').attr('data-code');
				if($('#customer_update select[name="address[district]"] option').length > 1){ 
					$('#customer_update select[name="address[district]"] option:not(:first-child)').remove();
				}
				/*if($('#customer_update select[name="address[ward]"] option').length > 1){
					$('#customer_update select[name="address[ward]"] option:not(:first-child)').remove();
				}*/
				if(provinceName != '' && countryId == 241){
					async function getDistrict(){
						districts = await addressData.getProvince(countryId, provinceId);
						if(!jQuery.isEmptyObject(districts)){
							if($('#customer_update select[name="address[district]"] option').length > 1){
								$('#customer_update select[name="address[district]"] option:not(:first-child)').remove();
							}
							$.each(districts.districts,function(indx,vlue){
								if(provinceId === '50') {
									if (vlue.n === 'Quận 2' || vlue.n === 'Quận 9' || vlue.n === 'Quận Thủ Đức') {
										return;
									}
								}
								$('#customer_update select[name="address[district]"]').append('<option data-district="'+vlue.i+'" value="'+vlue.n+'" data-code="'+vlue.c+'">'+vlue.n+'</option>');					
							});
						}
					}
					getDistrict();
				}
			});
			$(document).on('change','select[name="address[district]"]',function(e){
				let provinceName = $('#customer_update select[name="address[province]"]').val(),
						districtName = $(this).val();
				let provinceId = 		$('#customer_update select[name="address[province]"] option[value="'+provinceName+'"]').attr('data-province'),
						provinceCode = 	$('#customer_update select[name="address[province]"] option[value="'+provinceName+'"]').attr('data-code'),
						districtId = 		$(this).find('option[value="'+districtName+'"]').attr('data-district'),
						districtCode = 	$(this).find('option[value="'+districtName+'"]').attr('data-code');

				/*if($('#customer_update select[name="address[ward]"] option').length > 1){
					$('#customer_update select[name="address[ward]"] option:not(:first-child)').remove();
				}
				if(districtId != '' && districtId != undefined ){
					async function getWard(){
						districts = await addressData.getProvince(countryId, provinceId);
						if(!jQuery.isEmptyObject(districts)){
							let wards = districts[districtId].wards;
							if(wards.length > 0){
								if($('#customer_update select[name="address[ward]"] option').length > 1){
									$('#customer_update select[name="address[ward]"] option:not(:first-child)').remove();
								}

								$.each(wards,function(indx,vlue){
									$('#customer_update select[name="address[ward]"]').append('<option data-ward="'+vlue.i+'" value="'+vlue.n+'" data-code="'+vlue.i+'">'+vlue.n+'</option>');
								});
							}
						}
					}
					getWard();
				}*/
			});
		},
		customerUpdate: function() {
			$(document).on('click','#js-profile-edit',function(e){
				e.preventDefault();
				$('#updateProfileModal').modal();
			});
			$('#birthday').datepicker({
				changeMonth: true,
				changeYear: true,
				dateFormat: "mm/dd/yy",
				maxDate: new Date()
			});
			$('#customer_update').submit(function(e){
				e.preventDefault();
				var last_name  = $(this).find('input[name="last_name"]').val(),
						first_name = $(this).find('input[name="first_name"]').val(),
						gender     =  $(this).find('[name="gender"]:checked').val(),
						birthday   = $(this).find('input[name="birthday"]').val(),
						email      = $(this).find('input[name="email"]').val(),
						phone 		 = $(this).find('input[name="phone"]').val();
				var allowSubmit = true;

				//Kiểm tra đúng định dạng
				if(!PDR.Helper.checkemail(email)){
					$('#customer_update').find('input[name="email"]').parents('.form-group').addClass('is-invalid');
					allowSubmit = false;
				}
				else $('#customer_update').find('input[name="email"]').parents('.form-group').removeClass('is-invalid');

				if(!PDR.Helper.checkPhone(phone)){
					$('#customer_update').find('input[name="phone"]').parents('.form-group').addClass('is-invalid');
					allowSubmit = false;
				}
				else $('#customer_update').find('input[name="phone"]').parents('.form-group').removeClass('is-invalid');

				if(birthday != ''){
					birthday = birthday.split('/');
					birthday = birthday[2]+'-'+birthday[1]+'-'+birthday[0];
				}
				if(allowSubmit){
					var data = {
						"email": email,
						"phone": phone,
						"first_name": first_name,
						"last_name": last_name,
						"accepts_marketing": false,
						"gender": parseInt(gender),
						"birthday": birthday+"T00:00:00.000Z"
					};
					$.ajax({
						url: '/apps/smes/auth/api/customers/update',
						type: 'POST',
						data: JSON.stringify(data),
						contentType: 'application/json',
						dataType: 'JSON',
						success: function(data){
							if(data.error){
								switch(data.code) {
									case 'ERR_OMNI': 
										PDR.Helper.SwalWarning(data.message,'Vui lòng kiểm tra lại thông tin!','warning',false,false,4000);
										break;
									case 'ERR_UNEXPECTED':
										PDR.Helper.SwalWarning(data.message,'Có lỗi xảy ra','warning',false,false,4000);
										break;
									case 'ERR_CUSTOMER_NOT_FOUND':
										PDR.Helper.SwalWarning('Khách hàng không tồn tại','','warning',false,false,4000);
										break;
									case 'ERR_EMAIL_NOT_CHANGE':
										PDR.Helper.SwalWarning('Không thể thay đổi email','','warning',false,false,4000);
										break;
									case 'ERR_INVALID_EMAIL':
										PDR.Helper.SwalWarning('Email không hợp lệ','','warning',false,false,4000);
										break;
									case 'ERR_EXISTED_EMAIL':
										PDR.Helper.SwalWarning('Email đã được sử dụng','','warning',false,false,4000);
										break;
									case 'ERR_PHONE_NOT_CHANGE':
										PDR.Helper.SwalWarning('Không thể thay đổi số điện thoại','','warning',false,false,4000);
										break;
									case 'ERR_INVALID_PHONE':
										PDR.Helper.SwalWarning('Số điện thoại không hợp lệ','','warning',false,false,4000);
										break;
									case 'ERR_EXISTED_PHONE':
										PDR.Helper.SwalWarning('Số điện thoại đã được sử dụng','','warning',false,false,4000);
										break;	
									case 'ERR_ REQUIRED_FIELD':
										PDR.Helper.SwalWarning('Vui lòng nhập thông tin bắt buộc','','warning',false,false,4000);
										break;
									case 'ERR_MAX_LENGTH_EMAIL':
										PDR.Helper.SwalWarning('Email không được vượt quá 50 ký tự','','warning',false,false,4000);
										break;
									case 'ERR_MAX_LENGTH_FIRST_NAME':
										PDR.Helper.SwalWarning('Tên không được vượt quá 100 ký tự','','warning',false,false,4000);
										break;
									case 'ERR_MAX_LENGTH_LAST_NAME':
										PDR.Helper.SwalWarning('Họ không được vượt quá 100 ký tự','','warning',false,false,4000);
										break;
									case 'ERR_MAX_LENGTH_FIRST_NAME':
										PDR.Helper.SwalWarning('Tên không được vượt quá 100 ký tự','','warning',false,false,4000);
										break;
									case 'ERR_INVALID_ACCEPTS_MARKETING':
										PDR.Helper.SwalWarning('Nhận email quảng cáo không hợp lệ','','warning',false,false,4000);
										break;
								}
								//PDR.Helper.SwalWarning(data.message,'Vui lòng kiểm tra lại thông tin!','warning',false,false,4000);
							}
							else{
								Swal.fire({
									title: '',
									text: 'Tài khoản đã được cập nhật thành công!',
									icon: 'success',
									showCancelButton: false,
									showConfirmButton: false,
									timer: 3000,
								}).then((result) => {
									window.location.reload(); 
								})
							}
						}
					});
				}
				else{}
			});
		}
	},
	initHistory: {
		init: function(){
			var that = this;
			that.getOrders('history');
			that.actions();
		},
		getOrders: function(view){
			function renderHtmlOrderMini(data) {
				var status = '';
				var status_icon = '';
				var status_text = '';
				if(data.pos_order_status == 'pos_cancel' || data.pos_order_status == 'pos_cancel_refund' || data.pos_order_status == 'pos_cancel_restock'){
					status = 'cancel';
					status_icon = '';
					status_text = 'Đã huỷ';
				}
				else if(data.pos_order_status == 'pos_pending' || data.pos_order_status == 'pos_user_assigned' || data.pos_order_status == 'pos_stock_on_hand'){
					status = 'new';
					status_icon = '';
					status_text = 'Mới';
				} 
				else if(data.pos_order_status == 'pos_confirmed'){
					status = 'processing';
					status_icon = '';
					status_text = 'Đang xử lý';
				}
				else if(data.pos_order_status == 'pos_request_cancel'){
					status = 'processing';
					status_icon = '';
					status_text = 'Yêu cầu huỷ';
				}
				else if(data.pos_order_status == 'pos_store_assigned'){
					status = 'processing';
					status_icon = '';
					status_text = 'Chuyển chi nhánh';
				}
				else if(data.pos_order_status == 'pos_output'){
					status = 'processing';
					status_icon = '';
					status_text = 'Đã giao cho ĐVVC';
				}
				else if(data.pos_order_status == 'pos_delivering_nvc' || data.pos_order_status == 'pos_delivering_self'){
					status = 'delivering';
					status_icon = '';
					status_text = 'Đang vận chuyển';
					if (data.fulfillments.length > 0){
						status_text = data.fulfillments[0].carrier_status_name;
						status = data.fulfillments[0].carrier_status_code;
					}
				}
				else if(data.pos_order_status == 'pos_complete'){
					status = 'complete';
					status_icon = '';
					status_text = 'Giao hàng thành công';
				}

				var html = '';
				html += 		'<div class="order-item" data-search="'+data.order_number+'" data-stt="'+status+'">';
				html += 			'<div class="order-item-head">';
				html += 				'<div class="stt-order" data-stt="'+status+'">';
				html +=						status_icon+'<span>'+status_text+'</span>';
				html += 				'</div>';
				html += 				'<div class="code-order"><a href="/account/orders/'+data.cart_token+'">'+data.order_number+'</a></div>';
				html += 			'</div>';
				html += 			'<div class="order-item-body" data-count="'+data.line_items.length+'">';
				html += 			'<div class="order-scroll">';
				for(var j = 0; j < data.line_items.length; j++) {
					html += 				'<div class="order-item-line '+((j > 1) ? 'd-none' : '' )+'">';
					html += 						'<div class="img-line">';
					html += 							'<a href="/account/orders/'+data.cart_token+'">';
					if ( data.line_items[j].image == null ) { 
						html +=								'<img src="//theme.hstatic.net/200000636033/1001033735/14/no-image.jpg" alt="'+data.line_items[j].title+'" />';
					}
					else {
						html +=								'<img src="'+data.line_items[j].image.src+'" alt="'+data.line_items[j].title+'" />';
					}
					html +=								'</a>';
					html += 							'<div class="qty-line">x'+data.line_items[j].quantity+'</div>';
					html += 						'</div>';
					html += 				'</div>';
				}
				html += 			'</div>';
				html += 			'</div>';

				html += 					'<div class="order-item-foot text-right">';
				html += 						'<span>Tổng: </span>';
				html += 						'<span>'+ PDR.Helper.moneyFormat(data.total_price,'₫') +'</span>';
				html += 					'</div>';
				html += 		'</div>';
				return html;	 
			};
			function renderHtmlOrder(data) {
				var status = '';
				var status_icon = '';
				var status_text = '';
				if(data.pos_order_status == 'pos_cancel' || data.pos_order_status == 'pos_cancel_refund' || data.pos_order_status == 'pos_cancel_restock'){
					status = 'cancel';
					status_icon = '';
					status_text = 'Đã huỷ';
				}
				else if(data.pos_order_status == 'pos_pending' || data.pos_order_status == 'pos_user_assigned' || data.pos_order_status == 'pos_stock_on_hand'){
					status = 'new';
					status_icon = '';
					status_text = 'Mới';
				} 
				else if(data.pos_order_status == 'pos_confirmed'){
					status = 'processing';
					status_icon = '';
					status_text = 'Đang xử lý';
				}
				else if(data.pos_order_status == 'pos_request_cancel'){
					status = 'processing';
					status_icon = '';
					status_text = 'Yêu cầu huỷ';
				}
				else if(data.pos_order_status == 'pos_store_assigned'){
					status = 'processing';
					status_icon = '';
					status_text = 'Chuyển chi nhánh';
				}
				else if(data.pos_order_status == 'pos_output'){
					status = 'processing';
					status_icon = '';
					status_text = 'Đã giao cho ĐVVC';
				}
				else if(data.pos_order_status == 'pos_delivering_nvc' || data.pos_order_status == 'pos_delivering_self'){
					status = 'delivering';
					status_icon = '';
					status_text = 'Đang vận chuyển';
					if (data.fulfillments.length > 0){
						status_text = data.fulfillments[0].carrier_status_name;
						status = data.fulfillments[0].carrier_status_code;
					}
				}
				else if(data.pos_order_status == 'pos_complete'){
					status = 'complete';
					status_icon = '';
					status_text = 'Giao hàng thành công';
				}

				var html = '';
				html += 		'<div class="history-item" data-search="'+data.order_number+'" data-stt="'+status+'">';
				html += 			'<div class="history-item-head">';
				html += 				'<div class="stt-order" data-stt="'+status+'">';
				html +=						status_icon+'<span>'+status_text+'</span>';
				html += 				'</div>';
				html += 				'<div class="code-order">'+data.order_number+'</div>';
				html += 			'</div>';
				html += 			'<div class="history-item-body" data-count="'+data.line_items.length+'">';
				for(var j = 0; j < data.line_items.length; j++) {
					html += 				'<div class="history-item-line '+((j > 1) ? 'd-none' : '' )+'">';
					html += 					'<div class="left">';
					html += 						'<div class="img-line">';
					if ( data.line_items[j].image == null ) {
						html +=							'<img src="//theme.hstatic.net/200000636033/1001033735/14/no-image.jpg" alt="'+data.line_items[j].title+'" />';
					}
					else {
						html +=							'<img src="'+data.line_items[j].image.src+'" alt="'+data.line_items[j].title+'" />';
					}
					html += 							'<div class="qty-line">x'+data.line_items[j].quantity+'</div>';
					html += 						'</div>';
					html += 						'<div class="info-line">';
					html += 							'<div class="name-line">'+data.line_items[j].title+'</div>';
					if ( data.line_items[j].custom_total_discount > 0 ) {
						html += 							'<div class="discount-line">• Giảm giá '+PDR.Helper.moneyFormat(data.line_items[j].custom_total_discount,'₫')+'</div>';
					}
					html += 						'</div>';
					html += 					'</div>';
					html += 					'<div class="right">';
					html += 						'<div class="text-right">';
					html += 							'<div class="price-line">'+ PDR.Helper.moneyFormat(data.line_items[j].custom_total_price,'₫') +'</div>';
					html += 							'<div class="price-original-line d-none">'+ PDR.Helper.moneyFormat(data.line_items[j].custom_total_price_original,'₫') +'</div>';
					html += 						'</div>';
					html += 					'</div>';
					html += 				'</div>';
				}
				html += 			'</div>';
				html += 			'<div class="history-item-foot">';
				if (data.line_items.length > 2) {
					html += 				'<div class="more-line">Xem thêm <span>'+(data.line_items.length - 2)+'</span> sản phẩm</div>';
				}
				html += 					'<div class="total-order text-right">';
				html += 						'<span>Tổng tiền: </span>';
				html += 						'<span>'+ PDR.Helper.moneyFormat(data.total_price,'₫') +'</span>';
				html += 					'</div>';
				html += 					'<div class="view-order text-right">';
				html += 						'<a href="/account/orders/'+data.cart_token+'" data-id="'+data._id+'" title="Xem chi tiết">Xem chi tiết</a>';
				html += 					'</div>';
				html += 			'</div>';
				html += 		'</div>';
				return html;	 
			};
			function renderHtmlEmpty(){
				var htmlEmpty = '<div class="empty">';
				htmlEmpty += 			'Bạn chưa có đơn hàng nào.';
				htmlEmpty += 			'<a href="/" class="a-line"> Tiếp tục mua hàng!</a>';
				htmlEmpty += 		'</div>';
				return htmlEmpty;	 
			} 
			function loadOrders(page){
				if (view == 'profile'){
					var limit = 2;
				}
				else {
					var limit = 10;
				}
				var paramUrl =  '/apps/smes/auth/api/orders/listbycustomer?page='+page+'&limit='+limit;
				$.get(paramUrl).done(function(result){	
					if (result.total > 0){
						$('.js-render-history').html('');

						if (view == 'profile'){
							var html = '<div class="order-title">Đơn hàng gần đây</div>';
							for (var i=0, l=result.items.length; i<l; i++){
								html += renderHtmlOrderMini(result.items[i]);
							}
							$('.js-render-history').html(html);
						}
						else {
							PDR.Customers.totalPageOrder = Math.ceil(result.total / limit);
							if(page < PDR.Customers.totalPageOrder){
								$('.loadmore-history').find('span').html(result.total - page * limit);
								$('.loadmore-history').find('button').attr('data-current',page+1);
								$('.loadmore-history').removeClass('d-none');
							}
							else{
								$('.loadmore-history').addClass('d-none');
							}
							$('.status-list .status-item[data-stt="all"] .count').html('('+result.total+')');
							for (var i=0, l=result.items.length; i<l; i++){
								$('.js-render-history').append(renderHtmlOrder(result.items[i]));
							}
						}
					}
					else {
						$('.js-render-history').html('');
						$('.js-render-history').append(renderHtmlEmpty);
					}
				});
			}
			loadOrders(1);
			
			$(document).on('click','#btn-loadmore',function(e){
				e.preventDefault();
				var page = Number($(this).attr('data-current'));
				loadOrders(page);
			});
		},
		actions: function(){
			$(document).on('click','.more-line',function(e){
				e.preventDefault();
				var count = $(this).find('span').html();
				if ($(this).parents('.history-item').find('.history-item-body').hasClass('opened')) {		
					$(this).removeClass('btn-closemore').addClass('btn-viewmore').html('Xem thêm <span>'+count+'</span> sản phẩm');
					$(this).parents('.history-item').find('.history-item-line:not(:nth-child(1)):not(:nth-child(2))').addClass('d-none');
					$(this).parents('.history-item').find('.history-item-body').removeClass('opened');
				} 
				else {
					$(this).parents('.history-item').find('.history-item-body').addClass('opened');
					$(this).removeClass('btn-viewmore').addClass('btn-closemore').html('Ẩn bớt <span>'+count+'</span> sản phẩm');
					$(this).parents('.history-item').find('.history-item-line').removeClass('d-none');
				}
			}); 
		}
	},
	initOrderDetail: function(){
		function renderTime(dt){
			var time = new Date(dt);
			var _date = (time.getDate() < 10 ? ('0' + time.getDate()):time.getDate());
			var _month = time.getMonth()+1;
			_month = _month < 10 ? ('0' + _month): _month;
			
			time  = (time.getHours() < 10 ? ('0' + time.getHours()): time.getHours()) + ':' + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()) + ' - '+_date+'.'+_month+'.'+time.getFullYear();
			
			return time;
		};
		function renderHtmlTracking(data){
			var icon_x = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="path-1-inside-1" fill="white"><path d="M5.47027 6L0.116464 0.646198C-0.236691 0.293042 0.293042 -0.236691 0.646198 0.116464L6 5.47027L11.3538 0.116464C11.707 -0.236691 12.2367 0.293042 11.8835 0.646198L6.52973 6L11.8835 11.3538C12.2367 11.707 11.707 12.2367 11.3538 11.8835L6 6.52973L0.646198 11.8835C0.293042 12.2367 -0.236691 11.707 0.116464 11.3538L5.47027 6Z"></path></mask><path d="M5.47027 6L6.17737 6.70711L6.88448 6L6.17737 5.29289L5.47027 6ZM0.116464 0.646198L-0.590642 1.3533L0.116464 0.646198ZM0.646198 0.116464L1.3533 -0.590642L0.646198 0.116464ZM6 5.47027L5.29289 6.17737L6 6.88448L6.70711 6.17737L6 5.47027ZM11.3538 0.116464L10.6467 -0.590642V-0.590642L11.3538 0.116464ZM11.8835 0.646198L12.5906 1.3533V1.3533L11.8835 0.646198ZM6.52973 6L5.82263 5.29289L5.11552 6L5.82263 6.70711L6.52973 6ZM11.8835 11.3538L12.5906 10.6467L11.8835 11.3538ZM11.3538 11.8835L10.6467 12.5906L11.3538 11.8835ZM6 6.52973L6.70711 5.82263L6 5.11552L5.29289 5.82263L6 6.52973ZM0.646198 11.8835L1.3533 12.5906H1.3533L0.646198 11.8835ZM0.116464 11.3538L-0.590642 10.6467H-0.590642L0.116464 11.3538ZM6.17737 5.29289L0.823571 -0.0609092L-0.590642 1.3533L4.76316 6.70711L6.17737 5.29289ZM0.823571 -0.0609092C0.927161 0.0426804 1.01094 0.218208 0.99886 0.423499C0.98823 0.604207 0.908018 0.739124 0.823571 0.823571C0.739124 0.908018 0.604207 0.98823 0.423499 0.99886C0.218208 1.01094 0.0426804 0.927161 -0.0609092 0.823571L1.3533 -0.590642C1.07314 -0.87081 0.698959 -1.0208 0.306055 -0.997689C-0.0622675 -0.976023 -0.373762 -0.807523 -0.590642 -0.590642C-0.807523 -0.373762 -0.976023 -0.0622675 -0.997689 0.306055C-1.0208 0.698959 -0.87081 1.07314 -0.590642 1.3533L0.823571 -0.0609092ZM-0.0609092 0.823571L5.29289 6.17737L6.70711 4.76316L1.3533 -0.590642L-0.0609092 0.823571ZM6.70711 6.17737L12.0609 0.823571L10.6467 -0.590642L5.29289 4.76316L6.70711 6.17737ZM12.0609 0.823571C11.9573 0.927161 11.7818 1.01094 11.5765 0.99886C11.3958 0.98823 11.2609 0.908019 11.1764 0.823572C11.092 0.739125 11.0118 0.604208 11.0011 0.423499C10.9891 0.218209 11.0728 0.0426806 11.1764 -0.0609092L12.5906 1.3533C12.8708 1.07314 13.0208 0.698959 12.9977 0.306054C12.976 -0.0622683 12.8075 -0.373763 12.5906 -0.590643C12.3738 -0.807523 12.0623 -0.976023 11.6939 -0.997689C11.301 -1.0208 10.9269 -0.87081 10.6467 -0.590642L12.0609 0.823571ZM11.1764 -0.0609093L5.82263 5.29289L7.23684 6.70711L12.5906 1.3533L11.1764 -0.0609093ZM5.82263 6.70711L11.1764 12.0609L12.5906 10.6467L7.23684 5.29289L5.82263 6.70711ZM11.1764 12.0609C11.0728 11.9573 10.9891 11.7818 11.0011 11.5765C11.0118 11.3958 11.092 11.2609 11.1764 11.1764C11.2609 11.092 11.3958 11.0118 11.5765 11.0011C11.7818 10.9891 11.9573 11.0728 12.0609 11.1764L10.6467 12.5906C10.9269 12.8708 11.301 13.0208 11.6939 12.9977C12.0623 12.976 12.3738 12.8075 12.5906 12.5906C12.8075 12.3738 12.976 12.0623 12.9977 11.6939C13.0208 11.301 12.8708 10.9269 12.5906 10.6467L11.1764 12.0609ZM12.0609 11.1764L6.70711 5.82263L5.29289 7.23684L10.6467 12.5906L12.0609 11.1764ZM5.29289 5.82263L-0.0609093 11.1764L1.3533 12.5906L6.70711 7.23684L5.29289 5.82263ZM-0.0609092 11.1764C0.0426806 11.0728 0.218209 10.9891 0.423499 11.0011C0.604208 11.0118 0.739125 11.092 0.823572 11.1764C0.908019 11.2609 0.98823 11.3958 0.99886 11.5765C1.01094 11.7818 0.927161 11.9573 0.823571 12.0609L-0.590642 10.6467C-0.87081 10.9269 -1.0208 11.301 -0.997689 11.6939C-0.976023 12.0623 -0.807523 12.3738 -0.590643 12.5906C-0.373763 12.8075 -0.0622683 12.976 0.306054 12.9977C0.698959 13.0208 1.07314 12.8708 1.3533 12.5906L-0.0609092 11.1764ZM0.823571 12.0609L6.17737 6.70711L4.76316 5.29289L-0.590642 10.6467L0.823571 12.0609Z" mask="url(#path-1-inside-1)"></path></svg>';
			var icon_check = '<svg width="19" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.2744 0.47078L6.69658 10.1165L2.72738 6.11917C2.42795 5.81773 2.02188 5.64842 1.59851 5.6485C1.17513 5.64857 0.769121 5.81802 0.469801 6.11957C0.170482 6.42112 0.00236659 6.83007 0.00244143 7.25645C0.00251627 7.68283 0.170775 8.09171 0.470201 8.39315L5.56799 13.5271C5.86735 13.8285 6.2733 13.9978 6.69658 13.9978C7.11986 13.9978 7.52582 13.8285 7.82517 13.5271L18.534 2.74155C18.8247 2.43835 18.9856 2.03226 18.982 1.61075C18.9784 1.18923 18.8105 0.786018 18.5145 0.487952C18.2186 0.189885 17.8182 0.0208135 17.3996 0.0171506C16.9811 0.0134878 16.5779 0.175527 16.2768 0.468369L16.2744 0.47078Z" fill="white"/></svg>';

			var htmlFinal = '<div class="box" id="order-box-0">';
			var htmlHead = '<div class="tracking-w d-none">';
			htmlHead += 		'<ul class="tracking-head">';
			htmlHead += 			'<li class="tracking_quantity"><span>'+data.line_items.length+'</span> Sản phẩm</li>';
			htmlHead += 			'<li class="tracking_orderid">Đơn hàng - <span>'+data.name+'</span></li>';
			htmlHead += 			'<li class="tracking_date_buy">Ngày mua: <span>'+renderTime(data.created_at)+'</span></li>';
			htmlHead += 			'<li class="tracking_phone d-none">Số điện thoại: <span>'+data.customer.phone+'</span></li>';
			htmlHead += 		'</ul>';
			htmlHead += 	 '</div>';

			var htmlBody = '<div class="collapse-box__body">';
			htmlBody += 		'<div class="order-tracking" id="odt-0">';
			htmlBody += 			'<div class="order-tracking-wrap">';
			if(data.pos_order_status == 'pos_cancel'){
				htmlBody += 			'<div class="ort-block active" id="ort-canceled">';
				htmlBody += 				'<div class="ort-block-circle">';
				htmlBody += 					'<svg viewBox="0 0 42 50" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40"><path d="M27.7932185,-1.42108547e-13 C31.5753806,-1.42108547e-13 34.6520518,3.07705189 34.6520518,6.85921402 L34.6520518,6.85921402 L34.6520518,30.8207756 C38.5769872,32.0920298 41.4233174,35.7820555 41.4233174,40.1254122 C41.4233174,45.5165351 37.0376998,49.9029141 31.6465768,49.9029141 C27.3332978,49.9029141 23.6638315,47.0946568 22.3689721,43.2108401 L22.3689721,43.2108401 L6.8588333,43.2108401 C3.07667119,43.2108401 0,40.1337882 0,36.3512454 L0,36.3512454 L0,6.85921402 C0,3.07705189 3.07667119,-1.42108547e-13 6.8588333,-1.42108547e-13 L6.8588333,-1.42108547e-13 L27.7932185,-1.42108547e-13 Z M31.6465768,33.2715283 C27.8678413,33.2715283 24.7938352,36.3459152 24.7938352,40.1254122 C24.7938352,43.9041477 27.8678413,46.9789152 31.6465768,46.9789152 C35.4253124,46.9789152 38.4993185,43.9041477 38.4993185,40.1254122 C38.4993185,36.3459152 35.4253124,33.2715283 31.6465768,33.2715283 Z M33.1146679,36.5895817 C33.6853808,36.0188689 34.6113137,36.0188689 35.1820266,36.5895817 C35.7531201,37.1606753 35.7531201,38.0862275 35.1820266,38.6569404 L35.1820266,38.6569404 L33.7139355,40.1250315 L35.1820266,41.5931226 C35.7527393,42.164216 35.7527393,43.0897683 35.1820266,43.6608618 C34.8964798,43.9464086 34.5222231,44.0891819 34.1483473,44.0891819 C33.7740906,44.0891819 33.3998341,43.9464086 33.1146679,43.6608618 L33.1146679,43.6608618 L31.6465768,42.1927707 L30.1784857,43.6608618 C29.892939,43.9464086 29.5186824,44.0891819 29.1448065,44.0891819 C28.7705499,44.0891819 28.3962932,43.9464086 28.1107464,43.6608618 C27.5400337,43.0897683 27.5400337,42.164216 28.1107464,41.5931226 L28.1107464,41.5931226 L29.5788375,40.1250315 L28.1107464,38.6569404 C27.5400337,38.0862275 27.5400337,37.1602946 28.1107464,36.5895817 C28.68184,36.0188689 29.607773,36.0188689 30.1784857,36.5895817 L30.1784857,36.5895817 L31.6465768,38.0576728 L33.1146679,36.5895817 Z M27.7932185,2.92399887 L6.8588333,2.92399887 C4.68905861,2.92399887 2.92399887,4.68943931 2.92399887,6.85921402 L2.92399887,6.85921402 L2.92399887,36.3512454 C2.92399887,38.5214007 4.68905861,40.2868413 6.8588333,40.2868413 L6.8588333,40.2868413 L21.87174,40.2868413 C21.8709785,40.2327777 21.8698363,40.1790949 21.8698363,40.1254122 C21.8698363,34.7335277 26.2554539,30.3475294 31.6465768,30.3475294 C31.6739893,30.3475294 31.7010211,30.3482909 31.7280529,30.3482909 L31.7280529,30.3482909 L31.7280529,6.85921402 C31.7280529,4.68943931 29.9629932,2.92399887 27.7932185,2.92399887 L27.7932185,2.92399887 Z M12.3405697,34.6337768 C13.148096,34.6337768 13.8025691,35.28825 13.8025691,36.0957762 C13.8025691,36.9029217 13.148096,37.5577757 12.3405697,37.5577757 L12.3405697,37.5577757 L7.5814569,37.5577757 C6.7743114,37.5577757 6.1194575,36.9029217 6.1194575,36.0957762 C6.1194575,35.28825 6.7743114,34.6337768 7.5814569,34.6337768 L7.5814569,34.6337768 L12.3405697,34.6337768 Z M27.1768181,15.8543178 C27.9843445,15.8543178 28.6388176,16.508791 28.6388176,17.3163172 C28.6388176,18.1234628 27.9843445,18.7783167 27.1768181,18.7783167 L27.1768181,18.7783167 L7.5814569,18.7783167 C6.7743114,18.7783167 6.1194575,18.1234628 6.1194575,17.3163172 C6.1194575,16.508791 6.7743114,15.8543178 7.5814569,15.8543178 L7.5814569,15.8543178 L27.1768181,15.8543178 Z M24.3590427,10.8366901 C25.1665689,10.8366901 25.8210421,11.491544 25.8210421,12.2986896 C25.8210421,13.1062158 25.1665689,13.760689 24.3590427,13.760689 L24.3590427,13.760689 L7.5814569,13.760689 C6.7739307,13.760689 6.1194575,13.1062158 6.1194575,12.2986896 C6.1194575,11.491544 6.7743114,10.8366901 7.5814569,10.8366901 L7.5814569,10.8366901 L24.3590427,10.8366901 Z M27.2830416,5.81944305 C28.0905678,5.81944305 28.745041,6.47391625 28.745041,7.28144248 C28.745041,8.088588 28.0905678,8.74344192 27.2830416,8.74344192 L27.2830416,8.74344192 L7.5814569,8.74344192 C6.7743114,8.74344192 6.1194575,8.088588 6.1194575,7.28144248 C6.1194575,6.47391625 6.7743114,5.81944305 7.5814569,5.81944305 L7.5814569,5.81944305 L27.2830416,5.81944305 Z"></path></svg>';
				htmlBody += 					'<span>'+icon_x+'</span>';
				htmlBody += 				'</div>';
				htmlBody += 				'<div class="ort-block-title">Huỷ</div>';
				htmlBody +=					'<div class="ort-block-time">'+ renderTime(data.pos_cancel_at) +'</div>';
				htmlBody += 			'</div>';
			}
			else{
				var aStatus = ['','','','',''];
				var stepPrev = ['','','','',''];
				var delivery_cancel = '';
				var delivery_time = '';
				var delivery_status = 'Đang giao';
				var complete_status = 'Đã nhận hàng';			
				var complete_time = '';			
				
				if(data.pos_order_status == 'pos_pending' || data.pos_order_status == 'pos_user_assigned'){
					aStatus[0] = 'active';
				}
				if(data.pos_order_status == 'pos_confirmed'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					stepPrev[0] = 'checked';
				}
				if(data.pos_order_status == 'pos_request_cancel'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					stepPrev[0] = 'checked';
				}
				if(data.pos_order_status == 'pos_store_assigned' || data.pos_order_status == 'pos_output' || data.pos_order_status == 'pos_stock_on_hand' || data.pos_order_status == 'pos_out_of_stock'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					aStatus[2] = 'active';
					stepPrev[0] = 'checked';
					stepPrev[1] = 'checked';
				}
				
				if(data.fulfillments.length > 0){
					delivery_status = data.fulfillments[0].carrier_status_name;
					delivery_time = renderTime(data.fulfillments[0].delivered_date);
				}
				if(data.pos_order_status == 'pos_delivering_nvc' || data.pos_order_status == 'pos_delivering_self'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					aStatus[2] = 'active';
					aStatus[3] = 'active';
					stepPrev[0] = 'checked';
					stepPrev[1] = 'checked';
					stepPrev[2] = 'checked';
				}
				if(data.pos_order_status == 'pos_delivering_self'){
					
					if(data.fulfillments[0].carrier_status_code == 'delivering'){
						delivery_time = renderTime(data.fulfillments[0].delivering_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'readytopick') {
						delivery_time = renderTime(data.fulfillments[0].ready_to_pick_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'pickupfail') {
						delivery_time = renderTime(data.fulfillments[0].created_at); // lấy tạm, 10/4 mới build
						delivery_status = 'Chờ lấy hàng';
					}
					else if (data.fulfillments[0].carrier_status_code == 'delivered'){
						delivery_time = renderTime(data.fulfillments[0].delivered_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'waitingforreturn'){
						delivery_time = renderTime(data.fulfillments[0].waiting_for_return_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'return'){
						delivery_time = renderTime(data.fulfillments[0].return_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'picking'){
						delivery_time = renderTime(data.fulfillments[0].picking_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'notmeetcustomer'){
						delivery_time = renderTime(data.fulfillments[0].not_meet_customer_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'cancel'){
						delivery_time = renderTime(data.fulfillments[0].cancel_date);
						delivery_cancel = ' delivery_cancel';
						delivery_status = 'Huỷ giao hàng';
					}
					else {
						delivery_time = renderTime(data.pos_delivering_self_at);
					}
				}
				if(data.pos_order_status == 'pos_delivering_nvc'){
					if(data.fulfillments[0].carrier_status_code == 'delivering'){
						delivery_time = renderTime(data.fulfillments[0].delivering_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'readytopick') {
						delivery_time = renderTime(data.fulfillments[0].ready_to_pick_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'pickupfail') {
						delivery_time = renderTime(data.fulfillments[0].created_at); // lấy tạm, 10/4 mới build
						delivery_status = 'Chờ lấy hàng';
					}
					else if (data.fulfillments[0].carrier_status_code == 'delivered'){
						delivery_time = renderTime(data.fulfillments[0].delivered_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'waitingforreturn'){
						delivery_time = renderTime(data.fulfillments[0].waiting_for_return_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'return'){
						delivery_time = renderTime(data.fulfillments[0].return_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'picking'){
						delivery_time = renderTime(data.fulfillments[0].picking_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'notmeetcustomer'){
						delivery_time = renderTime(data.fulfillments[0].not_meet_customer_date);
					}
					else if (data.fulfillments[0].carrier_status_code == 'cancel'){
						delivery_time = renderTime(data.fulfillments[0].cancel_date);
						delivery_cancel = ' delivery_cancel';
						delivery_status = 'Huỷ giao hàng';
					}
					else {
						delivery_time = renderTime(data.pos_delivering_nvc_at);
					}
				}
				if(data.pos_order_status == 'pos_cancel_restock'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					aStatus[2] = 'active';
					aStatus[3] = 'active';
					stepPrev[0] = 'checked';
					stepPrev[1] = 'checked';
					stepPrev[2] = 'checked';
					delivery_cancel = ' delivery_cancel';
					delivery_time =  renderTime(data.pos_cancel_restock_at);
					if (data.fulfillments[0].carrier_status_code == 'cancel'){
						delivery_status = 'Huỷ giao hàng';
					}
					else {
						delivery_status = 'Huỷ - Trả hàng';
					}
				}
				if(data.pos_order_status == 'pos_complete'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					aStatus[2] = 'active';
					aStatus[3] = 'active';
					aStatus[4] = 'active';	
					stepPrev[0] = 'checked';
					stepPrev[1] = 'checked';
					stepPrev[2] = 'checked';
					stepPrev[3] = 'checked';
					complete_status = 'Đã nhận hàng';
					complete_time = renderTime(data.pos_complete_at);			
				}
				if(data.pos_order_status == 'pos_cancel_refund'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					aStatus[2] = 'active';
					aStatus[3] = 'active';
					aStatus[4] = 'active';	
					stepPrev[0] = 'checked';
					stepPrev[1] = 'checked';
					stepPrev[2] = 'checked';
					stepPrev[3] = 'checked';
					complete_status = 'Huỷ - Trả hàng';
					complete_time = renderTime(data.pos_cancel_refund_at);			
				}				
				
				htmlBody += 			'<div class="ort-block '+aStatus[0] + ' ' + stepPrev[0] +'" id="ort-ordered">';
				htmlBody += 				'<div class="ort-block-circle">';
				htmlBody += 					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M422.052 56.069h-75.026V46.035c0-9.925-8.075-18-18-18h-31.558C290.783 11.252 274.537 0 256 0c-18.536 0-34.783 11.252-41.469 28.035h-31.558c-9.925 0-18 8.075-18 18V56.07H89.948c-16.303 0-29.565 13.263-29.565 29.565v396.8c0 16.303 13.263 29.565 29.565 29.565h332.104c16.303 0 29.565-13.263 29.565-29.565v-396.8c0-16.303-13.263-29.566-29.565-29.566zM180.974 46.035c0-1.084.916-2 2-2h37.389a8 8 0 0 0 7.777-6.124C231.251 25.01 242.708 16 256 16s24.749 9.01 27.859 21.91a8.001 8.001 0 0 0 7.777 6.125h37.389c1.084 0 2 .916 2 2v36.07c0 1.084-.916 2-2 2H182.974c-1.084 0-2-.916-2-2zm254.643 436.4c0 7.48-6.085 13.565-13.565 13.565H89.948c-7.48 0-13.565-6.085-13.565-13.565v-396.8c0-7.48 6.085-13.565 13.565-13.565h75.025v10.036c0 9.925 8.075 18 18 18h146.052c9.925 0 18-8.075 18-18V72.069h75.026c7.48 0 13.565 6.085 13.565 13.565v396.801zM236.596 201.734a8 8 0 0 1 8-8h69a8 8 0 0 1 0 16h-69a8 8 0 0 1-8-8zm122-33.5a8 8 0 0 1-8 8h-106a8 8 0 0 1 0-16h106a8 8 0 0 1 8 8zm0 116.545a8 8 0 0 1-8 8h-106a8 8 0 0 1 0-16h106c4.418.001 8 3.582 8 8zm-122 33.501a8 8 0 0 1 8-8h69a8 8 0 0 1 0 16h-69a8 8 0 0 1-8-8zm122 83.045a8 8 0 0 1-8 8h-106a8 8 0 0 1 0-16h106a8 8 0 0 1 8 8zm-37 33.5a8 8 0 0 1-8 8h-69a8 8 0 0 1 0-16h69c4.418.001 8 3.582 8 8zm-129.68-62.25h-59.473c-8.692 0-15.764 7.071-15.764 15.764v59.473c0 8.692 7.071 15.764 15.764 15.764h59.473c8.692 0 15.764-7.071 15.764-15.764v-59.473c0-8.693-7.072-15.764-15.764-15.764zm-.236 75h-59v-59h21.5v9.224a8 8 0 0 0 16 0v-9.224h21.5zm.236-191.546h-59.473c-8.692 0-15.764 7.071-15.764 15.764v59.473c0 8.692 7.071 15.764 15.764 15.764h59.473c8.692 0 15.764-7.071 15.764-15.764v-59.473c0-8.692-7.072-15.764-15.764-15.764zm-.236 75h-59v-59h21.5v9.224a8 8 0 0 0 16 0v-9.224h21.5zm.236-191.546h-59.473c-8.692 0-15.764 7.072-15.764 15.764v59.473c0 8.692 7.071 15.763 15.764 15.763h59.473c8.692 0 15.764-7.071 15.764-15.763v-59.473c0-8.692-7.072-15.764-15.764-15.764zm-.236 75h-59v-59h21.5v9.224a8 8 0 0 0 16 0v-9.224h21.5z" fill="currentColor" opacity="1" data-original="#000000" class=""></path></g></svg>';
				htmlBody += 					'<span>'+icon_check+'</span>';
				htmlBody += 				'</div>';
				htmlBody +=					'<div class="ort-block-title">Đơn hàng đã đặt</div>';
				htmlBody +=					'<div class="ort-block-time">'+ renderTime(data.created_at)+'</div>';
				htmlBody +=				'</div>';
				htmlBody += 			'<div class="ort-block '+aStatus[1] + ' ' + stepPrev[1] +'" id="ort-processing">';
				htmlBody +=					'<div class="ort-block-circle">';
				htmlBody += 					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M415.506 258.282V131.606a8 8 0 0 0-5.101-7.456L210.901 46.578a7.992 7.992 0 0 0-5.799 0L5.601 124.15A8 8 0 0 0 .5 131.606v230.366a8 8 0 0 0 5.101 7.456L205.103 447a7.992 7.992 0 0 0 5.798 0l102.873-39.999c16.813 34.857 52.51 58.965 93.731 58.965 57.343 0 103.994-46.651 103.994-103.994.001-54.652-42.374-99.592-95.993-103.69zm-207.504-57.687-43.969-17.096c59.145-22.994 118.286-45.991 177.428-68.989l43.97 17.096zm-111.385-43.31L274.04 88.294l45.347 17.632c-59.143 22.998-118.285 45.996-177.428 68.989zm-14.074 11.694 51.416 19.992v38.337l-21.984-18.725a8.002 8.002 0 0 0-7.563-1.549l-21.868 6.801v-44.856zM208.002 62.617l43.963 17.094-177.422 68.991-43.968-17.096zM16.5 143.3l50.043 19.458v58.346c0 3.376 1.621 6.585 4.335 8.582a10.69 10.69 0 0 0 9.478 1.586l24.6-7.65 27.446 23.376a10.675 10.675 0 0 0 11.371 1.568 10.685 10.685 0 0 0 6.187-9.673v-43.7l50.043 19.458V427.85L16.5 356.5zm199.502 284.551v-213.2L399.506 143.3v114.982c-53.619 4.098-95.994 49.039-95.994 103.69 0 10.471 1.562 20.582 4.453 30.121zm191.504 22.115c-48.521 0-87.994-39.474-87.994-87.994 0-48.521 39.474-87.995 87.994-87.995s87.994 39.475 87.994 87.995-39.474 87.994-87.994 87.994zm61.682-137.427c-4.14-4.139-9.643-6.418-15.496-6.418s-11.356 2.279-15.497 6.418l-50.521 50.523-13.828-17.401c-4.177-5.254-10.426-8.268-17.144-8.268a21.962 21.962 0 0 0-13.612 4.755 21.745 21.745 0 0 0-8.126 14.65 21.743 21.743 0 0 0 4.612 16.104l28.42 35.763a21.967 21.967 0 0 0 17.845 9.158c5.84 0 11.334-2.279 15.473-6.417l67.875-67.876c8.543-8.544 8.543-22.447-.001-30.991zm-11.314 19.678-67.875 67.876a5.772 5.772 0 0 1-4.159 1.731 5.876 5.876 0 0 1-4.883-2.541 7.776 7.776 0 0 0-.298-.398l-28.558-35.937a5.848 5.848 0 0 1-1.241-4.333 5.848 5.848 0 0 1 2.187-3.942 5.82 5.82 0 0 1 3.655-1.28c1.812 0 3.495.811 4.618 2.223l19.406 24.421a8 8 0 0 0 5.808 3.01 7.973 7.973 0 0 0 6.112-2.33l56.862-56.864a5.88 5.88 0 0 1 4.184-1.732c1.58 0 3.065.615 4.182 1.732a5.92 5.92 0 0 1 0 8.364z" fill="currentColor" opacity="1" data-original="#000000" class=""></path></g></svg>';
				htmlBody += 					'<span>'+icon_check+'</span>';
				htmlBody += 				'</div>';
				htmlBody +=					'<div class="ort-block-title">Đã xác nhận</div>';
				htmlBody +=					'<div class="ort-block-time">'+ ((data.pos_confirmed_at != null) ? renderTime(data.pos_confirmed_at) : '' ) +'</div>';
				htmlBody += 			'</div>';
				htmlBody += 			'<div class="ort-block '+aStatus[2] + ' ' + stepPrev[2] +'" id="ort-delivering">';
				htmlBody +=					'<div class="ort-block-circle">';
				htmlBody += 					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 128 128" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M94.581 96.596c0-1.106.907-1.984 2.013-1.984s1.984.878 1.984 1.984v29.392c0 1.105-.879 2.013-1.984 2.013H11.416c-1.105 0-1.984-.907-1.984-2.013V75.451c0-1.106.878-1.984 1.984-1.984s2.013.878 2.013 1.984v48.552h81.152z" fill="" opacity="1" data-original="" class=""></path><path d="M29.104 120.8c0 1.105-.907 2.013-2.013 2.013s-1.983-.907-1.983-2.013V95.263c0-3.798 1.53-7.256 4.053-9.75 2.495-2.494 5.953-4.054 9.751-4.054s7.256 1.56 9.75 4.054a13.775 13.775 0 0 1 4.054 9.75V120.8a2.02 2.02 0 0 1-2.012 2.013c-1.106 0-1.985-.907-1.985-2.013V95.263c0-2.692-1.105-5.131-2.891-6.915-1.786-1.786-4.224-2.892-6.917-2.892s-5.159 1.105-6.944 2.892c-1.758 1.784-2.863 4.223-2.863 6.915zM65.584 104.843h18.367V90.869H65.584zm20.38 3.997H63.6c-1.105 0-2.013-.879-2.013-1.984V88.857c0-1.105.907-1.984 2.013-1.984h22.364c1.105 0 2.013.879 2.013 1.984v17.998c0 1.106-.908 1.985-2.013 1.985z" fill="" opacity="1" data-original="" class=""></path><path fill-rule="evenodd" d="M42.256 110.058a2.008 2.008 0 0 0 1.984-1.983c0-1.105-.907-2.013-1.984-2.013a2.021 2.021 0 0 0-2.013 2.013c0 1.076.907 1.983 2.013 1.983z" clip-rule="evenodd" fill="" opacity="1" data-original="" class=""></path><path d="M44.58 61.959v-.114l1.333-24.744H38.23l-4.535 24.971c.028 1.587.624 3.005 1.616 4.054a5.237 5.237 0 0 0 3.826 1.644 5.221 5.221 0 0 0 3.798-1.644c1.021-1.077 1.616-2.551 1.616-4.167zm5.301-24.857-1.304 24.857c0 1.616.624 3.09 1.616 4.167a5.239 5.239 0 0 0 7.624 0c1.021-1.077 1.616-2.551 1.616-4.167h.028l-.681-12.471a2 2 0 0 1 1.9-2.098 1.998 1.998 0 0 1 2.097 1.899l.652 12.556v.114h.028c0 1.616.624 3.09 1.616 4.167a5.237 5.237 0 0 0 3.826 1.644c1.104 0 1.983.907 1.983 2.012s-.879 2.013-1.983 2.013c-2.636 0-5.018-1.134-6.718-2.919-.255-.283-.51-.566-.737-.879-.226.313-.481.596-.736.879-1.701 1.785-4.083 2.919-6.69 2.919-2.636 0-5.017-1.134-6.718-2.919-.255-.283-.51-.566-.737-.879-.227.313-.481.596-.736.879-1.701 1.785-4.082 2.919-6.69 2.919-2.636 0-5.017-1.134-6.718-2.919-.255-.283-.51-.566-.737-.879-.227.313-.482.596-.737.879-1.701 1.785-4.082 2.919-6.689 2.919-2.636 0-5.018-1.134-6.718-2.919-.255-.283-.51-.566-.737-.879-.227.313-.482.596-.737.879-1.7 1.785-4.081 2.919-6.689 2.919-2.239 0-4.28-.822-5.896-2.154A9.736 9.736 0 0 1 .19 64.228c-.169-.708-.226-1.389-.169-2.069.056-.68.227-1.36.51-2.041l8.277-20.181c.85-2.098 2.239-3.798 3.94-4.988a10.438 10.438 0 0 1 5.981-1.843h36.565a2.02 2.02 0 0 1 2.012 2.013c0 1.077-.907 1.984-2.012 1.984h-5.413zm-15.675 0h-8.107l-7.284 25.084c.057 1.531.652 2.92 1.616 3.94a5.243 5.243 0 0 0 7.625 0c1.021-1.077 1.616-2.551 1.616-4.167h.028c0-.114 0-.255.028-.369zm-12.245 0H18.73c-1.389 0-2.665.396-3.713 1.134-1.077.765-1.956 1.842-2.522 3.231L4.217 61.619a3.19 3.19 0 0 0-.227.851c0 .283 0 .567.085.878a5.77 5.77 0 0 0 1.956 3.231 5.182 5.182 0 0 0 3.345 1.19 5.223 5.223 0 0 0 3.798-1.644c1.021-1.077 1.616-2.551 1.616-4.167h.028c0-.199.028-.369.057-.567zM60.624 115.585c-1.105 0-2.013-.878-2.013-1.983s.908-2.013 2.013-2.013H88.94c1.104 0 1.983.907 1.983 2.013s-.879 1.983-1.983 1.983zM124.003 46.767 98.267 90.303a1.97 1.97 0 0 1-2.722.708 1.842 1.842 0 0 1-.736-.736l-25.71-43.508a.63.63 0 0 0-.085-.142c-1.247-2.268-2.211-4.733-2.891-7.284a31.816 31.816 0 0 1-.992-7.908c0-8.673 3.515-16.524 9.184-22.221C80.012 3.514 87.863 0 96.565 0c8.673 0 16.525 3.514 22.223 9.211S128 22.76 128 31.433c0 2.721-.368 5.357-1.021 7.908a31.603 31.603 0 0 1-2.948 7.369zm-27.438-34.41a19.004 19.004 0 0 1 13.492 5.583 19 19 0 0 1 5.584 13.492c0 5.272-2.126 10.034-5.584 13.492s-8.221 5.612-13.492 5.612a19.09 19.09 0 0 1-13.521-5.612c-3.43-3.458-5.583-8.22-5.583-13.492s2.153-10.034 5.583-13.492a19.07 19.07 0 0 1 13.521-5.583zm10.658 8.418c-2.721-2.749-6.491-4.422-10.657-4.422a15.042 15.042 0 0 0-10.687 4.422 15.039 15.039 0 0 0-4.422 10.657c0 4.167 1.701 7.937 4.422 10.686a15.134 15.134 0 0 0 10.687 4.393c4.166 0 7.937-1.672 10.657-4.393 2.722-2.749 4.423-6.519 4.423-10.686 0-4.166-1.702-7.935-4.423-10.657zM96.565 85.371l24.008-40.645a27.484 27.484 0 0 0 2.551-6.406c.567-2.183.879-4.479.879-6.888 0-7.567-3.09-14.427-8.049-19.387-4.962-4.96-11.821-8.049-19.389-8.049-7.597 0-14.456 3.089-19.416 8.049a27.327 27.327 0 0 0-8.022 19.387c0 2.409.283 4.705.85 6.888a28.85 28.85 0 0 0 2.523 6.349l.028.057z" fill="" opacity="1" data-original="" class=""></path><path d="M96.565 22.278c2.495 0 4.79 1.049 6.462 2.693 1.645 1.644 2.665 3.939 2.665 6.462s-1.021 4.818-2.665 6.462c-1.672 1.672-3.938 2.693-6.462 2.693a9.155 9.155 0 0 1-6.492-2.693c-.028-.028-.057-.085-.113-.113a9.106 9.106 0 0 1-2.55-6.349 9.133 9.133 0 0 1 2.663-6.462c.057-.028.085-.085.142-.114a9.131 9.131 0 0 1 6.35-2.579zm3.628 5.498a5.19 5.19 0 0 0-3.628-1.474 5.185 5.185 0 0 0-3.571 1.417l-.085.085a5.093 5.093 0 0 0-1.504 3.628c0 1.389.539 2.636 1.419 3.572l.085.085c.936.907 2.211 1.502 3.656 1.502 1.418 0 2.693-.595 3.628-1.502a5.113 5.113 0 0 0 1.502-3.657 5.096 5.096 0 0 0-1.502-3.628z" fill="" opacity="1" data-original="" class=""></path></g></svg>';
				htmlBody += 					'<span>'+icon_check+'</span>';
				htmlBody += 				'</div>';
				htmlBody +=					'<div class="ort-block-title">Cửa hàng đang xử lý</div>';
				if (data.pos_delivering_self_at != null){
					if(data.fulfillments[0].carrier_status_code == 'delivering' || data.fulfillments[0].carrier_status_code == 'readytopick' || data.fulfillments[0].carrier_status_code == 'delivered' || data.fulfillments[0].carrier_status_code == 'waitingforreturn' || data.fulfillments[0].carrier_status_code == 'return' || data.fulfillments[0].carrier_status_code == 'picking' || data.fulfillments[0].carrier_status_code == 'notmeetcustomer' || data.fulfillments[0].carrier_status_code == 'cancel' || data.fulfillments[0].carrier_status_code == 'pickupfail'){
						htmlBody +=					'<div class="ort-block-time">'+ renderTime(data.pos_store_assigned_at) +'</div>';
					}
					else {
						htmlBody +=					'<div class="ort-block-time">'+ renderTime(data.pos_delivering_self_at) +'</div>';
					}
				}
				else if (data.pos_delivering_nvc_at != null) {
					if(data.fulfillments[0].carrier_status_code == 'delivering' || data.fulfillments[0].carrier_status_code == 'readytopick' || data.fulfillments[0].carrier_status_code == 'delivered' || data.fulfillments[0].carrier_status_code == 'waitingforreturn' || data.fulfillments[0].carrier_status_code == 'return' || data.fulfillments[0].carrier_status_code == 'picking' || data.fulfillments[0].carrier_status_code == 'notmeetcustomer' || data.fulfillments[0].carrier_status_code == 'cancel' || data.fulfillments[0].carrier_status_code == 'pickupfail'){
						htmlBody +=					'<div class="ort-block-time">'+ renderTime(data.pos_store_assigned_at) +'</div>';
					}
					else {
						htmlBody +=					'<div class="ort-block-time">'+ renderTime(data.pos_delivering_nvc_at) +'</div>';
					}
				}
				else {			
					if (aStatus[2] == 'active') htmlBody +=					'<div class="ort-block-time">'+ renderTime(data.pos_store_assigned_at) +'</div>';
				}
				htmlBody +=				'</div>';
				htmlBody += 			'<div class="ort-block '+aStatus[3] + ' ' + stepPrev[3] + delivery_cancel+'" id="ort-fulfilled">';
				htmlBody +=					'<div class="ort-block-circle">';
				htmlBody += 					'<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40"><path d="M48.6693371,28.5712647 C47.2147119,28.5712647 45.8328179,29.1409929 44.7903364,30.1713525 C43.747855,31.2138339 43.1660049,32.5714842 43.1660049,34.0261094 C43.1660049,35.4807347 43.7357331,36.8383849 44.7903364,37.8808664 C45.8449397,38.911226 47.2147119,39.4809542 48.6693371,39.4809542 C51.6513189,39.4809542 54.0756944,37.032335 54.0756944,34.0261094 C54.0756944,31.0198839 51.6513189,28.5712647 48.6693371,28.5712647 Z M48.6693371,37.0565787 C46.9965181,37.0565787 45.5903803,35.6746847 45.5903803,34.0261094 C45.5903803,32.3775341 46.9965181,30.9956401 48.6693371,30.9956401 C50.3179124,30.9956401 51.6513189,32.3532904 51.6513189,34.0261094 C51.6513189,35.6989285 50.3179124,37.0565787 48.6693371,37.0565787 Z M50.0754749,11.3029771 C49.8572811,11.0969052 49.5663561,10.9878083 49.2633091,10.9878083 L43.0447861,10.9878083 C42.3780828,10.9878083 41.8325984,11.5332928 41.8325984,12.199996 L41.8325984,22.1399353 C41.8325984,22.8066386 42.3780828,23.3521231 43.0447861,23.3521231 L52.9119942,23.3521231 C53.5786974,23.3521231 54.1241819,22.8066386 54.1241819,22.1399353 L54.1241819,15.4850247 C54.1241819,15.1456122 53.9787194,14.8183215 53.7241599,14.5880058 L50.0754749,11.3029771 Z M51.6998064,20.9277476 L44.2569738,20.9277476 L44.2569738,13.4000619 L48.7905559,13.4000619 L51.6998064,16.0183873 L51.6998064,20.9277476 Z M19.0677129,28.5712647 C17.6130876,28.5712647 16.2311936,29.1409929 15.1887122,30.1713525 C14.1462307,31.2138339 13.5643806,32.5714842 13.5643806,34.0261094 C13.5643806,35.4807347 14.1341089,36.8383849 15.1887122,37.8808664 C16.2433155,38.911226 17.6130876,39.4809542 19.0677129,39.4809542 C22.0496947,39.4809542 24.4740702,37.032335 24.4740702,34.0261094 C24.4740702,31.0198839 22.0496947,28.5712647 19.0677129,28.5712647 Z M19.0677129,37.0565787 C17.3948938,37.0565787 15.9887561,35.6746847 15.9887561,34.0261094 C15.9887561,32.3775341 17.3948938,30.9956401 19.0677129,30.9956401 C20.7162882,30.9956401 22.0496947,32.3532904 22.0496947,34.0261094 C22.0496947,35.6989285 20.7162882,37.0565787 19.0677129,37.0565787 Z M10.9824208,30.964662 L8.54592346,30.964662 L8.54592346,27.7402426 C8.54592346,27.0735394 8.00043898,26.5280549 7.33373573,26.5280549 C6.66703248,26.5280549 6.12154801,27.0735394 6.12154801,27.7402426 L6.12154801,32.1768497 C6.12154801,32.843553 6.66703248,33.3890374 7.33373573,33.3890374 L10.9824208,33.3890374 C11.649124,33.3890374 12.1946085,32.843553 12.1946085,32.1768497 C12.1946085,31.5101465 11.649124,30.964662 10.9824208,30.964662 Z M17.1282125,23.4558325 C17.1282125,22.7891292 16.5827281,22.2436447 15.9160248,22.2436447 L1.21218772,22.2436447 C0.545484476,22.2436447 5.15143483e-14,22.7891292 5.15143483e-14,23.4558325 C5.15143483e-14,24.1225357 0.545484476,24.6680202 1.21218772,24.6680202 L15.9160248,24.6680202 C16.5827281,24.6680202 17.1282125,24.1346576 17.1282125,23.4558325 Z M3.67292881,19.9822412 L18.3767659,20.0670943 C19.0434692,20.0670943 19.5889536,19.5337317 19.6010755,18.8670285 C19.6131974,18.1882034 19.0677129,17.6427189 18.4010097,17.6427189 L3.69717256,17.5578658 C3.68505068,17.5578658 3.68505068,17.5578658 3.68505068,17.5578658 C3.01834743,17.5578658 2.47286296,18.0912284 2.47286296,18.7579316 C2.46074108,19.4367567 3.00622556,19.9822412 3.67292881,19.9822412 Z M6.14579176,15.3813153 L20.8496289,15.3813153 C21.5163321,15.3813153 22.0618166,14.8358309 22.0618166,14.1691276 C22.0618166,13.5024244 21.5163321,12.9569399 20.8496289,12.9569399 L6.14579176,12.9569399 C5.47908851,12.9569399 4.93360404,13.5024244 4.93360404,14.1691276 C4.93360404,14.8358309 5.47908851,15.3813153 6.14579176,15.3813153 Z M59.0820297,12.9652127 L50.4027656,5.8198864 C50.1845718,5.6391445 49.9178905,5.5427489 49.6269654,5.5427489 L39.4203448,5.5427489 L39.4203448,1.20494541 C39.4203448,0.54222544 38.8748603,0 38.2081571,0 L7.33373573,0 C6.66703248,0 6.12154801,0.54222544 6.12154801,1.20494541 L6.12154801,9.5731298 C6.12154801,10.2358498 6.66703248,10.7780752 7.33373573,10.7780752 C8.00043898,10.7780752 8.54592346,10.2358498 8.54592346,9.5731298 L8.54592346,2.40989083 L37.0080912,2.40989083 L37.0080912,30.9791466 L27.0681519,30.9791466 C26.4014486,30.9791466 25.8559642,31.521372 25.8559642,32.184092 C25.8559642,32.846812 26.4014486,33.3890374 27.0681519,33.3890374 L41.868964,33.3890374 C42.5356673,33.3890374 43.0811517,32.846812 43.0811517,32.184092 C43.0811517,31.521372 42.5356673,30.9791466 41.868964,30.9791466 L39.4324667,30.9791466 L39.4324667,7.9526397 L49.2026997,7.9526397 L57.1061637,14.459345 L57.0213106,30.9550477 L55.7606353,30.9550477 C55.0939321,30.9550477 54.5484476,31.4972731 54.5484476,32.1599931 C54.5484476,32.8227131 55.0939321,33.3649385 55.7606353,33.3649385 L58.2213764,33.3649385 C58.8880797,33.3649385 59.4335641,32.8347625 59.4335641,32.1720426 L59.5305391,13.9050701 C59.5184173,13.5435865 59.3608329,13.1941523 59.0820297,12.9652127 Z"></path></svg>';
				htmlBody += 					'<span>'+icon_check+'</span>';
				htmlBody += 				'</div>';
				htmlBody +=					'<div class="ort-block-title">'+ delivery_status +'</div>';
				htmlBody +=					'<div class="ort-block-time">'+ ((delivery_time != '') ? delivery_time : '' ) +'</div>';
				htmlBody +=				'</div>';
				if(data.pos_order_status == 'pos_cancel_refund'){
					htmlBody += 			'<div class="ort-block '+aStatus[4] + ' ' + stepPrev[3] +'" id="ort-refund">';
					htmlBody +=					'<div class="ort-block-circle">';
					htmlBody += 					'<svg viewBox="0 0 42 50" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40"><path d="M27.7932185,-1.42108547e-13 C31.5753806,-1.42108547e-13 34.6520518,3.07705189 34.6520518,6.85921402 L34.6520518,6.85921402 L34.6520518,30.8207756 C38.5769872,32.0920298 41.4233174,35.7820555 41.4233174,40.1254122 C41.4233174,45.5165351 37.0376998,49.9029141 31.6465768,49.9029141 C27.3332978,49.9029141 23.6638315,47.0946568 22.3689721,43.2108401 L22.3689721,43.2108401 L6.8588333,43.2108401 C3.07667119,43.2108401 0,40.1337882 0,36.3512454 L0,36.3512454 L0,6.85921402 C0,3.07705189 3.07667119,-1.42108547e-13 6.8588333,-1.42108547e-13 L6.8588333,-1.42108547e-13 L27.7932185,-1.42108547e-13 Z M31.6465768,33.2715283 C27.8678413,33.2715283 24.7938352,36.3459152 24.7938352,40.1254122 C24.7938352,43.9041477 27.8678413,46.9789152 31.6465768,46.9789152 C35.4253124,46.9789152 38.4993185,43.9041477 38.4993185,40.1254122 C38.4993185,36.3459152 35.4253124,33.2715283 31.6465768,33.2715283 Z M33.1146679,36.5895817 C33.6853808,36.0188689 34.6113137,36.0188689 35.1820266,36.5895817 C35.7531201,37.1606753 35.7531201,38.0862275 35.1820266,38.6569404 L35.1820266,38.6569404 L33.7139355,40.1250315 L35.1820266,41.5931226 C35.7527393,42.164216 35.7527393,43.0897683 35.1820266,43.6608618 C34.8964798,43.9464086 34.5222231,44.0891819 34.1483473,44.0891819 C33.7740906,44.0891819 33.3998341,43.9464086 33.1146679,43.6608618 L33.1146679,43.6608618 L31.6465768,42.1927707 L30.1784857,43.6608618 C29.892939,43.9464086 29.5186824,44.0891819 29.1448065,44.0891819 C28.7705499,44.0891819 28.3962932,43.9464086 28.1107464,43.6608618 C27.5400337,43.0897683 27.5400337,42.164216 28.1107464,41.5931226 L28.1107464,41.5931226 L29.5788375,40.1250315 L28.1107464,38.6569404 C27.5400337,38.0862275 27.5400337,37.1602946 28.1107464,36.5895817 C28.68184,36.0188689 29.607773,36.0188689 30.1784857,36.5895817 L30.1784857,36.5895817 L31.6465768,38.0576728 L33.1146679,36.5895817 Z M27.7932185,2.92399887 L6.8588333,2.92399887 C4.68905861,2.92399887 2.92399887,4.68943931 2.92399887,6.85921402 L2.92399887,6.85921402 L2.92399887,36.3512454 C2.92399887,38.5214007 4.68905861,40.2868413 6.8588333,40.2868413 L6.8588333,40.2868413 L21.87174,40.2868413 C21.8709785,40.2327777 21.8698363,40.1790949 21.8698363,40.1254122 C21.8698363,34.7335277 26.2554539,30.3475294 31.6465768,30.3475294 C31.6739893,30.3475294 31.7010211,30.3482909 31.7280529,30.3482909 L31.7280529,30.3482909 L31.7280529,6.85921402 C31.7280529,4.68943931 29.9629932,2.92399887 27.7932185,2.92399887 L27.7932185,2.92399887 Z M12.3405697,34.6337768 C13.148096,34.6337768 13.8025691,35.28825 13.8025691,36.0957762 C13.8025691,36.9029217 13.148096,37.5577757 12.3405697,37.5577757 L12.3405697,37.5577757 L7.5814569,37.5577757 C6.7743114,37.5577757 6.1194575,36.9029217 6.1194575,36.0957762 C6.1194575,35.28825 6.7743114,34.6337768 7.5814569,34.6337768 L7.5814569,34.6337768 L12.3405697,34.6337768 Z M27.1768181,15.8543178 C27.9843445,15.8543178 28.6388176,16.508791 28.6388176,17.3163172 C28.6388176,18.1234628 27.9843445,18.7783167 27.1768181,18.7783167 L27.1768181,18.7783167 L7.5814569,18.7783167 C6.7743114,18.7783167 6.1194575,18.1234628 6.1194575,17.3163172 C6.1194575,16.508791 6.7743114,15.8543178 7.5814569,15.8543178 L7.5814569,15.8543178 L27.1768181,15.8543178 Z M24.3590427,10.8366901 C25.1665689,10.8366901 25.8210421,11.491544 25.8210421,12.2986896 C25.8210421,13.1062158 25.1665689,13.760689 24.3590427,13.760689 L24.3590427,13.760689 L7.5814569,13.760689 C6.7739307,13.760689 6.1194575,13.1062158 6.1194575,12.2986896 C6.1194575,11.491544 6.7743114,10.8366901 7.5814569,10.8366901 L7.5814569,10.8366901 L24.3590427,10.8366901 Z M27.2830416,5.81944305 C28.0905678,5.81944305 28.745041,6.47391625 28.745041,7.28144248 C28.745041,8.088588 28.0905678,8.74344192 27.2830416,8.74344192 L27.2830416,8.74344192 L7.5814569,8.74344192 C6.7743114,8.74344192 6.1194575,8.088588 6.1194575,7.28144248 C6.1194575,6.47391625 6.7743114,5.81944305 7.5814569,5.81944305 L7.5814569,5.81944305 L27.2830416,5.81944305 Z"></path></svg>';
					htmlBody += 					'<span>'+icon_x+'</span>';
					htmlBody += 				'</div>';
					htmlBody +=					'<div class="ort-block-title">'+complete_status+'</div>';
					htmlBody +=					'<div class="ort-block-time">'+ complete_time +'</div>';
					htmlBody +=				'</div>';
				}
				else {
					htmlBody += 			'<div class="ort-block '+aStatus[4] + ' ' + stepPrev[3] +'" id="ort-completed">';
					htmlBody +=					'<div class="ort-block-circle">';
					htmlBody += 					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" x="0" y="0" viewBox="0 0 48 48" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="hand receive package"><path d="M44 26V6a1 1 0 0 0-1-1H15a1 1 0 0 0-1 1v16.34c-1.54-.1-1.89 0-6 .53V22a1 1 0 0 0-1-1H1a1 1 0 0 0-1 1v17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1c3.54 0 1.69-.49 11.63 4a11.27 11.27 0 0 0 5.09 1c3.5 0 3.65-.52 21.11-9.44A4 4 0 0 0 44 26ZM32 7v3.38c-3.62-1.81-2.39-1.8-6 0V7ZM16 7h8v5a1 1 0 0 0 1.45.89L29 11.12c3.77 1.88 3.89 2.12 4.53 1.73S34 12.38 34 7h8v19.53l-11 5.62a4.09 4.09 0 0 0-.23-1.5C30 28.56 29.42 28.71 18 23.33a11.47 11.47 0 0 0-2-.68ZM6 38H2V23h4Zm38.92-6.22C27.42 40.72 27.56 41 24.72 41a9.32 9.32 0 0 1-4.26-.8C10.34 35.61 12 36 8 36V24.88c8.22-1 5.44-1.47 19.85 5.3a2 2 0 0 1 .95 2.68 2 2 0 0 1-2.65 1l-7.89-3.76a1 1 0 0 0-.86 1.8l7.89 3.71a3.92 3.92 0 0 0 3.93-.3l13.86-7.09a2 2 0 1 1 1.84 3.56Z" fill="currentColor" opacity="1" data-original="currentColor"></path><path d="M35 25h4a1 1 0 0 0 0-2h-4a1 1 0 0 0 0 2Z" fill="currentColor" opacity="1" data-original="#000000"></path></g></g></svg>';
					htmlBody += 					'<span>'+icon_check+'</span>';
					htmlBody += 				'</div>';
					htmlBody +=					'<div class="ort-block-title">'+complete_status+'</div>';
					if (aStatus[4] == 'active') htmlBody +=					'<div class="ort-block-time">'+ complete_time +'</div>';
					htmlBody +=				'</div>';
				}
			}
			htmlBody += 			'</div>';
			if (data.hasOwnProperty('tracking_url') && data.hasOwnProperty('tracking_number') ){
				htmlBody += 			'<div class="tracking-delivery"><a target="_blank" href="'+data.tracking_url+data.tracking_number+'">Tình trạng giao hàng</a></div>';
			}
			htmlBody += 		'</div>';
			htmlBody += 	 '</div>';

			htmlFinal += htmlHead + htmlBody + '</div>';
			$('.tracking-detail').html(htmlFinal);

		};
		function renderHtmlOrderDetail(data,type,line){
			var html = '';
			html += 		'<div id="'+data.id+'" data-vrid="'+ data.variant_id +'" data-prid="'+data.product_id+'" class="line-item">';
			html += 			'<div class="left">';
			html += 				'<div class="image">';
			if ( data.image == null ) {
				html +=					'<img src="//theme.hstatic.net/200000636033/1001033735/14/no-image.jpg" alt="'+data.title+'" />';
			}
			else {
				html +=					'<img src="'+data.image.src+'" alt="'+data.title+'" />';
			}
			html += 				'</div>';
			html += 				'<div class="info">';
			html += 					'<div class="name">'+data.title+'</div>';
			if (data.custom_total_discount > 0){
				html += 					'<div class="discount">•Giảm giá '+PDR.Helper.moneyFormat(data.custom_total_discount,'₫')+'</div>';
			}
			html += 					'<div class="meta">';
			if (data.variant_title != 'Default Title') {
				html += 						'<span class="variant">'+data.variant_title+'</span>';
			}
			html += 					'</div>';
			if (!$.isEmptyObject(PDR.Customers.dataOrderGiftPE)) {
				$.each(PDR.Customers.dataOrderGiftPE, function(keyGiftPE,htmlGiftFE){
					if(data.properties.filter(x => x.name == ('PE-gift-item-buy ' + keyGiftPE) ).length > 0) {
						html += htmlGiftFE;
					}
				})
			}
		
			html += 				'</div>';
			html += 			'</div>';
			html += 			'<div class="right">';
			html += 				'<div class="total money text-right">';
			html += 					'<div class="total-price"><span class="quantity">'+data.quantity+'</span> x <span>'+ PDR.Helper.moneyFormat(data.custom_total_price,'₫') +'</span></div>';
			if (data.custom_total_price_original > data.custom_total_price){
				html += 					'<div class="total-price-original">'+ PDR.Helper.moneyFormat(data.custom_total_price_original,'₫')+'</div>';
			}
			html += 				'</div>';
			html += 			'</div>';  
			html += 		'</div>';	
			return html;	 
		};
		function renderHtmlGiftOrder(data,line){
			var itemOjProperties = {}
			var htmlGift = '';
			htmlGift +=	'<div class="line-gift" data-line="'+(line+1)+'" data-variant-id="'+data.variant_id+'" data-pro-id="'+data.product_id+'">';
			htmlGift +=			'<div class="gift-info">•Tặng: '+ data.title;
			htmlGift +=				'<span> Trị giá: ' + PDR.Helper.moneyFormat(data.custom_total_price_original,'₫') +'</span>';
			htmlGift +=			'</div>';
			htmlGift +=	'</div>';
			return htmlGift;
		};
		function checkItemOrder(order) {
			var itemOjProperties = {}
			var countPromo = 0;
			var typePromo = '';

			var Combos = []; //mã combo
			var titleCombos = []; //tên combo
			var lineCombo = [];

			var Gift = []; //mã gift
			var titleGift = []; //tên program gift
			var lineGift = [];
			
			var Discount = []; //mã Discount
			var titleDiscount = []; //tên Discount
			var lineDiscount = [];

			var checkItemGiftOmni = false;
			var checkItemGift = false;
			var checkItemCombo = false;
			var checkItemDiscount = false;

			for(var i = 0; i < order.line_items.length; i++) {
				var item = order.line_items[i];
				itemOjProperties = item.properties;
				$.each(itemOjProperties,function(j,properties){
					if (properties.name.indexOf('PE-combo-item') > -1){
						checkItemCombo = true;
						// PE-combo-item: "ma-combo | tên combo"
						var temp1 = properties.value.split('|')[0].trim();
						var titleTemp1 = properties.value.split('|')[1].trim();
						if(Combos.includes(temp1)) {
							var indexExist = Combos.indexOf(temp1);
							lineCombo[indexExist].push(i);
						}
						else {
							Combos.push(temp1);
							titleCombos.push(titleTemp1);
							var temp11 = [];
							temp11.push(i);
							lineCombo.push(temp11);
						}
					}
					else if(properties.name.indexOf('PE-gift-item ') > -1) {
						checkItemGift = true;
						//PE-gift-item-buy magift: "tên sản phẩm"
						//PE-gift-item magift: "tên sản phẩm"
						var temp3 = properties.value;
						var titleTemp3 = temp3;
						var codeTemp3 = properties.name.split(' ')[1].trim();
						if(Gift.includes(codeTemp3)) {
							var indexExist = Gift.indexOf(codeTemp3);
							lineGift[indexExist].push(i);
						}
						else {
							Gift.push(codeTemp3);
							titleGift.push(titleTemp3);
							var temp33 = [];
							temp33.push(i);
							lineGift.push(temp33);
						}
					}
				
					else if(properties.name.indexOf('Khuyến mãi') > -1) {
						checkItemGiftOmni = true;
					}		
				})
			}

			//Khuyến mãi
			if(Gift.length > 0) {
				for(var i = 0; i < Gift.length; i++) {
					var gf = Gift[i];
					var itemInGift = [];
					order.line_items.map((x,index) => {
						var findGift = x.properties.filter(v => v.name == ('PE-gift-item ' + gf) && v.value.indexOf(titleGift[i]) > -1);
						if (findGift.length > 0){
							itemInGift.push(x);
						}
					});
					if (itemInGift.length > 0) {
						var htmlGiftApp = '<div class="gifts-list"><div>Quà tặng khuyến mãi</div>';
						for(var j = 0; j < itemInGift.length; j++) {
							countPromo = countPromo + itemInGift[j].quantity;
							htmlGiftApp += renderHtmlGiftOrder(itemInGift[j],lineGift[i][j]);
						}
						htmlGiftApp += '</div>';	
						PDR.Customers.dataOrderGiftPE[gf] = htmlGiftApp;
					}
				}
			}
			
			//Combo
			if(Combos.length > 0) {
				for(var i = 0; i < Combos.length; i++) {
					var cmb = Combos[i];
					var html = 	'<div class="order-group combo">';
					html += 			'<div class="quantity-combo-mini d-none align-items-center">';
					html +=  				'<div>Ưu đãi: ' + titleCombos[i] + '</div>';
					html +=  			'</div>';

					var itemInCombo = [];
					order.line_items.map((x,index) => {
						var findCombo = x.properties.filter(v => v.name == ('PE-combo-item') && v.value.indexOf(cmb) > -1);
						if (findCombo.length > 0){
							itemInCombo.push(x);
						}
					});							 
					if (itemInCombo.length > 0) {
						for(var j = 0; j < itemInCombo.length; j++) {
							countPromo = countPromo + itemInCombo[j].quantity;
							html += renderHtmlOrderDetail(itemInCombo[j],'comboApp',lineCombo[i][j]);
						}
					}
					html += '</div>';

					$('#order_details .table-order').append(html);
				}
			}

			var promoGroup  = lineCombo.join(',').split(',');
			var promoGift   = lineGift.join(',').split(',');
			var promoDiscount  = lineDiscount.join(',').split(',');
			var promoSingle = lineGift.join(',').split(',');

			if(order.line_items.length > countPromo) {
				var htmlHead = '';
				var parent = null;
				if (countPromo >= 0) {
					htmlHead += '<div class="order-group single"></div>';
					$('#order_details .table-order').append(htmlHead);
				} 
				else {
					parent = $('#order_details .table-order');
				}
				for(var i = 0; i < order.line_items.length; i++) {
					if (!promoGroup.includes(i+"") && !promoGift.includes(i+"")) {
						var item = order.line_items[i];
						var htmlNormal =	renderHtmlOrderDetail(item,'',i,);
						$('#order_details .table-order .order-group.single').append(htmlNormal);
					}
				}
			}

		};

		var phone = $('#get_phone_order').val().trim();
		var email = $('#get_email').val();
		var ordernum = $('#get_id_order').val();
		var ordercode = $('#get_code_order').val();

		var paramUrl =  '/apps/smes/auth/api/orders/'+ordernum+'/detail';	
		setTimeout(function() {
			$.get(paramUrl).done(function(result){									
				var resultItem = result.item;
				
				console.log(result);
				//var resultItem = result.orders[0];		
				//renderHtmlTracking(result.orders[0]);
				if (result.item != null){
					renderHtmlTracking(resultItem);
					
					$('#shipping_method').html(resultItem.shipping_lines[0].code);
					if (resultItem.fulfillments.length > 0) {
						if (resultItem.fulfillments[0].carrier_status_code == 'delivered') {
							if (resultItem.pos_order_status == 'pos_cancel_refund' || resultItem.pos_order_status == 'pos_cancel_refund' || resultItem.pos_order_status == 'pos_cancel_restock') {
								$('.order-status').html('<strong style="color:#ff1100;">Huỷ - Trả hàng</strong>');
							}
							else {
								$('.order-status').html('<strong>'+resultItem.fulfillments[0].carrier_status_name+'</strong>');
							}
						}
						else if (resultItem.fulfillments[0].carrier_status_code == 'return') {	
							//if (resultItem.pos_order_status == 'pos_cancel_restock' ) {}
							$('.order-status').html('<strong style="color:#ff1100;">Huỷ - Trả hàng</strong>');

						}
						else if (resultItem.fulfillments[0].carrier_status_code == 'cancel' || resultItem.pos_order_status == 'pos_cancel_refund' ) {
							$('.order-status').html('<strong style="color:#ff1100;">'+resultItem.fulfillments[0].carrier_status_name+'</strong>');
						}
						else {
							$('.order-status').html('<strong>Chưa nhận hàng</strong>');
						}
					}
					else {
						if ( resultItem.pos_order_status == 'pos_cancel' ) {
							$('.order-status').html('<strong style="color:#ff1100;">Đã huỷ</strong>');
						}
						else {
							$('.order-status').html('<strong>Đang xử lý</strong>');
						}
					}

					if (resultItem.gateway_code == 'cod'){
						if(resultItem.pos_order_status == 'pos_complete'){
							$('#order_payment .info-box--body').html('<div>'+resultItem.gateway+'</div><div class="paid"><span><svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="14" height="14" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g fill-rule="evenodd" clip-rule="evenodd"><path fill="#1887db" d="M256 0C114.8 0 0 114.8 0 256s114.8 256 256 256 256-114.8 256-256S397.2 0 256 0z" opacity="1" data-original="#1887db" class=""></path><path fill="#ffffff" d="M379.8 169.7c6.2 6.2 6.2 16.4 0 22.6l-150 150c-3.1 3.1-7.2 4.7-11.3 4.7s-8.2-1.6-11.3-4.7l-75-75c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l63.7 63.7 138.7-138.7c6.2-6.3 16.4-6.3 22.6 0z" opacity="1" data-original="#ffffff"></path></g></g></svg>Thanh toán thành công <strong class="d-none">'+result.item.fulfillments[0].cod_amount+'</strong></span></div>');
						}
						else {
							$('#order_payment .info-box--body').html('<div>'+resultItem.gateway+'</div><div class="unpaid"><span><svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="14" height="14" x="0" y="0" viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="Flat Color"><circle cx="12" cy="12" r="10" fill="#ff1100" opacity="1" data-original="#ff1100" class=""></circle><path fill="#edebea" d="m13.06 12 2.47-2.47a.75.75 0 0 0-1.06-1.06L12 10.94 9.53 8.47a.75.75 0 0 0-1.06 1.06L10.94 12l-2.47 2.47a.75.75 0 0 0 0 1.06.75.75 0 0 0 1.06 0L12 13.06l2.47 2.47a.75.75 0 0 0 1.06 0 .75.75 0 0 0 0-1.06z" opacity="1" data-original="#edebea"></path></g></g></svg>Chưa thanh toán</span></div>');
						}
					}
					else {
						if(resultItem.pos_order_status == 'pos_pending'){
              var text_show = 'Chưa thanh toán';
              if(resultItem.financial_status == 'pending') text_show = 'Chờ thanh toán';
							$('#order_payment .info-box--body').html('<div>'+resultItem.gateway+'</div><div class="unpaid red"><span><svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="14" height="14" x="0" y="0" viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="Flat Color"><circle cx="12" cy="12" r="10" fill="#ff1100" opacity="1" data-original="#ff1100" class=""></circle><path fill="#edebea" d="m13.06 12 2.47-2.47a.75.75 0 0 0-1.06-1.06L12 10.94 9.53 8.47a.75.75 0 0 0-1.06 1.06L10.94 12l-2.47 2.47a.75.75 0 0 0 0 1.06.75.75 0 0 0 1.06 0L12 13.06l2.47 2.47a.75.75 0 0 0 1.06 0 .75.75 0 0 0 0-1.06z" opacity="1" data-original="#edebea"></path></g></g></svg>'+ text_show +'</span></div>');
						}
            else{
              if(resultItem.pos_order_status == 'pos_cancel'){
                var text_show = '';
                if(resultItem.financial_status == 'pending') text_show = 'Chờ thanh toán';
  							$('#order_payment .info-box--body').html('<div>'+resultItem.gateway+'</div><div class="unpaid red"><span><svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="14" height="14" x="0" y="0" viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="Flat Color"><circle cx="12" cy="12" r="10" fill="#ff1100" opacity="1" data-original="#ff1100" class=""></circle><path fill="#edebea" d="m13.06 12 2.47-2.47a.75.75 0 0 0-1.06-1.06L12 10.94 9.53 8.47a.75.75 0 0 0-1.06 1.06L10.94 12l-2.47 2.47a.75.75 0 0 0 0 1.06.75.75 0 0 0 1.06 0L12 13.06l2.47 2.47a.75.75 0 0 0 1.06 0 .75.75 0 0 0 0-1.06z" opacity="1" data-original="#edebea"></path></g></g></svg>'+text_show+'</span></div>');
  						}
  						else {
  							$('#order_payment .info-box--body').html('<div>'+resultItem.gateway+'</div><div class="paid"><span><svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="14" height="14" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g fill-rule="evenodd" clip-rule="evenodd"><path fill="#1887db" d="M256 0C114.8 0 0 114.8 0 256s114.8 256 256 256 256-114.8 256-256S397.2 0 256 0z" opacity="1" data-original="#1887db" class=""></path><path fill="#ffffff" d="M379.8 169.7c6.2 6.2 6.2 16.4 0 22.6l-150 150c-3.1 3.1-7.2 4.7-11.3 4.7s-8.2-1.6-11.3-4.7l-75-75c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l63.7 63.7 138.7-138.7c6.2-6.3 16.4-6.3 22.6 0z" opacity="1" data-original="#ffffff"></path></g></g></svg>Thanh toán thành công </span></div>');
  						}
            }
					}

					$('#order_customer .name-receive span:last-child').html(resultItem.shipping_address.name+' - '+resultItem.shipping_address.phone);
					$('#order_customer .address-receive span:last-child').html(resultItem.shipping_address.address1);

					$('#order_details .table-order').append(checkItemOrder(resultItem));

					$('#order_details_total .subtotal-price .line--r span').html(PDR.Helper.moneyFormat(resultItem.total_line_items_price,'₫'));
					if (resultItem.shipping_lines[0].price > 0){
						$('#order_details_total .shipping-fee .line--r span').html(PDR.Helper.moneyFormat(resultItem.shipping_lines[0].price,'₫'));
					}
					else {
						$('#order_details_total .shipping-fee .line--r span').html('Miễn phí');
					}
					if (resultItem.total_discounts > 0){
						$('#order_details_total .discounts-fee .line--r span').html('- ' + PDR.Helper.moneyFormat(resultItem.total_discounts,'₫'));
						$('#order_details_total .discounts-fee').removeClass('d-none');
					}

					$('#order_details_total .maintotal-price .line--r span').html(PDR.Helper.moneyFormat(resultItem.total_price,'₫'));

					//Check can cancel order
					var posStatus = resultItem.pos_order_status;
					var arrayPosStatus = ['pos_pending','pos_user_assigned','pos_confirmed','pos_store_assigned','pos_output','pos_out_of_stock','pos_stock_on_hand'];
					if(arrayPosStatus.includes(posStatus) && resultItem.is_available_cancel /*&& resultItem.source_name == 'web'*/){
						$('.view-orderdetail .js-cancel-order').removeClass('d-none');
					}	
				}
				else {
					$('.cus-order').html('<div class="alert-danger alert text-center">Đơn hàng này không thuộc tài khoản của bạn. Vui lòng đăng nhập đúng tài khoản để xem chi tiết đơn hàng!</div>')
				}
				$('.cus-order').removeClass('d-none');
			});
		},800); 

		/*Order Cancle*/
		$('body').on('click', '.view-orderdetail .js-cancel-order', function(e){
			e.preventDefault();
			Swal.fire({
				title: '',
				text: 'Bạn muốn huỷ đơn hàng này?',
				icon: 'question',
				showCancelButton: true,
				showConfirmButton: true,
				confirmButtonText: 'Có',
				cancelButtonText: 'Không',
			}).then((result) => {
				if (result.isConfirmed) {
					$('#cancel-order-modal').modal('show');
				} 
			})	
		});
		$('body').on('click', '#cancel-order-modal .btn-cancel-submit', function(e){
			//debugger;
			e.preventDefault();
			var noteReason = $('#cancel-reason-text').val();
			
			if (phone != '') {
				var dataPost = {
					order_number: ordercode,
					phone: phone,
					order_cancel_note: noteReason
				}
			}
			else {
				var dataPost = {
					order_number: ordercode,
					email: email,
					order_cancel_note: noteReason
				}
			}			
			
			$.ajax({
				url: '/apps/smes/auth/api/orders/cancel',
				type: 'POST',
				data: JSON.stringify(dataPost),
				contentType: 'application/json',
				dataType: 'JSON',
				success: function(data){
					console.log(data);
					if(data.error){
						PDR.Helper.SwalWarning(data.message,'Không thể xoá đơn hàng này!','warning',false,false,4000);
					}
					else{
						Swal.fire({
							title: '',
							text: 'Huỷ đơn hàng thành công!',
							icon: 'success',
							showCancelButton: false,
							showConfirmButton: false,
							timer: 3000,
						}).then((result) => {
							window.location.reload(); 
						})
					}
				}
			});
			
		});

	},
	initAddresses: {
		init: function(){
			var that = this;
			that.getAddresses();
			that.getProvinceAndDistrict();
			that.updateAddress();
			that.createAddress();
		},
		getAddresses: function(){
			function renderHtmlAddress(data) {
				var html = '';
				html +=	'<div id="line-address-'+data.id+'" class="user-address '+data.id+' '+ ((data.default)?"default":"")+'">';
				if (data.default){
					html +=		'<san class="label">Mặc định</san>';
				}
				html +=		'<div class="title"><span class="lastname">'+data.last_name+'</span> <span class="firstname">'+data.first_name+'</span> - <span class="phone">'+data.phone+'</span></div>';
				html +=		'<div class="desc">'+((data.address1 != null)?data.address1:"") + ((data.ward != null)?", "+data.ward:"") + ((data.district != null)?", "+data.district:"") + ((data.province != null)?", "+data.province:"") + ((data.country != null)?", "+data.country:"")+'</div>';
				html +=		'<div class="tag"><span>'+((data.company != null)?'Văn phòng':'Nhà riêng')+'</span></div>';
				html +=		'<div class="action">';
				html +=			'<a data-id="'+data.id+'" data-default="'+((data.default)?'1':'0')+'" data-first-name="'+data.first_name+'" data-last-name="'+data.last_name+'" data-phone="'+data.phone+'" data-province="'+data.province+'" data-provinceid="'+data.province_code+'" data-district="'+data.district+'" data-districtid="'+data.district_code+'" data-ward="'+data.ward+'" data-wardid="'+data.ward_code+'" data-address="'+data.address1+'" data-type="'+((data.company != null)?"Văn phòng":"Nhà riêng")+'" href="javascript:void(0);" class="action-edit js-edit-customer">';
				html +=				'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.379 13.144a.1.1 0 00-.03.062l-.125 1.386a.1.1 0 00.108.11l1.388-.127a.1.1 0 00.062-.029l9.717-9.699a.1.1 0 000-.141l-1.261-1.261a.1.1 0 00-.142 0l-9.717 9.7zM18.45 2.757a.1.1 0 010 .141L17.348 4a.1.1 0 01-.141 0l-1.262-1.26a.1.1 0 010-.142l1.104-1.101a.1.1 0 01.141 0l1.261 1.261zM17.191.082a.1.1 0 00-.142 0L4.416 12.692a.1.1 0 00-.03.062l-.267 2.943a.1.1 0 00.109.109l2.943-.268a.1.1 0 00.061-.029L19.866 2.9a.1.1 0 000-.141L17.19.082zm-6.362 2.089A.1.1 0 0010.76 2H.1a.1.1 0 00-.1.1v17.8a.1.1 0 00.1.1h17.8a.1.1 0 00.1-.1V9.241a.1.1 0 00-.17-.07l-.8.8a.1.1 0 00-.03.07V18.9a.1.1 0 01-.1.1H1.1a.1.1 0 01-.1-.1V3.1a.1.1 0 01.1-.1h8.859a.1.1 0 00.07-.03l.8-.8z" fill="#27251F"></path></svg>';
				html +=			'</a>';
				if (!data.default){
					html +=			'<a href="#" data-provincecode="'+data.province_code+'" data-districtcode="'+data.district_code+'" data-wardcode="'+data.ward_code+'" data-id="'+data.id+'" class="action-delete js-delete-customer">';
					html +=				'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" fill-rule="evenodd" class=""><g><path d="M10 16v38a7.998 7.998 0 0 0 8 8h28a7.998 7.998 0 0 0 8-8V16h-4v38a3.998 3.998 0 0 1-4 4H18a4.002 4.002 0 0 1-4-4V16zm10 6v28h4V22zm20 0v28h4V22zm-10 0v28h4V22zm-8-12H6v4h52v-4H42a8 8 0 0 0-8-8h-4a8 8 0 0 0-8 8zm16 0a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>';
					html +=			'</a>';
					html +=			'<a href="#" data-provincecode="'+data.province_code+'" data-districtcode="'+data.district_code+'" data-wardcode="'+data.ward_code+'" data-id="'+data.id+'" class="action-setup-df js-setdefault-customer">';
					html +=				'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 682.667 682.667" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><defs><clipPath id="a" clipPathUnits="userSpaceOnUse"><path d="M0 512h512V0H0Z" fill="#000000" opacity="1" data-original="#000000"></path></clipPath></defs><g clip-path="url(#a)" transform="matrix(1.33333 0 0 -1.33333 0 682.667)"><path d="M0 0a191.783 191.783 0 0 0 49.719-20.638l15.688 15.69a32.121 32.121 0 0 0 22.727 9.415 32.116 32.116 0 0 0 22.718-9.415l22.718-22.719a32.11 32.11 0 0 0 9.415-22.718 32.113 32.113 0 0 0-9.415-22.726L117.881-88.8a191.838 191.838 0 0 0 20.638-49.719h22.147c17.746 0 32.134-14.388 32.134-32.133v-32.134c0-17.745-14.388-32.133-32.134-32.133h-22.147a191.831 191.831 0 0 0-20.638-49.718l15.689-15.689a32.117 32.117 0 0 0 9.415-22.727 32.11 32.11 0 0 0-9.415-22.718l-22.718-22.718a32.112 32.112 0 0 0-22.718-9.415 32.117 32.117 0 0 0-22.727 9.415L49.719-352.8A191.78 191.78 0 0 0 0-373.437v-22.148c0-17.746-14.388-32.134-32.134-32.134h-32.133c-17.746 0-32.133 14.388-32.133 32.134v22.148a191.78 191.78 0 0 0-49.719 20.637l-15.689-15.689a32.115 32.115 0 0 0-22.726-9.415 32.108 32.108 0 0 0-22.718 9.415l-22.719 22.718a32.114 32.114 0 0 0-9.415 22.718 32.121 32.121 0 0 0 9.415 22.727l15.69 15.689a191.796 191.796 0 0 0-20.638 49.718h-22.147c-17.746 0-32.134 14.388-32.134 32.133v32.134c0 17.745 14.388 32.133 32.134 32.133h22.147A191.803 191.803 0 0 0-214.281-88.8l-15.69 15.689a32.117 32.117 0 0 0-9.415 22.726 32.114 32.114 0 0 0 9.415 22.718l22.719 22.719a32.112 32.112 0 0 0 22.718 9.415 32.119 32.119 0 0 0 22.726-9.415l15.689-15.69A191.783 191.783 0 0 0-96.4 0v22.148c0 17.746 14.387 32.133 32.133 32.133h32.133C-14.388 54.281 0 39.894 0 22.148Z" style="stroke-width:30;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1" transform="translate(304.2 442.719)" fill="none" stroke="#000000" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-dasharray="none" stroke-opacity="" data-original="#000000" class=""></path><path d="M0 0c53.205 0 96.4-43.195 96.4-96.4 0-53.204-43.195-96.4-96.4-96.4-53.205 0-96.4 43.196-96.4 96.4C-96.4-43.195-53.205 0 0 0Z" style="stroke-width:30;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1" transform="translate(256 352.4)" fill="none" stroke="#000000" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-dasharray="none" stroke-opacity="" data-original="#000000" class=""></path></g></g></svg>';
					html +=			'</a>';
				}
				html +=		'</div>';
				html +=	'</div>';
				return html;	 
			}
			var paramUrl =  '/apps/smes/auth/api/customers/addresses';
			setTimeout(function() {
				$.get(paramUrl).done(function(result){									
					var resultItem = result.data;
					$('.js-render-addresses').html('');
					for (var i=0, l=resultItem.length; i<l; i++){
						$('.js-render-addresses').append(renderHtmlAddress(resultItem[i]));
					}
				});
			},1000);
		},
		getProvinceAndDistrict: function(){
			/* Get list countries */
			countries = addressData.countries;
			let countryId = 241;
			let provinces = addressData[countryId];
			$.each(provinces.provinces, function(i, data) {
				$('select[name="address[province]"]').append('<option value="' + data.n + '" data-province="'+ data.i + '" data-code="'+ data.c +'">' + data.n + '</option>');
			});
			$(document).on('change','select[name="address[province]"]',function(e){
				let provinceName = $(this).val();
				let	provinceId = $(this).find('option[value="'+provinceName+'"]').attr('data-province');
				let	provinceCode = $(this).find('option[value="'+provinceName+'"]').attr('data-code');
				if($('.modal-address.show select[name="address[district]"] option').length > 1){ 
					$('.modal-address.show select[name="address[district]"] option:not(:first-child)').remove();
				}
				if($('.modal-address.show select[name="address[ward]"] option').length > 1){
					$('.modal-address.show select[name="address[ward]"] option:not(:first-child)').remove();
				}
				if(provinceName != '' && countryId == 241){
					async function getDistrict(){
						districts = await addressData.getProvince(countryId, provinceId);
						if(!jQuery.isEmptyObject(districts)){
							if($('.modal-address.show select[name="address[district]"] option').length > 1){
								$('.modal-address.show select[name="address[district]"] option:not(:first-child)').remove();
							}
							$.each(districts.districts,function(indx,vlue){
								if(provinceId === '50') {
									if (vlue.n === 'Quận 2' || vlue.n === 'Quận 9' || vlue.n === 'Quận Thủ Đức') {
										return;
									}
								}
								$('.modal-address.show select[name="address[district]"]').append('<option data-district="'+vlue.i+'" value="'+vlue.n+'" data-code="'+vlue.c+'">'+vlue.n+'</option>');					
							});
						}
					}
					getDistrict();
				}
			});
			$(document).on('change','select[name="address[district]"]',function(e){
				let provinceName = $('.modal-address.show select[name="address[province]"]').val(),
						districtName = $(this).val();

				let provinceId = 		$('.modal-address.show select[name="address[province]"] option[value="'+provinceName+'"]').attr('data-province'),
						provinceCode = 	$('.modal-address.show select[name="address[province]"] option[value="'+provinceName+'"]').attr('data-code'),
						districtId = 		$(this).find('option[value="'+districtName+'"]').attr('data-district'),
						districtCode = 	$(this).find('option[value="'+districtName+'"]').attr('data-code');

				if($('.modal-address.show select[name="address[ward]"] option').length > 1){
					$('.modal-address.show select[name="address[ward]"] option:not(:first-child)').remove();
				}

				if(districtId != '' && districtId != undefined ){
					async function getWard(){
						districts = await addressData.getProvince(countryId, provinceId);
						if(!jQuery.isEmptyObject(districts)){
							let wards = districts[districtId].wards;
							if(wards.length > 0){
								if($('.modal-address.show select[name="address[ward]"] option').length > 1){
									$('.modal-address.show select[name="address[ward]"] option:not(:first-child)').remove();
								}

								$.each(wards,function(indx,vlue){
									$('.modal-address.show select[name="address[ward]"]').append('<option data-ward="'+vlue.i+'" value="'+vlue.n+'" data-code="'+vlue.i+'">'+vlue.n+'</option>');
								});
							}
						}
					}
					getWard();
				}
			});
		},
		updateAddress: function(){	
			$('body').on('click', '.user-address .js-edit-customer', function(e){
				e.preventDefault();
				$('#address_form input[type="text"]').val();
				$('#address_form select option[value=""]').prop('selected',true);
				$('#address_form input[type="checkbox"]').val('0');

				var id_address = $(this).attr('data-id'),
						last_name =  $(this).attr('data-last-name'),
						first_name = $(this).attr('data-first-name'),
						phone = $(this).attr('data-phone'),
						province = $(this).attr('data-province'),
						province_id = $(this).attr('data-provinceid'),
						district = $(this).attr('data-district'),
						district_id = $(this).attr('data-districtid'),
						ward = $(this).attr('data-ward'),
						ward_id = $(this).attr('data-wardid'),
						address = $(this).attr('data-address'),
						type = $(this).attr('data-type'),
						df_address =  $(this).attr('data-default');

				$('#address_form').attr('data-id',id_address);
				$('#address_form input[name="address[last_name]"]').val(last_name);
				$('#address_form input[name="address[first_name]"]').val(first_name);
				$('#address_form input[name="address[phone]"]').val(phone);
				if (province != '') {
					$('#address_form select[name="address[province]"]').val(province).change();
					async function getDistrict(){
						districts = await addressData.getProvince(241, province_id);
						if(!jQuery.isEmptyObject(districts)){
							if($('#address_form select[name="address[district]"] option').length > 1){
								$('#address_form select[name="address[district]"] option:not(:first-child)').remove();
							}
							$.each(districts.districts,function(indx,vlue){
								if(province_id === '50') {
									if (vlue.n === 'Quận 2' || vlue.n === 'Quận 9' || vlue.n === 'Quận Thủ Đức') {
										return;
									}
								}
								$('#address_form select[name="address[district]"]').append('<option data-district="'+vlue.i+'" value="'+vlue.n+'" data-code="'+vlue.c+'" '+(vlue.i == district_id?'selected':'')+'>'+vlue.n+'</option>');
							});
						}

						let wards = districts[district_id].wards;
						if(wards.length > 0){
							if($('#address_form select[name="address[ward]"] option').length > 1){
								$('#address_form select[name="address[ward]"] option:not(:first-child)').remove();
							}
							$.each(wards,function(indx,vlue){
								$('#address_form select[name="address[ward]"]').append('<option data-ward="'+vlue.i+'" value="'+vlue.n+'"'+(vlue.i == ward_id?'selected':'')+' data-code="'+vlue.i+'">'+vlue.n+'</option>');
							});
						}	
					}
					getDistrict();		
				}

				$('#address_form input[name="address[address1]"]').val(address);
				$('#address_form input[name="address[type]"][value="'+type+'"]').prop('checked',true);
				$('#address_form input[name="address[default]"]').val(df_address);
				if ($('#address_form input[type="text"]').val().length > 0) {
					$('#address_form input').addClass('is-filled');
				}

				$('#editAddressModal').modal();
			});
			$('#address_form').submit(function(e){
				e.preventDefault();
				var id_address = $(this).attr('data-id');
				var //fullName = $(this).find('input[name="address[fullname]"]').val().split(' '),
				last_name = $('.modal-address.show #address_lastname').val(),//fullName[0],
						first_name = $('.modal-address.show #address_firstname').val(),//fullName.slice(1,fullName.length).join(' '),
						phone = $('#address_form').find('input[name="address[phone]"]').val(),
						province = $('#address_form').find('select[name="address[province]"] option:selected').val(),
						province_code = $('#address_form').find('select[name="address[province]"] option:selected').attr('data-code'),
						district = $('#address_form select[name="address[district]"] option:selected').val(),
						district_code = $('#address_form select[name="address[district]"] option:selected').attr('data-code'),
						ward = $('#address_form select[name="address[ward]"] option:selected').val(),
						ward_code = $('#address_form select[name="address[ward]"] option:selected').attr('data-code'),
						address = $('#address_form input[name="address[address1]"]').val(),
						type = $('#address_form input[name="address[type]"]:checked').val(),
						df_address = $('#address_form input[name="address[default]"]:checked').val();;

				var allowSubmit = true;

				//Kiểm tra đúng định dạng
				if(!PDR.Helper.checkPhone(phone)){
					$('#address_form').find('input[name="address[phone]"]').parents('.form-group').addClass('is-invalid');
					allowSubmit = false;
				}
				else $('#address_form').find('input[name="address[phone]"]').parents('.form-group').removeClass('is-invalid');

				if(allowSubmit){
					var data = {
						"ward_code": ward_code,
						"ward": ward,
						"district_code": district_code,
						"district": district,
						"province_code": province_code,
						"province": province,
						"phone": phone,
						"last_name": last_name,
						"first_name": first_name,
						"country_code": "VN",
						"country": "Vietnam",
						"company": type,
						"address1": address,
						"address2": ''
					};
					$.ajax({
						url: '/apps/smes/auth/api/customers/addresses/'+id_address+'/update',
						type: 'POST',
						data: JSON.stringify(data),
						contentType: 'application/json',
						dataType: 'JSON',
						success: function(data){
							if(data.error){
								PDR.Helper.SwalWarning(data.message,'Vui lòng kiểm tra lại thông tin!','warning',false,false,4000);
							}
							else{
								$('#editAddressModal').modal('hide');
								Swal.fire({
									title: '',
									text: 'Địa chỉ đã được cập nhật thành công!',
									icon: 'success',
									showCancelButton: false,
									showConfirmButton: false,
									timer: 4000,
								}).then((result) => {
									setTimeout(function(){
										window.location.reload(); 
									},1500);
								})
							}
						}
					});
				}
			});
			
			$('body').on('click', '.user-address .js-setdefault-customer', function(e){
				e.preventDefault();
				var id_address = $(this).attr('data-id');
				var data = {
					"ward_code": $(this).attr('data-wardcode'),
					"ward": $(this).parents('.address_actions').find('.action_edit a').attr('data-ward'),
					"district_code": $(this).attr('data-districtcode'),
					"district": $(this).parents('.address_actions').find('.action_edit a').attr('data-district'),
					"province_code": $(this).attr('data-provincecode'),
					"province": $(this).parents('.address_actions').find('.action_edit a').attr('data-province'),
					"phone": $(this).parents('.address_actions').find('.action_edit a').attr('data-phone'),
					"last_name": $(this).parents('.address_actions').find('.action_edit a').attr('data-last-name'),
					"first_name": $(this).parents('.address_actions').find('.action_edit a').attr('data-first-name'),
					"country_code": "VN",
					"country": "Vietnam",
					"company": $(this).parents('.address_actions').find('.action_edit a').attr('data-type'),
					"address1": $(this).parents('.address_actions').find('.action_edit a').attr('data-address'),
					"address2": '',
					"default": true
				};
				$.ajax({
					url: '/apps/smes/auth/api/customers/addresses/'+id_address+'/default',
					type: 'POST',
					data: JSON.stringify(data),
					contentType: 'application/json',
					dataType: 'JSON',
					success: function(data){
						if(data.error){
							PDR.Helper.SwalWarning(data.message,'Vui lòng kiểm tra lại thông tin!','warning',false,false,4000);
						}
						else{
							Swal.fire({
								title: '',
								text: 'Thiết lập mặc định thành công!',
								icon: 'success',
								showCancelButton: false,
								showConfirmButton: false,
								timer: 3000,
							}).then((result) => {
								window.location.reload(); 
							})
						}
					}
				});
			});
			$('body').on('click', '.user-address .js-delete-customer', function(e){
				e.preventDefault();
				var id_address = $(this).attr('data-id');
				var data = {};

				Swal.fire({
					title: '',
					text: 'Bạn muốn xoá địa chỉ này?',
					icon: 'question',
					showCancelButton: true,
					showConfirmButton: true,
					confirmButtonText: 'Có',
					cancelButtonText: 'Không',
				}).then((result) => {
					if (result.isConfirmed) {
						$.ajax({
							url: '/apps/smes/auth/api/customers/addresses/'+id_address+'/delete',
							type: 'POST',
							data: JSON.stringify(data),
							contentType: 'application/json',
							dataType: 'JSON',
							success: function(data){
								if(data.error){
									PDR.Helper.SwalWarning(data.message,'Vui lòng kiểm tra lại thông tin!','warning',false,false,4000);
								}
								else{
									Swal.fire({
										title: '',
										text: 'Xoá địa chỉ thành công!',
										icon: 'success',
										showCancelButton: false,
										showConfirmButton: false,
										timer: 3000,
									}).then((result) => {
										window.location.reload(); 
									})
								}
							}
						});
					} 
				})	
			});
		},
		createAddress: function(){
			$(document).on('click','.user-address #js-btn-addnew',function(e){
				e.preventDefault();
				$('#addNewAddressModal').modal('show');
			});
			$('#address_form_new').submit(function(e){
				e.preventDefault();
				var //fullName = $(this).find('input[name="address[fullname]"]').val().split(' '),
				last_name = $('.modal-address.show #address_lastname_new').val(),//fullName[0],
						first_name = $('.modal-address.show #address_firstname_new').val(),//fullName.slice(1,fullName.length).join(' '),
						phone = $('#address_form_new').find('input[name="address[phone]"]').val(),
						province = $('#address_form_new').find('select[name="address[province]"] option:selected').val(),
						province_code = $('#address_form_new').find('select[name="address[province]"] option:selected').attr('data-code'),
						district = $('#address_form_new select[name="address[district]"] option:selected').val(),
						district_code = $('#address_form_new select[name="address[district]"] option:selected').attr('data-code'),
						ward = $('#address_form_new select[name="address[ward]"] option:selected').val(),
						ward_code = $('#address_form_new select[name="address[ward]"] option:selected').attr('data-code'),
						address = $('#address_form_new input[name="address[address1]"]').val(),
						type = $('#address_form_new input[name="address[type]"]:checked').val(),
						df_address = $('#address_form_new input[name="address[default]"]:checked').val();;

				var allowSubmit = true;

				//Kiểm tra đúng định dạng
				if(!PDR.Helper.checkPhone(phone)){
					$('#address_form_new').find('input[name="address[phone]"]').parents('.form-group').addClass('is-invalid');
					allowSubmit = false;
				}
				else $('#address_form_new').find('input[name="address[phone]"]').parents('.form-group').removeClass('is-invalid');

				if(allowSubmit){
					var data = {
						"ward_code": ward_code,
						"ward": ward,
						"district_code": district_code,
						"district": district,
						"province_code": province_code,
						"province": province,
						"phone": phone,
						"last_name": last_name,
						"first_name": first_name,
						"country_code": "VN",
						"country": "Vietnam",
						"company": type,
						"address1": address,
						"address2": ''
					};
					$.ajax({
						url: '/apps/smes/auth/api/customers/addresses/create',
						type: 'POST',
						data: JSON.stringify(data),
						contentType: 'application/json',
						dataType: 'JSON',
						success: function(data){
							if(data.error){
								PDR.Helper.SwalWarning(data.message,'Vui lòng kiểm tra lại thông tin!','warning',false,false,4000);
							}
							else{
								$('#addNewAddressModal').modal('hide');
								if (template === 'customers[account]') {
									Swal.fire({
										title: '',
										text: 'Địa chỉ mới đã được tạo thành công!',
										icon: 'success',
										showCancelButton: false,
										showConfirmButton: false,
										timer: 4000,
									}).then((result) => {
										window.location = '/account/addresses';
									});
								}
								else {
									Swal.fire({
										title: '',
										text: 'Địa chỉ mới đã được tạo thành công!',
										icon: 'success',
										showCancelButton: false,
										showConfirmButton: false,
										timer: 4000,
									}).then((result) => {
										setTimeout(function(){
											window.location.reload(); 
										},1500);
									});
								}
							}
						}
					});
				}
			});
		}
	},
	wishlist: function(){
		$(document).on('click','#js-wishlist-removeall',function(e){
			e.preventDefault();
			$.ajax({
				type: 'POST',
				url: 'https://onapp.haravan.com/wishlist/frontend/api/removealllike',
				data: {
					shop: window.Haravan.shop,
					customer_id: window.account.id
				},
				success: function(data_response) {
					if(data_response && data_response.err){
						console.error(data_response.message);
					}else {
						window.location.reload(); 
					}
				}
			})
		});
	}
}
PDR.Search = {
	totalPageItem: 0,
	init: function(){
		var that = this;
		that.searchApi();
	},
	searchApi: function(){
		var limit = 20;
		var keySearch = '';
		
		function loadItems(page,keySearch){
			if( keySearch != '' ) {
				var url = '/search.js?q=filter=((title:product ** '+keySearch+')||(tag:product ** '+keySearch+')||(sku:product ** '+keySearch+')||(barcode:product ** '+keySearch+'))&include=metafields[product]&page=' + page + '&limit=' + limit ;
				$.ajax({
					type: 'GET',
					url: url,
					success: function(data){

						if (data.total > 0) {
							PDR.Search.totalPageItem = Math.ceil(data.total / limit);
							if(page < PDR.Search.totalPageItem){
								$('#js-btn-more').attr('data-current',page+1);
								$('#js-btn-more').attr('data-pages',PDR.Search.totalPageItem);
								$('#js-btn-more').parents('.results-more').removeClass('d-none').addClass('d-flex');
							}
							else{
								$('#js-btn-more').parents('.results-more').addClass('d-none').removeClass('d-flex');
							}

							$('.search-result-count').html(data.total + ' kết quả cho từ khoá ' + '<span class="search-keywords">' +keySearch+ '</span>');
							if(data.hasOwnProperty('products')){
								var items = '';
								data.products.map((item,ind) => {
									var number_loop = limit*(page - 1) + (ind + 1);
									items += `<div class="product-tile product-loop ${number_loop}">` + PDR.Global.renderLoop(item,number_loop) + `</div>`;
								});
								$('.js-results-render').append(items);
							}
							else {
								var empty = "<div class='empty'>"+ textMain.text25 +"</div>";
								$('.js-results-render').html(empty);
								$('#js-btn-more').attr('data-current','').parents('.results-more').addClass('d-none').removeClass('d-flex');
							}
						}
						else {
							$('.search-results').addClass('d-none');
							$('.expanded-message').removeClass('d-none');
							
						}
						$('#mainLoading').removeClass('active');
					},
					error: function(){}
				});
			}
			else {
				alert('Vui lòng nhập từ khoá');
			}
		}
		
		$(document).on('click','#search-page form #go',function(e){
			e.preventDefault();
			$('#mainLoading').addClass('active');
			var q = $(this).parents('form').find('input[name=q]').val();
			keySearch = q;
			if ($('.js-results-render').length > 0){
				$('.js-results-render').html('');
			}
			loadItems(1,q);
		});
		$(document).on('click','#js-btn-more',function(e){
			e.preventDefault();
			var page = Number($(this).attr('data-current'));
			var q = $('#search-page form input[name=q]').val();
			loadItems(page,q);
		});		
		$(document).ready(function() {
			if (!$.isEmptyObject(paramUrl)) { // check paramUrl khác rỗng
				$('#mainLoading').addClass('active');
				if (paramUrl.hasOwnProperty('q')) {
					if(paramUrl.q != undefined){
						keySearch = paramUrl.q;
						$('.js-results-render').html('');
						loadItems(1,keySearch);
					}
				}
				else {
					$('.search-results').addClass('d-none');
					$('.expanded-message').removeClass('d-none');
					$('#mainLoading').removeClass('active');
				}
			}
			else {
				$('.search-results').addClass('d-none');
				$('.expanded-message').removeClass('d-none');
				$('#mainLoading').removeClass('active');
			}
		});		
	},
}

var resultSearchPr = null;
PDR.Cart = {
  disableVoucher_B3G2 : false,
	dataGiftPE: {},
	dataDiscountPE: {},
	dataBXSYPE: {},
	provinces: {},
	picked_data: {},
	checkout: null,
	isInputCoupon: false,
	init: function(){
		var that = this;
		that.invoince.init();
		that.submitCheckout();
		//that.getStore();
		that.changeProvince();
		that.changeDistrict();
		//that.pickUpStore();
		that.getAPI();
		that.couponActions();
		that.renderAppPE();
		PDR.Helper.viewedProduct();
		PDR.Product.giftPacking();
		that.btnUpdateLineItemModal();
    that.newBlockProduct();
	},
	btnUpdateLineItemModal: function(){
		$(document).on('click', '#qv-btn-updateCart', function(e){
			e.preventDefault();
			var line = $(this).attr('data-line');
			var isValid = true;
			var text1 = 'Thông báo', 
					text2 = 'ĐÃ THÊM VÀO GIỎ HÀNG',
					text3 = 'Mỗi sản phẩm chỉ được mua với số lượng tối đa là 10';

			$('.select-swatch .swatch:not(.no-render)').each(function(){
				if($(this).find('.select-swap').html() != '' && $(this).find('.select-swap .sd').length == 0){
					isValid = false;
				}
			});
			//if(isValid){
			$('#mainLoading').addClass('active');
			$('#qv-btn-updateCart').addClass('loading');

			var quantity = parseInt($('#qv-input-quantity').val());
			var id = PDR.Quickview.current_variant.id;
			var	dataAdd = {
				id: id, 
				quantity: quantity
			};
			var acceptBuy = true;

			if(cartJS.items.length > 0){
				cartJS.items.filter(x => {
					if(x.variant_id == id){
						if((x.quantity + quantity) > 5){
							acceptBuy = false;
						}
					}
				});
			}
			else {
				if(quantity > 10){
					acceptBuy = false;
				}
			}

			var param = {
				type: 'POST',
				url: '/cart/add.js',
				data: dataAdd,
				dataType: 'json',
				success: function(line_item) {
					location.reload();
				},
				error: function(XMLHttpRequest, textStatus) {
					if ( XMLHttpRequest.status == 422 ){
						PDR.Helper.SwalWarning("Thông báo","Đã có lỗi xảy ra",'error',false,false,2000);
						$('#mainLoading').removeClass('active');

					}
				}
			}

			if(acceptBuy){
				$.get('/cart/change?line='+line+'&quantity=0', function(){
					$.ajax(param);
				});
			}
			else {
				PDR.Helper.SwalWarning(text1,text3,'error',false,false,2000);
				$('#mainLoading').removeClass('active');
			}
		});
	},
	cartRender: {
		init: function(){
			var that = this;
			that.cartOrder();
			that.comboNewFunction();
			that.changeItemCart();
		},
		renderLineItem: function (resultItem,type,line) {
			var itemOjProperties = {}
			var htmlLine = '';

      var classEngraving = '';
      if(resultItem.properties.front_capture || resultItem.properties.back_capture) {
        classEngraving = 'is-Engraving';
      }
      
			htmlLine +=	'<div class="'+classEngraving+' item line-item line-item-container '+ (resultItem.price > 0 ? ' ':'item-0d')  +'" data-id="'+resultItem.id+'" data-line="'+(line+1)+'" data-variant-id="'+resultItem.variant_id+'" data-pro-id="'+resultItem.product_id+'">';
			htmlLine +=		'<div class="left">';
			htmlLine +=			'<div class="item-img">';
			htmlLine +=				'<a href="'+resultItem.url+'">';
			if ( resultItem.image == null ) {
				htmlLine +=					'<img src="//theme.hstatic.net/200000636033/1001033735/14/no-image.jpg" alt="'+resultItem.title+'" />';
			}
			else {
				htmlLine +=					'<img src="'+resultItem.image+'" alt="'+resultItem.title+'" />';
			}
			htmlLine +=				'</a>';
			htmlLine +=			'</div>';
			htmlLine +=		'</div>';

			htmlLine +=		'<div class="right">';
			htmlLine +=			'<div class="item-info">';
			htmlLine +=				'<h3><a href="'+resultItem.url+'">'+resultItem.title+'</a></h3>';
			
			var tags_arr = resultItem.inAdmin != undefined ? resultItem.inAdmin.tags : [];
			var hasFullPrice = false;
			var fullPrice = tags_arr.filter(x => x.indexOf('fullprice') > -1);
			var newComparePrice = '';

			if(tags_arr.includes('HPNYMD') && fullPrice.length > 0 ){
				hasFullPrice = true;
				newComparePrice = Haravan.formatMoney((Number(fullPrice[0].split(':')[1])),shop.moneyFormat);
			}		
			
			/*
			if(tags_arr.includes('freeship')){
				htmlLine +=			'<div class="item-promo freeship">';
				htmlLine +=			'Nhập mã	<label class="alert-primary">FREESHIP</label> để được miễn phí ship';
				htmlLine +=			'</div>';
			}	*/
			
			htmlLine +=					'<div class="item-desc">';
     
      if(resultItem.inAdmin != undefined){
  			if(resultItem.variant_options.length > 2 && resultItem.variant_options[0] != 'Default Title' && resultItem.variant_options[0] != 'Default tittle' ) {
  				htmlLine +=						'<div class="variant-option"><span class="title">'+resultItem.inAdmin.options[0].name+':</span><span class="text">'+resultItem.variant_options[0]+'</span></div>';
  				htmlLine +=						'<div class="variant-option"><span class="title">'+resultItem.inAdmin.options[1].name+':</span><span class="text">'+resultItem.variant_options[1]+'</span></div>';
  			}
  			else {
  				if(resultItem.variant_options[0] != 'Default tittle'  && resultItem.variant_options[0] != 'Default Title' ) {
  					htmlLine +=					'<div class="variant-option"><span class="title">'+resultItem.inAdmin.options[0].name+':</span><span class="text">'+resultItem.variant_options.join(' / ')+'</span></div>';
  				}
  			}
      }

      //engraving
      if(resultItem.properties.front_capture || resultItem.properties.back_capture) {
        htmlLine += '<div class="wrap-detail-engraving">';
        if(resultItem.properties.front_capture_data){
          htmlLine += '<div class="item-properties-engraving">';
          htmlLine += '<div class="head-item-engraving">Mặt trước</div>';
          htmlLine += '<div class="wrap-text-detail-engraving">';
          if(resultItem.properties.front_capture) {
            htmlLine += '<div class="img-item-engraving">';
            htmlLine +=		'<a data-fancybox="gallery'+resultItem.id+'" href="'+resultItem.properties.front_capture+'">';
            htmlLine +=			'<img src="'+resultItem.properties.front_capture+'" alt="front"/>';
            htmlLine +=		'</a>';
            htmlLine += '</div>';
          }
          if(resultItem.properties.front_capture_data.indexOf('|_|') != -1){
            var part = resultItem.properties.front_capture_data.split('|_|');
            htmlLine += '<div class="wrap-detail-info-engraving">';
            //htmlLine += '<span>'+part[0]+'</span>';
            htmlLine += '<span>'+part[1]+'</span>';
            htmlLine += '<span>'+part[2]+'</span>';
            htmlLine += '</div>';
          }
          else {
            htmlLine += '<span>'+resultItem.properties.front_capture_data+'</span>';
          }
          htmlLine += '</div>';
          htmlLine += '</div>';
        }
        if(resultItem.properties.back_capture_data){
          htmlLine += '<div class="item-properties-engraving">';
          htmlLine += '<div class="head-item-engraving">Mặt sau</div>';
          htmlLine += '<div class="wrap-text-detail-engraving">';
          if(resultItem.properties.back_capture) {
            htmlLine += '<div class="img-item-engraving">';
            htmlLine +=		'<a data-fancybox="gallery'+resultItem.id+'" href="'+resultItem.properties.back_capture+'">';
            htmlLine +=			'<img src="'+resultItem.properties.back_capture+'" alt="front"/>';
            htmlLine +=		'</a>';
            htmlLine += '</div>';
          }
          if(resultItem.properties.back_capture_data.indexOf('|_|') != -1){
            var part = resultItem.properties.back_capture_data.split('|_|');
            htmlLine += '<div class="wrap-detail-info-engraving">';
            //htmlLine += '<span>'+part[0]+'</span>';
            htmlLine += '<span>'+part[1]+'</span>';
            htmlLine += '<span>'+part[2]+'</span>';
            htmlLine += '</div>';
          }
          else {
            htmlLine += '<span>'+resultItem.properties.back_capture_data+'</span>';
          }
          htmlLine += '</div>';
          htmlLine += '</div>';
        }
        htmlLine += '</div>';

        htmlLine += '<div class="wrap-box-engraving">';
        htmlLine += '<label>T&C:</label>';
        htmlLine += '<ul>';
        htmlLine += '<li>Phí khắc bao gồm cả hai mặt.</li>';
        htmlLine += '<li>Một khi sản phẩm đã được khắc, đơn hàng sẽ được xem là giá bán cuối cùng.';
        htmlLine += '</ul>';
        htmlLine += '</div>';
        
        htmlLine += '<div class="edit-capture d-none" data-handle="'+resultItem.properties.product_handle+'">Chỉnh sửa</div>';
      }
      //engraving
      
			htmlLine +=					'</div>';
			
			if (!$.isEmptyObject(PDR.Cart.dataDiscountPE)) {
				$.each(PDR.Cart.dataDiscountPE, function(keyDiscountPE,htmlDiscountPE){
					if(resultItem.properties.hasOwnProperty('PE-buy-discount-item-buy ' + keyDiscountPE) && resultItem.properties.hasOwnProperty('PE-buy-discount-item ' + keyDiscountPE)) {
						htmlLine += htmlDiscountPE;
					}
				})
			}
			
			/* style Cũ
			if (!$.isEmptyObject(PDR.Cart.dataGiftPE)) {
				$.each(PDR.Cart.dataGiftPE, function(keyGiftPE,htmlGiftFE){
					if(resultItem.properties.hasOwnProperty('PE-gift-item-buy ' + keyGiftPE)) {
						htmlLine += htmlGiftFE;
					}
				})
			}
			*/
			
			htmlLine +=			'</div>';
			
			htmlLine +=			'<div class="item-meta">';
			if (type == 'comboApp' ){
				if (resultItem.price > 0){
					if(resultItem.price_original > resultItem.price) {
						htmlLine +=			'<div class="item-price">';
						htmlLine +=				'<span>'+ PDR.Helper.moneyFormat(resultItem.price/100,'₫')+'</span>';
						htmlLine +=				'<del>'+ PDR.Helper.moneyFormat(resultItem.price_original/100,'₫')+'</del>';
						htmlLine +=			'</div>';
					}
					else {
						htmlLine +=			'<div class="item-price"><span>'+ PDR.Helper.moneyFormat(resultItem.price/100,'₫')+'</span></div>';
					}
				}
				else {
					htmlLine +=			'<div class="item-price"></div>';
				}
				
				htmlLine +=			'<div class="item-quan">';
				htmlLine +=				'<span class="txt_qty d-none">'+resultItem.quantity+'</span>';
				htmlLine +=				'<span>'+resultItem.quantity+'</span>';
				htmlLine +=				'<input data-vid="'+resultItem.variant_id+'" data-quantity="'+resultItem.quantity+'" data-product="'+resultItem.product_id+'" type="text" size="4" name="updates[]" min="1" id="updates_'+resultItem.variant_id+'" data-price="'+resultItem.price+'" value="'+resultItem.quantity+'" class="tc line-item-qty item-quantity d-none">';
				htmlLine +=			'</div>';
			}
			else {
        
				if (resultItem.price > 0){
					if(resultItem.price_original > resultItem.price) {
						htmlLine +=			'<div class="item-price">';
						htmlLine +=				'<span>'+ PDR.Helper.moneyFormat(resultItem.price / 100,'₫')+'</span>';

						if (hasFullPrice){
							htmlLine +=				'<del class="has-fullprice">'+newComparePrice+'</del>';
						}
						else {
							htmlLine +=				'<del>'+PDR.Helper.moneyFormat(resultItem.price_original / 100,'₫')+'</del>';
						}
						htmlLine +=			'</div>';
					}
					else {
						//var checkVr = proInCartJS[resultItem.product_id].variants[resultItem.variant_id];
						var checkVr = proInCartJS[resultItem.product_id].variants.filter(variant => variant.id == resultItem.variant_id);
    				if (checkVr.length > 0){ //Old Condition: checkVr != undefined
              checkVr = checkVr[0];
    					
							htmlLine +=			'<div class="item-price">';
							htmlLine +=				'<span>'+PDR.Helper.moneyFormat(resultItem.price / 100,'₫')+'</span>';
							if (hasFullPrice){
								htmlLine +=				'<del class="has-fullprice">'+newComparePrice+'</del>';
							}
							else {
								if (checkVr.compare_at_price > resultItem.price) {
									htmlLine +=			'<del>'+PDR.Helper.moneyFormat(checkVr.compare_at_price / 100,'₫')+'</del>';
								}
							}
							htmlLine +=			'</div>';
						}
					}

					htmlLine +=			'<div class="item-quan">';
					htmlLine +=				'<span class="txt_qty d-none">'+resultItem.quantity+'</span>';
					htmlLine +=				'<div class="qty quantity-partent qty-click">';

					if(resultItem.quantity > 1){
						htmlLine +=					'<button type="button" class="qtyminus qty-btn">';
						htmlLine += 					'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.3332 8H7.99984H2.6665" stroke="#111111" stroke-width="2" stroke-linecap="round"/></svg>';
						htmlLine +=					'</button>';
					}
					else {
						htmlLine +=					'<button type="button" class="qtyminus qty-btn disabled" disabled>';
						htmlLine += 					'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.3332 8H7.99984H2.6665" stroke="#cfcfcf" stroke-width="2" stroke-linecap="round"/></svg>';
						htmlLine +=					'</button>';
					}
					
					htmlLine +=					'<input readonly data-vid="'+resultItem.variant_id+'" data-quantity="'+resultItem.quantity+'" data-product="'+resultItem.product_id+'" type="text" size="4" name="updates[]" min="1" id="updates_'+resultItem.variant_id+'" data-price="'+resultItem.price+'" value="'+resultItem.quantity+'" class="tc line-item-qty item-quantity">';
					htmlLine +=					'<button type="button" class="qtyplus qty-btn"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.00033 13.3334V8.00008M8.00033 8.00008V2.66675M8.00033 8.00008H13.3337M8.00033 8.00008H2.66699" stroke="#111111" stroke-width="2" stroke-linecap="round"/></svg></button>';
					htmlLine +=				'</div>';
					htmlLine +=			'</div>';
				}
				else {
					htmlLine +=			'<div class="item-price">';
					htmlLine +=				'<span>'+ PDR.Helper.moneyFormat(resultItem.price / 100,'₫')+'</span>';

					if (hasFullPrice){
						htmlLine +=				'<del class="has-fullprice">'+newComparePrice+'</del>';
					}
					else {
						htmlLine +=				'<del>'+PDR.Helper.moneyFormat(resultItem.price_original / 100,'₫')+'</del>';
					}
					htmlLine +=			'</div>';
					htmlLine +=			'<div class="item-total-price d-none"><div class="price"><span class="line-item-total">Quà tặng</span></div></div>';		
					htmlLine +=			'<div class="item-quan">';
					htmlLine +=				'<span class="txt_qty d-none">'+resultItem.quantity+'</span>';
					htmlLine +=				'<div class="qty quantity-partent qty-click">';

					if(resultItem.quantity > 1){
						htmlLine +=					'<button type="button" class="qtyminus qty-btn">';
						htmlLine += 					'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.3332 8H7.99984H2.6665" stroke="#111111" stroke-width="2" stroke-linecap="round"/></svg>';
						htmlLine +=					'</button>';
					}
					else {
						htmlLine +=					'<button type="button" class="qtyminus qty-btn disabled" disabled>';
						htmlLine += 					'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.3332 8H7.99984H2.6665" stroke="#cfcfcf" stroke-width="2" stroke-linecap="round"/></svg>';
						htmlLine +=					'</button>';
					}
					
					htmlLine +=					'<input readonly data-vid="'+resultItem.variant_id+'" data-quantity="'+resultItem.quantity+'" data-product="'+resultItem.product_id+'" type="text" size="4" name="updates[]" min="1" id="updates_'+resultItem.variant_id+'" data-price="'+resultItem.price+'" value="'+resultItem.quantity+'" class="tc line-item-qty item-quantity">';
					htmlLine +=					'<button type="button" class="qtyplus qty-btn"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.00033 13.3334V8.00008M8.00033 8.00008V2.66675M8.00033 8.00008H13.3337M8.00033 8.00008H2.66699" stroke="#111111" stroke-width="2" stroke-linecap="round"/></svg></button>';
					htmlLine +=				'</div>';
					htmlLine +=			'</div>';															
				}
			}

			htmlLine +=			'</div>';
			htmlLine +=			'<div class="item-action">';

      //engraving
      if(resultItem.properties.front_capture || resultItem.properties.back_capture) {
        htmlLine +=			'<div class="item-edit-engraving">';
        htmlLine +=				'<a href="#" class="edit-capture" data-variant-id="'+resultItem.variant_id+'" data-handle="'+resultItem.properties.product_handle+'">';
        htmlLine +=					'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><title>edit</title><path fill-rule="evenodd" clip-rule="evenodd" d="M5.379 13.144a.1.1 0 00-.03.062l-.125 1.386a.1.1 0 00.108.11l1.388-.127a.1.1 0 00.062-.029l9.717-9.699a.1.1 0 000-.141l-1.261-1.261a.1.1 0 00-.142 0l-9.717 9.7zM18.45 2.757a.1.1 0 010 .141L17.348 4a.1.1 0 01-.141 0l-1.262-1.26a.1.1 0 010-.142l1.104-1.101a.1.1 0 01.141 0l1.261 1.261zM17.191.082a.1.1 0 00-.142 0L4.416 12.692a.1.1 0 00-.03.062l-.267 2.943a.1.1 0 00.109.109l2.943-.268a.1.1 0 00.061-.029L19.866 2.9a.1.1 0 000-.141L17.19.082zm-6.362 2.089A.1.1 0 0010.76 2H.1a.1.1 0 00-.1.1v17.8a.1.1 0 00.1.1h17.8a.1.1 0 00.1-.1V9.241a.1.1 0 00-.17-.07l-.8.8a.1.1 0 00-.03.07V18.9a.1.1 0 01-.1.1H1.1a.1.1 0 01-.1-.1V3.1a.1.1 0 01.1-.1h8.859a.1.1 0 00.07-.03l.8-.8z" fill="#27251F"/></svg>';
        htmlLine +=					'<span class="a-link">Chỉnh sửa</span>';
        htmlLine +=				'</a>';
        htmlLine +=			'</div>';
      }
      //engraving
      
			if (!(type == 'comboApp')) {
				//if (resultItem.price > 0){
        if(resultItem.handle != null){
					htmlLine +=			'<div class="item-edit">';
					htmlLine +=				'<a href="#" class="js-btn-edit" data-handle="'+resultItem.url+'" data-line="' + (line+1) + '">';
					htmlLine +=					'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><title>edit</title><path fill-rule="evenodd" clip-rule="evenodd" d="M5.379 13.144a.1.1 0 00-.03.062l-.125 1.386a.1.1 0 00.108.11l1.388-.127a.1.1 0 00.062-.029l9.717-9.699a.1.1 0 000-.141l-1.261-1.261a.1.1 0 00-.142 0l-9.717 9.7zM18.45 2.757a.1.1 0 010 .141L17.348 4a.1.1 0 01-.141 0l-1.262-1.26a.1.1 0 010-.142l1.104-1.101a.1.1 0 01.141 0l1.261 1.261zM17.191.082a.1.1 0 00-.142 0L4.416 12.692a.1.1 0 00-.03.062l-.267 2.943a.1.1 0 00.109.109l2.943-.268a.1.1 0 00.061-.029L19.866 2.9a.1.1 0 000-.141L17.19.082zm-6.362 2.089A.1.1 0 0010.76 2H.1a.1.1 0 00-.1.1v17.8a.1.1 0 00.1.1h17.8a.1.1 0 00.1-.1V9.241a.1.1 0 00-.17-.07l-.8.8a.1.1 0 00-.03.07V18.9a.1.1 0 01-.1.1H1.1a.1.1 0 01-.1-.1V3.1a.1.1 0 01.1-.1h8.859a.1.1 0 00.07-.03l.8-.8z" fill="#27251F"/></svg>';
					htmlLine +=					'<span class="a-link">Chỉnh sửa</span>';
					htmlLine +=				'</a>';
					htmlLine +=			'</div>';
					htmlLine +=			'<div class="item-save">';
					htmlLine +=				'<a href="#" class="js-wishlist" data-type="wishlist" data-price="'+(resultItem.price/100)+'" data-title="'+resultItem.title+'" data-handle="'+resultItem.handle+'" data-id="'+resultItem.product_id+'">';
					htmlLine +=					'<svg class="ic-heart filled" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" width="20" height="20"><path d="M1.546 10.801c.107.117.22.23.336.337l8.047 8.047a.1.1 0 00.142 0l8.047-8.048a5.72 5.72 0 00.336-.336l.03-.03v-.003l.01-.01c.22-.244.419-.507.595-.786A5.925 5.925 0 0020 6.8C20 3.597 17.493 1 14.4 1a5.471 5.471 0 00-3.717 1.462 5.755 5.755 0 00-.602.646.103.103 0 01-.162 0 5.75 5.75 0 00-.602-.646A5.471 5.471 0 005.6 1C2.507 1 0 3.597 0 6.8c0 1.17.335 2.26.91 3.172.177.28.377.543.597.786l.009.01v.002l.03.031z" fill="#27251F"></path></svg>';
					htmlLine +=					'<svg class="ic-heart" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" width="20" height="20"><path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M17.426 10.415l.015-.014c.096-.088.188-.18.277-.277l.014-.015.01-.012A4.893 4.893 0 0019 6.8C19 4.116 16.908 2 14.4 2c-1.451 0-2.755.702-3.604 1.818l-.716.94a.1.1 0 01-.16 0l-.716-.94C8.354 2.702 7.051 2 5.6 2 3.092 2 1 4.116 1 6.8c0 1.282.48 2.44 1.257 3.297l.013.014.012.013c.089.096.181.19.277.278l.016.014 7.354 7.354a.1.1 0 00.142 0l7.355-7.354zm-7.355 8.77a.1.1 0 01-.142 0l-8.047-8.047a5.763 5.763 0 01-.336-.337l-.03-.03v-.002l-.01-.011a5.802 5.802 0 01-.595-.786A5.922 5.922 0 010 6.8C0 3.597 2.507 1 5.6 1a5.47 5.47 0 013.717 1.462c.216.199.418.415.602.646.041.052.12.052.162 0 .184-.231.386-.447.602-.646A5.471 5.471 0 0114.4 1C17.493 1 20 3.597 20 6.8c0 1.17-.335 2.26-.91 3.172-.177.28-.377.542-.596.786l-.01.01v.003l-.03.03a5.72 5.72 0 01-.336.336l-8.047 8.048z" fill="#27251F"></path></svg>';
					htmlLine +=					'<span class="a-link">Yêu thích</span>';
					htmlLine +=				'</a>';
					htmlLine +=			'</div>';
        }
        
					htmlLine +=			'<div class="item-remove">';
					htmlLine += 			'<a href="javascript:void(0);" onclick="PDR.Cart.cartRender.deleteItemCart(' + (line+1) + ')" class="js-btn-remove" >';
					htmlLine +=					'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><title>trash</title><path fill-rule="evenodd" clip-rule="evenodd" d="M7.795 1.175A.5.5 0 018.175 1h3.65a.5.5 0 01.38.175l.566.66a.1.1 0 01-.076.165h-5.39a.1.1 0 01-.076-.165l.566-.66zM5.724 2a.1.1 0 00.076-.035L7.035.524A1.5 1.5 0 018.175 0h3.65a1.5 1.5 0 011.14.524L14.2 1.965a.1.1 0 00.076.035H19.9a.1.1 0 01.1.1v.8a.1.1 0 01-.1.1h-2.3a.1.1 0 00-.1.1v16.8a.1.1 0 01-.1.1H2.6a.1.1 0 01-.1-.1V3.1a.1.1 0 00-.1-.1H.1a.1.1 0 01-.1-.1v-.8A.1.1 0 01.1 2h5.624zM3.6 19a.1.1 0 01-.1-.1V3.1a.1.1 0 01.1-.1h12.8a.1.1 0 01.1.1v15.8a.1.1 0 01-.1.1H3.6zM6 5.1a.1.1 0 01.1-.1h.8a.1.1 0 01.1.1v11.8a.1.1 0 01-.1.1h-.8a.1.1 0 01-.1-.1V5.1zm4.5 0a.1.1 0 00-.1-.1h-.8a.1.1 0 00-.1.1v11.8a.1.1 0 00.1.1h.8a.1.1 0 00.1-.1V5.1zm3.5 0a.1.1 0 00-.1-.1h-.8a.1.1 0 00-.1.1v11.8a.1.1 0 00.1.1h.8a.1.1 0 00.1-.1V5.1z" fill="#27251F"/></svg>';
					htmlLine +=					'<span class="a-link">Xoá</span>';
					htmlLine +=				'</a>';
					htmlLine +=			'</div>';
				//}
			}
			htmlLine +=			'</div>';
      /*
  			if (!$.isEmptyObject(PDR.Cart.dataBXSYPE)) {
         
  				$.each(PDR.Cart.dataBXSYPE, function(keyBXSYPE,htmlBXSYPE){
  					if(resultItem.properties.hasOwnProperty('PE-bXsY-item-buy ' + keyBXSYPE)) {
  						htmlLine += htmlBXSYPE;
  					}
  				})
          
  			}
      */
      
			htmlLine +=		'</div>';
			htmlLine +=	'</div>';

			return htmlLine;
		},
		renderLineItemGiftPE: function (resultItem,line) {
			var itemOjProperties = {}
			var htmlLine = '';
			htmlLine +=	'<div class="line-gift" data-line="'+(line+1)+'" data-variant-id="'+resultItem.variant_id+'" data-pro-id="'+resultItem.product_id+'">';
			htmlLine +=		'<div class="gift-icon">';
			htmlLine += 		'<svg viewBox="0 0 103 102"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-273.000000, -1901.000000)" stroke="#000" stroke-width="2" fill="#000" fill-rule="nonzero"><path d="M352.25,1921.36735 C352.25,1921.36735 355.331633,1916.55102 355.331633,1913.4898 C355.331633,1907.10204 350.229592,1902 344.045918,1902 C339.352041,1902 328.535714,1909.02041 324.209184,1915.32653 C319.739796,1909.02041 308.964286,1902.20408 304.454082,1902.20408 C298.290816,1902.20408 293.168367,1907.30612 293.168367,1913.69388 C293.168367,1916.65306 294.270408,1919.32653 296.045918,1921.34694 L278.25,1921.34694 L278.25,1921.34694 C276.040861,1921.34694 274.25,1923.1378 274.25,1925.34694 L274.25,1944.79592 L274.25,1944.79592 C274.25,1947.00506 276.040861,1948.79592 278.25,1948.79592 L280.209184,1948.79592 L280.209184,1998 L280.209184,1998 C280.209184,2000.20914 282.000045,2002 284.209184,2002 L311.494898,2002 L337.02551,2002 L364.311224,2002 L364.311224,2002 C366.520363,2002 368.311224,2000.20914 368.311224,1998 L368.311224,1948.81633 L370.25,1948.81633 L370.25,1948.81633 C372.459139,1948.81633 374.25,1947.02547 374.25,1944.81633 L374.25,1925.36735 L374.25,1925.36735 C374.25,1923.15821 372.459139,1921.36735 370.25,1921.36735 C364.25,1921.36735 358.25,1921.36735 352.25,1921.36735 Z M344.045918,1906.26531 C347.882653,1906.26531 351.066327,1909.44898 351.066327,1913.71429 C351.066327,1917.30612 348.556122,1920.38776 345.311224,1921.04082 L328.045918,1921.04082 C326.943878,1920.71429 326.596939,1920.32653 326.596939,1920.10204 C326.596939,1916.46939 339.352041,1906.26531 344.045918,1906.26531 Z M321.903061,1920.10204 C321.903061,1920.42857 321.147959,1920.79592 320.596939,1921.04082 L303.209184,1921.04082 C299.964286,1920.38776 297.454082,1917.30612 297.454082,1913.71429 C297.433673,1909.65306 300.637755,1906.26531 304.454082,1906.26531 C308.923469,1906.26531 321.903061,1916.46939 321.903061,1920.10204 Z M311.47449,1997.73469 L284.454082,1997.73469 L284.454082,1948.81633 L311.47449,1948.81633 L311.47449,1997.73469 Z M311.47449,1944.77551 L278.515306,1944.77551 L278.515306,1925.63265 L311.494898,1925.63265 L311.494898,1944.77551 L311.47449,1944.77551 Z M328.739796,1997.73469 L319.719388,1997.73469 L319.719388,1997.73469 C317.510249,1997.73469 315.719388,1995.94383 315.719388,1993.73469 L315.719388,1929.61224 L315.719388,1929.61224 C315.719388,1927.40311 317.510249,1925.61224 319.719388,1925.61224 L328.739796,1925.61224 L328.739796,1925.61224 C330.948935,1925.61224 332.739796,1927.40311 332.739796,1929.61224 L332.739796,1993.73469 L332.739796,1993.73469 C332.739796,1995.94383 330.948935,1997.73469 328.739796,1997.73469 Z M364.02551,1997.73469 L337.005102,1997.73469 L337.005102,1948.81633 L364.02551,1948.81633 L364.02551,1997.73469 L364.02551,1997.73469 Z M369.964286,1944.77551 L337.005102,1944.77551 L337.005102,1925.63265 L369.984694,1925.63265 L369.984694,1944.77551 L369.964286,1944.77551 Z"></path></g></g></svg>';
			htmlLine +=		'</div>';
			htmlLine +=		'<div class="gift-info">Tặng: ';
			htmlLine +=			'<a href="'+resultItem.url+'">'+resultItem.title+'</a>';
			htmlLine +=			'<span> Trị giá: ';
			
			if(resultItem.price_original > resultItem.price) {
				htmlLine +=			PDR.Helper.moneyFormat(resultItem.price_original,'₫')
			}
			else {
				//var checkVr = proInCartJS[resultItem.product_id].variants[resultItem.variant_id];
				var checkVr = proInCartJS[resultItem.product_id].variants.filter(variant => variant.id == resultItem.variant_id);
				if (checkVr.length > 0){ //Old Condition: checkVr != undefined
          checkVr = checkVr[0];
					if (checkVr.compare_at_price > resultItem.price) {
						htmlLine +=			PDR.Helper.moneyFormat(checkVr.compare_at_price,'₫');
					}
				}
			}
			
			htmlLine += 		'</span>';
			htmlLine +=		'</div>';
			htmlLine +=	'</div>';
			return htmlLine;
		},
		renderLineItemDiscountPE: function (resultItem,line) {
			var itemOjProperties = {}
			var htmlLine = '';
			htmlLine +=	'<div class="line-discount d-none" data-line="'+(line+1)+'" data-variant-id="'+resultItem.variant_id+'" data-pro-id="'+resultItem.product_id+'">';
			htmlLine +=			'<div class="discount-info">';
			htmlLine +=				'<span></span>';
			htmlLine +=			'</div>';
			htmlLine +=	'</div>';
			return htmlLine;
		},
		renderLineItemBXSYPE: function (resultItem,line) {
      //console.log('Item Y: ',resultItem);
			var itemOjProperties = {}
			var htmlLine = '';
			htmlLine +=	'<div class="line-bxsy" data-line="'+(line+1)+'" data-variant-id="'+resultItem.variant_id+'" data-pro-id="'+resultItem.product_id+'">';
			htmlLine +=		'<div class="bxsy-icon">';
			htmlLine += 		'<img src="'+resultItem.image+'" />';
			htmlLine +=		'</div>';
			htmlLine +=		'<div class="bxsy-info">Tặng: ';
			htmlLine +=			'<a href="'+resultItem.url+'">'+resultItem.title+'</a>';
			htmlLine +=			'<span> Trị giá: ';

			if(resultItem.price_original > resultItem.price) {
				htmlLine +=			'<strong>' + PDR.Helper.moneyFormat(resultItem.price,'₫') + '</strong>';
        htmlLine +=			'<del>' + PDR.Helper.moneyFormat(resultItem.price_original,'₫') + '</del>';
        htmlLine +=			'<span class="bxsy_percent">' + Math.ceil((resultItem.price_original - resultItem.price) / resultItem.price_original * 100)  + '%</span>';
			}
			else {
        //var checkVr = proInCartJS[resultItem.product_id].variants[resultItem.variant_id];
				var checkVr = proInCartJS[resultItem.product_id].variants.filter(variant => variant.id == resultItem.variant_id);
				if (checkVr.length > 0){ //Old Condition: checkVr != undefined
          checkVr = checkVr[0];
					if (checkVr.compare_at_price > resultItem.price) {
						htmlLine +=			'<strong>' + PDR.Helper.moneyFormat(checkVr.compare_at_price,'₫') + '</strong>';
					}
				}
			}

			htmlLine += 		'</span>';
			htmlLine +=		'</div>';
			htmlLine +=	'</div>';
			return htmlLine;
		},
		renderDiscountApllied: function(){
			if(PDR.Cart.checkout != null && PDR.Cart.checkout.discount_code != null){
				if(PDR.Cart.checkout.discount_code != ''){
          var subTotalPrice = Number($('.summary-subtotal').attr('data-price'));
          
					var coupon_applied = `<span class="code" data-code="${PDR.Cart.checkout.discount_code}">${PDR.Cart.checkout.discount_code}<button class="input-remove"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path fill="#ffffff" d="M256 0C114.836 0 0 114.836 0 256s114.836 256 256 256 256-114.836 256-256S397.164 0 256 0zm0 0" data-original="#6D6E72" class=""></path><path fill="#c5003e" d="M350.273 320.105c8.34 8.344 8.34 21.825 0 30.168a21.275 21.275 0 0 1-15.086 6.25c-5.46 0-10.921-2.09-15.082-6.25L256 286.164l-64.105 64.11a21.273 21.273 0 0 1-15.083 6.25 21.275 21.275 0 0 1-15.085-6.25c-8.34-8.344-8.34-21.825 0-30.169L225.836 256l-64.11-64.105c-8.34-8.344-8.34-21.825 0-30.168 8.344-8.34 21.825-8.34 30.169 0L256 225.836l64.105-64.11c8.344-8.34 21.825-8.34 30.168 0 8.34 8.344 8.34 21.825 0 30.169L286.164 256zm0 0" data-original="#fafafa"></path></g></svg></button></span>`;
					$('.used-coupon').html(coupon_applied);
					$('.discount-fee').html(PDR.Helper.moneyFormat(PDR.Cart.checkout.discount,'₫'));
					$('.cart-coupon--content').removeClass('d-none');

          if(subTotalPrice > 0){
            var discount_line = subTotalPrice - PDR.Cart.checkout.subtotal_price - PDR.Cart.checkout.discount;
            if(discount_line > 0){
              $('.summary-discount-line span.js-subtotal-price').html(PDR.Helper.moneyFormat(discount_line, '₫'));
              $('.summary-discount-line').parent().removeClass('d-none');
            }
            else{
              $('.summary-discount-line').parent().addClass('d-none');
            }
          }
				}
			}
		},
		checkItemCart: function (cart) {
      var self = this;
			//console.log('data cart:',cart);
      
			var itemOjProperties = {}
			var countPromo = 0;
			var typePromo = '';

			var Combos = []; //mã combo
			var titleCombos = []; //tên combo
			var lineCombo = [];

			var Gift = []; //mã gift
			var titleGift = []; //tên program gift
			var lineGift = [];
			
			var Discount = []; //mã discount
			var titleDiscount = []; //tên program Discount
			var lineDiscount = [];
			
			var DiscountBuy = []; //mã discount
			var titleDiscountBuy = []; //tên program Discount
			var lineDiscountBuy = []; //item mua
			
			var BXSY = []; //mã bxsy
			var titleBXSY = []; //tên program bxsy
			var lineBXSY = [];

			var checkItemGiftOmni = false;
			var checkItemCombo = false;
			var checkItemGift = false;
			var checkItemDiscount = false;
			var checkItemBXSY = false;
			var checkFDAY = false

			for(var i = 0; i < cart.items.length; i++) {
				var item = cart.items[i];
				itemOjProperties = item.properties;
				for (const property in itemOjProperties){
					if (property.indexOf('PE-combo-item') > -1){
						checkItemCombo = true;
						// PE-combo-item: "ma-combo | tên combo"
						var temp1 = itemOjProperties[property].split('|')[0].trim();
						var titleTemp1 = itemOjProperties[property].split('|')[1].trim();
						if(Combos.includes(temp1)) {
							var indexExist = Combos.indexOf(temp1);
							lineCombo[indexExist].push(i);
							continue;
						}
						else {
							Combos.push(temp1);
							titleCombos.push(titleTemp1);
							var temp11 = [];
							temp11.push(i);
							lineCombo.push(temp11);
						}
					}
					else if(property.indexOf('PE-gift-item ') > -1) {
						checkItemGift = true;
						//PE-gift-item-buy magift: "tên sản phẩm"
						//PE-gift-item magift: "tên sản phẩm"
						var temp3 = itemOjProperties[property];
						var titleTemp3 = temp3;
						var codeTemp3 = property.split(' ')[1].trim();
						if(Gift.includes(codeTemp3)) {
							var indexExist = Gift.indexOf(codeTemp3);
							lineGift[indexExist].push(i);
							continue;
						}
						else {
							Gift.push(codeTemp3);
							titleGift.push(titleTemp3);
							var temp33 = [];
							temp33.push(i);
							lineGift.push(temp33);
						}
					}
					else if(property.indexOf('PE-buy-discount-item ') > -1) {
						checkItemDiscount = true;
						var temp4 = itemOjProperties[property].split('|')[1].trim();
						var titleTemp4 = itemOjProperties[property].split('|')[0].trim();
						var codeTemp4 = property.split(' ')[1].trim();
						if(Discount.includes(codeTemp4)) {
							var indexExist = Discount.indexOf(codeTemp4);
							lineDiscount[indexExist].push(i);
							continue;
						}
						else {
							Discount.push(codeTemp4);
							titleDiscount.push(titleTemp4);
							var temp44 = [];
							temp44.push(i);
							lineDiscount.push(temp44);
						}
					}
					else if(property.indexOf('PE-bXsY-item-select ') > -1) {
						checkItemBXSY = true;
						var temp5 = itemOjProperties[property].split('|')[1].trim();
						var titleTemp5 = itemOjProperties[property].split('|')[0].trim();
						var codeTemp5 = property.split(' ')[1].trim();
						if(BXSY.includes(codeTemp5)) {
							var indexExist5 = BXSY.indexOf(codeTemp5);
							lineBXSY[indexExist5].push(i);
							continue;
						}
						else {
							BXSY.push(codeTemp5);
							titleBXSY.push(titleTemp5);
							var temp55 = [];
							temp55.push(i);
							lineBXSY.push(temp55);
						}
					}
					else if(property.indexOf('Khuyến mãi') > -1) {
						checkItemGiftOmni = true;
					}		
				}
			}
			
			var now = new Date().getTime();		
			//CTKM 1 - FRIENDSHIP DAY
			var eventStartFDAY = new Date('08/1/2024 00:00:00');
			var eventEndFDAY = new Date('08/5/2024 23:59:59');
			if (eventStartFDAY <= now && eventEndFDAY > now) {
				console.log('air: FRIENDSHIP DAY')
				var amountFDAY = 0;
				var countFDAY = cart.items.filter(item => item.properties.cates.indexOf('FRIENDSHIP DAY') > -1);
				if (countFDAY.length > 0){
					console.log(countFDAY);
					countFDAY.map(item  => { amountFDAY+= item.quantity });	
					console.log('countFDAY:',amountFDAY);
					var htmlPromoFDAY = ''
					if (amountFDAY == 1){
						htmlPromoFDAY += '<div class="promotion-notify notify-1"><div class="alert alert-info"><span><strong>FRIENDSHIP DAY:</strong> MUA THÊM <strong>1</strong> SẢN PHẨM ĐỂ ĐƯỢC ƯU ĐÃI <strong>25%</strong> TRÊN TỔNG ĐƠN HÀNG.</span> <a href="https://pandora.norbreeze.vn/collections/fday">Tiếp tục mua sắm</a></div></div>';
					}
					else if (amountFDAY == 2){
						htmlPromoFDAY += '<div class="promotion-notify notify-1"><div class="alert alert-info"><span><strong>FRIENDSHIP DAY:</strong> MUA THÊM <strong>1</strong> SẢN PHẨM ĐỂ ĐƯỢC ƯU ĐÃI <strong>30%</strong> TRÊN TỔNG ĐƠN HÀNG.</span> <a href="https://pandora.norbreeze.vn/collections/fday">Tiếp tục mua sắm</a></div></div>'
					}
					else if (amountFDAY >= 2){
						htmlPromoFDAY += '<div class="promotion-notify notify-1"><div class="alert alert-info"><span>MUA NGAY HỘP ĐỰNG TRANG SỨC VỚI GIÁ ƯU ĐÃI</span> <a href="https://pandora.norbreeze.vn/products/hop-dung-nu-trang-pandora">Tiếp tục mua sắm</a></div></div>'
					}
					$('#cart-page .js-render-itemcart .table-cart').prepend(htmlPromoFDAY);
				}
			}
			else if (now >= eventEndFDAY) {
				console.log('expired: FRIENDSHIP DAY')
			}
			else if (now < eventStartFDAY) {
				console.log('notnow: FRIENDSHIP DAY')
			}

			//CTKM 2 - LẤP LÁNH NGÀY ĐÔI - ƯU ĐÃI CỰC SỐC - issue #869
			var eventStartD88 = new Date('08/6/2024 00:00:00');
			var eventEndD88 = new Date('08/10/2024 23:59:59');
			if (eventStartD88 <= now && eventEndD88 > now) {
				console.log('air: LẤP LÁNH NGÀY ĐÔI - ƯU ĐÃI CỰC SỐC')
				
				var totalLimit = [4888000,9776000,14664000,19552000];
				var couponsD88 = ['1888K','3776K','5664K','7552K'];
				var currentIndex = -1;
				
				var amoutD88 = 0;
				var countD88 = cart.items.filter(item => item.properties.cates.indexOf('LẤP LÁNH NGÀY ĐÔI - ƯU ĐÃI CỰC SỐC') > -1);
				console.log(countD88);
				if (countD88.length > 0){
					
					countD88.map(item  => { amoutD88 += item.line_price_orginal/100 });	
					console.log('countD88:',amoutD88); //10.450.000

					var htmlPromoD88 = '';
					var amoutD88Need = 0;
					totalLimit.map((item,idn) => {
						if(amoutD88 < item && currentIndex == -1){
							currentIndex = idn;
						}
					});
					if (currentIndex != -1){
						amoutD88Need = totalLimit[currentIndex] - amoutD88;
						htmlPromoD88 += `<div class="promotion-notify notify-2 lv${currentIndex+1}">
														<div class="alert alert-info">
															<p style="color: #d92046;">*Chương trình chỉ áp dụng với sản phẩm nguyên giá, không áp dụng chung với các CTKM khác</p>
															<span><strong>LẤP LÁNH NGÀY ĐÔI - ƯU ĐÃI CỰC SỐC:</strong> MUA THÊM <strong>${PDR.Helper.moneyFormat(amoutD88Need,'₫')},</strong>
															ĐỂ ĐƯỢC GIẢM <strong>${couponsD88[currentIndex]}</strong> TRÊN TỔNG ĐƠN HÀNG.</span> 
															<a href="https://pandora.norbreeze.vn/collections/hoan-tien-8-8">Tiếp tục mua sắm</a>
														</div>
													</div>`;

						$('#cart-page .cart-heading').prepend(htmlPromoD88);
					}
				}
			}
			else if (now >= eventEndD88) {
				console.log('expired: LẤP LÁNH NGÀY ĐÔI - ƯU ĐÃI CỰC SỐC')
			}
			else if (now < eventStartD88) {
				console.log('notnow: LẤP LÁNH NGÀY ĐÔI - ƯU ĐÃI CỰC SỐC')
			}
			
			
			//CTKM 3 - NGÀN ƯU ĐÃI VÀNG, RỘN RÀNG ĐẠI LỄ
			var eventStartDL29 = new Date('08/29/2024 23:59:59');
			var eventEndDL29 = new Date('09/10/2024 23:59:59');
			if (eventStartDL29 <= now && eventEndDL29 > now) {
				//console.log('air: Đại lễ 2/9');
				var amountDL29 = 0;
				var countDL29 = cart.items.filter(item => item.properties.hasOwnProperty('CTKM') && item.properties.CTKM.indexOf('I-DAY') > -1);
				if (countDL29.length > 0){
					//console.log('itemCountDL29:',countDL29);
					countDL29.map(item  => { amountDL29+= item.quantity });	
					//console.log('numItemCountDL29:',amountDL29);
					var htmlPromoDL29 = '';
					if (amountDL29 == 1){
						htmlPromoDL29 += `
              <div class="promotion-notify notify-3">
                <div class="list">
                  <div>*Chương trình không áp dụng cho bộ sưu tập mới nhất, các chương trình khuyến mãi khác và không đổi size với sản phẩm giảm giá.</div>
                </div>
                <div class="alert alert-info">
                  <span>MUA THÊM <strong>2</strong> SẢN PHẨM ĐỂ ĐƯỢC TẶNG 1 SẢN PHẨM.</span> 
                  <a href="https://pandora.norbreeze.vn/collections/mung-dai-le-quoc-khanh/">Tiếp tục mua sắm</a>
                </div>
              </div>
            `;
					}
					else if (amountDL29 == 2){
						htmlPromoDL29 += '<div class="promotion-notify notify-3"><div class="list"><div>*Chương trình không áp dụng cho bộ sưu tập mới nhất, các chương trình khuyến mãi khác và không đổi size với sản phẩm giảm giá.</div></div><div class="alert alert-info"><span><strong class="d-none">NGÀN ƯU ĐÃI VÀNG, RỘN RÀNG ĐẠI LỄ:</strong> MUA THÊM <strong>1</strong> SẢN PHẨM ĐỂ ĐƯỢC TẶNG 1 SẢN PHẨM.</span> <a href="https://pandora.norbreeze.vn/collections/mung-dai-le-quoc-khanh/">Tiếp tục mua sắm</a></div></div>'
					}
					else if (amountDL29 == 3){
						htmlPromoDL29 += '<div class="promotion-notify notify-3"><div class="list"><div>*Chương trình không áp dụng cho bộ sưu tập mới nhất, các chương trình khuyến mãi khác và không đổi size với sản phẩm giảm giá.</div></div><div class="alert alert-info"><span><strong class="d-none">NGÀN ƯU ĐÃI VÀNG, RỘN RÀNG ĐẠI LỄ:</strong> MUA THÊM <strong>2</strong> SẢN PHẨM ĐỂ ĐƯỢC TẶNG 2 SẢN PHẨM.</span> <a href="https://pandora.norbreeze.vn/collections/mung-dai-le-quoc-khanh/">Tiếp tục mua sắm</a></div></div>'
					}
					else if (amountDL29 == 4){
						htmlPromoDL29 += '<div class="promotion-notify notify-3"><div class="list"><div>*Chương trình không áp dụng cho bộ sưu tập mới nhất, các chương trình khuyến mãi khác và không đổi size với sản phẩm giảm giá.</div></div><div class="alert alert-info"><span><strong class="d-none">NGÀN ƯU ĐÃI VÀNG, RỘN RÀNG ĐẠI LỄ:</strong> MUA THÊM <strong>1</strong> SẢN PHẨM ĐỂ ĐƯỢC TẶNG 2 SẢN PHẨM.</span> <a href="https://pandora.norbreeze.vn/collections/mung-dai-le-quoc-khanh/">Tiếp tục mua sắm</a></div></div>'
					}
					else if (amountDL29 == 5){
						htmlPromoDL29 += '<div class="promotion-notify notify-3"><div class="list"><div>*Chương trình không áp dụng cho bộ sưu tập mới nhất, các chương trình khuyến mãi khác và không đổi size với sản phẩm giảm giá.</div></div><div class="alert alert-info"><span><strong class="d-none">NGÀN ƯU ĐÃI VÀNG, RỘN RÀNG ĐẠI LỄ:</strong> MUA THÊM <strong>3</strong> SẢN PHẨM ĐỂ ĐƯỢC TẶNG 4 SẢN PHẨM.</span> <a href="https://pandora.norbreeze.vn/collections/mung-dai-le-quoc-khanh/">Tiếp tục mua sắm</a></div></div>'
					}
					else if (amountDL29 == 6){
						htmlPromoDL29 += '<div class="promotion-notify notify-3"><div class="list"><div>*Chương trình không áp dụng cho bộ sưu tập mới nhất, các chương trình khuyến mãi khác và không đổi size với sản phẩm giảm giá.</div></div><div class="alert alert-info"><span><strong class="d-none">NGÀN ƯU ĐÃI VÀNG, RỘN RÀNG ĐẠI LỄ:</strong> MUA THÊM <strong>2</strong> SẢN PHẨM ĐỂ ĐƯỢC TẶNG 4 SẢN PHẨM.</span> <a href="https://pandora.norbreeze.vn/collections/mung-dai-le-quoc-khanh/">Tiếp tục mua sắm</a></div></div>'
					}
					else if (amountDL29 == 7){
						htmlPromoDL29 += '<div class="promotion-notify notify-3"><div class="list"><div>*Chương trình không áp dụng cho bộ sưu tập mới nhất, các chương trình khuyến mãi khác và không đổi size với sản phẩm giảm giá.</div></div><div class="alert alert-info"><span><strong class="d-none">NGÀN ƯU ĐÃI VÀNG, RỘN RÀNG ĐẠI LỄ:</strong> MUA THÊM <strong>1</strong> SẢN PHẨM ĐỂ ĐƯỢC TẶNG 4 SẢN PHẨM.</span> <a href="https://pandora.norbreeze.vn/collections/mung-dai-le-quoc-khanh/">Tiếp tục mua sắm</a></div></div>'
					}
					else if (amountDL29 >= 8){
						htmlPromoDL29 += '<div class="promotion-notify notify-3"><div class="list"><div>*Chương trình không áp dụng cho bộ sưu tập mới nhất, các chương trình khuyến mãi khác và không đổi size với sản phẩm giảm giá.</div></div><div class="alert alert-info"><span>Liên hệ ngay với Pandora để được mua 4 tặng 4</span> <a href="https://www.messenger.com/t/450846288276998/">Liên hệ</a></div></div>'
					}
					else if (amountDL29 >= 9){
						htmlPromoDL29 += '<div class="promotion-notify notify-3"><div class="list"><div>*Chương trình không áp dụng cho bộ sưu tập mới nhất, các chương trình khuyến mãi khác và không đổi size với sản phẩm giảm giá.</div></div><div class="alert alert-info"><span>Liên hệ ngay với Pandora để được mua 5 tặng 5</span> <a href="https://www.messenger.com/t/450846288276998/">Liên hệ</a></div></div>'
					}
					else if (amountDL29 >= 10){
						htmlPromoDL29 += '<div class="promotion-notify notify-3"><div class="list"><div>*Chương trình không áp dụng cho bộ sưu tập mới nhất, các chương trình khuyến mãi khác và không đổi size với sản phẩm giảm giá.</div></div><div class="alert alert-info"><span>Liên hệ ngay với Pandora để được mua 5 tặng 5</span> <a href="https://www.messenger.com/t/450846288276998/">Liên hệ</a></div></div>'
					}
					$('#cart-page .js-render-itemcart .table-cart').prepend(htmlPromoDL29);
				}
			}
			else if (now >= eventEndDL29) {
				console.log('expired: Đại lễ 2/9');
			}
			else if (now < eventStartDL29) {
				console.log('notnow: Đại lễ 2/9');
			}

      //CTKM 4 - DOUBLE DAY 9-9
			var eventStartDL99 = new Date('09/06/2024 23:59:59');
			var eventEndDL99 = new Date('09/11/2024 23:59:59');
			if (eventStartDL99 <= now && eventEndDL99 > now) {
				var amountDL99 = 0;
				var countDL99 = cart.items.filter(item => item.properties.hasOwnProperty('CTKM2') && item.properties.CTKM2.indexOf('Doubleday99') > -1);
				if (countDL99.length > 0){
					//console.log('itemCountDL99:',countDL99);
					countDL99.map(item  => { amountDL99 += item.quantity });	
					//console.log('numItemCountDL99:',amountDL99);
					var htmlPromoDL99 = '';
					if (amountDL99 == 1){
            var textKM = 'Thêm 2 sản phẩm để được tặng 1 sản phẩm và giảm thêm 15%. Vui lòng chọn giá trị bằng hoặc thấp hơn sản phẩm hiện có trong giỏ hàng.';
						htmlPromoDL99 += '<div class="alert alert-info"><span>'+textKM+'</span><a href="/collections/double-day-9-9">Tiếp tục mua sắm</a></div>';
					}
					else if (amountDL99 == 2){
						var textKM = 'Bạn đủ điều kiện để được tặng 1 sản phẩm. Vui lòng chọn giá trị bằng hoặc thấp hơn sản phẩm hiện có trong giỏ hàng';
						htmlPromoDL99 += '<div class="alert alert-info"><span>'+textKM+'</span><a href="/collections/double-day-9-9">Tiếp tục mua sắm</a></div>';
					}
          else if (amountDL99 >= 3 && amountDL99 < 8){
            if(amountDL99 >= 5) PDR.Cart.disableVoucher_B3G2 = true;
            var textKM = 'Liên hệ với Pandora để được hỗ trợ ưu đãi nhân đôi';
						htmlPromoDL99 += '<div class="alert alert-info"><span>'+textKM+'</span><a href="https://www.facebook.com/messages/t/450846288276998">Liên hệ ngay</a></div>';
          }
					else if (amountDL99 >= 8){
            PDR.Cart.disableVoucher_B3G2 = true;
						var textKM = 'Liên hệ với Pandora để được hỗ trợ tặng 4 sản phẩm';
						htmlPromoDL99 += '<div class="alert alert-info"><span>'+textKM+'</span><a href="https://www.facebook.com/messages/t/450846288276998">Liên hệ ngay</a></div>';
          }
					if($('.notify-3').length > 0){
            $('.notify-3').append(htmlPromoDL99);
          }
          else{
            htmlPromoDL99 = '<div class="promotion-notify notify-3"><div class="list"><div>*Chương trình không áp dụng cho bộ sưu tập mới nhất, các chương trình khuyến mãi khác và không đổi size với sản phẩm giảm giá.</div></div>' + htmlPromoDL99 + '</div>';
            $('#cart-page .js-render-itemcart .table-cart').prepend(htmlPromoDL99);
          }
				}
			}
			else if (now >= eventEndDL99) {
				console.log('expired: Double day 9/9');
			}
			else if (now < eventStartDL99) {
				console.log('notnow: Double day 9/9');
			}
	
      if(camp_1 != null){
        var eventStartCamp1 = new Date(camp_1.start);
  			var eventEndCamp1 = new Date(camp_1.end);
  			if (eventStartCamp1 <= now && eventEndCamp1 > now) {
  				var amountCamp1 = 0;
  				var countCamp1 = cart.items.filter(item => item.properties.hasOwnProperty('CTKM') && item.properties.CTKM.indexOf('I-DAY') > -1);
  				if (countCamp1.length > 0){
  					countCamp1.map(item  => { amountCamp1 += item.quantity });	
  					var htmlPromoCamp1 = '';
            /*
              camp_1.infos.map(info => {
                var qtys = info.qty.split(',');
                if(qtys.includes(amountCamp1.toString())){
                  if(camp_1.end.indexOf('04/02/2025') > -1 || camp_1.end.indexOf('05/04/2025') > -1){
                    htmlPromoCamp1 += `
                      <div class="alert alert-info">
                        <div class="list"><div>${camp_1.desc}</div></div>
                        <a href="${camp_1.link_act}">${camp_1.text_act}</a>
                      </div>`;
                  }
                  else{
                    htmlPromoCamp1 += `
                      <div class="alert alert-info">
                        <span>${info.content}</span><a href="${info.link_act}">${info.text_act}</a>
                      </div>`;
                  }
                }
              });
            */
            htmlPromoCamp1 += `
              <div class="alert alert-info">
                <span>${camp_1.desc}</span><a href="${camp_1.link_act}">${camp_1.text_act}</a>
              </div>
            `;
  					if($('.notify-3').length > 0){
              $('.notify-3').append(htmlPromoCamp1);
            }
            else{
              htmlPromoCamp1 = '<div class="promotion-notify notify-3">' + htmlPromoCamp1 + '</div>';
              $('#cart-page .js-render-itemcart .table-cart').prepend(htmlPromoCamp1);
            }
  				}
  			}
  			else if (now >= eventEndCamp1) {
          console.log('expired: Camp1 15/9');
        }
        else if (now < eventStartCamp1) {
          console.log('notnow: Camp1 12/9');
        }   
      }
			
			/*console.log('titleGift:',titleGift);
			console.log('Combos:',Combos);
			console.log('Gift:',Gift);
			console.log('TitleDiscount:',titleDiscount);
			console.log('Discount:',Discount);*/
			
			// Quà tặng Khuyến mãi
			if(Gift.length > 0) {
				for(var i = 0; i < Gift.length; i++) {
					var gf = Gift[i];
					var itemInGift = cart.items.filter((x,index) => !x.properties.hasOwnProperty('PE-combo-item') && x.properties.hasOwnProperty('PE-gift-item ' + gf) && x.properties['PE-gift-item ' + gf].indexOf(titleGift[i]) > -1);
					if (itemInGift.length > 0) {
						var htmlGiftApp = '<div class="gifts-list"><h4>Quà tặng khuyến mãi</h4>';
						for(var j = 0; j < itemInGift.length; j++) {
							countPromo = countPromo + itemInGift[j].quantity;
							//htmlGiftApp += PDR.Cart.cartRender.renderLineItemGiftPE(itemInGift[j],lineGift[i][j]); //style cũ
							htmlGiftApp += PDR.Cart.cartRender.renderLineItem(itemInGift[j],lineGift[i][j]); //style mới
						}
						htmlGiftApp += '</div>';
						PDR.Cart.dataGiftPE[gf] = htmlGiftApp;
						$('#cart-page .js-render-itemcart .table-cart').append(htmlGiftApp);
					}
				}
			}
			/*console.log('countPromo:',countPromo);*/
			
			// Discount - Mua giảm
			if(Discount.length > 0) {
				for(var i = 0; i < Discount.length; i++) {
					var dc = Discount[i];
					var itemInDiscount = cart.items.filter((x,index) => !x.properties.hasOwnProperty('PE-combo-item') && x.properties.hasOwnProperty('PE-buy-discount-item ' + dc) && x.properties['PE-buy-discount-item-buy ' + dc].indexOf(titleDiscount[i]) > -1);
					if (itemInDiscount.length > 0) {
						var htmlDiscountApp = '<div class="discounts-list">';
						for(var j = 0; j < itemInDiscount.length; j++) {
              if(htmlDiscountApp.indexOf(titleDiscount[i]) == -1){
  							countPromo = countPromo + itemInDiscount[j].quantity;
  							//htmlDiscountApp += PDR.Cart.cartRender.renderLineItemDiscountPE(itemInDiscount[j],lineDiscount[i][j]);
  							htmlDiscountApp +=	'<div class="line-discount">';
  							htmlDiscountApp +=		'<span>'+titleDiscount[i]+'</span>';
  							htmlDiscountApp +=	'</div>';
              }
						}
						htmlDiscountApp += '</div>';
						PDR.Cart.dataDiscountPE[dc] = htmlDiscountApp;
					}
				}
			}
			
			//Combo
			if(Combos.length > 0) {
				for(var i = 0; i < Combos.length; i++) {
					var cmb = Combos[i];
					var htmlCombo = '<div class="cart-group combo">';
							htmlCombo +=  '<h4>Ưu đãi:' + titleCombos[i] + '</h4>';
					    htmlCombo += 	'<div class="quantity-combo d-flex align-items-center">';
					    htmlCombo += 		'<div class="label-quantity-combo"> <span>Số lượng: x '+ cart.attributes['PE-combo-detail '+Combos[i]]+'</span></div>'
					    htmlCombo += 		'<div class="update-quantity d-flex align-items-center">';
					    htmlCombo +=				'<button type="button" class="qtyminus-new qty-btn-new">-</button>';
					    htmlCombo +=	    	'<input type="text" value="'+ cart.attributes['PE-combo-detail '+Combos[i]]+'" class="update-combo-item" data-item="" data-combo="'+Combos[i].replace('~','')+'" data-max="" data-quantity="'+ cart.attributes['PE-combo-detail '+Combos[i]]+'" />';
					    htmlCombo +=				'<button type="button" class="qtyplus-new qty-btn-new">+</button>';
					    htmlCombo +=   	'</div>';
					    htmlCombo += 		'<div class="remove-combo" data-combo="'+Combos[i]+'">Xóa</div>';
					    htmlCombo +=  '</div>';
					
					var itemInCombo = cart.items.filter((x,index) => x.properties.hasOwnProperty('PE-combo-item') && x.properties['PE-combo-item'].indexOf(cmb) > -1);
					if (itemInCombo.length > 0) {
						for(var j = 0; j < itemInCombo.length; j++) {
							countPromo = countPromo + itemInCombo[j].quantity;
							htmlCombo += PDR.Cart.cartRender.renderLineItem(itemInCombo[j],'comboApp',lineCombo[i][j]);
						}
					}
					htmlCombo += '</div>';
					$('#cart-page .js-render-itemcart .table-cart').append(htmlCombo);
					PDR.Wishlist.renderFavorites();
				}
			}
			
			//BXSY
			if(BXSY.length > 0) {
				for(var i = 0; i < BXSY.length; i++) {
					var dc = BXSY[i];
					var itemInBXSY = cart.items.filter((x,index) => !x.properties.hasOwnProperty('PE-combo-item') && x.properties.hasOwnProperty('PE-bXsY-item-select ' + dc) && x.properties['PE-bXsY-item-select ' + dc].indexOf(titleBXSY[i]) > -1);
					if (itemInBXSY.length > 0) {
						console.log(itemInBXSY);
						var htmlBXSYApp = '<div class="bxsys-list"><h4><span>Quà tặng đã chọn: '+titleBXSY[i]+'</span></h4>';
						for(var j = 0; j < itemInBXSY.length; j++) {
							countPromo = countPromo + itemInBXSY[j].quantity;
							htmlBXSYApp += PDR.Cart.cartRender.renderLineItemBXSYPE(itemInBXSY[j],lineBXSY[i][j]);
						}
						htmlBXSYApp += '</div>';
						PDR.Cart.dataBXSYPE[dc] = htmlBXSYApp;
					}
				}
			}
			
			console.log('countPromo:',countPromo);
			
			var promoGroup     = lineCombo.join(',').split(',');
			var promoGift      = lineGift.join(',').split(',');
			var promoDiscount  = lineDiscount.join(',').split(',');
			var promoSingle    = lineGift.join(',').split(',');
			var promoBXSY      = lineBXSY.join(',').split(',');

			if(cart.item_count > countPromo) {
				var htmlHead = '';
				var parent = null;
				if (countPromo >= 0) {
					htmlHead += '<div class="cart-group single"></div>';
					$('#cart-page .js-render-itemcart .table-cart').append(htmlHead);
				} 
				else {
					parent = $('#cart-page .js-render-itemcart .table-cart');
				}
				
				for(var i = 0; i < cart.items.length; i++) {
					if (!promoGroup.includes(i+"") && !promoGift.includes(i+"") && !promoBXSY.includes(i+"") ) {
						var item = cart.items[i];
						var htmlNormal =	PDR.Cart.cartRender.renderLineItem(item,'',i,);
						$('#cart-page .js-render-itemcart .table-cart .cart-group.single').append(htmlNormal);
            var current_variant = item.inAdmin.variants.filter(variant => variant.id == item.variant_id);
						var current_inventory = current_variant[0].inventory_quantity;
						if(current_inventory < 5 && current_inventory >= 0){
							$(`.line-item[data-variant-id="${item.variant_id}"] .item-meta`).append(`<div class="noti_inventory">Chỉ còn <span>${current_inventory}</span> sản phẩm</div>`);
						}
						PDR.Wishlist.renderFavorites();
					}
				}

        if (!$.isEmptyObject(PDR.Cart.dataBXSYPE)) {
  				$.each(PDR.Cart.dataBXSYPE, function(keyBXSYPE,htmlBXSYPE){
  					$('#cart-page .js-render-itemcart .table-cart .cart-group.single').append(htmlBXSYPE);
  				});
          
  			}
			}
		},
		cartOrder: function() {
			var cart = window.cartJS;

			if(window.cartJS.items.length > 0){
				var html = $('#cloned-item--2').html();
				
				$('#cart-page .js-render-itemcart').html(html);
				$('#cart-page .js-render-itemcart').removeClass('cart-order--loading');
				$('.mainLoading').removeClass('active');
				$('#cart-page .cart-heading h1 span').text(' ('+cart.item_count + ' sản phẩm)');
				$('#cart-page .js-render-itemcart .table-cart').append(PDR.Cart.cartRender.checkItemCart(cart));

				// progress freeship
				//if(window.settings.freeship_promo.show){
					//PDR.Helper.freeshipPromo(cart);
				//}
        var subTotal = 0;
        cartJS.items.map(item => {
          if(item.properties != null && !$.isEmptyObject(item.properties)){
            var is_gift = false;
            $.each(item.properties,function(key,val){
              if(key.indexOf('PE-gift-item ') > -1){
                is_gift = true;
              }
            });
          }
          if(!is_gift) subTotal += item.line_price_orginal;
        });
        //console.log('Result:',subTotal);

				$('#checkout').removeClass('disabled').attr('disabled',false);
				$('#cart-page .checkout-notes .form-control').text(cart.note);
				$('#cart-page .summary-subtotal .text span').text(' ('+cart.item_count + ' sản phẩm)');
				$('#cart-page .summary-subtotal span.js-subtotal-price').html(PDR.Helper.moneyFormat(subTotal/100, '₫'));
				$('#cart-page .summary-total span.total-price').html(PDR.Helper.moneyFormat(cart.total_price/100, '₫'));
			}
			else {
				var html = $('#cloned-item--1').html();
				$('#cart-page .left-cart').addClass('cart-emty');
				$('#cart-page .left-cart').html(html);
				$('.mainLoading').removeClass('active');
				$('#checkout').addClass('disabled').attr('disabled',true);
				PDR.Cart.invoince.removeInvoice();
			}
		},
		deleteItemCart: function(line){
			var title = $('.line-item[data-line="'+line+'"]').find('.item-info h3 a').text();		
			$('#removeProductModal .product-to-remove').html(title); 
			$('#removeProductModal').modal('show');		

			var params = {
				type: 'POST',
				url: '/cart/change.js',
				data: 'quantity=0&line=' + line,
				dataType: 'json',
				success: function(cart) {				
					window.location.reload();
				},
				error: function(XMLHttpRequest, textStatus) {
					Haravan.onError(XMLHttpRequest, textStatus);
				}
			};

			$(document).on('click','#removeProductModal #btn-delete-confirm',function(e){
				e.preventDefault();
				$('#mainLoading').addClass('active');	

				jQuery.ajax(params);
			});
			$(document).on('click','#removeProductModal #btn-cancel-confirm',function(e){
				e.preventDefault();
				$('#removeProductModal').modal('hide');
			});
			$("body").on("show.bs.modal", "#removeProductModal",function() {
				$("#removeProductModal").modal("hide");
			});

		},
		changeItemCart: function(){
			$('body').on('click', '.line-item .js-btn-edit', function(e){
				e.stopPropagation();
				e.preventDefault();
				var line = $(this).attr('data-line');
				var url = $(this).attr('data-handle');
				var id = $(this).parents('.line-item').attr('data-pro-id');
				var vid = $(this).parents('.line-item').attr('data-variant-id');
				var title = $(this).parents('.line-item').find('h3 a').html();
				var selected = $(this).parents('.line-item').find('.item-desc').html();
				var html = '';
				var urlnew = '/search.js?q=filter=(id:product='+id+')&include=metafields[product]';
				$('#quickviewProductModal .modal-header .js-selected-item').html('');
				
				$.ajax({
					type: 'GET',
					url: url+(url.indexOf('?') > -1?'&':'?')+"view=quickview",
					async: false,
					success: function(data){
						html = data;
						$('#quickviewProductModal .modal-header .js-selected-item').html(selected);
						$('#quickviewProductModal #qv-btn-updateCart').attr('data-line',line);
						$.get(urlnew).done(function(datanew){
							$('#quickviewProductModal').modal();
							$('body').addClass('quickview-open');
							$('#quickviewProductModal .modal-body').html(html);

							console.log(datanew);

							PDR.Quickview.qv_data_main = datanew.products[0];

							if(typeof PDR.Quickview.qv_data_main.tags == 'string') PDR.Quickview.qv_data_main.tags = PDR.Quickview.qv_data_main.tags.split(',');
							if (PDR.Quickview.qv_data_main.available){
								var qv_main_count_unavailable = 0; //variant ko bị ẩn nhưng hết hàng
								var qv_main_count_hide = 0; //variant bị ẩn nhưng còn hàng

								PDR.Quickview.qv_data_main.variants.map(size => {
									if(!size.available) qv_main_count_unavailable++;
								});
								if ((qv_main_count_unavailable + qv_main_count_hide) == PDR.Quickview.qv_data_main.variants.length ){
									PDR.Quickview.qv_data_main.available = false;
								}
							}

							if (datanew.products[0].hasOwnProperty('metafields')) {
								PDR.Quickview.qv_data_meta = datanew.products[0].metafields[0].value;
							}
							else {
								PDR.Quickview.qv_data_meta = '';
							}
							PDR.Quickview.quickview_data.push(PDR.Quickview.qv_data_main);	
							PDR.Quickview.renderProductDetail.init();
						});
					}
				});

			});		
			$('body').on('click', '#quickviewProductModal button.close', function(e){
				$('#quickviewProductModal').modal('hide');
				$('body').removeClass('quickview-open');
				$("body").removeClass("modal-open");
			});

			$(document).on('click','#qv-btn-addtocart:not(.loading):not(.disabled):not(.added)', function(e){
				e.preventDefault();
				var isValid = true;
				var text1 = 'Thông báo', 
						text2 = 'ĐÃ THÊM VÀO GIỎ HÀNG',
						text3 = 'Mỗi sản phẩm chỉ được mua với số lượng tối đa là 10';

				$('.select-swatch .swatch:not(.no-render)').each(function(){
					if($(this).find('.select-swap').html() != '' && $(this).find('.select-swap .sd').length == 0){
						isValid = false;
					}
				});
				//if(isValid){
				$('#mainLoading').addClass('active');
				$('#qv-btn-addtocart').addClass('loading');

				var quantity = parseInt($('#qv-input-quantity').val());
				var id = PDR.Quickview.current_variant.id;
				var	dataAdd = {
					id: id, 
					quantity: quantity
				};
				var acceptBuy = true;

				if(cartJS.items.length > 0){
					cartJS.items.filter(x => {
						if(x.variant_id == id){
							if((x.quantity + quantity) > 5){
								acceptBuy = false;
							}
						}
					});
				}
				else {
					if(quantity > 10){
						acceptBuy = false;
					}
				}

				var param = {
					type: 'POST',
					url: '/cart/add.js',
					data: dataAdd,
					dataType: 'json',
					success: function(line_item) {
						PDR.Global.cartAjax(function(){

							$('#quickviewProductModal').modal('hide');
							$('body').removeClass('quickview-open');
							$("body").removeClass("modal-open");

							$('#mainLoading').removeClass('active');

							PDR.Helper.getMiniCart();							
						},);
					},
					error: function(XMLHttpRequest, textStatus) {
						if ( XMLHttpRequest.status == 422 ){
							PDR.Helper.SwalWarning("Thông báo","Đã có lỗi xảy ra",'error',false,false,2000);
							$('#mainLoading').removeClass('active');

						}
					}
				}

				if(acceptBuy){
					$.ajax(param);
				}
				else {
					PDR.Helper.SwalWarning(text1,text3,'error',false,false,2000);
					$('#mainLoading').removeClass('active');
				}
				//}
				//else{
				//$(".swatch.swatch-size").addClass("size-invalid");	
				//$("#qv-btn-addtocart").addClass('btnred').find('span').html('Vui lòng chọn Size');
				//}
			});
		},
		UpdateChangeQty: function(comboCode,newQty,beforeQty,line) {
			var arrayUpdate = [];
			var comboItem = false;
			var listCart = document.querySelectorAll('[id^="updates_"]');
			var note = $('#note').val();
			if(window.cartJS.items[line].properties.hasOwnProperty('PE-combo-item')){
				comboItem = true;
				$.each(window.cartJS.items,function(i,v){
					if(v.properties.hasOwnProperty('PE-combo-item') && v.properties['PE-combo-item'].indexOf(comboCode) > -1){
						if(line == i){
							arrayUpdate.push(newQty);
						}
						else{
							arrayUpdate.push(v.quantity / beforeQty * newQty);
						}
					}
					else{
						arrayUpdate.push(v.quantity);
					}
				});		
			}
			else{
				$.each(window.cartJS.items,function(i,v){
					if(i == line){
						arrayUpdate.push(newQty);
					}
					else{
						arrayUpdate.push(v.quantity);
					}
				});
			}

			arrayUpdate = 'updates[]='+arrayUpdate.join('&updates[]=')+'&note='+note;
			var params = {
				type: 'POST',
				url: '/cart/update.js',
				data: arrayUpdate,
				dataType: 'json',
				success: function(data) { 
					window.cartJS = data;
					window.location.reload();
				},
				error: function(XMLHttpRequest, textStatus) {
					Haravan.onError(XMLHttpRequest, textStatus);
				}
			};
			jQuery.ajax(params);
		},
		comboNewFunction: function(){
			//SP Lẻ
			$(document).on('click','.qty-click .qtyplus',function(e){
				e.preventDefault();
				var input = $(this).parent('.quantity-partent').find('input');
				var currentVal = parseInt(input.val());
				if (!isNaN(currentVal)) {
					input.val(currentVal + 1);
				} else {
					input.val(1);
				}
			});
			$(document).on('click',".qty-click .qtyminus",function(e) {
				e.preventDefault();
				var input = $(this).parent('.quantity-partent').find('input');
				var currentVal = parseInt(input.val());
				if (!isNaN(currentVal) && currentVal > 1) {
					input.val(currentVal - 1);
				} else {
					input.val(1);
				}
			});
			$(document).on('click','.qty-click button[class*="qty"]',PDR.Helper.delayTime(function(e){
				var beforeQty = parseInt($(this).parents('.item-quan').find('.txt_qty').html()),
						qtyChange = parseInt($(this).siblings('input').val());
				var line = parseInt($(this).parents('.line-item').attr('data-line')) - 1;
				$('.cart-page').addClass('js-loading');
				
				PDR.Cart.cartRender.UpdateChangeQty(null,qtyChange,beforeQty,line);
			},500));
			//SP Combo
			$(document).on('click','.qtyplus-new',function(e){
				e.preventDefault();
				$('.cart-page').addClass('js-loading');
				var input = $(this).parent('.update-quantity').find('input');
				var currentVal = parseInt(input.val());
				if (!isNaN(currentVal)) {
					var qtyChange = currentVal + 1;
					input.val(qtyChange)
				} 
				else {
					var qtyChange = 1;
					input.val(qtyChange);
				}
				input.trigger('change');
			});
			$(document).on('click','.qtyminus-new',function(e) {
				e.preventDefault();
				$('.cart-page').addClass('js-loading');
				var input = $(this).parent('.update-quantity').find('input');
				var currentVal = parseInt(input.val());
				if (!isNaN(currentVal) && currentVal > 1) {
					var qtyChange = currentVal - 1;
					input.val(qtyChange);
				} 
				else {
					var qtyChange = 1;
					input.val(1);
				}
				input.trigger('change');
			});
			$(document).on('change','.update-combo-item',function(e) {
				e.preventDefault();
				var current_quantity = parseInt($(this).val());
				var data_combo = $(this).attr('data-combo');
				var id = PE.virtual_id;
				var properties = {};
				var code = {};
				code[data_combo] = current_quantity;
				properties['PE-combo-set'] = JSON.stringify(code);
				var data_add = {id:id, quantity: 1};
				if(!$.isEmptyObject(properties)){
					data_add['properties'] = properties;
				}
				var param = {
					url: '/cart/add.js',
					type: 'POST',
					data: data_add,
					dataType: 'JSON',
					async: false,
					success: function(data){
						var note = $('#note').val();
						$.ajax({
							type: 'POST',
							url: '/cart/update.js',
							async: false,
							data: {note: note},
							success: function(data){
								window.location.reload();
							}
						});
					},
					error: function(x,y){
						if(x.status == 200 && x.responseText == ""){
							location.reload();
						}
						else{
							alert(JSON.parse(x.responseText).description);
							$('body').removeClass('loading');
						}
					}
				}
				$.ajax(param);
			});
			$(document).on('click','.remove-combo',function(e) {
				e.preventDefault();
				$('.cart-page').addClass('js-loading');
				var current_quantity = 0;
				var data_combo = $(this).attr('data-combo');
				var id = PE.virtual_id;
				var properties = {};
				var code = {};
				code[data_combo] = current_quantity;
				properties['PE-combo-set'] = JSON.stringify(code);
				var data_add = {id:id,quantity:1};
				if(!$.isEmptyObject(properties)){
					data_add['properties'] = properties;
				}
				var param = {
					url: '/cart/add.js',
					type: 'POST',
					data: data_add,
					dataType: 'JSON',
					async: false,
					success: function(data){
						var note = $('#note').val();
						$.ajax({
							type: 'POST',
							url: '/cart/update.js',
							async: false,
							data: {note: note},
							success: function(data){
								window.location.reload();
							}
						});
					},
					error: function(x,y){
						if(x.status == 200 && x.responseText == ""){
							location.reload();
						}
					}
				}
				$.ajax(param);
			});	
		},  
	},
	invoince: {
		init: function(){
			var that = this;
			that.action();  
			that.renderInvoice();
		}, 
		action: function(){
			$('#checkbox-bill').change(function(){
				$('.bill-field').slideToggle();
				var $this = $(this);
				if(!$this.is(':checked')){
					$('.checkout-invoice .form-control').removeClass('is-invalid');
					var form = $('.bill-field'),
							invoice = form.find('input[name="attributes[order_vat_invoice]"]').val(),
							company = form.find('input[name="attributes[bill_order_company]"]').val(),
							email = form.find('input[name="attributes[bill_email]"]').val(),
							tax = form.find('input[name="attributes[bill_order_tax_code]"').val(),
							address = form.find('input[name="attributes[bill_order_address]"]').val();
					var attributes = cartJS.attributes || {};
					if((attributes['bill_order_company'] != undefined && attributes['bill_email'] != undefined &&
							attributes['bill_order_tax_code'] != undefined && attributes['bill_order_address'] != undefined) ||
						  (company != '' || email != '' || tax != '' || address != '')){
						Swal.fire({
							title: 'Thông báo',
							text: 'Thông tin hóa đơn sẽ bị xóa đi!',
							icon: 'warning',
							showCancelButton: true,
							showConfirmButton: true,
							confirmButtonText: 'Đồng ý',
							cancelButtonText: 'Vẫn xuất hoá đơn'
						}).then((result) => {
							if (result.isConfirmed) {
								PDR.Cart.invoince.removeInvoice();
								PDR.Helper.SwalWarning('Thông báo','Thông tin xuất hóa đơn đã xóa','success',false,false,2000);
							}
							else  {
								$('#checkbox-bill').click();
							}
						})
					}
				}
			})
		},
		renderInvoice: function(){
			var attributes = cartJS.attributes || {};
			var isChecked = false;
			if(attributes.order_vat_invoice != 'Không' && attributes.order_vat_invoice != undefined && attributes.hasOwnProperty('order_vat_invoice')){
				$('#form-invoice').find('input[name="attributes[order_vat_invoice]"]').val(attributes.order_vat_invoice);
				isChecked = true;
			}
			if(attributes.bill_order_company != undefined && attributes.hasOwnProperty('bill_order_company')){
				$('#form-invoice').find('input[name="attributes[bill_order_company]"]').val(attributes.bill_order_company).addClass('is-filled');
				isChecked = true;
			}
			if(attributes.bill_email != undefined && attributes.hasOwnProperty('bill_email')){
				$('#form-invoice').find('input[name="attributes[bill_email]"]').val(attributes.bill_email).addClass('is-filled');
				isChecked = true;
			}
			if(attributes.bill_order_tax_code != undefined && attributes.hasOwnProperty('bill_order_tax_code')){
				$('#form-invoice').find('input[name="attributes[bill_order_tax_code]"]').val(attributes.bill_order_tax_code).addClass('is-filled');
				isChecked = true;
			}
			if(attributes.bill_order_address != undefined && attributes.hasOwnProperty('bill_order_address')){
				$('#form-invoice').find('input[name="attributes[bill_order_address]"]').val(attributes.bill_order_address).addClass('is-filled');
				isChecked = true;
			}
			if(isChecked){
				$('#checkbox-bill').click();
			}
		},
		removeInvoice: function(){
			$('.bill-field input').val('');
			$('.bill-field input').removeClass('is-filled');
			var attributes = cartJS.attributes || {};
			attributes['order_vat_invoice'] = 'Không';
			attributes['bill_order_company'] = '';
			attributes['bill_email'] = '';
			attributes['bill_order_tax_code'] = '';
			attributes['bill_order_address'] = '';
			$.ajax({
				type: 'post',
				url: '/cart/update.js', 
				async: false,
				data: {attributes: attributes, note: (typeof $('.cart-note').val() !== 'undefined' && $('.cart-note').val().length > 0) ? $('.cart-note').val() : null}, 
				success: function(response){
					PDR.Global.cartAjax();  
				}
			});
		}
	},
	getStore: function(){
		var self = this;
		if(cartJS.item_count > 0){
			$.get('/checkouts.js').done(function(data){
				//console.log(data.checkouts.available_locations);
				if(data.checkouts.available_locations != null && data.checkouts.available_locations.length > 0){
					data.checkouts.available_locations.map(store => {
						if(!self.provinces.hasOwnProperty(store.province_code)){
							self.provinces[store.province_code] = {
								name: store.province_name,
								districts: {}
							};
							self.provinces[store.province_code].districts[store.district_code] = {
								name: store.district_name,
								stores: `<option value="${store.id}">${store.name}</option>`
							}
						}
						else{
							if(!self.provinces[store.province_code].districts.hasOwnProperty(store.district_code)){
								self.provinces[store.province_code].districts[store.district_code] = {
									name: store.district_name,
									stores: `<option value="${store.id}">${store.name}</option>`
								}
							}
							else{
								self.provinces[store.province_code].districts[store.district_code].stores += `<option value="${store.id}">${store.name}</option>`;
							}
						}
						if(data.checkouts.location_id != null && data.checkouts.location_id == store.id){
							self.picked_data.province_id = store.province_code;
							self.picked_data.district_id = store.district_code;
							self.picked_data.store_id = store.id;
						}
					});

					for(code in self.provinces){
						$('#pickup_province_code').append(`<option value="${code}">${self.provinces[code].name}</option>`);
					}

					if(data.checkouts.location_id != null){
						$('#pickup_province_code').val(self.picked_data.province_id).change();
						setTimeout(function(){
							$('#pickup_district_code').val(self.picked_data.district_id).change();
							setTimeout(function(){
								$('#pickup_store_id').val(self.picked_data.store_id).change();
							},300);
						},300);
					}
				}
			});
		}
	},
	changeProvince: function(){
		$('#pickup_province_code').on('change',function(){
			var code = $(this).val();
			if(code != 'default'){
				var district_in_province = PDR.Cart.provinces[code].districts;
				$('#pickup_district_code option:not(:first-child)').remove();
				$('#pickup_store_id option:not(:first-child)').remove();
				for(dcode in district_in_province){
					$('#pickup_district_code').append(`<option value="${dcode}">${district_in_province[dcode].name}</option>`);
					$('#pickup_store_id').append(district_in_province[dcode].stores);
				}
			}
			else{
				$('#pickup_district_code option:not(:first-child)').remove();
			}
		});
	},
	changeDistrict: function(){
		$('#pickup_district_code').on('change',function(){
			var code = $(this).val();
			var code_prov = $('#pickup_province_code').val();
			if(code != 'default'){
				var store_in_district = PDR.Cart.provinces[code_prov].districts[code].stores;
				$('#pickup_store_id option:not(:first-child)').remove();
				$('#pickup_store_id').append(store_in_district);
			}
			else{
				$('#pickup_district_code option:not(:first-child)').remove();
			}
		});
	},
	pickUpStore: function(){
		$('#checkbox-pickup').change(function(){
			$('.pickup-field').slideToggle();
			var $this = $(this);
		});
		$('#pickup_store').on('click',function(){
			var id_store = $('#pickup_store_id').val();
			if(id_store != 'default'){
				$.ajax({ 
					url: '/checkouts/pickup_loc.js',
					type: 'post',
					dataType: 'json',
					contentType: 'application/json',
					data: JSON.stringify({ 
						location_id: Number(id_store)
					}),
					success: function(result){
						$('#picked-store .alert').removeClass('d-none');
						setTimeout(function(){
							$('#picked-store .alert').addClass('d-none');
						},2000);
					}
				});
			}
		});
	},
	getAPI: function(){
		var self = this;
		function renderCouponMini(info,index){		
			let html_couponmini = `	<span class="code" data-code="${info.code}">${info.code}</span>`;
			return html_couponmini;			
		}
		function detailCoupon(data){
			let detail = '';
			let show_more = false;
			let value_discount = PDR.Helper.moneyFormat(data.savings,'₫');
			let after_text_line1 = ' cho sản phẩm';
			let line_2 = '';
			let line_3 = '';
			let line_4 = '';
			let line_6 = '';
			let line_5 = '';

			if(data.take_type == 2) value_discount = data.savings+'%';
			if(data.discount_type == 3) after_text_line1 = ' phí vận chuyển';
			else if(data.discount_type == 5) after_text_line1 = ' cho giá trị đơn hàng';

			if(data.discount_type == 6){
				if(data.on_every_item) line_2 = '<li class="d-none">Áp dụng 1 lần cho toàn bộ đơn hàng</li>';
				else line_2 = '<li class="d-none">Áp dụng cho từng sản phẩm trong giỏ hàng hàng</li>';
			}

			if(data.order_over > 0) line_3 = '<li>Mua tối thiểu '+PDR.Helper.moneyFormat(data.order_over,'₫')+'</li>';

			if(data.entitled_products.length > 0){
				line_4 = '<li>Sản phẩm';
				let items = [];
				data.entitled_products.map(item => {
					items.push('<a target="blank" href="'+item.url+'">'+item.title+'</a>');
				});
				line_4 += 	items.join('<br>');
				line_4 += '</li>';
			}
			
			if(data.entitled_collections.length > 0){
				line_6 = '<li><div>Nhóm sản phẩm</div>';
				let colls = [];
				data.entitled_collections.map(coll => {
					colls.push('<a class="a-link" target="blank" href="'+coll.url+'">'+coll.title+'</a>');
				});
				line_6 += 	colls.join('<br>');
				line_6 += '</li>';
			}

			if(data.entitled_provinces.length > 0){
				line_5 += '<li>Tỉnh thành áp dụng '+ data.entitled_provinces.map(provinces => {return provinces.name}).join(',') +'</li>';
			}

			if(line_3 != '' || line_4 != '' || line_5 != '' || line_6 != '' ) show_more = true;

			detail += '<li>Giảm '+value_discount+after_text_line1+'</li>';
			detail += line_2;
			detail += line_3;
			detail += line_4;
			detail += line_6;
			detail += line_5;

			return { detail, show_more };
		}
		function renderCoupon(info,index){
			let expire = '';
      //debugger
			let detail_coupon = detailCoupon(info);
			if(info.enddate != null){
				expire = PDR.Helper.formatDate(new Date(info.enddate));
			}
			else {
				expire = 'Không giới hạn';
			}

			let html_coupon = `	
				<div class="coupon-item ${info.code == PDR.Cart.checkout.discount_code?'isSelect':''} ${index >= 10?'d-none':''}" data-code="${info.code}">
					<div class="coupon-item--inner">
						<div class="coupon-item--left">
							<div class="cp-img fade-box">
								<span class="aspect-ratio">
									<svg viewBox="0 0 20 12" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g transform="translate(0.000000, 0.013867)"><path d="M19.3548438,-1.15463195e-14 L4.51613281,-1.15463195e-14 L4.51613281,0.322578125 C4.51613281,0.500898437 4.37183594,0.64515625 4.19355469,0.64515625 C4.01523438,0.64515625 3.87097656,0.500859375 3.87097656,0.322578125 L3.87097656,-1.15463195e-14 L0.64515625,-1.15463195e-14 C0.288867187,-1.15463195e-14 0,0.288828125 0,0.64515625 L0,3.48488281 C0,3.6475 0.0799609375,3.80203125 0.218242187,3.88757812 C0.861171875,4.28523437 1.2903125,4.99488281 1.2903125,5.80644531 C1.2903125,6.61796875 0.861171875,7.32765625 0.218242187,7.7253125 C0.0799609375,7.81085937 0,7.96542969 0,8.12800781 L0,10.9677344 C0,11.3240234 0.288867187,11.6128906 0.64515625,11.6128906 L3.87097656,11.6128906 L3.87097656,11.2903125 C3.87097656,11.1119922 4.01527344,10.9677344 4.19355469,10.9677344 C4.371875,10.9677344 4.51613281,11.1120312 4.51613281,11.2903125 L4.51613281,11.6128906 L19.3548438,11.6128906 C19.7111328,11.6128906 20,11.3240234 20,10.9677344 L20,0.64515625 C20,0.288828125 19.7111328,-1.15463195e-14 19.3548438,-1.15463195e-14 Z M4.51613281,10 C4.51613281,10.1783203 4.37183594,10.3225781 4.19355469,10.3225781 C4.01523438,10.3225781 3.87097656,10.1782812 3.87097656,10 L3.87097656,9.35484375 C3.87097656,9.17652344 4.01527344,9.03226562 4.19355469,9.03226562 C4.371875,9.03226562 4.51613281,9.1765625 4.51613281,9.35484375 L4.51613281,10 Z M4.51613281,8.06449219 C4.51613281,8.2428125 4.37183594,8.38707031 4.19355469,8.38707031 C4.01523438,8.38707031 3.87097656,8.24277344 3.87097656,8.06449219 L3.87097656,7.41933594 C3.87097656,7.24101562 4.01527344,7.09675781 4.19355469,7.09675781 C4.371875,7.09675781 4.51613281,7.24105469 4.51613281,7.41933594 L4.51613281,8.06449219 Z M4.51613281,6.12902344 C4.51613281,6.30734375 4.37183594,6.45160156 4.19355469,6.45160156 C4.01523438,6.45160156 3.87097656,6.30730469 3.87097656,6.12902344 L3.87097656,5.48386719 C3.87097656,5.30554687 4.01527344,5.16128906 4.19355469,5.16128906 C4.371875,5.16128906 4.51613281,5.30558594 4.51613281,5.48386719 L4.51613281,6.12902344 Z M4.51613281,4.19355469 C4.51613281,4.371875 4.37183594,4.51613281 4.19355469,4.51613281 C4.01523438,4.51613281 3.87097656,4.37183594 3.87097656,4.19355469 L3.87097656,3.54839844 C3.87097656,3.37007812 4.01527344,3.22582031 4.19355469,3.22582031 C4.371875,3.22582031 4.51613281,3.37011719 4.51613281,3.54839844 L4.51613281,4.19355469 Z M4.51613281,2.25804687 C4.51613281,2.43636719 4.37183594,2.580625 4.19355469,2.580625 C4.01523438,2.580625 3.87097656,2.43632812 3.87097656,2.25804687 L3.87097656,1.61289062 C3.87097656,1.43457031 4.01527344,1.2903125 4.19355469,1.2903125 C4.371875,1.2903125 4.51613281,1.43460937 4.51613281,1.61289062 L4.51613281,2.25804687 Z" fill="#d91f46"></path><path d="M19.0322656,10.9677344 L5.48386719,10.9677344 C5.30570313,10.9677344 5.16128906,10.8233203 5.16128906,10.6451562 L5.16128906,0.967734375 C5.16128906,0.789570312 5.30570313,0.64515625 5.48386719,0.64515625 L19.0322656,0.64515625 C19.2104297,0.64515625 19.3548438,0.789570312 19.3548438,0.967734375 L19.3548438,10.6451562 C19.3548438,10.8233203 19.2104297,10.9677344 19.0322656,10.9677344 Z" fill="#d91f46" fill-rule="nonzero" opacity="0.189429874"></path><path d="M11.9911719,8.03566406 L10.3191406,9.08535156 C9.95066406,9.31667969 9.48824219,8.98074219 9.594375,8.55878906 L10.0760156,6.64421875 L8.56101563,5.37839844 C8.22710938,5.09941406 8.40375,4.55582031 8.83785156,4.52640625 L10.8075391,4.39285156 L11.5432422,2.56082031 C11.7053906,2.15707031 12.2769531,2.15707031 12.4391016,2.56082031 L13.1748047,4.39285156 L15.1444922,4.52640625 C15.5785938,4.55585938 15.7552344,5.09945313 15.4213281,5.37839844 L13.9063281,6.64421875 L14.3879688,8.55878906 C14.4941016,8.98074219 14.0317188,9.31671875 13.6632031,9.08535156 L11.9911719,8.03566406 Z" fill="#FFFFFF" fill-rule="nonzero"></path><path d="M14.178125,7.72484375 C12.0878516,7.59707031 10.3156641,6.30316406 9.50585938,4.48113281 L8.83785156,4.52640625 C8.40375,4.55585938 8.22710938,5.09945313 8.56101563,5.37839844 L10.0760156,6.64421875 L9.59433594,8.55878906 C9.48820313,8.98074219 9.95058594,9.31667969 10.3191016,9.08535156 L11.9911328,8.03566406 L13.663125,9.08535156 C14.0316016,9.31667969 14.4940234,8.98074219 14.3878516,8.55878906 L14.178125,7.72484375 Z" fill="#FFE8EF" fill-rule="nonzero"></path></g></svg>
								</span>
							</div>
						</div>
						<div class="coupon-item--right">
							<button type="button" class="cp-icon" data-content-id="cp-tooltip-${index}" aria-label="coupon-tooltip-${index}" >
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" x="0" y="0" viewBox="0 0 24 24"><g><g fill="rgb(0,0,0)"><path clip-rule="evenodd" d="m12 3.53846c-4.67318 0-8.46154 3.78836-8.46154 8.46154 0 4.6732 3.78836 8.4615 8.46154 8.4615 4.6732 0 8.4615-3.7883 8.4615-8.4615 0-4.67318-3.7883-8.46154-8.4615-8.46154zm-10 8.46154c0-5.52285 4.47715-10 10-10 5.5228 0 10 4.47715 10 10 0 5.5228-4.4772 10-10 10-5.52285 0-10-4.4772-10-10z"></path><path clip-rule="evenodd" d="m12 7.64103c.4248 0 .7692.34439.7692.76923v4.10254c0 .4249-.3444.7693-.7692.7693s-.7692-.3444-.7692-.7693v-4.10254c0-.42484.3444-.76923.7692-.76923z"></path><path d="m13.0256 15.5897c0 .5665-.4592 1.0257-1.0256 1.0257s-1.0256-.4592-1.0256-1.0257c0-.5664.4592-1.0256 1.0256-1.0256s1.0256.4592 1.0256 1.0256z"></path></g></g></svg>
							</button>	
							<div class="cp-top">
							`;
								var txt_title = `Giảm ${info.take_type == 1 ? PDR.Helper.moneyFormat(info.savings,'₫'):info.savings+'%'}`;
								if(info.discount_type == 3) txt_title = 'Miễn phí vận chuyển';
								html_coupon+=	`<h3>${txt_title}</h3>
                <p>
                  <ul class="promotion-des">${info.description}</ul>
                <p>
                 <p style="display: none;">${info.order_over != null ? 'Đơn hàng từ '+(info.order_over/1000 > 1000 ? info.order_over/1000000 + ' triệu': info.order_over/1000 + 'K') : ''}</p>
							</div>
							<div class="cp-bottom">
								<div class="cp-bottom-detail">
									<p>Mã: <strong>${info.code}</strong></p>
									<p>HSD: ${expire}</p>
								</div>
								<div class="cp-bottom-btn">
									<button class="button btn-apply-line-coupon" data-code="${info.code}">${info.code == PDR.Cart.checkout.discount_code?'Bỏ chọn':'Áp dụng'}</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;

      if(info.description){
        //console.log(info.description);
      }
      
			let html_coupon_tooltip = `	
				<div class="coupon-info" id="cp-tooltip-${index}">
					<div class="content-coupon">
						<div class="dfex-txt dfex-bkg">
							<div class="dfex-txt--1">Mã</div>	
							<div class="dfex-txt--2"><b> ${info.code}</b> <span class="cpi-trigger" data-coupon-index="coupon-item--${index}" data-coupon="${info.code}"></span></div>
						</div>
						<div class="dfex-txt dfex-bkg">
							<div class="dfex-txt--1">Hạn sử dụng</div>
							<div class="dfex-txt--2">${expire}</div>
						</div>
						<div class="dfex-txt dfex-bkg">
							<div class="dfex-txt--3">													
								<ul class="promotion-des">${info.description}</ul> 
							</div>
						</div>
						<div class="dfex-txt--cta">
							<button class="btn-popover btn-popover-close">Đóng</button>
							<button class="btn-popover btn-popover-code btn-apply-line-coupon" data-code="${info.code}">Áp dụng</button>
						</div>
					</div>
				</div>
			`;
			
			if($('.hrv-coupons--box-desc .coupon-detail--body').html() == ''){
				$('.hrv-coupons--box-desc .coupon-detail--body').html(html_coupon_tooltip);
			}
			else{
				$('.hrv-coupons--box-desc .coupon-detail--body').append(html_coupon_tooltip);
			}
			
			return html_coupon;			
		}
		function renderCouponPromo(info,index){
			let expire = '';
			let detail_coupon = detailCoupon(info);
			if(info.enddate != null){
				expire = PDR.Helper.formatDate(new Date(info.enddate));
			}
			else {
				expire = 'Không giới hạn';
			}

			let html_coupon = `	
				<div class="coupon-item ${info.code == PDR.Cart.checkout.discount_code?'isSelect':''} ${index >= 10?'d-none':''}">
					<div class="coupon-item--inner">
						<div class="coupon-item--left">
							<div class="cp-img fade-box">
								<span class="aspect-ratio">
									<img src="//theme.hstatic.net/200000636033/1001030143/14/coupon_2_img.png" alt="">
								</span>
							</div>
						</div>
						<div class="coupon-item--right">
							<button type="button" class="cp-icon" data-content-id="cp-tooltip-${index}" aria-label="coupon-tooltip-${index}" >
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" x="0" y="0" viewBox="0 0 24 24"><g><g fill="rgb(0,0,0)"><path clip-rule="evenodd" d="m12 3.53846c-4.67318 0-8.46154 3.78836-8.46154 8.46154 0 4.6732 3.78836 8.4615 8.46154 8.4615 4.6732 0 8.4615-3.7883 8.4615-8.4615 0-4.67318-3.7883-8.46154-8.4615-8.46154zm-10 8.46154c0-5.52285 4.47715-10 10-10 5.5228 0 10 4.47715 10 10 0 5.5228-4.4772 10-10 10-5.52285 0-10-4.4772-10-10z"></path><path clip-rule="evenodd" d="m12 7.64103c.4248 0 .7692.34439.7692.76923v4.10254c0 .4249-.3444.7693-.7692.7693s-.7692-.3444-.7692-.7693v-4.10254c0-.42484.3444-.76923.7692-.76923z"></path><path d="m13.0256 15.5897c0 .5665-.4592 1.0257-1.0256 1.0257s-1.0256-.4592-1.0256-1.0257c0-.5664.4592-1.0256 1.0256-1.0256s1.0256.4592 1.0256 1.0256z"></path></g></g></svg>
							</button>	
							<div class="cp-top">
							`;
								var txt_title = `Giảm ${info.take_type == 1 ? PDR.Helper.moneyFormat(info.savings,'₫'):info.savings+'%'}`;
								if(info.discount_type == 3) txt_title = 'Miễn phí vận chuyển';
								html_coupon+=	`<h3>${txt_title}</h3>
                <p>
                  <ul class="promotion-des">${info.description}</ul>
                <p>
                 <p style="display: none;">${info.order_over != null ? 'Đơn hàng từ '+(info.order_over/1000 > 1000 ? info.order_over/1000000 + ' triệu': info.order_over/1000 + 'K') : ''}</p>
							</div>
							<div class="cp-bottom">
								<div class="cp-bottom-detail">
									<p>Mã: <strong>${info.code}</strong></p>
									<p>HSD: ${expire}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;	
			let html_coupon_tooltip = `	
				<div class="coupon-info" id="cp-tooltip-${index}">
					<div class="content-coupon">
						<div class="dfex-txt dfex-bkg">
							<div class="dfex-txt--1">Mã</div>	
							<div class="dfex-txt--2"><b> ${info.code}</b> <span class="cpi-trigger" data-coupon-index="coupon-item--${index}" data-coupon="${info.code}"></span></div>
						</div>
						<div class="dfex-txt dfex-bkg">
							<div class="dfex-txt--1">Hạn sử dụng</div>
							<div class="dfex-txt--2">${expire}</div>
						</div>
						<div class="dfex-txt dfex-bkg">
							<div class="dfex-txt--3">													
								<ul>${detail_coupon.detail}</ul> 
							</div>
						</div>
						<div class="dfex-txt--cta">
							<button class="btn-popover btn-popover-close">Đóng</button>
							<button class="btn-popover btn-popover-code btn-apply-line-coupon" data-code="${info.code}">Áp dụng</button>
						</div>
					</div>
				</div>
			`;
			
			if($('.hrv-coupons--box-desc .coupon-detail--body').html() == ''){
				$('.hrv-coupons--box-desc .coupon-detail--body').html(html_coupon_tooltip);
			}
			else{
				$('.hrv-coupons--box-desc .coupon-detail--body').append(html_coupon_tooltip);
			}
			return html_coupon;		
		}
		
		var cart = cartJS;
		if(cart.item_count > 0){
			cart.items.map(x => {
				x.line_price = x.line_price/100;
				x.line_price_orginal = x.line_price_orginal/100;
				x.price = x.price/100;
				x.price_original = x.price_original/100;
			});
		}

		if(cartJS && cartJS != null && cartJS.item_count > 0){
			var getPromotion = $.ajax({
				url: '/promotions.json',
				type: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				data: JSON.stringify({
					showonwebsite: true
				}),
				success: function(discounts){
					console.log(discounts);
				},
				error: function(){}
			});
			$.when($.get('/account.js'),$.get('/checkouts.js'),getPromotion).done(function(rs1,rs2,rs3){
				rs1 = rs1[0];//account
				self.checkout = rs2[0].checkouts;//checkout		

				/* Check cart */
				self.attributes = cartJS.attributes;
				var ids = cartJS.items.map(item => { return item.product_id; });
				/* Render Coupon */
				let code_summary = '';
				var voucher_apply = '';
				var findHoanTien = [];
				var cashback_condition = [];
				var findTangNgay= [];
				var cashback_condition_2 = [];

				var discounts = rs3[0];
				/*console.log('discounts:',discounts);
				console.log('check km 9/9', PDR.Cart.disableVoucher_B3G2);*/
				var now = new Date();
				discounts.promotions.map((coupon,index) => {
					var start_time = new Date(coupon.startdate);
					if(now.getTime() >= start_time.getTime()){
            var allow_render = true;
            if(PDR.Cart.disableVoucher_B3G2 && coupon.code == 'ON-TOP15') allow_render = false;
            if(allow_render){
  						if(!coupon.ispromotion){
  							if(index < 5){
                  if(coupon.discount_type == 3){
                  code_summary += `<div class="item-coupon" data-code="${coupon.code}"><span>Freeship</span></div>`;
                  }
                  else{
                    code_summary += `<div class="item-coupon" data-code="${coupon.code}"><span>Giảm ${coupon.take_type == 1 ? PDR.Helper.moneyFormat(coupon.savings,'₫'):coupon.savings+'%'}</span></div>`;
                  }
  							}
  							$('.hrv-discount-code--internal').append(renderCoupon(coupon,index));
  							$('.cart-discount-code--internal').append(renderCouponMini(coupon,index));
  							if ($('.cart-discount-code--internal span.code').length > 0) {
  								$('.cart-coupons--list').removeClass('d-none');
  							}
  						}
  						else {
                $('.hrv-discount-code--external').append(renderCouponPromo(coupon,index));
  						}
  
  						var still_valid_time = true;
  						if(coupon.enddate != '' && coupon.enddate != null){
  							var end_time = new Date(coupon.enddate);
  							if(now.getTime() > end_time.getTime()) still_valid_time = false;
  						}
  						
  						if(coupon.discount_type == 6 && coupon.code.indexOf('HOANNGAY') > -1 && still_valid_time){
  							findHoanTien.push(coupon);
  							if(coupon.conditions != null && coupon.conditions.length > 0){
  								coupon.conditions.map(condition => {
  									if(!cashback_condition.includes(condition.object_id)) cashback_condition.push(condition.object_id);
  								});
  							}
  						}
  						
  						//if(coupon.discount_type == 6 && coupon.code.indexOf('TANGNGAY') > -1 && still_valid_time){
              if(coupon.discount_type == 6 && coupon.code.indexOf('GIAMNGAY') > -1 && still_valid_time){
  							findTangNgay.push(coupon);
  							if(coupon.conditions != null && coupon.conditions.length > 0){
  								coupon.conditions.map(condition => {
  									if(!cashback_condition_2.includes(condition.object_id)) cashback_condition_2.push(condition.object_id);
  								});
  							}
  						}
            }
					}
				});

        $('.promotion-des').each(function() {
          const lines = $(this).text().split('\n');
          const listItems = lines
            .map(line => line.trim())
            .filter(line => line !== '')
            .map(line => `<li>${line}</li>`)
            .join('');
          $(this).html(listItems);
        });
        
				if(discounts.promotions.length > 10){
					let show_more = `<div class="line-last text-center">
														 <button id="btn-show-all-coupon">
															  <span>Xem thêm</span><svg width="10" height="10" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 2.5L4 5.5L1.5 2.5" stroke="#1982F9" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
														 </button>
													 </div>`;
					$('.hrv-discount-code--internal').append(show_more);

				}

				if(findHoanTien.length > 0){
					if(cashback_condition.length > 0 && cashback_condition.length > 1) cashback_condition = PDR.Helper.uniques(cashback_condition);
					//console.log('a:',cashback_condition);

					findHoanTien = findHoanTien.sort((a,b) => (a.order_over > b.order_over) ? 1 : ((b.order_over > a.order_over) ? -1 : 0));
					var total_price = cartJS.total_price / 100;
					//console.log('findHoanTien:',findHoanTien);

					if(cashback_condition.length == 0){
						findHoanTien.reverse().map(voucher => {
							if( total_price >= voucher.order_over && voucher_apply == '' ){
								voucher_apply = voucher.code;
							}
						});
						PDR.Cart.applyCoupon(voucher_apply);
					}
					else{
						if(cashback_condition.length == 1){
							$.ajax({
								url: '/search.js',
								type: 'POST',
								data: {
									'q': 'filter=((collectionid:product='+cashback_condition[0]+')&&(id:product in '+ids.join(',')+'))',
								},
								success: function(result){ 
									if(result.total > 0){
										var total_check = 0;
										var id_in_collection = result.products.map(item => { return item.id });
										cartJS.items.map(item => {
											if(id_in_collection.includes(item.product_id)) total_check += item.line_price ;
										});

										findHoanTien.reverse().map(voucher => {
											if( total_check >= voucher.order_over && voucher_apply == '' ){
												voucher_apply = voucher.code;
											}
										});

										PDR.Cart.applyCoupon(voucher_apply);
									}
									else{
										PDR.Cart.cartRender.renderDiscountApllied();
										$('.summary-subtotal span.js-subtotal-price').html(PDR.Helper.moneyFormat(self.checkout.subtotal_price_original, '₫'));
										$('.summary-total span.js-total-price').html(PDR.Helper.moneyFormat(self.checkout.total_price,'₫'));
									}
								}
							});
						}
						else{}
					}
				}
				else if(findTangNgay.length > 0){
					//CTKM 2 - LẤP LÁNH NGÀY ĐÔI - ƯU ĐÃI CỰC SỐC - issue #869
					//Tổng giá trị đơn hàng = tổng giá nguyên của các line item
					if(cashback_condition_2.length > 0 && cashback_condition_2.length > 1) cashback_condition_2 = PDR.Helper.uniques(cashback_condition_2);
					console.log('b:',cashback_condition_2);

					findTangNgay = findTangNgay.sort((a,b) => (a.order_over > b.order_over) ? 1 : ((b.order_over > a.order_over) ? -1 : 0));
					console.log('findTangNgay:',findTangNgay);
					
					var total_price = cartJS.total_price / 100;
					var total_price_org = 0;
					var arrItemD88 = cartJS.items.filter(item => item.properties.cates.indexOf('LẤP LÁNH NGÀY ĐÔI - ƯU ĐÃI CỰC SỐC') > -1);
					if (arrItemD88.length > 0){
						arrItemD88.map(item  => { total_price_org += item.line_price_orginal });	
					}

					if(cashback_condition_2.length == 0){
						findTangNgay.reverse().map(voucher => {
							if( total_price_org >= voucher.order_over && voucher_apply == '' ){
								voucher_apply = voucher.code;
							}
						});
						PDR.Cart.applyCoupon(voucher_apply);
					}
					else {
						if(cashback_condition_2.length == 1){
							$.ajax({
								url: '/search.js',
								type: 'POST',
								data: {
									'q': 'filter=((collectionid:product='+cashback_condition_2[0]+')&&((id:product='+ids.join(')||(id:product=')+')))',
								},
								success: function(result){ 
									if(result.total > 0){
										var total_check = 0;
										var id_in_collection = result.products.map(item => { return item.id });
										cartJS.items.map(item => {
											if(id_in_collection.includes(item.product_id)) total_check += item.line_price_orginal ;
										});

										findTangNgay.reverse().map(voucher => {
											if(total_check >= voucher.order_over && voucher_apply == '' ){
												voucher_apply = voucher.code;
											}
										});
										console.log(voucher_apply);
										PDR.Cart.applyCoupon(voucher_apply);
									}
									else{
										PDR.Cart.cartRender.renderDiscountApllied();
										$('.summary-subtotal span.js-subtotal-price').html(PDR.Helper.moneyFormat(self.checkout.subtotal_price_original, '₫'));
										$('.summary-total span.js-total-price').html(PDR.Helper.moneyFormat(self.checkout.total_price,'₫'));
									}
								}
							});
						}
						else{}
					}

				}
				else{
          var subTotalPrice = 0;
          self.checkout.line_items.map(item  => {
            var data_omni = cartJS.items.filter(it => it.variant_id == item.variant_id)[0];
            if(data_omni.hasOwnProperty('inAdmin')){
              var data_variant_omni = data_omni.inAdmin.variants.filter(variant => variant.id == item.variant_id)[0];
              if(data_variant_omni.compare_at_price / 100 > item.line_price_orginal){
                subTotalPrice += data_variant_omni.compare_at_price / 100;
              }
              else{
                subTotalPrice += item.line_price_orginal;
              }
            }
            else{
              subTotalPrice += item.line_price_orginal;
            }
            
          });

          if(subTotalPrice > self.checkout.total_price){
            var discountLine = subTotalPrice - self.checkout.total_price - self.checkout.discount;
            if(discountLine > 0){
              $('.summary-discount-line span.js-subtotal-price').html(PDR.Helper.moneyFormat(discountLine, '₫'));
              $('.summary-discount-line').parent().removeClass('d-none');
            }
            else{
              $('.summary-discount-line').parent().addClass('d-none');
            }
          }
          
					PDR.Cart.cartRender.renderDiscountApllied();
					$('.summary-subtotal span.js-subtotal-price').html(PDR.Helper.moneyFormat(subTotalPrice, '₫'));
          $('.summary-subtotal').attr('data-price',subTotalPrice);
					$('.summary-total span.js-total-price').html(PDR.Helper.moneyFormat(self.checkout.total_price,'₫'));
				}


				//PDR.Cart.cartRender.renderDiscountApllied();

				//$('.summary-subtotal span.js-subtotal-price').html(PDR.Helper.moneyFormat(self.checkout.subtotal_price_original, '₫'));
				//$('.summary-total span.js-total-price').html(PDR.Helper.moneyFormat(self.checkout.total_price,'₫'));

				//$('.cart-coupon .list-coupons').html(code_summary);
				//PDR.Global.popoverSupport();

			}); 
		}
	},
	applyCoupon(coupon){
		$.ajax({
			url: '/checkouts/discount.js',
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				discount_code: coupon
			}),
			success: function(result){
				console.log(result);
				if(result.error){
					$('.hrv-coupons--notify').html('<p>'+result.error_messages['haravan.checkout.field_errors.discount_invalid']+'</p>').removeClass('d-none');
					$('.cart-coupons--notify').html('<p>'+result.error_messages['haravan.checkout.field_errors.discount_invalid']+'</p>').removeClass('d-none');
				}
				else{
					PDR.Cart.checkout = result.checkouts;
					$('.coupon-item').removeClass('isSelect');
					$('.btn-apply-line-coupon').html("Áp dụng");
					$('.btn-apply-line-coupon[data-code="'+coupon+'"]').parents('.coupon-item').addClass('isSelect');
					if(coupon == ''){
						$('.btn-apply-line-coupon').html("Áp dụng");
						$('.checkout-coupon .cart-coupon--content').addClass('d-none');
						$('.summary-used-discount-fee .discount-fee').html('0₫');
					}
					else{
						$('.hrv-coupons--notify > div').addClass('d-none');
						$('.cart-coupons--notify').addClass('d-none');
						$('.btn-apply-line-coupon[data-code="'+coupon+'"]').html("Bỏ chọn");
					}

					PDR.Cart.checkout.line_items.map((item,ind_item) => {
						$('.line-item[data-id="'+item.id+'"] .item-price span').html(PDR.Helper.moneyFormat(item.price,'₫'));

            var data_omni = cartJS.items.filter(it => it.variant_id == item.variant_id)[0];
            if(data_omni.hasOwnProperty('inAdmin')){
              var data_variant_omni = data_omni.inAdmin.variants.filter(variant => variant.id == item.variant_id)[0];
              if(data_variant_omni.compare_at_price / 100 > item.price_original){
                $('.line-item[data-id="'+item.id+'"] .item-price del').html(PDR.Helper.moneyFormat(data_variant_omni.compare_at_price / 100,'₫')).removeClass('d-none');
              }
              else if(item.price_original > item.price){
                $('.line-item[data-id="'+item.id+'"] .item-price del').html(PDR.Helper.moneyFormat(item.price_original,'₫')).removeClass('d-none');
              }
              else{
  							$('.line-item[data-id="'+item.id+'"] .item-price del').addClass('d-none');
  						}
            }
            else{
  						if(item.price_original > item.price){
  							$('.line-item[data-id="'+item.id+'"] .item-price del').html(PDR.Helper.moneyFormat(item.price_original,'₫')).removeClass('d-none');
  						}
  						else{
  							$('.line-item[data-id="'+item.id+'"] .item-price del').addClass('d-none');
  						}
            }
					});
					
					PDR.Cart.cartRender.renderDiscountApllied();
					//$('.summary-subtotal span.js-subtotal-price').html(PDR.Helper.moneyFormat(result.checkouts.subtotal_price_original, '₫'));
          
					$('.summary-total span.js-total-price').html(PDR.Helper.moneyFormat(result.checkouts.total_price,'₫'));
					
					$('#couponModal').modal('hide');
					$(".coupon-info").removeClass('show');
					$(".hrv-coupons--box-desc").addClass('d-none');
					$(".hrv-coupons--box").removeClass('d-none');
				}
			},
			error: function(result){
				$('.hrv-coupons--notify').html('<p>'+result.responseJSON.error_messages['haravan.checkout.field_errors.discount_invalid']+'</p>').removeClass('d-none');
				$('.cart-coupons--notify').html('<p>'+result.responseJSON.error_messages['haravan.checkout.field_errors.discount_invalid']+'</p>').removeClass('d-none');
			}
		});
	},
	couponActions: function(){
		$(document).on('click','.checkout-coupon .js-btn-collapse',function(e){
			e.preventDefault();
			$(this).parent().siblings('.cart-coupon--collapse').removeClass('d-none');
		});
		$(document).on('click','.checkout-coupon .js-show-coupon',function(e){
			e.preventDefault();
			$('#couponModal').modal();
		});
		
		$(document).on('click','#btn-show-all-coupon',function(){
			if($(this).hasClass('open')){
				$(this).find('span:first-child').html('Xem thêm');
			}
			else{
				$(this).find('span:first-child').html('Thu gọn');
			}
			$(this).toggleClass('open');
			$('.coupon-item:not(:nth-child(n+1):nth-child(-n+10))').toggleClass('d-none');
		});
		
		$(document).on('click','.coupon-detail',function(){
			$(this).toggleClass('open');
			$(this).parent().siblings('.coupon_desc').toggleClass('open');
		});
		
		$(document).on('click','.btn-apply-line-coupon',function(e){
			e.preventDefault();
			var self = $(this);
			let coupon = $(this).attr('data-code');	
			if($(this).parents('.coupon-item').hasClass('isSelect')){
				coupon = '';
			}
			
			PDR.Cart.applyCoupon(coupon);

			/*$('#input_coupon').val(coupon).focus().addClass('active');
			$('.input-submit').trigger('click');*/
		});
		
		$(document).on('click','.btn-apply-input-coupon',function(e){
			e.preventDefault();
			PDR.Cart.isInputCoupon = true;
			var coupon = $('input[name="editcoupon[code]"]').val();
      var coupon_normal = coupon.toLowerCase();
			if(coupon != ''){
        if(PDR.Cart.disableVoucher_B3G2 && coupon_normal == 'on-top15'){
          var content_error = 'Mã giảm giá chỉ áp dụng chương trình 2 tặng 1, không áp dụng chồng với CTKM khác';
          $('.cart-coupons--notify').html(content_error).removeClass('d-none');
        }
        else{
  				$('.hrv-coupons--notify > div').addClass('d-none');
          $('.cart-coupons--notify').html('').addClass('d-none');
  				if ($('.btn-apply-line-coupon[data-code="'+coupon+'"]').length > 0){
  					$('.btn-apply-line-coupon[data-code="'+coupon+'"]').trigger('click');
  				}
  				else {
  					PDR.Cart.applyCoupon(coupon);
  				}
        }
			}
			else{
				$('.hrv-coupons--notify .notify-4').removeClass('d-none');
        
			}
		});
		
		$(document).on('click','.input-remove',function(e){
			e.preventDefault();
			
			var coupon = $(this).parents('.line-coupon').find('span.code').attr('data-code');	
			$.ajax({
				url: '/checkouts/discount.js',
				type: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				data: JSON.stringify({
					discount_code: ''
				}),
				success: function(result){
					PDR.Cart.checkout = result.checkouts;
					
					PDR.Cart.checkout.line_items.map(item => {
						$('.line-item[data-id="'+item.id+'"] .item-price span').html(PDR.Helper.moneyFormat(item.price,'₫'));
            
						var data_omni = cartJS.items.filter(it => it.variant_id == item.variant_id)[0];
            if(data_omni.hasOwnProperty('inAdmin') && !$.isEmptyObject(data_omni.inAdmin) && data_omni.inAdmin != undefined){
              var data_variant_omni = data_omni.inAdmin.variants.filter(variant => variant.id == item.variant_id)[0];
              if(data_variant_omni.compare_at_price / 100 > item.price_original){
                $('.line-item[data-id="'+item.id+'"] .item-price del').html(PDR.Helper.moneyFormat(data_variant_omni.compare_at_price / 100,'₫')).removeClass('d-none');
              }
              else if(item.price_original > item.price){
                $('.line-item[data-id="'+item.id+'"] .item-price del').html(PDR.Helper.moneyFormat(item.price_original,'₫')).removeClass('d-none');
              }
              else{
  							$('.line-item[data-id="'+item.id+'"] .item-price del').addClass('d-none');
  						}
            }
            else{
  						if(item.price_original > item.price){
  							$('.line-item[data-id="'+item.id+'"] .item-price del').html(PDR.Helper.moneyFormat(item.price_original,'₫')).removeClass('d-none');
  						}
  						else{
  							$('.line-item[data-id="'+item.id+'"] .item-price del').addClass('d-none');
  						}
            }
					});
					var subTotalPrice = Number($('.summary-subtotal').attr('data-price'));
          
					$('.btn-apply-line-coupon[data-code="'+coupon+'"]').parents('.coupon-item').removeClass('isSelect');
					$('.btn-apply-line-coupon[data-code="'+coupon+'"]').html("Áp dụng");
					$('.checkout-coupon .cart-coupon--content').addClass('d-none');
					$('.summary-used-discount-fee .discount-fee').html('0₫')
					//$('.summary-subtotal span.js-subtotal-price').html(PDR.Helper.moneyFormat(result.checkouts.subtotal_price_original, '₫'));

          if(subTotalPrice > 0){
            var discount_line = subTotalPrice - PDR.Cart.checkout.subtotal_price_original;
            if(discount_line > 0){
              $('.summary-discount-line span.js-subtotal-price').html(PDR.Helper.moneyFormat(discount_line, '₫'));
              $('.summary-discount-line').parent().removeClass('d-none');
            }
            else{
              $('.summary-discount-line').parent().addClass('d-none');
            }
          }
          
					$('.summary-total span.js-total-price').html(PDR.Helper.moneyFormat(result.checkouts.total_price,'₫'));
					
				}
			});
		});
		
		$(document).on('click','.coupon-item .cp-icon',function(e){
			e.preventDefault();
			$(".coupon-info").removeClass('show');
			$(".coupon-info[id='"+$(this).attr('data-content-id')+"']").addClass("show");
			$(this).parents('.modal-body').find(".hrv-coupons--box-desc").removeClass('d-none');
			$(this).parents('.modal-body').find(".hrv-coupons--box").addClass('d-none');
		});
		
		$(document).on('click','.coupon-info .btn-popover-close',function(e){
			e.preventDefault();
			$(".coupon-info").removeClass('show');
			$(".hrv-coupons--box-desc").addClass('d-none');
			$(".hrv-coupons--box").removeClass('d-none');
		});
	},
	submitCheckout: function(){
		function updateNote(data,callback){
			$.ajax({
				url: '/checkouts/note.js',
				type: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				data: JSON.stringify({
					note: data
				}),
				success: function(result){
					if(typeof callback === 'function'){
						return callback(result);
					}
				}
			});
		}
		function validateEmpty(value,target){
			if(value.trim() == ''){
				target.addClass('is-invalid');
			}
			else{
				target.removeClass('is-invalid');
			}
			return value.trim() == ''?false:true;
		}

		//Submit checkout note cart + invoince
		$(document).on('click','#checkout',function(e){
			e.preventDefault();
			$('.cart-layout').addClass('js-loading');
			var note = $('#note').val();

			var invoice_form = $('.bill-field'),
					invoice_company = invoice_form.find('input[name="attributes[bill_order_company]"]').val(),
					invoice_email = invoice_form.find('input[name="attributes[bill_email]"]').val(),
					invoice_tax = invoice_form.find('input[name="attributes[bill_order_tax_code]"').val(),
					invoice_address = invoice_form.find('input[name="attributes[bill_order_address]"]').val();
			let empty1 = true;
			var invoiceCheck = false;
			var policyCheck = false;

			if($('#checkbox-bill').is(':checked')){
				invoiceCheck = true;
			}
			if($('#checkbox-policy').is(':checked')){
				policyCheck = true;
			}


			var attributes = cartJS.attributes || {};
			if (invoiceCheck){
				validateEmpty(invoice_company,$('input[name="attributes[bill_order_company]"]'));
				validateEmpty(invoice_email,$('input[name="attributes[bill_email]"]'));
				validateEmpty(invoice_tax,$('input[name="attributes[bill_order_tax_code]"]'));
				validateEmpty(invoice_address,$('input[name="attributes[bill_order_address]"]'));			
				if ($('.checkout-invoice .is-invalid').length > 0) empty1 = false;
				else{
					attributes['order_vat_invoice'] = 'Có';
					attributes['bill_order_company'] = invoice_company;
					attributes['bill_email'] = invoice_email;
					attributes['bill_order_tax_code'] = invoice_tax;
					attributes['bill_order_address'] = invoice_address;
				}
			}
			else {
				$('.checkout-invoice .form-control').removeClass('is-invalid');
				attributes['order_vat_invoice'] = 'Không';
				attributes['bill_order_company'] = '';
				attributes['bill_email'] = '';
				attributes['bill_order_tax_code'] = '';
				attributes['bill_order_address'] = '';
			}

			if(empty1){
				if (policyCheck){	
					$.ajax({
						type: 'post',
						url: '/cart/update.js', 
						data: {
							attributes: attributes, 
							note: (typeof note !== 'undefined' && note.length > 0) ? note : null
						}, 
						success: function(response){
							PDR.Global.cartAjax();
							window.location = '/checkout';
						}
					});
				}
				else {
					Swal.fire({
						title: 'Thông báo',
						text: 'Quý khách vui lòng chọn đồng ý với các Điều khoản và Điều kiện "Mua hàng và Thanh toán" trước khi mua hàng',
						icon: 'warning',
						showCancelButton: false,
						showConfirmButton: true,
						confirmButtonText: 'Đồng ý'
					})				
				}
			}
			
		});
	},
	renderAppPE: function(){
		/* App XY New - function support */
		var urlPromotion = '/apps/promotion-enterprise/api/';
		var apiBxsyListApplyAble = urlPromotion + 'buy-x-select-y/list-applyable';
		var apiBxsyCheckApplyAble = urlPromotion + 'buy-x-select-y/check-applyable';
		var apiBxsyListItemBuy = urlPromotion + 'buy-x-select-y/list-item-buy';

		var hasPromoXY = false;
		var promotions_applied = [];
		var htmlProgram = [];

		function uniques(arr) {
			var a = [];
			for (var i=0, l=arr.length; i<l; i++)
				if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
					a.push(arr[i]);
			return a;
		};

		function renderProgram(dataApp){//debugger;
			var result = resultSearchPr;
			var list = dataApp;

			var valid_programs = list.filter(big_program => big_program.is_matched_condition);
			if(valid_programs.length > 0){
				valid_programs.map((k1,ik1) => {
					var htmlBxsy = "";
					var htmlBeginSelected = '';
					var valid_program = k1.list_condition_and_promotions.filter(program => program.is_matched_condition);
					if(valid_program.length > 0){
						var k2 = valid_program[0];
						htmlBxsy += '<div class="bxsy-lists" data-cur-vid="" data-code="'+k1.code+'" data-name="'+k1.title+'" data-max="'+k2.max_selected_promotion+'">';
						htmlBxsy +=   '<h4>Chương trình: '+k1.title+'</h4>';

						var giftSelected = [];
						var htmlBxsy1 = '<div class="condition-promotion-row">';
						$.each(k2.list_promotion, function(j3,k3){
							
							console.log('k3:',k3);
							
							var allVrAvai = true;
							var checkAllVrAvai = k3.list_items.filter(x => result.hasOwnProperty(x.product_id) && result[x.product_id].variants[x.variant_id].available);
							//if(template == 'cart' && checkAllVrAvai.length == k3.list_items.length){
              if(checkAllVrAvai.length > 0){
  							htmlBxsy1 += '<div class="condition-promotion-lists '+ (checkAllVrAvai.length == k3.list_items.length ? '' : 'disable-program') +'">';
  							var price = k3.total_price * 1;
  							var price_ori = k3.total_price_original * 1;
  							var percent = 100 - (price / price_ori * 100);
                
  							if(price == 0) {
  								htmlBxsy1 += "<span class='percent d-none'>Quà tặng 0đ</span>";
  							}
  							else {
  								htmlBxsy1 += "<span class='percent d-none'>-"+Math.floor(percent)+"%</span>";
  							}
                
  							var nameInput = 'bxsy-' + k1.code + k3._id;
  
  							htmlBxsy1 += '<div class="bxsy-sublist">';
  							$.each(k3.list_items, function(j4,k4){
                  if(result.hasOwnProperty(k4.product_id)){
    								htmlBxsy1 +='<div class="bxsy-item bxsy-item-empty '+ (!result[k4.product_id].variants[k4.variant_id].available ? 'disable-item' : '') + '" data-id="'+k4.product_id+'" data-vid="'+k4.variant_id+'" data-quantity="'+k4.quantity+'">';
    								htmlBxsy1 +=  '<div class="bxsy-image">';
    								htmlBxsy1 +=	  '<a href="'+result[k4.product_id].url+'" target="_blank">';
    								htmlBxsy1 +=      '<img class="img_empty" src="'+result[k4.product_id].img+'" alt="item 1"/>';
    								htmlBxsy1 +=    '</a>';
    								htmlBxsy1 +=  '</div>';
  
    								htmlBxsy1 +=  '<div class="bxsy-item-title">';
  
    								if (k4.price == 0) {
    									htmlBxsy1 += 		'<div class="detail"><div class="label-xy"><span>Tặng <strong>' + k4.quantity + '</strong></span></div></div>';
    									htmlBxsy1 +=  	'<div class="title"><a href="'+result[k4.product_id].url+'" target="_blank"><span>'+result[k4.product_id].title+'</span>';
    									if (result[k4.product_id].variants[k4.variant_id].title != 'Default Title') {
    										htmlBxsy1 += 			'<span> - '+result[k4.product_id].variants[k4.variant_id].title+'</span>';
    									}
    									htmlBxsy1 += 		'</a></div>';
                      /*
    									htmlBxsy1 +=		'<div class="prices"><span>Giá gốc: <strong>'+Haravan.formatMoney(result[k4.product_id].variants[k4.variant_id].price, window.shop.moneyFormat)+'</strong></span></div>';
      								*/
                      htmlBxsy1 +=		`
                        <div class="prices">
                          <strong>${Haravan.formatMoney(k4.price, window.shop.moneyFormat)}</strong>
                          <del>${Haravan.formatMoney(k4.price_original * 100, window.shop.moneyFormat)}</del>
                          <span class="prices_percent">${Math.ceil((k4.price_original - k4.price) / k4.price_original * 100)}%</span>
                        </div>
                      `;
                    } 
    								else {
    									htmlBxsy1 += 		'<div class="detail"><div class="label-xy"><span>Giá ưu đãi <strong>' +  Haravan.formatMoney(k4.price*100, window.shop.moneyFormat) + '</strong> ';
    									htmlBxsy1 +=    ' cho <strong>'+k4.quantity+'</strong> sản phẩm</span></div>';
    									htmlBxsy1 +=    '<div class="title"><a href="'+result[k4.product_id].url+'" target="_blank"><span>'+result[k4.product_id].title+'</span>';
    									if (result[k4.product_id].variants[k4.variant_id].title != 'Default Title') {
    										htmlBxsy1 +=    	'<span> - '+result[k4.product_id].variants[k4.variant_id].title+'</span>';
    									}
    									htmlBxsy1 += 		'</a></div>';
    									htmlBxsy1 +=		'<span>Giá gốc: <strong>'+Haravan.formatMoney(result[k4.product_id].variants[k4.variant_id].price, window.shop.moneyFormat)+'</strong></span>'
    									htmlBxsy1 +=  	'</div>';
    								}
    
    								htmlBxsy1 +=  '</div>';
    								htmlBxsy1 += '</div>';
                  }
  							});
  							htmlBxsy1 += '</div>';
  
  							htmlBxsy1 += '<div class="bxsy-checkbox"><span>Chọn</span>';
  							htmlBxsy1 += 	'<label class="checkbox-bounce" for="'+ k3._id +'">';
  							htmlBxsy1 +=    	'<input '+(k3.is_selected == true ? 'checked' : '')+' data-prev="'+k3.is_selected+'" class="input-bxsy" data-name="'+k1.title+'" data-code="'+k1.code+'" data-condition="'+k2.condition_value+'" value="'+k3._id+'" type="checkbox" name="'+nameInput+'"'+(checkAllVrAvai.length == k3.list_items.length ? '' : ' disabled')+'>';
  							htmlBxsy1 += 		'<svg viewBox="0 0 21 21"><polyline points="5 10.75 8.5 14.25 16 6"></polyline></svg>';
  							htmlBxsy1 += 	'</label>';
  							htmlBxsy1 += '</div>';
  
  							htmlBxsy1 += '</div>';
  							if(k3.is_selected) giftSelected.push(k3);
              }
							//}
						});

						if(htmlBxsy != ''){
							var checkRender = true;
							htmlBxsy+='<div class="bxsy-lists-condition '+(k2.is_matched_condition == false || checkRender == false ? 'disabled':'')+'" data-condition="'+k2.condition_value+'" data-max="'+k2.max_selected_promotion+'">';

							if(k1.condition_type == 'MIN_TOTAL_QUANTITY') {
								htmlBxsy += '<div class="condition-title"><strong>Lưu ý:</strong> Mua <span>'+k2.condition_value+'</span> sản phẩm chính để được chọn những ưu đãi dưới đây (Chọn tối đa '+k2.max_selected_promotion+')</div>';
							}
							else {
								htmlBxsy += '<div class="condition-title"><strong>Lưu ý:</strong> Mua đơn hàng đạt <span>'+Haravan.formatMoney(k2.condition_value*100, window.shop.moneyFormat)+'</span> để được chọn những ưu đãi dưới đây (Chọn tối đa '+k2.max_selected_promotion+')</div>';
							}

							htmlBxsy += htmlBxsy1;
							htmlBxsy += '</div>';
						}

						// For data-max
						$('.modal-subtitle').html('<p>Hãy chọn sản phẩm trước khi thanh toán! <br> Bạn đã chọn <b class="count-selected">0</b><b>/'+k2.max_selected_promotion+'</b> sản phẩm</p>');

						htmlBeginSelected += '<div class="promo-selected-title"><h4>Chương trình: '+k1.title+'</h4><p>Bạn đã chọn <b>'+giftSelected.length+'/'+k2.max_selected_promotion+' quà tặng</b></p></div>';
						htmlBeginSelected += '<div class="promo-selected-list" data-max="'+k2.max_selected_promotion+'" data-index="'+ik1+'">';

						var htmlItemSticky = "";
						for (var i = 0;i < k2.max_selected_promotion;i++){
							if(giftSelected.length == 0){
							}
							else{
								if(giftSelected[i]){
									var name_cus = 'bxsy-' + k1.code + giftSelected[i]._id ;
									htmlItemSticky += '<div class="promo-selected-item m-visible m-active" data-name="'+k1.title+'" data-code="'+k1.code+'" data-condition="'+k2.max_selected_promotion+'" data-id="'+giftSelected[i]._id+'" data-idname="'+name_cus+'">';

									var info_selected = {};
									info_selected[k1.code] = {
										"rank": k2.max_selected_promotion,
										"selected_promotions": giftSelected.map(x => {return x._id})
									};
									promotions_applied.push(info_selected);
								}
								else{
									htmlItemSticky += '<div class="promo-selected-item m-visible" data-name="" data-code="" data-condition="" data-id="" data-idname="">';
								}
							}

							htmlItemSticky +=  '<div class="box">';
							htmlItemSticky +=    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g fill="#f4b2b0"><path d="m23 11h8v5h-8z" fill="#ffffff" data-original="#f4b2b0" class=""></path><path d="m8.5 10h-1.5a3 3 0 0 0 0 6h16v-5h-11.919a3.888 3.888 0 0 1 -2.581-1z" fill="#ffffff" data-original="#f4b2b0" class=""></path><path d="m47 10h-1.5a3.888 3.888 0 0 1 -2.579 1h-11.921v5h16a3 3 0 0 0 0-6z" fill="#ffffff" data-original="#f4b2b0" class=""></path><path d="m21 16h12v8h-12z" fill="#ffffff" data-original="#f4b2b0" class=""></path><path d="m23.001 24h8.002v28h-8.002z" fill="#ffffff" data-original="#f4b2b0" class=""></path><path d="m9.263 2.628-.282.183a4.543 4.543 0 0 0 -1.925 4.505 4.187 4.187 0 0 0 4.025 3.684h11.919l-9.054-8a3.837 3.837 0 0 0 -4.683-.372z" fill="#ffffff" data-original="#f4b2b0" class=""></path><path d="m45.019 2.811-.282-.183a3.837 3.837 0 0 0 -4.683.372l-9.054 8h11.919a4.187 4.187 0 0 0 4.025-3.684 4.543 4.543 0 0 0 -1.925-4.505z" fill="#ffffff" data-original="#f4b2b0" class=""></path><path d="m48 34a14 14 0 1 0 14 14 14 14 0 0 0 -14-14zm7.379 10.621-9.672 9.672a2.414 2.414 0 0 1 -3.414 0l-2.672-2.672a2.121 2.121 0 0 1 3-3l1.379 1.379 8.379-8.379a2.121 2.121 0 0 1 3 3z" fill="#ffffff" data-original="#f4b2b0" class=""></path></g><path d="m53.879 40a3.142 3.142 0 0 0 -2.207.914l-7.672 7.672-.672-.672a3.121 3.121 0 0 0 -4.414 4.414l2.672 2.672a3.414 3.414 0 0 0 4.828 0l9.672-9.672a3.121 3.121 0 0 0 -2.207-5.328zm.793 3.914-9.672 9.672a1.451 1.451 0 0 1 -2 0l-2.672-2.672a1.121 1.121 0 0 1 1.586-1.586l1.379 1.379a1 1 0 0 0 1.414 0l8.379-8.379a1.121 1.121 0 0 1 1.586 1.586z" fill="#333333" data-original="#b3404a" class=""></path><path d="m51 33.3v-8.3h1a1 1 0 0 0 1-1v-8a1 1 0 0 0 -1-1h-1.556a3.953 3.953 0 0 0 -3.01-5.956 5.686 5.686 0 0 0 .5-1.575 5.519 5.519 0 0 0 -2.37-5.5l-.282-.183a4.833 4.833 0 0 0 -5.889.459l-8.772 7.755h-7.242l-8.771-7.752a4.839 4.839 0 0 0 -5.89-.459l-.281.183a5.519 5.519 0 0 0 -2.37 5.5 5.686 5.686 0 0 0 .5 1.575 3.953 3.953 0 0 0 -3.011 5.953h-1.556a1 1 0 0 0 -1 1v8a1 1 0 0 0 1 1h1v27a1 1 0 0 0 1 1h29.875a14.993 14.993 0 1 0 17.125-19.7zm0-16.3v6h-17v-6zm-10.284-13.254a2.821 2.821 0 0 1 3.476-.279l.283.182a3.566 3.566 0 0 1 1.481 3.515 3.182 3.182 0 0 1 -3.037 2.836h-9.277zm-16.716 8.254h6v3h-6zm-14.474-8.351.281-.182a2.85 2.85 0 0 1 1.557-.467 2.892 2.892 0 0 1 1.92.751l7.074 6.249h-9.277a3.182 3.182 0 0 1 -3.037-2.836 3.565 3.565 0 0 1 1.482-3.515zm-2.526 7.351h1.161a4.849 4.849 0 0 0 2.92 1h10.919v3h-15a2 2 0 0 1 0-4zm-4 12v-6h17v6zm19 28h-17v-26h17zm8 0h-6v-26h6zm2-28h-10v-6h10zm0-11h10.919a4.849 4.849 0 0 0 2.92-1h1.161a2 2 0 0 1 0 4h-15zm1.3 39h-1.3v-26h17v8.051c-.332-.022-.662-.051-1-.051a15 15 0 0 0 -14.7 18zm14.7 10a13 13 0 1 1 13-13 13.015 13.015 0 0 1 -13 13z" fill="#333333" data-original="#b3404a" class=""></path></g></svg>';
							htmlItemSticky +=    '<button class="btn-remove"></button>';
							htmlItemSticky +=  '</div>';
							htmlItemSticky += '</div>';
							//$('.modal-selected-promo-list').append(htmlItemSticky);

							//var htmlItemSelectCart = "";
							htmlBeginSelected += '<div class="selected-item d-none '+(giftSelected.length > 0 && i < giftSelected.length?'active':'')+'">';
							htmlBeginSelected += 	'<a href="javascript:void(0);">';
							htmlBeginSelected += 		'<span>+</span>';
							htmlBeginSelected += 	'</a>';
							htmlBeginSelected += '</div>';
						}

						if(giftSelected.length == 0){
							htmlBeginSelected += '<div class="promo-action"><a class="promo-selected" href="javascript:void(0);">Chọn quà tặng</a></div>';
						}
						else{
							htmlBeginSelected += '<div class="promo-action"><a class="promo-selected" href="javascript:void(0);">Chỉnh sửa quà tặng</a></div>';

						}
						htmlBeginSelected += '</div>';

						$('.promo-listing').append(htmlBeginSelected);

						htmlBxsy += '</div></div>';
						htmlProgram.push(htmlBxsy+'####'+htmlItemSticky+(giftSelected.length > 0?'####'+giftSelected.length:''));
					}

					//$('#promoModal .modal-promo-result').html(htmlBxsy);
					$('.cart-promo').removeClass('d-none');
					hasPromoXY = true;
				});
			}
			$('.loader').removeClass('open');
		};

		function getPromotionAtCart(){
			if(cartJS == null || cartJS == undefined){
				$.ajax({
					url: '/cart.js',
					type: 'GET',
					async: false,
					success: function(cart){
						cartJS = cart;
					}
				});
			}
			var cartnew = window.cartJS;
			if(cartnew.item_count > 0){
				cartnew.items.map(x => {
					x.line_price = x.line_price;
					x.line_price_orginal = x.line_price_orginal;
					x.price = x.price;
					x.price_original = x.price_original;
				});
				
				var datas = {'cart': cartnew};
				$.ajax({
					type: 'POST',
					data: JSON.stringify(datas),
					headers: {
						'Content-Type': 'application/json'
					},
					url: apiBxsyListApplyAble,
					dataType: 'json',
					success: function(res) {
						var aIdBxsy = [], aIdSearchBxsy = []; 
						if(res.success == true && res.data.items.length > 0) {
							$('.count-promo').html(res.data.items.length);
							var listPromotion = res.data.items;

							$.each(listPromotion, function(i1,v1){
								var temp1 = []; 
								var temp2 = [];
								$.each(v1.list_condition_and_promotions, function(i2,v2){									
									$.each(v2.list_promotion, function(i3,v3){
										$.each(v3.list_items, function(i4,v4){
											temp1.push(v4.product_id);
											aIdSearchBxsy.push(v4.product_id);
										});
									});
								});
							});
							aIdSearchBxsy = uniques(aIdSearchBxsy);

							console.log(listPromotion);
              //debugger;
              var loop = Math.ceil(aIdSearchBxsy.length / 10);
              var arrRequest = [];
              for(var i = 0; i < loop; i++){
                var temp = aIdSearchBxsy.splice(0,10);
                var promise = new Promise(function(resolve, reject) {
    							$.ajax({
    								url: "/search?q=filter=("+encodeURIComponent("(id:product="+temp.join(")||(id:product=")+")")+")"+'&view=item-cart',
    								success: function(product){
    									resolve(JSON.parse(product));
    								},
    								error: function(err){
    									resolve('');
    								}
    							})
    						});
              	arrRequest.push(promise);
              }
    					
    					Promise.all(arrRequest).then(function(values) {
                var resultSearchPrNew = {};
                $.each(values,function(_ind,_val){
                  if(_val != '') resultSearchPrNew = {...resultSearchPrNew,..._val};
                });
                resultSearchPr = result = resultSearchPrNew;
                renderProgram(listPromotion);
                
                //var str = "/search?q=filter=("+encodeURIComponent("(id:product="+aIdSearchBxsy.join(")||(id:product=")+")")+")";
                /*$.ajax({
                  url: str+'&view=item-cart',
                  type: 'GET',
                  async: false,
                  success: function(result){
                    resultSearchPr = result = JSON.parse(result);
                    console.log(result);
                    renderProgram(listPromotion);
                  }
                });*/
              });
						}
						else {
							$('.loader').removeClass('open');
						}
					}
				});


				/*$.ajax({
				type: 'POST',
				data: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				},
				url: apiBxsyListItemBuy,
				dataType: 'json',
				success: function(res) {
					console.log(res);
				}
			});*/
			}
		};

		function supportBXSY(){
			$(document).on('click','.add-bxsy:not([disabled])',function(e){
        //debugger;
				e.preventDefault();
				var data = {};

				if(promotions_applied.length > 0){}

				var inputBxSy = $('.bxsy-lists-condition:not(.disabled) .input-bxsy[type="checkbox"]');
				if(inputBxSy.length > 0) {
					inputBxSy.each(function(index){
						var input = $(this);
						var isChecked = input.prop('checked'); 
						var isCheckedPrev = input.attr('data-prev');
						var isDisabled = false;
						var code = input.attr('data-code');
						var condition = input.attr('data-condition');
						var id = input.val();
						if(data.hasOwnProperty(code)) {
							var aPromotion = data[code]['selected_promotions'];
							if(isChecked == true) aPromotion.push(id);
							if(isChecked == false && isCheckedPrev == 'true') {
								var index = aPromotion.indexOf(id);
								if (index > -1) aPromotion.splice(index, 1);
							}
						}
						else {
							data[code] = {};
							data[code]['rank'] = condition;
							data[code]['selected_promotions'] = [];
							if(isChecked == true) data[code]['selected_promotions'].push(id);		
						}
					});
					var current_quantity = 1;
					var id = PE.virtual_id;
					var properties = {};
					var code = {};
					var data_add = {id:id,quantity:current_quantity};
					properties['PE-bXsY-set'] = JSON.stringify(data);
					data_add['properties']= properties;
					var params = {
						url: '/cart/add.js',
						type: 'POST',
						data:  data_add,
						dataType: 'JSON',
						async: false,
						success: function(res){
							location.reload();
						},
						error: function(x,y){
							if(x.status == 200 && x.responseText == ""){
								location.reload();
							}
						}
					}
					$.ajax(params);
				}
				else Swal.fire("Thông báo!", "Bạn chưa chọn ưu đãi nào!", "info"); 
			});

			$(document).on('change','.input-bxsy', function(){
				var bxsy = $(this);
				var name = bxsy.attr('data-name');
				var value = bxsy.val();
				var main = bxsy.parents('.bxsy-lists-condition');
				var subMain = bxsy.parents('.condition-promotion-lists');	

				//Ẩn các conditon còn lại
				var selectecCondition = main.attr('data-condition');	
				var inputOther = bxsy.parents('.bxsy-lists').find('.bxsy-lists-condition:not([data-condition="'+selectecCondition+'"]) .input-bxsy');

				var limit = parseInt(main.attr('data-max')) || 0;
				var aInputChecked = main.find('.input-bxsy:checked'); 
				if(aInputChecked.length > limit) {
					Swal.fire("<p>Thông báo",'Chương trình đang chọn chỉ được chọn <strong>'+limit+' bộ quà tặng</strong>!</p>', "info")
					bxsy.prop('checked', false);
				}
				else {
					$('.count-selected').html(aInputChecked.length);
				};

				if(aInputChecked.length == 0) inputOther.prop('disabled',false); //Mở các conditon còn lại nếu chưa checked
				else inputOther.prop('checked',false).prop('disabled',true); //Ẩn các conditon còn lại

				//check active for data ajax 
				subMain.each(function(index2){
					var subMainChecked = $(this).find('.input-bxsy:checked');
					var dataName = subMainChecked.attr('data-name');
					var dataCode = subMainChecked.attr('data-code');
					var dataCondition = subMainChecked.attr('data-condition');
					var dataId = subMainChecked.attr('value');
					var dataIdName = subMainChecked.attr('name');

					if(subMainChecked.length > 0){
						$(this).addClass('active');
						$('.promo-selected-item:not(.m-active):eq(0)').addClass('m-active').attr('data-name',dataName).attr('data-code',dataCode).attr('data-condition',dataCondition).attr('data-id',dataId).attr('data-idname',dataIdName);
					}
					else {
						$(this).removeClass('active');
					}
				});				

				if (!bxsy.is(':checked') && $('.promo-selected-item[data-id="'+value+'"]').length > 0){
					$('.promo-selected-item[data-id="'+value+'"]').removeClass('m-active').attr('data-name','').attr('data-code','').attr('data-condition','').attr('data-id','').attr('data-idname','');
				}

			});

			$(document).on('click','.btn-remove', function(e){
				e.preventDefault();
				var thisItem 	= $(this).parents('.promo-selected-item');
				var thisItemVal = thisItem.attr('data-id');
				thisItem.removeClass('m-active');
				thisItem.attr('data-name','').attr('data-code','').attr('data-condition','').attr('data-id','').attr('data-idname','');
				$('.input-bxsy[value="'+thisItemVal+'"]').prop('checked',false);
				$('.modal-selected-content b.count-selected').html($('.promo-selected-item.m-active').length);
			});

		};

		function failChecked(){
			Swal.fire({
				title: 'Ưu đãi đang chọn không đủ điều kiện!',
				icon: 'warning',
				confirmButtonText: 'OK'
			}).then((result) => {
				window.location.reload();
			});
		};
    
		function successChecked(){
			Swal.fire({
				title: 'Cập nhật ưu đãi thành công!',
				icon: 'success',
				confirmButtonText: 'OK'
			}).then((result) => {
				window.location.reload();
			});
		};

		/* App XY New - function click */
		$(document).ready(function(){
			getPromotionAtCart();
			supportBXSY();
		});

		$(document).on('click','.promo-selected,.selected-item:not(.active)',function(e){
			e.preventDefault();
			var index = Number($(this).parents('.promo-selected-list').attr('data-index'));
			var max = Number($(this).parents('.promo-selected-list').attr('data-max'));
			var dataRender = htmlProgram[index].split('####');
			$('.modal-promo-result').html(dataRender[0]);
			$('.modal-selected-promo-list').html(dataRender[1]);

			if(dataRender.length > 2) $('.modal-selected-content b.count-selected').html(dataRender[2]);
			else $('.modal-selected-content b.count-selected').html('0');
			$('.modal-selected-content b:not(.count-selected)').html('/'+max);
			$('#promoModal').addClass('m-promo-opened');
			$('html, body').addClass('m-promo-opened no-scroll'); 
		});
    
		$(document).on('click','.modal-promo button.close',function(e){
			e.preventDefault();
			$('#promoModal').removeClass('m-promo-opened');
			$('.modal-sticky-bar').removeClass('m-expanded');
			$('html, body').removeClass('m-promo-opened no-scroll');
		});
    
		$(document).on('click','.modal-toggle-btn',function(e){
			e.preventDefault();
			$('.modal-sticky-bar').toggleClass('m-expanded');
			$('.modal--wrapper').toggleClass('m-padding');
		});
    
		$(document).on('click','.btn-remove', function(e){
			e.preventDefault();
			$(this).parents().find('.modal-selected-promo-list ul li.promo-selected-item').removeClass('m-active');
		}); 
	},
	
	returnCoupon: function(totalCart){
		let couponCode = "";
    /*
		if (totalCart >= 30000000) {
			couponCode = "SAVING7.5M";
		} 
		else if (totalCart >= 26000000) {
			couponCode = "SAVING6.2M";
		} 
		else if (totalCart >= 20000000) {
			couponCode = "SAVING5M";
		} 
		else if (totalCart >= 16000000) {
			couponCode = "SAVING3.7M";
		} 
		else if (totalCart >= 10000000) {
			couponCode = "SAVING2.5M";
		} 
		else if (totalCart >= 6000000) {
			couponCode = "SAVING1.2M";
		} 
		else if (totalCart >= 4000000) {
			couponCode = "SAVING700K";
		}
    */

    var startDate = new Date("2025/04/17 00:00:00");
    var endDate = new Date("2025/04/20 23:59:59");
    var now = new Date();
    
    if (totalCart >= 7000000 && startDate.getTime() <= now.getTime() && now.getTime() < endDate.getTime()) {
      if(accountJS.logged == true){
  			couponCode = "MEMBERW-30%";
        if(accountJS.tags.indexOf('Silver') > -1 || accountJS.tags.indexOf('Gold') > -1) couponCode = "MEMBERW-35%";
      }
      else{
        couponCode = "MEMBERW-30%";
      }
		} 

    var startDate = new Date(data_auto.start_time);
    var endDate = new Date(data_auto.end_time);
    if ( startDate.getTime() <= now.getTime() && now.getTime() < endDate.getTime() ){
      if(data_auto.collection_apply != ''){
        var ids = cartJS.items.map(item => { return item.product_id; });
        var query = `(collectionid:product=${data_auto.collection_apply})&&(id:product in ${ids.join(',')})`;
        $.get("/search.js?q=filter=("+encodeURIComponent(query)+")").done(function(data){
          if(data.total > 0){
            var totalCollection = 0;
            cartJS.items.map(item => {
              if(data.products.filter(omni => omni.id == item.product_id).length > 0){
                totalCollection += item.line_price;
              }
            });

            $.each(data_auto.list,function(voucher,range){
              if(totalCollection >= range){
                couponCode = voucher;
                return false;
              } 
            });

            if (couponCode !== "") {
              if(PDR.Cart.checkout != null && ((PDR.Cart.checkout.discount_code != null && PDR.Cart.checkout.discount_code != '' && couponCode != PDR.Cart.checkout.discount_code) || (PDR.Cart.checkout.discount_code == null))){
                $(".right-cart .cart-discount-code--field input").val(couponCode);
          			$(".right-cart .btn-apply-input-coupon").click();
              }
        		} 
          }
        });
      }
      else{
        $.each(data_auto.list,function(voucher,range){
          if(totalCart >= range){
            couponCode = voucher;
            return false;
          } 
        });

        if (couponCode !== "") {
    			$(".right-cart .cart-discount-code--field input").val(couponCode);
    			$(".right-cart .btn-apply-input-coupon").click();
    		} 
      }
    }
	},
	autoApplyCouponMain: function(){
		var self = this;
		if(autoApplyCoupon == 1){
      setTimeout(function(){
  			var total = cartJS.total_price / 100;
  			//console.log(total);
  			self.returnCoupon(total);
      },500);
		}
	},
  newBlockProduct: function(){
    if($('#slider-collection-cart').length > 0){
      var coll_cart_id = $('#slider-collection-cart').attr('data-id'),
          coll_cart_url = '/collections/' + $('#slider-collection-cart').attr('data-handle'),
          coll_cart_limit = $('#slider-collection-cart').attr('data-limit');
      PDR.Global.getItemSlide(coll_cart_id,'',coll_cart_url,1,coll_cart_limit,'#slider-collection-cart',function(){
        var swiper1 = new Swiper("#slider-collection-cart .swiper", {
          loop: true,
          slidesPerView: 2.2,
          breakpoints: {
            735: {
              slidesPerView: 2.2,
            },
            1024: {
              slidesPerView: 4,
            },
            1460: {
              slidesPerView: 4,
            }
          },
          pagination: {
            el: '#slider-collection-cart .swiper-pagination',
            type: 'bullets',
            clickable: true
          },
          navigation: {
            nextEl: '#slider-collection-cart .swiper-button-next',
            prevEl: '#slider-collection-cart .swiper-button-prev',
          }
        });
      });
    }
  }
}
PDR.Store = {
	init: function() {
		var that = this;
		that.renderStore();
	},
	renderStore: function(){
		const renderFilterProvince = arrPrv => {
			let html = '<option value="all">Chọn tỉnh thành</option>';
			return html += `${arrPrv.map(item => {
				return `<option value="${item.toLowerCase()}">${item}</option>`
			}).join('')}`
		}
		function filterItemInList(object) {
			var q = object.val().toLowerCase();
			$('.itemStore').show();
			if (q.length > 0) {
				$('.itemStore').each(function() {
					if ($(this).attr("data-filter").toLowerCase().indexOf(q) == -1)
						$(this).hide();
				})
			}
		}
		const renderOpenList = OPEN_STORES => {
			return htmlOpenList = `${OPEN_STORES.map(store => {
				const { use, name, address, link, openTime, hotline } = store;
				let infoAddress = address.split(',')[0];
				return ` ${!use ? '' : `<div class="itemStore" data-filter="${address}">
								<div class="districtStore">
									<a href="${link}">
										<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="14" height="14" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M256 0C153.755 0 70.573 83.182 70.573 185.426c0 126.888 165.939 313.167 173.004 321.035 6.636 7.391 18.222 7.378 24.846 0 7.065-7.868 173.004-194.147 173.004-321.035C441.425 83.182 358.244 0 256 0zm0 278.719c-51.442 0-93.292-41.851-93.292-93.293S204.559 92.134 256 92.134s93.291 41.851 93.291 93.293-41.85 93.292-93.291 93.292z" fill="#d91f46" opacity="1" data-original="#000000" class=""></path></g></svg>
										<span>${name}</span>
									</a>
								</div>
								<div class="infoStore"><span class="dateOpen">${openTime}</span></div>
								<div class="addressStore">
									<div class="hotline"><b>Hotline:</b> ${hotline}</div>
									<a href="${link}"><span class="infoAddres">${address}</span></a>
									<div class="infoLocation">
										<a target="_blank" href="javascript:void(0)" data-href="${address}">
											<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="12" height="12" x="0" y="0" viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M21.69 11.71a.776.776 0 0 0-.16-.24l-3-3c-.29-.29-.77-.29-1.06 0s-.29.77 0 1.06l1.72 1.72H3c-.41 0-.75.34-.75.75s.34.75.75.75h16.19l-1.72 1.72c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l3-3c.07-.07.12-.15.16-.24.08-.18.08-.39 0-.57z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>
											<span class="guideWay">Chỉ đường</span>
										</a>
									</div>

								</div>
							</div>`}
			`}).join('')}`;
		}
		const uniqueProvinces = [...new Set(OPEN_STORES.map(item => item.province))];

		$('.change-tinh').html(renderFilterProvince(uniqueProvinces));
		$('.innerResultStore').html(renderOpenList(OPEN_STORES));
		
		$(document).on('click', '.infoLocation a',function(){
			var href = $(this).attr("data-href");
			if (href.indexOf("Juno") != -1){
				href = href
			}else{
				href = 'Juno+' + href;
			}
			window.open(
				'https://www.google.com/maps/dir//'+href,
				'_blank'
			);
		});
		$(document).on('change','.change-tinh',function(e){
				e.preventDefault();
				let val = $(this).val();
				if(val == 'all'){
					$('.innerResultStore').html(renderOpenList(OPEN_STORES));
				}else{
					let newListStore = OPEN_STORES.filter(item => item.province.toLowerCase() == val);
					$('.innerResultStore').html(renderOpenList(newListStore));
				}
			})
	}
}
PDR.Tracking = {
	init: function() {
		var that = this;
		that.renderTracking();
	},
	renderTracking: function(){
		var shipping_phone = '';
		function log(args) {
			var str = "";
			for (var i = 0; i < arguments.length; i++) {
				if (typeof arguments[i] === "object") {
					str += JSON.stringify(arguments[i]);
				} else {
					str += arguments[i];
				}
			}
			return str;
		}
		function addCommas(str) {
			var parts = (str + "").split("."),
					main = parts[0],
					len = main.length,
					output = "",
					i = len - 1;

			while(i >= 0) {
				output = main.charAt(i) + output;
				if ((len - i) % 3 === 0 && i > 0) {
					output = "," + output;
				}
				--i;
			}
			// put decimal part back
			if (parts.length > 1) {
				output += "," + parts[1];
			}
			return output;
		}
		function line_item_tracking(item){
			var line_price = parseFloat(item.quantity*item.price).toFixed(0);
			var tr = '';
			try {
				var img = Haravan.resizeImage(item.image.src, 'grande');
				if (img == null ){
					img = 'no-image.jpg';
				}
			} catch(e){

			}
			tr += '<tr data-sku="' + item.sku + '">';
			tr +='<td class="tab_img">';
			tr += '<img width="50" src="' + img + '">';
			tr += '<p class="lineitems-tracking-vendor"><span>'+item.vendor+'</span>'
			if(item.variant_title.indexOf('Default') != -1 )	{
				tr += '<a href="javascript:;">' + item.title + '</a>';
			}else{
				tr += '<a href="javascript:;">' + item.title + '<span class="odVariantTitle"> (' + item.variant_title + ') </span></a>';
			}
			tr += '</p>';
			tr += '</td>';
			tr += '<td class="money text-right fw300">' + log(addCommas(parseFloat(item.price).toFixed(0))) + ' đ' + '</td>';
			tr += '<td class="quantity text-right fw300">' + item.quantity + '</td>';
			tr += '<td class="total money text-right fw300">' + log(addCommas(line_price)) + ' đ' + '</td>';
			tr += '</tr>';
			return tr;
		}
		function headingOrder(orders){
			var cd1 = orders.order_number.substring(0, 3);
			var cd2 = orders.order_number.substring(9, 13);
			var order = cd1 + '*****' + cd2
			var h = $('<div class="tracking-w clearfix"><ul class="tracking-head"></ul></div>');
			var l = '';
			l += '<li>Mã đơn hàng: <span class="tracking_name">' + order + '</span></li>';
			l += '<li><span class="tracking_quantity">' + orders.line_items.length + '</span> Sản phẩm</li>';
			l += '<li>Ngày mua: <span class="tracking_date_buy">' + moment(orders.created_at).format('DD/MM/YYYY H:mm:ss') + '</span></li>';
			l += '<li class="invisible">Số điện thoại: <span class="tracking_phone">' + orders.shipping_address.phone + '</span></li>';
			h.find('ul').append(l);
			return h;
		}
		function renderTime(dt){
			var time = new Date(dt);
			var _date = (time.getDate() < 10 ? ('0' + time.getDate()):time.getDate());
			var _month = time.getMonth()+1;
			_month = _month < 10 ? ('0' + _month): _month;
			time  = (time.getHours() < 10 ? ('0' + time.getHours()): time.getHours()) + ':' + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()) + ' - '+_date+'.'+_month+'.'+time.getFullYear();
			return time;
		};
		function renderHtmlTracking(data){
			var icon_x = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="path-1-inside-1" fill="white"><path d="M5.47027 6L0.116464 0.646198C-0.236691 0.293042 0.293042 -0.236691 0.646198 0.116464L6 5.47027L11.3538 0.116464C11.707 -0.236691 12.2367 0.293042 11.8835 0.646198L6.52973 6L11.8835 11.3538C12.2367 11.707 11.707 12.2367 11.3538 11.8835L6 6.52973L0.646198 11.8835C0.293042 12.2367 -0.236691 11.707 0.116464 11.3538L5.47027 6Z"></path></mask><path d="M5.47027 6L6.17737 6.70711L6.88448 6L6.17737 5.29289L5.47027 6ZM0.116464 0.646198L-0.590642 1.3533L0.116464 0.646198ZM0.646198 0.116464L1.3533 -0.590642L0.646198 0.116464ZM6 5.47027L5.29289 6.17737L6 6.88448L6.70711 6.17737L6 5.47027ZM11.3538 0.116464L10.6467 -0.590642V-0.590642L11.3538 0.116464ZM11.8835 0.646198L12.5906 1.3533V1.3533L11.8835 0.646198ZM6.52973 6L5.82263 5.29289L5.11552 6L5.82263 6.70711L6.52973 6ZM11.8835 11.3538L12.5906 10.6467L11.8835 11.3538ZM11.3538 11.8835L10.6467 12.5906L11.3538 11.8835ZM6 6.52973L6.70711 5.82263L6 5.11552L5.29289 5.82263L6 6.52973ZM0.646198 11.8835L1.3533 12.5906H1.3533L0.646198 11.8835ZM0.116464 11.3538L-0.590642 10.6467H-0.590642L0.116464 11.3538ZM6.17737 5.29289L0.823571 -0.0609092L-0.590642 1.3533L4.76316 6.70711L6.17737 5.29289ZM0.823571 -0.0609092C0.927161 0.0426804 1.01094 0.218208 0.99886 0.423499C0.98823 0.604207 0.908018 0.739124 0.823571 0.823571C0.739124 0.908018 0.604207 0.98823 0.423499 0.99886C0.218208 1.01094 0.0426804 0.927161 -0.0609092 0.823571L1.3533 -0.590642C1.07314 -0.87081 0.698959 -1.0208 0.306055 -0.997689C-0.0622675 -0.976023 -0.373762 -0.807523 -0.590642 -0.590642C-0.807523 -0.373762 -0.976023 -0.0622675 -0.997689 0.306055C-1.0208 0.698959 -0.87081 1.07314 -0.590642 1.3533L0.823571 -0.0609092ZM-0.0609092 0.823571L5.29289 6.17737L6.70711 4.76316L1.3533 -0.590642L-0.0609092 0.823571ZM6.70711 6.17737L12.0609 0.823571L10.6467 -0.590642L5.29289 4.76316L6.70711 6.17737ZM12.0609 0.823571C11.9573 0.927161 11.7818 1.01094 11.5765 0.99886C11.3958 0.98823 11.2609 0.908019 11.1764 0.823572C11.092 0.739125 11.0118 0.604208 11.0011 0.423499C10.9891 0.218209 11.0728 0.0426806 11.1764 -0.0609092L12.5906 1.3533C12.8708 1.07314 13.0208 0.698959 12.9977 0.306054C12.976 -0.0622683 12.8075 -0.373763 12.5906 -0.590643C12.3738 -0.807523 12.0623 -0.976023 11.6939 -0.997689C11.301 -1.0208 10.9269 -0.87081 10.6467 -0.590642L12.0609 0.823571ZM11.1764 -0.0609093L5.82263 5.29289L7.23684 6.70711L12.5906 1.3533L11.1764 -0.0609093ZM5.82263 6.70711L11.1764 12.0609L12.5906 10.6467L7.23684 5.29289L5.82263 6.70711ZM11.1764 12.0609C11.0728 11.9573 10.9891 11.7818 11.0011 11.5765C11.0118 11.3958 11.092 11.2609 11.1764 11.1764C11.2609 11.092 11.3958 11.0118 11.5765 11.0011C11.7818 10.9891 11.9573 11.0728 12.0609 11.1764L10.6467 12.5906C10.9269 12.8708 11.301 13.0208 11.6939 12.9977C12.0623 12.976 12.3738 12.8075 12.5906 12.5906C12.8075 12.3738 12.976 12.0623 12.9977 11.6939C13.0208 11.301 12.8708 10.9269 12.5906 10.6467L11.1764 12.0609ZM12.0609 11.1764L6.70711 5.82263L5.29289 7.23684L10.6467 12.5906L12.0609 11.1764ZM5.29289 5.82263L-0.0609093 11.1764L1.3533 12.5906L6.70711 7.23684L5.29289 5.82263ZM-0.0609092 11.1764C0.0426806 11.0728 0.218209 10.9891 0.423499 11.0011C0.604208 11.0118 0.739125 11.092 0.823572 11.1764C0.908019 11.2609 0.98823 11.3958 0.99886 11.5765C1.01094 11.7818 0.927161 11.9573 0.823571 12.0609L-0.590642 10.6467C-0.87081 10.9269 -1.0208 11.301 -0.997689 11.6939C-0.976023 12.0623 -0.807523 12.3738 -0.590643 12.5906C-0.373763 12.8075 -0.0622683 12.976 0.306054 12.9977C0.698959 13.0208 1.07314 12.8708 1.3533 12.5906L-0.0609092 11.1764ZM0.823571 12.0609L6.17737 6.70711L4.76316 5.29289L-0.590642 10.6467L0.823571 12.0609Z" mask="url(#path-1-inside-1)"></path></svg>';
			var icon_check = '<svg width="19" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.2744 0.47078L6.69658 10.1165L2.72738 6.11917C2.42795 5.81773 2.02188 5.64842 1.59851 5.6485C1.17513 5.64857 0.769121 5.81802 0.469801 6.11957C0.170482 6.42112 0.00236659 6.83007 0.00244143 7.25645C0.00251627 7.68283 0.170775 8.09171 0.470201 8.39315L5.56799 13.5271C5.86735 13.8285 6.2733 13.9978 6.69658 13.9978C7.11986 13.9978 7.52582 13.8285 7.82517 13.5271L18.534 2.74155C18.8247 2.43835 18.9856 2.03226 18.982 1.61075C18.9784 1.18923 18.8105 0.786018 18.5145 0.487952C18.2186 0.189885 17.8182 0.0208135 17.3996 0.0171506C16.9811 0.0134878 16.5779 0.175527 16.2768 0.468369L16.2744 0.47078Z" fill="white"/></svg>';

			var htmlBody = '';
			htmlBody += 			'<div class="order-tracking-wrap">';
			if(data.pos_order_status == 'pos_cancel'){
				htmlBody += 			'<div class="ort-block active" id="ort-canceled">';
				htmlBody += 				'<div class="ort-block-circle">';
				htmlBody += 					'<svg viewBox="0 0 42 50" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40"><path d="M27.7932185,-1.42108547e-13 C31.5753806,-1.42108547e-13 34.6520518,3.07705189 34.6520518,6.85921402 L34.6520518,6.85921402 L34.6520518,30.8207756 C38.5769872,32.0920298 41.4233174,35.7820555 41.4233174,40.1254122 C41.4233174,45.5165351 37.0376998,49.9029141 31.6465768,49.9029141 C27.3332978,49.9029141 23.6638315,47.0946568 22.3689721,43.2108401 L22.3689721,43.2108401 L6.8588333,43.2108401 C3.07667119,43.2108401 0,40.1337882 0,36.3512454 L0,36.3512454 L0,6.85921402 C0,3.07705189 3.07667119,-1.42108547e-13 6.8588333,-1.42108547e-13 L6.8588333,-1.42108547e-13 L27.7932185,-1.42108547e-13 Z M31.6465768,33.2715283 C27.8678413,33.2715283 24.7938352,36.3459152 24.7938352,40.1254122 C24.7938352,43.9041477 27.8678413,46.9789152 31.6465768,46.9789152 C35.4253124,46.9789152 38.4993185,43.9041477 38.4993185,40.1254122 C38.4993185,36.3459152 35.4253124,33.2715283 31.6465768,33.2715283 Z M33.1146679,36.5895817 C33.6853808,36.0188689 34.6113137,36.0188689 35.1820266,36.5895817 C35.7531201,37.1606753 35.7531201,38.0862275 35.1820266,38.6569404 L35.1820266,38.6569404 L33.7139355,40.1250315 L35.1820266,41.5931226 C35.7527393,42.164216 35.7527393,43.0897683 35.1820266,43.6608618 C34.8964798,43.9464086 34.5222231,44.0891819 34.1483473,44.0891819 C33.7740906,44.0891819 33.3998341,43.9464086 33.1146679,43.6608618 L33.1146679,43.6608618 L31.6465768,42.1927707 L30.1784857,43.6608618 C29.892939,43.9464086 29.5186824,44.0891819 29.1448065,44.0891819 C28.7705499,44.0891819 28.3962932,43.9464086 28.1107464,43.6608618 C27.5400337,43.0897683 27.5400337,42.164216 28.1107464,41.5931226 L28.1107464,41.5931226 L29.5788375,40.1250315 L28.1107464,38.6569404 C27.5400337,38.0862275 27.5400337,37.1602946 28.1107464,36.5895817 C28.68184,36.0188689 29.607773,36.0188689 30.1784857,36.5895817 L30.1784857,36.5895817 L31.6465768,38.0576728 L33.1146679,36.5895817 Z M27.7932185,2.92399887 L6.8588333,2.92399887 C4.68905861,2.92399887 2.92399887,4.68943931 2.92399887,6.85921402 L2.92399887,6.85921402 L2.92399887,36.3512454 C2.92399887,38.5214007 4.68905861,40.2868413 6.8588333,40.2868413 L6.8588333,40.2868413 L21.87174,40.2868413 C21.8709785,40.2327777 21.8698363,40.1790949 21.8698363,40.1254122 C21.8698363,34.7335277 26.2554539,30.3475294 31.6465768,30.3475294 C31.6739893,30.3475294 31.7010211,30.3482909 31.7280529,30.3482909 L31.7280529,30.3482909 L31.7280529,6.85921402 C31.7280529,4.68943931 29.9629932,2.92399887 27.7932185,2.92399887 L27.7932185,2.92399887 Z M12.3405697,34.6337768 C13.148096,34.6337768 13.8025691,35.28825 13.8025691,36.0957762 C13.8025691,36.9029217 13.148096,37.5577757 12.3405697,37.5577757 L12.3405697,37.5577757 L7.5814569,37.5577757 C6.7743114,37.5577757 6.1194575,36.9029217 6.1194575,36.0957762 C6.1194575,35.28825 6.7743114,34.6337768 7.5814569,34.6337768 L7.5814569,34.6337768 L12.3405697,34.6337768 Z M27.1768181,15.8543178 C27.9843445,15.8543178 28.6388176,16.508791 28.6388176,17.3163172 C28.6388176,18.1234628 27.9843445,18.7783167 27.1768181,18.7783167 L27.1768181,18.7783167 L7.5814569,18.7783167 C6.7743114,18.7783167 6.1194575,18.1234628 6.1194575,17.3163172 C6.1194575,16.508791 6.7743114,15.8543178 7.5814569,15.8543178 L7.5814569,15.8543178 L27.1768181,15.8543178 Z M24.3590427,10.8366901 C25.1665689,10.8366901 25.8210421,11.491544 25.8210421,12.2986896 C25.8210421,13.1062158 25.1665689,13.760689 24.3590427,13.760689 L24.3590427,13.760689 L7.5814569,13.760689 C6.7739307,13.760689 6.1194575,13.1062158 6.1194575,12.2986896 C6.1194575,11.491544 6.7743114,10.8366901 7.5814569,10.8366901 L7.5814569,10.8366901 L24.3590427,10.8366901 Z M27.2830416,5.81944305 C28.0905678,5.81944305 28.745041,6.47391625 28.745041,7.28144248 C28.745041,8.088588 28.0905678,8.74344192 27.2830416,8.74344192 L27.2830416,8.74344192 L7.5814569,8.74344192 C6.7743114,8.74344192 6.1194575,8.088588 6.1194575,7.28144248 C6.1194575,6.47391625 6.7743114,5.81944305 7.5814569,5.81944305 L7.5814569,5.81944305 L27.2830416,5.81944305 Z"></path></svg>';
				htmlBody += 					'<span>'+icon_x+'</span>';
				htmlBody += 				'</div>';
				htmlBody += 				'<div class="ort-block-title">Huỷ</div>';
				htmlBody += 			'</div>';
			}
			else{
				var aStatus = ['','','','',''];
				var stepPrev = ['','','','',''];
				var delivery_cancel = '';
				var delivery_time = '';
				var delivery_status = 'Đang giao';
				var complete_status = 'Đã nhận hàng';			
				var complete_time = '';			

				if(data.pos_order_status == 'pos_pending' || data.pos_order_status == 'pos_user_assigned'){
					aStatus[0] = 'active';
				}
				if(data.pos_order_status == 'pos_confirmed'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					stepPrev[0] = 'checked';
				}
				if(data.pos_order_status == 'pos_request_cancel'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					stepPrev[0] = 'checked';
				}
				if(data.pos_order_status == 'pos_store_assigned' || data.pos_order_status == 'pos_output' || data.pos_order_status == 'pos_stock_on_hand' || data.pos_order_status == 'pos_out_of_stock'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					aStatus[2] = 'active';
					stepPrev[0] = 'checked';
					stepPrev[1] = 'checked';
				}

				if(data.fulfillments.length > 0){
					delivery_status = data.fulfillments[0].carrier_status_name;
					delivery_time = data.fulfillments[0].delivered_date;
				}
				if(data.pos_order_status == 'pos_delivering_nvc' || data.pos_order_status == 'pos_delivering_self'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					aStatus[2] = 'active';
					aStatus[3] = 'active';
					stepPrev[0] = 'checked';
					stepPrev[1] = 'checked';
					stepPrev[2] = 'checked';
				}
				if(data.pos_order_status == 'pos_delivering_self'){
					if(data.fulfillments[0].carrier_status_code == 'delivering'){
						delivery_time = data.fulfillments[0].delivering_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'readytopick') {
						delivery_time = data.fulfillments[0].ready_to_pick_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'pickupfail') {
						delivery_time = data.fulfillments[0].created_at; // lấy tạm, 10/4 mới build
						delivery_status = 'Chờ lấy hàng';
					}
					else if (data.fulfillments[0].carrier_status_code == 'delivered'){
						delivery_time = data.fulfillments[0].delivered_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'waitingforreturn'){
						delivery_time = data.fulfillments[0].waiting_for_return_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'return'){
						delivery_time = data.fulfillments[0].return_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'picking'){
						delivery_time = data.fulfillments[0].picking_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'notmeetcustomer'){
						delivery_time = data.fulfillments[0].not_meet_customer_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'cancel'){
						delivery_time = data.fulfillments[0].cancel_date;
						delivery_cancel = ' delivery_cancel';
						delivery_status = 'Huỷ giao hàng';
					}
					else {
						delivery_time = data.pos_delivering_self_at;
					}
				}
				if(data.pos_order_status == 'pos_delivering_nvc'){
					if(data.fulfillments[0].carrier_status_code == 'delivering'){
						delivery_time = data.fulfillments[0].delivering_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'readytopick') {
						delivery_time = data.fulfillments[0].ready_to_pick_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'pickupfail') {
						delivery_time = data.fulfillments[0].created_at; // lấy tạm, 10/4 mới build
						delivery_status = 'Chờ lấy hàng';
					}
					else if (data.fulfillments[0].carrier_status_code == 'delivered'){
						delivery_time = data.fulfillments[0].delivered_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'waitingforreturn'){
						delivery_time = data.fulfillments[0].waiting_for_return_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'return'){
						delivery_time = data.fulfillments[0].return_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'picking'){
						delivery_time = data.fulfillments[0].picking_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'notmeetcustomer'){
						delivery_time = data.fulfillments[0].not_meet_customer_date;
					}
					else if (data.fulfillments[0].carrier_status_code == 'cancel'){
						delivery_time = data.fulfillments[0].cancel_date;
						delivery_cancel = ' delivery_cancel';
						delivery_status = 'Huỷ giao hàng';
					}
					else {
						delivery_time = data.pos_delivering_nvc_at;
					}
				}

				if(data.pos_order_status == 'pos_cancel_restock'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					aStatus[2] = 'active';
					aStatus[3] = 'active';
					stepPrev[0] = 'checked';
					stepPrev[1] = 'checked';
					stepPrev[2] = 'checked';
					delivery_cancel = ' delivery_cancel';
					delivery_time = data.pos_cancel_restock_at;
					if (data.fulfillments[0].carrier_status_code == 'cancel'){
						delivery_status = 'Huỷ giao hàng';
					}
					else {
						delivery_status = 'Huỷ - Trả hàng';
					}
				}
				if(data.pos_order_status == 'pos_complete'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					aStatus[2] = 'active';
					aStatus[3] = 'active';
					aStatus[4] = 'active';	
					stepPrev[0] = 'checked';
					stepPrev[1] = 'checked';
					stepPrev[2] = 'checked';
					stepPrev[3] = 'checked';
					complete_status = 'Đã nhận hàng';
					complete_time = data.pos_complete_at;			
				}
				if(data.pos_order_status == 'pos_cancel_refund'){
					aStatus[0] = 'active';
					aStatus[1] = 'active';
					aStatus[2] = 'active';
					aStatus[3] = 'active';
					aStatus[4] = 'active';	
					stepPrev[0] = 'checked';
					stepPrev[1] = 'checked';
					stepPrev[2] = 'checked';
					stepPrev[3] = 'checked';
					complete_status = 'Huỷ - Trả hàng';
					complete_time = data.pos_cancel_refund_at;			
				}				

				htmlBody += 			'<div class="ort-block '+aStatus[0] + ' ' + stepPrev[0] +'" id="ort-ordered">';
				htmlBody += 				'<div class="ort-block-circle">';
				htmlBody += 					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M422.052 56.069h-75.026V46.035c0-9.925-8.075-18-18-18h-31.558C290.783 11.252 274.537 0 256 0c-18.536 0-34.783 11.252-41.469 28.035h-31.558c-9.925 0-18 8.075-18 18V56.07H89.948c-16.303 0-29.565 13.263-29.565 29.565v396.8c0 16.303 13.263 29.565 29.565 29.565h332.104c16.303 0 29.565-13.263 29.565-29.565v-396.8c0-16.303-13.263-29.566-29.565-29.566zM180.974 46.035c0-1.084.916-2 2-2h37.389a8 8 0 0 0 7.777-6.124C231.251 25.01 242.708 16 256 16s24.749 9.01 27.859 21.91a8.001 8.001 0 0 0 7.777 6.125h37.389c1.084 0 2 .916 2 2v36.07c0 1.084-.916 2-2 2H182.974c-1.084 0-2-.916-2-2zm254.643 436.4c0 7.48-6.085 13.565-13.565 13.565H89.948c-7.48 0-13.565-6.085-13.565-13.565v-396.8c0-7.48 6.085-13.565 13.565-13.565h75.025v10.036c0 9.925 8.075 18 18 18h146.052c9.925 0 18-8.075 18-18V72.069h75.026c7.48 0 13.565 6.085 13.565 13.565v396.801zM236.596 201.734a8 8 0 0 1 8-8h69a8 8 0 0 1 0 16h-69a8 8 0 0 1-8-8zm122-33.5a8 8 0 0 1-8 8h-106a8 8 0 0 1 0-16h106a8 8 0 0 1 8 8zm0 116.545a8 8 0 0 1-8 8h-106a8 8 0 0 1 0-16h106c4.418.001 8 3.582 8 8zm-122 33.501a8 8 0 0 1 8-8h69a8 8 0 0 1 0 16h-69a8 8 0 0 1-8-8zm122 83.045a8 8 0 0 1-8 8h-106a8 8 0 0 1 0-16h106a8 8 0 0 1 8 8zm-37 33.5a8 8 0 0 1-8 8h-69a8 8 0 0 1 0-16h69c4.418.001 8 3.582 8 8zm-129.68-62.25h-59.473c-8.692 0-15.764 7.071-15.764 15.764v59.473c0 8.692 7.071 15.764 15.764 15.764h59.473c8.692 0 15.764-7.071 15.764-15.764v-59.473c0-8.693-7.072-15.764-15.764-15.764zm-.236 75h-59v-59h21.5v9.224a8 8 0 0 0 16 0v-9.224h21.5zm.236-191.546h-59.473c-8.692 0-15.764 7.071-15.764 15.764v59.473c0 8.692 7.071 15.764 15.764 15.764h59.473c8.692 0 15.764-7.071 15.764-15.764v-59.473c0-8.692-7.072-15.764-15.764-15.764zm-.236 75h-59v-59h21.5v9.224a8 8 0 0 0 16 0v-9.224h21.5zm.236-191.546h-59.473c-8.692 0-15.764 7.072-15.764 15.764v59.473c0 8.692 7.071 15.763 15.764 15.763h59.473c8.692 0 15.764-7.071 15.764-15.763v-59.473c0-8.692-7.072-15.764-15.764-15.764zm-.236 75h-59v-59h21.5v9.224a8 8 0 0 0 16 0v-9.224h21.5z" fill="currentColor" opacity="1" data-original="#000000" class=""></path></g></svg>';
				htmlBody += 					'<span>'+icon_check+'</span>';
				htmlBody += 				'</div>';
				htmlBody +=					'<div class="ort-block-title">Đơn hàng đã đặt</div>';
				htmlBody +=					'<div class="ort-block-time">'+renderTime(data.created_at)+'</div>';
				htmlBody +=				'</div>';
				htmlBody += 			'<div class="ort-block '+aStatus[1] + ' ' + stepPrev[1] +'" id="ort-processing">';
				htmlBody +=					'<div class="ort-block-circle">';
				htmlBody += 					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M415.506 258.282V131.606a8 8 0 0 0-5.101-7.456L210.901 46.578a7.992 7.992 0 0 0-5.799 0L5.601 124.15A8 8 0 0 0 .5 131.606v230.366a8 8 0 0 0 5.101 7.456L205.103 447a7.992 7.992 0 0 0 5.798 0l102.873-39.999c16.813 34.857 52.51 58.965 93.731 58.965 57.343 0 103.994-46.651 103.994-103.994.001-54.652-42.374-99.592-95.993-103.69zm-207.504-57.687-43.969-17.096c59.145-22.994 118.286-45.991 177.428-68.989l43.97 17.096zm-111.385-43.31L274.04 88.294l45.347 17.632c-59.143 22.998-118.285 45.996-177.428 68.989zm-14.074 11.694 51.416 19.992v38.337l-21.984-18.725a8.002 8.002 0 0 0-7.563-1.549l-21.868 6.801v-44.856zM208.002 62.617l43.963 17.094-177.422 68.991-43.968-17.096zM16.5 143.3l50.043 19.458v58.346c0 3.376 1.621 6.585 4.335 8.582a10.69 10.69 0 0 0 9.478 1.586l24.6-7.65 27.446 23.376a10.675 10.675 0 0 0 11.371 1.568 10.685 10.685 0 0 0 6.187-9.673v-43.7l50.043 19.458V427.85L16.5 356.5zm199.502 284.551v-213.2L399.506 143.3v114.982c-53.619 4.098-95.994 49.039-95.994 103.69 0 10.471 1.562 20.582 4.453 30.121zm191.504 22.115c-48.521 0-87.994-39.474-87.994-87.994 0-48.521 39.474-87.995 87.994-87.995s87.994 39.475 87.994 87.995-39.474 87.994-87.994 87.994zm61.682-137.427c-4.14-4.139-9.643-6.418-15.496-6.418s-11.356 2.279-15.497 6.418l-50.521 50.523-13.828-17.401c-4.177-5.254-10.426-8.268-17.144-8.268a21.962 21.962 0 0 0-13.612 4.755 21.745 21.745 0 0 0-8.126 14.65 21.743 21.743 0 0 0 4.612 16.104l28.42 35.763a21.967 21.967 0 0 0 17.845 9.158c5.84 0 11.334-2.279 15.473-6.417l67.875-67.876c8.543-8.544 8.543-22.447-.001-30.991zm-11.314 19.678-67.875 67.876a5.772 5.772 0 0 1-4.159 1.731 5.876 5.876 0 0 1-4.883-2.541 7.776 7.776 0 0 0-.298-.398l-28.558-35.937a5.848 5.848 0 0 1-1.241-4.333 5.848 5.848 0 0 1 2.187-3.942 5.82 5.82 0 0 1 3.655-1.28c1.812 0 3.495.811 4.618 2.223l19.406 24.421a8 8 0 0 0 5.808 3.01 7.973 7.973 0 0 0 6.112-2.33l56.862-56.864a5.88 5.88 0 0 1 4.184-1.732c1.58 0 3.065.615 4.182 1.732a5.92 5.92 0 0 1 0 8.364z" fill="currentColor" opacity="1" data-original="#000000" class=""></path></g></svg>';
				htmlBody += 					'<span>'+icon_check+'</span>';
				htmlBody += 				'</div>';
				htmlBody +=					'<div class="ort-block-title">Đã xác nhận</div>';
				htmlBody +=					'<div class="ort-block-time">'+ ((data.pos_confirmed_at != null) ? renderTime(data.pos_confirmed_at) : '' ) +'</div>';
				htmlBody += 			'</div>';
				htmlBody += 			'<div class="ort-block '+aStatus[2] + ' ' + stepPrev[2] +'" id="ort-delivering">';
				htmlBody +=					'<div class="ort-block-circle">';
				htmlBody += 					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 128 128" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M94.581 96.596c0-1.106.907-1.984 2.013-1.984s1.984.878 1.984 1.984v29.392c0 1.105-.879 2.013-1.984 2.013H11.416c-1.105 0-1.984-.907-1.984-2.013V75.451c0-1.106.878-1.984 1.984-1.984s2.013.878 2.013 1.984v48.552h81.152z" fill="" opacity="1" data-original="" class=""></path><path d="M29.104 120.8c0 1.105-.907 2.013-2.013 2.013s-1.983-.907-1.983-2.013V95.263c0-3.798 1.53-7.256 4.053-9.75 2.495-2.494 5.953-4.054 9.751-4.054s7.256 1.56 9.75 4.054a13.775 13.775 0 0 1 4.054 9.75V120.8a2.02 2.02 0 0 1-2.012 2.013c-1.106 0-1.985-.907-1.985-2.013V95.263c0-2.692-1.105-5.131-2.891-6.915-1.786-1.786-4.224-2.892-6.917-2.892s-5.159 1.105-6.944 2.892c-1.758 1.784-2.863 4.223-2.863 6.915zM65.584 104.843h18.367V90.869H65.584zm20.38 3.997H63.6c-1.105 0-2.013-.879-2.013-1.984V88.857c0-1.105.907-1.984 2.013-1.984h22.364c1.105 0 2.013.879 2.013 1.984v17.998c0 1.106-.908 1.985-2.013 1.985z" fill="" opacity="1" data-original="" class=""></path><path fill-rule="evenodd" d="M42.256 110.058a2.008 2.008 0 0 0 1.984-1.983c0-1.105-.907-2.013-1.984-2.013a2.021 2.021 0 0 0-2.013 2.013c0 1.076.907 1.983 2.013 1.983z" clip-rule="evenodd" fill="" opacity="1" data-original="" class=""></path><path d="M44.58 61.959v-.114l1.333-24.744H38.23l-4.535 24.971c.028 1.587.624 3.005 1.616 4.054a5.237 5.237 0 0 0 3.826 1.644 5.221 5.221 0 0 0 3.798-1.644c1.021-1.077 1.616-2.551 1.616-4.167zm5.301-24.857-1.304 24.857c0 1.616.624 3.09 1.616 4.167a5.239 5.239 0 0 0 7.624 0c1.021-1.077 1.616-2.551 1.616-4.167h.028l-.681-12.471a2 2 0 0 1 1.9-2.098 1.998 1.998 0 0 1 2.097 1.899l.652 12.556v.114h.028c0 1.616.624 3.09 1.616 4.167a5.237 5.237 0 0 0 3.826 1.644c1.104 0 1.983.907 1.983 2.012s-.879 2.013-1.983 2.013c-2.636 0-5.018-1.134-6.718-2.919-.255-.283-.51-.566-.737-.879-.226.313-.481.596-.736.879-1.701 1.785-4.083 2.919-6.69 2.919-2.636 0-5.017-1.134-6.718-2.919-.255-.283-.51-.566-.737-.879-.227.313-.481.596-.736.879-1.701 1.785-4.082 2.919-6.69 2.919-2.636 0-5.017-1.134-6.718-2.919-.255-.283-.51-.566-.737-.879-.227.313-.482.596-.737.879-1.701 1.785-4.082 2.919-6.689 2.919-2.636 0-5.018-1.134-6.718-2.919-.255-.283-.51-.566-.737-.879-.227.313-.482.596-.737.879-1.7 1.785-4.081 2.919-6.689 2.919-2.239 0-4.28-.822-5.896-2.154A9.736 9.736 0 0 1 .19 64.228c-.169-.708-.226-1.389-.169-2.069.056-.68.227-1.36.51-2.041l8.277-20.181c.85-2.098 2.239-3.798 3.94-4.988a10.438 10.438 0 0 1 5.981-1.843h36.565a2.02 2.02 0 0 1 2.012 2.013c0 1.077-.907 1.984-2.012 1.984h-5.413zm-15.675 0h-8.107l-7.284 25.084c.057 1.531.652 2.92 1.616 3.94a5.243 5.243 0 0 0 7.625 0c1.021-1.077 1.616-2.551 1.616-4.167h.028c0-.114 0-.255.028-.369zm-12.245 0H18.73c-1.389 0-2.665.396-3.713 1.134-1.077.765-1.956 1.842-2.522 3.231L4.217 61.619a3.19 3.19 0 0 0-.227.851c0 .283 0 .567.085.878a5.77 5.77 0 0 0 1.956 3.231 5.182 5.182 0 0 0 3.345 1.19 5.223 5.223 0 0 0 3.798-1.644c1.021-1.077 1.616-2.551 1.616-4.167h.028c0-.199.028-.369.057-.567zM60.624 115.585c-1.105 0-2.013-.878-2.013-1.983s.908-2.013 2.013-2.013H88.94c1.104 0 1.983.907 1.983 2.013s-.879 1.983-1.983 1.983zM124.003 46.767 98.267 90.303a1.97 1.97 0 0 1-2.722.708 1.842 1.842 0 0 1-.736-.736l-25.71-43.508a.63.63 0 0 0-.085-.142c-1.247-2.268-2.211-4.733-2.891-7.284a31.816 31.816 0 0 1-.992-7.908c0-8.673 3.515-16.524 9.184-22.221C80.012 3.514 87.863 0 96.565 0c8.673 0 16.525 3.514 22.223 9.211S128 22.76 128 31.433c0 2.721-.368 5.357-1.021 7.908a31.603 31.603 0 0 1-2.948 7.369zm-27.438-34.41a19.004 19.004 0 0 1 13.492 5.583 19 19 0 0 1 5.584 13.492c0 5.272-2.126 10.034-5.584 13.492s-8.221 5.612-13.492 5.612a19.09 19.09 0 0 1-13.521-5.612c-3.43-3.458-5.583-8.22-5.583-13.492s2.153-10.034 5.583-13.492a19.07 19.07 0 0 1 13.521-5.583zm10.658 8.418c-2.721-2.749-6.491-4.422-10.657-4.422a15.042 15.042 0 0 0-10.687 4.422 15.039 15.039 0 0 0-4.422 10.657c0 4.167 1.701 7.937 4.422 10.686a15.134 15.134 0 0 0 10.687 4.393c4.166 0 7.937-1.672 10.657-4.393 2.722-2.749 4.423-6.519 4.423-10.686 0-4.166-1.702-7.935-4.423-10.657zM96.565 85.371l24.008-40.645a27.484 27.484 0 0 0 2.551-6.406c.567-2.183.879-4.479.879-6.888 0-7.567-3.09-14.427-8.049-19.387-4.962-4.96-11.821-8.049-19.389-8.049-7.597 0-14.456 3.089-19.416 8.049a27.327 27.327 0 0 0-8.022 19.387c0 2.409.283 4.705.85 6.888a28.85 28.85 0 0 0 2.523 6.349l.028.057z" fill="" opacity="1" data-original="" class=""></path><path d="M96.565 22.278c2.495 0 4.79 1.049 6.462 2.693 1.645 1.644 2.665 3.939 2.665 6.462s-1.021 4.818-2.665 6.462c-1.672 1.672-3.938 2.693-6.462 2.693a9.155 9.155 0 0 1-6.492-2.693c-.028-.028-.057-.085-.113-.113a9.106 9.106 0 0 1-2.55-6.349 9.133 9.133 0 0 1 2.663-6.462c.057-.028.085-.085.142-.114a9.131 9.131 0 0 1 6.35-2.579zm3.628 5.498a5.19 5.19 0 0 0-3.628-1.474 5.185 5.185 0 0 0-3.571 1.417l-.085.085a5.093 5.093 0 0 0-1.504 3.628c0 1.389.539 2.636 1.419 3.572l.085.085c.936.907 2.211 1.502 3.656 1.502 1.418 0 2.693-.595 3.628-1.502a5.113 5.113 0 0 0 1.502-3.657 5.096 5.096 0 0 0-1.502-3.628z" fill="" opacity="1" data-original="" class=""></path></g></svg>';
				htmlBody += 					'<span>'+icon_check+'</span>';
				htmlBody += 				'</div>';
				htmlBody +=					'<div class="ort-block-title">Cửa hàng đang xử lý</div>';
				if (data.pos_delivering_self_at != null){
					if(data.fulfillments[0].carrier_status_code == 'delivering' || data.fulfillments[0].carrier_status_code == 'readytopick' || data.fulfillments[0].carrier_status_code == 'delivered' || data.fulfillments[0].carrier_status_code == 'waitingforreturn' || data.fulfillments[0].carrier_status_code == 'return' || data.fulfillments[0].carrier_status_code == 'picking' || data.fulfillments[0].carrier_status_code == 'notmeetcustomer' || data.fulfillments[0].carrier_status_code == 'cancel' || data.fulfillments[0].carrier_status_code == 'pickupfail'){
						htmlBody +=					'<div class="ort-block-time">'+ renderTime(data.pos_store_assigned_at) +'</div>';
					}
					else {
						htmlBody +=					'<div class="ort-block-time">'+ renderTime(data.pos_delivering_self_at) +'</div>';
					}
				}
				else if (data.pos_delivering_nvc_at != null) {
					if(data.fulfillments[0].carrier_status_code == 'delivering' || data.fulfillments[0].carrier_status_code == 'readytopick' || data.fulfillments[0].carrier_status_code == 'delivered' || data.fulfillments[0].carrier_status_code == 'waitingforreturn' || data.fulfillments[0].carrier_status_code == 'return' || data.fulfillments[0].carrier_status_code == 'picking' || data.fulfillments[0].carrier_status_code == 'notmeetcustomer' || data.fulfillments[0].carrier_status_code == 'cancel' || data.fulfillments[0].carrier_status_code == 'pickupfail'){
						htmlBody +=					'<div class="ort-block-time">'+ renderTime(data.pos_store_assigned_at) +'</div>';
					}
					else {
						htmlBody +=					'<div class="ort-block-time">'+ renderTime(data.pos_delivering_nvc_at) +'</div>';
					}
				}
				else {			
					if (aStatus[2] == 'active') htmlBody +=					'<div class="ort-block-time">'+ renderTime(data.pos_store_assigned_at) +'</div>';
				}
				htmlBody +=				'</div>';
				htmlBody += 			'<div class="ort-block '+aStatus[3] + ' ' + stepPrev[3] + delivery_cancel+'" id="ort-fulfilled">';
				htmlBody +=					'<div class="ort-block-circle">';
				htmlBody += 					'<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40"><path d="M48.6693371,28.5712647 C47.2147119,28.5712647 45.8328179,29.1409929 44.7903364,30.1713525 C43.747855,31.2138339 43.1660049,32.5714842 43.1660049,34.0261094 C43.1660049,35.4807347 43.7357331,36.8383849 44.7903364,37.8808664 C45.8449397,38.911226 47.2147119,39.4809542 48.6693371,39.4809542 C51.6513189,39.4809542 54.0756944,37.032335 54.0756944,34.0261094 C54.0756944,31.0198839 51.6513189,28.5712647 48.6693371,28.5712647 Z M48.6693371,37.0565787 C46.9965181,37.0565787 45.5903803,35.6746847 45.5903803,34.0261094 C45.5903803,32.3775341 46.9965181,30.9956401 48.6693371,30.9956401 C50.3179124,30.9956401 51.6513189,32.3532904 51.6513189,34.0261094 C51.6513189,35.6989285 50.3179124,37.0565787 48.6693371,37.0565787 Z M50.0754749,11.3029771 C49.8572811,11.0969052 49.5663561,10.9878083 49.2633091,10.9878083 L43.0447861,10.9878083 C42.3780828,10.9878083 41.8325984,11.5332928 41.8325984,12.199996 L41.8325984,22.1399353 C41.8325984,22.8066386 42.3780828,23.3521231 43.0447861,23.3521231 L52.9119942,23.3521231 C53.5786974,23.3521231 54.1241819,22.8066386 54.1241819,22.1399353 L54.1241819,15.4850247 C54.1241819,15.1456122 53.9787194,14.8183215 53.7241599,14.5880058 L50.0754749,11.3029771 Z M51.6998064,20.9277476 L44.2569738,20.9277476 L44.2569738,13.4000619 L48.7905559,13.4000619 L51.6998064,16.0183873 L51.6998064,20.9277476 Z M19.0677129,28.5712647 C17.6130876,28.5712647 16.2311936,29.1409929 15.1887122,30.1713525 C14.1462307,31.2138339 13.5643806,32.5714842 13.5643806,34.0261094 C13.5643806,35.4807347 14.1341089,36.8383849 15.1887122,37.8808664 C16.2433155,38.911226 17.6130876,39.4809542 19.0677129,39.4809542 C22.0496947,39.4809542 24.4740702,37.032335 24.4740702,34.0261094 C24.4740702,31.0198839 22.0496947,28.5712647 19.0677129,28.5712647 Z M19.0677129,37.0565787 C17.3948938,37.0565787 15.9887561,35.6746847 15.9887561,34.0261094 C15.9887561,32.3775341 17.3948938,30.9956401 19.0677129,30.9956401 C20.7162882,30.9956401 22.0496947,32.3532904 22.0496947,34.0261094 C22.0496947,35.6989285 20.7162882,37.0565787 19.0677129,37.0565787 Z M10.9824208,30.964662 L8.54592346,30.964662 L8.54592346,27.7402426 C8.54592346,27.0735394 8.00043898,26.5280549 7.33373573,26.5280549 C6.66703248,26.5280549 6.12154801,27.0735394 6.12154801,27.7402426 L6.12154801,32.1768497 C6.12154801,32.843553 6.66703248,33.3890374 7.33373573,33.3890374 L10.9824208,33.3890374 C11.649124,33.3890374 12.1946085,32.843553 12.1946085,32.1768497 C12.1946085,31.5101465 11.649124,30.964662 10.9824208,30.964662 Z M17.1282125,23.4558325 C17.1282125,22.7891292 16.5827281,22.2436447 15.9160248,22.2436447 L1.21218772,22.2436447 C0.545484476,22.2436447 5.15143483e-14,22.7891292 5.15143483e-14,23.4558325 C5.15143483e-14,24.1225357 0.545484476,24.6680202 1.21218772,24.6680202 L15.9160248,24.6680202 C16.5827281,24.6680202 17.1282125,24.1346576 17.1282125,23.4558325 Z M3.67292881,19.9822412 L18.3767659,20.0670943 C19.0434692,20.0670943 19.5889536,19.5337317 19.6010755,18.8670285 C19.6131974,18.1882034 19.0677129,17.6427189 18.4010097,17.6427189 L3.69717256,17.5578658 C3.68505068,17.5578658 3.68505068,17.5578658 3.68505068,17.5578658 C3.01834743,17.5578658 2.47286296,18.0912284 2.47286296,18.7579316 C2.46074108,19.4367567 3.00622556,19.9822412 3.67292881,19.9822412 Z M6.14579176,15.3813153 L20.8496289,15.3813153 C21.5163321,15.3813153 22.0618166,14.8358309 22.0618166,14.1691276 C22.0618166,13.5024244 21.5163321,12.9569399 20.8496289,12.9569399 L6.14579176,12.9569399 C5.47908851,12.9569399 4.93360404,13.5024244 4.93360404,14.1691276 C4.93360404,14.8358309 5.47908851,15.3813153 6.14579176,15.3813153 Z M59.0820297,12.9652127 L50.4027656,5.8198864 C50.1845718,5.6391445 49.9178905,5.5427489 49.6269654,5.5427489 L39.4203448,5.5427489 L39.4203448,1.20494541 C39.4203448,0.54222544 38.8748603,0 38.2081571,0 L7.33373573,0 C6.66703248,0 6.12154801,0.54222544 6.12154801,1.20494541 L6.12154801,9.5731298 C6.12154801,10.2358498 6.66703248,10.7780752 7.33373573,10.7780752 C8.00043898,10.7780752 8.54592346,10.2358498 8.54592346,9.5731298 L8.54592346,2.40989083 L37.0080912,2.40989083 L37.0080912,30.9791466 L27.0681519,30.9791466 C26.4014486,30.9791466 25.8559642,31.521372 25.8559642,32.184092 C25.8559642,32.846812 26.4014486,33.3890374 27.0681519,33.3890374 L41.868964,33.3890374 C42.5356673,33.3890374 43.0811517,32.846812 43.0811517,32.184092 C43.0811517,31.521372 42.5356673,30.9791466 41.868964,30.9791466 L39.4324667,30.9791466 L39.4324667,7.9526397 L49.2026997,7.9526397 L57.1061637,14.459345 L57.0213106,30.9550477 L55.7606353,30.9550477 C55.0939321,30.9550477 54.5484476,31.4972731 54.5484476,32.1599931 C54.5484476,32.8227131 55.0939321,33.3649385 55.7606353,33.3649385 L58.2213764,33.3649385 C58.8880797,33.3649385 59.4335641,32.8347625 59.4335641,32.1720426 L59.5305391,13.9050701 C59.5184173,13.5435865 59.3608329,13.1941523 59.0820297,12.9652127 Z"></path></svg>';
				htmlBody += 					'<span>'+icon_check+'</span>';
				htmlBody += 				'</div>';
				htmlBody +=					'<div class="ort-block-title">'+ delivery_status +'</div>';
				htmlBody +=					'<div class="ort-block-time">'+ ((delivery_time != '') ? renderTime(delivery_time) : '' ) +'</div>';
				htmlBody +=				'</div>';
				if(data.pos_order_status == 'pos_cancel_refund'){
					htmlBody += 			'<div class="ort-block '+aStatus[4] + ' ' + stepPrev[3] +'" id="ort-refund">';
					htmlBody +=					'<div class="ort-block-circle">';
					htmlBody += 					'<svg viewBox="0 0 42 50" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40"><path d="M27.7932185,-1.42108547e-13 C31.5753806,-1.42108547e-13 34.6520518,3.07705189 34.6520518,6.85921402 L34.6520518,6.85921402 L34.6520518,30.8207756 C38.5769872,32.0920298 41.4233174,35.7820555 41.4233174,40.1254122 C41.4233174,45.5165351 37.0376998,49.9029141 31.6465768,49.9029141 C27.3332978,49.9029141 23.6638315,47.0946568 22.3689721,43.2108401 L22.3689721,43.2108401 L6.8588333,43.2108401 C3.07667119,43.2108401 0,40.1337882 0,36.3512454 L0,36.3512454 L0,6.85921402 C0,3.07705189 3.07667119,-1.42108547e-13 6.8588333,-1.42108547e-13 L6.8588333,-1.42108547e-13 L27.7932185,-1.42108547e-13 Z M31.6465768,33.2715283 C27.8678413,33.2715283 24.7938352,36.3459152 24.7938352,40.1254122 C24.7938352,43.9041477 27.8678413,46.9789152 31.6465768,46.9789152 C35.4253124,46.9789152 38.4993185,43.9041477 38.4993185,40.1254122 C38.4993185,36.3459152 35.4253124,33.2715283 31.6465768,33.2715283 Z M33.1146679,36.5895817 C33.6853808,36.0188689 34.6113137,36.0188689 35.1820266,36.5895817 C35.7531201,37.1606753 35.7531201,38.0862275 35.1820266,38.6569404 L35.1820266,38.6569404 L33.7139355,40.1250315 L35.1820266,41.5931226 C35.7527393,42.164216 35.7527393,43.0897683 35.1820266,43.6608618 C34.8964798,43.9464086 34.5222231,44.0891819 34.1483473,44.0891819 C33.7740906,44.0891819 33.3998341,43.9464086 33.1146679,43.6608618 L33.1146679,43.6608618 L31.6465768,42.1927707 L30.1784857,43.6608618 C29.892939,43.9464086 29.5186824,44.0891819 29.1448065,44.0891819 C28.7705499,44.0891819 28.3962932,43.9464086 28.1107464,43.6608618 C27.5400337,43.0897683 27.5400337,42.164216 28.1107464,41.5931226 L28.1107464,41.5931226 L29.5788375,40.1250315 L28.1107464,38.6569404 C27.5400337,38.0862275 27.5400337,37.1602946 28.1107464,36.5895817 C28.68184,36.0188689 29.607773,36.0188689 30.1784857,36.5895817 L30.1784857,36.5895817 L31.6465768,38.0576728 L33.1146679,36.5895817 Z M27.7932185,2.92399887 L6.8588333,2.92399887 C4.68905861,2.92399887 2.92399887,4.68943931 2.92399887,6.85921402 L2.92399887,6.85921402 L2.92399887,36.3512454 C2.92399887,38.5214007 4.68905861,40.2868413 6.8588333,40.2868413 L6.8588333,40.2868413 L21.87174,40.2868413 C21.8709785,40.2327777 21.8698363,40.1790949 21.8698363,40.1254122 C21.8698363,34.7335277 26.2554539,30.3475294 31.6465768,30.3475294 C31.6739893,30.3475294 31.7010211,30.3482909 31.7280529,30.3482909 L31.7280529,30.3482909 L31.7280529,6.85921402 C31.7280529,4.68943931 29.9629932,2.92399887 27.7932185,2.92399887 L27.7932185,2.92399887 Z M12.3405697,34.6337768 C13.148096,34.6337768 13.8025691,35.28825 13.8025691,36.0957762 C13.8025691,36.9029217 13.148096,37.5577757 12.3405697,37.5577757 L12.3405697,37.5577757 L7.5814569,37.5577757 C6.7743114,37.5577757 6.1194575,36.9029217 6.1194575,36.0957762 C6.1194575,35.28825 6.7743114,34.6337768 7.5814569,34.6337768 L7.5814569,34.6337768 L12.3405697,34.6337768 Z M27.1768181,15.8543178 C27.9843445,15.8543178 28.6388176,16.508791 28.6388176,17.3163172 C28.6388176,18.1234628 27.9843445,18.7783167 27.1768181,18.7783167 L27.1768181,18.7783167 L7.5814569,18.7783167 C6.7743114,18.7783167 6.1194575,18.1234628 6.1194575,17.3163172 C6.1194575,16.508791 6.7743114,15.8543178 7.5814569,15.8543178 L7.5814569,15.8543178 L27.1768181,15.8543178 Z M24.3590427,10.8366901 C25.1665689,10.8366901 25.8210421,11.491544 25.8210421,12.2986896 C25.8210421,13.1062158 25.1665689,13.760689 24.3590427,13.760689 L24.3590427,13.760689 L7.5814569,13.760689 C6.7739307,13.760689 6.1194575,13.1062158 6.1194575,12.2986896 C6.1194575,11.491544 6.7743114,10.8366901 7.5814569,10.8366901 L7.5814569,10.8366901 L24.3590427,10.8366901 Z M27.2830416,5.81944305 C28.0905678,5.81944305 28.745041,6.47391625 28.745041,7.28144248 C28.745041,8.088588 28.0905678,8.74344192 27.2830416,8.74344192 L27.2830416,8.74344192 L7.5814569,8.74344192 C6.7743114,8.74344192 6.1194575,8.088588 6.1194575,7.28144248 C6.1194575,6.47391625 6.7743114,5.81944305 7.5814569,5.81944305 L7.5814569,5.81944305 L27.2830416,5.81944305 Z"></path></svg>';
					htmlBody += 					'<span>'+icon_x+'</span>';
					htmlBody += 				'</div>';
					htmlBody +=					'<div class="ort-block-title">'+complete_status+'</div>';
					htmlBody +=					'<div class="ort-block-time">'+ renderTime(complete_time) +'</div>';
					htmlBody +=				'</div>';
				}
				else {
					htmlBody += 			'<div class="ort-block '+aStatus[4] + ' ' + stepPrev[3] +'" id="ort-completed">';
					htmlBody +=					'<div class="ort-block-circle">';
					htmlBody += 					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" x="0" y="0" viewBox="0 0 48 48" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="hand receive package"><path d="M44 26V6a1 1 0 0 0-1-1H15a1 1 0 0 0-1 1v16.34c-1.54-.1-1.89 0-6 .53V22a1 1 0 0 0-1-1H1a1 1 0 0 0-1 1v17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1c3.54 0 1.69-.49 11.63 4a11.27 11.27 0 0 0 5.09 1c3.5 0 3.65-.52 21.11-9.44A4 4 0 0 0 44 26ZM32 7v3.38c-3.62-1.81-2.39-1.8-6 0V7ZM16 7h8v5a1 1 0 0 0 1.45.89L29 11.12c3.77 1.88 3.89 2.12 4.53 1.73S34 12.38 34 7h8v19.53l-11 5.62a4.09 4.09 0 0 0-.23-1.5C30 28.56 29.42 28.71 18 23.33a11.47 11.47 0 0 0-2-.68ZM6 38H2V23h4Zm38.92-6.22C27.42 40.72 27.56 41 24.72 41a9.32 9.32 0 0 1-4.26-.8C10.34 35.61 12 36 8 36V24.88c8.22-1 5.44-1.47 19.85 5.3a2 2 0 0 1 .95 2.68 2 2 0 0 1-2.65 1l-7.89-3.76a1 1 0 0 0-.86 1.8l7.89 3.71a3.92 3.92 0 0 0 3.93-.3l13.86-7.09a2 2 0 1 1 1.84 3.56Z" fill="currentColor" opacity="1" data-original="currentColor"></path><path d="M35 25h4a1 1 0 0 0 0-2h-4a1 1 0 0 0 0 2Z" fill="currentColor" opacity="1" data-original="#000000"></path></g></g></svg>';
					htmlBody += 					'<span>'+icon_check+'</span>';
					htmlBody += 				'</div>';
					htmlBody +=					'<div class="ort-block-title">'+complete_status+'</div>';
					if (aStatus[4] == 'active') htmlBody +=					'<div class="ort-block-time">'+ renderTime(complete_time) +'</div>';
					htmlBody +=				'</div>';
				}
			}
			htmlBody += 			'</div>';
			if (data.hasOwnProperty('tracking_url') && data.hasOwnProperty('tracking_number') ){
				htmlBody += 			'<div class="tracking-delivery"><a target="_blank" href="'+data.tracking_url+data.tracking_number+'">Tình trạng giao hàng</a></div>';
			}

			return htmlBody;
		}
		
		$(document).on('click', '#search_order_tracking', function(){
			$('.tracking-detail').html('<div class="loading"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>');
			var phone = $('#tracking_phone').val();
			var orderID = $('#tracking_orders').val();
			orderID = (orderID.indexOf('#') > -1)?orderID:'#'+orderID;
			orderID = orderID.trim().replace('#','%23');
			
			var url = 'https://pandora.norbreeze.vn/apps/smes/api/orders/tracking?phone='+phone+'&&ordernumber='+orderID;
			if(orderID != '' && phone != ''){
				$.ajax({
					type: 'GET',
					url: url,
					success: function(data){
						console.log(data);
						if(data.orders.length > 0){
							var i = 0;
							data.orders.filter(orders => {
								i++;
								var p = $('<div id="order-box-' + i + '" class="box"></div>');

								var head = headingOrder(orders);
								var coupon = '';
								if(orders.discount_codes.length > 0){
									coupon = '<b>('+orders.discount_codes[0].code+')</b>';
								}

								var link = '#';
								shipping_phone = orders.shipping_address.phone;
								console.log(shipping_phone);

								if(!accountJS.logged){
									link = '#';
								}
								else {
									if(phone == shipping_phone) {
										link = '/account/orders/'+orders.cart_token;
									}
								}

								var b = $('<div class="collapse-box__body clearfix">');
								var b2 = '<div class="tracking-item"><div class="clearfix text-center item-ac"><a href="'+link+'" class="show-item-detail">Chi tiết</a><span class="hide-item-detail">Thu gọn ↑</span></div><div class="table-responsive"><table class="table table-bordered">';
								b2 += '<thead><tr><th align="left">Sản phẩm</th><th class="text-right">Đơn giá</th><th class="text-right">Số lượng</th><th class="text-right">Thành tiền</th></tr></thead>';
								b2 += "<tfoot><tr><td colspan='3'>Tổng tiền</td><td><b>"+(orders.total_price).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "₫"+"</b></td></tr><tr><td colspan='3'>Giảm giá "+coupon+"</td><td><b>"+(orders.total_discounts).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "₫"+"</b></td></tr><tr><td colspan='3'>Phí vận chuyển</td><td><b>"+(orders.shipping_lines[0].price).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "₫"+"</b></td></tr></tr><tr><td colspan='3'>Thành tiền</td><td><b>"+(orders.total_price).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "₫"+"</b></td></tr></tfoot></table></div></div>";

								var html_j = '<div class="order-tracking" id="odt-'+i+'">';
								html_j += renderHtmlTracking(orders);
								html_j += '</div>';

								$('.tracking-detail .loading').remove();
								b.append(html_j);
								b.append(b2);
								p.append(head).append(b);
								$('.tracking-detail').addClass('open').append(p);

								$.each(orders.line_items,function(index,item){
									$("#order-box-" + i).find('.table').append(line_item_tracking(item));
								});

							});
						}
						else{
							$('.tracking-detail').html('<p class="text-center no_order_found">Không tìm thấy đơn hàng</p>');
						}
					},
					error: function(jqXHR, textStatus, errorThrown) {
						console.log(textStatus);
						if (jqXHR && jqXHR.status != 500) {
							if(jqXHR.responseText) console.log(jqXHR.responseText);
						}
					}
				});
			}
			else{
				if(orderID == ''){
					if(phone == ''){
						$('.tracking-detail').html('<p class="text-center no_order_found">Vui lòng nhập mã đơn hàng và số điện thoại mua hàng</p>');
					}
					else{
						if((phone != '' || email != '') && orderID == ''){
							$('.tracking-detail').html('<p class="text-center no_order_found">Vui lòng nhập mã đơn hàng</p>');
						}
					}
				}
				else{
					if(phone == ''){
						$('.tracking-detail').html('<p class="text-center no_order_found">số điện thoại mua hàng</p>');
					}
				}
			}

		});
		$(document).on('click', 'a.show-item-detail', function(e){
			e.preventDefault();
			var phone = $('#tracking_phone').val();
			if(!accountJS.logged){
				Swal.fire({
					title: 'Thông báo',
					text: 'Vui lòng đăng nhập để xem chi tiết đơn hàng!',
					icon: 'warning',
					showCancelButton: true,
					showConfirmButton: true,
					confirmButtonText: 'Có',
					cancelButtonText: 'Không',
				}).then((result) => {
					if (result.isConfirmed) {
						window.location.href = 'https://pandora.norbreeze.vn/account/login';
					} 
				})	
			}
			else {
				if(phone == shipping_phone) {
					window.location = $(this).attr("href");
				}
				else {
					Swal.fire({
						title: 'Thông báo',
						text: 'Đơn hàng này không thuộc tài khoản của bạn. Vui lòng đăng nhập đúng tài khoản để xem chi tiết đơn hàng!',
						icon: 'warning',
						showCancelButton: false,
						showConfirmButton: false,
						timer: 4000,
					}).then((result) => {})	
				}
			}

		});	

	}
}
PDR.LdpTayHo = {
	init: function() {
		var that = this;
		that.registerForm();
	},
	registerForm: function(){
		const second = 1000,minute = second * 60,hour = minute * 60,day = hour * 24,countDown = new Date($(".open-countdown-time").data('countdown')).getTime();
		let x = setInterval(function() {
			let now = new Date().getTime(),
					distance = countDown - now,
					countday = Math.floor(distance / (day)),
					counthour = Math.floor((distance % (day)) / (hour)),
					countminute = Math.floor((distance % (hour)) / (minute)),
					countsecond = Math.floor((distance % (minute)) / second);
			countday > 9 ? $('.open-countdown-time .days').text(countday) : $('.open-countdown-time .days').text('0'+countday);
			counthour > 9 ? $('.open-countdown-time .hours').text(counthour) : $('.open-countdown-time .hours').text('0'+counthour);
			countminute > 9 ? $('.open-countdown-time .minutes').text(countminute) : $('.open-countdown-time .minutes').text('0'+countminute);
			countsecond > 9 ? $('.open-countdown-time .seconds').text(countsecond) : $('.open-countdown-time .seconds').text('0'+countsecond);
			if (distance < 0) {
				$('.open-countdown-time .days,.open-countdown-time .hours,.open-countdown-time .minutes,.open-countdown-time .seconds').text("00"),
					clearInterval(x);
			} 
		}, second);
		
		let arrhcm = ['Chọn quận / huyện', 'Huyện Bình Chánh', 'Huyện Cần Giờ', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè', 'Quận 1', 'Quận 10', 'Quận 11', 'Quận 12', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận Bình Tân', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú', 'Thành phố Thủ Đức']
		let arrhn = ['Chọn quận / huyện', 'Huyện Ba Vì', 'Huyện Chương Mỹ', 'Huyện Đan Phượng', 'Huyện Đông Anh', 'Huyện Gia Lâm', 'Huyện Hoài Đức', 'Huyện Mê Linh', 'Huyện Mỹ Đức', 'Huyện Phú Xuyên', 'Huyện Phúc Thọ', 'Huyện Quốc Oai', 'Huyện Sóc Sơn', 'Huyện Thạch Thất', 'Huyện Thanh Oai', 'Huyện Thanh Trì', 'Huyện Thường Tín', 'Huyện Từ Liêm', 'Huyện Ứng Hòa', 'Quận Ba Đình', 'Quận Bắc Từ Liêm', 'Quận Cầu Giấy', 'Quận Đống Đa', 'Quận Hà Đông', 'Quận Hai Bà Trưng', 'Quận Hoàn Kiếm', 'Quận Hoàng Mai', 'Quận Long Biên', 'Quận Nam Từ Liêm', 'Quận Tây Hồ', 'Quận Thanh Xuân', 'Thị xã Sơn Tây']
		function loadoption(data){
			let option_ = '';
			for(let i = 0; i < data.length;i++){
				option_ += `<option value="${data[i]}">${data[i]}</option>`
			}
			$("#district-tayho").html(option_);
		}
    
		$("body").on("change","#pandora-tay-ho .section-4 form .form-group [type='radio']",function(){
			let val = $(this).val();
			if(val == "HCM"){
				loadoption(arrhcm)
			}
			else{
				loadoption(arrhn)
			}
		});
    
		let location = '';
    if(document.referrer != ''){
      location = window.location.href + " Đến từ: " + document.referrer;
    }
    else if(sessionStorage.getItem('log_utm') != null ){
      location = sessionStorage.getItem('log_utm')
    }
    else if(!$.isEmptyObject(paramUrl) && paramUrl.hasOwnProperty('utm_source')){
      var log_utm = [];
      if(paramUrl.hasOwnProperty('utm_source')){
        log_utm.push('utm_source='+paramUrl.utm_source);
      }
      if(paramUrl.hasOwnProperty('utm_source')){
        log_utm.push('utm_source='+paramUrl.utm_source);
      }
      if(paramUrl.hasOwnProperty('utm_medium')){
        log_utm.push('utm_medium='+paramUrl.utm_medium);
      }
      if(paramUrl.hasOwnProperty('utm_campaign')){
        log_utm.push('utm_campaign='+paramUrl.utm_campaign);
      }
      location = log_utm.join('&');
    }
		$("#utm-url").val(location);
    
		$('.sheet-google-form').on('submit',function(e){
			e.preventDefault();
			let $this = $(this), unindexed_array = $this.serializeArray(),indexed_array = {};
			let obj = {
				url: $this.attr('action'),
				phone: $this.find('#phone_form').val(),
				email: $this.find('#email_form').val(),
				district: $this.find("#district-tayho").val(),
        
			}
			function submitcall (){
				if($("#district-tayho").val() != 'Chọn quận / huyện'){
					$.ajax({
						type: 'POST',
						url: obj.url,
						async : false,
						data: indexed_array,
						dataType: 'json',
						complete: function() {
							//fbq('track', 'Lead', {
								//content_name: 'booking',
								//content_category: 'voucher'
							//});
							localStorage.setItem('phone_tayho',obj.phone);
							localStorage.setItem('email_tayho',obj.email);
							setTimeout(() =>{
								if(template == 'page.pandora-tay-ho-4'){
									window.location.href = '/pages/dang-ky-thanh-cong-4'
								}
								else if(template == 'page.pandora-tay-ho-3'){
									window.location.href = '/pages/dang-ky-thanh-cong-3'
								}
								else if(template == 'page.pandora-tay-ho-2'){
									window.location.href = '/pages/dang-ky-thanh-cong-2'
								}
								else {
									window.location.href = '/pages/dang-ky-thanh-cong-1'
								}
							},1000)
						},
						error: function(XMLHttpRequest, textStatus) {
							console.log('err', textStatus );
						}
					});
				}
				else{
					PDR.Helper.SwalWarning("Thông báo","Vui lòng chọn quận / huyện",'error',false,false,3000);
				}
			}
			$.map(unindexed_array, function(n, i){
				indexed_array[n['name']] = n['value'];
			});
			if(localStorage.getItem('phone_tayho') == null || localStorage.getItem('email_tayho') == null){
				submitcall();
			}
			else{
				if(obj.phone == localStorage.getItem('phone_tayho') || obj.email == localStorage.getItem('email_tayho')){
					PDR.Helper.SwalWarning("Thông báo","Email hoặc số điện thoại này đã được đăng ký",'error',false,false,3000);
				}
				else{
					submitcall();
				}
			}
		});
	}
}
PDR.Recruitment = {
	init: function() {
		var that = this;
		that.recruitment();
	},
	recruitment: function(){
		$(document).ready(function(){
			$(".filter-result .desktop tbody").html(listnew_desktop);
			$(".filter-result .mobile tbody").html(listnew_mobile);
		});
		$("body").on("change","#recruitment-page .department",function(e){
			e.preventDefault();
			let value = $(this).val();
			if(value != 'none' ){
				for(let i = 0; i < arrayrecruitment.length;i++){
					let $this_phongban = arrayrecruitment[i].phongban;
					let $this_location = arrayrecruitment[i].location;
					if($this_phongban == value){
						let html_option = '<option value="none" data-value="none">Nơi làm việc</option>';
						for(let j=0;j < $this_location.length;j++ ){
							html_option += `<option value="${$this_location[j]}">${$this_location[j]}</option>`
						}
						$("#recruitment-page .location").html(html_option)
						break;
					}
				}
			}
			else{
				$("#recruitment-page .location").html(`<option value="none" data-value="none">Chọn nơi làm việc</option>`)
			}
		});
		$("body").on("click",".filter-button .btn-filter .js-btn-filter",function(e){
			e.preventDefault();
			let phongban = $("#recruitment-page .department").val(),
					location = $("#recruitment-page .location").val(),
					idblog = $("#recruitment-page .department option:selected").data('id');
			if(phongban != 'none'){
				if(location == 'none' ){
					var str = '/search?q=filter=(blogid:article='+idblog+')&view=filter-recruitment';		
				}
				else{
					var str = '/search?q=filter=((blogid:article='+idblog+')&&(tag:article = location_' + location + '))&view=filter-recruitment';
				}
				$.ajax({
					url: str,
					type: 'GET',
					dataType: "json",
					async: true,
					success: function(data){
						let data_result_desk = '', data_result_mob = '';
						if(data.length > 0){
							$.each(data, function(i, v){
								data_result_desk+= `<tr onclick="window.location='${v.url}';" class="cursor-pointer">
																				<td>${v.title}</td>
																				<td>${phongban}</td>
																				<td>${v.location}</td>
																				<td>${v.date}</td>
																				<td>${v.deadline}</td>
																		 </tr>`;
								data_result_mob+= `<tr onclick="window.location='${v.url}';" class="cursor-pointer">
																			<td>
																				<p class="title">${v.title}</p>
																				<p>${v.location}</p>
																				<p>${phongban}</p>
																				<p>${v.date} - ${v.deadline}</p>
																			</td>
																		 </tr>`;
							});
							$(".filter-result table.desktop tbody").html(data_result_desk)
							$(".filter-result table.mobile tbody").html(data_result_mob)
						}
						else{
							$(".filter-result table.desktop tbody,.filter-result table.mobile tbody").html(`<tr class="cursor-pointer"><td colspan="5"><p class="title">Không có tin tuyển dụng</p></td></tr>`)
						}
					}
				})
			}
			else{
				PDR.Helper.SwalWarning("Thông báo","Vui lòng chọn Khối phòng ban",'error',false,false,3000);
			}
		})
		$("body").on("click",".filter-button .btn-filter .js-btn-clear",function(){
			$('.department').val('none').trigger('change');
			$(".filter-result .desktop tbody").html(listnew_desktop);
			$(".filter-result .mobile tbody").html(listnew_mobile);
		})
		
	},
}
PDR.recruitmentDetail = {
	init: function() {
		var that = this;
		that.recruitmentSubmit();
	},
	recruitmentSubmit: function(){
		$(".form-cv").submit(function (e) {
			e.preventDefault();
			let $this = $(this);
			let dataform = $this.serialize()
			$.ajax({
				type: "POST",
				url: $this.attr('action'),
				data: dataform,
				complete: function(data){
					PDR.Helper.SwalWarning("Thông báo","Gửi CV thành công!",'success',false,false,3000);
					$this.trigger('reset')
				}
			})
		});
	}
}

PDR.Article = {
  init: function() {
		this.tbOfContentsArt();
	},	
	tbOfContentsArt: function(){
		function urlfriendly (slug) {
			//Đổi chữ hoa thành chữ thường
			//Đổi ký tự có dấu thành không dấu
			slug = slug.toLowerCase();
			slug = slug.trim().replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
			slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
			slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
			slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
			slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
			slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
			slug = slug.replace(/đ/gi, 'd');
			//Xóa các ký tự đặt biệt
			slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '_');
			//Đổi khoảng trắng thành ký tự gạch ngang
			slug = slug.replace(/ /gi, "_");
			//Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
			//Phòng trường hợp người nhập vào quá nhiều ký tự trắng
			slug = slug.replace(/\-\-\-\-\-/gi, '_');
			slug = slug.replace(/\-\-\-\-/gi, '_');
			slug = slug.replace(/\-\-\-/gi, '_');
			slug = slug.replace(/\-\-/gi, '_');
			//Xóa các ký tự gạch ngang ở đầu và cuối
			slug = '@' + slug + '@';
			slug = slug.replace(/\@\-|\-\@|\@/gi, '');
			//In slug ra textbox có id “slug”
			return slug;
		};
    
		class TableOfContents {
			constructor({ from, to }) {
				this.fromElement = from;
				this.toElement = to;
				// Get all the ordered headings.
				this.headingElements = this.fromElement.querySelectorAll("h1, h2, h3,h4,h5,h6");
				this.tocElement = document.createElement("div")
			}
      
		 /*  Get the most important heading level.
        For example if the article has only <h2>, <h3> and <h4> tags
        this method will return 2.
     */
      
			getMostImportantHeadingLevel() {
				let mostImportantHeadingLevel = 6; // <h6> heading level
				for (let i = 0; i < this.headingElements.length; i++) {
					let headingLevel = TableOfContents.getHeadingLevel(this.headingElements[i]);
					mostImportantHeadingLevel = (headingLevel < mostImportantHeadingLevel) ?
						headingLevel : mostImportantHeadingLevel;
				}
				return mostImportantHeadingLevel;
			}
      
			static generateId(headingElement) {
				return urlfriendly(headingElement.textContent)
			}
      
			static getHeadingLevel(headingElement) {
				switch (headingElement.tagName.toLowerCase()) {
					case "h1": return 1;
					case "h2": return 2;
					case "h3": return 3;
					case "h4": return 4;
					case "h5": return 5;
					case "h6": return 6;
					default: return 2;
				}
			}

			generateToc() {
				let currentLevel = this.getMostImportantHeadingLevel() - 1,
						currentElement = this.tocElement;
				for (let i = 0; i < this.headingElements.length; i++) {
					let headingElement = this.headingElements[i],
							headingLevel = TableOfContents.getHeadingLevel(headingElement),
							headingLevelDifference = headingLevel - currentLevel,
							linkElement = document.createElement("a");
					if (!headingElement.id) {
						headingElement.id = TableOfContents.generateId(headingElement);
					}
					linkElement.href = `#${headingElement.id}`;
					linkElement.textContent = headingElement.textContent;

					if (headingLevelDifference > 0) {
						// Go down the DOM by adding list elements.
						for (let j = 0; j < headingLevelDifference; j++) {
							let listElement = document.createElement("ul"),													
									listItemElement = document.createElement("li");
							listElement.appendChild(listItemElement);
							currentElement.appendChild(listElement);
							currentElement = listItemElement;
						}
						currentElement.appendChild(linkElement);
					} 
					else {
						// Go up the DOM.
						for (let j = 0; j < -headingLevelDifference; j++) {
							currentElement = currentElement.parentNode.parentNode;
						}
						let listItemElement = document.createElement("li");
						listItemElement.appendChild(linkElement);
						currentElement.parentNode.appendChild(listItemElement);
						currentElement = listItemElement;
					}
					currentLevel = headingLevel;
				}
				if(this.tocElement.firstChild != null){
					this.toElement.appendChild(this.tocElement.firstChild);
				}else{
					document.getElementById("table-content-container").remove();
				}
			}
		}
    
		(function($) {
			var stringtemplate = $('<div id="table-content-container" class="table-of-contents"><div class="table-title"><div class="htitle">Nội dung bài viết<span class="toc_toggle">[<a class="icon-list" href="javascript:void(0)">Ẩn</a>]</span></div></div></div>');
			stringtemplate.insertBefore(".article-body");

			new TableOfContents({
				from: document.querySelector(".article-body"),
				to: document.querySelector("#table-content-container")
			}).generateToc();
      
			$("#table-content-container .icon-list").click(function(){
				$(this).parents("#table-content-container").find("ul:first").slideToggle({ direction: "left" }, 100);
				var texxx = $(this).text();
				if(texxx == "Ẩn"){
					$(this).html("Hiện")
				}else{
					$(this).html("Ẩn")
				}
			})
      
			let buttontable = '<div class="table-content-fixed"><div class="table-of-header"><button class="btn-icolist"><i class="fa fa-list-ol" aria-hidden="true"></i></button> <span class="hTitle"> Nội dung bài viết</span></div><div id="clone-table" class="table-of-contents"></div></div>';
			$("#article").append(buttontable).ready(function(){
				var tablehtml = $("#table-content-container").html()
				$("#clone-table").html(tablehtml);
			});
		})(jQuery);
    
		$(document).ready(() =>{	
			let heighthead = $("#header-main").height();		
      $('#table-content-container,#clone-table').delegate('click','ul li a',function(){
  			//$("#table-content-container ul li a,#clone-table ul li a").click(function(){
				var id = $(this).attr('href');
				$("html,body").animate({ scrollTop: $(id).offset().top + heighthead  }, 600)	
			})

			$(".table-content-fixed .table-of-header").click(function(){
				$(".table-content-fixed").toggleClass('active');
			});
      
			if($('#table-content-container').length > 0){
				var ofsettop_ = $("#table-content-container").offset().top + 50;
				$(window).scroll(function(){
					if($(window).scrollTop() > ofsettop_){
						$(".table-content-fixed").addClass('show');
					}else{
						$(".table-content-fixed").removeClass('show');
					}
				});
			}
		})
	}
}
PDR.Blog = {
  init: function(){
    this.slideBlog();
  },
  slideBlog: function(){
    var swiper = new Swiper(".featured-swiper", {
			loop: true,
			slidesPerView: 1,
			spaceBetween: 1,
			autoplay: {
				delay: 3000,
			},
			navigation: {
				nextEl: ".featured-swiper .swiper-button-next",
				prevEl: ".featured-swiper .swiper-button-prev",
			},
			pagination: {
				el: '.featured-swiper .swiper-pagination',
				type: 'bullets',
				clickable: true
			},
		});
  }
}
PDR.InitMain = function(){
	if(template == 'index' || template == 'index.test'){
		PDR.Index.init();
	}
	if(template == 'product'){
		PDR.Product.init();
	}
	if(template.indexOf('collection') > -1){
		PDR.Collection.init();
	}
	if(template == 'collection.select'){
		PDR.CollectionSelect.init();
	}
	if(template.indexOf('cart') > -1){
		PDR.Cart.init();
	}
	if(template.indexOf('customer') > -1){
		PDR.Customers.init();
	}
	if(template.indexOf('search') > -1){
		PDR.Search.init();
	}
	if(template.indexOf('he-thong-cua-hang') > -1){
		PDR.Store.init();
	}
	if(template == 'page.order-tracking'){
		PDR.Tracking.init();
	}
	if(template.indexOf('page.pandora-tay-ho') > -1){
		PDR.LdpTayHo.init();
	}
	if(template.indexOf('page.recruitment') > -1){
		PDR.Recruitment.init();
	}
	if(template.indexOf('article.recruitment') > -1){
		PDR.recruitmentDetail.init();
	}
  if(template == 'article'){
    PDR.Article.init();
  }
  if(template.indexOf('blog') != -1){
    PDR.Blog.init();
  }
}

$(document).ready(function(){
	PDR.InitMain();
})






