import { CSS_CLASSES, CONTAINER_PADDING } from './src/constants.ts'

import type { CSSOptions } from 'vite'

const additionalData = Object.entries(CSS_CLASSES).reduce(
    (accumulator, [key, value]) => `${accumulator}$${key}:${value};`,
    `$container-padding:${CONTAINER_PADDING}px;`,
)

export const css: CSSOptions = {
    preprocessorOptions: {
        scss: {
            additionalData,
        },
    },
}
