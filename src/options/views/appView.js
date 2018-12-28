var AppView = Backbone.View.extend({
    tagName: 'div',
    el: '#app',
    className: 'button-item',
    initialize: function (storage) {
        _.bindAll(this, 'render');
        this.storage = storage;
        this.buttonsView = new ButtonsView(new Buttons(this.storage.buttons));
        this.variablesView = new VariablesView(new Variables(this.storage.variables));
        this.editorView = new EditorView();
    },
    render: function () {
        this.buttonsView.render();
        this.editorView.renderEmpty();
        this.variablesView.render();
        return this;
    },
    events: {
        "click #add-button": "addNewButton",
        "click #add-variable": "addNewVariable",
        "click #save": "saveData",
    },
    addNewButton: function () {
        this.buttonsView.collection.add(new Button());
    },
    addNewVariable: function () {
        this.variablesView.collection.add(new Variable());
    },
    saveData: function () {
        this.storage.setData(
            app.buttonsView.collection.models.map(item => item.attributes),
            app.variablesView.collection.models.map(item => item.attributes),
            () => $('#status').show().text('Options saved').delay(750).fadeOut('slow')
        );
    }
});
