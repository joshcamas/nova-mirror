<?php
  $username = $_POST['username'];
  $copypath = "../user/default/options.json";
  $targetpath = "../user/" . $username . "/options.json";

  copy($copypath, $targetpath);
  echo("complete");

 ?>
