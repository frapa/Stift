async function ajat(url, data) {
    var options = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }

    var request = new Request(url, options);

    try {
        var res = await fetch(request);
    } catch (e) {
        console.error('Ajat request failed');
    }

    return res.text();
}

async function ajaj(url, data) {
    var text = await ajat(url, data);
    var json = JSON.parse(text);
    return json;
}
 
var cache = {
    // This object gets populated with a partial representation of the
    // real database. It helps avoiding double requests, but especially
    // it keeps everything in sync. Two collections representing the same
    // table will always contain the most up to date version of the data.
    // The only case in which this does not work well is when there are
    // simultaneous users editing. This might be solved in the future
    // with the use of WebSockets for push notifications. 
    //
    // Currently requests are only avoided if the whole collection is
    // going to be fetched. Prefer usability over performance.
};

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
        // Add the element data to the cache, the id will be automatically
        // filled in on save.
        collection.data = [data];

        if (table in cache) {
            var foundElem = _.find(cache[table], (elem) => {
                return elem.Id == data.Id;
            });
            
            if (foundElem !== undefined) {
                var idx = cache[table].indexOf(foundElem);
                cache[table][idx] = data;
            } else {
                cache[table].push(data);
            }
        } else {
            cache[table] = [data];
        }

        if (!data.Id) {
            collection.new = true;
        }
    }

    collection.persisted = false;
    collection.fetched = true; // otherwise fetch() overwrites the data

    return collection;
}

function Collection(table) {
    this.table = table;
    this.filters = [];
    this.order = null;
    this.sqlLimit = -1;
    this.sqlOffset = -1;

    this.counter = 0;
    this.persisted = true;
    this.new = false;

    if (table in cache) {
        this.data = cache[table];
        this.fetched = true;
    } else {
        this.data = []; // placeholder
        this.fetched = false;
    }
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

Collection.prototype.find = function (callback) {
    var len = this.data.length;
    for (var i = 0; i < len; i++) {
        var hasToBreak = callback(this);
        if (hasToBreak) {
            var clone = this.clone();

            this.counter = 0;
            return clone;
        }

        this.counter += 1;
    }

    this.counter = 0;
    return null;
};

Collection.prototype.clone = function () {
    var clone = new Collection(this.table);

    clone.filters = __.plainObj(this.filters);
    clone.order = __.plainObj(this.order);
    clone.sqlLimit = this.sqlLimit;
    clone.sqlOffset = this.sqlOffset;
    clone.data = __.plainObj(this.data);
    clone.fetched = this.fetched;
    clone.counter = this.counter;
    clone.persisted = this.persisted;
    clone.new = this.new;

    return clone;
};

Collection.prototype.fetch = async function () {
    var _this = this;

    if (this.fetched) {
        return this;
    }

    var json = await ajaj('/admin/get-elems', {
        table: this.table,
        filters: this.filters,
        order: this.order,
        limit: this.sqlLimit,
        offset: this.sqlOffset,
    });

    var plainData = __.plainObj(json);

    // Save the data in the db representation
    if (!(_this.table in cache) && 
        !_this.filters.length &&
        _this.order === null &&
        _this.sqlLimit == -1 &&
        _this.sqlOffset == -1)
    {
        cache[_this.table] = plainData;
    }

    _this.data = plainData;
    _this.fetched = true;
    _this.counter = 0;
    _this.persisted = true;
    _this.new = false;

    return this;
};

Collection.prototype.forceSave = async function () {
    this.persisted = false;
    await this.save();
};

Collection.prototype.save = async function () {
    var _this = this;

    if (this.persisted) {
        return
    }

    var saveObj = {
        table: this.table,
        data: this.data,
        new: this.new,
    };

    var json = await ajaj('/admin/set-elems', saveObj);
    
    if (_this.new) {
        _this.set("Id", json.id);
    }

    _this.new = false;
    _this.persisted = true;

    return this;
};

Collection.prototype.delete = async function () {
    if (!this.data[0].Id) {
        throw "Cannot delete unpersisted object";
    }

    await ajaj('/admin/del-elems', {
        table: this.table,
        data: this.data,
    });

    // Remove from cache
    if (this.table in cache) {
        var id = this.get('Id');
        var foundElem = _.find(cache[this.table], (elem) => {
            return elem.Id == id;
        });

        if (foundElem) {
            var idx = cache[this.table].indexOf(foundElem);
            cache[this.table].splice(idx, 1);
        }
    }
};

Collection.prototype.get = function (key) {
    var elem = this.data[this.counter];
    var value = elem[key];
    return value;
};

Collection.prototype.set = function (key, value) {
    var elem = this.data[this.counter];

    var oldValue = elem[key];
    var isNewValue = !(oldValue === value);

    elem[key] = value

    if (isNewValue) {
        this.persisted = false;
    }

    return this;
};

Collection.prototype.len = function () {
    return Object.keys(this.data).length;
}

Collection.prototype.getData = function () {
    return this.data;
}

Collection.prototype.setData = function (data) {
    this.data = data;
}

Collection.prototype.getModelData = function () {
    return this.data[this.counter];
}

Collection.prototype.pluck = function (key) {
    return _.pluck(this.data, key);
};

/*Collection.prototype.add = function (model) {
    if (!model.get('Id')) {
        console.error("Cannot add unpersisted element.");
    }

    this.data.push(model.getModelData());
    this.persisted = false;

    return this;
};

Collection.prototype.remove = function (model) {
    var data = this.find(function (elem) {
        return elem.get('Id') == model.get('Id');
    });

    this.data.splice(data.counter, 1);
    this.persisted = false;

    return this;
};*/
