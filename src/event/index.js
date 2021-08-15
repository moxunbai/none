import { SceneTransEvent } from "./SceneTransEvent"




var eventFactory = {
    "SceneTrans": SceneTransEvent,
    get: function(name, option,scene,camera,dom) {
        if (eventFactory[name]) {
            console.log("get  ssss=",dom)
            return new eventFactory[name]( option,scene,camera,dom)
        }
    }
}




export {
    eventFactory as EventFactory
}