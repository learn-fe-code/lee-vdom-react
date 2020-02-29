import React from './react'; //引入对应的方法来创建虚拟DOM
import ReactDOM from './react-dom';


class Counter extends React.Component{
    constructor(props) {
        super(props);
        this.state = {number:0,isFlag:true}
    }
    componentWillMount() {
        console.log('componentWillMount 执行');
    }
        // 组件是否要更新
    componentShouldUpdate(nextProps,newState) {
        return true;
    }
    componentDidMount() {
        console.log('componentDidMount 执行');
        setTimeout(() => {
           this.setState({isFlag:false})
        }, 3000);        
    }
    componentDidUpdate() {
        console.log('componentDidUpdate Counter');
    }

    

    render(){
        // return this.state.isFlag ? React.createElement('p',{id:'p',style:{color:'green'}},'hello') : React.createElement('p',{id:'xin',style:{color:'red'}},'更改');
           if(this.state.isFlag){
            return (
                React.createElement('ul',{id:'oldUl'},
                React.createElement('li',{key:'A'},'A'),
                React.createElement('li',{key:'B'},'B'),
                React.createElement('li',{key:'C'},'C'),            
                React.createElement('li',{key:'D'},'D'),)
            );
          
        }else{
            return (
                React.createElement('ul',{id:'oldUl'},
                    React.createElement('li',{key:'A'},'A'),
                    React.createElement('li',{key:'C'},'C'), 
                    React.createElement('li',{key:'B'},'B'),           
                    React.createElement('li',{key:'E'},'E'),                                
                    React.createElement('li',{key:'F'},'F1'),
                )
            )
        }
   
    }
}
let el = React.createElement(Counter,{name:'lee'});

ReactDOM.render(el,document.getElementById('root'));

