import {defineConfig} from 'tsup' 

export default defineConfig({
    entry:['./index.js'],
    format:['cjs','esm'],
    sourcemap:true,
    clean:true,
    esbuildOptions(options, context) {
        if(options.format == "esm")  {
            options.outExtension ={
                ['.js']:'.module.js'
            }
        }else {
            options.outExtension = {
                ['.js']:'.main.js'
            }
        }
        
    },
 
})