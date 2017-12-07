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
Vue.component('loading', {
    template: '#loading',
});
Vue.component('stories-dashboard', function (resolve, reject) {
    return __awaiter(this, void 0, void 0, function () {
        var posts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, All('Posts').fetch()];
                case 1:
                    posts = _a.sent();
                    // Start component
                    resolve({
                        template: '#stories-dashboard',
                        data: function () {
                            setTimeout(function () { return window.scrollTo(0, 0); }, 0);
                            var sortedPosts = posts.getData().sort(function (a, b) {
                                return a.Created_At < b.Created_At;
                            });
                            return {
                                posts: sortedPosts,
                                filter: 'all',
                            };
                        },
                        methods: {
                            isVisible: function (post) {
                                switch (this.filter) {
                                    case 'all':
                                        return true;
                                    case 'drafts':
                                        return !post.Visible;
                                    case 'public':
                                        return post.Visible;
                                    case 'featured':
                                        return post.Featured;
                                    case 'pages':
                                        return post.Page;
                                }
                                ;
                            },
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
});
Vue.component('settings-blog', function (resolve, reject) {
    return __awaiter(this, void 0, void 0, function () {
        var themes, augmentedThemes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, settings.fetch()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, All("Themes").fetch()];
                case 2:
                    themes = _a.sent();
                    augmentedThemes = [];
                    themes.each(function (theme) {
                        augmentedTheme = theme.getModelData();
                        var themeName = theme.get('Name');
                        var themeSlug = themeName.toLowerCase().replace(' ', '_');
                        var themeImage = "/themes/" + themeSlug + "/media/" + themeSlug + ".png";
                        augmentedTheme.image = themeImage;
                        augmentedThemes.push(augmentedTheme);
                    });
                    // Start component
                    resolve({
                        template: '#settings-blog',
                        data: function () {
                            return {
                                BlogTitle: getSetting('BlogTitle'),
                                BlogSubtitle: getSetting('BlogSubtitle'),
                                BlogUrl: getSetting('BlogUrl'),
                                Theme: getSetting('Theme'),
                                OutgoingEmailAddress: getSetting('OutgoingEmailAddress'),
                                MaxResolution: parseInt(getSetting('MaxResolution')),
                                JpegQuality: parseInt(getSetting('JpegQuality')),
                                SearchEnabled: parseInt(getSetting('SearchEnabled')),
                                SubscribersEnabled: parseInt(getSetting('SubscribersEnabled')),
                                themes: augmentedThemes,
                                saveSnackbar: false,
                                snackbarTimeout: 1000,
                                emailHint: "You can use the format 'Name &lt;email@example.com&gt;'"
                                    + " to shown a name as sender of the emails."
                            };
                        },
                        methods: {
                            save: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var _this;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _this = this;
                                                settings.each(function (setting) {
                                                    var key = setting.get('Key');
                                                    if (key in _this) {
                                                        var value = _this[setting.get('Key')];
                                                        if (key === 'JpegQuality' ||
                                                            key === 'MaxResolution') {
                                                            value = parseInt(value).toString();
                                                        }
                                                        else if (key === 'SearchEnabled' ||
                                                            key === 'SubscribersEnabled') {
                                                            value = value ? '1' : '0';
                                                        }
                                                        setting.set('Value', value);
                                                    }
                                                });
                                                return [4 /*yield*/, settings.save()];
                                            case 1:
                                                _a.sent();
                                                _this.saveSnackbar = true;
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            activateTheme: function (themeId) {
                                this.themeId = themeId;
                                this.Theme = themeId;
                                this.save();
                            },
                        },
                    });
                    return [2 /*return*/];
            }
        });
    });
});
Vue.component('settings-user', function (resolve, reject) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, user.fetch()];
                case 1:
                    _a.sent();
                    // Start component
                    resolve({
                        template: '#settings-user',
                        data: function () {
                            return {
                                user: user.getData()[0],
                                saveSnackbar: false,
                                snackbarTimeout: 1000,
                                changePassword: false,
                                password: '',
                                repeatPassword: '',
                                hint: 'At least 8 characters',
                                error: false,
                            };
                        },
                        methods: {
                            changeTheme: function () {
                                setTheme(this.user.Dark_Theme ? 'dark' : 'light');
                            },
                            save: function () {
                                var _this = this;
                                var updateUser = New('Users', this.user);
                                updateUser.save(function () {
                                    _this.saveSnackbar = true;
                                });
                            },
                            setPassword: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var res, text;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (this.password != this.repeatPassword) {
                                                    this.hint = 'The passwords do not match.';
                                                    this.error = true;
                                                    return [2 /*return*/];
                                                }
                                                if (this.password.length < 8) {
                                                    this.hint = 'Password must be at least 8 characters long.';
                                                    this.error = true;
                                                    return [2 /*return*/];
                                                }
                                                this.changePassword = false;
                                                return [4 /*yield*/, fetch('/admin/password', {
                                                        credentials: 'same-origin',
                                                        method: 'POST',
                                                        body: JSON.stringify({ Password: this.password })
                                                    })];
                                            case 1:
                                                res = _a.sent();
                                                return [4 /*yield*/, res.text()];
                                            case 2:
                                                text = _a.sent();
                                                if (text != 'Ok') {
                                                    console.error(text);
                                                }
                                                else {
                                                    this.saveSnackbar = true;
                                                }
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                        },
                    });
                    return [2 /*return*/];
            }
        });
    });
});
Vue.component('team', function (resolve, reject) {
    return __awaiter(this, void 0, void 0, function () {
        var users;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, All('Users').fetch()];
                case 1:
                    users = _a.sent();
                    // Start component
                    resolve({
                        template: '#team',
                        data: function () {
                            return {
                                users: users.getData(),
                                header: [
                                    { text: 'Name', value: 'Name', align: 'left' },
                                    { text: 'E-mail', value: 'Email', align: 'left' },
                                    { text: 'Slug', value: 'Slug', align: 'left' },
                                    { text: 'Tags', value: 'Tags', align: 'left' },
                                ],
                                selected: [],
                                search: '',
                                tmp: '',
                                tagsTmp: [],
                                availableUserTags: ['administrator', 'author'],
                                slugError: false,
                                emailError: false,
                            };
                        },
                        methods: {
                            addUser: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var _this, tag;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _this = this;
                                                tag = New("Users", {
                                                    Id: '',
                                                    Name: '',
                                                    Slug: '',
                                                    Email: '',
                                                    Location: '',
                                                    Biography: '',
                                                    Profile_Picture: '',
                                                    Tags: 'author',
                                                    Dark_Theme: false,
                                                });
                                                return [4 /*yield*/, tag.save()];
                                            case 1:
                                                _a.sent();
                                                setTimeout(function () {
                                                    byId(tag.get('Id')).click();
                                                }, 0);
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            initTags: function (tags) {
                                this.tagsTmp = tags.split(',')
                                    .map(function (tag) { return tag.trim(); });
                            },
                            saveUser: function (user, field) {
                                if (field == "Slug") {
                                    var rest = this.tmp.replace(/[^a-zA-Z0-9\-_]/g, '');
                                    if (rest != this.tmp) {
                                        this.slugError = true;
                                        return;
                                    }
                                }
                                if (field == "Email") {
                                    var isEmail = this.tmp.match(/^\S+@\S+\.\w+$/g, '');
                                    if (!isEmail) {
                                        this.emailError = true;
                                        return;
                                    }
                                }
                                if (field == "Tags") {
                                    user[field] = this.tagsTmp.join(', ');
                                }
                                else {
                                    user[field] = this.tmp;
                                }
                                if (field == "Name" && user.Slug == "") {
                                    var slug = this.tmp.toLowerCase()
                                        .replace(/ /g, '-')
                                        .replace(/[^a-zA-Z0-9\-_]/g, '');
                                    user.Slug = slug;
                                }
                                users.forceSave();
                            },
                            deleteUsers: function () {
                                var _this = this;
                                this.selected.forEach(function (user) {
                                    var userModel = New("Users", user);
                                    userModel.delete();
                                });
                                this.selected = [];
                            },
                            sendInvitationEmail: function () {
                                var _this = this;
                                this.selected.forEach(function (user) {
                                    return __awaiter(this, void 0, void 0, function () {
                                        var res, text;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    console.log(user);
                                                    return [4 /*yield*/, fetch('/admin/invite-member', {
                                                            credentials: 'same-origin',
                                                            method: 'POST',
                                                            body: JSON.stringify({ Email: user.Email })
                                                        })];
                                                case 1:
                                                    res = _a.sent();
                                                    return [4 /*yield*/, res.text()];
                                                case 2:
                                                    text = _a.sent();
                                                    if (text != 'Ok') {
                                                        console.error(text);
                                                    }
                                                    else {
                                                        this.saveSnackbar = true;
                                                    }
                                                    return [2 /*return*/];
                                            }
                                        });
                                    });
                                });
                            }
                        },
                    });
                    return [2 /*return*/];
            }
        });
    });
});
Vue.component('tags', function (resolve, reject) {
    return __awaiter(this, void 0, void 0, function () {
        var tags;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, All('Tags').fetch()];
                case 1:
                    tags = _a.sent();
                    // Start component
                    resolve({
                        template: '#tags',
                        data: function () {
                            return {
                                tags: tags.getData(),
                                header: [
                                    { text: 'Tag', value: 'Name', align: 'left' },
                                    { text: 'Slug', value: 'Slug', align: 'left' },
                                    { text: 'Description', value: 'Description', align: 'left' },
                                ],
                                search: '',
                                tmp: '',
                                selected: [],
                                slugError: false,
                            };
                        },
                        methods: {
                            addTag: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var _this, tag;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _this = this;
                                                tag = New("Tags", {
                                                    Id: '',
                                                    Name: '',
                                                    Slug: '',
                                                    Description: '',
                                                    Image: '',
                                                });
                                                return [4 /*yield*/, tag.save()];
                                            case 1:
                                                _a.sent();
                                                setTimeout(function () {
                                                    byId(tag.get('Id')).click();
                                                }, 0);
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            deleteTags: function () {
                                var _this = this;
                                this.selected.forEach(function (tag) {
                                    var tagModel = New("Tags", tag);
                                    tagModel.delete();
                                });
                                this.selected = [];
                            },
                            saveTag: function (tag, field) {
                                if (field == "Slug") {
                                    var rest = this.tmp.replace(/[^a-zA-Z0-9\-_]/g, '');
                                    if (rest != this.tmp) {
                                        this.slugError = true;
                                        return;
                                    }
                                }
                                tag[field] = this.tmp;
                                if (field == "Name" && tag.Slug == "") {
                                    var slug = this.tmp.toLowerCase()
                                        .replace(/ /g, '-')
                                        .replace(/[^a-zA-Z0-9\-_]/g, '');
                                    tag.Slug = slug;
                                }
                                tags.forceSave();
                            },
                        },
                    });
                    return [2 /*return*/];
            }
        });
    });
});
Vue.component('subscribers', function (resolve, reject) {
    return __awaiter(this, void 0, void 0, function () {
        var subscribers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, All('Subscribers').fetch()];
                case 1:
                    subscribers = _a.sent();
                    // Start component
                    resolve({
                        template: '#subscribers',
                        data: function () {
                            return {
                                subscribers: subscribers.getData(),
                                header: [
                                    { text: 'Email', value: 'Email', align: 'left' },
                                    { text: 'Subscription date', value: 'Date', align: 'left' },
                                ],
                                search: '',
                                selected: [],
                            };
                        },
                        methods: {
                            formattedDate: function (subscriber) {
                                var date = new Date(subscriber.Date);
                                return date.getDate() + ' ' +
                                    date.toLocaleString(undefined, { month: 'short' }) + ' ' +
                                    date.getFullYear();
                            },
                        },
                    });
                    return [2 /*return*/];
            }
        });
    });
});
Vue.component('media', function (resolve, reject) {
    return __awaiter(this, void 0, void 0, function () {
        var media;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, All('Media').fetch()];
                case 1:
                    media = _a.sent();
                    // Start component
                    resolve({
                        props: ['label', 'width', 'dialog'],
                        template: '#media',
                        data: function () {
                            return {
                                path: '',
                                files: media.getData(),
                            };
                        },
                        computed: {
                            cssStyle: function () {
                                return this.dialog ? '' : 'background-color: transparent;';
                            },
                        },
                        methods: {
                            widthSelected: function (num) {
                                return (12 / num) == parseInt(this.width);
                            },
                            filename: function (file) {
                                return file.Path.split('/').slice(-1)[0];
                            },
                            url: function (file) {
                                return '/media/' + file.Path;
                            },
                            isImage: function (file) {
                                var ext = file.Path.split('.').slice(-1)[0].toLowerCase();
                                var ret = [
                                    'png',
                                    'gif',
                                    'jpg',
                                    'jpeg',
                                    'bmp',
                                    'ico',
                                    'xbm',
                                    'webp',
                                    'svg',
                                ].indexOf(ext) !== -1;
                                return ret;
                            },
                            humanSize: function (file) {
                                var size = file.Size;
                                var unit = "B";
                                if (size > 1024) {
                                    size /= 1024.0;
                                    unit = "KB";
                                }
                                if (size > 1024) {
                                    size /= 1024.0;
                                    unit = "MB";
                                }
                                if (size > 1024) {
                                    size /= 1024.0;
                                    unit = "GB";
                                }
                                return size.toPrecision(3) + ' ' + unit;
                            },
                            formatDate: function (file) {
                                var date = new Date(file.Uploaded_At);
                                return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                            },
                            click: function (file) {
                                if (this.dialog) {
                                    this.$emit('selected', file);
                                }
                                else {
                                    console.log(file.Path);
                                }
                            },
                        },
                    });
                    return [2 /*return*/];
            }
        });
    });
});
Vue.component('upload-button', {
    props: ['path'],
    template: '#upload-button',
    data: function () {
        return {
            uploading: false,
        };
    },
    methods: {
        upload: function () {
            var _this = this;
            var files = ce('input');
            files.setAttribute('type', 'file');
            files.setAttribute('name', 'files');
            files.setAttribute('multiple', '1');
            files.onchange = function () {
                var data = new FormData();
                for (var i = 0; i < files.files.length; i++) {
                    var file = files.files[i];
                    data.append('files', file, file.name);
                }
                data.append('path', _this.path);
                _this.sendUpload(data);
            };
            files.click();
        },
        sendUpload: function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var _this, res, text, json;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _this = this;
                            this.uploading = true;
                            return [4 /*yield*/, fetch('/admin/upload', {
                                    credentials: 'same-origin',
                                    method: 'POST',
                                    body: data
                                })];
                        case 1:
                            res = _a.sent();
                            return [4 /*yield*/, res.text()];
                        case 2:
                            text = _a.sent();
                            json = JSON.parse(text);
                            _this.saveDbFile(json);
                            return [2 /*return*/];
                    }
                });
            });
        },
        saveDbFile: function (data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, data.forEach(function (file) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, New('Media', {
                                                    Path: file.Path,
                                                    Uploaded_At: (new Date()).toISOString(),
                                                    Size: file.Size,
                                                    Width: file.XRes,
                                                    Height: file.YRes,
                                                }).save()];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            })];
                        case 1:
                            _a.sent();
                            this.uploading = false;
                            return [2 /*return*/];
                    }
                });
            });
        },
    },
});
Vue.component('file-chooser', {
    props: ['label', 'path', 'initialfile'],
    template: '#file-chooser',
    data: function () {
        return {
            file: this.initialfile ? this.initialfile : null,
            dialogVisible: false,
        };
    },
    methods: {
        setPicture: function (file) {
            this.file = file;
            this.dialogVisible = false;
            this.$emit('picturechanged', file);
        },
        url: function (file) {
            return '/media/' + file.Path;
        },
        removePicture: function (e) {
            e.stopPropagation();
            this.file = null;
            this.$emit('picturechanged', null);
        },
    },
});
Vue.component('story', function (resolve, reject) {
    return __awaiter(this, void 0, void 0, function () {
        var media;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, All('Media').fetch()];
                case 1:
                    media = _a.sent();
                    resolve({
                        props: ['post'],
                        template: '#story',
                        data: function () {
                            var post = this.post;
                            var featuredImage = media.find(function (m) {
                                return m.get('Id') === post.Featured_Image;
                            });
                            return {
                                featuredImageUrl: featuredImage ?
                                    '/media/' + featuredImage.get('Path') : '/admin/images/post_placeholder.svg'
                            };
                        },
                        computed: {},
                        methods: {
                            editPost: function () {
                                router.push('/admin/editor/' + this.post.Id);
                            },
                        },
                    });
                    return [2 /*return*/];
            }
        });
    });
});
//# sourceMappingURL=components.js.map
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
var byId = document.getElementById.bind(document);
var ce = document.createElement.bind(document);
var ui = null;
var bus = new Vue();
function initUi() {
    Vue.use(VueRouter);
    router = new VueRouter({
        mode: 'history',
        routes: [
            {
                path: '/admin/dashboard',
                component: Vue.component('stories-dashboard'),
            },
            {
                path: '/admin/editor/:postId',
                component: Vue.component('story-editor'),
                props: true,
            },
            {
                path: '/admin/editor',
                component: Vue.component('story-editor'),
                props: true,
            },
            {
                path: '/admin/team',
                component: Vue.component('team'),
            },
            {
                path: '/admin/tags',
                component: Vue.component('tags'),
            },
            {
                path: '/admin/subscribers',
                component: Vue.component('subscribers'),
            },
            {
                path: '/admin/media',
                component: Vue.component('media'),
                props: {
                    path: '.',
                    width: 6,
                    label: 'Files',
                    dialog: false,
                }
            },
            {
                path: '/admin/blog-settings',
                component: Vue.component('settings-blog'),
            },
            {
                path: '/admin/user-settings',
                component: Vue.component('settings-user'),
            },
            { path: '*', redirect: '/admin/dashboard' }
        ]
    });
    ui = new Vue({
        router: router,
        created: function () {
            //this.$vuetify.theme.primary = '#b3d4fc';
            //this.$vuetify.theme.secondary = '#b3d4fc';
            //this.$vuetify.theme.accent = 'rgb(251, 140, 0);';
        },
    }).$mount('#main');
}
;
//# sourceMappingURL=ui.js.map
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
        }
        else {
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
                if (typeof (value) === 'object' && value !== null) {
                    // Go returns an object with 2 keys "Valid"
                    // which says if the value is null and another
                    // whose name depends on the datatype. We
                    // find out the name by exclusion of "Valid"
                    var dataKeys = Object.keys(value);
                    var validPos = dataKeys.indexOf('Valid');
                    if (validPos != -1) {
                        dataKeys.splice(validPos, 1);
                        var dataKey = dataKeys[0];
                        obj[key] = value[dataKey];
                    }
                    else {
                        console.error(dataKeys);
                        throw "Strange value in data object. See error above.";
                    }
                }
                else {
                    obj[key] = value;
                }
            }
        }
        return obj;
    },
};
window.addEventListener('load', function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
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
                    return [4 /*yield*/, All('Settings').fetch()];
                case 1:
                    settings = _a.sent();
                    return [4 /*yield*/, user.fetch()];
                case 2:
                    _a.sent();
                    initUi();
                    setTheme(user.get('Dark_Theme') ? 'dark' : 'light');
                    return [2 /*return*/];
            }
        });
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
function sendEmail(options) {
    return __awaiter(this, void 0, void 0, function () {
        var res, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch('/admin/email', {
                        credentials: 'same-origin',
                        method: 'POST',
                        body: JSON.stringify(options)
                    })];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.text()];
                case 2:
                    text = _a.sent();
                    if (text === "'mail' is not installed") {
                        console.error(text);
                    }
                    else if (text !== 'Ok') {
                        console.error(text);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=utils.js.map
