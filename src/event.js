class EventFn {
    constructor() {
        this._events = {}
    }
    on(eName, fn) {
        if (eName in this._events) {
            this._events[eName].push(fn) //向已存在的事件中添加回调
        } else {
            this._events[eName] = [fn]
        }
    }

    emit() {
        let eName = [].shift.call(arguments) //获取事件名
        let args = [].slice.apply(arguments) //获取参数
        let self = this
        if (eName in this._events && this._events[eName].length > 0) {
            this._events[eName].forEach(calback => {
                calback.apply(self, args)
            })
        } else {
            return false
        }
    }

    remove(eName, fn) {
        if (typeof eName !== 'string' || typeof fn !== 'function') {
            throw new Error(` ${eName} must be event name, ${fn} must be function type`)
        }
        if (eName in this._events) {
            this._events[eName] = this._events[eName].filter(callback => {
                return callback !== fn
            })
        } else {
            return false
        }
    }

    clear(eName) { //清楚所有监听事件
        if (typeof eName !== 'string') {
            throw new Error(`${eName} must be a string`)
        }
        if (eName in this._events) {
            this._events[eName] = []
        }
    }

    once(eName, fn) { //监听一次
        let self = this

        function wrap() {
            fn.apply(self, arguments)
            self.remove(eName, wrap)
        }
        if (eName in this._events) {
            this._events[eName].push(wrap)
        } else {
            this._events[eName] = [wrap]
        }
    }
}

export default EventFn;