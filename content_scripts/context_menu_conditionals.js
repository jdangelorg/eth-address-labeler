document.addEventListener('mousedown', function(event){
    if (event.button == 2) {
        if(event.target.tagName==='A'){
            chrome.runtime.sendMessage({
                request: 'updateContextMenu',
                text: event.target.href
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