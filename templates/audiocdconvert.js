module.exports=function(dust){var tmpl=(function(dust){dust.register("templates\/audiocdconvert",body_0);function body_0(chk,ctx){return chk.w("ffmpeg -i \"").f(ctx.get(["audiofilenamenoext"], false),ctx,"").w(".m4a\" \"").f(ctx.get(["audiofilenamenoext"], false),ctx,"").w(".wav\" ");}body_0.__dustBody=!0;return body_0}(dust));var f=function load(ctx, cb) {
      var fn = cb ? 'render' : 'stream';
      return dust[fn](tmpl, ctx, cb);
    };f.template=tmpl;return f}
