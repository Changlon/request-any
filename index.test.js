import { expect } from "chai"
import md5 from "js-md5"  
import generateReqAny from "./index.js"  

describe("测试 md5",()=>{ 

    const reqAny =  generateReqAny("http://www.baidu.com")   
    
    // it("同一字符串加密结果相同",()=>{
    //     for(let i = 1 ;i<10;++i) {
    //         console.log(md5(i.toString()))
    //     }
    // }) 

    it("test", done =>{ 

     let res =   reqAny({cache:true}) 
     res.then(r=>{console.log(r);})
     .then(()=>reqAny({cache:true}))
     .then(r=>{console.log(r);done()})

    
       
            
    })


})







