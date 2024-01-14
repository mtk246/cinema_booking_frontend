import { useState, useEffect, useCallback } from "react";
import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faCheck,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
const { getApi, putApi } = require("../../utils/api");
import jsCookie from 'js-cookie';
import { Spinner } from "../Spinner";
import { toast } from "react-toastify";
import { decryptData } from "../../utils/crypto";
import EasyEdit, {Types} from 'react-easy-edit';
import Image from "next/image";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';

function EditUserModal(props) {
    const [showModal, setShowModal] = useState(false);
    const [userDetail, setUserDetail] = useState({});
    const [loading, setLoading] = useState(false);
    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleShowModal = (userId) => {
        getUserDetail(userId);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        props.onClose();
    };

    const handleChange = (event) => {
        const { id, value } = event.target;
        const updatedUserDetail = { ...userDetail };
        
        if(updatedUserDetail[0]){
            if (id === "name") {
                updatedUserDetail[0].name = value;
            } else if (id === "user_name") {
                updatedUserDetail[0].user_name = value;
            } else if (id === "user_name_input") {
                updatedUserDetail[0].user_name = value;
            } else if (id === "user_password") {
                updatedUserDetail[0].user_password = value;
            }
        }

        setUserDetail(updatedUserDetail);
    };

    const { user_id } = props;

    const textFieldArr = [
        {
            "label": "Name",
            "value": userDetail[0]?.name !== "" ? userDetail[0]?.name : "N/A",
            "onSaveName": "name",
        },
        {
            "label": "Username",
            "value": userDetail[0]?.user_name !== "" ? userDetail[0]?.user_name : "N/A",
            "onSaveName": "user_name",
        },
        {
            "label": "Password",
            "value": userDetail[0]?.password !== "" ? userDetail[0]?.password : "N/A",
            "onSaveName": "password",
        },
    ];

    const onSave = async (id, value) => {
        const updatedUser = [...userDetail];

        if (id === "status") {
            updatedUser[0][id] = ((value === 0) ? true : false);
        } else {
            updatedUser[0][id] = value;
        }

        setUserDetail(updatedUser);

        const fetchApi = putApi("/updateUser", decryptedToken, updatedUser[0]);

        await fetchApi.then((res) => {
            if (res.status === 200) {
                toast.success('Account is Updated successfully');
            }
            if (res.status === 403) {
                toast.error("Error");
            }
            if (res.status === 400) {
                toast.error("Error");
            }
        });
    };

    const cancel = () => {console.log("Cancelled")}
    
    const getUserDetail = useCallback(async (userId) => {
        setLoading(true);

        const fetchApi = getApi(`/getUsers?user_id=` + userId, decryptedToken);

        await fetchApi.then((res) => {
            if (res.status === 200) {
                setUserDetail(res.data.result);
            }
            if (res.status === 403) {
                toast.error('Unauthorized');
            }
        });

        setLoading(false);
    }, [decryptedToken]);

    useEffect(() => {
        getUserDetail();
    }, [
        getUserDetail,
    ]);

    return (
        <div>
            <Button variant="primary" onClick={() => handleShowModal(user_id)}>
                <FontAwesomeIcon icon={faEdit} />
            </Button>
            <Modal size="lg" show={showModal} onHide={handleCloseModal} centered>
                {
                    loading
                        ? <Spinner />
                        : (
                            <>
                                <Modal.Header closeButton>
                                        <Modal.Title>
                                            {userDetail[0]?.name}
                                        </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="container-fluid p-0">
                                        <section>
                                            <div className="container-fluid p-0 w-100">
                                                <div className="row d-flex container-fluid p-0 justify-content-center
                                                    align-items-center h-100 w-100"
                                                >
                                                    <div className="col col-md-9 col-lg-10 col-xl-10">
                                                        <div className="card">
                                                            <div className="card-body p-4">
                                                                <div className="d-flex text-black w-100">
                                                                    <div>
                                                                        <Image
                                                                            src="https://mdbcdn.b-cdn.net/img/new/avatars/2.webp" // eslint-disable-line
                                                                            className="rounded-circle w-100 img-fluid"
                                                                            alt="..."
                                                                            width={150}
                                                                            height={150}
                                                                        />
                                                                    </div>
                                                                    <div
                                                                        className="d-flex justify-content-center
                                                                        align-items-start flex-column flex-grow-1 ms-3"
                                                                    >
                                                                        {
                                                                            textFieldArr.map((item, index) => {
                                                                                return (
                                                                                    <div className="" key={index}>
                                                                                        <p className="text-muted">
                                                                                            <small>{item.label}</small>
                                                                                        </p>
                                                                                        <div
                                                                                            className="d-flex
                                                                                                align-items-center"
                                                                                        >
                                                                                            <small>
                                                                                                <FontAwesomeIcon
                                                                                                    icon={faEdit}
                                                                                                    className="text-muted me-2" // eslint-disable-line
                                                                                                />
                                                                                            </small>
                                                                                            <EasyEdit
                                                                                                type={Types.TEXT}
                                                                                                value={item.value}
                                                                                                onSave={
                                                                                                    (value) => onSave(
                                                                                                        item.onSaveName,
                                                                                                        value
                                                                                                    )
                                                                                                }
                                                                                                onCancel={cancel}
                                                                                                saveButtonLabel={
                                                                                                    <FontAwesomeIcon
                                                                                                        icon={faCheck}
                                                                                                    />
                                                                                                }
                                                                                                cancelButtonLabel={
                                                                                                    <FontAwesomeIcon
                                                                                                        icon={faTimes}
                                                                                                    />
                                                                                                }
                                                                                            />
                                                                                        </div>
                                                                                        <hr />
                                                                                    </div>
                                                                                )
                                                                            })
                                                                        }
                                                                        <div
                                                                            className="row my-2 d-flex
                                                                                align-items-center"
                                                                        >
                                                                            <InputLabel
                                                                                htmlFor="role"
                                                                            >
                                                                                Role
                                                                            </InputLabel>
                                                                            <Select
                                                                                label="Role"
                                                                                id="role"
                                                                                className="w-100"
                                                                                value={userDetail[0]?.role}
                                                                                onChange={(e) => {
                                                                                    onSave(
                                                                                        "role",
                                                                                        e.target.value,
                                                                                    )
                                                                                }}
                                                                            >
                                                                                <MenuItem value={0}>Admin</MenuItem>
                                                                                <MenuItem value={1}>Co-Admin</MenuItem>
                                                                                <MenuItem value={2}>User</MenuItem>
                                                                            </Select>
                                                                        </div>
                                                                        <div
                                                                            className="row my-2 d-flex
                                                                                align-items-center"
                                                                        >
                                                                            <InputLabel
                                                                                htmlFor="status"
                                                                            >
                                                                                Status
                                                                            </InputLabel>
                                                                            <Select
                                                                                id="status"
                                                                                label="Status"
                                                                                className="w-100"
                                                                                value={userDetail[0]?.status === true
                                                                                    ? 0 : 1
                                                                                }
                                                                                onChange={(e) => {
                                                                                    onSave(
                                                                                        "status",
                                                                                        e.target.value,
                                                                                    )
                                                                                }}
                                                                            >
                                                                                <MenuItem value={0}>
                                                                                    Activate
                                                                                </MenuItem>
                                                                                <MenuItem value={1}>
                                                                                    Deactivate
                                                                                </MenuItem>
                                                                            </Select>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button onClick={handleCloseModal} variant="secondary">Cancel</Button>
                                </Modal.Footer>
                            </>
                        )
                }
            </Modal>
        </div>
    );
}

export default EditUserModal;
