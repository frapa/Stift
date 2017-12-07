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
Vue.component('story-editor', function (resolve, reject) {
    return __awaiter(this, void 0, void 0, function () {
        var posts, tags, users, media;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, All('Posts').fetch()];
                case 1:
                    posts = _a.sent();
                    return [4 /*yield*/, All('Tags').fetch()];
                case 2:
                    tags = _a.sent();
                    return [4 /*yield*/, All('Users').fetch()];
                case 3:
                    users = _a.sent();
                    return [4 /*yield*/, All('Media').fetch()];
                case 4:
                    media = _a.sent();
                    // Start component
                    resolve({
                        props: ['postId'],
                        template: '#story-editor',
                        data: function () {
                            var _this = this;
                            if (this.postId) {
                                var post = posts.find(function (p) {
                                    return p.get('Id') === _this.postId;
                                });
                                var featuredImage = media.find(function (m) {
                                    return m.get('Id') === post.get('Featured_Image');
                                });
                                ajaj('/admin/get-authors-and-tags', {
                                    post: this.postId,
                                }).then(function (authorsAndTags) {
                                    var authors = __.plainObj(authorsAndTags.Authors);
                                    var tags = __.plainObj(authorsAndTags.Tags);
                                    _this.currentAuthors = _.pluck(authors, 'Id');
                                    _this.currentTags = _.pluck(tags, 'Id');
                                    _this.prevAuthors = _.pluck(authors, 'Id');
                                    _this.prevTags = _.pluck(tags, 'Id');
                                    _this.linkIds = {};
                                    tags.forEach(function (tag) {
                                        _this.linkIds[tag.Id] = tag.LinkId;
                                    });
                                    authors.forEach(function (author) {
                                        _this.linkIds[author.Id] = author.LinkId;
                                    });
                                    setTimeout(function () { return window.scrollTo(0, 0); }, 0);
                                });
                            }
                            else {
                                var postData = {
                                    Id: "",
                                    Title: "",
                                    Slug: "",
                                    Plaintext: "",
                                    Html: "",
                                    Featured_Image: "",
                                    Visible: 0,
                                    Page: 0,
                                    Featured: 0,
                                    Created_At: (new Date()).toISOString(),
                                    Updated_At: null,
                                    Published_At: null,
                                    Code_Injection: "",
                                    Custom_Excerpt: "",
                                };
                                var post = New("Posts", postData);
                                function setAuthor() {
                                    return __awaiter(this, void 0, void 0, function () {
                                        var link, _a;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0: return [4 /*yield*/, post.save()];
                                                case 1:
                                                    _b.sent();
                                                    _this.currentAuthors = [user.get('Id')];
                                                    _this.prevAuthors = [user.get('Id')];
                                                    _this.currentTags = [];
                                                    _this.prevTags = [];
                                                    link = New('Post2Users', {
                                                        Post: post.get('Id'),
                                                        User: user.get('Id')
                                                    });
                                                    return [4 /*yield*/, link.save()];
                                                case 2:
                                                    _b.sent();
                                                    _this.linkIds = (_a = {},
                                                        _a[user.get('Id')] = link.get('Id'),
                                                        _a);
                                                    router.replace('/admin/editor/' + post.get('Id'));
                                                    setTimeout(function () { return window.scrollTo(0, 0); }, 0);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    });
                                }
                                setAuthor();
                            }
                            return {
                                post: post.getModelData(),
                                allTags: tags.getData(),
                                allUsers: users.getData(),
                                saveSnackbar: false,
                                snackbarTimeout: 1000,
                                currentAuthors: [],
                                currentTags: [],
                                featuredImage: featuredImage ? featuredImage.getModelData() : null,
                                imageDialogVisible: false
                            };
                        },
                        computed: {
                            authors: function () {
                                var _this = this;
                                var authors = _.filter(this.allUsers, function (author) {
                                    return _this.currentAuthors.indexOf(author.Id) != -1;
                                });
                                return authors;
                            },
                            tags: function () {
                                var _this = this;
                                return _.filter(this.allTags, function (tag) {
                                    return _this.currentTags.indexOf(tag.Id) != -1;
                                });
                            },
                        },
                        mounted: function () {
                            this.ta = byId('post-text');
                        },
                        beforeDestroy: function () {
                            this.save();
                        },
                        methods: {
                            save: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var _this, post;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _this = this;
                                                clearTimeout(this.timeoutId);
                                                this.timeoutId = null;
                                                this.compileMarkdown();
                                                this.updateSlug();
                                                window.onbeforeunload = undefined;
                                                post = New('Posts', this.post);
                                                return [4 /*yield*/, post.save()];
                                            case 1:
                                                _a.sent();
                                                return [4 /*yield*/, _this.saveAuthorsAndTags()];
                                            case 2:
                                                _a.sent();
                                                _this.saveSnackbar = true;
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            compileMarkdown: function () {
                                this.post.Html = marked(this.post.Plaintext);
                            },
                            updateSlug: function () {
                                var title = this.post.Title.toLowerCase();
                                var slug = title.replace(/[^\d\w]+/g, '-');
                                this.post.Slug = slug;
                            },
                            diffAndSave: function (prev, current, allElems, elemType) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var _this, post, deleted, added, typeOrAuthor;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _this = this;
                                                post = this.post;
                                                deleted = [];
                                                added = [];
                                                prev.forEach(function (prevElemId) {
                                                    var found = _.find(current, function (currentElemId) {
                                                        return prevElemId == currentElemId;
                                                    });
                                                    if (found === undefined) {
                                                        var prevElem = _.find(allElems, function (elem) {
                                                            return elem.Id == prevElemId;
                                                        });
                                                        if (prevElem) {
                                                            deleted.push(prevElem);
                                                        }
                                                    }
                                                });
                                                current.forEach(function (currentElemId) {
                                                    var found = _.find(prev, function (prevElemId) {
                                                        return currentElemId == prevElemId;
                                                    });
                                                    if (found === undefined) {
                                                        var currentElem = _.find(allElems, function (elem) {
                                                            return elem.Id == currentElemId;
                                                        });
                                                        if (currentElem) {
                                                            added.push(currentElem);
                                                        }
                                                    }
                                                });
                                                // Created the missing links
                                                return [4 /*yield*/, added.forEach(function (elem) {
                                                        return __awaiter(this, void 0, void 0, function () {
                                                            var data, link, newElem;
                                                            return __generator(this, function (_a) {
                                                                switch (_a.label) {
                                                                    case 0:
                                                                        data = { Post: post.Id };
                                                                        data[elemType.slice(0, -1)] = elem.Id;
                                                                        link = New('Post2' + elemType, data);
                                                                        return [4 /*yield*/, link.save()];
                                                                    case 1:
                                                                        _a.sent();
                                                                        newElem = __.plainObj(elem);
                                                                        newElem.LinkId = link.get('Id');
                                                                        bus.$emit('added_tag', elemType, newElem);
                                                                        return [2 /*return*/];
                                                                }
                                                            });
                                                        });
                                                    })];
                                            case 1:
                                                // Created the missing links
                                                _a.sent();
                                                // Destroy links
                                                return [4 /*yield*/, deleted.forEach(function (elem) {
                                                        return __awaiter(this, void 0, void 0, function () {
                                                            var link;
                                                            return __generator(this, function (_a) {
                                                                switch (_a.label) {
                                                                    case 0:
                                                                        link = New('Post2' + elemType, { Id: _this.linkIds[elem.Id] });
                                                                        return [4 /*yield*/, link.delete()];
                                                                    case 1:
                                                                        _a.sent();
                                                                        // Update before array
                                                                        bus.$emit('removed_tag', elemType, elem);
                                                                        return [2 /*return*/];
                                                                }
                                                            });
                                                        });
                                                    })];
                                            case 2:
                                                // Destroy links
                                                _a.sent();
                                                typeOrAuthor = elemType === 'Users' ? 'Authors' : elemType;
                                                this['prev' + typeOrAuthor] = current.slice(0);
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            saveAuthorsAndTags: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this.diffAndSave(this.prevAuthors, this.currentAuthors, this.allUsers, 'Users')];
                                            case 1:
                                                _a.sent();
                                                return [4 /*yield*/, this.diffAndSave(this.prevTags, this.currentTags, this.allTags, 'Tags')];
                                            case 2:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            resizeEditor: function () {
                                var pn = this.ta.parentNode.parentNode;
                                pn.style.height = this.ta.clientHeight + 'px';
                            },
                            saveOnInput: function () {
                                this.resizeEditor();
                                // limit the saving frequency to one every 5 seconds
                                if (this.timeoutId) {
                                    return;
                                }
                                window.onbeforeunload = function (e) {
                                    var msg = "Don't unload please!";
                                    e.returnValue = msg;
                                    return msg;
                                };
                                var _this = this;
                                this.timeoutId = setTimeout(function () {
                                    _this.save();
                                }, 5000);
                            },
                            publish: function () {
                                this.post.Updated_At = (new Date()).toISOString();
                                if (!this.post.Published_At) {
                                    this.post.Published_At = (new Date()).toISOString();
                                }
                                this.post.Visible = 1;
                                this.save();
                            },
                            deletePost: function () {
                                var post = New('Posts', this.post);
                                post.delete();
                                router.push('/admin/dashboard');
                            },
                            setFeaturedPicture: function (file) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        this.post.Featured_Image = file ? file.Id : "";
                                        this.save();
                                        return [2 /*return*/];
                                    });
                                });
                            },
                            surroundSelection: function (start, end) {
                                var _this = this;
                                var ta = this.ta;
                                var tav = ta.value;
                                var startSel = ta.selectionStart;
                                var endSel = ta.selectionEnd;
                                this.post.Plaintext = tav.substring(0, startSel) +
                                    start + tav.substring(startSel, endSel) + end
                                    + tav.substring(endSel, tav.length);
                                var pn = ta.parentNode.parentNode;
                                pn.style.height = ta.clientHeight + 'px';
                                setTimeout(function () {
                                    ta.setSelectionRange(startSel + start.length, endSel + start.length);
                                    ta.focus();
                                    _this.saveOnInput();
                                }, 0);
                            },
                            cycleHeadings: function () {
                                this.transformLine(new CycleHeadingsOpts());
                            },
                            transformLine: function (opts) {
                                var _this = this;
                                var ta = this.ta;
                                var tav = ta.value;
                                var startSel = ta.selectionStart;
                                var lnum = tav.substring(0, startSel).split('\n').length - 1;
                                this.transformLinesIntern(ta, tav, lnum, lnum + 1, opts);
                            },
                            togglePrefixLines: function (prefix) {
                                this.transformLines(new TogglePrefixOpts(prefix));
                            },
                            toggleEnumerate: function () {
                                this.transformLines(new ToggleEnumerateOpts());
                            },
                            insertImage: function () {
                                this.imageDialogVisible = true;
                            },
                            selectImage: function (file) {
                                var path = '/media/' + file.Path;
                                this.surroundSelection('![', '](' + path + ')');
                                this.imageDialogVisible = false;
                            },
                            transformLines: function (opts) {
                                var _this = this;
                                var ta = this.ta;
                                var tav = ta.value;
                                var startSel = ta.selectionStart;
                                var ls = tav.substring(0, startSel).split('\n').length - 1;
                                var endSel = ta.selectionEnd;
                                var le = tav.substring(0, endSel).split('\n').length;
                                this.transformLinesIntern(ta, tav, ls, le, opts);
                            },
                            transformLinesIntern: function (ta, tav, lstart, lend, opts) {
                                var _this = this;
                                var startSel = ta.selectionStart;
                                var endSel = ta.selectionEnd;
                                var lines = tav.split('\n');
                                var newLines = lines.map(function (l, i) {
                                    if (i >= lstart && i < lend) {
                                        return opts.transformLine(l, i);
                                    }
                                    return l;
                                });
                                this.post.Plaintext = newLines.join('\n');
                                var pn = ta.parentNode.parentNode;
                                pn.style.height = ta.clientHeight + 'px';
                                setTimeout(function () {
                                    ta.setSelectionRange(startSel + opts.selStartMod(), endSel + opts.selEndMod());
                                    ta.focus();
                                    _this.saveOnInput();
                                }, 0);
                            },
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
});
var TogglePrefixOpts = /** @class */ (function () {
    function TogglePrefixOpts(prefix) {
        // Count
        this.changedChars = 0;
        this.prefix = prefix;
        this.len = prefix.length;
    }
    TogglePrefixOpts.prototype.transformLine = function (l, i) {
        if (l.slice(0, this.len) == this.prefix) {
            this.changedChars -= this.len;
            return l.slice(this.len);
        }
        else {
            this.changedChars += this.len;
            return this.prefix + l;
        }
    };
    TogglePrefixOpts.prototype.selStartMod = function () {
        return 0;
    };
    TogglePrefixOpts.prototype.selEndMod = function () {
        return this.changedChars;
    };
    return TogglePrefixOpts;
}());
;
var ToggleEnumerateOpts = /** @class */ (function () {
    function ToggleEnumerateOpts() {
        // Count
        this.changedChars = 0;
        this.s = null;
    }
    ToggleEnumerateOpts.prototype.transformLine = function (l, i) {
        if (this.s === null) {
            this.s = i - 1;
        }
        var matches = l.match(/^\d+\.\s/);
        if (matches) {
            this.changedChars -= matches[0].length;
            return l.replace(/^\d+\.\s/, '');
        }
        else {
            var n = i - this.s;
            this.changedChars += 2 + Math.ceil(Math.log10(n + 1));
            return n.toString() + '. ' + l;
        }
    };
    ToggleEnumerateOpts.prototype.selStartMod = function () {
        return 0;
    };
    ToggleEnumerateOpts.prototype.selEndMod = function () {
        return this.changedChars;
    };
    return ToggleEnumerateOpts;
}());
;
var CycleHeadingsOpts = /** @class */ (function () {
    function CycleHeadingsOpts() {
    }
    CycleHeadingsOpts.prototype.transformLine = function (l, i) {
        var idx = l.search(' ');
        var beginning = l.substr(0, idx);
        var rest = l.substr(idx + 1);
        switch (beginning) {
            case '#':
            case '##':
                this.added = 1;
                return '#' + l;
                break;
            case '###':
                this.added = -4;
                return rest;
                break;
            default:
                this.added = 2;
                return '# ' + l;
        }
    };
    CycleHeadingsOpts.prototype.selStartMod = function () {
        return this.added;
    };
    CycleHeadingsOpts.prototype.selEndMod = function () {
        return this.added;
    };
    return CycleHeadingsOpts;
}());
;
//# sourceMappingURL=editor.js.map