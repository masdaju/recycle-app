import dayjs from 'dayjs';

export const formatDate = (date) => {
    return dayjs(date).format('YYYY年M月D日');
};
