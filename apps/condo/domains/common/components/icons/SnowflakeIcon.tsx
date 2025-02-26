import React from 'react'
import Icon from '@ant-design/icons'

const SnowflakeIconSVG = ({ width = 20, height = 20 }) => {
    return (
        <svg width={width} height={height} viewBox='0 0 24 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M22.383 14.559l-.624-2.115-4.415 1.104-2.943-1.549 2.944-1.548 4.414 1.104.624-2.115-2.102-.526 2.675-1.408-1.184-1.9-2.682 1.409.573-1.934-2.306-.579-1.197 4.05-2.962 1.56V6.974l3.23-2.963-1.689-1.554-1.541 1.42V1.043h-2.39v2.834l-1.547-1.42-1.688 1.554 3.236 2.963v3.138L7.84 8.552l-1.197-4.05-2.306.579.573 1.934-2.682-1.408-1.185 1.899L3.72 8.914l-2.102.526.624 2.115 4.414-1.104 2.943 1.548-2.943 1.549-4.414-1.104-.624 2.115 2.102.526-2.676 1.408 1.185 1.9L4.91 16.99l-.573 1.928 2.306.579 1.197-4.05 2.969-1.56v3.138l-3.236 2.963 1.688 1.554 1.548-1.42v2.834h2.389v-2.834l1.541 1.42 1.688-1.555-3.23-2.962v-3.138l2.963 1.56 1.197 4.05 2.306-.579-.573-1.934 2.682 1.408 1.184-1.899-2.675-1.408 2.102-.526z' fill='currentColor'/>
        </svg>
    )
}

export const SnowflakeIcon: React.FC = (props) => {
    return (
        <Icon component={SnowflakeIconSVG} {...props}/>
    )
}
