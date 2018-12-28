var VariablesView = Backbone.View.extend({
    collection: null,
    tagName: 'div',
    className: 'line',
    el: '#variables',
    initialize: function (collection) {
        this.collection = collection;
        _.bindAll(this, 'render');

        this.collection.bind("add", this.render);
        this.collection.bind("remove", this.render);
        // this.collection.bind("change", this.render);
    },
    render: function () {
        var element = $(this.el).empty()

        this.collection.forEach(function (item) {
            var itemView = new VariableView({ model: item });
            itemView.render().$el.appendTo(element)
        });
        return this;
    }
});

var VariableView = Backbone.View.extend({
    className: 'varline',
    initialize: function () {
        _.bindAll(this, 'render');
        _.bindAll(this, 'clickRemoveButton');
        _.bindAll(this, 'valueChanged');

        this.keyInput = $("<input type='text'/>");
        this.valueInput = $("<input type='text'/>");
        this.removeButton = $("<div>").addClass('deleteVar');
    },
    render: function () {
        let val = this.model.get('value');
        let key = this.model.get('key');

        this.keyInput.val(key || '').prop('placeholder', 'variable name')
        this.valueInput.attr('title', val).val(val || '').prop('placeholder', 'value')

        $('<div>').appendTo(this.el).addClass('varName').append(this.keyInput)
        $('<div>').appendTo(this.el).addClass('varValue').append(this.valueInput)
        this.removeButton.appendTo(this.el)
        return this;
    },
    events: {
        "click .deleteVar": "clickRemoveButton",
        "change input": "valueChanged"
    },
    clickRemoveButton: function () {
        app.variablesView.collection.remove(this.model)
    },
    valueChanged: function (evt) {
        this.model.set('key', this.keyInput.val());
        this.model.set('value', this.valueInput.val());
    },
});