#!/usr/bin/env node
// parseFamilyTree.js
// parse a txt file representation of a family tree and produce JSON for d3

var fs = require('fs'),
	byline = require('byline'), // https://github.com/jahewson/node-byline
	Parser = require('../lib/ParseFamilyTree'),
	UTIL = require('util');     // http://nodejs.org/api/util.html

var fileName = 'data/family-tree.txt';

try
{
	var stream = fs.createReadStream(fileName);
	stream = byline.createStream(stream);
	stream.on('data', function(line)
	{
		line = line.toString();
		if (!/^\s*#/.test(line))
		{
			var oPerson = Parser.parseLine(line, fileName);
			UTIL.puts(UTIL.inspect(oPerson), '');
		}
	});
}
catch (err)
{
	console.dir(err);
}

