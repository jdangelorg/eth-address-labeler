try{
    window.addEventListener("load", (event)=>{
        console.log('page is fully loaded accoring to run_at : document_end in manifest.json')
        //get all the a tags in the document and then get all the a tags that are ethereum addresses
        const allATags = document.querySelectorAll("a");

        aTagsWith0x=[]

        console.log('first a tag script')
        var count=0
        for(tag of allATags){
            if(tag.innerText[0]==='0' && tag.innerText[1]==='x'){
                aTagsWith0x.push(tag.innerText)
                console.log(tag.innerText)
                count+=1
                console.log('count',count)
            }
        }
        console.log('length', aTagsWith0x.length)

        // first check if there are any iframes on this page
        // if there are iframes, get all the <a> tags in every iframe
        // if(Boolean(document.querySelector("iframe"))){
        //     var iframes = document.querySelectorAll('iframe')
        //     console.log(`there are ${iframes.length} iframes on this page!`)
        //     console.log(iframes[0])
        
        //     var aTagsInIframe = []
        //     console.log('iframe script')
        //     aTagsInIframe = iframes[0].contentWindow.document.querySelectorAll('a')
        //     for(tag of aTagsInIframe){
        //         if(tag.innerText[0]==='0' && tag.innerText[1]==='x'){
        //             console.log(tag)
        //         }
        //     }
        // }else{
        //     console.log(`there are no iframes on this page.`)
        // }
    })
}catch(err){
    console.error(err)
    console.log('error haha')
}




