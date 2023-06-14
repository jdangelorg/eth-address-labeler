try{
    window.addEventListener("load", (event)=>{
        console.log('page is fully loaded accoring to run_at : document_end in manifest.json')
        //get all the a tags in the document (including iframes) and then get all the a tags that are ethereum addresses
        const allATags = document.querySelectorAll("a");

        aTagsWith0x=[]

        for(tag of allATags){
            if(tag.innerText[0]==='0' && tag.innerText[1]==='x'){
                aTagsWith0x.push(tag)
            }
        }
        if(aTagsWith0x.length!==0){
            console.log('length', aTagsWith0x.length)
            console.log('first a tag with 0x', aTagsWith0x[0])
            // aTagsWith0x[0].innerText = 'hello world!'
        }
    })
}catch(err){
    console.error(err)
    console.log('error haha')
}



