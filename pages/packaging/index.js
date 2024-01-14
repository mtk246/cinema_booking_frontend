import React, {useState, useEffect, useCallback} from "react";
import useTranslation from "next-translate/useTranslation";
import { getApi, postApi, putApi } from "../../utils/api";
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

const Packaging = () => {
    const { t } = useTranslation("common");
    const [packaging, setPackaging] = useState([]);
    const [isUpdatePackaging, setIsUpdatePackaging] = useState(false);
    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);
    const user_id = jsCookie.get('user_id');
    const [showModal, setShowModal] = useState(false);
    const [createPackaging, setCreatePackaging] = useState({});
    const [onePackaging, setOnePackaging] = useState({});
    
    const handleShowModal = (packagingTypeId = '') => {
        if (packagingTypeId !== '') {
            setIsUpdatePackaging(true);
            getOnePackaging(packagingTypeId);
        } else {
            setOnePackaging({});
            setIsUpdatePackaging(false);
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
            name: "packaging_type_name",
            label: "Packaging Name",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "user_name",
            label: "Modified By",
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
                    convertTimeZone(packaging[tableMeta.rowIndex]?.created_at)
                    + ' ' +
                    convertLocaleTimeString(packaging[tableMeta.rowIndex]?.created_at)
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
                    packaging[tableMeta.rowIndex]?.updated_at !== null ?
                    convertTimeZone(packaging[tableMeta.rowIndex]?.updated_at)
                    + ' ' +
                    convertLocaleTimeString(packaging[tableMeta.rowIndex]?.updated_at)
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
                        onClick={() => handleShowModal(packaging[tableMeta.rowIndex]?.packaging_type_id)}
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
        const fetchApi = getApi("/packaging", decryptedToken);

        await fetchApi.then((res) => {
            if (res.status === 200) {
                setPackaging(res.data.result);
            }
            if (res.status === 403) {
                toast.error("Error");
            }
        });
    }, [decryptedToken]);

    async function handleSubmit() {
        if (isUpdatePackaging === true) {
            onePackaging.user_id = user_id;
            const putData = putApi(
                '/packaging',
                decryptedToken,
                onePackaging,
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
            createPackaging.user_id = user_id;

            const postData = postApi(
                '/packaging',
                decryptedToken,
                createPackaging,
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
        setOnePackaging({});
        setIsUpdatePackaging(false);
        setShowModal(false);
    }

    const getOnePackaging = useCallback(async (packagingTypeId) => {
        const fetchApi = getApi(`/packaging?packaging_type_id=` + packagingTypeId, decryptedToken);

        await fetchApi.then((res) => {
            if (res.status === 200) {
                setOnePackaging(res.data?.result[0]);
            }
            if (res.status === 403) {
                toast.error('Unauthorized');
            }
        });
    }, [decryptedToken, setOnePackaging]);

    useEffect(() => {
        handleRefresh();
        getOnePackaging();
    }, [
        handleRefresh,
        getOnePackaging,
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
                            isUpdatePackaging ? ( 'Update Packaging Type') : ('Create Packaging Type')
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
                            label="Packaging Type Name"
                            value={onePackaging ? onePackaging?.packaging_type_name : ''}
                            onChange={(e) => isUpdatePackaging ?
                                setOnePackaging((prevPackaging => ({
                                    ...prevPackaging,
                                    "packaging_type_name": e.target.value
                                })))
                                : setCreatePackaging((prevPackaging => ({
                                    ...prevPackaging,
                                    "packaging_type_name": e.target.value
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
                title={t('packaging_type')}
                data={packaging}
                columns={columns}
                options={options}
                className="shadow-none"
            />
        </div>
    );
};

export default Packaging;
