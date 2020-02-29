

import htmlApi from './domUtils';   
import createUnit from './unit';
/**
 * render方法可以将虚拟DOM转化成真实DOM
 *
 * @param {*} element 如果是字符串
 * @param {Element} container
 */
function render(element,container){
 
 let unit = createUnit(element);
 let domElement = unit.getHtml();
  htmlApi.appendChild(container, domElement);
  unit._events.emit('mounted');
}



export default { render}