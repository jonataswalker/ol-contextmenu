import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    externals: [
        { ol: 'ol' },
        function ({ context, request }, callback) {
            if (/^ol\/.*$/.test(request)) {
                console.log({ request, context });

                return callback(null, request.replaceAll('/', '.'));
            }

            callback();
        },
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
};
