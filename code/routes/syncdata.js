const router = require('koa-router')();
const crypto = require('crypto');
const http = require('http');
const fs = require("fs");
const mntFolder = process.env.mntFolder;
const mntTrodFile = process.env.mntTrodFile;
const mntSummaryFile = process.env.mntSummaryFile;
const proxyHost = process.env.proxyHost;
const rowDataUrl = process.env.rowDataUrl;

function requestData(host, port, path, headers = {}, encoding = 'utf8'){
	let options = {
		hostname: host,
		port: port,
		path: path,
		method: 'GET',
		headers: headers
	};
	return new Promise(function(resolve, reject){
        let data = '';
		let req = http.request(options, function(res){
			res.setEncoding(encoding);
			res.on('data', function(chunk){
				data += chunk;
			});
            res.on('end', function(){
                resolve(data);
            });
		});
		req.on('error', (e)=>{
			reject(e.message);
		});
		req.end();
	});
};

router.prefix('/syncdata');

router.post('/', async (ctx, next) => {
    var headers = ctx.request.headers;
    var payload = ctx.request.body;
    var secret = process.env.secret;
    var signature256 = headers['x-hub-signature-256'];

    if(!signature256){return;}

    var hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    var calculatedSignature = 'sha256=' + hmac.digest('hex');
    
    var b256 = Buffer.from(signature256, 'utf8');
    var bCS = Buffer.from(calculatedSignature, 'utf8');
    if(!crypto.timingSafeEqual(b256, bCS)){return;}

    await requestData(proxyHost, 80, rowDataUrl)
    .then(data => {try {
        if (!fs.existsSync(mntFolder)) {
            fs.mkdirSync(mntFolder);
        }
        var objData = JSON.parse(data);
        var objContributor = {};
        var objSeverity = {};
        var objItem = {};
        for(let i = 0; i < objData.length; i++){
            let ID = objData[i],field = ID.field, stack = ID.stack, risk = ID.risk, severity = ID.severity,committer = ID.committer, contact = ID.contact;

            //summary risk by field and stack
            objItem[field] = objItem[field] || {};
            objItem[field][stack] = objItem[field][stack] || [];
            objItem[field][stack].push({"id":i,"risk":risk});

            //summary risk by severity
            if(!objSeverity[severity]){objSeverity[severity] = [];}
            objSeverity[severity].push({"id":i,"risk":risk});

            //summary contributor
            if(!objContributor[committer]){objContributor[committer] = {"commits":[],"contact":contact};}
            objContributor[committer].commits.push({"id":i,"risk":risk});
        }
        //summary total records and last modified time
        var objSummary = {};
        objSummary.total = objData.length;
        objSummary.mtime = new Date(payload.head_commit.timestamp).toLocaleString('en-US',{timeZone:'Asia/Shanghai'});
        objSummary.contributor = objContributor;
        objSummary.risk = objItem;
        objSummary.severity = objSeverity;

        //update NAS file
        fs.writeFileSync(mntTrodFile, data);
        fs.writeFileSync(mntSummaryFile, JSON.stringify(objSummary));

        //clear
        objContributor = null;
        objSeverity = null;
        objItem = null;
        objData = null;
        objSummary = null;
        ctx.body = 'Done';
      } catch (err) {
        ctx.body = err;
      }})
    .catch(err => ctx.body = err)
});

module.exports = router;
