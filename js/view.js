// 生成左右分栏name-value的形式
function createInfoItem(name, value) {
	var div = document.createElement('div');
	div.className = "item-div";
	div.innerHTML = '<div class="item-name">' + name + '</div><div class="item-value">' + value + '</div>';
	return div;
}

function createDownloadItem(name, value, url, type, htmlContent) {
	var div = createInfoItem(name, value);
	div.addEventListener('tap', function() {
		openContent(url, type, htmlContent);
	}, false);
}

// 关闭页面一直到九宫格界面
function closeToMain() {
	var main_tab_home = plus.webview.getWebviewById('main_tab_home.html');
	var list = main_tab_home.children();
	for(var i = 0; i < list.length; i++) {
		list[i].hide();
	}
}

function createUploadImage(id, placeholder) {
	var li = document.createElement('li');
	li.className = 'mui-table-view-cell listyle';

	var div1 = document.createElement('div');
	div1.className = 'item-name';
	div1.innerHTML = '<img src="../img/placeholder.png" style="height: 45px; " />';
	li.appendChild(div1);

	var div2 = document.createElement('div');
	div2.className = 'item-value valuestyle';
	div2.innerHTML = '<input id="ip" type="text" class="mui-input-clear" placeholder="" value="' + placeholder + '">';
	li.appendChild(div2);

	div1.addEventListener('tap', function() {
		galleryImgsSelected(div1);
	}, false);

	return li;
}

function galleryImgsSelected(div) {
	// 从相册中选择图片
	console.log('从相册中选择多张图片(限定最多选择9张)：');
	plus.gallery.pick(function(path) {
		div.getElementsByTagName('img')[0].src = path;

	}, function(e) {
		console.log('取消选择图片');
		
	}, {
		filter: 'image',
		multiple: false
	});
};