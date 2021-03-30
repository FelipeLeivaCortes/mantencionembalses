function initStadistics(){
    $.post("backend/getStadistics.php", "", function(DATA){
        if( DATA.ERROR ){
            CloseSpinner();
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

        }else{
            var periodLicence   = "Desde: " + FormatDate(DATA.startLicense) + " - Hasta: " + FormatDate(DATA.finishLicense);

            document.getElementById("numUsers").value               = DATA.numUsers;
            document.getElementById("numActivities").value          = DATA.numActivities;
            document.getElementById("numPendingActivities").value   = DATA.numPendingActivities;
            document.getElementById("numPendingRecords").value      = DATA.numPendingRecords;
            document.getElementById("periodLicence").value          = periodLicence;
            document.getElementById("remainingDaysLicence").value   = DATA.remainingDaysLicense;

            setTimeout(()=>{
                CloseSpinner();
            
                if( DATA.remainingDaysLicense <= 30 ){
                    ModalReportEvent("Advertencia", "", "Su licencia expirará dentro de " + DATA.remainingDaysLicense + " días");
                }
            }, 500);
            
        }
    });
}