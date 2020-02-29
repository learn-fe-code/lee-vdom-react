
import {isPrimitive,isArray,isFun} from './utils';
import htmlApi from './domUtils';   
import EventFn from './event'
/**
 * render方法可以将虚拟DOM转化成真实DOM
 *
 * @param {*} element 如果是字符串
 * @param {Element} container
 */
function render(element,container){
 
  let type, props, c, domElement;
  type = element.type;
  props = element.props;
  let event = new EventFn();
 
//   类组件$
  if (type.isReactComponent) {
     // 如果是类组件，需要先创建实例
     c = new type(props);
     c._type = type;
     c._component = c;
     // 如果有组件将要渲染的函数的话需要执行
     c.componentWillMount && c.componentWillMount();
     // 执行render方法 返回react元素
    element = c._currentElement = c.render();
     console.log(element, 'render的返回值');
    props = element.props || {};
    type = element.type;

    event.on('mounted', () => {
        c.componentDidMount && c.componentDidMount();
    })

  }
  //函数组件
  else if(isFun(type)){
    // 如果是函数组件，需要先执行,得到React元素
    element = type(props);
    props = element.props||{};
    type = element.type; 
  }
   // 如果是字符串或者数字，创建文本节点插入到container中
   if (isPrimitive(element)) {
       domElement = htmlApi.createTextNode(element);
   }else{
       // 创建dom
       domElement = htmlApi.createElement(type);
       // 循环所有属性，然后设置属性
       for (let [key, val] of Object.entries(props)) {
           setAttr(domElement, key, val);
       }
   }

  htmlApi.appendChild(container, domElement);
  event.emit('mounted'); 
}

// 
function componenntFn(){

}
/**
 *
 * 给dom设置属性
 * @param {Element} el 需要设置属性的dom元素
 * @param {*} key   需设置属性的key值
 * @param {*} val   需设置属性的value值
 */
function setAttr(el, key, val) {
    if (key === 'children') {
        val = isArray(val)? val : [val];
        val.forEach(c=>{
            render(c,el);
        })

    }else if(key === 'value'){
        let tagName = htmlApi.tagName(el) || '';
        tagName = tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea') {
            el.value = val;
        } else {
            // 如果节点不是 input 或者 textarea, 则使用 `setAttribute` 去设置属性
            htmlApi.setAttribute(el,key, val);
        }

    } 
    // 类名
    else if (key === 'className') {
        if (val) el.className = val;
    }else if(key === 'style'){
        //需要注意的是JSX并不是html,在JSX中属性不能包含关键字，
        // 像class需要写成className,for需要写成htmlFor,并且属性名需要采用驼峰命名法
        let cssText = Object.keys(val).map(attr => {
            return `${attr.replace(/([A-Z])/g,()=>{ return"-"+arguments[1].toLowerCase()})}:${val[attr]}`;
        }).join(';');
        el.style.cssText = cssText;
    }else if(key === 'on'){  //目前忽略

    }else{
      htmlApi.setAttribute(el, key, val);
    }
}

export default { render}