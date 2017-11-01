var byId = document.getElementById;
var ui = null;
var bus = new Vue();

window.addEventListener('load', function () {
    ui = new Vue({
        el: '#main',
        data: {
            status: 'stories',
            post: {},
            showFooter: false,
        },
        methods: {
            go2Stories: function () {
                ui.status = 'stories';
            },
            go2Editor: function (post) {
                this.post = post;
                this.showFooter = true;
                this.status = 'edit';
            },
            go2NewEditor: function () {
                var post = {
                    Id: "",
                    Title: "",
                    Plaintext:"",
                    Html: "",
                    Featured_Image: "",
                    Visibility: "",
                    Tags: "",
                    Author: 0,
                    Type: "",
                    Featured: 1,
                    Created_At: null,
                    Updated_At: null,
                    Published_At: null,
                    Code_Injection: "",
                    Custom_Excerpt: ""
                };
                this.go2Editor(post);
            },
        },
        mounted: function () {
            var _this = this;

            bus.$on('editpost', function (post) {
                _this.go2Editor(post);
            });
        },
    });
});
