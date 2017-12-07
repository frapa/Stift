var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function ajat(url, data) {
    return __awaiter(this, void 0, void 0, function () {
        var options, request, res, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    };
                    request = new Request(url, options);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch(request)];
                case 2:
                    res = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.error('Ajat request failed');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, res.text()];
            }
        });
    });
}
function ajaj(url, data) {
    return __awaiter(this, void 0, void 0, function () {
        var text, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ajat(url, data)];
                case 1:
                    text = _a.sent();
                    json = JSON.parse(text);
                    return [2 /*return*/, json];
            }
        });
    });
}
var cache = {};
function All(table) {
    var collection = new Collection(table);
    return collection;
}
function New(table, data) {
    if (data === undefined) {
        data = {};
    }
    var collection = new Collection(table);
    if (data instanceof Array) {
        throw "Array is now a valid as data for New()";
    }
    else {
        // Add the element data to the cache, the id will be automatically
        // filled in on save.
        collection.data = [data];
        if (table in cache) {
            var foundElem = _.find(cache[table], function (elem) {
                return elem.Id == data.Id;
            });
            if (foundElem !== undefined) {
                var idx = cache[table].indexOf(foundElem);
                cache[table][idx] = data;
            }
            else {
                cache[table].push(data);
            }
        }
        else {
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
    }
    else {
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
Collection.prototype.fetch = function () {
    return __awaiter(this, void 0, void 0, function () {
        var _this, json, plainData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _this = this;
                    if (this.fetched) {
                        return [2 /*return*/, this];
                    }
                    return [4 /*yield*/, ajaj('/admin/get-elems', {
                            table: this.table,
                            filters: this.filters,
                            order: this.order,
                            limit: this.sqlLimit,
                            offset: this.sqlOffset,
                        })];
                case 1:
                    json = _a.sent();
                    plainData = __.plainObj(json);
                    // Save the data in the db representation
                    if (!(_this.table in cache) &&
                        !_this.filters.length &&
                        _this.order === null &&
                        _this.sqlLimit == -1 &&
                        _this.sqlOffset == -1) {
                        cache[_this.table] = plainData;
                    }
                    _this.data = plainData;
                    _this.fetched = true;
                    _this.counter = 0;
                    _this.persisted = true;
                    _this.new = false;
                    return [2 /*return*/, this];
            }
        });
    });
};
Collection.prototype.forceSave = function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    this.persisted = false;
                    return [4 /*yield*/, this.save()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
Collection.prototype.save = function () {
    return __awaiter(this, void 0, void 0, function () {
        var _this, saveObj, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _this = this;
                    if (this.persisted) {
                        return [2 /*return*/];
                    }
                    saveObj = {
                        table: this.table,
                        data: this.data,
                        new: this.new,
                    };
                    return [4 /*yield*/, ajaj('/admin/set-elems', saveObj)];
                case 1:
                    json = _a.sent();
                    if (_this.new) {
                        _this.set("Id", json.id);
                    }
                    _this.new = false;
                    _this.persisted = true;
                    return [2 /*return*/, this];
            }
        });
    });
};
Collection.prototype.delete = function () {
    return __awaiter(this, void 0, void 0, function () {
        var id, foundElem, idx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!this.data[0].Id) {
                        throw "Cannot delete unpersisted object";
                    }
                    return [4 /*yield*/, ajaj('/admin/del-elems', {
                            table: this.table,
                            data: this.data,
                        })];
                case 1:
                    _a.sent();
                    // Remove from cache
                    if (this.table in cache) {
                        id = this.get('Id');
                        foundElem = _.find(cache[this.table], function (elem) {
                            return elem.Id == id;
                        });
                        if (foundElem) {
                            idx = cache[this.table].indexOf(foundElem);
                            cache[this.table].splice(idx, 1);
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
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
    elem[key] = value;
    if (isNewValue) {
        this.persisted = false;
    }
    return this;
};
Collection.prototype.len = function () {
    return Object.keys(this.data).length;
};
Collection.prototype.getData = function () {
    return this.data;
};
Collection.prototype.setData = function (data) {
    this.data = data;
};
Collection.prototype.getModelData = function () {
    return this.data[this.counter];
};
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
//# sourceMappingURL=model.js.map