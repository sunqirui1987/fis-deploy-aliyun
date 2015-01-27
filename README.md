# fis-deploy-aliyun

#
	安装
	npm install -g fis-deploy-aliyun

#
	fis.config.set('modules.deploy', 'aliyun');
	fis.config.set('settings.deploy.aliyun', {
		local : {
				  to:'d:/public_test'
		},
		
	    aliyun : {
			type : "aliyun",
	        bucket : 'detu-static', //空间
	        accessKeyId :"", //阿里云access key
			secretAccessKey : "", //阿里云Access Key Secret
	        from : '/',
	        to : '',
	        include : ['**.js','**.css'],
	        replace : {
	      
	        }
	    }
	});
