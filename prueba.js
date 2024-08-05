/**
 * Created by Juan Carlos on 1/18/2019.
 */
// Load required modules
var console_log = require("./global/global").console_log;
var numCPUs = require('os').cpus().length;  // Crearemos tantos workers como CPUs tengamos en el sistema
var express = require("express");           // web framework external module
var bodyParser = require('body-parser');
//** PASSPORT JS REQUIRE **//
var cookieParser = require('cookie-parser');
var session = require('express-session');
var path = require('path');
//
///
////
var xTotal=5550;

