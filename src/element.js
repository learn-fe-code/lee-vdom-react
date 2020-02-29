// 虚拟DOM元素的类，构建实例对象，用来描述DOM
class Element{
    constructor(type, props) {
        this.type = type;
        this.props = props;
        this.key = props.key ? props.key : undefined;
    }
    
}


/**
 *
 * 创建虚拟DOM
 * @param {String} type 标签名
 * @param {Object} [config={}]  属性
 * @param {*} children  表示指定元素子节点数组，
 * @returns  
 */
function createElement(type,config = {},...children){
    const props = {};
    for(let propsName in config){
        props[propsName] = config[propsName];
    }
    props.children = children || [];
    return new Element(type, props);
}

export {
    Element,
    createElement
};