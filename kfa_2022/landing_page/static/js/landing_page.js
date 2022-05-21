function LandingPage(){   
    this.init = function(csrfToken){
        const { createApp } = Vue
        const app = createApp({
            delimiters: ['[[', ']]'],
            data: function(){
                return {
                }
            },
            methods: {
            },
        })
        app.mount("#landing-page-main")
    }
}

