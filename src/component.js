class Component {
    //用于判断是否是类组件  
    static isReactComponent = true;
    constructor(props) {
        this.props = props;
    }
   //更新 调用每个单元自身的unit的update方法，state状态对象或者函数 现在不考虑也不考虑异步
   setState(state) {
       //第一个参数是新节点，第二个参数是新状态
       this._selfUnit.update(null, state);
   }

}

export default Component;