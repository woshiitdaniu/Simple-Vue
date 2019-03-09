//定义一个观察者 构造函数   （观察data对象中属性值得变化）-数据劫持


function Observer( val ){
	//1.将data中的数据保存在该对象上
	this.data = val;
	this.goState( this.data );
}
Observer.prototype = {
	//定义观察开始函数
	goState:function( data ){
		var _this = this
			arr	  = [];			
		//循环获取keys值
		for(var keys in data){
			if( data.hasOwnProperty(keys) ){
				arr.push( keys );
			}
		}
		
		arr.forEach(function( keys ){
			//对指定的属性进行监听
			_this.defineReactive( _this.data,keys,data[keys] );
		})
	},
	//定义数据与页面之间的联系  劫持data中每一个属性 并设置监听 object.defineProoerty()
	defineReactive:function( data,keys,val ){
		//创建每一个属性对应的dep对象
		var dep = new Dep();
		//间接递归  对data属性 所有层次的属性进行监听
		var childObj = observer(val);
		
		//给data中的属性重新定义set和get 以保证监听
		Object.defineProperty(data,keys,{
			configurable:false,
			enumerable:true,
			get:function(){ //建立dep和 watcher之间的关系
				if( Dep.target ){
					dep.depend();//建立关系
				}
				return val;
			},
			set:function( newVal ){//监视属性的变化 并通知watcher更新界面
				if( newVal === val ){
					return;
				}
				val = newVal;
				//如果是的属性值为对象的话 再进行监听
				childObj = observer( newVal );
				//通知订阅者
				dep.notify();
			}
		})
	}
}


var uid = 0;

//创建dep 构造器
function Dep(){
	//定义new Dep的次数标记   也就是给每一个层次上属性定义一个id
	this.id = uid ++;
	
	//定义订阅者容器 存放每一个watcher
	this.subs = [];
}
Dep.prototype = {
	//添加watcher到dep中
	addSub:function( sub ){
		this.subs.push( sub );
	},
	//建立dep和watcher的关系
	depend:function(){
		Dep.target.addDep( this );
	},
	
	//移除订阅
	removeSub:function( currentSub ){
		var index = this.subs.indexOf(currentSub);
		if( index!=-1 ){
			this.subs.slice( index,1 );
		}
		
	},
	notify:function(){
		//遍历所有的watcher并通知更新
		this.subs.forEach(function(sub){
			sub.update();
		})
	}
}
Dep.target = null;

function observer( val,vm ){
	//递归退出的条件
	if( !val || typeof val!='object' ){
		return;
	}
	//返回观察者构造函数
	return new Observer( val )
}

