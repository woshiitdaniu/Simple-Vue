//定义监视者构造函数
function Watcher( vm,exp,callback ){
	this.callback = callback;
	this.vm 	  = vm;
	this.exp	  = exp;
	this.depIds   = {};//定义dep的容器对象
	this.value    = this.get();//获取对应exp的初始值
}
Watcher.prototype = {
	//更新方法
	update:function(){
		this.run();
	},
	//判断值是否变化  变化则调用compile类定义的相关updater方法
	run:function(){
		var val = this.get();
		var oldVal = this.value;
		if( val!==oldVal ){
			this.value = val;
			//调用回调函数
			this.callback.call(this.vm,val,oldVal);
		}
	},
	//添加dep
	addDep:function( dep ){
		//判断dep和 watcher是否已经建立关系
		if( !this.depIds.hasOwnProperty(dep.id) ){
			//将watcher添加到dep中
			dep.addSub(this);
			this.depIds[dep.id] = dep;
		}
	},
	get:function(){
		//给dep指定当前的 watcher对象
		Dep.target = this;
		
		var val = this.getVmval();
		//去除指定当前的 watcher对象
		Dep.target = null;
		return val;
	},
	getVmval:function(){
		var exp = this.exp.split('.');
		var val = this.vm._data;
		exp.forEach(function(p){
			val = val[p];
		});
		return val;
	}
}
