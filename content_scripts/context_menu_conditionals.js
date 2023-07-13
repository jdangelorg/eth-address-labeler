// the purpose of this file is to check if the thing being clicked on is an a tag or if there is text being selected,
// we check further in the service_worker.js file if it is an ethereum address/more specifically if it's what we're looking for
// that isn't the purpose of this file however

document.addEventListener('mousedown', function(event){
    if (event.button == 2) {
        if(event.target.tagName==='A'){
            chrome.runtime.sendMessage({
                request: 'updateContextMenu',
                text: event.target.href
            });
        } else if (event.target.tagName === 'SPAN' && event.target.parentElement.tagName === 'A') {
            chrome.runtime.sendMessage({
                request: 'updateContextMenu',
                text: event.target.parentElement.href
            });
        }
    }
})

document.addEventListener('selectionchange', ()=> {
    var selection = window.getSelection().toString().trim();
    chrome.runtime.sendMessage({
        request: 'updateContextMenu',
        text: selection
    });
});