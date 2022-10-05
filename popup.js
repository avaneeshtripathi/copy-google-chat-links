const handleCopyLinksToggle = (event) => {
    chrome.storage.sync.set({ isCopyEnabled: event.target.checked }, function () {
        console.log('Set the value to enable copy as ', event.target.checked);
    });
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { type: 'toggleSwitch', status: event.target.checked }, function (response) {
            if (!chrome.runtime.lastError) {
                console.log('Message sent to content.');
            } else {
                console.log('Could not send the message to content.');
            }
        });
    });
};

window.addEventListener('load', () => {
    const toggleElement = document.getElementById('enable-copy-toggle');
    chrome.storage.sync.get(['isCopyEnabled'], function({ isCopyEnabled }) {
        toggleElement.checked = isCopyEnabled;
        console.log('Get the value of copy enabled status ' + isCopyEnabled);
    });

    toggleElement.addEventListener('change', handleCopyLinksToggle);
});
