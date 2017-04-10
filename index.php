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
            <div class="form-group">
                <label class="control-label" for="min-encoding-level-select">Minimum encoding level:</label>
                <select class="form-control" required
                        id="min-encoding-level-select" name="min-encoding-level">
                    <option value=" ">Full-level</option>
                    <option value="1">1 - Full-level, material not examined</option>
                    <option value="2">2 - Less-than-full level, material not examined</option>
                    <option value="3" selected>3 - Abbreviated level</option>
                    <option value="4">4 - Core-level</option>
                    <option value="5">5 - Partial (preliminary) level</option>
                    <option value="7">7 - Minimal-level</option>
                    <option value="8">8 - Prepublication level</option>
                    <?php // TODO: figure out if levels I-J are relevant? ?>
                </select>
            </div>
            <input class="btn btn-primary" type="submit" disabled
                   id="file-select-submit" name="file-select-submit" value="Process File">
        </form>
    </div>

    <div id="output"></div>

</div>

</body>
</html>