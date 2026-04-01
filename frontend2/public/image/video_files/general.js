PDR = {};
window.proInCartJS = {};
window.cartJS = {};
window.accountJS = {
	"email": null,
	"first_name": null,
	"last_name": null,
	"name": null,
	"phone": null,
	"logged": false,
	"id": ""
};
window.productCollect = [];

var template = window.shop.template;
var isText = window.textMain;
var isAccount = false;

/*Var Country*/
var countries = null;
const addressData = window.Countries;
/*Var App PE*/
var list_item_gift = [];

PDR.Helper = {
	dataMiniCartGiftPE: {},
	moneyFormat: function(number,format) {
		if(number != undefined){
			return number
				.toFixed(0) // always two decimal digits
				.replace(".", ",") // replace decimal point character with ,
				.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "" + format // use , as a separator
		}
	},
	
	formatDate: function(date) { // account pages
		var days = {
			'1': 'Thứ 2',
			'2': 'Thứ 3',
			'3': 'Thứ 4',
			'4': 'Thứ 5',
			'5': 'Thứ 6',
			'6': 'Thứ 7',
			'7': 'Chủ Nhật'
		}
		var day = days[date.getDay()];
		var time = (date.getHours() < 10 ? ('0' + date.getHours()): date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
		var _date = (date.getDate() < 10 ? ('0' + date.getDate()):date.getDate());
		var month = date.getMonth() + 1;
		month = month < 10 ? ('Thg 0' + month): month;
		var year = date.getFullYear();
		return /*day + ', ' +*/ time + ', ' + _date + '/' + month + '/' + year
	},
	delayTime:function (func, wait) {
		return function() {
			var that = this,
					args = [].slice(arguments);
			clearTimeout(func._throttleTimeout);
			func._throttleTimeout = setTimeout(function() {
				func.apply(that, args);
			}, wait);
		};
	},
	uniques: function(arr) {
		var a = [];
		for (var i=0, l=arr.length; i<l; i++)
			if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
				a.push(arr[i]);
		return a;
	},
	change_alias: function(alias){
		var str = alias;
		str = str.toLowerCase();
		str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
		str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
		str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
		str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
		str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
		str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
		str = str.replace(/đ/g,"d");
		str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\•|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
		str = str.replace(/ /g,"_");
		str = str.trim(); 
		return str;
	},  
	
	inputTypeDate: function(){
		$('input[type="date"], input[type="datetime"], input[type="datetime-local"], input[type="month"], input[type="time"], input[type="week"]').each(function() {
			var el = this, type = $(el).attr('type');
			if ($(el).val() == '') $(el).attr('type', 'text');
			$(el).focus(function() {
				$(el).attr('type', type);
				el.click();
			});
			$(el).blur(function() {
				if ($(el).val() == '') $(el).attr('type', 'text');
			});
		});
	},
	passwordVisibility: function(){
		$(".password-mask").on("click", (function() {
			var e = $(this).closest(".account-password-input").find("input");
			"password" === e.attr("type") ? e.attr("type", "text") : e.attr("type", "password"), $(this).closest(".account-password-input").find(".password-mask.hide").removeClass("hide"), $(this).toggleClass("hide");
		}))
	},
	
	checkemail: function(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},
	checkPhone: function(phone){
		var re = /(^0[2-9]\d{8}$)|(^01\d{9}$)/;
		return re.test(phone); 
	},
	filterInput: function(event) {
		var keyCode = ('which' in event) ? event.which : event.keyCode;
		isNotWanted = (keyCode == 69 || keyCode == 190 || keyCode == 189);
		return !isNotWanted;
	},
	smoothScroll: function(a,b){
		$('body,html').animate({
			scrollTop : a
		}, b);
	},
	SwalWarning: function(title,content,icon,cancel,confirm,timeclose){
		Swal.fire({
			title: title,
			text: content,
			icon: icon,
			timer: timeclose != undefined ? timeclose : false,
			showCancelButton: cancel,
			showConfirmButton: confirm,
			confirmButtonText: 'Đồng ý',
			cancelButtonText: 'Không',
		}).then((result) => {
			if (result.isConfirmed) {
				//Swal.fire('Saved!', '', 'success')
			} else if (result.isDenied) {
				//Swal.fire('Changes are not saved', '', 'info')
			}
		})
	},
	plusQuantity: function() {
		if ( jQuery('input[name="quantity"]').val() != undefined ) {
			var currentVal = parseInt(jQuery('input[name="quantity"]').val());
			if (!isNaN(currentVal)) {
				jQuery('input[name="quantity"]').val(currentVal + 1);
			} else {
				jQuery('input[name="quantity"]').val(1);
			}
		}
		else {
			console.log('error: Not see elemnt ' + jQuery('input[name="quantity"]').val());
		}
	},
	minusQuantity: function() {
		if (jQuery('input[name="quantity"]').val() != undefined ) {
			var currentVal = parseInt(jQuery('input[name="quantity"]').val());
			if (!isNaN(currentVal) && currentVal > 1) {
				jQuery('input[name="quantity"]').val(currentVal - 1);
			}
		}else {
			console.log('error: Not see elemnt ' + jQuery('input[name="quantity"]').val());
		}
	},	
	loadingSuggestFake: function(class_append){
		var no_product = '';
		for (var i = 1; i <= 4; i++){
			no_product += '<div class="product-loop-suggest no-product">';
			no_product += '<div class="product-loop-suggest-inner">';
			no_product += '<div class="product-loop-suggest-image"></div>';
			no_product += '<div class="product-loop-suggest-info">';
			no_product += '<span class="shortLoading"></span>';
			no_product += '<span class="longLoading"></span>';
			no_product += '<span class="longLoading"></span>';
			no_product += '<span class="shortLoading"></span>';
			no_product += '</div>';
			no_product += '</div>';
			no_product += '</div>';
		}
		class_append.html(no_product);
	},
	viewedProduct: function(){
		var last_viewed = localStorage.getItem('last_viewed_products');
		if(last_viewed != null){
			last_viewed = PDR.Helper.uniques(last_viewed.split(','));
			localStorage.setItem('last_viewed_products',last_viewed.join(','));

      var only_id = last_viewed.filter(viewed => !isNaN(viewed) );
      var has_handle = last_viewed.filter(viewed => isNaN(viewed) );

      if(has_handle.length > 0){
        localStorage.setItem('last_viewed_products',only_id.join(','));
        last_viewed = only_id;
      }
      
      /*
        var recentview_promises = [];
        last_viewed.map(viewed => {
          if(isNaN(viewed)){
            var promise = new Promise(function(resolve, reject) {
              $.ajax({
                url:'/products/' + viewed + '.js',
                success: function(product){
                  resolve(product);
                },
                error: function(err){
                  resolve('');
                }
              })
            });
  					recentview_promises.push(promise);
          }
        });
  
        Promise.all(recentview_promises).then(function(values) {
  				var viewed_items = [];
          var count_viewed = 0;
          if(values.filter(vl => vl != '').length > 0) $('#list-viewed-products .swiper-wrapper').html('');
  				$.each(values, function(i, v){
  					if(v != ''){
              var html_loop = `<div class="swiper-slide"><div class="product-loop">` + PDR.Global.renderLoop(v,(i + 1)) + `</div></div>`;
  						if(count_viewed < 6){
  							$('#list-viewed-products .list-products').append(html_loop);
  						}
              count_viewed++;
            }
          });
          if(count_viewed <= 4){
            $('#list-viewed-products .swiper-button-next').addClass('d-none');
            $('#list-viewed-products .swiper-button-prev').addClass('d-none');
          }
          PDR.Wishlist.renderFavorites();
          if($(window).width() > 767){
            var swiper = new Swiper("#list-viewed-products .swiper", {
              slidesPerView: 4,
              slidesPerGroup: 4,
              spaceBetween: 12,
              speed: 1000,
              centeredSlides: false,
              navigation: {
                nextEl: "#list-viewed-products .swiper-button-next",
                prevEl: "#list-viewed-products .swiper-button-prev",
              },
            }); 
          }
  
          if(count_viewed == 0){
            $('.section-viewed').addClass('d-none');
          }
        });
      */

      
			var url_get = '/search.js?q=filter=('+encodeURIComponent('(id:product in '+last_viewed.splice(0,10).join(',')+')')+')&include=metafields[product]&page=1&limit=10';
			$.get(url_get).done(function(data){
				if(data.products.length > 0){
					$('#list-viewed-products .swiper-wrapper').html('');
					if(data.products.length <= 4){
						$('#list-viewed-products .swiper-button-next').addClass('d-none');
						$('#list-viewed-products .swiper-button-prev').addClass('d-none');
					}
					data.products.map((item,ind) => {
						var html_loop = `<div class="swiper-slide"><div class="product-loop">` + PDR.Global.renderLoop(item,(ind + 1)) + `</div></div>`;
						if(ind < 6){
							$('#list-viewed-products .list-products').append(html_loop);
						}
					});
					PDR.Wishlist.renderFavorites();
					if($(window).width() > 767){
						var swiper = new Swiper("#list-viewed-products .swiper", {
							slidesPerView: 4,
							slidesPerGroup: 4,
							spaceBetween: 12,
							speed: 1000,
							centeredSlides: false,
							navigation: {
								nextEl: "#list-viewed-products .swiper-button-next",
								prevEl: "#list-viewed-products .swiper-button-prev",
							},
						}); 
					}
				}
				else{
					$('.section-viewed').addClass('d-none');
				}
			});
      
		}
		else {
			$('.section-viewed').addClass('d-none');
		}
	},
	accordion: function(){
		$(".accordion-item:first-of-type .accordion-content").css("display", "block");
		$(".accordion-item:first-of-type .accordion-heading").addClass("opened");
		$(".accordion-heading").click(function () {
			$(".opened").not(this).removeClass("opened").next().slideUp(300);
			$(this).toggleClass("opened").next().slideToggle(300);
		});

    $('.list-accordion-mb ul li').on('click',function(e){
      e.preventDefault();
      $('.list-accordion-mb ul li').removeClass('active');
      $(this).addClass('active');
      var index = $(this).index();
      $('.list-accordion .accordion-item:eq('+index+') .accordion-heading').click();
    });
	},

	//NEW
	getMiniCart: function(){
		var cart = null;
		jQuery.getJSON('/cart.js', function(cart, textStatus) {
			if(cart) {
				cartJS = cart;
				$('.header-main .header-actions-list .action-cart > a > span').html(cart.item_count);
				
				if(cart.items.length > 0){
					var prdIds = cart.items.map(x => {return x.product_id});
					var queryCart = "/search?q=filter=((id:product="+prdIds.join(')||(id:product=')+"))";

          var prdHandles = cart.items.map(x => {return x.handle});
          var queryHandles = [];
          prdHandles.map(handle => {
            var promise = new Promise(function(resolve, reject) {
              $.ajax({
                url:'/products/' + handle + '?view=item-cart',
                success: function(product){
                  resolve(product);
                },
                error: function(err){
                  resolve('');
                }
              })
            });
  					queryHandles.push(promise);
          });

          Promise.all(queryHandles).then(function(values) {
            $.each(values, function(i, v){
    					if(v != ''){
                window.proInCartJS = Object.assign(window.proInCartJS,JSON.parse(v));
              }
            });
            $('.header-main .header-actions-list .action-cart > a').addClass('has-item');
  					$('.header-main .header-actions-list .action-cart').addClass('allow-hover');
  					
  					$('#minicart .ajaxMinicart').html('');
  					$('#minicart .ajaxMinicart').append(PDR.Helper.checkItemMiniCart(cart));
  					$('#minicart #total-minicart').html(PDR.Helper.moneyFormat(cart.total_price/100, '₫'));	
  					$('#minicart .sub-total-label .count').html(cart.item_count);
          });

          /*
					$.ajax({
						type:'GET',
						async: false,
						url: queryCart+'&view=item-cart',
						success: function(search){
							window.proInCartJS = JSON.parse(search);
						}
					});
          */
				}
				else {
					$('#minicart .ajaxMinicart').html('');
				}	
				
				$('#minicart .estimated-total .count').html('('+cart.item_count + ' sản phẩm)');
				$('#minicart #total-minicart').html(PDR.Helper.moneyFormat(cart.total_price/100, '₫'));
				
				if(template == 'product' || template == 'collection'){
					$('#mainLoading').removeClass('active');		
					$('#minicart').addClass('show');
					setTimeout(function(){
						$('#minicart').removeClass('show');
					},5000);
				}
				else {
					setTimeout(function(){
						$('#mainLoading').removeClass('active');		
					},1000);
				}

        if(window.screen.width < 768){
          var now = new Date().getTime();
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
    						htmlPromoDL99 += '<div class=""><span>'+textKM+'</span><a href="/collections/double-day-9-9">Tiếp tục mua sắm</a></div>';
    					}
              else if (amountDL99 >= 2){
                var textKM = 'HOÁ ĐƠN CỦA QUÝ KHÁCH ĐÃ ĐỦ ĐIỀU KIỆN ĐỂ ĐƯỢC TẶNG 1 SẢN PHẨM VÀ GIẢM THÊM 15%. VUI LÒNG CHỌN SẢN PHẨM TẶNG BẰNG HOẶC THẤP GIÁ HƠN';
    						htmlPromoDL99 += '<div class=""><span>'+textKM+'</span><a href="/collections/double-day-9-9">Chọn ngay</a></div>';
              }
    					if(htmlPromoDL99 != ''){
                $('.toast-body').html(htmlPromoDL99);
                var $toast =  $('.toast');
                new bootstrap.Toast($toast[0]).show();
              }
    				}
    			}
    			else if (now >= eventEndDL99) {
    				console.log('expired: Double day 9/9');
    			}
    			else if (now < eventStartDL99) {
    				console.log('notnow: Double day 9/9');
    			}    
        }

        if(camp_1 != null){
          var now = new Date().getTime();
          var eventStartCamp_1 = new Date(camp_1.start).getTime();
    			var eventEndCamp_1 = new Date(camp_1.end).getTime();
    			if (eventStartCamp_1 <= now && eventEndCamp_1 > now) {
    				var amountcamp_1 = 0;
    				var countcamp_1 = cart.items.filter(item => item.properties.hasOwnProperty('CTKM') && item.properties.CTKM.indexOf('I-DAY') > -1);
    				if (countcamp_1.length > 0){
    					//console.log('itemCountDL99:',countDL99);
    					countcamp_1.map(item  => { amountcamp_1 += item.quantity });	
    					//console.log('numItemCountDL99:',amountDL99);
    					var htmlPromocamp_1 = '';
              camp_1.infos.map(info => {
                var qtys = info.qty.split(',');
                if(qtys.includes(amountcamp_1+'')){
                  htmlPromocamp_1 += `<div><span>${info.content}</span><a href="${info.link_act}">${info.text_act}</a></div>`;
                }
              });
    					
    					if(htmlPromocamp_1 != ''){
                $('.toast-body').html(htmlPromocamp_1);
                var $toast =  $('.toast');
                new bootstrap.Toast($toast[0]).show();
              }
    				}
    			}
    			else if (now >= eventEndCamp_1) {
    				console.log('expired: camp_1 15/9');
    			}
    			else if (now < eventStartCamp_1) {
    				console.log('notnow: camp_1 12/9');
    			}    
        }
			}
		});
	},
	renderItemMiniCart: function(resultItem,type,line) {
		var itemOjProperties = {}
		var htmlLine = '';

		htmlLine +=	'<div class="item line-item '+((type == 'giftApp') ? 'line-gift' : '' )+'" data-line="'+(line+1)+'" data-variant-id="'+resultItem.variant_id+'" data-pro-id="'+resultItem.product_id+'">';
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
		
		htmlLine +=					'<div class="item-desc">';
		if(resultItem.variant_options[0] != 'Default Title' && resultItem.variant_options[0] != 'Default tittle') {
			if (resultItem.variant_options.length > 1) {
				if (resultItem.variant_options[0] != undefined) {
					htmlLine +=						'<div class="variant-option"><span class="title-option">Chất liệu:</span><span class="text"> '+resultItem.variant_options[0]+'</span></div>';
				}
				if (resultItem.variant_options[1] != undefined) {
					htmlLine +=						'<div class="variant-option"><span class="title-option">Kích thước:</span><span class="text"> '+resultItem.variant_options[1]+'</span></div>';
				}
			}
			else {
				if (resultItem.variant_options[0] != undefined) {
					htmlLine +=						'<div class="variant-option"><span class="title-option">Kích thước:</span><span class="text"> '+resultItem.variant_options[0]+'</span></div>';
				}
			}
		}
		
		
		if (!(type == 'comboApp' || type == 'bxsyApp' || type == 'giftOmni' || type == 'giftApp')) {
			if (resultItem.price > 0){
				htmlLine +=			'<div class="item-quan">';
				htmlLine +=				'<span class="txt-qty">Số lượng: '+resultItem.quantity+'</span>';
				/* 
				// mini click qly
				htmlLine +=				'<div class="qty quantity-partent qty-click-mini">';
				if(resultItem.quantity > 1){
					htmlLine +=					'<button type="button" class="qtyminus-mini qty-btn">';
					htmlLine += 					'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.3332 8H7.99984H2.6665" stroke="#111111" stroke-width="2" stroke-linecap="round"/></svg>';
					htmlLine +=					'</button>';
				}
				else {
					htmlLine +=					'<button type="button" class="qtyminus-mini qty-btn disabled" disabled>';
					htmlLine += 					'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.3332 8H7.99984H2.6665" stroke="#cfcfcf" stroke-width="2" stroke-linecap="round"/></svg>';
					htmlLine +=					'</button>';
				}
				htmlLine +=					'<input readonly data-vid="'+resultItem.variant_id+'" data-quantity="'+resultItem.quantity+'" data-product="'+resultItem.product_id+'" type="text" size="4" name="updates[]" min="1" id="updates_'+resultItem.variant_id+'" data-price="'+resultItem.price+'" value="'+resultItem.quantity+'" class="tc line-item-qty item-quantity-mini">';
				htmlLine +=					'<button type="button" class="qtyplus-mini qty-btn"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.00033 13.3334V8.00008M8.00033 8.00008V2.66675M8.00033 8.00008H13.3337M8.00033 8.00008H2.66699" stroke="#111111" stroke-width="2" stroke-linecap="round"/></svg></button>';
				htmlLine +=				'</div>';
				*/
				htmlLine +=			'</div>';
			}
			else {
				htmlLine +=				'<div class="item-quan">';
				htmlLine +=					'<span>Số lượng: '+resultItem.quantity+'</span>';
				htmlLine +=				'</div>';
			}
		}
		htmlLine +=					'</div>';
		
		if (!$.isEmptyObject(PDR.Helper.dataMiniCartGiftPE)) {
			$.each(PDR.Helper.dataMiniCartGiftPE, function(keyGiftPE,htmlGiftFE){
				if(resultItem.properties.hasOwnProperty('PE-gift-item-buy ' + keyGiftPE)) {
					htmlLine += htmlGiftFE;
				}
			})
		}
		
		htmlLine +=			'</div>';

		htmlLine +=			'<div class="item-meta">';
		if (type == 'comboApp' ){
			if (resultItem.price > 0){
				if(resultItem.price_original > resultItem.price) {
					htmlLine +=			'<div class="item-price"><span>'+ PDR.Helper.moneyFormat(resultItem.price/100,'₫')+'</span>';
					htmlLine +=			'<del>'+ PDR.Helper.moneyFormat(resultItem.price_original/100,'₫')+'</del></div>';
				}
				else {
					htmlLine +=			'<div class="item-price"><span>'+ PDR.Helper.moneyFormat(resultItem.price/100,'₫')+'</span></div>';
				}
				htmlLine +=			'<div class="item-total-price d-none">';
				htmlLine +=					'<span>'+PDR.Helper.moneyFormat(resultItem.line_price/100,'₫')+'</span>';
				htmlLine +=			'</div>';
			}
			else {
				htmlLine +=			'<div class="item-price"></div>';
				htmlLine +=			'<div class="item-total-price d-none"><span>Quà tặng</span></div>';															
			}
		}
		else if (type == 'giftApp' || type == 'giftOmni') {
			htmlLine +=			'<div class="item-price"></div>';
			htmlLine +=			'<div class="item-total-price d-none"><span>Quà tặng</span></div>';															
		}
		else {
			if (resultItem.price > 0){
				if(resultItem.price_original > resultItem.price) {
					htmlLine +=			'<div class="item-price">';
					htmlLine +=				'<span class="hasSale">'+PDR.Helper.moneyFormat(resultItem.price/100,'₫')+'</span>';
					htmlLine +=				'<del>'+PDR.Helper.moneyFormat(resultItem.price_original/100,'₫')+'</del>';
					htmlLine +=			'</div>';
				}
				else {
					//var checkVr = proInCartJS[resultItem.product_id].variants[resultItem.variant_id];
          var checkVr = proInCartJS[resultItem.product_id].variants.filter(variant => variant.id == resultItem.variant_id);
					if (checkVr.length > 0){ //Old Condition: checkVr != undefined
            checkVr = checkVr[0];
						htmlLine +=			'<div class="item-price">';
						if (checkVr.compare_at_price > resultItem.price) {
							htmlLine +=			'<span class="hasSale">'+PDR.Helper.moneyFormat(resultItem.price/100,'₫')+'</span>';
							htmlLine +=			'<del>'+PDR.Helper.moneyFormat(checkVr.compare_at_price/100,'₫')+'</del>';
						}
						else {
							htmlLine +=			'<span>'+PDR.Helper.moneyFormat(resultItem.price/100,'₫')+'</span>';
						}
						htmlLine +=			'</div>';
					}
				}

				htmlLine +=			'<div class="item-total-price d-none">';
				htmlLine +=					'<span>'+PDR.Helper.moneyFormat(resultItem.line_price/100,'₫')+'</span>';
				htmlLine +=			'</div>';

			}
			else {
				htmlLine +=			'<div class="item-price"></div>';
				htmlLine +=			'<div class="item-total-price d-none"><span>Quà tặng</span></div>';															
			}
		}
		
		if (!(type == 'comboApp' || type == 'bxsyApp' || type == 'giftOmni' || type == 'giftApp')) {
			if (resultItem.price > 0){
				htmlLine +=	'<div class="item-remove">';
				htmlLine += 		'<a href="#" onclick="PDR.Helper.deleteItemMiniCartSingle(' + (line+1) + ')" >';
				htmlLine +=				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M7.795 1.175A.5.5 0 018.175 1h3.65a.5.5 0 01.38.175l.566.66a.1.1 0 01-.076.165h-5.39a.1.1 0 01-.076-.165l.566-.66zM5.724 2a.1.1 0 00.076-.035L7.035.524A1.5 1.5 0 018.175 0h3.65a1.5 1.5 0 011.14.524L14.2 1.965a.1.1 0 00.076.035H19.9a.1.1 0 01.1.1v.8a.1.1 0 01-.1.1h-2.3a.1.1 0 00-.1.1v16.8a.1.1 0 01-.1.1H2.6a.1.1 0 01-.1-.1V3.1a.1.1 0 00-.1-.1H.1a.1.1 0 01-.1-.1v-.8A.1.1 0 01.1 2h5.624zM3.6 19a.1.1 0 01-.1-.1V3.1a.1.1 0 01.1-.1h12.8a.1.1 0 01.1.1v15.8a.1.1 0 01-.1.1H3.6zM6 5.1a.1.1 0 01.1-.1h.8a.1.1 0 01.1.1v11.8a.1.1 0 01-.1.1h-.8a.1.1 0 01-.1-.1V5.1zm4.5 0a.1.1 0 00-.1-.1h-.8a.1.1 0 00-.1.1v11.8a.1.1 0 00.1.1h.8a.1.1 0 00.1-.1V5.1zm3.5 0a.1.1 0 00-.1-.1h-.8a.1.1 0 00-.1.1v11.8a.1.1 0 00.1.1h.8a.1.1 0 00.1-.1V5.1z" fill="#27251F"/></svg>';
				htmlLine +=				'<span>Xoá</span>';
				htmlLine +=			'</a>';
				htmlLine +=	'</div>';	
			}
		}
		htmlLine +=			'</div>';
	
		htmlLine +=		'</div>';
		htmlLine +=	'</div>';

		return htmlLine;
	},
	renderItemGiftPEMiniCart: function(resultItem,line) {
		var itemOjProperties = {}
		var htmlLine = '';
    //console.log('ResultItem:',resultItem);
		htmlLine +=	'<div class="line-gift" data-line="'+(line+1)+'" data-variant-id="'+resultItem.variant_id+'" data-pro-id="'+resultItem.product_id+'">';
		htmlLine +=			'<div class="gift-info">Tặng: ';
		htmlLine +=				' <a href="'+resultItem.url+'">'+resultItem.title+'</a>';
		htmlLine +=				'<span> Trị giá: ';

		//var checkVr = proInCartJS[resultItem.product_id].variants[resultItem.variant_id];
    if(proInCartJS.hasOwnProperty(resultItem.product_id)){
      var checkVr = proInCartJS[resultItem.product_id].variants.filter(variant => variant.id == resultItem.variant_id);
      if (checkVr.length > 0){ //Old Condition: checkVr != undefined
        checkVr = checkVr[0];
  			if (checkVr.compare_at_price > resultItem.price) {
  				htmlLine +=			PDR.Helper.moneyFormat(checkVr.compare_at_price/100,'₫');
  			}
  			else {
  				htmlLine +=			PDR.Helper.moneyFormat(resultItem.price_original/100,'₫')
  			}
  		}
    }
    else{
      
    }

		htmlLine += 			'</span>';
		htmlLine +=			'</div>';
		htmlLine +=	'</div>';
		return htmlLine;
	},
	checkItemMiniCart: function(cart) {
		var itemOjProperties = {}
		var countPromo = 0;
		var typePromo = '';

		var Combos = []; //mã combo
		var titleCombos = []; //tên combo
		var lineCombo = [];

		var Gift = []; //mã gift
		var titleGift = []; //tên program gift
		var lineGift = [];

		var checkItemGiftOmni = false;
		var checkItemGift = false;
		var checkItemCombo = false;

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
				else if(property.indexOf('Khuyến mãi') > -1) {
					checkItemGiftOmni = true;
				}		
			}
		}

		//Khuyến mãi
		if(Gift.length > 0) {
			for(var i = 0; i < Gift.length; i++) {
				var gf = Gift[i];
				var itemInGift = cart.items.filter((x,index) => x.properties.hasOwnProperty('PE-gift-item ' + gf) && x.properties['PE-gift-item ' + gf].indexOf(titleGift[i]) > -1);
				if (itemInGift.length > 0) {
					var htmlGiftApp = '<div class="gifts-list"><h4>Quà tặng khuyến mãi</h4>';
					for(var j = 0; j < itemInGift.length; j++) {
						countPromo = countPromo + itemInGift[j].quantity;
						htmlGiftApp += PDR.Helper.renderItemGiftPEMiniCart(itemInGift[j],lineGift[i][j]);
					}
					htmlGiftApp += '</div>';	
					PDR.Helper.dataMiniCartGiftPE[gf] = htmlGiftApp;
				}
			}
		}
		//Combo
		if(Combos.length > 0) {
			for(var i = 0; i < Combos.length; i++) {
				var cmb = Combos[i];
				var html = 	'<div class="cart-group combo">';
				html += 			'<div class="quantity-combo-mini d-flex align-items-center">';
				html +=  				'<h4>Ưu đãi:' + titleCombos[i] + '</h4>';
				html += 				'<div class="label-quantity-combo-mini"> <span>Số lượng: x '+ cart.attributes['PE-combo-detail '+Combos[i]]+'</span></div>'
				html += 				'<div class="update-quantity-mini d-flex align-items-center">';
				html +=						'<button type="button" class="qtyminus-new-mini qty-btn-new">-</button>';
				html +=	    			'<input type="text" value="'+ cart.attributes['PE-combo-detail '+Combos[i]]+'" class="update-combo-item-mini" data-item="" data-combo="'+Combos[i].replace('~','')+'" data-max="" data-quantity="'+ cart.attributes['PE-combo-detail '+Combos[i]]+'" />';
				html +=						'<button type="button" class="qtyplus-new-mini qty-btn-new">+</button>';
				html +=   			'</div>';
				html += 			'<div class="remove-combo-mini" data-combo="'+Combos[i]+'">Xóa</div>';
				html +=  		'</div>';
				
				var itemInCombo = cart.items.filter((x,index) => x.properties.hasOwnProperty('PE-combo-item') && x.properties['PE-combo-item'].indexOf(cmb) > -1);
				if (itemInCombo.length > 0) {
					for(var j = 0; j < itemInCombo.length; j++) {
						countPromo = countPromo + itemInCombo[j].quantity;
						html += PDR.Helper.renderItemMiniCart(itemInCombo[j],'comboApp',lineCombo[i][j]);
					}
				}
				html += '</div>';

				$('#minicart .ajaxMinicart').append(html);
			}
		}
		
		var promoGroup  = lineCombo.join(',').split(',');
		var promoGift   = lineGift.join(',').split(',');
		var promoSingle = lineGift.join(',').split(',');

		if(cart.item_count > countPromo) {
			var htmlHead = '';
			var parent = null;
			if (countPromo >= 0) {
				htmlHead += '<div class="cart-group single"></div>';
				$('#minicart .ajaxMinicart').append(htmlHead);
			} 
			else {
				parent = $('#minicart .ajaxMinicart');
			}
			for(var i = 0; i < cart.items.length; i++) {
				if (!promoGroup.includes(i+"") && !promoGift.includes(i+"") ) {
					var item = cart.items[i];
					var htmlNormal =	PDR.Helper.renderItemMiniCart(item,'',i,);
					$('#minicart .ajaxMinicart .cart-group.single').append(htmlNormal);
				}
			}
		}
	},
	UpdateChangeQtyMiniCart: function(comboCode,newQty,beforeQty,line) {
		var arrayUpdate = [];
		var comboItem = false;
		var listCart = document.querySelectorAll('[id^="updates_"]');
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
		arrayUpdate = 'updates[]='+arrayUpdate.join('&updates[]=');
		var params = {
			type: 'POST',
			url: '/cart/update.js',
			data: arrayUpdate,
			dataType: 'json',
			success: function(data) { 
				window.cartJS = data;
				PDR.Helper.getMiniCart();
				$('.box-viewcart').removeClass('js-loading');
			},
			error: function(XMLHttpRequest, textStatus) {
				Haravan.onError(XMLHttpRequest, textStatus);
			}
		};
		jQuery.ajax(params);
	},
	changeQtyItemMiniCart: function() {
		//SP lẻ
		$(document).on('click','.qty-click-mini .qtyplus-mini',function(e){
			e.preventDefault();
			var input = $(this).parent('.quantity-partent').find('input');
			var currentVal = parseInt(input.val());
			if (!isNaN(currentVal)) {
				input.val(currentVal + 1);
			} else {
				input.val(1);
			}
		});
		$(document).on('click',".qty-click-mini .qtyminus-mini",function(e) {
			e.preventDefault();
			var input = $(this).parent('.quantity-partent').find('input');
			var currentVal = parseInt(input.val());
			if (!isNaN(currentVal) && currentVal > 1) {
				input.val(currentVal - 1);
			} else {
				input.val(1);
			}
		});
		$(document).on('click','.qty-click-mini button[class*="qty"]',PDR.Helper.delayTime(function(e){
			var beforeQty = parseInt($(this).parents('.item-quan').find('.txt-qty').html()),
					qtyChange = parseInt($(this).siblings('input').val());
			var line = parseInt($(this).parents('.line-item').attr('data-line')) - 1;
			$('.box-viewcart').addClass('js-loading');
			PDR.Helper.UpdateChangeQtyMiniCart(null,qtyChange,beforeQty,line);
		},500));
		//SP Combo
		$(document).on('click','.qtyplus-new-mini',function(e){
			e.preventDefault();
			$('.box-viewcart').addClass('js-loading');
			var input = $(this).parent('.update-quantity-mini').find('input');
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
		$(document).on('click','.qtyminus-new-mini',function(e) {
			e.preventDefault();
			$('.box-viewcart').addClass('js-loading');
			var input = $(this).parent('.update-quantity-mini').find('input');
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
		$(document).on('change','.update-combo-item-mini',function(e) {
			e.preventDefault();
			var current_quantity = parseInt($(this).val());
			var data_combo = $(this).attr('data-combo');
			var id = window.apps.productKeyCombo;
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
					PDR.Helper.getMiniCart();
					$('.box-viewcart').removeClass('js-loading');
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
	},
	deleteItemMiniCartSingle: function(line){
		var title = $('.line-item[data-line="'+line+'"]').find('.item-info h3 a').text();		
		$('#removeProductModal .product-to-remove').html(title); 
		$('#removeProductModal').modal('show');		

		var params = {
			type: 'POST',
			url: '/cart/change.js',
			data: 'quantity=0&line=' + line,
			dataType: 'json',
			success: function(cart) {				
				$('.header-main .header-actions-list .action-cart > a > span').html(cart.item_count);
				$('.header-main .header-actions-list .action-cart a').removeClass('has-item');
				$('.header-main .header-actions-list .action-cart').removeClass('allow-hover');
				$('#minicart .ajaxMinicart').html('');
				$('#minicart #total-minicart').html('');
				$('#minicart .sub-total-label .count').html('0');

				PDR.Helper.getMiniCart();	
				
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
	deleteItemMiniCartCombo: function(){
		$(document).on('click','.remove-combo-mini',function(e) {
			e.preventDefault();
			$('.box-viewcart').addClass('js-loading');
			var current_quantity = 0;
			var data_combo = $(this).attr('data-combo');
			var id = window.apps.productKeyCombo;
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
					PDR.Helper.getMiniCart();
					$('.box-viewcart').removeClass('js-loading');
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
	
	checkLimitSku: function(sku, qty){
		let max = 2 // limit sp đc add
		if(window.settings.limitBuySku.use){
			if(window.settings.limitBuySku.arrySku.includes(sku)){
				const lineInCart = cartJS.items.find(obj => obj.sku === sku);
				if(lineInCart){
					let expectQty =qty + lineInCart.quantity;
					if(expectQty > max) return false;
				}
			}
		}
		return true;
	},
}
PDR.GA4 = {
	GTMAddToCart: function(data, callback){
		var variantId = data.variant_id;
		var variantTitle = '';
		var tagCategory = '';
		if(data.properties.hasOwnProperty('cates')){
			tagCategory = data.properties.cates;
		}
		var discount = 0;
		if(data.price_original > data.price){
			discount = (data.price_original - data.price)/100;
		}
		var obj = {
			affiliation: "Google Merchandise Store",
			index: 0,
			item_id: '' + data.product_id,
			item_variant: data.variant_title,
			item_name: data.title,
			item_brand: data.vendor,
			item_option1: data.variant_options[0],
			item_option2: data.variant_options.length >= 2 ? data.variant_options[1] : '', 
			item_option3: data.variant_options.length > 2 ? data.variant_options[2] : '', 
			discount: discount,

			price: data.price/100,
			quantity: 1
		}
		if(tagCategory != ''){
			tagCategory = tagCategory.split(',');
			obj['item_category'] = tagCategory[0];
			obj['item_category2'] = tagCategory[1];
			obj['item_category3'] = tagCategory[2];
			obj['item_category4'] = tagCategory[3];
		}
		if(gtag){
			gtag("event", "add_to_cart", {
				currency: "VND",
				value: data.price/100,
				items: [obj]
			});
		}
		if (typeof callback === "function"){
			return callback();
		}
	},
}
PDR.Quickview = {
	quickview_data: [],
	qv_data_main: {},
	qv_data_meta: '',
	current_variant: null,
	init: function(){
		var that = this;
		that.actionQuickview();
	},
	actionQuickview: function(){
		$(document).on('click', '.product-loop-wrap .quick-view', function(e){
			e.preventDefault();
			PDR.Quickview.quickview_data = [];
			PDR.Quickview.qv_data_main = {};
			PDR.Quickview.qv_data_meta = '';
			PDR.Quickview.current_variant = null;
			
			var handle = $(this).attr('data-handle');
			var id = $(this).attr('data-id');
			var vid = $(this).attr('data-variantid');
			var title = $(this).parents('.product-loop-wrap').find('.product-loop-title a').html();
			var url = $(this).parents('.product-loop-wrap').find('.product-loop-title a').attr('href');
			var html = '';
			var urlnew = '/search.js?q=filter=(id:product='+id+')&include=metafields[product]';
			var tagCTKM = $(this).parents('.product-loop-wrap').find('.product-loop-labels').attr('data-ctkm');
      var tagCTKM2 = $(this).parents('.product-loop-wrap').find('.product-loop-labels').attr('data-ctkm-2');
      
			$.ajax({
				type: 'GET',
				url: handle+(handle.indexOf('?') > -1?'&':'?')+"view=quickview",
				async: false,
				success: function(data){
					html = data;
					$.get(urlnew).done(function(datanew){
						$('#quickviewProductModal .modal-header h4 a').attr('href',url);
						
						$('#quickviewProductModal').modal();
						$('body').addClass('quickview-open');
						$('#quickviewProductModal .modal-body').html(html);
						$('#quickviewProductModal #qv-btn-addtocart').attr('data-ctkm',tagCTKM);
						if(tagCTKM2 != '') $('#quickviewProductModal #qv-btn-addtocart').attr('data-ctkm-2',tagCTKM2);
              
						console.log(datanew);
						
						$('#quickview-select').val('');
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
			$('#mainLoading').addClass('active');
			$('#btn-addtocart').addClass('loading');
			
			var quantity = parseInt($('#qv-input-quantity').val());
			var id  = PDR.Quickview.current_variant.id;
			let sku = PDR.Quickview.current_variant.sku;
			var tagCTKM = $(this).attr('data-ctkm');
      var tagCTKM2 = $(this).attr('data-ctkm-2');

			var exist = cartJS.items.filter(item => item.variant_id == id);
			if(exist.length > 0){
				var properties = exist[0].properties;
				if(!properties.hasOwnProperty('cates')) properties.cates = qvcates;
				if(!properties.hasOwnProperty('CTKM')) properties.CTKM = tagCTKM;
        if(!properties.hasOwnProperty('CTKM2') && tagCTKM2 != '') properties.CTKM2 = tagCTKM2;
			}
			else{
				var properties = { cates: qvcates, CTKM: tagCTKM };
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

						$('#quickviewProductModal').modal('hide');
						$('body').removeClass('quickview-open');
						$("body").removeClass("modal-open");

						$('#mainLoading').removeClass('active');
						$('#qv-btn-addtocart').removeClass('loading');

						PDR.Helper.getMiniCart();							
					},);
				},
				error: function(XMLHttpRequest, textStatus) {
					if ( XMLHttpRequest.status == 422 ){
						PDR.Helper.SwalWarning("Thông báo","Có trục trặc về tồn kho!",'error',false,false,2000);
						$('#mainLoading').removeClass('active');
						$('#qv-btn-addtocart').removeClass('loading');
					}
				}
			}
			$.ajax(param);
			
		});
	},
	renderProductDetail: {
		init: function(){
			var that = this;
			if(PDR.Quickview.qv_data_meta != ''){
				that.renderColor();
			}
			else {
				$('.qv-infos--options .swatch.swatch-metal').addClass('d-none');
			}
			
			var customeOption = PDR.Quickview.qv_data_main.options.map(option => {return option.name});
			
			if(customeOption.join(',').indexOf('Kích ') > -1){
				var vitri_size = -1; 
				customeOption.map((option,index) => {if (option.indexOf('Kích ') > -1) vitri_size = index });
				that.renderSize(vitri_size);
			}
			else{
				$('.qv-infos--options .swatch.swatch-size').addClass('d-none');
			}
			
			if (PDR.Quickview.current_variant == null){
				PDR.Quickview.current_variant = PDR.Quickview.qv_data_main.variants[0];
			}
			console.log(PDR.Quickview.qv_data_main.variants[0]);

			that.renderInfo(PDR.Quickview.current_variant);
			that.changeSize();
			that.renderImage();
			PDR.Helper.accordion();

			if(accountJS.id != ''){
				PDR.Wishlist.getWishlistProduct(PDR.Quickview.qv_data_main.id,function(data_wishlist){
					console.log(data_wishlist);
				});
			}
		
		},
		renderColor: function(){
			PDR.Quickview.qv_data_meta = JSON.parse(PDR.Quickview.qv_data_meta);
			var items = '';
			var colorCurrent = '';
			var first_color = true;
			
			$.each(PDR.Quickview.qv_data_meta,function(color,icons){
				if(icons.icon != null){
					var pid = PDR.Quickview.quickview_data.filter(prd => prd.handle == icons.handle);
					pid = pid.length > 0? pid[0].id : '';
					if(pid != '') colorCurrent = color;

					items += `<a class="swatch-element ${pid != ''?'sd':''}" data-url="/products/${icons.handle}" href="/products/${icons.handle}" data-pid="${pid}" data-option1="${color}">
									<label><img src="${icons.icon != null ? icons.icon : '//theme.hstatic.net/1000409940/1000612443/14/blog_no_img.jpg'}" alt="${color}" /></label>	
									<span>${color}</span>
								</a>`;
				}
			});
			if (items == ''){
				PDR.Quickview.current_variant = PDR.Quickview.qv_data_main.variants[0];
				$('.swatch.swatch-metal').addClass('d-none');
			}
			else {
				$('.select-swap--metal').html(items);
				$('.swatch-metal').find(".swatch-header.metal .title span:last-child").html(colorCurrent);
			}
			
			$(".select-swap--metal .swatch-element" ).hover(
				function(){ 
					var value = $(this).find('span').html();
					$(this).parents(".swatch-metal").find(".swatch-header .title span:last-child").html( value );
				},
				function(){
					var value = $(".select-swap--metal .swatch-element.sd span").html();
					$(this).parents(".swatch-metal").find(".swatch-header  .title span:last-child").html( value );
				},
			);
			
		},
		renderSize: function(vitri_size){
			var items = ''; var select = '<option>Chọn Size</option>';
			var first_available = false;
			var sizeCurrent = '', availables = [];
			var option_size = 'option1';
			if(vitri_size == 1) option_size = 'option2';
			if(vitri_size == 2) option_size = 'option3';

			var count_unavailable = 0;
			
			PDR.Quickview.qv_data_main.variants.map(size => {
				var checkBarcodeHide = false;
				if(PDR.Quickview.qv_data_main.tags.includes('hide:'+size.barcode) || PDR.Quickview.qv_data_main.tags.includes('hide: '+size.barcode)){
					checkBarcodeHide = true;
					size.is_hide = true;
				}	

				if(PDR.Quickview.qv_data_main.variants.length == 1){
					sizeCurrent = size[option_size];
				}

				if(size.available && first_available == false){
					first_available = true; 
					sizeCurrent = size[option_size];
					PDR.Quickview.current_variant = size;
				}

				if(!size.available) count_unavailable++;
				//Render swatch size
				if(checkBarcodeHide){
					items += `<div class="swatch-element ${checkBarcodeHide?'hidebarcode':''} ${size.available?'':'soldout'}" data-option2="${size[option_size]}"><label><span>${(size[option_size] != 'Default tittle') ? size[option_size] : 'Onesize'}</span></label></div>`;
				}
				else {
					items += `<div class="swatch-element ${checkBarcodeHide?'hidebarcode':''} ${sizeCurrent != '' && sizeCurrent == size[option_size]?'sd':''} ${size.available?'':'soldout'}" data-option2="${size[option_size]}"><label><span>${(size[option_size] != 'Default tittle') ? size[option_size] : 'Onesize'}</span></label></div>`;
				}
				//Render select size
				select += `<option class="option-size" value="${size[option_size]}" >${size[option_size]}</option>`;
			});

			if(!PDR.Quickview.qv_data_main.available || count_unavailable == PDR.Quickview.qv_data_main.variants.length) PDR.Quickview.current_variant = PDR.Quickview.qv_data_main.variants[0];

			$('.select-swap--size').html(items);

			if(sizeCurrent != ''){
				$('.swatch-size').find(".header.size .header-title span:last-child").html(sizeCurrent);
			}
		},
		renderInfo: function(variant){
			
			//PDR.Rating.ratingQuickview(PDR.Quickview.qv_data_main);

			$('h1').html(PDR.Quickview.qv_data_main.title);
			if (PDR.Quickview.qv_data_main.metadescription != null){
				$('.accordion-item:first-child .accordion-content .content-box').html(PDR.Quickview.qv_data_main.metadescription);
			}
			else {
				$('.accordion-item:first-child .accordion-content .content-box').html('Nội dung đang cập nhật!');
			}

			var tagbadges = PDR.Quickview.qv_data_main.tags.filter(tag => tag.indexOf('badge:') > -1);
			if(tagbadges.length > 0){
				$('.qv-labels .badge').html(tagbadges[0].split(':')[1]);
				$('.qv-labels').removeClass('d-none');
			}

			if (variant.sku != null) {
				$('.qv-sku span').html(variant.sku);
			}
			else {
				$('.qv-sku span').html('Đang cập nhật');
			}

			$('#quickview-select').val(variant.id);
			if(variant.price < variant.compare_at_price){
				var pro_sold = variant.price;
				var pro_comp = variant.compare_at_price / 100;
				var sale = 100 - (pro_sold / pro_comp);
				var kq_sale = Math.round(sale);
				$('.qv-price del').html(Haravan.formatMoney(variant.compare_at_price, window.shop.moneyFormat)).removeClass('d-none');
				$('.qv-price del').removeClass('d-none');
				$('.qv-price span').html(Haravan.formatMoney(variant.price,window.shop.moneyFormat));
				$('.qv-price span').addClass('reduced').attr('content',variant.price / 100);
				$('.qv-price span.badge').html('(-'+kq_sale+'%)').removeClass('d-none');
			} 
			else {
				$('.qv-price span').html(Haravan.formatMoney(variant.price, window.shop.moneyFormat));
				$('.qv-price span').removeClass('reduced').attr('content',variant.price / 100);
				$('.qv-price del').addClass('d-none');
				$('.qv-price span.badge').addClass('d-none');
			}

			if(variant.price > 0){
				$('.quickviewdetail-footer #qv-btn-addtocart').removeClass('d-none');
				if(PDR.Quickview.qv_data_main.available && variant.price > 0){
					if((variant.available && !variant.hasOwnProperty('is_hide')) || (variant.hasOwnProperty('is_hide') && !variant.is_hide)){
						$('.quickviewdetail-info').removeClass('isSoldout');
						$('.quickviewdetail-footer').removeClass('d-none');
						$('.quickviewdetail-footer #qv-btn-addtocart').removeClass('disabled').prop('disabled', false); 
						$(".quickviewdetail-footer #qv-btn-addtocart span").html('Thêm vào giỏ');
					}
				}
				else{
					$('.quickviewdetail-info').addClass('isSoldout');
					$('.quickviewdetail-footer').removeClass('d-none');
					$('.quickviewdetail-footer #qv-btn-addtocart').addClass('disabled').prop('disabled', true);
					$(".quickviewdetail-footer #qv-btn-addtocart").find('span').html('Hết hàng');
				}
			}
			else{
				$('.quickviewdetail-footer #qv-btn-addtocart').addClass('d-none');
			}		
		},
		changeSize: function(){
			var self = this;
			$(document).on('click', '.select-swap--size .swatch-element', function(){
				var $this = $(this);
				$('.select-swap--size .swatch-element').removeClass('sd');
				$this.addClass('sd');
				var pid = $('.select-swap--metal .swatch-element.sd').attr('data-pid'); 
				var data = PDR.Quickview.quickview_data.filter(x => x.id == pid);
				var color = $('.select-swap--metal .swatch-element.sd').attr('data-option1');
				var size = $('.select-swap--size .swatch-element.sd').attr('data-option2');
				if(data.length > 0){
					var variant = data[0].variants.filter(vari => vari.option1 == color && vari.option2 == size);
					if(variant.length > 0){
						self.renderInfo(variant[0]);
						PDR.Quickview.current_variant = variant[0];
					}
				}
				else {
					var variant = PDR.Quickview.qv_data_main.variants.filter(vari => vari.title.indexOf(size) > -1);
					if(variant.length > 0){
						self.renderInfo(variant[0]);
						PDR.Quickview.current_variant = variant[0];
					}
				}
				$this.parents('.swatch-size').find(".header.size .header-title span:last-child").html(size);
			});
		},
		renderImage: function(){
			var html_img = '';
			PDR.Quickview.qv_data_main.images.map((img,ind_img) => {
				if(img.indexOf('_icon') == -1 && img.indexOf('/icon') == -1  && img.indexOf('-icon') == -1){
					var src_img = Haravan.resizeImage(img,'master');
					html_img += `
					<div class="qv-gallery--item swiper-slide ${ind_img == 0?'main-picture':'secondary-picture'}" data-image="${src_img}">
						<div class="qv-gallery--box">
							<a data-fancybox="gallery" class="aspect-ratio" href="${src_img}">
								<img src="${src_img}" alt="${PDR.Quickview.qv_data_main.title}">
							</a>
						</div>
					</div>
				`;
				}
			});
			$('#qv-gallery .swiper-wrapper').html(html_img);
		}
	}
}
PDR.Global = {
	init: function(){
		var that = this;
		that.cartAjax();
		that.headerJS.init();
		that.footerJS();
		that.socialContact();
		that.popupContact();
		that.clickChangeImg();
		that.actionAccount();
		that.copyCodeProdCoupon();
		that.sliderTopbar();
		that.fixedMainHeader();
		that.closeToast();
    
		PDR.Quickview.init();
	},
  closeToast: function(){
    $('.toast .close').on('click',function(){
      $('.toast').hide();
    });
  },
	cartAjax: function(callback){
		var self = this;
		$.ajax({
			type:'GET',
			url: '/cart.js',
			dataType: 'json',
			async: false,
			success: function(data){
				window.cartJS = data;
				$('.header-main .header-actions-list .action-cart > a > span').html(data.item_count);
				
				if(data.customer_id != null){
					window.accountJS.id = data.customer_id;
				}
				else {
					window.accountJS.id = window.account.id;
				}
				
				if(window.cartJS.items.length > 0){
					$('.header-main .header-actions-list .action-cart > a').addClass('has-item');
					$('.header-main .header-actions-list .action-cart').addClass('allow-hover');

					var query = '/search.js?q=filter=('+ encodeURIComponent('(id:product in ' + cartJS.items.map(item => { return item.product_id}).join(',') + ')');
          $.ajax({
            type:'GET',
            async: false,
            url: query,
            success: function(search){
              if(search.total > 0){
                search.products.map(prd => {
                  window.proInCartJS[prd.id] = prd;
                });
                window.cartJS.items.filter(x => {
                  x.inAdmin = window.proInCartJS[x.product_id];
                });
              }
              
              if(!isAccount){
                isAccount = true;
                self.accountJS();
              }
              if(typeof callback === 'function') return callback(window.cartJS);
  
              $('#minicart .ajaxMinicart').append(PDR.Helper.checkItemMiniCart(window.cartJS));
              $('#minicart #total-minicart').html(PDR.Helper.moneyFormat(data.total_price/100, '₫'));
              $('#minicart .sub-total-label .count').html(data.item_count);
  
              if(template.indexOf('cart') > -1){
                PDR.Cart.cartRender.init();
              }
            },
            error: function(x,y){
              if(!isAccount){
                isAccount = true;
                self.accountJS();
              }

              if(template.indexOf('cart') > -1){
                PDR.Cart.cartRender.init();
              }
            }
          });
          /*
          var prdHandles = data.items.map(x => {return x.handle});
          var queryHandles = [];
          prdHandles.map(handle => {
            var promise = new Promise(function(resolve, reject) {
              $.ajax({
                url:'/products/' + handle + '?view=item-cart',
                success: function(product){
                  resolve(product);
                },
                error: function(err){
                  resolve('');
                }
              })
            });
  					queryHandles.push(promise);
          });

          Promise.all(queryHandles).then(function(values) {
            $.each(values, function(i, v){
    					if(v != ''){
                window.proInCartJS = Object.assign(window.proInCartJS,JSON.parse(v));
                window.cartJS.items.map((x,_id) => {
                  if(window.proInCartJS.hasOwnProperty(x.product_id)) window.cartJS.items[_id].inAdmin = window.proInCartJS[x.product_id];
                });
              }
            });
            
            if(!isAccount){
              isAccount = true;
              self.accountJS();
            }
            if(typeof callback === 'function') return callback(window.cartJS);

            $('#minicart .ajaxMinicart').append(PDR.Helper.checkItemMiniCart(window.cartJS));
            $('#minicart #total-minicart').html(PDR.Helper.moneyFormat(data.total_price/100, '₫'));
            $('#minicart .sub-total-label .count').html(data.item_count);

            if(template.indexOf('cart') > -1){
              PDR.Cart.cartRender.init();
            }
          });
          */
				}
				else {
					$('.header-main .header-actions-list .action-cart > a').removeClass('has-item');
					if(!isAccount){
						isAccount = true;
						self.accountJS();
					}
          if(template.indexOf('cart') > -1){
            PDR.Cart.cartRender.init();
          }
				}
			}
		});
	},
	accountJS: function(){
		var self = this;
		$.ajax({
			type:'GET',
			async: false,
			url: '/account.js',
			dataType: 'json',
			success: function(account){
				var id = accountJS.id;
				var user_info = localStorage.getItem('user_info');
				if(account.email != '' && account.email != undefined){
					accountJS = account;
					accountJS['id'] = id;
					accountJS['logged'] = true;
          PDR.Wishlist.init();
          if(localStorage.getItem('accountTag') != null) accountJS['tags'] = localStorage.getItem('accountTag');
				}
        else if(localStorage.getItem('accountTag') != null) localStorage.removeItem('accountTag');
        
				if(account.first_name != null && account.first_name != '') {
					accountJS['id'] = id;
					accountJS['logged'] = true;
          if(localStorage.getItem('accountTag') != null) accountJS['tags'] = localStorage.getItem('accountTag');
				}
        else if(localStorage.getItem('accountTag') != null) localStorage.removeItem('accountTag');
        
				PDR.Rating.appRating.customerId = accountJS.id;
				PDR.Rating.appRating.customerEmail = accountJS.email;
				PDR.Rating.appRating.customerName = accountJS.name;
        if(template.indexOf('cart') > -1){
          PDR.Cart.autoApplyCouponMain();
        }
			}
		});
	},
	headerJS: {
		init: function(){
			var that = this;
			that.topbar();
			that.checkMegasub();
			that.menuIconAction();
			that.menuMobile();
			that.searchAuto();
			that.miniCart();
		},
		checkMegasub: function(){
			if ($(window).width() > 1024) {
				$('.header-menu-list-item').each(function() {
					if ($(this).find('.header-menu-mega-sub').length === 0) {
						$(this).addClass('not-mega-sub');
					}
				});
			}	
		},
		menuIconAction: function(){
			if($(window).width() < 1024){
				$('body').on('click', '#js-click-menu', function(e){
					e.preventDefault();
					if($(this).hasClass('active')){
						$('.header-bottom').removeClass('open');
					}else{
						$('.header-bottom').addClass('open');
					}
					$(this).toggleClass('active');
					$('body').addClass('lock-scroll');
				});
				$('body').on('click', '.close-button button', function(e){
					e.preventDefault();
					$('.header-bottom').removeClass('open');
					$('.header-menu').removeClass('open open-sub');
					$('.header-menu-mega').hide();
					$('.header-menu-mega-item > a').removeClass('active');
					$('.header-menu-mega-sub').removeClass('open');
					$('.header-menu-mega-sub .back-menu > a').removeClass('active');
					$('.back-button').addClass('d-none');
					$('.header-icon-menu > a ').removeClass('active');
					$('body').removeClass('lock-scroll');
				});
				
				$('body').on('click','#js-click-search', function(e){
					e.preventDefault();
					if($(this).hasClass('active')){
						$('.header-search').removeClass('open');
					}
					else{
						$('.header-search').addClass('open');
					}
					$(this).toggleClass('active');
					$('body').addClass('lock-scroll');
				})
			}
		},
		menuMobile: function(){
			if($(window).width() < 1024){
				$('body').on('click', '.header-menu-list-item.has-child > a', function(e){
					e.preventDefault();
					$(this).toggleClass('active');
					$(this).siblings('.header-menu-mega').slideToggle(200);
				});
        $('body').on('click', '.header-menu-list-item.has-child > .wrap-group-menu svg', function(e){
					e.preventDefault();
					$(this).parents('.wrap-group-menu').find('a').toggleClass('active');
					$(this).parents('.wrap-group-menu').siblings('.header-menu-mega').slideToggle(200);
				});
				$('body').on('click', '.header-menu-mega-item > a', function(e){
					e.preventDefault();
					if($(this).next().length > 0){
						$('.back-button').removeClass('d-none');
						$('.header-menu').addClass('open-sub');
						$(this).siblings('.header-menu-mega-sub').addClass('open');
						$(this).siblings('.header-menu-mega-sub').find('.back-menu > a').addClass('active');
					}else{
						location.href=$(this).attr("href");
					}
				});
        $('body').on('click', '.header-menu-mega-item > .wrap-group-menu svg', function(e){
					e.preventDefault();
					$('.back-button').removeClass('d-none');
          $('.header-menu').addClass('open-sub');
          $(this).parents('.wrap-group-menu').siblings('.header-menu-mega-sub').addClass('open');
          $(this).parents('.wrap-group-menu').siblings('.header-menu-mega-sub').find('.back-menu > a').addClass('active');
				});
				$('body').on('click', '.header-menu-btn .back-button button', function(e){
					$( ".back-menu > a.active" ).trigger( "click" );
				});	
				$('body').on('click', '.back-menu > a.active', function(e){
					e.preventDefault();
					$('.back-button').addClass('d-none');
					$('.header-menu').removeClass('open-sub');
					$(this).parents('.header-menu-mega-sub').removeClass('open');
				});					
			}
		},
		searchAuto: function(){
			$('body').click(function(evt) {		
				var target = evt.target;
				if (target.id !== 'searchform-wrapper' && target.id !== 'inputSearchAuto') {
					$("#searchform-wrapper").hide();		
				}
			});
			$('#inputSearchAuto').on('input', function(e) {
				if(e.target.value != '') {
					$('#searchform .btn-reset').removeClass('d-none');
				}
				else {
					$('#searchform .btn-reset').addClass('d-none');
				}
			});	
			$('#searchform .btn-reset').on('click', function(){
				$(this).addClass('d-none');
				$('#inputSearchAuto').val('').blur().focus();
				$("#ajaxSearchPrResults").hide();	
				$("#ajaxSearchArticleResults").hide();	
				$('.resultsContent').html('');
				if($(window).width() < 1024){
					$('body').removeClass('lock-scroll');
					$('.header-search').removeClass('open');
				}
			});
			$('#searchform').submit(function(e) {
				e.preventDefault();
				var q = $(this).find('input[name=q]').val();
				if(q.indexOf('script') > -1 || q.indexOf('>') > -1){
					alert('Từ khóa của bạn có chứa mã độc hại ! Vui lòng nhập lại từ khóa khác');
					$(this).find('input[name=q]').val('');
				}
				else{
					if( !q ) {
						window.location = '/search?q=*';
						return;
					}	else {
						window.location = '/search?q=' + q;
						return;
					}
				}
			});
			
			var $input = $('#searchform input[type="text"]');
			$input.bind('keyup change paste propertychange', PDR.Helper.delayTime(function(){
				var key = $(this).val(),
						$parent = $(this).parents('.header-search'),
						$results = $(this).parents('.header-search').find('#searchform-wrapper');
				if(key.indexOf('script') > -1 || key.indexOf('>') > -1){
					alert('Từ khóa của bạn có chứa mã độc hại! Vui lòng nhập lại từ khóa khác');
					$(this).val('');
					$('#searchform input[type="text"]').val('');
				}
				else{
					if(key.length > 0 ){
						$(this).attr('data-history', key);
						$('#searchform input[type="text"]').val($(this).val());
						
						var q_follow = 'product', q_str = '';
						q_str = '/search?q=filter='+encodeURIComponent('((title:product**' + key + ')||(tag:product**'+key+')||(sku:product**'+key+')||(barcode:product**'+key+'))&&(price:product>100)&&(id:product<>1052931853))')+'&view=ultimate-product';
						$.ajax({
							url: q_str,
							type: 'GET',
							async: true,
							success: function(datapr){
								$results.find('#ajaxSearchPrResults').html(datapr).addClass('resultsdata');		
								$results.find('.results-pr-wrapper').removeClass('d-none');
								var linkmore = '';
								if ($results.find('.dataMore').length > 0) {
									$results.find('.dataMore a').attr('href','/search?q='+key);
								}
							}
						});
						
						var a_follow = 'article', a_str = '';
						a_str = '/search?q=filter='+encodeURIComponent('(title:article ** ' + key + ')')+'&view=ultimate-article';
						$.ajax({
							url: a_str,
							type: 'GET',
							async: true,
							success: function(dataar){
								if (dataar.trim() != ''){
									$results.find('#ajaxSearchArticleResults').html(dataar).addClass('resultsdata');			
									$results.find('.results-article-wrapper').removeClass('d-none');
								}
								else {
									$results.find('#ajaxSearchArticleResults').html('').removeClass('resultsdata');	
									$results.find('.results-article-wrapper').addClass('d-none');
								}
							}
						});
						
						
						$("#searchform").addClass("expanded");
						$results.fadeIn();	
					}
					else{
						$('#searchform input[type="text"]').val($(this).val());
						$("#searchform").removeClass("expanded");
						$('.results-pr-wrapper').addClass('d-none');
						$('.results-article-wrapper').addClass('d-none');
						
						if ($('.suggestions-wrapper .suggestions').length > 0){
							$results.fadeIn();
							$results.find('#ajaxSearchPrResults').html('').removeClass('resultsdata');		
							$results.find('#ajaxSearchArticleResults').html('').removeClass('resultsdata');		
						}
						else{
							$results.find('#ajaxSearchPrResults').html('');
							$results.find('#ajaxSearchArticleResults').html('');
							$results.fadeOut();
						}
					}
				}
			},500));

			$('body').on('click', '.searchform-close', function(e){
				e.preventDefault();
				$('.header-search').removeClass('open');
				$('body').removeClass('lock-scroll');
			});
		},
		miniCart: function(){
			$(".header-main .header-actions-list .action-cart.allow-hover").on("mouseenter focusin", (function() {
				if ($('.action-cart .ajaxMinicart').length > 0){
					$(".action-cart .minicart-dropdown").addClass("show");
				}
			}));
			$(".header-main .header-actions-list .action-cart.allow-hover").on("mouseleave focusout", (function() {
				$(".action-cart .minicart-dropdown").removeClass("show");
			}));
			$(".header-main .header-actions-list .action-cart.allow-hover").on("touchstart click", (function(t) {
				$(".header-main .header-actions-list .action-cart.allow-hover").has(t.target).length <= 0 && $(".action-cart .minicart-dropdown").removeClass("show");
			}))
		},
		topbar: function(){
			$('body').on('click', '#topbar-notify .btn-close', function(e){
				e.preventDefault();
				$('#topbar-notify').addClass('d-none');
			});
		}
	},
	footerJS: function(){
		$('.footer-item .title').click(function(e){
			e.preventDefault();
			if($(window).width() < 860){
				$(this).toggleClass('active').siblings('.content').slideToggle(400);
			}
		})
	},
	socialContact: function(){
		$(document).on("click", ".button-social-contact button", function(e){
			e.preventDefault();
			$(this).parents('.button-social-contact').addClass('d-none');
			$('.list-social-chat').addClass('active');

			setTimeout(function(){
				$('.button-social-contact').removeClass('d-none');
				$('.list-social-chat').removeClass('active');
			},5000);
		});
		$(document).on("click", ".btn-close-bubble", function(e){
			e.preventDefault();
			$('.ctkm-bubble').addClass('d-none');
		});
	},
	popupContact: function(){
		setTimeout(function(){
			if(sessionStorage.mega_modal == null ){
				$('#contactModal').modal('show');
			}
		}, time_show);
		$(document).on('click','.linkbanner-modal-contact', function(){
			$('#contactModal').modal('hide');
			if(sessionStorage.mega_modal == null ){
				sessionStorage.mega_modal = 'show' ;
			}
		});
		$(document).on('click','.modal-contact .close', function(e){
			e.preventDefault();
			$('#contactModal').modal('hide');
			if(sessionStorage.mega_modal == null ){
				sessionStorage.mega_modal = 'show' ;
			}
		});
		$(".modal-contact").on('hidden.bs.modal', function(){
			if(sessionStorage.mega_modal == null ){
				sessionStorage.mega_modal = 'show' ;
			}
		});
	},
	
	renderLoop: function(data,ind){
		if(typeof data.tags == 'string' && data.tags != null){
			data.tags = data.tags.split(',');
    }

    if(!data.hasOwnProperty('url')){
			data.variants[0].compare_at_price = Number(data.variants[0].compare_at_price)*100;
			data.variants[0].price = Number(data.variants[0].price)*100;
		}
		
		var img_desk = 'https://theme.hstatic.net/200000726949/1001078399/14/noimage.jpg';
		var img_mb = 'https://theme.hstatic.net/200000726949/1001078399/14/noimage.jpg';
    var iconQv = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M256 .001C114.842.001.001 114.842.001 256S114.842 511.999 256 511.999 511.999 397.159 511.999 256 397.158.001 256 .001zm0 479.998C132.487 479.999 32.001 379.513 32.001 256S132.487 32.001 256 32.001 479.999 132.486 479.999 256c0 123.513-100.486 223.999-223.999 223.999zM398 256c0 8.837-7.164 16-16 16H272v110c0 8.837-7.164 16-16 16s-16-7.163-16-16V272H130c-8.836 0-16-7.163-16-16s7.164-16 16-16h110V130c0-8.837 7.164-16 16-16s16 7.163 16 16v110h110c8.836 0 16 7.164 16 16z" fill="#ffffff" opacity="1" data-original="#000000" class=""></path></g></svg>';
    
    
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

		var logo_collab = '', title_collab = '';
		pdr_tag.theme.tag.map((value,index) => {
			if(value != "null" && data.tags != null){
				if(data.tags.includes(value) && logo_collab == ''){
					logo_collab = pdr_tag.theme.icon[index];
					title_collab = pdr_tag.theme.tag[index1];
					//return false;
				}
			}
		});
		
		var tag_normal = '';
		pdr_tag.normal.tag.map((value2,index2) => {
			if(value2 != "null" && data.tags != null){
				if(data.tags.join(',').indexOf(value2) > -1 && tag_normal == ''){
					tag_normal  = pdr_tag.normal.icon[index2];
					//return false;
				}
			}
		});
		
		var tag_frame = '';
		pdr_tag.frame.tag.map((value3,index3) => {
			if(value3 != "null" && data.tags != null){
				if(data.tags.join(',').indexOf(value3) > -1 && tag_frame == ''){
					tag_frame  = pdr_tag.frame.icon[index3];
					//return false;
				}
			}
		});
		
		/*Check tag Badge*/
		var getTagBadge = data.tags == null ? [] : data.tags.filter((value) => value.indexOf('badge') > -1);
		var valTaBbadge	= 0;
		if(getTagBadge.length > 0){
			valTaBbadge = getTagBadge[0].split(':')[1];
		}
    
		/*Check tag CTKM*/
		var getTagCTKM = data.tags == null ? [] : data.tags.filter((value) => value.indexOf('I-DAY') > -1);
		var valTagCTKM	= '';
		if(getTagCTKM.length > 0){
			valTagCTKM = getTagCTKM[0];
		}

    /*Check tag CTKM 2*/
    var getTagCTKM2 = data.tags == null ? [] : data.tags.filter((value) => value.indexOf('Doubleday99') > -1);
		var valTagCTKM2	= '';
		if(getTagCTKM2.length > 0){
			valTagCTKM2 = getTagCTKM2[0];
		}

    /*Check tag Label*/
		var getTagLabel = data.tags == null ? [] : data.tags.filter((value) => value.indexOf('label:') > -1);
		var valTaLabel	= 0;
		if(getTagLabel.length > 0){
			valTaLabel = getTagLabel[0].split(':')[1];
		}

    /*Check tag Engraving*/
    var isEngraving = data.tags == null ? false : data.tags.includes('Engraving');
    var html_engraving = '';
    var icon_write = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M58.111 5.888a6.453 6.453 0 0 0-9.116 0l-37.6 37.599a15.158 15.158 0 0 0-3.162 4.614l-4.071 9.215a1.924 1.924 0 0 0 .396 2.125 1.918 1.918 0 0 0 2.124.397l9.217-4.072a15.175 15.175 0 0 0 4.613-3.161l32.509-32.509c.013-.012.031-.016.044-.029s.017-.03.029-.044l5.017-5.017a6.454 6.454 0 0 0 0-9.118zM6.084 57.916l1.966-4.451 2.485 2.485zM19.1 51.19a13.18 13.18 0 0 1-4.008 2.746l-2.595 1.146-3.58-3.579 1.146-2.594a13.182 13.182 0 0 1 2.747-4.008l31.839-31.838 6.289 6.289zm37.598-37.598-4.346 4.346-6.289-6.289 4.346-4.346A4.413 4.413 0 0 1 53.554 6c1.188 0 2.304.462 3.144 1.302a4.454 4.454 0 0 1 0 6.29z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>';
    if(isEngraving){
      html_engraving = `<span class="label-badge tag_engraving">${icon_write} <span>KHẮC THÔNG ĐIỆP</span></span>`;
    }
		
		//Check Price
		var sale = 0, del = 0;
		var compare_at_price = Number(data.variants[0].compare_at_price);
		var price = Number(data.variants[0].price);
		if(compare_at_price > price){
			del = data.hasOwnProperty('url') ? compare_at_price : compare_at_price;
			del = Haravan.formatMoney(del,shop.moneyFormat);
			sale = Math.round((compare_at_price - price)/compare_at_price * 100);
		}
		
		var data_icons = data.hasOwnProperty('metafields') ? data.metafields.filter(meta => meta.namespace == "product" && meta.key == "product_icons") : [];
		var html_colors = '';
		if(data_icons.length > 0){
			data_icons = JSON.parse(data_icons[0].value);	
			if(!$.isEmptyObject(data_icons)){
				var first_color = 0;
				for(color in data_icons){
					if(data_icons[color].icon != null){
						if(first_color < 4){}
						if(data.hasOwnProperty('url')){
							html_colors += `<li class="swatch-item ${data.images.includes(data_icons[color].icon)?'selected':''}">`;
							var find_select_price = data_icons[color].handle;
						}
						else{
							var find_select = data.images.filter(image => image.src == data_icons[color].icon);
							html_colors += `<li class="swatch-item ${find_select.length > 0?'selected':''}">`;
							var find_select_price = data_icons[color].handle;
						}
						var textDefault = ['bạc','mạ vàng 14k','mạ vàng hồng 14k','vàng','rose','gold','silver'];
						
						html_colors += `<span class="bg ${(textDefault.includes(color.toLowerCase())) ? 'default' : ''}" data-option="${color}" data-handle="${find_select_price}" 
														      style="background-image: url(${data_icons[color].icon});" 
																	data-image-1-dk="${data_icons[color].thumbs.length > 0?Haravan.resizeImage(data_icons[color].thumbs[0],'grande'):''}"
																	data-image-2-dk="${data_icons[color].thumbs.length > 1?Haravan.resizeImage(data_icons[color].thumbs[1],'grande'):''}"
																	data-image-1-mb="${data_icons[color].thumbs.length > 0?Haravan.resizeImage(data_icons[color].thumbs[0],'grande'):''}"
																	data-image-2-mb="${data_icons[color].thumbs.length > 1?Haravan.resizeImage(data_icons[color].thumbs[1],'grande'):''}">
														</span>
													</li>`;

						first_color++;
					}
				}
				//if(first_color >= 4) html_colors += `<li><span class="count">+${first_color - 4}</span></li>`;
			}
		}
		
		var html_button = '';
		var sku_available = data.variants.filter(v => v.available );

    if(window.location.href.indexOf('test') != -1){
      html_button += `<button data-view="${template}" aria-label="Xem nhanh" class="quick-view-custom quick-view full" data-price="${Haravan.formatMoney(data.hasOwnProperty('url') ? data.variants[0].price : data.variants[0].price ,shop.moneyFormat)}" data-handle="${url_prod}" data-id="${data.id}" data-variantid="${data.variants[0].id}">
                        <span>${iconQv_2}</span>
                      </button>`;
    }
    
		if(template == 'collection.select'){
			html_button += `<div class="product-loop-buttons" data-view="collection">
												<button aria-label="Thêm vào giỏ" class="product-action add-charm" data-variantid="${(sku_available.length > 0) ? sku_available[0].id : data.variants[0].id}" data-sku="${(sku_available.length > 0) ? sku_available[0].sku : data.variants[0].sku}" >
                          Thêm vào giỏ
                        </button>
											</div>`;		
		}
		else {
			html_button += `<div class="product-loop-buttons" data-view="${template}">  
												<button aria-label="Xem nhanh" class="product-action quick-view full" data-price="${Haravan.formatMoney(data.hasOwnProperty('url') ? data.variants[0].price : data.variants[0].price ,shop.moneyFormat)}" data-handle="${url_prod}" data-id="${data.id}" data-variantid="${data.variants[0].id}">
                          <span>Xem nhanh</span>
                          <span>${iconQv_2}</span>
                        </button>
												<button aria-label="Thêm vào giỏ" class="product-action add-to-cart disabled" disabled="" data-id="${data.id}" data-variantid="${data.variants[0].id}">Thêm vào giỏ</button>  
											</div>`;		
		}
		
		var html_loop = `
				<div class="product-loop-wrap">
          <div class="product-loop-head">
            <div class="product-loop-labels ${tag_frame != ''?' d-none':''}" data-ctkm="${valTagCTKM}" ${valTagCTKM2 != '' ? 'data-ctkm-2="'+valTagCTKM2+'"' : ''}>
              ${sale == 0?'':'<span class="label-s1 label-discount d-none">'+(Haravan.formatMoney(data.hasOwnProperty('url') ? (data.variants[0].price - data.variants[0].compare_at_price) : (data.variants[0].price - data.variants[0].compare_at_price) ,shop.moneyFormat))+'</span>'}
              ${logo_collab != '' ? '<span class="label-s2 tag-colab theme-" data-tag="'+title_collab+'">'+logo_collab+'</span>' : ''}
              ${getTagBadge.length >= 1?'<span class="label-s1 tag-badge">'+valTaBbadge+'</span>':''}
              ${getTagLabel.length >= 1?'<span class="label-s3 tag-label">'+valTaLabel+'</span>':''}
            </div>
            <div class="product-loop-img">
              <picture class="has-hover">
                <source data-srcset="${img_desk}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" media="(min-width: 768px)">
                <source data-srcset="${img_mb}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" media="(max-width: 767px)">
                <img class="lazyload img-default" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" data-src="${img_desk}" alt="${data.title}">
              </picture>
              ${tag_frame != '' ? '<div class="product-loop-frame"><img src="'+tag_frame+'" alt="Chương trình khuyến mãi"></div>' : ''}
            </div>
            <a href="${url_prod}" class="product-loop-link"></a>
            <div class="product-loop-wishlist">
              <button type="button" class="btn-wishlist js-wishlist" data-type="wishlist" data-title="${data.title}" data-handle="${data.handle}" data-id="${data.id}" data-price="${data.hasOwnProperty('url') ? data.variants[0].price : data.variants[0].price}">
                <svg class="ic-heart filled" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" width="20" height="20"><path d="M1.546 10.801c.107.117.22.23.336.337l8.047 8.047a.1.1 0 00.142 0l8.047-8.048a5.72 5.72 0 00.336-.336l.03-.03v-.003l.01-.01c.22-.244.419-.507.595-.786A5.925 5.925 0 0020 6.8C20 3.597 17.493 1 14.4 1a5.471 5.471 0 00-3.717 1.462 5.755 5.755 0 00-.602.646.103.103 0 01-.162 0 5.75 5.75 0 00-.602-.646A5.471 5.471 0 005.6 1C2.507 1 0 3.597 0 6.8c0 1.17.335 2.26.91 3.172.177.28.377.543.597.786l.009.01v.002l.03.031z" fill="#27251F"></path></svg>
                <svg class="ic-heart" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" width="20" height="20"><path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M17.426 10.415l.015-.014c.096-.088.188-.18.277-.277l.014-.015.01-.012A4.893 4.893 0 0019 6.8C19 4.116 16.908 2 14.4 2c-1.451 0-2.755.702-3.604 1.818l-.716.94a.1.1 0 01-.16 0l-.716-.94C8.354 2.702 7.051 2 5.6 2 3.092 2 1 4.116 1 6.8c0 1.282.48 2.44 1.257 3.297l.013.014.012.013c.089.096.181.19.277.278l.016.014 7.354 7.354a.1.1 0 00.142 0l7.355-7.354zm-7.355 8.77a.1.1 0 01-.142 0l-8.047-8.047a5.763 5.763 0 01-.336-.337l-.03-.03v-.002l-.01-.011a5.802 5.802 0 01-.595-.786A5.922 5.922 0 010 6.8C0 3.597 2.507 1 5.6 1a5.47 5.47 0 013.717 1.462c.216.199.418.415.602.646.041.052.12.052.162 0 .184-.231.386-.447.602-.646A5.471 5.471 0 0114.4 1C17.493 1 20 3.597 20 6.8c0 1.17-.335 2.26-.91 3.172-.177.28-.377.542-.596.786l-.01.01v.003l-.03.03a5.72 5.72 0 01-.336.336l-8.047 8.048z" fill="#27251F"></path></svg>
              </button>
            </div>
            ${html_button}
          </div>
          <div class="product-loop-body">
            <div class="product-proloop-swatch">
              <ul class="swatch-list">${html_colors}</ul>
            </div>
            <div class="product-loop-badges ${html_engraving != '' ? '' : 'd-none'}">
              ${getTagBadge.length >= 1?'<span class="label-badge tag-new">'+valTaBbadge+'</span>':''}
              ${html_engraving}
            </div>				
            <h3 class="product-loop-title"><a href="${url_prod}" title="${data.title}">${data.title}</a></h3>
            <div class="hrv-crv-container" data-hrvcrv-layout="star" data-product-id="${data.id}"></div>
            <div class="product-loop-prices">
              <b class="${sale == 0?'normal':'hightlight'}">${Haravan.formatMoney(data.hasOwnProperty('url') ? data.variants[0].price : data.variants[0].price ,shop.moneyFormat)}</b>
              <del class="${sale == 0?'d-none':''}">${del}</del>
              ${sale > 0 ? '<div class="sale_percent">-'+sale+'%</div>' : ''}
            </div>
          </div>
        </div>
		`;
		return html_loop;
	},
	clickChangeImg: function(){
		$(document).on('click','.swatch-item',function(){
			$(this).siblings().removeClass('selected');
			$(this).addClass('selected');
			var img_desk = $(this).find('.bg').attr('data-image-1-dk');
			var img_mb = $(this).find('.bg').attr('data-image-1-mb');
			var dom_loop = $(this).parents('.product-loop-wrap');
			var dom_img = $(this).parents('.product-loop-wrap').find('.product-loop-img');
			var dom_price = $(this).parents('.product-loop-wrap').find('.product-loop-prices');
			var dom_discount = $(this).parents('.product-loop-wrap').find('.product-loop-labels .label-discount');
			var dom_url = $(this).parents('.product-loop-wrap').find('.product-loop-link');
			var dom_title = $(this).parents('.product-loop-wrap').find('.product-loop-title a');
			var dom_quickview = $(this).parents('.product-loop-wrap').find('.product-loop-buttons .quick-view');
			var dom_wishlist = $(this).parents('.product-loop-wrap').find('.product-loop-wishlist .btn-wishlist');
      var dom_wishlist = $(this).parents('.product-loop-wrap').find('.product-loop-wishlist .btn-wishlist');
			if (template == 'collection.select') {
				var dom_addCharm = $(this).parents('.product-loop-wrap').find('.product-loop-buttons .add-charm');
			}
			
			
			dom_img.find('picture img').attr('src',img_desk);
			dom_img.find('picture source').attr('srcset',img_mb);
			var dom_handle = $(this).find('.bg').attr('data-handle');

			$.get('/products/'+dom_handle+'.js').done(function(data){	
				var url = data.hasOwnProperty('url') ? data.url : '/products/'+data.handle;
				
				var percent = 0, del = 0, sale = 0;
				var compare_at_price = Number(data.variants[0].compare_at_price);
				var price = Number(data.variants[0].price);
				if(compare_at_price > price){
					del = data.hasOwnProperty('url') ? compare_at_price : compare_at_price;
					del = Haravan.formatMoney(del,shop.moneyFormat);
					percent = Math.round((compare_at_price - price)/compare_at_price * 100);
					sale =  Haravan.formatMoney((price - compare_at_price),shop.moneyFormat);
				}
				
				var html_price   = `<b class="${percent == 0?'normal':'hightlight'}">${Haravan.formatMoney(data.hasOwnProperty('url') ? data.variants[0].price : data.variants[0].price ,shop.moneyFormat)}</b>
							 							<del class="${percent == 0?'d-none':''}">${del}</del>`;
				var html_discount = `${sale}`;

				dom_img.attr('alt',data.title)
				dom_url.attr('href',url);
				dom_title.attr('href',url).attr('title',data.title).html(data.title);
				dom_price.html(html_price);
				dom_quickview.attr('data-handle',url);
				dom_quickview.attr('data-id',data.id);
				dom_quickview.attr('data-variantid',data.hasOwnProperty('url') ? data.variants[0].id : data.variants[0].id);
				dom_wishlist.attr('data-handle',data.handle);
				dom_wishlist.attr('data-title',data.title);
				dom_wishlist.attr('data-id',data.id);
				dom_wishlist.attr('data-price',data.price);
				if (template == 'collection.select') {
					dom_addCharm.attr('data-variantid',data.hasOwnProperty('url') ? data.variants[0].id : data.variants[0].id);
					dom_addCharm.attr('data-sku',data.hasOwnProperty('url') ? data.variants[0].sku : data.variants[0].sku);
				}
				
				dom_discount.addClass('d-none');
				/*
				if (percent > 0) {
					dom_discount.html(html_discount);
					dom_discount.removeClass('d-none');
				}
				else {
					dom_discount.addClass('d-none')
				}
				*/
			});

		});
	},
	getItemSlide: function(id,title,url,page,limit,target,callback){
		var url_get = url+'/products.json?include=metafields[product]&page=1&limit='+limit;
		$.get(url_get).done(function(data){
			if(data.products.length > 0){
				$(target+' .swiper-wrapper').html('');
				data.products.map((item,ind) => {
					var html_loop = `<div class="swiper-slide"><div class="product-loop">` + PDR.Global.renderLoop(item,limit*(page - 1) + (ind + 1)) + `</div></div>`;
					$(target+' .list-products').append(html_loop);
				});
				PDR.Wishlist.renderFavorites();
			}
			if(typeof callback === 'function') return callback();
		});
	},
	getItemGrid: function(id,title,url,page,limit,target){ 
		var url_get = url+'/products.json?include=metafields[product]&page='+page+'&limit='+limit;
		$.get(url_get).done(function(data){
			if(data.products.length > 0){
				$(target+' .grid-products').html('');
				data.products.map((item,ind) => {
					var html_loop = `<div class="product-loop">` + PDR.Global.renderLoop(item,limit*(page - 1) + (ind + 1)) + `</div>`;
					$(target+' .grid-products').append(html_loop);
				});
				PDR.Wishlist.renderFavorites();
			}
		});
	},
	
	actionAccount: function(){
		$('body').on('click', '#js-btn-logout', function(e){
			e.preventDefault();
			Swal.fire({
				title: '',
				text: 'Bạn muốn thoát tài khoản',
				icon: 'question',
				showCancelButton: true,
				showConfirmButton: true,
				confirmButtonText: 'Đồng ý',
				cancelButtonText: 'Không',
			}).then((result) => {
				if (result.isConfirmed) {
					window.location = '/account/logout';
				} 
			})
		});
	},
	copyCodeProdCoupon: function(){
		$(document).on('click', '.coupon-item .cp-btn', function(e){ 
			e.preventDefault();	
			/*	$('.coupon-item .cp-btn').html('Sao chép mã').removeClass('disabled');
			var copyText = $(this).attr('data-coupon');
			var el = document.createElement('textarea');	
			el.value = copyText ;
			el.setAttribute('readonly', '');
			el.style.position = 'absolute';
			el.style.left = '-9999px';
			document.body.appendChild(el);		
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);
			$(this).html('Đã sao chép').addClass('disabled');*/
			$('.coupon-item .cp-btn').html('Sao chép mã').removeClass('disabled');
			var copyText = $(this).attr('data-coupon');
			var dummy = $('<input class="copy-discount-text-hide">').val(copyText).appendTo('body').select();
			dummy.focus();
			document.execCommand('copy');
			$('.copy-discount-text-hide').hide();
			$(this).html('Đã sao chép').addClass('disabled');
		});
	},
	sliderTopbar: function(){
		var swiper = new Swiper("#topbar-notify .topbar-inner", {
			loop: true,
			autoplay: {
				delay: 4000,
			}
		});
	},
	fixedMainHeader: function(){
		
		var $parentHeader = $('#header-main');
		var parentHeight = $parentHeader.find('.header-top').outerHeight();
		$parentHeader.css('min-height', parentHeight);
		var resizeTimer = false,
				resizeWindow = $(window).prop("innerWidth");

		$(window).on("resize", function() {
			if (resizeTimer) {	clearTimeout(resizeTimer)	}
			resizeTimer = setTimeout(function() {
				var newWidth = $(window).prop("innerWidth");
				if (resizeWindow != newWidth) {
					if($('body').hasClass('overflow-hidden')) {
						$( "#showmenu-mobile" ).first().trigger( "click" );
					}
					$('.header-top').removeClass("nav-sticky");

					$parentHeader.css('min-height', '');
					parentHeight = $parentHeader.find('.header-top').outerHeight();
					$parentHeader.css('min-height', parentHeight);
					resizeWindow = newWidth
				}
			}, 200)
		});
		setTimeout(function() {
			$parentHeader.css('min-height', '');
			parentHeight = $parentHeader.find('.header-top').outerHeight();
			$parentHeader.css('min-height', parentHeight);
			var stickyNow = false,
					currentState = false;
      //var position_collection = $('.grid-products').offset().top;
			$(window).scroll(function() {
				var curWinTop = $(window).scrollTop();
				if (curWinTop > 400) {
					$('.header-top').addClass("nav-sticky");	
					$parentHeader.addClass("hSticky");				
					currentState = true;
				}
				else {
					$('.header-top').removeClass('nav-sticky').removeClass('nofade');
					$parentHeader.removeClass("hSticky");	
					currentState = false;
				}
				if (currentState != stickyNow) {	stickyNow = currentState }

			})
		}, 300)
	},
}  
PDR.Rating = {
	formData: new FormData(),
	formImg: new FormData(),
	arrFile: [],
	init: function(){
		var that = this;
		that.defaultRating();
		that.writeReview();
		that.starRating();
		that.actionReviews();
		that.pagiRating();
	},
	defaultRating: function(){
		var url = window.apps.defaultRating;
		$.get(url, function(response){
			if(response.data.total > 0){
				var items = response.data.content_ratings;
				var html = '';
				if(items.length > 0){
					items.filter(x => {
						html += '<span class="">';
						html += 	'<span>'+x.content+'</span>';
						html += 	'<img src="https://file.hstatic.net/200000060274/file/close_a8dadb58798949d9b93ff3542bb924cf.png">';
						html += '</span>';
					});
					if(html != ''){
						$('.cr-content .cr-list-default').html(html).removeClass('d-none');
					}
				}
			}
			else {
				$('.cr-content .cr-list-default').addClass('d-none');
			}
		});
	},
	appRating: {
		isRating: {},
		customerId: '',
		customerEmail: '',
		customerName: '',
		dataPagi: {},
		listRating: {},
		limit: 10
	},
	currentProduct: function(){
		var currentUrl = location.pathname;
		if(currentUrl.slice(-1).indexOf('/') != -1){
			currentUrl = currentUrl.slice(0,-1);
		}
		var currentPro = window.productCollect.filter(x => x.url == currentUrl);
		console.log(currentPro);
		return currentPro;
	},
	ratingProduct: function(page,sort,filter){
		var self = this,
				data = self.currentProduct(),
				product = data[0],
				limit = self.appRating.limit;
		
		var url = '/apps/customer_rating/product_rating?product_id='+window.data_main.id+'&org_id='+window.shop.shopId+'&page='+page+'&limit='+limit+'&sort='+sort+'&filter='+filter;		
		$.ajax({
			url: url,
			success: function(response){
				if(response.data.total == 0){
					//$('.product-reviews--process').hide();
				}
				self.renderRating(page,response);
			}
		});
	},
	renderRating: function(page,response){
		var self = this,
				data = self.currentProduct(),
				product = data[0],
				rating = response;
		if(rating.data.product_ratings.length > 0){
			var ratingStatus = rating.data.product_ratings[0];
			if(ratingStatus.status == 1){
				var totalRate = rating.data.avg.toFixed(1);
				var percentRate = totalRate / 5 * 100;
				
				$('.pr-reviews--number .number-rate').html(totalRate);
				$('.pr-reviews--number .number-rv').html('('+rating.data.total+')');
				$('.pr-reviews--star .star-rate.star-fill').css('width', percentRate + '%');
				
				$('.product-reviews--star .star-rate.star-fill').css('width', percentRate + '%');
				$('.product-reviews--number span').html(totalRate+'/5');
				$('.product-reviews--total strong').html('('+rating.data.total+')');
				var sumRate = rating.data.total_rate || null;
				if(sumRate != null) {
					var total = 0;
					for(var i = 1; i < 6 ; i++){
						var key = i + '_star';
						var star = rating.data.total_rate[key] || 0;
						total += star;
					}
					for(var i = 1; i < 6; i++){
						var key = i + '_star';
						var star = rating.data.total_rate[key] || 0;
						var percent = (star / total * 100) + '%';
						$('.items-process[data-star="'+i+'"] .isLoad').css('width',percent);
						$('.items-process[data-star="'+i+'"] .isCount').html(star + ' đánh giá');
					}
				}
				self.renderItems(rating.data,page);
				$('.product-reviews--body').removeClass('d-none');
			}
			else if(ratingStatus.status == 0) {
				$('.product-reviews--status').html('<p class="status-rating-order">Đánh giá đơn hàng của bạn đang được kiểm duyệt</p>').removeClass('d-none');;			
			}
		}
		else {
			$('.pr-reviews--number .number-rate').html('0.0');
			$('.pr-reviews--number .number-rv').html('(0)');
			
			$('.product-reviews--body').addClass('d-none');
			$('.product-reviews--number span').html('0/5');
			$('.product-reviews--total strong').html('0');
			$('.isLoad').css('width','0px');
			$('.items-process .isCount').html('0 đánh giá');
		}
	},
	
	renderItems: function(data,page){
		var self = this;
		var items = '';
		data.product_ratings.filter(x => {
			var name = x.customer.name;
			var email = x.customer.email;
			if(name == ""){
				if(email == ""){
					name = 'xxxxx';
				} else {
					name = 'xxx' + x.customer.email.split('@')[1];
				}
			}
			var dItems = new Date(x.doc_created_at);
			var dPost = dItems.getDate() + '-' + (dItems.getMonth()+1) + '-' + dItems.getFullYear();
			items += '<div class="items-comment">';
			items += 		'<div class="items-comment-top">';
			items += 			'<div class="items-comment-name">'+name+'</div>';
			items += 			'<div class="items-comment-date">'+dPost+'</div>';
			items += 		'</div>';
			items += 		'<div class="items-comment-bottom">';
			items += 			'<div class="items-comment-left">';
			items += 				'<div class="items-comment-star">';
			for(var i = 1; i < 6; i++){
				var active = '';
				if(i <= x.rate){
					active = 'active';
					items += '<div class="items-star '+active+'" data-star="'+i+'">';
					items += '<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 25 25" aria-hidden="true" focusable="false"><polygon points="25 9.12 15.5669599 9.12 12.512219 0 9.40860215 9.12 0 9.12 7.55131965 14.856 4.47214076 24 12.512219 18.216 20.5522972 24 17.4731183 14.856" style="fill: url(&quot;#bv_rating_summary_star_filled_'+i+'&quot;) !important;"/><path d="" style="fill: url(&quot;#bv_rating_summary_star_filled_'+i+'&quot;) !important;"/><defs><linearGradient id="bv_rating_summary_star_filled_'+i+'" x1="99.99%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color: rgb(242, 161, 178); stop-opacity: 1;"/><stop offset="1%" style="stop-color: rgb(208, 209, 210); stop-opacity: 1;"/></linearGradient></defs></svg>';
					items += '</div>';
				}
				else {
					items += '<div class="items-star" data-star="'+i+'">';
					items += '<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 25 25" aria-hidden="true" focusable="false"><polygon points="25 9.12 15.5669599 9.12 12.512219 0 9.40860215 9.12 0 9.12 7.55131965 14.856 4.47214076 24 12.512219 18.216 20.5522972 24 17.4731183 14.856" style="fill: url(&quot;#bv_rating_summary_star_'+i+'&quot;) !important;"/><path d="" style="fill: url(&quot;#bv_rating_summary_star_'+i+'&quot;) !important;"/><defs><linearGradient id="bv_rating_summary_star_'+i+'" x1="0.00%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color: rgb(242, 161, 178); stop-opacity: 1;"/><stop offset="1%" style="stop-color: rgb(208, 209, 210); stop-opacity: 1;"/></linearGradient></defs></svg>';
					items += '</div>';
				}
				
			}
			items += 				'</div>';
			items += 			'</div>';
			items += 			'<div class="items-comment-right">';
			if(x.default_content.length > 0){
				items += 			'<div class="items-comment-title">';
				x.default_content.filter(y => {
					items += 			'<div class="items-title">'+y+'</div>';
				});
				items += 			'</div>';
			}
			if(x.content.length > 0){
				items += 				'<div class="items-comment-content">'+ x.content +'</div>';
			}
			if(x.images.length > 0){
				items += 				'<div class="items-comment-image">';
				x.images.filter(y => {
					items += 			'<div class="items-comment-img">';
					items += 				'<a data-fancybox="gallery-2-'+name+'" href="'+y.image_url+'">';
					items += 					'<img src="'+y.image_url+'" alt="'+y._id+'" />';
					items += 				'</a>';
					items += 			'</div>';
				});
				items += 				'</div>';
			}
			
			if(x.resrating.length > 0){
				items += 			'<div class="items-comment-replay">';
				items += 				'<div class="heading-replay d-none">Trả lời: </div>';
				x.resrating.filter(y => {
					var dReplay = new Date(y.rescreatedate);
					var dPostReplay = dReplay.getDate() + '-' + (dReplay.getMonth()+1) + '-' + dReplay.getFullYear();
					
					var fName = y.employee_first_name || '';
					var lName = y.employee_last_name || '';
					var name = 'Admin';
					if(lName != '' || fName != '') name = lName + ' ' + fName;
					
					items += 			'<div class="items-replay">';
						items += 			'<div class="items-replay-title"><h4>'+name+'</h4><span>'+dPostReplay+'</span></div>';
						items += 			'<div class="items-replay-content">'+y.rescontent+'</div>';
					items += 			'</div>';
				});
				items += 			'</div>';
			}
			items += 			'</div>';
			items += 		'</div>';
			items += '</div>';
		});
		if(items != ''){
			/*
			//dùng cho phân trang số
			if($(window).width() > 991){
				$('.product-reviews--render').html(items);
			}
			else {*/
				$('.product-reviews--render').append(items);
			//}
			if(data.total > 3 && (self.appRating.limit * page) < data.total){
				self.getPagiRating(data.total,page);
			}
			else {
				$('.product-reviews--footer').addClass('d-none');
			}
			$('.product-reviews--body').removeClass('d-none');
		}
		else {
			$('.product-reviews--body').addClass('d-none');
		}
	},
	writeReview: function(){
		var self = this;
		$('.btn-reviews--edit').click(function(){
			if(accountJS.logged){
				var data = self.currentProduct();
				if(data.length > 0){
					var product = data[0];
					var img = product.featured_image;
					$('.cr-product img').attr('src',img);
					$('.cr-product img').attr('data-src',img);
					$('.cr-name').html(product.title);
					$('#customersRatingModal').modal();
				}
			}
			else {
				Swal.fire({
					title: 'Thông báo',
					text: 'Bạn cần đăng nhập để nhận xét & đánh giá sản phẩm!',
					icon: 'warning',
					showCancelButton: true,
					showConfirmButton: true,
					confirmButtonText: 'Đăng nhập',
					cancelButtonText: 'Không đánh giá'
				}).then((result) => {
					if (result.isConfirmed) {
						window.location = '/account/login';
					}
				})
			}
		});
	},
	starRating: function(){
		var self = this;
		$(document).on('click','.cr-app--right form.cr-form > div',function(){
			$(this).parents('.cr-app--right').find('form.cr-form > div').removeClass('active');
			$(this).addClass('active');
		});
		$(document).on('mouseenter', '.cr-levels > li', function() {
			var dataRating = parseInt($(this).attr('data-rating'));
			self.appRating.isRating = dataRating;
			$('.cr-levels > li').removeClass();
			$(".cr-levels > li").each(function(index) {
				var start = $(this);
				var nameClass =  's' + dataRating;
				var rating = parseInt($(this).attr('data-rating'));
				if(rating <= dataRating) start.addClass(nameClass);
			});
			switch(dataRating) {
				case 1:
					$('#customersRatingModal .rate-show').html('Rất không hài lòng');
					break;
				case 2:
					$('#customersRatingModal .rate_-how').html('Không hài lòng');
					break;
				case 3:
					$('#customersRatingModal .rate-show').html('Bình thường');
					break;
				case 4:
					$('#customersRatingModal .rate-show').html('Tốt');
					break;
				case 5:
					$('#customersRatingModal .rate-show').html('Xuất sắc');
					break;
			}
		});
		$(document).on('mouseleave', '.cr-levels > li', function() {
			if($('input[name="rate-level"]:checked').length == 0) {
				$(".cr-levels > li").removeClass();
				$('#customersRatingModal .rate-show').html('Click vào để review!');
				$('.cr-rating .rate-success').addClass('d-none');
				$('.cr-rating .rate-error').removeClass('d-none');
			}
			else {
				$('.cr-rating .rate-success').removeClass('d-none');
				$('.cr-rating .rate-error').addClass('d-none');
				if(self.appRating.isRating != $('input[name="rate-level"]:checked').val()) {
					var dataRating = $('input[name="rate-level"]:checked').val();
					$('.cr-levels > li').removeClass();
					$(".cr-levels > li").each(function(index) {
						var start = $(this);
						var nameClass =  's' + dataRating;
						var rating = parseInt($(this).attr('data-rating'));
						if(rating <= dataRating) start.addClass(nameClass);
					});
					switch(parseInt(dataRating)) {
						case 1:
							$('#customersRatingModal .rate-show').html('Rất không hài lòng');
							break;
						case 2:
							$('#customersRatingModal .rate-show').html('Không hài lòng');
							break;
						case 3:
							$('#customersRatingModal .rate-show').html('Bình thường');
							break;
						case 4:
							$('#customersRatingModal .rate-show').html('Tốt');
							break;
						case 5:
							$('#customersRatingModal .rate-show').html('Xuất sắc');
							break;
					}
				}
			}
		});
	},
	actionReviews: function(){
		var self = this;
		$(document).on('click','.cr-list-default > span', function(){
			$(this).toggleClass('active');
		});
		var files = $('#theFiles');
		var typeFile = ['jpg','png','jpeg'];
		var arrDelete =[];
		var err = $('.err-img');
		var form = $('#customersRatingModal');
		function renderPreview(isDelete){				
			var itemImg = files[0].files;
			var prevImg = $('#preview_img > figure').length;
			
			var arrFileTemp = [];
			for(let i = 0; i < itemImg.length; i++) { arrFileTemp.push(itemImg[i]); }
			
			if(arrFileTemp.length == 5){
				self.arrFile = arrFileTemp;
				self.formImg.delete("uploadFiles");
			}
			
			if(isDelete == true){
				self.arrFile.splice(arrDelete[0],1);
				itemImg = self.arrFile;
			}
			
			var total_image = arrDelete.length > 0 ? arrFile.length : arrFile.length + prevImg ;
			if(total_image <= 5){
				if($('#preview_img > figure').length == 5 || isDelete)  $('.preview-img').html('');
				for(var i = 0; i <itemImg.length; i++){
					if(!arrDelete.includes(i.toString())){
						if(!itemImg[i]) return ;
						if(itemImg.length > 5) {
							err.html("Chỉ được gửi tối đa 5 hình ảnh").removeClass('d-none');
							return;
						} 
						else {
							err.html('').addClass('d-none');
						}

						if(!itemImg[i].name.endsWith('.jpg') && !itemImg[i].name.endsWith('.png') && !itemImg[i].name.endsWith('.jpeg')) {
							err.html("Định dạng không được hỗ trợ").removeClass('d-none');
							return;
						} 
						else {
							err.html('').addClass('d-none');
						}

						if(itemImg[i].size/ (1024 * 1024) > 15) {
							err.html('Chỉ được upload ảnh < 15MB').removeClass('d-none');
							return
						} 
						else {
							err.html('').addClass('d-none');
						}

						let reader = new FileReader;
						let figure = document.createElement('figure');
						let figIcon = document.createElement('i')
						figIcon.setAttribute('class','remove-preview')	
						figIcon.setAttribute('data-index',i)
						figure.appendChild(figIcon);
						reader.onload =()=>{
							let img = document.createElement('img')
							img.setAttribute('src',reader.result);
							figure.insertBefore(img,figIcon);
						}
						self.formImg.append("uploadFiles",itemImg[i],itemImg[i].name)
						$('.preview-img')[0].appendChild(figure);
						reader.readAsDataURL(itemImg[i])
					}
				}
				arrDelete = [];
				//files.val('');
			}
			else{
				err.html("Chỉ được gửi tối đa 5 hình ảnh");
				return;
			}

			console.log(arrDelete);
			console.log(arrFile);
		}

		$(document).on('click','.remove-preview',function(){
			var	index = Number($(this).attr('data-index'));
			arrDelete.push(index);

			var itemImg = files[0].files; //itemImg là kiểu dữ liệu FileList ko phải array
			var arrFile = []; //arrFile là mảng chứa từng file Image
			for(let i = 0; i < itemImg.length; i++) {
				arrFile.push(itemImg[i]);
			}
			arrFile.splice(index,1);

			console.log('itemImg New:',arrFile);

			self.formImg.delete("uploadFiles");
			for(var i = 0; i < arrFile.length; i++){
				self.formImg.append("uploadFiles",arrFile[i],arrFile[i].name);
			}

			$(this).parents('figure').remove();
			
			//renderPreview(true);
		})
		$(document).on('change','#theFiles',function(){
			arrDelete=[];
			arrFile = [];
			
			var $this = $(this);
			var time = new Date().getTime();
			var fileName = this.files[0].name;
			var fileImg = this.value;
			var fileNameExt = fileName.substr(fileName.lastIndexOf('.') + 1);
			if (this.files[0].size > 1000000) {
				PDR.Helper.SwalWarning("Thông báo","Dung lượng tối đa 1MB",'error',false,false,3000);
			}
			else if ($.inArray(fileNameExt, typeFile) == -1){
				PDR.Helper.SwalWarning("Thông báo!","Chỉ hỗ trợ tệp tải lên .jpg, .jpeg, .png",'error',false,false,3000);
			}
			else if (fileName.indexOf(' ') != -1){
				PDR.Helper.SwalWarning("Thông báo!",'Tên hình viết liền, không dấu','error',false,false,3000);
			}
			else {
				renderPreview();
			}	
		})
		$(document).on('click','#customersRatingModal .cr-submit',function(e){
			e.preventDefault();
			if($(this).closest('.cr-form')[0].checkValidity() == true && form.find('.cr-levels li[class*="s"]').length > 0){
				$('.cr-submit').attr("disabled", true);
				$('.cr-submit').addClass("disabled");
				
				var currentPro = self.currentProduct();
				currentPro = currentPro.length == 0 ? window.product : currentPro[0];
				form.find('.rate-error').addClass('d-none');
				var rate = Number(form.find('.cr-levels li[class*="s"]').attr('class').replace('s',''));
				self.formImg.append("customer_id", self.appRating.customerId);
				var dataPost = {
					"rate": rate,
					"title": form.find('.cr-title input[name="cr-title"]').val().trim() || '',
					"content": form.find('.cr-content textarea[name="cr-content"]').val().trim() || '',
					"customer_id": self.appRating.customerId,
					"default_content": "",
					"customer_name": self.appRating.customerName,
					"customer_email": self.appRating.customerEmail,
					"variant_id": $('#product-select').val(),
					"product_id": currentPro.id,
					"org_id": window.shop.shopId
				};
				var list_default = form.find('.cr-list-default > span.active');
				if(list_default.length > 0) {
					var data_default = [];
					list_default.each(function( index ) {
						var d = $(this).find('span');
						data_default.push(d.html());
					});
					dataPost['default_content']= data_default;
				}
				grecaptcha.ready(function() {
					grecaptcha.execute('6LdD18MUAAAAAHqKl3Avv8W-tREL6LangePxQLM-', {action: 'submit'}).then(function(token) {
						$.ajax({  
							url: window.apps.urlFile + '?recaptcha_token=' + token,
							type: 'POST',
							"timeout": 0,
							data:  self.formImg,
							processData: false,
							mimeType: "multipart/form-data",
							contentType: false, 
							success: function(response){
								response = JSON.parse(response);
								if(response.error == true) {
									PDR.Helper.SwalWarning("Thông báo",response.message,'error',false,false,3000);
								}
								else {
									var img = [];
									$.each(response.data, function( index, value ) {img.push(value.url)});
									dataPost['image_url'] = img;
									$.ajax({
										url: window.apps.postRating,
										type: 'POST',
										headers: {
											'content-type': 'application/json'
										},
										data: JSON.stringify(dataPost),
										dataType: 'JSON',
										success: function(res){
											$('#customersRatingModal').modal('hide');
											PDR.Helper.SwalWarning("Thông báo","Quý khách đã đánh giá sản phẩm thành công",'success',false,false,5000);
											self.formData = new FormData();
											self.appRating.dataPagi = {};
											self.ratingProduct(1);
											self.clearFormRating(form);
										},
										error: function(){
											self.formData = new FormData();
											PDR.Helper.SwalWarning("Thông báo","Đã có lỗi xảy ra",'error',false,false,2000);
											$('.cr-submit').attr("disabled", false);
											$('.cr-submit').removeClass("disabled");
										}
									});
								}	
							},
							error: function(){	
								PDR.Helper.SwalWarning("Thông báo","Không thể lấy thông tin recaptcha, vui lòng tải lại trang",'error',false,false,1000);
							}
						});
					})
				})										
			}
			else{
				$('.cr-submit').attr("disabled", false);
				$('.cr-submit').removeClass("disabled");
				if(!form.find('.cr-rating').hasClass('active')) form.find('.cr-rating .rate-error').removeClass('d-none');
			}
		});
	},
	clearFormRating: function(form){
		var self = this;
		form.find('input').val('');
		form.find('textarea').val('');
		form.find('.rate-success').addClass('d-none');
		form.find('.rate-error').addClass('d-none');
		form.find('.cr-list-default span').removeClass('active');
		form.find('.cr-list-default span img').addClass('d-none');
		form.find('.preview-img').html('');
		form.find('.cr-levels li').removeClass();
		form.find('input[name="rate-level"]').prop('checked',false);
		self.appRating.isRating = 0;
		form.find('.rate-show').html('Click vào để review!');
		form.find('.cr-submit').attr("disabled", false);
		form.find('.cr-submit').removeClass("disabled");

	},
	getPagiRating: function(total,page){
		var self = this;
		var totalPage = Math.ceil(total/self.appRating.limit);
		var html = '<div class="paginate-wrapper"><div id="paginate-customers-rating" class="justify-content-end">';
		/*
		//dùng cho phân trang số
		page = parseInt(page);
		var renderTruncate = false;
		var range = totalPage - page;
		var truncate = totalPage - 1 > 3 && range > 3 ? true : false;
		if(page != 1) html += '<div data-total="'+total+'" data-page="'+(page-1)+'" class="item-pagi">'+'<'+'</div>';
		if(page > 4 && page > totalPage - 4){
			var delta = parseInt(totalPage - page);
			for (var i = parseInt(page - 4 + delta); i <= totalPage; i++){
				html += '<div data-total="'+total+'" data-page="'+i+'" class="item-pagi '+(i == page?'active':'')+'">'+i+'</div>';
			}
		}
		else if(page > 3){
			if(truncate){
				for(var i = parseInt(page-2);i <= totalPage; i++) {
					if(i < page + 2){
						html += '<div data-total="'+total+'" data-page="'+i+'" class="item-pagi '+(i == page?'active':'')+'">'+i+'</div>';
					}
					else {
						if(!renderTruncate){
							html += '<div class="item-pagi">...</div>';
							renderTruncate = true;
						}
					}
					if(i == totalPage)  html += '<div data-total="'+total+'" data-page="'+i+'" class="item-pagi">'+i+'</div>';
				}
			} else {
				for(var i = parseInt(page-1);i <= totalPage; i++) {
					html += '<div data-total="'+total+'" data-page="'+i+'" class="item-pagi '+(i == page?'active':'')+'">'+i+'</div>';
				}
			}
		}
		else {
			if(truncate){
				for(var i = 1; i<= totalPage; i++){
					if(i <= 4 ){
						html += '<div data-total="'+total+'" data-page="'+i+'" class="item-pagi '+(i == page?'active':'')+'">'+i+'</div>';
					}
					else { 
						if(!renderTruncate){
							html += '<div class="page-node">...</div>';
							renderTruncate = true;
						}
					}
					if(i == totalPage)  html += '<div data-total="'+total+'" data-page="'+i+'" class="item-pagi">'+i+'</div>';
				}
			} 
			else {
				for(var i = 1;i <= totalPage; i++) {
					html += '<div data-total="'+total+'" data-page="'+i+'" class="item-pagi '+(i == page?'active':'')+'">'+i+'</div>';
				}
			}
		}
		if(page != totalPage) html += '<div data-total="'+total+'" data-page="'+(page+1)+'" class="item-pagi">'+'>'+'</div>';
		html += '</div></div>';
		if($(window).width() > 991){
			$('.product-reviews--pagi').html(html);
		}
		else {*/
			$('.product-reviews--footer').find('.btn-reviews--more').attr('data-page', page+1).attr('data-total', total).html('Xem thêm đánh giá');
			$('.product-reviews--footer').removeClass('d-none');
		//}
	},
	pagiRating: function(){
		var self = this;
		$(document).on('click', '.item-pagi', function(){
			var page = Number($(this).attr('data-page'));
			self.ratingProduct(page,0,0);
			var y = $("#customers-rating").offset().top;
			PDR.Helper.smoothScroll(y-140, 200);
			
		});
		$(document).on('click', '.btn-reviews--more', function(){
			var page = Number($(this).attr('data-page'));
			self.ratingProduct(page,0,0);
		});
	},
	checkRatingLoop: function(aIdSearch){
		var ids = [];
		$('.proloop-block:not(.has-rating)').each(function(){
			var id = $(this).attr('data-id');
			ids.push(id);
		});
		ids = Haravan.uniq(ids).sort();

		var url = 'https://customer-rating-apps.haravan.com/api/buyer/product_rating/list?product_ids='+(aIdSearch != undefined? aIdSearch.join(',') : ids.join(',') )+'&org_id='+window.shop.shop_id+'&page=1&limit=20&sort=0&filter=0';		
		$.ajax({
			url: url,
			success: function(response){
				if(response.data.length > 0){
					response.data.map(info => {
						var prd_id = info.pr_id;
						$('.proloop-block[data-id="'+prd_id+'"]').addClass('has-rating');
						$('.proloop-block[data-id="'+prd_id+'"] .number').html(parseFloat(info.statistics.overall.avg).toFixed(1));
						$('.proloop-block[data-id="'+prd_id+'"] .count').html('('+info.statistics.overall.qty+' đánh giá)');
						//$('.proloop-block[data-id="'+prd_id+'"] .proloop-rating').removeClass('d-none');
					});
				}
			}
		});
	},
	ratingQuickview: function(dataQuickview){
		var url = '/apps/customer_rating/product_rating?product_id='+dataQuickview.id+'&org_id='+window.shop.shopId;		
		$.ajax({
			url: url,
			success: function(response){
				var rating = response;
				if(rating.data.product_ratings.length > 0){
					var ratingStatus = rating.data.product_ratings[0];
					if(ratingStatus.status == 1){
						var totalRate = rating.data.avg.toFixed(1);
						var percentRate = totalRate / 5 * 100;
						$('.qv-reviews--number .number-rate').html(totalRate);
						$('.qv-reviews--number .number-rv').html('('+rating.data.total+')');
						$('.qv-reviews--star .star-rate.star-fill').css('width', percentRate + '%');
					}
				}
				else {
					$('.qv-reviews--number .number-rate').html('0.0');
					$('.qv-reviews--number .number-rv').html('(0)');
				}
			}
		});
	},
}
PDR.Wishlist = { 
	init: function(){
		var that = this;
		that.addFavorites();
		that.initFavorites(function(){
			PDR.Wishlist.renderFavorites();
			if(window.accountJS.logged) {
				if ((template == 'customers[account]') || (template == 'customers[account].wishlist')){
					PDR.Wishlist.renderItems();
				}				
				if(typeof window.shop.favorites.listhandle === 'object' && window.shop.favorites.listhandle != null) {
					if (window.shop.favorites.listhandle.length > 0){
						$('.header-main .action-wishlist a').addClass('hasitem').attr('data-num',window.shop.favorites.listhandle.length);
					}
				}
				$('.header-main .action-wishlist a').attr('href','/account/?view=wishlist');
			}
			else {
				$('.header-main .action-wishlist a').attr('href','/account/login');
			}
		});
	},
	setFavorites: function(id, handle, title, price, cb){
		$.ajax({
			type: 'POST',
			url: 'https://onapp.haravan.com/wishlist/frontend/api/likeproduct',
			async: false,
			data: {
				shop: window.shop.webDomain,
				customer_id: window.accountJS.id,
				product_id: id,
				product_title: title,
				product_handle: handle,
				product_price: price,
				email: window.accountJS.email,
				last_name: window.accountJS.last_name,
				first_name: window.accountJS.first_name
			},
			success: function(data){
				cb();
			}
		})
	},
	unSetFavorites: function(id, handle, cb){
		$.ajax({
			type: 'POST',
			url: 'https://onapp.haravan.com/wishlist/frontend/api/unlikeproduct',
			async: false,
			data: {
				shop: window.shop.webDomain,
				customer_id: window.accountJS.id,
				product_id: id,
				product_handle: handle,
				email: window.accountJS.email
			},
			success: function(data){
				cb();
			}
		})
	},
	listFavorites: function(cb){
		$.ajax({
			type: 'POST',
			url: 'https://onapp.haravan.com/wishlist/frontend/api/listproduct',
			async: false,
			data: {
				shop: window.shop.webDomain,
				customer_id: window.accountJS.id
			},
			success: function(data){
				//console.log(data);
				cb(data);
			}
		})
	},
	renderFavorites: function(){
		try {
			if(window.accountJS.logged){
				if(typeof window.shop.favorites.listhandle === 'object' && window.shop.favorites.listhandle.length > 0){
					$.each(window.shop.favorites.listhandle, function(i, v){
						$('.js-wishlist[data-handle="'+v+'"]').addClass('added');
					})
				}
			}
		}
		catch(err){}
	},
	initFavorites: function(cb){
		if(window.accountJS.logged){
			PDR.Wishlist.listFavorites(function(data){
				if(data.total > 0){
					$.each(data.data, function(i, v){
						if(typeof v.product_handle === 'string' && v.product_handle.length > 0){
							window.shop.favorites.listhandle.push(v.product_handle);
							window.shop.favorites.listid.push(v.product_id);
						}
					})
				}
        else{
					window.shop.favorites.listhandle = null;
					window.shop.favorites.listid = null;
				}
				cb();
			});
		}
	},
	addFavorites: function(){
		$('body').on('click', '.js-wishlist', function(e){
			e.preventDefault();
			var id = Number($(this).attr('data-id'));
			var handle = $(this).attr('data-handle');
			var title = $(this).attr('data-title');
			var price = Number($(this).attr('data-price'));
			if(window.accountJS.logged){
				var self = $(this);
				if(self.hasClass('added')){
					PDR.Wishlist.unSetFavorites(id, handle, function(){
						self.removeClass('added').find('svg.filled').removeClass('active');
						if(template.indexOf('customers') > -1){
							window.location.reload(); 
						}
					});
				}
				else{
					PDR.Wishlist.setFavorites(id, handle, title, price, function(){
						self.addClass('added').find('svg.filled').addClass('active');
					});
				}
			}
			else{
				window.location = '/account/login';
			}
		});
	},
	getWishlistProduct: function(prdId,cb){
		$.ajax({
			type: 'POST',
			url: 'https://onapp.haravan.com/wishlist/frontend/api/getproduct ',
			data: {
				shop: window.shop.webDomain,
				customer_id: window.accountJS.id,
				product_id: prdId
			},
			success: function(data){
				if(typeof cb === 'function') return cb(data);
			}
		})
	},
	renderItems: function(){
		try{
			if(typeof window.shop.favorites.listid === 'object' && window.shop.favorites.listid != null) {
				if (window.shop.favorites.listid.length > 0){
          /*
					var arrIdFavorites = window.shop.favorites.listid.join(',');
					if(template == 'customers[account]'){
						var url_get = '/search.js?q=filter=((id:product in '+arrIdFavorites+'))&include=metafields[product]&page=1&limit=4';
					}
					else if (template == 'customers[account].wishlist') {
						var url_get = '/search.js?q=filter=((id:product in '+arrIdFavorites+'))&include=metafields[product]&page=1&limit=20';
					}
          */
          
          var wishlist_promises = [];
    			window.shop.favorites.listhandle.map(handle => {
            var promise = new Promise(function(resolve, reject) {
              $.ajax({
                url:'/products/' + handle + '.js',
                success: function(product){
                  resolve(product);
                },
                error: function(err){
                  resolve('');
                }
              });
            });
            wishlist_promises.push(promise);
          });
    				
    			Promise.all(wishlist_promises).then(function(values) {
    				var viewed_items = [], count_wishlist = 0;
            if(values.filter(vl => vl != '').length > 0)  $('.js-render-wishlist').html('');
    				$.each(values, function(i, item){
    					if(item != ''){
                if(template == 'customers[account]' && count_wishlist <= 3){
										var html_loop = `
                      <div class="product-loop small-loop">
                        <div class="product-loop-wrap">
                          <div class="product-loop-head">
                            <div class="product-loop-img">
                              <picture class="has-hover">
                                <source data-srcset="${Haravan.resizeImage(item.featured_image,'medium')}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" media="(min-width: 768px)">
                                <source data-srcset="${Haravan.resizeImage(item.featured_image,'medium')}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" media="(max-width: 767px)">
                                <img class="lazyload img-default" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" data-src="${Haravan.resizeImage(item.featured_image,'medium')}" alt="${item.title}">
                              </picture>
                            </div>
                            <a href="${item.url}" class="product-loop-link"></a>
                            <div class="product-loop-wishlist">
                              <button type="button" class="btn-wishlist js-wishlist" data-type="wishlist" data-title="${item.title}" data-handle="${item.handle}" data-id="${item.id}" data-price="${Haravan.formatMoney(item.variants[0].price ,shop.moneyFormat)}">
                                <svg class="ic-heart filled" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" width="20" height="20"><path d="M1.546 10.801c.107.117.22.23.336.337l8.047 8.047a.1.1 0 00.142 0l8.047-8.048a5.72 5.72 0 00.336-.336l.03-.03v-.003l.01-.01c.22-.244.419-.507.595-.786A5.925 5.925 0 0020 6.8C20 3.597 17.493 1 14.4 1a5.471 5.471 0 00-3.717 1.462 5.755 5.755 0 00-.602.646.103.103 0 01-.162 0 5.75 5.75 0 00-.602-.646A5.471 5.471 0 005.6 1C2.507 1 0 3.597 0 6.8c0 1.17.335 2.26.91 3.172.177.28.377.543.597.786l.009.01v.002l.03.031z" fill="#27251F"></path></svg>
                                <svg class="ic-heart" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" width="20" height="20"><path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M17.426 10.415l.015-.014c.096-.088.188-.18.277-.277l.014-.015.01-.012A4.893 4.893 0 0019 6.8C19 4.116 16.908 2 14.4 2c-1.451 0-2.755.702-3.604 1.818l-.716.94a.1.1 0 01-.16 0l-.716-.94C8.354 2.702 7.051 2 5.6 2 3.092 2 1 4.116 1 6.8c0 1.282.48 2.44 1.257 3.297l.013.014.012.013c.089.096.181.19.277.278l.016.014 7.354 7.354a.1.1 0 00.142 0l7.355-7.354zm-7.355 8.77a.1.1 0 01-.142 0l-8.047-8.047a5.763 5.763 0 01-.336-.337l-.03-.03v-.002l-.01-.011a5.802 5.802 0 01-.595-.786A5.922 5.922 0 010 6.8C0 3.597 2.507 1 5.6 1a5.47 5.47 0 013.717 1.462c.216.199.418.415.602.646.041.052.12.052.162 0 .184-.231.386-.447.602-.646A5.471 5.471 0 0114.4 1C17.493 1 20 3.597 20 6.8c0 1.17-.335 2.26-.91 3.172-.177.28-.377.542-.596.786l-.01.01v.003l-.03.03a5.72 5.72 0 01-.336.336l-8.047 8.048z" fill="#27251F"></path></svg>
                              </button>
                            </div>
                          </div>
                          <div class="product-loop-body">
                            <h3 class="product-loop-title"><a href="${item.url}" title="${item.title}">${item.title}</a></h3>
                          </div>
                        </div>
                      </div>`;
									}
                else if (template == 'customers[account].wishlist' && count_wishlist <= 19) {
                  var html_loop = `<div class="product-loop">` + PDR.Global.renderLoop(item,(i + 1)) + `</div>`;
                }
                
                $('.js-render-wishlist').append(html_loop);
                count_wishlist++;
              }
            });
            PDR.Wishlist.renderFavorites();
            if(count_wishlist == 0) $('.js-render-wishlist').html('<div class="empty">Bạn chưa có sản phẩm yêu thích nào trong danh sách!</div>');
          });
          
					/*
            $.get(url_get).done(function(data){
						if(data.total > 0){
							if(data.products.length > 0){
								$('.js-render-wishlist').html('');
								data.products.map((item,ind) => {
									if(template == 'customers[account]'){
										var html_loop = `<div class="product-loop small-loop">
																		<div class="product-loop-wrap">
																			<div class="product-loop-head">
																				<div class="product-loop-img">
																					<picture class="has-hover">
																						<source data-srcset="${Haravan.resizeImage(item.featured_image,'medium')}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" media="(min-width: 768px)">
																						<source data-srcset="${Haravan.resizeImage(item.featured_image,'medium')}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" media="(max-width: 767px)">
																						<img class="lazyload img-default" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" data-src="${Haravan.resizeImage(item.featured_image,'medium')}" alt="${item.title}">
																					</picture>
																				</div>
																				<a href="${item.url}" class="product-loop-link"></a>
																				<div class="product-loop-wishlist">
																					<button type="button" class="btn-wishlist js-wishlist" data-type="wishlist" data-title="${item.title}" data-handle="${item.handle}" data-id="${item.id}" data-price="${Haravan.formatMoney(item.hasOwnProperty('url') ? item.variants[0].price : item.variants[0].price ,shop.moneyFormat)}">
																						<svg class="ic-heart filled" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" width="20" height="20"><path d="M1.546 10.801c.107.117.22.23.336.337l8.047 8.047a.1.1 0 00.142 0l8.047-8.048a5.72 5.72 0 00.336-.336l.03-.03v-.003l.01-.01c.22-.244.419-.507.595-.786A5.925 5.925 0 0020 6.8C20 3.597 17.493 1 14.4 1a5.471 5.471 0 00-3.717 1.462 5.755 5.755 0 00-.602.646.103.103 0 01-.162 0 5.75 5.75 0 00-.602-.646A5.471 5.471 0 005.6 1C2.507 1 0 3.597 0 6.8c0 1.17.335 2.26.91 3.172.177.28.377.543.597.786l.009.01v.002l.03.031z" fill="#27251F"></path></svg>
																						<svg class="ic-heart" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" width="20" height="20"><path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M17.426 10.415l.015-.014c.096-.088.188-.18.277-.277l.014-.015.01-.012A4.893 4.893 0 0019 6.8C19 4.116 16.908 2 14.4 2c-1.451 0-2.755.702-3.604 1.818l-.716.94a.1.1 0 01-.16 0l-.716-.94C8.354 2.702 7.051 2 5.6 2 3.092 2 1 4.116 1 6.8c0 1.282.48 2.44 1.257 3.297l.013.014.012.013c.089.096.181.19.277.278l.016.014 7.354 7.354a.1.1 0 00.142 0l7.355-7.354zm-7.355 8.77a.1.1 0 01-.142 0l-8.047-8.047a5.763 5.763 0 01-.336-.337l-.03-.03v-.002l-.01-.011a5.802 5.802 0 01-.595-.786A5.922 5.922 0 010 6.8C0 3.597 2.507 1 5.6 1a5.47 5.47 0 013.717 1.462c.216.199.418.415.602.646.041.052.12.052.162 0 .184-.231.386-.447.602-.646A5.471 5.471 0 0114.4 1C17.493 1 20 3.597 20 6.8c0 1.17-.335 2.26-.91 3.172-.177.28-.377.542-.596.786l-.01.01v.003l-.03.03a5.72 5.72 0 01-.336.336l-8.047 8.048z" fill="#27251F"></path></svg>
																					</button>
																				</div>
																			</div>
																			<div class="product-loop-body">
																				<h3 class="product-loop-title"><a href="${item.url}" title="${item.title}">${item.title}</a></h3>
																			</div>
																		</div>
																	 </div>`;
									}
									else if (template == 'customers[account].wishlist') {
										var html_loop = `<div class="product-loop">` + PDR.Global.renderLoop(item,(ind + 1)) + `</div>`;
									}
									$('.js-render-wishlist').append(html_loop);
								});
								PDR.Wishlist.renderFavorites();
							}
							else{
								$('.js-render-wishlist').html('<div class="empty">Bạn chưa có sản phẩm yêu thích nào trong danh sách!</div>');
							}
						}
						else {
							$('.js-render-wishlist').html('<div class="empty">Bạn chưa có sản phẩm yêu thích nào trong danh sách!</div>');
						}
					});
          */
				}
				else {
					$('.js-render-wishlist').html('<div class="empty">Bạn chưa có sản phẩm yêu thích nào trong danh sách!</div>');
				}
			}
			else {
				$('.js-render-wishlist').html('<div class="empty">Bạn chưa có sản phẩm yêu thích nào trong danh sách!</div>');
			}
		}
		catch(err){}
	},
}
PDR.Init = function(){
	PDR.Global.init();
}

$(document).ready(function(){
	PDR.Init();
})







		





