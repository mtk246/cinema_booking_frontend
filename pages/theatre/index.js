import React, {useState, useEffect, useCallback} from "react";
import useTranslation from "next-translate/useTranslation";
import {postApi, putApi, getPublicApi} from "../../utils/api";
import { toast } from "react-toastify";
import MUIDataTable from "mui-datatables";
import { convertTimeZone, convertLocaleTimeString } from '../../utils';
import jsCookie from 'js-cookie';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";
import Box from '@mui/material/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TextField from '@mui/material/TextField';
import {
    faEdit,
    faChair,
} from '@fortawesome/free-solid-svg-icons';
import { decryptData } from "../../utils/crypto";

const Theatre = () => {
    const { t } = useTranslation("common");
    const [theatres, setTheatres] = useState([]);
    const [seats, setSeats] = useState([]);
    const [theatreId, setTheatreId] = useState('');
    const [isUpdateTheatre, setIsUpdateTheatre] = useState(false);
    const [isUpdateSeat, setIsUpdateSeat] = useState(false);
    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);
    const user_id = decryptData(jsCookie.get('user_id'));
    const [showModal, setShowModal] = useState(false);
    const [showSeatModal, setShowSeatModal] = useState(false);
    const [showCreateSeatModal, setShowCreateSeatModal] = useState(false);
    const [createTheatre, setCreateTheatre] = useState({});
    const [createSeat, setCreateSeat] = useState({});
    const [oneTheatre, setOneTheatre] = useState({});
    const [oneSeat, setOneSeat] = useState({});

    const handleShowModal = (theatreId = '') => {
        if (theatreId !== '') {
            setIsUpdateTheatre(true);
            getOneTheatre(theatreId);
        } else {
            setOneTheatre({});
            setIsUpdateTheatre(false);
        }

        setShowModal(true);
    };

    const handleCloseModal = () => {
        handleRefresh();
        setShowModal(false);
        setShowSeatModal(false);
        setShowCreateSeatModal(false);
        setIsUpdateSeat(false);
    };

    const handleShowSeatModal = (theatreId) => {
        getOneTheatre(theatreId);
        setShowSeatModal(true);
    };

    const handleShowCreateSeatModal = (theatreId, seat_number_id) => {
        getOneTheatre(theatreId);

        if (seat_number_id !== '') {
            seats.map((seat) => {
                if (seat.seat_number_id === seat_number_id) {
                    setOneSeat(seat);
                } else {
                    setOneSeat({});
                }
            })
            setIsUpdateSeat(true);
        } else {
            setIsUpdateSeat(false);
        }

        setShowCreateSeatModal(true);
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
            name: "theatre_name",
            label: "Theatre Name",
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
                    convertTimeZone(theatres[tableMeta.rowIndex]?.created_at)
                    + ' ' +
                    convertLocaleTimeString(theatres[tableMeta.rowIndex]?.created_at)
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
                    theatres[tableMeta.rowIndex]?.updated_at !== null ?
                    convertTimeZone(theatres[tableMeta.rowIndex]?.updated_at)
                    + ' ' +
                    convertLocaleTimeString(theatres[tableMeta.rowIndex]?.updated_at)
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
                    <>
                        <Button
                            variant="primary"
                            onClick={() => handleShowModal(theatres[tableMeta.rowIndex]?.theatre_id)}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => handleShowSeatModal(theatres[tableMeta.rowIndex]?.theatre_id)}
                        >
                            <FontAwesomeIcon icon={faChair} />
                        </Button>
                    </>
                )
            }
        }
    ];

    const seatColumns = [
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
            name: "seat_name",
            label: "Seat Number",
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
                    convertTimeZone(seats[tableMeta.rowIndex]?.created_at)
                    + ' ' +
                    convertLocaleTimeString(seats[tableMeta.rowIndex]?.created_at)
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
                    seats[tableMeta.rowIndex]?.updated_at !== null ?
                    convertTimeZone(seats[tableMeta.rowIndex]?.updated_at)
                    + ' ' +
                    convertLocaleTimeString(seats[tableMeta.rowIndex]?.updated_at)
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
                    <>
                        <Button
                            variant="primary"
                            onClick={() => handleShowCreateSeatModal(oneTheatre?.theatre_id, seats[tableMeta.rowIndex]?.seat_number_id)}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </Button>
                    </>
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
        const fetchApi = getPublicApi("/theatre");

        await fetchApi.then((res) => {
            if (res.status === 200) {
                setTheatres(res.data.result);
            }
            if (res.status === 403) {
                toast.error("Error");
            }
        });
    }, []);

    async function handleSubmit() {
        if (isUpdateTheatre === true) {
            oneTheatre.created_by = user_id;
            const putData = putApi(
                '/theatre',
                decryptedToken,
                oneTheatre,
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
                theatre_name: createTheatre.theatre_name,
                created_by: user_id
            };

            const postData = postApi(
                '/theatre',
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
        setOneTheatre({});
        setIsUpdateTheatre(false);
        setShowModal(false);
    }

    async function handleSeatSubmit() {
        if (isUpdateSeat === true) {
            oneSeat.created_by = user_id;
            const putData = putApi(
                '/seats',
                decryptedToken,
                oneSeat,
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
                seat_name: createSeat.seat_name,
                theatre_id: oneTheatre.theatre_id,
                created_by: user_id
            };

            const postData = postApi(
                '/seats',
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
        setOneTheatre({});
        setIsUpdateTheatre(false);
        setShowModal(false);
    }

    const getOneTheatre = useCallback(async (theatreId) => {
        const fetchApi = getPublicApi(`/theatre?theatre_id=` + theatreId);

        await fetchApi.then((res) => {
            if (res.status === 200) {
                setOneTheatre(res.data?.result[0]);
                setSeats(res.data?.result[0]?.seats);
            }
            if (res.status === 403) {
                toast.error('Unauthorized');
            }
        });
    }, [setOneTheatre]);

    useEffect(() => {
        handleRefresh();
        getOneTheatre();
    }, [
        handleRefresh,
        getOneTheatre,
    ]);

    return (
        <div>
            <div>
                <div className="text-end my-3">
                    <Button className="w-25" variant="primary" onClick={() => handleShowModal('')}>
                        Create Theatre
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
                                isUpdateTheatre ? ( 'Update Theatre') : ('Create Theatre')
                            }
                        </Modal.Title>
                    </ModalHeader>
                    <ModalBody>
                        <div className="d-flex">
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
                                    label="Theatre Name"
                                    value={oneTheatre ? oneTheatre?.theatre_name : ''}
                                    onChange={(e) => isUpdateTheatre ?
                                        setOneTheatre((prevMovie => ({
                                            ...prevMovie,
                                            "theatre_name": e.target.value
                                        })))
                                        : setCreateTheatre((prevMovie => ({
                                            ...prevMovie,
                                            "theatre_name": e.target.value
                                        })))
                                    }
                                />
                            </Box>
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
                    title="Theatres"
                    data={theatres}
                    columns={columns}
                    options={options}
                    className="shadow-none"
                />
            </div>
            <div>
                <Modal
                    show={showSeatModal}
                    onHide={handleCloseModal}
                    centered
                    dialogClassName="modal-xxl"
                >
                    <ModalHeader closeButton>
                        <Modal.Title>
                            Seats for {oneTheatre?.theatre_name}
                        </Modal.Title>
                    </ModalHeader>
                    <ModalBody>
                        <div className="text-end my-3">
                            <Button className="w-25" variant="primary" onClick={() => handleShowCreateSeatModal(oneTheatre?.theatre_id)}>
                                Create Seat
                            </Button>
                        </div>
                        <div className="w-100">
                            <MUIDataTable
                                title="Seat Lists"
                                data={seats}
                                columns={seatColumns}
                                options={options}
                                className="shadow-none"
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
            <div>
                <Modal
                    show={showCreateSeatModal}
                    onHide={handleCloseModal}
                    centered
                    dialogClassName="modal-xxl"
                >
                    <ModalHeader closeButton>
                        <Modal.Title>
                            {
                                isUpdateSeat === true ? ( 'Update Seat for ' + oneSeat?.seat_name + '') : ('Create Seat for ' + oneTheatre?.theatre_name)
                            }
                        </Modal.Title>
                    </ModalHeader>
                    <ModalBody>
                        <div className="d-flex">
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
                                    label="Seat Name"
                                    value={oneSeat ? oneSeat?.seat_name : ''}
                                    onChange={(e) => isUpdateSeat ?
                                        setOneSeat((prevMovie => ({
                                            ...prevMovie,
                                            "seat_name": e.target.value
                                        })))
                                        : setCreateSeat((prevMovie => ({
                                            ...prevMovie,
                                            "seat_name": e.target.value
                                        })))
                                    }
                                />
                            </Box>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="primary" onClick={handleSeatSubmit}>
                            Save
                        </Button>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        </div>
    );
};

export default Theatre;
