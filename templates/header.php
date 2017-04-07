<?php
/**
 * Template file for page headers
 */
?>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title><?php echo isset($title) ? $title : 'Bib Level Checker' ?></title>

    <!-- Stylesheet includes Bootstrap.css + Bootswatch theme -->
    <link rel="stylesheet" href="res/css/index.css">

    <!-- jQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <!-- Bootstrap.js -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

    <?php
    // If the current page has a corresponding .js file, include that as well
    $page_basename = basename($_SERVER['SCRIPT_FILENAME'], '.php');
    $script_path = "res/js/$page_basename.js";
    if (file_exists($script_path))
        echo "<script src='$script_path'></script>";
    ?>
</head>

