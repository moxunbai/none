
import {EventFactory} from "../event/"
var shortcutKeyDefine =[
	{
        [Symbol.for("eventName")]:"SceneTrans",
        shortcutKey:{
        	keys:['Ctrl'],
        	pointer:"left"
        },
        funcType:"",
	}
]

/**
 * 获取快捷键设置
 */
function findSckSetting(keys,pointer,scene,camera){
	for(let item of shortcutKeyDefine){
        let tempKeys = new Set([...keys,...item.shortcutKey.keys])
        let tempPointer = new Set([...pointer, item.shortcutKey.pointer])
        // console.log("tempKeys",tempKeys)
        // console.log("tempPointer",tempPointer)
        if(tempKeys.size==keys.length&&tempPointer.size==pointer.length ){
        	var _eventKey = Symbol.for("event");
        	if( !item[_eventKey]){
		       item[_eventKey] = EventFactory.get(item[Symbol.for("eventName")],item,scene,camera);

	       }
        	return item
        }
	}
/*	 
	var _define = shortcutKey[key];
	var _eventKey = Symbol.for("event");
	if(_define&&!_define[_eventKey]){
		_define[_eventKey] = EventFactory.get(_define[Symbol.for("eventName")],_define);

	}
    return _define;*/
}

export {
	 
	findSckSetting,
}