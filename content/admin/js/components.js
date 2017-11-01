Vue.component('app-main', {
    props: ['status', 'post'],
    template: '#main-view',
    // data: function () {
    //     return {
    //
    //     };
    // },
    computed: {
        showStories: function () {
            return this.status === 'stories';
        },
        showEditor: function () {
            return this.status === 'edit';
        },
    },
});

Vue.component('stories-dashboard',  function (resolve, reject) {
    All('Posts').fetch(function (posts) {
        // Start component
        resolve({
            template: '#stories-dashboard',
            data: function () {
                console.log(posts.getData());
                return {
                    posts: posts.getData(),
                };
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
    props: ['post'],
    template: '#story-editor',
    data: function () {
        return {
            saveSnackbar: false,
            snackbarTimeout: 1000,
        };
    },
    methods: {
        save: function () {
            var _this = this;

            window.onbeforeunload = undefined;
            var post = New('Posts', this.post);

            post.save(function () {
                _this.saveSnackbar = true;
            });
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
    },
    destroyed: function () {
    }
});
