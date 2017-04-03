<!DOCTYPE html>
<html lang="en">
<?php
$title = 'Bib Level Checker';
include_once 'templates/header.php';
?>
<body>

<div class="container">

    <div class="header">
        <h1 class="text-center"><?php echo $title ?></h1>
    </div>

    <div class="well">
        <?php // TODO: Add text instructing user to upload a list of OCLC numbers (or a text area?) ?>
        <form class="form-vertical" id="file-select-form">
            <div class="input-group form-group">
                <label class="input-group-btn">
                <span class="btn btn-default" id="file-select-btn">
                    Choose File
                    <input class="form-control-file" type="file" required
                           id="file-select-input" name="file-select-input" placeholder=""/>
                </span>
                </label>
                <input class="form-control form-control-file" type="text" readonly
                       id="file-select-text" placeholder="Select a file." >
            </div>
            <?php // TODO: Allow user to customize what encoding levels they're looking for ?>
            <input class="btn btn-primary" type="submit"
                   id="file-select-submit" name="file-select-submit" value="Process File">
        </form>
    </div>

    <div id="output"></div>

</div>

</body>
</html>