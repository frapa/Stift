Vue.component('app-main', {
    props: ['status', 'post', 'postTags', 'postAuthors', 'allTags', 'allUsers'],
    template: '#main-view',
    computed: {
        showStories: function () {
            return this.status === 'stories';
        },
        showEditor: function () {
            return this.status === 'edit';
        },
        showSettingsBlog: function () {
            return this.status === 'settings-blog';
        },
        showSettingsUser: function () {
            return this.status === 'settings-user';
        },
        showTeam: function () {
            return this.status === 'team';
        },
        showTags: function () {
            return this.status === 'tags';
        },
        showSubscribers: function () {
            return this.status === 'subscribers';
        },
        showLoading: function () {
            return this.status === 'loading';
        },
    },
});

Vue.component('loading',  {
    template: '#loading',
});

Vue.component('stories-dashboard',  function (resolve, reject) {
    All('Posts').fetch(function (posts) {
        // Start component
        resolve({
            template: '#stories-dashboard',
            data: function () {
                return {
                    posts: posts.getData(),
                };
            },
        });
        // End component
    });
});

Vue.component('settings-blog',  function (resolve, reject) {
    settings.fetch(function () {
        All("Themes").fetch(function (themes) {
            var themeId = getSetting('Theme');

            var augmentedThemes = []
            themes.each(function (theme) {
                augmentedTheme = theme.getModelData();

                var themeName = theme.get('Name');
                var themeSlug = themeName.toLowerCase().replace(' ', '_');
                var themeImage = "/media/" + themeSlug + ".png";

                augmentedTheme.enabled = themeId == augmentedTheme.Id ?
                    "Enabled" : "";
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
                        SearchEnabled: parseInt(getSetting('SearchEnabled')),
                        SubscribersEnabled: parseInt(getSetting('SubscribersEnabled')),
                        themeId: themeId,
                        themes: augmentedThemes,
                        saveSnackbar: false,
                        snackbarTimeout: 1000,
                    };
                },
                methods: {
                    save: function () {
                        var _this = this;

                        settings.each(function (setting) {
                            setting.set(
                                'Value',
                                _this[setting.get('Key')]
                            );
                        });

                        settings.save(function () {
                            _this.saveSnackbar = true;
                        });
                    },
                },
            });
            // End component
        });
    });
});

Vue.component('settings-user',  function (resolve, reject) {
    user.fetch(function () {
        // Start component
        resolve({
            template: '#settings-user',
            data: function () {
                return {
                    user: user.getData()[0],
                    saveSnackbar: false,
                    snackbarTimeout: 1000,
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
                }
            },
        });
        // End component
    });
});

Vue.component('team',  function (resolve, reject) {
    All('Users').fetch(function (users) {
        // Start component
        resolve({
            template: '#team',
            data: function () {
                return {
                    users: users.getData(),
                    header: [
                        { text: 'Name', value: 'Name', align: 'left' },
                        { text: 'Email', value: 'Email', align: 'left' },
                        { text: 'Tags', value: 'Tags', align: 'left' },
                    ],
                    selected: [],
                };
            },
            methods: {
            },
        });
        // End component
    });
});

Vue.component('tags',  function (resolve, reject) {
    All('Tags').fetch(function (tags) {
        // Start component
        resolve({
            template: '#tags',
            data: function () {
                var tagData = [];
                tags.getData().forEach(function (data) {
                    var data2 = _.plainObj(data); // clone
                    data2['value'] = false;
                    tagData.push(data2);
                });

                return {
                    tags: tagData,
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
                    var _this = this;

                    var tag = New("Tags", {
                        Name: '',
                        Slug: '',
                        Description: '',
                    });

                    tag.save(function () {
                        var data = _.plainObj(tag.getModelData());
                        data['value'] = false;
                        _this.tags.push(data);

                        tags.add(tag);

                        setTimeout(function () {
                            byId(tag.get('Id')).click();
                        }, 0);
                    });
                },
                stripValue: function (elem) {
                    var _this = this;

                    if (elem instanceof Array) {
                        obj = [];
                        elem.forEach(function (singleElem) {
                            obj.push(_this.stripValueIntern(singleElem));
                        });
                    } else {
                        obj = _this.stripValueIntern(elem);
                    }

                    return obj;
                },
                stripValueIntern: function (elem) {
                    var elem2 = _.plainObj(elem);
                    elem2['value'] = undefined;
                    return elem2
                },
                deleteTags: function () {
                    var _this = this;

                    this.selected.forEach(function (tag) {
                        _this.tags.splice(_this.tags.indexOf(tag), 1)

                        var tagModel = New("Tags", _this.stripValue(tag));
                        tags.remove(tagModel);
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

                    tags.setData(this.stripValue(this.tags));
                    tags.forceSave();
                },
            },
        });
        // End component
    });
});

Vue.component('subscribers',  function (resolve, reject) {
    All('Subscribers').fetch(function (subscribers) {
        // Start component
        resolve({
            template: '#subscribers',
            data: function () {
                return {
                    subscribers: subscribers.getData(),
                    header: [
                        { text: 'Email', value: 'Email', align: 'left' },
                    ],
                    selected: [],
                };
            },
            methods: {
            },
        });
        // End component
    });
});

Vue.component('story', {
    props: ['post'],
    template: '#story',
    methods: {
        editPost: function () {
            bus.$emit('editpost', this.post)
        },
    }
});

Vue.component('story-editor', {
    props: ['post', 'tags', 'authors', 'allTags', 'allUsers'],
    template: '#story-editor',
    data: function () {
        return {
            saveSnackbar: false,
            snackbarTimeout: 1000,
            currentAuthors: _.pluck(this.authors, 'Id'),
            currentTags: _.pluck(this.tags, 'Id'),
        };
    },
    methods: {
        save: function () {
            var _this = this;

            this.compileMarkdown();
            this.updateSlug();

            window.onbeforeunload = undefined;
            var post = New('Posts', this.post);

            post.save(function () {
                _this.saveAuthorsAndTags(function () {
                    _this.saveSnackbar = true;
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

        diffAndSave: function (before, nowIds, all, type, callback) {
            var post = this.post;

            var deleted = [];
            var added = [];

            before.forEach(function (beforeElem) {
                var foundId = _.find(nowIds, function (nowElemId) {
                    return beforeElem.Id == nowElemId;
                });

                if (foundId === null) {
                    deleted.push(beforeElem);
                }
            });

            nowIds.forEach(function (nowElemId) {
                var foundElem = _.find(before, function (beforeElem) {
                    return nowElemId == beforeElem.Id;
                });

                if (foundElem === null) {
                    var nowElem = _.find(all, function (elem) {
                        return elem.Id == nowElemId;
                    });

                    if (nowElem) {
                        added.push(nowElem);
                    }
                }
            });

            var waiter = _.waitAsync(
                added.length + deleted.length, callback);

            // Created the missing links
            added.forEach(function (elem) {
                var data = { Post: post.Id };
                data[type.slice(0,-1)] = elem.Id;
                var link = New('Post2' + type, data);

                link.save(function () {
                    // Update before array
                    var newElem = _.plainObj(elem);
                    newElem.LinkId = link.get('Id');
                    bus.$emit('added_tag', type, newElem);

                    waiter.done();
                });
            });

            // Destroy links
            deleted.forEach(function (elem) {
                var link = New('Post2' + type, { Id: elem.LinkId });
                link.delete(function () {
                    // Update before array
                    bus.$emit('removed_tag', type, elem);
                    waiter.done();
                });
            });
        },

        saveAuthorsAndTags: function (callback) {
            var waiter = _.waitAsync(2, callback);

            this.diffAndSave(
                this.authors,
                this.currentAuthors,
                this.allUsers,
                'Users',
                waiter.done
            );

            this.diffAndSave(
                this.tags,
                this.currentTags,
                this.allTags,
                'Tags',
                waiter.done
            );
        },

        saveOnInput: function () {
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
                _this.timeoutId = null;
            }, 1000);
        },

        publish: function () {
            this.post.Updated_At = (new Date()).toISOString();

            if (!this.post.Published_At) {
                this.post.Published_At = (new Date()).toISOString();
            }

            this.post.Visible = 1;
            this.save();
        },
    }
});
