module.exports=function(dust){var tmpl=(function(dust){dust.register("templates\/splitaudio",body_0);function body_0(chk,ctx){return chk.s(ctx.get(["sections"], false),ctx,{"block":body_1},{});}body_0.__dustBody=!0;function body_1(chk,ctx){return chk.w("ffmpeg -i \"").f(ctx.get(["audiofilename"], false),ctx,"").w("\" -acodec copy -t ").f(ctx.get(["track_length"], false),ctx,"").w(" -ss ").f(ctx.get(["start_time"], false),ctx,"").w(" \"").f(ctx.get(["track_number2"], false),ctx,"").w(". ").f(ctx.get(["chapter"], false),ctx,"").w(".m4a\"\n");}body_1.__dustBody=!0;return body_0}(dust));var f=function load(ctx, cb) {
      var fn = cb ? 'render' : 'stream';
      return dust[fn](tmpl, ctx, cb);
    };f.template=tmpl;return f}
