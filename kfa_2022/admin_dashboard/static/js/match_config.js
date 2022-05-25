function MatchConfig(serverData){ 
    this.serverData = serverData

    this.init = function(csrfToken){
        const { createApp } = Vue
        let server = this
        const app = createApp({
            delimiters: ['[[', ']]'],
            mounted: function() {
                // init general table
                let self = this;
                this.generalDt = $('#general-config-table').DataTable( {
                    data: this.generalData,
                    columns: this.generalColumns,
                    responsive: true,
                    ordering: false,
                    searching: false,
                    lengthChange: false,
                    // select: 'single',
                    info: false,
                    paging: false,
                    columnDefs:[
                        {
                            targets: 7,
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
                });
                
                this.matchTimePicker = $('#timeFrame').daterangepicker({
                    autoUpdateInput: false,
                    locale: {
                        cancelLabel: 'Clear'
                    },
                    minDate: moment(),
                    showDropdowns: true,
                    singleDatePicker: true,
                    timePicker: true,
                });

                this.matchTimePicker.on('apply.daterangepicker', this.updateTimeFrame)

                this.generalDt.on('select', this.onSelectRowTable)
                this.generalDt.on('deselect', this.onDeSelectRowTable)

                // init result table
                this.resultDt = $('#result-config-table').DataTable( {
                    data: this.generalData,
                    columns: this.generalColumns,
                    responsive: true,
                    ordering: false,
                    searching: false,
                    lengthChange: false,
                    select: 'single',
                    info: false,
                    paging: false,
                    columnDefs:[]
                } );

                this.resultDt.on('select', this.onSelectRowTable)
                this.resultDt.on('deselect', this.onDeSelectRowTable)

                // init colors table
                this.colorsDt = $('#colors-config-table').DataTable( {
                    data: this.generalData,
                    columns: this.generalColumns,
                    responsive: true,
                    ordering: false,
                    searching: false,
                    lengthChange: false,
                    select: 'single',
                    info: false,
                    paging: false,
                    columnDefs:[]
                } );

                this.colorsDt.on('select', this.onSelectRowTable)
                this.colorsDt.on('deselect', this.onDeSelectRowTable)
            },
            data: function(){
                return {
                    pageLocation: 'match',
                    matchDateTime: null,
                    generalDt: null,
                    generalColumns: [
                        { data: 'MATCH_NUM', title: 'Nombor Perlawanan' },
                        { data: 'DATE_TIME', title: 'Tarikh dan Masa' },
                        { data: 'duration', title: 'Durasi' },
                        { data: 'MATCH_VENUE', title: 'Tempat' },
                        { data: 'weather', title: 'Cuaca' },
                        { data: 'TEMPERATURE', title: 'Suhu' },
                        { data: 'attendance', title: 'Kehadiran' },
                        { data: 'saveStatus', title: 'Status Data' },
                    ],
                    generalData: [{ 
                        MATCH_NUM : server.serverData.MATCH_NUM,
                        DATE_TIME : null,
                        duration : null,
                        MATCH_VENUE: null,
                        weather : null,
                        TEMPERATURE : null,
                        attendance : null,
                        saveStatus: 0
                    }],
                    saveStatusDict: {
                        notSaved : 0,
                        saved : 1
                    },
                    matchTableListDict: {
                        general : 0,
                        result : 1,
                        homeTeam : 2,
                        awayTeam : 3,
                        delegation : 4,
                    },
                    selectedTimeFrame: null,
                    matchNumber: server.serverData.MATCH_NUM,
                    tempDurationMatch: null,
                    tempVenueMatch: null,
                    tempWeatherMatch: null,
                    tempTemperatureMatch: null,
                    tempAttendanceMatch: null,
                }
            },
            watch: {
                generalDt: function(){
                    console.log('sdfds')
                }
            },
            methods: {
                updateTimeFrame: function(ev, picker){
                    this.dateTime = picker.startDate.format('YYYY-MM-DD hh:mm A')
                    this.selectedTimeFrame = this.dateTime
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
                editRowToTable: function(whichTable){
                    const selRowData = this.tournamentDt.rows( { selected: true } ).data()[0]
                    this.tempTournamentName = selRowData.TOURNAMENT_TITLE
                    this.onEditTournamentConfig = true
                    $('#tournament-config-modal').modal('show');
                },
                updateRowToTable: function(whichTable){
                    let newData;
                    newData = {
                            MATCH_NUM : server.serverData.MATCH_NUM,
                            DATE_TIME : this.selectedTimeFrame,
                            duration : this.tempDurationMatch,
                            MATCH_VENUE: this.tempVenueMatch,
                            weather : this.tempWeatherMatch,
                            TEMPERATURE : this.tempTemperatureMatch,
                            attendance : this.tempAttendanceMatch,
                            saveStatus: this.saveStatusDict.notSaved
                        }
                    this.generalDt.row(0).data(newData).draw();   
                }, 
                deleteRowSelected: function(whichTable){
                    const selRowData = this.tournamentDt.rows( { selected: true } ).data()[0]
                    if(selRowData.saveStatus == this.saveStatusDict.saved) this.deletedRows.push(selRowData.TOURNAMENT_ID)
                    this.tournamentDt.rows( '.selected' ).remove().draw();
                    this.onDeSelectRowTable()
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
                    this.selectedTimeFrame = null
                    this.tempDurationMatch = null
                    this.tempVenueMatch = null
                    this.tempWeatherMatch = null
                    this.tempTemperatureMatch = null
                    this.tempAttendanceMatch = null
                },
                saveMatchConfig: function(){
                    let self = this;
                    const data = this.generalDt.rows().data().toArray().filter((data))    

                    console.log(data)
                    // if(data.length > 0 || this.deletedRows.length > 0){
                    //     var formData = new FormData();  
                    //     data.forEach((dat)=>{
                    //         if(dat.POSTER_PATH){
                    //             if(dat.posterFile) formData.append(dat.TOURNAMENT_ID, dat.posterFile);  
                    //         }else{
                    //             formData.append(dat.TOURNAMENT_ID, dat.posterFile || ''); 
                    //         }  
                    //     })
                    //     const preparedData = JSON.stringify( data );
                    //     const deletedData = JSON.stringify( this.deletedRows )
                    //     formData.append("tournaments_data", preparedData);
                    //     formData.append("deleted_tournaments_data", deletedData);
                        
                    //     axios({
                    //         method: 'post',
                    //         url: '/api/edit_tournaments/',
                    //         headers: {"X-CSRFToken": csrfToken, 'Content-Type': 'multipart/form-data'},
                    //         data: formData
                    //     }).then(response => {
                    //         this.toastMessage('success', 'Selesai Dimuat naik', 'Data Kejohanan berjaya dikemas kini ke pelayan')
                    //         const newRowData = response.data.data
                            
                    //         let self = this
                    //         newRowData.forEach((data)=>{
                    //             const rowIdx = self.tournamentDt.rows().data().toArray().findIndex((tbData)=> tbData.TOURNAMENT_ID == data.TOURNAMENT_ID)
                    //             self.updateRowToTable(rowIdx, data, true)
                    //         })
                    //     })
                    //     .catch(err => {
                    //         console.log(err)
                    //         this.toastMessage('error', 'Tidak Berjaya Dikemas kini', 'Data Kejohanan gagal dikemas kini ke pelayan')
                    //     })
                    // }
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
        app.mount("#match-config-main")
    }
}
