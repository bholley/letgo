// Globals
var tabs;
var pageMod;

// Initializer
exports.main = function() {

  // Grab our tabs
  tabs = require("tabs");

  // Set the pageMod
  pageMod = require("page-mod").PageMod({

    // For which URLs is the pagemod deployed?
    include: require("preferences-service").get("LetGo.filteredSites", "")
                                           .split(';'),

    // We're just using the pageMod machinery, and don't actually need to
    // run a content script.
    contentScript: '',

    // Chrome-side handler invoked after the content code is deployed
    onAttach: function(worker) {

      // Get the tab we're working in
      var ourTab = worker.tab;

      // If we were bounced back by the holding page, flag that we're now
      // unguarded.
      if (getURLParam(ourTab.url, "LetGoWaitComplete") === "true") {
        // TODO - trim param
        ourTab.LetGo_Unguarded = true;
      }

      // If we're unguarded, let the page be displayed.
      if (ourTab.LetGo_Unguarded)
        return;

      // Bounce to the holding page.
      //
      // For some reason setting ourTab.url to a URL containing an
      // encodeURIComponent-encoded parameter throws an exception. The
      // alternative here is base64, but we have to do some magic to tap into
      // the platform's base64 encoding/decoding machinery.
      let win = require("window-utils").windowIterator().next();
      let {Cc, Ci} = require("chrome");
      let btoa = win.QueryInterface(Ci.nsIDOMWindowInternal).btoa;
      var redirURL = require("self").data.url("holdingPage.html") + "?" +
                             "dst" + "=" + btoa(ourTab.url);
      ourTab.url = redirURL;
    }
  });
};

// Unload handler
exports.onUnload = function(reason) {

  // Destroy the pagemod
  pageMod.destroy();

  // Remove our flag property from any tab that might have it
  for each (var tab in tabs)
    delete tab.LetGo_Unguarded;
};

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
