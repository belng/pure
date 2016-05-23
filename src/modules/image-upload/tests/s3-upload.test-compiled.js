var _this=this;var _ava=require('ava');var _ava2=_interopRequireDefault(_ava);
var _request=require('request');var _request2=_interopRequireDefault(_request);
var _uploadToS=require('../uploadToS3');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

_ava2.default.skip('should upload image',function _callee(t){var 
url,
upload;return regeneratorRuntime.async(function _callee$(_context){while(1){switch(_context.prev=_context.next){case 0:url='https://ict4kids.files.wordpress.com/2013/05/mrc-2.png';_context.next=3;return regeneratorRuntime.awrap((0,_uploadToS.uploadImageToS3)('someuser','avatar',_request2.default.get(url)));case 3:upload=_context.sent;
t.is(upload.Location,'https://test-belong.s3-ap-southeast-1.amazonaws.com/uploaded/avatar/someuser/avatar');case 5:case 'end':return _context.stop();}}},null,_this);});

//# sourceMappingURL=s3-upload.test-compiled.js.map