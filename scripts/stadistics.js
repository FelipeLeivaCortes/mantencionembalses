function initStadistics(){
    var idCompany   = sessionStorage.getItem('ID_COMPANY');
    var Variables   = "idCompany=" + idCompany;

    $.post("backend/getStadistics.php", Variables, function(DATA){
        if( DATA.ERROR ){
            CloseSpinner();
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

        }else{
            document.getElementById("numUsers").value               = DATA.numUsers;
            document.getElementById("numActivities").value          = DATA.numActivities;
            document.getElementById("numPendingActivities").value   = DATA.numPendingActivities;
            document.getElementById("numPendingRecords").value      = DATA.numPendingRecords;

            CloseSpinner();
        }
    });
}