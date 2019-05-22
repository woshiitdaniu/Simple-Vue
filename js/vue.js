//定义一个构造器
function Vue(option) {
	this.$options = option;
	//将传进来的data对象 存放在 _data属性下
	var data = this._data = this.$options.data,
		vm = this,
		arr = [];

	//循环获取keys值
	for(var keys in data) {
		if(data.hasOwnProperty(keys)) {
			arr.push(keys);
		}
	}

	var obj2Compile = new Compile(this.$options.el || document.body, this)
	obj2Compile.inits();
	//循环数组
	arr.forEach(function(key) {
		vm.proxy(key)
	})
};

Vue.prototype = {
	//定义数据代理函数
	proxy: function(key) {
		var _this = this;
		//1.将data的key添加到vue中作为属性
		Object.defineProperty(this, key, {
			configurable: false,
			enumerable: true,
			//2.当我们使用this.key的时候 实际上是从提前存好的_data属性上取值 而不是直接从this
			//3.代理读操作
			get: function proxyGetter() {
				return _this._data[key]
			},
			//4.代理写操作
			set: function proxySetter(newVal) {
				_this._data[key] = newVal;
			}
		})
	},

}
