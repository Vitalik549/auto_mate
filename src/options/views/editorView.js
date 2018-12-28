var EditorView = Backbone.View.extend({
    model: null,
    tagName: 'div',
    el: '#editor',
    initialize: function (model) {
        this.model = model;
        _.bindAll(this, 'editorChanged');
        _.bindAll(this, 'setModel');
        _.bindAll(this, 'nameChanged');
        _.bindAll(this, 'clickRemoveButton');
        _.bindAll(this, 'render');
        _.bindAll(this, 'renderEmpty');
        _.bindAll(this, 'renderModel');
        _.bindAll(this, 'checkboxChanged');
        _.bindAll(this, 'showWhenChanged');
        _.bindAll(this, 'drawCheckbox');
        _.bindAll(this, 'isHiddenToggled');
    },
    events: {
        "keyup #nameInput": "nameChanged",
        "change #isSplit": "checkboxChanged",
        "change #showInput": "checkboxChanged",
        "change #isHidden": "isHiddenToggled",
        "keyup #scriptArea": "editorChanged",
        "keyup #showWhen": "showWhenChanged",
        "click #remove": "clickRemoveButton"
    },
    renderModel: function (buttonModel) {
        this.stopListening();
        this.model = buttonModel;
        this.listenTo(this.model, 'change:isHidden', this.render);
        return this.render();
    },
    render: function () {
        // Clear previous data
        $(this.el).empty();

        this.header = $('<div>')
            .attr("id", "name-header")
            .css('background-color', this.model.get('isHidden') ? 'var(--hidden-bg-color)' : 'var(--main-bg-color)')
            .appendTo(this.el);

        this.content = $('<div>')
            .attr("id", "editor-content")
            .appendTo(this.el);

        // add name
        $("<img>")
            .attr("src", "./../../../images/edit_icon.svg")
            .click(() => {
                $('#nameInput').focus()
            })
            .appendTo(this.header);

        this.nameInput = $("<input id='nameInput' type='text' />").attr('maxlength', '30')
            .val(this.model.get('buttonName') || "")
            .appendTo(this.header)

        // close button 
        $('<div>')
            .addClass('deleteVar')
            .addClass('close')
            .prop('title', 'Close')
            .appendTo(this.header)
            .click(()=>{
                app.editorView.renderEmpty();
            })

        //add checkboxes
        this.isHiddenCheckbox = this.drawCheckbox(
            'Hide in popup',
            "When checked, button won't be shown regardless of 'Show button script' results",
            'isHidden')

        this.isSplitCheckbox = this.drawCheckbox(
            'Split',
            'Separate current button in popup for better visibility',
            'isSplit')

        this.isShowInputCheckbox = this.drawCheckbox(
            'Show input',
            'Add input value as parameter to executable script',
            'showInput')

        // add script input

        this.scriptInput = $("<textarea id='scriptArea' placeholder='put script here' />")
            .val(this.model.get('script') || "")

        $("<label>")
            .text("Script")
            .attr('title', "Script to execute on browser page upon button click.")
            .append(this.scriptInput)
            .appendTo(this.content);

        $(this.el).on('change keyup keydown paste cut', '#scriptArea', function () {
            $(this).height(0).height(this.scrollHeight);
        }).find('#scriptArea').change();

        // add show when
        this.showWhen = $("<textarea id='showWhen' placeholder='put script here' />")
            .val(this.model.get('showWhen') || "")
            .prop('disabled', this.model.get('isHidden'));

        let label = $("<label>")
            .text("Show button when")
            .attr('title', "Button will be shown if script returns true or script is empty.")
            .append(this.showWhen)
            .appendTo(this.content);

        $(this.el).on('change keyup keydown paste cut', '#showWhen', function () {
            $(this).height(0).height(this.scrollHeight);
        }).find('#showWhen').change();

        $('<br/>').appendTo(this.content);

        // remove button 
        this.removeButton = $("<button id='remove' >Delete</button>")
            .attr('title', "Delete button")
            .css('float', 'right')
            .appendTo(this.content);

        return this;
    },
    drawCheckbox: function (text, title, property) {
        var checkboxWrapper = $("<label class='container' />", )
            .text(text)
            .attr('title', title)
            .appendTo(this.content);

        var inputElement = $("<input type='checkbox'/>")
            .prop('checked', this.model.get(property) || false)
            .attr('id', property)
            .appendTo(checkboxWrapper);

        $("<span class='checkmark'></span>").appendTo(checkboxWrapper);
        return inputElement;
    },
    editorChanged: function () {
        this.model.set('script', this.scriptInput.val());
    },
    showWhenChanged: function () {
        this.model.set('showWhen', this.showWhen.val());
    },
    checkboxChanged: function () {
        this.model.set('isSplit', this.isSplitCheckbox.prop('checked'));
        this.model.set('showInput', this.isShowInputCheckbox.prop('checked'));
    },
    isHiddenToggled: function () {
        this.model.set('isHidden', this.isHiddenCheckbox.prop('checked'));
    },
    nameChanged: function (evt) {
        var newName = this.nameInput.val();
        this.model.set('buttonName', newName);
    },
    clickRemoveButton: function (evt) {
        app.buttonsView.collection.remove(this.model)

        this.renderEmpty();
    },
    setModel: function (buttonModel) {
        this.model = buttonModel;
        return this;
    },
    renderEmpty() {
        this.$el.empty()
        this.content = $('<div>')
            .attr("id", "editor-content")
            .appendTo(this.el);

        $('<p>').text("Execute a JavaScipt code block on browser page by clicking a single button.").appendTo(this.content)

        $('<p>').text("'MATE.variableName' to get existing variable in code:").appendTo(this.content)
        $('<code>').text("console.log(MATE.login);").appendTo($('<pre>').appendTo(this.content))

        $('<p>').text("'MATE.setVar(key, value)' to create custom variable which will be saved in settings and could be reused by other scripts:").appendTo(this.content)
        $('<code>').text("MATE.setVar('current-time', Date.now());").appendTo($('<pre>').appendTo(this.content))
    },
});