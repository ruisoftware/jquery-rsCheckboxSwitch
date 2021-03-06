/**
* jQuery Checkbox Switch - Toggle control with animation capabilities.
* ====================================================================
*
* Licensed under The MIT License
* 
* @version   1
* @author    Jose Rui Santos
*
* For info, please scroll to the bottom.
*/(function ($, undefined) {
    'use strict';
    var SwitchClass = function ($elem, opts) {
        var $switch = null,
            initialValue = false,
            mouseIsDown = false,
            $animObj = null,
            isDocumentKeyEventsBound = false,
            isSlidingType,
            optionsTogglePushType,
            tabIndex,
            
            // sliding type related data
            $sliderBar = null,
            $sliderHandle = null,
            slidingPos = 0,
            mouseDownPos = 0,
            startPos = 0,
            startPosSwitch = false,
            dragged = false,
            originalClass = null,
            originalStyle = null,
            size = 0,      // width of the outer element if opts.slidingType.horizontal is true, height otherwise
            sizeInner = 0, // width of the inner element if opts.slidingType.horizontal is true, height otherwise. sizeInner should always be greater than size.
            
            // Toggle type related data
            currFrame = 1,
            isSelfClosing = function($e) {
                return /^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i.test($e[0].tagName);
            },
            getCssPos = function($e) {
                var json = {},
                    checkProperty = function(prop) {
                        var value = $e.css(prop);
                        if (value !== 'auto') {
                            json[prop] = value;
                        }
                    },
                    wasVisible = $e.css('display') !== 'none';
                // to stop the browser (eg Firefox) from returning computed position values and return the declared positions, need to hide the element
                try {
                    $e.hide();
                    checkProperty('top');
                    checkProperty('right');
                    checkProperty('bottom');
                    checkProperty('left');
                } finally {
                    if (wasVisible) {
                        $e.show();
                    }
                }
                return json;
            },
            getCheckedAttrName,
            init = function() {
                if ($elem.is('input[type=checkbox]')) {
                    getCheckedAttrName = function() {
                        return 'checked';
                    };
                } else {
                    getCheckedAttrName = function() {
                        return 'data-checked';
                    };
                }
                isSlidingType = opts.type === 'sliding';
                if (!isSlidingType) {
                    optionsTogglePushType = opts.type === 'push' ? opts.pushType : opts.toggleType;
                }
                tabIndex = $elem.attr('tabindex');
                // input elements are focusable, even if there is no tabindex attribute
                if ($elem.is('input') && tabIndex === undefined) {
                    tabIndex = 0;
                }
                var elemCssPos = $elem.css('position'),
                    isInline = isSelfClosing($elem),
                    $switchInnerElem = null;
                originalClass = $elem.attr('class');
                originalStyle = $elem.attr('style');
                if (isSlidingType || isInline) {
                    $switchInnerElem = $elem.wrap($('<div>').addClass('hiddenwrap')).hide().parent();
                    $switch = $switchInnerElem.wrap($('<div>').addClass(isSlidingType ? opts.slidingType.outerClass : null)).parent();
                    if (isInline) {
                        $switch.addClass($elem.attr('class')).css('position', elemCssPos);
                        if (isSlidingType) {
                            $switch.css(getCssPos($elem));
                        }
                        $elem.removeAttr('class');
                    }
                    if (tabIndex !== undefined) {
                        $elem.removeAttr('tabindex');
                        $switch.attr('tabindex', tabIndex);
                    }
                } else {
                    var $textNodes = $elem.contents().filter(function () { return this.nodeType === 3; });
                    if ($textNodes.length) {
                        $elem.wrap($('<div>').addClass('textwrapper'));
                    }
                    $switch = $elem.parent().append($('<div>').addClass('hiddenwrap'));
                }
                if (isSlidingType) {
                    $sliderBar = $('<div>').addClass(opts.slidingType.sliderClass).css('position', 'relative');
                    $switchInnerElem = $switchInnerElem || $("div:first-child", $switch);
                    $switchInnerElem.css({
                        'display': 'inline-block',
                        'position': 'relative',
                        'overflow': 'hidden'
                    }).append($sliderBar);
                    // need to retrieve the $sliderHandle height or width, so add it temporarily as hidden to the DOM
                    $sliderHandle = $('<div>').hide().addClass(opts.slidingType.handleClass);
                    $sliderBar.append($sliderHandle);

                    if (elemCssPos === 'static') {
                        $switch.css('position', 'relative');
                    } else {
                        $switch.css('position', elemCssPos).css(getCssPos($elem));
                    }
                    $switch.css('display', 'inline-block');
                    if (!opts.slidingType.horizontal && !!opts.slidingType.verticalClass) {
                        $switch.addClass(opts.slidingType.verticalClass);
                    }
                    if (opts.slidingType.flipped) {
                        $switch.addClass(opts.slidingType.flippedClass);
                    }
                    if (opts.slidingType.horizontal) {
                        $switch.css({
                            'width': (($sliderBar.outerWidth(true) + $sliderHandle.outerWidth(true)) / 2) + 'px',
                            'height': $sliderBar.outerHeight(true) + 'px'
                        });
                    } else {
                        $switch.css({
                            'width': $sliderBar.outerWidth(true) + 'px',
                            'height': (($sliderBar.outerHeight(true) + $sliderHandle.outerHeight(true)) / 2) + 'px'
                        });
                    }
                    $sliderHandle.css({
                        'display': '',  // remove the display to show it (not as $sliderHandle.show())
                        'position': 'absolute'
                    }); 

                    if (opts.enabled) {
                        $sliderBar.bind('mousedown.rsCheckboxSwitch', onmousedown);
                        $sliderHandle.bind('mousedown.rsCheckboxSwitch', onmousedownHandle);
                    } else {
                        if (opts.disabledClass) {
                            $switch.addClass(opts.disabledClass);
                        }
                    }
                    sizeInner = opts.slidingType.horizontal ? $sliderBar.width() : $sliderBar.height();
                    size = opts.slidingType.horizontal ? $switch.width() : $switch.height();
                } else {
                    if (elemCssPos === 'static') {
                        $switch.css('position', 'relative');
                    }
                    $switch.css('display', 'inline-block').addClass(optionsTogglePushType.outerClass);
                    if (opts.enabled) {
                        $switch.bind('mousedown.rsCheckboxSwitch', onmousedown).bind('mouseup.rsCheckboxSwitch', onmouseup);
                    } else {
                        if (opts.disabledClass) {
                            $switch.addClass(opts.disabledClass);
                        }
                    }
                    if (optionsTogglePushType.caption) {
                        $switch.append(optionsTogglePushType.caption);
                    }
                    if (optionsTogglePushType.showOnOff) {
                        $switch.append($('<span>').addClass(optionsTogglePushType.onOffClass));
                    }
                    if (!$switch.height()) {
                        $switch.height($switch.css('line-height'));
                    }
                }
                if (!opts.enabled && tabIndex !== undefined) {
                    $switch.removeAttr('tabindex');
                }
                initialValue = isOnInput();
                /*jshint -W030 */
                initialValue? doOn(false, null) : doOff(false, null);
                toggleClassOnOff(initialValue);
                $elem.
                    bind('getter.rsCheckboxSwitch', onGetter).
                    bind('setter.rsCheckboxSwitch', onSetter).
                    bind('refresh.rsCheckboxSwitch', onRefresh).
                    bind('toggle.rsCheckboxSwitch', onToggle).
                    bind('rollback.rsCheckboxSwitch', onRollback).
                    bind('commit.rsCheckboxSwitch', onCommit).
                    bind('onChange.rsCheckboxSwitch', onChange).
                    bind('onChangeOn.rsCheckboxSwitch', onChangeOn).
                    bind('onChangeOff.rsCheckboxSwitch', onChangeOff).
                    bind('destroy.rsCheckboxSwitch', onDestroy).
                    bind('on.rsCheckboxSwitch', onOn).
                    bind('off.rsCheckboxSwitch', onOff);

                $switch.
                    bind('focus.rsCheckboxSwitch', gotFocus).
                    bind('blur.rsCheckboxSwitch', loseFocus);
            },
            isOnInput = function() {
                return $elem.attr(getCheckedAttrName()) === 'checked'; 
            },
            isOffInput = function() {
                return !isOnInput();
            },
            isOnSwitch = function() {
                if (isSlidingType) {
                    var isLeftOrTopSide = slidingPos > (size - sizeInner)/size/2;
                    if (opts.slidingType.flipped) { // then ON is on the right (or bottom)
                        return !isLeftOrTopSide;
                    } else { // then ON is on the left (or top)
                        return isLeftOrTopSide;
                    }
                } else {
                    return currFrame > 1;
                }
            },
            isOffSwitch = function() {
                return !isOnSwitch();
            },
            doOnOffSliding = function(anim, changeToOn, onFinish) {
                var dest = changeToOn ? (opts.slidingType.flipped ? size - sizeInner : 0) : (opts.slidingType.flipped ? 0 : size - sizeInner),
                    relativeDuration,
                    property = opts.slidingType.horizontal ? 'left' : 'top',
                    animProp,
                    doComplete = function () {
                        slidingPos = dest;
                        $sliderBar.css(property, slidingPos*100 + '%');
                        $animObj = null;
                        if (onFinish) {
                            onFinish();
                        }
                    };
                dest /= size;
                if (anim && sizeInner > size) {
                    relativeDuration = Math.abs((dest - slidingPos)*size/(sizeInner - size))*opts.speed;
                    if (relativeDuration < 10) { // Not worth animating if it takes less than 10 miliseconds
                        doComplete();
                    } else {
                        animProp = {};
                        animProp[property] = dest*100 + '%';
                        $animObj = $sliderBar.css(property, slidingPos*100 + '%');
                        $animObj.animate(animProp, {
                            queue: false,
                            duration: relativeDuration,
                            step: function (now) {
                                slidingPos = now/100;
                            },
                            complete: doComplete
                        });
                    }
                } else {
                    doComplete();
                }
            },
            doOnOffToggle = function(anim, changeToOn, onFinish) {
                var qtFrames = optionsTogglePushType && optionsTogglePushType.frameClasses ? optionsTogglePushType.frameClasses.length : 0;
                if (qtFrames > 0) {
                    var dest = changeToOn ? qtFrames : 1,
                        prevFrame = 0,
                        doStep = function (now) {
                            var frame = Math.round(now);
                            if (prevFrame === 0 || frame !== prevFrame) {
                                $switch.removeClass(optionsTogglePushType.frameClasses[(prevFrame === 0 ? currFrame : prevFrame) - 1]).addClass(optionsTogglePushType.frameClasses[frame - 1]);
                                prevFrame = currFrame = frame;
                                if (frame === dest) {
                                    doComplete();
                                }
                            }
                         },
                        doComplete = function () {
                            $animObj = null;
                            currFrame = dest;
                            if (onFinish) {
                                onFinish();
                            }
                        };
                    if (anim) {
                        $animObj = $({ 'n': currFrame });
                        $animObj.animate({ 'n': dest }, { 
                            queue: false,
                            duration: opts.speed,
                            step: doStep
                        });
                    } else {
                        doStep(dest);
                        doComplete();
                    }
                }
            },
            doOnOff = function(anim, changeToOn, onFinish) {
                if (isSlidingType) {
                    doOnOffSliding(anim, changeToOn, onFinish);
                } else {
                    doOnOffToggle(anim, changeToOn, onFinish);
                }
            },
            doOn = function(anim, onFinish) {
                doOnOff(anim, true, onFinish);
            },
            doOff = function(anim, onFinish) {
                doOnOff(anim, false, onFinish);
            },
            checkChangedClass = function () {
                var isOn = isOnInput();
                if (initialValue === isOn) {
                    $switch.removeClass(opts.changedClass);
                } else {
                    $switch.addClass(opts.changedClass);
                }
                toggleClassOnOff(isOn);
            },
            toggleClassOnOff = function (isOn) {
                $switch.removeClass(isOn ? 'off' : 'on').addClass(isOn ? 'on' : 'off');
            },
            resetToggleClasses = function () {
                $switch.removeClass('off on');
            },
            triggerOn = function (fireEvents) {
                $elem.attr(getCheckedAttrName(), 'checked');
                checkChangedClass();
                if (fireEvents) {
                    $elem.triggerHandler('onChange.rsCheckboxSwitch', [true]);
                    $elem.triggerHandler('onChangeOn.rsCheckboxSwitch');
                }
            },
            triggerOff = function (fireEvents) {
                $elem.removeAttr(getCheckedAttrName());
                checkChangedClass();
                if (fireEvents) {
                    $elem.triggerHandler('onChange.rsCheckboxSwitch', [false]);
                    $elem.triggerHandler('onChangeOff.rsCheckboxSwitch');
                }
            },
            on = function(anim, fireEvents) {
                var state = isOnInput();
                resetToggleClasses();
                doOn(anim === undefined ? true : anim, function() {
                    if (fireEvents === undefined) {
                        if (state !== isOnSwitch()) {
                            triggerOn(true);
                        } else {
                            toggleClassOnOff(true);
                        }
                    } else {
                        triggerOn(fireEvents);
                    }
                });
            },
            off = function(anim, fireEvents) {
                var state = isOffInput();
                resetToggleClasses();
                doOff(anim === undefined ? true : anim, function() {
                    if (fireEvents === undefined) {
                        if (state !== isOffSwitch()) {
                            triggerOff(true);
                        } else {
                            toggleClassOnOff(false);
                        }
                    } else {
                        triggerOff(fireEvents);
                    }
                });
            },
            onmousedownHandle = function (e) {
                $sliderHandle.addClass(opts.slidingType.pushdownClass);
                onmousedown(e);
            },
            onmousedown = function (e) {
                e.preventDefault();
                if ($animObj) { // is some animation going on?
                    if (!isSlidingType) { // if is toggle type, then let the first animation finish
                        mouseIsDown = false;
                        return;
                    }
                    $animObj.stop();
                }
                mouseIsDown = true;
                if (isSlidingType) {
                    startPos = slidingPos;
                    startPosSwitch = isOnSwitch();
                    dragged = false;
                    mouseDownPos = opts.slidingType.horizontal ? e.pageX : e.pageY;
                    $(document).bind('mouseup.rsCheckboxSwitch', onmouseup).bind('mousemove.rsCheckboxSwitch', onmousemove);
                    $switch.addClass(opts.slidingType.draggingClass);
               }
               $switch.focus();
            },
            onmousemove = function (e) { // onmousemove is only for sliding type
                e.preventDefault();
                if (mouseIsDown) {
                    var mouseOffset = mouseDownPos - (opts.slidingType.horizontal ? e.pageX : e.pageY),
                        newValue = startPos - mouseOffset/size;
                    if (newValue <= 0  && newValue >= (size - sizeInner)/size) {
                        slidingPos = newValue;
                        $sliderBar.css(opts.slidingType.horizontal ? 'left' : 'top', slidingPos*100 + '%');
                        dragged = true;
                    }
                }
            },
            onmouseup = function (e) {
                e.preventDefault();
                if (mouseIsDown) {
                    mouseIsDown = false;
                    if (isSlidingType) {
                        $(document).unbind('mouseup.rsCheckboxSwitch', onmouseup).unbind('mousemove.rsCheckboxSwitch', onmousemove);
                        $switch.removeClass(opts.slidingType.draggingClass);
                        $sliderHandle.removeClass(opts.slidingType.pushdownClass);
                        if (!dragged) {
                            onToggle();
                        } else {
                            /*jshint -W030 */
                            startPosSwitch ? off() : on();
                        }
                    } else {
                        onToggle();
                    }
                }
            },
            onGetter = function (event, field) {
                switch (field) {
                    case 'onChange': return opts.onChange;
                    case 'onChangeOn': return opts.onChangeOn;
                    case 'onChangeOff': return opts.onChangeOff;
                    case 'changed': return initialValue !== isOnInput();
                    case 'value': return isOnInput();
                    case 'enabled': return opts.enabled;
                }
                return null;
            },
            onSetter = function (event, field, value) {
                switch (field) {
                    case 'onChange':
                        opts.onChange = value;
                        break;
                    case 'onChangeOn':
                        opts.onChangeOn = value;
                        break;
                    case 'onChangeOff': 
                        opts.onChangeOff = value;
                        break;
                    case 'enabled':
                        if (opts.enabled && value === false) {
                            // from enabled to disabled
                            opts.enabled = false;
                            if (isSlidingType) {
                                $sliderBar.unbind('mousedown.rsCheckboxSwitch', onmousedown);
                                $sliderHandle.unbind('mousedown.rsCheckboxSwitch', onmousedownHandle);
                            } else {
                                $switch.unbind('mousedown.rsCheckboxSwitch', onmousedown).unbind('mouseup.rsCheckboxSwitch', onmouseup);
                            }
                            if (opts.disabledClass) {
                                $switch.addClass(opts.disabledClass);
                            }
                            if (tabIndex !== undefined) {
                                $switch.removeAttr('tabindex');
                            }
                        } else {
                            if (!opts.enabled && value === true) {
                                // from disabled to enabled
                                opts.enabled = true;
                                if (isSlidingType) {
                                    $sliderBar.bind('mousedown.rsCheckboxSwitch', onmousedown);
                                    $sliderHandle.bind('mousedown.rsCheckboxSwitch', onmousedownHandle);
                                } else {
                                    $switch.bind('mousedown.rsCheckboxSwitch', onmousedown).bind('mouseup.rsCheckboxSwitch', onmouseup);
                                }
                                if (opts.disabledClass) {
                                    $switch.removeClass(opts.disabledClass);
                                }
                                if (tabIndex !== undefined) {
                                    $switch.attr('tabindex', tabIndex);
                                }
                            }
                        }
                }
                return $(this);
            },
            updateTo = function(value, anim, fireEvents) {
                /*jshint -W030 */
                value ? on(anim, fireEvents) : off(anim, fireEvents);
                return $(this);
            },
            onRefresh = function (event, fireEvents) {
                return updateTo(isOnInput(), false, fireEvents);
            },
            onToggle = function () {
                /*jshint -W030 */
                isOnSwitch() ? off() : on();
                return $(this);
            },
            onOn = function (event, anim, fireEvents) {
                return updateTo(true, anim, fireEvents);
            },
            onOff = function (event, anim, fireEvents) {
                return updateTo(false, anim, fireEvents);
            },
            onRollback = function (event, fireEvents) {
                if (initialValue !== isOnInput()) {
                    updateTo(initialValue, true, fireEvents);
                }
                return $(this);
            },
            onCommit = function () {
                initialValue = isOnInput();
                return $(this);
            },
            onChange = function (event, value) {
                if (opts.onChange) {
                    opts.onChange(event, $elem, value);
                }
                return $(this);
            },
            onChangeOn = function (event) {
                if (opts.onChangeOn) {
                    opts.onChangeOn(event, $elem);
                }
                return $(this);
            },
            onChangeOff = function (event) {
                if (opts.onChangeOff) {
                    opts.onChangeOff(event, $elem);
                }
                return $(this);
            },
            onKeydown = function (event) {
                var key = {
                        enter: 13,
                        esc: 27,
                        space: 32
                    }, allowedKey = function () {
                        switch (event.which) {
                            case key.enter: return $.inArray('enter', opts.keyboard.allowed) > -1;
                            case key.esc:   return $.inArray('esc', opts.keyboard.allowed) > -1;
                            case key.space: return $.inArray('space', opts.keyboard.allowed) > -1; 
                        }
                        return false;
                    };

                if (opts.enabled && allowedKey()) {
                    switch (event.which) {
                        case key.space: onToggle();
                                        break;
                        case key.enter: if (opts.keyboard.toggleOnEnter) {
                                            onToggle();
                                        }
                                        break;
                        case key.esc:   if (opts.keyboard.rollbackOnEsc) {
                                            onRollback(null, opts.keyboard.rollbackOnEsc === 'trueWithEvents');
                                        }
                    }
                }
            },
            onDestroy = function () {
                var setAttr = function(attr, value) {
                    $elem.attr(attr, value ? value : '');
                    if ($elem.attr(attr) === '') {
                        $elem.removeAttr(attr);
                    }
                };
                $elem.unbind('.rsCheckboxSwitch');
                $switch.unbind('.rsCheckboxSwitch');
                $(document).unbind('.rsCheckboxSwitch');

                if (isSlidingType) {
                    $sliderBar.unbind('.rsCheckboxSwitch');
                    $sliderHandle.unbind('.rsCheckboxSwitch');
    
                    if (!$elem.is('input') && tabIndex !== undefined) {
                        $elem.attr('tabindex', tabIndex);
                    }
                    $sliderBar.remove();
                    $elem.unwrap().unwrap().show();
                } else {
                    var $contents = $switch.contents();
                    if (optionsTogglePushType.showOnOff && $contents.length > 0) {
                        $contents.last().remove();
                        $contents = $switch.contents();
                    }
                    if (optionsTogglePushType.caption && $contents.length > 0) {
                        $contents.last().remove();
                    }
                    if (!$elem.closest(".hiddenwrap").length) {
                        $switch.find('.hiddenwrap').remove();
                    }
                    if ($switch !== $elem) {
                        if (isSelfClosing($elem)) {
                            $elem.unwrap().unwrap(); // inline elements have an extra parent
                        } else {
                            $elem.unwrap();
                        }
                    } else {
                       $switch.unwrap();
                    }
                }
                setAttr('style', originalStyle);
                setAttr('class', originalClass);
            },
            gotFocus = function () {
                if (!isDocumentKeyEventsBound) {
                    $(document).bind('keydown.rsCheckboxSwitch', onKeydown);
                    isDocumentKeyEventsBound = true;
                }
            },
            loseFocus = function () {
                $(document).unbind('keydown.rsCheckboxSwitch', onKeydown);
                isDocumentKeyEventsBound = false;
                if (opts.keyboard.commitOnBlur) {
                    onCommit();
                }
            };
            
        init();
    };
        
    $.fn.rsCheckboxSwitch = function (options) {
        var refresh = function (options) {
                return options === undefined ? this.trigger('refresh.rsCheckboxSwitch') : this.trigger('refresh.rsCheckboxSwitch', [options === true]);
            },
            toggle = function () {
                return this.trigger('toggle.rsCheckboxSwitch');
            },
            on = function (options, anim) {
                return options === undefined || options.length === 0 ? this.trigger('on.rsCheckboxSwitch', [anim]) : this.trigger('on.rsCheckboxSwitch', [anim, options.length === 1 && options[0] === true]);
            },
            off = function (options, anim) {
                return options === undefined || options.length === 0 ? this.trigger('off.rsCheckboxSwitch', [anim]) : this.trigger('off.rsCheckboxSwitch', [anim, options.length === 1 && options[0] === true]);
            },
            rollback = function (options) {
                return options === undefined ? this.trigger('rollback.rsCheckboxSwitch') : this.trigger('rollback.rsCheckboxSwitch', [options === true]);
            },
            commit = function () {
                return this.trigger('commit.rsCheckboxSwitch');
            },
            destroy = function () {
                return this.trigger('destroy.rsCheckboxSwitch');
            },
            option = function () {
                if (typeof arguments[0] === 'string') {
                    switch (arguments.length) {
                        case 1:
                            return this.eq(0).triggerHandler('getter.rsCheckboxSwitch', arguments);
                        case 2:
                            for (var last = this.length - 1; last > -1; --last) {
                                this.eq(last).triggerHandler('setter.rsCheckboxSwitch', arguments);
                            }
                            return this;
                    }
                }
            };
            
        if (typeof options === 'string') {
            var otherArgs = Array.prototype.slice.call(arguments, 1);
            switch (options) {
                case 'refresh':     return refresh.apply(this, otherArgs);
                case 'toggle':      return toggle.apply(this, otherArgs);
                case 'onAnim':      return on.apply(this, [otherArgs, true]);
                case 'offAnim':     return off.apply(this, [otherArgs, true]);
                case 'on':          return on.apply(this, [otherArgs, false]);
                case 'off':         return off.apply(this, [otherArgs, false]);
                case 'rollback':    return rollback.apply(this, otherArgs);
                case 'commit':      return commit.apply(this, otherArgs);
                case 'destroy':     return destroy.call(this);
                case 'option':      return option.apply(this, otherArgs);
                default: return this;
            }
        }
        var opts = $.extend({}, $.fn.rsCheckboxSwitch.defaults, options);
        opts.slidingType = $.extend({}, $.fn.rsCheckboxSwitch.defaults.slidingType, options ? options.slidingType : options);
        opts.toggleType = $.extend({}, $.fn.rsCheckboxSwitch.defaults.toggleType, options ? options.toggleType : options);
        opts.pushType = $.extend({}, $.fn.rsCheckboxSwitch.defaults.pushType, options ? options.pushType : options);
        opts.keyboard = $.extend({}, $.fn.rsCheckboxSwitch.defaults.keyboard, options ? options.keyboard : options);

        return this.each(function () {
            var $elem = $(this),
                allOpts = $.extend(true, {}, opts);
            if ($elem.is('input[type=checkbox]')) {
                var attrValue = $elem.attr('disabled');
                if (attrValue !== undefined) {
                    allOpts = $.extend({}, allOpts, { enabled: false });
                }
            }
            new SwitchClass($elem, allOpts);
        });
    };

    // public access to the default input parameters
    $.fn.rsCheckboxSwitch.defaults = {
        type: 'sliding', // Determines whether this is a sliding switch or a toggle switch. Type: 'sliding', 'toggle' or 'push' string.
                         // A sliding switch only shows one half (ON or OFF) while the other half is hidden. This means, that the switch must be longer than the container in order to clip the switch.
                         // A toggle or push switch always has the same size. Instead of having a sliding motion, a toggle switch remains in the same location and transitions ON to OFF (or vice-versa) might be animated.
        
        // slidingType is only meaningful if type is 'sliding'
        slidingType: { // multiple classes are separated by a space
            outerClass: 'checkboxswitch-outer sliding corners-rounded', // Classes for the outer container. Type: string.
                                                                // Add:
                                                                // - corners-rounded for full rounded corners;
                                                                // - corners-halfrounded for 50% rounded corners;
                                                                // - corners-quarterrounded for 25% rounded corners;
                                                                // - corners-sharp for no rounded corners;
                                                                // If none of the above three are specified, corners-rounded is used. 
            sliderClass: 'switch',                // Classes for the element that slides inside the outer element. Type: string.
            handleClass: 'handleflat',            // Classes for the handle usually located in the middle of the slider element. Type: string.
            pushdownClass: 'down',                // Classes for the handle when mouse is applied to it. Type: string.
            draggingClass: 'switch-dragging',     // Classes used during the time user is moving the switch with the mouse. Type: string.
            verticalClass: 'vert',                // Classes applied to the topmost element for vertical sliders (when horizontal is false).
            flippedClass: 'flipped',              // Classes applied to the topmost element when the slider is flipped
            flipped: false,     // Determines the location of the on and off. Type: boolean.
                                // When flipped is false, the switch is ON--OFF (for horizontal switches) or ON on the top and OFF on the bottom (for vertical switches)
                                // When flipped is true, the switch is OFF--ON (for horizontal switches) or OFF on the top and ON on the bottom (for vertical switches) 
            horizontal: true    // Determines the switch orientation, either horizontal or vertical. Type: boolean.
        },

        // toggleType is only meaningful if type is 'toggle'
        toggleType: {
            outerClass: 'checkboxswitch-outer toggle corners-rounded',   // Classes for the container. Type: string.
                                                    // Add:
                                                    // - corners-rounded for full rounded corners;
                                                    // - corners-halfrounded for 50% rounded corners;
                                                    // - corners-quarterrounded for 25% rounded corners;
                                                    // - corners-sharp for no rounded corners;
                                                    // If none of the above four are specified, corners-rounded is used.
            showOnOff: true,        // Determines whether a span child is used to display 0 or 1 (you can change CSS to display something else). Type: boolean.
            onOffClass: 'onoff',    // Class added to the span created when showOnOff is true. Type: String.
            caption: null,  // Specifies the text caption that appears in toggle switches. If null, then uses the text from the markup. 
                            // If the plugin is not bounded to an <input type=checkbox> element, this caption is appended to the existing markup text (if any). Type: String.
            frameClasses: ['frm1', 'frm2', 'frm3', 'frm4', 'frm5']
                // Each class represents a frame in the animation that runs from OFF to ON position. Type: array of String.
                // The first class is used for the OFF image, the last for the ON image. Optional frames in the middle can be used to create a more realistic animation.
                // For ON to OFF animations, the plug-in simply iterates from the last to the first class.
        },

        // pushType is only meaningful if type is 'push'
        pushType: {
            outerClass: 'checkboxswitch-outer toggle push corners-rounded',   // Classes for the container. Type: string.
                                                    // Add:
                                                    // - corners-rounded for full rounded corners;
                                                    // - corners-halfrounded for 50% rounded corners;
                                                    // - corners-quarterrounded for 25% rounded corners;
                                                    // - corners-sharp for no rounded corners;
                                                    // If none of the above four are specified, corners-rounded is used.
            showOnOff: true,        // Determines whether a span child is used to display 0 or 1 (you can change CSS to display something else). Type: boolean.
            onOffClass: 'onoff',    // Class added to the span created when showOnOff is true. Type: String.
            caption: null,  // Specifies the text caption that appears in toggle switches. If null, then uses the text from the markup. 
                            // If the plugin is not bounded to an <input type=checkbox> element, this caption is appended to the existing markup text (if any). Type: String.
            frameClasses: ['frm1', 'frm2', 'frm3', 'frm4']
                // Each class represents a frame in the animation that runs from OFF to ON position. Type: array of String.
                // The first class is used for the OFF image, the last for the ON image. Optional frames in the middle can be used to create a more realistic animation.
                // For ON to OFF animations, the plug-in simply iterates from the last to the first class.
        },
        keyboard: {
            allowed: ['enter', 'esc', 'space'], // Allowed keys on focusable switches. Type: String array.
                                                // Key events are ignored for non focusable switches.
                                                // A switch is focusable when the associated markup is an <input type="checkox"> with no disabled attribute, or any HTML element with a tabindex attribute.
            rollbackOnEsc: true,  // Determines whether pressing Esc key rollsback to the value the switch had before gaining focus (the committed value). Type: boolean or string.
                                  // Rolling back has no effect when the current value is the same as the committed value.
                                  //  true - Pressing Esc on a focusable switch rollsback value. Change events are not fired. Note that 'esc' should be present in the allowed property array (see above).
                                  // false - Ignores Esc keystrokes.
                                  // 'trueWithEvents' - Pressing Esc on a focusable switch rollsback value.
                                  //                    If it rolls back to On, then OnChange and OnChangeOn are fired.
                                  //                    If it rolls back to Off, then OnChange and OnChangeOff are fired.
            toggleOnEnter: true,  // Determines whether the value toggles on Enter or Space. Type: boolean.
                                  //  true - Pressing Enter or Space changes value. Note that 'enter' or 'space' should be present in the allowed property array (see above).
                                  // false - Ignores Enter or Space keystrokes.
            commitOnBlur: false   // Determines whether the value is saved when switch loses focus. Type: boolean.
                                  //  true - The current value is commited when switch loses focus.
                                  // false - Value is not commited.
        },
        changedClass: 'changed',    // Classes set to the outer div when the switch has been changed. Type: string.
        disabledClass: 'disabled',  // Classes set to the outer div when the switch is disabled. Type: string.
        enabled: true,  // Determines whether the control is editable. If the plugin is associated with a disabled <input type="checkbox" disabled>, then enabled is set to false. Type: boolean.
        speed: 75,      // Handle animation in milliseconds. Type: positive integer number.
                        // For Sliding switches, specifies the time it takes to move from one side to the other.
                        // For Toggle or Push switches, specifies the time it takes to change from one position to another.
        onChange: null,     // Event fired when switch changes to either On or Off. Type: function (event, $elem, value)
        onChangeOn: null,   // Event fired when switch changes to On position. Type: function (event, $elem)
                            // If the markup is an <input type="checkbox"> then an attribute checked="checked" is added. If other markup is used, then an attribute data-checked="checked" is added.
        onChangeOff: null   // Event fired when switch changes to OFF position. Type: function (event, $elem)
                            // If the markup is an <input type="checkbox"> then the attribute checked="checked" is removed. If other markup is used, then the attribute data-checked="checked" is removed.
    };
    /*  Method      Description
        ----------------------------------------------------------------------------------------------------------------------------------------
        'refresh'   Updates the switch according to the markup value. Typically used after the markup is manually changed.
                    Example: The markup <input type="checkbox"> is changed to <input type="checkbox" checked>.
                             The plugin does not know about this change, so still shows the off value. By calling 'refresh', the plugin will read the markup value and update itself accordingly.
                    Usage:  $e.rsCheckboxSwitch('refresh')         Switch updates its state according to markup state. Change events (onChange, onChangeOn, onChangeOff) are fired only if there is a change in value.
                            $e.rsCheckboxSwitch('refresh', false)  Switch updates its state according to markup state. Change events are never fired.
                            $e.rsCheckboxSwitch('refresh', true)   Switch updates its state according to markup state. Change events are always fired.

        'toggle'    Toggles the current value. The related markup is updated. Change events are fired.
                    Usage:  $e.rsCheckboxSwitch('toggle')

        'on'        Set the switch to on position without animation.       
                    Usage:  $e.rsCheckboxSwitch('on')            Switch moves to on position. OnChange and onChangeOn are fired only if previous value was off.
                            $e.rsCheckboxSwitch('on', false)     Switch moves to on position. OnChange and onChangeOn are never fired.
                            $e.rsCheckboxSwitch('on', true)      Switch moves to on position. OnChange and onChangeOn are always fired.

        'off'       Set the switch to off position without animation.
                    Usage:  $e.rsCheckboxSwitch('off')           Switch moves to off position. OnChange and onChangeOff are fired only if previous value was on.
                            $e.rsCheckboxSwitch('off', false)    Switch moves to off position. OnChange and onChangeOff are never fired.
                            $e.rsCheckboxSwitch('off', true)     Switch moves to off position. OnChange and onChangeOff are always fired.

        'onAnim'    Set the switch to on position with animation.       
                    Usage:  $e.rsCheckboxSwitch('onAnim')        Switch moves to on position. OnChange and onChangeOn are fired only if previous value was off.
                            $e.rsCheckboxSwitch('onAnim', false) Switch moves to on position. OnChange and onChangeOn are never fired.
                            $e.rsCheckboxSwitch('onAnim', true)  Switch moves to on position. OnChange and onChangeOn are always fired.

        'offAnim'   Set the switch to off position with animation.
                    Usage:  $e.rsCheckboxSwitch('offAnim')           Switch moves to off position. OnChange and onChangeOff are fired only if previous value was on.
                            $e.rsCheckboxSwitch('offAnim', false)    Switch moves to off position. OnChange and onChangeOff are never fired.
                            $e.rsCheckboxSwitch('offAnim', true)     Switch moves to off position. OnChange and onChangeOff are always fired.

        'rollback'  Rollsback the switch to the original value. Original value is the value the switch had initially at construction time, or the last commited value.       
                    Usage:  $e.rsCheckboxSwitch('rollback')         Switch moves to original position. Change events are fired only if there is a change in value.
                            $e.rsCheckboxSwitch('rollback', false)  Switch moves to original position. Change events are never fired.
                            $e.rsCheckboxSwitch('rollback', true)   Switch moves to original position. Change events are always fired.

        'commit'    Notifies the plugin that current value is the "new" original one.       
                    Usage:  $e.rsCheckboxSwitch('commit')

        'destroy'   Unbinds all events and completely removes the plugin from the page.       
                    Usage:  $e.rsCheckboxSwitch('destroy')


        Getter      Description
        ----------------------------------------------------------------------------------------------------------------------------------------
        'onChange'      Returns the current onChange event function handler
                        Usage:  var onChangeFunction = $e.rsCheckboxSwitch('option', 'onChange');

        'onChangeOn'    Returns the current onChangeOn event function handler
                        Usage:  var onChangeOnFunction = $e.rsCheckboxSwitch('option', 'onChangeOn');

        'onChangeOff'   Returns the current onChangeOff event function handler
                        Usage:  var onChangeOffFunction = $e.rsCheckboxSwitch('option', 'onChangeOff');
                    
        'changed'       Returns true if switched was changed, false otherwise. "Changed" means the current value is different from the current commited value.
                        Usage:  var changed = $e.rsCheckboxSwitch('option', 'changed');

        'value'         Returns switch current value.
                        Usage:  var isOn = $e.rsCheckboxSwitch('option', 'value');

        'enabled'       Retuns true if switch can be changed by the user, false otherwise.
                        Usage:  var isEnabled = $e.rsCheckboxSwitch('option', 'enabled');


        Setter      Description
        ----------------------------------------------------------------------------------------------------------------------------------------
        'onChange'      Sets the onChange event function handler
                        Usage:  $e.rsCheckboxSwitch('option', 'onChange', function (event, $elem, value) { alert('value changed to ' + value); } );

        'onChangeOn'    Sets the onChangeOn event function handler
                        Usage:  $e.rsCheckboxSwitch('option', 'onChangeOn', function (event, $elem) { alert('value changed to true'); } )

        'onChangeOff'   Sets the onChangeOff event function handler
                        Usage:  $e.rsCheckboxSwitch('option', 'onChangeOff', function (event, $elem) { alert('value changed to false'); } )
                    
        'enabled'       Enables or disables the switch control.
                        Usage:  $e.rsCheckboxSwitch('option', 'enabled', true);     Enable the plugin
                                $e.rsCheckboxSwitch('option', 'enabled', false);    Disable the plugin
    */
})(jQuery);