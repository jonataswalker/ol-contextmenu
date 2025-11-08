import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
    entry: './src/index.js',
    externals: [
        { ol: 'ol' },
        function ({ context, request }, callback) {
            if (/^ol\/.*$/.test(request)) {
                console.log({ context, request })

                return callback(null, request.replaceAll('/', '.'))
            }

            callback()
        },
    ],
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
}
