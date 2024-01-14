import { useState, useEffect, useCallback } from "react";
import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faInfo,
    faCheck,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
const { getApi, putApi } = require("../../utils/api");
import jsCookie from 'js-cookie';
import { Spinner } from "../Spinner";
import { convertTimeZone, convertLocaleTimeString } from "../../utils";
import { toast } from "react-toastify";
import EasyEdit, { Types } from "react-easy-edit";
import { decryptData } from "../../utils/crypto";

function ProductDetails(props) {
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [purchaseDetail, setPurchaseDetail] = useState([]);
  const [category, setCategory] = useState([]);
  const [priceGroup, setPriceGroup] = useState([]);
  const [packagingType, setPackagingType] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = jsCookie.get('token');
  const decryptedToken = decryptData(token);
  const [units, setUnits] = useState(0);

  const handleShowModal = (productId) => {
    setSelectedProductId(productId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    props.onClose();
  };

  const { product_id } = props;

  const getPurchaseDetail = useCallback(async () => {
    setLoading(true);

    // const fetchApi = getApi('/purchase/detail/product?product_id=' + selectedProductId, decryptedToken);

    // await fetchApi.then((res) => {
    //     if (res.status === 200) {
    //         setPurchaseDetail(res.data.result);
    //         setUnits(res.data.result[0]?.total_product_unit || 0);

    //         setCategory(res.data.result
    //           .filter(Array.isArray)
    //           .find(arr => arr[0]?.cat_id)
    //           .flat()
    //         );

    //         setPriceGroup(res.data.result
    //           .filter(Array.isArray)
    //           .find(arr => arr[0]?.price_gp_id)
    //           .flat()
    //         );

    //         setPackagingType(res.data.result
    //           .filter(Array.isArray)
    //           .find(arr => arr[0]?.packaging_type_id)
    //           .flat()
    //         );
    //     } else {
    //         toast.error(res.data.message);
    //     }
    // });

    setLoading(false);
  }, [decryptedToken, selectedProductId]);

  const onSave = async (productId, id, value) => {
    const updatedProduct = [...purchaseDetail];
    updatedProduct[0][id] = value;
    setPurchaseDetail(updatedProduct);

    const fetchApi = putApi('/purchase/detail/product', decryptedToken, updatedProduct[0]);

    await fetchApi.then((res) => {
      if (res.status === 200) {
        toast.success(res.data.message);
      } else {
        toast.error('Error');
      }
    });
  }

  useEffect(() => {
    getPurchaseDetail();
  }, [
    getPurchaseDetail,
  ]);

  return (
    <div>
        <Button variant="primary" onClick={() => handleShowModal(product_id)}>
            <FontAwesomeIcon icon={faInfo} />
        </Button>
        <Modal size="lg" show={showModal} onHide={handleCloseModal} centered>
          {
            loading
              ? <Spinner />
              : (
                <>
                  <Modal.Header closeButton>
                    <Modal.Title>
                      <small className="text-muted fw-bold modal-caption">
                        <EasyEdit
                          type="select"
                          options={category.map(category => ({
                            value: category.cat_id,
                            label: category.cat_name
                          }))}
                          onSave={(value) => onSave(purchaseDetail[0]?.product_id, 'cat_id', value)}
                          placeholder={purchaseDetail[0]?.cat_name}
                          saveButtonLabel={<FontAwesomeIcon icon={faCheck} className="text-success" />}
                          cancelButtonLabel={<FontAwesomeIcon icon={faTimes} className="text-danger" />}
                        />
                      </small>
                      <small className="modal-caption fw-bold">
                        <div className="d-flex flex-row align-items-center">
                          <div className="me-2">Price Group - </div>
                          <EasyEdit
                            type="select"
                            options={priceGroup.map(gp => ({
                              value: gp.price_gp_id,
                              label: gp.price_gp_name
                            }))}
                            onSave={(value) => onSave(purchaseDetail[0]?.product_id, 'price_gp_id', value)}
                            placeholder={purchaseDetail[0]?.price_gp_name}
                            saveButtonLabel={<FontAwesomeIcon icon={faCheck} className="text-success" />}
                            cancelButtonLabel={<FontAwesomeIcon icon={faTimes} className="text-danger" />}
                          />
                        </div>
                      </small>
                      <h2>
                        <EasyEdit
                          type={Types.TEXT}
                          value={purchaseDetail[0]?.product_name}
                          onSave={(value) => onSave(purchaseDetail[0]?.product_id, 'product_name', value)}
                          saveButtonLabel={<FontAwesomeIcon icon={faCheck} className="text-success" />}
                          cancelButtonLabel={<FontAwesomeIcon icon={faTimes} className="text-danger" />}
                        />
                      </h2>
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="row">
                      <div className="col">
                        <h4 className="text-decoration-underline text-muted mb-2">Inventory</h4>
                      </div>
                      <div className="col">
                        <p>
                          Last updated <br/>
                          <span>
                            {
                              purchaseDetail[0]?.product_updated_at
                                ? (
                                  convertTimeZone(purchaseDetail[0]?.product_updated_at)
                                  + ", " + convertLocaleTimeString(purchaseDetail[0]?.product_updated_at)
                                )
                                : (
                                  convertTimeZone(purchaseDetail[0]?.product_created_at)
                                  + ", " + convertLocaleTimeString(purchaseDetail[0]?.product_created_at)
                                )
                            }
                          </span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <p>
                        <div className="d-flex flex-row align-items-center">
                          <div className="me-2">Buy price:</div>
                          <EasyEdit
                            type={Types.TEXT}
                            value={purchaseDetail[0]?.buy_price}
                            onSave={(value) => onSave(purchaseDetail[0]?.product_id, 'buy_price', value)}
                            saveButtonLabel={<FontAwesomeIcon icon={faCheck} className="text-success" />}
                            cancelButtonLabel={<FontAwesomeIcon icon={faTimes} className="text-danger" />}
                            className="fs-4 fw-bold"
                          />
                          <span className="ms-2 fs-6 fw-bold">MMK</span>
                        </div>
                        <div className="d-flex flex-row align-items-center">
                          <div className="me-2">Sell price:</div>
                          <EasyEdit
                            type={Types.TEXT}
                            value={purchaseDetail[0]?.sell_price}
                            onSave={(value) => onSave(purchaseDetail[0]?.product_id, 'sell_price', value)}
                            saveButtonLabel={<FontAwesomeIcon icon={faCheck} className="text-success" />}
                            cancelButtonLabel={<FontAwesomeIcon icon={faTimes} className="text-danger" />}
                            className="fs-4 fw-bold"
                          />
                          <span className="ms-2 fs-6 fw-bold">MMK</span>
                        </div>
                        <div className="d-flex flex-row align-items-center">
                          <div className="me-2">Quantity:</div>
                          <EasyEdit
                            type={Types.TEXT}
                            value={purchaseDetail[0]?.total_product_unit}
                            onSave={(value) => onSave(purchaseDetail[0]?.product_id, 'total_product_unit', value)}
                            saveButtonLabel={<FontAwesomeIcon icon={faCheck} className="text-success" />}
                            cancelButtonLabel={<FontAwesomeIcon icon={faTimes} className="text-danger" />}
                          />&nbsp;
                          <EasyEdit
                            type="select"
                            options={packagingType.map(packaging => ({
                              value: packaging.packaging_type_id,
                              label: packaging.packaging_type
                            }))}
                            onSave={(value) => onSave(purchaseDetail[0]?.product_id, 'packaging_type_id', value)}
                            placeholder={purchaseDetail[0]?.packaging_type}
                            saveButtonLabel={<FontAwesomeIcon icon={faCheck} className="text-success" />}
                            cancelButtonLabel={<FontAwesomeIcon icon={faTimes} className="text-danger" />}
                          />
                        </div>
                        <h5 className="fw-bold">
                          <span className="text-muted">Total amount - </span>
                          {purchaseDetail[0]?.total_product_unit * purchaseDetail[0]?.buy_price} MMK
                        </h5>
                      </p>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="d-flex align-items-center fw-bolder fs-4 mx-md-4">
                      <div>
                        Total Units:
                      </div>
                      <div className="mx-2">
                        <span className="mx-2">
                          {units}
                        </span>
                        <span className="ms-2">
                          {purchaseDetail[0]?.packaging_type}
                        </span>
                      </div>
                      <button className="btn btn-primary" onClick={handleCloseModal} > Close </button>
                    </div>
                  </Modal.Footer>
                </>
              )
          }
      </Modal>
    </div>
  );
}

export default ProductDetails;
