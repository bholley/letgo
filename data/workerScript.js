// Script for the content worker of LetGo

// We can't act until we get some important information from the add-on.
onMessage = function(message) {

  // If this tab is unguarded, we let it go.
  if (message.unguarded)
    return;

  // If we were bounced back by the holding page, the user has waited enough.
  if (getURLParam(window.location.href, "LetGoWaitComplete") === "true") {

    // Post a message to the addon telling it to unguard this tab
    postMessage({});
  }

  // Otherwise, we need to bounce to the holding page
  else {
    window.location.replace(message.holdingPageURL + '?' + 'dst=' +
                            encodeURIComponent(window.location.href));
  }
}
