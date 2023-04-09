import { expect } from "chai"
import md5 from "js-md5"
import generateReqAny from "./index.js"  

describe("request-any",()=>{  

    it("throw Error when generateReqAny called without  param {reqUrl:string} ",()=>{ 
        expect(()=>{generateReqAny()}).to.throw("request-any param reqUrl is required!")
    })
   
    it("when res data String format",done=>{ 
        // request a web page  
        const reqAny = generateReqAny({reqUrl:"http://www.baidu.com"}) 
        
        async function t0 () { 
            const res = await reqAny().catch(err=>{console.log(err);done()}) 
            expect(res).to.have.property("data")
            expect(res).to.have.property("timestamp")
            expect(res).to.have.property("cache")
            expect(res).to.have.property("expire")
            let type = typeof res.data
            expect(type).to.eq("string")
            done()
        }

        t0()

    })


    it("when res data Json Object format",done=>{ 
          
        // request api interface   
          const reqAny = generateReqAny({reqUrl:"http://cdn.apc.360.cn/index.php?c=WallPaper&a=getAllCategoriesV2&from=360chrome"}) 
        
          async function t1 () { 
              const res = await reqAny().catch(err=>{console.log(err);done()}) 
              expect(res).to.have.property("data")
              expect(res).to.have.property("timestamp")
              expect(res).to.have.property("cache")
              expect(res).to.have.property("expire")
              let type = typeof res.data
              expect(type).to.eq("object")
              done()
          }
  
          t1()


    })


    it("should cache data when the request format parameters remain unchanged",done=>{ 
        // request api interface   
        const reqAny = generateReqAny({reqUrl:"http://cdn.apc.360.cn/index.php?c=WallPaper&a=getAllCategoriesV2&from=360chrome"}) 

        async function t2 () {  
            let sleep = async ()=> await  new Promise(r=>{setTimeout(()=>{r()},3000)})
            let  api  = async ()=> await reqAny({cache:true,expire:1000}).catch(err=>{console.log(err);done()})   
            let res_1 =  await api()   
            expect(res_1.cache).to.be.false   
            let res_2 =  await api()  
            expect(res_2.cache).to.be.true 
            await sleep()
            let res_3 =  await api()  
            expect(res_3.cache).to.be.false 
            let res_4 = await api()
            expect(res_4.cache).to.be.true
            done()
        }

        t2()

    })


    it("can do something with data & headers before / after request send / back",done=>{ 
        const sign = md5(new Date().getTime()+ "") 
        const reqAny = generateReqAny({
            reqUrl:"http://cdn.apc.360.cn/index.php?c=WallPaper&a=getAllCategoriesV2&from=360chrome" , 
            beforeRequest:(data,headers)=>{
                headers["Sign"] = sign
            },
            afterResponse:(data,headers) =>{ 
                data.sign = sign 
            },
            debug:true
        })  

        async function t3 () {  
            let api  = async ()=> await reqAny({cache:true,expire:1000}).catch(err=>{console.log(err);done()})   
            let res_1 = await api() 
            expect(res_1).to.haveOwnProperty("sign")
            done()
        }

        t3()

    })


    it("if set timeout at generate Request Function,it will be default",done=>{ 
        const reqAny = generateReqAny({
            reqUrl:"http://cdn.apc.360.cn/index.php?c=WallPaper&a=getAllCategoriesV2&from=360chrome" , 
            debug:true,
            timeout:5000
        })  

        reqAny().then(()=>{
            done()
        })

    })


    it("transform data from response with big int",done=> {
        //ADD YOUR TEST CODE

    })
    
})

