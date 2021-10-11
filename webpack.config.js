const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: path.join(__dirname, 'client/src/index.js')
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'bundle.js'
    },
    plugins: [new HtmlWebpackPlugin({
        title: 'Ig Scrapper',
        template: path.join(__dirname, 'client/templates/index.ejs'),
        filename: 'index.html'
    })],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|express)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ]
                    }
                }
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: [':data-src']
                    }
                }
            },
            {
                test: /\.(png|jpg)$/,
                include: path.join(__dirname, '/client/img'),
                loader: 'file-loader'
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'build'),
        },
        compress: true,
        proxy: {
            '/api/getData/:username': 'http://localhost:4000/'
        }
    },
    resolve: {
        extensions: ["*", ".js", ".jsx"]
    },
    resolveLoader: {
        extensions: ["babel-loader"]
    },
    devtool: 'source-map',
    mode: 'development',
    resolve: {
        fallback: {
            fs: false
        }
    }

};