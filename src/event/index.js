import { SceneTransEvent } from "./SceneTransEvent"




var eventFactory = {
    "SceneTrans": SceneTransEvent,
    get: function(name, option) {
        if (eventFactory[name]) {
            return new eventFactory[name]( option)
        }
    }
}


console.log(eventFactory.get("SceneTrans", {}))


export {
    eventFactory as EventFactory
}