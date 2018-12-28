var Variable = Backbone.Model.extend({
    defaults: {
        "key": "",
        "value": ""
    },
    initialize: function (key, value) {
        this.id = Date.now();
        this.key = key;
        this.value = value;
    }
});

var Variables = Backbone.Collection.extend({
    model: Variable,
});