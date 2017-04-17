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
        <?php // TODO: rename to 'encoding-level-form'? ?>
        <form class="form-vertical" id="file-select-form">
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
                            <?php // TODO: phrase more eloquently ?>
                            Type/paste each OCLC number separated by new lines (i.e. press enter after each number):
                        </label>
                        <textarea class="form-control list-text-area" rows="5" required id="list-text-input"
                                  placeholder="Put each OCLC number on its own line"></textarea>
                    </div>
                </div>
                <?php // TODO: rename 'file-select-*' to 'list-file-*'? ?>
                <div class="tab-pane fade" id="file-select-pane">
                    <div class="input-group form-group" id="file-select-group">
                        <?php // TODO: instructions on what the file should be like ?>
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
                </div>
            </div>

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
                   id="file-select-submit" name="file-select-submit" value="Process File">
        </form>

    </div>

    <div id="output"></div>

</div>

</body>
</html>