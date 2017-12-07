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
        //        data: {
        //            status: 'stories',
        //            post: {},
        //            postTags: [],
        //            postAuthors: [],
        //            allUsers: [],
        //            allTags: [],
        //        },
        //        methods: {
        //            go2Stories: function () {
        //                ui.status = 'stories';
        //            },
        //            go2Editor: function (post) {
        //                var _this = this;
        //
        //                this.post = post;
        //                this.status = 'loading';
        //
        //                All('Tags').fetch(function (tags) {
        //                    All('Users').fetch(function (users) {
        //                        ajaj('get-authors-and-tags', {
        //                            post: post.Id,
        //                        }, function (authorsAndTags)
        //                        {
        //                            authorsAndTags.Authors = _.plainObj(authorsAndTags.Authors);
        //                            authorsAndTags.Tags = _.plainObj(authorsAndTags.Tags);
        //
        //                            _this.postAuthors = authorsAndTags.Authors;
        //                            _this.postTags = authorsAndTags.Tags;
        //                            _this.allTags = tags.getData();
        //                            _this.allUsers = users.getData();
        //
        //                            _this.status = 'edit';
        //                        });
        //                    });
        //                });
        //            },
        //            go2NewEditor: function () {
        //                var post = {
        //                    Id: "",
        //                    Title: "",
        //                    Plaintext:"",
        //                    Html: "",
        //                    Featured_Image: "",
        //                    Visible: 0,
        //                    Page: 0,
        //                    Featured: 0,
        //                    Created_At: (new Date()).toISOString(),
        //                    Updated_At: null,
        //                    Published_At: null,
        //                    Code_Injection: "",
        //                    Custom_Excerpt: ""
        //                };
        //                this.go2Editor(post);
        //            },
        //            go2Settings: function (which) {
        //                this.status = 'settings-' + which;
        //            },
        //            go2Team: function () {
        //                this.status = 'team';
        //            },
        //            go2Tags: function () {
        //                this.status = 'tags';
        //            },
        //            go2Subscribers: function () {
        //                this.status = 'subscribers';
        //            },
        //        },
        //        mounted: function () {
        //            var _this = this;
        //
        //            bus.$on('editpost', function (post) {
        //                _this.go2Editor(post);
        //            });
        //
        //            bus.$on('added_tag', function (type, tag) {
        //                _this['post' + type].push(tag);
        //            });
        //
        //            bus.$on('removed_tag', function (type, tag) {
        //                var array = _this['post' + type];
        //                array.splice(array.indexOf(tag), 1);
        //            });
        //        },
        created: function () {
            //this.$vuetify.theme.primary = '#b3d4fc';
            //this.$vuetify.theme.secondary = '#b3d4fc';
            //this.$vuetify.theme.accent = 'rgb(251, 140, 0);';
        },
    }).$mount('#main');
}
;
//# sourceMappingURL=ui.js.map