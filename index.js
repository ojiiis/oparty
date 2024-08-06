exports.oParty = (req)=>{
    req.files = {};
    req.body = {};
    const qs = require("querystring")
 
    const actualUrl = req.url.split("?")[0]
    const queryString = req.url.split("?")[1]

    req.query = qs.parse(queryString)
    req.url = actualUrl
    if(req.method == "POST"){
    var err = false,totalFile = -1;
    let bufferData = Buffer.alloc(0);
    req.on("data",(ch)=>{
    bufferData =   Buffer.concat([bufferData,ch]);
    });
   req.on("end",()=>{
    const rct = req.headers['content-type'];
    if(rct.toString().match(/multipart\/form-data/i)){
      const entries = {}
      const files = {}
        const boundry = "--"+req.headers['content-type'].split("=")[1];
       let start = bufferData.indexOf(Buffer.from(boundry))+Buffer.from(boundry).length;
       let end = bufferData.indexOf(Buffer.from(boundry),start);
       while(end !== -1){
       const bufferParts = bufferData.slice(start,end);
        let headerEnd = bufferParts.indexOf(Buffer.from("\r\n\r\n"));
        const header = bufferParts.slice(0,headerEnd);
        const body = bufferParts.slice(headerEnd + 4);
        fileName = header.toString().match(/filename="([^"]+)"/);
       if(fileName){
          files[++totalFile] = {
            size:body.length,
            file:body,
            fileName:fileName[1],
            contentType : header.toString().split("Content-Type: ")[1]
          }
        }else{
          entries[header.toString().match(/name="([^"]+)"/)[1]] = body.toString().trim();
        }
        start = end + Buffer.from(boundry).length;
        end = bufferData.indexOf(Buffer.from(boundry),start);
       }
       req.body = entries;
       req.files = files;
     }else if(rct.toString().match(/json/i)){
      req.body = JSON.parse(bufferData.toString());
      req.files = files;
     }else if(rct.toString().match(/text/i) || req.headers['content-type'].match(/x-www-form-urlencoded/i)){
      const q = require('querystring');
       let queries = q.parse(bufferData.toString());
       req.body = queries;
       req.files = files;
     }else{
      req.body = bufferData.toString();
       req.files = files;
     }
  })
   
  }
}
