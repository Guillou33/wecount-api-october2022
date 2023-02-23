import { EventEmitter } from "events";

interface SingleArgEvent {
  name: string;
  payload?: any;
}

export default abstract class BaseEventEmitter<Event extends SingleArgEvent> {
  private emitter: EventEmitter;
  constructor() {
    this.emitter = new EventEmitter();
  }

  emit<EventType extends Event>(event: EventType) {
    this.emitter.emit(event.name, event.payload);
  }

  on<EventType extends Event>(eventName: EventType["name"], listener: (payload: EventType["payload"]) => void) {
    this.emitter.on(eventName, listener);
    return this;
  }

  once<EventType extends Event>(eventName: EventType["name"], listener: (payload: EventType["payload"]) => void) {
    this.emitter.once(eventName, listener);
    return this;
  }

  removeListener<EventType extends Event>(eventName: EventType["name"], listener: (payload: EventType["payload"]) => void) {
    this.emitter.removeListener(eventName, listener);
    return this;
  }

  removeAllListeners<EventType extends Event>(eventName: EventType["name"]) {
    this.emitter.removeAllListeners(eventName);
    return this;
  }
  
  listeners(eventName: Event["name"]) {
    this.emitter.listeners(eventName);
    return this;
  }
}