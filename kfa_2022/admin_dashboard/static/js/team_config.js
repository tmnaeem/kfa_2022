function TeamConfig(rowData){ 
    this.rowDataFromServer = rowData

    this.init = function(csrfToken){
        const { createApp } = Vue
        let server = this
        const app = createApp({
            delimiters: ['[[', ']]'],
            mounted: function() {

                let self = this
                this.rowData.forEach((data)=>{
                    data.logoStats = data.LOGO_PATH != '' ? self.logoStatsDict.exist : self.logoStatsDict.notExist
                    data.logoFile = null
                    data.saveStatus = self.saveStatusDict.saved
                })
                
                // init table with incoming data, { PID: , LOGO_PATH: , IS_REGISTERED: , SECRET_KEY: , TEAM: , TEAM_ID: , }
                this.teamDt = $('#team-config-table').DataTable( {
                    data: this.rowData,
                    columns: this.columns,
                    responsive: true,
                    ordering: false,
                    searching: false,
                    lengthChange: false,
                    select: 'single',
                    columnDefs:[
                        {
                            targets: 2,
                            data: null,
                            render: function render(data, type, row, meta) {
                                let htmlTemp;
                                switch(data){
                                    case self.registerStatusDict.notRegistered:
                                        htmlTemp = '<span class="badge bg-warning text-dark">Not Registered</span>'
                                        break
                                    case self.registerStatusDict.registered : 
                                        htmlTemp = '<span class="badge bg-success text-dark">Registered</span>'
                                        break
                                }
                                return htmlTemp
                            },
                        },
                        {
                            targets: 3,
                            data: null,
                            render: function render(data, type, row, meta) {
                                let htmlTemp;
                                switch(data){
                                    case self.logoStatsDict.notExist : 
                                        htmlTemp = '<span class="badge bg-warning text-dark">Not Exist</span>'
                                        break
                                    case self.logoStatsDict.exist:
                                        htmlTemp = '<span class="badge bg-success text-dark">Uploaded</span>'
                                        break
                                    case self.logoStatsDict.pending:
                                        htmlTemp = '<span class="badge bg-secondary text-dark">Pending Upload</span>'
                                        break
                                }
                                return htmlTemp
                            },
                        },
                        {
                            targets: 4,
                            data: null,
                            render: function render(data, type, row, meta) {
                                let htmlTemp;
                                switch(data){
                                    case self.saveStatusDict.notSaved : 
                                        htmlTemp = '<span class="badge bg-warning text-dark">Not Saved</span>'
                                        break
                                    case self.saveStatusDict.saved:
                                        htmlTemp = '<span class="badge bg-success text-dark">Saved</span>'
                                        break
                                }
                                return htmlTemp
                            },
                        },
                    ]
                } );

                this.teamDt.on('select', this.onSelectRowTable)
                this.teamDt.on('deselect', this.onDeSelectRowTable)
            },
            data: function(){
                return {
                    pageLocation: 'team',
                    teamDt: null,
                    columns: [
                        { data: 'TEAM', title: 'Pasukan' },
                        { data: 'SECRET_KEY', title: 'Pendaftaran ID' },
                        { data: 'IS_REGISTERED', title: 'Status Pendaftaran' },
                        { data: 'logoStats', title: 'Logo' },
                        { data: 'saveStatus', title: 'Status Data' }] ,
                    rowData: server.rowDataFromServer || [],
                    tempTeamName: null,
                    tempFile: null,
                    tempRegStatus: null,
                    logoStatsDict: {
                        notExist : 0,
                        exist : 1,
                        pending : 2
                    },
                    saveStatusDict: {
                        notSaved : 0,
                        saved : 1
                    },
                    registerStatusDict: {
                        notRegistered: 0,
                        registered: 1
                    },
                    selectionActive: false,
                    onEditTeamConfig: false,
                    deletedRows: [],
                    teamSelection: null,
                    errorTeamName: false
                }
            },
            watch: {
                tempTeamName: function(val){
                    if(this.teamDt.columns(0).data().toArray()[0].includes(val)){
                        if(this.onEditTeamConfig && val == this.teamDt.rows( { selected: true } ).data()[0].TEAM ) return 
                        this.errorTeamName = true
                    }else{
                        this.errorTeamName = false
                    } 
                },
            },
            methods: {
                onSelectRowTable: function(e, dt, type, indexes){
                    this.selectionActive = indexes[0]
                },
                onDeSelectRowTable: function(){
                    this.selectionActive = false
                },
                navigateToTeamPage: function(){
                    window.location.href = "team_profile/" + this.teamDt.rows( { selected: true } ).data()[0].TEAM;
                },
                editRowToTable: function(){
                    const selRowData = this.teamDt.rows( { selected: true } ).data()[0]
                    this.tempTeamName = selRowData.TEAM
                    this.onEditTeamConfig = true
                    $('#team-config-modal').modal('show');
                },
                updateRowToTable: function(rowIdx, data, fromServer){
                    let newData;
                    if(fromServer){
                        newData = {
                            TEAM: data.TEAM,
                            SECRET_KEY: data.SECRET_KEY,
                            IS_REGISTERED: Number(data.IS_REGISTERED),
                            LOGO_PATH: data.LOGO_PATH,
                            PID: data.PID,
                            TEAM_ID: data.TEAM_ID,
                            logoFile: null,
                            logoStats: data.LOGO_PATH ? this.logoStatsDict.exist : this.logoStatsDict.notExist,
                            saveStatus: this.saveStatusDict.saved
                        }
                        this.teamDt.row(rowIdx).data(newData).draw();  
                    }else{
                        const selRowData = this.teamDt.rows( { selected: true } ).data()[0]
                        newData = {
                            TEAM: this.tempTeamName,
                            SECRET_KEY: selRowData.SECRET_KEY,
                            IS_REGISTERED: Number(selRowData.IS_REGISTERED),
                            LOGO_PATH: selRowData.LOGO_PATH,
                            PID: selRowData.PID,
                            TEAM_ID: selRowData.TEAM_ID,
                            logoFile: this.tempFile,
                            logoStats: this.tempFile ? this.logoStatsDict.pending : selRowData.logoStats,
                            saveStatus: this.saveStatusDict.notSaved
                        }
                        this.teamDt.row(this.selectionActive).data(newData).draw();  
                    }
                }, 
                deleteRowSelected: function(){
                    const selRowData = this.teamDt.rows( { selected: true } ).data()[0]
                    if(selRowData.saveStatus == this.saveStatusDict.saved) this.deletedRows.push(selRowData.SECRET_KEY)
                    this.teamDt.rows( '.selected' ).remove().draw();
                },
                addRowToTable: function(playersData){
                    const new_uuid = uuidv4()
                    const newTeamName = this.tempTeamName
                    const newTeamLogo = this.tempFile
                    const newData = {
                        TEAM: newTeamName,
                        SECRET_KEY: new_uuid,
                        IS_REGISTERED: 0,
                        LOGO_PATH: '',
                        PID: '',
                        TEAM_ID: '',
                        logoFile: newTeamLogo,
                        logoStats: this.tempFile ? this.logoStatsDict.pending : this.logoStatsDict.notExist,
                        saveStatus: this.saveStatusDict.notSaved,
                        playersData: playersData || []
                    }
                    this.teamDt.row.add(newData).draw()
                },
                changeFile: function(e){
                    const files = e.target.files
                    const fileLength = e.target.files.length
                    if(files && fileLength) {
                        if(fileLength === 1)  this.tempFile = files[0]
                    }
                },
                closeModal: function(){
                    this.onEditTeamConfig = false
                    this.tempTeamName = null
                    this.tempFile = null
                    document.getElementById('formFile').value= null;
                },
                triggerDocUploadWin: function(){
                    $('#doc-upload').trigger('click'); 
                    document.getElementById('doc-upload').value= null;
                },
                saveTeamsConfig: function(){
                    let self = this;
                    const data = this.teamDt.rows().data().toArray().filter((data) => data.saveStatus == self.saveStatusDict.notSaved )    

                    if(data.length > 0 || this.deletedRows.length > 0){
                        var formData = new FormData();  
                        data.forEach((dat)=>{
                            if(dat.LOGO_PATH){
                                if(dat.logoFile) formData.append(dat.TEAM, dat.logoFile);  
                            }else{
                                formData.append(dat.TEAM, dat.logoFile || ''); 
                            }  
                        })
                        const preparedData = JSON.stringify( data );
                        const deletedData = JSON.stringify( this.deletedRows )
                        formData.append("teams_data", preparedData);
                        formData.append("deleted_teams_data", deletedData);
                        
                        axios({
                            method: 'post',
                            url: '/api/edit_teams/',
                            headers: {"X-CSRFToken": csrfToken, 'Content-Type': 'multipart/form-data'},
                            data: formData
                        }).then(response => {
                            this.toastMessage('success', 'Selesai Dimuat naik', 'Data Pasukan berjaya di muat naik ke pelayan')
                            const newRowData = response.data.data
                            
                            let self = this
                            newRowData.forEach((data)=>{
                                const rowIdx = self.teamDt.rows().data().toArray().findIndex((tbData)=> tbData.SECRET_KEY == data.SECRET_KEY)
                                self.updateRowToTable(rowIdx, data, true)
                            })
                        })
                        .catch(err => {
                            this.toastMessage('error', 'Tidak Berjaya Dimuat Naik', 'Data Pasukan gagal dimuat naik ke pelayan')
                        })
                    }
                },
                updateTableWithDoc: function(e){
                    const files = e.target.files
                    const fileLength = e.target.files.length
                    if(!files && fileLength != 1) return
                    
                    let self = this;
                    var formData = new FormData();
                    formData.append("teams_data", files[0]);
                    axios({
                        method: 'post',
                        url: '/api/extract_data_from_file/',
                        headers: {"X-CSRFToken": csrfToken, 'Content-Type': 'multipart/form-data'},
                        data: formData
                    }).then(response => {
                        this.toastMessage('success', 'Selesai memproses data kumpulan', 'Data Pasukan berjaya di proses untuk dinilai')
                        const newRowData = response.data.data
                        const teamsFromDoc = Object.keys(newRowData)
                        teamsFromDoc.forEach((team)=>{
                            if(!self.teamDt.columns(0).data().toArray()[0].includes(team)){
                                self.tempTeamName = team
                                self.addRowToTable(newRowData[team])
                            }
                        })
                    })
                    .catch(err => {
                        this.toastMessage('error', 'Gagal memproses data kumpulan', 'Data Pasukan berjaya di proses untuk dinilai')
                    })
                },

                toastMessage: function(status, title, message){
                    new Notify ({
                        status: status,
                        title: title,
                        text: message,
                        effect: 'fade',
                        speed: 300,
                        customClass: '',
                        customIcon: '',
                        showIcon: true,
                        showCloseButton: true,
                        autoclose: status == 'success',
                        autotimeout: 3000,
                        gap: 20,
                        distance: 20,
                        type: 1,
                        position: 'right bottom'
                      })
                }
            },
        })
        app.mount("#team-config-main")
    }
}
