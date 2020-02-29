/** 
 *  凡是挂载到私有属性上的_开头
 *  */

import {
    isPrimitive,
    isArray,
    isFun,
    isRectElement,
    isStr    
} from './utils';
import htmlApi from './domUtils';
import EventFn from './event'; 
// import diff from './diff';
import types from './types';
// import patch from './patch';
// import diff form './diff';
let diffQueue = []; //差异队列
let updateDepth = 0; //更新的级别

class Unit{
    constructor(elm) {
        // 将
        this._selfElm = elm;
        this._events = new EventFn();
    }
    getHtml(){

    }
    
}

// 文本节点
class TextUnit extends Unit{
    getHtml(){
        this._selfDomHtml = htmlApi.createTextNode(this._selfElm);
        return this._selfDomHtml;
    }
    update(newEl) {
        // 新老文本节点不相等，才需要替换
        if (this._selfElm !== newEl) {
            this._selfElm = newEl;
            htmlApi.setTextContent(this._selfDomHtml.parentNode, this._selfElm);
        }
    }
}

// 
class NativeUnit extends Unit{
    getHtml() {
        let {type,props} = this._selfElm;
        // 创建dom
        let domElement = htmlApi.createElement(type);
        props = props || {};
    //   存放children节点
        this._renderedChUs = [];
        // 循环所有属性，然后设置属性
        for (let [key, val] of Object.entries(props)) {
            this.setProps(domElement, key, val,this);
        }
        this._selfDomHtml = domElement;
        return domElement;
    }
    /**
     *
     * 给dom设置属性
     * @param {Element} el 需要设置属性的dom元素
     * @param {*} key   需设置属性的key值
     * @param {*} val   需设置属性的value值
     */
    setProps(el, key, val,selfU) {
        if (key === 'children') {
            val = isArray(val) ? val : [val];
            val.forEach((c,i) => {
                if(c != undefined){
                    let cUnit = createUnit(c);
                    cUnit._mountIdx = i;
                    selfU._renderedChUs.push(cUnit);
                    let cHtml = cUnit.getHtml();
                    htmlApi.appendChild(el, cHtml);
                }

            });

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
    // 记录属性的差异
    updateProps(oldProps, props) {
        let oldNode = this._selfDomHtml;
        for (let key in oldProps) {
            if (!props.hasOwnProperty(key) && key != 'key') {
                if (key == 'style') {
                    oldNode.style[key] = '';
                }else{
                    delete oldNode[key];
                }
            }
            if (/^on[A-Z]/.test(key)) {
                // 解除绑定
            }
        }
        for (let propsName in props) {
            let val = props[propsName];
            if (propsName === 'key') {
                continue;
            }
            // 事件
            else if (propsName.startsWith('on')) {
                // 绑定事件
            } else if (propsName === 'children') {
                continue;
            } else if (propsName === 'className') {
                oldNode.className = val;
            } else if (propsName === 'style') {
                let cssText = Object.keys(val).map(attr => {
                    return `${attr.replace(/([A-Z])/g,()=>{ return"-"+arguments[1].toLowerCase()})}:${val[attr]}`;
                }).join(';');
                oldNode.style.cssText = cssText;
            } else {
                htmlApi.setAttribute(oldNode,propsName,val);
            }
        }

    }
    update(newEl){
        let oldProps = this._selfElm.props;
        let props = newEl.props;
        // 比较节点的属性是否相同
        this.updateProps(oldProps, props);
        // 比较children
        this.updateDOMChildren(props.children);

        
    }
    // 把新的儿子们传递过来，与老的儿子们进行对比，然后找出差异，进行修改
    updateDOMChildren(newChEls) {
        updateDepth++;
        this.diff(diffQueue, newChEls);
        updateDepth--;
        if (updateDepth === 0) {
            this.patch(diffQueue);
            diffQueue = [];
        }
    }
    // 计算差异
    diff(diffQueue, newChEls) {
        let oldChUMap = this.getOldChKeyMap(this._renderedChUs);
        let {newCh,newChUMap} = this.getNewCh(oldChUMap,newChEls);
        let lastIndex = 0; //上一个的确定位置的索引
        for (let i = 0; i < newCh.length; i++) {
            let c = newCh[i];
            let newKey = this.getKey(c,i);
            let oldChU = oldChUMap[newKey];
            if (oldChU === c) { //如果新老一致，说明是复用老节点
                if (oldChU._mountIdx < lastIndex) { //需要移动
                    diffQueue.push({
                        parentNode: oldChU._selfDomHtml.parentNode,
                        type: types.MOVE,
                        fromIndex: oldChU._mountIdx,
                        toIndex: i
                    });
                }
                lastIndex = Math.max(lastIndex, oldChU._mountIdx);

            } else {
                if (oldChU) {
                    diffQueue.push({
                        parentNode: oldChU._selfDomHtml.parentNode,
                        type: types.REMOVE,
                        fromIndex: oldChU._mountIdx
                    });
                     // 去掉当前的需要删除的unit
                     this._renderedChUs = this._renderedChUs.filter(item => item != oldChU);
                    // 去除绑定事件
                }

                let node = c.getHtml();
                diffQueue.push({
                    parentNode: this._selfDomHtml,
                    type: types.INSERT,
                    markUp: node,
                    toIndex: i
                });
            }
            // 
            c._mountIdx = i;
        }
   
        // 循环老儿子的key：节点的集合，在新儿子集合中没有找到的都打包到删除
        for (let oldKey in oldChUMap) {
            let oldCh = oldChUMap[oldKey];
            let parentNode = oldCh._selfDomHtml.parentNode;
            if (!newChUMap[oldKey]) {
                diffQueue.push({
                    parentNode: parentNode,
                    type: types.REMOVE,
                    fromIndex: oldCh._mountIdx
                });
                // 去掉当前的需要删除的unit
                this._renderedChUs = this._renderedChUs.filter(item => item != oldCh);
                // 去除绑定
            }
        }
        

    }
    // 打补丁
        patch(diffQueue) {
            let deleteCh = [];
            let delMap = {}; //保存可复用节点集合
           
            for (let i = 0; i < diffQueue.length; i++) {
                let curDiff = diffQueue[i];
                if (curDiff.type === types.MOVE || curDiff.type === types.REMOVE) {
                    let fromIndex = curDiff.fromIndex;
                    let oldCh = curDiff.parentNode.children[fromIndex];
                    delMap[fromIndex] = oldCh;
                    deleteCh.push(oldCh);
                }
            }
            deleteCh.forEach((item)=>{htmlApi.removeChild(item.parentNode, item)});

            for (let i = 0; i < diffQueue.length; i++) {
                let curDiff = diffQueue[i];
                switch (curDiff.type) {
                    case types.INSERT:
                        this.insertChildAt(curDiff.parentNode, curDiff.toIndex, curDiff.markUp);
                        break;
                    case types.MOVE:
                        this.insertChildAt(curDiff.parentNode, curDiff.toIndex, delMap[curDiff.fromIndex]);

                        break;
                    default:
                        break;
                }
            }

    }
    insertChildAt(parentNode, fromIndex, node) {
        let oldCh = parentNode.children[fromIndex];
        oldCh ? htmlApi.insertBefore(parentNode, node, oldCh) : htmlApi.appendChild(parentNode,node);
    }
    getKey(unit, i) {
        return (unit && unit._selfElm && unit._selfElm.key) || i.toString();
    }
    // 老的儿子节点的 key-》i节点 集合
    getOldChKeyMap(cUs = []) {
        let map = {};
        for (let i = 0; i < cUs.length; i++) {
            let c = cUs[i];
            let key = this.getKey(c,i);
            map[key] = c;
        }
        return map;
    }
    // 获取新的children，和新的儿子节点 key-》节点 结合
    getNewCh(oldChUMap, newChEls) {
        let newCh = [];
        let newChUMap = {};
        newChEls.forEach((c,i)=>{
            let key = (c && c.key) || i.toString();
            let oldUnit = oldChUMap[key];
            let oldEl = oldUnit && oldUnit._selfElm;
            if (shouldDeepCompare(oldEl, c)) {
                oldUnit.update(c);
                newCh.push(oldUnit);
                newChUMap[key] = oldUnit;
            } else {
                let newU = createUnit(c);
                newCh.push(newU);
                newChUMap[key] = newU;
                this._renderedChUs[i] = newCh;
            }
        });
        return {newCh,newChUMap};
    }
}

class ComponentUnit extends Unit{
    getHtml(){
        let {type,props} = this._selfElm;
        let component = this._componentInstance = new type(props);
        // 保存当前unit到当前实例上
        component._selfUnit = this;
        
        // 如果有组件将要渲染的函数的话需要执行
        component.componentWillMount && component.componentWillMount();
        let vnode  = component.render();
        let elUnit = this._renderUnit = createUnit(vnode);
        let mark = this._selfDomHtml = elUnit.getHtml();
        this._events.once('mounted', () => {
            component.componentDidMount && component.componentDidMount();
        });
        return mark;
    }
     // 这里负责处理组件的更新操作  setState方法调用更新
    update(newEl, partState) {
        // 获取新元素
        this._selfElm = newEl || this._selfElm;
        // 获取新状态 不管组件更新不更新 状态一定会修改
        let newState = this._componentInstance.state = Object.assign(this._componentInstance.state, partState);
        // 新的属性对象
        let newProps = this._selfElm.props;
        let shouldUpdate = this._componentInstance.componentShouldUpdate;
        if (shouldUpdate && !shouldUpdate(newProps, newState)) {
            return;
        }
        // 下边是需要深度比较
        let preRenderUnit = this._renderUnit;
        let preRenderEl = preRenderUnit._selfElm;
        let preDomEl = this._selfDomHtml;
        let parentNode = preDomEl.parentNode;
        let newRenderEl = this._componentInstance.render();
        // 新旧两个元素类型一样 则可以进行深度比较，不一样，直接删除老元素，新建新元素
        if (shouldDeepCompare(preRenderEl, newRenderEl)) {
            // 调用相对应的unit中的update方法
            preRenderUnit.update(newRenderEl);
            this._componentInstance.componentDidUpdate && this._componentInstance.componentDidUpdate();
        } else {
            // 类型相同 直接替换
            this._renderUnit = createUnit(newRenderEl);
            let newDom = this._renderUnit.getHtml();
            parentNode.replaceChild(newDom,preDomEl);
        }

    }

}
// 不考虑hook
class FunctionUnit extends Unit{
        getHtml(){
            let {type,props} = this._selfElm;
            let fn = type(props);
            let vnode = fn.render();
            let elUnit = createUnit(vnode);
            let mark =  elUnit.getHtml();
            this._selfDomHtml = mark;
            return mark;
        }
}
// 获取key，没有key获取当前可以在儿子节点内的索引
function getKey(unit,i){
    return (unit && unit._selfElm && unit._selfElm.key) || i.toString();
}
// 判断两个元素的类型是不是一样 需不需要进行深度比较
function shouldDeepCompare(oldEl, newEl) {
    if (oldEl != null && newEl != null) {
        if (isPrimitive(oldEl) && isPrimitive(newEl)) {
            return true;
        }
        if (isRectElement(oldEl) && isRectElement(newEl)) {
            return oldEl.type === newEl.type;
        }

    }
    return false;
}

function createUnit(vnode){
    if(isPrimitive(vnode)){
        return new TextUnit(vnode);
    }
    if (isRectElement(vnode) && isStr(vnode.type)) {
        return new NativeUnit(vnode);
    }
    if (isRectElement(vnode) && vnode.type.isReactComponent) {
        return new ComponentUnit(vnode);
    }
    if (isRectElement(vnode) && isFun(vnode.type)) {
        return new FunctionUnit(vnode);
    }
}

export default createUnit;