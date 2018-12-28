function executeScript(script, responseCallback, callbackOnNonHttpTab) {

    _executeScript(script, responseCallback, callbackOnNonHttpTab);

    function _executeScript(script, responseCallback, callbackOnNonHttpTab) {
        chrome.tabs.query(getActiveTabQuery(), tabs => {
            let activeTab = tabs[0];
            if (activeTab.url && activeTab.url.startsWith("http")) {
                executeOnTab(activeTab.id, script, responseCallback);
            } else {
                callbackOnNonHttpTab();
            }
        })
    }

    function getMateScript(data) {
        function setVar(key, value) {
            MATE[key.toLowerCase().split(' ').join('_')] = value;
            // do not change to AUTO_MATE_VARS variabe, as this function is executed in isolated environment
            chrome.storage.local.get('auto_mate_vars', function (data) {
                let variables = data['auto_mate_vars'] || {};
                variables = variables.filter(v => v.key !== key);
                variables.push({ "key": key, "value": value });

                chrome.storage.local.set({
                    ['auto_mate_vars']: variables
                }, function () {
                    console.log('set vars:' + JSON.stringify(variables))
                });
            });
        }

        function createTab(url, callback) {
            chrome.runtime.sendMessage({
                to: 'popup',
                type: 'createTab',
                data: url
            });
        }

        function resolve(buttonId, scriptId, message, data) {
            chrome.runtime.sendMessage({
                to: 'popup',
                type: 'resolve',
                message: message,
                scriptId: scriptId,
                buttonId: buttonId,
                data: data
            });
        }

        function reject(buttonId, scriptId, message, data) {
            chrome.runtime.sendMessage({
                to: 'popup',
                type: 'reject',
                message: message,
                scriptId: scriptId,
                buttonId: buttonId,
                data: data
            });
        }

        let mate = {};
        data.buttons.forEach(i => mate[i.buttonName] = i.script);
        data.variables.forEach(i => mate[i.key] = i.value);

        let setMATEScript = `
            var MATE = ${JSON.stringify(mate)};
            MATE.setVar = eval('(' + ${setVar.toString()} + ')');
            MATE.createTab = eval('(' + ${createTab.toString()} + ')');
            MATE.resolve = eval('(' + ${resolve.toString()} + ')');
            MATE.reject = eval('(' + ${reject.toString()} + ')');
        `;
        return setMATEScript;
    }

    function executeOnTab(id, script, responseCallback) {
        app.storage.getData(data => {
            let mateScript = getMateScript(data);
            chrome.tabs.executeScript(id, { code: mateScript, matchAboutBlank: true }, () => {
                chrome.tabs.executeScript(id, { code: script, matchAboutBlank: true }, responseCallback);
            });
        })
    }
}

function getActiveTabQuery(){
    let tabQuery = { currentWindow: true }

    if (!app.executeScriptsOnFirstTab) tabQuery.active = true;
    return tabQuery;
}