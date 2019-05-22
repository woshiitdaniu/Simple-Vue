//定义模板解析构造函数

/*
 * dom节点 可以分为 元素节点、属性节点、文本节点
 * 它们的nodeType分别为1、2 、3
 * domcument.createDomcumentFragement
 */
function Compile(el, vm) {
	this.$vm = vm;
	//获取元素节点   分两种情况  1.已经是元素节点  2.只是#id 字符串
	this.$el = el;

}
Compile.prototype = {

	//初始化
	inits: function() {
		this.$el = this.isElementNode(this.$el) ? this.$el : document.querySelector(this.$el);
		if(!this.$el) return;

		//获取虚拟dom  fragement对象
		this.$fragement = this.getFragement(this.$el);

		//解析虚拟dom中的各个节点
		this.compileNode(this.$fragement);

		//重新渲染到真实dom上
		this.$el.appendChild(this.$fragement);
	},

	//定义一个判断是否为元素节点的函数
	isElementNode: function(el) {
		return 1 === el.nodeType;
	},

	//定义一个判断是否为文本节点的函数
	isTextNode: function(el) {
		return 3 === el.nodeType;
	},

	//定义获取fragement对象函数  //这是虚拟dom的关键
	getFragement: function(el) {
		//创建fragement
		var fragement = document.createDocumentFragment(),
			childNode;
		//循环el元素节点中的子节点赋值给childNode并判断是否存在
		//存在则放进fragement内存中
		//每次调用appendChild方法后  真实dom上的元素节点就会消失 存放进fragement内存中
		while(childNode = el.firstChild) {
			fragement.appendChild(childNode)
		}
		return fragement;

	},
	//解析节点
	compileNode: function(fragement) {
		//获取所有的子节点  包括文本节点  元素节点
		var childNodes = fragement.childNodes,
			_this = this;

		Array.prototype.slice.call(childNodes).forEach(function(node) {
			var node_text = node.textContent, //获取节点的文本内容
				rege = /\{\{(.*)\}\}/; //定义获取{{}}的正则   注意这里的(.*)代表的是子匹配   我们可以使用Regexp.$1获得

			//节点类型判断
			//1.如果是元素节点  我们需要判断是否存在指令 属性 v-bind   v-text  v-html   v-model等
			if(_this.isElementNode(node)) {
				_this.compile(node)

				//2.如果是文本节点  并且存在{{}}	
			} else if(_this.isTextNode(node) && rege.test(node_text)) {
				_this.compileTextNode(node, RegExp.$1);
			}

			//3.判断该节点是否还存在子节点  如果存在则递归解析方法
			if(node.childNodes && node.childNodes.length) {
				_this.compileNode(node)
			}
		})
	},
	//解析文本节点
	compileTextNode: function(node, exp) {
		compileUtil.text(node, this.$vm, exp);
	},

	//解析元素节点中的指令
	compile: function(node) {
		//1.获取元素节点 的 所有属性节点
		var nodeAllAttrs = node.attributes,
			_this = this;

		//2.遍历所有的属性节点  并获取对应的属性名和属性值
		Array.prototype.slice.call(nodeAllAttrs).forEach(function(attr) {
			//获取属性名  (比如v-on:click)
			var attrName = attr.name;
			//判断属性是否为指令
			if(attrName.indexOf('v-') > -1) {
				//获取属性值  (比如sayHellow)
				var attrVal = attr.value;

				//获取属性名中 v-后面的部分 来判定是属于什么事件
				var dirType = attrName.substring(2); //( 比如on:click )
				var enType = dirType.split(':')[0];
				//判定指令是否为事件指令还是普通指令
				if(enType == 'on') {

					//做事件处理 同时创建监听
					compileUtil.eventHandler(node, _this.$vm, attrVal, dirType)
				} else {
					//普通的指令处理
					compileUtil[enType] && compileUtil[enType](node, _this.$vm, attrVal)
				}
				//这里可以做enType=model  就给当前的el监听一个input事件 并将该el的value赋值给vue实例中的data值 实现双向数据绑定

				//去除指令在元素中的显示
				node.removeAttribute(attrName)
			}
		})

	}
}

//解析工具对象
var compileUtil = {
	//解析文本工具函数
	text: function(node, vm, exp) {
		this.binds(node, vm, exp, 'text');
	},
	//解析含有元素标签的节点
	html: function(node, vm, exp) {
		this.binds(node, vm, exp, 'html');
	},
	//解析class
	class: function(node, vm, exp) {
		this.binds(node, vm, exp, 'class');
	},
	//定义指令绑定函数
	binds: function(node, vm, exp, type) {
		//根据type来获取对应的处理函数
		var updateFn = updater[type + 'Update'];

		updateFn && updateFn(node, this._getVmVal(vm, exp));

		//new Watcher( vm,exp,function( val,oldVal ){
		//		updateFn && updateFn( node,val,oldVal )
		//} )
	},
	//定义获取属性val的函数
	_getVmVal: function(vm, exp) {
		var val = vm._data;

		//考虑到exp可能存在this.name  这种情况
		exp = exp.split('.');

		exp.forEach(function(v) {
			//取出对应的属性值
			val = val[v];
		});
		return val;
	},
	//定义事件监听函数
	eventHandler: function(node, vue, exp, dirType) {
		var eventType = dirType.split(":")[1],
			//根据属性值 获取 定义在methods对象上 对应的函数
			fn = vue.$options.methods && vue.$options.methods[exp];

		if(eventType && fn) {
			//给对应的元素节点创建监听事件  
			//并将对应的函数this指向强转为 Vue 构造函数  以便使用this 调用相关的属性
			node.addEventListener(eventType, fn.bind(vue), false)
		}

	}
}

//指令绑定函数对象
var updater = {
	//文本更新函数
	textUpdate: function(node, val) {
		node.textContent = typeof val == 'undefined' ? '' : val
	},
	//html更新函数
	htmlUpdate: function(node, val) {
		node.innerHTML = typeof val == 'undefined' ? '' : val
	},
	//class类名更新函数
	classUpdate: function(node, val) {
		var className = node.className;
		if(!className) {
			node.className = val;
		} else {
			node.className = node.className + ' ' + val;
		}

		//node.className = className? className +' '+val : val;

	}
}
