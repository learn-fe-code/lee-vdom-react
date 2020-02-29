/**
 * 
 * 一些帮助工具公共方法
 */
import { Element} from './element';
import htmlApi from './domUtils';
// 是否有key，
/**
 * 
 * @param {Object} config 虚拟dom树上的属性对象
 */
function hasValidKey(config) {
    config = config || {};
    return config.key !== undefined;
}
// 是否有ref，
/**
 * 
 * @param {Object} config 虚拟dom树上的属性对象
 */
function hasValidRef(config) {
    config = config || {};
    return config.ref !== undefined;
}

/**
 * 确定是children中的是文本节点
 * @param {*} value 
 */
function isPrimitive(value) {
    const type = typeof value;
    return type === 'number' || type === 'string'
}
/**
 * 判断arr是不是数组
 * @param {Array} arr 
 */
function isArray(arr) {
    return Array.isArray(arr);
}

function isFun(fun) {
    return typeof fun === 'function';
}
// 判断是否是通过react.creatElment创建出来的实例
function isRectElement(vnode){
    return vnode instanceof Element;
}
// 判断是否是字符串
function isStr(val) {
    return typeof val === 'string';
}

/**
 *
 * 给dom设置属性
 * @param {Element} el 需要设置属性的dom元素
 * @param {*} key   需设置属性的key值
 * @param {*} val   需设置属性的value值
 */
function setProps(el, key, val) {
    if (key === 'children') {
        // val = isArray(val) ? val : [val];
        // val.forEach(c => {
        //     render(c, el);
        // })

    } else if (key === 'value') {
        let tagName = htmlApi.tagName(el) || '';
        tagName = tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea') {
            el.value = val;
        } else {
            // 如果节点不是 input 或者 textarea, 则使用 `setAttribute` 去设置属性
            htmlApi.setAttribute(el, key, val);
        }

    }
    // 类名
    else if (key === 'className') {
        if (val) el.className = val;
    } else if (key === 'style') {
        //需要注意的是JSX并不是html,在JSX中属性不能包含关键字，
        // 像class需要写成className,for需要写成htmlFor,并且属性名需要采用驼峰命名法
        let cssText = Object.keys(val).map(attr => {
            return `${attr.replace(/([A-Z])/g,()=>{ return"-"+arguments[1].toLowerCase()})}:${val[attr]}`;
        }).join(';');
        el.style.cssText = cssText;
    } else if (key === 'on') { //目前忽略

    } else {
        htmlApi.setAttribute(el, key, val);
    }
}
export {
    hasValidKey,
    hasValidRef,
    isPrimitive,
    isArray,
    isFun,
    isRectElement,
    isStr,
    setProps
}