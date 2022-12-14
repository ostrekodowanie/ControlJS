import React, { useEffect, useLayoutEffect, useRef, useState } from "react"

export interface ControlProps {
    element: JSX.Element, // necessary element
    opacity?: number, // if declared animate from 0 to provided number
    duration?: number, // animation duration
    delay?: number, // animation delay
    ease?: "ease-in" | "ease-out" | "ease-in-out", // easing
    x?: number | string, // movement on x axis
    y?: number | string, // movement on y axis
    rotate?: number, // rotation
    onScroll?: boolean, // does it have to appear on scroll
    viewPort?: number, // on what portion of the screen does the element have to appear,
    backgroundColor?: string, // background color
    color?: string, // text color
    // reverse?: boolean, currently tested
    mount?: number // testing purposes
}

type S = Omit<ControlProps, 'element' | 'mount' | 'x' | 'y' | 'rotate'>

interface Styles extends S {
    transform?: string
}

export default function Control(props:ControlProps):JSX.Element {
    const { element, opacity, duration = 400, ease = 'cubic-bezier(0, 0, 1.0, 1.0)', delay = 0, x, y, rotate = 0, onScroll, viewPort = 0.8,
    backgroundColor, color } = props;

    const firstRender = useRef<boolean>(true)
    const timer = useRef<number | undefined>(undefined)
    const wrapper = useRef<HTMLDivElement | null>(null!)
    const isInViewPort = useRef<boolean>(false)

    // default values for styles

    const [styles, setStyles] = useState<Styles>({
        ...(opacity && { opacity: 0 })
    })

    // different cases for x and y since you can provide a number or a string with sth like % value

    let xValue: number | string = typeof x === 'number' ? x + 'px' : typeof x === 'string' ? x : ''
    let yValue: number | string = typeof y === 'number' ? y + 'px' : typeof y === 'string' ? y : ''

    // full transform syntax for all cases

    let translateValue: string = x && y ? `translate(${xValue}, ${yValue})` : y ? `translateX(${yValue})` : x ? `translateX(${xValue})` : ''

    // rotate value

    let rotateValue: string = `rotate(${rotate}deg)`

    const defaultStyles = {
        ...(opacity && { opacity: 0 }),
        transform: `${translateValue} ${rotateValue}`
    }

    const setDefaultStyles = ():void => {
        setStyles(defaultStyles)
    }
 
    const setElementInViewPort = ():void => {
        let fromElement = wrapper.current?.getBoundingClientRect().top
        isInViewPort.current = fromElement ? fromElement < window.innerHeight * viewPort : false
    }

    // const handleReverse = ():boolean => {
    //     if(reverse && styles !== defaultStyles) setDefaultStyles()
    //     return reverse ? true : false
    // }

    // function setting styles for the element

    const setTimerWithStyles = () => {
        timer.current = setTimeout(() => {
            setStyles(prev => {
                return {
                    ...prev,
                    transform: 'none',
                    ...(opacity && { opacity: opacity }),
                    ...(backgroundColor && { backgroundColor: backgroundColor }),
                    ...(color && { color: color })
                }
            })
        }, firstRender.current ? 1 : duration / 2)
    }

    useLayoutEffect(() => {
        // testing purposes; setting default values for styles

        if(!firstRender.current) setDefaultStyles()

        firstRender.current = false

        if(x || y || rotate) {
            setStyles(prev => {
                return {
                    ...prev,
                    transform: `${translateValue} ${rotateValue}`
                }
            })
        }
    }, [])

    useEffect(() => {
        // changing values of different style properties

        if(!onScroll) setTimerWithStyles()

        // onScroll mechanics

        const scrollCallback = () => {
            setElementInViewPort();
            if(isInViewPort.current) setTimerWithStyles();
        };

        if(onScroll) {
            scrollCallback();

            window.addEventListener('scroll', scrollCallback);

            return () => {
                clearTimeout(timer.current);
                window.removeEventListener('scroll', scrollCallback);
            }
        }

        return () => clearTimeout(timer.current)
    }, [])

    return <div ref={wrapper} style={{
        ...styles, 
        transition: `all ${duration}ms ${ease} ${delay}ms`, 
        maxWidth: 'max-content'
    }}>{element}</div>
}