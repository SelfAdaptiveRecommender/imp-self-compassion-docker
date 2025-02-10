import { axiosClient } from "../apiClient";
import { useStorage } from '@vueuse/core'

function handleUnauthorized(error, router) {
    if (error.response.status === 401) {
        const token = useStorage('token');
        const userRole = useStorage('userRole');
        token.value = null;
        userRole.value = null;
    }
    router.push({'name': 'Login'})
}

export async function doLogin(email, password) {
    const { data } = await axiosClient.post('login', { email, password }, authHeader());
    if (data) {
        const token = useStorage('token');
        const userRole = useStorage('userRole');
        token.value = data.token;
        userRole.value = data.role;
        return data.token;
    }
    return null;
}

export function doRegistration(email, password) {
    return axiosClient.post('registration', { email, password }, authHeader());
}

// for testing private resources
export async function loadPrivate(router) {
    return await axiosClient.get('private', { headers: authHeader() }).catch((error) => handleUnauthorized(error, router));
}

function authHeader() {
    const token = useStorage('token');
    if (token.value) {
        return { 'Authorization': "Bearer " + token.value }
    }
    return {}
}