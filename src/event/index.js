import { SceneTransEvent } from "./SceneTransEvent"




var eventFactory = {
    "SceneTrans": SceneTransEvent,
    get: function(name, option,scene,camera) {
        if (eventFactory[name]) {
            return new eventFactory[name]( option,scene,camera)
        }
    }
}


console.log(eventFactory.get("SceneTrans", {}))


export {
    eventFactory as EventFactory
}