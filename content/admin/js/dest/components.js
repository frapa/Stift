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
                            return {
                                posts: posts.getData(),
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