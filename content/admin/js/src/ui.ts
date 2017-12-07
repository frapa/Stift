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
        router,
        created: function () {
            //this.$vuetify.theme.primary = '#b3d4fc';
            //this.$vuetify.theme.secondary = '#b3d4fc';
            //this.$vuetify.theme.accent = 'rgb(251, 140, 0);';
        },
    }).$mount('#main');
};
