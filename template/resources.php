<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, user-scalable=no">
        
        <title>Mantención Estación Puclaro</title>
        
        <link rel="stylesheet" href="template/bootstrap/bootstrap.min.css">     <!-- Bootstrap´s css -->
        <link rel="stylesheet" type="text/css" href="template/estilos.css">     <!-- Personal´s css -->
        <link rel="stylesheet" href="template/iconmoon/style.css">              <!-- Iconmoon´s css -->
        <link rel="stylesheet" href="template/sidenav.css">                     <!-- Sidenav´s css -->

        <script src="scripts/chart.js.min.js"></script>
        <script src="scripts/jquery.min.js"></script>
        <script src="scripts/jspdf.min.js"></script>
        <script src="scripts/jspdf.plugin.autotable.min.js"></script>
        <script src="scripts/xlsx.full.min.js"></script>
        <script src="scripts/bootstrap.min.js"></script>

    </head>
    
    <body>
        <!-- Modal Report Event -->
        <div id="ModalReportEvent" class="modal fade" role="dialog" aria-labelledby="myLargeModalLabel" style="z-index:1400;">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
        
            <!-- Modal content-->
                <div class="modal-content">
                    
                    <!-- Modal Header -->
                    <div class="modal-header">
                        <h4 class="modal-title"><span class="icon-info"></span> Reporte de evento</h4>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>
              
                    <!-- Modal body -->
                    <div id="bodyModalReportEvent" class="modal-body">
                        <div class="d-flex flex-column">
                            <div class="row">
                                <div class="col-3"><p>Razón:</p></div>
                                <div class="col-9"><p id="EventReason"></p></div>
                            </div>

                            <div class="row">
                                <div class="col-3"><p>Número: </p></div>
                                <div class="col-9"><p id="EventNumber"></p></div>
                            </div>

                            <div class="row">
                                <div class="col-3"><p>Mensaje: </p></div>
                                <div class="col-9"><p id="EventMessage"></p></div>
                            </div>
                        </div>    
                    </div>
              
                    <!-- Modal footer -->
                    <div id="footerModalReportEvent" class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-danger" data-toggle="modal" data-dismiss="modal"><span class="icon-circle-with-cross"></span> Cerrar</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Report Event -->
        <div id="ModalNewFeatures" class="modal fade" role="dialog" aria-labelledby="myLargeModalLabel" style="z-index:1400;">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
        
                <!-- Modal content-->
                <div class="modal-content">
                    
                    <!-- Modal Header -->
                    <div class="modal-header">
                        <h4 class="modal-title"><span class="icon-info" id="versionSystem"></span></h4>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>
              
                    <!-- Modal body -->
                    <div id="bodyModalReportEvent" class="modal-body">
                        <div class="d-flex flex-column">
                            <div class="row">
                                <div class="col-12"><p id="newFeatureHeader"></p></div>
                            </div>
                            <div class="row">
                                <div class="col-1"></div>
                                <div class="col-11"><p id="newFeatureBody"></p></div>
                            </div>
                        </div>
                        <div>
                            <br>
                            <small>*Nota: Este mensaje desaparecerá automáticamente luego de 3 días, a contar desde la fecha de implementación.</small>
                        </div>  
                    </div>
              
                    <!-- Modal footer -->
                    <div id="footerModalReportEvent" class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-danger" data-toggle="modal" data-dismiss="modal"><span class="icon-circle-with-cross"></span> Cerrar</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Loading -->
        <div class="modal fade" id="modalSpinner" style="z-index:1400;" role="dialog" aria-labelledby="modalSpinnerLabel">
            <div class="modal-dialog modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-body text-center">
                        <div class="loader">
                        </div>
                        
                        <div class="loader-txt">
                            <p>Cargando, Por favor espere</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            function ModalReportEvent(EventReason, EventNumber, EventMessage){
                document.getElementById("EventReason").innerHTML = EventReason;
                document.getElementById("EventNumber").innerHTML = EventNumber;
                document.getElementById("EventMessage").innerHTML = EventMessage;

                $('#ModalReportEvent').modal('show');
            }
        </script>

    </body>
</html>
