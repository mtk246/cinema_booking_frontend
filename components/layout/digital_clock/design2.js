import * as React from 'react';
import moment from 'moment';
import 'moment-timezone';

export default function DigitalClock({date}) {
    const currentDate = new Date();
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);

    let result;
    if (date === 'today') {
        result = currentDate;
    } else if (date === 'yesterday') {
        result = yesterday;
    } else {
        const inputDate = moment.tz(date, 'YYYY-MM-DD HH:mm:ss.SSS', 'UTC');
        const resultDate = inputDate.tz('Asia/Yangon').toDate();
        result = resultDate;
    }

    const formattedDate = new Intl.DateTimeFormat('en', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(result);

    return (
        <div className="text-custom-primary text-center m-2">
            <h1 className="h3 fw-bold">{formattedDate}</h1>
        </div>
    );
}
