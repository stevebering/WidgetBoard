$.fn.clicktoggle = function (a, b) {
    return this.each(function () {
        var clicked = false;
        $(this).bind("click", function () {
            if (clicked) {
                clicked = false;
                return b.apply(this, arguments);
            }
            clicked = true;
            return a.apply(this, arguments);
        });
    });
};

var widgetBoard = {
    // Sets jQuery identifier
    jQuery: $,

    // Object to store preferencese for widget behavior
    settings: {
        // specify selectors 
        columns: '.column',
        widgetSelector: '.widget',
        handleSelector: '.widget-head',
        contentSelector: '.widget-content',
        // settings for the widgets
        widgetDefault: {
            movable: true,
            removable: true,
            collapsible: true,
            editable: true,
            colorClasses: ['color-yellow', 'color-red', 'color-blue', 'color-white', 'color-orange', 'color-green']
        },
        widgetIndividual: {
            intro: {
                movable: false,
                removable: false,
                collapsible: false
            },
            gallery: {
                colorClasses: ['color-yellow', 'color-red', 'color-white']
            }
        }
    },

    // Initializes methods to be run when page has loaded.
    init: function () {
        this.attachStylesheet('/content/css/widgetboard.js.css');
        this.addWidgetControls();
        this.makeSortable();
    },

    // Get default and per-widget settings specified in the settings
    // object and return a new object combining the two, giving per-widget 
    // setting precedence.
    // parameter: id of widget
    getWidgetSettings: function (id) {
        var settings = this.settings;
        return (id && settings.widgetIndividual[id]) ?
            $.extend({}, settings.widgetDefault, settings.widgetIndividual[id])
            : settings.widgetDefault;
    },

    // Adds controls (e.g. 'X' close button) to each widget
    addWidgetControls: function () {
        // this function will add controls to each widget
        var widgetBoard = this,
                $ = this.jQuery,
                settings = this.settings;

        // loop through each widget 
        $(settings.widgetSelector, $(settings.columns)).each(function () {
            // merge individual settings with the default widget settins 
            var thisWidgetSettings = widgetBoard.getWidgetSettings(this.id);
            // if removable is true
            if (thisWidgetSettings.removable) {
                // create new anchor element with class of 'remove'
                $('<a href="#" class="remove">CLOSE</a>')
                    .mousedown(function (e) {
                        // stop event bubbling
                        console.log('clicked on close button');
                        e.stopPropagation();
                    }).click(function () {
                        // confirm action -- make sure the user is sure
                        if (confirm('This widget will be removed, ok?')) {
                            // animate widget to an opacity of 0:
                            $(this).parents(settings.widgetSelector).animate({
                                opacity: 0
                            }, function () {
                                // when animation has finished"
                                // wrap in a div and slide up:
                                $(this).wrap('<div/>').parent().slideUp(function () {
                                    // when sliding up has finished, remove widget from DOM:
                                    $(this).remove();
                                });
                            });
                        }
                        // return false to prevent default action
                        return false;
                    })
                // no append the new button to the widget handle
                    .appendTo($(settings.handleSelector, this));
            }
            // if editable option is true
            if (thisWidgetSettings.editable) {
                // create a new anchor element with a class of 'edit':
                $('<a href="#" class="edit">EDIT</a>')
                    .mousedown(function (e) {
                        console.log('click on edit button');
                        // stop event bubbling
                        e.stopPropagation();
                    }).clicktoggle(function () {
                        // toggle (first state): 
                        console.log('toggling edit to first state');
                        // change background image so the button now reads 'close edit':
                        $(this).css({ backgroundPosition: '-66px 0', width: '55px' })
                        // traverse the widget (list item):
                        .parents(settings.widgetSelector)
                        // find the edit-box, show it, then focus <input/>
                        .find('.edit-box').show().find('input').focus();
                        // return false to prevent default action
                        return false;
                    }, function () {
                        // toggle (second state):
                        console.log('toggling edit to first state');
                        // reset background and width (will default to stylesheet specification)
                        $(this).css({ backgroundPosition: '', width: '' })
                        // traverse to widget (list item):
                        .parents(settings.widgetSelector)
                        // find the edit-box and hide it
                        .find('.edit-box').hide();
                        // return false to prevent default action
                        return false;
                    })
                // append the actual editing section (edit-box)
                    .appendTo($(settings.handleSelector, this));
                // add the actual editing section (edit-box):
                $('<div class="edit-box" style="display: none;" />')
                        .append('<ul><li class="item"><label>Change the title?</label><input value="' + $('h3', this).text() + '"/></li>')
                        .append((function () {
                            // compile list of available colors:
                            var colorList = '<li class="item"><label>Available colors:</label><ul class="colors">';
                            // loop through available colors and add a list item for each
                            $(thisWidgetSettings.colorClasses).each(function () {
                                colorList += '<li class="' + this + '"/>';
                            });
                            // return (to append function) the entire color list:
                            return colorList + '</ul>';
                        })())
                // finish off list
                        .append('</ul>')
                // insert the edit-box below the widget handle:
                        .insertAfter($(settings.handleSelector, this));
            }
            // if collapsible option is true
            if (thisWidgetSettings.collapsible) {
                // create a new anchor with a class of collapse
                $('<a href="#" class="collapse">COLLAPSE</a>')
                    .mousedown(function (e) {
                        console.log('click on collapse button');
                        // stop event bubbling
                        e.stopPropagation();
                    }).clicktoggle(function () {
                        // toggle (first state)
                        console.log('toggling collapse to first state');
                        // change background up-arrow to down-arrow
                        $(this).css({ backgroundPosition: '-38px 0' })
                        // traverse to widget (list item)
                        .parents(settings.widgetSelector)
                        // find content within widget and HIDE it
                        .find(settings.contentSelector).hide();
                        // return false to prevent default action
                        return false;
                    }, function () {
                        // toggle (second state) 
                        console.log('toggling collapse to second state');
                        // change background down-arrow to up-arrow
                        $(this).css({ backgroundPosition: '' })
                        // traverse to widget (list item) 
                        .parents(settings.widgetSelector)
                        // find content within widget and SHOW it
                        .find(settings.contentSelector).show();
                        // return false to prevent default action
                        return false;
                    })
                // prepend that collapse button to the widget's handle
                    .prependTo($(settings.handleSelector, this));
            }
        });
        // loop through each edit-box (under each widget that has an edit-box)
        $('.edit-box').each(function () {
            // assign a function to the onKeyUp event of the input
            $('input', this).keyup(function () {
                // traverse up to widget and find the title, set text to the input element's value.
                // if the value is longer than 20 chars then truncate the remainder
                $(this).parents(settings.widgetSelector).find('h3').text(
                        $(this).val().length > 20 ? $(this).val().substring(0, 20) + '...' : $(this).val()
                    );
            });
            // assign a function to the click event of each color list item
            $('ul.colors li', this).click(function () {
                // define colorStylePattern to match a class with prefix 'color-'
                var colorStylePattern = /\bcolor-[\w]{1,}\b/,
                // define thisWidgetColorClass as the color class of the widget
                        thisWidgetColorClass = $(this).parents(settings.widgetSelector).attr('class').match(colorStylePattern);
                // if a class matching the pattern does exist
                if (thisWidgetColorClass) {
                    // traverse to widget 
                    $(this).parents(settings.widgetSelector)
                    // remove the old color class
                        .removeClass(thisWidgetColorClass[0])
                    // add new color class (n.b. 'this' refers to clicked list item
                        .addClass($(this).attr('class').match(colorStylePattern)[0]);
                }
                // return false to prevent default action
                return false;
            })
        })
    },

    // Creates a new link element with specified href and appends to <head>
    // parameter: url of stylesheet to reference 
    attachStylesheet: function (href) {
        return $('<link href="' + href + '" rel="stylesheet" type="text/css" />').appendTo('head');
    },

    // Makes widgets sortable (draggable/droppable) using the jQuery UI 'sortable' module
    makeSortable: function () {
        // this function will make the widgets sortable
        var widgetBoard = this,
            $ = this.jQuery,
            settings = this.settings,
            $sortableItems = (function () {
                // define an empty string which we can add to within the loop.
                var notSortable = '';
                // loop through each widget in the 3 columns
                $(settings.widgetSelector, $(settings.columns)).each(function (i) {
                    // if the movable property is set to false:
                    if (!widgetBoard.getWidgetSettings(this.id).movable) {
                        // if the widget has no ID:
                        if (!this.id) {
                            // give it an automatically generated id:
                            this.id = 'widget-no-id-' + i;
                        }
                        // add the id to the notSortable string:
                        notSortable += '#' + this.id + ',';
                    }
                })
                // this function will return a jQUery object containtaining movable widgets
                return $('> li:not(' + notSortable + ')', settings.columns);
            })();

        $sortableItems.find(settings.handleSelector).css({
            cursor: 'move'
        }).mousedown(function (e) {
            $sortableItems.css({ width: '' });
            $(this).parent().css({
                width: $(this).parent().width() + 'px'
            });
        }).mouseup(function () {
            if (!$(this).parent().hasClass('dragging')) {
                $(this).parent().css({ width: '' });
            } else {
                // if it is currently being dragged, we want to 
                // temporarily disable dragging, while widget is 
                // reverting to original position
                $(settings.columns).sortable('disable');
            }
        })

        // select the columns and initiate sortable
        $(settings.columns).sortable({
            // specify those items which will be sortable
            items: $sortableItems,
            // connect each column with every other column
            connectWith: $(settings.columns),
            // set the handle to the top bar
            handle: settings.handleSelector,
            // define class of placeholder 
            placeholder: 'widget-placeholder',
            // make sure placeholder sze is retained
            forcePlaceholderSize: true,
            // animated revert lasts how long?
            revert: 300,
            // delay before action:
            delay: 100,
            // opacity of helper (the thing that's dragged)
            opacity: 0.8,
            // set constraint of dragging to the document's edge:
            containment: 'document',
            // function to be called when dragging starts
            start: function (e, ui) {
                $(ui.helper).addClass('dragging');
            },
            // function to be called when dragging stops:
            stop: function (e, ui) {
                // reset width of units and remove dragging class:
                $(ui.item).css({ width: '' }).removeClass('dragging');
                // re-enable sortin (we disabled it on mouseup of handle):
                $(settings.columns).sortable('enable');
            }
        });
    }
};

widgetBoard.init();