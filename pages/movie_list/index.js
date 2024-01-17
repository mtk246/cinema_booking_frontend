import React, {useState, useEffect, useCallback} from "react";
import useTranslation from "next-translate/useTranslation";
import { getApi, postApi, putApi, getPublicApi} from "../../utils/api";
import { toast } from "react-toastify";
import MUIDataTable from "mui-datatables";
import { convertTimeZone, convertLocaleTimeString } from '../../utils';
import jsCookie from 'js-cookie';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "react-bootstrap";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { decryptData } from "../../utils/crypto";

const Movie = () => {
    const { t } = useTranslation("common");
    const [movie, setMovie] = useState([]);
    const [isUpdateMovie, setIsUpdateMovie] = useState(false);
    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);
    const user_id = decryptData(jsCookie.get('user_id'));
    const [showModal, setShowModal] = useState(false);
    const [createMovie, setCreateMovie] = useState({});
    const [oneMovie, setOneMovie] = useState({});

    const handleShowModal = (movieId = '') => {
        if (movieId !== '') {
            setIsUpdateMovie(true);
            getOneMovie(movieId);
        } else {
            setOneMovie({});
            setIsUpdateMovie(false);
        }

        setShowModal(true);
    };

    const handleKeyDown = useCallback((event) => {
        if (event.shiftKey && event.key.toLowerCase() === "n") {
            event.preventDefault();
            handleShowModal();
        }
    },[]);

    const handleCloseModal = () => {
        handleRefresh();
        setShowModal(false);
    };

    const columns = [
        {
            name: "rowNumber",
            label: "#",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => (
                    <span>{tableMeta.rowIndex + 1}</span>
                ),
            },
        },
        {
            name: "movie_name",
            label: "Movie Name",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "name",
            label: "Created By",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "created_at",
            label: "Created At",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => (
                    convertTimeZone(movie[tableMeta.rowIndex]?.created_at)
                    + ' ' +
                    convertLocaleTimeString(movie[tableMeta.rowIndex]?.created_at)
                )
            }
        },
        {
            name: "updated_at",
            label: "Updated At",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => (
                    movie[tableMeta.rowIndex]?.updated_at !== null ?
                    convertTimeZone(movie[tableMeta.rowIndex]?.updated_at)
                    + ' ' +
                    convertLocaleTimeString(movie[tableMeta.rowIndex]?.updated_at)
                    : ''
                )
            }
        },
        {
            name: "show_more",
            label: "Show more",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta, updateValue) => (
                    <Button
                        variant="primary"
                        onClick={() => handleShowModal(movie[tableMeta.rowIndex]?.movie_id)}
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </Button>
                )
            }
        }
    ];

    const options = {
        filterType: 'checkbox',
        selectableRows: "none",
        responsive: "standard",
    };

    const handleRefresh = useCallback(async () => {
        const fetchApi = getPublicApi("/movie");

        await fetchApi.then((res) => {
            if (res.status === 200) {
                setMovie(res.data.result);
            }
            if (res.status === 403) {
                toast.error("Error");
            }
        });
    }, []);

    async function handleSubmit() {
        if (isUpdateMovie === true) {
            oneMovie.created_by = user_id;
            const putData = putApi(
                '/movie',
                decryptedToken,
                oneMovie,
            );

            await putData.then((res) => {
                if (res.status === 200) {
                    toast.success(res.data.message);
                }
                if (res.status === 403) {
                    toast.error('Error');
                }
            });
        } else {
            createMovie.created_by = user_id;

            const postData = postApi(
                '/movie',
                decryptedToken,
                createMovie,
            );

            await postData.then((res) => {
                if (res.status === 200) {
                    toast.success(res.data.message);
                }
                if (res.status === 403) {
                    toast.error('Error');
                }
            });
        }

        handleRefresh();
        setOneMovie({});
        setIsUpdateMovie(false);
        setShowModal(false);
    }

    const getOneMovie = useCallback(async (movieId) => {
        const fetchApi = getPublicApi(`/movie?movie_id=` + movieId);

        await fetchApi.then((res) => {
            if (res.status === 200) {
                setOneMovie(res.data?.result[0]);
            }
            if (res.status === 403) {
                toast.error('Unauthorized');
            }
        });
    }, [setOneMovie]);

    useEffect(() => {
        handleRefresh();
        getOneMovie();
    }, [
        handleRefresh,
        getOneMovie,
    ]);

    return (
        <div>
            <div className="text-end my-3">
                <Button className="w-25" variant="primary" onClick={() => handleShowModal('')}>
                    Create
                </Button>
            </div>
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
                dialogClassName="modal-xxl"
            >
                <ModalHeader closeButton>
                    <Modal.Title>
                        {
                            isUpdateMovie ? ( 'Update Movie') : ('Create Movie')
                        }
                    </Modal.Title>
                </ModalHeader>
                <ModalBody>
                    <Box
                        component="form"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '25ch' },
                        }}
                        noValidate
                        autoComplete="off"
                    >
                        <TextField
                            id="outlined-required"
                            label="Movie Name"
                            value={oneMovie ? oneMovie?.movie_name : ''}
                            onChange={(e) => isUpdateMovie ?
                                setOneMovie((prevMovie => ({
                                    ...prevMovie,
                                    "movie_name": e.target.value
                                })))
                                : setCreateMovie((prevMovie => ({
                                    ...prevMovie,
                                    "movie_name": e.target.value
                                })))
                            }
                        />
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant="primary" onClick={handleSubmit}>
                        Save
                    </Button>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
            <MUIDataTable
                title="Movie Lists"
                data={movie}
                columns={columns}
                options={options}
                className="shadow-none"
            />
        </div>
    );
};

export default Movie;
