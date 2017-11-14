var settings = null;

var _ = {
    pluck: function (array, key) {
        var data = [];

        array.forEach(function (elem) {
            data.push(elem[key]);
        });

        return data;
    },
    find: function (array, callback) {
        var len = array.length;
        for (var i = 0; i < len; i++) {
            var hasToBreak = callback(array[i]);
            if (hasToBreak) {
                return array[i];
            }
        }

        return null;
    },
    // Can also clone objects
    plainObj: function (elem) {
        var obj = null;

        if (elem instanceof Array) {
            obj = [];
            elem.forEach(function (singleElem) {
                obj.push(_.elemPlainObj(singleElem));
            });
        } else {
            obj = _.elemPlainObj(elem);
        }

        return obj;
    },
    // Can also clone objects
    elemPlainObj: function (elem) {
        var obj = {};

        for (var key in elem) {
            if (elem.hasOwnProperty(key)) {
                var value = elem[key];
                if (typeof(value) === 'object' && value !== null) {
                    // Go returns an object with 2 keys "Valid"
                    // which says if the value is null and another
                    // whose name depends on the datatype. We
                    // find out the name by exclusion of "Valid"
                    var dataKeys = Object.keys(value);
                    var validPos = dataKeys.indexOf('Valid');

                    if (validPos != -1) {
                        dataKeys.splice(validPos, 1)
                        var dataKey = dataKeys[0]
                        obj[key] = value[dataKey];
                    } else {
                        console.error(dataKeys);
                        throw "Strange value in data object. See error above.";
                    }
                } else {
                    obj[key] = value;
                }
            }
        }

        return obj;
    },
    waitAsync: function (count, callback) {
        if (count == 0) {
            callback();
        }

        return new function () {
            var _this = this;
            this.count = count;
            this.wait = function () { _this.count += 1; };
            this.done = function () {
                _this.count -= 1;
                if (_this.count === 0) {
                    callback();
                }
            };
        };
    }
}

window.addEventListener('load', function () {
    settings = All('Settings');

    // Without this line, other load callbacks do not work...
    setTimeout(function () {
        settings.fetch();

        user.fetch(function () {
            setTheme(user.get('Dark_Theme') ? 'dark' : 'light')
        });
    }, 0);

    // setup markdown compiler
    marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: true,
        highlight: function (code) {
            return hljs.highlightAuto(code).value;
        }
    });
});

function getSetting(key) {
    var value = "";

    // TODO: optimize this
    settings.each(function (setting) {
        if (settings.get('Key') === key) {
            value = settings.get('Value');
        }
    });

    return value;
}

function setTheme(theme) {
    var newClasses = document.querySelector('.application').className;
    newClasses = newClasses.replace(/theme--\w*/, 'theme--' + theme);
    document.querySelector('.application').className = newClasses;
}
