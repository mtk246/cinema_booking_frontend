import React, {useState, useEffect, useCallback} from "react";
import useTranslation from "next-translate/useTranslation";
import {postApi, putApi, getPublicApi} from "../../utils/api";
import { toast } from "react-toastify";
import MUIDataTable from "mui-datatables";
import { convertTimeZone, convertLocaleTimeString } from '../../utils';
import jsCookie from 'js-cookie';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "react-bootstrap";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import {
    faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { decryptData } from "../../utils/crypto";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import dayjs from 'dayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const MovieSchedules = () => {
    const { t } = useTranslation("common");
    const [movie, setMovie] = useState([]);
    const [movieSchedules, setMovieSchedules] = useState([]);
    const [isUpdateMovie, setIsUpdateMovie] = useState(false);
    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);
    const user_id = decryptData(jsCookie.get('user_id'));
    const [showModal, setShowModal] = useState(false);
    const [createMovie, setCreateMovie] = useState({});
    const [oneMovie, setOneMovie] = useState({});
    const [selectedMovie, setSelectedMovie] = useState('');
    const [startDateValue, setStartDateValue] = useState(null);
    const [endDateValue, setEndDateValue] = useState(null);
    const [startTimeValue, setStartTimeValue] = useState(null);
    const [endTimeValue, setEndTimeValue] = useState(null);

    const handleChangeMovie = (event) => {
        // console.log(dayjs(startDateValue).format('YYYY-MM-DD'));
        // console.log(dayjs(startTimeValue).format('HH:mm'));
        setSelectedMovie(event.target.value);
    };

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
            name: "start_time",
            label: "Start Time",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "end_time",
            label: "End Time",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "start_date",
            label: "Start Date",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => (
                    movieSchedules[tableMeta.rowIndex]?.start_date !== null ?
                    convertTimeZone(movieSchedules[tableMeta.rowIndex]?.start_date)
                    : ''
                )
            }
        },
        {
            name: "end_date",
            label: "End Date",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => (
                    movieSchedules[tableMeta.rowIndex]?.end_date !== null ?
                    convertTimeZone(movieSchedules[tableMeta.rowIndex]?.end_date)
                    : ''
                )
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
                    convertTimeZone(movieSchedules[tableMeta.rowIndex]?.created_at)
                    + ' ' +
                    convertLocaleTimeString(movieSchedules[tableMeta.rowIndex]?.created_at)
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
                    movieSchedules[tableMeta.rowIndex]?.updated_at !== null ?
                    convertTimeZone(movieSchedules[tableMeta.rowIndex]?.updated_at)
                    + ' ' +
                    convertLocaleTimeString(movieSchedules[tableMeta.rowIndex]?.updated_at)
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
                        onClick={() => handleShowModal(movieSchedules[tableMeta.rowIndex]?.movie_id)}
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
        const fetchApi = getPublicApi("/movie/schedules");

        await fetchApi.then((res) => {
            if (res.status === 200) {
                setMovieSchedules(res.data.result);
            }
            if (res.status === 403) {
                toast.error("Error");
            }
        });

        const fetchMoviesApi = getPublicApi('/movie');

        await fetchMoviesApi.then((res) => {
            if (res.status === 200) {
                setMovie(res.data?.result);
            }
            if (res.status === 403) {
                toast.error('Unauthorized');
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
            const data = {
                movie_id: selectedMovie,
                start_date: dayjs(startDateValue).format('YYYY-MM-DD'),
                end_date: dayjs(endDateValue).format('YYYY-MM-DD'),
                start_time: dayjs(startTimeValue).format('HH:mm'),
                end_time: dayjs(endTimeValue).format('HH:mm'),
                created_by: user_id
            };

            const postData = postApi(
                '/movie/schedules',
                decryptedToken,
                data,
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
                            isUpdateMovie ? ( 'Update Movie Schedule') : ('Create Movie Schedule')
                        }
                    </Modal.Title>
                </ModalHeader>
                <ModalBody>
                    <div className="d-flex">
                        <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Movie Lists</InputLabel>
                                <Select
                                    label="Movie Lists"
                                    id="movie_lists_id"
                                    value={movie ? movie?.movie_id : ''}
                                    onChange={handleChangeMovie}
                                >
                                    {
                                        movie?.map((movie) => (
                                            <MenuItem
                                                key={movie.movie_id}
                                                value={movie.movie_id}
                                            >
                                                {movie.movie_name}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                        </Box>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['DatePicker']}>
                            <DatePicker
                                label="Start Date"
                                onChange={(newValue) => setStartDateValue(newValue)}
                            />
                            </DemoContainer>
                        </LocalizationProvider>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['DatePicker']}>
                            <DatePicker
                                label="End Date"
                                onChange={(newValue) => setEndDateValue(newValue)}
                            />
                            </DemoContainer>
                        </LocalizationProvider>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['TimePicker']}>
                                <TimePicker
                                    label="Start Time"
                                    onChange={(newValue) => setStartTimeValue(newValue)}
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['TimePicker']}>
                                <TimePicker
                                    label="End Time"
                                    onChange={(newValue) => setEndTimeValue(newValue)}
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                    </div>
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
                title="Movie Schedules"
                data={movieSchedules}
                columns={columns}
                options={options}
                className="shadow-none"
            />
        </div>
    );
};

export default MovieSchedules;
