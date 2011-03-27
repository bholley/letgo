// Helper to get URL parameters. 
function getURLParam(string, name) {
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(string);
  if( results == null )
    return "";
  else
    return results[1];
}

// Append a parameter to a string
function addURLParam(string, param, value) {   
    var rv = string;
    if (rv.indexOf('?') < 0)
        rv += "?";
    rv += "&" + param + "=" + value;
    return rv;
}

// Removes a parameter from a string
function removeURLParam(string, paramName) {

    // If the parameter isn't there, don't modify the string
    if (getURLParam(string, paramName) == "")
        return string;

    // Find the index of the start of the key/pair value
    var firstIndex = indexOf(paramName + "=");
    var lastIndex = indexOf("&", lastIndex);

    var rv = string.substring(0, index);
    if (lastIndex > 0)
        rv += string.substring(lastIndex+1);
    return rv;
}
