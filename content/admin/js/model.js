var historyMaxLength = 100;
var history = [];

function addHistory(collection, data) {
    // history.unshift([collection, data]);
    // if (history.length > historyMaxLength) {
    //     history = history.splice(-1, 1);
    // }
}

function ajat(url, json, callback) {
    httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                callback(httpRequest.responseText);
            } else {
                console.error('Ajat request failed:' + httpRequest.responseText);
            }
        }
    };

    httpRequest.open('POST', url, true);
    httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    httpRequest.send('json=' + encodeURIComponent(JSON.stringify(json)));
}

function ajaj(url, json, callback) {
    ajat(url, json, function (text) {
        var json = JSON.parse(text);
        callback(json);
    });
}

function All(table) {
    var collection = new Collection(table);

    return collection
}

function New(table, data) {
    if (data === undefined) {
        data = {};
    }

    var collection = new Collection(table);

    if (data instanceof Array) {
        throw "Array is now a valid as data for New()";
    } else {
        collection.data = [data];
        // addHistory(collection, [data]);

        if (!data.Id) {
            collection.new = true;
        }
    }

    collection.persisted = false;
    collection.fetched = true; // otherwise fetch() overwrites data

    return collection
}

function Collection(table) {
    this.table = table;
    this.filters = [];
    this.order = null;
    this.sqlLimit = -1;
    this.sqlOffset = -1;

    this.data = [];
    this.fetched = false;
    this.counter = 0;
    this.persisted = true;
    this.new = false;

    addHistory(this, []);
}

Collection.prototype.filter = function (field, operator, value) {
    this.fetched = false;

    this.filters.push({
        field: field,
        operator: operator,
        value: value,
    });

    return this;
};

Collection.prototype.orderBy = function (field, direction) {
    if (this.order.field !== field || this.order.direction !== direction) {
        this.fetched = false;
    }

    this.order = {
        field: field,
        direction: direction,
    };

    return this;
};

Collection.prototype.limit = function (limit) {
    if (this.sqlLimit !== limit) {
        this.fetched = false;
    }

    this.sqlLimit = limit;

    return this;
};

Collection.prototype.offset = function (offset) {
    if (this.sqlOffset !== offset) {
        this.fetched = false;
    }

    this.sqlOffset = offset;

    return this;
};

Collection.prototype.each = function (callback) {
    var _this = this;

    this.data.forEach(function () {
        callback(_this);
        _this.counter += 1;
    });

    _this.counter = 0;
};

Collection.prototype.fetch = function (callback) {
    var _this = this;

    if (this.fetched) {
        if (callback) {
            callback(this);
        }
        return;
    }

    ajaj('/admin/get-elems/', {
        table: this.table,
        filters: this.filters,
        order: this.order,
        limit: this.sqlLimit,
        offset: this.sqlOffset,
    }, function (json) {
        var plainData = _this.plainObj(json);

        _this.data = plainData;
        _this.fetched = true;
        _this.counter = 0;
        _this.persisted = true;
        _this.new = false;

        if (callback) {
            callback(_this);
        }
    });
};

Collection.prototype.save = function (callback) {
    var _this = this;

    if (this.persisted) {
        if (callback) {
            callback();
        }
        return
    }

    var onSaved = function (json)
    {
        if (_this.new) {
            _this.set("Id", json.id);
        }

        _this.new = false;
        _this.persisted = true;

        if (callback) {
            callback();
        }
    };
    var saveObj = {
        table: this.table,
        data: this.data,
        new: this.new,
    }

    ajaj('/admin/set-elems/', saveObj, onSaved);
};

Collection.prototype.get = function (key) {
    var elem = this.data[this.counter];
    var value = elem[key];
    return value;
};

Collection.prototype.set = function (key, value) {
    var elem = this.data[this.counter];

    addHistory(this, this.plainObj(this.data));

    var oldValue = elem[key];
    var isNewValue = !(oldValue === value);

    elem[key] = value

    if (isNewValue) {
        this.persisted = false;
    }

    return this;
};

// Can also clone objects
Collection.prototype.plainObj = function (elem) {
    var _this = this;
    var obj = null;

    if (elem instanceof Array) {
        obj = [];
        elem.forEach(function (singleElem) {
            obj.push(_this.elemPlainObj(singleElem));
        });
    } else {
        obj = _this.elemPlainObj(elem);
    }

    return obj;
}

// Can also clone objects
Collection.prototype.elemPlainObj = function (elem) {
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
}

Collection.prototype.len = function () {
    return Object.keys(this.data).length;
}

Collection.prototype.getData = function () {
    return this.data;
}
