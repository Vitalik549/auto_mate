var ButtonsView = Backbone.View.extend({
    collection: null,
    tagName: 'ul',
    className: 'line',
    el: '#buttons-list',
    events: {
        'update-sort': 'updateSort'
    },
    initialize: function (collection) {
        this.collection = collection;
        _.bindAll(this, 'render');

        this.listenTo(this.collection, 'add remove change', this.render);
    },
    render: function () {
        var element = jQuery(this.el);
        element.empty(); // Clear potential old entries first

        this.collection.forEach(function (item) {
            var itemView = new ButtonView({ model: item });
            element.append(itemView.render().$el);
        });

        element.sortable({
            update: function (event, ui) {
                ui.item.trigger('drop', ui.item.index());
            }
        });
        return this;
    },
    updateSort: function(event, model, position) {    
        this.collection.remove(model);
        this.collection.each(function (model, index) {
            var ordinal = index;
            if (index >= position) {
                ordinal += 1;
            }
            model.set('ordinal', ordinal);
        });            

        model.set('ordinal', position);
        this.collection.add(model, {at: position});

        this.render();
    }
});

var ButtonView = Backbone.View.extend({
    tagName: 'li',
    className: 'button-item',
    events: {
        'click': 'onclick',
        'drop': 'drop'
    },
    render: function () {
        let name = this.model.get('buttonName');
        this.$el.text(name).attr('title', name);
        if(this.model.get('isSplit')){
            this.$el.addClass('split')
        }
        if(this.model.get('isHidden')){
            this.$el.css('background-color','var(--hidden-bg-color)')
        }
        return this;
    },
    onclick: function () {
        app.editorView.renderModel(this.model);
    },
    drop: function(event, index) {
        this.$el.trigger('update-sort', [this.model, index]);
    },  
});