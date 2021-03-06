'use strict';

var grunt = require('grunt');
var path = require('path');
var zlib = require('zlib');
var fs = require('fs');
var unzip = require('unzip');
var tar = require('tar');
var iltorb = require('iltorb');

exports.compress = {
  zip: function (test) {
    test.expect(1);
    var expected = [
      'folder_one/', 'folder_one/one.css', 'folder_one/one.js',
      'folder_two/', 'folder_two/two.css', 'folder_two/two.js',
      'test.css', 'test.js'
    ];
    var actual = [];
    var parse = unzip.Parse();
    fs.createReadStream(path.join('tmp', 'compress_test_files.zip')).pipe(parse);
    parse.on('entry', function (entry) {
      actual.push(entry.path);
    });
    parse.on('close', function () {
      actual.sort();
      expected.sort();
      test.deepEqual(actual, expected, 'zip file should unzip and contain all of the expected files');
      test.done();
    });
  },
  zipWithFolder: function (test) {
    test.expect(1);
    var expected = [
      'folder_one/', 'folder_one/one.css', 'folder_one/one.js',
      'folder_two/', 'folder_two/two.css', 'folder_two/two.js',
      'test.css', 'test.js'
    ];
    var actual = [];
    var parse = unzip.Parse();
    fs.createReadStream(path.join('tmp', 'compress_test_folder.zip')).pipe(parse);
    parse.on('entry', function (entry) {
      actual.push(entry.path);
    });
    parse.on('close', function () {
      actual.sort();
      expected.sort();
      test.deepEqual(actual, expected, 'zip file should unzip and contain all of the expected files');
      test.done();
    });
  },
  tar: function (test) {
    test.expect(1);
    var expected = [
      'folder_one/', 'folder_one/one.css', 'folder_one/one.js',
      'folder_two/', 'folder_two/two.css', 'folder_two/two.js',
      'test.css', 'test.js'
    ];
    var actual = [];
    var parse = tar.Parse();
    fs.createReadStream(path.join('tmp', 'compress_test_files.tar')).pipe(parse);
    parse.on('entry', function (entry) {
      actual.push(entry.path);
    });
    parse.on('end', function () {
      actual.sort();
      expected.sort();
      test.deepEqual(actual, expected, 'tar file should untar and contain all of the expected files');
      test.done();
    });
  },
  tgz: function (test) {
    test.expect(1);
    var expected = [
      'folder_one/', 'folder_one/one.css', 'folder_one/one.js',
      'folder_two/', 'folder_two/two.css', 'folder_two/two.js',
      'test.css', 'test.js'
    ];
    var actual = [];
    var parse = tar.Parse();
    fs.createReadStream(path.join('tmp', 'compress_test_files.tgz'))
      .pipe(zlib.createGunzip())
      .pipe(parse);
    parse.on('entry', function (entry) {
      actual.push(entry.path);
    });
    parse.on('end', function () {
      actual.sort();
      expected.sort();
      test.deepEqual(actual, expected, 'tgz file should gunzip/untar and contain all of the expected files');
      test.done();
    });
  },
  gzip: function (test) {
    test.expect(3);
    grunt.util.async.forEachSeries([
      'test.js',
      path.join('folder_one', 'one.css'),
      path.join('folder_two', 'two.js')
    ], function (file, next) {
      var expected = grunt.file.read(path.join('test', 'fixtures', file));
      var actual = '';
      fs.createReadStream(path.join('tmp', 'gzip', file))
        .pipe(zlib.createGunzip())
        .on('data', function (buf) {
          actual += buf.toString();
        })
        .on('end', function () {
          test.equal(actual, expected, 'should be equal to fixture after gunzipping');
          next();
        });
    }, test.done);
  },
  gzipCustomExt: function (test) {
    test.expect(3);
    [
      'test',
      'folder_one/one',
      'folder_two/two'
    ].forEach(function (file) {
      var expected = path.join('tmp', 'gzipCustomExt', file + '.gz.js');
      test.ok(grunt.file.exists(expected), 'should of had a correct extension.');
    });
    test.done();
  },
  gzipSrcEqualDest: function (test) {
    test.expect(3);
    grunt.util.async.forEachSeries([
      'test.js',
      path.join('folder_one', 'one.js'),
      path.join('folder_two', 'two.js')
    ], function (file, next) {
      var expected = grunt.file.read(path.join('test', 'fixtures', file));
      var actual = '';
      fs.createReadStream(path.join('tmp', 'gzipSrcEqualDest', file))
        .pipe(zlib.createGunzip())
        .on('data', function (buf) {
          actual += buf.toString();
        })
        .on('end', function () {
          test.equal(actual, expected, 'should be equal to fixture after gunzipping');
          next();
        });
    }, test.done);
  },
  deflate: function (test) {
    test.expect(3);
    grunt.util.async.forEachSeries([
      'test.js',
      path.join('folder_one', 'one.css'),
      path.join('folder_two', 'two.js')
    ], function (file, next) {
      var expected = grunt.file.read(path.join('test', 'fixtures', file));
      var actual = '';
      fs.createReadStream(path.join('tmp', 'deflate', file))
        .pipe(zlib.createInflate())
        .on('data', function (buf) {
          actual += buf.toString();
        })
        .on('end', function () {
          test.equal(actual, expected, 'should be equal to fixture after inflating');
          next();
        });
    }, test.done);
  },
  deflateRaw: function (test) {
    test.expect(3);
    grunt.util.async.forEachSeries([
      'test.js',
      path.join('folder_one', 'one.css'),
      path.join('folder_two', 'two.js')
    ], function (file, next) {
      var expected = grunt.file.read(path.join('test', 'fixtures', file));
      var actual = '';
      fs.createReadStream(path.join('tmp', 'deflateRaw', file))
        .pipe(zlib.createInflateRaw())
        .on('data', function (buf) {
          actual += buf.toString();
        })
        .on('end', function () {
          test.equal(actual, expected, 'should be equal to fixture after inflateRaw-ing');
          next();
        });
    }, test.done);
  },
  brotli: function (test) {
    test.expect(3);
    grunt.util.async.forEachSeries([
      'test.js',
      path.join('folder_one', 'one.css'),
      path.join('folder_two', 'two.js')
    ], function (file, next) {
      var expected = grunt.file.read(path.join('test', 'fixtures', file));
      var actual = '';
      fs.createReadStream(path.join('tmp', 'brotli', file))
        .pipe(iltorb.decompressStream())
        .on('data', function (buf) {
          actual += buf.toString();
        })
        .on('end', function () {
          test.equal(actual, expected, 'should be equal to fixture after debrotli-ing');
          next();
        });
    }, test.done);
  },
  brotliCustomExt: function (test) {
    test.expect(3);
    [
      'test',
      'folder_one/one',
      'folder_two/two'
    ].forEach(function (file) {
      var expected = path.join('tmp', 'brotliCustomExt', file + '.br.js');
      test.ok(grunt.file.exists(expected), 'should of had a correct extension.');
    });
    test.done();
  },
  brotliSrcEqualDest: function (test) {
    test.expect(3);
    grunt.util.async.forEachSeries([
      'test.js',
      path.join('folder_one', 'one.js'),
      path.join('folder_two', 'two.js')
    ], function (file, next) {
      var expected = grunt.file.read(path.join('test', 'fixtures', file));
      var actual = '';
      fs.createReadStream(path.join('tmp', 'brotliSrcEqualDest', file))
        .pipe(iltorb.decompressStream())
        .on('data', function (buf) {
          actual += buf.toString();
        })
        .on('end', function () {
          test.equal(actual, expected, 'should be equal to fixture after debrotli-ing');
          next();
        });
    }, test.done);
  },
  zipCreateEmptyArchiveOptionTrue: function(test) {
    test.equals(
      grunt.file.exists(path.join('tmp', 'zip_must_be_created_1.zip')), true,
      'Archive must be created if option "createEmptyArchive" is true');
    test.done();
  },
  zipCreateEmptyArchiveOptionFalse: function(test) {
    test.equals(
      grunt.file.exists(path.join('tmp', 'zip_should_not_be_created.zip')), false,
      'Archive must not be created if option "createEmptyArchive" is false');
    test.done();
  },
  zipCreateEmptyArchiveOptionNotExists: function(test) {
    test.equals(
      grunt.file.exists(path.join('tmp', 'zip_must_be_created_2.zip')), true,
      'Archive will be created because no option "createEmptyArchive" passed');
    test.done();
  }
};
