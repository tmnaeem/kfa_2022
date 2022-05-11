function UserAuth(signupUrl){ 
    this.signupUrl = signupUrl
    this.init = function(){
        const { createApp } = Vue
        const app = createApp({
            delimiters: ['[[', ']]'],
            data: function(){
                return {
                    username: null,
                    password: null,
                }
            },
            methods: {
                triggerUserLogin: function() {
                    axios({
                        method: 'post',
                        url: '/accounts/login/',
                        headers: {"X-CSRFToken": ''},
                        data: {
                          Username: this.username,
                          Password: this.password
                        }
                    });
                },

                navigateToSignUp: function(){
                    location.href = this.signupUrl
                }
            },
        })
        app.mount("#user_auth_main")
    }
}

