;(function ( $, window, document, undefined ) {
    var defaults = {
            'threshold': 60,
            'dotColor': '#1cdeb4',
            'frameColor': 'rgba(223, 230, 173, 0.18)'
        },
        properties = {},
        $dots;

    positions = ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l'];
    directions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

    function onInit(element, options){
        if (element.data('resizbl')) {
            return;
        }
        settings = $.extend({}, defaults, options);
        properties.element = element;
        element.data('resizbl', true);
        createControls(element);
        element.addClass('resizbl');

        $dots = $(element.find(".dot"));
        $dots.on('mousedown', onDotDragStart);
    }

    function onDestroy(element){
        if (!element.data('resizbl')) {
            return;
        }
        element.data('resizbl', false);
        element.removeClass('resizbl');
        element.find('.controls').empty();

    }

    function createControls(element){
        var controls = $('<div>').addClass('controls').css('backgroundColor', settings.frameColor);
        directions.forEach(function(direction, index){
            controls.append(
                $('<div>')
                    .addClass('dot')
                    .addClass(positions[index])
                    .attr('data-visual-direction', direction)
            );
        });
        element.append(controls);
    }

    function recalcDotsSizes(e){
        var math = Math,
            floor = math.floor,
            position = {
                left: e.pageX,
                top: e.pageY
            },
            dot,
            _distance,
            nearest = 0,
            nearestDistance = Infinity,
            maxRadius = 13,
            threshold = settings.threshold,
            dotSize = 10,
            marginX = ["left", "left", "right", "right", "right", "left", "left", "left"],
            marginY = ["top", "top", "top", "top", "bottom", "bottom", "bottom", "top"],
            marginDirectionX = 'margin-'+marginX[nearest],
            marginDirectionY = 'margin-'+marginY[nearest];
        for (var i = 0; i < $dots.length; i++) {
            _distance = distance(position, $($dots[i]).offset());

            if (_distance < nearestDistance) {
                nearestDistance = _distance;
                nearest = i;
            }
        }

        $dots.attr("style", "");

        if (nearestDistance > threshold) { return; }

        dotSize = 2 * floor(((maxRadius / threshold) * (threshold - nearestDistance)) / 2)+ 1;

        dot = {
            'backgroundColor': settings.dotColor,
            'width': dotSize,
            'height': dotSize
        };
        dot['margin-'+marginX[nearest]] = -floor(dotSize/2);
        dot['margin-'+marginY[nearest]] = -floor(dotSize/2);

        $dots.eq(nearest).css(dot);

    }

    function distance(a, b){
        var math = Math,
            sqrt = math.sqrt,
            floor = math.floor,
            x = a.left - parseInt(b.left),
            y = a.top - parseInt(b.top);

        return floor(sqrt(x*x + y*y));
    }

    function onDotDragStart(e){
        var container = $(e.target).parents('.resizbl');
        properties.direction = $(e.target).data('visual-direction');
        properties.x = e.clientX;
        properties.y = e.clientY;
        properties.width = parseInt(container.css('width'), 10);
        properties.height = parseInt(container.css('height'), 10);
        properties.top = parseInt(container.css('top'), 10);
        properties.left = parseInt(container.css('left'), 10);

        // console.log(properties);
        $(document).on('mousemove', onDotDrag);
        $(document).on('mouseup', onDotDragEnd);
        $(document).off('.resizbl', recalcDotsSizes);
        e.preventDefault();
    }

    function onDotDrag(e){
        onResize(e.clientX, e.clientY);
    }

    function onResize(x, y){
        var parent = properties.element,
            direction = properties.direction,
            style = {};

        switch (direction) {
            case "nw":
            case "ne":
            case "n":
                style.top = y;
                style.height = properties.height + (properties.y - y);
                break;
            case "sw":
            case "se":
            case "s":
                style.height = properties.height - (properties.y - y);
        }

        switch (direction) {
            case "nw":
            case "sw":
            case "w":
                style.left = x;
                style.width = properties.width - (x - properties.x);
                break;
            case "se":
            case "ne":
            case "e":
                style.width = properties.width + (x - properties.x);
        }

        parent.css(style);
    }

    function onDotDragEnd(){
        $(document).off('mousemove', onDotDrag);
        $(document).off('mouseup', onDotDragEnd);
        $(document).on('mousemove.resizbl', recalcDotsSizes);
    }

    var _public = {
        init: function(options) {
            onInit(this, options);
            return this.each(function() {
                $(document).on('mousemove.resizbl', recalcDotsSizes);
            });
        },
        destroy: function() {
            onDestroy(this);
            return this.each(function() {
                $(document).off('.resizbl', recalcDotsSizes);
            });
        },
        show: function() {
            if (!this.data('resizbl')) {
                return;
            }
            this.find('.controls').show();
        },
        hide: function() {
            if (!this.data('resizbl')) {
                return;
            }
            this.find('.controls').hide();
        },
        update: function(content) {}
    };

    $.fn.resizbl = function(method) {

        if (_public[method]) {
            return _public[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return _public.init.apply(this, arguments);
        } else {
            $.error('there is no "' + method + '" method in jQuery.resizbl');
        }

    };

})(jQuery, window, document);

$(function(){
    $('.some-element').resizbl();
});
