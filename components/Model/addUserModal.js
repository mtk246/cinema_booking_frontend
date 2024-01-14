import { useState, useEffect, useCallback } from "react";
import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAdd,
} from '@fortawesome/free-solid-svg-icons';
const { postApi } = require("../../utils/api");
import jsCookie from 'js-cookie';
import { Spinner } from "../Spinner";
import { toast } from "react-toastify";
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { decryptData } from "../../utils/crypto";

function AddUserModal(props) {
    const [showModal, setShowModal] = useState(false);
    const [userDetail, setUserDetail] = useState({
        name: "",
        user_name: "",
        password: "",
        role: "",
    });
    const [loading, setLoading] = useState(false);
    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleShowModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        props.onClose();
    };

    const saveInfo = async () => {
        setLoading(true);

        const postData = postApi(
            '/createUser',
            decryptedToken,
            userDetail,
        );

        await postData.then((res) => {
            if (res.status === 200) {
                toast.success(res.data.message);
            }
            if (res.status === 403) {
                toast.error('Unauthorized');
            }
            if (res.status === 400) {
                const errorResponse = JSON.parse(res.response);
                toast.error(errorResponse.message);
            }
        });

        setLoading(false);
    }

    return (
        <div>
            <div className="text-end my-2">
                <Button variant="primary" onClick={() => handleShowModal()}>
                    <FontAwesomeIcon icon={faAdd} />
                    <span>Add New Account</span>
                </Button>
            </div>
            <Modal size="lg" show={showModal} onHide={handleCloseModal} centered>
                {
                    loading
                        ? <Spinner />
                        : (
                            <>
                                <Modal.Header closeButton>
                                        <Modal.Title>
                                            Create User
                                        </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                        <div className="container-fluid p-0">
                                            <div className='container-fluid mt-2 pt-4 pb-4'>
                                                <div className="row my-2">
                                                    <div className="col-6">
                                                        <InputLabel htmlFor="name">Name</InputLabel>
                                                        <OutlinedInput
                                                            id="name"
                                                            className="w-100"
                                                            aria-describedby="outlined-weight-helper-text"
                                                            label="Username"
                                                            onChange={(e) => setUserDetail(
                                                                { ...userDetail, name: e.target.value }
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col-6">
                                                        <InputLabel htmlFor="user_name">Role</InputLabel>
                                                        <Select
                                                            labelId="demo-simple-select-helper-label"
                                                            id="demo-simple-select-helper"
                                                            label="Role"
                                                            className="w-100"
                                                            onChange={(e) => {
                                                                const updatedUserDetail = { ...userDetail };
                                                                updatedUserDetail.role = e.target.value;
                                                                setUserDetail(updatedUserDetail);
                                                            }}
                                                        >
                                                            <MenuItem value={0}>Admin</MenuItem>
                                                            <MenuItem value={1}>Co-Admin</MenuItem>
                                                            <MenuItem value={2}>User</MenuItem>
                                                        </Select>
                                                    </div>
                                                </div>
                                            <div className="row">
                                                <div className="col-6 my-2">
                                                    <InputLabel htmlFor="user_name_input">User Name</InputLabel>
                                                    <OutlinedInput
                                                        id="user_name_input"
                                                        className="w-100"
                                                        aria-describedby="outlined-weight-helper-text"
                                                        label="Username"
                                                        onChange={(e) => setUserDetail(
                                                            { ...userDetail, user_name: e.target.value }
                                                        )}
                                                    />
                                                </div>
                                                <div className="col-6 my-2">
                                                    <InputLabel htmlFor="password">Password</InputLabel>
                                                    <OutlinedInput
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        className="w-100"
                                                        label="Password"
                                                        endAdornment={
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={handleClickShowPassword}
                                                                    onMouseDown={handleMouseDownPassword}
                                                                    edge="end"
                                                                >
                                                                    {
                                                                        showPassword
                                                                            ? <VisibilityOff />
                                                                            : <Visibility />
                                                                    }
                                                                </IconButton>
                                                            </InputAdornment>
                                                        }
                                                        value={userDetail[0]?.password}
                                                        onChange={(e) => setUserDetail(
                                                            { ...userDetail, password: e.target.value }
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button onClick={saveInfo} variant="primary">Save</Button>
                                    <Button onClick={handleCloseModal} variant="secondary">Cancel</Button>
                                </Modal.Footer>
                            </>
                        )
                }
            </Modal>
        </div>
    );
}

export default AddUserModal;
