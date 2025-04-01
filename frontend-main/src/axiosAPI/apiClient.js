import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: '/self-compassion/api/',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    withCredentials: true
});
