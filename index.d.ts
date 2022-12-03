import { ReactNode } from 'react'
import { NoticeProps, CardProps, TagProps } from '@purple/phoenix-components'

/* workaround for React 18 issue "Property 'children' does not exist on type", see https://github.com/bsidelinger912/react-tooltip-lite/issues/130 */

declare module '@purple/phoenix-components' {
    export interface NoticeProps {
        children: ReactNode
    }

    export interface CardProps {
        children: ReactNode
    }

    export interface TagProps {
        children: ReactNode
    }
}