var Storage = Backbone.Model.extend({
    initialize: function (callback) {
        this.id = Date.now();
        this.getData((data) => {
            this.buttons = data.buttons;
            this.variables = data.variables;
            callback(this);
        })
    },
    getData: function (callback) {
        chrome.storage.local.get([AUTO_MATE_DATA, AUTO_MATE_VARS], function (opts) {
            callback({
                buttons: opts[AUTO_MATE_DATA],
                variables: opts[AUTO_MATE_VARS]
            });
        });
    },
    setData: function (buttons, variables, callback) {
        chrome.storage.local.set({
            [AUTO_MATE_DATA]: buttons,
            [AUTO_MATE_VARS]: variables
        }, callback);
    },
    print: function () {
        this.getData((data) => {
            console.log(data);
        });
    },
    refresh: function (callback) {
        this.setData(DEFAULT_BUTTONS, DEFAULT_VARIABLES, callback);
        console.log('Defaults settings were restored.')
    },
    export: function () {
        console.log('const DEFAULT_BUTTONS = ', JSON.stringify(app.buttonsView.collection.models.map(a => a.attributes)))
        console.log('const DEFAULT_VARIABLES = ', JSON.stringify(app.variablesView.collection.models.map(a => a.attributes)))
    },
    getButtons: function (callback) {
        this.getData((data) => {
            callback(data.buttons);
        });
    },
    setButtons: function (buttons, callback) {
        chrome.storage.local.set({ [AUTO_MATE_DATA]: buttons }, callback);
    },
    getVariables: function (callback) {
        this.getData((data) => {
            callback(data.variables);
        });
    },
    setVariables: function (variables, callback) {
        chrome.storage.local.set({ [AUTO_MATE_VARS]: variables }, callback);
    }
});