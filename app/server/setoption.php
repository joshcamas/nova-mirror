<?php
  $username = $_POST['username'];
  $data =  $_POST['data'];
  $targetpath = "../user/" . $username . "/options.json";

  file_put_contents($data,$targetpath);
  echo("complete");

 ?>
