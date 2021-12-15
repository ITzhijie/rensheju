$(function () {

	app.init();
})


var app = {


	init: function () {
		this.setCurNav();//设置导航高亮
		bsCustomFileInput.init();//初始化上传框插件
		// this.deleteConfirm();//删除二次确认
		this.resizeIframe();
		// this.getNoRead();
		// setInterval(function () {
		// 	app.getNoRead();

		// },360000)
	},
	resizeIframe: function () {
		var heights = document.documentElement.clientHeight - 65;
		console.log(heights);
		$("#iframBox").height(heights);
		// document.getElementById('iframBox').height = heights;
	},
	//删除按钮确认
	deleteConfirm: function (url) {


		Swal.fire({
			title: '确定删除吗?',
			text: "",
			icon: 'question',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: '确定',
			cancelButtonText: '取消',
            reverseButtons:true
		  }).then(function(result){
			if (result.value) {
			  window.location.href=url;
			}
		  })


	},
	getNoRead:function () {
		$.post('/admin/getNoRead?_csrf=' + csrf,function(res){
			console.log(res);
			if (res.code==0) {
				$("a").each(function(){
					if ($(this).attr("href")=='/admin/application/transfer') {
						if(res.transferNo!=0){
							$(this).find("span").html(res.transferNo);
						}
					}
					if ($(this).attr("href")=='/admin/application/certify') {
						if(res.transferNo!=0){
							$(this).find("span").html(res.certifyNo);
						}
					}
				})
			}
		})
	},
	fileChange: function (inputid, preid, formid, valueid, num) {
		$('body').on("change", "#" + inputid,function (e) {
			var supportedTypes = ['image/jpg', 'image/jpeg', 'image/png','video/mp4','video/avi','video/rmvb'];

			console.log(e.target.files);
			var files = e.target.files;
			if (files.length > num) {
				Swal.fire({
					title: 'Error!',
					text: "最多只能选择" + num + "张图片",
					icon: 'error',
					confirmButtonText: '好的'
				})
				return
			}
			if (files.length ==0) {
				return
			}

			for (let i = 0; i < files.length; i++) {
				if (supportedTypes.indexOf(files[i].type) < 0 || files[i].size >= 10485760) {
					Swal.fire({
						title: 'Error!',
						text: "文件格式只支持：jpg、jpeg、png、mp4、avi和rmvb且文件大小小于10M",
						icon: 'error',
						confirmButtonText: '好的'
					})
					return
				}

			}

			var file = e.target.files[0];
			console.log(file.size);
			// $("#" + preid).attr("src", URL.createObjectURL(file))
			var form = $("#" + formid);
			var formData = new FormData(form[0]);
			console.log(formData);
			$.ajax({
				type: 'POST',
				url: '/admin/uploadImg?_csrf=' + csrf,
				data: formData,
				// 告诉jQuery不要去处理发送的数据
				processData: false,
				// 告诉jQuery不要去设置Content-Type请求头
				contentType: false,
				dataType: 'json',
				success: function (data) {
					console.log(data);
					if (data.code == 0) {
						$("#" + valueid).val(data.filepath);
						console.log(data.filepath);
						var pathArr=data.filepath.split(",");
						console.log(pathArr);
						if (num==1) {
							$("#" + preid).attr("src",data.filepath);
						}else{
							var htmlStr='<input class="fileImg" type="file" id="'+inputid+'" multiple name="myfile">';
							for (let k = 0; k < pathArr.length; k++) {
								var str='<div class="fileImgBox">'
								+'<img class="previewImg" id="'+preid+'" src="'+pathArr[k]+'">'
								+'</div>';
								htmlStr+=str;
							}
							if (pathArr.length<num) {
								htmlStr+='<div class="fileImgBox">'
								+'<img class="previewImg" id="'+preid+'" src="/public/admin/images/add.png">'
								+'</div>';
							}
							$("#"+formid).html(htmlStr);
						}


					}
				},
				error: function (err) {
					Swal.fire({
						title: 'Error!',
						text: '网络原因，上传失败',
						icon: 'error',
						confirmButtonText: '好的'
					})
				}
			});

		})
	},
	videoFileChange: function (inputid, formid, valueid) {
		$('body').on("change", "#" + inputid,function (e) {
			var supportedTypes = ['video/mp4','video/avi','video/rmvb'];

			console.log(e.target.files);
			var files = e.target.files;

			if (files.length ==0) {
				return
			}

			for (let i = 0; i < files.length; i++) {
				if (supportedTypes.indexOf(files[i].type) < 0 || files[i].size >= 10485760) {
					Swal.fire({
						title: 'Error!',
						text: "文件格式只支持：mp4、avi和rmvb且文件大小小于10M",
						icon: 'error',
						confirmButtonText: '好的'
					})
					return
				}

			}

			var file = e.target.files[0];
			console.log(file.size);
			// $("#" + preid).attr("src", URL.createObjectURL(file))
			var form = $("#" + formid);
			var formData = new FormData(form[0]);
			console.log(formData);
			$.ajax({
				type: 'POST',
				url: '/admin/uploadImg?_csrf=' + csrf,
				data: formData,
				// 告诉jQuery不要去处理发送的数据
				processData: false,
				// 告诉jQuery不要去设置Content-Type请求头
				contentType: false,
				dataType: 'json',
				success: function (data) {
					console.log(data);
					if (data.code == 0) {
						$("#" + valueid).val(data.filepath);
					}
				},
				error: function (err) {
					Swal.fire({
						title: 'Error!',
						text: '网络原因，上传失败',
						icon: 'error',
						confirmButtonText: '好的'
					})
				}
			});

		})
	},
	//设置当前导航高亮 curPathname从layout页面带过来
	setCurNav: function () {
		$(".nav-treeview a").on("click", function (params) {
			$(".nav-treeview a").removeClass("active");
			$(".has-treeview>a").removeClass("active");
			$(this).addClass("active");
			$(this).parents(".nav-treeview").siblings(".nav-link").addClass("active");
		})
		// $(".nav-treeview a").each(function (i, v) {
		// 	if ($(this).attr("href") == curPathname) {
		// 		$(this).addClass("active");
		// 		$(this).parents(".nav-treeview").siblings(".nav-link").addClass("active");
		// 		// $(this).parents(".nav-item").addClass("menu-open");
		// 	}

		// })
	},

	//改变状态
	changeStatus: function (el, model, attr, id) {
		$.get('/admin/changeStatus', { model: model, attr: attr, id: id }, function (data) {
			if (data.success) {
				console.log($(el).hasClass("fa-check"));
				if ($(el).hasClass("fa-check")) {
					$(el).removeClass("fa-check").removeClass("text-success").addClass("fa-ban").addClass("text-danger");
				} else {
					$(el).removeClass("fa-ban").removeClass("text-danger").addClass("fa-check").addClass("text-success");

				}
			}

		})
	},
	editNum: function (el, model, attr, id) {

		var val = $(el).html();

		var input = $("<input style='display:inline-block;width:80px;height:30px;' value='' />");

		//把input放在sapn里面
		$(el).html(input);

		//让input获取焦点  给input赋值
		$(input).trigger('focus').val(val);
		//点击input的时候阻止冒泡
		$(input).click(function () {

			return false;
		})
		//鼠标离开的时候给sapn赋值
		$(input).blur(function () {

			var num = $(this).val();

			$(el).html(num);

			$.get('/admin/editNum', { model: model, attr: attr, id: id, num: num }, function (data) {
				console.log(data);
				window.location.reload();
			})
			
		})
	}
}

$(window).resize(function () {

	app.resizeIframe();
})