var ButtonsView = Backbone.View.extend({
    collection: null,
    tagName: 'div',
    el: '#buttons',
    initialize: function (collection) {
        this.collection = collection;
        _.bindAll(this, 'render');
    },
    render: function () {
        var el = $(this.$el);
        el.empty();

        if (this.collection.length == 0) {
            this.showNoSetupMessage();
        } else {
            this.collection.forEach(function (item) {
                var itemView = new ButtonView({ model: item });
                el.append(itemView.render().$el);
                return this;
            });
        }
    },
    showNoSetupMessage: function () {
        // this will ignore vars config, it's ok for now
        $(this.$el).append(
            $("<div>")
                .addClass("button")
                .text("You have no setup for now.")
                .append($("<br/>"))
                .append("Please set configuration on settings page or ")
                .append($("<br/>"))
                .append($("<a>")
                    .text("load default configuration.")
                    .attr("href", "#")
                    .click(() => {
                        app.storage.refresh(() => {
                            app.openSettingsPage()
                        });
                    })
                )
        )
    },

    setScriptExecutionResult(buttonCid, scriptId, result, message, data) {
        let btn = this
            .collection
            .filter(button => { return button.cid === buttonCid })[0]

        let scripts = btn.runningScripts;
        scripts.forEach(script => {
            if (script.id === scriptId) {
                script.set({
                    status: result,
                    message: message,
                    data: data
                });
            }
        });
    }
});

var ButtonView = Backbone.View.extend({
    tagName: 'div',
    className: 'button-item',
    initialize: function (collection) {
        this.collection = collection;
        this.listenTo(this.el, 'change', this.render);
        this.listenTo(this.model.runningScripts, 'add', function () { console.log('add'); this.drawStatus(); });
        this.listenTo(this.model.runningScripts, 'remove', this.drawStatus);
        this.listenTo(this.model.runningScripts, 'change', this.drawStatus);
        _.bindAll(this, 'render');
        _.bindAll(this, 'clickButton');
        _.bindAll(this, 'drawButtons');
        _.bindAll(this, 'pressEnter');
        this.button = $('<div class="button"/>');
        this.input = $('<input />').width("100%").attr('placeholder', this.model.get('buttonName').toLowerCase());
    },
    render: function () {
        if (this.model.get('isHidden')) return this;

        let hideScript = this.model.get('showWhen');
        if (hideScript) {
            executeScript(
                hideScript,
                (result) => {
                    let scriptSuccess = result && result[0];
                    if (scriptSuccess) {
                        this.drawButtons();
                    }
                },
                // non-http callback
                () => { this.drawButtons(); }
            );
            return this;
        } else {
            return this.drawButtons();
        }
    },
    drawButtons: function () {
        if (this.model.get('isSplit')) $('<div class="split"/>').appendTo(this.$el)
        this.button.text(this.model.get('buttonName')).appendTo(this.$el)
        if (this.model.get('showInput')) this.input.appendTo(this.$el)
        return this;
    },
    events: {
        "click .button": "clickButton",
        "keyup input": "pressEnter"
    },
    clickButton: function () {
        let script = this.model.get('script');
        let setInputVal = "";

        if (this.model.get('showInput')) {
            let val = this.input.val();
            setInputVal = "var INPUT_VALUE = " + JSON.stringify(val) + ";"
        }

        let buttonId = this.model.cid;
        let scriptId = this.model.registerNewRunningScript().id;
        let containsResolve = script.includes("resolveScript");

        let wrappedScript = `(async function() { 
            let resolveScript = async function(message, data){
                MATE.resolve(${JSON.stringify(buttonId)}, ${JSON.stringify(scriptId)}, message, data);
            }
            let rejectScript = async function(message, data){
                MATE.reject(${JSON.stringify(buttonId)}, ${JSON.stringify(scriptId)}, message, data);
            }
            
            try{
                ${setInputVal};
                ${script}

                if (!${containsResolve}) resolveScript('Script passed succesfully.');
            } catch (e) {
                rejectScript('Script execution failed!', {exception: e.stack});
            }

        })()`;

        let callback = () => { };

        executeScript(wrappedScript, callback, callback);
    },
    pressEnter: function (e) {
        if (e.which == 13) {
            this.clickButton();
            return false;
        }
    },
    drawStatus: function () {
        let scripts = this.model.runningScripts;
        
        let hasLoading = scripts.map(scr => { return scr.get('status'); }).includes("loading");

        if (hasLoading) {
            $(this.button).attr('status', "loading");
            this.$el.addClass("disabled")
        } else {
            scripts
                .filter(scr => {
                    let status = scr.get('status');
                    return status === 'passed' || status === 'failed';
                })
                .forEach(scr => {
                    let status = scr.get('status');
                    let button = $(this.button);
                    this.$el.removeClass("disabled")
                    button.attr('status', status);
                    setTimeout(() => { button.removeAttr('status'); }, 500)
                    scr.set({
                        status: 'idle',
                        message: ''
                    });
                })
        }
    },
});
