function requestBadge() {
	console.log('刷新角标...')
	var url = getHost() + "HomeTip.ashx?Commond=GetHandCountTip&tokenKey=" + window.localStorage.getItem(TokenKey);
	mui.ajax(url, {
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: TIMEOUT, //超时时间设置为10秒；
		headers: {
			'Content-Type': 'application/json'
		},
		success: function(data) {
			console.log("Badge：" + JSON.stringify(data));

			refreshBadge(data);
		},
		error: function(xhr, type, errorThrown) {
			console.log(getHttpErrorDesp(type));
		}
	});
}