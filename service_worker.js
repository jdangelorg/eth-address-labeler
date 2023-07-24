chrome.runtime.onInstalled.addListener(()=>{
    chrome.contextMenus.create({
        title: 'Label this ETH Address',
        contexts: ['selection', 'link'],
        id: ethAdressContextMenuId,
        visible:false,
    })
    chrome.storage.local.set({
        ethLabels:{},
        replaceTextState:true,
        selectedSort:'Newest First'
    })
})

var ethAdressContextMenuId = 'label-eth-address-context-menu-item'
const ethAddressPattern = /^0x[a-fA-F0-9]{40}$/;
function getEthAddressFromUrl(url) {
    const match = url.match(/\/address\/(0x[a-fA-F0-9]{40})/);
    return match ? match[1] : null;
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
        // the context menu (right click option) for adding an eth label is hidden by default, if it passes any of our conditions,
        // then it will become visible and allow for the user to add a label
        // console.log(text)
        // console.log(getEthAddressFromUrl(text))
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
    } else if (msg.request === 'newLabelAdded') {
        chrome.tabs.sendMessage(sender.tab.id,{
            request: 'newLabelAdded'
        });
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
                    address: currentSelectedAddress,
                    tabId: tab.id
                });
            }
        )
    }
})

chrome.commands.onCommand.addListener((command)=>{
    if(command==="toggle labels"){
        chrome.storage.local.get('replaceTextState',(res)=>{
            chrome.storage.local.set({
                replaceTextState:res.replaceTextState?false:true
            },()=>{
                chrome.tabs.reload()
                chrome.runtime.sendMessage({
                    request:'toggleKeyCommandExecuted'
                })
            })
        })
    }
})


 