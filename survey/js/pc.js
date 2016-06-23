$(function(){
	var nowPage=0;
	var totlePage=$(".page").length-1;
	//页面滚动
	$('.mousewheel').bind('mousewheel', function(event, delta, deltaX, deltaY) {
		if (delta==-1 && nowPage<totlePage) {
			next();
		}else if(delta==1 && nowPage>0){
			prev();
		}
		
		if(nowPage>0){
			$(".go").removeClass("start_go");
		}else{
			$(".go").addClass("start_go");
		}
	});
	
	//点击切换
	$(".go").click(function(){
		if(nowPage<parseInt($(".page").size())-1){
			next();
		}
		
		if(nowPage>0){
			$(".go").removeClass("start_go");
		}else{
			$(".go").addClass("start_go");
		}
	})
	
	
	//切换到下一页
	function next(){
		nowPage++;
		$(".wrap").stop().animate({"top":-nowPage*100+"%"},300);
	}
	
	//切换到上一页
	function prev(){
		nowPage--;
		$(".wrap").stop().animate({"top":-nowPage*100+"%"},300);
	}
	
	$('.center_wrap').bind('mousewheel', function(event, delta, deltaX, deltaY) {
		var height=parseInt($(this).css("height"))-parseInt($(this).parent().css("height"));
		var top=parseInt($(this).css("top"));
		if(top>-height && deltaY<0){
			$(this).css("top",top+deltaY*50+"px");
		}
		
		if(top<0 && deltaY>0){
			$(this).css("top",top+deltaY*50+"px");
		}

		//console.log(top,height,deltaY,parseInt($(this).css("height")),parseInt($(this).parent().css("height")));
	});
	
	
	
	
	//表情
	$(".mood_icon").click(function(){
		$(".mood_icon").removeClass("mood_icon_selected");
		$(this).addClass("mood_icon_selected");
	});
	
	//心心
	$(".heart_icon").click(function(){
		$(".heart_icon").removeClass("heart_icon_selected");
		$(this).prevAll().addClass("heart_icon_selected");
		$(this).addClass("heart_icon_selected");
	});
	
	//满意程度
	$(".satisfaction_item").click(function(){
		$(".satisfaction_item").removeClass("satisfaction_item_select");
		$(this).addClass("satisfaction_item_select");
	});
	
	//拖动
	var pTop=parseInt($(".points_bar_handler").css("top"))+23;
	var long=parseInt($(".points_bar").css("height"))
	var number=parseInt(pTop/long*10);
	$(".points_num span").eq(number).addClass("points_num_select");
	
	var dragging=false;
	$("#drag").mousedown(function(e) { 
		dragging = true; 
		//iX = e.clientX - this.offsetLeft; 
		iY = e.clientY - this.offsetTop; 
		this.setCapture && this.setCapture(); 
		return false; 
	}); 
	
	document.onmousemove = function(e) { 
		if (dragging) { 
			var e = e || window.event; 
			//var oX = e.clientX - iX; 
			var oY = e.clientY - iY; 
			if(oY>0 && oY<long-24){
				$("#drag").css({"top":oY + "px"});
				pTop=oY;
				number=parseInt(pTop/long*10);
				$(".points_num span").removeClass("points_num_select");
				$(".points_num span").eq(number).addClass("points_num_select");
			}
			return false; 
		} 
	}; 
	
	
	$(document).mouseup(function(e) { 
		dragging = false; 
		
	}) 
	
	//输入框聚焦
	$(".dropdownInput input").click(function(){
		$(".dropdownInput_list").stop().animate({"opacity":1},100);
	})
	
	$(".dropdownInput_list li").click(function(){
		$(".dropdownInput_list li").removeClass("selected");									   
		$(this).addClass("selected");
        $(".dropdownInput input").val($(this).html());
		$(".dropdownInput_list").stop().animate({"opacity":0},100);
	})
	
	//输入框
	$("textarea").focus(function(){
		$(this).text("");
	});
	
	//音乐开关
	$(".music").click(function(){
		if($(this).hasClass("music_off")){
			$(this).removeClass("music_off");
		}else{
			$(this).addClass("music_off");
		}
	});

	
});