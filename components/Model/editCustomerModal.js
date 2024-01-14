import { useState, useEffect, useCallback } from "react";
import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faUserCircle,
    faCheck,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
const { getApi, putApi, getLocation } = require("../../utils/api");
import jsCookie from 'js-cookie';
import { toast } from "react-toastify";
import EasyEdit, { Types } from "react-easy-edit";
import useTranslation from 'next-translate/useTranslation';
import { decryptData } from "../../utils/crypto";

async function fetchLocationData(customerDetail) {
    if (customerDetail.length > 0) {
        const locationData = await getLocation(customerDetail[0].shop_address);
        
        if (locationData) {
            return locationData.results[0].geometry.location;
        }
    }

    return null;
}

function EditCustomerModal(props) {
    const { t } = useTranslation('common');
    const [showModal, setShowModal] = useState(false);
    const [customerDetail, setCustomerDetail] = useState([]);
    const [map, setMap] = useState('');
    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);
    const { shop_id } = props;

    const handleShowModal = (shopId) => {
        getCustomerDetail(shopId);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setMap('');
        setCustomerDetail('');
        props.onClose();
    };

    const getCustomerDetail = useCallback(async (shopId) => {
        const fetchApi = getApi(`/customer/shop?shop_id=` + shopId, decryptedToken);
      
        await fetchApi.then(async (res) => {
            if (res.status === 200) {
                setCustomerDetail(res.data.result);
                const location = await fetchLocationData(res.data.result);

                if (location !== null) {
                    const updatedCustomer = [...res.data.result];
                    updatedCustomer[0].geo_lat = location.lat;
                    updatedCustomer[0].geo_long = location.lng;
                    setCustomerDetail(updatedCustomer);

                    const maps_embed_url = 'https://maps.google.com/maps?q=' +
                        updatedCustomer[0].geo_lat + ',' + updatedCustomer[0].geo_long +
                        '&t=&z=15&ie=UTF8&iwloc=&output=embed';

                    setMap(maps_embed_url);
                }
            }
            if (res.status === 403) {
                toast.error('Unauthorized');
            }
        });
    }, [decryptedToken]);

    const onSave = async (productId, id, value) => {
        const updatedCustomer = [...customerDetail];
        updatedCustomer[0][id] = value;
        updatedCustomer[0]['cus_password'] = 'mtkMTK123#';
        setCustomerDetail(updatedCustomer);

        const fetchApi = putApi('/customer/shop', token, updatedCustomer[0]);
    
        await fetchApi.then((res) => {
          if (res.status === 200) {
            toast.success(res.data.message);
          } else {
            toast.error('Error');
          }
        });
    }

    useEffect(() => {
        getCustomerDetail(shop_id);
    }, [getCustomerDetail, shop_id]);

    return (
        <div>
            <Button variant="primary" onClick={() => handleShowModal(shop_id)}>
                <FontAwesomeIcon icon={faEdit} />
            </Button>
            <Modal size="lg" show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                        <Modal.Title>
                            {customerDetail[0]?.shop_owner}
                        </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="container">
                        <div className="row d-flex justify-content-center align-items-center">
                            <div className="col col-lg-12 mb-4 mb-lg-0">
                                <div className="card mb-3 border-0">
                                    <div className="row g-0 d-flex align-items-center">
                                        <div className="col-md-4 gradient-custom text-center">
                                            <FontAwesomeIcon
                                                icon={faUserCircle}
                                                className="display-1"
                                            />
                                            <h5>
                                                <EasyEdit
                                                    type={Types.TEXT}
                                                    value={customerDetail[0]?.shop_owner || t('write')}
                                                    onSave={(value) => onSave(
                                                        customerDetail[0]?.shop_id, 'shop_owner', value
                                                    )}
                                                    saveButtonLabel={
                                                        <FontAwesomeIcon icon={faCheck} className="text-success" />
                                                    }
                                                    cancelButtonLabel={
                                                        <FontAwesomeIcon icon={faTimes} className="text-danger" />
                                                    }
                                                />
                                            </h5>
                                            <small className="text-secondary">
                                                <em>
                                                    <EasyEdit
                                                        type={Types.TEXT}
                                                        value={customerDetail[0]?.shop_name || t('write')}
                                                        onSave={(value) => onSave(
                                                            customerDetail[0]?.shop_id, 'shop_name', value
                                                        )}
                                                        saveButtonLabel={
                                                            <FontAwesomeIcon icon={faCheck} className="text-success" />
                                                        }
                                                        cancelButtonLabel={
                                                            <FontAwesomeIcon icon={faTimes} className="text-danger" />
                                                        }
                                                    />
                                                </em>
                                            </small>
                                        </div>
                                        <div className="col-md-8">
                                            <div className="card-body p-4">
                                                <h6>Information</h6>
                                                <hr className="mt-0 mb-4" />
                                                <div className="row pt-1">
                                                    <div className="col-6 mb-3">
                                                        <span><small>Account Name</small></span>
                                                        <p className="text-secondary">
                                                            <EasyEdit
                                                                type={Types.TEXT}
                                                                value={customerDetail[0]?.cus_username || t('write')}
                                                                onSave={(value) => onSave(
                                                                    customerDetail[0]?.shop_id, 'cus_username', value
                                                                )}
                                                                saveButtonLabel={
                                                                    <FontAwesomeIcon
                                                                        icon={faCheck}
                                                                        className="text-success"
                                                                    />
                                                                }
                                                                cancelButtonLabel={
                                                                    <FontAwesomeIcon
                                                                        icon={faTimes}
                                                                        className="text-danger"
                                                                    />
                                                                }
                                                            />
                                                            
                                                        </p>
                                                    </div>
                                                    <div className="col-6 mb-3">
                                                    <span><small>Phone</small></span>
                                                        <p className="text-secondary">
                                                            <EasyEdit
                                                                type={Types.TEXT}
                                                                value={customerDetail[0]?.shop_phone || t('write')}
                                                                onSave={(value) => onSave(
                                                                    customerDetail[0]?.shop_id, 'shop_phone', value
                                                                )}
                                                                saveButtonLabel={
                                                                    <FontAwesomeIcon
                                                                        icon={faCheck}
                                                                        className="text-success"
                                                                    />
                                                                }
                                                                cancelButtonLabel={
                                                                    <FontAwesomeIcon
                                                                        icon={faTimes}
                                                                        className="text-danger"
                                                                    />
                                                                }
                                                            />
                                                            
                                                        </p>
                                                    </div>
                                                </div>
                                                <h6>Address</h6>
                                                <hr className="mt-0 mb-4" />
                                                <div>
                                                    <p className="text-secondary">
                                                        <EasyEdit
                                                            type={Types.TEXT}
                                                            value={customerDetail[0]?.shop_address || t('write')}
                                                            onSave={(value) => onSave(
                                                                customerDetail[0]?.shop_id, 'shop_address', value
                                                            )}
                                                            saveButtonLabel={
                                                                <FontAwesomeIcon
                                                                    icon={faCheck}
                                                                    className="text-success"
                                                                />
                                                            }
                                                            cancelButtonLabel={
                                                                <FontAwesomeIcon
                                                                    icon={faTimes}
                                                                    className="text-danger"
                                                                />
                                                            }
                                                        />
                                                        
                                                    </p>
                                                </div>
                                                <div>
                                                    <iframe
                                                        src={`${map}`}
                                                        width="auto"
                                                        height="auto"
                                                        styles={{ border: 0 }}
                                                        allowFullScreen=""
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                    ></iframe>
                                                </div>
                                                
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleCloseModal} variant="secondary">Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default EditCustomerModal;
