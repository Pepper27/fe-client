var PAN = {};
var idsAdd = [];
idsAdd.push(1146331956);
idsAdd.push(1146776915);
idsAdd.push(1146777540);
idsAdd.push(1146777673);
window.productObj = {};
if(shop.template == 'product'){
  productObj = data_main;
}
PAN.Print = {
  idsList: idsAdd,
  currentIdsAdd: 0,
  pictureFront: '',
  pictureBack: '',
  blobFront: '',
  blobBack: '',
  dataProduct: productObj,
  init: function(){
    var that = this;
    that.toggleBtnFrontBack();
    that.tabIconTextToggle();
    that.tabIconTextZodiac();
    that.fontStyleChange();
    that.iconSymbolsChange();
    that.itemZodiac();
    that.actionCanvasFront();
    that.actionCanvasBack();
    that.captureFrontBack();
    that.actionEngravingSidebar();
    that.addCaptureToCart();
    that.btnShowSidebarEngraving();
    that.sliderZodiac();
    that.editInCart();
    that.openKeyboardMobile();
  },
  openKeyboardMobile: function(){
    $(document).on("click", "#myCanvas-front, #myCanvas-back", function () {
      var wnds = $(window).width();
      if(wnds < 992){
        let input = $("#hidden-input");
        input.css({
          top: $(window).scrollTop() + 50 + "px",
          left: "50%"
        });
        input.focus();
      }
    });
    $("#hidden-input").on("blur", function () {
      $(this).css({ top: "-9999px" });
    });
  },
  checkAndPickRandomId: function(callback){
    var self = this;
    var ids = self.idsList;
		fetch('/cart.js')
		.then(response => response.json())
		.then(cart => {
			var existingIds = cart.items.map(item => item.variant_id);
			var selectedId = ids.find(id => !existingIds.includes(id));
			if (selectedId) {
				console.log('Found next available ID:', selectedId);
        self.currentIdsAdd = selectedId;
			} else {
				console.log('All IDs are already in cart');
			}
      if(typeof callback === "function"){
        return callback();
      }
		})
		.catch(error => console.error('Error fetching cart:', error));
  },
  sliderZodiac: function(){
		var swiper = new Swiper(".swiper-engraving", {
			loop: true,
			slidesPerView: 1,
			spaceBetween: 1,
			autoplay: {
				delay: 3000,
			},
			navigation: {
				nextEl: ".swiper-engraving .swiper-next",
				prevEl: ".swiper-engraving .swiper-prev",
			},
			pagination: {
				el: '.group-image .swiper-pagination',
				type: 'bullets',
				clickable: true
			},
		});
	},
  editInCart: function(){
    var self = this;
    $(document).on('click', '.edit-capture', function(e){
      e.preventDefault();
      var handle = $(this).attr('data-handle');
      var variantId = $(this).attr('data-variant-id');
      $('#addtocart-engraving').addClass('edit-engraving').attr('data-variant-id',variantId);
      self.getEditEngraving(handle, function(){
        self.setDataOpenSidebar();
      });
    });
  },
  getEditEngraving: function(handle, callback){
    var self = this;
    $.get('/products/' + handle + '.js', function(data){
      self.dataProduct = data;
      if(typeof callback === "function"){
        return callback();
      }
    });
  },
  toggleShow: function(){
    $('body').addClass('open-engraving');
  },
  setDataOpenSidebar: function(){
    var self = this;
    var data = self.dataProduct;
    var checkFront = data.tags.filter(tag => tag.indexOf('front:') != -1);
    var checkBack = data.tags.filter(tag => tag.indexOf('back:') != -1);
    var special = data.tags.filter(tag => tag.indexOf('Vòng đặc biệt') != -1);
    var indexFront = 1, indexBack = 1;
    if(checkFront.length > 0){
      indexFront = parseInt(checkFront[0].split(':')[1]) - 1;
      $('.tab-front-back .item-tab[data-tab="front"]').removeClass('no-engraving');
    }
    else {
      indexFront = 0;
      $('.tab-front-back .item-tab[data-tab="front"]').addClass('no-engraving');
      self.faceNoPrint('front');
    }
    if(checkBack.length > 0){
      indexBack = parseInt(checkBack[0].split(':')[1]) - 1;
      $('.tab-front-back .item-tab[data-tab="back"]').removeClass('no-engraving');
    }
    else {
      indexBack = 0;
      $('.tab-front-back .item-tab[data-tab="back"]').addClass('no-engraving');
    }
    if(special.length > 0){
      $('.face-print').addClass('special-draw');
    }
    else {
      $('.face-print').removeClass('special-draw');
    }
    var imgFront = data.images[indexFront];
    var imgBack = data.images[indexBack];
    $('#image-front').attr('src', imgFront);
    $('#image-back').attr('src', imgBack);
    self.toggleShow();
  },
  btnShowSidebarEngraving: function(){
    var self = this;
    $('#btn-Engraving').click(function(){
      self.setDataOpenSidebar();
    });
  },
  drawIamgeToggle: function(is){
    if(is){
      $('.face-print').addClass('just-draw-image');
    }
    else {
      $('.face-print').removeClass('just-draw-image');
    }
  },
  clearCursorCanvas: function(){
    var self = this;
    clearInterval(self.cursorIntervalFront);
    clearInterval(self.cursorIntervalBack);
  },
  toggleClassPrintCanvas: function(is){
    if(is){
      $('.face-print').addClass('processing'); 
    }
    else {
      $('.face-print').removeClass('processing');
    }
  },
  actionEngravingSidebar: function(){
    $('.mask-overlay-engraving, .close-engraving').click(function(){
      $('body').removeClass('open-engraving').removeClass('open-engraving-review');
    });
    $('.back-engraving').click(function(){
      $('body').removeClass('open-engraving-review').addClass('open-engraving');
    });
    $('.sidebar-engraving .close-sidebar').click(function(){
      $('body').removeClass('open-engraving')
    });
    $('#sidebar-engraving .close-sidebar').click(function(){
      $('body').removeClass('open-engraving')
    });
    $('#sidebar-engraving-review .close-sidebar').click(function(){
      $('body').removeClass('open-engraving-review')
    });
    $('#capture-btn-review').click(function(){
      $('body').removeClass('open-engraving').addClass('open-engraving-review');
    });
  },
  generateRandomName: function (first) {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomStr = "";
    for (let i = 0; i < 6; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    let timestamp = Date.now();
    return first + "_" + timestamp + "_" + randomStr;
  },
  addCaptureToCart: function(){
    var self = this;
    $('#addtocart-engraving').click(function(){
      var $this = $(this);
      var check = $('input[name="acept-engraving"]:checked');
      if(check.length == 0){
        $('.notify-choose-size').addClass('active');
      }
      else {
        $('.notify-choose-size').removeClass('active');
        var isEdit = ($this.hasClass('edit-engraving') ? true : false);
        if(isEdit){
          self.checkEdit(function(){
            var idEdit = $this.attr('data-variant-id');
            self.addCartProdPrint(idEdit);
          });
        }
        else {
          self.addCartProdPrint();
        }
      }
    });
  },
  dataSaveFront: '',
  dataSaveBack: '',
  dataFromPrintTextFront: function(){
    const canvas = document.getElementById("myCanvas-front");
    const elements = Array.from(canvas.children);
    const result = elements.map(el => {
      if (el.tagName === "DIV") {
          return el.textContent;
      } else if (el.tagName === "IMG") {
          return el.alt;
      }
      return null;
    }).filter(item => item !== null);
    return result;
  },
  saveAttributes: function(){
    var self = this;
    var font = '';
    var text = [];
    var fontsize = 0;
    var drawImage = '';
    if($('.item-type.active[data-tab="text"]').length > 0){
      font = $('.js-font-change.active').attr('data-attr-value');
      text = self.dataFromPrintTextFront();
      fontsize = $('.face-print.active input[type="range"]').val();
      return 'Font: ' + font + ' |_| Thông điệp: ' + text.join('+') + ' |_| Size: ' + fontsize;
    }
    else {
      drawImage = $('.face-print.active .draw-image img').attr('alt');
      return 'Biểu tượng: ' + drawImage;
    }
    return null;
  },
  checkEdit: function(callback){
    var clearPrintProd = {};
    var idEdit = $('#addtocart-engraving').attr('data-variant-id');
    clearPrintProd[idEdit] = 0;
    $.ajax({
      type: 'POST',
      url: '/cart/update.js',
      data: {updates: clearPrintProd},
      async: false,
      success: function(result){
        if(typeof callback == "function"){
          return callback();
        }
      }
    }); 
  },
  btnAddCartDetail: function(callback){
    $('#mainLoading').addClass('active');
    $('#btn-addtocart').addClass('loading');
    var quantity = parseInt($('.product-layout .input-quantity').val());
    var id  = PDR.Product.current_variant.id;
    let sku = PDR.Product.current_variant.sku;
    var tagCTKM = $('#btn-addtocart').attr('data-ctkm');
    var tagCTKM2 = $('#btn-addtocart').attr('data-ctkm-2');
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
        if(typeof callback === "function"){
          return callback();
        }
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
  },
  addCartProdPrint: function(editId){
    var self = this;
    var data = self.dataProduct;
    self.btnAddCartDetail(function(){
      self.checkAndPickRandomId(function(){
        var idAddNew = self.currentIdsAdd;
        if(editId != undefined){
          idAddNew = editId;
        }
        let formData = new FormData();
        formData.append("id", idAddNew);
        formData.append("quantity", 1);
        var frontName = self.generateRandomName("front_captured");
        var backName = self.generateRandomName("back_captured");
        if(self.blobFront != ''){
          formData.append("properties[front_capture]", self.blobFront, frontName + ".png");
          formData.append("properties[front_capture_data]", self.dataSaveFront);
        }
        if(self.blobBack != ''){
          formData.append("properties[back_capture]", self.blobBack, backName + ".png");
          formData.append("properties[back_capture_data]", self.dataSaveBack);
        }
        formData.append("properties[product_handle]", data.handle);
        fetch("/cart/add.js", {
          method: "POST",
          body: formData
        })
        .then(response => response.json())
        .then(result => {
          PDR.Global.cartAjax(function(){
            PDR.Helper.getMiniCart();
            $('#mainLoading').removeClass('active');
            $('body').removeClass('open-engraving').removeClass('open-engraving-review');
            $('#btn-addtocart').addClass('added');
            $('#btn-addtocart').removeClass('loading');
            setTimeout(function(){
              $('#btn-addtocart').removeClass('added');    
            },3000);
          },);
        })
        .catch(error => {
          PDR.Global.cartAjax(function(){
            PDR.Helper.getMiniCart();
            $('#mainLoading').removeClass('active');
            $('body').removeClass('open-engraving').removeClass('open-engraving-review');
            $('#btn-addtocart').addClass('added');
            $('#btn-addtocart').removeClass('loading');
            setTimeout(function(){
              $('#btn-addtocart').removeClass('added');
            },3000);
          },);
        });
      });
    });
  },
  captureFrontBack: function(){
    var self = this;
		$(document).on('click', '#capture-btn-save', function(){
      self.toggleClassPrintCanvas(true);
      self.clearCursorCanvas();
			var option = {
				imageTimeout: 30000,
				useCORS: true,
        allowTaint: true
			}
      if($('.tab-front-back .item-tab.active[data-tab="front"]').length > 0){
        html2canvas(document.querySelector("#canvas-capture-front"), option).then(canvas => {
  				var data = canvas.toDataURL('image/png');
  				var image = new Image();
  				image.src = data;
          $('.img-front-review img').remove();
  				document.querySelector('.img-front-review').appendChild(image);
          self.toggleClassPrintCanvas(false);

          canvas.toBlob(blob => {
            self.blobFront = blob;
          }, "image/png");

          $('.item-review-engraving[data-review="front"]').addClass('active');
          self.dataSaveFront = self.saveAttributes();
          
        });
      }
      if($('.tab-front-back .item-tab.active[data-tab="back"]').length > 0){
        html2canvas(document.querySelector("#canvas-capture-back"), option).then(canvas => {
  				var data = canvas.toDataURL('image/png');
  				var image = new Image();
  				image.src = data;
          $('.img-back-review img').remove();
  				document.querySelector('.img-back-review').appendChild(image);
          self.toggleClassPrintCanvas(false);

          canvas.toBlob(blob => {
            self.blobBack = blob;
          }, "image/png");

          $('.item-review-engraving[data-review="back"]').addClass('active');
          self.dataSaveBack = self.saveAttributes();
          
        });
      }
      $('body').removeClass('open-engraving').addClass('open-engraving-review');
		});
  },
  isCursorActiveFront: false,
  cursorIntervalFront: '',
  actionCanvasFront: function(){
    var self = this;
    var elements = [];
    var isCursorActive = false;
    var selectedIcon = null;
    var sizeDefault = 65;
    var lastElement = '';

    function checkOverflow(element) {
      let container = $("#myCanvas-front")[0].getBoundingClientRect();
      let el = element.getBoundingClientRect();
      return (
        el.left < container.left || 
        el.top < container.top || 
        el.right > container.right || 
        el.bottom > container.bottom
      );
    }
    function detectOverflowElements() {
      let overflowItems = [];
      $("#myCanvas-front").children().each(function () {
        if (checkOverflow(this)) {
          overflowItems.push(this);
        }
      });
      if (overflowItems.length > 0) {
        showWarning("Vượt quá kích thước cho phép");
      }
    }
    function adjustSizeIfOverflow() {
      let container = $("#myCanvas-front")[0];
      let containerRect = container.getBoundingClientRect();
      // Lấy max-height nếu có
      let computedStyle = window.getComputedStyle(container);
      let maxHeight = parseFloat(computedStyle.maxHeight);
      let actualHeight = containerRect.height;
      if (!isNaN(maxHeight) && actualHeight > maxHeight) {
        actualHeight = maxHeight; // Giới hạn chiều cao container
      }
      let maxWidth = containerRect.width;
      let overflow = false;
    
      // Kiểm tra từng phần tử con có tràn không
      $("#myCanvas-front").children().each(function () {
        let el = this.getBoundingClientRect();
        if (el.right > containerRect.right || el.bottom > (containerRect.top + actualHeight)) {
          overflow = true;
        }
      });
      if (overflow) {
        let currentSize = parseFloat($(".slider-ranger-size-front input").val());
        // Tính scale factor để tất cả phần tử vừa với container
        let scaleFactor = Math.min(
            maxWidth / container.scrollWidth,
            actualHeight / container.scrollHeight
        );
        // Giới hạn scale factor tránh giảm quá nhỏ
        scaleFactor = Math.max(scaleFactor, 0.5);
        let newSize = Math.floor(currentSize * scaleFactor);
        $(".slider-ranger-size-front input").val(newSize);
        sizeDefault = newSize;
        // Cập nhật kích thước text & ảnh
        $("#myCanvas-front .text-item").css("font-size", newSize + "px");
        $("#myCanvas-front .image-item").css({ width: newSize + "px", height: newSize + "px" });
      }
      detectOverflowElements();
    }
    
    $('.slider-ranger-size-front input').change(function(){
      var $this = $(this);
      sizeDefault = parseInt($this.val());
      $('.slider-ranger-size-front span').html($this.val() + 'px');
      renderElements();
    });
    
    $(".slider-ranger-size-front input").on("input", function () {
      var $this = $(this);
      sizeDefault = parseInt($this.val());
      $('.slider-ranger-size-front span').html($this.val() + 'px');
      renderElements();
    });

    function renderElements() {
      $("#myCanvas-front").empty();
      var font = $('.js-font-change.active').attr('data-attr-value');
      elements.forEach(el => {
        if (el.type === "image") {
          $("#myCanvas-front").append(`<img alt="${el.alt}" src="${el.value}" class="image-item" style="width: ${sizeDefault}px;">`);
          adjustSizeIfOverflow();
        } 
        else if (el.type === "text") {
          $("#myCanvas-front").append(`<div class="text-item" style="font-size: ${sizeDefault}px;">${el.value}</div>`);
          adjustSizeIfOverflow();
        }
        else if (el.type === "space") {
          $("#myCanvas-front").append(`<div class="text-item text-item-space" style="font-size: ${sizeDefault}px;">${el.value}</div>`);
          adjustSizeIfOverflow();
        }
        else if (el.type === "enter") {
          $("#myCanvas-front").append(`<div class="text-item text-item-enter" style="font-size: ${sizeDefault}px;">${el.value}</div>`);
          adjustSizeIfOverflow();
        }
      });
    }
    
    function showWarning(message) {
      $("#warningMessage").text(message).fadeIn().delay(2000).fadeOut();
    }
    
    function checkElementOverflow(element) {
      if (element.type === "text") {
        var textWidth = ctx.measureText(element.value).width;
        if (element.x + textWidth > canvas.width || element.y > canvas.height) {
          return true;
        }
      } 
      else if (element.type === "icon") {
        if (element.x + sizeDefault > canvas.width || element.y + sizeDefault > canvas.height) {
          return true;
        }
      }
      return false;
    }
    
    $(document).on("keydown", function(event) {
      if($('#canvas-capture-front.active').length > 0 && $('.open-engraving').length > 0){
        if (event.key.length === 1) {
          let newElement = {
            type: event.key === " " ? "space" : "text",
            value: event.key === " " ? "\u00A0" : event.key,
            x: elements.length * 50,
            y: 100
          };
          elements.push(newElement);
          renderElements();
        } 
        else if (event.key === "Backspace" || event.key === "Delete") {
          elements.pop();
          renderElements();
        }
        else if (event.key === "Enter") {
          let newElement = {
            type: "enter",
            value: "\n",
            x: 0,
            y: elements.length * 30 + 100
          };
          elements.push(newElement);
          renderElements();
        }
      }
    });
    
    $(".js-btn-engraving-symbol").on("click", function() {
      if($('#canvas-capture-front.active').length > 0){

        let iconUrl = $(this).attr("data-svgurl");
        let iconAlt = $(this).attr("data-name");
        let newElement = {
          type: "image",
          value: iconUrl,
          x: elements.length * 50,
          y: 50,
          alt: iconAlt
        };
        elements.push(newElement);
        renderElements();

      }
    });

  },
  isCursorActiveBack: false,
  cursorIntervalBack: '',
  actionCanvasBack: function(){
    
    var self = this;
    var elements = [];
    var isCursorActive = false;
    var selectedIcon = null;
    var sizeDefault = 65;
    var lastElement = '';

    function checkOverflow(element) {
      let container = $("#myCanvas-back")[0].getBoundingClientRect();
      let el = element.getBoundingClientRect();
      return (
        el.left < container.left || 
        el.top < container.top || 
        el.right > container.right || 
        el.bottom > container.bottom
      );
    }
    function detectOverflowElements() {
      let overflowItems = [];
      $("#myCanvas-back").children().each(function () {
        if (checkOverflow(this)) {
          overflowItems.push(this);
        }
      });
      if (overflowItems.length > 0) {
        showWarning("Vượt quá kích thước cho phép");
      }
    }
    function adjustSizeIfOverflow() {
      let container = $("#myCanvas-back")[0];
      let containerRect = container.getBoundingClientRect();
      // Lấy max-height nếu có
      let computedStyle = window.getComputedStyle(container);
      let maxHeight = parseFloat(computedStyle.maxHeight);
      let actualHeight = containerRect.height;
      if (!isNaN(maxHeight) && actualHeight > maxHeight) {
          actualHeight = maxHeight; // Giới hạn chiều cao container
      }
      let maxWidth = containerRect.width;
      let overflow = false;
    
      // Kiểm tra từng phần tử con có tràn không
      $("#myCanvas-back").children().each(function () {
        let el = this.getBoundingClientRect();
        if (el.right > containerRect.right || el.bottom > (containerRect.top + actualHeight)) {
          overflow = true;
        }
      });
      if (overflow) {
        let currentSize = parseFloat($(".slider-ranger-size-back input").val());
        // Tính scale factor để tất cả phần tử vừa với container
        let scaleFactor = Math.min(
            maxWidth / container.scrollWidth,
            actualHeight / container.scrollHeight
        );
        // Giới hạn scale factor tránh giảm quá nhỏ
        scaleFactor = Math.max(scaleFactor, 0.5);
        let newSize = Math.floor(currentSize * scaleFactor);
        $(".slider-ranger-size-back input").val(newSize);
        sizeDefault = newSize;
        // Cập nhật kích thước text & ảnh
        $("#myCanvas-back .text-item").css("font-size", newSize + "px");
        $("#myCanvas-back .image-item").css({ width: newSize + "px", height: newSize + "px" });
      }
      detectOverflowElements();
    }
    
    $('.slider-ranger-size-back input').change(function(){
      var $this = $(this);
      sizeDefault = parseInt($this.val());
      $('.slider-ranger-size-back span').html($this.val() + 'px');
      renderElements();
    });
    
    $(".slider-ranger-size-back input").on("input", function () {
      var $this = $(this);
      sizeDefault = parseInt($this.val());
      $('.slider-ranger-size-back span').html($this.val() + 'px');
      renderElements();
    });

    function renderElements() {
      $("#myCanvas-back").empty();
      elements.forEach(el => {
        if (el.type === "image") {
          $("#myCanvas-back").append(`<img src="${el.value}" class="image-item" style="width: ${sizeDefault}px;">`);
          adjustSizeIfOverflow();
        } 
        else if (el.type === "text") {
          $("#myCanvas-back").append(`<div class="text-item" style="font-size: ${sizeDefault}px;">${el.value}</div>`);
          adjustSizeIfOverflow();
        }
        else if (el.type === "space") {
          $("#myCanvas-back").append(`<div class="text-item text-item-space" style="font-size: ${sizeDefault}px;">${el.value}</div>`);
          adjustSizeIfOverflow();
        }
        else if (el.type === "enter") {
          $("#myCanvas-back").append(`<div class="text-item text-item-enter" style="font-size: ${sizeDefault}px;">${el.value}</div>`);
          adjustSizeIfOverflow();
        }
      });
    }
    
    function showWarning(message) {
      $("#warningMessage").text(message).fadeIn().delay(2000).fadeOut();
    }
    
    function checkElementOverflow(element) {
      if (element.type === "text") {
        var textWidth = ctx.measureText(element.value).width;
        if (element.x + textWidth > canvas.width || element.y > canvas.height) {
          return true;
        }
      } 
      else if (element.type === "icon") {
        if (element.x + sizeDefault > canvas.width || element.y + sizeDefault > canvas.height) {
          return true;
        }
      }
      return false;
    }
    
    $(document).on("keydown", function(event) {
      if($('#canvas-capture-back.active').length > 0 && $('.open-engraving').length > 0){
        if (event.key.length === 1) {
          let newElement = {
            type: event.key === " " ? "space" : "text",
            value: event.key === " " ? "\u00A0" : event.key,
            x: elements.length * 50,
            y: 100
          };
          elements.push(newElement);
          renderElements();
        } 
        else if (event.key === "Backspace" || event.key === "Delete") {
          elements.pop();
          renderElements();
        }
        else if (event.key === "Enter") {
          let newElement = {
            type: "enter",
            value: "\n",
            x: 0,
            y: elements.length * 30 + 100
          };
          elements.push(newElement);
          renderElements();
        }
      }
    });
    
    $(".js-btn-engraving-symbol").on("click", function() {
      if($('#canvas-capture-back.active').length > 0){

        let iconUrl = $(this).attr("data-svgurl");
        let iconAlt = $(this).attr("data-name");
        let newElement = {
          type: "image",
          value: iconUrl,
          x: elements.length * 50,
          y: 50,
          alt: iconAlt
        };
        elements.push(newElement);
        renderElements();

      }
    });
    
  },
  itemZodiac: function(){
    $(document).on('click', '.swiper-engraving .item-icon', function(){
      $('.swiper-engraving .item-icon').removeClass('active');
      $(this).addClass('active');
      var img = $(this).find('img').clone();
      $('.face-print.active .draw-image').html(img);
    });
  },
  iconSymbolsChange: function(){
    $('.engraving-symbols-nav').click(function () {
      var type = $(this).attr('data-category');
      $('.engraving-symbols-nav').removeClass('selected');
      $('.engraving-symbols-nav[data-category="' + type + '"]').addClass('selected');
      var targetSection = ".section-" + type;
      var scrollTopValue = 0;
      $(targetSection).prevAll().each(function () {
          scrollTopValue += $(this).outerHeight() + Number($(this).data("gap-y") || 0);
      });
      $(".js-icons-vertical-carousel").animate({ scrollTop: scrollTopValue }, 400);
    });
    document.addEventListener("scroll", function (event) {
      try {
        if (event.target.classList.contains("js-icons-vertical-carousel")) {
          var activeTitle = getActiveTitle();
          if (activeTitle) {
            var category = activeTitle.classList[1].split("-")[1];
            updateTabSelection(category);
          }
        }
      }
      catch (err){
        
      }
    }, true);
    function getActiveTitle() {
      var tabCarousel = $(".js-icons-tabs-carousel");
      var verticalCarousel = $(".js-icons-vertical-carousel");
      var tabBottom = tabCarousel.position().top + tabCarousel.outerHeight();
      var visibleBottom = tabBottom + verticalCarousel.outerHeight();
      var activeElement = null;
      var closestTop = Number.MAX_VALUE;
      $(".engraving-symbols-content-title").each(function () {
        var topPosition = $(this).position().top;
        if (topPosition > tabBottom && topPosition < closestTop && topPosition < visibleBottom) {
          closestTop = topPosition;
          activeElement = this;
        }
      });
      return activeElement;
    }

    function updateTabSelection(category) {
      var targetNav = document.querySelector(".engraving-symbols-nav." + category);
      var tabContainer = document.querySelector(".js-icons-tabs-carousel");
      if (targetNav) {
        var scrollLeftValue = 20;
        $(targetNav).prevAll().each(function () {
            scrollLeftValue += $(this).outerWidth() + Number($(this).data("gap-x") || 0);
        });
        var centerScroll = scrollLeftValue - (tabContainer.offsetWidth - targetNav.offsetWidth) / 2;
        $(tabContainer).scrollLeft(0).scrollLeft(centerScroll);
        $(".engraving-symbols-nav").removeClass("selected");
        $(targetNav).addClass("selected");
      }
    }
  },
  fontStyleChange: function(){
    $('.js-font-change').click(function(){
      var font = $(this).attr('data-attr-value');
      $('.js-font-change[data-attr-value="'+font+'"]').addClass('active');
      $('.js-font-change[data-attr-value!="'+font+'"]').removeClass('active');
      $('.face-print').attr('data-font', font);
    });
  },
  toggleBtnFrontBack: function(){
    var self = this;
    $('.tab-front-back .item-tab').click(function(){
      var tab = $(this).attr('data-tab');
      $('.tab-front-back .item-tab[data-tab="'+tab+'"]').addClass('active');
      $('.tab-front-back .item-tab[data-tab!="'+tab+'"]').removeClass('active');
      if(tab == 'front'){
        $('#canvas-capture-front').addClass('active');
        $('#canvas-capture-back').removeClass('active');
      }
      else {
        $('#canvas-capture-front').removeClass('active');
        $('#canvas-capture-back').addClass('active');
      }
      if($(this).hasClass('no-engraving')){ 
        self.faceNoPrint(tab);
      }
      else {
        self.faceNoPrint();
      }
    });
  },
  faceNoPrint: function(face){
    if(face != undefined){
      $('.face-print[data-face="'+face+'"]').addClass('no-print');
      $('.type-engraving').addClass('d-none');
      $('.group-optional').addClass('d-none');
      $('.engraving-one-side-note').removeClass('d-none');
    }
    else {
      $('.type-engraving').removeClass('d-none');
      $('.group-optional').removeClass('d-none');
      $('.engraving-one-side-note').addClass('d-none');
    }
  },
  tabIconTextToggle: function(){
    $('.btn-tab-type').click(function(){
      var tab = $(this).attr('data-tab-type');
      $('.btn-tab-type[data-tab-type="'+tab+'"]').addClass('active');
      $('.btn-tab-type[data-tab-type!="'+tab+'"]').removeClass('active');
      $('.content-small-tab .item-content-tab[data-tab-type="'+tab+'"]').addClass('active');
      $('.content-small-tab .item-content-tab[data-tab-type!="'+tab+'"]').removeClass('active');
    });
  },
  tabIconTextZodiac: function(){
    var self = this;
    $('.type-engraving .item-type').click(function(){
      var tab = $(this).attr('data-tab');
      $('.type-engraving .item-type[data-tab="'+tab+'"]').addClass('active');
      $('.type-engraving .item-type[data-tab!="'+tab+'"]').removeClass('active');
      $('.group-type[data-tab="'+tab+'"]').addClass('active');
      $('.group-type[data-tab!="'+tab+'"]').removeClass('active');
      if(tab == "image"){
        self.drawIamgeToggle(true);
      }
      else {
        self.drawIamgeToggle(false);
      }
    });
  }
}
$(document).ready(function(){
  PAN.Print.init();
});