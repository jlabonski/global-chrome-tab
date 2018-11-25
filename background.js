
/**
 * Create windows
 *
 * https://developer.chrome.com/extensions/windows#method-create
 */
const createWindowOptions = {
  url: [],
  focused: true,
  type: 'normal',
  state: 'normal',
  setSelfAsOpener: true
}

/**
 * Create incognito windows
 *
 * https://developer.chrome.com/extensions/windows#method-create
 */
const createIncognitoOptions = {
  ...createWindowOptions,
  incognito: true
}

/**
 * Update the chrome window with these options. Mainly for focus.
 *
 * https://developer.chrome.com/extensions/windows#method-update
 */
const refocusOptions = {
  focused: true
}

/**
 * Only get the focused normal browsers, not popups.
 *
 * https://developer.chrome.com/extensions/windows#method-getCurrent
 */
const getWindowOptions = {
  populate: false,
  windowTypes: ['normal']
}

/**
 * Create a tab
 *
 * https://developer.chrome.com/extensions/tabs#method-create
 */
const createTabOptions = {
}

/**
 * Create a new tab on the current window.
 */
const newTab = () => {
  chrome.windows.getCurrent(getWindowOptions, (win) => {
    refocus(win.id, () => {
      chrome.tabs.create(createTabOptions);
    })
  });
}

/**
 * Create a new window
 */
const newWindow = () => {
  chrome.windows.create(createWindowOptions, (win) => {

    // Man, this is annoying. _Some_ times I get old tabs in the newly created
    // window. Attempt an iteration backwards, closing merrily as we go.
    if(win.tabs && win.tabs.length > 1){
      for (const i = win.tabs.length; i > 0; i--){
        chrome.tabs.remove(win.tabs[i].id)
      }
    }
    refocus(win.id)
  });
}

/**
 * Create a new Incognito window.
 *
 * If you use this, you need to check "Allow in incognito" checkbox of the
 * extension to allow focusing.
 */
const newIncognitoWindow = () => {
  chrome.windows.create(createIncognitoOptions, (win) => {
    if(!win){
      // Caused by the "Allow in incognito" not checked. The extension
      // can't manage its own children windows.
      console.info('I cannot access the created window')
      return
    }
    refocus(win.id)
  });
}

/**
 * Refocuses the window by id, then runs an optional function
 *
 * @param {number} id the Chrome window ID
 * @param {function():void} then Function to call when window is focused.
 */
const refocus = (id, then) => {
  chrome.windows.update(id, refocusOptions);
  if(then){
    then()
  }
}

/**
 * Extension command handler. Commands are defined in manifest.json
 *
 * @param {string} command The command to process.
 */
const commandListener = (command) => {
  switch(command){
    case 'new-tab':
      newTab()
      break
    case 'new-window':
      newWindow()
      break
    case 'new-incognito-window':
      newIncognitoWindow()
      break
    default:
      console.error(`Unknown extension command: ${command}`)
      break
  }
}

chrome.commands.onCommand.addListener(commandListener)
