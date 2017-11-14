var byId = document.getElementById.bind(document);
var ui = null;
var bus = new Vue();

window.addEventListener('load', function () {

    Vue.use(VueRouter);

    router = new VueRouter({
        routes: [
            {
                path: '/dashboard',
                component: 'stories-dashboard',
            },
            {
                path: '/editor',
                component: 'story-editor',
            },
            { path: '*', redirect: '/dashboard' }
        ]
    });
    
    ui = new Vue({
        router,
        data: {
            status: 'stories',
            post: {},
            postTags: [],
            postAuthors: [],
            allUsers: [],
            allTags: [],
        },
        methods: {
            go2Stories: function () {
                ui.status = 'stories';
            },
            go2Editor: function (post) {
                var _this = this;

                this.post = post;
                this.status = 'loading';

                All('Tags').fetch(function (tags) {
                    All('Users').fetch(function (users) {
                        ajaj('get-authors-and-tags', {
                            post: post.Id,
                        }, function (authorsAndTags)
                        {
                            authorsAndTags.Authors = _.plainObj(authorsAndTags.Authors);
                            authorsAndTags.Tags = _.plainObj(authorsAndTags.Tags);

                            _this.postAuthors = authorsAndTags.Authors;
                            _this.postTags = authorsAndTags.Tags;
                            _this.allTags = tags.getData();
                            _this.allUsers = users.getData();

                            _this.status = 'edit';
                        });
                    });
                });
            },
            go2NewEditor: function () {
                var post = {
                    Id: "",
                    Title: "",
                    Plaintext:"",
                    Html: "",
                    Featured_Image: "",
                    Visible: 0,
                    Page: 0,
                    Featured: 0,
                    Created_At: (new Date()).toISOString(),
                    Updated_At: null,
                    Published_At: null,
                    Code_Injection: "",
                    Custom_Excerpt: ""
                };
                this.go2Editor(post);
            },
            go2Settings: function (which) {
                this.status = 'settings-' + which;
            },
            go2Team: function () {
                this.status = 'team';
            },
            go2Tags: function () {
                this.status = 'tags';
            },
            go2Subscribers: function () {
                this.status = 'subscribers';
            },
        },
        mounted: function () {
            var _this = this;

            bus.$on('editpost', function (post) {
                _this.go2Editor(post);
            });

            bus.$on('added_tag', function (type, tag) {
                _this['post' + type].push(tag);
            });

            bus.$on('removed_tag', function (type, tag) {
                var array = _this['post' + type];
                array.splice(array.indexOf(tag), 1);
            });
        },
        created: function () {
            //this.$vuetify.theme.primary = '#b3d4fc';
            //this.$vuetify.theme.secondary = '#b3d4fc';
            //this.$vuetify.theme.accent = 'rgb(251, 140, 0);';
        },
    }).$mount('#main');
});
