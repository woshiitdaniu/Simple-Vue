# Simple-Vue  Vue简单源码解析
本案例是在结合了vue源码以及其他大神关于vue源码的解读下完成的简单版
# 实现功能
```
  1.元素节点属性的获取
  2.元素节点事件的绑定
  3.文本节点{{}}的解析
  4.html以及class的解析
 ```
# 实现思路
> 构建vue的构造函数
> 封装watch、compile、render等对象
> 将data作为参数传递给该构造函数并将对象中key利用defineProperty进行动态监听
> 利用原生js的dom api  domcument.domcumentCreatFragement 来创建一个虚拟dom容器
> 利用原生js的nodeType来递归解析获取的el元素并通过appendchild将真实的dom节点放进虚拟dom容器中
> 解析虚拟dom中的每个元素节点以及文本节点，利用正则的方法匹配元素节点的属性以及属性值并与保存在vue实体中key 做比较
> 如果属性中定义了v-on  v-bind v-model 则给该元素addeventlister 对应的事件

# 本案例节选代码
```javascript
    <div id="test">
			{{name}}
			<!--测试事件的绑定-->
			<p v-on:click="sayHellow" v-class='test1'>测试事件</p>
			
			<!--测式html的渲染-->
			<p v-html="msg"></p>
			
			<!--测试样式的绑定-->
			<p v-class="test2">测试样式</p>
			
			<!--测试双向数据绑定-->
			<input type="text" v-model="text"/>
			<p>{{ text }}</p>
		</div>
 ```   
 
 # 建议
 如需详细了解该案例的执行过程，请 克隆 本项目到本地，然后在浏览器中打点执行
