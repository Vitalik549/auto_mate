var Script = Backbone.Model.extend({
    defaults: {
        status: 'idle'
        // status: passed/failed/loading/idle
    },
    initialize: function () {
        this.set('id', Date.now())
    }
});

var Scripts = Backbone.Collection.extend({
    model: Script,
});

var Button = Backbone.Model.extend({
    defaults: {
        buttonName: "New button",
        isHidden: false,
        isSplit: false,
        script: "",
    },
    initialize: function () {
        this.runningScripts = new Scripts();  
    },
    registerNewRunningScript: function () {
        let script = new Script();
        script.set('status', 'loading');
        this.runningScripts.add(script);
        return script;
    },
});

var Buttons = Backbone.Collection.extend({
    model: Button,
});