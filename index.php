
<html>
  <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, user-scalable=no">
	
	<?php
	  session_start();
	  include 'template/resources.php';
	?>
        
        <script src="scripts/login.js"></script>
        <script src="scripts/common.js"></script>
  </head>
  
  <body>
 	<div class="container h-100">
		<div class="d-flex justify-content-center h-100">
			<div class="user_card">
				<div class="d-flex justify-content-center">
					<div class="brand_logo_container">
						<img src="img/img_login.png" class="brand_logo" alt="Logo">
					</div>
				</div>

				<div class="d-flex justify-content-center form_container">
					<form>
						<div class="input-group mb-3">
							<input id="uname" type="text" placeholder="Rut" name="uname">
						</div>
						<div class="input-group mb-1">
					    	<input id="psw" type="password" placeholder="Clave" name="psw">
						</div>
					</form>
				</div>

				<div class="d-flex justify-content-center">
					<button class="btn login_btn" onclick="Validate()">Ingresar<button>
				</div>

				<div class="d-flex justify-content-center links">
				    <span class="psw"><a href="#recoveryPass" data-toggle="modal" data-target="#recoveryPass">Olvidé mi contraseña</a></span>
				</div>
			
			</div>
		</div>
	</div>
	
    <!-- Modal -->
    <div id="recoveryPass" class="modal fade" role="dialog" style="z-index:1100;">
        <div class="modal-dialog">
    
        <!-- Modal content-->
            <div class="modal-content">
                
                <!-- Modal Header -->
                <div class="modal-header">
                    <h4 class="modal-title"><span class="icon-key"></span> Recuperar Contraseña</h4>
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
            
                <!-- Modal body -->
                <div class="modal-body">
                    <div class="form-group">
                        <span>Para recuperar tu contraseña ingresa tu rut</span>
                    </div>

                    <div class="form-group">
                        <input id="recoveryUname" type="text" class="form-control" placeholder="Rut">
                    </div>
                </div>
            
                <!-- Modal footer -->
                <div class="modal-footer justify-content-center">
                    <button type="button" class="btn btn-success" onclick="RecoveryPass()"><span class="icon-history"></span> Recuperar</button>
                    <button type="button" class="btn btn-danger" data-dismiss="modal"><span class="icon-circle-with-cross"></span> Cancelar</button>
                </div>
                
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div id="renovateLicenceModal" class="modal fade" role="dialog" style="z-index:1100;">
        <div class="modal-dialog">
    
        <!-- Modal content-->
            <div class="modal-content">
                
                <!-- Modal Header -->
                <div class="modal-header">
                    <h4 class="modal-title"><span class="icon-key"></span> Renovar Licencia</h4>
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
            
                <!-- Modal body -->
                <div class="modal-body">
                    <div class="form-group">
                        <span>Para renovar su licencia, revise su correo y pegue el codigo en cuadro de abajo</span>
                    </div>

                    <div class="form-group">
                        <textarea id="hash" type="text" class="form-control" placeholder="Serial"></textarea>
                    </div>
                </div>
            
                <!-- Modal footer -->
                <div class="modal-footer justify-content-center">
                    <button type="button" class="btn btn-success" onclick="ValidateLicence()"><span class="icon-history"></span> Validar</button>
                    <button type="button" class="btn btn-danger" data-dismiss="modal"><span class="icon-circle-with-cross"></span> Cancelar</button>
                </div>
                
            </div>
        </div>
    </div>

    <footer>
        <?php
            include "template/footer.php";
        ?>
    </footer>

    </body>

    <style type="text/css">
        body {
            /*background: linear-gradient(to bottom, #005bbf 20%, black); */
            font-family: Arial, Helvetica, sans-serif;
            background-image: url(img/index2.jpg);
            background-size: cover; 
           
            background-attachment: fixed;
        }

        .footer-content {
            color: white;
        }

/*        @media (max-width: 768px) { */ 
           body {
                background-image: url(img/index.jpg);
                background-size: cover;
                background-attachment: fixed;   
            }
            
            .user_card {
                background-color: #f39c12;
            }

            icon_user{
                font-size:10px;    
            }
     /*   } */
		
		.brand_logo_container {
			position: absolute;
			height: 170px;
			width: 170px;
			top:-75px;
			border-radius: 50%;
			text-align: center;
		}
		
		.brand_logo {
			height: 150px;
			width: 150px;
			border-radius: 50%;
			border: 2px solid white;
		}
		
		.form_container {
			margin-top: 100px;
		}

        input[type=text], input[type=password] {
            width: 100%;
            padding: 12px 20px;
            display: inline-block;
            border: 1px solid #ccc;
            box-sizing: border-box;
            -moz-border-radius: 37px 37px 37px 37px;
            -webkit-border-radius: 37px 37px 37px 37px;
        }
                
        button{
            display:none;
        }   
        
        a{
            color:white;
        }

        span.psw {
           
            float: right;
            padding-top: 16px;
            font-size:20px;
            color:white;
           
        }

        .user_card {
            margin-top:150px;
            opacity:.9;
        }
    </style>
</html>
