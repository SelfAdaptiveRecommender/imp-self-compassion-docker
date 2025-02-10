import { useStorage } from "@vueuse/core";

export async function doLogout(router) {
    const token = useStorage('token');
    const userRole = useStorage('userRole');
    token.value = null;
    userRole.value = null;
    router.push({ name: 'Login' })
}