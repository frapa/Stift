Vue.component('loading',  {
    template: '#loading',
});

Vue.component('stories-dashboard', async function (resolve, reject) {
    var posts = await All('Posts').fetch();

    // Start component
    resolve({
        template: '#stories-dashboard',
        data: function () {
            setTimeout(() => window.scrollTo(0,0), 0);
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
                };
            },
        }
    });
    // End component
});

Vue.component('settings-blog', async function (resolve, reject) {
    await settings.fetch();
    var themes = await All("Themes").fetch();

    var augmentedThemes = []
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
            save: async function () {
                var _this = this;

                settings.each(function (setting) {
                    var key = setting.get('Key');

                    if (key in _this) {
                        var value = _this[setting.get('Key')]

                        if (
                            key === 'JpegQuality' ||
                            key === 'MaxResolution'
                        ) {
                            value = parseInt(value).toString();
                        } else if (
                            key === 'SearchEnabled' ||
                            key === 'SubscribersEnabled'
                        ) {
                            value = value ? '1' : '0';
                        }

                        setting.set('Value', value);
                    }
                });

                await settings.save();

                _this.saveSnackbar = true;
            },
            activateTheme: function (themeId) {
                this.themeId = themeId;
                this.Theme = themeId;
                this.save();
            },
        },
    });
    // End component
});

Vue.component('settings-user', async function (resolve, reject) {
    await user.fetch();

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
            setPassword: async function () {
                if (this.password != this.repeatPassword) {
                    this.hint = 'The passwords do not match.';
                    this.error = true;
                    return;
                }

                if (this.password.length < 8) {
                    this.hint = 'Password must be at least 8 characters long.';
                    this.error = true;
                    return;
                }

                this.changePassword = false;
                var res = await fetch('/admin/password', {
                    credentials: 'same-origin',
                    method: 'POST',
                    body: JSON.stringify({Password: this.password})
                });

                var text = await res.text();
                if (text != 'Ok') {
                    console.error(text);
                } else {
                    this.saveSnackbar = true;
                }
            },
        },
    });
    // End component
});

Vue.component('team', async function (resolve, reject) {
    var users = await All('Users').fetch();

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
            addUser: async function () {
                var _this = this;

                var tag = New("Users", {
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

                await tag.save();

                setTimeout(function () {
                    byId(tag.get('Id')).click();
                }, 0);
            },
            initTags: function (tags) {
                this.tagsTmp = tags.split(',')
                    .map(tag => tag.trim());
            },
            saveUser: function (user, field) {
                if (field == "Slug") {
                    var rest = this.tmp.replace(/[^a-zA-Z0-9\-_]/g, '');
                    if (rest != this.tmp) {
                        this.slugError = true;
                        return
                    }
                }

                if (field == "Email") {
                    var isEmail = this.tmp.match(/^\S+@\S+\.\w+$/g, '');
                    if (!isEmail) {
                        this.emailError = true;
                        return
                    }
                }

                if (field == "Tags") {
                    user[field] = this.tagsTmp.join(', ');
                } else {
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

                this.selected.forEach(async function (user) {
                    console.log(user)
                    var res = await fetch('/admin/invite-member', {
                        credentials: 'same-origin',
                        method: 'POST',
                        body: JSON.stringify({Email: user.Email})
                    });

                    var text = await res.text();
                    if (text != 'Ok') {
                        console.error(text);
                    } else {
                        this.saveSnackbar = true;
                    }
                });
            }
        },
    });
    // End component
});

Vue.component('tags', async function (resolve, reject) {
    var tags = await All('Tags').fetch();

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
            addTag: async function () {
                var _this = this;

                var tag = New("Tags", {
                    Id: '',
                    Name: '',
                    Slug: '',
                    Description: '',
                    Image: '',
                });

                await tag.save();

                setTimeout(function () {
                    byId(tag.get('Id')).click();
                }, 0);
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
                        return
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
    // End component
});

Vue.component('subscribers', async function (resolve, reject) {
    var subscribers = await All('Subscribers').fetch();
    
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
                    date.toLocaleString(undefined, {month: 'short'}) + ' ' +
                    date.getFullYear();
            },
        },
    });
    // End component
});

Vue.component('media', async function (resolve, reject) {
    var media = await All('Media').fetch();

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
                return this.dialog  ? '' : 'background-color: transparent;';
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
                    unit = "KB"
                }

                if (size > 1024) {
                    size /= 1024.0;
                    unit = "MB"
                }

                if (size > 1024) {
                    size /= 1024.0;
                    unit = "GB"
                }

                return size.toPrecision(3) + ' ' + unit;
            },
            formatDate: function (file) {
                var date = new Date(file.Uploaded_At)
                return date.getDate() + '.' + (date.getMonth()+1) + '.' + date.getFullYear()
            },
            click: function (file) {
                if (this.dialog) {
                    this.$emit('selected', file);
                } else {
                    console.log(file.Path);
                }
            },
        },
    });
    // End component
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
        sendUpload: async function (data) {
            var _this = this;
            
            this.uploading = true;

            var res = await fetch('/admin/upload', {
                credentials: 'same-origin',
                method: 'POST',
                body: data
            });

            var text = await res.text();
            var json = JSON.parse(text);
            _this.saveDbFile(json);
        },
        saveDbFile: async function (data) {
            await data.forEach(async function (file) {
                await New('Media', {
                    Path: file.Path,
                    Uploaded_At: (new Date()).toISOString(),
                    Size: file.Size,
                    Width: file.XRes,
                    Height: file.YRes,
                }).save();
            });
            
            this.uploading = false;
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

Vue.component('story', async function (resolve, reject) {
    var media = await All('Media').fetch();

    resolve({
        props: ['post'],
        template: '#story',
        data: function () {
            var post = this.post;
            var featuredImage = media.find((m) => {
                return m.get('Id') === post.Featured_Image;
            });

            return {
                featuredImageUrl: featuredImage ?
                    '/media/' + featuredImage.get('Path') : '/admin/images/post_placeholder.svg';
            };
        },
        computed: {
        },
        methods: {
            editPost: function () {
                router.push('/admin/editor/' + this.post.Id);
            },
        },
    });
});

