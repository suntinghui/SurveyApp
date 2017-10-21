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
	var ul = document.createElement('ul');
	ul.className = 'mui-table-view mui-card ulstyle';

	var li = document.createElement('li');
	li.className = 'mui-table-view-cell';

	var div1 = document.createElement('div');
	div1.className = 'imgdivstyle';
	div1.innerHTML = '<img src="../img/placeholder.png" class="imgstyle" />';
	li.appendChild(div1);

	var div2 = document.createElement('div');
	div2.className = 'valuestyle';
	div2.innerHTML = '<input id="ip" type="text" class="mui-input-clear" placeholder="请输入图片标题" value="' + placeholder + '">';
	li.appendChild(div2);

	div1.addEventListener('tap', function() {
		galleryImgsSelected(div1);
	}, false);
	
	ul.appendChild(li);

	return ul;
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