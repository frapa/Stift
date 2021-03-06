var settings = null;

// Fuck people
_.pluck = _.map;

var __ = {
    // Can also clone objects
    plainObj: function (elem) {
        var obj = null;

        if (elem instanceof Array) {
            obj = [];
            elem.forEach(function (singleElem) {
                obj.push(__.elemPlainObj(singleElem));
            });
        } else {
            obj = __.elemPlainObj(elem);
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
}

window.addEventListener('load', async function () {
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

    settings = await All('Settings').fetch();
    await user.fetch();

    initUi();
    setTheme(user.get('Dark_Theme') ? 'dark' : 'light');
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

async function sendEmail(options) {
    var res = await fetch('/admin/email', {
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify(options)
    });

    var text = await res.text();
    if (text === "'mail' is not installed") {
        console.error(text);
    } else if (text !== 'Ok') {
        console.error(text);
    }
}
