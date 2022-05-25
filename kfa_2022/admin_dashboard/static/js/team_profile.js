function TeamProfile(teamListServer, teamDataServer){ 
    this.teamDataServer = teamDataServer
    this.teamListServer = teamListServer
    this.init = function(){
        const { createApp } = Vue
        let self = this
        const app = createApp({
            delimiters: ['[[', ']]'],
            mounted: function() {
               console.log(this.teamData.LOGO_PATH)
            },
            data: function(){
                return {
                   teamData : self.teamDataServer,
                   teamList : self.teamListServer
                }
            },
            watch: {
               
            },
            methods: {
                generatePdf: function(){
                    const element = document.getElementById('list-team');
                    // Choose the element and save the PDF for our user.
                    html2pdf().from(element).save();
                },
            },
        })
        app.mount("#team-profile-main")
    }
}

