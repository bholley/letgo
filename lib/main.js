// Globals
var tabs;
var pageMod;
var widget;
var cpanel;
var ss;

// Initializer
exports.main = function() {

  // Grab some globals
  tabs = require("tabs");
  ss = require("simple-storage");

  // Make sure that the filtereDomains localstorage variable is defined
  if (!ss.storage.filteredDomains)
    ss.storage.filteredDomains = [];

  // Make the configuration panel
  cpanel = require("panel").Panel({
    contentURL: require("self").data.url("config.html"),
    contentScriptFile: require("self").data.url("configWorker.js"),
    contentScriptWhen: "ready",
    onMessage: storeConfig,
    onShow: function() {cpanel.postMessage(ss.storage.filteredDomains);}
    });

  // Make the widget
  widget = require("widget").Widget({
    id: "letgo-widget",
    label: "LetGo",
    contentURL: require("self").data.url("letgo.ico"),
    panel: cpanel,
    width: 40
    });

  // Set the pageMod
  activatePageMod();
};

// Unload handler
exports.onUnload = function(reason) {

  // Destroy the pagemod
  if (pageMod)
    pageMod.destroy();

  // Remove our flag property from any tab that might have it
  for each (var tab in tabs)
    delete tab.LetGo_Unguarded;

  // Destroy the widget
  if (widget)
    widget.destroy();

  // Destroy the configuration panel
  if (cpanel)
    cpanel.destroy();
};

function activatePageMod() {

  // If there are no domains to filter, we don't need to create a PageMod
  if (!ss.storage.filteredDomains)
    return;

  try {
  pageMod = require("page-mod").PageMod({

    // For which URLs is the pagemod deployed?
    include: ss.storage.filteredDomains.map(domainToFilter),

    // We're just using the pageMod machinery, and don't actually need to
    // run a content script.
    contentScript: '',

    // Attach as soon as possible, so that we don't show a little morsel of the
    // page before bouncing.
    contentScriptWhen: 'start',

    // Chrome-side handler invoked after the (dummy) content code is deployed
    onAttach: function(worker) {

      // Get the tab we're working in
      var ourTab = worker.tab;

      // If we were bounced back by the holding page, flag that we're now
      // unguarded.
      if (getURLParam(ourTab.url, "LetGoWaitComplete") === "true") {
        ourTab.LetGo_Unguarded = true;
        ourTab.url = removeURLParam(ourTab.url, "LetGoWaitComplete");
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
      var win = require("window-utils").windowIterator().next();
      var {Cc, Ci} = require("chrome");
      var btoa = win.QueryInterface(Ci.nsIDOMWindowInternal).btoa;
      var redirURL = require("self").data.url("holdingPage.html") + "?" +
                             "dst" + "=" + btoa(ourTab.url);
      ourTab.url = redirURL;
    }
  });
  }
  catch (err) {
    require("notifications").notify({
      title: "LetGo Error",
      text: "LetGo threw an exception. The most likely cause is an invalid filter. " +
            "This shouldn't happen! Please report the issue.",
      data: err.message,
      onClick: function(data) {console.log(data);}
      });
  }
}

// Stores and activates configuration data from the content panel
function storeConfig(data) {

  // Apply to local storage
  require("simple-storage").storage.filteredDomains = data;

  // Reload the pagemod
  if (pageMod)
    pageMod.destroy();
  activatePageMod();
}

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
function removeURLParam(url, paramName) {

  // If the parameter isn't there, don't modify the string
  if (getURLParam(url, paramName) == "")
    return url;

  // Find the index of the start of the key/pair value
  var firstIndex = url.indexOf(paramName + "=");
  var lastIndex = url.indexOf("&", firstIndex);

  // Chop out the pair
  var rv = url.substring(0, firstIndex);
  if (lastIndex > 0)
    rv += url.substring(lastIndex+1);

  // Remove the trailing '?' or '&' if necessary
  rv = removeTrailing(rv, "?");
  rv = removeTrailing(rv, "&");

  return rv;
}

// Convenience method to remove a trailing character if it exists
function removeTrailing(str, ch) {
  if (str.charAt(str.length - 1) == ch)
    return str.substring(0, str.length - 1);
  return str;
}

// Map callback to make a domain into a match-pattern filter
function domainToFilter(domain) {
  return '*.' + domain;
}
