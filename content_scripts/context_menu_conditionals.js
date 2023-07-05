document.addEventListener('mousedown', function(event){
    if (event.button == 2) {
        if(event.target.tagName==='A'){
            console.log(event.target.href)
            chrome.runtime.sendMessage({
                request: 'updateContextMenu',
                text: event.target.href
            });
        } else if (event.target.tagName === 'SPAN' && event.target.parentElement.tagName === 'A') {
            console.log(event.target.parentElement.href)
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