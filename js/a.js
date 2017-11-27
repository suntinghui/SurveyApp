<script type="text/javascript" src="../js/constants.js"></script>
		<script type="text/javascript" src="../js/util.js"></script>
		<script type="text/javascript" src="../js/survey.js"></script>

<script>
				pickerCtrlImp('chamfer', 'chamferSel',  'chamfer', respData['chamfer']);

				datePickerCtrlImp('start_time', 'start_timeSel', respData['start_time']);
				cityPickerCtrlImp('prov_id', 'prov_idSel', respData['prov_id']);	
</script>

<
script >

	// 查询机楼信息
	function requestBuildList() {
		checkNetwork();

		mui.plusReady(function() {
			plus.nativeUI.showWaiting("正在请求数据...");

			var map = new Object();
			map['userName'] = window.localStorage.getItem(SaveUserName);
			map['engineroom_id'] = window.localStorage.getItem(Engineroom_id);

			var url = getHost() + "/geospatialInterController/geospatialList.json";
			mui.ajax(url, {
				dataType: 'json',
				data: JSON.stringify(map),
				type: 'post',
				timeout: TIMEOUT,
				headers: {
					'Content-Type': 'application/json'
				},
				success: function(data) {
					plus.nativeUI.closeWaiting();

					responseBuildList(data);
				},
				error: function(xhr, type, errorThrown) {
					plus.nativeUI.closeWaiting();

					mui.toast(getHttpErrorDesp(type));
				}
			});
		});
	}

function responseBuildList(resp) {
	var data = new Array();
	for(var i = 0; i < resp.buildList.length; i++) {
		var item = resp.buildList[i];
		data.push({
			value: item.id,
			text: item.mac_build_name
		});
	}

	var userPicker = new mui.PopPicker();
	userPicker.setData(data);
	userPicker.show(function(selectItems) {
		document.getElementById('geos_idSel').innerHTML = selectItems[0].text;
		document.getElementById('geos_id').innerHTML = selectItems[0].value;
	});
} 
</script>