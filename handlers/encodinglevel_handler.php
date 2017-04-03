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
function format_api_url($oclc) {
    global $api_key;
    return "http://www.worldcat.org/webservices/catalog/content/$oclc?wskey=$api_key";
}


/**
 * Retrieves the MARCXML data for a bibliographic resource using curl
 * @param string|int $oclc The OCLC number
 * @return mixed MARCXML string of the bibliographic resource
 */
function get_bib_resource($oclc) {
    $url = format_api_url($oclc);
    // Retrieve MARCXML data for the resource
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30
    ]);
    $marcxml_string = curl_exec($ch);
    curl_close($ch);

    return $marcxml_string;
}


/**
 * TODO: documentation
 * @param string $marcxml_string Results of get_bib_resource()
 */
function check_encoding_level($marcxml_string) {
    // TODO: retrieve the encoding level
}


/* Main script */

// TODO: handle file uploads and return encoded data