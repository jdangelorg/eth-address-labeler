document.addEventListener('mousedown', function(event){
    if (event.button == 2) {
        if(event.target.tagName==='A'){
            // console.log(`link clicked on: '${event.target.innerText}'`)
            chrome.runtime.sendMessage({
                request: 'updateContextMenu',
                text: event.target.innerText
            });
        }
    }
})

document.addEventListener('selectionchange', ()=> {
    var selection = window.getSelection().toString().trim();
    // console.log(`text selected: '${selection}'`)
    chrome.runtime.sendMessage({
        request: 'updateContextMenu',
        text: selection
    });
});