<?php
/**
 * Handles Ajax request for minimum encoding level checking.
 */

include_once '../config/api_key.php';
// TODO: Throw exception if $api_key isn't set or is blank


/* Functions */


/**
 * Formats the WorldCat Search API URL
 * @param string|int $oclc The OCLC number
 * @return string Formatted WorldCat Search API URL (includes the API key)
 */
function get_api_url($oclc) {
    global $api_key;
    return "http://www.worldcat.org/webservices/catalog/content/$oclc?wskey=$api_key";
}