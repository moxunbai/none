import { SceneTransEvent } from "./SceneTransEvent"
import { ScenePanEvent } from "./ScenePanEvent"




var eventFactory = {
    "SceneTrans": SceneTransEvent,
    "ScenePan":ScenePanEvent,
    get: function(name, option,scene,camera,dom) {
        if (eventFactory[name]) {
             
            return new eventFactory[name]( option,scene,camera,dom)
        }
    }
}




export {
    eventFactory as EventFactory
}