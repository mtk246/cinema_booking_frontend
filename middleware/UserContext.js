import { createContext, useState, useEffect, useCallback } from 'react';
import { getApi } from '../utils/api';
import jsCookie from 'js-cookie';
import { toast } from 'react-toastify';
import { decryptData } from '../utils/crypto';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const token = jsCookie.get("token");
    const user_id = jsCookie.get("user_id");

    const decryptedToken = decryptData(token);
    const decryptedUserId = decryptData(user_id);

    const fetchUserData = useCallback(async () => {
        if (decryptedToken && decryptedToken != '') {
            const fetchApi = getApi('/getMyInfo?user_id=' + decryptedUserId, decryptedToken);

            await fetchApi.then((res) => {
                if (res.status === 200) {
                    setUserData(res.data.result);
                }
                if (res.status === 403) {
                    toast.error('Unauthorized');
                }
            })
        }
    }, [decryptedToken, decryptedUserId]);

    useEffect(() => {
        fetchUserData();
    }, [
        fetchUserData,
    ]);

    return (
        <UserContext.Provider value={userData}>
            {children}
        </UserContext.Provider>
    );
};
