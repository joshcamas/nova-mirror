<?php
  $username = $_POST['username'];
  $moduleStr = $_POST['modules'];
  $targetpath = "../user/" . $username . "/modules";
  $copypath = "../modules/";
  $copyFile = "app.json";

  $modules = str_split($moduleStr);


  foreach ($modules as & $value) {
    copy($copypath . $value . "/" . $copyFile, $targetpath . "/" . $value . "/" . $copyFile);
  }

  echo("complete");

 ?>
