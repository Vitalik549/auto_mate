var AppView = Backbone.View.extend({
    tagName: 'div',
    el: '#app',

    initialize: function (storage) {
        _.bindAll(this, 'render');
        this.storage = storage;
        this.buttonsView = new ButtonsView(new Buttons(this.storage.buttons));
        this.refreshAppOnTabReload();
        this.initMsg();
    },
    render: function () {
        this.buttonsView.render();
        return this;
    },
    events: {
        "click #settings": "openSettingsPage"
    },
    openSettingsPage: function () {
        chrome.tabs.create({ 'url': chrome.runtime.getURL("options.html") });
    },
    refreshAppOnTabReload: function () {
        chrome.tabs.onUpdated.addListener(function (id, changes, tab) {
            if (changes.status && changes.status == 'complete') {
                chrome.tabs.query(getActiveTabQuery(), tabs => {
                    let activeTab = tabs[0];
                    if (activeTab.id === id) {
                        app.render();
                        app.initMsg();
                    }
                })
            }
        })
    },
    initMsg() {
        chrome.runtime.onMessage.addListener(function (message, sender) {
            if (sender.id === chrome.runtime.id && message && message.to && message.to === 'popup') {
                switch (message.type) {
                    case 'createTab':
                        chrome.tabs.create({ url: message.data, active: false });
                        break;
                    case 'resolve':
                        app.buttonsView.setScriptExecutionResult(message.buttonId, message.scriptId, "passed", message.message, message.data)
                        break;
                    case 'reject':
                    console.log('Script rejected with exception: ', message.data.exception)
                        app.buttonsView.setScriptExecutionResult(message.buttonId, message.scriptId, "failed", message.message, message.data)
                        break;
                }
            }
        });
    }
});