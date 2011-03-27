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
  else
    rv += "&";
  rv += param + "=" + value;
  return rv;
}
