var _ava=require('ava');var _ava2=_interopRequireDefault(_ava);
var _imageUpload=require('../image-upload');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

(0,_ava2.default)('generate policies for "content" type upload',function(t){
var req={
auth:{
user:'harish'},

uploadType:'content',
textId:'df37y32-h87er-efewrywe-we'};

(0,_imageUpload.getResponse)(req);
t.true(typeof req.response==='object');
t.is(req.response.acl,'public-read');});

//# sourceMappingURL=image-upload.test-compiled.js.map