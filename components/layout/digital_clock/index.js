import { useState, useEffect } from 'react';

export default function DigitalClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const formattedTime = time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).toUpperCase();

    const formattedDate = new Intl.DateTimeFormat('en', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(time);

    return (
        <div>
            <h1 className='display-2 fw-bold'>{formattedTime}</h1>
            <h1 className='fw-normal'>{formattedDate}</h1>
        </div>
    );
}