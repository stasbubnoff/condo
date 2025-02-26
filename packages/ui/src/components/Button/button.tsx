import React from 'react'
import { 
    Button as DefaultButton,
    ButtonProps as DefaultButtonProps,
} from 'antd'
import classNames from 'classnames'

const BUTTON_CLASS_PREFIX = 'condo-btn'

type CondoButtonProps = {
    type: 'primary' | 'secondary',
    children?: string
}

export type ButtonProps = Omit<DefaultButtonProps, 'shape' | 'size' | 'style' | 'ghost' | 'type' | 'prefix' | 'prefixCls'>
& CondoButtonProps

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const { type, className, icon, children,  ...rest } = props
    const classes = classNames(
        {
            [`${BUTTON_CLASS_PREFIX}-${type}`]: type,
        },
        className,
    )

    const wrappedIcon = icon
        ? <span className={`${BUTTON_CLASS_PREFIX}-icon`}>{icon}</span>
        : null

    return (
        <DefaultButton
            {...rest}
            icon={wrappedIcon}
            prefixCls={BUTTON_CLASS_PREFIX}
            className={classes}
            ref={ref}
        >
            <span className={`${BUTTON_CLASS_PREFIX}-text`} data-before={children}>
                {children}
            </span>
        </DefaultButton>
    )
})

Button.displayName = 'Button'

export {
    Button,
}

