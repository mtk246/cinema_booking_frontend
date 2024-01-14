import UserTable from '../../components/layout/user_info/UserTable';
import useTranslation from 'next-translate/useTranslation';
import { getApi } from '../../utils/api';
import { toast } from 'react-toastify';
import { decryptData } from '../../utils/crypto';

export default function UserManagement({userList}) {
    const { t } = useTranslation('common');
    return (
        <div className='container-fluid p-0'>
            <UserTable userList={userList} />
        </div>
    )
}

export async function getServerSideProps({req}) {
    const token = req.cookies.token;
    const decryptedToken = decryptData(token);
    const fetchApi = getApi(`/getUsers`, decryptedToken);

    try {
        const res = await fetchApi;

        if (res.status === 200) {
            const userList = res.data.result;
            return {
                props: {
                    userList,
                },
            };
        } else {
            toast.error(res.data.message);
            return {
                props: {
                    userList: [],
                },
            };
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data.");

        return {
            props: {
                userList: [],
            },
        };
    }
}