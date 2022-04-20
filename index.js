/**
 *  @author  Changlon <changlong.a2@gmail.com>
 *  @github  https://github.com/Changlon
 *  @date    2022-04-06 16:09:58
 */


import axios from "axios" 
import qs from "qs"
import md5 from "js-md5" 

var global = globalThis  

function generateReqAny(option = {
    reqUrl  :  "", 
    beforeRequest  :  (data,headers)=>{}, 
    afterResponse  :  (data,headers)=>{},
    debug:false,
}) {   
    var {reqUrl,beforeRequest ,afterResponse ,debug } = option 
    if(!reqUrl) throw new Error(`request-any param reqUrl is required!`) 
    var programEnv = "" 
    var reqAnyOption = {
        route : "/" ,
        data : {},
        type : "get",
        json : false ,
        baseUrl : reqUrl  , 
        timeout : 2000,
        headers : {} ,
        cache : false,
        expire : ( 1000 * 60 * 60 ) // one hour expire when cache = true 
    }

    var responseHandler = (response,expire = reqAnyOption.expire) =>{
        let resData = response.data 
        let res = { 
            timestamp:new Date().getTime(),
            expire, 
            cache:false
        }
        // axios -> headers, we.request -> header
        let headers  =  response.headers || response.header || {} 
         /* Object */
        if(typeof resData === "object" && resData.length === undefined) { 
            
            resData.headers = headers
            for(let key in  res) {
                resData[key] = res[key]
            }
            res = resData 
         /** Array */   
        } else if(typeof resData === "object" && resData instanceof Array) {
            res.data = resData 
            res.headers = headers
        /** string , number , boolean */ 
        }else if(typeof resData === "string" || typeof resData === "number" || 
                typeof resData === "boolean") { 
            res.data = resData 
            res.headers = headers    
        }else {
            Object.assign(res,response)
        }

        return res 
    } 

    var resMap = new Map()  
  
    if(global.wx) { programEnv = "mp" }   
    else {programEnv = "other"}   
    
    const reqAny = async (
        option = reqAnyOption
    ) => {   

        if(option!==reqAnyOption) {
            let option_ = Object.create(reqAnyOption) 
            for(let key in option) {
                option_[key] = option[key] 
            }
            option = option_ 
        }

        if(!option.baseUrl) throw new Error(`Parameter baseurl is required !`)
        
        let {
            route,
            data ,
            type ,
            json  ,
            baseUrl , 
            timeout ,
            headers  ,
            cache ,
            expire

        } = option


        var  hashKey  = md5(new Date().getTime() + "")  
        
        if(cache) {   
            let currentStr = `baseUrl=${baseUrl || "" }&route=${route}&type=${type}&json=${ json + '' }`   
            Object.keys(data).forEach(key=>{ 
                currentStr = currentStr + `&${key}=${data[key]}` 
            }) 
            
            hashKey = md5(currentStr)  

            if(debug) console.debug(`current request hashKey:`,hashKey) 
            
            if(resMap.has(hashKey)) { 
                const {timestamp,expire} = resMap.get(hashKey) 
                if((timestamp + expire ) >= new Date().getTime()) {
                    let res = resMap.get(hashKey)
                    res.cache = true 
                    return res 
                }
            }
        }
        

        var request  
        var response 

        type = type.toLowerCase()

        headers["Content-Type"] = 
             json ? "application/json" :"application/x-www-form-urlencoded" 

         /** beforeRequest Handler */
        await Promise.resolve(beforeRequest?beforeRequest(data,headers):()=>{})

        if(debug) console.debug(`before-request-headers: `,headers)  
        
        /** node  & web js */
        if(programEnv === "other") { 
            request = axios.create({ baseURL : baseUrl,timeout,headers}) 
            if(type === "get" || type === "delete" || type === "del") {
                type = type === "del" ?  "delete" :type 
                response =  await request[type](route,{
                    headers,
                    data: json ? JSON.stringify(data) : qs.stringify(data)
                })

            }else if(type === "put" || type === "post") {
                response =  await request[type](route,json ? JSON.stringify(data) : qs.stringify(data),{
                    headers
                })
            }

              /** afterResponse Handler */
            await Promise.resolve(afterResponse?afterResponse(response.data,response.headers):()=>{})

            if(response.status === 200) { 
                let result =  responseHandler(response,expire)   
                result.hashKey = hashKey 
                if(cache) resMap.set(hashKey,result) 
                return result 
            }else{
                throw new Error(`request-any Error!  errorcode : ${response.status} errormsg ${response.statusText}`) 
            }
        
        /** weapp */
        }else if(programEnv === "mp") {
            request = global.wx.request 
            if(request) {
                return new Promise((r,j)=>{
                    request({
                        url: baseUrl ? 
                        `${ baseUrl }${route.indexOf(0) === '/' ? '/': ''}${route}` : route,
                        data,
                        method:type,
                        header:headers,
                        success (res){ 

                            if(res.statusCode !== 200) {
                                throw new Error(`request-any Error! errorcode : ${res.statusCode} errormsg ${res.errMsg} `)
                            }

                            let response = res ; 
                            
                            (async()=>{
                                /** afterResponse Handler */
                                await Promise.resolve(afterResponse? afterResponse(response.data,response.header):()=>{})  
                                let res_ =  responseHandler(response,expire)  
                                res_.hashKey = hashKey  
                                if(cache) resMap.set(hashKey,res_)
                                r(res_)  
                            })()
                        },
                        finally(err){j(err)}
                    })
                })
            }
           
        }
    }

    return reqAny

}

export default generateReqAny