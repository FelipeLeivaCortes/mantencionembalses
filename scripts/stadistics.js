function initStadistics(){
    $.ajax({
        url:            "backend/getStadistics.php",
        type:           "POST",
        data:           "",
        contentType:    false,
        processData:    false,
        error:          (error)=>{console.log(error);},
        success:        (response)=>{
            setTimeout(()=>{
                CloseSpinner();

                if(response.ERROR){    
                    ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
        
                }else{
                    var periodLicence   = "Desde: " + FormatDate(response.startLicense) + " - Hasta: " + FormatDate(response.finishLicense);
        
                    document.getElementById("numUsers").value               = response.numUsers;
                    document.getElementById("numActivities").value          = response.numActivities;
                    document.getElementById("numPendingActivities").value   = response.numPendingActivities;
                    document.getElementById("numPendingRecords").value      = response.numPendingRecords;
                    document.getElementById("periodLicence").value          = periodLicence;
                    document.getElementById("remainingDaysLicence").value   = response.remainingDaysLicense;
        
                    setTimeout(()=>{
                        if( response.remainingDaysLicense <= 30 ){
                            ModalReportEvent("Advertencia", "", "Su licencia expirará dentro de " + response.remainingDaysLicense + " días");
                        }
                    }, delay);
                    
                }
            }, delay);
        }
    });
}