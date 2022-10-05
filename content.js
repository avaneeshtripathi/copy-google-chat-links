let enableCopyStatus = false;

chrome.runtime.onMessage.addListener(
    function(request) {
        if( request.type === "toggleSwitch" ) {
            enableCopyStatus = request.status ?? false;
        }
    }
);

async function copyToClipboard(textToCopy){
    try {
        const element = document.createElement('textarea');
        element.value = textToCopy;
        element.setAttribute('readonly', '');
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        document.body.appendChild(element);
        element.select();
        document.execCommand('copy');
        document.body.removeChild(element);
    } catch(e) {
        console.error('Failed to copy to clipboard.', e);
    }
};

document.addEventListener('click', async function ({ target: childElement }) {
    chrome.storage.sync.get(['isCopyEnabled'], function({ isCopyEnabled }) {
        enableCopyStatus = isCopyEnabled;
    });

    if (!enableCopyStatus) return;

    try {
        if (childElement.nodeName === 'DIV' && childElement.getAttribute('jsname') === 'bgckF') {

            const ancestorNode = childElement.closest('div[jsname="Ne3sFf"]');
            const jsData = ancestorNode.getAttribute('jsdata');
    
            const [, part2, part3] = jsData.split(',')
            let [space] = part3.split(';');
            if (space.startsWith('space')) {
                space = space.replace('space', 'room');
            }
            const finalLink = ["https://chat.google.com", space, part2].join('/');
            copyToClipboard(finalLink);

            const successMessage = document.createTextNode('Link copied to clipboard!');

            const successEm = document.createElement('div');
            successEm.classList.add('successNotification');
            successEm.appendChild(successMessage);

            const bodyElement = document.querySelector('body');
            bodyElement.appendChild(successEm);
            const timeout = setTimeout(() => {
                bodyElement.removeChild(successEm);
                clearTimeout(timeout);
            }, 1500);
        }
    } catch (e) {
        console.error('Failed to generate the link for selected message.', e);
    }
}, false);