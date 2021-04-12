const webpack = require("webpack")
const WebpackDevSerer = require('webpack-dev-server')
const path = require('path')
const process = require('process')
const fs = require('fs')

const {inspect} = require("util")
// const utils = require('./utils')
const webpack_config_common = require('./webpack.config')

const dev_folder = '../build_dev'

const port = 4000

let webpack_dev_server = null


const nw_options = '--remote-debugging-port=9222'
const webpack_config_debug = {
    mode: 'development',
	// Enable source map for debugging bundled script
    devtool: "source-map",
	// Enable source map for debugging bundled script
    output: {
        path: path.resolve(__dirname, '../build_dev/'),
        filename: "bundle.js"
    },
	// Enable hot reloading plugin
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
}

var webpack_config = {
    ...webpack_config_common,
    ...webpack_config_debug,
}

console.log(inspect(webpack_config, false, 10))
console.log('Starting...')


const startWebpack = function() {
    return new Promise((resolve, reject) => {
        const compiler = webpack(webpack_config)
        webpack_dev_server = new WebpackDevSerer(compiler, {
            inline: true,
            hot: true,
            writeToDisk: false
        })
        compiler.hooks.done.tap("done", (context, entry) => {
            console.log("done")
            resolve()
        })

        compiler.hooks.done.tap("watch", (context, entry) => {
            console.log("watch")
        })

        webpack_dev_server.listen(port, 'localhost', function(err) {
            if (err) {
                reject(err)
            }
        })
    })
}

const startNw = function() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path.resolve(__dirname, dev_folder))) {
            fs.mkdirSync(path.resolve(__dirname, dev_folder))
        }

        try {
            if (!fs.existsSync(path.resolve(__dirname, `${dev_folder}/res`))) {
                fs.symlinkSync(path.resolve(__dirname, '../src/res'), path.resolve(__dirname, `${dev_folder}/res`))
            }
        }
        catch(err) {
            console.warn('Failed to use symlink, fallback to dir copy')

            reject(err)
        } 

        const content = fs.readFileSync(path.resolve(__dirname, '../src/nw_package.json'))
        const nw_config = JSON.parse(content)

        nw_config['main'] = 'index_debug.html'
        // nw_config['node-remote'] = "http://localhost/*";
        try {
            fs.writeFileSync(path.resolve(__dirname, `${dev_folder}/package.json`), JSON.stringify(nw_config, null, 2))
            fs.copyFileSync(path.resolve(__dirname, 'index_debug.html'), path.resolve(__dirname, `${dev_folder}/index_debug.html`))

        }
        catch(err) {
            reject(err)
        }

        const {exec} = require("child_process")

        child = exec('nw ' + nw_options, {
            cwd: path.resolve(__dirname, dev_folder),
            detached: false,
            stdio: 'ignore'
        })
        child.on('spawn', () => {
            resolve()
        })
        child.on('close', (exit_code) => {
            if (webpack_dev_server) {
                webpack_dev_server.close()
            }
        })
    })
}


startWebpack()
    .then(() => {
        return startNw()
    })
    .then(() =>[
        console.log('NW started')
    ])
    .catch((err) => {
        console.log('NW failed staring \n', err)

        if (webpack_dev_server) {
            webpack_dev_server.close()
        }
    })