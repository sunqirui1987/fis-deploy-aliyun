var ALY = require("aliyun-sdk");
var aliyunoss = null;

var serverRoot = (function(){
    var key = 'FIS_SERVER_DOCUMENT_ROOT';
    if(process.env && process.env[key]){
        var path = process.env[key];
        if(fis.util.exists(path) && !fis.util.isDir(path)){
            fis.log.error('invalid environment variable [' + key + '] of document root [' + path + ']');
        }
        return path;
    } else {
        return fis.project.getTempPath('www');
    }
})();

var cwd = process.cwd();

function normalizePath(to, root){
    if(to[0] === '.'){
        to = fis.util(cwd + '/' +  to);
    } else if(/^output\b/.test(to)){
        to = fis.util(root + '/' +  to);
    } else if(to === 'preview'){
        to = serverRoot;
    } else {
        to = fis.util(to);
    }
    return to;
}

function deliver(output, release, content, file, callback){
    if(!release){
        fis.log.error('unable to get release path of file['
            + file.realpath
            + ']: Maybe this file is neither in current project or releasable');
    }
    if(fis.util.exists(output) && !fis.util.isDir(output)){
        fis.log.error('unable to deliver file['
            + file.realpath + '] to dir['
            + output + ']: invalid output dir.');
    }
    var target;
    target = fis.util(output, release);
    fis.util.write(target, content);
    fis.log.debug(
        'deliver release ' +
        file.subpath.replace(/^\//, '') +
        ' >> '.yellow.bold +
        target
    );


    callback();
}

function uploadoss(bucket, to, release, content, file, callback) {
	 var subpath = file.subpath;
     var contenttype = "";
     var aliyunkey = release.replace(/^\//, '');
     if(file.isJsLike)
     {
        contenttype = "application/javascript";
     }
     if(file.isCssLike)
     {
        contenttype = "text/css";
     }

     aliyunoss.putObject({
      Bucket: bucket,
      Key: aliyunkey,
      Body: content,
      AccessControlAllowOrigin: '',
      ContentType: contenttype,
      CacheControl: 'cache',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
      ContentDisposition: '',           // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.5.1
      ContentEncoding: 'utf-8',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11
      ServerSideEncryption: '',
      Expires: 60
    },
    function (err, data) {
        if(err){
            console.log('error:', err);
        } else {
            var time = '[' + fis.log.now(true) + ']';
            process.stdout.write(
                ' uploadoss - '.green.bold +
                time.grey + ' ' + 
                subpath.replace(/^\//, '') +
                ' >> '.yellow.bold +
               aliyunkey + "---"+contenttype+
                '\n'
            );
            callback();
        }
       
    });
}
module.exports = function (dest, file, content, settings, callback) {
   
    var root = fis.project.getProjectPath();
    var to = normalizePath(dest.to, root);
    if(settings && settings.type && settings.type == "aliyun"){

        aliyunoss = new ALY.OSS({
          "accessKeyId": settings.accessKeyId,
          "secretAccessKey": settings.secretAccessKey,
          endpoint: 'http://oss-cn-hangzhou.aliyuncs.com',
          apiVersion: '2013-10-15'
        });

        uploadoss(settings.bucket,to, dest.release, content, file, callback);
    } else {
        deliver(to, dest.release, content, file, callback);
    }
};