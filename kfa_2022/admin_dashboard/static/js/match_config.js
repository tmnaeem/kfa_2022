function MatchConfig(generalData, teamsData, delegatesData, matchId, tournamentTitle){ 
    this.generalData = generalData
    this.teamsData = teamsData
    this.delegatesData = delegatesData
    this.matchId = matchId
    this.tournamentTitle = tournamentTitle

    this.init = function(csrfToken){
        const { createApp } = Vue
        let server = this
        const app = createApp({
            delimiters: ['[[', ']]'],
            mounted: function() {
                // init general table
                
                if(this.matchId != 'new_match'){
                    this.generalData[0].saveStatus = this.saveStatusDict.saved

                    this.teamsData.forEach((team)=>{
                        console.log(team)
                        if(team.IS_AWAY == this.awayStatusDict.away){       
                            this.selectedSecondTeam = team
                        }
                        if(team.IS_AWAY == this.awayStatusDict.home){
                            this.selectedFirstTeam = team
                        }
                    })

                    this.delegatesData.forEach((data) => {
                        data.saveStatus = this.saveStatusDict.saved
                    })
                    console.log(this.delegatesData)
                }

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
                        {className: "dt-center", targets: "_all"},
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
                this.matchPageTablesDict['general-config-table'] = this.generalDt

                this.delegatesDt = $('#delegates-config-table').DataTable( {
                    data: this.delegatesData,
                    columns: this.delegatesColumns,
                    responsive: true,
                    ordering: false,
                    searching: false,
                    lengthChange: false,
                    select: 'single',
                    info: false,
                    paging: false,
                    columnDefs:[
                        {className: "dt-center", targets: "_all"},
                        {
                            targets: -1,
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
                this.matchPageTablesDict['delegates-config-table'] = this.delegatesDt

                this.delegatesDt.on('select', this.onSelectRowTable)
                this.delegatesDt.on('deselect', this.onDeSelectRowTable)        
            },
            data: function(){
                return {
                    pageLocation: 'match',
                    matchId: server.matchId,
                    tournamentTitle: server.tournamentTitle,
                    matchDateTime: null,
                    onEditMatchTableConfig: false,
                    generalDt: null,
                    generalColumns: [
                        { data: 'MATCH_NUM', title: 'Nombor Perlawanan' },
                        { data: 'DATE_TIME', title: 'Tarikh dan Masa' },
                        { data: 'DURATION', title: 'Durasi' },
                        { data: 'MATCH_VENUE', title: 'Tempat' },
                        { data: 'WEATHER', title: 'Cuaca' },
                        { data: 'TEMPERATURE', title: 'Suhu' },
                        { data: 'ATTENDANCE', title: 'Kehadiran' },
                        { data: 'saveStatus', title: 'Status Data' },
                    ],
                    generalData: server.matchId == 'new_match' ? [{ 
                        MATCH_ID : server.matchId,
                        PID : null,
                        TOURNAMENT_ID : server.generalData.TOURNAMENT_ID,
                        MATCH_NUM : server.generalData.MATCH_NUM,
                        DATE_TIME : null,
                        DURATION : null,
                        MATCH_VENUE: null,
                        WEATHER : null,
                        TEMPERATURE : null,
                        ATTENDANCE : null,
                        saveStatus: 0
                    }] : [server.generalData],

                    delegatesDt: null,
                    delegatesColumns: [
                        { data: 'DESIGNATION', title: 'Jawatan' },
                        { data: 'NAME', title: 'Nama' },
                        { data: 'saveStatus', title: 'Status Data' },
                    ],
                    delegatesData: server.matchId == 'new_match' ? [] : server.delegatesData,
                    tempDelegateDesignation: null,
                    tempDelegateName: null,
                    deletedRows: [],

                    saveStatusDict: {
                        notSaved : 0,
                        saved : 1
                    },
                    awayStatusDict:{
                        home: 0,
                        away: 1,
                    },
                    matchTableListDict: {
                        general : 0,
                        result : 1,
                        homeTeam : 2,
                        awayTeam : 3,
                        delegation : 4,
                    },
                    teamDesignation: {
                        official : 0,
                        player : 1,
                    },
                    selectedTimeFrame: null,
                    matchNumber: server.generalData.MATCH_NUM,
                    tempDurationMatch: null,
                    tempVenueMatch: null,
                    tempWeatherMatch: null,
                    tempTemperatureMatch: null,
                    tempAttendanceMatch: null,
                    teamsData: server.teamsData || [],
                    selectedFirstTeam: null,
                    selectedSecondTeam: null,

                    // team variables
                    currentTableSelection: null,
                    teamDt: {},
                    playingEligibleStatus: {
                        notPlaying: 0,
                        playing: 1
                    },
                    firstElevenOrSubs: {
                        firstEleven: 0,
                        subs: 1
                    },
                    shareTeamColumns: [
                        { data: 'POSITION', title: 'Pos' },
                        { data: 'NAME', title: 'Nama' },
                        { data: 'scoreTime', title: 'G' },
                        { data: 'yellowCard', title: 'Y' },
                        { data: 'redCard', title: 'R' },
                        { data: 'subTime', title: 'S' },
                        { data: 'IS_FIRST_ELEVEN', title: 'Utama' },
                        { data: 'IS_SUBSTITUTE', title: 'Simpanan' },
                        { data: 'IS_PLAYING', title: 'Bermain' },
                        { data: 'IS_ELIGIBLE', title: 'Layak' },
                        { data: 'IS_CAPTAIN', title: 'Ketua Pasukan' },
                        { data: 'saveStatus', title: 'Status Data' },
                    ],
                    shareOfficialsColumns:[
                        { data: 'POSITION', title: 'Pos' },
                        { data: 'NAME', title: 'Nama' },
                        { data: 'ATTENDANCE', title: 'Hadir' },
                        { data: 'saveStatus', title: 'Status Data' }
                    ],
                    shareColorsColumns:[
                        { data: 'primary', title: 'Pertama' },
                        { data: 'secondary', title: 'Kedua' },
                        { data: 'tertiary', title: 'Ketiga' },
                        { data: 'saveStatus', title: 'Status Data' }
                    ],

                    firstTeamDt: null,
                    firstTeamData: [],
                    firstOfficialsDt: null,
                    firstOfficialsData: [],
                    firstColorsDt: null,
                    firstColorsData: [],

                    secondTeamDt: null,
                    secondTeamData: [],
                    secondOfficialsDt: null,
                    secondOfficialsData: [],
                    secondColorsDt: null,
                    secondColorsData: [],

                    selectedTimeGoal: null,
                    selectedTimeYellowCard: null,
                    selectedTimeRedCard: null,
                    selectedTimeSwitchPlayer: null,
                    selectedIsFirstEleven: null,
                    selectedIsSubstitute: null,
                    selectedIsPlaying: null,
                    selectedIsEligible: null,
                    selectedIsCaptain: null,

                    tempOfficialAttendance: null,

                    tempFirstColor: null,
                    tempSecondColor: null,
                    tempThirdColor: null,

                    // dict for all tables
                    matchPageTablesDict: {
                        'general-config-table' : null,
                        'home-team-config-table' : null,
                        'home-officials-config-table' : null,
                        'away-team-config-table' : null,
                        'away-officials-config-table' : null,
                        'delegates-config-table' : null,
                        'home-team-colors-config-table' : null
                    },

                    // dict for timepicker
                    matchTimePickerDict: {
                        'timeGoal' : null,
                        'timeYellowCard' : null,
                        'timeRedCard' : null,
                        'timeSwitchPlayer' : null,
                    },

                    // dict for general and colors
                    generalOrColors: {
                        general: 0,
                        colors: 1
                    }
                }
            },
            watch: {
                selectedIsFirstEleven: function(val){
                    this.selectedIsSubstitute = !val
                },
                selectedIsSubstitute: function(val){
                    this.selectedIsFirstEleven = !val
                },
                selectedFirstTeam: function(team, preTeam){
                    // this can be only be triggered when in new match 
                    if(this.firstTeamDt){
                        // destroy player datatable and anything related
                        this.firstTeamDt.destroy();
                        this.firstTeamDt = null
                        this.firstTeamData = null
                        $("#home-team-config-table thead").remove();
                        $("#home-team-config-table tbody").remove();

                        // destroy officials datatable and anything related
                        this.firstOfficialsDt.destroy();
                        this.firstOfficialsDt = null
                        this.firstOfficialsData = null
                        $("#home-officials-config-table thead").remove();
                        $("#home-officials-config-table tbody").remove();

                        // destroy team colors datatable and anything related
                        this.firstColorsDt.destroy();
                        this.firstColorsDt = null
                        this.firstColorsData = null
                        $("#home-team-colors-config-table thead").remove();
                        $("#home-team-colors-config-table tbody").remove();
                    }
                    if(team === null) return
                    if(team === this.selectedSecondTeam) {
                        this.selectedFirstTeam = null
                        return this.toastMessage('warning', 'Pasukan Telah Dipilih', 'Sila pilih pasukan lain')
                    }

                    this.getTeamPlayerList(team.TEAM_ID, this.matchTableListDict.homeTeam)
                },
                selectedSecondTeam: function(team, preTeam){
                    // this can be only be triggered when in new match 
                    if(this.secondTeamDt){
                        // destroy player datatable and anything related
                        this.secondTeamDt.destroy();
                        this.secondTeamDt = null
                        this.secondTeamData = null
                        $("#away-team-config-table thead").remove();
                        $("#away-team-config-table tbody").remove();

                        // destroy officials datatable and anything related
                        this.secondOfficialsDt.destroy();
                        this.secondOfficialsDt = null
                        this.secondOfficialsData = null
                        $("#away-officials-config-table thead").remove();
                        $("#away-officials-config-table tbody").remove();

                        // destroy team colors datatable and anything related
                        this.secondColorsDt.destroy();
                        this.secondColorsDt = null
                        this.secondColorsData = null
                        $("#away-team-colors-config-table thead").remove();
                        $("#away-team-colors-config-table tbody").remove();
                    }
                    if(team === null) return
                    if(team === this.selectedFirstTeam) { 
                        this.selectedSecondTeam = null
                        return this.toastMessage('warning', 'Pasukan Telah Dipilih', 'Sila pilih pasukan lain')
                    }
                    
                    this.getTeamPlayerList(team.TEAM_ID, this.matchTableListDict.awayTeam)
                }
            },
            methods: {
                getTeamPlayerList: function(team_id, whichTeam){
                    // this can be only be triggered when in new match 
                    let self = this;
                    axios({
                                method: 'get',
                                url: '/api/get_team_registered_representative/',
                                headers: {"X-CSRFToken": csrfToken, 'Content-Type': 'multipart/form-data'},
                                params: {
                                    team_id: team_id,
                                    match_id: this.matchId
                                }
                            }).then(response => {
                                self.toastMessage('success', 'Selesai Dimuat naik', 'Data Pegawai dan Pemain berjaya dimuat turun untuk dilihat')
                                const results = response.data.data
                                
                                self.prepareTables(results, whichTeam)
                                
                            })
                            .catch(err => {
                                this.toastMessage('error', 'Tidak Berjaya Dimuat turun', 'Data Pegawai dan Pemain gagal dimuat turun untuk dilihat')
                            })
                },
                prepareTables: function(results, whichTeam){ 
                    let self = this;
                    let players= [];
                    let officials = [];
                    let colors = [];
                    results.team_data.forEach((applicant)=>{
                        applicant.saveStatus = this.matchId == 'new_match' ? this.saveStatusDict.notSaved : this.saveStatusDict.saved
                        switch(applicant.DESIGNATION){
                            case this.teamDesignation.player:
                                if(this.matchId == 'new_match'){
                                    applicant.yellowCard = ''
                                    applicant.redCard = ''
                                    applicant.subTime = ''
                                    applicant.scoreTime = ''
                                    applicant.IS_FIRST_ELEVEN = 0
                                    applicant.IS_SUBSTITUTE = 1
                                    applicant.IS_PLAYING = this.playingEligibleStatus.playing
                                    applicant.IS_ELIGIBLE = this.playingEligibleStatus.notPlaying    
                                    applicant.IS_CAPTAIN = 0
                                }
                                players.push(applicant)
                                break;
                            case this.teamDesignation.official:
                                if(this.matchId == 'new_match'){
                                    applicant.ATTENDANCE = 1
                                }
                                officials.push(applicant)
                                break
                        }
                    })
                    
                    if(this.matchId != 'new_match'){
                        colors = results.colors_data
                        colors['saveStatus'] = this.saveStatusDict.saved
                    }
                    
                    if(whichTeam == this.matchTableListDict.homeTeam){
                        // init first time table
                        this.firstTeamData = players
                        this.firstTeamDt = $('#home-team-config-table').DataTable( {
                            data: this.firstTeamData,
                            columns: this.shareTeamColumns,
                            responsive: true,
                            ordering: false,
                            searching: false,
                            lengthChange: false,
                            select: 'single',
                            info: false,
                            paging: false,
                            columnDefs:[
                                {className: "dt-center", targets: "_all"},
                                {
                                    targets: [6, 7, 8, 9, 10],
                                    data: null,
                                    render: function render(data, type, row, meta) {
                                        let htmlTemp;
                                        switch(data){
                                            case self.playingEligibleStatus.notPlaying : 
                                                htmlTemp = '<i class="fa-solid fa-circle-xmark" style="color: #FF8800;"></i>'
                                                break
                                            case self.playingEligibleStatus.playing:
                                                htmlTemp = '<i class="fa-solid fa-circle-check" style="color: #007E33;"></i>'
                                                break
                                        }
                                        return htmlTemp
                                    },
                                },
                                {
                                    targets: -1,
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

                        this.firstOfficialsData = officials
                        this.firstOfficialsDt = $('#home-officials-config-table').DataTable( {
                            data: this.firstOfficialsData,
                            columns: this.shareOfficialsColumns,
                            responsive: true,
                            ordering: false,
                            searching: false,
                            lengthChange: false,
                            select: 'single',
                            info: false,
                            paging: false,
                            columnDefs:[
                                {className: "dt-center", targets: "_all"},
                                {
                                    targets: -2,
                                    data: null,
                                    render: function render(data, type, row, meta) {
                                        let htmlTemp;
                                        switch(data){
                                            case self.playingEligibleStatus.notPlaying : 
                                                htmlTemp = '<i class="fa-solid fa-circle-xmark" style="color: #FF8800;"></i>'
                                                break
                                            case self.playingEligibleStatus.playing:
                                                htmlTemp = '<i class="fa-solid fa-circle-check" style="color: #007E33;"></i>'
                                                break
                                        }
                                        return htmlTemp
                                    },
                                },
                                {
                                    targets: -1,
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
                        
                        this.firstColorsData = this.matchId == 'new_match' ? [{primary: null, secondary: null, tertiary: null, saveStatus: this.saveStatusDict.notSaved }] : [colors]
                        this.firstColorsDt = $('#home-team-colors-config-table').DataTable( {
                            data: this.firstColorsData,
                            columns: this.shareColorsColumns,
                            responsive: true,
                            ordering: false,
                            searching: false,
                            lengthChange: false,
                            select: 'single',
                            info: false,
                            paging: false,
                            columnDefs:[
                                {className: "dt-center", targets: "_all"},
                                {
                                    targets: -1,
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

                        this.firstTeamDt.on('select', this.onSelectRowTable)
                        this.firstTeamDt.on('deselect', this.onDeSelectRowTable)
                        this.matchPageTablesDict['home-team-config-table'] = this.firstTeamDt

                        this.firstOfficialsDt.on('select', this.onSelectRowTable)
                        this.firstOfficialsDt.on('deselect', this.onDeSelectRowTable)
                        this.matchPageTablesDict['home-officials-config-table'] = this.firstOfficialsDt

                        this.firstColorsDt.on('select', this.onSelectRowTable)
                        this.firstColorsDt.on('deselect', this.onDeSelectRowTable)
                        this.matchPageTablesDict['home-team-colors-config-table'] = this.firstColorsDt
                    }else{
                        // init first time table
                        this.secondTeamData = players
                        this.secondTeamDt = $('#away-team-config-table').DataTable( {
                            data: this.secondTeamData,
                            columns: this.shareTeamColumns,
                            responsive: true,
                            ordering: false,
                            searching: false,
                            lengthChange: false,
                            select: 'single',
                            info: false,
                            paging: false,
                            columnDefs:[
                                {className: "dt-center", targets: "_all"},
                                {
                                    targets: [6, 7, 8, 9, 10],
                                    data: null,
                                    render: function render(data, type, row, meta) {
                                        let htmlTemp;
                                        switch(data){
                                            case self.playingEligibleStatus.notPlaying : 
                                                htmlTemp = '<i class="fa-solid fa-circle-xmark" style="color: #FF8800;"></i>'
                                                break
                                            case self.playingEligibleStatus.playing:
                                                htmlTemp = '<i class="fa-solid fa-circle-check" style="color: #007E33;"></i>'
                                                break
                                        }
                                        return htmlTemp
                                    },
                                },
                                {
                                    targets: -1,
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

                        this.secondOfficialsData = officials
                        this.secondOfficialsDt = $('#away-officials-config-table').DataTable( {
                            data: this.secondOfficialsData,
                            columns: this.shareOfficialsColumns,
                            responsive: true,
                            ordering: false,
                            searching: false,
                            lengthChange: false,
                            select: 'single',
                            info: false,
                            paging: false,
                            columnDefs:[
                                {className: "dt-center", targets: "_all"},
                                {
                                    targets: -2,
                                    data: null,
                                    render: function render(data, type, row, meta) {
                                        let htmlTemp;
                                        switch(data){
                                            case self.playingEligibleStatus.notPlaying : 
                                                htmlTemp = '<i class="fa-solid fa-circle-xmark" style="color: #FF8800;"></i>'
                                                break
                                            case self.playingEligibleStatus.playing:
                                                htmlTemp = '<i class="fa-solid fa-circle-check" style="color: #007E33;"></i>'
                                                break
                                        }
                                        return htmlTemp
                                    },
                                },
                                {
                                    targets: -1,
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
                        
                        this.secondColorsData = this.matchId == 'new_match' ? [{primary: null, secondary: null, tertiary: null, saveStatus: this.saveStatusDict.notSaved }] : [colors]
                        this.secondColorsDt = $('#away-team-colors-config-table').DataTable( {
                            data: this.secondColorsData,
                            columns: this.shareColorsColumns,
                            responsive: true,
                            ordering: false,
                            searching: false,
                            lengthChange: false,
                            select: 'single',
                            info: false,
                            paging: false,
                            columnDefs:[
                                {className: "dt-center", targets: "_all"},
                                {
                                    targets: -1,
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

                        this.secondTeamDt.on('select', this.onSelectRowTable)
                        this.secondTeamDt.on('deselect', this.onDeSelectRowTable)
                        this.matchPageTablesDict['away-team-config-table'] = this.secondTeamDt

                        this.secondOfficialsDt.on('select', this.onSelectRowTable)
                        this.secondOfficialsDt.on('deselect', this.onDeSelectRowTable)
                        this.matchPageTablesDict['away-officials-config-table'] = this.secondOfficialsDt

                        this.secondColorsDt.on('select', this.onSelectRowTable)
                        this.secondColorsDt.on('deselect', this.onDeSelectRowTable)
                        this.matchPageTablesDict['away-team-colors-config-table'] = this.secondColorsDt
                    }
                },
                updateTimeFrame: function(ev, picker){
                    this.dateTime = picker.startDate.format('YYYY-MM-DD hh:mm A')
                    this.selectedTimeFrame = this.dateTime
                },
                clearMinutes: function(ev, picker){
                    $(`#${ev.currentTarget.id}`).val('');
                },
                onSelectRowTable: function(e, dt, type, indexes){
                    this.currentTableSelection = e.currentTarget.id
                    const otherTables = Object.keys(this.matchPageTablesDict)
                    this.selectionActive = indexes[0]
                    
                    // deselect other tables
                    let self = this;
                    otherTables.forEach((table)=>{
                        if(table == self.currentTableSelection) return
                        if(!(self.matchPageTablesDict[table])) return
                        self.matchPageTablesDict[table].rows( '.selected' )
                        .nodes()
                        .to$() 
                        .removeClass( 'selected' );
                    })
                    
                },
                onDeSelectRowTable: function(){
                    this.currentTableSelection = null
                    this.selectionActive = false
                },
                editRowToTable: function(isGeneral){
                    if(isGeneral){
                        const selRowData = this.generalDt.rows(0).data()[0]
                        this.selectedTimeFrame = selRowData.DATE_TIME
                        this.tempDurationMatch = selRowData.DURATION
                        this.tempVenueMatch = selRowData.MATCH_VENUE
                        this.tempWeatherMatch = selRowData.WEATHER
                        this.tempTemperatureMatch = selRowData.TEMPERATURE
                        this.tempAttendanceMatch = selRowData.ATTENDANCE
                        $('#match-general-config-modal').modal('show');
                    }else{
                        this.onEditMatchTableConfig = true
                        const selRowData = this.matchPageTablesDict[this.currentTableSelection].rows( { selected: true } ).data()[0]
                        switch(this.currentTableSelection){
                            case 'home-team-config-table':
                            case 'away-team-config-table':
                                this.selectedTimeGoal = selRowData.scoreTime
                                this.selectedTimeYellowCard = selRowData.yellowCard
                                this.selectedTimeRedCard = selRowData.redCard
                                this.selectedTimeSwitchPlayer = selRowData.subTime
                                this.selectedIsFirstEleven = Boolean(selRowData.IS_FIRST_ELEVEN)
                                this.selectedIsSubstitute = Boolean(selRowData.IS_SUBSTITUTE)
                                this.selectedIsPlaying = Boolean(selRowData.IS_PLAYING)
                                this.selectedIsEligible = Boolean(selRowData.IS_ELIGIBLE)
                                this.selectedIsCaptain = Boolean(selRowData.IS_CAPTAIN)
                                $('#match-other-config-modal').modal('show');
                                break;
                            case 'home-officials-config-table':
                            case 'away-officials-config-table':
                                this.tempOfficialAttendance = Boolean(selRowData.ATTENDANCE)
                                $('#match-other-config-modal').modal('show');
                                break;
                            case 'home-team-colors-config-table':
                            case 'away-team-colors-config-table':
                                this.tempFirstColor = selRowData.primary
                                this.tempSecondColor = selRowData.secondary
                                this.tempThirdColor = selRowData.tertiary
                                $('#match-colors-config-modal').modal('show');
                                break;
                            case 'delegates-config-table':
                                this.tempDelegateDesignation = selRowData.DESIGNATION
                                this.tempDelegateName = selRowData.NAME
                                $('#match-delegates-config-modal').modal('show');
                                break;
                        }
                    }
                },
                updateRowToTable: function(forGeneralTable){
                    let newData = {}
                    if(forGeneralTable){
                        newData.MATCH_ID = server.generalData.MATCH_ID
                        newData.PID = server.generalData.PID
                        newData.MATCH_NUM = server.generalData.MATCH_NUM
                        newData.TOURNAMENT_ID = server.generalData.TOURNAMENT_ID,
                        newData.DATE_TIME = this.selectedTimeFrame,
                        newData.DURATION = this.tempDurationMatch,
                        newData.MATCH_VENUE = this.tempVenueMatch,
                        newData.WEATHER = this.tempWeatherMatch,
                        newData.TEMPERATURE = this.tempTemperatureMatch,
                        newData.ATTENDANCE = this.tempAttendanceMatch,
                        newData.saveStatus = this.saveStatusDict.notSaved
                            
                        this.generalDt.row(0).data(newData).draw();  
                        this.closeModal()
                        $('#match-general-config-modal').modal('hide');
                    }else{
                        let whichModal;
                        const selRowData = this.matchPageTablesDict[this.currentTableSelection].rows( { selected: true } ).data()[0]
                        switch(this.currentTableSelection){
                            case 'home-team-config-table':
                            case 'away-team-config-table':    
                                newData.TEAM_ID = selRowData.TEAM_ID            
                                newData.POSITION = selRowData.POSITION
                                newData.NAME = selRowData.NAME
                                newData.IDENTITY_NUM = selRowData.IDENTITY_NUM
                                newData.scoreTime = this.selectedTimeGoal
                                newData.yellowCard = this.selectedTimeYellowCard
                                newData.redCard = this.selectedTimeRedCard
                                newData.subTime = this.selectedTimeSwitchPlayer
                                newData.IS_FIRST_ELEVEN = Number(this.selectedIsFirstEleven)
                                newData.IS_SUBSTITUTE = Number(this.selectedIsSubstitute)
                                newData.IS_PLAYING = Number(this.selectedIsPlaying)
                                newData.IS_ELIGIBLE = Number(this.selectedIsEligible)
                                newData.IS_CAPTAIN = Number(this.selectedIsCaptain)
                                newData.saveStatus = this.saveStatusDict.notSaved    
                                
                                whichModal = 'match-other-config-modal'
                                break;
                            case 'home-officials-config-table':
                            case 'away-officials-config-table':
                                newData.TEAM_ID = selRowData.TEAM_ID                             
                                newData.POSITION = selRowData.POSITION
                                newData.IDENTITY_NUM = selRowData.IDENTITY_NUM
                                newData.NAME = selRowData.NAME
                                newData.ATTENDANCE = Number(this.tempOfficialAttendance)
                                newData.saveStatus = this.saveStatusDict.notSaved   

                                whichModal = 'match-other-config-modal'
                                break;
                            case 'home-team-colors-config-table':
                            case 'away-team-colors-config-table':
                                newData.primary = this.tempFirstColor
                                newData.secondary = this.tempSecondColor
                                newData.tertiary = this.tempThirdColor
                                newData.saveStatus = this.saveStatusDict.notSaved   

                                whichModal = 'match-colors-config-modal'
                                break;
                            case 'delegates-config-table':
                                newData.PID = selRowData.PID
                                newData.DESIGNATION = this.tempDelegateDesignation
                                newData.NAME = this.tempDelegateName
                                newData.saveStatus = this.saveStatusDict.notSaved

                                whichModal = 'match-delegates-config-modal'
                                break;
                        }

                        this.matchPageTablesDict[this.currentTableSelection].row(this.selectionActive).data(newData).draw()
                        this.closeModal()
                        $(`#${whichModal}`).modal('hide');
                    }
                    
                }, 
                deleteRowSelected: function(whichTable){
                    const selRowData = this.delegatesDt.rows( { selected: true } ).data()[0]
                    if(selRowData.saveStatus == this.saveStatusDict.saved) this.deletedRows.push(selRowData.PID)
                    this.delegatesDt.rows( '.selected' ).remove().draw();
                    this.onDeSelectRowTable()
                },
                openAddTable: function(){
                    if(this.currentTableSelection){
                        this.matchPageTablesDict[this.currentTableSelection].rows( '.selected' )
                        .nodes()
                        .to$() 
                        .removeClass( 'selected' );
                    }
                    $('#match-delegates-config-modal').modal('show');
                    this.onDeSelectRowTable()
                },
                addRowToTable: function(){
                    const tempDelegateDesignation = this.tempDelegateDesignation
                    const tempDelegateName = this.tempDelegateName
                    
                    const newData = {
                        PID: '',
                        DESIGNATION: tempDelegateDesignation,
                        NAME: tempDelegateName,
                        saveStatus: this.saveStatusDict.notSaved
                    }

                    this.delegatesDt.row.add(newData).draw()
                },
                closeModal: function(){
                    this.onEditMatchTableConfig = false
                    this.tempDelegateDesignation = null
                    this.tempDelegateName = null
                    this.selectedTimeFrame = null
                    this.tempDurationMatch = null
                    this.tempVenueMatch = null
                    this.tempWeatherMatch = null
                    this.tempTemperatureMatch = null
                    this.tempAttendanceMatch = null
                    this.selectedTimeGoal = null
                    this.selectedTimeYellowCard = null
                    this.selectedTimeRedCard = null
                    this.selectedTimeSwitchPlayer = null
                    this.selectedIsFirstEleven = null
                    this.selectedIsSubstitute = null
                    this.selectedIsPlaying = null
                    this.selectedIsEligible = null
                    this.tempOfficialPosition = null
                    this.tempOfficialName = null
                    this.tempOfficialAttendance = null
                    this.tempFirstColor = null
                    this.tempSecondColor = null
                    this.tempThirdColor = null
                    this.selectedIsCaptain = null
                },
                saveMatchConfig: function(){
                    let self = this;
                    const generalData = this.generalDt.rows().data().toArray().filter((data) => data.saveStatus == self.saveStatusDict.notSaved )
                    const firstTeamData = this.firstTeamDt ? this.firstTeamDt.rows().data().toArray().filter((data) => data.saveStatus == self.saveStatusDict.notSaved ) : []
                    const firstOfficialsData = this.firstOfficialsDt ? this.firstOfficialsDt.rows().data().toArray().filter((data) => data.saveStatus == self.saveStatusDict.notSaved ) : []
                    const firstColorsData = this.firstColorsDt ? this.firstColorsDt.rows().data().toArray().filter((data) => data.saveStatus == self.saveStatusDict.notSaved ) : []
                    const secondTeamData = this.secondTeamDt ? this.secondTeamDt.rows().data().toArray().filter((data) => data.saveStatus == self.saveStatusDict.notSaved ) : []
                    const secondOfficialsData = this.secondOfficialsDt ? this.secondOfficialsDt.rows().data().toArray().filter((data) => data.saveStatus == self.saveStatusDict.notSaved ) : []
                    const secondColorsData = this.secondColorsDt ? this.secondColorsDt.rows().data().toArray().filter((data) => data.saveStatus == self.saveStatusDict.notSaved ) : []
                    const delegatesData = this.delegatesDt ? this.delegatesDt.rows().data().toArray().filter((data) => data.saveStatus == self.saveStatusDict.notSaved ) : []   
                    const deletedDelegatesData = this.deletedRows
                   
                    axios({
                        method: 'post',
                        url: '/api/edit_match/',
                        headers: {"X-CSRFToken": csrfToken},
                        data: {
                            match_status: this.matchId,
                            general_data: generalData,
                            home_team_data: firstTeamData,
                            home_officials_data: firstOfficialsData,
                            home_team_colors_data: firstColorsData,
                            away_team_data: secondTeamData,
                            away_officials_data: secondOfficialsData,
                            away_team_colors_data: secondColorsData,
                            delegates_data: delegatesData,
                            deleted_delegates_data : deletedDelegatesData
                        }
                    }).then(response => {
                        this.toastMessage('success', 'Selesai Dimuat naik', 'Data Kejohanan berjaya dikemas kini ke pelayan')
                        const newRowData = response.data.data
                        window.location.href = "/tournament_config/match_report/" + this.tournamentTitle + '/' + newRowData;
                    })
                    .catch(err => {
                        this.toastMessage('error', 'Tidak Berjaya Dikemas kini', 'Data Kejohanan gagal dikemas kini ke pelayan')
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
        app.mount("#match-config-main")
    }
}
