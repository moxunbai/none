
import {OperEvent} from "../event/operevent"
var shortcutKey ={
	"ControlLeft_KeyA":{
        event:new OperEvent()
	}
}

/**
 * 获取快捷键设置
 */
function findSckSetting(key){
    return shortcutKey[key]
}

export {
	shortcutKey,
	findSckSetting,
}