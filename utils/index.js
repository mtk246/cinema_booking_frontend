const env = require('../.env.local');

function convertTimeZone(date, tzRegion) {
    const date_value = new Date(date).toLocaleString('en-US', {
        timeZone: tzRegion,
        dateStyle: 'short',
    });

    return date_value;
}

function convertLocaleTimeString(date, tzRegion) {
    const date_value = new Date(date).toLocaleTimeString('en-US', {
        timeZone: tzRegion,
        timeStyle: 'short',
    });

    return date_value;
}

convertTimeZone.defaultProps = {
    tzRegion: env.TIME_ZONE,
}

function formatDate(inputDateStr) {
    const inputDate = new Date(inputDateStr);

    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const day = String(inputDate.getDate()).padStart(2, '0');
    const hours = String(inputDate.getHours()).padStart(2, '0');
    const minutes = String(inputDate.getMinutes()).padStart(2, '0');
    const seconds = String(inputDate.getSeconds()).padStart(2, '0');

    const myanmarTimeOffset = 6 * 60 + 30; // 6 hours and 30 minutes in minutes
    const myanmarDate = new Date(inputDate.getTime() + myanmarTimeOffset * 60 * 1000);

    const myanmarHours = String(myanmarDate.getHours()).padStart(2, '0');
    const myanmarMinutes = String(myanmarDate.getMinutes()).padStart(2, '0');
    const myanmarSeconds = String(myanmarDate.getSeconds()).padStart(2, '0');
  
    const formattedDate = `${year}-${month}-${day} ${myanmarHours}:${myanmarMinutes}:${myanmarSeconds}.000+06:30`;
  
    return formattedDate;
}

export {
    convertTimeZone,
    convertLocaleTimeString,
    formatDate,
}