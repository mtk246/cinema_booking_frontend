import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import jsCookie from 'js-cookie';
import { connect } from 'react-redux';
import { onAuthSuccess } from '../../store/action/rootAction';
import DigitalClock from '../../components/layout/digital_clock';
import { Spinner } from '../../components';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import useTranslation from 'next-translate/useTranslation';
import { postPublicApi } from '../../utils/api';
import FullscreenButton from '../../components/fullscreenBtn';
import { encryptData } from '../../utils/crypto';

function Login(props) {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [tokenName, setTokenName] = useState("");
    const [loading, setLoading] = useState(false);
    const [loginCred, setLoginCred] = useState({
        username: '',
        password: '',
    });

    useEffect(() => {
        const token = jsCookie.get("token");

        if (token && token !== tokenName) {
            router.replace("/");
        }
    }, [router, tokenName]);

    const formObj = [
        {
            type: 'text',
            name: 'username',
            label: t('username'),
            placeholder: t('username'),
        },
        {
            type: 'password',
            name: 'password',
            label: t('password'),
            placeholder: t('password'),
        },
    ];

    const login = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            user_name: loginCred.username,
            password: loginCred.password,
        };

        const fetchApi = postPublicApi('/login', data);
        await fetchApi.then((res) => {
            if (res.status === 200) {
                if (res.data.message && res.data.result !== null) {
                    const authData = {
                        name: res.data.result.username,
                        role: res.data.result.role,
                        token: res.data.result,
                    };

                    const encryptedToken = encryptData(res.data.token);
                    const encryptedUserId = encryptData(res.data.result.id);
                    const encryptedRole = encryptData(res.data.result.role);

                    jsCookie.set('token', encryptedToken);
                    jsCookie.set('user_id', encryptedUserId);
                    jsCookie.set('role', encryptedRole);

                    props.onAuthSuccess(authData);
                    toast.success('Logging in...');

                    router.push('/production');
                }
            } else {
                toast.error(res.data?.message || 'Unauthorized');
                setLoading(false);
            }
        });
    };

    return (
        <>
            <div className='container-fluid d-flex justify-content-center align-items-center min-vh-100 flex-column'>
                <div className='text-center'>
                    <Image src='/img/logo.svg' alt='iManage-logo' width={300} height={300} />
                </div>
                <div className='row w-75'>
                    <div className='col-12 col-md-6 mb-5'>
                        <h1 className='text-start text-decoration-underline'> {t('login')} </h1>
                        <form onSubmit={login} className='mt-4'>
                            {formObj.map((item, index) => (
                                <div className='mb-3' key={index}>
                                    <label htmlFor={item.name} className='form-label'>
                                        {item.label}
                                    </label>
                                    <input
                                        id={item.name}
                                        name={item.name}
                                        type={item.type}
                                        className='form-control'
                                        onChange={(e) =>
                                        setLoginCred({ ...loginCred, [item.name]: e.target.value })
                                        }
                                        placeholder={item.placeholder}
                                        required
                                    />
                                </div>
                            ))}
                            <div className=''>
                                <Link href='/forgot'>{t('forgot_password')}</Link>
                            </div>
                            <div className='text-center my-3'>
                                {loading ? (
                                    <Spinner />
                                ) : (
                                    <button className='btn btn-secondary w-75' type='submit'>
                                        {t('login')}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                    <div className='col-12 col-md-6 text-center m-auto'>
                        <DigitalClock />
                        <DropdownButton
                            id='dropdown-basic-button'
                            title={`${t('language')}`}
                            className='my-3 mx-2'
                        >
                            <Dropdown.Item as={Link} href='/account/login' locale='en'>
                                English
                            </Dropdown.Item>
                            <Dropdown.Item as={Link} href='/account/login' locale='mm'>
                                မြန်မာ
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                </div>
                <div className='w-100 text-end'>
                    <FullscreenButton />
                </div>
            </div>
        </>
    );
}

const mapDispatchToProps = (dispatch) => {
    return {
        onAuthSuccess: (data) => dispatch(onAuthSuccess(data)),
    };
};

export default connect(null, mapDispatchToProps)(Login);
