/**
 *  @author  Changlon <changlong.a2@gmail.com>
 *  @github  https://github.com/Changlon
 *  @date    2022-04-06 16:09:58
 */

var axios = require("axios")
var qs = require("qs")

var global = globalThis  

function generateReqAny(reqUrl) {    
    let programEnv = ""
    if(global.wx) { programEnv = "mp" }   
    else {programEnv = "other"}   

    async function reqAny(
        route = "/" ,
        data = {},
        type = "get",
        json = false ,
        baseUrl = "" || reqUrl, 
        timeout = 2000,
        headers = {} 
        
    ) { 
        let request 
        type = type.toLowerCase()
        headers = {
            "Content-Type": json? "application/json" :"application/x-www-form-urlencoded",
            ...headers
        }

        if(programEnv === "other") { 
            request = axios.create({ baseURL : baseUrl || reqAny.baseUrl ,timeout,headers})   
            if(type === "get" || type === "delete" || type === "del") {
                type = type === "del" ?  "delete" :type 
                return await request[type](route,{
                    headers,
                    data: json ? JSON.stringify(data) : qs.stringify(data)
                })
            }else if(type === "put" || type === "post") {
                return await request[type](route,json ? JSON.stringify(data) : qs.stringify(data),{
                    headers
                })
            }
        }else if(programEnv === "mp") {
            request = global.wx.request 
            return new Promise((r,j)=>{
                request({
                    url: (baseUrl || reqAny.baseUrl) ? 
                    `${(baseUrl || reqAny.baseUrl)} ${route.indexOf(0) === '/' ? '/': ''} ${route}` : route,
                    data,
                    method:type,
                    header:headers,
                    success(res){r(res.data)},
                    finally(err){j(err)}
                })
            })
        }
    }

    return reqAny
}

module.exports = generateReqAny
