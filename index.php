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
        <form class="form-vertical" id="encoding-level-form">
            <ul class="nav nav-tabs">
                <li class="active">
                    <a data-toggle="tab" href="#list-text-pane" id="list-text-tab">
                        Text
                    </a>
                </li>
                <li>
                    <a data-toggle="tab" href="#file-select-pane" id="file-select-tab">
                        Upload File
                    </a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane fade in active" id="list-text-pane">
                    <div class="form-group" id="list-text-group">
                        <label for="list-text-input">
                            Enter each OCLC number separated by a new line:
                        </label>
                        <textarea class="form-control list-text-area" rows="5" required id="list-text-input"
                                  placeholder="Put each OCLC number on its own line"></textarea>
                    </div>
                </div>
                <div class="tab-pane fade" id="file-select-pane">
                    <label for="file-select-input">
                        Select a .txt file with a list of OCLC numbers (each on its own line):
                    </label>
                    <div class="input-group form-group" id="file-select-group">
                        <label class="input-group-btn">
                            <span class="btn btn-default" id="file-select-btn">
                                Choose File
                                <input class="form-control-file" type="file" required disabled
                                       id="file-select-input" name="file-select-input" placeholder=""/>
                            </span>
                        </label>
                        <input class="form-control form-control-file" type="text" readonly
                               id="file-select-text" placeholder="Select a file." >
                    </div>
                </div>
            </div>

            <hr>

            <div class="form-group">
                <label class="control-label">
                    Select which encoding levels to highlight:
                </label>
                <div id="encoding-level-select-div">
                    <div class="checkbox">
                        <label><input type="checkbox" id="encoding-levels-select-all"><b>Select All</b></label>
                    </div>
                    <div class="checkbox">
                        <label><input type="checkbox" class="encoding-level-checkbox"
                                      name="encoding-levels[]" value="0">
                            Full-level
                        </label>
                    </div>
                    <div class="checkbox">
                        <label><input type="checkbox" class="encoding-level-checkbox"
                                      name="encoding-levels[]" value="1">
                            1 - Full-level, material not examined
                        </label>
                    </div>
                    <div class="checkbox">
                        <label><input type="checkbox" class="encoding-level-checkbox"
                                      name="encoding-levels[]" value="2">
                            2 - Less-than-full level, material not examined
                        </label>
                    </div>
                    <div class="checkbox">
                        <label><input type="checkbox" class="encoding-level-checkbox"
                                      name="encoding-levels[]" value="3">
                            3 - Abbreviated level
                        </label>
                    </div>
                    <div class="checkbox">
                        <label><input type="checkbox" class="encoding-level-checkbox"
                                      name="encoding-levels[]" value="4">
                            4 - Core-level
                        </label>
                    </div>
                    <div class="checkbox">
                        <label><input type="checkbox" class="encoding-level-checkbox"
                                      name="encoding-levels[]" value="5">
                            5 - Partial (preliminary) level
                        </label>
                    </div>
                    <div class="checkbox">
                        <label><input type="checkbox" class="encoding-level-checkbox"
                                      name="encoding-levels[]" value="7">
                            7 - Minimal-level
                        </label>
                    </div>
                    <div class="checkbox">
                        <label><input type="checkbox" class="encoding-level-checkbox"
                                      name="encoding-levels[]" value="8">
                            8 - Prepublication level
                        </label>
                    </div>

                </div>
            </div>
            <input class="btn btn-primary" type="submit" disabled
                   id="file-select-submit" name="file-select-submit" value="Submit">
        </form>

    </div>

    <div id="output"></div>

    <?php // Modal to display while loading ?>
    <div class="modal fade" id="loading-dialog" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-body">
                    <div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle id="loader-circle" class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/></svg></div>
                    <div class="text-center" id="loading-dialog-message">
                        Loading...
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>

<footer class="body-padding"></footer>

</body>
</html>