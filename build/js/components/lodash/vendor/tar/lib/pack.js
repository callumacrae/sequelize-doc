function Pack(e){var t=this;if(!(t instanceof Pack))return new Pack(e);e?t._noProprietary=e.noProprietary:t._noProprietary=!1,t._global=e,t.readable=!0,t.writable=!0,t._buffer=[],t._currentEntry=null,t._processing=!1,t._pipeRoot=null,t.on("pipe",function(e){if(e.root===t._pipeRoot)return;t._pipeRoot=e,e.on("end",function(){t._pipeRoot=null}),t.add(e)})}module.exports=Pack;var EntryWriter=require("./entry-writer.js"),Stream=require("stream").Stream,path=require("path"),inherits=require("../vendor/inherits/inherits.js"),GlobalHeaderWriter=require("./global-header-writer.js"),collect=require("../vendor/fstream/fstream.js").collect,eof=new Buffer(512);for(var i=0;i<512;i++)eof[i]=0;inherits(Pack,Stream),Pack.prototype.addGlobal=function(e){if(this._didGlobal)return;this._didGlobal=!0;var t=this;GlobalHeaderWriter(e).on("data",function(e){t.emit("data",e)}).end()},Pack.prototype.add=function(e){return this._global&&!this._didGlobal&&this.addGlobal(this._global),this._ended?this.emit("error",new Error("add after end")):(collect(e),this._buffer.push(e),this._process(),this._needDrain=this._buffer.length>0,!this._needDrain)},Pack.prototype.pause=function(){this._paused=!0,this._currentEntry&&this._currentEntry.pause(),this.emit("pause")},Pack.prototype.resume=function(){this._paused=!1,this._currentEntry&&this._currentEntry.resume(),this.emit("resume"),this._process()},Pack.prototype.end=function(){this._ended=!0,this._buffer.push(eof),this._process()},Pack.prototype._process=function(){function u(){if(o)return;o=!0,e._currentEntry=null,e._processing=!1,e._process()}var e=this;if(e._paused||e._processing)return;var t=e._buffer.shift();if(!t){e._needDrain&&e.emit("drain");return}if(t.ready===!1){e._buffer.unshift(t),t.on("ready",function(){e._process()});return}e._processing=!0;if(t===eof){e.emit("data",eof),e.emit("data",eof),e.emit("end"),e.emit("close");return}var n=path.dirname((t.root||t).path),r={};Object.keys(t.props).forEach(function(e){r[e]=t.props[e]}),e._noProprietary&&(r.noProprietary=!0),r.path=path.relative(n,t.path),process.platform==="win32"&&(r.path=r.path.replace(/\\/g,"/"));switch(r.type){case"Socket":return;case"Directory":r.path+="/",r.size=0;break;case"Link":var i=path.resolve(path.dirname(t.path),t.linkpath);r.linkpath=path.relative(n,i)||".",r.size=0;break;case"SymbolicLink":var i=path.resolve(path.dirname(t.path),t.linkpath);r.linkpath=path.relative(path.dirname(t.path),i)||".",r.size=0}var s=e._currentEntry=EntryWriter(r);s.parent=e,s.on("data",function(t){e.emit("data",t)}),s.on("header",function(){Buffer.prototype.toJSON=function(){return this.toString().split(/\0/).join(".")},s.props.size===0&&u()}),s.on("close",u);var o=!1;s.on("error",function(t){e.emit("error",t)}),t===e._pipeRoot&&(s.add=null),t.pipe(s)},Pack.prototype.destroy=function(){},Pack.prototype.write=function(){};