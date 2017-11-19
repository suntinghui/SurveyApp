function getValue() {
	var i = 0;

	var map = new Object();
	var divs = document.querySelectorAll('.param');
	[].forEach.call(divs, function(div) {
		i++;
		var id = div.getAttribute('id');
		var value = div.value;
		map[id] = value;
	});
	console.log('get属性总数：' + i);
	
	return map;
}

function setValue(obj) {
	var i = 0;
	
	var divs = document.querySelectorAll('.param');
	[].forEach.call(divs, function(div) {
		i++;		
		var id = div.getAttribute('id');
		div.value = obj[id];
	});
	console.log('set属性总数：' + i);
}