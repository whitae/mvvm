// TODO这一部分用来封装Observer对象
// 调用该方法来检测数据
function observe(data) {
    if (typeof data !== 'object') return
    new Observer(data)
}

class Observer {
    constructor(value) {
        this.value = value
        this.walk()
    }
    walk() {
        Object.keys(this.value).forEach((key) => defineReactive(this.value, key))
    }
}

// 数据拦截
function defineReactive(data, key, value = data[key]) {
    const dep = new Dep()
    observe(value)
    Object.defineProperty(data, key, {
        get: function reactiveGetter() {
            dep.depend()
            return value
        },
        set: function reactiveSetter(newValue) {
            if (newValue === value) return
            value = newValue
            observe(newValue)
            dep.notify(value)
        }
    })
}

// TODO每一个闭包内用来存储Watcher的类
// 依赖
class Dep {
    constructor() {
        this.subs = []
    }

    depend() {
        if (Dep.target) {
            this.addSub(Dep.target)
        }
    }

    notify(value) {
        const subs = [...this.subs]
        subs.forEach((s) => s.update(value))
    }

    addSub(sub) {
        this.subs.push(sub)
    }
}
// TODO全局Watcher栈
// 栈顶
Dep.target = null
// 栈
const TargetStack = []
// 入栈
function pushTarget(_target) {
    TargetStack.push(Dep.target)
    Dep.target = _target
}
// 出栈
function popTarget() {
    Dep.target = TargetStack.pop()
}
// TODOWatcher订阅者
// watcher
class Watcher {
    constructor(data, expression, cb) {
        this.data = data
        this.expression = expression
        this.cb = cb
        this.value = this.get()
    }

    get() {
        pushTarget(this)
        const value = parsePath(this.data, this.expression)
        popTarget()
        return value
    }

    update(value) {
        const oldValue = this.value
        this.value = value
        this.cb.call(this.data, this.value, oldValue)
    }
}
// TODO字符串表达式转成“.”引用
// 工具函数
function parsePath(obj, expression) {
    const segments = expression.split('.')
    for (let key of segments) {
        if (!obj) return
        obj = obj[key]
    }
    return obj
}

// TODO 测试
// for test
let obj = {
    a: 1,
    b: {
        m: {
            n: 4
        }
    }
}
observe(obj)
let w1 = new Watcher(obj, 'a', (val, oldVal) => {
    console.log(`obj.a 从 ${oldVal}(oldVal) 变成了 ${val}(newVal)`)
})
obj.a = 10
obj.a = {
    name:'Tom'
}
