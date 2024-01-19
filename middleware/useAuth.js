import { useEffect } from 'react';
import { useRouter } from 'next/router';

const useAuth = (requiredRole) => {
    const router = useRouter();

    useEffect(() => {
        const userRoles = [0, 1];
        const hasRequiredRole = userRoles.includes(requiredRole);

        if (!hasRequiredRole) {
        router.push('/movie_list');
        }
    }, [requiredRole, router]);
};

export default useAuth;
