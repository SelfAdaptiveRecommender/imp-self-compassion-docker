import axios from 'axios';

const backendUrl = process.env.VUE_APP_BACKEND_URL || 'http://localhost:8080/api/';

export const axiosClient = axios.create({
    baseURL: backendUrl,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS'
    },
    withCredentials: false
});
