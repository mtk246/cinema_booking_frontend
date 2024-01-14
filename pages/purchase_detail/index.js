import { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/router';
import { getApi, postApi } from '../../utils/api';
import jsCookie from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash,
    faAdd,
} from '@fortawesome/free-solid-svg-icons';
import { convertTimeZone, convertLocaleTimeString } from '../../utils';
import Link from "next/link";
import ProductDetails from "../../components/productModal";
import { toast } from "react-toastify";
import { Spinner } from "../../components";
import useTranslation from "next-translate/useTranslation";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { decryptData } from "../../utils/crypto";

export default function PurchaseDetail({initialPurchaseId, purchaseDetailData}) {
    const router = useRouter();
    const {t} = useTranslation('common');
    const [purchaseId, setPurchaseId] = useState(initialPurchaseId);
    const [purchaseDetail, setPurchaseDetail] = useState([]);
    const [productDetails, setProductDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isProductModalClosed, setIsProductModalClosed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [purchaseDetails, setPurchaseDetails] = useState({
        purchase_id: '',
        purchase_shop_id: '',
        purchase_bill_status: '',
        purchase_type_id: '',
        purchase_bill_id: '',
        purchase_detail_arr: [],
    });
    const [purchaseDetailsArr, setPurchaseDetailsArr] = useState([]);
    const uniqueCategoryIds = [...new Set(purchaseDetailData.map(item => item.cat_id))];
    const uniquePackagingTypeIds = [...new Set(purchaseDetailData.map(item => item.packaging_type_id))];
    const uniquePriceGroupIds =[...new Set(purchaseDetailData.map(item => item.price_gp_id))];
    const uniqueBalanceTypeIds =[...new Set(purchaseDetailData.map(item => item.balance_type_id))];

    const token = jsCookie.get('token');
    const decryptedToken = decryptData(token);

    useEffect(() => {
        if (purchaseDetail.length > 0) {
            setPurchaseDetails({
                purchase_id: purchaseDetail[0]?.purchase_id || '',
                purchase_shop_id: purchaseDetail[0]?.purchase_shop_id || '',
                purchase_bill_status: purchaseDetail[0]?.purchase_bill_status || '',
                purchase_type_id: purchaseDetail[0]?.purchase_type_id || '',
                purchase_bill_id: purchaseDetail[0]?.purchase_bill_id || '',
                purchase_detail_arr: [],
            });
        }
    }, [purchaseDetail]);

    const getPurchaseDetail = useCallback(async () => {
        setLoading(true);

        const fetchApi = getApi('/purchase?purchase_id=' + purchaseId, decryptedToken);

        await fetchApi.then((res) => {
            if (res.status === 200) {
                setPurchaseDetail(res.data.result);
                setProductDetails(res.data.result[1].products);
            } else {
                toast.error(res.data.message);
            }
        })

        setLoading(false);
    }, [decryptedToken, purchaseId]);

    useEffect(() => {
        setPurchaseId(router.query.purchase_id || '');
        getPurchaseDetail();
    }, [
        getPurchaseDetail,
        router,
    ]);

    useEffect(() => {
        if (isProductModalClosed) {
            getPurchaseDetail();
            setIsProductModalClosed(false);
        }
    }, [isProductModalClosed, getPurchaseDetail]);

    const handleCloseProductModal = () => {
        setIsProductModalClosed(true);
    };

    const handleShowModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    function handleAddRow() {
        const newRow = {
            product_name: "",
            init_product_unit: 1,
            init_product_qty: 0,
            total_product_unit: 0,
            cat_id: "",
            packaging_type_id: "",
            price_gp_id: "",
            balance_type_id: "",
            buy_price: 0,
            sell_price: 0,
            balance_note: "",
            outstanding_amount: 0,
        };
      
        setPurchaseDetailsArr([...purchaseDetailsArr, newRow]);
    }
      
    function handleDeleteRow(index) {
        const updatedRows = [...purchaseDetailsArr];
        updatedRows.splice(index, 1);
        setPurchaseDetailsArr(updatedRows);
    }
      
    function handleRowChange(index, field, value) {
        const updatedRows = [...purchaseDetailsArr];
        updatedRows[index][field] = value;
        setPurchaseDetailsArr(updatedRows);
    }

    async function handleSubmit() {
        setLoading(true);

        purchaseDetails.purchase_detail_arr = purchaseDetailsArr;

        const postData = postApi(
            '/purchase/detail/product',
            decryptedToken,
            purchaseDetails,
        );

        await postData.then((res) => {
            if (res.status === 200) {
                toast.success(res.data.message);
            }
            if (res.status === 403) {
                toast.error('Error');
            }
        });

        setLoading(false);
        setShowModal(false);
    }

    return (
        <>
            <div className="container-fluid p-0">
                <div className='container-fluid mt-2 pt-4 pb-4'>
                    <div className="row">
                        <div className="col-sm-0 col-md-4"></div>
                        <div className="col text-end">
                            <Button variant="primary" className="w-25 m-2">Print</Button>
                            <Link
                                href="/purchase"
                                className="btn btn-secondary m-2"
                            >
                                Back
                            </Link>
                        </div>
                    </div>
                    {
                        <div>
                            <div className='row mt-3'>
                                <div className="col">
                                    <h5>{t('purchase_order')}: {purchaseDetail[0]?.purchase_voucher_id}</h5>
                                </div>
                                <div className="col text-end">
                                    <h5>
                                        {t('table_purchase_amount')}:
                                        &nbsp;
                                        {purchaseDetail[0]?.total_amount} {t('currency')}
                                    </h5>
                                </div>
                            </div>
                            <hr/>
                            <div className='container-fluid bg-white rounded mt-4 pt-4 pb-4'>
                                <div className="mb-3">
                                    <h6>{t('order_details')}</h6>
                                    <Button className="btn border my-2" variant="primary" onClick={handleShowModal}>
                                        <FontAwesomeIcon icon={faAdd} />
                                        Add New
                                    </Button>
                                </div>
                                <TableContainer>
                                    <Table striped borderless hover>
                                        <TableHead>
                                            <TableRow>
                                                <th>#</th>
                                                <th>{t('table_product_name')}</th>
                                                <th>{t('table_purchase_total_qty')}</th>
                                                <th>{t('packaging_type')}</th>
                                                <th>{t('unit_price')}</th>
                                                <th>{t('table_purchase_amount')}</th>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                loading
                                                    ? <Spinner />
                                                    : productDetails.map((detail, index) => {
                                                        return (
                                                            <TableRow key={index}>
                                                                <TableCell>{index + 1}</TableCell>
                                                                <TableCell>{detail.product_name}</TableCell>
                                                                <TableCell>{detail.quantity}</TableCell>
                                                                <TableCell>{detail.packaging_type_name}</TableCell>
                                                                <TableCell>{detail.buy_price}</TableCell>
                                                                <TableCell>
                                                                    {detail.quantity * detail.buy_price}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="me-2">
                                                                            <Button
                                                                                variant="danger"
                                                                                onClick={() => {
                                                                                    console.log('remove')
                                                                                }}
                                                                            >
                                                                                <FontAwesomeIcon icon={faTrash} />
                                                                            </Button>
                                                                        </div>
                                                                        <div>
                                                                            <ProductDetails
                                                                                product_id={detail.product_id}
                                                                                onClose={handleCloseProductModal}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    }
                                                )
                                            }
                                            <TableRow>
                                                <TableCell colSpan={5} align="right">Subtotal</TableCell>
                                                <TableCell colSpan={2} align="center">
                                                    {purchaseDetail[0]?.total_amount} {t('currency')}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        </div>
                    }
                    <Modal
                        show={showModal}
                        onHide={handleCloseModal}
                        centered
                        backdrop="static"
                        dialogClassName="modal-xxl"
                    >
                        <ModalHeader closeButton>
                            <Modal.Title>
                                Create Purchase
                            </Modal.Title>
                        </ModalHeader>
                        <ModalBody>
                            <form className="">
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                        <TableRow>
                                            <TableCell>Product Name</TableCell>
                                            <TableCell>Initial Product Unit</TableCell>
                                            <TableCell>Initial Product Quantity</TableCell>
                                            <TableCell>Total Product Unit</TableCell>
                                            <TableCell>Category ID</TableCell>
                                            <TableCell>Packaging Type ID</TableCell>
                                            <TableCell>Price GP ID</TableCell>
                                            <TableCell>Balance Type ID</TableCell>
                                            <TableCell>Buy Price</TableCell>
                                            <TableCell>Sell Price</TableCell>
                                            <TableCell>Balance Note</TableCell>
                                            <TableCell>Outstanding Amount</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        {purchaseDetailsArr.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={row.product_name}
                                                        onChange={(e) =>
                                                            handleRowChange(index, 'product_name', e.target.value)
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <input
                                                    type="number"
                                                    className="form-control"
                                                    value={row.init_product_unit}
                                                    onChange={(e) =>
                                                        handleRowChange(
                                                            index,
                                                            'init_product_unit',
                                                            parseInt(e.target.value)
                                                        )
                                                    }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <input
                                                    type="number"
                                                    className="form-control"
                                                    value={row.init_product_qty}
                                                    onChange={(e) =>
                                                        handleRowChange(
                                                            index,
                                                            'init_product_qty',
                                                            parseInt(e.target.value)
                                                        )
                                                    }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <input
                                                    type="number"
                                                    className="form-control"
                                                    value={row.total_product_unit}
                                                    onChange={(e) =>
                                                        handleRowChange(
                                                            index,
                                                            'total_product_unit',
                                                            parseInt(e.target.value)
                                                        )
                                                    }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                                                        <InputLabel id="demo-simple-select-helper-label">
                                                            Category
                                                        </InputLabel>
                                                        <Select
                                                            labelId="demo-simple-select-helper-label"
                                                            id="demo-simple-select-helper"
                                                            value={row.cat_id}
                                                            label="Purchase Type"
                                                            onChange={(e) => handleRowChange(
                                                                index, 'cat_id', e.target.value
                                                            )}
                                                        >
                                                            {
                                                                uniqueCategoryIds.map((categoryId, index) => {
                                                                    const catId = purchaseDetailData.find(
                                                                            (item) => item.cat_id === categoryId
                                                                        );
                                                                    return (
                                                                        <MenuItem
                                                                            key={catId.cat_id}
                                                                            value={catId.cat_id}
                                                                        >
                                                                            {catId.cat_name}
                                                                        </MenuItem>
                                                                    );
                                                                })
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </TableCell>
                                                <TableCell>
                                                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                                                        <InputLabel id="demo-simple-select-helper-label">
                                                            Packaging Type
                                                        </InputLabel>
                                                        <Select
                                                            labelId="demo-simple-select-helper-label"
                                                            id="demo-simple-select-helper"
                                                            value={row.packaging_type_id}
                                                            label="Packaging Type"
                                                            onChange={
                                                                (e) => handleRowChange(
                                                                    index, 'packaging_type_id', e.target.value
                                                                )}
                                                        >
                                                            {
                                                                uniquePackagingTypeIds.map((packagingTypeId, index) => {
                                                                    const pTypeId = purchaseDetailData.find(
                                                                        (item) => 
                                                                        item.packaging_type_id === packagingTypeId
                                                                    );

                                                                    return (
                                                                        <MenuItem
                                                                            key={pTypeId.packaging_type_id}
                                                                            value={pTypeId.packaging_type_id}
                                                                        >
                                                                            {pTypeId.packaging_type}
                                                                        </MenuItem>
                                                                    );
                                                                })
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </TableCell>
                                                <TableCell>
                                                <FormControl sx={{ m: 1, minWidth: 120 }}>
                                                    <InputLabel id="demo-simple-select-helper-label">
                                                        Price Group
                                                    </InputLabel>
                                                    <Select
                                                        labelId="demo-simple-select-helper-label"
                                                        id="demo-simple-select-helper"
                                                        value={row.price_gp_id}
                                                        label="Price Group"
                                                        onChange={
                                                            (e) => handleRowChange(
                                                                index, 'price_gp_id', e.target.value
                                                            )}
                                                    >
                                                        {
                                                            uniquePriceGroupIds.map((priceGroupId, index) => {
                                                                const priceGpId = purchaseDetailData.find(
                                                                        (item) => item.price_gp_id === priceGroupId
                                                                    );
                                                                return (
                                                                    <MenuItem
                                                                        key={priceGpId.price_gp_id}
                                                                        value={priceGpId.price_gp_id}
                                                                    >
                                                                        {priceGpId.price_gp_name}
                                                                    </MenuItem>
                                                                );
                                                            })
                                                        }
                                                    </Select>
                                                </FormControl>
                                                </TableCell>
                                                <TableCell>
                                                <FormControl sx={{ m: 1, minWidth: 120 }}>
                                                        <InputLabel id="demo-simple-select-helper-label">
                                                            Balance Type
                                                        </InputLabel>
                                                        <Select
                                                            labelId="demo-simple-select-helper-label"
                                                            id="demo-simple-select-helper"
                                                            value={row.balance_type_id}
                                                            label="Balance Type"
                                                            onChange={
                                                                (e) => handleRowChange(
                                                                    index, 'balance_type_id', e.target.value
                                                                )}
                                                        >
                                                            {
                                                                uniqueBalanceTypeIds.map((balanceTypeId, index) => {
                                                                    const bTypeId = purchaseDetailData.find(
                                                                        (item) => item.balance_type_id === balanceTypeId
                                                                    );

                                                                    return (
                                                                        <MenuItem
                                                                            key={bTypeId.balance_type_id}
                                                                            value={bTypeId.balance_type_id}
                                                                        >
                                                                            {bTypeId.balance_type}
                                                                        </MenuItem>
                                                                    );
                                                                })
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </TableCell>
                                                <TableCell>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={row.buy_price}
                                                        onChange={(e) =>
                                                            handleRowChange(
                                                                index,
                                                                'buy_price',
                                                                parseFloat(e.target.value)
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={row.sell_price}
                                                        onChange={(e) =>
                                                            handleRowChange(
                                                                index,
                                                                'sell_price',
                                                                parseFloat(e.target.value)
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={row.balance_note}
                                                        onChange={(e) =>
                                                            handleRowChange(
                                                                index,
                                                                'balance_note',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={row.outstanding_amount}
                                                        onChange={(e) =>
                                                            handleRowChange(
                                                                index,
                                                                'outstanding_amount',
                                                                parseFloat(e.target.value)
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="danger" onClick={handleDeleteRow}>
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Button className="btn-block" onClick={handleAddRow}>
                                    Create
                                </Button>
                                <FloatingLabel controlId="floatingTextarea2" label="Comments">
                                    <Form.Control
                                        as="textarea"
                                        placeholder="Leave a comment here"
                                    />
                                </FloatingLabel>
                            </form>
                        </ModalBody>
                        <ModalFooter>
                            { loading
                                ? ( <Spinner />)
                                : (
                                    <Button variant="primary" onClick={handleSubmit}>
                                        Save
                                    </Button>
                                )
                            }
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Close
                            </Button>
                        </ModalFooter>
                    </Modal>
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps(context) {
    const { req, query } = context;
    const initialPurchaseId = query.purchase_id || '';
    const token = req.cookies.token;
    const decryptedToken = decryptData(token);
    const purchaseDetailApi = getApi("/purchase/detail/purchase", decryptedToken);
    const allPurchaseDetail = getApi("/purchase/detail", decryptedToken);

    try {
        const [purchaseDetailRes, allPurchaseDetailRes] = await Promise.all([
            purchaseDetailApi,
            allPurchaseDetail,
        ]);

        if (purchaseDetailRes.status === 200) {
            const purchaseDetailData = purchaseDetailRes.data.result;
            const allPurchaseDetail = allPurchaseDetailRes.data.result;

            return {
                props: {
                    purchaseDetailData,
                    allPurchaseDetail,
                    initialPurchaseId,
                },
            };
        } else {
            toast.error(purchaseDetailRes.data.message);

            return {
                props: {
                    purchaseDetailData: [],
                    allPurchaseDetail: [],
                    initialPurchaseId,
                },
            };
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data.");

        return {
            props: {
                purchaseDetailData: [],
                allPurchaseDetail: [],
                initialPurchaseId,
            },
        };
    }
}