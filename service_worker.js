chrome.runtime.onInstalled.addListener(()=>{
    chrome.contextMenus.create({
        title: 'Label this ETH Address',
        contexts: ['selection', 'link'],
        id: ethAdressContextMenuId,
        visible:false,
    })
    chrome.storage.local.set({
        ethLabels:{}
    })
})

var ethAdressContextMenuId = 'label-eth-address-context-menu-item'
const ethAddressPattern = /^0x[a-fA-F0-9]{40}$/;
function getEthAddressFromUrl(url) {
    const match = url.match(/0x[a-fA-F0-9]{40}/);
    return match ? match[0] : null;
}

currentSelectedAddress=null
const updateContextMenu=(details)=>{
    details.visible = true
    chrome.contextMenus.update(ethAdressContextMenuId,details)
}

chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
    if(msg.request === 'updateContextMenu'){
        const text=msg.text
        var details = {
            title: 'Label this ETH Address',
            contexts: ['selection', 'link'],
            visible:null
        }
        const ethAddress = getEthAddressFromUrl(text)
        if(ethAddressPattern.test(text)){
            updateContextMenu(details)
            currentSelectedAddress=text
        }else if(ethAddress){ 
            updateContextMenu(details)
            currentSelectedAddress=ethAddress
        }else{
            details.visible = false
            chrome.contextMenus.update(ethAdressContextMenuId,details)
        }
    }
})

chrome.contextMenus.onClicked.addListener(async (info)=>{
    if(info.menuItemId===ethAdressContextMenuId){
        const tabArray = await chrome.tabs.query({currentWindow:true,active:true})
        const tab = tabArray[0]
        chrome.scripting.executeScript(
            {
                files: ["content_scripts/open_add_label_popup.js"],
                target: {tabId : tab.id}
            }, ()=>{
                chrome.tabs.sendMessage(tab.id,{
                    request: 'labelAttempt',
                    address: currentSelectedAddress
                });
            }
        )
    }
})

chrome.commands.onCommand.addListener((command)=>{
    if(command==="toggle labels"){
        console.log(`works: ${command}`)
    }
})


 