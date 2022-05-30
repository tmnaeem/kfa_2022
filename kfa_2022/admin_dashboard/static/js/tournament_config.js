function TournamentConfig(listTournament){ 
    this.listTournamentFromServer = listTournament
    
    this.init = function(csrfToken){
        const { createApp } = Vue
        let server = this
        const app = createApp({
            delimiters: ['[[', ']]'],
            mounted: function() {

                let self = this
                this.rowTournamentData.forEach((data)=>{
                    data.posterStats = data.POSTER_PATH != '' ? self.posterStatsDict.exist : self.posterStatsDict.notExist
                    data.posterFile = null
                    data.saveStatus = self.saveStatusDict.saved
                })
                
                // init table with incoming data
                this.tournamentDt = $('#tournament-config-table').DataTable( {
                    data: this.rowTournamentData,
                    columns: this.tournamentColumns,
                    responsive: true,
                    ordering: false,
                    searching: false,
                    lengthChange: false,
                    select: 'single',
                    columnDefs:[
                        {
                            targets: 3,
                            data: null,
                            render: function render(data, type, row, meta) {
                                let htmlTemp;
                                switch(data){
                                    case self.posterStatsDict.notExist : 
                                        htmlTemp = '<span class="badge bg-warning text-dark">Not Exist</span>'
                                        break
                                    case self.posterStatsDict.exist:
                                        htmlTemp = '<span class="badge bg-success text-dark">Uploaded</span>'
                                        break
                                    case self.posterStatsDict.pending:
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

                this.tournamentDt.on('select', this.onSelectRowTable)
                this.tournamentDt.on('deselect', this.onDeSelectRowTable)

                this.tournamentTimePicker = $('#timeFrame').daterangepicker({
                    autoUpdateInput: false,
                    locale: {
                        cancelLabel: 'Clear'
                    },
                    minDate: moment(),
                    showDropdowns: true,
                });

                this.tournamentTimePicker.on('apply.daterangepicker', this.updateTimeFrame)
            },
            data: function(){
                return {
                    pageLocation: 'tournament',
                    whichTable: {
                        tournament: 0,
                        match: 1
                    },
                    availableTeams: server.listTeamsFromServer || [],

                    // tournament table related
                    tournamentDt: null,
                    tournamentTimePicker: null,
                    tournamentColumns: [
                        { data: 'TOURNAMENT_TITLE', title: 'Kejohanan' },
                        { data: 'START_TIME', title: 'Tarikh Mula' },
                        { data: 'END_TIME', title: 'Tarikh Akhir' },
                        { data: 'posterStats', title: 'Poster' },
                        { data: 'saveStatus', title: 'Status Data' }] ,
                    rowTournamentData: server.listTournamentFromServer || [],
                    tempTournamentName: null,
                    tempFile: null,
                    posterStatsDict: {
                        notExist : 0,
                        exist : 1,
                        pending : 2
                    },
                    saveStatusDict: {
                        notSaved : 0,
                        saved : 1
                    },
                    selectionActive: false,
                    onEditTournamentConfig: false,
                    deletedRows: [],
                    tournamentSelection: null,
                    tempStartDate: null,
                    tempEndDate: null, 
                    selectedTimeFrame: null,
                    errorTitleTournament: false,

                    // match table related
                    matchDt: null,
                    matchColumns: [ { data: 'vs', title: 'Perlawanan' },
                                    { data: 'DATE_TIME', title: 'Tarikh dan Masa' },
                                    { data: 'MATCH_VENUE', title: 'Tempat' }],
                    matchRowData: null,
                    matchSelectionActive: false,
                    deletedMatches: []
                }
            },
            watch: {
                tempTournamentName: function(val){
                    if(this.tournamentDt.columns(0).data().toArray()[0].includes(val)){
                        if(this.onEditTournamentConfig && val == this.tournamentDt.rows( { selected: true } ).data()[0].TOURNAMENT_TITLE ) return 
                        this.errorTitleTournament = true
                    }else{
                        this.errorTitleTournament = false
                    } 
                },
                selectionActive: async function(newVal, oldVal){
                    if(newVal === false) return
                    if(this.tournamentDt.rows( { selected: true } ).data()[0].saveStatus == this.saveStatusDict.notSaved) return
                    if(this.matchDt){
                        this.matchDt.destroy();
                        this.matchDt = null
                        this.matchRowData = null
                    }
                    
                    let self = this;
                    axios({
                        method: 'get',
                        url: '/api/get_match/',
                        headers: {"X-CSRFToken": csrfToken},
                        params: {
                            tournament_pid : self.tournamentDt.rows( { selected: true } ).data()[0].TOURNAMENT_ID
                        }
                    }).then(response => {
                        self.toastMessage('success', 'Berjaya dimuat turun', 'Data Perlawanan berjaya dimuat turun untuk dilihat')
                        self.matchRowData = response.data.data
                        
                        self.matchDt = $('#match-config-table').DataTable( {
                            data: self.matchRowData,
                            columns: self.matchColumns,
                            responsive: true,
                            ordering: false,
                            searching: false,
                            lengthChange: false,
                            select: 'single',
                            columnDefs:[]
                        } );

                        self.matchDt.on('select', self.onSelectMatchRowTable)
                        self.matchDt.on('deselect', self.onDeSelectMatchRowTable)
                    })
                    .catch(err => {
                        console.log(err)
                        self.toastMessage('error', 'Tidak Berjaya Dimuat turun', 'Data Perlawanan gagal dimuat turun untuk dilihat')
                    })
                    
                }
            },
            methods: {
                updateTimeFrame: function(ev, picker){
                    this.tempStartDate = picker.startDate.format('YYYY-MM-DD')
                    this.tempEndDate = picker.endDate.format('YYYY-MM-DD')
                    this.selectedTimeFrame = this.tempStartDate + ' - ' + this.tempEndDate
                },
                onSelectRowTable: function(e, dt, type, indexes){
                    this.selectionActive = indexes[0]
                },
                onDeSelectRowTable: function(){
                    this.selectionActive = false
                },
                onSelectMatchRowTable: function(e, dt, type, indexes){
                    this.matchSelectionActive = indexes[0]
                },
                onDeSelectMatchRowTable: function(){
                    this.matchSelectionActive = false
                },
                navigateToMatchPage: function(newMatch){
                    if(newMatch){
                        window.location.href = "match_report/" + this.tournamentDt.rows( { selected: true } ).data()[0].TOURNAMENT_TITLE + '/new_match';
                    }else{
                        window.location.href = "match_report/" + this.tournamentDt.rows( { selected: true } ).data()[0].TOURNAMENT_TITLE + '/' + this.matchDt.rows( { selected: true } ).data()[0].MATCH_ID;
                    }
                        
                },
                editRowToTable: function(whichTable){
                    const selRowData = this.tournamentDt.rows( { selected: true } ).data()[0]
                    this.tempTournamentName = selRowData.TOURNAMENT_TITLE
                    this.onEditTournamentConfig = true
                    $('#tournament-config-modal').modal('show');
                },
                updateRowToTable: function(rowIdx, data, fromServer){
                    let newData;
                    if(fromServer){
                        newData = {
                            TOURNAMENT_TITLE: data.TOURNAMENT_TITLE,
                            POSTER_PATH: data.POSTER_PATH,
                            PID: data.PID,
                            START_TIME: data.START_TIME,
                            END_TIME: data.END_TIME,
                            TOURNAMENT_ID: data.TOURNAMENT_ID,
                            posterFile: null,
                            posterStats: data.POSTER_PATH ? this.posterStatsDict.exist : this.posterStatsDict.notExist,
                            saveStatus: this.saveStatusDict.saved
                        }
                        this.tournamentDt.row(rowIdx).data(newData).draw();  
                    }else{
                        const selRowData = this.tournamentDt.rows( { selected: true } ).data()[0]
                        this.tempStartDate = selRowData.START_TIME
                        this.tempEndDate = selRowData.END_TIME
                        newData = {
                            TOURNAMENT_TITLE: this.tempTournamentName,
                            POSTER_PATH: selRowData.POSTER_PATH,
                            PID: selRowData.PID,
                            START_TIME: this.tempStartDate,
                            END_TIME: this.tempEndDate,
                            TOURNAMENT_ID: selRowData.TOURNAMENT_ID,
                            posterFile: this.tempFile,
                            posterStats: this.tempFile ? this.posterStatsDict.pending : selRowData.posterStats,
                            saveStatus: this.saveStatusDict.notSaved
                        }
                        this.tournamentDt.row(this.selectionActive).data(newData).draw();  
                    }
                }, 
                deleteRowSelected: function(whichTable){
                    if(whichTable == this.whichTable.tournament){
                        const selRowData = this.tournamentDt.rows( { selected: true } ).data()[0]
                        if(selRowData.saveStatus == this.saveStatusDict.saved) this.deletedRows.push(selRowData.TOURNAMENT_ID)
                        this.tournamentDt.rows( '.selected' ).remove().draw();
                        this.onDeSelectRowTable()
                    }else if(whichTable == this.whichTable.match){
                        const selRowData = this.matchDt.rows( { selected: true } ).data()[0]
                        this.deletedMatches.push(selRowData.MATCH_ID)
                        this.matchDt.rows( '.selected' ).remove().draw();
                        this.onDeSelectMatchRowTable()
                    }
                },
                addRowToTable: function(){
                    const new_uuid = uuidv4()
                    const newTournamentName = this.tempTournamentName
                    const newTournamentPoster = this.tempFile
                    const startDate = this.tempStartDate
                    const endDate = this.tempEndDate
                    const newData = {
                        TOURNAMENT_TITLE: newTournamentName,
                        TOURNAMENT_ID: new_uuid,
                        POSTER_PATH: '',
                        PID: '',
                        START_TIME: startDate,
                        END_TIME: endDate,
                        posterFile: newTournamentPoster,
                        posterStats: this.tempFile ? this.posterStatsDict.pending : this.posterStatsDict.notExist,
                        saveStatus: this.saveStatusDict.notSaved
                    }

                    this.tournamentDt.row.add(newData).draw()
                },
                changeFile: function(e){
                    const files = e.target.files
                    const fileLength = e.target.files.length
                    if(files && fileLength) {
                        if(fileLength === 1)  this.tempFile = files[0]
                    }
                },
                closeModal: function(){
                    this.onEditTournamentConfig = false
                    this.tempTournamentName = null
                    this.tempFile = null
                    this.tempStartDate = null
                    this.tempEndDate = null
                    this.selectedTimeFrame = null
                    document.getElementById('formFile').value= null;
                },
                saveTournamentConfig: function(){
                    let self = this;
                    const data = this.tournamentDt.rows().data().toArray().filter((data) => data.saveStatus == self.saveStatusDict.notSaved )    

                    if(data.length > 0 || this.deletedRows.length > 0){
                        var formData = new FormData();  
                        data.forEach((dat)=>{
                            if(dat.POSTER_PATH){
                                if(dat.posterFile) formData.append(dat.TOURNAMENT_ID, dat.posterFile);  
                            }else{
                                formData.append(dat.TOURNAMENT_ID, dat.posterFile || ''); 
                            }  
                        })
                        const preparedData = JSON.stringify( data );
                        const deletedData = JSON.stringify( this.deletedRows )
                        formData.append("tournaments_data", preparedData);
                        formData.append("deleted_tournaments_data", deletedData);
                        
                        axios({
                            method: 'post',
                            url: '/api/edit_tournaments/',
                            headers: {"X-CSRFToken": csrfToken, 'Content-Type': 'multipart/form-data'},
                            data: formData
                        }).then(response => {
                            this.toastMessage('success', 'Selesai Dimuat naik', 'Data Kejohanan berjaya dikemas kini ke pelayan')
                            const newRowData = response.data.data
                            
                            let self = this
                            newRowData.forEach((data)=>{
                                const rowIdx = self.tournamentDt.rows().data().toArray().findIndex((tbData)=> tbData.TOURNAMENT_ID == data.TOURNAMENT_ID)
                                self.updateRowToTable(rowIdx, data, true)
                            })
                        })
                        .catch(err => {
                            console.log(err)
                            this.toastMessage('error', 'Tidak Berjaya Dikemas kini', 'Data Kejohanan gagal dikemas kini ke pelayan')
                        })
                    }
                },
                saveMatchDeletionConfig: function(){
                    let self = this;
                
                    if(this.deletedMatches.length > 0){
                        axios({
                            method: 'delete',
                            url: '/api/delete_match/',
                            headers: {"X-CSRFToken": csrfToken},
                            data: {
                                deleted_matches: this.deletedMatches
                            }
                        }).then(response => {
                            this.toastMessage('success', 'Berjaya dipadam', 'Data Perlawanan berjaya dipadam dari pelayan')
                        })
                        .catch(err => {
                            this.toastMessage('error', 'Tidak Berjaya dipadam', 'Data Perlawanan gagal dipadam dari pelayan')
                        })
                    }
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
        app.mount("#tournament-config-main")
    }
}
