Vue.component('story-editor', async function (resolve, reject) {
    var posts = await All('Posts').fetch();
    var tags = await All('Tags').fetch();
    var users = await All('Users').fetch();
    var media = await All('Media').fetch();

    // Start component
    resolve({
        props: ['postId'],
        template: '#story-editor',
        data: function () {
            var _this = this;

            if (this.postId) {
                var post = posts.find((p) => {
                    return p.get('Id') === _this.postId;
                });
                var featuredImage = media.find((m) => {
                    return m.get('Id') === post.get('Featured_Image');
                });

                ajaj('/admin/get-authors-and-tags', {
                    post: this.postId,
                }).then(function (authorsAndTags)
                    {
                        var authors = __.plainObj(authorsAndTags.Authors);
                        var tags = __.plainObj(authorsAndTags.Tags);

                        _this.currentAuthors = _.pluck(authors, 'Id');
                        _this.currentTags = _.pluck(tags, 'Id');
                        _this.prevAuthors = _.pluck(authors, 'Id');
                        _this.prevTags = _.pluck(tags, 'Id');

                        _this.linkIds = {};
                        tags.forEach((tag) => {
                            _this.linkIds[tag.Id] = tag.LinkId;
                        });
                        authors.forEach((author) => {
                            _this.linkIds[author.Id] = author.LinkId;
                        });

                        setTimeout(() => window.scrollTo(0,0), 0);
                    });
            } else {
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

                async function setAuthor () {
                    await post.save();

                    _this.currentAuthors = [user.get('Id')];
                    _this.prevAuthors = [user.get('Id')];
                    _this.currentTags = [];
                    _this.prevTags = [];

                    var link = New('Post2Users', {
                        Post: post.get('Id'),
                        User: user.get('Id')
                    });
                    await link.save();
                    
                    _this.linkIds = {
                        [user.get('Id')]: link.get('Id')
                    };

                    router.replace('/admin/editor/' + post.get('Id'));
                    setTimeout(() => window.scrollTo(0,0), 0);
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
            save: async function () {
                var _this = this;

                clearTimeout(this.timeoutId);
                this.timeoutId = null;

                this.compileMarkdown();
                this.updateSlug();

                window.onbeforeunload = undefined;
                var post = New('Posts', this.post);

                await post.save();
                await _this.saveAuthorsAndTags();
                _this.saveSnackbar = true;
            },

            compileMarkdown: function () {
                this.post.Html = marked(this.post.Plaintext);
            },

            updateSlug: function () {
                var title = this.post.Title.toLowerCase();
                var slug = title.replace(/[^\d\w]+/g, '-');
                this.post.Slug = slug;
            },

            diffAndSave: async function (prev, current, allElems, elemType) {
                var _this = this;
                var post = this.post;

                var deleted = [];
                var added = [];

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
                await added.forEach(async function (elem) {
                    var data = { Post: post.Id };
                    data[elemType.slice(0,-1)] = elem.Id;
                    var link = New('Post2' + elemType, data);

                    await link.save();

                    // Update before array
                    var newElem = __.plainObj(elem);
                    newElem.LinkId = link.get('Id');
                    bus.$emit('added_tag', elemType, newElem);
                });

                // Destroy links
                await deleted.forEach(async function (elem) {
                    var link = New('Post2' + elemType, { Id: _this.linkIds[elem.Id] });

                    await link.delete();

                    // Update before array
                    bus.$emit('removed_tag', elemType, elem);
                });
                
                var typeOrAuthor = elemType === 'Users' ? 'Authors' : elemType;
                this['prev' + typeOrAuthor] = current.slice(0);
            },

            saveAuthorsAndTags: async function () {
                await this.diffAndSave(
                    this.prevAuthors,
                    this.currentAuthors,
                    this.allUsers,
                    'Users'
                );

                await this.diffAndSave(
                    this.prevTags,
                    this.currentTags,
                    this.allTags,
                    'Tags'
                );
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

            setFeaturedPicture: async function (file) {
                this.post.Featured_Image = file ? file.Id : "";
                this.save();
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
                setTimeout(() => {
                    ta.setSelectionRange(
                        startSel + start.length,
                        endSel + start.length
                    );
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

                this.transformLinesIntern(ta, tav, lnum, lnum+1, opts);
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

                var lines = tav.split('\n')

                var newLines = lines.map((l, i) => {
                    if (i >= lstart && i < lend) {
                        return opts.transformLine(l, i);
                    }
                    return l;
                });

                this.post.Plaintext = newLines.join('\n');

                var pn = ta.parentNode.parentNode;
                pn.style.height = ta.clientHeight + 'px';
                setTimeout(() => {
                    ta.setSelectionRange(
                        startSel + opts.selStartMod(),
                        endSel + opts.selEndMod(),
                    );
                    ta.focus();
                    _this.saveOnInput();
                }, 0);
            },
        }
    });
    // End component
});

class TogglePrefixOpts {
    constructor(prefix) {
        // Count
        this.changedChars = 0;

        this.prefix = prefix;
        this.len = prefix.length;
    }

    transformLine(l, i) {
        if (l.slice(0, this.len) == this.prefix) {
            this.changedChars -= this.len;
            return l.slice(this.len);
        } else {
            this.changedChars += this.len;
            return this.prefix + l;
        }
    }

    selStartMod() {
        return 0;
    }

    selEndMod() {
        return this.changedChars;
    }
};

class ToggleEnumerateOpts {
    constructor() {
        // Count
        this.changedChars = 0;
        this.s = null;
    }

    transformLine(l, i) {
        if (this.s === null) {
            this.s = i - 1;
        }

        var matches = l.match(/^\d+\.\s/);
        if (matches) {
            this.changedChars -= matches[0].length;
            return l.replace(/^\d+\.\s/, '');
        } else {
            var n = i - this.s;
            this.changedChars += 2 + Math.ceil(Math.log10(n+1));
            return n.toString() + '. ' + l;
        }
    }

    selStartMod() {
        return 0;
    }

    selEndMod() {
        return this.changedChars;
    }
};

class CycleHeadingsOpts {
    transformLine(l, i) {
        var idx = l.search(' ');
        var beginning = l.substr(0, idx);
        var rest = l.substr(idx+1);
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
    }

    selStartMod() {
        return this.added;
    }

    selEndMod() {
        return this.added;
    }
};
