class Setup {
  constructor() {
    if (process.env.LOCAL_SHARP) {
      var fs = require('fs');
      var path = require('path');
      var file_path = path.resolve(__dirname, "..", "sam/template.yml");
      fs.readFile(file_path, {encoding: 'utf8'}, function (err, data) {
        var formatted = data.replace(/^\s+ContentUri: s3:\/\/bucket_name\/sharp-lambda-layer.*/g, "      ContentUri: ../../sharp-lambda-layer.x86_64.zip");
        fs.writeFile(file_path, formatted, 'utf8', function (err) {
          if (err) return console.log(err);
        });
      });
    }
  }
}

module.exports = Setup
