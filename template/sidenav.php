 <html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=gb18030">
        <meta name="viewport" content="width=device-width, user-scalable=no">
    </head>
    
    <body>
        <div id="mySidenav" class="sidenav">
            <!-- sidebar-header  -->
            <div class="sidebar-header">
                <div class="user-pic">
                    <img class="img-rounded" src="img/user-unknown.jpg" alt="User picture">
                </div>
                
                <div class="user-info">
                  <div>
                      <span id="user-name" class="user-name"></span>
                  </div>
                  <div>
                      <span id="user-role" class="user-role"></span>
                  </div>
                  <div>
                      <span class="user-status">
                          <i class="icon-circle" style="border-radius: 7px; background: green; color: green;"></i>
                          <span>Online</span>
                      </span>
                  </div>
                </div>
            </div>

            <!-- sidebar-body -->
            <div class="sidebar-body">
                <div class="container-fluid d-flex justify-content-left">
                    <p>General</p>
                </div>

                <div id="AdminContainer"></div>

                <div id="EmployeeContainer"></div>

                <div class="container-fluid d-flex justify-content-left">
                    <p>Otros</p>
                </div>
                
                <div>
                    <a href="javascript:loadConfiguration();"><span class="icon-cog icon-space"></span>Configuración</a>
                </div>
                
                <div>
                    <a href="javascript:loadContacts();"><span class="icon-phone icon-space"></span>Contactos</a>
                </div>

                <div>
                <a href="javascript:loadManuals();"><span class="icon-document icon-space"></span>Manuales</a>
                </div>
            </div>

            <!-- sidebar-footer  -->
            <div class="sidebar-footer">
                <div class="sidebar-footer-submenu">
                    <a id="notificationsIcon">
                        <span class="icon-bell"></span>
                    </a>
                </div>

                <div class="sidebar-footer-submenu">
                    <a href="javascript:Logout();">
                        <span class="icon-log-out"></span>
                        <span> Salir</span>
                    </a>
                </div>
            </div>

        </div>
    </body>

     <!------------------------------ NOTIFICATIONS FORM ---------------------------------------->
    <!-- Modal -->
    <div id="notificationsForm" class="modal fade" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" style="z-index:1400;">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
    
            <div class="modal-content">
                
                <!-- Modal Header -->
                <div class="modal-header">
                    <h4 class="modal-title"><span class="icon-add-user"></span> Notificaciones</h4>
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
            
                <!-- Modal body -->
                <div class="modal-body">
                    <form id="formNotifications" class="form-horizontal" role="form">
                    </form>                    
                </div>
            
                <!-- Modal footer -->
                <div class="modal-footer justify-content-center">
                    <button id="validateNotifications" class="btn btn-primary" data-toggle="modal" onclick="javascript:validateNotifications();"><span class="icon-check"></span> Aceptar</button>
                </div>

                <div>
                    <small>Nota: Al presionar aceptar, estas notificaciones ya no se podrán ver</small>
                </div>
                
            </div>
        </div>
    </div>



    <!-- The unique script in a php´s document, is the logout function -->
    <script>
        function Logout(){  
            sessionStorage.setItem("USERNAME", "");
            sessionStorage.setItem("NAME", "");
            sessionStorage.setItem("LASTNAME", "");
            sessionStorage.setItem("PERMISSIONS", "");

            $.post("backend/logout.php","",function(DATA){

                if(DATA.ERROR === true){
                    ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                
                  }else{
                    ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);
                    location.href = "index.php";
                }
            });
        }
    </script>
 </html>
