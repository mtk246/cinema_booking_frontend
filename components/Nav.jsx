import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars,
    faBuilding,
    faArrowLeft,
    faArrowRight,
    faLanguage,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import useTranslation from 'next-translate/useTranslation';
import { TruncateFuncWithTooltip, TruncateFunc } from '../utils/truncate';
import $ from 'jquery';
import { useEffect, useState, useCallback } from 'react';
import { getApi } from '../utils/api';
import { Button, NavDropdown } from 'react-bootstrap';
import jsCookie from 'js-cookie';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import HeadingTitle from './layout/headingTitle';
import { useRouter } from 'next/router';
import InitialsAvatar from 'react-initials-avatar';
import FullscreenButton from './fullscreenBtn';
import { toast } from 'react-toastify';
import { decryptData } from '../utils/crypto';

export { Nav };

function Nav({ children }) {
    const { t } = useTranslation('common');
    const [currentUser, setCurrentUser] = useState(null);
    const [toggle, setToggle] = useState(false);
    const [pageTitle, setPageTitle] = useState('');

    const token = jsCookie.get('token');
    const user_id = jsCookie.get('user_id');
    const role = jsCookie.get('role');

    const decryptedToken = decryptData(token);
    const decryptedUserId = decryptData(user_id);
    const decryptedRole = decryptData(role);

    const router = useRouter();

    // Language constants

    const language = [
        {
            language: `${t('english')}`,
            code: 'en',
            route: '/en'
        },
        {
            language: `${t('myanmar')}`,
            code: 'mm',
            route: '/mm'
        },
    ];

    // Language constants end

    const toggleSideBar = () => {
        setToggle(!toggle);
        $(".sidebar").toggleClass("toggled");
        if ($(".sidebar").hasClass("toggled")) {
            $('.sidebar .collapse').removeClass('hide');
        };
    }

    const handleOnClick = (e) => {
        $('.nav-item a').removeClass('active');
        $(e.target).addClass('active');
    }

    const logout = async (e) => {
        jsCookie.set('token', '');
        jsCookie.set('user_id', '');
        jsCookie.set('role', '');
        window.location = '/';
    }

    const getCurrentLoginInUser = useCallback(async () => {
        if (token && token !== '') {
            const fetchApi = getApi('/getMyInfo?user_id=' + decryptedUserId, decryptedToken);

            await fetchApi.then((res) => {
                if (res.status === 200) {
                    setCurrentUser(res.data.result);
                }
                if (res.status === 403) {
                    toast.error('Unauthorized');
                }
            });
        }
    }, [decryptedToken, token, decryptedUserId]);

    useEffect(() => {
        getCurrentLoginInUser();

        const pageTitle = router.pathname &&
            router.pathname !== '/' ? router.pathname.split('/')[1].replace(/([A-Z])/g, ' $1').trim()
            : '';
        pageTitle !== '' && setPageTitle(t('route.' + pageTitle));
    }, [
        token,
        getCurrentLoginInUser,
        router,
        t,
    ]);

    let route = [];

    if (decryptedRole !== 2) {
        route = [
            {
                title: 'Movie List',
                favIcon: faBuilding,
                route: '/movie_list'
            },
            {
                title: 'Movie Schedules',
                favIcon: faBuilding,
                route: '/movie_schedules'
            },
            {
                title: t('userManagement'),
                favIcon: faUser,
                route: '/user_management'
            },
        ];
    } else {
        route = [
            {
                title: 'Production Status',
                favIcon: faBuilding,
                route: '/production'
            },
        ]
    }

    return (
        <div className='wrapper' id='wrapper'>
            <ul className="navbar-nav sidebar sidebar-dark accordion">
                <Image
                    src='/img/logo.svg'
                    alt='iManage-logo'
                    width={200}
                    height={200}
                    className='img-fluid'
                />
                {route.map(
                    (item) => (
                        <li
                            key={item.title}
                            className='nav-item'
                            onClick={e => handleOnClick(e)}
                        >
                            <Link
                                href={item.route}
                                className='nav-link list-group-item list-group-item-action'
                            >
                                <FontAwesomeIcon icon={item.favIcon} />
                                <span className='p-2'>
                                    {item.title}
                                </span>
                            </Link>
                        </li>
                    )
                )}
                <div className="d-flex align-items-center justify-content-center my-3">
                    <Button
                        className="rounded-circle border-0"
                        variant="primary"
                        id="sidebarToggle"
                        onClick={toggleSideBar}
                    >
                        {
                            toggle
                                ? <FontAwesomeIcon icon={faArrowRight} />
                                : <FontAwesomeIcon icon={faArrowLeft} />
                        }
                    </Button>
                    <FullscreenButton />
                </div>
                <div className="mx-2">
                    <Button
                        variant="danger"
                        className='w-100'
                        onClick={(e) => logout(e)}
                    >
                        {t('logout')}
                    </Button>
                </div>
                <div className="my-2">
                    <span className='p-2'>v1.0</span>
                </div>
            </ul>
            <div id="content-wrapper" className="d-flex flex-column">
                <div id='content'>
                    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-2 static-top">
                        <button
                            id="sidebarToggleTop"
                            className="btn btn-primary d-md-none rounded-circle mx-2"
                            onClick={toggleSideBar}
                        >
                            <FontAwesomeIcon icon={faBars} />
                        </button>
                        <HeadingTitle>
                            <h3>{pageTitle}</h3>
                        </HeadingTitle>
                        <ul className="navbar-nav ms-auto align-items-center">
                            <li className="nav-item dropdown no-arrow d-flex align-items-center">
                                <NavDropdown
                                    id='id'
                                    title={
                                        currentUser &&
                                        (
                                            <div className='d-flex align-items-center'>
                                                <InitialsAvatar
                                                    name={currentUser[0].name || 'User'}
                                                />
                                                <h6 className='text-dark m-0 p-2'>
                                                    <TruncateFuncWithTooltip
                                                        id={currentUser[0]?.name}
                                                        text={currentUser[0].name || 'User'}
                                                        placementTooltip='bottom'
                                                    />
                                                </h6>
                                            </div>
                                        )
                                    }
                                >
                                    <NavDropdown.Item>
                                        <Link
                                            href='/user_management'
                                            className='text-decoration-none text-dark'
                                        >
                                            {t('userManagement')}
                                        </Link>
                                    </NavDropdown.Item>
                                    <DropdownButton
                                        id="dropdown-language"
                                        title={
                                            <div className='d-flex align-items-center'>
                                                <FontAwesomeIcon
                                                    icon={faLanguage}
                                                    className='fa-2x'
                                                />
                                                <span className='m-0 p-2'>
                                                    {t('language')}
                                                </span>
                                            </div>
                                        }
                                    >
                                        {
                                            language.map((item) => (
                                                <Dropdown.Item
                                                    key={item.code}
                                                >
                                                    <Link href={item.route}>
                                                        {item.language}
                                                    </Link>
                                                </Dropdown.Item>
                                            ))
                                        }
                                    </DropdownButton>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item
                                        className='text-danger'
                                        onClick={(e) => logout(e)}
                                    >
                                        {t('logout')}
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </li>
                        </ul>
                    </nav>
                    <div
                        className={router.pathname !== '/404'
                            ? 'm-2'
                            : 'h-100 d-flex justify-content-center align-items-center'
                        }
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
