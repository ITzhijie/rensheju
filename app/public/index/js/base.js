
var app={
    ajaxPost:function(url,param,cb){
		$.ajax({
            type: "post", //方法类型
            dataType: "json", //预期服务器返回的数据类型
            url: url+"?_csrf="+csrf, //url
            data: param,
            async: false,
            timeout: 90000,
            success: function (res) {
                cb(res)
            },
            error: function (err) {
				alert(JSON.stringify(err));
            },
        });
	},
    fileChange: function (inputid, preid, formid, valueid, num) {
		$('body').on("change", "#" + inputid,function (e) {
			var supportedTypes = ['image/jpg', 'image/jpeg', 'image/png'];

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
				if (supportedTypes.indexOf(files[i].type) < 0 || files[i].size >= 3145728) {
					Swal.fire({
						title: 'Error!',
						text: "文件格式只支持：jpg、jpeg、png,且文件大小小于3M",
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
				url: '/home/uploadImg?_csrf=' + csrf,
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
}