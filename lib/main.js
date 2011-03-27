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
      var redirURL = addURLParam(require("self").data.url("holdingPage.html"),
                                 "dst", encodeURIComponent(ourTab.url));
      console.log("Going to: " + redirURL);
      //ourTab.url = redirURL;
      ourTab.url = require("self").data.url("holdingPage.html");
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
